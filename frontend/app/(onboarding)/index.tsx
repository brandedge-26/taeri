import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, ListRenderItemInfo, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');


type Step = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};


type Slide = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  highlight: string;
  subtitle: string;
  steps?: Step[];
};



const slides: Slide[] = [
  {
    id: '1',
    icon: 'shield-checkmark',
    title: 'Welcome to',
    highlight: 'TAERI',
    subtitle: 'Track your daily tasks, spot risks, and maintain your independence with personalized safety insights.',
    steps: [
      { icon: 'clipboard-outline', label: 'Log your daily activities' },
      { icon: 'bar-chart-outline', label: 'Get personalized risk insights' },
      { icon: 'shield-checkmark-outline', label: 'Stay safe & independent' },
    ],
  },
  {
    id: '2',
    icon: 'settings',
    title: 'How TAERI',
    highlight: 'Works',
    subtitle: 'Four simple steps to protect your independence every single day.',
    steps: [
      { icon: 'create-outline', label: 'Log your daily tasks' },
      { icon: 'help-circle-outline', label: 'Answer 3 quick questions' },
      { icon: 'analytics-outline', label: 'Review your FRI score' },
      { icon: 'trophy-outline', label: 'Get your Safety Score' },
    ],
  },
  {
    id: '3',
    icon: 'lock-closed',
    title: 'Your Data is',
    highlight: 'Safe',
    subtitle: 'Plain language consent. Encrypted data. Your information stays yours — always.',
    steps: [
      { icon: 'lock-closed-outline', label: 'End-to-end encrypted' },
      { icon: 'document-text-outline', label: 'Plain language consent' },
      { icon: 'eye-off-outline', label: 'Never sold to third parties' },
      { icon: 'key-outline', label: 'Secure login always' },
    ],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  async function finish() {
    await AsyncStorage.setItem('onboarding_done', 'true');
    router.replace('/(auth)/login');
  }

  function handleNext() {
    if (currentIndex < slides.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      finish();
    }
  }

  const renderItem = ({ item }: ListRenderItemInfo<Slide>) => (
    <ScrollView style={{ width }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>

      {/* Hero icon — 3 rings */}
      <View className="items-center mb-8">
        <View className="w-40 h-40 rounded-full bg-primary-50 items-center justify-center">
          <View className="w-28 h-28 rounded-full bg-primary-100 items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center" style={styles.iconShadow}>
              <Ionicons name={item.icon} size={36} color="#fff" />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text className="font-osbd text-3xl text-text text-center mt-6">
          {item.title}{' '}
          <Text className="font-osbd text-primary">{item.highlight}</Text>
        </Text>

        {/* Subtitle */}
        <Text className="font-osmd text-md text-text-secondary text-center mt-3 px-2">
          {item.subtitle}
        </Text>
      </View>

      {/* Steps */}
      {item.steps && (
        <View className="gap-3">
          {item.steps.map((step, i) => (
            <View
              key={i}
              className="flex-row items-center bg-background-secondary rounded-2xl px-4 py-3 border border-border-blue"
            >
              {/* Icon box */}
              <View className="w-9 h-9 rounded-xl bg-primary-100 items-center justify-center mr-3">
                <Ionicons name={step.icon} size={18} color="#2563EB" />
              </View>

              {/* Label */}
              <Text className="font-osmd text-md font-medium text-text flex-1">{step.label}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const isLast = currentIndex === slides.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* Top bar */}
      <View className="flex-row items-center justify-between px-6 py-3">
        <Text className="font-osbd text-xl tracking-widest text-primary">TAERI</Text>
        <TouchableOpacity onPress={finish} className="px-4 py-1.5 rounded-full bg-primary-50">
          <Text className="font-osbd text-sm font-semibold text-primary-700">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={renderItem}
        className="flex-1"
      />

      {/* Bottom */}
      <View className="px-6 pb-8">
        {/* Dots */}
        <View className="flex-row justify-center items-center gap-2 mb-6">
          {slides.map((_, i) => ( 
            <View
              key={i}
              style={{ width: i === currentIndex ? 28 : 8 }}
              className={`h-2 rounded-full ${i === currentIndex ? 'bg-primary' : 'bg-primary-200'}`}
            />
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.88}
          className="rounded-2xl py-4 items-center bg-primary flex-row justify-center gap-2"
          style={styles.btnShadow}
        >
          <Text className="font-osbd text-lg  text-white">
            {isLast ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name={isLast ? 'rocket-outline' : 'arrow-forward'} size={20} color="#fff" />
        </TouchableOpacity>

        <Text className="font-sans text-xs text-text-muted text-center mt-4">
          {currentIndex + 1} of {slides.length}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
