/**
 * Food analysis prompt templates for Vision API integration (Phase 4)
 */

export const FOOD_ANALYSIS_SYSTEM_PROMPT = `
You are a food calorie estimation assistant.
Your task is to analyze a food photo and estimate the calories for each visible food item.

Rules:
1. Use the reference object (credit card, 500 won coin, spoon, etc.) to estimate food volume.
2. Return a JSON object matching the FoodAnalysisResult schema exactly. No extra text outside JSON.
3. For each food item: provide name (Korean preferred), estimated weight in grams, estimated calories in kcal.
4. Set referenceObjectDetected to false and lower confidence if no reference object is visible.
5. Korean home-cooked meals vary greatly — be honest about uncertainty in uncertaintyNote.
6. Always set userCorrectionNeeded to true; the user should verify the estimate.
`.trim();

export function buildFoodAnalysisPrompt(referenceObjectType: string): string {
  return [
    `Analyze this food photo. The reference object is: ${referenceObjectType}.`,
    'Estimate calories for each food item visible.',
    'Respond with a JSON object following the FoodAnalysisResult schema only.',
  ].join(' ');
}
