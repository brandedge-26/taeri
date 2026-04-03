import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

const OTP_LENGTH = 6;

export default function ResetPasswordScreen() {

  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { resetPassword, forgotPassword, isLoading, error, clearError } = useAuthStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'new' | 'confirm' | null>(null);
  const [resent, setResent] = useState(false);

  const inputs = useRef<(TextInput | null)[]>([]);

  const otpComplete = otp.every((d) => d !== '');
  const passwordsMatch = newPassword.length >= 6 && newPassword === confirmPassword;

  function handleOtpChange(text: string, index: number) {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  }

  function handleVerifyOtp() {
    if (!otpComplete) return;
    clearError();
    setStep(2);
  }

  async function handleReset() {
    if (!passwordsMatch || isLoading) return;
    clearError();
    const success = await resetPassword(email, otp.join(''), newPassword);
    if (success) {
      router.replace('/(auth)/login');
    }
  }

  async function handleResend() {
    clearError();
    setOtp(Array(OTP_LENGTH).fill(''));
    setResent(false);
    if (step === 2) setStep(1);
    inputs.current[0]?.focus();
    const success = await forgotPassword(email);
    if (success) setResent(true);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Blue hero */}
          <View className="bg-primary items-center pt-10 pb-14 px-6 rounded-b-[48px]" style={styles.heroShadow}>
            <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-4" style={styles.logoRing}>
              <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
                <Ionicons
                  name={step === 1 ? 'keypad-outline' : 'lock-closed-outline'}
                  size={28}
                  color="#2563EB"
                />
              </View>
            </View>
            <Text className="font-osbd text-2xl text-white mb-1">
              {step === 1 ? 'Verify OTP' : 'New Password'}
            </Text>
            <Text className="font-osmd text-sm text-primary-200 text-center">
              {step === 1 ? `OTP sent to ${email}` : 'Choose a strong new password'}
            </Text>
          </View>

          {/* Step indicator */}
          <View className="flex-row justify-center items-center gap-2 mt-5">
            <View className="w-8 h-2 rounded-full bg-primary" />
            <View className={`w-8 h-2 rounded-full ${step === 2 ? 'bg-primary' : 'bg-gray-200'}`} />
          </View>

          {/* Card */}
          <View className="mx-5 mt-4 bg-white rounded-3xl p-6" style={styles.cardShadow}>

            {/* ── STEP 1: OTP ── */}
            {step === 1 && (
              <>
                <Text className="font-osbd text-xl text-text mb-1">Enter OTP</Text>
                <Text className="font-osmd text-md text-text-secondary mb-6">
                  Enter the 6-digit code sent to your email
                </Text>

                <View className="flex-row justify-between gap-1 mb-6">
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={(el) => { inputs.current[i] = el; }}
                      style={[styles.otpBox, digit ? styles.otpBoxFilled : {}]}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, i)}
                      onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {resent && (
                  <View className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-4">
                    <Text className="font-osmd text-sm text-green-700">New OTP sent to your email.</Text>
                  </View>
                )}

                {error ? (
                  <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                    <Text className="font-osmd text-sm text-red-600">{error}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  activeOpacity={0.86}
                  disabled={!otpComplete}
                  className={`rounded-lg py-4 items-center flex-row justify-center gap-2 ${otpComplete ? 'bg-primary' : 'bg-primary-300'}`}
                  style={otpComplete ? styles.btnShadow : undefined}
                >
                  <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                  <Text className="text-lg text-white font-osbd">Verify OTP</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center mt-5 gap-1">
                  <Text className="font-osmd text-md text-text-secondary">{"Didn't receive it?"}</Text>
                  <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                    <Text className="font-osbd text-md text-primary"> Resend OTP</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ── STEP 2: NEW PASSWORD ── */}
            {step === 2 && (
              <>``
                <Text className="font-osbd text-xl text-text mb-1">Set New Password</Text>
                <Text className="font-osmd text-md text-text-secondary mb-6">
                  OTP verified — now choose your new password
                </Text>

                {/* New password */}
                <View className={`flex-row items-center rounded-lg px-4 py-3 mb-4 border-2 ${focusedField === 'new' ? 'border-primary bg-gray-50' : 'border-gray-200 bg-gray-100'}`}>
                  <View className="w-8 h-8 items-center justify-center mr-3">
                    <Ionicons name="lock-closed-outline" size={17} color="#2563EB" />
                  </View>
                  <TextInput
                    style={styles.input}
                    className="flex-1 text-md text-text font-osmd"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="New password (min. 6 chars)"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField('new')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                {/* Confirm password */}
                <View className={`flex-row items-center rounded-lg px-4 py-3 mb-6 border-2 ${focusedField === 'confirm' ? 'border-primary bg-gray-50' : 'border-gray-200 bg-gray-100'}`}>
                  <View className="w-8 h-8 items-center justify-center mr-3">
                    <Ionicons name="lock-closed-outline" size={17} color="#2563EB" />
                  </View>
                  <TextInput
                    style={styles.input}
                    className="flex-1 text-md text-text font-osmd"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {confirmPassword.length > 0 && (
                    <Ionicons
                      name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={passwordsMatch ? '#3B82F6' : '#EF4444'}
                    />
                  )}
                </View>

                {error ? (
                  <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                    <Text className="font-osmd text-sm text-red-600">{error}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={handleReset}
                  activeOpacity={0.86}
                  disabled={!passwordsMatch || isLoading}
                  className={`rounded-lg py-4 items-center flex-row justify-center gap-2 ${passwordsMatch && !isLoading ? 'bg-primary' : 'bg-primary-300'}`}
                  style={passwordsMatch && !isLoading ? styles.btnShadow : undefined}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                      <Text className="text-lg text-white font-osbd">Reset Password</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row justify-center items-center mt-4 gap-1"
                  onPress={() => { clearError(); setStep(1); }}
                >
                  <Ionicons name="arrow-back-outline" size={15} color="#2563EB" />
                  <Text className="font-osbd text-sm text-primary">Back to OTP</Text>
                </TouchableOpacity>
              </>
            )}

          </View>

        </ScrollView>
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
