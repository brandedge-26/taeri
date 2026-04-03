import type { DurationCategory, FrequencyCategory } from '@/types/assessment';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FREQUENCIES: { value: FrequencyCategory; label: string; sub: string }[] = [
  { value: '1/week', label: '1×  per week', sub: 'Once a week' },
  { value: '2/week', label: '2×  per week', sub: 'Twice a week' },
  { value: '3/week', label: '3×  per week', sub: 'Three times a week' },
  { value: '4-7/week', label: '4–7× per week', sub: 'Almost daily' },
];

const DURATIONS: { value: DurationCategory; label: string }[] = [
  { value: '<5', label: 'Less than 5 min' },
  { value: '5-15', label: '5 – 15 min' },
  { value: '16-25', label: '16 – 25 min' },
  { value: '26-35', label: '26 – 35 min' },
  { value: '36-45', label: '36 – 45 min' },
  { value: '46-60', label: '46 – 60 min' },
  { value: '>60', label: 'More than 60 min' },
];

export default function TaskDetailsScreen() {
  const router = useRouter();
  const { taskId, taskName } = useLocalSearchParams<{ taskId: string; taskName: string }>();

  const [frequency, setFrequency] = useState<FrequencyCategory | null>(null);
  const [duration, setDuration] = useState<DurationCategory | null>(null);

  function handleNext() {
    if (!frequency || !duration) return;
    router.push({
      pathname: '/(main)/assess/step1',
      params: { taskId, taskName, frequency, duration },
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
        <Text className="font-osmd text-white/70 text-sm font-medium mb-1">Step 2 of 5</Text>
        <Text className="font-osbd text-white text-2xl">{taskName}</Text>
        <Text className="font-osmd text-white/70 text-sm mt-1">How often and how long did you do it?</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingTop: 24, paddingBottom: 40 }}
      >
        {/* Frequency */}
        <Text className="font-osbd text-text text-base mb-3">How often per week?</Text>
        <View className="gap-2 mb-6">
          {FREQUENCIES.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setFrequency(f.value)}
              activeOpacity={0.82}
              className={`rounded-2xl p-4 flex-row items-center border-2 ${frequency === f.value
                ? 'bg-primary border-primary'
                : 'bg-white border-border'
                }`}
              style={styles.optionCard}
            >
              <View
                className={`w-8 h-8 rounded-full border-2 items-center justify-center mr-3 ${frequency === f.value ? 'bg-white border-white' : 'border-border-blue'
                  }`}
              >
                {frequency === f.value && (
                  <Ionicons name="checkmark" size={16} color="#2563EB" />
                )}
              </View>
              <View>
                <Text className={`font-osbd text-base ${frequency === f.value ? 'text-white' : 'text-text'}`}>
                  {f.label}
                </Text>
                <Text className={`font-osmd text-xs ${frequency === f.value ? 'text-white/70' : 'text-text-secondary'}`}>
                  {f.sub}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Duration */}
        <Text className="font-osbd text-text text-base mb-3">How long each time?</Text>
        <View className="flex-row flex-wrap gap-2 mb-8">
          {DURATIONS.map((d) => (
            <TouchableOpacity
              key={d.value}
              onPress={() => setDuration(d.value)}
              activeOpacity={0.82}
              className={`rounded-xl px-4 py-3 border-2 ${duration === d.value
                ? 'bg-primary border-primary'
                : 'bg-white border-border'
                }`}
            >
              <Text className={`font-osbd font-semibold text-sm ${duration === d.value ? 'text-white' : 'text-text'}`}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next button */}
        <TouchableOpacity
          onPress={handleNext}
          disabled={!frequency || !duration}
          activeOpacity={0.86}
          className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 ${frequency && duration ? 'bg-primary' : 'bg-primary-300'
            }`}
          style={frequency && duration ? styles.btnShadow : undefined}
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
