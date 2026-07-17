export interface ExerciseInfo {
  muscles: string;
  technique: string[];
  mistake: string;
  substitutes: string[];
  anim?: string; // clave del pictograma animado en fitness/anims.ts
}

/** Fichas de los ejercicios de las plantillas (gym / mancuernas / casa). */
export const EXERCISE_INFO: Record<string, ExerciseInfo> = {
  // ---------- gym ----------
  'Sentadilla con barra': {
    muscles: 'Cuádriceps, glúteos, core',
    technique: [
      'Barra apoyada en trapecios, pies al ancho de hombros con puntas levemente abiertas.',
      'Bajá quebrando cadera y rodillas a la vez, hasta que el muslo quede paralelo al piso o más.',
      'Pecho arriba y core firme durante todo el recorrido.',
      'Empujá el piso con todo el pie para subir, sin despegar talones.',
    ],
    mistake: 'Dejar que las rodillas se vayan hacia adentro al subir.',
    substitutes: ['Sentadilla goblet', 'Prensa de piernas', 'Sentadilla búlgara'],
  },
  'Peso muerto rumano': {
    muscles: 'Isquiotibiales, glúteos, espalda baja',
    technique: [
      'Barra pegada a las piernas, rodillas apenas flexionadas.',
      'Llevá la cadera bien atrás manteniendo la espalda neutra.',
      'Bajá hasta sentir el estiramiento en los isquios (media canilla aprox.).',
      'Subí apretando glúteos, sin hiperextender la espalda arriba.',
    ],
    mistake: 'Redondear la espalda baja al bajar.',
    substitutes: ['Peso muerto rumano c/ mancuernas', 'Puente de glúteos', 'Hip thrust'],
  },
  'Press banca': {
    muscles: 'Pectorales, tríceps, hombro frontal',
    technique: [
      'Escápulas juntas y apoyadas en el banco, pies firmes en el piso.',
      'Bajá la barra controlada hasta rozar el pecho, a la altura de los pezones.',
      'Codos a unos 45° del torso, no abiertos en cruz.',
      'Empujá hasta extender los brazos sin despegar la cola del banco.',
    ],
    mistake: 'Rebotar la barra en el pecho para ayudarse.',
    substitutes: ['Press banca c/ mancuernas', 'Flexiones', 'Press inclinado'],
  },
  'Press militar': {
    muscles: 'Hombros, tríceps, core',
    technique: [
      'De pie, barra a la altura de las clavículas, agarre apenas más ancho que hombros.',
      'Core y glúteos firmes para no arquear la zona lumbar.',
      'Empujá la barra en línea recta metiendo la cabeza al final.',
      'Bajá controlado hasta las clavículas.',
    ],
    mistake: 'Arquear la espalda baja convirtiéndolo en press inclinado.',
    substitutes: ['Press militar c/ mancuernas', 'Flexiones pica'],
  },
  'Remo con barra': {
    muscles: 'Dorsales, romboides, bíceps',
    technique: [
      'Torso inclinado ~45°, espalda neutra, rodillas algo flexionadas.',
      'Tirá la barra hacia el ombligo, no hacia el pecho.',
      'Llevá los codos pegados al cuerpo y juntá las escápulas al final.',
      'Bajá controlado sin dejar caer la barra.',
    ],
    mistake: 'Usar impulso del torso ("remar" con la espalda baja).',
    substitutes: ['Remo a un brazo', 'Remo invertido (mesa)', 'Jalón al pecho'],
  },
  'Jalón al pecho': {
    muscles: 'Dorsales, bíceps',
    technique: [
      'Agarre algo más ancho que hombros, torso apenas inclinado atrás.',
      'Tirá la barra hacia la parte alta del pecho llevando los codos abajo.',
      'Pensá en empujar los codos hacia el piso, no en tirar con las manos.',
      'Subí controlado estirando bien los dorsales.',
    ],
    mistake: 'Balancearse hacia atrás para mover más peso.',
    substitutes: ['Dominadas (o negativas)', 'Pull-over c/ mancuerna', 'Remo con barra'],
  },
  'Zancadas con mancuernas': {
    muscles: 'Cuádriceps, glúteos, estabilidad',
    technique: [
      'Paso largo al frente, torso vertical, mancuernas colgando a los lados.',
      'Bajá hasta que la rodilla de atrás casi toque el piso.',
      'La rodilla de adelante en línea con el pie, sin pasarla mucho de la punta.',
      'Empujá con la pierna de adelante para volver.',
    ],
    mistake: 'Paso demasiado corto: la rodilla se va muy adelante.',
    substitutes: ['Sentadilla búlgara', 'Zancadas c/ mancuernas', 'Prensa de piernas'],
  },
  'Curl con barra': {
    muscles: 'Bíceps, antebrazos',
    technique: [
      'De pie, codos pegados al torso, agarre al ancho de hombros.',
      'Subí la barra sin mover los codos de lugar.',
      'Apretá arriba un segundo y bajá controlado (2–3 seg).',
    ],
    mistake: 'Balancear el torso para "ayudar" en las últimas reps.',
    substitutes: ['Curl alterno', 'Curl con mochila'],
  },
  'Fondos en paralelas': {
    muscles: 'Tríceps, pecho bajo, hombros',
    technique: [
      'Brazos extendidos, torso apenas inclinado adelante.',
      'Bajá flexionando codos hasta ~90°, codos apuntando atrás.',
      'Empujá hasta extender sin bloquear con violencia.',
    ],
    mistake: 'Bajar de más con los hombros enrollados hacia adelante.',
    substitutes: ['Fondos en silla', 'Extensión tras nuca', 'Press banca cerrado'],
  },
  'Plancha (seg)': {
    muscles: 'Core completo, hombros',
    technique: [
      'Antebrazos y puntas de pie, cuerpo en línea recta de cabeza a talones.',
      'Apretá abdomen y glúteos: la cadera no sube ni se cae.',
      'Respirá normal; cortá la serie cuando se rompa la postura.',
    ],
    mistake: 'Dejar caer la cadera y sostener con la espalda baja.',
    substitutes: ['Plancha lateral (seg)', 'Elevación de piernas'],
  },

  // ---------- mancuernas ----------
  'Sentadilla goblet': {
    muscles: 'Cuádriceps, glúteos, core',
    technique: [
      'Mancuerna vertical pegada al pecho, codos abajo.',
      'Bajá entre las rodillas manteniendo el torso erguido.',
      'Los codos pasan por adentro de las rodillas abajo.',
      'Subí empujando con todo el pie.',
    ],
    mistake: 'Inclinar el torso adelante y despegar los talones.',
    substitutes: ['Sentadilla con barra', 'Sentadilla al aire', 'Sentadilla búlgara'],
  },
  'Peso muerto rumano c/ mancuernas': {
    muscles: 'Isquiotibiales, glúteos',
    technique: [
      'Mancuernas al frente de los muslos, rodillas apenas flexionadas.',
      'Cadera bien atrás con espalda neutra; mancuernas rozando las piernas.',
      'Bajá hasta sentir tensión en los isquios y subí apretando glúteos.',
    ],
    mistake: 'Convertirlo en sentadilla flexionando mucho las rodillas.',
    substitutes: ['Peso muerto rumano', 'Puente de glúteos'],
  },
  'Press banca c/ mancuernas': {
    muscles: 'Pectorales, tríceps, hombro frontal',
    technique: [
      'Acostado, mancuernas sobre el pecho con brazos extendidos.',
      'Bajá controlado hasta la altura del pecho, codos a ~45°.',
      'Empujá juntando apenas las mancuernas arriba.',
    ],
    mistake: 'Bajar demasiado rápido y perder el control abajo.',
    substitutes: ['Press banca', 'Flexiones'],
  },
  'Press militar c/ mancuernas': {
    muscles: 'Hombros, tríceps',
    technique: [
      'De pie o sentado, mancuernas a la altura de las orejas.',
      'Empujá arriba hasta casi juntar las mancuernas.',
      'Core firme: nada de arquear la zona lumbar.',
    ],
    mistake: 'Empujar con rebote de piernas sin querer.',
    substitutes: ['Press militar', 'Flexiones pica'],
  },
  'Remo a un brazo': {
    muscles: 'Dorsales, romboides, bíceps',
    technique: [
      'Mano y rodilla apoyadas en banco o silla, espalda plana.',
      'Tirá la mancuerna hacia la cadera, codo pegado al cuerpo.',
      'Juntá la escápula al final y bajá controlado.',
    ],
    mistake: 'Rotar el torso para levantar más peso.',
    substitutes: ['Remo con barra', 'Remo invertido (mesa)'],
  },
  'Pull-over c/ mancuerna': {
    muscles: 'Dorsales, pecho, serrato',
    technique: [
      'Acostado, mancuerna tomada con ambas manos sobre el pecho.',
      'Bajála por detrás de la cabeza con codos apenas flexionados.',
      'Volvé a la vertical sintiendo el trabajo de dorsales.',
    ],
    mistake: 'Flexionar mucho los codos y convertirlo en extensión de tríceps.',
    substitutes: ['Jalón al pecho', 'Dominadas (o negativas)'],
  },
  'Zancadas c/ mancuernas': {
    muscles: 'Cuádriceps, glúteos, estabilidad',
    technique: [
      'Paso largo al frente con torso vertical.',
      'Rodilla de atrás casi al piso; la de adelante en línea con el pie.',
      'Empujá con la pierna de adelante para volver.',
    ],
    mistake: 'Paso corto que manda la rodilla muy adelante.',
    substitutes: ['Sentadilla búlgara', 'Zancadas con mancuernas'],
  },
  'Curl alterno': {
    muscles: 'Bíceps, antebrazos',
    technique: [
      'De pie, mancuernas a los lados, palmas al frente.',
      'Subí una por vez sin mover el codo de lugar.',
      'Bajá controlado antes de subir la otra.',
    ],
    mistake: 'Balancear el cuerpo y acortar el recorrido.',
    substitutes: ['Curl con barra', 'Curl con mochila'],
  },
  'Extensión tras nuca': {
    muscles: 'Tríceps',
    technique: [
      'Mancuerna con ambas manos por detrás de la cabeza, codos arriba.',
      'Extendé los brazos sin abrir los codos.',
      'Bajá controlado hasta sentir el estiramiento del tríceps.',
    ],
    mistake: 'Abrir los codos hacia afuera y meter hombro.',
    substitutes: ['Fondos en paralelas', 'Fondos en silla'],
  },

  // ---------- casa / peso corporal ----------
  'Sentadilla al aire': {
    muscles: 'Cuádriceps, glúteos',
    technique: [
      'Pies al ancho de hombros, brazos al frente de contrapeso.',
      'Bajá hasta el paralelo o más, torso lo más erguido posible.',
      'Subí empujando con todo el pie; ritmo controlado.',
    ],
    mistake: 'Hacerlas a medias: bajar poco y rápido.',
    substitutes: ['Sentadilla goblet', 'Sentadilla búlgara'],
  },
  'Puente de glúteos': {
    muscles: 'Glúteos, isquiotibiales',
    technique: [
      'Acostado boca arriba, pies apoyados cerca de la cola.',
      'Subí la cadera apretando glúteos hasta alinear rodilla-cadera-hombro.',
      'Aguantá 1 seg arriba y bajá controlado.',
    ],
    mistake: 'Empujar con la espalda baja en vez de los glúteos.',
    substitutes: ['Peso muerto rumano', 'Hip thrust'],
  },
  Flexiones: {
    muscles: 'Pectorales, tríceps, core',
    technique: [
      'Manos apenas más anchas que hombros, cuerpo en línea recta.',
      'Bajá hasta que el pecho casi toque el piso, codos a ~45°.',
      'Empujá sin que la cadera se quede atrás.',
      'Si cuesta: apoyá las rodillas o las manos en una mesa.',
    ],
    mistake: 'Dejar caer la cadera y romper la línea del cuerpo.',
    substitutes: ['Press banca', 'Press banca c/ mancuernas'],
  },
  'Flexiones pica': {
    muscles: 'Hombros, tríceps',
    technique: [
      'Cadera bien arriba formando una "V" invertida.',
      'Bajá la cabeza hacia el piso entre las manos flexionando codos.',
      'Empujá volviendo a la posición de pica.',
      'Elevá los pies en una silla para hacerlo más difícil.',
    ],
    mistake: 'Convertirlas en flexiones comunes bajando la cadera.',
    substitutes: ['Press militar', 'Press militar c/ mancuernas'],
  },
  'Remo invertido (mesa)': {
    muscles: 'Dorsales, romboides, bíceps',
    technique: [
      'Debajo de una mesa firme, tomá el borde con ambas manos.',
      'Cuerpo en línea recta, talones apoyados.',
      'Tirá el pecho hacia la mesa juntando escápulas y bajá controlado.',
    ],
    mistake: 'Quebrar la cadera y tirar solo con los brazos.',
    substitutes: ['Remo con barra', 'Remo a un brazo'],
  },
  'Dominadas (o negativas)': {
    muscles: 'Dorsales, bíceps, core',
    technique: [
      'Agarre algo más ancho que hombros, colgado con brazos extendidos.',
      'Subí llevando el pecho a la barra, sin patalear.',
      'Si no salen: saltá arriba y bajá lo más lento posible (negativas).',
    ],
    mistake: 'Medio recorrido: no extender abajo ni pasar el mentón arriba.',
    substitutes: ['Jalón al pecho', 'Remo invertido (mesa)'],
  },
  'Sentadilla búlgara': {
    muscles: 'Cuádriceps, glúteos, estabilidad',
    technique: [
      'Pie de atrás apoyado en silla o banco, el de adelante bien al frente.',
      'Bajá vertical hasta que la rodilla de atrás casi toque el piso.',
      'El peso va sobre la pierna de adelante; torso erguido.',
    ],
    mistake: 'Poner el pie de adelante muy cerca de la silla.',
    substitutes: ['Zancadas con mancuernas', 'Sentadilla al aire'],
  },
  'Curl con mochila': {
    muscles: 'Bíceps, antebrazos',
    technique: [
      'Cargá una mochila con libros/botellas y tomála de las asas.',
      'Codos pegados al torso, subí sin balancear.',
      'Bajá en 2–3 segundos para compensar el peso liviano.',
    ],
    mistake: 'Hacerlo rápido: con poco peso la clave es la lentitud.',
    substitutes: ['Curl con barra', 'Curl alterno'],
  },
  'Fondos en silla': {
    muscles: 'Tríceps, pecho bajo',
    technique: [
      'Manos en el borde de una silla firme, piernas estiradas al frente.',
      'Bajá flexionando codos hasta ~90°, espalda cerca de la silla.',
      'Empujá hasta extender los brazos.',
    ],
    mistake: 'Alejarse de la silla y cargar los hombros.',
    substitutes: ['Fondos en paralelas', 'Extensión tras nuca'],
  },
};

