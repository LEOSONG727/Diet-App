import type { IFoodVisionAnalyzer, AnalysisInput } from './analyzer.interface';
import type { FoodAnalysisResult } from './types';

/**
 * Real Vision API analyzer — Phase 4
 *
 * TODO: Connect to Claude Vision / GPT-4V / Gemini Vision
 * Steps to implement:
 *   1. Add API key to .env (VISION_API_KEY)
 *   2. Implement base64 image encoding from imageUri
 *   3. Call Vision API with FOOD_ANALYSIS_SYSTEM_PROMPT
 *   4. Parse response with parseAnalysisResult()
 */
export class VisionApiAnalyzer implements IFoodVisionAnalyzer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async analyzeFoodImage(_input: AnalysisInput): Promise<FoodAnalysisResult> {
    throw new Error('VisionApiAnalyzer is not implemented yet. Use MockFoodVisionAnalyzer.');
  }
}
