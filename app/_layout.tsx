import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { initDB } from '@/src/db/client';
import { useProfileStore } from '@/src/store/profileStore';
import { useDailyStore } from '@/src/store/dailyStore';
import { StatusBar } from 'expo-status-bar';

function InitialLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { profile, isLoading, loadProfile } = useProfileStore();
  const { setGoalCalories } = useDailyStore();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      await initDB();
      await loadProfile();
      setDbReady(true);
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (!dbReady || isLoading) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!profile && !inOnboarding) {
      router.replace('/onboarding');
    } else if (profile && inOnboarding) {
      setGoalCalories(profile.dailyCalorieTarget);
      router.replace('/(tabs)');
    } else if (profile) {
      setGoalCalories(profile.dailyCalorieTarget);
    }
  }, [dbReady, isLoading, profile]);

  if (!dbReady || isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding/index" />
        <Stack.Screen
          name="meal/add-manual"
          options={{ headerShown: true, title: '식사 추가', headerBackTitle: '' }}
        />
        <Stack.Screen
          name="meal/[id]"
          options={{ headerShown: true, title: '식사 수정', headerBackTitle: '' }}
        />
        <Stack.Screen
          name="meal/camera"
          options={{ headerShown: true, title: '사진으로 기록', headerBackTitle: '' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return <InitialLayout />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
});
