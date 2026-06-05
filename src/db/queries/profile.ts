import { getDB } from '../client';
import type { UserProfile, ActivityLevel, GoalType, Gender } from '../../types';

interface ProfileRow {
  id: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  activity_level: string;
  goal_type: string;
  daily_calorie_target: number;
  is_target_manually_set: number;
  created_at: number;
  updated_at: number;
}

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    age: row.age,
    gender: row.gender as Gender,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    activityLevel: row.activity_level as ActivityLevel,
    goalType: row.goal_type as GoalType,
    dailyCalorieTarget: row.daily_calorie_target,
    isTargetManuallySet: row.is_target_manually_set === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProfile(): Promise<UserProfile | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<ProfileRow>(
    'SELECT * FROM user_profile LIMIT 1',
  );
  return row ? rowToProfile(row) : null;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT OR REPLACE INTO user_profile
      (id, age, gender, height_cm, weight_kg, activity_level, goal_type,
       daily_calorie_target, is_target_manually_set, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      profile.id,
      profile.age,
      profile.gender,
      profile.heightCm,
      profile.weightKg,
      profile.activityLevel,
      profile.goalType,
      profile.dailyCalorieTarget,
      profile.isTargetManuallySet ? 1 : 0,
      profile.createdAt,
      profile.updatedAt,
    ],
  );
}

export async function updateProfileTarget(
  id: string,
  target: number,
  isManual: boolean,
): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE user_profile SET daily_calorie_target = ?, is_target_manually_set = ?, updated_at = ? WHERE id = ?`,
    [target, isManual ? 1 : 0, Date.now(), id],
  );
}
