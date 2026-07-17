import React, { useState } from 'react';
import type { MuscleGroup } from '../exercises';

interface Props {
  onSelectMuscle: (muscle: MuscleGroup) => void;
  selectedMuscle?: MuscleGroup | null;
}

export function BodyMap({ onSelectMuscle, selectedMuscle }: Props) {
  const [view, setView] = useState<'front' | 'back'>('front');

  // Colores para los SVG
  const baseColor = 'var(--surface-3)';
  const activeColor = 'var(--accent)';
  const hoverColor = 'var(--cool)';

  function fillFor(muscle: MuscleGroup) {
    return selectedMuscle === muscle ? activeColor : baseColor;
  }

  return (
    <div className="body-map-container" style={{ textAlign: 'center', margin: '20px 0' }}>
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

      <div className="svg-wrapper" style={{ display: 'inline-block', position: 'relative' }}>
        {view === 'front' ? (
          <svg width="200" height="400" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
            {/* Cabeza (no clickeable) */}
            <circle cx="100" cy="40" r="25" fill="#444" />
            
            {/* Hombros */}
            <path 
              d="M 60 70 L 40 100 L 55 120 L 70 80 Z" 
              fill={fillFor('Hombros')} 
              onClick={() => onSelectMuscle('Hombros')}
              style={{ cursor: 'pointer' }}
            />
            <path 
              d="M 140 70 L 160 100 L 145 120 L 130 80 Z" 
              fill={fillFor('Hombros')} 
              onClick={() => onSelectMuscle('Hombros')}
              style={{ cursor: 'pointer' }}
            />

            {/* Pectorales */}
            <path 
              d="M 75 75 L 125 75 L 125 110 C 110 120, 90 120, 75 110 Z" 
              fill={fillFor('Pectorales')} 
              onClick={() => onSelectMuscle('Pectorales')}
              style={{ cursor: 'pointer' }}
            />

            {/* Bíceps */}
            <path 
              d="M 45 125 L 35 180 L 50 185 L 60 130 Z" 
              fill={fillFor('Bíceps')} 
              onClick={() => onSelectMuscle('Bíceps')}
              style={{ cursor: 'pointer' }}
            />
            <path 
              d="M 155 125 L 165 180 L 150 185 L 140 130 Z" 
              fill={fillFor('Bíceps')} 
              onClick={() => onSelectMuscle('Bíceps')}
              style={{ cursor: 'pointer' }}
            />

            {/* Abdominales */}
            <rect 
              x="80" y="120" width="40" height="70" rx="5" 
              fill={fillFor('Abdominales')} 
              onClick={() => onSelectMuscle('Abdominales')}
              style={{ cursor: 'pointer' }}
            />

            {/* Piernas (Cuádriceps) */}
            <path 
              d="M 75 200 L 95 200 L 95 290 L 70 290 Z" 
              fill={fillFor('Piernas')} 
              onClick={() => onSelectMuscle('Piernas')}
              style={{ cursor: 'pointer' }}
            />
            <path 
              d="M 105 200 L 125 200 L 130 290 L 105 290 Z" 
              fill={fillFor('Piernas')} 
              onClick={() => onSelectMuscle('Piernas')}
              style={{ cursor: 'pointer' }}
            />
            
            {/* Pantorrillas (simplificado) */}
            <path d="M 75 300 L 90 300 L 85 370 L 75 370 Z" fill="#444" />
            <path d="M 110 300 L 125 300 L 125 370 L 115 370 Z" fill="#444" />
          </svg>
        ) : (
          <svg width="200" height="400" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
            {/* Cabeza */}
            <circle cx="100" cy="40" r="25" fill="#444" />

            {/* Espalda (Dorsales y trapecios) */}
            <path 
              d="M 70 70 L 130 70 L 120 160 L 80 160 Z" 
              fill={fillFor('Espalda')} 
              onClick={() => onSelectMuscle('Espalda')}
              style={{ cursor: 'pointer' }}
            />

            {/* Tríceps */}
            <path 
              d="M 45 125 L 35 180 L 50 185 L 60 130 Z" 
              fill={fillFor('Tríceps')} 
              onClick={() => onSelectMuscle('Tríceps')}
              style={{ cursor: 'pointer' }}
            />
            <path 
              d="M 155 125 L 165 180 L 150 185 L 140 130 Z" 
              fill={fillFor('Tríceps')} 
              onClick={() => onSelectMuscle('Tríceps')}
              style={{ cursor: 'pointer' }}
            />

            {/* Glúteos */}
            <path 
              d="M 70 165 L 130 165 L 135 200 L 65 200 Z" 
              fill={fillFor('Glúteos')} 
              onClick={() => onSelectMuscle('Glúteos')}
              style={{ cursor: 'pointer' }}
            />

            {/* Piernas (Isquios) */}
            <path 
              d="M 75 205 L 95 205 L 95 290 L 70 290 Z" 
              fill={fillFor('Piernas')} 
              onClick={() => onSelectMuscle('Piernas')}
              style={{ cursor: 'pointer' }}
            />
            <path 
              d="M 105 205 L 125 205 L 130 290 L 105 290 Z" 
              fill={fillFor('Piernas')} 
              onClick={() => onSelectMuscle('Piernas')}
              style={{ cursor: 'pointer' }}
            />
          </svg>
        )}
      </div>
      
      <p className="muted small-text" style={{ marginTop: '10px' }}>
        Toca un grupo muscular para ver ejercicios.
      </p>
    </div>
  );
}
