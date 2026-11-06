---
id: installation
title: Installation and updates
description: Choose a package and update the desktop application.
section: Reference
order: 50
revision: 3
---

## Choose a package {#packages}
| System | Portable option | Installer | Architecture |
| --- | --- | --- | --- |
| Windows | Portable .exe | NSIS .exe | x64 |
| macOS | .zip containing .app | .dmg; copy to Applications | Universal, Intel + Apple Silicon |
| Linux | .AppImage | .deb for Debian/Ubuntu | x64 |
Make an AppImage executable (`chmod +x CyMD-*.AppImage`). FUSE support may be required by the distribution. Install .deb with the system package manager.
Apple Developer ID/notarization and Windows signing are not configured in this project. Android is not currently supported.
## Updates {#updates}
Installed Windows checks for a stable GitHub release about 15 seconds after startup. **Help → Check for updates** also starts a check. Download and installation require confirmation. Unsaved documents prevent installation.
“Later” retains the download; use the same menu to resume. Closing CyMD normally does not install an update.
Portable Windows, macOS, Linux and development builds open the releases page for manual installation. An old version without the updater needs a manual installation first.
Updates need Internet; the installed manual does not. Replacing the application also replaces its bundled manual.
## Browser and plugin {#web}
The browser edition requires no installation. In its documentation dialog, **Download the offline manual** saves a ZIP: extract the whole directory, then open **Documentation.html** using a file URL. The same export is included in the plugin.
Browser security prevents a hosted webpage from opening arbitrary local file URLs. Its embedded help uses the same bundled reader under the host URL; the extracted manual and desktop app open it directly with file://.
