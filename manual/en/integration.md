---
id: integration
title: Embed CyMD in another application
description: Version 1 of the embedded editor protocol.
section: Developer reference
order: 100
revision: 1
---

## Build and install {#build}
`npm run build:plugin` produces `release/plugin` and `release/CyMD-plugin.zip`: the web editor, plugin manifest, AGPL v3 license, sources and the complete local help reader. Serve this directory over HTTP(S), for example under `/cymd/`. No Electron server is required. Adding the manifest to an MCP catalog alone does not implement the host protocol.

For local CyAIOrchestrator sources, run `node integration/cyai/install.mjs PATH_TO_CYAIORCHESTRATOR` after building the plugin. Restart from those sources or rebuild the distributed host application.

## Open an editor {#open}
Load an iframe with `index.html?integration=1&parentOrigin=ORIGIN&session=ID`. ORIGIN is the host's exact HTTP(S) origin; ID is a fresh random identifier for this editor session.

Every message contains `protocol: "cymd.integration"`, `version: 1`, `session`, `source` (`"host"` or `"cymd"`) and `type`. Send messages to the exact destination origin. Verify event.origin, event.source, version and session on receipt. Never pass arbitrary filesystem paths.

1. CyMD sends **ready** after initialization.
2. The host sends **open** with **name**, **file** (Blob or File) and optionally **locale: "fr" | "en"**. Only one initial open is accepted per iframe. Supported extensions: .cymd, .md, .markdown. Maximum size: 50 MiB. For a new document, send an empty Markdown Blob and a name ending in .md.
3. CyMD sends **state** with **title** and **dirty**. The host must confirm discarding changes before closing a modified document, and prevent closing while a save is pending.

## Confirm each save {#save}
CyMD sends **save** with **requestId**, **name** and **file**. Store the file, then reply with **save-result**, the same requestId and **ok: true**. On failure, reply with **ok: false, error: "message"**. Without acknowledgement within 60 seconds, saving fails and the document remains modified.

The host may send **command** with **command: "save"** or **"save-as"**. CyMD may send **close-request** or **error** with a message.

```diagram
{"type":"flow","title":"Save acknowledgement","nodes":[{"id":"editor","label":"CyMD: save + requestId","x":0,"y":20},{"id":"host","label":"Host stores the Blob","x":290,"y":20},{"id":"ack","label":"save-result: ok","x":580,"y":20}],"edges":[{"from":"editor","to":"host"},{"from":"host","to":"ack"}]}
```

## Minimal host example {#example}
Register the handler before assigning the iframe URL. This excerpt shows the handshake, not a complete host: implement saving, errors and dirty-close confirmation before deployment.

```javascript
const session = crypto.randomUUID();
const editorOrigin = window.location.origin;
window.addEventListener("message", event => {
  const message = event.data;
  if (event.origin !== editorOrigin ||
      event.source !== iframe.contentWindow ||
      message?.protocol !== "cymd.integration" ||
      message.version !== 1 || message.session !== session ||
      message.source !== "cymd") return;
  if (message.type === "ready") iframe.contentWindow.postMessage({
    protocol: "cymd.integration", version: 1, session, source: "host",
    type: "open", name: "Notes.md", locale: "en",
    file: new Blob(["# Notes\n"], { type: "text/markdown" })
  }, editorOrigin);
});
iframe.src = "/cymd/index.html?integration=1&parentOrigin=" +
  encodeURIComponent(location.origin) + "&session=" + encodeURIComponent(session);
```

The working host adapter is `integration/cyai/cymd-editor.js`.

## Resources and limitations {#limits}
HTML exports and files opened directly from the browser remain downloads or local saves. Assets embedded in .cymd are preserved. Embedded mode cannot access the host filesystem; relative images in plain Markdown and network previews depend on available resources and the host server policy.
In CyAIOrchestrator, saving adds a new attachment to the conversation and selects it for the next message. The original attachment is kept; subsequent saves also create new attachments.

The help button opens the bundled reader in a dialog. Keep the entire help tree and CyMD-help.zip when deploying a plugin. The ZIP can be extracted for direct file:// reading.
