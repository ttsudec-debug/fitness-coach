import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, todayStr, DAY_NAMES, type Routine, type ExerciseLog } from '../db';
import RestTimer from '../components/RestTimer';
import ExerciseSheet from '../components/ExerciseSheet';
import ExerciseAnim from '../components/ExerciseAnim';
import { IconInfo } from '../components/icons';
import { progressionSuggestions, deloadCheck, type Suggestion } from '../fitness/progression';
import { newPRs, type PR } from '../fitness/records';
import { getExerciseInfo } from '../fitness/exercises';
import { warmupFor, stretchFor, type MobilityItem } from '../fitness/warmup';

const HINT_ICON: Record<Suggestion['kind'], string> = { up: '↑ ', repeat: '↻ ', deload: '↓ ' };
const HINT_CLASS: Record<Suggestion['kind'], string> = {
  up: 'ok small-text',
  repeat: 'muted small-text',
  deload: 'warn-text small-text',
};

const CONFETTI_COLORS = ['var(--accent)', 'var(--cool)', 'var(--ink)'];

function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 26 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${(i * 37 + 11) % 100}%`,
            background: CONFETTI_COLORS[i % 3],
            animationDelay: `${(i % 7) * 0.11}s`,
          }}
        />
      ))}
    </div>
  );
}

function MobilityList({
  items,
  done,
  onToggle,
}: {
  items: MobilityItem[];
  done: boolean[];
  onToggle: (i: number) => void;
}) {
  return (
    <section className="card">
      {items.map((it, i) => (
        <div key={i} className={done[i] ? 'mob-row done' : 'mob-row'}>
          <button className="mob-check" onClick={() => onToggle(i)} aria-label={it.name}>
            {done[i] ? '✓' : ''}
          </button>
          <div>
            <strong>{it.name}</strong>
            <p className="muted small-text">{it.detail}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

type Phase = 'home' | 'warmup' | 'lifting' | 'stretch';

export default function Today() {
  const dow = new Date().getDay();
  const routines = useLiveQuery(() => db.routines.toArray(), []);
  const doneToday = useLiveQuery(
    () => db.workouts.where('date').equals(todayStr()).toArray(),
    [],
  );
  const [phase, setPhase] = useState<Phase>('home');
  const [active, setActive] = useState<Routine | null>(null);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [rest, setRest] = useState<{ sec: number; id: number } | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [hints, setHints] = useState<Map<string, Suggestion>>(new Map());
  const [deloadMsg, setDeloadMsg] = useState<string | null>(null);
  const [prs, setPrs] = useState<PR[]>([]);
  const [sheet, setSheet] = useState<string | null>(null);
  const [mobility, setMobility] = useState<MobilityItem[]>([]);
  const [mobilityDone, setMobilityDone] = useState<boolean[]>([]);

  useEffect(() => {
    void deloadCheck().then(setDeloadMsg);
  }, [doneToday?.length]);

  if (!routines) return null;
  const todays = routines.filter((r) => r.days.includes(dow));

  async function start(r: Routine) {
    const sug = await progressionSuggestions();
    setHints(sug);
    setActive(r);
    setStartedAt(Date.now());
    setPrs([]);
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
    const warm = warmupFor(r.exercises);
    setMobility(warm);
    setMobilityDone(warm.map(() => false));
    setPhase('warmup');
  }

  function toggleMobility(i: number) {
    setMobilityDone((prev) => prev.map((d, x) => (x === i ? !d : d)));
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

  function reset() {
    setPhase('home');
    setActive(null);
    setLogs([]);
    setRest(null);
    setSheet(null);
  }

  async function finish() {
    if (!active) return;
    const records = await newPRs(logs, todayStr());
    await db.workouts.add({
      date: todayStr(),
      routineId: active.id!,
      routineName: active.name,
      exercises: logs,
      startedAt,
      finishedAt: Date.now(),
    });
    setPrs(records);
    const stretch = stretchFor(active.exercises);
    setMobility(stretch);
    setMobilityDone(stretch.map(() => false));
    setRest(null);
    setSheet(null);
    setPhase('stretch');
  }

  if (phase === 'warmup' && active) {
    return (
      <div className="view">
        <header className="view-head">
          <div>
            <p className="eyebrow">Calentamiento · 5 min</p>
            <h1>{active.name}</h1>
          </div>
        </header>
        <p className="muted small-text">
          Entrar en calor sube el rendimiento y baja el riesgo de lesión. Marcá lo que vayas
          haciendo.
        </p>
        <MobilityList items={mobility} done={mobilityDone} onToggle={toggleMobility} />
        <div className="actions">
          <button className="btn primary" onClick={() => setPhase('lifting')}>
            Empezar ejercicios
          </button>
          <button className="btn ghost" onClick={reset}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'stretch' && active) {
    return (
      <div className="view">
        {prs.length > 0 && <Confetti />}
        <header className="view-head">
          <div>
            <p className="eyebrow">Estiramiento · 5 min</p>
            <h1>Bien ahí</h1>
          </div>
        </header>
        {prs.length > 0 && (
          <div className="card ok">
            <h3>Récord personal</h3>
            {prs.map((p) => (
              <p key={p.name} className="small-text">
                {p.name}: {p.weight} kg × {p.reps} (1RM estimada {p.e1} kg)
              </p>
            ))}
          </div>
        )}
        <p className="muted small-text">
          Entrenamiento guardado. Cerrá con estos estiramientos suaves: sin rebotes, sin dolor.
        </p>
        <MobilityList items={mobility} done={mobilityDone} onToggle={toggleMobility} />
        <div className="actions">
          <button className="btn primary" onClick={reset}>
            Terminar
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'lifting' && active) {
    const totalSets = logs.reduce((a, e) => a + e.sets.length, 0);
    const doneSets = logs.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
    return (
      <div className="view">
        <header className="view-head">
          <div>
            <p className="eyebrow">
              {doneSets}/{totalSets} series
            </p>
            <h1>{active.name}</h1>
          </div>
        </header>
        {rest && (
          <RestTimer key={rest.id} seconds={rest.sec} onDone={() => setRest(null)} />
        )}
        {logs.map((ex, ei) => (
          <section key={ei} className="card">
            <div className="ex-head-row">
              <ExerciseAnim name={ex.name} size={64} />
              <h3>{ex.name}</h3>
              {getExerciseInfo(ex.name) && (
                <button
                  className="icon-btn"
                  onClick={() => setSheet(ex.name)}
                  aria-label={`Técnica de ${ex.name}`}
                >
                  <IconInfo />
                </button>
              )}
            </div>
            {hints.get(ex.name) && (
              <p className={HINT_CLASS[hints.get(ex.name)!.kind]}>
                {HINT_ICON[hints.get(ex.name)!.kind]}
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
        {sheet && <ExerciseSheet name={sheet} onClose={() => setSheet(null)} />}
        <div className="actions">
          <button className="btn primary" onClick={() => void finish()}>
            Terminar entrenamiento
          </button>
          <button className="btn ghost" onClick={reset}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view">
      <header className="view-head">
        <div>
          <p className="eyebrow">Hoy · {DAY_NAMES[dow]}</p>
          <h1>Entrenamiento</h1>
        </div>
      </header>
      {doneToday && doneToday.length > 0 && (
        <p className="ok">✓ Ya entrenaste hoy: {doneToday.map((w) => w.routineName).join(', ')}</p>
      )}
      {deloadMsg && (
        <div className="card warn">
          <p className="eyebrow">Semana de descarga sugerida</p>
          <p className="small-text">{deloadMsg}</p>
          <p className="muted small-text">
            Esta semana entrená los mismos ejercicios con ~60 % del peso habitual y las mismas
            series. Se recupera el cuerpo y volvés más fuerte.
          </p>
        </div>
      )}
      {todays.length === 0 && (
        <div className="card">
          <p>Hoy no tenés rutina asignada. Día de descanso.</p>
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
