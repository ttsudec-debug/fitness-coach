import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, todayStr, getSetting, setSetting, type Workout } from '../db';
import LineChart from '../components/LineChart';
import { strengthHistory, trackedExercises, personalRecords } from '../fitness/records';
import type { Profile } from '../fitness/metrics';

function workoutVolume(w: Workout): number {
  return w.exercises.reduce(
    (acc, e) =>
      acc + e.sets.filter((s) => s.done).reduce((a, s) => a + s.reps * s.weight, 0),
    0,
  );
}

function weekStart(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // lunes = 0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function shortDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

interface WeekStat {
  label: string;
  volume: number;
  sessions: number;
}

function weeklyStats(workouts: Workout[]): WeekStat[] {
  const weeks: WeekStat[] = [];
  const byKey = new Map<number, { volume: number; sessions: number }>();
  for (const w of workouts) {
    const key = weekStart(new Date(w.date + 'T12:00:00')).getTime();
    const cur = byKey.get(key) ?? { volume: 0, sessions: 0 };
    cur.volume += workoutVolume(w);
    cur.sessions += 1;
    byKey.set(key, cur);
  }
  const thisWeek = weekStart(new Date());
  for (let i = 7; i >= 0; i--) {
    const ws = new Date(thisWeek);
    ws.setDate(ws.getDate() - i * 7);
    const stat = byKey.get(ws.getTime()) ?? { volume: 0, sessions: 0 };
    weeks.push({
      label: `${ws.getDate()}/${ws.getMonth() + 1}`,
      volume: Math.round(stat.volume),
      sessions: stat.sessions,
    });
  }
  return weeks;
}

/** Gráfico de barras de una sola serie (volumen semanal), SVG inline. */
function VolumeChart({ weeks }: { weeks: WeekStat[] }) {
  const [sel, setSel] = useState<number | null>(null);
  const W = 340;
  const H = 150;
  const pad = { top: 18, bottom: 22, left: 6, right: 6 };
  const max = Math.max(...weeks.map((w) => w.volume), 1);
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const gap = 2;
  const bw = innerW / weeks.length - gap;
  const maxIdx = weeks.findIndex((w) => w.volume === max);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Volumen semanal (kg)">
        {weeks.map((w, i) => {
          const h = (w.volume / max) * innerH;
          const x = pad.left + i * (bw + gap) + gap / 2;
          const y = pad.top + innerH - h;
          const showLabel = w.volume > 0 && (i === maxIdx || i === weeks.length - 1 || sel === i);
          return (
            <g key={i} onClick={() => setSel(sel === i ? null : i)}>
              <rect
                x={x}
                y={pad.top}
                width={bw}
                height={innerH}
                fill="transparent"
              />
              {w.volume > 0 && (
                <rect x={x} y={y} width={bw} height={h} rx={4} className="bar" />
              )}
              {showLabel && (
                <text x={x + bw / 2} y={y - 5} className="bar-label" textAnchor="middle">
                  {w.volume.toLocaleString('es')}
                </text>
              )}
              <text
                x={x + bw / 2}
                y={H - 6}
                className="axis-label"
                textAnchor="middle"
              >
                {w.label}
              </text>
            </g>
          );
        })}
      </svg>
      {sel !== null && (
        <p className="muted small-text">
          Semana del {weeks[sel].label}: {weeks[sel].volume.toLocaleString('es')} kg ·{' '}
          {weeks[sel].sessions} {weeks[sel].sessions === 1 ? 'sesión' : 'sesiones'}
        </p>
      )}
    </div>
  );
}

