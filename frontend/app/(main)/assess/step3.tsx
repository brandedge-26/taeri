import type { DurationCategory, FrequencyCategory } from '@/types/assessment';
import { calculateFinalScore } from '@/utils/taerScoring';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OPTIONS = [
  {
    score: 1 as const,
    label: 'Light',
    description: 'No heavy lifting. Items are lightweight or handled easily.',
    icon: 'cube-outline',
    color: '#10B981',
    bg: '#D1FAE5',
    example: 'e.g. Folding clothes, light grocery bag',
  },
  {
    score: 2 as const,
    label: 'Moderate',
    description: 'Handling items of medium weight. Some effort required when moving or carrying.',
    icon: 'barbell-outline',
    color: '#F59E0B',
    bg: '#FEF3C7',
    example: 'e.g. Carrying shopping bags, vacuum cleaner',
  },
  {
    score: 3 as const,
    label: 'Heavy',
    description: 'Heavy lifting, carrying, or pushing. Significant physical effort required.',
    icon: 'warning-outline',
    color: '#EF4444',
    bg: '#FEE2E2',
    example: 'e.g. Moving furniture, heavy boxes, full laundry basket',
  },
];

export default function Step3Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    taskId: string;
    taskName: string;
    frequency: string;
    duration: string;
    psychological: string;
    posture: string;
  }>();

  const [selected, setSelected] = useState<1 | 2 | 3 | null>(null);

  function handleCalculate() {
    if (!selected) return;

    const psychological = parseInt(params.psychological) as 1 | 2 | 3;
    const posture = parseInt(params.posture) as 1 | 2 | 3;
    const handling = selected;

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
        handling: String(handling),
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
        <Text className="font-osmd text-white/70 text-sm font-medium mb-1">Step 5 of 5 — Manual Handling</Text>
        <Text className="font-osbd text-white text-2xl ">{params.taskName}</Text>
        <Text className="font-osmd text-white/70 text-sm mt-1">How heavy was the manual handling?</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingTop: 24, paddingBottom: 40, gap: 12 }}
      >
        {/* Progress dots */}
        <View className="flex-row justify-center gap-2 mb-2">
          {[1, 2, 3].map((i) => (
            <View key={i} className="h-1.5 w-8 rounded-full bg-primary" />
          ))}
        </View>

        <Text className="font-osbd text-text  text-lg text-center mb-2">
          Select manual handling difficulty
        </Text>

        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.score}
            onPress={() => setSelected(opt.score)}
            activeOpacity={0.82}
            className={`rounded-2xl p-4 border-2 ${selected === opt.score ? 'border-primary bg-primary-50' : 'border-border bg-white'
              }`}
            style={styles.optionCard}
          >
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: opt.bg }}>
                <Ionicons name={opt.icon as any} size={26} color={opt.color} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-osbd text-text  text-base">{opt.label}</Text>
                  <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: opt.bg }}>
                    <Text className="font-osbd text-xs " style={{ color: opt.color }}>{opt.score}/3</Text>
                  </View>
                </View>
              </View>
              {selected === opt.score && (
                <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
              )}
            </View>
            <Text className="font-osmd text-text-secondary text-sm">{opt.description}</Text>
            <Text className="font-osmd text-text-muted text-xs mt-1">{opt.example}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={handleCalculate}
          disabled={!selected}
          activeOpacity={0.86}
          className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 ${selected ? 'bg-primary' : 'bg-primary-300'
            }`}
          style={selected ? styles.btnShadow : undefined}
        >
          <Ionicons name="calculator-outline" size={20} color="#fff" />
          <Text className="font-osbd text-white  text-lg">Calculate Risk Score</Text>
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
