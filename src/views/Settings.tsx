import { useEffect, useState } from 'react';
import { db, getSetting, setSetting, todayStr } from '../db';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    void (async () => {
      setApiKey(await getSetting('geminiApiKey'));
      setModel((await getSetting('geminiModel')) || 'gemini-2.5-flash');
      setReminderEnabled((await getSetting('reminderEnabled')) === '1');
      setReminderTime((await getSetting('reminderTime')) || '19:00');
    })();
  }, []);

  function flash(text: string) {
    setMsg(text);
    window.setTimeout(() => setMsg(''), 2500);
  }

  async function saveAI() {
    await setSetting('geminiApiKey', apiKey.trim());
    await setSetting('geminiModel', model);
    flash('Configuración de IA guardada ✓');
  }

  async function toggleReminder(on: boolean) {
    if (on) {
      if (!('Notification' in window)) {
        flash('Este navegador no soporta notificaciones');
        return;
      }
      if (Notification.permission !== 'granted') {
        const p = await Notification.requestPermission();
        if (p !== 'granted') {
          flash('Permiso de notificaciones denegado');
          return;
        }
      }
    }
    setReminderEnabled(on);
    await setSetting('reminderEnabled', on ? '1' : '0');
  }

  async function saveReminderTime(t: string) {
    setReminderTime(t);
    await setSetting('reminderTime', t);
  }

  async function exportData() {
    const data = {
      routines: await db.routines.toArray(),
      workouts: await db.workouts.toArray(),
      chat: await db.chat.toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fitness-coach-backup-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importData(file: File) {
    try {
      const data = JSON.parse(await file.text());
      if (Array.isArray(data.routines)) await db.routines.bulkPut(data.routines);
      if (Array.isArray(data.workouts)) await db.workouts.bulkPut(data.workouts);
      if (Array.isArray(data.chat)) await db.chat.bulkPut(data.chat);
      flash('Datos importados ✓');
    } catch {
      flash('Archivo inválido');
    }
  }

  return (
    <div className="view">
      <header className="view-head">
        <h1>Ajustes</h1>
      </header>
      {msg && <div className="card ok">{msg}</div>}

      <section className="card">
        <h3>Coach IA (Gemini)</h3>
        <p className="muted small-text">
          Conseguí una API key gratuita en aistudio.google.com → «Get API key». Se guarda
          solo en este dispositivo.
        </p>
        <label className="field">
          <span>API key</span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIza…"
            autoComplete="off"
          />
        </label>
        <label className="field">
          <span>Modelo</span>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (recomendado)</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
          </select>
        </label>
        <button className="btn primary" onClick={() => void saveAI()}>
          Guardar
        </button>
      </section>

      <section className="card">
        <h3>Recordatorio diario</h3>
        <p className="muted small-text">
          Aviso a la hora elegida (funciona mientras la app esté abierta o en segundo
          plano reciente).
        </p>
        <label className="field row">
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={(e) => void toggleReminder(e.target.checked)}
          />
          <span>Activar recordatorio</span>
        </label>
        <label className="field">
          <span>Hora</span>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => void saveReminderTime(e.target.value)}
          />
        </label>
      </section>

      <section className="card">
        <h3>Tus datos</h3>
        <p className="muted small-text">
          Todo se guarda solo en este dispositivo. Exportá un respaldo si vas a cambiar
          de celular.
        </p>
        <div className="actions">
          <button className="btn ghost" onClick={() => void exportData()}>
            Exportar respaldo
          </button>
          <label className="btn ghost file-btn">
            Importar respaldo
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importData(f);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
