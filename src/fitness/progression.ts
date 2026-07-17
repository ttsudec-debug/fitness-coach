import { db, type Workout } from '../db';

export interface Suggestion {
  weight: number;
  kind: 'up' | 'repeat' | 'deload';
  reason: string;
}

interface Entry {
  weight: number;
  completedAll: boolean;
}

const STALL_SESSIONS = 3;

function round25(x: number): number {
  return Math.max(2.5, Math.round(x / 2.5) * 2.5);
}

/** Historial reciente por ejercicio (más nuevo primero): peso top y si completó todo. */
function recentEntries(workouts: Workout[]): Map<string, Entry[]> {
  const map = new Map<string, Entry[]>();
  for (const w of workouts) {
    for (const ex of w.exercises) {
      const done = ex.sets.filter((s) => s.done);
      if (done.length === 0) continue;
      const weight = Math.max(...done.map((s) => s.weight));
      if (weight <= 0) continue;
      const list = map.get(ex.name) ?? [];
      list.push({ weight, completedAll: done.length === ex.sets.length });
      map.set(ex.name, list);
    }
  }
  return map;
}

/** Progresión doble con detección de estancamiento:
 * - Completaste todas las series → subí el peso (+5 kg piernas, +2.5 kg resto).
 * - No completaste → repetí el mismo peso.
 * - 3 sesiones seguidas al mismo peso sin completarlo → descarga: -10 % y volvé a subir. */
export async function progressionSuggestions(): Promise<Map<string, Suggestion>> {
  const workouts = await db.workouts.orderBy('date').reverse().limit(30).toArray();
  const entries = recentEntries(workouts);
  const map = new Map<string, Suggestion>();

  for (const [name, list] of entries) {
    const last = list[0];
    if (last.completedAll) {
      const isLower = /sentadilla|peso muerto|prensa|zancada|búlgara|puente|hip thrust/i.test(name);
      const inc = isLower ? 5 : 2.5;
      map.set(name, {
        weight: last.weight + inc,
        kind: 'up',
        reason: `Completaste todo con ${last.weight} kg → +${inc} kg`,
      });
      continue;
    }
    let stalls = 0;
    for (const e of list) {
      if (e.weight === last.weight && !e.completedAll) stalls++;
      else break;
    }
    if (stalls >= STALL_SESSIONS) {
      const target = round25(last.weight * 0.9);
      map.set(name, {
        weight: target,
        kind: 'deload',
        reason: `${stalls} sesiones estancado en ${last.weight} kg → bajá a ${target} kg y volvé a subir`,
      });
    } else {
      map.set(name, {
        weight: last.weight,
        kind: 'repeat',
        reason: `Repetí ${last.weight} kg hasta completar todas las series`,
      });
    }
  }
  return map;
}

const DELOAD_WEEKS = 8;

function weekStart(d: Date): number {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // lunes = 0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function workoutVolume(w: Workout): number {
  return w.exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.done).reduce((a, s) => a + s.reps * s.weight, 0),
    0,
  );
}

/** Aviso de semana de descarga: muchos ejercicios estancados, o muchas semanas
 * seguidas entrenando sin ninguna semana liviana. Devuelve el motivo, o null. */
export async function deloadCheck(
  suggestions?: Map<string, Suggestion>,
): Promise<string | null> {
  const sug = suggestions ?? (await progressionSuggestions());
  const withWeight = sug.size;
  const stalled = [...sug.values()].filter((s) => s.kind === 'deload').length;
  if (withWeight >= 3 && stalled / withWeight >= 0.5) {
    return `${stalled} de ${withWeight} ejercicios están estancados: señal de fatiga acumulada.`;
  }

  const workouts = await db.workouts.toArray();
  const volByWeek = new Map<number, number>();
  for (const w of workouts) {
    const key = weekStart(new Date(w.date + 'T12:00:00'));
    volByWeek.set(key, (volByWeek.get(key) ?? 0) + workoutVolume(w));
  }
  // Semanas consecutivas hacia atrás (desde esta o la pasada) entrenando "en serio":
  // una semana liviana (volumen < 65 % del pico de las 3 previas) corta la racha.
  const WEEK_MS = 7 * 86400000;
  let cursor = weekStart(new Date());
  if (!volByWeek.has(cursor)) cursor -= WEEK_MS;
  let streak = 0;
  while (volByWeek.has(cursor)) {
    const prevPeak = Math.max(
      volByWeek.get(cursor - WEEK_MS) ?? 0,
      volByWeek.get(cursor - 2 * WEEK_MS) ?? 0,
      volByWeek.get(cursor - 3 * WEEK_MS) ?? 0,
    );
    if (prevPeak > 0 && volByWeek.get(cursor)! < prevPeak * 0.65) break;
    streak++;
    cursor -= WEEK_MS;
  }
  if (streak >= DELOAD_WEEKS) {
    return `Llevás ${streak} semanas seguidas entrenando sin una semana liviana.`;
  }
  return null;
}
