// GET /api/contact?book=<id>
// Opens WhatsApp with a borrow request already written.
// If the lender opted in, it goes straight to the lender's chat (their number is decrypted here,
// server-side, and never appears on the page). Otherwise it opens WhatsApp's chat picker with a
// message for the class group that names the lender code.
import { requestText } from '../js/status.js';
import { config, allBooks } from './_github.js';
import { decryptContact } from './_crypto.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const id = new URL(req.url, 'http://x').searchParams.get('book');
    const { books } = await allBooks(config());
    const book = books.find((b) => b.id === id);
    if (!book) return res.status(404).send('That book is not on the shelf.');
    let phone = null;
    try { phone = book.contact ? decryptContact(book.contact) : null; } catch { phone = null; }
    const text = encodeURIComponent(requestText(book, Boolean(phone)));
    res.setHeader('Location', phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`);
    return res.status(302).end();
  } catch (err) {
    return res.status(err.status || 500).send(err.message || 'Something went wrong.');
  }
}
