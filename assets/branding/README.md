# CyMD icons

The round logo identifies the application. The folded-page icon identifies
`.cymd` documents, with the original round CyMD logo on a folded sheet and a transparent background.

Regenerate the document assets on Windows (no additional dependencies):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-document-icons.ps1
```

Source: `assets/branding/cymd-document.svg` (absolute paths and an embedded, unchanged copy of build/icon.png; no fonts).
Outputs: `build/cymd.png`, `build/cymd.ico` (16–256 px) and
`build/cymd.icns` (16–1024 px). Commit the outputs so packaging works on
every build host without needing the Windows generator.

The `cymd` file association in `package.json` selects these resources:
Windows NSIS installs the ICO and registers it as the document's DefaultIcon;
macOS copies the ICNS into the app bundle and references it in document types.
The application's round icon and ordinary Markdown associations are unchanged.

Linux electron-builder currently uses the generic `x-office-document` MIME
icon and ignores custom file-association icons. Portable Windows executables
do not register file associations. An existing installed copy needs the new
installer before Explorer uses the new document icon.

