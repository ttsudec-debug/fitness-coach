import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, todayStr, DAY_NAMES, type Routine, type ExerciseLog } from '../db';
import RestTimer from '../components/RestTimer';
import { progressionSuggestions, type Suggestion } from '../fitness/progression';

export default function Today() {
  const dow = new Date().getDay();
  const routines = useLiveQuery(() => db.routines.toArray(), []);
  const doneToday = useLiveQuery(
    () => db.workouts.where('date').equals(todayStr()).toArray(),
    [],
  );
  const [active, setActive] = useState<Routine | null>(null);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [rest, setRest] = useState<{ sec: number; id: number } | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [hints, setHints] = useState<Map<string, Suggestion>>(new Map());

  if (!routines) return null;
  const todays = routines.filter((r) => r.days.includes(dow));

  async function start(r: Routine) {
    const sug = await progressionSuggestions();
    setHints(sug);
    setActive(r);
    setStartedAt(Date.now());
    setLogs(
      r.exercises.map((e) => ({
        name: e.name,
        sets: Array.from({ length: e.sets }, () => ({
          reps: e.reps,
          weight: sug.get(e.name)?.weight ?? e.weight,
          done: false,
        })),
      })),
    );
  }

  function toggleSet(ei: number, si: number) {
    setLogs((prev) => {
      const next = prev.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) }));
      const set = next[ei].sets[si];
      set.done = !set.done;
      if (set.done && active) {
        setRest({ sec: active.exercises[ei]?.restSec ?? 60, id: Date.now() });
      }
      return next;
    });
  }

  function updateSet(ei: number, si: number, field: 'reps' | 'weight', value: number) {
    setLogs((prev) => {
      const next = prev.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) }));
      next[ei].sets[si][field] = value;
      return next;
    });
  }

  async function finish() {
    if (!active) return;
    await db.workouts.add({
      date: todayStr(),
      routineId: active.id!,
      routineName: active.name,
      exercises: logs,
      startedAt,
      finishedAt: Date.now(),
    });
    setActive(null);
    setLogs([]);
    setRest(null);
  }

  if (active) {
    const totalSets = logs.reduce((a, e) => a + e.sets.length, 0);
    const doneSets = logs.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
    return (
      <div className="view">
        <header className="view-head">
          <h1>{active.name}</h1>
          <p className="muted">
            {doneSets}/{totalSets} series completadas
          </p>
        </header>
        {rest && (
          <RestTimer key={rest.id} seconds={rest.sec} onDone={() => setRest(null)} />
        )}
        {logs.map((ex, ei) => (
          <section key={ei} className="card">
            <h3>{ex.name}</h3>
            {hints.get(ex.name) && (
              <p className={hints.get(ex.name)!.up ? 'ok small-text' : 'muted small-text'}>
                {hints.get(ex.name)!.up ? '↑ ' : '↻ '}
                {hints.get(ex.name)!.reason}
              </p>
            )}
            {ex.sets.map((s, si) => (
              <div key={si} className={s.done ? 'set-row done' : 'set-row'}>
                <button className="set-check" onClick={() => toggleSet(ei, si)}>
                  {s.done ? '✓' : si + 1}
                </button>
                <label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={s.reps}
                    onChange={(e) => updateSet(ei, si, 'reps', Number(e.target.value))}
                  />
                  <span>reps</span>
                </label>
                <label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={s.weight}
                    onChange={(e) => updateSet(ei, si, 'weight', Number(e.target.value))}
                  />
                  <span>kg</span>
                </label>
              </div>
            ))}
          </section>
        ))}
        <div className="actions">
          <button className="btn primary" onClick={() => void finish()}>
            Terminar entrenamiento
          </button>
          <button className="btn ghost" onClick={() => setActive(null)}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view">
      <header className="view-head">
        <h1>Hoy · {DAY_NAMES[dow]}</h1>
        {doneToday && doneToday.length > 0 && (
          <p className="ok">✓ Ya entrenaste hoy: {doneToday.map((w) => w.routineName).join(', ')}</p>
        )}
      </header>
      {todays.length === 0 && (
        <div className="card">
          <p>Hoy no tenés rutina asignada. Día de descanso 😌</p>
          <p className="muted">¿Querés entrenar igual? Elegí cualquier rutina abajo.</p>
        </div>
      )}
      {(todays.length > 0 ? todays : routines).map((r) => (
        <section key={r.id} className="card">
          <h3>{r.name}</h3>
          <p className="muted">
            {r.exercises.length} ejercicios ·{' '}
            {r.days.map((d) => DAY_NAMES[d]).join(', ')}
          </p>
          <button className="btn primary" onClick={() => void start(r)}>
            Empezar
          </button>
        </section>
      ))}
      {routines.length === 0 && (
        <div className="card">
          <p>No hay rutinas todavía. Creá una en la pestaña Rutinas.</p>
        </div>
      )}
    </div>
  );
}
