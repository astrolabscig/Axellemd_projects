// GET  /api/loans -> { events, books }   (books = ones lenders listed in the app)
// POST /api/loans { bookId, action, code, due? } -> adds one event to data/loans.json
//
// Environment variables (Vercel > Project > Settings > Environment Variables):
//   GITHUB_TOKEN   fine-grained token, this repo only, Contents: Read and write
//   GITHUB_REPO    e.g. astrolabscig/borrow-a-book-shelf
//   GITHUB_BRANCH  optional, default "main"
//   DATA_DIR       optional, default "data"
import { validateAction, todayISO, newId, publicBook, publicEvent } from '../js/status.js';
import { config, readJSON, writeJSON, parseBody, allBooks, sendError } from './_github.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const c = config();
    if (req.method === 'GET') {
      const [{ data }, { listed }] = await Promise.all([readJSON(c, 'loans.json'), allBooks(c)]);
      return res.status(200).json({ events: (data?.events || []).map(publicEvent), books: listed.map(publicBook) });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed.' });
    }
    const input = parseBody(req);
    const { books } = await allBooks(c);
    // Optimistic concurrency: if someone saved between our read and write, re-read and re-check.
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, sha } = await readJSON(c, 'loans.json');
      const events = data?.events || [];
      const check = await validateAction(events, books, input, todayISO());
      if (!check.ok) return res.status(409).json({ error: check.error, events: events.map(publicEvent) });
      const event = { id: newId(), ...check.event, at: new Date().toISOString() };
      const title = books.find((b) => b.id === event.bookId)?.title || event.bookId;
      const message = `${event.action}: ${title} (${event.code}${event.due ? `, due ${event.due}` : ''})`;
      const next = [...events, event];
      if (await writeJSON(c, 'loans.json', { events: next }, sha, message)) {
        return res.status(201).json({ event: publicEvent(event), pin: check.pin || null, events: next.map(publicEvent) });
      }
    }
    return res.status(409).json({ error: 'Someone else just updated the shelf. Refresh and try again.' });
  } catch (err) {
    return sendError(res, err);
  }
}
