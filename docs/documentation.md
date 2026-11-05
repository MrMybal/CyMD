# Maintaining CyMD's local manual

The application uses CyDoc 0.1.0 from `vendor/cydoc-0.1.0.tgz`.
See [dependency provenance](../vendor/README.md). Node.js 22+ is required for
generation; the reader requires neither Node.js nor a server.

## Regenerate

```sh
npm ci
npm run docs:build
npm run docs:check
npm run build
npm run test:help
npm run dist:dir
node scripts/verify-package.mjs
```

`docs:build` and `docs:check` regenerate the export. The build removes only
the resolved generated `public/help` directory before calling CyDoc's CLI.
Do not edit generated data or reader bundles. `build`, `build:pages`,
`build:plugin` and every desktop distribution include the complete export.
Development commands also generate help. When editing manual sources during a
development session, rerun `docs:build` and reload the documentation.

`public/help`, `public/help-links.cjs` and `public/CyMD-help.zip` are ignored
generated outputs. Vite copies them to `dist`. Electron opens
`dist/help/index.html` with `pathToFileURL` and CyDoc's `createLink`.
The help window has no application preload or Node access, uses a separate
persistent session and refuses network resource requests.

For an isolated unpacked build, electron-builder's output directory may be
overridden; pass that directory to `scripts/verify-package.mjs`.
To test the packaged sources, set `CYMD_TEST_APP` to the resulting
`resources/app.asar` and run `npm run test:help`.
Test profiles and screenshots go to ignored `output/help-smoke`.

## Author pages and translations

- English sources: `manual/en`; French: `manual/fr`.
- Shared screenshots and favicon: `docs/images`.
- Static schemas use CyDoc JSON `diagram` fences, compiled to accessible SVG.
- Preserve page IDs and explicit `{#anchor}` IDs between languages.
- Increase English `revision` when meaning changes. Update French
  `sourceRevision` only after updating the translation.
- The generator rejects missing, outdated or untracked translations,
  broken links and missing assets. It also checks all application help targets
  and heading parity across languages.
- Runtime fallback is English; the application's selected language is supplied
  in the route. The reader's language switch preserves page identity.
- Add stable context destinations in `src/help/targets.json`.
  The route helper is shared by the browser and bundled for Electron.
- Captures currently show the previous toolbar, before the help button was
  added; their captions make this explicit. They contain only sample data.

The only enabled optional module is **image** for local screenshots, zoom and
in-window enlargement. There is no need for video, GIF playback controls, mesh,
gallery or interactive node graphs. No Three.js dependency is installed in
CyMD. CyDoc's original exporter supplies the classic-script module loading
and local resource paths. CyMD adds only its branding stylesheet, CSP,
licenses, editable examples and an offline ZIP; generated data and library
bundles are unchanged.

Source indexing is deliberately limited to the four distributable TypeScript
files in `src/doc`. CyDoc provides a lexical file/import index, not semantic
TypeScript API extraction. No live parser, TypeDoc inference or private
working-directory scan is used.

## Migrated content and compatible entry points

| Previous content / action | Destination |
| --- | --- |
| First-launch editable guide | Local manual overview; editable example still available from Help |
| `src/guide.md`, `src/guide.en.md` | `manual/examples/welcome.fr.md`, `welcome.en.md`; indexed example pages in both languages |
| `open-guide`, guide filenames | Stable overview aliases |
| Help menu | Documentation, contextual guides and editable sample |
| Toolbar / F1 / Shift+F1 | Overview / current view section |
| README user reference | Editing, documents, media, shortcuts, installation, troubleshooting |
| README build, release and security reference | Development page in both languages |
| `docs/integration.md` | Bilingual integration reference; old path remains a pointer |
| README screenshots | Local image blocks in the manual |

The old guides' descriptions of Live selection have been retained in their
corrected form: markers stay hidden. Source/Side by side are used for syntax
and table structure. No Android support, cloud storage or universal automatic
updates are promised.

## Browser and plugin

Browsers cannot open arbitrary local files from a hosted page. The browser
and plugin open the same bundled reader in an accessible dialog under the
host's URL. The download link provides the complete offline ZIP; extract it
and open `index.html` with `file://`. The desktop uses `file://` directly.
No remote font, media or CDN is required by either reader.

## Verification scope

`docs:check` checks translations, targets, aliases, language fallback, local
resources, selected modules, distributable source scope and offline ZIP contents.
`test:help` launches actual Electron with an isolated profile, exercises the
native and browser help entry points, languages, search, local images,
diagrams, zoom, Escape and media routes while documentation networking is
disabled. Screenshots support visual inspection.
`verify-package.mjs` compares the packaged help and route helper with the build.

Run the Electron smoke and package checks on Windows, macOS and Linux runners
as available. A Windows run does not prove macOS/Linux installation behavior,
physical touch interaction or every browser's storage/file-origin policies.

## GitHub Pages

The complete export is published at [English](https://mrmybal.github.io/CyMD/help/#/en/overview)
and [French](https://mrmybal.github.io/CyMD/help/#/fr/overview). Hash routes work
under the repository subdirectory without server-side rewriting.

The Pages workflow regenerates and validates the manual on relevant pushes to
main, published stable releases and manual dispatch. It deploys only
output/pages: the existing web editor, its assets and AGPL corresponding-source
offer, the entire help export and its offline ZIP. The Electron route helper,
local build files and dependency directories are not deployed as site files.
The minimal vendored build dependency makes generation independent of private
repository credentials. The desktop continues to open its bundled file:// reader.

Commands: npm run build:pages, then npm run pages:check. After deployment,
run npm run pages:check -- https://mrmybal.github.io/CyMD/ to compare every
public help resource with the local build.

The source archive is generated from HEAD; commit the intended sources before
creating a deployment build. CI builds the checked-out commit automatically.
The verifier checks the publication allowlist, both README language routes,
all local document links and resources, and byte-for-byte inclusion of the
complete CyDoc export and offline ZIP.

Manual inputs use LF line endings through .gitattributes so CyDoc revision hashes
and imported examples stay consistent across Windows and Linux. The HTTP check
normalizes text line endings and verifies the published editor asset URLs.
