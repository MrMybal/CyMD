---
id: documents
title: Files, saving and sharing
description: Files, saving and sharing
section: User guide
order: 20
revision: 1
---

## Choose your format {#formats}
| Format | Good for | What to share |
| --- | --- | --- |
| .md | Plain text, Git, other Markdown tools | The .md file and its assets folder |
| .cymd | Illustrated notes, a single portable file | The .cymd file |
Use **File → Save as** (**Ctrl+Shift+S**) to switch formats. Plain Markdown preserves its encoding, BOM and LF/CRLF line endings.
```diagram
{"type":"flow","title":"How a .cymd document is saved","nodes":[{"id":"n0","label":"Markdown text","x":0,"y":20,"width":210},{"id":"n1","label":"Images and previews","x":270,"y":20,"width":210},{"id":"n2","label":".cymd ZIP archive","x":540,"y":20,"width":210}],"edges":[{"from":"n0","to":"n1"},{"from":"n1","to":"n2"}]}
```
The diagram shows the contents brought together, not separate manual export steps.
## Save safely {#saving}
**Ctrl+S** saves the current document. For a new file, choose a location and a name. A modified marker means changes are not yet saved. Keep backups of important documents: CyMD is not a cloud backup service.
On desktop, media pasted into a .md document are written in an **assets/** subfolder. Keep that folder next to the document. When saving as .cymd, the referenced local resources are gathered into the archive. Saving a .cymd as .md extracts its resources next to it. Unused media are omitted from a saved .cymd.
## Open and share {#opening}
Use **Ctrl+O**, drag a .md/.cymd file into the editor, or open it from the desktop file manager. On desktop, images in a .md document must be in its folder or a subfolder. Paths pointing outside that folder are refused.
A .cymd is a ZIP archive. An archive utility can recover **document.md**, **assets/** and cached previews. Do not rename a plain .md to .cymd; use Save as.
## Export HTML {#html}
The desktop **File → Export HTML** command produces a standalone rendered page. This is useful for sharing a readable copy; it does not replace the editable original. Video playback still depends on the recipient's browser and codecs.
## Browser and embedded app {#browser}
Chrome/Edge can offer direct file opening and saving. Other browsers use file selection and downloads. Save before closing the tab. Documents are not stored on GitHub Pages.
In an embedded CyMD editor, saving is confirmed by the host application. In CyAIOrchestrator it creates a new attachment; the original remains intact. See [the integration protocol](doc:integration).
