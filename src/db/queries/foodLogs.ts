import { getDB } from '../client';
import type { FoodLog, FoodLogCreateInput, MealType, ReferenceObjectType } from '../../types';
import { generateId } from '../../utils/dateUtils';

interface FoodLogRow {
  id: string;
  user_id: string | null;
  date: string;
  meal_type: string;
  image_uri: string | null;
  reference_object_type: string;
  reference_object_detected: number;
  food_name: string;
  estimated_weight_gram: number | null;
  estimated_calories: number;
  user_calories: number;
  confidence: number | null;
  ai_reasoning_summary: string | null;
  uncertainty_note: string | null;
  user_edited: number;
  notes: string | null;
  created_at: number;
  updated_at: number;
  synced_at: number | null;
}

function rowToFoodLog(row: FoodLogRow): FoodLog {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    mealType: row.meal_type as MealType,
    imageUri: row.image_uri,
    referenceObjectType: row.reference_object_type as ReferenceObjectType,
    referenceObjectDetected: row.reference_object_detected === 1,
    foodName: row.food_name,
    estimatedWeightGram: row.estimated_weight_gram,
    estimatedCalories: row.estimated_calories,
    userCalories: row.user_calories,
    confidence: row.confidence,
    aiReasoningSummary: row.ai_reasoning_summary,
    uncertaintyNote: row.uncertainty_note,
    userEdited: row.user_edited === 1,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    syncedAt: row.synced_at,
  };
}

export async function getLogsForDate(date: string): Promise<FoodLog[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<FoodLogRow>(
    'SELECT * FROM food_logs WHERE date = ? ORDER BY created_at ASC',
    [date],
  );
  return rows.map(rowToFoodLog);
}

export async function getAllLogs(): Promise<FoodLog[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<FoodLogRow>(
    'SELECT * FROM food_logs ORDER BY date DESC, created_at DESC',
  );
  return rows.map(rowToFoodLog);
}

export async function getLogById(id: string): Promise<FoodLog | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<FoodLogRow>(
    'SELECT * FROM food_logs WHERE id = ?',
    [id],
  );
  return row ? rowToFoodLog(row) : null;
}

export async function insertFoodLog(input: FoodLogCreateInput): Promise<FoodLog> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  const log: FoodLog = {
    id,
    userId: null,
    date: input.date,
    mealType: input.mealType,
    imageUri: input.imageUri ?? null,
    referenceObjectType: input.referenceObjectType ?? 'credit_card',
    referenceObjectDetected: input.referenceObjectDetected ?? false,
    foodName: input.foodName,
    estimatedWeightGram: input.estimatedWeightGram ?? null,
    estimatedCalories: input.estimatedCalories,
    userCalories: input.userCalories,
    confidence: input.confidence ?? null,
    aiReasoningSummary: input.aiReasoningSummary ?? null,
    uncertaintyNote: input.uncertaintyNote ?? null,
    userEdited: input.userEdited ?? false,
    notes: input.notes ?? null,
    createdAt: now,
    updatedAt: now,
    syncedAt: null,
  };
  await db.runAsync(
    `INSERT INTO food_logs
      (id, user_id, date, meal_type, image_uri, reference_object_type,
       reference_object_detected, food_name, estimated_weight_gram,
       estimated_calories, user_calories, confidence, ai_reasoning_summary,
       uncertainty_note, user_edited, notes, created_at, updated_at, synced_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      log.id, log.userId, log.date, log.mealType, log.imageUri,
      log.referenceObjectType, log.referenceObjectDetected ? 1 : 0,
      log.foodName, log.estimatedWeightGram, log.estimatedCalories,
      log.userCalories, log.confidence, log.aiReasoningSummary,
      log.uncertaintyNote, log.userEdited ? 1 : 0, log.notes,
      log.createdAt, log.updatedAt, log.syncedAt,
    ],
  );
  return log;
}

export async function updateFoodLog(id: string, input: Partial<FoodLogCreateInput>): Promise<void> {
  const db = await getDB();
  const now = Date.now();
  const fields: string[] = [];
  const values: (string | number | null | boolean)[] = [];

  if (input.foodName !== undefined) { fields.push('food_name = ?'); values.push(input.foodName); }
  if (input.userCalories !== undefined) { fields.push('user_calories = ?'); values.push(input.userCalories); }
  if (input.estimatedCalories !== undefined) { fields.push('estimated_calories = ?'); values.push(input.estimatedCalories); }
  if (input.mealType !== undefined) { fields.push('meal_type = ?'); values.push(input.mealType); }
  if (input.notes !== undefined) { fields.push('notes = ?'); values.push(input.notes ?? null); }
  if (input.estimatedWeightGram !== undefined) { fields.push('estimated_weight_gram = ?'); values.push(input.estimatedWeightGram ?? null); }
  if (input.userEdited !== undefined) { fields.push('user_edited = ?'); values.push(input.userEdited ? 1 : 0); }

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(
    `UPDATE food_logs SET ${fields.join(', ')} WHERE id = ?`,
    values as import('expo-sqlite').SQLiteBindValue[],
  );
}

export async function deleteFoodLog(id: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM food_logs WHERE id = ?', [id]);
}

export async function getDatesWithLogs(): Promise<string[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT DISTINCT date FROM food_logs ORDER BY date DESC',
  );
  return rows.map(r => r.date);
}

export async function getDailyCalorieSum(date: string): Promise<number> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(user_calories), 0) as total FROM food_logs WHERE date = ?',
    [date],
  );
  return row?.total ?? 0;
}
