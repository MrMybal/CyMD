# CyMD 0.1.2

Éditeur Markdown avec aperçu en direct, documents `.cymd` regroupant texte et médias, et interface français/anglais.

## Téléchargements

| Système | Sans installation | Installation |
| --- | --- | --- |
| Windows x64 | `CyMD-Portable-0.1.2-x64.exe` | `CyMD-Setup-0.1.2-x64.exe` |
| macOS Intel et Apple Silicon | Archive ZIP Universal | DMG Universal : glisser CyMD vers Applications |
| Linux x64 | AppImage | DEB pour Debian/Ubuntu |

Pour Linux, rendre l'AppImage exécutable avant de la lancer. FUSE peut être nécessaire selon la distribution.
Les applications ne disposent pas de signature de distribution Windows/Apple ni de notarisation Apple ; macOS peut bloquer leur ouverture avec Gatekeeper.

## Mises à jour

La version Windows installée recherche les nouvelles releases et propose leur téléchargement puis leur installation après confirmation. Les documents non enregistrés empêchent le redémarrage.
Sur les versions portables, macOS et Linux, **Aide → Rechercher des mises à jour** ouvre les téléchargements GitHub pour une mise à jour manuelle.

## Changements

- Paquets Windows, macOS Universal et Linux.
- Interface français/anglais, avec choix de langue mémorisé.
- Respect de la casse des chemins POSIX lors de l'ouverture des documents.
