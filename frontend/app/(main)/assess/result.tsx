import type { DurationCategory, FrequencyCategory, RiskLevel, StabilityLevel } from '@/types/assessment';
import {
  getRiskBg,
  getRiskColor,
  getRiskLabel,
  getRiskSentence,
  getStabilityDescription,
  getStabilityLabel,
} from '@/utils/taerScoring';
import { useAssessmentStore } from '../../../store/assessmentStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Label helpers ─────────────────────────────────────────────────────────────
const FREQUENCY_LABELS: Record<string, string> = {
  '1/week':   'Once a week',
  '2/week':   'Twice a week',
  '3/week':   'Three times a week',
  '4-7/week': 'Almost daily (4–7×/week)',
};

const DURATION_LABELS: Record<string, string> = {
  '<5':    'Less than 5 min',
  '5-15':  '5 – 15 min',
  '16-25': '16 – 25 min',
  '26-35': '26 – 35 min',
  '36-45': '36 – 45 min',
  '46-60': '46 – 60 min',
  '>60':   'More than 60 min',
};

const PHYSICAL_DEMAND_LABELS: Record<number, string> = { 1: 'None/Minor', 2: 'Moderate', 3: 'Too much' };
const COMPLEXITY_LABELS:      Record<number, string> = { 1: 'Not at all/Slight', 2: 'Moderate', 3: 'Extreme' };
const NECK_LABELS:  Record<number, string> = { 1: '0–10°', 2: '10–20°', 3: '>20°' };
const ARM_LABELS:   Record<number, string> = { 1: '0–20°', 2: '20–45°', 3: '>45°' };
const WRIST_LABELS: Record<number, string> = { 1: 'Neutral', 2: '0–15°', 3: '>15°' };
const BACK_LABELS:  Record<number, string> = { 1: '0–20°', 2: '20–60°', 3: '>60°' };
const LEG_LABELS:   Record<number, string> = { 1: 'Both Straight/Sitting', 2: 'One/Both Bent', 3: 'Unsupported >30°' };
const HANDLING_LABELS: Record<number, string> = { 1: 'Light', 2: 'Moderate', 3: 'Heavy' };

const TIPS: Record<RiskLevel, string[]> = {
  green: [
    'Great job! Keep doing this task the same way.',
    'Continue monitoring this task weekly.',
    'Your technique appears safe and comfortable.',
  ],
  yellow: [
    'Consider taking short breaks every 15–20 minutes.',
    'Try to use better posture or supportive equipment.',
    'Monitor this task closely — it may worsen over time.',
    'Ask your therapist for specific advice on this task.',
  ],
  red: [
    'This task poses a HIGH risk. Consider modifying how you do it.',
    'Use assistive equipment (wheeled basket, long-handled tools).',
    'Ask someone for help with this task when possible.',
    'Contact your healthcare provider — this has been flagged.',
    'Take frequent breaks and never push through pain.',
  ],
};

