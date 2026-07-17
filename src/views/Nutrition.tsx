import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, todayStr, getSetting, setSetting, type MealEntry } from '../db';
import {
  computeTargets,
  resolveMacroTargets,
  type Profile,
  type MacroTargets,
} from '../fitness/metrics';
import { searchFoods, macrosFor, type Food } from '../nutrition/foods';
import { sumMacros, MEAL_TYPES, defaultMeal } from '../nutrition/log';

function MacroBar({
  label,
  value,
  target,
  unit,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
}) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  const over = value > target * 1.05 && target > 0;
  return (
    <div className="macro-bar">
      <div className="macro-bar-head">
        <span>{label}</span>
        <span className="macro-bar-val">
          {Math.round(value)}
          <span className="muted"> / {Math.round(target)} {unit}</span>
        </span>
      </div>
      <div className="macro-track">
        <div className={over ? 'macro-fill over' : 'macro-fill'} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

import Scanner from '../components/Scanner';

const EMPTY_CUSTOM = { name: '', cat: 'Otros', kcal: '', protein: '', carbs: '', fat: '' };

export default function Nutrition() {
  const settings = useLiveQuery(async () => {
    const profileRaw = await getSetting('profile');
    const overrideRaw = await getSetting('macroTargets');
    const guide = await getSetting('nutritionGuide');
    return { profileRaw, overrideRaw, guide };
  }, []);
  const meals = useLiveQuery(() => db.meals.where('date').equals(todayStr()).toArray(), []);
  const customRows = useLiveQuery(() => db.customFoods.toArray(), []);

  const [meal, setMeal] = useState(defaultMeal());
  const [query, setQuery] = useState('');
  const [picking, setPicking] = useState<Food | null>(null);
  const [grams, setGrams] = useState('100');
  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState(EMPTY_CUSTOM);
  const [showGuide, setShowGuide] = useState(false);
  const [scanning, setScanning] = useState(false);

  async function handleScan(barcode: string) {
    setScanning(false);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      
      if (data.status === 1 && data.product) {
        const p = data.product;
        const nut = p.nutriments || {};
        
        // OpenFoodFacts suele entregar macros por 100g en la propiedad "[nutriente]_100g"
        const foundFood: Food = {
          name: p.product_name_es || p.product_name || `Producto (${barcode})`,
          cat: p.brands ? `Supermercado (${p.brands})` : 'Escaneado',
          kcal: nut['energy-kcal_100g'] || 0,
          protein: nut['proteins_100g'] || 0,
          carbs: nut['carbohydrates_100g'] || 0,
          fat: nut['fat_100g'] || 0,
          custom: true // Lo marcamos custom para que se vea diferente
        };
        
        setPicking(foundFood);
        setGrams('100');
      } else {
        alert('Producto no encontrado en la base mundial. Por favor ingrésalo manualmente.');
        setShowCustom(true);
      }
    } catch (e) {
      alert('Error de conexión al buscar el código de barras.');
    }
  }

  const customFoods: Food[] = useMemo(
    () => (customRows ?? []).map((c) => ({ ...c, custom: true })),
    [customRows],
  );
  const [webResults, setWebResults] = useState<Food[]>([]);
  const [searchingOnline, setSearchingOnline] = useState(false);

  async function handleSearchOnline() {
    if (!query.trim()) return;
    setSearchingOnline(true);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`);
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        const mapped: Food[] = data.products.map((p: any) => ({
          name: p.product_name_es || p.product_name || `Producto`,
          cat: p.brands ? `Global (${p.brands})` : 'Base Mundial',
          kcal: p.nutriments?.['energy-kcal_100g'] || 0,
          protein: p.nutriments?.['proteins_100g'] || 0,
          carbs: p.nutriments?.['carbohydrates_100g'] || 0,
          fat: p.nutriments?.['fat_100g'] || 0,
          custom: true
        })).filter((p: Food) => p.name !== 'Producto' && p.kcal > 0);
        
        setWebResults(mapped);
        if (mapped.length === 0) alert('No se encontraron productos con macros válidos.');
      } else {
        alert('No se encontraron resultados en la base mundial.');
      }
    } catch (e) {
      alert('Error de conexión con la base mundial.');
    }
    setSearchingOnline(false);
  }

  const results = useMemo(() => {
    if (!query.trim()) setWebResults([]);
    return searchFoods(query, customFoods);
  }, [query, customFoods]);

  if (!settings || !meals) return null;

  const profile = settings.profileRaw ? (JSON.parse(settings.profileRaw) as Profile) : null;
  let override: Partial<MacroTargets> | null = null;
  try {
    override = settings.overrideRaw ? (JSON.parse(settings.overrideRaw) as Partial<MacroTargets>) : null;
  } catch {
    override = null;
  }
  const targets = profile
    ? resolveMacroTargets(computeTargets(profile), override)
    : override && override.kcal
      ? { kcal: override.kcal, proteinG: override.proteinG ?? 0, carbG: override.carbG ?? 0, fatG: override.fatG ?? 0 }
      : null;

  const total = sumMacros(meals);
  async function addEntry() {
    if (!picking) return;
    const g = Number(grams.replace(',', '.'));
    if (!g || g <= 0) return;
    const m = macrosFor(picking, g);
    await db.meals.add({
      date: todayStr(),
      meal,
      name: picking.name,
      grams: g,
      ...m,
    });
    setPicking(null);
    setQuery('');
    setGrams('100');
  }

  async function saveCustom() {
    const kcal = Number(custom.kcal);
    if (!custom.name.trim() || !kcal) return;
    await db.customFoods.add({
      name: custom.name.trim(),
      cat: custom.cat.trim() || 'Otros',
      kcal,
      protein: Number(custom.protein) || 0,
      carbs: Number(custom.carbs) || 0,
      fat: Number(custom.fat) || 0,
    });
    setCustom(EMPTY_CUSTOM);
    setShowCustom(false);
  }

  const byMeal = MEAL_TYPES.map((mt) => ({
    meal: mt,
    items: meals.filter((m) => m.meal === mt),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="view">
      <header className="view-head">
        <div>
          <p className="eyebrow">Hoy</p>
          <h1>Comida</h1>
        </div>
      </header>

      <section className="card">
        {targets ? (
          <>
            <MacroBar label="Calorías" value={total.kcal} target={targets.kcal} unit="kcal" />
            <MacroBar label="Proteína" value={total.protein} target={targets.proteinG} unit="g" />
            <MacroBar label="Carbohidratos" value={total.carbs} target={targets.carbG} unit="g" />
            <MacroBar label="Grasa" value={total.fat} target={targets.fatG} unit="g" />
          </>
        ) : (
          <p className="muted small-text">
            Cargá tu evaluación en <strong>Plan</strong> o tus objetivos abajo para ver el avance de
            macros. Igual podés registrar comidas.
          </p>
        )}
      </section>

      <section className="card">
        <h3>Agregar comida</h3>
        <div className="chip-row">
          {MEAL_TYPES.map((mt) => (
            <button
              key={mt}
              className={mt === meal ? 'chip timer-chip active' : 'chip timer-chip'}
              onClick={() => setMeal(mt)}
            >
              {mt}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <input
            style={{ flex: 1 }}
            value={query}
            placeholder="Buscar comida (pollo, arroz, palta…)"
            onChange={(e) => {
              setQuery(e.target.value);
              setPicking(null);
            }}
          />
          <button 
            className="btn ghost" 
            style={{ padding: '0 12px', fontSize: '1.2rem' }}
            onClick={() => setScanning(true)}
            aria-label="Escanear Código"
          >
            📷
          </button>
        </div>

        {scanning && (
          <Scanner 
            onCancel={() => setScanning(false)}
            onResult={(code) => void handleScan(code)}
          />
        )}
        
        {picking ? (
          <div className="pick-box">
            <strong>{picking.name}</strong>
            <p className="muted small-text">
              {picking.kcal} kcal · {picking.protein} P / {picking.carbs} C / {picking.fat} G por 100 g
            </p>
            <div className="pick-row">
              <label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                />
                <span>gramos</span>
              </label>
              <div className="muted small-text pick-preview">
                ={' '}
                {(() => {
                  const m = macrosFor(picking, Number(grams.replace(',', '.')) || 0);
                  return `${m.kcal} kcal · ${m.protein}P / ${m.carbs}C / ${m.fat}G`;
                })()}
              </div>
            </div>
            <div className="actions">
              <button className="btn small primary" onClick={() => void addEntry()}>
                Agregar a {meal}
              </button>
              <button className="btn small ghost" onClick={() => setPicking(null)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          !picking && query && (
          <div className="food-results">
            {results.map((f, i) => (
              <button
                key={i}
                className="food-row"
                onClick={() => {
                  setPicking(f);
                  setGrams('100');
                }}
              >
                <div>
                  <strong>{f.name}</strong>
                  {f.custom && <span className="tag">propia</span>}
                  <p className="muted small-text">
                    {f.cat} · {f.kcal} kcal/100 g
                  </p>
                </div>
                <span className="food-add">+</span>
              </button>
            ))}
            
            {webResults.map((f, i) => (
              <button
                key={'web'+i}
                className="food-row"
                onClick={() => {
                  setPicking(f);
                  setGrams('100');
                }}
              >
                <div>
                  <strong>{f.name}</strong>
                  <span className="tag" style={{background: 'var(--cool)', color: 'var(--bg)'}}>internet</span>
                  <p className="muted small-text">
                    {f.cat} · {Math.round(f.kcal)} kcal/100 g
                  </p>
                </div>
                <span className="food-add">+</span>
              </button>
            ))}

            <div style={{ display: 'flex', gap: '8px', padding: '10px 0' }}>
              <button 
                className="btn primary" 
                style={{ flex: 1 }} 
                onClick={() => void handleSearchOnline()}
                disabled={searchingOnline}
              >
                {searchingOnline ? 'Buscando...' : '🌐 Buscar en internet'}
              </button>
              <button className="btn ghost" onClick={() => setShowCustom(true)}>+ Manual</button>
            </div>
          </div>
        )
        )}
        <button className="btn small ghost" onClick={() => setShowCustom((v) => !v)}>
          {showCustom ? 'Cerrar' : '+ Crear comida propia'}
        </button>
        {showCustom && (
          <div className="pick-box">
            <input
              value={custom.name}
              placeholder="Nombre (ej: Colación de la casa)"
              onChange={(e) => setCustom({ ...custom, name: e.target.value })}
            />
            <p className="muted small-text">Valores por 100 g:</p>
            <div className="ex-nums">
              {(
                [
                  ['kcal', 'kcal'],
                  ['protein', 'proteína'],
                  ['carbs', 'carbos'],
                  ['fat', 'grasa'],
                ] as const
              ).map(([k, label]) => (
                <label key={k}>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={custom[k]}
                    onChange={(e) => setCustom({ ...custom, [k]: e.target.value })}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <button className="btn small primary" onClick={() => void saveCustom()}>
              Guardar comida
            </button>
          </div>
        )}
      </section>

      {byMeal.map((g) => {
        const st = sumMacros(g.items);
        return (
          <section key={g.meal} className="card">
            <div className="meal-head">
              <h3>{g.meal}</h3>
              <span className="muted small-text">
                {Math.round(st.kcal)} kcal · {Math.round(st.protein)}P / {Math.round(st.carbs)}C /{' '}
                {Math.round(st.fat)}G
              </span>
            </div>
            {g.items.map((m: MealEntry) => (
              <div key={m.id} className="history-row">
                <div>
                  <strong>{m.name}</strong>
                  <p className="muted small-text">
                    {m.grams} g · {m.kcal} kcal · {m.protein}P / {m.carbs}C / {m.fat}G
                  </p>
                </div>
                <button
                  className="btn small ghost"
                  onClick={() => void db.meals.delete(m.id!)}
                  aria-label="Borrar"
                >
                  ✕
                </button>
              </div>
            ))}
          </section>
        );
      })}

      <GuideSection
        show={showGuide}
        onToggle={() => setShowGuide((v) => !v)}
        override={override}
        guide={settings.guide}
      />
    </div>
  );
}

function GuideSection({
  show,
  onToggle,
  override,
  guide,
}: {
  show: boolean;
  onToggle: () => void;
  override: Partial<MacroTargets> | null;
  guide: string;
}) {
  const [form, setForm] = useState({
    kcal: override?.kcal ? String(override.kcal) : '',
    proteinG: override?.proteinG ? String(override.proteinG) : '',
    carbG: override?.carbG ? String(override.carbG) : '',
    fatG: override?.fatG ? String(override.fatG) : '',
  });
  const [text, setText] = useState(guide);
  const [msg, setMsg] = useState('');

  async function save() {
    const o: Partial<MacroTargets> = {};
    if (Number(form.kcal)) o.kcal = Number(form.kcal);
    if (Number(form.proteinG)) o.proteinG = Number(form.proteinG);
    if (Number(form.carbG)) o.carbG = Number(form.carbG);
    if (Number(form.fatG)) o.fatG = Number(form.fatG);
    await setSetting('macroTargets', Object.keys(o).length ? JSON.stringify(o) : '');
    await setSetting('nutritionGuide', text.trim());
    setMsg('Guía y objetivos guardados ✓');
    window.setTimeout(() => setMsg(''), 2500);
  }

  async function loadFile(file: File) {
    const t = await file.text();
    setText((prev) => (prev ? prev + '\n' + t : t));
  }

  return (
    <section className="card">
      <button className="btn small ghost" onClick={onToggle}>
        {show ? 'Cerrar mi guía y objetivos' : 'Mi guía nutricional y objetivos'}
      </button>
      {show && (
        <div className="guide-box">
          <p className="muted small-text">
            Objetivos de macros propios (de tu guía). Si los dejás vacíos, se calculan desde tu
            evaluación del Plan.
          </p>
          <div className="ex-nums">
            {(
              [
                ['kcal', 'kcal'],
                ['proteinG', 'proteína'],
                ['carbG', 'carbos'],
                ['fatG', 'grasa'],
              ] as const
            ).map(([k, label]) => (
              <label key={k}>
                <input
                  type="number"
                  inputMode="decimal"
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <label className="field">
            <span>Tu guía nutricional (el coach la lee)</span>
            <textarea
              rows={5}
              value={text}
              placeholder="Pegá acá tu guía: comidas recomendadas, horarios, restricciones, objetivos…"
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <label className="btn small ghost file-btn">
            Cargar desde archivo de texto
            <input
              type="file"
              accept=".txt,.md,.csv,text/plain"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void loadFile(f);
                e.target.value = '';
              }}
            />
          </label>
          <p className="muted small-text">
            Si tu guía es PDF o foto, pegá el texto o los números clave acá: el coach no puede leer
            imágenes sin conexión.
          </p>
          <button className="btn primary" onClick={() => void save()}>
            Guardar
          </button>
          {msg && <p className="ok small-text">{msg}</p>}
        </div>
      )}
    </section>
  );
}
