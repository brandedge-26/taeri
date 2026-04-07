import type { DurationCategory, FrequencyCategory, StabilityLevel } from '@/types/assessment';
import { calculateFinalScore } from '@/utils/taerScoring';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STABILITY_OPTIONS: {
  value: StabilityLevel;
  label: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
}[] = [
  {
    value: 'very_stable',
    label: 'Very Stable',
    description: 'Felt balanced and fully in control during the task, with no loss of balance, wobbling, or need for support.',
    icon: 'shield-checkmark-outline',
    color: '#10B981',
    bg: '#D1FAE5',
  },
  {
    value: 'somewhat_unsteady',
    label: 'Somewhat Unsteady',
    description: 'Felt slightly unstable at times, needed to adjust posture, slow down, or briefly hold onto something for support.',
    icon: 'alert-outline',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  {
    value: 'very_unsteady',
    label: 'Very Unsteady',
    description: 'Felt significantly unstable, at risk of losing balance, required support to continue, or stopped due to fear of falling.',
    icon: 'warning-outline',
    color: '#EF4444',
    bg: '#FEE2E2',
  },
];

export default function Step4Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    taskId: string;
    taskName: string;
    frequency: string;
    duration: string;
    physicalDemand: string;
    complexity: string;
    neck: string;
    arm: string;
    wrist: string;
    back: string;
    leg: string;
    handling: string;
  }>();

  const [stability, setStability] = useState<StabilityLevel | null>(null);

  function handleCalculate() {
    if (!stability) return;

    const physicalDemand = parseInt(params.physicalDemand) as 1 | 2 | 3;
    const complexity     = parseInt(params.complexity) as 1 | 2 | 3;
    const neck           = parseInt(params.neck) as 1 | 2 | 3;
    const arm            = parseInt(params.arm) as 1 | 2 | 3;
    const wrist          = parseInt(params.wrist) as 1 | 2 | 3;
    const back           = parseInt(params.back) as 1 | 2 | 3;
    const leg            = parseInt(params.leg) as 1 | 2 | 3;
    const handling       = parseInt(params.handling) as 1 | 2 | 3;

    const psychological = physicalDemand + complexity;
    const posture       = neck + arm + wrist + back + leg;

    const result = calculateFinalScore(
      psychological,
      posture,
      handling,
      params.duration as DurationCategory,
      params.frequency as FrequencyCategory,
    );

    router.push({
      pathname: '/(main)/assess/result',
      params: {
        ...params,
        psychological: String(psychological),
        posture: String(posture),
        stability,
        rawScore: String(result.rawScore),
        adjustmentFactor: String(result.adjustmentFactor),
        finalScore: String(result.finalScore),
        riskLevel: result.riskLevel,
      },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px]" style={styles.heroShadow}>
        <TouchableOpacity onPress={() => router.back()} className="mb-3 flex-row items-center gap-1">
          <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.8)" />
          <Text className="font-osmd text-white/80 text-sm">Back</Text>
        </TouchableOpacity>
        <Text className="font-osmd text-white/70 text-sm font-medium mb-1">Step 6 of 6 — Task Stability</Text>
        <Text className="font-osbd text-white text-2xl">{params.taskName}</Text>
        <Text className="font-osmd text-white/70 text-sm mt-1">How stable did you feel while performing this task?</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingTop: 24, paddingBottom: 40, gap: 12 }}
      >
        {/* Progress dots — all filled (last step) */}
        <View className="flex-row justify-center gap-2 mb-2">
          {[1, 2, 3].map((i) => (
            <View key={i} className="h-1.5 w-8 rounded-full bg-primary" />
          ))}
        </View>

        {STABILITY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setStability(opt.value)}
            activeOpacity={0.82}
            className={`rounded-2xl p-4 border-2 ${stability === opt.value ? 'border-primary bg-primary-50' : 'border-border bg-white'}`}
            style={styles.optionCard}
          >
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: opt.bg }}>
                <Ionicons name={opt.icon as any} size={26} color={opt.color} />
              </View>
              <View className="flex-1">
                <Text className="font-osbd text-text text-base">{opt.label}</Text>
              </View>
              {stability === opt.value && (
                <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
              )}
            </View>
            <Text className="font-osmd text-text-secondary text-sm">{opt.description}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={handleCalculate}
          disabled={!stability}
          activeOpacity={0.86}
          className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 mt-2 ${stability ? 'bg-primary' : 'bg-primary-300'}`}
          style={stability ? styles.btnShadow : undefined}
        >
          <Ionicons name="calculator-outline" size={20} color="#fff" />
          <Text className="font-osbd text-white text-lg">Calculate Risk Score</Text>
        </TouchableOpacity>
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
  optionCard: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  btnShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
