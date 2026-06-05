import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { MealType } from '../types';

const MEAL_OPTIONS: { type: MealType; label: string; icon: string }[] = [
  { type: 'breakfast', label: '아침', icon: '🌅' },
  { type: 'lunch', label: '점심', icon: '☀️' },
  { type: 'dinner', label: '저녁', icon: '🌙' },
  { type: 'snack', label: '간식', icon: '🍎' },
  { type: 'unknown', label: '기타', icon: '🍽️' },
];

interface MealTypeSelectorProps {
  value: MealType;
  onChange: (type: MealType) => void;
}

export function MealTypeSelector({ value, onChange }: MealTypeSelectorProps) {
  return (
    <View style={styles.container}>
      {MEAL_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.type}
          style={[styles.option, value === opt.type && styles.selected]}
          onPress={() => onChange(opt.type)}
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>{opt.icon}</Text>
          <Text style={[styles.label, value === opt.type && styles.selectedLabel]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedLabel: {
    color: '#6366F1',
    fontWeight: '600',
  },
});
