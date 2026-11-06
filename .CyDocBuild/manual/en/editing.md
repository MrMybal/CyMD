---
id: editing
title: Write and format
description: Choose a view, format text and select rendered content.
section: Guide / Writing
order: 10
revision: 3
---

## Live: write without markers {#live}
**Ctrl+1** selects Live. Headings, bold, images, tasks and tables are rendered directly. Markdown markers remain hidden, including while selecting text. Drag to select text; the floating toolbar applies bold, italic, underline, strikethrough, quotes, code, spoilers and links.
Tables are rendered blocks: select their displayed contents to copy them. Switch to Source or Side by side to edit cell structure or raw markers.
```image
{"id":"live-editor","src":"assets/cymd-live-en.jpg","alt":"Live view with formatted notes and task checkboxes","controls":"minimal"}
```
## Side by side {#split}
**Ctrl+2** displays the Markdown source and preview together. Scrolling is synchronized. This is useful for repairing a link or checking a table while editing its syntax.
```image
{"id":"split-editor","src":"assets/cymd-split-en.jpg","alt":"Markdown source on the left and its preview on the right","controls":"minimal"}
```
## Source {#raw}
**Ctrl+3** shows plain Markdown. Edit markers, table rows and code fences here. Changing views does not convert or discard your document.
## Reading {#read}
**Ctrl+4** displays the document without text editing. Double-click the document to return to editing. Use this view to review a document before sharing.
```image
{"id":"reading-editor","src":"assets/cymd-read-en.jpg","alt":"Reading view with tasks, quote, table and highlighted code","controls":"minimal"}
```
## Common formatting {#formatting}
Select text before clicking a toolbar button. **Ctrl+B**, **Ctrl+I**, **Ctrl+U**, **Ctrl+E** and **Ctrl+K** apply bold, italic, underline, inline code and links. Use the heading menu to choose a level. **#** toggles line numbers.
A list continues with Enter; Tab and Shift+Tab indent and outdent it. Click a task checkbox to change its state. Spoilers use `||text||`; the hidden text is revealed by hover or click.
Use **Ctrl+F** for find/replace. **Ctrl+Z** undoes an edit.
## Tabs and windows {#tabs}
**Ctrl+T** creates a tab, **Ctrl+W** closes it, **Ctrl+Tab** switches tabs. Drag a tab to reorder it. Desktop tabs can move to another CyMD window or detach into a new window. These window operations are limited in the browser.
Closing an edited document prompts you to save, discard or cancel. A file opened from the desktop file manager joins the running application.
## Language and theme {#preferences}
Choose French or English in the toolbar; the desktop also offers **View → Language**. The preference is remembered and desktop windows synchronize it. Existing documents are not translated and undo history is preserved.
The desktop View menu offers light, dark and system themes, zoom and reading width. The manual has its own theme selector and follows system light/dark by default.

On desktop, right-click a misspelled word to see spelling suggestions or add it to the dictionary. Availability depends on the system dictionary.
