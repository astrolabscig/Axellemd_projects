// Entry point: loads the shelf, connects to the live data, and wires up the page.
import { wa, shortDate } from './utils.js';
import { keepDays, addDays, todayISO, deriveState, statusOf } from './status.js';
import { createStore } from './store.js';
import { renderHeroShelf, renderCatalogue, renderRecord, shareText } from './render.js';

const $ = (s) => document.querySelector(s);
let shelf, baseBooks, store, query = '', filter = 'all', pending = null;

/** Books set by the keeper in shelf.json plus books lenders listed in the app. */
const allBooks = () => [...baseBooks, ...(store?.listed || [])];

function render() {
  const books = allBooks();
  renderHeroShelf($('#heroShelf'), books);
  renderCatalogue($('#books'), books, shelf, store.events, query, filter, store.mode === 'live');
  const free = books.filter((b) => ['available', 'returned'].includes(statusOf(deriveState(store.events, b.id)))).length;
  const count = $('#count'); if (count) count.textContent = `${books.length} books · ${free} free now`;
  renderRecord($('#record'), books, store.events);
}

function toast(text, bad = false) {
  const t = $('#toast');
  t.textContent = text;
  t.classList.toggle('bad', bad);
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, 4200);
}

// ---------- Deep links: #book-<id> opens the app on that book ----------
function focusBook() {
  const m = location.hash.match(/^#book-(.+)$/);
  if (!m) return;
  if (filter !== 'all' || query) {
    filter = 'all'; query = ''; $('#q').value = '';
    document.querySelectorAll('#filters [data-f]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.f === 'all')));
    render();
  }
  const card = document.getElementById(`book-${decodeURIComponent(m[1])}`);
  if (!card) return;
  card.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  card.classList.remove('spot'); void card.offsetWidth; card.classList.add('spot');
}

// ---------- Borrow / return / reserve ----------
const TITLES = { borrowed: 'Borrow', returned: 'Return', reserved: 'Reserve', unreserved: 'Cancel reservation' };
const DONE = { borrowed: 'Borrowed', returned: 'Returned', reserved: 'Reserved', unreserved: 'Reservation cancelled' };

function openDialog(action, bookId) {
  const b = allBooks().find((x) => x.id === bookId);
  const state = deriveState(store.events, bookId);
  pending = { action, bookId };
  $('#dlgTitle').textContent = TITLES[action];
  const bookLine = $('#dlgBook'); if (bookLine) bookLine.textContent = `${b.title} · ${b.author}`;
  $('#dlgHelp').textContent = {
    borrowed: 'Borrowing is free. Agree the due date with the lender when you pick the book up, then tap Borrow.',
    returned: `Tap Return once the book is back with the lender. Only ${state.holder}, who has it, can return it.`,
    reserved: 'Reserve it and you are next in line. It stays reserved for you until you borrow it or cancel.',
    unreserved: `Only ${state.reservation}, who reserved it, can cancel.`,
  }[action];
  $('#dueRow').hidden = action !== 'borrowed';
  const due = $('#dlgDue');
  due.min = todayISO();
  due.max = addDays(todayISO(), 60);
  due.value = addDays(todayISO(), keepDays(b.keep));
  $('#dlgSubmit').textContent = TITLES[action];
  $('#dlgError').textContent = '';
  $('#actDialog').showModal();
  $('#dlgCode').focus();
}

async function submitDialog(e) {
  e.preventDefault();
  if (!pending) return;
  const btn = $('#dlgSubmit');
  btn.disabled = true;
  $('#dlgError').textContent = '';
  const input = { ...pending, code: $('#dlgCode').value.trim().toUpperCase() };
  if (pending.action === 'borrowed') input.due = $('#dlgDue').value;
  try {
    const event = await store.act(input);
    const b = allBooks().find((x) => x.id === input.bookId);
    $('#actDialog').close();
    render();
    toast(`${DONE[input.action]}: ${b.title}${event.due ? `, due back ${shortDate(event.due)}` : ''}.`);
    try { localStorage.setItem('borrow-a-book-code', input.code); } catch { /* ignore */ }
  } catch (err) {
    $('#dlgError').textContent = err.message;
    render();
  } finally {
    btn.disabled = false;
  }
}

// ---------- Lend a book: list it, then post it to the group ----------
function openLend() {
  const f = $('#lendForm');
  f.reset();
  $('#phoneRow').hidden = true;
  try { const saved = localStorage.getItem('borrow-a-book-lender'); if (saved) f.lender.value = saved; } catch { /* ignore */ }
  $('#lendError').textContent = '';
  $('#lendStep1').hidden = false;
  $('#lendStep2').hidden = true;
  $('#lendDialog').showModal();
  f.title.focus();
}

async function submitLend(e) {
  e.preventDefault();
  const f = $('#lendForm');
  const btn = $('#lendSubmit');
  btn.disabled = true;
  $('#lendError').textContent = '';
  const input = Object.fromEntries(['title', 'author', 'course', 'condition', 'keep', 'area', 'note', 'lender', 'phone'].map((k) => [k, f[k].value]));
  input.contactOptIn = f.contactOptIn.checked;
  try {
    const book = await store.list(input);
    try { localStorage.setItem('borrow-a-book-lender', book.lender); } catch { /* ignore */ }
    render();
    $('#lendDone').textContent = `"${book.title}" is on the shelf. Your lender code is ${book.lender}: use it next time you list a book.` +
      (book.direct ? ' Borrowers can message you directly; your number stays hidden on the page.' : ' Borrowers will ask for it in the class group.');
    $('#lendShare').href = wa(shareText(book));
    $('#lendStep1').hidden = true;
    $('#lendStep2').hidden = false;
    $('#lendShare').focus();
  } catch (err) {
    $('#lendError').textContent = err.message;
  } finally {
    btn.disabled = false;
  }
}

function wire() {
  $('#reqBtn').href = wa('Hi everyone, does anyone have a copy of [book title] I could borrow for a short while? Borrowing is free. Borrow-a-Book Shelf request.');
  $('#keeperText').textContent =
    `${shelf.keeper} hands out borrower codes, fixes mistakes, and follows up on overdue books. No day-to-day updating needed.`;
  $('#q').addEventListener('input', (e) => { query = e.target.value; render(); });
  $('#filters').addEventListener('click', (e) => {
    const f = e.target.closest('[data-f]'); if (!f) return;
    filter = f.dataset.f;
    document.querySelectorAll('#filters [data-f]').forEach((x) => x.setAttribute('aria-pressed', String(x === f)));
    render();
  });
  $('#books').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (b) openDialog(b.dataset.act, b.dataset.book);
  });
  $('#actForm').addEventListener('submit', submitDialog);
  $('#dlgCancel').addEventListener('click', () => $('#actDialog').close());
  document.querySelectorAll('[data-open="lend"]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); openLend(); }));
  $('#lendForm').addEventListener('submit', submitLend);
  $('#lendForm').contactOptIn.addEventListener('change', (e) => { $('#phoneRow').hidden = !e.target.checked; $('#lendForm').phone.required = e.target.checked; });
  $('#lendCancel').addEventListener('click', () => $('#lendDialog').close());
  $('#lendClose').addEventListener('click', () => {
    $('#lendDialog').close();
    const id = $('#lendShare').href.match(/#book-([^\s&%]+)/)?.[1];
    if (id) { history.replaceState(null, '', `#book-${id}`); focusBook(); }
  });
  window.addEventListener('hashchange', focusBook);
  try { const saved = localStorage.getItem('borrow-a-book-code'); if (saved) $('#dlgCode').value = saved; } catch { /* ignore */ }
}

async function init() {
  try {
    const res = await fetch('data/shelf.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`shelf.json ${res.status}`);
    ({ shelf, books: baseBooks } = await res.json());
  } catch (err) {
    console.error(err);
    $('#books').innerHTML = '<li class="empty">The book list could not load. If you opened index.html straight from your computer, run it through a local server instead (see README).</li>';
    return;
  }
  store = await createStore(baseBooks);
  $('#demoBanner').hidden = store.mode !== 'demo';
  wire();
  render();
  focusBook();
  if (store.mode === 'live') {
    const refresh = async () => { await store.refresh(); render(); };
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
    setInterval(() => {
      if (!document.hidden && !$('#actDialog').open && !$('#lendDialog').open) refresh();
    }, 60000);
  }
}

init();
