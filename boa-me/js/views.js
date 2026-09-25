// Each view returns an HTML string. No side effects here.
import { GUIDES } from './guides.js';
import { SCREENS } from './phone-screens.js';
import { FAMILY_LINK } from './config.js';
import { getVoice } from './storage.js';

const askButton = (label) =>
  `<a class="btn gold" href="${FAMILY_LINK}" target="_blank" rel="noopener">${label}</a>`;

export function homeView() {
  const tiles = Object.entries(GUIDES).map(([id, g]) =>
    `<button class="tile" data-go="${id}" style="--c:${g.c}"><span class="ic">${g.icon}</span>` +
    `<span><span class="t1">${g.tw}</span><span class="t2">${g.en}</span></span></button>`).join('');
  return `<h1>Boa me</h1><p class="tw">Dɛn na wopɛ sɛ woyɛ?</p><p class="en">What do you want to do?</p>` +
    `<div class="tiles">${tiles}</div>${askButton('Bisa abusua')}` +
    `<p class="en" style="text-align:center;margin-top:6px">Ask family with a voice note</p>` +
    `<button class="small" data-act="setup">For family: record Twi voice</button>`;
}

export function guideView(guideId, stepIndex) {
  const g = GUIDES[guideId];
  const st = g.steps[stepIndex];
  const n = g.steps.length;
  const last = stepIndex === n - 1;
  const dots = g.steps.map((_, j) => `<span class="${j <= stepIndex ? 'on' : ''}"></span>`).join('');
  const listen = getVoice(guideId, stepIndex) ? '<button class="listen" data-act="play">Tie · Listen</button>' : '';
  return `<div class="top"><button class="back" data-act="back">← San</button>` +
    `<span class="count">${stepIndex + 1} / ${n}</span></div><div class="dots">${dots}</div>` +
    `<h2>${g.tw}</h2><div class="say"><p class="tw">${st.tw}</p><p class="en">${st.en}</p>${listen}</div>` +
    SCREENS[st.s]() +
    (st.ask ? `<div class="help">${askButton('Bisa abusua')}</div>` : '') +
    `<div class="help"><button class="btn" data-act="next">${last ? 'Mawie ✓' : 'Toa so →'}</button></div>` +
    (st.ask ? '' : `<div class="help">${askButton('Mehia mmoa · I need help')}</div>`) +
    `<button class="small" data-act="home">Kɔ fie · Back to start</button>`;
}

export function doneView() {
  return `<div class="award"><div class="done" aria-hidden="true">✓</div><h1>Ayekoo!</h1>` +
    `<p class="tw">Woayɛ no wo ara.</p><p class="en">Well done. You did it yourself.</p></div>` +
    `<div style="margin-top:24px"><button class="btn" data-act="home">Kɔ fie</button></div>`;
}

export function setupView(recordingKey, message) {
  let rows = '';
  for (const [id, g] of Object.entries(GUIDES)) {
    rows += `<h3>${g.en}</h3>`;
    g.steps.forEach((st, i) => {
      const k = `${id}:${i}`;
      const has = !!getVoice(id, i);
      rows += `<div class="srow"><span class="lbl">${i + 1}. ${st.en}${has ? ' <span class="has">· saved</span>' : ''}</span>` +
        `<button data-rec="${k}">${recordingKey === k ? 'Stop' : 'Record'}</button>` +
        `<label class="up">Upload<input type="file" accept="audio/*" data-up="${k}" hidden></label>` +
        (has ? `<button data-play="${k}">Play</button><button data-del="${k}">Delete</button>` : '') + `</div>`;
    });
  }
  return `<div class="setup"><h2>Record Twi voice</h2><p class="en">For the family helper. Record each step in Twi on Mum's phone, ` +
    `or upload a recording from the phone's voice recorder. Each recording plays by itself when that step opens. ` +
    `Recordings stay on this phone only.</p><p class="msg" id="msg">${message || ''}</p>${rows}` +
    `<div style="margin-top:22px"><button class="btn alt" data-act="home">Done</button></div></div>`;
}
