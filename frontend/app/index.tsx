import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  // Step 1: Onboarding check — hydration ka wait nahi, foran chalao
  // Naya user hai? Seedha onboarding pe bhejo
  useEffect(() => {
    async function checkOnboarding() {
      const onboardingDone = await AsyncStorage.getItem('onboarding_done');
      if (!onboardingDone) {
        router.replace('/(onboarding)');
      }
    }
    checkOnboarding();
  }, []);

  // Step 2: Auth check — zustand hydrate hone ke baad chalao
  // Onboarding ho chuki ho tab hi login/home decide karo
  useEffect(() => {
    if (!_hasHydrated) return;
    async function checkAuth() {
      const onboardingDone = await AsyncStorage.getItem('onboarding_done');
      if (!onboardingDone) return; // Step 1 already handle kar raha hai
      router.replace(user ? '/(main)/home' : '/(auth)/login');
    }
    checkAuth();
  }, [_hasHydrated]);

  return null;
}
