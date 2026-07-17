import { useEffect, useState } from 'react';

export default function RestTimer({
  seconds,
  onDone,
}: {
  seconds: number;
  onDone: () => void;
}) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) {
      if ('vibrate' in navigator) navigator.vibrate([250, 120, 250]);
      onDone();
      return;
    }
    const t = window.setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);

  const frac = Math.max(0, left / seconds);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');

  return (
    <div className="rest-timer">
      <svg viewBox="0 0 60 60" width="52" height="52" className="rest-ring" aria-hidden="true">
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
      <div className="rest-label">
        <span className="muted small-text">Descanso</span>
        <br />
        <strong>
          {mm}:{ss}
        </strong>
      </div>
      <button className="btn small ghost" onClick={onDone}>
        Saltar
      </button>
    </div>
  );
}
