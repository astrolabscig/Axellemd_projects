// Encrypt a lender's WhatsApp number for books the keeper adds by hand in data/shelf.json.
// Only with the lender's permission. Usage (same CONTACT_SECRET as in Vercel):
//   CONTACT_SECRET="your-secret" node scripts/encrypt-contact.mjs "024 123 4567"
// PowerShell:
//   $env:CONTACT_SECRET="your-secret"; node scripts/encrypt-contact.mjs "024 123 4567"
// Paste the printed value into that book's "contact" field in data/shelf.json.
import { normalizePhone } from '../js/status.js';
import { encryptContact } from '../api/_crypto.js';

const digits = normalizePhone(process.argv[2]);
if (!digits) { console.error('That does not look like a phone number.'); process.exit(1); }
console.log(encryptContact(digits));
