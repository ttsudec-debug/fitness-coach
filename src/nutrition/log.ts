import { getSetting, type MealEntry } from '../db';
import type { MacroTargets } from '../fitness/metrics';
import type { Macros } from './foods';

/** Objetivos de macros propios (de la guía del usuario), si los cargó. */
export async function getMacroOverride(): Promise<Partial<MacroTargets> | null> {
  const raw = await getSetting('macroTargets');
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<MacroTargets>;
    return o && typeof o === 'object' ? o : null;
  } catch {
    return null;
  }
}

export function sumMacros(meals: MealEntry[]): Macros {
  return meals.reduce(
    (a, m) => ({
      kcal: a.kcal + m.kcal,
      protein: a.protein + m.protein,
      carbs: a.carbs + m.carbs,
      fat: a.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export const MEAL_TYPES = ['Desayuno', 'Almuerzo', 'Once', 'Cena', 'Snack'] as const;

/** Comida sugerida según la hora del día. */
export function defaultMeal(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Desayuno';
  if (h < 15) return 'Almuerzo';
  if (h < 18) return 'Once';
  if (h < 21.5) return 'Cena';
  return 'Snack';
}
