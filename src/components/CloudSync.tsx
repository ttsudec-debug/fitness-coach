import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';
import { db } from '../db';

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

  // Sube toda la información local a Supabase
  async function uploadData() {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Comidas
      const custom = await db.customFoods.toArray();
      if (custom.length > 0) {
        const customToPush = custom.map(c => ({ user_id: user.id, name: c.name, cat: c.cat, kcal: c.kcal, protein: c.protein, carbs: c.carbs, fat: c.fat }));
        await supabase.from('custom_foods').upsert(customToPush, { onConflict: 'name, user_id', ignoreDuplicates: true });
      }

      const meals = await db.meals.toArray();
      if (meals.length > 0) {
        const mealsToPush = meals.map(m => ({ user_id: user.id, date: m.date, meal: m.meal, name: m.name, grams: m.grams, kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat }));
        await supabase.from('meals').upsert(mealsToPush, { onConflict: 'date, meal, name, user_id', ignoreDuplicates: true });
      }

      // 2. Ajustes
      const settings = await db.settings.toArray();
      if (settings.length > 0) {
        const settingsToPush = settings.map(s => ({ user_id: user.id, key: s.key, value: s.value }));
        await supabase.from('settings').upsert(settingsToPush, { onConflict: 'key, user_id' });
      }

      // 3. Rutinas
      const routines = await db.routines.toArray();
      if (routines.length > 0) {
        const routinesToPush = routines.map(r => ({ user_id: user.id, local_id: r.id || 0, name: r.name, days: r.days, exercises: r.exercises }));
        await supabase.from('routines').delete().eq('user_id', user.id);
        await supabase.from('routines').insert(routinesToPush);
      }

      // 4. Historial de Entrenamientos
      const workouts = await db.workouts.toArray();
      if (workouts.length > 0) {
        const workoutsToPush = workouts.map(w => ({ user_id: user.id, local_id: w.id || 0, date: w.date, routine_id: w.routineId, routine_name: w.routineName, exercises: w.exercises, started_at: w.startedAt, finished_at: w.finishedAt }));
        await supabase.from('workouts').delete().eq('user_id', user.id);
        await supabase.from('workouts').insert(workoutsToPush);
      }

      // 5. Historial Corporal
      const bodyLogs = await db.bodyLogs.toArray();
      if (bodyLogs.length > 0) {
        const logsToPush = bodyLogs.map(b => ({ user_id: user.id, date: b.date, weight_kg: b.weightKg, waist_cm: b.waistCm }));
        await supabase.from('body_logs').delete().eq('user_id', user.id);
        await supabase.from('body_logs').insert(logsToPush);
      }

      flash('Tus datos se respaldaron en la Nube ☁️✅');
    } catch (e: any) {
      flash('Error al subir: ' + e.message);
    }
    setLoading(false);
  }

  // Descarga la información de la nube y reemplaza la local
  async function downloadData() {
    if (!user) return;
    if (!confirm('Esto reemplazará todos los datos de tu teléfono actual con los de la nube. ¿Estás seguro?')) return;
    
    setLoading(true);
    try {
      // 1. Settings
      const { data: settingsData } = await supabase.from('settings').select('*');
      if (settingsData && settingsData.length > 0) {
        await db.settings.clear();
        await db.settings.bulkAdd(settingsData.map(s => ({ key: s.key, value: s.value })));
      }

      // 2. Routines
      const { data: routinesData } = await supabase.from('routines').select('*');
      if (routinesData && routinesData.length > 0) {
        await db.routines.clear();
        await db.routines.bulkAdd(routinesData.map(r => ({ name: r.name, days: r.days, exercises: r.exercises })));
      }

      // 3. Workouts
      const { data: workoutsData } = await supabase.from('workouts').select('*');
      if (workoutsData && workoutsData.length > 0) {
        await db.workouts.clear();
        await db.workouts.bulkAdd(workoutsData.map(w => ({ 
          date: w.date, routineId: w.routine_id, routineName: w.routine_name, 
          exercises: w.exercises, startedAt: w.started_at, finishedAt: w.finished_at 
        })));
      }

      // 4. Body Logs
      const { data: bodyData } = await supabase.from('body_logs').select('*');
      if (bodyData && bodyData.length > 0) {
        await db.bodyLogs.clear();
        await db.bodyLogs.bulkAdd(bodyData.map(b => ({ date: b.date, weightKg: b.weight_kg, waistCm: b.waist_cm })));
      }

      // 5. Meals
      const { data: mealsData } = await supabase.from('meals').select('*');
      if (mealsData && mealsData.length > 0) {
        await db.meals.clear();
        await db.meals.bulkAdd(mealsData.map(m => ({ date: m.date, meal: m.meal, name: m.name, grams: m.grams, kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat })));
      }
      
      const { data: customData } = await supabase.from('custom_foods').select('*');
      if (customData && customData.length > 0) {
        await db.customFoods.clear();
        await db.customFoods.bulkAdd(customData.map(c => ({ name: c.name, cat: c.cat, kcal: c.kcal, protein: c.protein, carbs: c.carbs, fat: c.fat })));
      }

      flash('Datos restaurados exitosamente 📲✅');
      // Forzar un refresh para que el estado de la app se sincronice con IndexedDB
      setTimeout(() => window.location.reload(), 1500);

    } catch (e: any) {
      flash('Error al restaurar: ' + e.message);
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
