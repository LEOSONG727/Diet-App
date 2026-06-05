import { create } from 'zustand';
import type { FoodAnalysisResult } from '../ai/types';

interface AnalysisState {
  imageUri: string | null;
  result: FoodAnalysisResult | null;
  referenceObjectType: string;
  setImageUri: (uri: string) => void;
  setResult: (result: FoodAnalysisResult) => void;
  setReferenceObjectType: (type: string) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  imageUri: null,
  result: null,
  referenceObjectType: 'credit_card',
  setImageUri: (uri) => set({ imageUri: uri }),
  setResult: (result) => set({ result }),
  setReferenceObjectType: (type) => set({ referenceObjectType: type }),
  reset: () => set({ imageUri: null, result: null, referenceObjectType: 'credit_card' }),
}));
