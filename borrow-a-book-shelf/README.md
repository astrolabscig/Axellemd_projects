# Borrow-a-Book Shelf

One link for the whole class: lenders list their books, borrowers borrow, return and reserve them, and everyone sees who has what. Borrowing is always free.

Static frontend (HTML, CSS, plain JavaScript modules) plus one Vercel serverless function. No framework, no build step, no database server: the loan log is a JSON file in this repository.

## How it works

```
Browser ──fetch──▶ /api/loans, /api/books (Vercel functions) ──GitHub API──▶ data/loans.json, data/books.json
```

- `GET /api/loans` returns the loan log and the books lenders listed.
- `POST /api/loans` with `{ bookId, action, code, due? }` validates the request and commits the new event to `data/loans.json`.
- `POST /api/books` with `{ title, author, course?, condition, keep, area?, note?, lender? }` validates a lender's listing, gives new lenders the next free code (L5, L6, ...), and commits it to `data/books.json`.
- The GitHub token lives only in Vercel's environment variables. The browser never sees it.
- Every borrow, return and reservation is a commit, so the git history is the full lending record.
- `vercel.json` skips redeploying when only `data/loans.json` or `data/books.json` changed.
- The same rules (`js/status.js`) run in the browser and on the server, so the UI and the API always agree.

## Lending a book

1. A lender taps **List a book to lend** and fills in title, author, course, condition, how long it can be kept, and optionally the area they're based in (e.g. Kotei, Ayeduase, never a house address) and a note.
2. The book goes on the shelf straight away. New lenders get a lender code (e.g. L5) to reuse next time.
3. The app then offers **Post to the class group**: a ready WhatsApp message with the book's details and a link like `https://your-app.vercel.app/#book-b-abc123`.
4. Anyone who taps that link lands on the app scrolled to that book, highlighted, with Borrow and Reserve right there.

Every book card also has **Share to the group**, which sends the same kind of link.

## Contacting the lender

When listing, a lender can tick **Let borrowers message me directly on WhatsApp** and enter their number.

