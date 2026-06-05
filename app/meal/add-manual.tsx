import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDailyStore } from '@/src/store/dailyStore';
import { MealTypeSelector } from '@/src/components/MealTypeSelector';
import { getTodayString } from '@/src/utils/dateUtils';
import type { MealType } from '@/src/types';

export default function AddManualScreen() {
  const router = useRouter();
  const { addLog } = useDailyStore();

  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!foodName.trim()) {
      Alert.alert('입력 오류', '음식 이름을 입력해주세요.');
      return;
    }
    const cal = parseInt(calories, 10);
    if (!cal || isNaN(cal) || cal <= 0) {
      Alert.alert('입력 오류', '유효한 칼로리를 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await addLog({
        date: getTodayString(),
        mealType,
        foodName: foodName.trim(),
        estimatedCalories: cal,
        userCalories: cal,
        notes: notes.trim() || null,
        userEdited: false,
      });
      router.back();
    } catch {
      Alert.alert('오류', '저장 중 문제가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>음식 이름 *</Text>
          <TextInput
            style={styles.input}
            value={foodName}
            onChangeText={setFoodName}
            placeholder="예: 된장찌개"
            placeholderTextColor="#9CA3AF"
            autoFocus
          />

          <Text style={styles.label}>칼로리 *</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.flex1]}
              value={calories}
              onChangeText={setCalories}
              placeholder="예: 450"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.unit}>kcal</Text>
          </View>

          <Text style={styles.label}>식사 종류</Text>
          <MealTypeSelector value={mealType} onChange={setMealType} />

          <Text style={styles.label}>메모 (선택)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="예: 국물 많이 먹음"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveBtnText}>{isSaving ? '저장 중...' : '기록하기'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 18, marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: '#1F2937', borderWidth: 1, borderColor: '#E5E7EB' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex1: { flex: 1 },
  unit: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 32 },
  saveBtnDisabled: { backgroundColor: '#A5B4FC' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
