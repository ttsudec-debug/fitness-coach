import type { ReactNode } from 'react';
import type { MuscleGroups, MuscleKey } from '../fitness/exercises';

/** Diagrama corporal tipo MuscleWiki: cuerpo de frente y de espalda con los
 * músculos trabajados resaltados (primario fuerte, secundario tenue). */
export default function MuscleMap({ groups }: { groups: MuscleGroups }) {
  const level = (k: MuscleKey): string => {
    if (groups.primary.includes(k)) return 'mm primary';
    if (groups.secondary.includes(k)) return 'mm secondary';
    return 'mm';
  };

  return (
    <div className="muscle-map">
      <svg viewBox="0 0 100 210" width="130" role="img" aria-label="Músculos trabajados (frente)">
        <FrontFigure level={level} />
        <text x="50" y="207" className="mm-caption" textAnchor="middle">
          Frente
        </text>
      </svg>
      <svg viewBox="0 0 100 210" width="130" role="img" aria-label="Músculos trabajados (espalda)">
        <BackFigure level={level} />
        <text x="50" y="207" className="mm-caption" textAnchor="middle">
          Espalda
        </text>
      </svg>
    </div>
  );
}

type Level = (k: MuscleKey) => string;

/** Cabeza, cuello, manos y pies — neutros en ambas vistas. */
function Neutral(): ReactNode {
  return (
    <g className="mm-base">
      <circle cx="50" cy="16" r="10" />
      <rect x="45" y="24" width="10" height="7" rx="2" />
      <circle cx="15" cy="104" r="4.5" />
      <circle cx="85" cy="104" r="4.5" />
      <ellipse cx="41" cy="202" rx="5" ry="4" />
      <ellipse cx="59" cy="202" rx="5" ry="4" />
    </g>
  );
}

/** Silueta gris de fondo (torso, brazos, piernas). */
function BaseBody(): ReactNode {
  return (
    <g className="mm-base">
      <polygon points="31,35 69,35 62,99 38,99" />
      <polygon points="38,98 62,98 60,116 40,116" />
      <ellipse cx="22" cy="58" rx="7" ry="16" />
      <ellipse cx="18" cy="84" rx="6" ry="16" />
      <ellipse cx="78" cy="58" rx="7" ry="16" />
      <ellipse cx="82" cy="84" rx="6" ry="16" />
      <ellipse cx="40" cy="150" rx="11" ry="36" />
      <ellipse cx="60" cy="150" rx="11" ry="36" />
      <ellipse cx="40" cy="186" rx="7.5" ry="22" />
      <ellipse cx="60" cy="186" rx="7.5" ry="22" />
    </g>
  );
}

function FrontFigure({ level }: { level: Level }) {
  return (
    <g>
      <BaseBody />
      <Neutral />
      {/* hombros */}
      <circle cx="30" cy="41" r="9" className={level('hombros')} />
      <circle cx="70" cy="41" r="9" className={level('hombros')} />
      {/* pecho */}
      <ellipse cx="42" cy="49" rx="8" ry="7" className={level('pecho')} />
      <ellipse cx="58" cy="49" rx="8" ry="7" className={level('pecho')} />
      {/* biceps */}
      <ellipse cx="23" cy="58" rx="6" ry="13" className={level('biceps')} />
      <ellipse cx="77" cy="58" rx="6" ry="13" className={level('biceps')} />
      {/* antebrazo */}
      <ellipse cx="18" cy="84" rx="5" ry="14" className={level('antebrazo')} />
      <ellipse cx="82" cy="84" rx="5" ry="14" className={level('antebrazo')} />
      {/* oblicuos */}
      <ellipse cx="37" cy="74" rx="4" ry="12" className={level('oblicuos')} />
      <ellipse cx="63" cy="74" rx="4" ry="12" className={level('oblicuos')} />
      {/* abdomen */}
      <rect x="43" y="58" width="14" height="34" rx="4" className={level('abdomen')} />
      {/* cuadriceps */}
      <ellipse cx="40" cy="140" rx="9" ry="27" className={level('cuadriceps')} />
      <ellipse cx="60" cy="140" rx="9" ry="27" className={level('cuadriceps')} />
      {/* aductores */}
      <ellipse cx="50" cy="134" rx="4.5" ry="18" className={level('aductores')} />
      {/* gemelos (tibial anterior) */}
      <ellipse cx="40" cy="182" rx="6" ry="19" className={level('gemelos')} />
      <ellipse cx="60" cy="182" rx="6" ry="19" className={level('gemelos')} />
    </g>
  );
}

function BackFigure({ level }: { level: Level }) {
  return (
    <g>
      <BaseBody />
      <Neutral />
      {/* trapecio */}
      <polygon points="40,33 60,33 54,54 46,54" className={level('trapecio')} />
      {/* hombros posteriores */}
      <circle cx="30" cy="41" r="9" className={level('hombros')} />
      <circle cx="70" cy="41" r="9" className={level('hombros')} />
      {/* espalda alta (romboides) */}
      <rect x="40" y="50" width="20" height="12" rx="3" className={level('espalda_alta')} />
      {/* dorsal (lats) */}
      <polygon points="35,55 44,58 42,78 33,72" className={level('dorsal')} />
      <polygon points="65,55 56,58 58,78 67,72" className={level('dorsal')} />
      {/* triceps */}
      <ellipse cx="23" cy="58" rx="6" ry="13" className={level('triceps')} />
      <ellipse cx="77" cy="58" rx="6" ry="13" className={level('triceps')} />
      {/* antebrazo */}
      <ellipse cx="18" cy="84" rx="5" ry="14" className={level('antebrazo')} />
      <ellipse cx="82" cy="84" rx="5" ry="14" className={level('antebrazo')} />
      {/* lumbar */}
      <rect x="43" y="78" width="14" height="14" rx="2" className={level('lumbar')} />
      {/* gluteos */}
      <ellipse cx="41" cy="105" rx="9" ry="11" className={level('gluteos')} />
      <ellipse cx="59" cy="105" rx="9" ry="11" className={level('gluteos')} />
      {/* isquios */}
      <ellipse cx="40" cy="146" rx="9" ry="26" className={level('isquios')} />
      <ellipse cx="60" cy="146" rx="9" ry="26" className={level('isquios')} />
      {/* gemelos */}
      <ellipse cx="40" cy="184" rx="7" ry="20" className={level('gemelos')} />
      <ellipse cx="60" cy="184" rx="7" ry="20" className={level('gemelos')} />
    </g>
  );
}
