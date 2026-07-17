import { db, DAY_NAMES, getSetting, todayStr } from '../db';
import { computeTargets, resolveMacroTargets, type Profile } from '../fitness/metrics';
import { personalRecords } from '../fitness/records';
import { progressionSuggestions, deloadCheck } from '../fitness/progression';
import { getMacroOverride, sumMacros, MEAL_TYPES } from '../nutrition/log';

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Arma el contexto que ve el coach: perfil + rutinas + progreso + últimos entrenamientos. */
export async function buildCoachContext(): Promise<string> {
  const rawProfile = await getSetting('profile');
  let profileTxt = '(sin evaluación inicial)';
  if (rawProfile) {
    const p = JSON.parse(rawProfile) as Profile;
    const t = computeTargets(p);
    profileTxt = [
      `${p.sex === 'M' ? 'Hombre' : 'Mujer'}, ${p.age} años, ${p.weightKg} kg, ${p.heightCm} cm (IMC ${t.bmi}, ${t.bmiLabel}).`,
      `Nivel: ${p.experience}. Objetivo: ${p.goal}. Entrena ${p.daysPerWeek} días/semana con ${p.equipment}.`,
      `Trabaja de ${p.workStart} a ${p.workEnd}; prefiere entrenar ${p.trainWhen === 'antes' ? 'antes' : 'después'} del trabajo.`,
      `Objetivos diarios: ~${t.kcal} kcal, ${t.proteinG} g proteína, ${(t.waterMl / 1000).toFixed(1)} L agua.`,
      p.injuries ? `Lesiones/molestias: ${p.injuries}.` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }
  const routines = await db.routines.toArray();
  const allWorkouts = await db.workouts.toArray();
  const recent = await db.workouts.orderBy('date').reverse().limit(10).toArray();

  const records = [...personalRecords(allWorkouts).entries()]
    .sort((a, b) => b[1].e1 - a[1].e1)
    .slice(0, 10)
    .map(([name, r]) => `- ${name}: ${r.weight} kg x ${r.reps} el ${r.date} (1RM estimada ${r.e1} kg)`)
    .join('\n');

  const suggestions = await progressionSuggestions();
  const stalled = [...suggestions.entries()]
    .filter(([, s]) => s.kind === 'deload')
    .map(([name, s]) => `- ${name}: ${s.reason}`)
    .join('\n');
  const deload = await deloadCheck(suggestions);

  const bodyLogs = await db.bodyLogs.orderBy('date').toArray();
  let bodyTxt = '';
  if (bodyLogs.length > 0) {
    const last = bodyLogs[bodyLogs.length - 1];
    bodyTxt = `Último peso corporal registrado: ${last.weightKg} kg (${last.date})`;
    const monthAgo = bodyLogs.filter((l) => l.date <= addDays(last.date, -25)).pop();
    if (monthAgo) {
      const diff = Math.round((last.weightKg - monthAgo.weightKg) * 10) / 10;
      bodyTxt += `; hace ~1 mes pesaba ${monthAgo.weightKg} kg (${diff > 0 ? '+' : ''}${diff} kg)`;
    }
    if (last.waistCm) bodyTxt += `. Cintura: ${last.waistCm} cm`;
    bodyTxt += '.';
  }

  // Nutrición de hoy: objetivos vs. consumido + comidas + guía del usuario.
  const todayMeals = await db.meals.where('date').equals(todayStr()).toArray();
  const macroOverride = await getMacroOverride();
  let nutritionTxt = '(sin registro de comidas hoy)';
  const consumed = sumMacros(todayMeals);
  const targets = rawProfile
    ? resolveMacroTargets(computeTargets(JSON.parse(rawProfile) as Profile), macroOverride)
    : macroOverride && macroOverride.kcal
      ? {
          kcal: macroOverride.kcal,
          proteinG: macroOverride.proteinG ?? 0,
          carbG: macroOverride.carbG ?? 0,
          fatG: macroOverride.fatG ?? 0,
        }
      : null;
  if (todayMeals.length > 0 || targets) {
    const lines: string[] = [];
    if (targets) {
      lines.push(
        `Objetivo: ${targets.kcal} kcal, ${targets.proteinG} g proteína, ${targets.carbG} g carbos, ${targets.fatG} g grasa.`,
      );
      lines.push(
        `Consumido hoy: ${Math.round(consumed.kcal)} kcal, ${Math.round(consumed.protein)} g proteína, ${Math.round(consumed.carbs)} g carbos, ${Math.round(consumed.fat)} g grasa.`,
      );
      lines.push(
        `Faltan: ${Math.max(0, targets.kcal - Math.round(consumed.kcal))} kcal, ${Math.max(0, targets.proteinG - Math.round(consumed.protein))} g proteína.`,
      );
    }
    for (const mt of MEAL_TYPES) {
      const items = todayMeals.filter((m) => m.meal === mt);
      if (items.length) lines.push(`${mt}: ${items.map((i) => `${i.name} (${i.grams} g)`).join(', ')}`);
    }
    nutritionTxt = lines.join('\n');
  }
  const guide = await getSetting('nutritionGuide');

  const routinesTxt = routines
    .map((r) => {
      const days = r.days.map((d) => DAY_NAMES[d]).join(', ');
      const ex = r.exercises
        .map((e) => `  - ${e.name}: ${e.sets}x${e.reps}${e.weight ? ` @ ${e.weight}kg` : ''} (descanso ${e.restSec}s)`)
        .join('\n');
      return `Rutina "${r.name}" (días: ${days}):\n${ex}`;
    })
    .join('\n\n');

  const recentTxt = recent
    .map((w) => {
      const vol = w.exercises.reduce(
        (acc, e) => acc + e.sets.filter((s) => s.done).reduce((a, s) => a + s.reps * s.weight, 0),
        0,
      );
      const doneSets = w.exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.done).length, 0);
      const totalSets = w.exercises.reduce((acc, e) => acc + e.sets.length, 0);
      return `- ${w.date}: ${w.routineName} — ${doneSets}/${totalSets} series completadas, volumen ${Math.round(vol)}kg`;
    })
    .join('\n');

  return [
    'Eres un asesor fitness personal (coach). Respondes en español, de forma breve, práctica y motivadora.',
    'Ayudas con rutinas, técnica, progresión de cargas, descanso, y nutrición práctica alineada a los objetivos diarios del perfil.',
    'Si el usuario menciona dolor persistente o lesión seria, recomiéndale consultar a un profesional de salud; en nutrición, da pautas generales saludables, no dietas médicas.',
    'No inventes datos del historial: usa solo lo que aparece abajo.',
    '',
    '=== PERFIL Y EVALUACIÓN ===',
    profileTxt,
    '',
    '=== RUTINAS DEL USUARIO ===',
    routinesTxt || '(sin rutinas definidas)',
    '',
    '=== ÚLTIMOS ENTRENAMIENTOS ===',
    recentTxt || '(sin entrenamientos registrados)',
    '',
    '=== RÉCORDS PERSONALES (mejor 1RM estimada, Epley) ===',
    records || '(sin récords todavía)',
    '',
    '=== PESO CORPORAL ===',
    bodyTxt || '(sin registros de peso corporal)',
    '',
    '=== ESTANCAMIENTO / FATIGA ===',
    [
      stalled || '(ningún ejercicio estancado)',
      deload ? `Sugerencia de semana de descarga activa: ${deload}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    '',
    '=== NUTRICIÓN DE HOY ===',
    nutritionTxt,
    '',
    '=== GUÍA NUTRICIONAL DEL USUARIO ===',
    guide || '(no cargó guía nutricional)',
  ].join('\n');
}
