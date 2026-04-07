import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Image map (static requires) ───────────────────────────────────────────────
const POSTURE_IMAGES = {
  // Neck
  neck1: require('../../../assets/images/postures/img1.png'),
  neck2: require('../../../assets/images/postures/img2.png'),
  neck3: require('../../../assets/images/postures/img3.png'),
  // Arm
  arm1: require('../../../assets/images/postures/img4.png'),
  arm2: require('../../../assets/images/postures/img5.png'),
  arm3: require('../../../assets/images/postures/img11.png'),
  // Wrist
  wrist1: require('../../../assets/images/postures/img6.png'),
  wrist2: require('../../../assets/images/postures/img7.png'),
  wrist3: require('../../../assets/images/postures/img8.png'),
  // Back
  back1: require('../../../assets/images/postures/img12.png'),
  back2: require('../../../assets/images/postures/img13.png'),
  back3: require('../../../assets/images/postures/img14.png'),
  // Leg
  leg1: require('../../../assets/images/postures/img9.png'),
  leg2: require('../../../assets/images/postures/img10.png'),
  leg3: require('../../../assets/images/postures/img10.png'), // reused — no separate img
};

type Score = 1 | 2 | 3;

interface BodyPart {
  key: 'neck' | 'arm' | 'wrist' | 'back' | 'leg';
  label: string;
  options: { score: Score; label: string; imageKey: keyof typeof POSTURE_IMAGES }[];
}

const BODY_PARTS: BodyPart[] = [
  {
    key: 'neck',
    label: 'Neck',
    options: [
      { score: 1, label: '0–10°',  imageKey: 'neck1' },
      { score: 2, label: '10–20°', imageKey: 'neck2' },
      { score: 3, label: '>20°',   imageKey: 'neck3' },
    ],
  },
  {
    key: 'arm',
    label: 'Arm',
    options: [
      { score: 1, label: '0–20°',  imageKey: 'arm1' },
      { score: 2, label: '20–45°', imageKey: 'arm2' },
      { score: 3, label: '>45°',   imageKey: 'arm3' },
    ],
  },
  {
    key: 'wrist',
    label: 'Wrist',
    options: [
      { score: 1, label: 'Neutral',  imageKey: 'wrist1' },
      { score: 2, label: '0–15°',    imageKey: 'wrist2' },
      { score: 3, label: '>15°',     imageKey: 'wrist3' },
    ],
  },
  {
    key: 'back',
    label: 'Back',
    options: [
      { score: 1, label: '0–20°',  imageKey: 'back1' },
      { score: 2, label: '20–60°', imageKey: 'back2' },
      { score: 3, label: '>60°',   imageKey: 'back3' },
    ],
  },
  {
    key: 'leg',
    label: 'Leg',
    options: [
      { score: 1, label: 'Both Straight\nor Sitting', imageKey: 'leg1' },
      { score: 2, label: 'One/Both\nBent',            imageKey: 'leg2' },
      { score: 3, label: 'Unsupported\n>30°',         imageKey: 'leg3' },
    ],
  },
];

type PostureState = {
  neck: Score | null;
  arm: Score | null;
  wrist: Score | null;
  back: Score | null;
  leg: Score | null;
};

