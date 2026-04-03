import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useAuthStore } from '../../store/authStore';

type SettingRowProps = {
  icon: string;
  iconColor?: string;
  iconBg?: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  destructive?: boolean;
};

function SettingRow({ icon, iconColor = '#2563EB', iconBg = '#EFF6FF', label, sublabel, onPress, destructive }: SettingRowProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text className="font-osbd text-sm" style={{ color: destructive ? '#EF4444' : '#1E293B' }}>
          {label}
        </Text>
        {sublabel ? (
          <Text className="font-osmd text-xs mt-0.5" style={{ color: '#94A3B8' }}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={destructive ? '#FCA5A5' : '#CBD5E1'} />
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      className="font-osbd text-xs mx-5 mb-2 mt-5"
      style={{ color: '#94A3B8', letterSpacing: 0.6, textTransform: 'uppercase' }}
    >
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { deleteAccount, logout } = useAuthStore();
  const { removeAllAssessments } = useAssessmentStore();

  function handleDeleteAssessments() {
    Alert.alert(
      'Delete All Assessments',
      'This will permanently delete all your assessment history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete All', style: 'destructive', onPress: () => removeAllAssessments() },
      ],
    );
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteAccount();
            if (success) {
              router.replace('/(onboarding)');
            } else {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ],
    );
  }

  async function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">

      {/* Header */}
      <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px]" style={styles.heroShadow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="font-osbd text-white text-2xl mt-4">Settings</Text>
        <Text className="font-osmd text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Manage your account & preferences
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >

        {/* Account */}
        <SectionHeader title="Account" />
        <View className="mx-5 bg-white rounded-2xl overflow-hidden" style={styles.card}>
          <SettingRow
            icon="person-outline"
            label="My Profile"
            sublabel="Edit name, age and photo"
            onPress={() => router.push('/(main)/profile')}
          />
        </View>

        {/* App */}
        <SectionHeader title="App" />
        <View className="mx-5 bg-white rounded-2xl overflow-hidden" style={styles.card}>
          <SettingRow
            icon="bar-chart-outline"
            label="My Analytics"
            sublabel="View your assessment statistics"
            onPress={() => router.push('/(main)/analytics')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="information-circle-outline"
            label="About TAERI"
            sublabel="App info & research credits"
            onPress={() => router.push('/(main)/about')}
          />
        </View>

        {/* Manage Account */}
        <SectionHeader title="Manage Account" />
        <View className="mx-5 bg-white rounded-2xl overflow-hidden" style={styles.card}>
          <SettingRow
            icon="trash-outline"
            iconColor="#F59E0B"
            iconBg="#FEF3C7"
            label="Delete All Assessments"
            sublabel="Remove all assessment history"
            onPress={handleDeleteAssessments}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="person-remove-outline"
            iconColor="#EF4444"
            iconBg="#FEE2E2"
            label="Delete Account"
            sublabel="Permanently remove your account"
            onPress={handleDeleteAccount}
            destructive
          />
        </View>

        {/* Logout */}
        <SectionHeader title="Session" />
        <View className="mx-5 bg-white rounded-2xl overflow-hidden" style={styles.card}>
          <SettingRow
            icon="log-out-outline"
            iconColor="#EF4444"
            iconBg="#FEE2E2"
            label="Log Out"
            sublabel="Sign out of your account"
            onPress={handleLogout}
            destructive
          />
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 64,
  },
});
