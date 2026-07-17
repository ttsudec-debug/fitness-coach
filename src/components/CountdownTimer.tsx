import { useEffect, useState } from 'react';
import { getSetting, setSetting } from '../db';

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function presetLabel(sec: number): string {
  return sec >= 60 ? `${Math.round(sec / 60)} min` : `${sec} s`;
}

/** Minutero configurable con presets: cuenta regresiva, pausa y reinicio.
 * Vibra al terminar. Si se pasa settingKey, recuerda el último preset elegido. */
export default function CountdownTimer({
  label,
  presets,
  defaultSec,
  settingKey,
}: {
  label: string;
  presets: number[];
  defaultSec: number;
  settingKey?: string;
}) {
  const [total, setTotal] = useState(defaultSec);
  const [left, setLeft] = useState(defaultSec);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!settingKey) return;
    void getSetting(settingKey).then((v) => {
      const n = Number(v);
      if (n > 0) {
        setTotal(n);
        setLeft(n);
      }
    });
  }, [settingKey]);

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      setRunning(false);
      setFinished(true);
      if ('vibrate' in navigator) navigator.vibrate([300, 150, 300, 150, 300]);
      return;
    }
    const t = window.setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [running, left]);

  function pick(sec: number) {
    setTotal(sec);
    setLeft(sec);
    setRunning(false);
    setFinished(false);
    if (settingKey) void setSetting(settingKey, String(sec));
  }

  function reset() {
    setLeft(total);
    setRunning(false);
    setFinished(false);
  }

  const frac = total > 0 ? Math.max(0, left / total) : 0;

  return (
    <section className="card timer-card">
      <p className="eyebrow">{label}</p>
      <div className="timer-row">
        <svg viewBox="0 0 60 60" width="56" height="56" className="rest-ring" aria-hidden="true">
          <circle cx="30" cy="30" r="25" className="track" />
          <circle
            cx="30"
            cy="30"
            r="25"
            className="left"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - frac}
            transform="rotate(-90 30 30)"
          />
        </svg>
        <strong className="timer-time">{fmt(left)}</strong>
        <div className="timer-actions">
          <button className="btn small primary" onClick={() => setRunning(!running)} disabled={left <= 0}>
            {running ? 'Pausar' : left < total ? 'Seguir' : 'Empezar'}
          </button>
          <button className="btn small ghost" onClick={reset}>
            Reiniciar
          </button>
        </div>
      </div>
      <div className="chip-row">
        {presets.map((sec) => (
          <button
            key={sec}
            className={sec === total ? 'chip timer-chip active' : 'chip timer-chip'}
            onClick={() => pick(sec)}
          >
            {presetLabel(sec)}
          </button>
        ))}
      </div>
      {finished && <p className="ok small-text">Tiempo cumplido ✓</p>}
    </section>
  );
}
