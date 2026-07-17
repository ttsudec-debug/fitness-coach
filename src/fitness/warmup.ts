import type { Exercise } from '../db';
import { getExerciseInfo } from './exercises';

export interface MobilityItem {
  name: string;
  detail: string;
}

type Pattern = 'piernas' | 'empuje' | 'tiron' | 'core';

/** Patrón de movimiento a partir del pictograma del ejercicio. */
function patternOf(name: string): Pattern | null {
  const anim = getExerciseInfo(name)?.anim;
  if (!anim) return null;
  if (/^(squat|hinge|bridge|lunge|bulgarian|smith|leg_)/.test(anim)) return 'piernas';
  if (/^(bench|pushup|ohp|pike|dips|triext|chest|shoulder|pushdown)/.test(anim)) return 'empuje';
  if (/^(row|pull|curl|seated_row|cable)/.test(anim)) return 'tiron';
  return 'core';
}

function patternsOf(exercises: Exercise[]): Set<Pattern> {
  const set = new Set<Pattern>();
  for (const e of exercises) {
    const p = patternOf(e.name);
    if (p) set.add(p);
  }
  return set;
}

const WARMUP_BASE: MobilityItem[] = [
  { name: 'Pulso arriba', detail: '2 min de caminata rápida, bici suave o saltos al lugar.' },
  { name: 'Círculos de brazos', detail: '10 hacia adelante y 10 hacia atrás, amplios y lentos.' },
  { name: 'Rotaciones de cadera', detail: '8 círculos por lado, manos en la cintura.' },
];

const WARMUP_BY_PATTERN: Record<Pattern, MobilityItem[]> = {
  piernas: [
    { name: 'Sentadilla sin peso', detail: '10 repeticiones lentas, llegando bien abajo.' },
    { name: 'Bisagra de cadera', detail: '10 repeticiones sin peso, espalda neutra.' },
    { name: 'Tobillos', detail: '8 círculos por pie; rodilla a la pared 5 por lado.' },
  ],
  empuje: [
    { name: 'Hombros despiertos', detail: '10 elevaciones de brazos en Y, pulgares arriba.' },
    { name: 'Flexiones lentas', detail: '5 repeticiones controladas (de rodillas si hace falta).' },
  ],
  tiron: [
    { name: 'Colgarse o remo liviano', detail: '20 seg colgado de la barra, o 10 remos sin peso.' },
    { name: 'Retracción de escápulas', detail: '10 repeticiones: juntá omóplatos, aguantá 2 seg.' },
  ],
  core: [{ name: 'Gato-vaca', detail: '8 repeticiones lentas movilizando toda la columna.' }],
};

/** Calentamiento sugerido para una rutina: base + específico según patrones. */
export function warmupFor(exercises: Exercise[]): MobilityItem[] {
  const items = [...WARMUP_BASE];
  for (const p of patternsOf(exercises)) items.push(...WARMUP_BY_PATTERN[p]);
  items.push({
    name: 'Series de aproximación',
    detail: 'En el primer ejercicio: 1 serie con la mitad del peso antes de las series efectivas.',
  });
  return items;
}

const STRETCH_BY_PATTERN: Record<Pattern, MobilityItem[]> = {
  piernas: [
    { name: 'Cuádriceps de pie', detail: '30 seg por lado, talón a la cola, rodillas juntas.' },
    { name: 'Isquiotibiales', detail: '30 seg por lado, pierna estirada sobre apoyo bajo.' },
    { name: 'Glúteos (figura 4)', detail: '30 seg por lado, tobillo sobre la rodilla contraria.' },
  ],
  empuje: [
    { name: 'Pecho en marco de puerta', detail: '30 seg, antebrazo apoyado, girá el torso afuera.' },
    { name: 'Tríceps tras nuca', detail: '20 seg por lado, empujá el codo suavemente.' },
  ],
  tiron: [
    { name: 'Dorsal inclinado', detail: '30 seg por lado, manos en un apoyo, pecho al piso.' },
    { name: 'Bíceps en pared', detail: '20 seg por lado, palma apoyada, girá el cuerpo afuera.' },
  ],
  core: [{ name: 'Cobra suave', detail: '20 seg, caderas en el piso, pecho arriba sin forzar.' }],
};

/** Estiramiento sugerido después de entrenar, según lo trabajado. */
export function stretchFor(exercises: Exercise[]): MobilityItem[] {
  const items: MobilityItem[] = [];
  for (const p of patternsOf(exercises)) items.push(...STRETCH_BY_PATTERN[p]);
  items.push({
    name: 'Respiración',
    detail: '1 min: inhalá 4 seg por nariz, exhalá 6 seg por boca. Baja las pulsaciones.',
  });
  return items;
}
