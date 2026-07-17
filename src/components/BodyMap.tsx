import { useState } from 'react';
import Body from 'react-muscle-highlighter';

interface Props {
  onSelectMuscle?: (muscle: string) => void;
  selectedMuscle?: string | null;
  activeRegions?: string[];
  readonly?: boolean;
}

const SLUG_MAP: Record<string, string> = {
  'Pectorales': 'chest',
  'Hombros': 'deltoids',
  'Bíceps': 'biceps',
  'Tríceps': 'triceps',
  'Abdominales': 'abs',
  'Piernas': 'quadriceps', // Simplification for the old map compatibility
  'Espalda': 'upper-back',
  'Glúteos': 'gluteal',
  
  // Also support the exact DB keys
  'pecho': 'chest',
  'hombros': 'deltoids',
  'biceps': 'biceps',
  'triceps': 'triceps',
  'antebrazo': 'forearm',
  'abdomen': 'abs',
  'oblicuos': 'obliques',
  'trapecio': 'trapezius',
  'dorsal': 'upper-back',
  'espalda_alta': 'upper-back',
  'lumbar': 'lower-back',
  'gluteos': 'gluteal',
  'cuadriceps': 'quadriceps',
  'isquios': 'hamstring',
  'gemelos': 'calves',
  'aductores': 'adductors'
};

const REVERSE_MAP: Record<string, string> = Object.entries(SLUG_MAP).reduce((acc, [k, v]) => {
  // Solo guardamos el primero que encontramos (el español legible principal)
  if (!acc[v]) acc[v] = k;
  return acc;
}, {} as Record<string, string>);

export function BodyMap({ onSelectMuscle, selectedMuscle, activeRegions = [], readonly = false }: Props) {
  const [view, setView] = useState<'front' | 'back'>('front');

  const activeColor = '#FF5216'; // Naranja Strava vibrante

  // Construir data array para react-muscle-highlighter
  const data = [];
  
  // 1. Regiones activas del heatmap (entrenamientos)
  for (const region of activeRegions) {
    const slug = SLUG_MAP[region];
    if (slug) {
      data.push({ slug: slug as any, color: activeColor });
    }
  }

  // 2. Músculo seleccionado en la librería
  if (selectedMuscle) {
    const slug = SLUG_MAP[selectedMuscle];
    if (slug) {
      data.push({ slug: slug as any, color: activeColor });
    }
  }

  return (
    <div className="body-map-container" style={{ textAlign: 'center', margin: readonly ? '0' : '20px 0' }}>
      {!readonly && (
        <div className="segmented-control" style={{ marginBottom: '20px' }}>
          <button 
            className={`btn small ${view === 'front' ? 'primary' : 'ghost'}`} 
            onClick={() => setView('front')}
          >
            Vista Frontal
          </button>
          <button 
            className={`btn small ${view === 'back' ? 'primary' : 'ghost'}`} 
            onClick={() => setView('back')}
          >
            Vista Trasera
          </button>
        </div>
      )}

      <div className="svg-wrapper" style={{ display: 'inline-block', position: 'relative' }}>
        <Body
          data={data}
          side={view}
          scale={readonly ? 1 : 1.3}
          defaultFill="var(--surface-3)"
          defaultStroke="#000"
          defaultStrokeWidth={1}
          onBodyPartPress={(part) => {
            if (!readonly && onSelectMuscle) {
              const spanishName = REVERSE_MAP[part.slug || ''];
              if (spanishName) onSelectMuscle(spanishName);
            }
          }}
        />
      </div>
      
      {!readonly && (
        <p className="muted small-text" style={{ marginTop: '30px' }}>
          Toca un grupo muscular para ver ejercicios.
        </p>
      )}
    </div>
  );
}
