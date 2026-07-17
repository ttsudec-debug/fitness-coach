export interface Profile {
  age: number;
  sex: 'M' | 'F';
  weightKg: number;
  heightCm: number;
  experience: 'novato' | 'intermedio' | 'avanzado';
  goal: 'fuerza' | 'musculo' | 'grasa' | 'salud';
  daysPerWeek: number;
  workStart: string; // HH:MM
  workEnd: string;
  trainWhen: 'antes' | 'despues';
  equipment: 'gym' | 'smartfit' | 'mancuernas' | 'casa';
  injuries: string;
}

export interface Targets {
  bmi: number;
  bmiLabel: string;
  bmr: number;
  tdee: number;
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  waterMl: number;
  setsPerMuscleWeek: string;
}

export interface MacroTargets {
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
}

/** Métricas modernas: Mifflin-St Jeor para BMR, proteína 1.6–2.2 g/kg,
 * volumen 10–20 series/músculo/semana según experiencia. */
export function computeTargets(p: Profile): Targets {
  const bmi = p.weightKg / (p.heightCm / 100) ** 2;
  const bmiLabel =
    bmi < 18.5 ? 'bajo peso' : bmi < 25 ? 'normal' : bmi < 30 ? 'sobrepeso' : 'obesidad';
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'M' ? 5 : -161);
  const activity = 1.3 + 0.05 * p.daysPerWeek;
  const tdee = bmr * activity;
  const kcal = p.goal === 'grasa' ? tdee * 0.85 : p.goal === 'musculo' ? tdee * 1.1 : tdee;
  const proteinPerKg = p.goal === 'grasa' ? 2.2 : p.goal === 'musculo' ? 2.0 : 1.6;
  const kcalRounded = Math.round(kcal / 10) * 10;
  const proteinG = Math.round(p.weightKg * proteinPerKg);
  // Grasa ~25 % de las kcal; el resto de kcal van a carbohidratos.
  const fatG = Math.round((kcalRounded * 0.25) / 9);
  const carbG = Math.max(0, Math.round((kcalRounded - proteinG * 4 - fatG * 9) / 4));
  const sets =
    p.experience === 'novato' ? '10–12' : p.experience === 'intermedio' ? '12–16' : '16–20';
  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiLabel,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    kcal: kcalRounded,
    proteinG,
    carbG,
    fatG,
    waterMl: Math.round((p.weightKg * 35) / 100) * 100,
    setsPerMuscleWeek: sets,
  };
}

/** Objetivos de macros: si el usuario cargó objetivos propios (de su guía),
 * los usa; si no, los deriva del perfil. */
export function resolveMacroTargets(
  targets: Targets,
  override: Partial<MacroTargets> | null,
): MacroTargets {
  return {
    kcal: override?.kcal ?? targets.kcal,
    proteinG: override?.proteinG ?? targets.proteinG,
    carbG: override?.carbG ?? targets.carbG,
    fatG: override?.fatG ?? targets.fatG,
  };
}

/** 1RM estimada (fórmula de Epley) — para seguir progresión de fuerza. */
export function e1rm(weight: number, reps: number): number {
  return Math.round(weight * (1 + reps / 30));
}

/** Hora de recordatorio según horario laboral y preferencia. */
export function suggestedReminderTime(p: Profile): string {
  const [h, m] = (p.trainWhen === 'antes' ? p.workStart : p.workEnd)
    .split(':')
    .map(Number);
  let mins = h * 60 + m + (p.trainWhen === 'antes' ? -90 : 30);
  mins = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}

export const FOOD_TIPS = [
  'Priorizá proteína en cada comida: huevos, pollo, pescado, legumbres o yogur griego.',
  'Comé verduras en al menos 2 comidas del día — fibra, saciedad y micronutrientes.',
  'Hidratate antes de tener sed: llevá una botella y terminála 2 veces en el día.',
  'Carbohidratos alrededor del entrenamiento: arroz, avena o fruta 1–2 h antes.',
  'Dormir 7–9 h es tan importante como entrenar: la recuperación pasa de noche.',
  'Evitá ultraprocesados de lunes a viernes; dejá los gustos para el finde con medida.',
  'Después de entrenar: proteína + carbohidrato dentro de las 2 horas.',
  'Grasas buenas todos los días: palta, frutos secos, aceite de oliva.',
  'No compenses un mal día comiendo de menos al siguiente: retomá tu plan normal.',
  'Planificá las comidas del día a la mañana: decidir con hambre sale mal.',
] as const;

export function todaysFoodTip(): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const day = Math.floor((Date.now() - start.getTime()) / 86400000);
  return FOOD_TIPS[day % FOOD_TIPS.length];
}
