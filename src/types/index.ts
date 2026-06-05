export type ActivityLevel = 'low' | 'moderate' | 'high';
export type GoalType = 'maintain' | 'lose' | 'gain';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';
export type ReferenceObjectType = 'credit_card' | 'coin_500' | 'spoon' | 'custom';
export type Gender = 'male' | 'female';

export interface UserProfile {
  id: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  dailyCalorieTarget: number;
  isTargetManuallySet: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FoodLog {
  id: string;
  userId: string | null;
  date: string; // 'YYYY-MM-DD'
  mealType: MealType;
  imageUri: string | null;
  referenceObjectType: ReferenceObjectType;
  referenceObjectDetected: boolean;
  foodName: string;
  estimatedWeightGram: number | null;
  estimatedCalories: number;
  userCalories: number;
  confidence: number | null;
  aiReasoningSummary: string | null;
  uncertaintyNote: string | null;
  userEdited: boolean;
  notes: string | null;
  createdAt: number;
  updatedAt: number;
  syncedAt: number | null;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  mealCount: number;
  goalCalories: number;
  remainingCalories: number;
}

export interface FoodLogCreateInput {
  date: string;
  mealType: MealType;
  foodName: string;
  estimatedCalories: number;
  userCalories: number;
  imageUri?: string | null;
  referenceObjectType?: ReferenceObjectType;
  referenceObjectDetected?: boolean;
  estimatedWeightGram?: number | null;
  confidence?: number | null;
  aiReasoningSummary?: string | null;
  uncertaintyNote?: string | null;
  userEdited?: boolean;
  notes?: string | null;
}

export interface FoodLogUpdateInput extends Partial<FoodLogCreateInput> {
  id: string;
}
