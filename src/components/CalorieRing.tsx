import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
}

export function CalorieRing({ consumed, goal, size = 200 }: CalorieRingProps) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const isOver = consumed > goal;

  const ringColor = isOver ? '#EF4444' : progress > 0.85 ? '#F59E0B' : '#6366F1';
  const remaining = goal - consumed;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.consumedText, { color: ringColor }]}>{consumed}</Text>
        <Text style={styles.label}>kcal 섭취</Text>
        <Text style={styles.remainingText}>
          {isOver ? `+${Math.abs(remaining)}` : remaining} kcal {isOver ? '초과' : '남음'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  consumedText: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  remainingText: {
    fontSize: 13,
    color: '#374151',
    marginTop: 6,
    fontWeight: '500',
  },
});
