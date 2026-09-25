// Entry point: state, rendering and events.
import { GUIDES } from './guides.js';
import { getVoice, saveVoice, deleteVoice } from './storage.js';
import { play, stop, readAsDataURL, startRecording } from './audio.js';
import { MAX_UPLOAD_BYTES } from './config.js';
import { homeView, guideView, doneView, setupView } from './views.js';

const app = document.getElementById('app');
let state = { view: 'home', guide: null, step: 0 };
let recordingKey = null;
let stopRecording = null;
let message = '';

function render() {
  stop();
  if (state.view === 'home') app.innerHTML = homeView();
  else if (state.view === 'guide') app.innerHTML = guideView(state.guide, state.step);
  else if (state.view === 'done') app.innerHTML = doneView();
  else if (state.view === 'setup') app.innerHTML = setupView(recordingKey, message);
  window.scrollTo(0, 0);
  // Family voice plays by itself when a step opens (the tap that opened it counts as permission).
  if (state.view === 'guide') play(getVoice(state.guide, state.step));
}

const go = (next) => { message = ''; state = next; render(); };
const say = (text) => { message = text; render(); };

async function toggleRecording(k) {
  const [g, i] = k.split(':');
  if (recordingKey === k && stopRecording) {
    const dataUrl = await stopRecording();
    recordingKey = null; stopRecording = null;
    say(saveVoice(g, i, dataUrl) ? 'Saved.' : "Couldn't save. The phone may be out of space, so try a shorter recording.");
  } else if (!recordingKey) {
    try {
      stopRecording = await startRecording();
      recordingKey = k;
      say('Recording… press Stop when you finish.');
    } catch (err) { say(err.message); }
  }
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-go],[data-act],[data-rec],[data-play],[data-del]');
  if (!t) return;
  const d = t.dataset;
  if (d.go) return go({ view: 'guide', guide: d.go, step: 0 });
  if (d.rec) return toggleRecording(d.rec);
  if (d.play) { const [g, i] = d.play.split(':'); return play(getVoice(g, i)); }
  if (d.del) { const [g, i] = d.del.split(':'); deleteVoice(g, i); return say('Deleted.'); }
  switch (d.act) {
    case 'home': return go({ view: 'home' });
    case 'setup': return go({ view: 'setup' });
    case 'play': return play(getVoice(state.guide, state.step));
    case 'back': return state.step > 0 ? go({ ...state, step: state.step - 1 }) : go({ view: 'home' });
    case 'next': {
      const n = GUIDES[state.guide].steps.length;
      return state.step < n - 1 ? go({ ...state, step: state.step + 1 }) : go({ view: 'done' });
    }
  }
});

document.addEventListener('change', async (e) => {
  const t = e.target;
  if (!t.dataset?.up || !t.files?.[0]) return;
  const file = t.files[0];
  if (file.size > MAX_UPLOAD_BYTES) return say('That file is too big. Keep each recording under about 30 seconds.');
  const [g, i] = t.dataset.up.split(':');
  say(saveVoice(g, i, await readAsDataURL(file)) ? 'Saved.' : "Couldn't save. The phone may be out of space, so try a shorter recording.");
});

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

render();
