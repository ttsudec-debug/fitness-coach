import { useState } from 'react';
import { getExerciseInfo } from '../fitness/exercises';

const FALLBACK_IMAGES: Record<string, string> = {
  pecho: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1470&auto=format&fit=crop', // Bench press
  hombros: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop', // Shoulders/Arms
  biceps: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop',
  triceps: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?q=80&w=1470&auto=format&fit=crop',
  abdomen: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop', // Core
  piernas: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop', // Squat
  cuadriceps: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
  isquios: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=1474&auto=format&fit=crop', // Deadlift
  gluteos: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
  espalda: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=1471&auto=format&fit=crop', // Row/Pullup
  dorsal: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=1471&auto=format&fit=crop',
};

export default function ExerciseMedia({
  name,
  size = 96,
  big = false,
}: {
  name: string;
  size?: number;
  big?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const info = getExerciseInfo(name);
  
  // Buscar la imagen en base al músculo principal
  let imageUrl = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'; // Default
  
  if (info?.mg?.primary?.[0]) {
    const mainMuscle = info.mg.primary[0];
    imageUrl = FALLBACK_IMAGES[mainMuscle] || imageUrl;
  }

  // Dimensiones
  const w = size;
  const h = Math.round(size * (100 / 120));

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
        flexShrink: 0
      }}
    >
      {/* Skeleton loader mientras carga */}
      {!loaded && (
        <div className="skeleton-pulse" style={{ position: 'absolute', inset: 0, background: 'var(--surface-3)' }} />
      )}
      
      <img 
        src={imageUrl} 
        alt={name}
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  );
}
