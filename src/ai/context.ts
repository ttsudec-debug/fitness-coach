import { db, DAY_NAMES } from '../db';

/** Arma el contexto que ve el coach: rutinas + últimos entrenamientos. */
export async function buildCoachContext(): Promise<string> {
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
    'Ayudas con rutinas, técnica, progresión de cargas, descanso y ajustes por molestias o lesiones leves.',
    'Si el usuario menciona dolor persistente o lesión seria, recomiéndale consultar a un profesional de salud.',
    'No inventes datos del historial: usa solo lo que aparece abajo.',
    '',
    '=== RUTINAS DEL USUARIO ===',
    routinesTxt || '(sin rutinas definidas)',
    '',
    '=== ÚLTIMOS ENTRENAMIENTOS ===',
    recentTxt || '(sin entrenamientos registrados)',
  ].join('\n');
}
