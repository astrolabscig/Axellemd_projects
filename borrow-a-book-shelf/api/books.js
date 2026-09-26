// POST /api/books { title, author, course?, condition, keep, area?, note?, lender?, contactOptIn?, phone? }
// Adds a lender's book to data/books.json and returns it (with its id and lender code),
// so the app can open a WhatsApp message linking straight to the new book.
import { validateListing, publicBook } from '../js/status.js';
import { encryptContact } from './_crypto.js';
import { config, writeJSON, parseBody, allBooks, sendError } from './_github.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const c = config();
    const input = parseBody(req);
    for (let attempt = 0; attempt < 3; attempt++) {
      const { books, listed, listedSha } = await allBooks(c);
      const check = validateListing(books, input);
      if (!check.ok) return res.status(409).json({ error: check.error });
      const book = check.phone ? { ...check.book, contact: encryptContact(check.phone) } : check.book;
      const next = [...listed, book];
      const message = `listed: ${book.title} by ${book.author} (${book.lender})`;
      if (await writeJSON(c, 'books.json', { books: next }, listedSha, message)) {
        return res.status(201).json({ book: publicBook(book), books: next.map(publicBook) });
      }
    }
    return res.status(409).json({ error: 'Someone else just updated the shelf. Try again.' });
  } catch (err) {
    return sendError(res, err);
  }
}
