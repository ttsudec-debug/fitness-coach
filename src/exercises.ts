export type MuscleGroup = 
  | 'Pectorales' 
  | 'Hombros' 
  | 'Espalda' 
  | 'Bíceps' 
  | 'Tríceps' 
  | 'Piernas' 
  | 'Glúteos' 
  | 'Abdominales';

export interface ExerciseDef {
  id: string;
  name: string;
  muscle: MuscleGroup;
  equipment: 'Barra' | 'Mancuernas' | 'Máquina' | 'Peso Corporal' | 'Polea';
  instructions: string[];
  gifUrl: string;
}

export const EXERCISE_DB: ExerciseDef[] = [
  // Pectorales
  {
    id: 'bench_press',
    name: 'Press de Banca Plano',
    muscle: 'Pectorales',
    equipment: 'Barra',
    instructions: [
      'Acuéstate en el banco con los pies apoyados en el suelo.',
      'Agarra la barra ligeramente más ancho que los hombros.',
      'Baja la barra de forma controlada hasta el centro del pecho.',
      'Empuja la barra hacia arriba hasta extender los brazos por completo.'
    ],
    gifUrl: 'https://via.placeholder.com/400x300.png?text=Press+de+Banca'
  },
  {
    id: 'incline_db_press',
    name: 'Press Inclinado con Mancuernas',
    muscle: 'Pectorales',
    equipment: 'Mancuernas',
    instructions: [
      'Ajusta el banco a una inclinación de 30-45 grados.',
      'Con una mancuerna en cada mano, empuja hacia arriba sobre el pecho.',
      'Baja lentamente hasta sentir un estiramiento en el pecho.',
      'Vuelve a la posición inicial contrayendo los pectorales.'
    ],
    gifUrl: 'https://via.placeholder.com/400x300.png?text=Press+Inclinado'
  },
  // Espalda
  {
    id: 'pull_up',
    name: 'Dominadas (Pull ups)',
    muscle: 'Espalda',
    equipment: 'Peso Corporal',
    instructions: [
      'Cuélgate de la barra con un agarre prono (palmas hacia adelante).',
      'Contrae las escápulas y tira de tu cuerpo hacia arriba.',
      'Pasa la barbilla por encima de la barra.',
      'Desciende de forma controlada hasta la posición inicial.'
    ],
    gifUrl: 'https://via.placeholder.com/400x300.png?text=Dominadas'
  },
  {
    id: 'barbell_row',
    name: 'Remo con Barra',
    muscle: 'Espalda',
    equipment: 'Barra',
    instructions: [
      'Inclina el torso hacia adelante manteniendo la espalda recta.',
      'Tira de la barra hacia tu ombligo contrayendo la espalda.',
      'Baja la barra lentamente estirando los dorsales.'
    ],
    gifUrl: 'https://via.placeholder.com/400x300.png?text=Remo+con+Barra'
  },
  // Piernas
  {
    id: 'squat',
    name: 'Sentadilla Libre',
    muscle: 'Piernas',
    equipment: 'Barra',
    instructions: [
      'Coloca la barra sobre los trapecios (espalda alta).',
      'Desciende doblando rodillas y caderas, manteniendo el pecho arriba.',
      'Baja hasta que los muslos estén paralelos al suelo (o más bajo).',
      'Empuja con toda la planta del pie para volver a la posición inicial.'
    ],
    gifUrl: 'https://via.placeholder.com/400x300.png?text=Sentadilla'
  },
  {
    id: 'leg_press',
    name: 'Prensa de Piernas',
    muscle: 'Piernas',
    equipment: 'Máquina',
    instructions: [
      'Siéntate en la máquina con la espalda apoyada firmemente.',
      'Coloca los pies al ancho de los hombros en la plataforma.',
      'Baja el peso doblando las rodillas hasta formar 90 grados.',
      'Empuja para extender las piernas sin bloquear las rodillas al final.'
    ],
    gifUrl: 'https://via.placeholder.com/400x300.png?text=Prensa'
  },
  // Hombros
  {
    id: 'overhead_press',
    name: 'Press Militar',
    muscle: 'Hombros',
    equipment: 'Barra',
    instructions: [
      'De pie, sostiene la barra a la altura de las clavículas.',
      'Empuja la barra sobre tu cabeza hasta extender los brazos.',
      'Baja la barra de forma controlada hasta la posición inicial.',
      'Mantén el core apretado para no curvar la espalda baja.'
    ],
    gifUrl: 'https://via.placeholder.com/400x300.png?text=Press+Militar'
  },
  {
    id: 'lateral_raises',
    name: 'Elevaciones Laterales',
    muscle: 'Hombros',
    equipment: 'Mancuernas',
    instructions: [
      'De pie con una mancuerna en cada mano a los costados.',
      'Levanta los brazos lateralmente hasta la altura de los hombros.',
      'Mantén una ligera flexión en los codos.',
      'Desciende de forma controlada.'
    ],
    gifUrl: 'https://via.placeholder.com/400x300.png?text=Elevaciones+Laterales'
  },
  // Bíceps
  {
    id: 'bicep_curl',
    name: 'Curl de Bíceps con Barra',
    muscle: 'Bíceps',
    equipment: 'Barra',
    instructions: [
      'De pie, sostén la barra con un agarre supino (palmas hacia arriba).',
      'Dobla los codos para llevar la barra hacia tus hombros.',
      'Mantén los codos pegados a los costados del cuerpo.',
      'Baja la barra lentamente.'
    ],
    gifUrl: 'https://via.placeholder.com/400x300.png?text=Curl+de+Biceps'
  },
  // Tríceps
  {
    id: 'tricep_pushdown',
    name: 'Extensión de Tríceps en Polea',
    muscle: 'Tríceps',
    equipment: 'Polea',
    instructions: [
      'Sujeta la cuerda o barra en la polea alta.',
      'Mantén los codos fijos a los lados de tu torso.',
      'Empuja hacia abajo hasta extender completamente los brazos.',
      'Regresa lentamente controlando el peso.'
    ],
    gifUrl: 'https://via.placeholder.com/400x300.png?text=Extension+Triceps'
  }
];
