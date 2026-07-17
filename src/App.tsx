import { useEffect, useState } from 'react';
import { seedIfEmpty, getSetting } from './db';
import Today from './views/Today';
import Plan from './views/Plan';
import History from './views/History';
import Routines from './views/Routines';
import Coach from './views/Coach';
import Settings from './views/Settings';

const TABS = [
  { id: 'hoy', label: 'Hoy', icon: '🏋️' },
  { id: 'plan', label: 'Plan', icon: '📊' },
  { id: 'historial', label: 'Progreso', icon: '📈' },
  { id: 'rutinas', label: 'Rutinas', icon: '📋' },
  { id: 'coach', label: 'Coach', icon: '💬' },
  { id: 'ajustes', label: 'Ajustes', icon: '⚙️' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function App() {
  const [tab, setTab] = useState<TabId>('hoy');

  useEffect(() => {
    void seedIfEmpty();
  }, []);

  // Recordatorio diario (best-effort: funciona mientras la app esté abierta).
  useEffect(() => {
    let timer: number | undefined;
    let cancelled = false;
    async function schedule() {
      const enabled = await getSetting('reminderEnabled');
      const time = await getSetting('reminderTime');
      if (cancelled || enabled !== '1' || !time) return;
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const [h, m] = time.split(':').map(Number);
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      timer = window.setTimeout(() => {
        new Notification('Fitness Coach', { body: '💪 Hora de entrenar. ¡Tu rutina te espera!' });
        void schedule();
      }, next.getTime() - now.getTime());
    }
    void schedule();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [tab]);

  return (
    <div className="app">
      <main className="content">
        {tab === 'hoy' && <Today />}
        {tab === 'plan' && <Plan />}
        {tab === 'historial' && <History />}
        {tab === 'rutinas' && <Routines />}
        {tab === 'coach' && <Coach />}
        {tab === 'ajustes' && <Settings />}
      </main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'tab active' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
