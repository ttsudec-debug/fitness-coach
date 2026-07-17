import { db } from '../db';

export interface Suggestion {
  weight: number;
  up: boolean;
  reason: string;
}

/** Progresión doble: si completaste todas las series con todas las reps,
 * subí el peso (+5 kg piernas, +2.5 kg resto); si no, repetí hasta lograrlo. */
export async function progressionSuggestions(): Promise<Map<string, Suggestion>> {
  const workouts = await db.workouts.orderBy('date').reverse().limit(30).toArray();
  const map = new Map<string, Suggestion>();
  for (const w of workouts) {
    for (const ex of w.exercises) {
      if (map.has(ex.name)) continue; // solo el registro más reciente
      const done = ex.sets.filter((s) => s.done);
      if (done.length === 0) continue;
      const weight = Math.max(...done.map((s) => s.weight));
      if (weight <= 0) continue;
      const completedAll = done.length === ex.sets.length;
      const isLower = /sentadilla|peso muerto|prensa|zancada|búlgara|puente|hip thrust/i.test(
        ex.name,
      );
      if (completedAll) {
        const inc = isLower ? 5 : 2.5;
        map.set(ex.name, {
          weight: weight + inc,
          up: true,
          reason: `Completaste todo con ${weight} kg → +${inc} kg`,
        });
      } else {
        map.set(ex.name, {
          weight,
          up: false,
          reason: `Repetí ${weight} kg hasta completar todas las series`,
        });
      }
    }
  }
  return map;
}
