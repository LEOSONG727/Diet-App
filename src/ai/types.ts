export interface FoodItem {
  name: string;
  estimatedWeightG: number;
  estimatedCaloriesKcal: number;
  confidence: number;
  portionReasoning: string;
}

export interface FoodAnalysisResult {
  referenceObjectDetected: boolean;
  referenceObjectType: string;
  foods: FoodItem[];
  totalCaloriesKcal: number;
  overallConfidence: number;
  uncertaintyNote: string;
  userCorrectionNeeded: boolean;
}
