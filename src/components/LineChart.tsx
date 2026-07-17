import { useState } from 'react';

export interface LinePoint {
  label: string;
  value: number;
}

/** Gráfico de línea de una sola serie, SVG inline (mismo estilo que el de barras). */
export default function LineChart({
  points,
  unit = '',
  decimals = 0,
}: {
  points: LinePoint[];
  unit?: string;
  decimals?: number;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const W = 340;
  const H = 150;
  const pad = { top: 18, bottom: 22, left: 10, right: 10 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const yOf = (v: number) => pad.top + innerH - ((v - min) / span) * innerH;
  const xOf = (i: number) =>
    points.length === 1 ? pad.left + innerW / 2 : pad.left + (i / (points.length - 1)) * innerW;

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(i)},${yOf(p.value)}`).join(' ');
  const fmt = (v: number) => v.toLocaleString('es', { maximumFractionDigits: decimals });
  // Etiquetas de eje: primera, última y hasta 2 intermedias para no amontonar.
  const step = Math.max(1, Math.ceil(points.length / 4));
  const maxIdx = values.indexOf(max);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`Evolución${unit ? ` (${unit})` : ''}`}>
        <path d={path} className="line" />
        {points.map((p, i) => {
          const showLabel = i === maxIdx || i === points.length - 1 || sel === i;
          return (
            <g key={i} onClick={() => setSel(sel === i ? null : i)}>
              <rect
                x={xOf(i) - innerW / points.length / 2}
                y={pad.top - 10}
                width={innerW / points.length}
                height={innerH + 20}
                fill="transparent"
              />
              <circle cx={xOf(i)} cy={yOf(p.value)} r={sel === i ? 5 : 3.5} className="dot" />
              {showLabel && (
                <text x={xOf(i)} y={yOf(p.value) - 8} className="bar-label" textAnchor="middle">
                  {fmt(p.value)}
                </text>
              )}
              {(i % step === 0 || i === points.length - 1) && (
                <text x={xOf(i)} y={H - 6} className="axis-label" textAnchor="middle">
                  {p.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {sel !== null && (
        <p className="muted small-text">
          {points[sel].label}: {fmt(points[sel].value)} {unit}
        </p>
      )}
    </div>
  );
}
