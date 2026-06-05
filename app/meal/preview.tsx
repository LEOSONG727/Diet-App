import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAnalysisStore } from '@/src/store/analysisStore';

export default function PreviewScreen() {
  const router = useRouter();
  const { imageUri } = useAnalysisStore();

  if (!imageUri) {
    router.replace('/meal/camera');
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>사진 확인</Text>
        <Text style={styles.subtitle}>이 사진으로 분석을 시작할까요?</Text>

        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        </View>

        <View style={styles.refCard}>
          <View style={styles.refRow}>
            <Text style={styles.refLabel}>기준 물체</Text>
            <View style={styles.refBadge}>
              <Text style={styles.refBadgeText}>💳 신용카드</Text>
            </View>
          </View>
          <Text style={styles.refNote}>
            ⚠️  기준 카드가 보이지 않으면 정확도가 낮아질 수 있어요.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/meal/analyzing')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>이 사진으로 분석하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>다시 찍기</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  imageContainer: {
    borderRadius: 16, overflow: 'hidden', marginBottom: 16,
    aspectRatio: 4 / 3, backgroundColor: '#E5E7EB',
  },
  image: { width: '100%', height: '100%' },
  refCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB',
  },
  refRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 8,
  },
  refLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  refBadge: {
    backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  refBadgeText: { fontSize: 12, color: '#6366F1', fontWeight: '600' },
  refNote: { fontSize: 12, color: '#B45309', lineHeight: 18 },
  primaryBtn: {
    backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 12,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  secondaryBtnText: { color: '#374151', fontSize: 15, fontWeight: '600' },
});
