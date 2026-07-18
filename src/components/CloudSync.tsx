import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';
import { db } from '../db';

/** Ajustes que SÍ se sincronizan a la nube. Deja fuera secretos (`geminiApiKey`),
 * banderas del dispositivo (`seeded`) y estado transitorio (`activeWorkout`). */
const SYNCED_SETTING_KEYS = [
  'profile',
  'macroTargets',
  'nutritionGuide',
  'playlists',
  'reminderEnabled',
  'reminderTime',
  'geminiModel',
];

export default function CloudSync({ flash }: { flash: (msg: string) => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleAuth(isSignUp: boolean) {
    if (!email || !password) return;
    setLoading(true);
    let error;
    if (isSignUp) {
      const res = await supabase.auth.signUp({ email, password });
      error = res.error;
    } else {
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
    }
    setLoading(false);
    
    if (error) {
      flash('Error: ' + error.message);
    } else {
      flash(isSignUp ? 'Cuenta creada' : 'Sesión iniciada');
    }
  }

  // Sube la información local a Supabase de forma no destructiva (upsert).
  async function uploadData() {
    if (!user) return;
    const uid = user.id;
    // Falla ruidosamente ante cualquier error de Supabase para no dar por
    // exitoso un respaldo incompleto.
    const check = (res: { error: unknown }) => {
      if (res.error) throw res.error;
    };
    setLoading(true);
    try {
      // 1. Comidas propias
      const custom = await db.customFoods.toArray();
      if (custom.length > 0) {
        const customToPush = custom.map(c => ({ user_id: uid, name: c.name, cat: c.cat, kcal: c.kcal, protein: c.protein, carbs: c.carbs, fat: c.fat }));
        check(await supabase.from('custom_foods').upsert(customToPush, { onConflict: 'name, user_id', ignoreDuplicates: true }));
      }

      const meals = await db.meals.toArray();
      if (meals.length > 0) {
        const mealsToPush = meals.map(m => ({ user_id: uid, date: m.date, meal: m.meal, name: m.name, grams: m.grams, kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat }));
        check(await supabase.from('meals').upsert(mealsToPush, { onConflict: 'date, meal, name, user_id', ignoreDuplicates: true }));
      }

      // 2. Ajustes — solo una lista blanca; nunca secretos (API key) ni estado
      //    transitorio (entrenamiento en curso).
      const settings = (await db.settings.toArray()).filter(s => SYNCED_SETTING_KEYS.includes(s.key));
      if (settings.length > 0) {
        const settingsToPush = settings.map(s => ({ user_id: uid, key: s.key, value: s.value }));
        check(await supabase.from('settings').upsert(settingsToPush, { onConflict: 'key, user_id' }));
      }

      // 3. Rutinas — upsert por (user_id, local_id), luego reconciliar borrados.
      const routines = await db.routines.toArray();
      if (routines.length > 0) {
        const routinesToPush = routines.map(r => ({ user_id: uid, local_id: r.id || 0, name: r.name, days: r.days, exercises: r.exercises }));
        check(await supabase.from('routines').upsert(routinesToPush, { onConflict: 'user_id, local_id' }));
        const keep = routines.map(r => r.id || 0);
        check(await supabase.from('routines').delete().eq('user_id', uid).not('local_id', 'in', `(${keep.join(',')})`));
      }

      // 4. Historial de entrenamientos
      const workouts = await db.workouts.toArray();
      if (workouts.length > 0) {
        const workoutsToPush = workouts.map(w => ({ user_id: uid, local_id: w.id || 0, date: w.date, routine_id: w.routineId, routine_name: w.routineName, exercises: w.exercises, started_at: w.startedAt, finished_at: w.finishedAt }));
        check(await supabase.from('workouts').upsert(workoutsToPush, { onConflict: 'user_id, local_id' }));
        const keep = workouts.map(w => w.id || 0);
        check(await supabase.from('workouts').delete().eq('user_id', uid).not('local_id', 'in', `(${keep.join(',')})`));
      }

      // 5. Historial corporal (un registro por fecha)
      const bodyLogs = await db.bodyLogs.toArray();
      if (bodyLogs.length > 0) {
        const logsToPush = bodyLogs.map(b => ({ user_id: uid, date: b.date, weight_kg: b.weightKg, waist_cm: b.waistCm }));
        check(await supabase.from('body_logs').upsert(logsToPush, { onConflict: 'user_id, date' }));
        const keep = bodyLogs.map(b => `"${b.date}"`);
        check(await supabase.from('body_logs').delete().eq('user_id', uid).not('date', 'in', `(${keep.join(',')})`));
      }

      flash('Tus datos se respaldaron en la Nube ☁️✅');
    } catch (e: any) {
      flash('Error al subir: ' + (e?.message ?? String(e)));
    }
    setLoading(false);
  }

  // Descarga la información de la nube y reemplaza la local. Primero baja TODO
  // (si algo falla, no se toca lo local); recién después reemplaza en una única
  // transacción de Dexie (atómica: un fallo revierte y no deja datos a medias).
  async function downloadData() {
    if (!user) return;
    if (!confirm('Esto reemplazará los datos de tu teléfono actual con los de la nube. ¿Estás seguro?')) return;
    const uid = user.id;

    setLoading(true);
    try {
      const [settingsRes, routinesRes, workoutsRes, bodyRes, mealsRes, customRes] = await Promise.all([
        supabase.from('settings').select('*').eq('user_id', uid),
        supabase.from('routines').select('*').eq('user_id', uid),
        supabase.from('workouts').select('*').eq('user_id', uid),
        supabase.from('body_logs').select('*').eq('user_id', uid),
        supabase.from('meals').select('*').eq('user_id', uid),
        supabase.from('custom_foods').select('*').eq('user_id', uid),
      ]);
      for (const r of [settingsRes, routinesRes, workoutsRes, bodyRes, mealsRes, customRes]) {
        if (r.error) throw r.error;
      }

      await db.transaction('rw', [db.settings, db.routines, db.workouts, db.bodyLogs, db.meals, db.customFoods], async () => {
        // Ajustes: se fusionan (bulkPut) para preservar claves locales que no se
        // sincronizan, como la API key de Gemini o el entrenamiento en curso.
        if (settingsRes.data && settingsRes.data.length > 0) {
          await db.settings.bulkPut(settingsRes.data.map(s => ({ key: s.key, value: s.value })));
        }
        if (routinesRes.data && routinesRes.data.length > 0) {
          await db.routines.clear();
          await db.routines.bulkAdd(routinesRes.data.map(r => ({ name: r.name, days: r.days, exercises: r.exercises })));
        }
        if (workoutsRes.data && workoutsRes.data.length > 0) {
          await db.workouts.clear();
          await db.workouts.bulkAdd(workoutsRes.data.map(w => ({
            date: w.date, routineId: w.routine_id, routineName: w.routine_name,
            exercises: w.exercises, startedAt: w.started_at, finishedAt: w.finished_at,
          })));
        }
        if (bodyRes.data && bodyRes.data.length > 0) {
          await db.bodyLogs.clear();
          await db.bodyLogs.bulkAdd(bodyRes.data.map(b => ({ date: b.date, weightKg: b.weight_kg, waistCm: b.waist_cm })));
        }
        if (mealsRes.data && mealsRes.data.length > 0) {
          await db.meals.clear();
          await db.meals.bulkAdd(mealsRes.data.map(m => ({ date: m.date, meal: m.meal, name: m.name, grams: m.grams, kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat })));
        }
        if (customRes.data && customRes.data.length > 0) {
          await db.customFoods.clear();
          await db.customFoods.bulkAdd(customRes.data.map(c => ({ name: c.name, cat: c.cat, kcal: c.kcal, protein: c.protein, carbs: c.carbs, fat: c.fat })));
        }
      });

      flash('Datos restaurados exitosamente 📲✅');
      // Forzar un refresh para que el estado de la app se sincronice con IndexedDB
      setTimeout(() => window.location.reload(), 1500);
    } catch (e: any) {
      flash('Error al restaurar: ' + (e?.message ?? String(e)));
    }
    setLoading(false);
  }

  if (user) {
    return (
      <section className="card">
        <h3>☁️ Nube de Fitness Coach</h3>
        <p className="muted small-text">
          Conectado como <strong>{user.email}</strong>. Sube tus avances o descárgalos en otro celular.
        </p>
        <div className="actions" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          <button className="btn ghost" disabled={loading} onClick={() => void uploadData()}>
            {loading ? 'Subiendo...' : '⬆️ Respaldar'}
          </button>
          <button className="btn primary" disabled={loading} onClick={() => void downloadData()}>
            {loading ? 'Descargando...' : '⬇️ Restaurar'}
          </button>
        </div>
        <div className="actions" style={{ marginTop: '10px' }}>
          <button className="btn ghost danger" onClick={() => void supabase.auth.signOut()}>
            Cerrar Sesión
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <h3>☁️ Sincronizar en la Nube</h3>
      <p className="muted small-text">
        Inicia sesión para guardar de forma permanente tu progreso, rutinas y comida. Así nunca perderás tu historial.
      </p>
      <label className="field">
        <span>Email</span>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </label>
      <label className="field">
        <span>Contraseña</span>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </label>
      <div className="actions" style={{ marginTop: '10px' }}>
        <button className="btn primary" disabled={loading} onClick={() => void handleAuth(false)}>
          Iniciar Sesión
        </button>
        <button className="btn ghost" disabled={loading} onClick={() => void handleAuth(true)}>
          Crear Cuenta
        </button>
      </div>
    </section>
  );
}
