import type { DurationCategory, FrequencyCategory, RiskLevel } from '@/types/assessment';
import { getRiskBg, getRiskColor, getRiskLabel } from '@/utils/taerScoring';
import { useAssessmentStore } from '../../../store/assessmentStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function ResultScreen() {
  const router = useRouter();
  const { addAssessment } = useAssessmentStore();
  const params = useLocalSearchParams<{
    taskId: string;
    taskName: string;
    frequency: string;
    duration: string;
    psychological: string;
    posture: string;
    handling: string;
    rawScore: string;
    adjustmentFactor: string;
    finalScore: string;
    riskLevel: string;
    readOnly?: string; // history se aane per save mat kro
  }>();

  const riskLevel = params.riskLevel as RiskLevel;
  const finalScore = parseFloat(params.finalScore);
  const rawScore = parseInt(params.rawScore);
  const psychological = parseInt(params.psychological) as 1 | 2 | 3;
  const posture = parseInt(params.posture) as 1 | 2 | 3;
  const handling = parseInt(params.handling) as 1 | 2 | 3;

  const saved = useRef(false);
  useEffect(() => {
    if (params.readOnly === 'true') return; // history se view — dobara save nahi
    if (saved.current) return;
    saved.current = true;
    addAssessment({
      taskId: params.taskId,
      taskName: params.taskName,
      date: new Date().toISOString(),
      frequency: params.frequency as FrequencyCategory,
      duration: params.duration as DurationCategory,
      psychological,
      posture,
      handling,
      rawScore,
      adjustmentFactor: parseFloat(params.adjustmentFactor),
      finalScore,
      riskLevel,
    });
  }, []);

  const riskColor = getRiskColor(riskLevel);
  const riskBg = getRiskBg(riskLevel);
  const riskLabel = getRiskLabel(riskLevel);
  const tips = TIPS[riskLevel];

  const riskIcon =
    riskLevel === 'green' ? 'checkmark-circle' :
      riskLevel === 'yellow' ? 'warning' : 'alert-circle';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero */}
        <View className="bg-primary px-6 pt-8 pb-14 rounded-b-[48px] items-center" style={styles.heroShadow}>
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: riskBg }}
          >
            <Ionicons name={riskIcon} size={48} color={riskColor} />
          </View>
          <Text className="font-osbd text-white text-2xl  mb-1">Assessment Complete!</Text>
          <Text className="font-osmd text-white/70 text-sm">{params.taskName}</Text>
        </View>

        {/* Risk score card */}
        <View className="mx-5 -mt-6 bg-white rounded-3xl p-5" style={styles.cardShadow}>
          <View className="items-center mb-4">
            <View className="px-5 py-2 rounded-full mb-2" style={{ backgroundColor: riskBg }}>
              <Text className="font-osbd text-lg " style={{ color: riskColor }}>{riskLabel}</Text>
            </View>
            <Text className="font-osbd text-4xl  text-text">{finalScore}</Text>
            <Text className="font-osmd text-text-secondary text-sm">Final Score</Text>
          </View>

          {/* Breakdown */}
          <View className="gap-3 mb-2">
            <Text className="font-osbd text-text  text-base">Score Breakdown</Text>

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-osmd text-text-secondary text-sm">Psychological Perception</Text>
                <Text className="font-osbd text-text ">{psychological}/3</Text>
              </View>
              <ScoreBar value={psychological} max={3} />
            </View>

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-osmd text-text-secondary text-sm">Posture</Text>
                <Text className="font-osbd text-text ">{posture}/3</Text>
              </View>
              <ScoreBar value={posture} max={3} />
            </View>

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-osmd text-text-secondary text-sm">Manual Handling</Text>
                <Text className="font-osbd text-text ">{handling}/3</Text>
              </View>
              <ScoreBar value={handling} max={3} />
            </View>

            <View className="flex-row items-center justify-between pt-2 border-t border-border">
              <Text className="font-osmd text-text-secondary text-sm">Raw Score (sum)</Text>
              <Text className="font-osbd text-text ">{rawScore}/9</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="font-osmd text-text-secondary text-sm">Adjustment Factor</Text>
              <Text className="font-osbd text-text ">× {params.adjustmentFactor}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="font-osbd text-text ">Final Score</Text>
              <Text className="font-osbd text-xl " style={{ color: riskColor }}>{finalScore}</Text>
            </View>
          </View>
        </View>

        {/* Risk scale reference */}
        <View className="mx-5 mt-4 bg-white rounded-2xl p-4" style={styles.cardShadow}>
          <Text className="font-osbd text-text  mb-3">Risk Scale Reference</Text>
          <View className="gap-2">
            {[
              { label: 'Low Risk', range: '< 1.6', color: '#10B981', bg: '#D1FAE5' },
              { label: 'Medium Risk', range: '1.6 – 5.0', color: '#F59E0B', bg: '#FEF3C7' },
              { label: 'High Risk', range: '> 5.0', color: '#EF4444', bg: '#FEE2E2' },
            ].map((item) => (
              <View key={item.label} className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <Text className="font-osmd text-text-secondary text-sm">{item.label}</Text>
                </View>
                <Text className="font-osbd text-text text-sm font-semibold">{item.range}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recommendations */}
        <View className="mx-5 mt-4 bg-white rounded-2xl p-4" style={styles.cardShadow}>
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="bulb-outline" size={20} color="#2563EB" />
            <Text className="font-osbd text-text  text-base">Recommendations</Text>
          </View>
          <View className="gap-2">
            {tips.map((tip, i) => (
              <View key={i} className="flex-row gap-2">
                <View className="w-5 h-5 rounded-full items-center justify-center mt-0.5" style={{ backgroundColor: riskBg }}>
                  <Text className="font-osbd text-xs " style={{ color: riskColor }}>{i + 1}</Text>
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
            <Text className="font-osbd text-white  text-lg">Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/(main)/assess')}
            activeOpacity={0.86}
            className="bg-white border-2 border-primary rounded-2xl py-4 items-center flex-row justify-center gap-2"
          >
            <Ionicons name="add-circle-outline" size={20} color="#2563EB" />
            <Text className="font-osbd text-primary  text-lg">Assess Another Task</Text>
          </TouchableOpacity>
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
  btnShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
