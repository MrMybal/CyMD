# CyMD showcase

The static showcase is generated at output/pages/index.html. The unchanged web editor remains at editor.html; the complete CyDoc export stays at Documentation/Documentation.html. Desktop and plugin builds do not include the showcase.

## Build and preview

- npm run build:pages: regenerate the offline manual, build the editor, build the showcase and check both distributions.
- npm run pages:check: check the generated output, locale structure, local assets, documentation routes and content hashes.
- npm run preview:pages: serve output/pages on http://127.0.0.1:4173 (PORT overrides the port).

Use ?lang=en or ?lang=fr. English is the default. Language selection is encoded in the URL; no account, analytics or external font service is used. Download links target the documented release, so update both locale copy and filenames when releasing a new app version.

## Content and media

content.mjs contains the English and French copy. view.mjs generates the same page for static HTML and language/view changes. site.mjs handles view tabs, language selection and the keyboard-accessible image dialog. style.css supplies desktop and mobile layouts.

The six dark app captures are reused directly from .CyDocBuild/assets. The additional source, search, selection, light-theme and manual images in assets are actual browser/app screenshots using fictional example notes. Capture both languages when replacing them. Keep complete application images uncropped; details can be enlarged by the reader.

Styles, scripts and images receive content-hashed filenames at build time. Their module dependencies are rewritten to the matching hashed filenames. Only output/pages is uploaded by the existing GitHub Pages workflow, and local builds never publish.

source.zip is created from committed HEAD. Regenerate after committing before sharing a distribution, so the source offer matches the generated editor and website.
