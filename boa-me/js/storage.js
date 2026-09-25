// Twi voice recordings, saved on this phone only (browser localStorage, as data URLs).
const voiceKey = (guide, step) => `boame:voice:${guide}:${step}`;

export function getVoice(guide, step) {
  try { return localStorage.getItem(voiceKey(guide, step)); } catch { return null; }
}

export function saveVoice(guide, step, dataUrl) {
  try { localStorage.setItem(voiceKey(guide, step), dataUrl); return true; } catch { return false; }
}

export function deleteVoice(guide, step) {
  try { localStorage.removeItem(voiceKey(guide, step)); } catch { /* nothing to delete */ }
}
