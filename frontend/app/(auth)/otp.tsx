import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
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

const OTP_LENGTH = 6;
const emptyColor = '#F9FAFB';

export default function OtpScreen() {

  const router = useRouter();
  const { verifyOtp, isLoading, error, clearError } = useAuthStore();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);

  const isComplete = otp.every((d) => d !== '');

  function handleChange(text: string, index: number) {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  }

  async function handleVerify() {
    if (!isComplete || isLoading) return;
    clearError();
    const otpString = otp.join('');
    const success = await verifyOtp(otpString);
    if (success) {
      router.replace('/(auth)/login');
    }
  }

  function handleResend() {
    setOtp(Array(OTP_LENGTH).fill(''));
    inputs.current[0]?.focus();
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
              <Ionicons name="keypad-outline" size={28} color="#2563EB" />
            </View>
          </View>
          <Text className="font-osbd text-2xl text-white mb-1">Verify Your Identity</Text>
          <Text className="font-osmd text-sm text-primary-200 text-center">
            Enter the 6-digit code sent to your email
          </Text>
        </View>

        {/* Card */}
        <View className="mx-5 -mt-6 bg-white rounded-3xl p-6" style={styles.cardShadow}>

          <Text className="font-osbd text-xl text-text mb-1">Enter OTP</Text>
          <Text className="font-osmd text-md text-text-secondary mb-8">
            We sent a verification code to your registered email
          </Text>

          {/* 6 OTP boxes */}
          <View className="flex-row justify-between gap-1 mb-8 font-osmd">
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                style={[
                  styles.otpBox,
                  { backgroundColor: digit ? '#EFF6FF' : emptyColor, fontFamily: 'OSans-Medium' },
                  digit ? styles.otpBoxFilled : {},
                ]}
                value={digit}
                onChangeText={(text) => handleChange(text, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Error message */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              <Text className="font-osmd text-sm text-red-600">{error}</Text>
            </View>
          ) : null}

          {/* Verify button */}
          <TouchableOpacity
            onPress={handleVerify}
            activeOpacity={0.86}
            disabled={!isComplete || isLoading}
            className={`rounded-lg py-4 items-center flex-row justify-center gap-2 ${isComplete && !isLoading ? 'bg-primary' : 'bg-primary-300'}`}
            style={isComplete && !isLoading ? styles.btnShadow : undefined}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                <Text className="font-osbd text-lg text-white">Verify & Continue</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Resend */}
          <View className="flex-row justify-center items-center mt-6 gap-1">
            <Text className="font-osmd text-md text-text-secondary">{"Didn't receive it?"}</Text>
            <TouchableOpacity onPress={handleResend}>
              <Text className="font-osbd text-md text-primary"> Resend OTP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Back to login */}
        <TouchableOpacity
          className="flex-row items-center justify-center mt-6 gap-1"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-outline" size={16} color="#2563EB" />
          <Text className="font-osbd text-md font-semibold text-primary">Back to Login</Text>
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
  otpBox: {
    flex: 1,
    aspectRatio: 0.8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'OSans-Bold',
    color: '#0F172A',
    backgroundColor: '#F3F4F6',
  },
  otpBoxFilled: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
  },
  btnShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
