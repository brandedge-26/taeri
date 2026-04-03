import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAssessmentStore } from '../../store/assessmentStore';

const SCREEN_W = Dimensions.get('window').width;
const CARD_W = SCREEN_W - 40; // mx-5 on both sides

// ── Helpers ──────────────────────────────────────────────────────────────────
function shortName(name: string) {
  return name.length <= 7 ? name : name.slice(0, 6) + '…';
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return parseFloat((nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(2));
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({
  label, value, unit, color = '#2563EB',
}: { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={{ fontFamily: 'OSans-Bold', fontSize: 22, color }}>{value}</Text>
      {unit && <Text style={{ fontFamily: 'OSans-Regular', fontSize: 10, color: '#94A3B8', marginTop: -2 }}>{unit}</Text>}
      <Text style={{ fontFamily: 'OSans-Medium', fontSize: 11, color: '#64748B', marginTop: 4, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}


export default function AnalyticsScreen() {
  const router = useRouter();
  const { assessments: all, fetchAssessments } = useAssessmentStore();

  useFocusEffect(
    useCallback(() => {
      fetchAssessments();
    }, []),
  );

  // ── Derived data ────────────────────────────────────────────────────────────
  const greenList = all.filter((a) => a.riskLevel === 'green');
  const yellowList = all.filter((a) => a.riskLevel === 'yellow');
  const redList = all.filter((a) => a.riskLevel === 'red');

  const scores = all.map((a) => a.finalScore);
  const avgScore = avg(scores);
  const maxScore = scores.length ? Math.max(...scores) : 0;
  const minScore = scores.length ? Math.min(...scores) : 0;

  // Task with highest average score (most risky)
  const taskMap: Record<string, number[]> = {};
  all.forEach((a) => {
    if (!taskMap[a.taskName]) taskMap[a.taskName] = [];
    taskMap[a.taskName].push(a.finalScore);
  });
  const taskAvgs = Object.entries(taskMap).map(([name, s]) => ({ name, avg: avg(s), count: s.length }));
  taskAvgs.sort((a, b) => b.avg - a.avg);
  const riskiestTask = taskAvgs[0] ?? null;
  const safestTask = taskAvgs[taskAvgs.length - 1] ?? null;

  // ── Pie chart (risk distribution) ───────────────────────────────────────────
  const hasPie = all.length > 0;
  const pieData = hasPie
    ? [
      { value: Math.max(greenList.length, 0.01), color: '#10B981', text: `${greenList.length}` },
      { value: Math.max(yellowList.length, 0.01), color: '#F59E0B', text: `${yellowList.length}` },
      { value: Math.max(redList.length, 0.01), color: '#EF4444', text: `${redList.length}` },
    ]
    : [{ value: 1, color: '#E2E8F0', text: '' }];

  // ── Line chart (score over time, last 10) ────────────────────────────────────
  const lineItems = all.slice(0, 10).reverse();
  const lineData = lineItems.map((a) => ({
    value: parseFloat((a.finalScore || 0).toFixed(2)),
    dataPointColor:
      a.riskLevel === 'green' ? '#10B981' :
        a.riskLevel === 'yellow' ? '#F59E0B' : '#EF4444',
    label: formatDateShort(a.date),
  }));


  // ── Bar chart (per-task average) ─────────────────────────────────────────────
  const topTasks = taskAvgs.slice(0, 6);
  const barData = topTasks.map((t) => ({
    value: parseFloat((t.avg || 0).toFixed(2)),
    label: shortName(t.name),
    frontColor:
      t.avg < 1.6 ? '#10B981' :
        t.avg < 5.0 ? '#F59E0B' : '#EF4444',
    topLabelComponent: () => (
      <Text style={{ fontFamily: 'OSans-Bold', fontSize: 8, color: '#64748B', marginBottom: 2 }}>
        {t.avg.toFixed(1)}
      </Text>
    ),
  }));

  // ── Empty state ───────────────────────────────────────────────────────────────
  if (all.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px]" style={styles.heroShadow}>
          <View className="flex-row items-center gap-3 mb-1">
            <Ionicons name="arrow-back" size={20} color="#fff" onPress={() => router.back()} />
            <Text style={{ fontFamily: 'OSans-Bold', fontSize: 22, color: '#fff' }}>Analytics</Text>
          </View>
          <Text style={{ fontFamily: 'OSans-Medium', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            All-time insights from your assessments
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Ionicons name="analytics-outline" size={56} color="#CBD5E1" />
          <Text style={{ fontFamily: 'OSans-Bold', fontSize: 17, color: '#94A3B8' }}>No data yet</Text>
          <Text style={{ fontFamily: 'OSans-Regular', fontSize: 13, color: '#CBD5E1', textAlign: 'center', paddingHorizontal: 40 }}>
            Complete at least one assessment to see analytics here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const barChartInnerW = CARD_W - 40;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero header */}
        <View className="bg-primary px-6 pt-6 pb-14 rounded-b-[48px]" style={styles.heroShadow}>
          <View className="flex-row items-center gap-3 mb-3">
            <Ionicons name="arrow-back" size={22} color="#fff" onPress={() => router.back()} />
          </View>
          <Text style={{ fontFamily: 'OSans-Bold', fontSize: 26, color: '#fff', marginBottom: 2 }}>Analytics</Text>
          <Text style={{ fontFamily: 'OSans-Medium', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            All-time insights · {all.length} assessment{all.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* ── Summary stats ──────────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 20, marginTop: 16, marginBottom: 12 }}>
          <Ionicons name="stats-chart-outline" size={17} color="#2563EB" />
          <Text style={{ fontFamily: 'OSans-Bold', fontSize: 15, color: '#0F172A' }}>Summary</Text>
        </View>
        <View className="mx-5 bg-white rounded-3xl p-5" style={styles.card}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <StatTile label="Total Assessments" value={all.length} color="#2563EB" />
            <StatTile label="Avg Score" value={avgScore} color={avgScore < 1.6 ? '#10B981' : avgScore < 5 ? '#F59E0B' : '#EF4444'} />
            <StatTile label="Best Score" value={minScore.toFixed(2)} color="#10B981" />
            <StatTile label="Worst Score" value={maxScore.toFixed(2)} color="#EF4444" />
          </View>

          {/* Risk counts row */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            {([
              { label: 'Low Risk', count: greenList.length, color: '#10B981', bg: '#D1FAE5' },
              { label: 'Med Risk', count: yellowList.length, color: '#F59E0B', bg: '#FEF3C7' },
              { label: 'High Risk', count: redList.length, color: '#EF4444', bg: '#FEE2E2' },
            ] as const).map((item) => (
              <View key={item.label} style={{ flex: 1, backgroundColor: item.bg, borderRadius: 14, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'OSans-Bold', fontSize: 20, color: item.color }}>{item.count}</Text>
                <Text style={{ fontFamily: 'OSans-Medium', fontSize: 10, color: item.color, marginTop: 2 }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Riskiest / Safest task ─────────────────────────────────────────── */}
        {taskAvgs.length > 0 && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 20, marginTop: 16, marginBottom: 12 }}>
              <Ionicons name="ribbon-outline" size={17} color="#2563EB" />
              <Text style={{ fontFamily: 'OSans-Bold', fontSize: 15, color: '#0F172A' }}>Task Highlights</Text>
            </View>
            <View className="mx-5 bg-white rounded-3xl p-5" style={styles.card}>
              <View style={{ gap: 10 }}>
                {riskiestTask && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FEE2E2', borderRadius: 14, padding: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="alert-circle-outline" size={20} color="#fff" />
                      </View>
                      <View>
                        <Text style={{ fontFamily: 'OSans-Bold', fontSize: 13, color: '#7F1D1D' }}>Riskiest Task</Text>
                        <Text style={{ fontFamily: 'OSans-Medium', fontSize: 12, color: '#EF4444' }}>{riskiestTask.name}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontFamily: 'OSans-Bold', fontSize: 18, color: '#EF4444' }}>{riskiestTask.avg.toFixed(2)}</Text>
                      <Text style={{ fontFamily: 'OSans-Regular', fontSize: 10, color: '#94A3B8' }}>avg score</Text>
                    </View>
                  </View>
                )}
                {safestTask && safestTask.name !== riskiestTask?.name && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#D1FAE5', borderRadius: 14, padding: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                      </View>
                      <View>
                        <Text style={{ fontFamily: 'OSans-Bold', fontSize: 13, color: '#064E3B' }}>Safest Task</Text>
                        <Text style={{ fontFamily: 'OSans-Medium', fontSize: 12, color: '#10B981' }}>{safestTask.name}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontFamily: 'OSans-Bold', fontSize: 18, color: '#10B981' }}>{safestTask.avg.toFixed(2)}</Text>
                      <Text style={{ fontFamily: 'OSans-Regular', fontSize: 10, color: '#94A3B8' }}>avg score</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        {/* ── Risk Distribution Donut ─────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 20, marginTop: 16, marginBottom: 12 }}>
          <Ionicons name="pie-chart-outline" size={17} color="#2563EB" />
          <Text style={{ fontFamily: 'OSans-Bold', fontSize: 15, color: '#0F172A' }}>Risk Distribution</Text>
        </View>
        <View className="mx-5 bg-white rounded-3xl p-5" style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PieChart
              data={pieData}
              donut
              radius={70}
              innerRadius={48}
              innerCircleColor="#ffffff"
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'OSans-Bold', fontSize: 24, color: '#0F172A' }}>{all.length}</Text>
                  <Text style={{ fontFamily: 'OSans-Medium', fontSize: 9, color: '#94A3B8', marginTop: -3 }}>total</Text>
                </View>
              )}
              strokeWidth={0}
              focusOnPress
            />

            {/* Legend */}
            <View style={{ flex: 1, paddingLeft: 20, gap: 12 }}>
              {([
                { label: 'Low Risk', count: greenList.length, color: '#10B981' },
                { label: 'Medium Risk', count: yellowList.length, color: '#F59E0B' },
                { label: 'High Risk', count: redList.length, color: '#EF4444' },
              ] as const).map((item) => {
                const pct = all.length > 0 ? Math.round((item.count / all.length) * 100) : 0;
                return (
                  <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
                      <Text style={{ fontFamily: 'OSans-Medium', fontSize: 12, color: '#475569' }}>{item.label}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <Text style={{ fontFamily: 'OSans-Bold', fontSize: 14, color: item.color }}>{item.count}</Text>
                      <Text style={{ fontFamily: 'OSans-Regular', fontSize: 10, color: '#94A3B8' }}>({pct}%)</Text>
                    </View>
                  </View>
                );
              })}
              <View style={{ flexDirection: 'row', height: 7, borderRadius: 99, overflow: 'hidden', gap: 2, marginTop: 2 }}>
                {greenList.length > 0 && <View style={{ flex: greenList.length, backgroundColor: '#10B981' }} />}
                {yellowList.length > 0 && <View style={{ flex: yellowList.length, backgroundColor: '#F59E0B' }} />}
                {redList.length > 0 && <View style={{ flex: redList.length, backgroundColor: '#EF4444' }} />}
              </View>
            </View>
          </View>
        </View>

        {/* ── Score trend Line chart ──────────────────────────────────────────── */}
        {lineData.length >= 2 && (
          <>
            {/* Header — outside the card */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="trending-up-outline" size={17} color="#2563EB" />
                <Text style={{ fontFamily: 'OSans-Bold', fontSize: 15, color: '#0F172A' }}>Score Trend Over Time</Text>
              </View>
              <Text style={{ fontFamily: 'OSans-Regular', fontSize: 11, color: '#94A3B8' }}>lower is safer</Text>
            </View>

            <View className="mx-5 bg-white rounded-3xl p-5" style={styles.card}>
              <Text style={{ fontFamily: 'OSans-Regular', fontSize: 11, color: '#94A3B8', marginBottom: 14 }}>
                Last {lineData.length} assessments · dots colored by risk level
              </Text>

              <View style={{ overflow: 'hidden' }}>
                <LineChart
                  data={lineData}
                  width={barChartInnerW}
                  height={220}
                  noOfSections={4}
                  maxValue={12}
                  areaChart
                  startFillColor="#2563EB"
                  startOpacity={0.15}
                  endFillColor="#2563EB"
                  endOpacity={0.02}
                  color="#2563EB"
                  thickness={2.5}
                  dataPointsRadius={7}
                  dataPointsWidth={7}
                  spacing={52}
                  yAxisTextStyle={{ fontFamily: 'OSans-Regular', fontSize: 9, color: '#94A3B8' }}
                  xAxisLabelTextStyle={{ fontFamily: 'OSans-Regular', fontSize: 8, color: '#94A3B8' }}
                  rulesColor="#F1F5F9"
                  yAxisColor="#E2E8F0"
                  xAxisColor="#E2E8F0"
                  referenceLine1Config={{ color: '#10B981', dashWidth: 4, dashGap: 4, thickness: 1.5 }}
                  referenceLine1Position={1.6}
                  referenceLine2Config={{ color: '#EF4444', dashWidth: 4, dashGap: 4, thickness: 1.5 }}
                  referenceLine2Position={5.0}
                  initialSpacing={16}
                  endSpacing={16}
                  curved
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                {([['#10B981', '< 1.6 Low'], ['#F59E0B', '1.6–5 Medium'], ['#EF4444', '> 5.0 High']] as const).map(([color, lbl]) => (
                  <View key={lbl} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 14, height: 2.5, backgroundColor: color, borderRadius: 2 }} />
                    <Text style={{ fontFamily: 'OSans-Regular', fontSize: 10, color: '#94A3B8' }}>{lbl}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* ── Per-task avg score bar chart ────────────────────────────────────── */}
        {barData.length > 0 && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 20, marginTop: 16, marginBottom: 12 }}>
              <Ionicons name="bar-chart-outline" size={17} color="#2563EB" />
              <Text style={{ fontFamily: 'OSans-Bold', fontSize: 15, color: '#0F172A' }}>Avg Score per Task</Text>
            </View>
            <View className="mx-5 bg-white rounded-3xl p-5" style={styles.card}>
              <Text style={{ fontFamily: 'OSans-Regular', fontSize: 11, color: '#94A3B8', marginBottom: 14 }}>
                Color = average risk level · top {barData.length} tasks
              </Text>

              <View style={{ overflow: 'hidden' }}>
                <BarChart
                  data={barData}
                  width={barChartInnerW}
                  height={180}
                  barWidth={32}
                  spacing={22}
                  roundedTop
                  noOfSections={4}
                  maxValue={12}
                  yAxisTextStyle={{ fontFamily: 'OSans-Regular', fontSize: 9, color: '#94A3B8' }}
                  xAxisLabelTextStyle={{ fontFamily: 'OSans-Medium', fontSize: 9, color: '#64748B' }}
                  rulesColor="#F1F5F9"
                  referenceLine1Config={{ color: '#10B981', dashWidth: 4, dashGap: 4, thickness: 1.5 }}
                  referenceLine1Position={1.6}
                  referenceLine2Config={{ color: '#EF4444', dashWidth: 4, dashGap: 4, thickness: 1.5 }}
                  referenceLine2Position={5.0}
                  yAxisColor="#E2E8F0"
                  xAxisColor="#E2E8F0"
                  initialSpacing={10}
                  endSpacing={10}
                  showGradient={false}
                />
              </View>
            </View>
          </>
        )}

        {/* ── All tasks breakdown table ───────────────────────────────────────── */}
        {taskAvgs.length > 0 && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 20, marginTop: 16, marginBottom: 12 }}>
              <Ionicons name="list-outline" size={17} color="#2563EB" />
              <Text style={{ fontFamily: 'OSans-Bold', fontSize: 15, color: '#0F172A' }}>Task Breakdown</Text>
            </View>
            <View className="mx-5 bg-white rounded-3xl p-5" style={styles.card}>
              {taskAvgs.map((t, idx) => {
                const riskColor = t.avg < 1.6 ? '#10B981' : t.avg < 5.0 ? '#F59E0B' : '#EF4444';
                const riskBg = t.avg < 1.6 ? '#D1FAE5' : t.avg < 5.0 ? '#FEF3C7' : '#FEE2E2';
                return (
                  <View key={t.name} style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingVertical: 10,
                    borderBottomWidth: idx < taskAvgs.length - 1 ? 1 : 0,
                    borderBottomColor: '#F1F5F9',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <Text style={{ fontFamily: 'OSans-Bold', fontSize: 12, color: '#CBD5E1', width: 18 }}>#{idx + 1}</Text>
                      <Text style={{ fontFamily: 'OSans-Medium', fontSize: 13, color: '#334155', flex: 1 }}>{t.name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontFamily: 'OSans-Regular', fontSize: 11, color: '#94A3B8' }}>{t.count}×</Text>
                      <View style={{ backgroundColor: riskBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ fontFamily: 'OSans-Bold', fontSize: 12, color: riskColor }}>{t.avg.toFixed(2)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
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
  card: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statTile: {
    flex: 1,
    minWidth: '40%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
});
