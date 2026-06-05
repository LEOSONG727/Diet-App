import type { ActivityLevel, GoalType, Gender } from '../types';

interface BMRInput {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
}

export function calculateBMR(input: BMRInput): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return input.gender === 'male' ? base + 5 : base - 161;
}

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  low: 1.2,
  moderate: 1.55,
  high: 1.725,
};

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_FACTORS[activityLevel]);
}

const GOAL_ADJUSTMENTS: Record<GoalType, number> = {
  maintain: 0,
  lose: -500,
  gain: 300,
};

export function calculateDailyTarget(
  tdee: number,
  goalType: GoalType,
): number {
  const raw = tdee + GOAL_ADJUSTMENTS[goalType];
  return Math.max(1000, Math.min(4000, Math.round(raw)));
}

export function computeCalorieTarget(
  gender: Gender,
  age: number,
  weightKg: number,
  heightCm: number,
  activityLevel: ActivityLevel,
  goalType: GoalType,
): number {
  const bmr = calculateBMR({ gender, weightKg, heightCm, age });
  const tdee = calculateTDEE(bmr, activityLevel);
  return calculateDailyTarget(tdee, goalType);
}
