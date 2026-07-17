import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DAY_NAMES, type Routine } from '../db';

const EMPTY: Routine = {
  name: '',
  days: [],
  exercises: [{ name: '', sets: 3, reps: 10, weight: 0, restSec: 90 }],
};

export default function Routines() {
  const routines = useLiveQuery(() => db.routines.toArray(), []);
  const [editing, setEditing] = useState<Routine | null>(null);

  if (!routines) return null;

  async function save() {
    if (!editing || !editing.name.trim()) return;
    const clean: Routine = {
      ...editing,
      name: editing.name.trim(),
      exercises: editing.exercises.filter((e) => e.name.trim() !== ''),
    };
    await db.routines.put(clean);
    setEditing(null);
  }

  async function remove(id: number) {
    await db.routines.delete(id);
    setEditing(null);
  }

  if (editing) {
    return (
      <div className="view">
        <header className="view-head">
          <h1>{editing.id ? 'Editar rutina' : 'Nueva rutina'}</h1>
        </header>
        <div className="card">
          <label className="field">
            <span>Nombre</span>
            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Ej: Piernas y glúteos"
            />
          </label>
          <div className="field">
            <span>Días</span>
            <div className="day-toggles">
              {DAY_NAMES.map((d, i) => (
                <button
                  key={i}
                  className={editing.days.includes(i) ? 'day active' : 'day'}
                  onClick={() =>
                    setEditing({
                      ...editing,
                      days: editing.days.includes(i)
                        ? editing.days.filter((x) => x !== i)
                        : [...editing.days, i].sort(),
                    })
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
        <h3 className="section-title">Ejercicios</h3>
        {editing.exercises.map((ex, i) => (
          <div key={i} className="card exercise-edit">
            <input
              className="ex-name"
              value={ex.name}
              placeholder="Nombre del ejercicio"
              onChange={(e) => {
                const exercises = [...editing.exercises];
                exercises[i] = { ...ex, name: e.target.value };
                setEditing({ ...editing, exercises });
              }}
            />
            <div className="ex-nums">
              {(
                [
                  ['sets', 'series'],
                  ['reps', 'reps'],
                  ['weight', 'kg'],
                  ['restSec', 'desc. (s)'],
                ] as const
              ).map(([field, label]) => (
                <label key={field}>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={ex[field]}
                    onChange={(e) => {
                      const exercises = [...editing.exercises];
                      exercises[i] = { ...ex, [field]: Number(e.target.value) };
                      setEditing({ ...editing, exercises });
                    }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <button
              className="btn small ghost"
              onClick={() =>
                setEditing({
                  ...editing,
                  exercises: editing.exercises.filter((_, x) => x !== i),
                })
              }
            >
              Quitar ejercicio
            </button>
          </div>
        ))}
        <button
          className="btn ghost"
          onClick={() =>
            setEditing({
              ...editing,
              exercises: [
                ...editing.exercises,
                { name: '', sets: 3, reps: 10, weight: 0, restSec: 90 },
              ],
            })
          }
        >
          + Agregar ejercicio
        </button>
        <div className="actions">
          <button className="btn primary" onClick={() => void save()}>
            Guardar
          </button>
          <button className="btn ghost" onClick={() => setEditing(null)}>
            Cancelar
          </button>
          {editing.id && (
            <button className="btn danger" onClick={() => void remove(editing.id!)}>
              Eliminar rutina
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="view">
      <header className="view-head">
        <h1>Rutinas</h1>
      </header>
      {routines.map((r) => (
        <section key={r.id} className="card" onClick={() => setEditing(structuredClone(r))}>
          <h3>{r.name}</h3>
          <p className="muted">
            {r.exercises.length} ejercicios · {r.days.map((d) => DAY_NAMES[d]).join(', ') || 'sin días'}
          </p>
        </section>
      ))}
      <button className="btn primary" onClick={() => setEditing(structuredClone(EMPTY))}>
        + Nueva rutina
      </button>
    </div>
  );
}
