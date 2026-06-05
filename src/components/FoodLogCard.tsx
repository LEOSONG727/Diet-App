import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { FoodLog, MealType } from '../types';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식',
  unknown: '기타',
};

const MEAL_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
  unknown: '🍽️',
};

interface FoodLogCardProps {
  log: FoodLog;
  onPress?: () => void;
}

export function FoodLogCard({ log, onPress }: FoodLogCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <Text style={styles.icon}>{MEAL_ICONS[log.mealType]}</Text>
      </View>
      <View style={styles.middle}>
        <Text style={styles.foodName} numberOfLines={1}>{log.foodName}</Text>
        <Text style={styles.meta}>{MEAL_LABELS[log.mealType]}{log.notes ? ` · ${log.notes}` : ''}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.calories}>{log.userCalories}</Text>
        <Text style={styles.kcal}>kcal</Text>
        {log.userEdited && <Text style={styles.editedBadge}>수정됨</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  left: {
    width: 40,
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
  },
  middle: {
    flex: 1,
    paddingHorizontal: 10,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  meta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  kcal: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  editedBadge: {
    fontSize: 9,
    color: '#F59E0B',
    marginTop: 2,
  },
});
