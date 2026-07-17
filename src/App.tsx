import { useEffect, useState } from 'react';
import { seedIfEmpty, getSetting } from './db';
import Today from './views/Today';
import Plan from './views/Plan';
import History from './views/History';
import Routines from './views/Routines';
import Nutrition from './views/Nutrition';
import Coach from './views/Coach';
import Settings from './views/Settings';
import {
  IconDumbbell,
  IconTarget,
  IconTrend,
  IconList,
  IconMeal,
  IconChat,
  IconGear,
} from './components/icons';

const TABS = [
  { id: 'hoy', label: 'Hoy', icon: IconDumbbell },
  { id: 'plan', label: 'Plan', icon: IconTarget },
  { id: 'comida', label: 'Comida', icon: IconMeal },
  { id: 'historial', label: 'Progreso', icon: IconTrend },
  { id: 'rutinas', label: 'Rutinas', icon: IconList },
  { id: 'coach', label: 'Coach', icon: IconChat },
  { id: 'ajustes', label: 'Ajustes', icon: IconGear },
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
        <div key={tab} className="tab-pane">
          {tab === 'hoy' && <Today />}
          {tab === 'plan' && <Plan />}
          {tab === 'comida' && <Nutrition />}
          {tab === 'historial' && <History />}
          {tab === 'rutinas' && <Routines />}
          {tab === 'coach' && <Coach />}
          {tab === 'ajustes' && <Settings />}
        </div>
      </main>
      <nav className="tabbar">
        {TABS.map((t) => {
          const TabIcon = t.icon;
          return (
            <button
              key={t.id}
              className={tab === t.id ? 'tab active' : 'tab'}
              onClick={() => setTab(t.id)}
            >
              <span className="tab-icon">
                <TabIcon />
              </span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
