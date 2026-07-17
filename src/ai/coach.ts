export interface CoachMessage {
  role: 'user' | 'model';
  text: string;
}

/** Interfaz genérica: cambiar de proveedor de IA es implementar esto. */
export interface CoachProvider {
  send(history: CoachMessage[], systemContext: string): Promise<string>;
}

interface GeminiPart { text?: string }
interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
  error?: { message?: string };
}

export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';

/** Los modelos 2.x fueron dados de baja por Google en 2026:
 * migra configuraciones guardadas viejas al modelo vigente. */
export function migrateGeminiModel(model: string): string {
  if (!model || /^gemini-[12]\./.test(model)) return DEFAULT_GEMINI_MODEL;
  return model;
}

export class GeminiProvider implements CoachProvider {
  constructor(
    private apiKey: string,
    private model: string = DEFAULT_GEMINI_MODEL,
  ) {}

  async send(history: CoachMessage[], systemContext: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // La key va en header, nunca en la URL.
        'x-goog-api-key': this.apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemContext }] },
        contents: history.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        })),
      }),
    });
    const data = (await res.json()) as GeminiResponse;
    if (!res.ok) {
      throw new Error(data.error?.message ?? `Error HTTP ${res.status}`);
    }
    const text = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('');
    if (!text) throw new Error('El modelo no devolvió respuesta.');
    return text;
  }
}
