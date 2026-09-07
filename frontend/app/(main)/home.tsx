import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ── Skeleton helpers ─────────────────────────────────────────────────────── */
function usePulse() {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return anim;
}

function SkeletonBox({ w, h, radius = 8, style }: { w?: number | string; h: number; radius?: number; style?: object }) {
  const opacity = usePulse();
  return (
    <Animated.View
      style={[{ width: w ?? '100%', height: h, borderRadius: radius, backgroundColor: 'rgba(255,255,255,0.25)' }, { opacity }, style]}
    />
  );
}

function SkeletonCard({ h = 60, style }: { h?: number; style?: object }) {
  const opacity = usePulse();
  return (
    <Animated.View
      style={[{ height: h, borderRadius: 16, backgroundColor: '#E8EFFE' }, { opacity }, style]}
    />
  );
}

import type { Assessment, RiskLevel } from '@/types/assessment';
import { getRiskBg, getRiskColor, getRiskLabel } from '@/utils/taerScoring';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useAuthStore } from '../../store/authStore';

const SCREEN_W = Dimensions.get('window').width;

function getOverallRisk(assessments: Assessment[]): RiskLevel | null {
  if (!assessments.length) return null;
  if (assessments.some((a) => a.riskLevel === 'red')) return 'red';
  if (assessments.some((a) => a.riskLevel === 'yellow')) return 'yellow';
  return 'green';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good Morning';
  if (h >= 12 && h < 17) return 'Good Afternoon';
  if (h >= 17 && h < 21) return 'Good Evening';
  return 'Good Night';
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { assessments, fetchAssessments, isLoading } = useAssessmentStore();
  const userName = user?.name ?? 'there';
  const tabScrollRef = useRef<ScrollView>(null);

  // ── Unique weeks from assessments ─────────────────────────────────────────
  const weeks = useMemo(() => {
    const set = new Set(assessments.map((a) => a.weekNumber));
    const arr = Array.from(set).sort((a, b) => a - b);
    return arr.length > 0 ? arr : [1];
  }, [assessments]);

  // null = All tab, number = specific week
  const [selectedWeek, setSelectedWeek] = useState<number | null | 'all'>('all');

  const activeWeek = selectedWeek === 'all' ? 'all' : (selectedWeek ?? weeks[weeks.length - 1]);

  useFocusEffect(
    useCallback(() => {
      fetchAssessments();
    }, []),
  );

  // ── Filtered assessments for active week ──────────────────────────────────
  const weekAssessments = useMemo(
    () => activeWeek === 'all' ? assessments : assessments.filter((a) => a.weekNumber === activeWeek),
    [assessments, activeWeek],
  );

  const overallRisk = getOverallRisk(weekAssessments);

  const greenCount  = weekAssessments.filter((a) => a.riskLevel === 'green').length;
  const yellowCount = weekAssessments.filter((a) => a.riskLevel === 'yellow').length;
  const redCount    = weekAssessments.filter((a) => a.riskLevel === 'red').length;

  const fallLow      = weekAssessments.filter((a) => a.stability === 'very_stable').length;
  const fallModerate = weekAssessments.filter((a) => a.stability === 'somewhat_unsteady').length;
  const fallHigh     = weekAssessments.filter((a) => a.stability === 'very_unsteady').length;

  const avgScore = weekAssessments.length
    ? parseFloat((weekAssessments.reduce((s, a) => s + a.finalScore, 0) / weekAssessments.length).toFixed(2))
    : 0;

  const pieData = weekAssessments.length > 0
    ? [
        { value: greenCount  || 0.001, color: '#10B981' },
        { value: yellowCount || 0.001, color: '#F59E0B' },
        { value: redCount    || 0.001, color: '#EF4444' },
      ]
    : [{ value: 1, color: '#E2E8F0' }];

  const recent = weekAssessments.slice(0, 4);

  /* ── Skeleton screen ──────────────────────────────────────────────────── */
  if (isLoading && assessments.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {/* Hero skeleton */}
        <View className="bg-primary px-6 pt-6 pb-14 rounded-b-[48px]" style={styles.heroShadow}>
          <View className="flex-row items-center justify-between mb-6">
            <View style={{ gap: 6 }}>
              <SkeletonBox w={80} h={12} radius={6} />
              <SkeletonBox w={140} h={22} radius={6} />
            </View>
            <SkeletonBox w={46} h={46} radius={23} />
          </View>
          {/* Risk pill skeleton */}
          <View className="bg-white/15 rounded-2xl p-4 flex-row items-center gap-4">
            <SkeletonBox w={48} h={48} radius={24} />
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonBox w={100} h={10} radius={5} />
              <SkeletonBox w={140} h={18} radius={5} />
              <SkeletonBox w={90} h={10} radius={5} />
            </View>
          </View>
        </View>

        {/* CTA button skeleton */}
        <View className="mx-5 -mt-6">
          <SkeletonCard h={80} style={{ backgroundColor: '#DBEAFE' }} />
        </View>

        {/* Week tabs skeleton */}
        <View className="mt-4 mb-1 px-5 flex-row gap-2">
          {[60, 80, 80].map((w, i) => (
            <SkeletonCard key={i} h={34} style={{ width: w, borderRadius: 20, backgroundColor: '#DBEAFE' }} />
          ))}
        </View>

        {/* 2x2 stats skeleton */}
        <View className="mx-5 mt-4 gap-3">
          <View className="flex-row gap-3">
            <SkeletonCard h={74} style={{ flex: 1 }} />
            <SkeletonCard h={74} style={{ flex: 1 }} />
          </View>
          <View className="flex-row gap-3">
            <SkeletonCard h={74} style={{ flex: 1 }} />
            <SkeletonCard h={74} style={{ flex: 1 }} />
          </View>
        </View>

        {/* Analytics card skeleton */}
        <View className="mx-5 mt-5">
          <SkeletonCard h={16} style={{ width: 150, borderRadius: 8, marginBottom: 12 }} />
          <SkeletonCard h={160} />
        </View>

        {/* Recent assessments skeleton */}
        <View className="mx-5 mt-4 gap-3">
          <SkeletonCard h={16} style={{ width: 170, borderRadius: 8, marginBottom: 4 }} />
          {[1, 2].map((i) => (
            <SkeletonCard key={i} h={68} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View className="bg-primary px-6 pt-6 pb-14 rounded-b-[48px]" style={styles.heroShadow}>
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="font-osmd text-white/70 text-sm">{getGreeting()},</Text>
              <Text className="font-osbd text-white text-2xl">{userName}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(main)/profile')}
              style={styles.avatarBtn}
            >
              {user?.profilePicture ? (
                <Image source={{ uri: user.profilePicture }} style={{ width: 46, height: 46, borderRadius: 22 }} />
              ) : (
                <Ionicons name="person-outline" size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* Risk summary pill */}
          {overallRisk ? (
            <View className="bg-white/15 rounded-2xl p-4 flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: getRiskBg(overallRisk) }}>
                <Ionicons
                  name={overallRisk === 'green' ? 'checkmark-circle' : overallRisk === 'yellow' ? 'warning' : 'alert-circle'}
                  size={26} color={getRiskColor(overallRisk)}
                />
              </View>
              <View>
                <Text className="font-osmd text-white/70 text-xs">{activeWeek === 'all' ? 'Overall Risk' : `Week ${activeWeek} Overall Risk`}</Text>
                <Text className="font-osbd text-white text-lg">{getRiskLabel(overallRisk)}</Text>
                <Text className="font-osmd text-white/60 text-xs">
                  {weekAssessments.length} assessment{weekAssessments.length !== 1 ? 's' : ''} this week
                </Text>
              </View>
            </View>
          ) : (
            <View className="bg-white/15 rounded-2xl p-4 flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="clipboard-outline" size={24} color="#fff" />
              </View>
              <View>
                <Text className="font-osbd text-white text-base">No assessments yet</Text>
                <Text className="font-osmd text-white/70 text-xs">Start your first task assessment below</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Start Assessment CTA — overlaps hero curve ─────────────────── */}
        <View className="mx-5 -mt-6">
          <TouchableOpacity
            onPress={() => router.push('/(main)/assess')}
            className="bg-white rounded-3xl p-5 flex-row items-center gap-4"
            style={styles.cardShadow}
            activeOpacity={0.88}
          >
            <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center" style={styles.iconShadow}>
              <Ionicons name="add-circle-outline" size={28} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="font-osbd text-text text-[17px]">Start New Assessment</Text>
              <Text className="font-osmd text-text-secondary text-sm">Log a task and get your risk score</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* ── Week Tabs ──────────────────────────────────────────────────── */}
        <View className="mt-4 mb-1">
          <ScrollView
            ref={tabScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            <TouchableOpacity
              onPress={() => setSelectedWeek('all')}
              activeOpacity={0.8}
              style={[styles.weekTab, activeWeek === 'all' ? styles.weekTabActive : styles.weekTabInactive]}
            >
              <Text style={[{ fontFamily: 'OSans-Bold', fontSize: 13 }, activeWeek === 'all' ? { color: '#fff' } : { color: '#475569' }]}>
                All
              </Text>
            </TouchableOpacity>

            {weeks.map((w) => {
              const isActive = w === activeWeek;
              const wAssessments = assessments.filter((a) => a.weekNumber === w);
              const wRisk = getOverallRisk(wAssessments);
              const dotColor = wRisk === 'red' ? '#EF4444' : wRisk === 'yellow' ? '#F59E0B' : wRisk === 'green' ? '#10B981' : null;
              return (
                <TouchableOpacity
                  key={w}
                  onPress={() => setSelectedWeek(w)}
                  activeOpacity={0.8}
                  style={[styles.weekTab, isActive ? styles.weekTabActive : styles.weekTabInactive]}
                >
                  <Text style={[{ fontFamily: 'OSans-Bold', fontSize: 13 }, isActive ? { color: '#fff' } : { color: '#475569' }]}>
                    Week {w}
                  </Text>
                  {dotColor && (
                    <View style={{
                      width: 6, height: 6, borderRadius: 3,
                      backgroundColor: isActive ? 'rgba(255,255,255,0.7)' : dotColor,
                      marginLeft: 5,
                    }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Stats 2x2 grid ────────────────────────────────────────────── */}
        <View className="mx-5 mt-4 gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-2xl p-4 items-center" style={styles.statCard}>
              <Text className="font-osbd text-2xl text-primary">{weekAssessments.length}</Text>
              <Text className="font-osmd text-xs text-text-secondary mt-1 text-center">Assessment</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 items-center" style={styles.statCard}>
              <Text className="font-osbd text-2xl" style={{ color: redCount > 0 ? '#EF4444' : '#10B981' }}>
                {redCount}
              </Text>
              <Text className="font-osmd text-xs text-text-secondary mt-1 text-center">High Risk</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-2xl p-4 items-center" style={styles.statCard}>
              <Text className="font-osbd text-2xl text-success">{greenCount}</Text>
              <Text className="font-osmd text-xs text-text-secondary mt-1 text-center">Low Risk</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 items-center" style={styles.statCard}>
              <Text className="font-osbd text-2xl" style={{ color: avgScore < 1.6 ? '#10B981' : avgScore <= 5 ? '#F59E0B' : '#EF4444' }}>
                {weekAssessments.length ? avgScore : '—'}
              </Text>
              <Text className="font-osmd text-xs text-text-secondary mt-1 text-center">Avg Score</Text>
            </View>
          </View>
        </View>

        {/* ── Analytics ──────────────────────────────────────────────────── */}
        {weekAssessments.length > 0 && (
          <>
            <View className="flex-row items-center justify-between mx-5 mt-5 mb-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="analytics-outline" size={20} color="#2563EB" />
                <Text className="font-osbd text-text text-lg">{activeWeek === 'all' ? 'Overall Analytics' : `Week ${activeWeek} Analytics`}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(main)/analytics')} className="flex-row items-center gap-1">
                <Text className="font-osbd text-primary text-sm">Full Analytics</Text>
                <Ionicons name="arrow-forward" size={14} color="#2563EB" />
              </TouchableOpacity>
            </View>

            <View className="mx-5 bg-white rounded-3xl p-5" style={styles.cardShadow}>
              {/* Quick stats */}
              <View className="flex-row gap-3 mb-5">
                {([
                  { label: 'Total', value: weekAssessments.length, color: '#2563EB' },
                  { label: 'Avg Score', value: avgScore, color: avgScore < 1.6 ? '#10B981' : avgScore <= 5 ? '#F59E0B' : '#EF4444' },
                  { label: 'Low Risk', value: greenCount, color: '#10B981' },
                  { label: 'High Risk', value: redCount, color: redCount > 0 ? '#EF4444' : '#94A3B8' },
                ] as const).map((s) => (
                  <View key={s.label} style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 8, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'OSans-Bold', fontSize: 16, color: s.color }}>{s.value}</Text>
                    <Text style={{ fontFamily: 'OSans-Regular', fontSize: 9, color: '#94A3B8', textAlign: 'center', marginTop: 2 }}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* Donut + legend */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <PieChart
                  data={pieData}
                  donut
                  radius={52}
                  innerRadius={36}
                  innerCircleColor="#ffffff"
                  centerLabelComponent={() => (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontFamily: 'OSans-Bold', fontSize: 16, color: '#0F172A' }}>{weekAssessments.length}</Text>
                      <Text style={{ fontFamily: 'OSans-Regular', fontSize: 8, color: '#94A3B8', marginTop: -2 }}>total</Text>
                    </View>
                  )}
                  strokeWidth={0}
                />
                <View style={{ flex: 1, paddingLeft: 16, gap: 8 }}>
                  {([
                    { label: 'Low Risk', count: greenCount, color: '#10B981' },
                    { label: 'Moderate', count: yellowCount, color: '#F59E0B' },
                    { label: 'High Risk', count: redCount, color: '#EF4444' },
                  ] as const).map((item) => {
                    const pct = weekAssessments.length > 0 ? Math.round((item.count / weekAssessments.length) * 100) : 0;
                    return (
                      <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                          <Text style={{ fontFamily: 'OSans-Medium', fontSize: 11, color: '#475569' }}>{item.label}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          <Text style={{ fontFamily: 'OSans-Bold', fontSize: 12, color: item.color }}>{item.count}</Text>
                          <Text style={{ fontFamily: 'OSans-Regular', fontSize: 9, color: '#CBD5E1' }}>({pct}%)</Text>
                        </View>
                      </View>
                    );
                  })}
                  <View style={{ flexDirection: 'row', height: 5, borderRadius: 99, overflow: 'hidden', gap: 1.5, marginTop: 2 }}>
                    {greenCount  > 0 && <View style={{ flex: greenCount,  backgroundColor: '#10B981' }} />}
                    {yellowCount > 0 && <View style={{ flex: yellowCount, backgroundColor: '#F59E0B' }} />}
                    {redCount    > 0 && <View style={{ flex: redCount,    backgroundColor: '#EF4444' }} />}
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* ── Fall Risk Distribution ─────────────────────────────────────── */}
        {weekAssessments.length > 0 && (
          <View className="mx-5 mt-4 bg-white rounded-3xl p-5" style={styles.cardShadow}>
            <View className="flex-row items-center gap-2 mb-4">
              <Ionicons name="shield-outline" size={18} color="#2563EB" />
              <Text className="font-osbd text-text text-base">Fall Risk Distribution</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <PieChart
                data={
                  (fallLow + fallModerate + fallHigh) > 0
                    ? [
                        { value: fallLow      || 0.001, color: '#10B981' },
                        { value: fallModerate || 0.001, color: '#F59E0B' },
                        { value: fallHigh     || 0.001, color: '#EF4444' },
                      ]
                    : [{ value: 1, color: '#E2E8F0' }]
                }
                donut
                radius={52}
                innerRadius={36}
                innerCircleColor="#ffffff"
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'OSans-Bold', fontSize: 16, color: '#0F172A' }}>{weekAssessments.length}</Text>
                    <Text style={{ fontFamily: 'OSans-Regular', fontSize: 8, color: '#94A3B8', marginTop: -2 }}>total</Text>
                  </View>
                )}
                strokeWidth={0}
              />
              <View style={{ flex: 1, paddingLeft: 16, gap: 8 }}>
                {([
                  { label: 'Low Fall Risk',      count: fallLow,      color: '#10B981' },
                  { label: 'Moderate Fall Risk',  count: fallModerate, color: '#F59E0B' },
                  { label: 'High Fall Risk',      count: fallHigh,     color: '#EF4444' },
                ] as const).map((item) => {
                  const pct = weekAssessments.length > 0 ? Math.round((item.count / weekAssessments.length) * 100) : 0;
                  return (
                    <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                        <Text style={{ fontFamily: 'OSans-Medium', fontSize: 11, color: '#475569' }}>{item.label}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Text style={{ fontFamily: 'OSans-Bold', fontSize: 12, color: item.color }}>{item.count}</Text>
                        <Text style={{ fontFamily: 'OSans-Regular', fontSize: 9, color: '#CBD5E1' }}>({pct}%)</Text>
                      </View>
                    </View>
                  );
                })}
                <View style={{ flexDirection: 'row', height: 5, borderRadius: 99, overflow: 'hidden', gap: 1.5, marginTop: 2 }}>
                  {fallLow      > 0 && <View style={{ flex: fallLow,      backgroundColor: '#10B981' }} />}
                  {fallModerate > 0 && <View style={{ flex: fallModerate, backgroundColor: '#F59E0B' }} />}
                  {fallHigh     > 0 && <View style={{ flex: fallHigh,     backgroundColor: '#EF4444' }} />}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── Recent assessments ─────────────────────────────────────────── */}
        {recent.length > 0 && (
          <View className="mx-5 mt-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-osbd text-text text-lg">{activeWeek === 'all' ? 'Recent Assessments' : `Week ${activeWeek} Assessments`}</Text>
              <TouchableOpacity onPress={() => router.push('/(main)/history')}>
                <Text className="font-osbd text-primary text-sm">See All</Text>
              </TouchableOpacity>
            </View>

            <View className="gap-3">
              {recent.map((a) => (
                <View key={a.id} className="bg-white rounded-2xl p-4 flex-row items-center gap-3" style={styles.statCard}>
                  <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: getRiskBg(a.riskLevel) }}>
                    <Ionicons
                      name={a.riskLevel === 'green' ? 'checkmark-circle' : a.riskLevel === 'yellow' ? 'warning' : 'alert-circle'}
                      size={22} color={getRiskColor(a.riskLevel)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-osbd text-text">{a.taskName}</Text>
                    <Text className="font-osmd text-text-secondary text-xs">{formatDate(a.date)}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-osbd text-xs" style={{ color: getRiskColor(a.riskLevel) }}>
                      {getRiskLabel(a.riskLevel)}
                    </Text>
                    <Text className="font-osmd text-text-secondary text-xs">Score: {a.finalScore}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty state for selected week */}
        {weekAssessments.length === 0 && assessments.length > 0 && activeWeek !== 'all' && (
          <View className="mx-5 mt-5 items-center py-10 bg-white rounded-3xl" style={styles.cardShadow}>
            <Ionicons name="calendar-outline" size={36} color="#CBD5E1" />
            <Text className="font-osbd text-text-secondary text-base mt-3">No assessments in Week {activeWeek}</Text>
            <Text className="font-osmd text-text-secondary text-xs mt-1">Start an assessment to add data for this week</Text>
          </View>
        )}

        {/* ── Quick tip ──────────────────────────────────────────────────── */}
        <View className="mx-5 mt-5 bg-primary-50 rounded-2xl p-4 border border-border-blue">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="bulb-outline" size={18} color="#2563EB" />
            <Text className="font-osbd text-primary text-sm">Quick Tip</Text>
          </View>
          <Text className="font-osmd text-text-secondary text-sm">
            Assess each household task weekly to track your risk levels over time. Early detection helps prevent injuries.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroShadow: {
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  cardShadow: {
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  statCard: {
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  iconShadow: {
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  avatarBtn: {
    width: 46, height: 46, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  weekTab: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
  },
  weekTabActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  weekTabInactive: {
    backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
});
