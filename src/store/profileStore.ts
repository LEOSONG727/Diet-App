import { create } from 'zustand';
import type { UserProfile, ActivityLevel, GoalType, Gender } from '../types';
import { getProfile, saveProfile, updateProfileTarget } from '../db/queries/profile';
import { computeCalorieTarget } from '../utils/bmrCalculator';
import { generateId } from '../utils/dateUtils';

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  createProfile: (input: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'dailyCalorieTarget' | 'isTargetManuallySet'> & { dailyCalorieTarget?: number; isTargetManuallySet?: boolean }) => Promise<void>;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>) => Promise<void>;
  setManualTarget: (target: number) => Promise<void>;
  recomputeTarget: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: true,

  loadProfile: async () => {
    set({ isLoading: true });
    const profile = await getProfile();
    set({ profile, isLoading: false });
  },

  createProfile: async (input) => {
    const now = Date.now();
    const target = input.dailyCalorieTarget ?? computeCalorieTarget(
      input.gender,
      input.age,
      input.weightKg,
      input.heightCm,
      input.activityLevel,
      input.goalType,
    );
    const profile: UserProfile = {
      id: generateId(),
      ...input,
      dailyCalorieTarget: target,
      isTargetManuallySet: input.isTargetManuallySet ?? false,
      createdAt: now,
      updatedAt: now,
    };
    await saveProfile(profile);
    set({ profile });
  },

  updateProfile: async (updates) => {
    const current = get().profile;
    if (!current) return;
    const updated: UserProfile = {
      ...current,
      ...updates,
      updatedAt: Date.now(),
    };
    if (!updated.isTargetManuallySet) {
      updated.dailyCalorieTarget = computeCalorieTarget(
        updated.gender,
        updated.age,
        updated.weightKg,
        updated.heightCm,
        updated.activityLevel,
        updated.goalType,
      );
    }
    await saveProfile(updated);
    set({ profile: updated });
  },

  setManualTarget: async (target: number) => {
    const current = get().profile;
    if (!current) return;
    await updateProfileTarget(current.id, target, true);
    set({ profile: { ...current, dailyCalorieTarget: target, isTargetManuallySet: true, updatedAt: Date.now() } });
  },

  recomputeTarget: async () => {
    const current = get().profile;
    if (!current) return;
    const target = computeCalorieTarget(
      current.gender,
      current.age,
      current.weightKg,
      current.heightCm,
      current.activityLevel,
      current.goalType,
    );
    await updateProfileTarget(current.id, target, false);
    set({ profile: { ...current, dailyCalorieTarget: target, isTargetManuallySet: false, updatedAt: Date.now() } });
  },
}));

// suppress unused import warnings
void (null as unknown as ActivityLevel);
void (null as unknown as GoalType);
void (null as unknown as Gender);
