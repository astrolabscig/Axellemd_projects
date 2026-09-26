// Loan logic shared by the browser (js/*) and the server function (api/loans.js).
// Pure functions only: no DOM, no network.

export const DAY = 86400000;
export const todayISO = (now = new Date()) => now.toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);
export const addDays = (iso, n) => new Date(Date.parse(iso) + n * DAY).toISOString().slice(0, 10);

/** Borrower codes look like B1, B12, B104. Codes only, never names. */
export const BORROWER_CODE = /^B\d{1,3}$/;
export const ACTIONS = ['borrowed', 'returned', 'reserved', 'unreserved'];

/**
 * Replay the event log for one book to get who has it, until when, and who reserved it.
 * `pin` fields hold the private PIN that guards Return / cancel-reservation. On events that
 * reach the browser these are already stripped (the server only sends `pinHash`), so the
 * public shelf never reveals them.
 */
export function deriveState(events, bookId) {
  const s = { holder: null, due: null, reservation: null, last: null, at: null, holdPin: null, resPin: null };
  for (const e of events) {
    if (e.bookId !== bookId) continue;
    if (e.action === 'borrowed') {
      s.holder = e.code; s.due = e.due; s.holdPin = e.pinHash || e.pin || null;
      if (s.reservation === e.code) { s.reservation = null; s.resPin = null; }
    }
    if (e.action === 'returned') { s.holder = null; s.due = null; s.holdPin = null; }
    if (e.action === 'reserved') { s.reservation = e.code; s.resPin = e.pinHash || e.pin || null; }
    if (e.action === 'unreserved') { s.reservation = null; s.resPin = null; }
    s.last = e.action; s.at = e.at;
  }
  return s;
}

/** One of: available, returned, reserved, borrowed, duesoon, overdue. */
export function statusOf(state, today = todayISO()) {
  if (state.holder) {
    if (state.due && state.due < today) return 'overdue';
    if (state.due && daysBetween(today, state.due) <= 2) return 'duesoon';
    return 'borrowed';
  }
  if (state.reservation) return 'reserved';
  if (state.last === 'returned') return 'returned';
  return 'available';
}

export const STATUS = {
  available: { label: 'Available', color: '#21d789' },
  returned: { label: 'Returned', color: '#07c3f2' },
  reserved: { label: 'Reserved', color: '#6b57ff' },
  borrowed: { label: 'Borrowed', color: '#fc801d' },
  duesoon: { label: 'Due soon', color: '#fdb60d' },
  overdue: { label: 'Overdue', color: '#ff318c' },
};

/** "2 weeks" -> 14, "1 week" -> 7, "10 days" -> 10; anything else -> 14. */
export function keepDays(keep = '') {
  const m = String(keep).match(/(\d+)\s*(week|day)/i);
  if (!m) return 14;
  return Number(m[1]) * (m[2].toLowerCase() === 'week' ? 7 : 1);
}

const fail = (error) => ({ ok: false, error });

/** A private 4-digit return PIN, shown to the borrower once and kept on their device. */
export const PIN = /^\d{4}$/;
export const makePin = () => String(Math.floor(1000 + Math.random() * 9000));

/**
 * Hash a PIN with a per-event salt so the stored log never contains the PIN itself.
 * Uses Web Crypto (browser and modern Node). Returns "salt:hexdigest".
 */
export async function hashPin(pin, salt) {
  salt = salt || (crypto.getRandomValues(new Uint8Array(8))).reduce((a, b) => a + b.toString(16).padStart(2, '0'), '');
  const bytes = new TextEncoder().encode(salt + ':' + pin);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return salt + ':' + hex;
}

export async function pinMatches(pin, stored) {
  if (!stored || !String(stored).includes(':')) return false;
  const salt = String(stored).split(':')[0];
  return (await hashPin(pin, salt)) === stored;
}

/**
 * Check a requested action against the current log.
 * input: { bookId, action, code, due? }  ->  { ok: true, event } | { ok: false, error }
 */
export async function validateAction(events, books, input = {}, today = todayISO()) {
  const book = books.find((b) => b.id === input.bookId);
  if (!book) return fail('That book is not on the shelf.');
  const action = input.action;
  if (!ACTIONS.includes(action)) return fail('Unknown action.');
  const code = String(input.code || '').trim().toUpperCase();
  if (!BORROWER_CODE.test(code)) return fail("Enter your borrower code, like B4. Ask the shelf keeper if you don't have one.");
  const s = deriveState(events, book.id);

  if (action === 'borrowed') {
    if (s.holder) return fail(`"${book.title}" is already borrowed.`);
    if (s.reservation && s.reservation !== code) return fail(`"${book.title}" is reserved for someone else.`);
    const due = String(input.due || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due) || Number.isNaN(Date.parse(due))) return fail('Pick the due date you agreed with the lender.');
    const d = daysBetween(today, due);
    if (d < 0) return fail("The due date can't be in the past.");
    if (d > 60) return fail('The due date must be within 60 days.');
    const pin = makePin();
    return { ok: true, pin, event: { bookId: book.id, action, code, due, pinHash: await hashPin(pin) } };
  }
  if (action === 'returned') {
    if (!s.holder) return fail(`"${book.title}" isn't borrowed right now.`);
    if (s.holder !== code) return fail('That borrower code does not match who has this book.');
    if (!(await pinMatches(String(input.pin || ''), s.holdPin))) {
      return fail('Wrong PIN. Only the borrower has the return PIN shown when they borrowed the book. Ask the shelf keeper if you lost it.');
    }
    return { ok: true, event: { bookId: book.id, action, code } };
  }
  if (action === 'reserved') {
    if (s.reservation) return fail(`"${book.title}" is already reserved.`);
    if (s.holder === code) return fail('You already have this book.');
    const pin = makePin();
    return { ok: true, pin, event: { bookId: book.id, action, code, pinHash: await hashPin(pin) } };
  }
  // unreserved
  if (s.reservation !== code) return fail('That code does not match who reserved this book.');
  if (!(await pinMatches(String(input.pin || ''), s.resPin))) {
    return fail('Wrong PIN. Only the person who reserved it has the PIN.');
  }
  return { ok: true, event: { bookId: book.id, action, code } };
}

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/** Events as the browser may see them: keep pinHash (needed to verify a return) but never a raw pin. */
export const publicEvent = ({ pin, ...rest }) => rest;

