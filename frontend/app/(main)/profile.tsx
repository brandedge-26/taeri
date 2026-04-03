import type { RiskLevel } from '@/types/assessment';
import { getRiskColor } from '@/utils/taerScoring';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile, uploadAvatar, isLoading } = useAuthStore();
  const { assessments, fetchAssessments } = useAssessmentStore();

  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');

  const totalCount = assessments.length;
  const riskCounts = {
    green: assessments.filter((a) => a.riskLevel === 'green').length,
    yellow: assessments.filter((a) => a.riskLevel === 'yellow').length,
    red: assessments.filter((a) => a.riskLevel === 'red').length,
  };

  useFocusEffect(
    useCallback(() => {
      fetchAssessments();
    }, []),
  );

  function openEdit() {
    setEditName(user?.name ?? '');
    setEditAge(user?.age?.toString() ?? '');
    setEditVisible(true);
  }

  async function handleSaveProfile() {
    const name = editName.trim();
    const age = parseInt(editAge, 10);
    if (!name || isNaN(age) || age < 0 || age > 120) {
      Alert.alert('Invalid Input', 'Please enter a valid name and age (0-120).');
      return;
    }
    const success = await updateProfile(name, age);
    if (success) setEditVisible(false);
  }

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Allow access to your photo library to upload a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
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

  const statItems: { label: string; value: number; level: RiskLevel | null }[] = [
    { label: 'Total Assessments', value: totalCount, level: null },
    { label: 'Low Risk', value: riskCounts.green, level: 'green' },
    { label: 'Medium Risk', value: riskCounts.yellow, level: 'yellow' },
    { label: 'High Risk', value: riskCounts.red, level: 'red' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <View className="bg-primary px-6 pt-8 pb-16 rounded-b-[48px] items-center" style={styles.heroShadow}>

          {/* Avatar with edit button */}
          <View className="mb-3">
            <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.85}>
              <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center" style={styles.avatarRing}>
                {user?.profilePicture ? (
                  <Image
                    source={{ uri: user.profilePicture }}
                    style={{ width: 88, height: 88, borderRadius: 44, borderWidth: 4, borderColor: "rgba(255,255,255,0.2)" }}
                  />
                ) : (
                  <View className="w-20 h-20 rounded-full bg-white items-center justify-center">
                    <Ionicons name="person" size={36} color="#2563EB" />
                  </View>
                )}
              </View>
              {/* Pencil overlay */}
              <View style={styles.editBadge}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="pencil" size={12} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-2">
            <Text className="font-osbd text-white text-xl">{user?.name ?? 'TAERI User'}</Text>
          </View>
          <Text className="font-osmd text-white/70 text-sm">{user?.email ?? ''}</Text>
        </View>

        {/* User info card */}
        <View className="mx-5 -mt-6 bg-white rounded-3xl p-5 mb-4" style={styles.cardShadow}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 py-1">
              <Ionicons name="person-circle-outline" size={20} color="#2563EB" />
              <View>
                <Text className="font-osbd text-text text-base">{user?.name ?? '—'}</Text>
                <Text className="font-osmd text-text-secondary text-sm">{user?.email ?? '—'}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={openEdit}
              className="flex-row items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg"
            >
              <Ionicons name="pencil-outline" size={14} color="#2563EB" />
              <Text className="font-osbd text-primary text-xs">Edit</Text>
            </TouchableOpacity>
          </View>
          {user?.age ? (
            <View className="flex-row items-center gap-3 mt-3 pt-3 border-t border-border">
              <Ionicons name="calendar-outline" size={18} color="#2563EB" />
              <Text className="font-osmd text-text-secondary text-sm">Age: {user.age}</Text>
            </View>
          ) : null}
        </View>

        {/* Stats */}
        <View className="mx-5 bg-white rounded-2xl p-4 mb-4" style={styles.cardShadow}>
          <Text className="font-osbd text-text text-base mb-3">Your Statistics</Text>
          <View className="flex-row flex-wrap gap-3">
            {statItems.map((s) => (
              <View key={s.label} className="flex-1 min-w-[40%] bg-background rounded-xl p-3 items-center">
                <Text className="font-osbd text-2xl" style={{ color: s.level ? getRiskColor(s.level) : '#2563EB' }}>
                  {s.value}
                </Text>
                <Text className="font-osmd text-text-secondary text-xs text-center mt-1">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View className="mx-5">
          <TouchableOpacity
            onPress={handleLogout}
            className="border-2 border-error rounded-2xl py-4 items-center flex-row justify-center gap-2"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="font-osbd text-error text-base">Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View className="flex-row items-center justify-between mb-5">
              <Text className="font-osbd text-text text-lg">Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Name */}
            <Text className="font-osbd text-text-secondary text-xs mb-1 ml-1">Full Name</Text>
            <View className="flex-row items-center border-2 border-gray-200 rounded-lg px-4 py-3 mb-4 bg-gray-50">
              <Ionicons name="person-outline" size={16} color="#2563EB" />
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor="#94A3B8"
                className="font-osmd flex-1 text-text ml-3"
                style={{ paddingVertical: 0 }}
                autoCapitalize="words"
              />
            </View>

            {/* Age */}
            <Text className="font-osbd text-text-secondary text-xs mb-1 ml-1">Age</Text>
            <View className="flex-row items-center border-2 border-gray-200 rounded-lg px-4 py-3 mb-6 bg-gray-50">
              <Ionicons name="calendar-outline" size={16} color="#2563EB" />
              <TextInput
                value={editAge}
                onChangeText={(t) => setEditAge(t.replace(/[^0-9]/g, '').slice(0, 3))}
                placeholder="Your age"
                placeholderTextColor="#94A3B8"
                className="font-osmd flex-1 text-text ml-3"
                style={{ paddingVertical: 0 }}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>

            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={isLoading}
              className={`rounded-xl py-4 items-center flex-row justify-center gap-2 ${isLoading ? 'bg-primary-300' : 'bg-primary'}`}
              style={isLoading ? undefined : styles.btnShadow}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text className="font-osbd text-white text-base">Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  cardShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  btnShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarRing: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
});
