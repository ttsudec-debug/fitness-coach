import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { GeminiProvider, migrateGeminiModel, DEFAULT_GEMINI_MODEL } from '../ai/coach';
import { buildCoachContext } from '../ai/context';

export default function Coach() {
  const msgs = useLiveQuery(() => db.chat.orderBy('ts').toArray(), []);
  const hasKey = useLiveQuery(async () => {
    const row = await db.settings.get('geminiApiKey');
    return Boolean(row?.value);
  }, []);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs?.length, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setError('');
    setBusy(true);
    await db.chat.add({ role: 'user', text, ts: Date.now() });
    try {
      const key = (await db.settings.get('geminiApiKey'))?.value;
      if (!key) throw new Error('Configurá tu API key de Gemini en Ajustes.');
      const model = migrateGeminiModel(
        (await db.settings.get('geminiModel'))?.value || DEFAULT_GEMINI_MODEL,
      );
      const provider = new GeminiProvider(key, model);
      const history = (await db.chat.orderBy('ts').toArray())
        .slice(-20)
        .map((m) => ({ role: m.role, text: m.text }));
      const ctx = await buildCoachContext();
      const reply = await provider.send(history, ctx);
      await db.chat.add({ role: 'model', text: reply, ts: Date.now() });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="view coach-view">
      <header className="view-head">
        <h1>Coach</h1>
        {msgs && msgs.length > 0 && (
          <button className="btn small ghost" onClick={() => void db.chat.clear()}>
            Limpiar chat
          </button>
        )}
      </header>
      {hasKey === false && (
        <div className="card warn">
          <p>
            Para hablar con el coach necesitás una API key gratuita de Google AI Studio.
            Configurala en <strong>Ajustes</strong>.
          </p>
        </div>
      )}
      <div className="chat-list">
        {(!msgs || msgs.length === 0) && hasKey && (
          <p className="muted">
            Preguntale lo que quieras: «¿cómo progreso en sentadillas?», «me dolió el
            hombro en press banca», «armame una rutina de 4 días»…
          </p>
        )}
        {msgs?.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'bubble user' : 'bubble model'}>
            {m.text}
          </div>
        ))}
        {busy && <div className="bubble model muted">Pensando…</div>}
        {error && <div className="bubble error">{error}</div>}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input">
        <input
          value={input}
          placeholder="Escribile al coach…"
          disabled={!hasKey || busy}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void send();
          }}
        />
        <button className="btn primary" disabled={!hasKey || busy || !input.trim()} onClick={() => void send()}>
          ➤
        </button>
      </div>
    </div>
  );
}
