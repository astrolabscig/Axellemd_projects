// Encrypts lender WhatsApp numbers so they are never stored or served in plain text.
// Key: CONTACT_SECRET environment variable (any long random string). Not a route (starts with "_").
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { httpError } from './_github.js';

function key() {
  const secret = process.env.CONTACT_SECRET;
  if (!secret || secret.length < 16) throw httpError(503, "Direct messages aren't set up yet. Untick direct messages, or ask the shelf keeper.");
  return createHash('sha256').update(secret).digest();
}

export function encryptContact(digits) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(digits, 'utf8'), cipher.final()]);
  return 'v1:' + Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');
}

export function decryptContact(token) {
  if (!token || !token.startsWith('v1:')) return null;
  try {
    const raw = Buffer.from(token.slice(3), 'base64');
    const decipher = createDecipheriv('aes-256-gcm', key(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}
