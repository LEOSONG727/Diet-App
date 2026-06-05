import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAnalysisStore } from '@/src/store/analysisStore';
import { MockFoodVisionAnalyzer } from '@/src/ai/mock.analyzer';

const analyzer = new MockFoodVisionAnalyzer();

export default function AnalyzingScreen() {
  const router = useRouter();
  const { imageUri, referenceObjectType, setResult } = useAnalysisStore();

  useEffect(() => {
    if (!imageUri) {
      router.replace('/meal/camera');
      return;
    }
    analyzer
      .analyzeFoodImage({ imageUri, referenceObjectType })
      .then((result) => {
        setResult(result);
        router.replace('/meal/result');
      })
      .catch(() => {
        router.replace('/meal/camera');
      });
  // Run only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366F1" />
      <Text style={styles.title}>분석 중...</Text>
      <Text style={styles.subtitle}>
        음식과 기준 카드를 비교해 칼로리를 추정 중입니다
      </Text>
      <Text style={styles.note}>
        사진 기반 추정값이므로 결과는 수정할 수 있어요
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F9FAFB', padding: 32,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginTop: 24, marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  note: { fontSize: 12, color: '#9CA3AF', marginTop: 10, textAlign: 'center' },
});