// ---------- Listings (lenders adding their own books) ----------

export const LENDER_CODE = /^L\d{1,3}$/;
const PHONE_OR_EMAIL = /(\+?\d[\d\s-]{6,}\d)|([^\s@]+@[^\s@]+\.[^\s@]+)/;

/** Next free lender code, e.g. L5 when L1 to L4 exist. */
export function nextLenderCode(books) {
  const used = books.map((b) => Number(String(b.lender || '').replace(/^L/, ''))).filter(Number.isFinite);
  return 'L' + (Math.max(0, ...used) + 1);
}

/**
 * Check a lender's listing. input: { title, author, course?, condition, keep, note?, lender? }
 * -> { ok: true, book } | { ok: false, error }
 */
export function validateListing(books, input = {}) {
  // input may include area: a general neighbourhood or hall (e.g. Kotei), never an address.
  const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
  const book = {
    title: clean(input.title, 120),
    author: clean(input.author, 80),
    course: clean(input.course, 60) || 'General',
    condition: clean(input.condition, 120),
    keep: clean(input.keep, 60),
    note: clean(input.note, 200),
    area: clean(input.area, 40),
  };
  if (book.title.length < 2) return fail('Add the book title.');
  if (book.author.length < 2) return fail('Add the author.');
  if (!book.condition) return fail('Describe the condition, e.g. "Good, no writing".');
  if (!book.keep) return fail('Say how long someone can keep it, e.g. "2 weeks".');
  if (book.area && !/^[A-Za-z][A-Za-z\s,.'-]*$/.test(book.area)) return fail('For area, just the neighbourhood or hall, e.g. Kotei or Ayeduase. No house numbers.');
  if (Object.values(book).some((v) => PHONE_OR_EMAIL.test(v))) {
    return fail('Leave out phone numbers and emails. People reach you through the class group.');
  }
  let lender = String(input.lender || '').trim().toUpperCase();
  if (lender && !LENDER_CODE.test(lender)) return fail('Lender codes look like L5. Leave it blank to get a new one.');
  if (!lender) lender = nextLenderCode(books);
  const dupe = books.find((b) => b.title.toLowerCase() === book.title.toLowerCase() && b.lender === lender);
  if (dupe) return fail(`"${dupe.title}" is already on the shelf under ${lender}.`);
  if (books.length >= 300) return fail('The shelf is full. Ask the shelf keeper to archive old books.');
  let phone = null;
  if (input.contactOptIn) {
    phone = normalizePhone(input.phone);
    if (!phone) return fail('Enter the WhatsApp number borrowers can message, e.g. 024 123 4567, or untick direct messages.');
  }
  // phone is returned separately: the server encrypts it, and it is never stored in plain text.
  return { ok: true, phone, book: { id: 'b-' + newId(), ...book, lender, listedAt: new Date().toISOString() } };
}

// ---------- Contacting the lender ----------

/**
 * Turn a WhatsApp number into international digits for wa.me.
 * Accepts Ghana local (024 123 4567), +233 24 123 4567, or any 8-15 digit international number.
 * Returns the digits, or null if it doesn't look like a phone number.
 */
export function normalizePhone(raw) {
  let d = String(raw || '').replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  else if (d.startsWith('00')) d = d.slice(2);
  else if (/^0\d{9}$/.test(d)) d = '233' + d.slice(1);
  return /^\d{8,15}$/.test(d) ? d : null;
}

/** True when a lender opted in to direct WhatsApp messages. */
export const hasDirect = (b) => Boolean(b.direct || b.contact);

/** The request a borrower sends. Direct: to the lender. Otherwise: to the class group, naming the lender code. */
export function requestText(b, direct) {
  return direct
    ? `Hi, I'd like to borrow "${b.title}" by ${b.author} from the Borrow-a-Book Shelf. When and where can I pick it up?`
    : `Hi everyone, I'd like to borrow "${b.title}" by ${b.author} from the Borrow-a-Book Shelf. Lender ${b.lender}, when and where can I pick it up?`;
}

/** Book as the browser may see it: never the encrypted contact, just whether direct messages are on. */
export const publicBook = ({ contact, ...rest }) => ({ ...rest, direct: Boolean(contact) || Boolean(rest.direct) });
