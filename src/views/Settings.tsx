import { useEffect, useState } from 'react';
import { db, getSetting, setSetting, todayStr } from '../db';
import { encryptJson, decryptJson } from '../crypto';
import { migrateGeminiModel, DEFAULT_GEMINI_MODEL } from '../ai/coach';
import { scheduleReminder } from '../notifications';
import { parsePlaylists, type Playlist } from '../components/MusicBar';
import CloudSync from '../components/CloudSync';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(DEFAULT_GEMINI_MODEL);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [msg, setMsg] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [plName, setPlName] = useState('');
  const [plUrl, setPlUrl] = useState('');

  useEffect(() => {
    void (async () => {
      setApiKey(await getSetting('geminiApiKey'));
      setModel(migrateGeminiModel(await getSetting('geminiModel')));
      setReminderEnabled((await getSetting('reminderEnabled')) === '1');
      setReminderTime((await getSetting('reminderTime')) || '19:00');
      setPlaylists(parsePlaylists((await getSetting('playlists')) || '[]'));
    })();
  }, []);

  async function savePlaylists(next: Playlist[]) {
    setPlaylists(next);
    await setSetting('playlists', JSON.stringify(next));
  }

  async function addPlaylist() {
    const name = plName.trim();
    let url = plUrl.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    await savePlaylists([...playlists, { name, url }]);
    setPlName('');
    setPlUrl('');
  }

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
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
          const req = await LocalNotifications.requestPermissions();
          if (req.display !== 'granted') {
            flash('Permiso de notificaciones denegado en Android');
            return;
          }
        }
      } catch (e) {
        // Fallback web
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
    }
    setReminderEnabled(on);
    await setSetting('reminderEnabled', on ? '1' : '0');
    await scheduleReminder();
  }

  async function saveReminderTime(t: string) {
    setReminderTime(t);
    await setSetting('reminderTime', t);
    await scheduleReminder();
  }

  async function exportData() {
    const pass = window.prompt(
      'Elegí una contraseña para cifrar el respaldo (AES-256).\nSin ella no se puede recuperar:',
    );
    if (!pass) return;
    const data = {
      routines: await db.routines.toArray(),
      workouts: await db.workouts.toArray(),
      chat: await db.chat.toArray(),
      bodyLogs: await db.bodyLogs.toArray(),
      meals: await db.meals.toArray(),
      customFoods: await db.customFoods.toArray(),
      profile: await getSetting('profile'),
      playlists: await getSetting('playlists'),
      macroTargets: await getSetting('macroTargets'),
      nutritionGuide: await getSetting('nutritionGuide'),
    };
    const encrypted = await encryptJson(data, pass);
    const blob = new Blob([encrypted], { type: 'application/octet-stream' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fitness-coach-${todayStr()}.fcbak`;
    a.click();
    URL.revokeObjectURL(a.href);
    flash('Respaldo cifrado exportado ✓');
  }

  async function importData(file: File) {
    const pass = window.prompt('Contraseña del respaldo:');
    if (!pass) return;
    try {
      const data = (await decryptJson(await file.text(), pass)) as {
        routines?: unknown[];
        workouts?: unknown[];
        chat?: unknown[];
        bodyLogs?: unknown[];
        meals?: unknown[];
        customFoods?: unknown[];
        profile?: string;
        playlists?: string;
        macroTargets?: string;
        nutritionGuide?: string;
      };
      if (Array.isArray(data.routines)) await db.routines.bulkPut(data.routines as never[]);
      if (Array.isArray(data.workouts)) await db.workouts.bulkPut(data.workouts as never[]);
      if (Array.isArray(data.chat)) await db.chat.bulkPut(data.chat as never[]);
      if (Array.isArray(data.bodyLogs)) await db.bodyLogs.bulkPut(data.bodyLogs as never[]);
      if (Array.isArray(data.meals)) await db.meals.bulkPut(data.meals as never[]);
      if (Array.isArray(data.customFoods)) await db.customFoods.bulkPut(data.customFoods as never[]);
      if (data.profile) await setSetting('profile', data.profile);
      if (data.playlists) await setSetting('playlists', data.playlists);
      if (data.macroTargets) await setSetting('macroTargets', data.macroTargets);
      if (data.nutritionGuide) await setSetting('nutritionGuide', data.nutritionGuide);
      flash('Datos importados ✓');
    } catch {
      flash('Contraseña incorrecta o archivo inválido');
    }
  }

  return (
    <div className="view">
      <header className="view-head">
        <h1>Ajustes</h1>
      </header>
      {msg && <div className="card ok">{msg}</div>}

      <CloudSync flash={flash} />

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
            <option value="gemini-3.5-flash">Gemini 3.5 Flash (recomendado)</option>
            <option value="gemini-3.1-pro">Gemini 3.1 Pro</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (más barato)</option>
            <option value="gemini-flash-latest">Siempre el Flash más nuevo</option>
          </select>
        </label>
        <button className="btn primary" onClick={() => void saveAI()}>
          Guardar
        </button>
      </section>

      <section className="card">
        <h3>Música para entrenar</h3>
        <p className="muted small-text">
          Guardá tus playlists de Spotify, YouTube Music o cualquier servicio (pegá el link de
          compartir). Aparecen como accesos rápidos al empezar a entrenar y se abren en tu app de
          música.
        </p>
        {playlists.map((p, i) => (
          <div key={i} className="history-row">
            <div>
              <strong>{p.name}</strong>
              <p className="muted small-text">{p.url}</p>
            </div>
            <button
              className="btn small ghost"
              onClick={() => void savePlaylists(playlists.filter((_, x) => x !== i))}
              aria-label={`Quitar ${p.name}`}
            >
              ✕
            </button>
          </div>
        ))}
        <div className="ex-nums two">
          <label>
            <input
              value={plName}
              placeholder="Ej: Piernas a fondo"
              onChange={(e) => setPlName(e.target.value)}
            />
            <span>nombre</span>
          </label>
          <label>
            <input
              value={plUrl}
              placeholder="https://open.spotify.com/…"
              onChange={(e) => setPlUrl(e.target.value)}
            />
            <span>link</span>
          </label>
        </div>
        <button className="btn small" disabled={!plName.trim() || !plUrl.trim()} onClick={() => void addPlaylist()}>
          Agregar playlist
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
          Todo se guarda solo en este dispositivo (nunca se sube a ningún servidor). El
          respaldo se exporta cifrado con AES-256 y tu contraseña. Las fotos de evolución no
          se incluyen en el respaldo (ocupan mucho): guardalas aparte si cambiás de teléfono.
        </p>
        <div className="actions">
          <button className="btn ghost" onClick={() => void exportData()}>
            Exportar respaldo
          </button>
          <label className="btn ghost file-btn">
            Importar respaldo
            <input
              type="file"
              accept=".fcbak,application/octet-stream,application/json"
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
