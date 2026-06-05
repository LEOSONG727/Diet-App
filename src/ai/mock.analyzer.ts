import type { IFoodVisionAnalyzer, AnalysisInput } from './analyzer.interface';
import type { FoodAnalysisResult } from './types';

const MOCK_RESPONSES: FoodAnalysisResult[] = [
  {
    referenceObjectDetected: true,
    referenceObjectType: 'credit_card',
    foods: [
      {
        name: '김치볶음밥',
        estimatedWeightG: 420,
        estimatedCaloriesKcal: 720,
        confidence: 0.72,
        portionReasoning: '기준 카드와 접시의 상대 크기를 바탕으로 약 1.5공기 분량으로 추정',
      },
    ],
    totalCaloriesKcal: 720,
    overallConfidence: 0.72,
    uncertaintyNote: '사진 각도와 음식 높이 때문에 실제 칼로리는 ±20~30% 차이가 날 수 있습니다.',
    userCorrectionNeeded: true,
  },
  {
    referenceObjectDetected: true,
    referenceObjectType: 'credit_card',
    foods: [
      {
        name: '된장찌개',
        estimatedWeightG: 300,
        estimatedCaloriesKcal: 180,
        confidence: 0.68,
        portionReasoning: '표준 1인분 그릇 크기로 추정, 두부 및 채소 기준',
      },
      {
        name: '쌀밥',
        estimatedWeightG: 200,
        estimatedCaloriesKcal: 340,
        confidence: 0.85,
        portionReasoning: '기준 카드 대비 공기 크기가 표준 1공기와 유사',
      },
    ],
    totalCaloriesKcal: 520,
    overallConfidence: 0.71,
    uncertaintyNote: '반찬 내용물에 따라 칼로리 차이가 클 수 있습니다.',
    userCorrectionNeeded: true,
  },
  {
    referenceObjectDetected: false,
    referenceObjectType: 'credit_card',
    foods: [
      {
        name: '비빔밥',
        estimatedWeightG: 500,
        estimatedCaloriesKcal: 590,
        confidence: 0.45,
        portionReasoning: '기준 카드 미인식 — 그릇 크기 일반값 적용, 정확도 낮음',
      },
    ],
    totalCaloriesKcal: 590,
    overallConfidence: 0.45,
    uncertaintyNote: '기준 카드가 인식되지 않아 추정 정확도가 낮습니다. 칼로리를 직접 수정해주세요.',
    userCorrectionNeeded: true,
  },
];

export class MockFoodVisionAnalyzer implements IFoodVisionAnalyzer {
  async analyzeFoodImage(_input: AnalysisInput): Promise<FoodAnalysisResult> {
    await new Promise((resolve) => setTimeout(resolve, 1800));
    const idx = Math.floor(Math.random() * MOCK_RESPONSES.length);
    return MOCK_RESPONSES[idx];
  }
}
