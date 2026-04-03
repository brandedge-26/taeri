import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

type FocusedField = 'name' | 'email' | 'password' | 'age' | null;
type LivingSituation = 'alone' | 'family' | 'spouse' | null;

const LIVING_OPTIONS: { value: LivingSituation; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'alone', label: 'Live Alone', icon: 'person-outline' },
  { value: 'family', label: 'Family', icon: 'people-outline' },
  { value: 'spouse', label: 'Spouse', icon: 'heart-outline' },
];

export default function SignupScreen() {

  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [living, setLiving] = useState<LivingSituation>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<FocusedField>(null);

  const isValid = name.trim() && email.trim() && password.length >= 6 && age.trim() && living !== null;

  async function handleSignup() {
    if (!isValid || isLoading) return;
    clearError();
    const success = await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      age: parseInt(age, 10),
      livingSituation: living!,
    });
    if (success) {
      router.replace('/(auth)/otp');
    }
  }

  function fieldClass(field: FocusedField) {
    return `flex-row items-center rounded-lg px-4 py-3 mb-4 border-2 ${focused === field ? 'border-primary bg-gray-50' : 'border-gray-200 bg-gray-100'
      }`;
  }

  const strength = Math.min(
    4,
    [password.length >= 6, password.length >= 10, /[A-Z]/.test(password), /[0-9!@#$%]/.test(password)].filter(Boolean).length
  );
  const strengthColor = ['bg-error', 'bg-warning', 'bg-warning', 'bg-success', 'bg-success'][strength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Blue hero */}
          <View className="bg-primary items-center pt-10 pb-14 px-6 rounded-b-[48px]" style={styles.heroShadow}>
            <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-4" style={styles.logoRing}>
              <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
                <Text className="font-osbd text-3xl text-primary">T</Text>
              </View>
            </View>
            <Text className="font-osbd text-3xl text-white tracking-widest mb-1">TAERI</Text>
            <Text className="font-osbd text-sm text-primary-200 text-center">Create your account to get started</Text>
          </View>

          {/* Form card */}
          <View className="mx-5 -mt-6 bg-white rounded-3xl p-6" style={styles.cardShadow}>

            <Text className="font-osbd text-2xl text-text">Get Started</Text>
            <Text className="font-osmd text-md text-text-secondary mb-6">Fill in your details below</Text>

            {/* Full Name */}
            <View className={fieldClass('name')}>
              <View className="w-8 h-8 rounded-sm items-center justify-center mr-3">
                <Ionicons name="person-outline" size={17} color="#2563EB" />
              </View>
              <TextInput
                style={styles.input}
                className="font-osmd flex-1 text-md text-text"
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
              />
            </View>

            {/* Email */}
            <View className={fieldClass('email')}>
              <View className="w-8 h-8 rounded-sm items-center justify-center mr-3">
                <Ionicons name="mail-outline" size={17} color="#2563EB" />
              </View>
              <TextInput
                style={styles.input}
                className="font-osmd flex-1 text-md text-text"
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
              {email.includes('@') && <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />}
            </View>

            {/* Password */}
            <View className={fieldClass('password')}>
              <View className="w-8 h-8 rounded-sm items-center justify-center mr-3">
                <Ionicons name="lock-closed-outline" size={17} color="#2563EB" />
              </View>
              <TextInput
                style={styles.input}
                className="font-osmd flex-1 text-md text-text"
                value={password}
                onChangeText={setPassword}
                placeholder="Password (min 6 chars)"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Password strength bar */}
            {password.length > 0 && (
              <View className="flex-row items-center gap-2 -mt-2 mb-4">
                <View className="flex-row flex-1 gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <View key={i} className={`flex-1 h-1.5 rounded-full ${i <= strength ? strengthColor : 'bg-border'}`} />
                  ))}
                </View>
                <Text className="font-osbd text-xs font-semibold text-text-secondary">{strengthLabel}</Text>
              </View>
            )}

            {/* Age */}
            <View className={fieldClass('age')}>
              <View className="w-8 h-8 rounded-sm items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={17} color="#2563EB" />
              </View>
              <TextInput
                style={styles.input}
                className="font-osmd flex-1 text-md text-text"
                value={age}
                onChangeText={(t) => setAge(t.replace(/[^0-9]/g, '').slice(0, 3))}
                placeholder="Your age"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={3}
                onFocus={() => setFocused('age')}
                onBlur={() => setFocused(null)}
              />
            </View>

            {/* Living Situation */}
            <Text className="font-osbd text-sm font-semibold text-text mb-3">Living Situation</Text>
            <View className="flex-row gap-2 mb-6">
              {LIVING_OPTIONS.map((opt) => {
                const selected = living === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setLiving(opt.value)}
                    className={`flex-1 items-center py-3 rounded-lg border-2 ${selected ? 'bg-primary border-primary' : 'bg-gray-100 border-gray-200'
                      }`}
                    style={selected ? styles.chipShadow : undefined}
                  >
                    <Text className={`font-osbd text-xs font-semibold mt-1 ${selected ? 'text-white' : 'text-text-secondary'}`}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Error message */}
            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <Text className="font-osmd text-sm text-red-600">{error}</Text>
              </View>
            ) : null}

            {/* Create account button */}
            <TouchableOpacity
              onPress={handleSignup}
              activeOpacity={0.86}
              disabled={!isValid || isLoading}
              className={`rounded-lg py-4 items-center flex-row justify-center gap-2 ${isValid && !isLoading ? 'bg-primary' : 'bg-primary-300'}`}
              style={isValid && !isLoading ? styles.btnShadow : undefined}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={20} color="#fff" />
                  <Text className="font-osbd text-lg text-white">Create Account</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Login link */}
            <View className="flex-row justify-center items-center mt-5 gap-1">
              <Text className="font-osmd text-md text-text-secondary">Already have an account?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="font-osbd text-md  text-primary"> Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Consent */}
          <View className="px-8 mt-5 mb-4">
            <Text className="font-sans text-xs text-text-muted text-center leading-relaxed">
              By creating an account you agree to our{' '}
              <Text className="font-osmd text-primary font-medium">Terms & Privacy Policy</Text>.
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 32 },
  input: { paddingVertical: 0 },
  heroShadow: { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  logoRing: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  cardShadow: { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  btnShadow: { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  chipShadow: { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
});
