import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useDailyStore } from '@/src/store/dailyStore';
import { useProfileStore } from '@/src/store/profileStore';
import { CalorieRing } from '@/src/components/CalorieRing';
import { FoodLogCard } from '@/src/components/FoodLogCard';
import { formatDisplayDate, getTodayString } from '@/src/utils/dateUtils';
import type { MealType } from '@/src/types';

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'unknown'];
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '아침', lunch: '점심', dinner: '저녁', snack: '간식', unknown: '기타',
};

function getStatusMessage(remaining: number, goal: number): { text: string; color: string } {
  if (remaining < 0) return { text: `목표 ${Math.abs(remaining)}kcal 초과 🚨`, color: '#EF4444' };
  if (remaining < goal * 0.1) return { text: '목표 칼로리에 거의 도달했어요 ⚠️', color: '#F59E0B' };
  if (remaining < 300) return { text: `오늘 ${remaining}kcal 남았어요`, color: '#F59E0B' };
  return { text: `오늘 ${remaining}kcal 더 드실 수 있어요 👍`, color: '#10B981' };
}

export default function HomeScreen() {
  const router = useRouter();
  const { todayLogs, loadToday, isLoading, getTodaySummary } = useDailyStore();
  const { profile } = useProfileStore();

  useFocusEffect(
    useCallback(() => {
      loadToday();
    }, []),
  );

  const summary = getTodaySummary();
  const statusMsg = getStatusMessage(summary.remainingCalories, summary.goalCalories);

  const groupedByMeal = MEAL_ORDER.reduce<Record<MealType, typeof todayLogs>>((acc, type) => {
    acc[type] = todayLogs.filter((l) => l.mealType === type);
    return acc;
  }, { breakfast: [], lunch: [], dinner: [], snack: [], unknown: [] });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadToday} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>안녕하세요{profile ? '' : ''} 👋</Text>
          <Text style={styles.date}>{formatDisplayDate(getTodayString())}</Text>
        </View>

        {/* Calorie Ring */}
        <View style={styles.ringCard}>
          <CalorieRing consumed={summary.totalCalories} goal={summary.goalCalories} size={200} />
          <View style={styles.goalRow}>
            <Text style={styles.goalText}>목표 {summary.goalCalories} kcal</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusMsg.color + '18' }]}>
            <Text style={[styles.statusText, { color: statusMsg.color }]}>{statusMsg.text}</Text>
          </View>

          {/* Macro summary row */}
          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{summary.totalCalories}</Text>
              <Text style={styles.macroLabel}>섭취</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{summary.goalCalories}</Text>
              <Text style={styles.macroLabel}>목표</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: summary.remainingCalories < 0 ? '#EF4444' : '#6366F1' }]}>
                {summary.remainingCalories < 0 ? `+${Math.abs(summary.remainingCalories)}` : summary.remainingCalories}
              </Text>
              <Text style={styles.macroLabel}>{summary.remainingCalories < 0 ? '초과' : '남음'}</Text>
            </View>
          </View>
        </View>

        {/* Meals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘 식사 기록</Text>
          <Text style={styles.mealCount}>{summary.mealCount}개</Text>
        </View>

        {todayLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>아직 기록된 식사가 없어요</Text>
            <Text style={styles.emptySubtext}>오늘 드신 음식을 기록해보세요</Text>
          </View>
        ) : (
          MEAL_ORDER.map((mealType) => {
            const logs = groupedByMeal[mealType];
            if (logs.length === 0) return null;
            return (
              <View key={mealType}>
                <Text style={styles.mealGroupLabel}>{MEAL_LABELS[mealType]}</Text>
                {logs.map((log) => (
                  <FoodLogCard
                    key={log.id}
                    log={log}
                    onPress={() => router.push(`/meal/${log.id}`)}
                  />
                ))}
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/meal/add-manual')}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>+ 기록하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  date: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  ringCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  goalRow: { marginTop: 10 },
  goalText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  statusBadge: { marginTop: 12, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  statusText: { fontSize: 13, fontWeight: '600' },
  macroRow: { flexDirection: 'row', width: '100%', marginTop: 18, paddingTop: 18, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  macroItem: { flex: 1, alignItems: 'center' },
  macroValue: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  macroLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  macroDivider: { width: 1, backgroundColor: '#F3F4F6' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  mealCount: { fontSize: 13, color: '#9CA3AF' },
  mealGroupLabel: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', marginBottom: 6, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 12 },
  emptySubtext: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  fabContainer: { position: 'absolute', bottom: 90, left: 20, right: 20 },
  fab: { backgroundColor: '#6366F1', borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  fabText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
