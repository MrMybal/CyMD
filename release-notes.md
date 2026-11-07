# CyMD 0.1.6

## Changements

- Nouvelle icône pour les documents `.cymd` : le logo CyMD d'origine sur une feuille avec un coin replié, pour distinguer les fichiers de l'application.
- Icône intégrée aux associations de fichiers de l'installeur Windows et du paquet macOS. Sous Windows, elle est appliquée lors de l'installation ou de la mise à jour ; l'Explorateur peut mettre un moment à rafraîchir son cache.
- Vitrine bilingue avec captures du logiciel, liens vers les téléchargements et lecteur de documentation CyDoc.

Le logo de l'application reste inchangé. Sous Linux, les documents conservent l'icône générique du système ; la version Windows portable n'enregistre pas d'association de fichiers.

## Téléchargements

| Système | Sans installation | Installation |
| --- | --- | --- |
| Windows x64 | `CyMD-Portable-0.1.6-x64.exe` | `CyMD-Setup-0.1.6-x64.exe` |
| macOS Intel et Apple Silicon | Archive ZIP Universal | DMG Universal : glisser CyMD vers Applications |
| Linux x64 | AppImage | DEB pour Debian/Ubuntu |

Le plugin intégré est disponible dans `CyMD-plugin.zip`. Les interfaces et la documentation hors ligne sont disponibles en français et en anglais.

## Mises à jour

La version Windows installée recherche les nouvelles releases et propose leur téléchargement puis leur installation après confirmation. Les documents non enregistrés empêchent le redémarrage.
Sur les versions portables, macOS et Linux, **Aide → Rechercher des mises à jour** ouvre les téléchargements GitHub pour une mise à jour manuelle.

Les paquets Windows et macOS ne disposent pas de signature de distribution ; macOS n'est pas notarisé. L'AppImage Linux peut nécessiter FUSE.

[Vitrine](https://mrmybal.github.io/CyMD/?lang=fr) · [Documentation française](https://mrmybal.github.io/CyMD/Documentation/Documentation.html#/fr/overview) · [English documentation](https://mrmybal.github.io/CyMD/Documentation/Documentation.html#/en/overview)

## Limites connues et suivi

CyMD est en développement. Cette release ne publie pas de liste de bugs ticket par ticket ; consultez le [suivi des problèmes](https://github.com/MrMybal/CyMD/issues) pour les signalements et les [releases](https://github.com/MrMybal/CyMD/releases) pour les changements publiés.

Les limitations documentées sont distinctes des bugs confirmés : pas de version Android native ; mise à jour intégrée limitée à Windows installé ; icône générique sous Linux ; absence de signature Windows/Apple et de notarisation Apple. Dans le navigateur, les médias voisins d’un fichier Markdown local et les nouveaux aperçus de liens sont limités par les règles de sécurité. Les vidéos dépendent du navigateur et des codecs. L’aide installée reste disponible hors ligne.

## English

This release gives `.cymd` documents a distinct icon: the original CyMD logo on a folded sheet. Windows installers and macOS bundles use it for document associations. Windows applies it during installation or update; Explorer may need time to refresh its icon cache. The application logo is unchanged. Linux keeps its generic document icon, and Windows portable builds do not register file associations.

The bilingual showcase includes real app screenshots, downloads and the complete CyDoc reader. Packages include Windows x64 installer and portable builds, macOS Universal DMG and ZIP, Linux x64 AppImage and DEB, and the embedded plugin. Installed Windows builds support in-app updates; other editions use manual downloads. Windows/Apple distribution signing and Apple notarization are not provided.

## Known limitations and issue tracking

CyMD is in development. This release does not publish a ticket-by-ticket bug list; consult the [issue tracker](https://github.com/MrMybal/CyMD/issues) for reports and the [releases](https://github.com/MrMybal/CyMD/releases) for published changes.

Documented limitations are separate from confirmed bugs: no native Android build; in-app installation limited to installed Windows builds; generic document icons on Linux; no Windows/Apple distribution signing or Apple notarization. Browser security restricts neighboring media for local Markdown files and new link previews. Video playback depends on the browser and codecs. The installed manual remains available offline.

CyMD is distributed under GNU AGPL v3.0 only. Third-party dependencies retain their respective licenses.
