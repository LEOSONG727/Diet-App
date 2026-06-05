import { create } from 'zustand';
import type { FoodLog, FoodLogCreateInput, DailySummary } from '../types';
import {
  getLogsForDate,
  insertFoodLog,
  updateFoodLog,
  deleteFoodLog,
  getAllLogs,
  getDatesWithLogs,
} from '../db/queries/foodLogs';
import { getTodayString } from '../utils/dateUtils';

interface DailyState {
  todayLogs: FoodLog[];
  allLogs: FoodLog[];
  logDates: string[];
  selectedDate: string;
  goalCalories: number;
  isLoading: boolean;

  setGoalCalories: (goal: number) => void;
  loadToday: () => Promise<void>;
  loadAllLogs: () => Promise<void>;
  loadLogDates: () => Promise<void>;
  addLog: (input: FoodLogCreateInput) => Promise<void>;
  editLog: (id: string, input: Partial<FoodLogCreateInput>) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
  getTodaySummary: () => DailySummary;
}

export const useDailyStore = create<DailyState>((set, get) => ({
  todayLogs: [],
  allLogs: [],
  logDates: [],
  selectedDate: getTodayString(),
  goalCalories: 2000,
  isLoading: false,

  setGoalCalories: (goal) => set({ goalCalories: goal }),

  loadToday: async () => {
    set({ isLoading: true });
    const today = getTodayString();
    const logs = await getLogsForDate(today);
    set({ todayLogs: logs, selectedDate: today, isLoading: false });
  },

  loadAllLogs: async () => {
    const logs = await getAllLogs();
    set({ allLogs: logs });
  },

  loadLogDates: async () => {
    const dates = await getDatesWithLogs();
    set({ logDates: dates });
  },

  addLog: async (input) => {
    const newLog = await insertFoodLog(input);
    const today = getTodayString();
    if (input.date === today) {
      set((state) => ({ todayLogs: [...state.todayLogs, newLog] }));
    }
    // refresh all logs too
    const allLogs = await getAllLogs();
    const dates = await getDatesWithLogs();
    set({ allLogs, logDates: dates });
  },

  editLog: async (id, input) => {
    await updateFoodLog(id, input);
    const today = getTodayString();
    const updatedLogs = await getLogsForDate(today);
    set({ todayLogs: updatedLogs });
    const allLogs = await getAllLogs();
    set({ allLogs });
  },

  removeLog: async (id) => {
    await deleteFoodLog(id);
    const today = getTodayString();
    const updatedLogs = await getLogsForDate(today);
    set({ todayLogs: updatedLogs });
    const allLogs = await getAllLogs();
    const dates = await getDatesWithLogs();
    set({ allLogs, logDates: dates });
  },

  getTodaySummary: () => {
    const { todayLogs, goalCalories, selectedDate } = get();
    const totalCalories = todayLogs.reduce((sum, log) => sum + log.userCalories, 0);
    return {
      date: selectedDate,
      totalCalories,
      mealCount: todayLogs.length,
      goalCalories,
      remainingCalories: goalCalories - totalCalories,
    };
  },
}));