function ScoreBar({ value, max = 9 }: { value: number; max?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: value / max, duration: 900, useNativeDriver: false }).start();
  }, []);
  return (
    <View className="h-3 bg-border rounded-full overflow-hidden">
      <Animated.View
        style={{
          height: '100%',
          borderRadius: 9999,
          backgroundColor: '#2563EB',
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}

// ── Detail Row helper ─────────────────────────────────────────────────────────
function DetailRow({ label, value, score, max }: { label: string; value: string; score: number; max: number }) {
  return (
    <View className="py-2">
      <Text className="font-osmd text-text-secondary text-sm">{label}</Text>
      <View className="flex-row items-center justify-between mt-1">
        <Text className="font-osbd text-text text-sm flex-1 mr-2">{value}</Text>
        <Text className="font-osbd text-text text-sm">{score}/{max}</Text>
      </View>
    </View>
  );
}

// ── Summary Screen (shown first) ──────────────────────────────────────────────
function SummaryScreen({
  taskName,
  finalScore,
  riskLevel,
  riskColor,
  riskBg,
  riskLabel,
  riskIcon,
  stability,
  onBreakdown,
  onHome,
}: {
  taskName: string;
  finalScore: number;
  riskLevel: RiskLevel;
  riskColor: string;
  riskBg: string;
  riskLabel: string;
  riskIcon: string;
  stability: StabilityLevel;
  onBreakdown: () => void;
  onHome: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const bgColor =
    riskLevel === 'green'  ? '#10B981' :
    riskLevel === 'yellow' ? '#F59E0B' : '#EF4444';

  const stabilityIcon =
    stability === 'very_stable'       ? 'shield-checkmark-outline' :
    stability === 'somewhat_unsteady' ? 'alert-outline' : 'warning-outline';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingHorizontal: 32, paddingTop: 24, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Icon circle */}
          <Animated.View
            style={[
              styles.summaryIconCircle,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Ionicons name={riskIcon as any} size={64} color={bgColor} />
          </Animated.View>

          {/* "Assessment Complete!" */}
          <Text style={styles.summaryCompleteText}>Assessment Complete!</Text>
          <Text style={styles.summaryTaskName}>{taskName}</Text>

          {/* Risk level badge — big */}
          <View style={[styles.summaryRiskBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
            <Text style={styles.summaryRiskBadgeText}>{riskLabel}</Text>
          </View>

          {/* Score — very large */}
          <Text style={styles.summaryScoreNumber}>{finalScore}</Text>
          <Text style={styles.summaryScoreLabel}>IADL Exposure Score</Text>

          {/* TSL card */}
          <View style={[styles.summaryTslCard, { width: '100%' }]}>
            <View style={styles.summaryTslRow}>
              <Ionicons name={stabilityIcon as any} size={18} color="#fff" />
              <Text style={styles.summaryTslLabel}>TSL:</Text>
              <Text style={styles.summaryTslValue}>{getStabilityLabel(stability)}</Text>
            </View>
            <Text style={styles.summaryTslDesc}>{getStabilityDescription(stability)}</Text>
          </View>

          {/* Risk sentence */}
          <View style={[styles.summarySentenceBox, { width: '100%' }]}>
            <Text style={styles.summarySentenceText}>{getRiskSentence(riskLevel)}</Text>
          </View>

          {/* Action buttons */}
          <View style={{ width: '100%', marginTop: 24, gap: 12 }}>
            <TouchableOpacity
              onPress={onBreakdown}
              activeOpacity={0.86}
              style={styles.breakdownBtn}
            >
              <Ionicons name="bar-chart-outline" size={22} color={bgColor} />
              <Text style={[styles.breakdownBtnText, { color: bgColor }]}>See Full Breakdown</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onHome}
              activeOpacity={0.82}
              style={styles.homeBtn}
            >
              <Ionicons name="home-outline" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.homeBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

// ── Main Result Screen ─────────────────────────────────────────────────────────
export default function ResultScreen() {
  const router = useRouter();
  const { addAssessment } = useAssessmentStore();
  const params = useLocalSearchParams<{
    taskId: string;
    taskName: string;
    frequency: string;
    duration: string;
    physicalDemand: string;
    complexity: string;
    psychological: string;
    neck: string;
    arm: string;
    wrist: string;
    back: string;
    leg: string;
    posture: string;
    handling: string;
    stability: string;
    rawScore: string;
    adjustmentFactor: string;
    finalScore: string;
    riskLevel: string;
    readOnly?: string;
  }>();

  const [showSummary, setShowSummary] = useState(true);
  const [detailVisible, setDetailVisible] = useState(false);

  const riskLevel      = params.riskLevel as RiskLevel;
  const finalScore     = parseFloat(params.finalScore);
  const rawScore       = parseInt(params.rawScore);
  const psychological  = parseInt(params.psychological);
  const posture        = parseInt(params.posture);
  const handling       = parseInt(params.handling) as 1 | 2 | 3;
  const physicalDemand = parseInt(params.physicalDemand) as 1 | 2 | 3;
  const complexity     = parseInt(params.complexity) as 1 | 2 | 3;
  const neck           = parseInt(params.neck) as 1 | 2 | 3;
  const arm            = parseInt(params.arm) as 1 | 2 | 3;
  const wrist          = parseInt(params.wrist) as 1 | 2 | 3;
  const back           = parseInt(params.back) as 1 | 2 | 3;
  const leg            = parseInt(params.leg) as 1 | 2 | 3;
  const stability      = params.stability as StabilityLevel;

  const saved = useRef(false);
  useEffect(() => {
    if (params.readOnly === 'true') return;
    if (saved.current) return;
    saved.current = true;
    addAssessment({
      taskId: params.taskId,
      taskName: params.taskName,
      date: new Date().toISOString(),
      frequency: params.frequency as FrequencyCategory,
      duration: params.duration as DurationCategory,
      physicalDemand,
      complexity,
      psychological,
      neck,
      arm,
      wrist,
      back,
      leg,
      posture,
      handling,
      stability,
      rawScore,
      adjustmentFactor: parseFloat(params.adjustmentFactor),
      finalScore,
      riskLevel,
    });
  }, []);

  // When readOnly, skip summary and go straight to breakdown
  useEffect(() => {
    if (params.readOnly === 'true') setShowSummary(false);
  }, []);

  const riskColor  = getRiskColor(riskLevel);
  const riskBg     = getRiskBg(riskLevel);
  const riskLabel  = getRiskLabel(riskLevel);
  const tips       = TIPS[riskLevel];
  const riskIcon   = riskLevel === 'green' ? 'checkmark-circle' : riskLevel === 'yellow' ? 'warning' : 'alert-circle';

  const stabilityColor = stability === 'very_stable' ? '#10B981' : stability === 'somewhat_unsteady' ? '#F59E0B' : '#EF4444';
  const stabilityBg    = stability === 'very_stable' ? '#D1FAE5' : stability === 'somewhat_unsteady' ? '#FEF3C7' : '#FEE2E2';

  // ── Show summary first ────────────────────────────────────────────────────
  if (showSummary) {
    return (
      <SummaryScreen
        taskName={params.taskName}
        finalScore={finalScore}
        riskLevel={riskLevel}
        riskColor={riskColor}
        riskBg={riskBg}
        riskLabel={riskLabel}
        riskIcon={riskIcon}
        stability={stability}
        onBreakdown={() => setShowSummary(false)}
        onHome={() => router.replace('/(main)/home')}
      />
    );
  }

  // ── Full breakdown view ────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero */}
        <View className="bg-primary px-6 pt-8 pb-14 rounded-b-[48px] items-center" style={styles.heroShadow}>
          <View className="w-24 h-24 rounded-full items-center justify-center mb-4" style={{ backgroundColor: riskBg }}>
            <Ionicons name={riskIcon as any} size={48} color={riskColor} />
          </View>
          <Text className="font-osbd text-white text-2xl mb-1">Assessment Complete!</Text>
          <Text className="font-osmd text-white/70 text-sm">{params.taskName}</Text>
        </View>

        {/* Risk score card */}
        <View className="mx-5 -mt-6 bg-white rounded-3xl p-5" style={styles.cardShadow}>
          <View className="items-center mb-4">
            <View className="px-5 py-2 rounded-full mb-2" style={{ backgroundColor: riskBg }}>
              <Text className="font-osbd text-lg" style={{ color: riskColor }}>{riskLabel}</Text>
            </View>
            <Text className="font-osbd text-4xl text-text">{finalScore}</Text>
            <Text className="font-osmd text-text-secondary text-sm">IADL Exposure Score</Text>
          </View>

          {/* Risk sentence */}
          <View className="bg-primary-50 rounded-xl px-4 py-3 mb-4">
            <Text className="font-osmd text-primary text-sm text-center">{getRiskSentence(riskLevel)}</Text>
          </View>

          {/* Score Breakdown */}
          <View className="gap-3 mb-2">
            <Text className="font-osbd text-text text-base">Score Breakdown</Text>

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-osmd text-text-secondary text-sm">Psychological Perception</Text>
                <Text className="font-osbd text-text">{psychological}/6</Text>
              </View>
              <ScoreBar value={psychological} max={6} />
            </View>

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-osmd text-text-secondary text-sm">Postures Adopted</Text>
                <Text className="font-osbd text-text">{posture}/15</Text>
              </View>
              <ScoreBar value={posture} max={15} />
            </View>

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-osmd text-text-secondary text-sm">Manual Handling</Text>
                <Text className="font-osbd text-text">{handling}/3</Text>
              </View>
              <ScoreBar value={handling} max={3} />
            </View>

            <View className="flex-row items-center justify-between pt-2 border-t border-border">
              <Text className="font-osmd text-text-secondary text-sm">Raw Score (sum)</Text>
              <Text className="font-osbd text-text">{rawScore}/24</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="font-osmd text-text-secondary text-sm">Adjustment Factor</Text>
              <Text className="font-osbd text-text">× {params.adjustmentFactor}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="font-osbd text-text">IADL Exposure Score</Text>
              <Text className="font-osbd text-xl" style={{ color: riskColor }}>{finalScore}</Text>
            </View>
          </View>

          {/* See Details button */}
          <TouchableOpacity
            onPress={() => setDetailVisible(true)}
            activeOpacity={0.82}
            className="flex-row items-center justify-center gap-2 border-2 border-primary rounded-xl py-3 mt-3"
          >
            <Ionicons name="list-outline" size={18} color="#2563EB" />
            <Text className="font-osbd text-primary text-base">See Details</Text>
          </TouchableOpacity>
        </View>

        {/* Task Stability */}
        <View className="mx-5 mt-4 bg-white rounded-2xl p-5" style={styles.cardShadow}>
          <Text className="font-osbd text-text text-base mb-4">Task Stability Level (TSL)</Text>
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-2xl items-center justify-center" style={{ backgroundColor: stabilityBg }}>
              <Ionicons
                name={stability === 'very_stable' ? 'shield-checkmark-outline' : stability === 'somewhat_unsteady' ? 'alert-outline' : 'warning-outline'}
                size={32}
                color={stabilityColor}
              />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: stabilityColor }} />
                <Text className="font-osbd text-base" style={{ color: stabilityColor }}>{getStabilityLabel(stability)}</Text>
              </View>
              <Text className="font-osmd text-text-secondary text-sm leading-5">{getStabilityDescription(stability)}</Text>
            </View>
          </View>
        </View>

        {/* Risk scale reference */}
        <View className="mx-5 mt-4 bg-white rounded-2xl p-4" style={styles.cardShadow}>
          <Text className="font-osbd text-text mb-3">Risk Rating Table</Text>
          <View className="gap-2">
            {[
              { label: 'Low Risk',      range: '< 1.6',     color: '#10B981', bg: '#D1FAE5', sentence: 'Task is easy to perform, but required caution.',                        level: 'green'  },
              { label: 'Moderate Risk', range: '1.6 – 5.0', color: '#F59E0B', bg: '#FEF3C7', sentence: 'Task is not easy to perform, required more consideration.',             level: 'yellow' },
              { label: 'High Risk',     range: '> 5.0',     color: '#EF4444', bg: '#FEE2E2', sentence: 'Task is hard to perform, further investigation required urgently.',     level: 'red'    },
            ].map((item) => {
              const isMatch = item.level === riskLevel;
              return (
                <View
                  key={item.label}
                  className="rounded-xl"
                  style={{
                    backgroundColor: item.bg,
                    padding: isMatch ? 14 : 10,
                    borderWidth: isMatch ? 2 : 0,
                    borderColor: item.color,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center gap-2">
                      <View className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <Text className="font-osbd" style={{ color: item.color, fontSize: isMatch ? 15 : 13 }}>{item.label}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      {isMatch && (
                        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: item.color }}>
                          <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'OSans-Bold' }}>Score: {finalScore}</Text>
                        </View>
                      )}
                      <Text className="font-osbd text-sm" style={{ color: item.color }}>{item.range}</Text>
                    </View>
                  </View>
                  <Text className="font-osmd" style={{ color: item.color, fontSize: isMatch ? 13 : 11 }}>{item.sentence}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recommendations */}
        <View className="mx-5 mt-4 bg-white rounded-2xl p-4" style={styles.cardShadow}>
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="bulb-outline" size={20} color="#2563EB" />
            <Text className="font-osbd text-text text-base">Recommendations</Text>
          </View>
          <View className="gap-2">
            {tips.map((tip, i) => (
              <View key={i} className="flex-row gap-2">
                <View className="w-5 h-5 rounded-full items-center justify-center mt-0.5" style={{ backgroundColor: riskBg }}>
                  <Text className="font-osbd text-xs" style={{ color: riskColor }}>{i + 1}</Text>
                </View>
                <Text className="font-osmd text-text-secondary text-sm flex-1">{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action buttons */}
        <View className="mx-5 mt-5 gap-3">
          <TouchableOpacity
            onPress={() => router.replace('/(main)/home')}
            activeOpacity={0.86}
            className="bg-primary rounded-2xl py-4 items-center flex-row justify-center gap-2"
            style={styles.btnShadow}
          >
            <Ionicons name="home-outline" size={20} color="#fff" />
            <Text className="font-osbd text-white text-lg">Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/(main)/assess')}
            activeOpacity={0.86}
            className="bg-white border-2 border-primary rounded-2xl py-4 items-center flex-row justify-center gap-2"
          >
            <Ionicons name="add-circle-outline" size={20} color="#2563EB" />
            <Text className="font-osbd text-primary text-lg">Assess Another Task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── See Details Modal ──────────────────────────────────────────── */}
      <Modal
        visible={detailVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-osbd text-text text-lg">Detailed Breakdown</Text>
              <TouchableOpacity onPress={() => setDetailVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Frequency & Duration */}
              <View className="bg-primary-50 rounded-xl p-4 mb-3">
                <Text className="font-osbd text-primary text-sm mb-2">Task Details</Text>
                <View className="h-px bg-primary-200 mb-2" />
                <View className="flex-row items-center justify-between py-2">
                  <Text className="font-osmd text-text-secondary text-sm">Frequency</Text>
                  <Text className="font-osbd text-text text-sm">{FREQUENCY_LABELS[params.frequency] ?? params.frequency}</Text>
                </View>
                <View className="h-px bg-primary-200" />
                <View className="flex-row items-center justify-between py-2">
                  <Text className="font-osmd text-text-secondary text-sm">Duration per session</Text>
                  <Text className="font-osbd text-text text-sm">{DURATION_LABELS[params.duration] ?? params.duration}</Text>
                </View>
                <View className="h-px bg-primary-200" />
                <View className="flex-row items-center justify-between py-2">
                  <Text className="font-osmd text-text-secondary text-sm">Adjustment Factor</Text>
                  <Text className="font-osbd text-text text-sm">× {params.adjustmentFactor}</Text>
                </View>
              </View>

              {/* Psychological */}
              <View className="bg-primary-50 rounded-xl p-4 mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-osbd text-primary text-sm">Psychological Perceptions</Text>
                  <Text className="font-osbd text-primary text-sm">{psychological}/6</Text>
                </View>
                <View className="h-px bg-primary-200 mb-2" />
                <DetailRow label="Perceived physical demand required" value={PHYSICAL_DEMAND_LABELS[physicalDemand]} score={physicalDemand} max={3} />
                <View className="h-px bg-primary-200" />
                <DetailRow label="Perceived complexity" value={COMPLEXITY_LABELS[complexity]} score={complexity} max={3} />
              </View>

              {/* Postures */}
              <View className="bg-primary-50 rounded-xl p-4 mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-osbd text-primary text-sm">Postures Adopted</Text>
                  <Text className="font-osbd text-primary text-sm">{posture}/15</Text>
                </View>
                <View className="h-px bg-primary-200 mb-2" />
                <DetailRow label="Neck"  value={NECK_LABELS[neck]}   score={neck}  max={3} />
                <View className="h-px bg-primary-200" />
                <DetailRow label="Arm"   value={ARM_LABELS[arm]}     score={arm}   max={3} />
                <View className="h-px bg-primary-200" />
                <DetailRow label="Wrist" value={WRIST_LABELS[wrist]} score={wrist} max={3} />
                <View className="h-px bg-primary-200" />
                <DetailRow label="Back"  value={BACK_LABELS[back]}   score={back}  max={3} />
                <View className="h-px bg-primary-200" />
                <DetailRow label="Leg"   value={LEG_LABELS[leg]}     score={leg}   max={3} />
              </View>

              {/* Manual Handling */}
              <View className="bg-primary-50 rounded-xl p-4 mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-osbd text-primary text-sm">Manual Handling</Text>
                  <Text className="font-osbd text-primary text-sm">{handling}/3</Text>
                </View>
                <View className="h-px bg-primary-200 mb-2" />
                <View className="py-2">
                  <Text className="font-osmd text-text-secondary text-sm">Lifting/lowering, pushing/pulling and carrying</Text>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text className="font-osbd text-text text-sm">{HANDLING_LABELS[handling]}</Text>
                    <Text className="font-osbd text-text text-sm">{handling}/3</Text>
                  </View>
                </View>
              </View>

              {/* Stability */}
              <View className="rounded-xl p-4 mb-3" style={{ backgroundColor: stabilityBg }}>
                <Text className="font-osbd mb-2" style={{ color: stabilityColor }}>Task Stability Level</Text>
                <Text className="font-osbd text-sm mb-1" style={{ color: stabilityColor }}>{getStabilityLabel(stability)}</Text>
                <Text className="font-osmd text-xs" style={{ color: stabilityColor }}>{getStabilityDescription(stability)}</Text>
              </View>

              {/* Risk sentence */}
              <View className="rounded-xl p-4 mb-1" style={{ backgroundColor: riskBg }}>
                <View className="flex-row items-center gap-2 mb-1">
                  <Ionicons name={riskIcon as any} size={16} color={riskColor} />
                  <Text className="font-osbd text-sm" style={{ color: riskColor }}>{riskLabel}</Text>
                  <Text className="font-osmd text-xs ml-auto" style={{ color: riskColor }}>Score: {finalScore}</Text>
                </View>
                <Text className="font-osmd text-sm" style={{ color: riskColor }}>{getRiskSentence(riskLevel)}</Text>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ── Summary screen styles ──────────────────────────────────────────────────
  summaryIconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  summaryCompleteText: {
    fontFamily: 'OSans-Bold',
    fontSize: 26,
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryTaskName: {
    fontFamily: 'OSans-Medium',
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryRiskBadge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 8,
  },
  summaryRiskBadgeText: {
    fontFamily: 'OSans-Bold',
    fontSize: 20,
    color: '#fff',
    letterSpacing: 0.5,
  },
  summaryScoreNumber: {
    fontFamily: 'OSans-Bold',
    fontSize: 88,
    color: '#fff',
    lineHeight: 96,
    marginBottom: 0,
  },
  summaryScoreLabel: {
    fontFamily: 'OSans-Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryTslCard: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    width: '100%',
  },
  summaryTslRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  summaryTslLabel: {
    fontFamily: 'OSans-Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  summaryTslValue: {
    fontFamily: 'OSans-Bold',
    fontSize: 14,
    color: '#fff',
  },
  summaryTslDesc: {
    fontFamily: 'OSans-Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 17,
  },
  summarySentenceBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 8,
  },
  summarySentenceText: {
    fontFamily: 'OSans-Medium',
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
  },
  breakdownBtn: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  breakdownBtnText: {
    fontFamily: 'OSans-Bold',
    fontSize: 18,
  },
  homeBtn: {
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  homeBtnText: {
    fontFamily: 'OSans-Medium',
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },

  // ── Breakdown view styles ─────────────────────────────────────────────────
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
  btnShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    maxHeight: '90%',
  },
});
