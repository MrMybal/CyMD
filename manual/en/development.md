---
id: development
title: Build and maintain CyMD
description: Build and maintain CyMD
section: Developer reference
order: 110
revision: 1
---

## Build from source {#build}


```bash
npm ci
npm run dev        # Electron + Vite with hot reload
npm run dev:web    # browser-only version (http://localhost:5173)
npm run build      # TypeScript checks + production build (dist/)
npm start          # build, then launch Electron using dist/
npm run dist       # installer (NSIS + portable on Windows) in release/
npm run dist:win   # Windows: portable + NSIS; run on Windows
npm run dist:mac   # macOS: universal DMG + ZIP; run on macOS
npm run dist:linux # Linux: x64 AppImage + DEB; run on Linux
npm run dist:dir   # unpackaged application in release/ for testing
```

If Electron does not start after `npm install` because its binary is missing, run
`node node_modules/electron/install.js`.

Icons: the source logo is `assets/branding/cymd-logo-yellow.png`. After changing it, regenerate
all icons (executable, installer, window, interface and favicon) with
`powershell -ExecutionPolicy Bypass -File scripts/make-icons.ps1` (option: `-Source another-logo.png`).

Automated smoke test (opens a file, executes a script in the window, saves a screenshot):
`SMOKE_SCRIPT=steps.js SMOKE_OUT=output electron scripts/smoke.cjs file.md`.

## Layout {#layout}

English translations are centralized in `locales/en.json`; keys are the French text.
The `src/i18n.ts` and `electron/i18n.cjs` engines share this catalog.
Built-in guides are available in French and English. User files are not translated.

```
electron/main.cjs        windows, menus, files, cymd:// protocol, link previews (network)
assets/branding/         source logo for regenerating icons
electron/preload.cjs     secure renderer bridge
src/app.ts               controller: documents, modes, saving, media
src/editor/              CodeMirror 6: Live mode, widgets, commands, copy/paste
src/preview/             Markdown rendering (markdown-it + DOMPurify) and hydration
src/ui/                  tabs, toolbar, menus, icons (Lucide)
src/embeds/              link previews and Discord-style cards
src/doc/                 document model, .cymd format, paths, media types
src/platform/            Electron / browser
build/icon.ico, icon.png executable and installer icons (generated)
electron/icon.png        window / About icon (generated)
public/logo.png          interface logo and favicon (generated)
```

## Security {#security}

Isolated renderer (`sandbox`, `contextIsolation`), HTML sanitized with DOMPurify, no navigation
inside the window (links open in the browser), `cymd://` restricted to the folders of open documents,
local file links never executed (shown in the file manager), and link previews fetched through
a separate network session without cookies.

## Browser version {#browser}

**[Open CyMD online](https://MrMybal.github.io/CyMD/)** — no installation required.

Documents open and save on your device; they are not stored on GitHub.
Save changes before closing the tab. The deployed license and sources are accessible
at the bottom of the editor.

The **Web editor** workflow automatically publishes new stable releases to GitHub Pages
and can also run manually. The repository's Pages source must be **GitHub Actions**.
`npm run build:pages` prepares the site in `dist/`, with relative paths compatible with `/CyMD/`.

The browser version opens and saves files directly in Chrome/Edge and through downloads elsewhere,
but cannot read images from a `.md` file's folder or retrieve link previews (CORS).
The `.cymd` format is fully supported.

## Prepare a release {#release}


1. Bump the version with `npm version patch --no-git-tag-version`, then commit the changes.
2. Create the matching tag (`vX.Y.Z`) and push it to GitHub.
3. The workflow builds and tests on Windows, macOS and Linux. After all three builds succeed,
   it creates a **draft release** containing all packages and update metadata.
4. Test the applications on each system, then publish the draft as a stable release.

Running the workflow manually only builds packages and keeps them as GitHub Actions artifacts;
it does not create a release. Local commands push neither code nor tags.

For a local build: `npm run dist:win`. Distribute the generated `release/` files together:
`latest.yml` must exactly match the supplied installer. Local build commands publish nothing.
The application does not require a GitHub token.

An older version without this update system requires an initial manual installation. A full
update is evaluated between two distinct installed versions and compatible published releases.


## Documentation build {#documentation}

`npm run docs:build` · `npm run docs:check` · `npm run test:help`

CyDoc 0.1.0 is installed from the pinned archive in vendor/. Only the image module is enabled. Diagrams compile to SVG. Sources under src/doc are indexed lexically; no TypeScript semantic API or TypeDoc schema is inferred. See [the archive implementation](doc:source-src-doc-cymd-ts).
