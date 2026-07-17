import { getExerciseInfo } from '../fitness/exercises';
import { BodyMap } from './BodyMap';

export default function ExerciseMedia({
  name,
  size = 96,
  big = false,
}: {
  name: string;
  size?: number;
  big?: boolean;
}) {
  const info = getExerciseInfo(name);
  
  const backMuscles = ['espalda', 'dorsal', 'espalda_alta', 'lumbar', 'gluteos', 'isquios', 'gemelos', 'triceps', 'trapecio'];
  
  let forceView: 'front' | 'back' = 'front';
  let activeRegions: string[] = [];
  
  if (info?.mg) {
    activeRegions = [...info.mg.primary, ...info.mg.secondary];
    const main = info.mg.primary[0];
    if (main && backMuscles.includes(main)) {
      forceView = 'back';
    }
  }

  const w = size;
  const h = Math.round(size * (100 / 120));
  // Ajuste fino para la librería react-muscle-highlighter (que por defecto es muy grande)
  const scale = size / 220; 

  return (
    <div 
      className={`exanim-media ${big ? 'big' : ''}`}
      style={{
        width: w,
        height: h,
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'var(--surface-3)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center 40%', height: '100%', display: 'flex', alignItems: 'center' }}>
        <BodyMap 
          readonly 
          forceView={forceView} 
          activeRegions={activeRegions} 
        />
      </div>
    </div>
  );
}
