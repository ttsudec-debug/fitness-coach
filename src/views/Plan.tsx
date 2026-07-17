import { useEffect, useState } from 'react';
import { db, getSetting, setSetting } from '../db';
import {
  computeTargets,
  suggestedReminderTime,
  todaysFoodTip,
  type Profile,
} from '../fitness/metrics';
import { generatePlan } from '../fitness/templates';

const DEFAULT: Profile = {
  age: 30,
  sex: 'M',
  weightKg: 75,
  heightCm: 175,
  experience: 'novato',
  goal: 'musculo',
  daysPerWeek: 3,
  workStart: '09:00',
  workEnd: '18:00',
  trainWhen: 'despues',
  equipment: 'gym',
  injuries: '',
};

export default function Plan() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile>(DEFAULT);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    void (async () => {
      const raw = await getSetting('profile');
      if (raw) {
        const p = JSON.parse(raw) as Profile;
        setProfile(p);
        setForm(p);
      } else {
        setEditing(true);
      }
    })();
  }, []);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    await setSetting('profile', JSON.stringify(form));
    const reminder = suggestedReminderTime(form);
    await setSetting('reminderTime', reminder);
    setProfile(form);
    setEditing(false);
    setMsg(`Evaluación guardada ✓ Recordatorio sugerido: ${reminder} (activalo en Ajustes)`);
  }

  async function applyPlan() {
    if (!profile) return;
    const routines = generatePlan(profile);
    await db.routines.bulkAdd(routines);
    setMsg(`${routines.length} rutinas agregadas ✓ Cargá tus pesos iniciales en cada ejercicio; después la progresión te sugiere cuánto subir.`);
  }

  if (editing) {
    return (
      <div className="view">
        <header className="view-head">
          <h1>Evaluación inicial</h1>
        </header>
        <section className="card">
          <div className="ex-nums two">
            <label>
              <input type="number" value={form.age} onChange={(e) => set('age', Number(e.target.value))} />
              <span>edad</span>
            </label>
            <label>
              <select value={form.sex} onChange={(e) => set('sex', e.target.value as Profile['sex'])}>
                <option value="M">Hombre</option>
                <option value="F">Mujer</option>
              </select>
              <span>sexo</span>
            </label>
            <label>
              <input type="number" value={form.weightKg} onChange={(e) => set('weightKg', Number(e.target.value))} />
              <span>peso (kg)</span>
            </label>
            <label>
              <input type="number" value={form.heightCm} onChange={(e) => set('heightCm', Number(e.target.value))} />
              <span>altura (cm)</span>
            </label>
          </div>
        </section>
        <section className="card">
          <label className="field">
            <span>Experiencia entrenando</span>
            <select value={form.experience} onChange={(e) => set('experience', e.target.value as Profile['experience'])}>
              <option value="novato">Novato (&lt;1 año)</option>
              <option value="intermedio">Intermedio (1–3 años)</option>
              <option value="avanzado">Avanzado (3+ años)</option>
            </select>
          </label>
          <label className="field">
            <span>Objetivo principal</span>
            <select value={form.goal} onChange={(e) => set('goal', e.target.value as Profile['goal'])}>
              <option value="musculo">Ganar músculo</option>
              <option value="fuerza">Ganar fuerza</option>
              <option value="grasa">Perder grasa</option>
              <option value="salud">Salud general</option>
            </select>
          </label>
          <label className="field">
            <span>Días por semana que podés entrenar</span>
            <select value={form.daysPerWeek} onChange={(e) => set('daysPerWeek', Number(e.target.value))}>
              {[2, 3, 4, 5, 6].map((d) => (
                <option key={d} value={d}>{d} días</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Equipamiento disponible</span>
            <select value={form.equipment} onChange={(e) => set('equipment', e.target.value as Profile['equipment'])}>
              <option value="smartfit">Smart Fit (máquinas y poleas)</option>
              <option value="gym">Gimnasio completo (barras libres)</option>
              <option value="mancuernas">Mancuernas en casa</option>
              <option value="casa">Solo peso corporal</option>
            </select>
          </label>
        </section>
        <section className="card">
          <h3>Tu horario laboral</h3>
          <div className="ex-nums two">
            <label>
              <input type="time" value={form.workStart} onChange={(e) => set('workStart', e.target.value)} />
              <span>entrada</span>
            </label>
            <label>
              <input type="time" value={form.workEnd} onChange={(e) => set('workEnd', e.target.value)} />
              <span>salida</span>
            </label>
          </div>
          <label className="field">
            <span>¿Cuándo preferís entrenar?</span>
            <select value={form.trainWhen} onChange={(e) => set('trainWhen', e.target.value as Profile['trainWhen'])}>
              <option value="antes">Antes del trabajo</option>
              <option value="despues">Después del trabajo</option>
            </select>
          </label>
          <label className="field">
            <span>Lesiones o molestias (opcional)</span>
            <input value={form.injuries} placeholder="Ej: molestia en rodilla derecha" onChange={(e) => set('injuries', e.target.value)} />
          </label>
        </section>
        <div className="actions">
          <button className="btn primary" onClick={() => void save()}>
            Guardar evaluación
          </button>
          {profile && (
            <button className="btn ghost" onClick={() => setEditing(false)}>
              Cancelar
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!profile) return null;
  const t = computeTargets(profile);

  return (
    <div className="view">
      <header className="view-head">
        <h1>Tu plan</h1>
        <button className="btn small ghost" onClick={() => setEditing(true)}>
          Editar evaluación
        </button>
      </header>
      {msg && <div className="card ok">{msg}</div>}
      <div className="stat-row">
        <div className="stat-tile">
          <span className="stat-value">{t.bmi}</span>
          <span className="stat-label">IMC ({t.bmiLabel})</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{t.kcal.toLocaleString('es')}</span>
          <span className="stat-label">kcal/día objetivo</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{t.proteinG} g</span>
          <span className="stat-label">proteína/día</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{(t.waterMl / 1000).toFixed(1)} L</span>
          <span className="stat-label">agua/día</span>
        </div>
      </div>
      <section className="card">
        <h3>Entrenamiento recomendado</h3>
        <p className="muted small-text">
          {profile.daysPerWeek} días/semana · volumen {t.setsPerMuscleWeek} series por músculo/semana ·
          gasto estimado {t.tdee.toLocaleString('es')} kcal/día.
          {profile.injuries && ` Ojo con: ${profile.injuries} — consultalo con el Coach.`}
        </p>
        <p className="muted small-text">
          Plantilla: {profile.daysPerWeek <= 3 ? 'Full Body' : profile.daysPerWeek === 4 ? 'Upper / Lower' : 'Push / Pull / Legs'} — progresión doble: cuando completás todas las series y reps, la app te sugiere subir peso.
        </p>
        <button className="btn primary" onClick={() => void applyPlan()}>
          Generar rutinas recomendadas
        </button>
      </section>
      <section className="card">
        <p className="eyebrow">Nutrición</p>
        <h3>Consejo de hoy</h3>
        <p>{todaysFoodTip()}</p>
        <p className="muted small-text">
          Guía diaria: ~{t.kcal.toLocaleString('es')} kcal · {t.proteinG} g proteína ·{' '}
          {t.carbG} g carbos · {t.fatG} g grasa · {(t.waterMl / 1000).toFixed(1)} L agua. Registrá
          tus comidas y seguí los macros en la pestaña <strong>Comida</strong>.
        </p>
      </section>
    </div>
  );
}