- The number is encrypted on the server (AES-256-GCM, key from `CONTACT_SECRET`) and stored only as ciphertext in `books.json`. It is never sent to the browser or shown on the page.
- A book's **Message the lender** link goes to `/api/contact?book=<id>`, which decrypts the number server-side and redirects to `https://wa.me/<number>?text=<request>`. The borrower sees the number only inside WhatsApp, after choosing to message.
- Lenders who don't opt in get **Ask in the class group** instead: a ready message naming the book and lender code, for the class group.
- For books the keeper adds by hand in `shelf.json`, encrypt a number (with the lender's permission) using `scripts/encrypt-contact.mjs` and paste it into that book's `contact` field.

## Structure

```
├── index.html
├── css/styles.css
├── js/
│   ├── main.js      page wiring, borrow/return dialog
│   ├── render.js    hero shelf, book cards, lending record
│   ├── store.js     talks to /api/loans, or demo mode when there's no API
│   ├── status.js    loan rules shared with the server (who has it, overdue, validation)
│   └── utils.js     WhatsApp and calendar links, cover colours
├── api/loans.js     GET the log + listed books, POST a borrow/return/reservation
├── api/books.js     POST a lender's listing
├── api/contact.js   GET: opens WhatsApp to the lender (opt-in) or the class group
├── api/_github.js   shared GitHub read/write helpers (not a route)
├── api/_crypto.js   encrypts/decrypts lender numbers (not a route)
├── scripts/encrypt-contact.mjs  encrypt a number for shelf.json by hand
├── data/shelf.json  shelf settings and the starting books (edited by the keeper)
├── data/books.json  books lenders listed in the app (written by the app)
├── data/loans.json  the loan log (written by the app)
├── assets/logo.svg
├── package.json
└── vercel.json
```

## Getting a book (borrowing is a two-step, human + app flow)

The app records loans; it does not deliver books. So:

1. **Contact the lender** — the main button on a free book messages the lender (or the class group). Agree a pick-up.
2. **Sign it out** — after the book is in hand, tap **Got it — sign it out**, enter your borrower code and the due date. The app shows a **4-digit return PIN**, saved on your phone.
3. **Return it** — tap **Return this book** and enter that PIN. Only the borrower has it, so nobody else can free your book.

## Rules the app enforces

- Borrower codes look like `B4`. No names.
- You can only borrow a book nobody has. If it's reserved, only the person who reserved it can borrow it.
- Only the person who has a book can mark it returned, and only with the private 4-digit PIN issued when they borrowed it. Borrower codes are hidden on the shelf, and PINs are never stored in the clear (only a salted SHA-256 hash is kept).
- One reservation per book. Cancelling needs the reservation PIN.
- Due dates must be between today and 60 days from now.
- Listings need a title, author, condition and loan length, and are rejected if they contain a phone number or email.
- Status is worked out from the log: Available, Returned, Reserved, Borrowed, Due soon (2 days or less), Overdue.

## Deploy on Vercel

1. **Create a GitHub repository** (for example `borrow-a-book-shelf`) and push this folder's contents to its root.
2. **Create a fine-grained GitHub token:** GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token. Repository access: *Only select repositories* → this repo. Permissions → Repository permissions → **Contents: Read and write**. Copy the token.
3. **Import the repo into Vercel:** vercel.com → Add New → Project → import the repo. Framework preset: **Other**. Leave the build command empty. Deploy.
4. **Add environment variables:** Project → Settings → Environment Variables:
   - `GITHUB_TOKEN` = the token from step 2
   - `GITHUB_REPO` = `your-username/borrow-a-book-shelf`
   - `GITHUB_BRANCH` = `main` (optional, this is the default)
   - `DATA_DIR` = `data` (optional, this is the default; change it if the app lives in a subfolder of a bigger repo, e.g. `borrow-a-book-shelf/data`)
   - `CONTACT_SECRET` = a long random string (at least 16 characters) used to encrypt lender numbers. Don't change it later, or saved numbers can't be decrypted.
5. **Redeploy** (Deployments → the latest → Redeploy) so the function picks up the variables.
6. **Test:** open the site, borrow a book with code `B1`, and check that a new commit appears in the repo. Then return it.

## Run locally

- **UI only (demo mode):** `python3 -m http.server 8000` and open http://localhost:8000. There's no API, so the page shows a demo banner and keeps changes in your browser only.
- **With the real API:** install the Vercel CLI (`npm i -g vercel`), create a `.env` file with the variables above, and run `vercel dev`.

## Update the shelf

- Lenders add their own books through the app. To remove or correct a listing, edit `data/books.json` on GitHub.
- The keeper can also add a book by hand: add an entry to `data/shelf.json` with a new `id` (`b5`, ...), `title`, `author`, `course`, `lender` (a code like `L5`), `condition`, `keep`, `note`, and optionally `area` (general neighbourhood or hall, e.g. Kotei) and `spine` (a short title for the hero bookshelf). Push, and Vercel redeploys.
- Fix a mistake in the loan log: edit `data/loans.json` on GitHub and remove or correct the event. The site picks it up on the next load.
- Hand out borrower codes (`B1`, `B2`, ...) and keep the list of who is who somewhere private, never in this repo.

## Privacy

Everything in `data/` can be read by anyone who can see the repo, and the page shows codes to the whole class. Only codes, book details, areas, dates and (for lenders who opt in) encrypted WhatsApp numbers are stored. Never put names, phone numbers or index numbers in `shelf.json`, `books.json` or `loans.json`. Return PINs are stored only as salted hashes, so even someone reading the repo can't return other people's books.

## Limits

There are no logins, so anyone with the link who knows a borrower code could change a status. For one class that's an acceptable trade-off: every change is a commit, so mistakes and misuse are visible and easy to undo.
