---
id: media
title: Images, videos and links
description: Add images and videos, paste content and manage link previews.
section: User guide
parent: editing
order: 30
revision: 3
---

## Insert an image {#images}
Paste an image, drop a file into the editor, or use the media button. It becomes a document resource. To resize an image, edit its Markdown in Source:
```markdown
![A useful description|300](assets/image.png)
```
The width is in pixels. Use meaningful alternative text. If you share a .md, include the image folder; .cymd carries the resources with it.
[Zoom the interface screenshot](doc:overview?media=interface&zoom=1.5).
## Paste formatted content {#paste}
HTML copied from a webpage or Word is converted to Markdown. **Ctrl+Shift+V** pastes plain text. Pasting a URL over selected text makes it a link.
## Videos and other files {#video}
Drop a video or use the media button. Playback depends on the platform and codec; changing a file extension does not convert its encoding. Local file links are shown in the file manager rather than executed by CyMD.
## Link previews {#previews}
A bare URL on its own line can produce a link preview in the desktop app. This requires a network request. Supported YouTube previews can be played in the preview. Surround a URL with angle brackets to suppress the card:
```markdown
<https://example.com>
```
Cached cards and thumbnails can be stored in .cymd and read offline. Online video and uncached pages still need Internet. Browser restrictions (CORS) can prevent new previews.
The help manual itself does not load any remote image, font, video or CDN.
