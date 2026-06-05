import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAnalysisStore } from '@/src/store/analysisStore';

const GUIDE_ITEMS = [
  { icon: '🪪', text: '기준 카드를 음식 옆에 놓고 찍어주세요.' },
  { icon: '📐', text: '음식과 기준 카드가 모두 화면 안에 들어와야 해요.' },
  { icon: '📷', text: '음식의 높이가 보이도록 살짝 비스듬히 찍으면 더 좋아요.' },
  { icon: '✏️', text: '사진 기반 추정값이라 결과는 수정할 수 있어요.' },
];

export default function CameraScreen() {
  const router = useRouter();
  const { setImageUri, reset } = useAnalysisStore();

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 사용을 위해 권한이 필요합니다.\n설정에서 카메라 권한을 허용해주세요.');
      return;
    }
    const picked = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!picked.canceled && picked.assets[0]) {
      reset();
      setImageUri(picked.assets[0].uri);
      router.push('/meal/preview');
    }
  };

  const handleGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근을 위해 권한이 필요합니다.\n설정에서 사진 권한을 허용해주세요.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!picked.canceled && picked.assets[0]) {
      reset();
      setImageUri(picked.assets[0].uri);
      router.push('/meal/preview');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>사진으로 칼로리 기록</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🤖 Mock AI — Phase 3</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>촬영 가이드</Text>
          {GUIDE_ITEMS.map((item, i) => (
            <View key={i} style={styles.guideItem}>
              <Text style={styles.guideIcon}>{item.icon}</Text>
              <Text style={styles.guideText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>기준 물체</Text>
          <View style={styles.refChipRow}>
            <View style={styles.refChipSelected}>
              <Text style={styles.refChipTextSelected}>💳 신용카드 (기본값)</Text>
            </View>
          </View>
          <Text style={styles.refNote}>
            기준 카드(신용카드)를 음식 옆에 놓으면 더 정확하게 추정할 수 있어요.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleCamera} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>📷  카메라로 촬영하기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleGallery} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>🖼  갤러리에서 선택하기</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  badge: {
    marginTop: 6, alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  badgeText: { fontSize: 12, color: '#92400E', fontWeight: '600' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 14 },
  guideItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  guideIcon: { fontSize: 18, marginRight: 10, marginTop: 1 },
  guideText: { flex: 1, fontSize: 13, color: '#4B5563', lineHeight: 20 },
  refChipRow: { flexDirection: 'row', marginBottom: 10 },
  refChipSelected: {
    backgroundColor: '#EEF2FF', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1.5, borderColor: '#6366F1',
  },
  refChipTextSelected: { fontSize: 13, color: '#6366F1', fontWeight: '600' },
  refNote: { fontSize: 12, color: '#9CA3AF', lineHeight: 18 },
  primaryBtn: {
    backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 12,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  secondaryBtnText: { color: '#374151', fontSize: 16, fontWeight: '600' },
});
