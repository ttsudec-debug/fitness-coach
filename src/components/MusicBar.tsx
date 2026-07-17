import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { IconMusic } from './icons';

export interface Playlist {
  name: string;
  url: string;
}

export function parsePlaylists(raw: string): Playlist[] {
  try {
    const list = JSON.parse(raw) as unknown;
    if (!Array.isArray(list)) return [];
    return list.filter(
      (p): p is Playlist =>
        typeof p === 'object' && p !== null && typeof (p as Playlist).name === 'string' && typeof (p as Playlist).url === 'string',
    );
  } catch {
    return [];
  }
}

const DEFAULT_APPS: Playlist[] = [
  { name: 'Spotify', url: 'https://open.spotify.com' },
  { name: 'YouTube Music', url: 'https://music.youtube.com' },
];

/** Accesos de música para entrenar: abre la app o playlist en el reproductor
 * del teléfono (no reproduce dentro de la app). */
export default function MusicBar() {
  const playlists = useLiveQuery(async () => {
    const row = await db.settings.get('playlists');
    return parsePlaylists(row?.value ?? '[]');
  }, []);

  const items = [...(playlists ?? []), ...DEFAULT_APPS];

  return (
    <div className="music-bar">
      <span className="music-icon">
        <IconMusic />
      </span>
      <div className="chip-row">
        {items.map((p) => (
          <a key={p.url} className="chip music-chip" href={p.url} target="_blank" rel="noopener noreferrer">
            {p.name}
          </a>
        ))}
      </div>
    </div>
  );
}
