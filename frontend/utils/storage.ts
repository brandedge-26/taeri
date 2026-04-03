import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Assessment } from '@/types/assessment';

const ASSESSMENTS_KEY = 'taeri_assessments';
const USER_NAME_KEY = 'taeri_user_name';

export async function saveAssessment(assessment: Assessment): Promise<void> {
  const existing = await getAssessments();
  existing.unshift(assessment); // newest first
  await AsyncStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(existing));
}

export async function getAssessments(): Promise<Assessment[]> {
  const raw = await AsyncStorage.getItem(ASSESSMENTS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Assessment[];
}

export async function getThisWeekAssessments(): Promise<Assessment[]> {
  const all = await getAssessments();
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return all.filter((a) => new Date(a.date) >= startOfWeek);
}

export async function deleteAssessment(id: string): Promise<void> {
  const existing = await getAssessments();
  const updated = existing.filter((a) => a.id !== id);
  await AsyncStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(updated));
}

export async function saveUserName(name: string): Promise<void> {
  await AsyncStorage.setItem(USER_NAME_KEY, name);
}

export async function getUserName(): Promise<string> {
  return (await AsyncStorage.getItem(USER_NAME_KEY)) ?? 'there';
}
