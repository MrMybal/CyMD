---
id: troubleshooting
title: Troubleshooting
description: Troubleshooting
section: Reference
order: 60
revision: 1
---

## I cannot see Markdown markers {#markers}
This is intentional in Live. Switch to [Source or Side by side](doc:editing#raw) to edit them. Use these views for table structure too.
## An image is missing {#images}
Check the relative path and keep the image under the .md document's folder. When sharing, send that folder or save as .cymd. A browser cannot freely read neighboring files.
## Browser limits {#browser}
Direct saving depends on browser file-picker support and permissions. A download is a saved copy; check its location. New link previews may be blocked by CORS. CyMD provides no server-side storage or account sync.
## A save is not confirmed {#saving}
Do not close the document. Check the destination and any dialog. In an embedded app, a host error or timeout leaves the document modified; retry after checking the host. An update also waits for unsaved documents.
## The documentation is missing {#help}
Reinstall the complete desktop package. For an extracted manual, keep index.html, data.js, viewer.js, CSS, media-image.js, assets and license files together. Do not open index.html from inside a ZIP preview.
Developers should run `npm run build` before starting Electron, or use `npm run dev`. Regenerate help with `npm run docs:build`.
## Video does not play {#video}
Check that the video file exists and that the target browser supports its codec. A preview for an online video still needs Internet. CyMD does not transcode videos.
