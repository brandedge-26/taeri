import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RiskLevel } from '@/types/assessment';
import { getRiskBg, getRiskColor, getRiskLabel } from '@/utils/taerScoring';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useAuthStore } from '../../store/authStore';

const SCREEN_W = Dimensions.get('window').width;

function getOverallRisk(assessments: Assessment[]): RiskLevel | null {
  if (!assessments.length) return null;
  const hasRed = assessments.some((a) => a.riskLevel === 'red');
  if (hasRed) return 'red';
  const hasYellow = assessments.some((a) => a.riskLevel === 'yellow');
  if (hasYellow) return 'yellow';
  return 'green';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function shortName(name: string) {
  return name.length <= 7 ? name : name.slice(0, 6) + '…';
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { assessments, fetchAssessments, getThisWeekAssessments } = useAssessmentStore();
  const userName = user?.name ?? 'there';

  const allAssessments = assessments;
  const weekAssessments = getThisWeekAssessments();
  const recent = assessments.slice(0, 3);

  useFocusEffect(
    useCallback(() => {
      fetchAssessments();
    }, []),
  );

  const overallRisk = getOverallRisk(weekAssessments);

  // ── Analytics quick data ──────────────────────────────────────────────────
  const greenCount = allAssessments.filter((a) => a.riskLevel === 'green').length;
  const yellowCount = allAssessments.filter((a) => a.riskLevel === 'yellow').length;
  const redCount = allAssessments.filter((a) => a.riskLevel === 'red').length;
  const avgScore = allAssessments.length
    ? parseFloat((allAssessments.reduce((s, a) => s + a.finalScore, 0) / allAssessments.length).toFixed(2))
    : 0;

  // ── Donut chart ───────────────────────────────────────────────────────────
  const pieData = allAssessments.length > 0
    ? [
      { value: greenCount || 0.001, color: '#10B981' },
      { value: yellowCount || 0.001, color: '#F59E0B' },
      { value: redCount || 0.001, color: '#EF4444' },
    ]
    : [{ value: 1, color: '#E2E8F0' }];

  // ── Bar chart: last 6 assessments ────────────────────────────────────────
  const barData = allAssessments.slice(0, 6).reverse().map((a) => ({
    value: parseFloat(a.finalScore.toFixed(2)),
    label: shortName(a.taskName),
    frontColor:
      a.riskLevel === 'green' ? '#10B981' :
        a.riskLevel === 'yellow' ? '#F59E0B' : '#EF4444',
    topLabelComponent: () => (
      <Text style={{ fontFamily: 'OSans-Bold', fontSize: 8, color: '#64748B', marginBottom: 2 }}>
        {a.finalScore.toFixed(1)}
      </Text>
    ),
  }));

  const barW = SCREEN_W - 80;

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
              style={[
                styles.avatarBtn,
                overallRisk ? { borderWidth: 2.5, borderColor: "rgba(255, 255, 255, 0.2)" } : undefined,
              ]}
            >
              {user?.profilePicture ? (
                <Image source={{ uri: user.profilePicture }} style={{ width: 46, height: 46, borderRadius: 22 }} />
              ) : (
                <Ionicons name="person-outline" size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {overallRisk ? (
            <View className="bg-white/15 rounded-2xl p-4 flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: getRiskBg(overallRisk) }}>
                <Ionicons
                  name={overallRisk === 'green' ? 'checkmark-circle' : overallRisk === 'yellow' ? 'warning' : 'alert-circle'}
                  size={26} color={getRiskColor(overallRisk)}
                />
              </View>
              <View>
                <Text className="font-sans text-white/70 text-xs">{"This Week's Overall"}</Text>
                <Text className="font-osbd text-white text-lg">{getRiskLabel(overallRisk)}</Text>
                <Text className="font-sans text-white/60 text-xs">{weekAssessments.length} assessment{weekAssessments.length !== 1 ? 's' : ''} this week</Text>
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

        {/* ── Start Assessment CTA ───────────────────────────────────────── */}
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
              <Text className="font-sans text-text-secondary text-sm">Log a task and get your risk score</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        <View className="flex-row mx-5 mt-4 gap-3">
          <View className="flex-1 bg-white rounded-2xl p-4 items-center" style={styles.statCard}>
            <Text className="font-osbd text-2xl text-primary">{weekAssessments.length}</Text>
            <Text className="font-osmd text-xs text-text-secondary mt-1 text-center">This week</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 items-center" style={styles.statCard}>
            <Text className="font-osbd text-2xl" style={{ color: redCount > 0 ? '#EF4444' : '#10B981' }}>
              {weekAssessments.filter((a) => a.riskLevel === 'red').length}
            </Text>
            <Text className="font-osmd text-xs text-text-secondary mt-1 text-center">High risk</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 items-center" style={styles.statCard}>
            <Text className="font-osbd text-2xl text-success">
              {weekAssessments.filter((a) => a.riskLevel === 'green').length}
            </Text>
            <Text className="font-osmd text-xs text-text-secondary mt-1 text-center">Low risk</Text>
          </View>
        </View>

        {/* ── Analytics preview box ──────────────────────────────────────── */}
        {allAssessments.length > 0 && (
          <>
            {/* Header row — outside the card */}
            <View className="flex-row items-center justify-between mx-5 mt-4 mb-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="analytics-outline" size={20} color="#2563EB" />
                <Text className="font-osbd text-text text-lg">Analytics</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(main)/analytics')}
                className="flex-row items-center gap-1"
              >
                <Text className="font-osbd text-primary text-sm">Full Analytics</Text>
                <Ionicons name="arrow-forward" size={14} color="#2563EB" />
              </TouchableOpacity>
            </View>

            <View className="mx-5 bg-white rounded-3xl p-5" style={styles.cardShadow}>
              {/* Quick stats row */}
              <View className="flex-row gap-3 mb-5">
                {([
                  { label: 'Total', value: allAssessments.length, color: '#2563EB' },
                  { label: 'Avg Score', value: avgScore, color: avgScore < 1.6 ? '#10B981' : avgScore < 5 ? '#F59E0B' : '#EF4444' },
                  { label: 'Low Risk', value: greenCount, color: '#10B981' },
                  { label: 'High Risk', value: redCount, color: redCount > 0 ? '#EF4444' : '#94A3B8' },
                ] as const).map((s) => (
                  <View key={s.label} style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 8, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'OSans-Bold', fontSize: 16, color: s.color }}>{s.value}</Text>
                    <Text style={{ fontFamily: 'OSans-Regular', fontSize: 9, color: '#94A3B8', textAlign: 'center', marginTop: 2 }}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* Donut + legend row */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <PieChart
                  data={pieData}
                  donut
                  radius={52}
                  innerRadius={36}
                  innerCircleColor="#ffffff"
                  centerLabelComponent={() => (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontFamily: 'OSans-Bold', fontSize: 16, color: '#0F172A' }}>{allAssessments.length}</Text>
                      <Text style={{ fontFamily: 'OSans-Regular', fontSize: 8, color: '#94A3B8', marginTop: -2 }}>total</Text>
                    </View>
                  )}
                  strokeWidth={0}
                />
                <View style={{ flex: 1, paddingLeft: 16, gap: 8 }}>
                  {([
                    { label: 'Low Risk', count: greenCount, color: '#10B981' },
                    { label: 'Medium Risk', count: yellowCount, color: '#F59E0B' },
                    { label: 'High Risk', count: redCount, color: '#EF4444' },
                  ] as const).map((item) => {
                    const pct = allAssessments.length > 0
                      ? Math.round((item.count / allAssessments.length) * 100)
                      : 0;
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
                    {greenCount > 0 && <View style={{ flex: greenCount, backgroundColor: '#10B981' }} />}
                    {yellowCount > 0 && <View style={{ flex: yellowCount, backgroundColor: '#F59E0B' }} />}
                    {redCount > 0 && <View style={{ flex: redCount, backgroundColor: '#EF4444' }} />}
                  </View>
                </View>
              </View>

            </View>
          </>
        )}

        {/* ── Recent assessments ─────────────────────────────────────────── */}
        {recent.length > 0 && (
          <View className="mx-5 mt-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-osbd text-text text-lg">Recent Assessments</Text>
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
                    <Text className="font-sans text-text-secondary text-xs">{formatDate(a.date)}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-osbd text-xs" style={{ color: getRiskColor(a.riskLevel) }}>
                      {getRiskLabel(a.riskLevel)}
                    </Text>
                    <Text className="font-sans text-text-secondary text-xs">Score: {a.finalScore}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Quick tip ──────────────────────────────────────────────────── */}
        <View className="mx-5 mt-5 bg-primary-50 rounded-2xl p-4 border border-border-blue">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="bulb-outline" size={18} color="#2563EB" />
            <Text className="font-osbd text-primary text-sm">Quick Tip</Text>
          </View>
          <Text className="font-sans text-text-secondary text-sm">
            Assess each household task weekly to track your risk levels over time. Early detection helps prevent injuries.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statCard: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  iconShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarBtn: {
    width: 46,
    height: 46,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
