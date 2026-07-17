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

  const pct = Math.max(0, (left / seconds) * 100);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');

  return (
    <div className="rest-timer">
      <div className="rest-info">
        <span>Descanso</span>
        <strong>
          {mm}:{ss}
        </strong>
        <button className="btn small ghost" onClick={onDone}>
          Saltar
        </button>
      </div>
      <div className="rest-bar">
        <div className="rest-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
