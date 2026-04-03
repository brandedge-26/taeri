import { colors } from '@/constants/theme';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import '../global.css';

SplashScreen.preventAutoHideAsync();

function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(textTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(900),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.splash, { opacity: screenOpacity }]}>
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        TAERI
      </Animated.Text>
    </Animated.View>
  );
}

export default function RootLayout() {

  const [showSplash, setShowSplash] = useState(true);

  const [loaded, error] = useFonts({
    'OSans-Regular': require('../assets/fonts/OSans-Regular.ttf'),
    'OSans-Medium': require('../assets/fonts/OSans-Medium.ttf'),
    'OSans-Bold': require('../assets/fonts/OSans-Bold.ttf'),
    'OSans-Light': require('../assets/fonts/OSans-Light.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      />
      <StatusBar style="dark" />

      {showSplash && (
        <AnimatedSplash onFinish={() => setShowSplash(false)} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  title: {
    fontFamily: 'OSans-Bold',
    fontSize: 52,
    color: '#fff',
    letterSpacing: -3,
  },
});
