# CyMD

**English** · [Français](README.fr.md)

A simple, Notepad-style **Markdown** editor and reader with **live rendering** inspired by Discord:
images, videos, link previews, checkboxes, tables and syntax-highlighted code. Runs on Windows,
macOS and Linux (Electron), and in a browser with some limitations.

<a id="fonctionnalités"></a>

## Features

- **French and English**: choose in the toolbar or **View → Language**. The choice persists
  between launches and synchronizes across windows. French is selected for French system
  languages, English otherwise. Switching preserves documents and undo history.
- **Chrome-style tabs**: several documents per window. Drag tabs to reorder them, move them to
  another window, or detach them into a new window. Files opened from the file manager appear
  as tabs in the running window without starting another instance.
- **Toolbar** (files and formatting) and **floating selection toolbar**, inspired by Discord:
  bold, italic, underline (`<u>…</u>`), strikethrough, quote, code, spoiler (`||…||`) and link.
- Optional **line numbers** (`#` button or View menu).
- **Four views**: *Live* (default; syntax appears only on the element containing the cursor),
  *Side by side* (source and preview, synchronized scrolling), *Source* (text only) and *Reading*.
- **Copy and paste**: pasted images (such as screenshots) are added to the document; HTML from
  a webpage or Word is converted to Markdown; pasting a URL over a selection creates a link;
  `Ctrl+Shift+V` pastes plain text.
- **Drag and drop** images, videos and files; dropping a `.md`/`.cymd` opens it.
- Discord-style **link previews** below bare URLs (Open Graph, with playable YouTube previews).
  Angle-bracket URLs such as `<https://…>` do not produce a preview.
- Resizable images: `![caption|300](image.png)`.
- Find/replace, spell checking, light/dark themes and standalone HTML export.
- Fast even with large files: Live rendering is computed only around the visible area.

<a id="deux-formats"></a>

## Two formats

<a id="md--markdown-simple-mode-dossier"></a>

### `.md`: plain Markdown (folder mode)

A standard text file. Referenced images and videos are read **from the file's folder and its
subfolders** (`![photo](images/photo.jpg)`). Pasted media is written to an `assets/` subfolder
when saving. The file's encoding, BOM and line endings (CRLF/LF) are preserved.

<a id="cymd--document-tout-en-un"></a>

### `.cymd`: an all-in-one document

A **ZIP** archive (like `.docx`/`.epub`) containing everything. It can be opened with 7-Zip:

```
mimetype          application/x-cymd
manifest.json     { format, version, main, created, modified }
document.md       Markdown text
previews.json     link previews { url: { title, description, image, … } }
assets/…          images, videos, files
previews/…        preview thumbnails (available offline)
```

Media no longer used in the text is omitted when saving.
*File → Save as* switches between formats: folder files are packed into a `.cymd`,
or extracted next to the `.md` file.

<a id="raccourcis"></a>

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| Ctrl+T (or Ctrl+N) / Ctrl+Shift+N | New tab / new window |
| Ctrl+W / Ctrl+Shift+W | Close tab / window |
| Ctrl+Tab / Ctrl+Shift+Tab | Next / previous tab |
| Ctrl+O, Ctrl+S, Ctrl+Shift+S | Open (multiple files supported), save, save as |
| Ctrl+1 … Ctrl+4 | Live, Side by side, Source, Reading |
| Ctrl+B / I / U / E / K | Bold, italic, underline, code, link |
| Ctrl+Shift+X | Strikethrough |
| Ctrl+Shift+1 / 2 / 3 | Heading 1 / 2 / 3 |
| Ctrl+Shift+8 / 7 / 9 / . | Bulleted / numbered / checkbox list / quote |
| Tab / Shift+Tab | Indent / outdent (lists) |
| Ctrl+F | Find / replace |
| Ctrl+click | Open a link |

<a id="mises-à-jour"></a>

## Updates

The installed Windows version checks for a new stable GitHub release 15 seconds after startup.
**Help → Check for updates…** also starts a manual check. Downloading and restarting require
confirmation. Installation is blocked while any window contains unsaved documents. “Later”
keeps the download; the same command resumes installation. Closing CyMD normally does not
install the update.

The portable version, other operating systems and development mode offer to open
[GitHub releases](https://github.com/MrMybal/CyMD/releases) for manual installation.

<a id="formats-distribués"></a>

### Distribution formats

| System | No installation | Installation | Architecture |
| --- | --- | --- | --- |
| Windows | Portable `.exe` | NSIS `.exe` installer | x64 |
| macOS | `.zip` archive containing the `.app` | `.dmg` image, copy to Applications | Universal: Intel and Apple Silicon |
| Linux | `.AppImage` | `.deb` package for Debian/Ubuntu | x64 |

On Linux, make the AppImage executable before running it (`chmod +x CyMD-*.AppImage`).
Depending on the distribution, FUSE support may be required. Install the `.deb` through
the package manager. On macOS, Developer ID signing and notarization must be configured
before distributing a Gatekeeper-approved build; the project includes no Apple certificate.

Packages are built on their target system. Cross-platform configuration does not replace
real testing on Windows, macOS and Linux. Editing shortcuts also use Cmd on macOS.
Automatic updates remain limited to installed Windows builds; elsewhere the menu opens releases.

<a id="préparer-une-release"></a>

### Prepare a release

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

<a id="plugin-intégré"></a>

## Embedded plugin

CyMD can be displayed and edited in an iframe inside another application.
`npm run build:plugin` generates the bundle in `release/plugin`, including the license and sources.
The [integration protocol](docs/integration.md) provides opening, modification status
and host-confirmed saving.

For local CyAIOrchestrator sources, run
`node integration/cyai/install.mjs PATH_TO_CYAIORCHESTRATOR` after building the plugin.
Then restart CyAI from those sources, or rebuild its distributed application.
The plugin adds a CyMD button and opens `.cymd` attachments in the editor.
Each save adds a new attachment; the original document is retained.

<a id="licence"></a>

## License

Copyright © 2026 Cyberalien.

CyMD is distributed under the **GNU Affero General Public License v3.0 only**
(`AGPL-3.0-only`). The full text is available in [LICENSE](LICENSE).
Third-party dependencies retain their respective licenses.

<a id="développement"></a>

## Development

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

<a id="organisation"></a>

### Layout

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

<a id="sécurité"></a>

### Security

Isolated renderer (`sandbox`, `contextIsolation`), HTML sanitized with DOMPurify, no navigation
inside the window (links open in the browser), `cymd://` restricted to the folders of open documents,
local file links never executed (shown in the file manager), and link previews fetched through
a separate network session without cookies.

<a id="version-navigateur"></a>

### Browser version

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
