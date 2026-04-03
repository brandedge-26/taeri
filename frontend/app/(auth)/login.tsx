import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
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

const API_BASE = 'https://ivelisse-pocky-weightily.ngrok-free.dev/api';

export default function LoginScreen() {

  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const isValid = email.trim() && password.length >= 6;

  async function handleGoogleLogin() {
    const redirectUrl = Linking.createURL('auth-success');
    const result = await WebBrowser.openAuthSessionAsync(
      `${API_BASE}/auth/google?ngrok-skip-browser-warning=true`,
      redirectUrl
    );

    if (result.type === 'success' && result.url) {
      const parsed = Linking.parse(result.url);
      const token = parsed.queryParams?.token as string | undefined;
      const userRaw = parsed.queryParams?.user as string | undefined;

      if (token && userRaw) {
        const raw = JSON.parse(decodeURIComponent(userRaw));
        const user = {
          userId: raw._id,
          name: raw.name,
          email: raw.email,
          profilePicture: raw.avatar ?? null,
          age: raw.age ?? 0,
        };
        useAuthStore.setState({ accessToken: token, user });
        router.replace('/(main)/home');
      }
    }
  }

  async function handleLogin() {
    if (!isValid || isLoading) return;
    clearError();
    const success = await login(email.trim().toLowerCase(), password);
    if (success) {
      router.replace('/(main)/home');
    }
  }

  function fieldClass(field: 'email' | 'password') {
    const focused = focusedField === field;
    return `flex-row items-center rounded-lg px-4 py-3 mb-4 border-2 ${focused ? 'border-primary bg-gray-50' : 'border-gray-200 bg-gray-100'
      }`;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Blue hero header ── */}
          <View className="bg-primary items-center pt-10 pb-14 px-6 rounded-b-[48px]" style={styles.heroShadow}>
            {/* Logo ring */}
            <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-4" style={styles.logoRing}>
              <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
                <Text className="text-3xl text-primary font-osbd">T</Text>
              </View>
            </View>
            <Text className="text-3xl text-white tracking-widest mb-1 font-osbd">TAERI</Text>
            <Text className="text-sm text-primary-200 text-center font-osbd">
              Protect your independence, every day
            </Text>
          </View>

          {/* ── Form card ── */}
          <View className="mx-5 -mt-6 bg-white rounded-3xl p-6" style={styles.cardShadow}>

            <Text className="text-2xl text-text font-osbd">Welcome back</Text>
            <Text className="text-md text-text-secondary mb-6 font-osmd">Sign in to your account</Text>

            {/* Email */}
            <View className={fieldClass('email')}>

              <View className="w-8 h-8 rounded-sm items-center justify-center mr-3">
                <Ionicons name="mail-outline" size={17} color="#2563EB" />
              </View>

              <TextInput
                style={styles.input}
                className="flex-1 text-md text-text font-osmd"
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
              {email.length > 0 && (
                <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
              )}
            </View>

            {/* Password */}
            <View className={fieldClass('password')}>

              <View className="w-8 h-8 rounded-sm items-center justify-center mr-3">
                <Ionicons name="lock-closed-outline" size={17} color="#2563EB" />
              </View>

              <TextInput
                style={styles.input}
                className="flex-1 text-md text-text font-osmd"
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot password */}
            <TouchableOpacity className="self-end -mt-2 mb-6" onPress={() => router.push('/(auth)/forgot-password')}>
              <Text className="text-sm font-semibold text-primary font-osbd">Forgot password?</Text>
            </TouchableOpacity>

            {/* Error message */}
            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <Text className="font-osmd text-sm text-red-600">{error}</Text>
              </View>
            ) : null}

            {/* Login button */}
            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.86}
              disabled={!isValid || isLoading}
              className={`rounded-lg py-4 items-center flex-row justify-center gap-2 ${isValid && !isLoading ? 'bg-primary' : 'bg-primary-300'}`}
              style={isValid && !isLoading ? styles.btnShadow : undefined}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text className="text-lg text-white font-osbd">Login</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-5 gap-3">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="text-sm text-text-secondary font-osmd">OR</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Continue with Google */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              activeOpacity={0.86}
              className="flex-row items-center justify-center gap-3 rounded-lg py-3.5 border-2 border-gray-200 bg-white"
              style={styles.googleBtn}
            >
              <Image
                source={require('../../assets/images/google.png')}
                style={styles.googleIcon}
                resizeMode="contain"
              />
              <Text className="text-base text-text font-osbd">Continue with Google</Text>
            </TouchableOpacity>

          </View>

          {/* Sign up link */}
          <View className="flex-row justify-center items-center mt-6 mb-4 gap-1">
            <Text className="text-md text-text-secondary font-osmd">{"Don't have an account?"}</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text className="text-md text-primary font-osbd"> Sign Up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 32 },
  input: { paddingVertical: 0 },
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
  btnShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  googleBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  googleIcon: {
    width: 22,
    height: 22,
  },
});
