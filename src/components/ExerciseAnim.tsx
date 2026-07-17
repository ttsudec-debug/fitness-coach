import { getAnim } from '../fitness/anims';
import { getExerciseInfo } from '../fitness/exercises';

/** Miniatura animada del ejercicio: dos cuadros que se alternan estilo GIF. */
export default function ExerciseAnim({
  name,
  size = 96,
  big = false,
}: {
  name: string;
  size?: number;
  big?: boolean;
}) {
  const key = getExerciseInfo(name)?.anim;
  const anim = key ? getAnim(key) : undefined;
  if (!anim) return null;

  return (
    <svg
      viewBox="0 0 120 100"
      width={size}
      height={Math.round(size * (100 / 120))}
      className={big ? 'exanim big' : 'exanim'}
      aria-hidden="true"
    >
      <line x1={10} y1={92} x2={110} y2={92} className="ex-ground" />
      {anim.frames.map((f, i) => (
        <g key={i} className={i === 0 ? 'f1' : 'f2'}>
          {f.fig.map((pl, j) => (
            <polyline key={j} points={pl} className="ex-fig" />
          ))}
          {f.prop?.map((pl, j) => (
            <polyline key={j} points={pl} className="ex-prop" />
          ))}
          {f.discs?.map(([x, y, r], j) => (
            <circle key={j} cx={x} cy={y} r={r} className="ex-disc" />
          ))}
          <circle cx={f.head[0]} cy={f.head[1]} r={5.5} className="ex-head" />
        </g>
      ))}
    </svg>
  );
}
