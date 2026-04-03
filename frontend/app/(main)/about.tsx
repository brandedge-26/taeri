import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FEATURES = [
  { icon: 'clipboard-outline', title: 'Task Assessment', desc: 'Assess ergonomic risks across 11 common household tasks using validated methodology.' },
  { icon: 'analytics-outline', title: 'Risk Scoring', desc: 'TAER scoring system calculates raw scores with psychological, postural, and handling factors.' },
  { icon: 'time-outline', title: 'Assessment History', desc: 'Track all past assessments with risk-level filtering and detailed result breakdowns.' },
  { icon: 'shield-checkmark-outline', title: 'Evidence-Based', desc: 'Built on validated ergonomic assessment tools adapted for telehealth and independent living.' },
];

const TEAM = [
  { role: 'Project Lead', name: 'Dr. Asim Zaheer', org: 'NED University of Engineering & Technology' },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <View className="bg-primary px-6 pt-6 pb-14 rounded-b-[40px]" style={styles.heroShadow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="font-osbd text-white text-2xl mt-4">About TAERI</Text>
          <Text className="font-osmd text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Telehealth Task Assessment for{'\n'}Ergonomic Risk & Independence
          </Text>
        </View>

        {/* App intro card */}
        <View className="mx-5 mt-5 bg-white rounded-3xl p-5 mb-4" style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <View style={styles.appIcon}>
              <Text className="font-osbd text-white" style={{ fontSize: 20, letterSpacing: -1 }}>T</Text>
            </View>
            <View>
              <Text className="font-osbd text-text text-lg">TAERI</Text>
              <Text className="font-osmd text-text-secondary text-xs">Version 1.0.0</Text>
            </View>
          </View>
          <Text className="font-osmd text-text-secondary text-sm leading-relaxed">
            TAERI helps occupational therapists and individuals assess ergonomic risks in everyday household tasks.
            Using the validated TAER methodology, it identifies physical and psychological strain to promote safer
            and more independent daily living.
          </Text>
        </View>

        {/* Features */}
        <Text className="font-osbd text-xs mx-5 mb-2" style={{ color: '#94A3B8', letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Key Features
        </Text>
        <View className="mx-5 bg-white rounded-2xl overflow-hidden mb-4" style={styles.card}>
          {FEATURES.map((f, i) => (
            <View key={f.title}>
              <View style={{ flexDirection: 'row', gap: 12, padding: 16, alignItems: 'flex-start' }}>
                <View style={[styles.featureIcon]}>
                  <Ionicons name={f.icon as any} size={18} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="font-osbd text-text text-sm mb-0.5">{f.title}</Text>
                  <Text className="font-osmd text-text-secondary text-xs leading-relaxed">{f.desc}</Text>
                </View>
              </View>
              {i < FEATURES.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Research Team */}
        <Text className="font-osbd text-xs mx-5 mb-2" style={{ color: '#94A3B8', letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Research Team
        </Text>
        <View className="mx-5 bg-white rounded-2xl overflow-hidden mb-4" style={styles.card}>
          {TEAM.map((t) => (
            <View key={t.name} style={{ flexDirection: 'row', gap: 12, padding: 16, alignItems: 'center' }}>
              <View style={styles.teamIcon}>
                <Ionicons name="person-outline" size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text className="font-osbd text-text text-sm">{t.name}</Text>
                <Text className="font-osmd text-xs mt-0.5" style={{ color: '#94A3B8' }}>{t.role}</Text>
                <Text className="font-osmd text-xs mt-0.5" style={{ color: '#94A3B8' }}>{t.org}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View className="mx-5 rounded-2xl p-4" style={{ backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Ionicons name="alert-circle-outline" size={15} color="#94A3B8" />
            <Text className="font-osbd text-xs" style={{ color: '#94A3B8' }}>Disclaimer</Text>
          </View>
          <Text className="font-osmd text-xs leading-relaxed" style={{ color: '#94A3B8' }}>
            TAERI is intended for informational and research purposes only. It does not replace professional
            occupational therapy assessment or medical advice.
          </Text>
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 64,
  },
});
