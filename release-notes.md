# CyMD 0.1.4

Éditeur Markdown avec aperçu en direct, documents `.cymd` regroupant texte et médias, et interface français/anglais.

## Téléchargements

| Système | Sans installation | Installation |
| --- | --- | --- |
| Windows x64 | `CyMD-Portable-0.1.4-x64.exe` | `CyMD-Setup-0.1.4-x64.exe` |
| macOS Intel et Apple Silicon | Archive ZIP Universal | DMG Universal : glisser CyMD vers Applications |
| Linux x64 | AppImage | DEB pour Debian/Ubuntu |

Pour Linux, rendre l'AppImage exécutable avant de la lancer. FUSE peut être nécessaire selon la distribution.
Les applications ne disposent pas de signature de distribution Windows/Apple ni de notarisation Apple ; macOS peut bloquer leur ouverture avec Gatekeeper.

## Mises à jour

La version Windows installée recherche les nouvelles releases et propose leur téléchargement puis leur installation après confirmation. Les documents non enregistrés empêchent le redémarrage.
Sur les versions portables, macOS et Linux, **Aide → Rechercher des mises à jour** ouvre les téléchargements GitHub pour une mise à jour manuelle.

## Changements

- En mode Live, la syntaxe reste masquée au clic et pendant la sélection : le texte ne se déplace plus pour révéler les balises.
- Les tableaux restent rendus et leur texte peut être sélectionné. Utilisez Brut ou Côte à côte pour modifier leur structure Markdown.
- Nouveau mode intégré pour ouvrir, éditer et enregistrer des documents CyMD dans une application hôte.
- Archive `CyMD-plugin.zip` avec manifeste, licence et sources correspondantes. L’hôte doit prendre en charge le protocole d’intégration ; la documentation et l’adaptateur pour CyAIOrchestrator sont fournis dans les sources.

CyMD reste distribué sous GNU AGPL v3.0 uniquement. Les dépendances tierces conservent leurs licences respectives. Interfaces français et anglais incluses.
