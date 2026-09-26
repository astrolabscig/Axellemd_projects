// Data layer. On Vercel it talks to /api/loans and /api/books (live, shared by everyone).
// Anywhere else (e.g. a local static server) it falls back to demo mode,
// which keeps changes in this browser only, so you can try the UI offline.
import { validateAction, validateListing, todayISO, newId, publicEvent } from './status.js';

const DEMO_EVENTS = 'borrow-a-book-demo-events';
const DEMO_BOOKS = 'borrow-a-book-demo-books';

async function postJSON(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || 'Could not save. Try again.'), { body: j });
  return j;
}

async function liveStore() {
  const res = await fetch('api/loans', { cache: 'no-store' });
  const type = res.headers.get('content-type') || '';
  if (!res.ok || !type.includes('application/json')) throw new Error('No API');
  const body = await res.json();
  if (!Array.isArray(body.events)) throw new Error('No API');
  const store = {
    mode: 'live',
    events: body.events,
    listed: body.books || [],
    async refresh() {
      const r = await fetch('api/loans', { cache: 'no-store' });
      if (r.ok) { const j = await r.json(); store.events = j.events; store.listed = j.books || store.listed; }
    },
    async act(input) {
      try {
        const j = await postJSON('api/loans', input);
        store.events = j.events;
        return { event: j.event, pin: j.pin || null };
      } catch (err) {
        if (Array.isArray(err.body?.events)) store.events = err.body.events;
        throw err;
      }
    },
    async list(input) {
      const j = await postJSON('api/books', input);
      store.listed = j.books;
      return j.book;
    },
  };
  return store;
}

async function demoStore(baseBooks) {
  const load = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage off */ } };
  let events = load(DEMO_EVENTS) || [];
  let listed = load(DEMO_BOOKS) || [];
  if (!events.length) {
    try { const r = await fetch('data/loans.json', { cache: 'no-store' }); if (r.ok) events = (await r.json()).events || []; } catch { /* empty */ }
  }
  return {
    mode: 'demo',
    get events() { return events; },
    get listed() { return listed; },
    async refresh() {},
    async act(input) {
      const check = await validateAction(events, [...baseBooks, ...listed], input, todayISO());
      if (!check.ok) throw new Error(check.error);
      const event = { id: newId(), ...check.event, at: new Date().toISOString() };
      events = [...events, event];
      save(DEMO_EVENTS, events); // full events (with pinHash) stay in this browser only
      return { event: publicEvent(event), pin: check.pin || null };
    },
    async list(input) {
      const check = validateListing([...baseBooks, ...listed], input);
      if (!check.ok) throw new Error(check.error);
      // Demo mode never stores numbers; it only remembers that the lender opted in.
      const book = { ...check.book, direct: Boolean(check.phone) };
      listed = [...listed, book];
      save(DEMO_BOOKS, listed);
      return book;
    },
  };
}

export async function createStore(baseBooks) {
  try { return await liveStore(); } catch { return demoStore(baseBooks); }
}
