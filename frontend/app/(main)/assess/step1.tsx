import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PHYSICAL_DEMAND_OPTIONS = [
  { score: 1 as const, label: 'None/Minor', color: '#10B981', bg: '#D1FAE5' },
  { score: 2 as const, label: 'Moderate',   color: '#F59E0B', bg: '#FEF3C7' },
  { score: 3 as const, label: 'Too much',   color: '#EF4444', bg: '#FEE2E2' },
];

const COMPLEXITY_OPTIONS = [
  { score: 1 as const, label: 'Not at all/Slight', color: '#10B981', bg: '#D1FAE5' },
  { score: 2 as const, label: 'Moderate',          color: '#F59E0B', bg: '#FEF3C7' },
  { score: 3 as const, label: 'Extreme',            color: '#EF4444', bg: '#FEE2E2' },
];

export default function Step1Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    taskId: string;
    taskName: string;
    frequency: string;
    duration: string;
  }>();

  const [open, setOpen] = useState(true);
  const [physicalDemand, setPhysicalDemand] = useState<1 | 2 | 3 | null>(null);
  const [complexity, setComplexity] = useState<1 | 2 | 3 | null>(null);

  const score = (physicalDemand ?? 0) + (complexity ?? 0);
  const canContinue = physicalDemand !== null && complexity !== null;

  function handleNext() {
    if (!canContinue) return;
    router.push({
      pathname: '/(main)/assess/step2',
      params: {
        ...params,
        physicalDemand: String(physicalDemand),
        complexity: String(complexity),
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
        <Text className="font-osmd text-white/70 text-sm font-medium mb-1">Step 3 of 6 — Psychological</Text>
        <Text className="font-osbd text-white text-2xl">{params.taskName}</Text>
        <Text className="font-osmd text-white/70 text-sm mt-1">Rate your psychological perception</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingTop: 24, paddingBottom: 40, gap: 14 }}
      >
        {/* Progress dots */}
        <View className="flex-row justify-center gap-2 mb-2">
          {[1, 2, 3].map((i) => (
            <View key={i} className={`h-1.5 rounded-full ${i === 1 ? 'w-8 bg-primary' : 'w-4 bg-primary-200'}`} />
          ))}
        </View>

        {/* Accordion Section */}
        <View className="bg-white rounded-2xl overflow-hidden" style={styles.sectionCard}>

          {/* Accordion Header */}
          <TouchableOpacity
            onPress={() => setOpen((v) => !v)}
            activeOpacity={0.8}
            className="flex-row items-center justify-between px-4 py-4 border-b border-border"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-xl bg-primary-50 items-center justify-center">
                <Ionicons name="analytics-outline" size={20} color="#2563EB" />
              </View>
              <Text className="font-osbd text-text text-base">Psychological Perceptions</Text>
            </View>
            <View className="flex-row items-center gap-2">
              {score > 0 && (
                <View className="bg-primary-50 px-2.5 py-1 rounded-full">
                  <Text className="font-osbd text-primary text-xs">{score}/6</Text>
                </View>
              )}
              <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#64748B" />
            </View>
          </TouchableOpacity>

          {open && (
            <View className="px-4 py-4 gap-5">

              {/* Sub-section 1 */}
              <View>
                <Text className="font-osbd text-text text-sm mb-1">Perceived physical demand required</Text>
                <Text className="font-osmd text-text-secondary text-xs mb-3">
                  How much physical effort does this task demand?
                </Text>
                <View className="flex-row gap-2">
                  {PHYSICAL_DEMAND_OPTIONS.map((opt) => {
                    const selected = physicalDemand === opt.score;
                    return (
                      <TouchableOpacity
                        key={opt.score}
                        onPress={() => setPhysicalDemand(opt.score)}
                        activeOpacity={0.82}
                        className="flex-1 rounded-xl p-3 items-center border-2"
                        style={[
                          styles.optChip,
                          {
                            borderColor: selected ? opt.color : '#E2E8F0',
                            backgroundColor: selected ? opt.bg : '#F8FAFC',
                          },
                        ]}
                      >
                        <View
                          className="w-5 h-5 rounded-full border-2 items-center justify-center mb-2"
                          style={{ borderColor: selected ? opt.color : '#CBD5E1' }}
                        >
                          {selected && (
                            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opt.color }} />
                          )}
                        </View>
                        <Text
                          className="font-osbd text-center"
                          style={{ fontSize: 11, color: selected ? opt.color : '#64748B' }}
                          numberOfLines={2}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Divider */}
              <View className="h-px bg-border" />

              {/* Sub-section 2 */}
              <View>
                <Text className="font-osbd text-text text-sm mb-1">Perceived complexity</Text>
                <Text className="font-osmd text-text-secondary text-xs mb-3">
                  How complex or mentally demanding is this task?
                </Text>
                <View className="flex-row gap-2">
                  {COMPLEXITY_OPTIONS.map((opt) => {
                    const selected = complexity === opt.score;
                    return (
                      <TouchableOpacity
                        key={opt.score}
                        onPress={() => setComplexity(opt.score)}
                        activeOpacity={0.82}
                        className="flex-1 rounded-xl p-3 items-center border-2"
                        style={[
                          styles.optChip,
                          {
                            borderColor: selected ? opt.color : '#E2E8F0',
                            backgroundColor: selected ? opt.bg : '#F8FAFC',
                          },
                        ]}
                      >
                        <View
                          className="w-5 h-5 rounded-full border-2 items-center justify-center mb-2"
                          style={{ borderColor: selected ? opt.color : '#CBD5E1' }}
                        >
                          {selected && (
                            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opt.color }} />
                          )}
                        </View>
                        <Text
                          className="font-osbd text-center"
                          style={{ fontSize: 11, color: selected ? opt.color : '#64748B' }}
                          numberOfLines={2}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Total badge */}
              <View className="flex-row items-center justify-between bg-primary-50 rounded-xl px-4 py-3">
                <Text className="font-osmd text-text-secondary text-sm">Total Psychological Score</Text>
                <Text className="font-osbd text-primary text-base">{score}/6</Text>
              </View>

            </View>
          )}
        </View>

        {/* Continue */}
        <TouchableOpacity
          onPress={handleNext}
          disabled={!canContinue}
          activeOpacity={0.86}
          className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 ${canContinue ? 'bg-primary' : 'bg-primary-300'}`}
          style={canContinue ? styles.btnShadow : undefined}
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
  sectionCard: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  optChip: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  btnShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
