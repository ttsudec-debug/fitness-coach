import Dexie, { type EntityTable } from 'dexie';

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number; // kg, 0 = peso corporal
  restSec: number;
}

export interface Routine {
  id?: number;
  name: string;
  days: number[]; // 0=domingo ... 6=sábado
  exercises: Exercise[];
}

export interface SetLog {
  reps: number;
  weight: number;
  done: boolean;
}

export interface ExerciseLog {
  name: string;
  sets: SetLog[];
}

export interface Workout {
  id?: number;
  date: string; // YYYY-MM-DD
  routineId: number;
  routineName: string;
  exercises: ExerciseLog[];
  startedAt: number;
  finishedAt?: number;
}

export interface Setting {
  key: string;
  value: string;
}

export interface ChatMsg {
  id?: number;
  role: 'user' | 'model';
  text: string;
  ts: number;
}

export const db = new Dexie('fitness-coach') as Dexie & {
  routines: EntityTable<Routine, 'id'>;
  workouts: EntityTable<Workout, 'id'>;
  settings: EntityTable<Setting, 'key'>;
  chat: EntityTable<ChatMsg, 'id'>;
};

db.version(1).stores({
  routines: '++id, name',
  workouts: '++id, date, routineId',
  settings: 'key',
  chat: '++id, ts',
});

export async function getSetting(key: string): Promise<string> {
  const row = await db.settings.get(key);
  return row?.value ?? '';
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
}

/** Crea una rutina de ejemplo la primera vez que se abre la app.
 * Transacción + flag: idempotente aunque StrictMode monte dos veces. */
export async function seedIfEmpty(): Promise<void> {
  await db.transaction('rw', db.settings, db.routines, async () => {
    const seeded = await db.settings.get('seeded');
    if (seeded) return;
    await db.settings.put({ key: 'seeded', value: '1' });
    await db.routines.add({
      name: 'Full Body (ejemplo)',
      days: [1, 3, 5], // lun, mié, vie
      exercises: [
        { name: 'Sentadillas', sets: 3, reps: 12, weight: 40, restSec: 90 },
        { name: 'Press banca', sets: 3, reps: 10, weight: 30, restSec: 90 },
        { name: 'Remo con barra', sets: 3, reps: 10, weight: 30, restSec: 90 },
        { name: 'Plancha (seg)', sets: 3, reps: 45, weight: 0, restSec: 60 },
      ],
    });
  });
}

export const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
