// Small helpers shared by the other modules.

/** Escape text before putting it into HTML. */
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** WhatsApp share link with a prefilled message (no phone number, so the user picks the chat). */
export const wa = (text) => 'https://wa.me/?text=' + encodeURIComponent(text);

/** Google Calendar "new event" link for a return reminder. Includes the due date when known. */
export function calendarLink(book, due) {
  let url = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(`Return "${book.title}" (Borrow-a-Book Shelf)`) +
    '&details=' + encodeURIComponent(`Hand it back to lender ${book.lender || ''}, then tap Return on the shelf.`);
  if (due) {
    const d = due.replaceAll('-', '');
    const next = new Date(Date.parse(due) + 86400000).toISOString().slice(0, 10).replaceAll('-', '');
    url += `&dates=${d}/${next}`;
  }
  return url;
}

/** Cover gradients, cycled by book position. */
const COVERS = [
  'linear-gradient(150deg,#ff318c,#6b57ff)',
  'linear-gradient(150deg,#fc801d,#fdb60d)',
  'linear-gradient(150deg,#07c3f2,#21d789)',
  'linear-gradient(150deg,#6b57ff,#07c3f2)',
  'linear-gradient(150deg,#fdb60d,#ff318c)',
];
export const coverFor = (i) => COVERS[i % COVERS.length];

/** Library-style call number, e.g. "DIS 001". */
export const callNumber = (book, i) =>
  `${(book.course || 'GEN').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()} ${String(i + 1).padStart(3, '0')}`;

/** "2026-10-10" -> "10 Oct" */
export const shortDate = (iso) =>
  iso ? new Date(iso.length === 10 ? iso + 'T12:00:00Z' : iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

/** Link that opens the app scrolled to one book, e.g. https://shelf.vercel.app/#book-b3 */
export const bookLink = (id) => `${location.origin}${location.pathname}#book-${id}`;
