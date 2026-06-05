import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDailyStore } from '@/src/store/dailyStore';
import { getLogById } from '@/src/db/queries/foodLogs';
import { MealTypeSelector } from '@/src/components/MealTypeSelector';
import type { FoodLog, MealType } from '@/src/types';

export default function EditMealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { editLog, removeLog } = useDailyStore();

  const [log, setLog] = useState<FoodLog | null>(null);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      getLogById(id).then((found) => {
        if (found) {
          setLog(found);
          setFoodName(found.foodName);
          setCalories(String(found.userCalories));
          setMealType(found.mealType);
          setNotes(found.notes ?? '');
        }
      });
    }
  }, [id]);

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
    if (!id) return;
    setIsSaving(true);
    try {
      await editLog(id, {
        foodName: foodName.trim(),
        userCalories: cal,
        mealType,
        notes: notes.trim() || null,
        userEdited: true,
      });
      router.back();
    } catch {
      Alert.alert('오류', '저장 중 문제가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '삭제 확인',
      `'${foodName}' 기록을 삭제할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제', style: 'destructive',
          onPress: async () => {
            if (id) {
              await removeLog(id);
              router.back();
            }
          },
        },
      ],
    );
  };

  if (!log) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          {log.aiReasoningSummary && (
            <View style={styles.aiNote}>
              <Text style={styles.aiNoteLabel}>🤖 AI 분석 메모</Text>
              <Text style={styles.aiNoteText}>{log.aiReasoningSummary}</Text>
              {log.uncertaintyNote && (
                <Text style={styles.uncertaintyText}>⚠️ {log.uncertaintyNote}</Text>
              )}
            </View>
          )}

          <Text style={styles.label}>음식 이름 *</Text>
          <TextInput style={styles.input} value={foodName} onChangeText={setFoodName} placeholder="음식 이름" placeholderTextColor="#9CA3AF" />

          <Text style={styles.label}>칼로리 *</Text>
          <View style={styles.inputRow}>
            <TextInput style={[styles.input, styles.flex1]} value={calories} onChangeText={setCalories} keyboardType="numeric" placeholder="칼로리" placeholderTextColor="#9CA3AF" />
            <Text style={styles.unit}>kcal</Text>
          </View>
          {log.estimatedCalories !== log.userCalories && (
            <Text style={styles.aiCalorieHint}>AI 추정: {log.estimatedCalories} kcal</Text>
          )}

          <Text style={styles.label}>식사 종류</Text>
          <MealTypeSelector value={mealType} onChange={setMealType} />

          <Text style={styles.label}>메모</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="메모 (선택)"
            placeholderTextColor="#9CA3AF"
            multiline
          />

          <TouchableOpacity style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]} onPress={handleSave} disabled={isSaving}>
            <Text style={styles.saveBtnText}>{isSaving ? '저장 중...' : '수정 저장'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>🗑 이 기록 삭제</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#9CA3AF' },
  content: { padding: 20 },
  aiNote: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#BBF7D0' },
  aiNoteLabel: { fontSize: 12, fontWeight: '700', color: '#16A34A', marginBottom: 4 },
  aiNoteText: { fontSize: 13, color: '#166534' },
  uncertaintyText: { fontSize: 12, color: '#D97706', marginTop: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 18, marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: '#1F2937', borderWidth: 1, borderColor: '#E5E7EB' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex1: { flex: 1 },
  unit: { fontSize: 15, color: '#6B7280' },
  aiCalorieHint: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  saveBtnDisabled: { backgroundColor: '#A5B4FC' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  deleteBtn: { marginTop: 12, paddingVertical: 14, alignItems: 'center' },
  deleteBtnText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
});
