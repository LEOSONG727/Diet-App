import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/src/store/profileStore';
import { useDailyStore } from '@/src/store/dailyStore';
import { computeCalorieTarget } from '@/src/utils/bmrCalculator';
import type { ActivityLevel, GoalType, Gender } from '@/src/types';

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'low', label: '낮음', desc: '거의 운동 안 함' },
  { value: 'moderate', label: '보통', desc: '주 3~5회 운동' },
  { value: 'high', label: '높음', desc: '매일 강도 높은 운동' },
];

const GOAL_OPTIONS: { value: GoalType; label: string; desc: string }[] = [
  { value: 'maintain', label: '유지', desc: '현재 체중 유지' },
  { value: 'lose', label: '감량', desc: '체중 감량 (-500kcal)' },
  { value: 'gain', label: '증량', desc: '체중 증량 (+300kcal)' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { createProfile } = useProfileStore();
  const { setGoalCalories } = useDailyStore();

  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goalType, setGoalType] = useState<GoalType>('maintain');
  const [manualTarget, setManualTarget] = useState('');
  const [isManual, setIsManual] = useState(false);

  const computedTarget = useCallback(() => {
    const a = parseInt(age, 10);
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (!a || !h || !w || isNaN(a) || isNaN(h) || isNaN(w)) return null;
    return computeCalorieTarget(gender, a, w, h, activityLevel, goalType);
  }, [age, gender, heightCm, weightKg, activityLevel, goalType]);

  const target = isManual ? (parseInt(manualTarget, 10) || null) : computedTarget();

  const handleSave = async () => {
    const a = parseInt(age, 10);
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);

    if (!a || !h || !w || isNaN(a) || isNaN(h) || isNaN(w)) {
      Alert.alert('입력 오류', '나이, 키, 몸무게를 모두 입력해주세요.');
      return;
    }
    if (a < 10 || a > 120) { Alert.alert('입력 오류', '유효한 나이를 입력해주세요.'); return; }
    if (h < 100 || h > 250) { Alert.alert('입력 오류', '유효한 키를 입력해주세요 (cm).'); return; }
    if (w < 20 || w > 300) { Alert.alert('입력 오류', '유효한 몸무게를 입력해주세요 (kg).'); return; }

    const finalTarget = isManual
      ? Math.max(1000, Math.min(4000, parseInt(manualTarget, 10) || 2000))
      : (computedTarget() ?? 2000);

    await createProfile({
      age: a,
      gender,
      heightCm: h,
      weightKg: w,
      activityLevel,
      goalType,
      dailyCalorieTarget: finalTarget,
      isTargetManuallySet: isManual,
    });
    setGoalCalories(finalTarget);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>프로필 설정</Text>
        <Text style={styles.subtitle}>목표 칼로리를 계산하기 위한 정보를 입력해주세요</Text>

        {/* 성별 */}
        <Text style={styles.label}>성별</Text>
        <View style={styles.row}>
          {(['male', 'female'] as Gender[]).map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.chip, gender === g && styles.chipSelected]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.chipText, gender === g && styles.chipTextSelected]}>
                {g === 'male' ? '남성' : '여성'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 나이/키/몸무게 */}
        {[
          { label: '나이', value: age, setter: setAge, placeholder: '예: 30', unit: '세', keyboardType: 'numeric' as const },
          { label: '키', value: heightCm, setter: setHeightCm, placeholder: '예: 170', unit: 'cm', keyboardType: 'decimal-pad' as const },
          { label: '몸무게', value: weightKg, setter: setWeightKg, placeholder: '예: 70', unit: 'kg', keyboardType: 'decimal-pad' as const },
        ].map(({ label, value, setter, placeholder, unit, keyboardType }) => (
          <View key={label}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={value}
                onChangeText={setter}
                placeholder={placeholder}
                keyboardType={keyboardType}
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.unit}>{unit}</Text>
            </View>
          </View>
        ))}

        {/* 활동량 */}
        <Text style={styles.label}>활동량</Text>
        {ACTIVITY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.optionCard, activityLevel === opt.value && styles.optionCardSelected]}
            onPress={() => setActivityLevel(opt.value)}
          >
            <Text style={[styles.optionTitle, activityLevel === opt.value && styles.optionTitleSelected]}>
              {opt.label}
            </Text>
            <Text style={styles.optionDesc}>{opt.desc}</Text>
          </TouchableOpacity>
        ))}

        {/* 목표 */}
        <Text style={styles.label}>목표</Text>
        {GOAL_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.optionCard, goalType === opt.value && styles.optionCardSelected]}
            onPress={() => setGoalType(opt.value)}
          >
            <Text style={[styles.optionTitle, goalType === opt.value && styles.optionTitleSelected]}>
              {opt.label}
            </Text>
            <Text style={styles.optionDesc}>{opt.desc}</Text>
          </TouchableOpacity>
        ))}

        {/* 계산된 목표 칼로리 */}
        <View style={styles.targetBox}>
          <Text style={styles.targetLabel}>계산된 목표 칼로리</Text>
          <Text style={styles.targetValue}>
            {target != null ? `${target} kcal / 일` : '정보를 입력해주세요'}
          </Text>
          <TouchableOpacity onPress={() => { setIsManual(!isManual); if (!isManual && target) setManualTarget(String(target)); }}>
            <Text style={styles.manualToggle}>{isManual ? '자동 계산으로 되돌리기' : '직접 수정하기'}</Text>
          </TouchableOpacity>
          {isManual && (
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={manualTarget}
                onChangeText={setManualTarget}
                placeholder="예: 1800"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.unit}>kcal</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>시작하기</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#1F2937', marginTop: 48, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  row: { flexDirection: 'row', gap: 10 },
  chip: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  chipSelected: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  chipText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  chipTextSelected: { color: '#6366F1', fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: '#1F2937', borderWidth: 1, borderColor: '#E5E7EB' },
  inputFlex: { flex: 1 },
  unit: { fontSize: 14, color: '#6B7280', fontWeight: '500', minWidth: 28 },
  optionCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: '#E5E7EB' },
  optionCardSelected: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  optionTitle: { fontSize: 15, fontWeight: '600', color: '#374151' },
  optionTitleSelected: { color: '#6366F1' },
  optionDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  targetBox: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, marginTop: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  targetLabel: { fontSize: 13, color: '#6B7280' },
  targetValue: { fontSize: 28, fontWeight: '700', color: '#6366F1', marginTop: 4, marginBottom: 10 },
  manualToggle: { fontSize: 13, color: '#6366F1', fontWeight: '600', marginBottom: 10 },
  saveBtn: { backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
