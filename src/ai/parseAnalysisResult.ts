import type { FoodAnalysisResult } from './types';

/**
 * Parses raw Vision API text response into FoodAnalysisResult (Phase 4)
 *
 * Vision models often wrap JSON in markdown code blocks — this strips them first.
 */
export function parseAnalysisResult(raw: string): FoodAnalysisResult {
  const cleaned = raw
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
  return JSON.parse(cleaned) as FoodAnalysisResult;
}
