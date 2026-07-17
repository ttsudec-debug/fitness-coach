/** Respaldo cifrado: AES-256-GCM con clave derivada por PBKDF2 (150k iter).
 * Formato del archivo: base64( salt[16] + iv[12] + ciphertext ). */

const enc = new TextEncoder();
const dec = new TextDecoder();

async function deriveKey(pass: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 150000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptJson(data: unknown, pass: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pass, salt);
  const ct = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      enc.encode(JSON.stringify(data)),
    ),
  );
  const buf = new Uint8Array(16 + 12 + ct.length);
  buf.set(salt);
  buf.set(iv, 16);
  buf.set(ct, 28);
  let bin = '';
  buf.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

export async function decryptJson(b64: string, pass: string): Promise<unknown> {
  const raw = Uint8Array.from(atob(b64.trim()), (c) => c.charCodeAt(0));
  const key = await deriveKey(pass, raw.slice(0, 16));
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: raw.slice(16, 28) as BufferSource },
    key,
    raw.slice(28) as BufferSource,
  );
  return JSON.parse(dec.decode(pt));
}
