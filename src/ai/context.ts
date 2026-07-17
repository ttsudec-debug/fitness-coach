import { db, DAY_NAMES, getSetting } from '../db';
import { computeTargets, type Profile } from '../fitness/metrics';

/** Arma el contexto que ve el coach: perfil + rutinas + últimos entrenamientos. */
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
  const recent = await db.workouts.orderBy('date').reverse().limit(10).toArray();

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
  ].join('\n');
}
