// Rendering: hero bookshelf, catalogue cards with live status, and the lending record.
import { esc, wa, calendarLink, coverFor, callNumber, shortDate, bookLink } from './utils.js';
import { deriveState, statusOf, STATUS, hasDirect, requestText } from './status.js';

const ICON = {
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h13"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/></svg>',
};

/** Hero illustration: one spine per book, coloured by its live status bookmark. */
export function renderHeroShelf(el, books) {
  const heights = [214, 188, 236, 176, 222, 200, 244, 168];
  let html = '';
  books.forEach((b, i) => {
    const label = b.spine || b.title; // optional short "spine" title for long names
    const long = label.length > 18;
    const width = long ? 60 : 46 + (label.length % 3) * 6;
    const height = Math.max(heights[i % heights.length], long ? 236 : 0);
    html += `<div class="spine${i === 0 ? ' lean' : ''}" style="width:${width}px;height:${height}px;background:${coverFor(i)}"><b style="${long ? 'font-size:11.5px' : ''}">${esc(label)}</b></div>`;
  });
  for (let k = 0; k < Math.max(0, 7 - books.length); k++) {
    html += `<div class="spine dim" style="width:${30 + (k % 3) * 8}px;height:${heights[(k + 3) % heights.length] - 20}px"></div>`;
  }
  html += '<div class="slot"><b>your book here</b></div>';
  el.innerHTML = html;
}

function statusLine(state, status) {
  if (state.holder) {
    const when = status === 'overdue' ? `was due ${shortDate(state.due)}` : `due back ${shortDate(state.due)}`;
    return `Borrowed, ${when}${state.reservation ? ' · someone is next in line' : ''}`;
  }
  if (state.reservation) return 'Reserved for the next person';
  if (status === 'returned') return 'Back with the lender, free to borrow';
  return 'On the shelf, free to borrow';
}

function actions(b, state, status) {
  const btn = (action, label, icon, cls = 'btn-line') =>
    `<button class="btn ${cls}" type="button" data-act="${action}" data-book="${esc(b.id)}">${ICON[icon]}${label}</button>`;
  const out = [];
  if (state.holder) {
    // Only the borrower can sign it back in, with their PIN.
    out.push(btn('returned', 'Return this book', 'back'));
  } else {
    // Borrow both records the loan AND opens the message to the lender (or the class
    // group), in that order, so tapping it always ends with something to send.
    out.push(btn('borrowed', 'Borrow', 'book', 'btn-dark'));
    if (state.reservation) out.push(btn('unreserved', 'Cancel my reservation', 'pin'));
    else out.push(btn('reserved', 'Reserve', 'pin'));
  }
  return out.join('');
}

/** Small badge on a free book: whether Borrow can message the lender directly, or only the class group. */
function contactBadge(direct, live) {
  return direct && live
    ? `<span class="reach reach-direct">${ICON.chat}Lender contactable directly</span>`
    : `<span class="reach reach-group">${ICON.chat}Reach via class group</span>`;
}

/** WhatsApp text announcing a book, with a link that opens the app on that book. */
export function shareText(b) {
  return `New on the Borrow-a-Book Shelf: "${b.title}" by ${b.author}` +
    `${b.course && b.course !== 'General' ? ` (${b.course})` : ''}.\n` +
    `Condition: ${b.condition}. Keep it for: ${b.keep}.${b.area ? ` Area: ${b.area}.` : ''} Free to borrow.\n` +
    `See it and borrow or reserve it here: ${bookLink(b.id)}`;
}