export default function Step2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    taskId: string;
    taskName: string;
    frequency: string;
    duration: string;
    physicalDemand: string;
    complexity: string;
  }>();

  const [open, setOpen] = useState(true);
  const [selections, setSelections] = useState<PostureState>({
    neck: null, arm: null, wrist: null, back: null, leg: null,
  });

  const score = (Object.values(selections) as (Score | null)[])
    .reduce((sum, v) => sum + (v ?? 0), 0);

  const canContinue = Object.values(selections).every((v) => v !== null);

  function select(key: keyof PostureState, score: Score) {
    setSelections((prev) => ({ ...prev, [key]: score }));
  }

  function handleNext() {
    if (!canContinue) return;
    router.push({
      pathname: '/(main)/assess/step3',
      params: {
        ...params,
        neck: String(selections.neck),
        arm: String(selections.arm),
        wrist: String(selections.wrist),
        back: String(selections.back),
        leg: String(selections.leg),
      },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px]" style={styles.heroShadow}>
        <TouchableOpacity onPress={() => router.back()} className="mb-3 flex-row items-center gap-1">
          <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.8)" />
          <Text className="font-osbd text-white/80 text-sm">Back</Text>
        </TouchableOpacity>
        <Text className="font-osbd text-white/70 text-sm font-medium mb-1">Step 4 of 6 — Posture</Text>
        <Text className="font-osbd text-white text-2xl">{params.taskName}</Text>
        <Text className="font-osmd text-white/70 text-sm mt-1">What body positions did you adopt?</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingTop: 24, paddingBottom: 40, gap: 14 }}
      >
        {/* Progress dots */}
        <View className="flex-row justify-center gap-2 mb-2">
          {[1, 2, 3].map((i) => (
            <View key={i} className={`h-1.5 rounded-full ${i <= 2 ? 'w-8 bg-primary' : 'w-4 bg-primary-200'}`} />
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
                <Ionicons name="body-outline" size={20} color="#2563EB" />
              </View>
              <Text className="font-osbd text-text text-base">Postures Adopted</Text>
            </View>
            <View className="flex-row items-center gap-2">
              {score > 0 && (
                <View className="bg-primary-50 px-2.5 py-1 rounded-full">
                  <Text className="font-osbd text-primary text-xs">{score}/15</Text>
                </View>
              )}
              <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#64748B" />
            </View>
          </TouchableOpacity>

          {open && (
            <View className="px-4 py-4 gap-5">
              {BODY_PARTS.map((part, partIdx) => {
                const selected = selections[part.key];
                return (
                  <View key={part.key}>
                    {partIdx > 0 && <View className="h-px bg-border mb-5" />}

                    {/* Body part heading */}
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="font-osbd text-text text-sm">{part.label}</Text>
                      {selected && (
                        <View className="bg-primary-50 px-2 py-0.5 rounded-full">
                          <Text className="font-osbd text-primary text-xs">{selected}/3</Text>
                        </View>
                      )}
                    </View>

                    {/* 3-column image options */}
                    <View className="flex-row gap-2">
                      {part.options.map((opt) => {
                        const isSelected = selected === opt.score;
                        return (
                          <TouchableOpacity
                            key={opt.score}
                            onPress={() => select(part.key, opt.score)}
                            activeOpacity={0.82}
                            className="flex-1 rounded-xl items-center pt-3 pb-2 border-2"
                            style={[
                              styles.imgCard,
                              {
                                borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                                backgroundColor: '#ffffff',
                              },
                            ]}
                          >
                              {/* Image in white box so its background blends cleanly */}
                            <View style={styles.imgBox}>
                              <Image
                                source={POSTURE_IMAGES[opt.imageKey]}
                                style={styles.postureImg}
                                resizeMode="contain"
                              />
                            </View>
                            <Text
                              className="font-osbd text-center mt-2"
                              style={{ fontSize: 10, color: isSelected ? '#2563EB' : '#64748B', lineHeight: 14 }}
                              numberOfLines={2}
                            >
                              {opt.label}
                            </Text>
                            {/* Radio dot */}
                            <View
                              className="w-4 h-4 rounded-full border-2 items-center justify-center mt-1.5"
                              style={{ borderColor: isSelected ? '#2563EB' : '#CBD5E1' }}
                            >
                              {isSelected && (
                                <View className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}

              {/* Total badge */}
              <View className="flex-row items-center justify-between bg-primary-50 rounded-xl px-4 py-3 mt-1">
                <Text className="font-osmd text-text-secondary text-sm">Total Adopted Posture Score</Text>
                <Text className="font-osbd text-primary text-base">{score}/15</Text>
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
  imgCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  imgBox: {
    width: 64,
    height: 64,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postureImg: {
    width: 58,
    height: 58,
  },
  btnShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
