# Boa me

**Boa me** ("help me" in Twi) is a phone-help guide for older smartphone users who read English slowly and prefer Twi. When they get stuck on a screen, they pick the task by picture, and each step shows a Twi instruction, a drawing of the phone with a yellow **"Mia ha"** (press here) ring on the exact button, and a family member's recorded Twi voice. If they are still stuck, one button sends a help message to family on WhatsApp.

Built for *The Low Point* (Principle Day 8: Empathize, E360 model), Task 2: The Grandparent and the Smartphone, Approach A: Build.

## Why it exists

Research with an older Twi-speaking smartphone user showed that the low point is not a lack of skill. It is being **stuck on a screen they don't understand, with nobody around, so the task is dropped and forgotten.** The guides come directly from that research: a video call they couldn't start, an unknown WhatsApp group they couldn't leave, system pop-ups they couldn't read, and wanting to post on TikTok.

## Features

- Four guides: **Frɛ video** (video call), **Fi group mu** (leave and delete a group), **Fa video to TikTok so** (post a TikTok video), **Nkrasɛm a mente ase** (a phone message they don't understand)
- Twi instruction first, on a bright yellow card, with English underneath for helpers
- Tap the yellow "Mia ha" ring in the drawing to go to the next step, practising the real tap
- Family record each step in Twi (or upload a recording); it plays by itself when the step opens
- **Mehia mmoa** (I need help) opens WhatsApp with a Twi help message ready to send
- Large text and 72px buttons; works offline after the first visit; installs to the home screen

## Tools required

| Tool | Why | Needed? |
| --- | --- | --- |
| [Git](https://git-scm.com/downloads) | Push the project to GitHub | Yes |
| A modern browser (Chrome on Android recommended) | Run and test the app | Yes |
| A code editor, e.g. [VS Code](https://code.visualstudio.com/) | Edit the files | Recommended |
| [Node.js](https://nodejs.org/) 18 or newer | `npm start` (local server) and `npm run check` (syntax check) | Optional |
| Python 3 | Alternative local server | Optional |

There is **no build step and no dependencies to install**. It is plain HTML, CSS and JavaScript (ES modules).

## Run it locally

ES modules don't load from `file://`, so open it through a local server, using any **one** of these:

```bash
npm start                      # Node.js: http://localhost:5173
python3 -m http.server 5173    # Python: http://localhost:5173
```

Or, in VS Code, right-click `index.html` and choose **Open with Live Server** (Live Server extension).

To try it on a phone, open the local server address from the phone on the same Wi-Fi, or deploy it (below).

## Deploy with GitHub Pages

1. Push the project to GitHub (see below).
2. On GitHub, open the repository, then **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose `main` and `/ (root)`, and save.
4. After a minute, the site is live at `https://<username>.github.io/<repository>/`. If this project sits in a folder inside the repository, add the folder name: `https://<username>.github.io/<repository>/boa-me/`.
5. Open that link on the phone in Chrome, tap the menu, and choose **Add to Home screen**.

All paths are relative, so it works from a subfolder.

## Push to GitHub

As its own repository:

```bash
cd boa-me
git init
git add .
git commit -m "Add Boa me: Twi phone-help guide"
git branch -M main
git remote add origin https://github.com/<username>/boa-me.git
git push -u origin main
```

Inside an existing projects repository (as a folder):

```bash
cd <your-projects-repo>
# copy the boa-me folder in here first
git add boa-me
git commit -m "Add Boa me: Twi phone-help guide"
git push
```

## Project structure

```
boa-me/
├── index.html              Page shell, loads CSS and js/app.js
├── manifest.webmanifest    Home-screen install (name, icon, colours)
├── sw.js                   Service worker: works offline after the first visit
├── package.json            npm start / npm run check (no dependencies)
├── css/
│   ├── tokens.css          Colours and theme (light and dark)
│   └── app.css             Layout and components
├── js/
│   ├── app.js              Entry point: state, rendering, events
│   ├── views.js            Screens as HTML: home, guide step, done, family setup
│   ├── guides.js           Guide content (Twi and English steps)
│   ├── phone-screens.js    Phone drawings and the "Mia ha" ring
│   ├── audio.js            Play, record and upload voice
│   ├── storage.js          Save voice recordings on the phone
│   └── config.js           WhatsApp help message and limits
├── icons/                  App icons (SVG and PNG)
└── docs/DESIGN.md          Design system reference
```

## Add a new guide

1. In `js/phone-screens.js`, add a drawing for each step to `SCREENS`. Use `hl(x, y, width, height)` to put the "Mia ha" ring on the button to press.
2. In `js/guides.js`, add an entry to `GUIDES` with a colour `c`, Twi title `tw`, English title `en`, an `icon`, and `steps` (`s` is the screen id, `tw` and `en` are the instructions; `ask: true` shows the "Bisa abusua" button on that step).
3. Have a Twi speaker check the wording, then record the voice for each step from **For family: record Twi voice**.
4. If you add new files, list them in `SHELL` in `sw.js` and bump `CACHE` (for example `boa-me-v2`) so phones get the update.

## Privacy

Voice recordings are stored only in the phone's browser storage. Nothing is uploaded anywhere. The WhatsApp button only opens WhatsApp with a message; the user chooses who to send it to.

## Credits

- Visual style adapted from the Starbucks DESIGN.md from [getdesign.md](https://getdesign.md) ([awesome-design-md](https://github.com/VoltAgent/awesome-design-md)), with larger text and buttons and a brighter "press here" ring for older users. Not affiliated with Starbucks.
- Font: [Nunito Sans](https://fonts.google.com/specimen/Nunito+Sans) (Google Fonts).
- The phone drawings are simplified illustrations, not official app artwork.

## License

MIT © Joseph Boafo Afful