// La rutina de ejemplo usa "Sentadillas": misma ficha que la sentadilla al aire.
EXERCISE_INFO['Sentadillas'] = EXERCISE_INFO['Sentadilla al aire'];

const ANIM_KEYS: Record<string, string> = {
  'Sentadilla con barra': 'squat_bar',
  'Sentadilla goblet': 'squat_gob',
  'Sentadilla al aire': 'squat_bw',
  Sentadillas: 'squat_bw',
  'Peso muerto rumano': 'hinge_bar',
  'Peso muerto rumano c/ mancuernas': 'hinge_db',
  'Puente de glúteos': 'bridge',
  'Press banca': 'bench_bar',
  'Press banca c/ mancuernas': 'bench_db',
  Flexiones: 'pushup',
  'Press militar': 'ohp_bar',
  'Press militar c/ mancuernas': 'ohp_db',
  'Flexiones pica': 'pike',
  'Remo con barra': 'row_bar',
  'Remo a un brazo': 'row_db',
  'Remo invertido (mesa)': 'row_inv',
  'Jalón al pecho': 'pulldown',
  'Pull-over c/ mancuerna': 'pullover',
  'Dominadas (o negativas)': 'pullup',
  'Zancadas con mancuernas': 'lunge',
  'Zancadas c/ mancuernas': 'lunge',
  'Sentadilla búlgara': 'bulgarian',
  'Curl con barra': 'curl_bar',
  'Curl alterno': 'curl_db',
  'Curl con mochila': 'curl_pack',
  'Fondos en paralelas': 'dips',
  'Extensión tras nuca': 'triext',
  'Fondos en silla': 'dips_chair',
  'Plancha (seg)': 'plank',
};

/** Ficha de un ejercicio, o undefined si es un nombre custom del usuario. */
export function getExerciseInfo(name: string): ExerciseInfo | undefined {
  const clean = name.trim();
  const info = EXERCISE_INFO[clean];
  if (!info) return undefined;
  return { ...info, anim: ANIM_KEYS[clean] };
}