function bookCard(b, i, shelf, events, live) {
  const state = deriveState(events, b.id);
  const status = statusOf(state);
  const st = STATUS[status];
  const direct = hasDirect(b);
  const askHref = live ? `api/contact?book=${encodeURIComponent(b.id)}` : wa(requestText(b, false));
  const free = !state.holder;
  const remindMsg = `Hi, a quick reminder from the Borrow-a-Book Shelf: "${b.title}" is due back${state.due ? ` on ${shortDate(state.due)}` : ' soon'}. When can we arrange the return?`;
  return `<li class="book" id="book-${esc(b.id)}" style="--st:${st.color}">
    <div class="cover" style="background:${coverFor(i)}" aria-hidden="true">
      <span class="ribbon"></span>
      <h4>${esc(b.title)}</h4>
      <small>${esc(b.author)}</small>
    </div>
    <div class="info">
      <span class="stamp-st">${st.label}</span>
      <span class="callno">${esc(callNumber(b, i))} · ${esc(b.course)}</span>
      <h3 style="margin-top:6px">${esc(b.title)}</h3>
      <p class="by">${esc(b.author)}</p>
    </div>
    <p class="live"><i></i><span>${statusLine(state, status)}</span>${free ? contactBadge(direct, live) : ''}</p>
    <dl class="slip">
      <div><dt>CONDITION</dt><dd>${esc(b.condition || 'Ask the lender')}</dd></div>
      <div><dt>KEEP FOR</dt><dd>${esc(b.keep || 'Ask the lender')}</dd></div>
      <div><dt>PICK UP</dt><dd>${esc(shelf.where)}</dd></div>
      <div><dt>LENDER</dt><dd>${esc(b.lender || '—')}</dd></div>
      <div><dt>AREA</dt><dd>${esc(b.area || 'Ask the lender')}</dd></div>
      <div><dt>COST</dt><dd>Free to borrow</dd></div>
    </dl>
    ${b.note ? `<p class="note">${esc(b.note)}</p>` : ''}
    <div class="acts" data-ask="${esc(askHref)}">${actions(b, state, status)}</div>
    <div class="remind">
      ${free ? `<a class="mini" target="_blank" rel="noopener" href="${askHref}">${ICON.chat}Just ask first, don't borrow yet</a>` : ''}
      <a class="mini" target="_blank" rel="noopener" href="${calendarLink(b, state.due)}">${ICON.cal}Set a return reminder</a>
      ${state.holder ? `<a class="mini" target="_blank" rel="noopener" href="${wa(remindMsg)}">${ICON.bell}Lender: remind borrower</a>` : ''}
      <a class="mini" target="_blank" rel="noopener" href="${wa(shareText(b))}">${ICON.share}Share to the group</a>
    </div>
  </li>`;
}

export function renderCatalogue(el, books, shelf, events, query = '', filter = 'all', live = false) {
  const q = query.trim().toLowerCase();
  const list = books
    .map((b, i) => [b, i])
    .filter(([b]) => !q || [b.title, b.author, b.course].join(' ').toLowerCase().includes(q))
    .filter(([b]) => {
      if (filter === 'all') return true;
      const s = statusOf(deriveState(events, b.id));
      return filter === 'free' ? (s === 'available' || s === 'returned') : !(s === 'available' || s === 'returned');
    });
  el.innerHTML = list.length
    ? list.map(([b, i]) => bookCard(b, i, shelf, events, live)).join('')
    : `<li class="empty">${books.length
        ? 'No books match. Try another search, or ask the class for the book below.'
        : 'No books listed yet. Offer one below to get the shelf started.'}</li>`;
}

const VERB = { borrowed: 'borrowed', returned: 'returned', reserved: 'reserved', unreserved: 'cancelled a reservation for' };

export function renderRecord(el, books, events) {
  const rows = events.slice().reverse().slice(0, 25).map((e) => {
    const b = books.find((x) => x.id === e.bookId);
    return `<li><span class="callno">${esc(shortDate(e.at))}</span><span><b>${esc(e.code)}</b> ${VERB[e.action] || e.action} <b>${esc(b ? b.title : e.bookId)}</b>${e.due ? `, due ${esc(shortDate(e.due))}` : ''}</span></li>`;
  });
  el.innerHTML = rows.length ? rows.join('') : '<li class="none">No loans yet. The first borrow will show up here.</li>';
}
