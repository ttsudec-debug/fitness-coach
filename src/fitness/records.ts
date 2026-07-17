import { db, type ExerciseLog, type Workout } from '../db';
import { e1rm } from './metrics';

export interface StrengthPoint {
  date: string;
  weight: number;
  reps: number;
  e1: number;
}

function bestOfLog(ex: ExerciseLog, date: string): StrengthPoint | null {
  let best: StrengthPoint | null = null;
  for (const s of ex.sets) {
    if (!s.done || s.weight <= 0 || s.reps <= 0) continue;
    const e1 = e1rm(s.weight, s.reps);
    if (!best || e1 > best.e1) best = { date, weight: s.weight, reps: s.reps, e1 };
  }
  return best;
}

/** Mejor set (por e1RM) de cada sesión para un ejercicio, en orden cronológico. */
export function strengthHistory(workouts: Workout[], name: string): StrengthPoint[] {
  const points: StrengthPoint[] = [];
  for (const w of [...workouts].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const ex of w.exercises) {
      if (ex.name !== name) continue;
      const best = bestOfLog(ex, w.date);
      if (best) points.push(best);
    }
  }
  return points;
}

/** Ejercicios con al menos 2 sesiones con peso registrado (para graficar). */
export function trackedExercises(workouts: Workout[]): string[] {
  const count = new Map<string, number>();
  for (const w of workouts) {
    for (const ex of w.exercises) {
      if (bestOfLog(ex, w.date)) count.set(ex.name, (count.get(ex.name) ?? 0) + 1);
    }
  }
  return [...count.entries()]
    .filter(([, c]) => c >= 2)
    .map(([n]) => n)
    .sort((a, b) => a.localeCompare(b));
}

/** Récord actual (mejor e1RM histórico) por ejercicio. */
export function personalRecords(workouts: Workout[]): Map<string, StrengthPoint> {
  const map = new Map<string, StrengthPoint>();
  for (const w of workouts) {
    for (const ex of w.exercises) {
      const best = bestOfLog(ex, w.date);
      if (!best) continue;
      const prev = map.get(ex.name);
      if (!prev || best.e1 > prev.e1) map.set(ex.name, best);
    }
  }
  return map;
}

export interface PR {
  name: string;
  weight: number;
  reps: number;
  e1: number;
}

/** Récords que rompe un entrenamiento recién terminado (llamar ANTES de guardarlo). */
export async function newPRs(logs: ExerciseLog[], date: string): Promise<PR[]> {
  const previous = personalRecords(await db.workouts.toArray());
  const prs: PR[] = [];
  for (const ex of logs) {
    const best = bestOfLog(ex, date);
    if (!best) continue;
    const prev = previous.get(ex.name);
    if (!prev || best.e1 > prev.e1) {
      prs.push({ name: ex.name, weight: best.weight, reps: best.reps, e1: best.e1 });
    }
  }
  return prs;
}
