import { getExerciseInfo } from '../fitness/exercises';
import ExerciseMedia from './ExerciseMedia';
import { BodyMap } from './BodyMap';

/** Ficha de técnica de un ejercicio, como bottom-sheet.
 * Si se pasa onSubstitute, cada sustituto ofrece un botón "Usar". */
export default function ExerciseSheet({
  name,
  onClose,
  onSubstitute,
}: {
  name: string;
  onClose: () => void;
  onSubstitute?: (newName: string) => void;
}) {
  const info = getExerciseInfo(name);
  if (!info) return null;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3>{name}</h3>
          <button className="btn small ghost" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <ExerciseMedia name={name} size={190} big />
        {info.mg && (
          <>
            <h4>Músculos trabajados</h4>
            <div style={{ background: '#000', padding: '10px 0', borderRadius: '8px', marginBottom: '15px' }}>
              <BodyMap 
                readonly 
                activeRegions={[...info.mg.primary, ...info.mg.secondary]} 
              />
            </div>
          </>
        )}
        <p className="muted small-text">{info.muscles}</p>
        <h4>Técnica</h4>
        <ul className="sheet-list">
          {info.technique.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
        <h4>Error común</h4>
        <p className="small-text">{info.mistake}</p>
        {info.substitutes.length > 0 && (
          <>
            <h4>Sustituciones</h4>
            <div className="chip-row">
              {info.substitutes.map((s) => (
                <span key={s} className="chip">
                  {s}
                  {onSubstitute && (
                    <button
                      className="chip-btn"
                      onClick={() => {
                        onSubstitute(s);
                        onClose();
                      }}
                    >
                      Usar
                    </button>
                  )}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
