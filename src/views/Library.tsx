import { useState } from 'react';
import { BodyMap } from '../components/BodyMap';
import { EXERCISE_INFO, getExerciseInfo } from '../fitness/exercises';
import ExerciseSheet from '../components/ExerciseSheet';

export function Library() {
  const [muscle, setMuscle] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Convertir el diccionario en array
  const allExercises = Object.keys(EXERCISE_INFO);
  
  // Filtrar si hay músculo seleccionado (búsqueda case-insensitive)
  const displayedExercises = muscle 
    ? allExercises.filter(name => {
        const info = EXERCISE_INFO[name];
        return info.muscles.toLowerCase().includes(muscle.toLowerCase()) || 
               info.muscles.toLowerCase().includes(muscle.replace('es', '').toLowerCase());
      })
    : allExercises;

  return (
    <div className="view tab-pane" style={{ overflowY: 'auto' }}>
      <div className="view-head">
        <h2>Librería</h2>
        <p className="muted">Toca un músculo para ver ejercicios.</p>
      </div>

      <BodyMap 
        onSelectMuscle={(m) => setMuscle(m === muscle ? null : m)} 
        selectedMuscle={muscle as any} 
      />

      <div style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px' }}>
          {muscle ? `Ejercicios para ${muscle}` : 'Todos los ejercicios'}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayedExercises.length === 0 && (
            <p className="muted">No hay ejercicios cargados para este músculo aún.</p>
          )}
          {displayedExercises.map(exName => {
            const info = getExerciseInfo(exName);
            if (!info) return null;
            return (
              <button 
                key={exName} 
                className="card" 
                style={{ textAlign: 'left', padding: '15px' }}
                onClick={() => setSelectedExercise(exName)}
              >
                <h4 style={{ margin: '0 0 5px 0' }}>{exName}</h4>
                <p className="muted small-text" style={{ margin: 0 }}>
                  Zonas: {info.muscles}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {selectedExercise && (
        <ExerciseSheet name={selectedExercise} onClose={() => setSelectedExercise(null)} />
      )}
    </div>
  );
}
