import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OPTIONS = [
  {
    score: 1 as const,
    label: 'Easy',
    description: 'Task felt simple and comfortable. No effort or struggle.',
    icon: 'happy-outline',
    color: '#10B981',
    bg: '#D1FAE5',
  },
  {
    score: 2 as const,
    label: 'Medium',
    description: 'Task required some effort. Felt a bit tiring or challenging.',
    icon: 'remove-circle-outline',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  {
    score: 3 as const,
    label: 'Hard',
    description: 'Task was difficult or exhausting. Required significant effort.',
    icon: 'sad-outline',
    color: '#EF4444',
    bg: '#FEE2E2',
  },
];

export default function Step1Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    taskId: string;
    taskName: string;
    frequency: string;
    duration: string;
  }>();

  const [selected, setSelected] = useState<1 | 2 | 3 | null>(null);

  function handleNext() {
    if (!selected) return;
    router.push({
      pathname: '/(main)/assess/step2',
      params: { ...params, psychological: String(selected) },
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
        <Text className="font-osmd text-white/70 text-sm font-medium mb-1">Step 3 of 5 — Psychological</Text>
        <Text className="font-osbd text-white text-2xl font-osbd">{params.taskName}</Text>
        <Text className="font-osmd text-white/70 text-sm mt-1">How hard did this task feel?</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingTop: 24, paddingBottom: 40, gap: 12 }}
      >
        {/* Progress dots */}
        <View className="flex-row justify-center gap-2 mb-2">
          {[1, 2, 3].map((i) => (
            <View key={i} className={`h-1.5 rounded-full ${i === 1 ? 'w-8 bg-primary' : 'w-4 bg-primary-200'}`} />
          ))}
        </View>

        <Text className="font-osbd text-text font-osbd text-lg text-center mb-2">
          Rate your psychological perception
        </Text>

        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.score}
            onPress={() => setSelected(opt.score)}
            activeOpacity={0.82}
            className={`rounded-2xl p-5 flex-row items-center gap-4 border-2 ${selected === opt.score ? 'border-primary bg-primary-50' : 'border-border bg-white'
              }`}
            style={styles.optionCard}
          >
            <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: opt.bg }}>
              <Ionicons name={opt.icon as any} size={30} color={opt.color} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="font-osbd text-text font-osbd text-lg">{opt.label}</Text>
                <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: opt.bg }}>
                  <Text className="font-osbd text-xs font-osbd" style={{ color: opt.color }}>{opt.score}/3</Text>
                </View>
              </View>
              <Text className="font-osmd text-text-secondary text-sm mt-1">{opt.description}</Text>
            </View>
            {selected === opt.score && (
              <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={handleNext}
          disabled={!selected}
          activeOpacity={0.86}
          className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 ${selected ? 'bg-primary' : 'bg-primary-300'
            }`}
          style={selected ? styles.btnShadow : undefined}
        >
          <Text className="font-osbd text-white font-osbd text-lg">Continue</Text>
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