/** Registro de peso corporal (y cintura opcional) con tendencia. */
function BodyCard() {
  const logs = useLiveQuery(() => db.bodyLogs.orderBy('date').toArray(), []);
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!logs || logs.length === 0 || weight !== '') return;
    setWeight(String(logs[logs.length - 1].weightKg));
  }, [logs]); // precarga el último peso como punto de partida

  if (!logs) return null;

  async function save() {
    const kg = Number(weight.replace(',', '.'));
    if (!kg || kg <= 0) return;
    const cm = Number(waist.replace(',', '.')) || undefined;
    const today = todayStr();
    const existing = logs!.find((l) => l.date === today);
    if (existing) {
      await db.bodyLogs.update(existing.id!, { weightKg: kg, waistCm: cm });
    } else {
      await db.bodyLogs.add({ date: today, weightKg: kg, waistCm: cm });
    }
    // Mantiene la evaluación al día: kcal/proteína/agua se recalculan con este peso.
    const raw = await getSetting('profile');
    if (raw) {
      const p = JSON.parse(raw) as Profile;
      await setSetting('profile', JSON.stringify({ ...p, weightKg: kg }));
    }
    setMsg(`Registrado ✓ ${kg} kg (${today})`);
  }

  const last = logs[logs.length - 1];
  const prev = logs.length > 1 ? logs[logs.length - 2] : null;
  const first = logs.length > 1 ? logs[0] : null;
  const fmtDelta = (d: number) => `${d > 0 ? '+' : ''}${(Math.round(d * 10) / 10).toLocaleString('es')} kg`;
  const points = logs.slice(-20).map((l) => ({ label: shortDate(l.date), value: l.weightKg }));

  return (
    <section className="card">
      <h3>⚖️ Peso corporal</h3>
      <div className="ex-nums two">
        <label>
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            placeholder="kg"
            onChange={(e) => setWeight(e.target.value)}
          />
          <span>peso (kg)</span>
        </label>
        <label>
          <input
            type="number"
            inputMode="decimal"
            value={waist}
            placeholder="opcional"
            onChange={(e) => setWaist(e.target.value)}
          />
          <span>cintura (cm)</span>
        </label>
      </div>
      <button className="btn small" onClick={() => void save()}>
        Registrar hoy
      </button>
      {msg && <p className="ok small-text">{msg}</p>}
      {points.length >= 2 && <LineChart points={points} unit="kg" decimals={1} />}
      {last && (prev || first) && (
        <p className="muted small-text">
          {prev && <>Desde el último registro: {fmtDelta(last.weightKg - prev.weightKg)}. </>}
          {first && <>Desde el inicio ({shortDate(first.date)}): {fmtDelta(last.weightKg - first.weightKg)}.</>}
          {last.waistCm ? <> Cintura: {last.waistCm.toLocaleString('es')} cm.</> : null}
        </p>
      )}
      {logs.length === 0 && (
        <p className="muted small-text">
          Pesate 1–2 veces por semana, siempre a la misma hora, y mirá la tendencia (no el día a día).
        </p>
      )}
    </section>
  );
}

/** Evolución de fuerza (1RM estimada, Epley) por ejercicio + récord actual. */
function StrengthCard({ workouts }: { workouts: Workout[] }) {
  const tracked = trackedExercises(workouts);
  const [sel, setSel] = useState('');
  const name = tracked.includes(sel) ? sel : tracked[0];
  if (!name) return null;

  const points = strengthHistory(workouts, name)
    .slice(-20)
    .map((p) => ({ label: shortDate(p.date), value: p.e1 }));
  const record = personalRecords(workouts).get(name);

  return (
    <section className="card">
      <h3>🏆 Fuerza por ejercicio</h3>
      <label className="field">
        <span>Ejercicio (1RM estimada)</span>
        <select value={name} onChange={(e) => setSel(e.target.value)}>
          {tracked.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <LineChart points={points} unit="kg (e1RM)" />
      {record && (
        <p className="muted small-text">
          Récord: {record.weight.toLocaleString('es')} kg × {record.reps} el {shortDate(record.date)}{' '}
          (1RM estimada {record.e1} kg).
        </p>
      )}
    </section>
  );
}

export default function History() {
  const workouts = useLiveQuery(() => db.workouts.orderBy('date').reverse().toArray(), []);
  if (!workouts) return null;

  const weeks = weeklyStats(workouts);
  const thisWeek = weeks[weeks.length - 1];

  return (
    <div className="view">
      <header className="view-head">
        <h1>Progreso</h1>
      </header>
      <div className="stat-row">
        <div className="stat-tile">
          <span className="stat-value">{thisWeek.sessions}</span>
          <span className="stat-label">sesiones esta semana</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{thisWeek.volume.toLocaleString('es')}</span>
          <span className="stat-label">kg esta semana</span>
        </div>
      </div>
      <section className="card">
        <h3>Volumen semanal (kg)</h3>
        <VolumeChart weeks={weeks} />
      </section>
      <StrengthCard workouts={workouts} />
      <BodyCard />
      <section className="card">
        <h3>Entrenamientos</h3>
        {workouts.length === 0 && <p className="muted">Todavía no registraste ninguno.</p>}
        {workouts.map((w) => {
          const doneSets = w.exercises.reduce(
            (a, e) => a + e.sets.filter((s) => s.done).length,
            0,
          );
          const mins =
            w.finishedAt && w.startedAt
              ? Math.round((w.finishedAt - w.startedAt) / 60000)
              : null;
          return (
            <div key={w.id} className="history-row">
              <div>
                <strong>{w.routineName}</strong>
                <p className="muted small-text">
                  {w.date} · {doneSets} series · {Math.round(workoutVolume(w))} kg
                  {mins !== null ? ` · ${mins} min` : ''}
                </p>
              </div>
              <button
                className="btn small ghost"
                onClick={() => void db.workouts.delete(w.id!)}
                aria-label="Borrar"
              >
                🗑
              </button>
            </div>
          );
        })}
      </section>
    </div>
  );
}
