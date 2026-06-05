import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useDailyStore } from '@/src/store/dailyStore';
import { FoodLogCard } from '@/src/components/FoodLogCard';
import { formatDisplayDate, isToday } from '@/src/utils/dateUtils';
import type { FoodLog } from '@/src/types';

export default function HistoryScreen() {
  const router = useRouter();
  const { allLogs, logDates, loadAllLogs, loadLogDates, goalCalories } = useDailyStore();

  useFocusEffect(
    useCallback(() => {
      loadAllLogs();
      loadLogDates();
    }, []),
  );

  const logsByDate = logDates.reduce<Record<string, FoodLog[]>>((acc, date) => {
    acc[date] = allLogs.filter((l) => l.date === date);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>식사 기록</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {logDates.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>기록된 식사가 없어요</Text>
          </View>
        ) : (
          logDates.map((date) => {
            const logs = logsByDate[date] ?? [];
            const total = logs.reduce((s, l) => s + l.userCalories, 0);
            const pct = Math.round((total / goalCalories) * 100);
            return (
              <View key={date} style={styles.dateSection}>
                <View style={styles.dateSectionHeader}>
                  <Text style={styles.dateLabel}>
                    {formatDisplayDate(date)}{isToday(date) ? ' (오늘)' : ''}
                  </Text>
                  <View style={styles.dateTotalBadge}>
                    <Text style={styles.dateTotalText}>{total} kcal</Text>
                    <Text style={styles.datePctText}> / {pct}%</Text>
                  </View>
                </View>
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
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  content: { padding: 20, paddingTop: 8 },
  dateSection: { marginBottom: 24 },
  dateSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  dateLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  dateTotalBadge: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  dateTotalText: { fontSize: 13, fontWeight: '700', color: '#6366F1' },
  datePctText: { fontSize: 11, color: '#818CF8' },
  empty: { alignItems: 'center', paddingVertical: 64 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 12 },
});
