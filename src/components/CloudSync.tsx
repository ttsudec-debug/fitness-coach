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

  async function syncData() {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Subir comidas personalizadas
      const custom = await db.customFoods.toArray();
      if (custom.length > 0) {
        // Adaptamos el id local (número) omitiéndolo para que Supabase asigne un UUID
        const customToPush = custom.map(c => ({
          user_id: user.id,
          name: c.name,
          cat: c.cat,
          kcal: c.kcal,
          protein: c.protein,
          carbs: c.carbs,
          fat: c.fat
        }));
        await supabase.from('custom_foods').upsert(customToPush, { onConflict: 'name, user_id' }).ignore();
      }

      // 2. Subir registro de consumo diario
      const meals = await db.meals.toArray();
      if (meals.length > 0) {
        const mealsToPush = meals.map(m => ({
          user_id: user.id,
          date: m.date,
          meal: m.meal,
          name: m.name,
          grams: m.grams,
          kcal: m.kcal,
          protein: m.protein,
          carbs: m.carbs,
          fat: m.fat
        }));
        await supabase.from('meals').upsert(mealsToPush, { onConflict: 'date, meal, name, user_id' }).ignore();
      }
      
      flash('Datos sincronizados en la nube ✓');
    } catch (e: any) {
      flash('Error al sincronizar: ' + e.message);
    }
    setLoading(false);
  }

  if (user) {
    return (
      <section className="card">
        <h3>☁️ Nube de Fitness Coach</h3>
        <p className="muted small-text">
          Conectado como <strong>{user.email}</strong>. Tus registros diarios pueden ser subidos a la base de datos mundial.
        </p>
        <div className="actions" style={{ marginTop: '10px' }}>
          <button className="btn primary" disabled={loading} onClick={() => void syncData()}>
            {loading ? 'Sincronizando...' : 'Sincronizar ahora'}
          </button>
          <button className="btn ghost danger" onClick={() => void supabase.auth.signOut()}>
            Cerrar Sesión
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <h3>☁️ Cuenta en la Nube</h3>
      <p className="muted small-text">
        Inicia sesión para sincronizar tus alimentos escaneados y tu registro diario con Supabase.
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
