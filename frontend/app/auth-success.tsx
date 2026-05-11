import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function AuthSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; user?: string }>();

  useEffect(() => {
    const { token, user: userRaw } = params;

    if (token && userRaw) {
      try {
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
      } catch {
        router.replace('/(auth)/login');
      }
    } else {
      router.replace('/(auth)/login');
    }
  }, [params.token]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}
