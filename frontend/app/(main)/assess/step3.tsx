import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HANDLING_OPTIONS = [
  {
    score: 1 as const,
    label: 'Light',
    description: 'No heavy lifting. Items are lightweight or handled easily.',
    weightLabel: '< 1 kg',
    icon: 'cube-outline',
    color: '#10B981',
    bg: '#D1FAE5',
  },
  {
    score: 2 as const,
    label: 'Moderate',
    description: 'Handling items of medium weight. Some effort required when moving or carrying.',
    weightLabel: '1 – 5 kg',
    icon: 'barbell-outline',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  {
    score: 3 as const,
    label: 'Heavy',
    description: 'Heavy lifting, carrying, or pushing. Significant physical effort required.',
    weightLabel: '> 5 kg',
    icon: 'warning-outline',
    color: '#EF4444',
    bg: '#FEE2E2',
  },
];

export default function Step3Screen() {
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
  }>();

  const [selected, setSelected] = useState<1 | 2 | 3 | null>(null);

  function handleNext() {
    if (!selected) return;
    router.push({
      pathname: '/(main)/assess/step4',
      params: { ...params, handling: String(selected) },
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
        <Text className="font-osmd text-white/70 text-sm font-medium mb-1">Step 5 of 6 — Manual Handling</Text>
        <Text className="font-osbd text-white text-2xl">{params.taskName}</Text>
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

        <Text className="font-osmd text-text-secondary text-sm text-center mb-1">
          Lifting/lowering, pushing/pulling and carrying
        </Text>

        {HANDLING_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.score}
            onPress={() => setSelected(opt.score)}
            activeOpacity={0.82}
            className={`rounded-2xl p-4 border-2 ${selected === opt.score ? 'border-primary bg-primary-50' : 'border-border bg-white'}`}
            style={styles.optionCard}
          >
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: opt.bg }}>
                <Ionicons name={opt.icon as any} size={26} color={opt.color} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-osbd text-text text-base">{opt.label}</Text>
                  <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: opt.bg }}>
                    <Text className="font-osbd text-xs" style={{ color: opt.color }}>{opt.weightLabel}</Text>
                  </View>
                </View>
              </View>
              {selected === opt.score && (
                <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
              )}
            </View>
            <Text className="font-osmd text-text-secondary text-sm">{opt.description}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={handleNext}
          disabled={!selected}
          activeOpacity={0.86}
          className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 ${selected ? 'bg-primary' : 'bg-primary-300'}`}
          style={selected ? styles.btnShadow : undefined}
        >
          <Text className="font-osbd text-white text-lg">Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
