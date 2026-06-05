import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function CameraPlaceholder() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.title}>사진으로 기록</Text>
        <Text style={styles.subtitle}>Phase 3에서 구현 예정</Text>
        <Text style={styles.desc}>
          카메라로 음식 사진을 찍으면{'\n'}
          AI가 칼로리를 자동으로 분석해드립니다.{'\n\n'}
          신용카드 크기의 기준 물체를{'\n'}
          함께 촬영하면 더 정확하게 분석됩니다.
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🚧  Camera + Mock AI — Phase 3</Text>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  icon: { fontSize: 64 },
  title: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginTop: 16 },
  subtitle: { fontSize: 15, color: '#6366F1', fontWeight: '600', marginTop: 4 },
  desc: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginTop: 20 },
  badge: { backgroundColor: '#FEF3C7', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, marginTop: 24 },
  badgeText: { fontSize: 13, color: '#92400E', fontWeight: '600' },
  backBtn: { marginTop: 32, backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40 },
  backBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
