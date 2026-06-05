import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAnalysisStore } from '@/src/store/analysisStore';
import { useDailyStore } from '@/src/store/dailyStore';
import { getTodayString } from '@/src/utils/dateUtils';
import type { MealType, ReferenceObjectType } from '@/src/types';
import type { FoodItem } from '@/src/ai/types';

const MEAL_LABELS: Record<string, string> = {
  breakfast: '아침', lunch: '점심', dinner: '저녁', snack: '간식',
};

type EditableFoodItem = FoodItem & {
  editedName: string;
  editedWeightG: string;
  editedCaloriesKcal: string;
  isEditing: boolean;
};

export default function ResultScreen() {
  const router = useRouter();
  const { imageUri, result, reset } = useAnalysisStore();
  const { addLog } = useDailyStore();

  const [isSaving, setIsSaving] = useState(false);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [userEdited, setUserEdited] = useState(false);

  const [editableItems, setEditableItems] = useState<EditableFoodItem[]>(() =>
    (result?.foods ?? []).map((f) => ({
      ...f,
      editedName: f.name,
      editedWeightG: String(f.estimatedWeightG),
      editedCaloriesKcal: String(f.estimatedCaloriesKcal),
      isEditing: false,
    })),
  );

  useEffect(() => {
    if (!result || !imageUri) {
      router.replace('/meal/camera');
    }
  }, [result, imageUri, router]);

  if (!result || !imageUri) {
    return null;
  }

  const totalUserCalories = editableItems.reduce(
    (sum, item) => sum + (parseInt(item.editedCaloriesKcal, 10) || 0),
    0,
  );

  const updateItem = (idx: number, field: 'editedName' | 'editedWeightG' | 'editedCaloriesKcal', value: string) => {
    setUserEdited(true);
    setEditableItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  };

  const toggleEdit = (idx: number) => {
    setEditableItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, isEditing: !item.isEditing } : item)),
    );
  };

  const handleSave = async () => {
    if (editableItems.length === 0) {
      Alert.alert('오류', '분석된 음식이 없습니다.');
      return;
    }
    setIsSaving(true);
    try {
      const firstName = editableItems[0].editedName || result.foods[0].name;
      const foodName =
        editableItems.length === 1
          ? firstName
          : `${firstName} 외 ${editableItems.length - 1}개`;

      const totalWeightG = editableItems.reduce(
        (sum, item) => sum + (parseFloat(item.editedWeightG) || 0),
        0,
      );
      const reasonings = result.foods.map((f) => f.portionReasoning).join(' / ');

      await addLog({
        date: getTodayString(),
        mealType,
        foodName,
        estimatedCalories: result.totalCaloriesKcal,
        userCalories: totalUserCalories,
        imageUri,
        referenceObjectType: result.referenceObjectType as ReferenceObjectType,
        referenceObjectDetected: result.referenceObjectDetected,
        estimatedWeightGram: totalWeightG,
        confidence: result.overallConfidence,
        aiReasoningSummary: reasonings,
        uncertaintyNote: result.uncertaintyNote,
        userEdited,
      });

      reset();
      router.replace('/(tabs)');
    } catch {
      Alert.alert('오류', '저장 중 문제가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>분석 결과</Text>

        {/* 촬영 이미지 */}
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

        {/* 기준 카드 인식 여부 + 전체 신뢰도 */}
        <View style={styles.metaRow}>
          <View style={[
            styles.metaBadge,
            result.referenceObjectDetected ? styles.metaGreen : styles.metaYellow,
          ]}>
            <Text style={[
              styles.metaBadgeText,
              result.referenceObjectDetected ? styles.metaGreenText : styles.metaYellowText,
            ]}>
              {result.referenceObjectDetected ? '✅ 기준 카드 인식됨' : '⚠️ 기준 카드 미인식'}
            </Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>
              신뢰도 {Math.round(result.overallConfidence * 100)}%
            </Text>
          </View>
        </View>

        {/* 음식별 결과 */}
        <Text style={styles.sectionLabel}>인식된 음식</Text>
        {editableItems.map((item, idx) => (
          <View key={idx} style={styles.foodCard}>
            <View style={styles.foodCardHeader}>
              {item.isEditing ? (
                <TextInput
                  style={styles.editNameInput}
                  value={item.editedName}
                  onChangeText={(v) => updateItem(idx, 'editedName', v)}
                  placeholder="음식 이름"
                  placeholderTextColor="#9CA3AF"
                />
              ) : (
                <Text style={styles.foodName}>{item.editedName}</Text>
              )}
              <TouchableOpacity onPress={() => toggleEdit(idx)}>
                <Text style={styles.editToggleBtn}>{item.isEditing ? '완료' : '수정'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              {/* 중량 */}
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>중량</Text>
                {item.isEditing ? (
                  <View style={styles.statEditRow}>
                    <TextInput
                      style={styles.statInput}
                      value={item.editedWeightG}
                      onChangeText={(v) => updateItem(idx, 'editedWeightG', v)}
                      keyboardType="numeric"
                    />
                    <Text style={styles.statUnit}>g</Text>
                  </View>
                ) : (
                  <Text style={styles.statValue}>{item.editedWeightG}g</Text>
                )}
              </View>
              <View style={styles.statDivider} />
              {/* 칼로리 */}
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>칼로리</Text>
                {item.isEditing ? (
                  <View style={styles.statEditRow}>
                    <TextInput
                      style={[styles.statInput, styles.statInputCalorie]}
                      value={item.editedCaloriesKcal}
                      onChangeText={(v) => updateItem(idx, 'editedCaloriesKcal', v)}
                      keyboardType="numeric"
                    />
                    <Text style={styles.statUnit}>kcal</Text>
                  </View>
                ) : (
                  <Text style={[styles.statValue, styles.calorieText]}>
                    {item.editedCaloriesKcal} kcal
                  </Text>
                )}
              </View>
              <View style={styles.statDivider} />
              {/* 신뢰도 */}
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>신뢰도</Text>
                <Text style={styles.statValue}>{Math.round(item.confidence * 100)}%</Text>
              </View>
            </View>

            <View style={styles.reasoningBox}>
              <Text style={styles.reasoningText}>💡 {item.portionReasoning}</Text>
            </View>
          </View>
        ))}

        {/* 불확실성 메모 */}
        <View style={styles.uncertaintyCard}>
          <Text style={styles.uncertaintyText}>⚠️  {result.uncertaintyNote}</Text>
        </View>

        {/* 최종 칼로리 합계 */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>최종 칼로리 합계</Text>
          <Text style={styles.totalValue}>{totalUserCalories} kcal</Text>
          {userEdited && (
            <Text style={styles.editedNote}>
              수정됨 · AI 추정: {result.totalCaloriesKcal} kcal
            </Text>
          )}
        </View>

        {/* 식사 종류 선택 */}
        <Text style={styles.sectionLabel}>식사 종류</Text>
        <View style={styles.mealTypeRow}>
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.mealChip, mealType === m && styles.mealChipSelected]}
              onPress={() => setMealType(m)}
            >
              <Text style={[styles.mealChipText, mealType === m && styles.mealChipTextSelected]}>
                {MEAL_LABELS[m]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? '저장 중...' : '오늘 기록에 추가하기'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => { reset(); router.replace('/meal/camera'); }}
        >
          <Text style={styles.cancelBtnText}>다시 찍기</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 14 },
  image: {
    width: '100%', height: 200, borderRadius: 14,
    marginBottom: 14, backgroundColor: '#E5E7EB',
  },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  metaBadge: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#F3F4F6',
  },
  metaGreen: { backgroundColor: '#D1FAE5' },
  metaYellow: { backgroundColor: '#FEF3C7' },
  metaBadgeText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  metaGreenText: { color: '#065F46' },
  metaYellowText: { color: '#92400E' },
  sectionLabel: {
    fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10, marginTop: 4,
  },
  foodCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  foodCardHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  foodName: { fontSize: 16, fontWeight: '700', color: '#1F2937', flex: 1 },
  editNameInput: {
    flex: 1, fontSize: 16, fontWeight: '700', color: '#1F2937',
    borderBottomWidth: 1.5, borderColor: '#6366F1', paddingVertical: 2, paddingHorizontal: 0,
  },
  editToggleBtn: { fontSize: 13, color: '#6366F1', fontWeight: '600', marginLeft: 12 },
  statsRow: { flexDirection: 'row', marginBottom: 12 },
  statCell: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  calorieText: { color: '#6366F1' },
  statEditRow: { flexDirection: 'row', alignItems: 'center' },
  statInput: {
    fontSize: 15, fontWeight: '700', color: '#1F2937',
    borderBottomWidth: 1, borderColor: '#D1D5DB',
    minWidth: 44, textAlign: 'center', paddingVertical: 0,
  },
  statInputCalorie: { color: '#6366F1', borderColor: '#6366F1' },
  statUnit: { fontSize: 11, color: '#9CA3AF', marginLeft: 2 },
  statDivider: { width: 1, backgroundColor: '#F3F4F6' },
  reasoningBox: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10 },
  reasoningText: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  uncertaintyCard: {
    backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A',
  },
  uncertaintyText: { fontSize: 12, color: '#92400E', lineHeight: 18 },
  totalCard: {
    backgroundColor: '#EEF2FF', borderRadius: 14, padding: 18,
    alignItems: 'center', marginBottom: 20,
  },
  totalLabel: { fontSize: 13, color: '#818CF8', fontWeight: '600' },
  totalValue: { fontSize: 34, fontWeight: '800', color: '#6366F1', marginTop: 4 },
  editedNote: { fontSize: 11, color: '#9CA3AF', marginTop: 6 },
  mealTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  mealChip: {
    flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F3F4F6',
    alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent',
  },
  mealChipSelected: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  mealChipText: { fontSize: 13, color: '#6B7280' },
  mealChipTextSelected: { color: '#6366F1', fontWeight: '700' },
  saveBtn: {
    backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 10,
  },
  saveBtnDisabled: { backgroundColor: '#A5B4FC' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cancelBtn: { paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: '#9CA3AF' },
});
