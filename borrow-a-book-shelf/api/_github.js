// Shared GitHub helpers for the API routes. Files starting with "_" are not routes on Vercel.
export const httpError = (status, message) => Object.assign(new Error(message), { status });

export function config() {
  const { GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH = 'main', DATA_DIR = 'data' } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_REPO) throw httpError(500, 'The server is missing GITHUB_TOKEN or GITHUB_REPO.');
  return { token: GITHUB_TOKEN, repo: GITHUB_REPO, branch: GITHUB_BRANCH, dir: DATA_DIR.replace(/^\/+|\/+$/g, '') };
}

function github(c, file, init = {}) {
  const url = `https://api.github.com/repos/${c.repo}/contents/${c.dir}/${file}` +
    (init.method ? '' : `?ref=${encodeURIComponent(c.branch)}`);
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${c.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'borrow-a-book-shelf',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
}

export async function readJSON(c, file) {
  const res = await github(c, file);
  if (res.status === 404) return { data: null, sha: null };
  if (!res.ok) throw httpError(502, `Could not read ${file} from GitHub (${res.status}).`);
  const body = await res.json();
  return { data: JSON.parse(Buffer.from(body.content, 'base64').toString('utf8')), sha: body.sha };
}

/** Returns true when written, false when the file changed underneath us (caller retries). */
export async function writeJSON(c, file, data, sha, message) {
  const res = await github(c, file, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      branch: c.branch,
      content: Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64'),
      ...(sha ? { sha } : {}),
    }),
  });
  if (res.status === 409 || res.status === 422) return false;
  if (!res.ok) throw httpError(502, `Could not save to GitHub (${res.status}).`);
  return true;
}

export function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { throw httpError(400, 'Invalid request.'); }
}

/** Books from shelf.json (set by the keeper) plus books.json (listed by lenders in the app). */
export async function allBooks(c) {
  const [{ data: shelf }, { data: listed, sha }] = await Promise.all([readJSON(c, 'shelf.json'), readJSON(c, 'books.json')]);
  if (!shelf) throw httpError(500, 'shelf.json was not found in the repository.');
  const extra = listed?.books || [];
  return { shelf, listed: extra, listedSha: sha, books: [...shelf.books, ...extra] };
}

export function sendError(res, err) {
  return res.status(err.status || 500).json({ error: err.message || 'Something went wrong on the server.' });
}
