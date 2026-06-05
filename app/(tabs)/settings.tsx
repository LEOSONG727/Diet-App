import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert, Switch,
} from 'react-native';
import { useProfileStore } from '@/src/store/profileStore';
import { useDailyStore } from '@/src/store/dailyStore';
import { computeCalorieTarget } from '@/src/utils/bmrCalculator';
import type { ActivityLevel, GoalType, Gender } from '@/src/types';

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'low', label: '낮음' },
  { value: 'moderate', label: '보통' },
  { value: 'high', label: '높음' },
];

const GOAL_OPTIONS: { value: GoalType; label: string }[] = [
  { value: 'maintain', label: '유지' },
  { value: 'lose', label: '감량' },
  { value: 'gain', label: '증량' },
];

export default function SettingsScreen() {
  const { profile, updateProfile, setManualTarget, recomputeTarget } = useProfileStore();
  const { setGoalCalories } = useDailyStore();

  const [age, setAge] = useState(profile ? String(profile.age) : '');
  const [gender, setGender] = useState<Gender>(profile?.gender ?? 'male');
  const [heightCm, setHeightCm] = useState(profile ? String(profile.heightCm) : '');
  const [weightKg, setWeightKg] = useState(profile ? String(profile.weightKg) : '');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel ?? 'moderate');
  const [goalType, setGoalType] = useState<GoalType>(profile?.goalType ?? 'maintain');
  const [isManualTarget, setIsManualTarget] = useState(profile?.isTargetManuallySet ?? false);
  const [manualTargetStr, setManualTargetStr] = useState(profile ? String(profile.dailyCalorieTarget) : '2000');

  useEffect(() => {
    if (profile) {
      setAge(String(profile.age));
      setGender(profile.gender);
      setHeightCm(String(profile.heightCm));
      setWeightKg(String(profile.weightKg));
      setActivityLevel(profile.activityLevel);
      setGoalType(profile.goalType);
      setIsManualTarget(profile.isTargetManuallySet);
      setManualTargetStr(String(profile.dailyCalorieTarget));
    }
  }, [profile]);

  const computedTarget = () => {
    const a = parseInt(age, 10);
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (!a || !h || !w) return profile?.dailyCalorieTarget ?? 2000;
    return computeCalorieTarget(gender, a, w, h, activityLevel, goalType);
  };

  const handleSave = async () => {
    const a = parseInt(age, 10);
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (!a || !h || !w) {
      Alert.alert('입력 오류', '모든 필드를 올바르게 입력해주세요.');
      return;
    }
    await updateProfile({ age: a, gender, heightCm: h, weightKg: w, activityLevel, goalType });

    if (isManualTarget) {
      const t = parseInt(manualTargetStr, 10);
      if (t >= 1000 && t <= 4000) {
        await setManualTarget(t);
        setGoalCalories(t);
      }
    } else {
      await recomputeTarget();
      const t = computeCalorieTarget(gender, a, w, h, activityLevel, goalType);
      setGoalCalories(t);
    }
    Alert.alert('저장 완료', '프로필이 업데이트되었습니다.');
  };

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>설정</Text>

        <Text style={styles.sectionTitle}>프로필</Text>

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

        {[
          { label: '나이', value: age, setter: setAge, unit: '세', kbType: 'numeric' as const },
          { label: '키', value: heightCm, setter: setHeightCm, unit: 'cm', kbType: 'decimal-pad' as const },
          { label: '몸무게', value: weightKg, setter: setWeightKg, unit: 'kg', kbType: 'decimal-pad' as const },
        ].map(({ label, value, setter, unit, kbType }) => (
          <View key={label}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputRow}>
              <TextInput style={[styles.input, styles.flex1]} value={value} onChangeText={setter} keyboardType={kbType} placeholderTextColor="#9CA3AF" />
              <Text style={styles.unit}>{unit}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.label}>활동량</Text>
        <View style={styles.row}>
          {ACTIVITY_OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.value} style={[styles.chip, activityLevel === opt.value && styles.chipSelected]} onPress={() => setActivityLevel(opt.value)}>
              <Text style={[styles.chipText, activityLevel === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>목표</Text>
        <View style={styles.row}>
          {GOAL_OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.value} style={[styles.chip, goalType === opt.value && styles.chipSelected]} onPress={() => setGoalType(opt.value)}>
              <Text style={[styles.chipText, goalType === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>목표 칼로리</Text>
        <View style={styles.targetRow}>
          <Text style={styles.label}>직접 설정</Text>
          <Switch
            value={isManualTarget}
            onValueChange={(v) => { setIsManualTarget(v); if (!v) setManualTargetStr(String(computedTarget())); }}
            trackColor={{ true: '#6366F1' }}
          />
        </View>

        {isManualTarget ? (
          <View style={styles.inputRow}>
            <TextInput style={[styles.input, styles.flex1]} value={manualTargetStr} onChangeText={setManualTargetStr} keyboardType="numeric" placeholderTextColor="#9CA3AF" />
            <Text style={styles.unit}>kcal</Text>
          </View>
        ) : (
          <View style={styles.autoTarget}>
            <Text style={styles.autoTargetValue}>{computedTarget()} kcal</Text>
            <Text style={styles.autoTargetLabel}>자동 계산값</Text>
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>저장하기</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#1F2937', marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 24, marginBottom: 4, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 14, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  chipSelected: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  chipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  chipTextSelected: { color: '#6366F1', fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 16, color: '#1F2937', borderWidth: 1, borderColor: '#E5E7EB' },
  flex1: { flex: 1 },
  unit: { fontSize: 14, color: '#6B7280', minWidth: 28 },
  targetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  autoTarget: { backgroundColor: '#EEF2FF', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  autoTargetValue: { fontSize: 28, fontWeight: '700', color: '#6366F1' },
  autoTargetLabel: { fontSize: 12, color: '#818CF8', marginTop: 2 },
  saveBtn: { backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
