import type { Assessment, RiskLevel } from '@/types/assessment';
import { getRiskBg, getRiskColor, getRiskLabel } from '@/utils/taerScoring';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../store/assessmentStore';

type FilterTab = 'all' | RiskLevel;

const TABS: { key: FilterTab; label: string; icon: string; color: string; bg: string }[] = [
  { key: 'all', label: 'All', icon: 'list-outline', color: '#2563EB', bg: '#EFF6FF' },
  { key: 'green', label: 'Low', icon: 'checkmark-circle', color: '#10B981', bg: '#D1FAE5' },
  { key: 'yellow', label: 'Moderate', icon: 'warning', color: '#F59E0B', bg: '#FEF3C7' },
  { key: 'red', label: 'High', icon: 'alert-circle', color: '#EF4444', bg: '#FEE2E2' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function HistoryScreen() {
  const router = useRouter();
  const { assessments, fetchAssessments, removeAssessment, removeAllAssessments } = useAssessmentStore();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  useFocusEffect(
    useCallback(() => {
      fetchAssessments();
    }, []),
  );

  const filtered = activeFilter === 'all'
    ? assessments
    : assessments.filter((a) => a.riskLevel === activeFilter);

  const counts = {
    all: assessments.length,
    green: assessments.filter((a) => a.riskLevel === 'green').length,
    yellow: assessments.filter((a) => a.riskLevel === 'yellow').length,
    red: assessments.filter((a) => a.riskLevel === 'red').length,
  };

  async function handleDeleteAll() {
    Alert.alert('Delete All', 'Delete all assessments? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', style: 'destructive', onPress: () => removeAllAssessments() },
    ]);
  }

  async function handleDelete(id: string) {
    Alert.alert('Delete Assessment', 'Are you sure you want to delete this assessment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeAssessment(id) },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">

      {/* Header */}
      <View className="bg-primary px-6 pt-6 pb-14 rounded-b-[40px]" style={styles.heroShadow}>
        <Text className="font-osbd text-white text-2xl">Assessment History</Text>
        <Text className="font-osmd text-white/70 text-sm mt-1">
          {assessments.length} total assessment{assessments.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Filter Tab Bar */}
      <View className="mx-5 -mt-5 bg-white rounded-2xl p-1.5 flex-row gap-1" style={styles.tabBar}>
        {TABS.map((tab) => {
          const active = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              activeOpacity={0.8}
              style={[
                styles.tab,
                active && { backgroundColor: tab.bg },
              ]}
            >
              <Ionicons
                name={tab.icon as any}
                size={13}
                color={active ? tab.color : '#94A3B8'}
              />
              <Text
                className="font-osbd text-xs ml-1"
                style={{ color: active ? tab.color : '#94A3B8' }}
              >
                {tab.label}
              </Text>
              {/* Count badge */}
              <View
                style={[
                  styles.badge,
                  { backgroundColor: active ? tab.color : '#E2E8F0' },
                ]}
              >
                <Text style={[styles.badgeText, { color: active ? '#fff' : '#64748B' }]}>
                  {counts[tab.key]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingTop: 16, paddingBottom: 40 }}
      >
        {assessments.length === 0 ? (
          <View className="items-center py-16">
            <View className="w-20 h-20 rounded-full bg-primary-50 items-center justify-center mb-4">
              <Ionicons name="time-outline" size={36} color="#2563EB" />
            </View>
            <Text className="font-osbd text-text text-lg mb-2">No assessments yet</Text>
            <Text className="font-osmd text-text-secondary text-sm text-center mb-6">
              Complete your first task assessment to see your history here.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(main)/assess')}
              className="bg-primary rounded-2xl px-6 py-3 flex-row items-center gap-2"
              style={styles.btnShadow}
            >
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text className="font-osbd text-white">Start Assessment</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          /* No results for this filter */
          <View className="items-center py-16">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: TABS.find((t) => t.key === activeFilter)!.bg }}
            >
              <Ionicons
                name={TABS.find((t) => t.key === activeFilter)!.icon as any}
                size={36}
                color={TABS.find((t) => t.key === activeFilter)!.color}
              />
            </View>
            <Text className="font-osbd text-text text-lg mb-2">No {TABS.find((t) => t.key === activeFilter)!.label} Risk assessments</Text>
            <Text className="font-osmd text-text-secondary text-sm text-center">
              You have no assessments in this category yet.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {filtered.map((a) => (
              <TouchableOpacity
                key={a.id}
                activeOpacity={0.82}
                style={styles.card}
                className="bg-white rounded-2xl p-4"
                onPress={() => router.push({
                  pathname: '/(main)/assess/result',
                  params: {
                    taskId: a.taskId,
                    taskName: a.taskName,
                    frequency: a.frequency,
                    duration: a.duration,
                    physicalDemand: String(a.physicalDemand),
                    complexity: String(a.complexity),
                    psychological: String(a.psychological),
                    neck: String(a.neck),
                    arm: String(a.arm),
                    wrist: String(a.wrist),
                    back: String(a.back),
                    leg: String(a.leg),
                    posture: String(a.posture),
                    handling: String(a.handling),
                    stability: a.stability,
                    rawScore: String(a.rawScore),
                    adjustmentFactor: String(a.adjustmentFactor),
                    finalScore: String(a.finalScore),
                    riskLevel: a.riskLevel,
                    readOnly: 'true',
                  },
                })}
              >
                <View className="flex-row items-start gap-3">
                  <View
                    className="w-11 h-11 rounded-full items-center justify-center"
                    style={{ backgroundColor: getRiskBg(a.riskLevel) }}
                  >
                    <Ionicons
                      name={
                        a.riskLevel === 'green' ? 'checkmark-circle' :
                          a.riskLevel === 'yellow' ? 'warning' : 'alert-circle'
                      }
                      size={24}
                      color={getRiskColor(a.riskLevel)}
                    />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-osbd text-text text-base flex-1 mr-2" numberOfLines={1}>
                        {a.taskName}
                      </Text>
                      <TouchableOpacity onPress={() => handleDelete(a.id)}>
                        <Ionicons name="trash-outline" size={18} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                    <Text className="font-osmd text-text-secondary text-xs mt-0.5">{formatDate(a.date)}</Text>

                    <View className="flex-row items-center gap-3 mt-2">
                      <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: getRiskBg(a.riskLevel) }}>
                        <Text className="font-osbd text-xs" style={{ color: getRiskColor(a.riskLevel) }}>
                          {getRiskLabel(a.riskLevel)}
                        </Text>
                      </View>
                      <Text className="font-osmd text-text-secondary text-xs">Score: {a.finalScore}</Text>
                    </View>

                    <View className="flex-row gap-4 mt-2">
                      {[
                        { label: 'Psych', value: a.psychological, max: 6 },
                        { label: 'Posture', value: a.posture, max: 15 },
                        { label: 'Handling', value: a.handling, max: 3 },
                      ].map((s) => (
                        <View key={s.label} className="items-center">
                          <Text className="font-osbd text-text text-sm">{s.value}/{s.max}</Text>
                          <Text className="font-osmd text-text-muted text-xs">{s.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Delete All */}
            <TouchableOpacity
              onPress={handleDeleteAll}
              className="flex-row items-center justify-center gap-2 border-2 border-error rounded-2xl py-4 mt-2"
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text className="font-osbd text-error text-base">Delete All Assessments</Text>
            </TouchableOpacity>
          </View>
        )}
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
  tabBar: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  badge: {
    marginLeft: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: 'OSans-Bold',
    fontSize: 10,
  },
  card: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  btnShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
