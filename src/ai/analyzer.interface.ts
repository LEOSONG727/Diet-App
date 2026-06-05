import type { FoodAnalysisResult } from './types';

export interface AnalysisInput {
  imageUri: string;
  referenceObjectType?: string;
}

export interface IFoodVisionAnalyzer {
  analyzeFoodImage(input: AnalysisInput): Promise<FoodAnalysisResult>;
}
