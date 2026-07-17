import type { Routine, Exercise } from '../db';
import type { Profile } from './metrics';

type Slot =
  | 'sentadilla'
  | 'bisagra'
  | 'empuje_h'
  | 'empuje_v'
  | 'tiron_h'
  | 'tiron_v'
  | 'unilateral'
  | 'biceps'
  | 'triceps'
  | 'core';

const POOLS: Record<Profile['equipment'], Record<Slot, string>> = {
  // Máquinas estándar de la cadena Smart Fit: Smith, prensa, poleas y
  // máquinas selectorizadas — ideal para entrenar sin esperar barras libres.
  smartfit: {
    sentadilla: 'Sentadilla en Smith',
    bisagra: 'Peso muerto rumano en Smith',
    empuje_h: 'Press de pecho en máquina',
    empuje_v: 'Press de hombros en máquina',
    tiron_h: 'Remo sentado en polea',
    tiron_v: 'Jalón al pecho',
    unilateral: 'Prensa de piernas',
    biceps: 'Curl en polea baja',
    triceps: 'Extensión de tríceps en polea',
    core: 'Plancha (seg)',
  },
  gym: {
    sentadilla: 'Sentadilla con barra',
    bisagra: 'Peso muerto rumano',
    empuje_h: 'Press banca',
    empuje_v: 'Press militar',
    tiron_h: 'Remo con barra',
    tiron_v: 'Jalón al pecho',
    unilateral: 'Zancadas con mancuernas',
    biceps: 'Curl con barra',
    triceps: 'Fondos en paralelas',
    core: 'Plancha (seg)',
  },
  mancuernas: {
    sentadilla: 'Sentadilla goblet',
    bisagra: 'Peso muerto rumano c/ mancuernas',
    empuje_h: 'Press banca c/ mancuernas',
    empuje_v: 'Press militar c/ mancuernas',
    tiron_h: 'Remo a un brazo',
    tiron_v: 'Pull-over c/ mancuerna',
    unilateral: 'Zancadas c/ mancuernas',
    biceps: 'Curl alterno',
    triceps: 'Extensión tras nuca',
    core: 'Plancha (seg)',
  },
  casa: {
    sentadilla: 'Sentadilla al aire',
    bisagra: 'Puente de glúteos',
    empuje_h: 'Flexiones',
    empuje_v: 'Flexiones pica',
    tiron_h: 'Remo invertido (mesa)',
    tiron_v: 'Dominadas (o negativas)',
    unilateral: 'Sentadilla búlgara',
    biceps: 'Curl con mochila',
    triceps: 'Fondos en silla',
    core: 'Plancha (seg)',
  },
};

interface Scheme {
  sets: number;
  reps: number;
  restSec: number;
}

function scheme(goal: Profile['goal']): Scheme {
  switch (goal) {
    case 'fuerza':
      return { sets: 5, reps: 5, restSec: 180 };
    case 'musculo':
      return { sets: 3, reps: 10, restSec: 90 };
    default:
      return { sets: 3, reps: 12, restSec: 60 };
  }
}

const DAY_SPREAD: Record<number, number[]> = {
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 5, 6],
  6: [1, 2, 3, 4, 5, 6],
};

function mk(pool: Record<Slot, string>, slots: Slot[], s: Scheme): Exercise[] {
  return slots.map((slot) => ({
    name: pool[slot],
    sets: s.sets,
    reps: slot === 'core' ? 45 : s.reps,
    weight: 0, // el usuario carga su peso inicial; la progresión hace el resto
    restSec: slot === 'core' ? 60 : s.restSec,
  }));
}

/** Genera el plan recomendado según días disponibles (plantillas estándar:
 * 2–3 días Full Body, 4 Upper/Lower, 5–6 Push/Pull/Legs). */
export function generatePlan(p: Profile): Routine[] {
  const pool = POOLS[p.equipment];
  const s = scheme(p.goal);
  const days = DAY_SPREAD[Math.min(6, Math.max(2, p.daysPerWeek))];

  if (p.daysPerWeek <= 3) {
    return days.map((d, i) => ({
      name: `Cuerpo completo ${String.fromCharCode(65 + i)}`,
      days: [d],
      exercises: mk(
        pool,
        i % 2 === 0
          ? ['sentadilla', 'empuje_h', 'tiron_h', 'empuje_v', 'core']
          : ['bisagra', 'empuje_v', 'tiron_v', 'unilateral', 'core'],
        s,
      ),
    }));
  }

  if (p.daysPerWeek === 4) {
    const upper: Slot[] = ['empuje_h', 'tiron_h', 'empuje_v', 'tiron_v', 'biceps'];
    const lower: Slot[] = ['sentadilla', 'bisagra', 'unilateral', 'core'];
    return [
      { name: 'Tren superior A', days: [days[0]], exercises: mk(pool, upper, s) },
      { name: 'Tren inferior A', days: [days[1]], exercises: mk(pool, lower, s) },
      { name: 'Tren superior B', days: [days[2]], exercises: mk(pool, [...upper].reverse(), s) },
      { name: 'Tren inferior B', days: [days[3]], exercises: mk(pool, [...lower].reverse(), s) },
    ];
  }

  const push: Slot[] = ['empuje_h', 'empuje_v', 'triceps', 'core'];
  const pull: Slot[] = ['tiron_v', 'tiron_h', 'biceps', 'core'];
  const legs: Slot[] = ['sentadilla', 'bisagra', 'unilateral', 'core'];
  const blocks = [push, pull, legs];
  const names = ['Empuje (pecho y hombro)', 'Tirón (espalda y bíceps)', 'Piernas'];
  return days.map((d, i) => ({
    name: `${names[i % 3]}${i >= 3 ? ' 2' : ''}`,
    days: [d],
    exercises: mk(pool, blocks[i % 3], s),
  }));
}
