// Playing, recording and uploading Twi voice.
const player = new Audio();

export function play(src) {
  if (!src) return;
  try { player.src = src; player.play().catch(() => {}); } catch { /* ignore */ }
}

export function stop() {
  try { player.pause(); } catch { /* ignore */ }
}

export function readAsDataURL(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });
}

// Starts recording from the microphone. Resolves with a stop() function that
// resolves with the recording as a data URL.
export async function startRecording() {
  if (!navigator.mediaDevices || !window.MediaRecorder) {
    throw new Error("Recording isn't available in this browser. Open the page in Chrome on the phone.");
  }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    throw new Error("The microphone isn't allowed here. Allow microphone access for this page, or use Upload.");
  }
  const chunks = [];
  const rec = new MediaRecorder(stream);
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  rec.start();
  return () => new Promise((resolve) => {
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      resolve(await readAsDataURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })));
    };
    rec.stop();
  });
}
