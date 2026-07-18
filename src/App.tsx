import { useEffect, useState } from 'react';
import { seedIfEmpty } from './db';
import { scheduleReminder } from './notifications';
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

  // Recordatorio diario: se programa una vez al iniciar. Los cambios de hora o
  // de activación lo reprograman desde Ajustes, no en cada navegación.
  useEffect(() => {
    void scheduleReminder();
  }, []);

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
