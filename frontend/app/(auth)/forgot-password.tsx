import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

export default function ForgotPasswordScreen() {

  const router = useRouter();
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);

  const isValid = email.trim().length > 0 && email.includes('@');

  async function handleSend() {
    if (!isValid || isLoading) return;
    clearError();
    const success = await forgotPassword(email.trim().toLowerCase());
    if (success) {
      router.push({ pathname: '/(auth)/reset-password', params: { email: email.trim().toLowerCase() } });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >

        {/* Blue hero */}
        <View className="bg-primary items-center pt-10 pb-14 px-6 rounded-b-[48px]" style={styles.heroShadow}>
          <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-4" style={styles.logoRing}>
            <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
              <Ionicons name="lock-open-outline" size={28} color="#2563EB" />
            </View>
          </View>
          <Text className="font-osbd text-2xl text-white mb-1">Forgot Password?</Text>
          <Text className="font-osmd text-sm text-primary-200 text-center">
            Enter your email and we'll send you a reset code
          </Text>
        </View>

        {/* Card */}
        <View className="mx-5 -mt-6 bg-white rounded-3xl p-6" style={styles.cardShadow}>

          <Text className="font-osbd text-xl text-text mb-1">Reset Password</Text>
          <Text className="font-osmd text-md text-text-secondary mb-6">
            We'll send a 6-digit OTP to verify it's you
          </Text>

          {/* Email input */}
          <View className={`flex-row items-center rounded-lg px-4 py-3 mb-4 border-2 ${focused ? 'border-primary bg-gray-50' : 'border-gray-200 bg-gray-100'}`}>
            <View className="w-8 h-8 rounded-sm items-center justify-center mr-3">
              <Ionicons name="mail-outline" size={17} color="#2563EB" />
            </View>
            <TextInput
              style={styles.input}
              className="flex-1 text-md text-text font-osmd"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            {email.length > 0 && (
              <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
            )}
          </View>

          {/* Error */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              <Text className="font-osmd text-sm text-red-600">{error}</Text>
            </View>
          ) : null}

          {/* Send OTP button */}
          <TouchableOpacity
            onPress={handleSend}
            activeOpacity={0.86}
            disabled={!isValid || isLoading}
            className={`rounded-lg py-4 items-center flex-row justify-center gap-2 ${isValid && !isLoading ? 'bg-primary' : 'bg-primary-300'}`}
            style={isValid && !isLoading ? styles.btnShadow : undefined}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text className="text-lg text-white font-osbd">Send OTP</Text>
                <Ionicons name="send-outline" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

        </View>

        {/* Back to login */}
        <TouchableOpacity
          className="flex-row items-center justify-center mt-6 gap-1"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-outline" size={16} color="#2563EB" />
          <Text className="font-osbd text-md text-primary">Back to Login</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
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
  logoRing: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cardShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  input: { paddingVertical: 0 },
  btnShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
