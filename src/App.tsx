import { useEffect, useState } from 'react';
import { seedIfEmpty, getSetting } from './db';
import Today from './views/Today';
import Plan from './views/Plan';
import History from './views/History';
import Routines from './views/Routines';
import Nutrition from './views/Nutrition';
import Coach from './views/Coach';
import Settings from './views/Settings';
import { Library } from './views/Library';
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
  { id: 'libreria', label: 'Librería', icon: IconTarget },
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

  // Recordatorio diario (ahora persistente nativo con Capacitor)
  useEffect(() => {
    async function schedule() {
      const enabled = await getSetting('reminderEnabled');
      const time = await getSetting('reminderTime');

      try {
        // Cancelar notificaciones previas
        await import('@capacitor/local-notifications').then(async ({ LocalNotifications }) => {
          await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

          if (enabled !== '1' || !time) return;

          const perm = await LocalNotifications.checkPermissions();
          if (perm.display !== 'granted') {
            const req = await LocalNotifications.requestPermissions();
            if (req.display !== 'granted') return;
          }

          const [h, m] = time.split(':').map(Number);
          await LocalNotifications.schedule({
            notifications: [
              {
                title: 'Fitness Coach',
                body: '💪 Hora de entrenar. ¡Tu rutina te espera!',
                id: 1,
                schedule: {
                  on: { hour: h, minute: m },
                  allowWhileIdle: true,
                },
              },
            ],
          });
        });
      } catch (e) {
        console.warn('LocalNotifications no disponible (entorno web puro)', e);
      }
    }
    void schedule();
  }, [tab]);

  return (
    <div className="app">
      <main className="content">
        <div key={tab} className="tab-pane">
          {tab === 'hoy' && <Today />}
          {tab === 'libreria' && <Library />}
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
