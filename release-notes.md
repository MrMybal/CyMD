# CyMD 0.1.5

Éditeur Markdown avec aperçu en direct, documents `.cymd` regroupant texte et médias, et interface français/anglais.

## Téléchargements

| Système | Sans installation | Installation |
| --- | --- | --- |
| Windows x64 | `CyMD-Portable-0.1.5-x64.exe` | `CyMD-Setup-0.1.5-x64.exe` |
| macOS Intel et Apple Silicon | Archive ZIP Universal | DMG Universal : glisser CyMD vers Applications |
| Linux x64 | AppImage | DEB pour Debian/Ubuntu |

Pour Linux, rendre l'AppImage exécutable avant de la lancer. FUSE peut être nécessaire selon la distribution.
Les applications ne disposent pas de signature de distribution Windows/Apple ni de notarisation Apple ; macOS peut bloquer leur ouverture avec Gatekeeper.

## Mises à jour

La version Windows installée recherche les nouvelles releases et propose leur téléchargement puis leur installation après confirmation. Les documents non enregistrés empêchent le redémarrage.
Sur les versions portables, macOS et Linux, **Aide → Rechercher des mises à jour** ouvre les téléchargements GitHub pour une mise à jour manuelle.

## Changements

- Documentation complète intégrée : guides en français et en anglais, captures des trois vues, schémas et exemples.
- Lecteur local accessible avec F1, le bouton d’aide et les liens contextuels, utilisable sans connexion Internet.
- Recherche globale avec Ctrl+K, navigation par rubriques, thèmes, conservation des positions de lecture et agrandissement des images dans la fenêtre.
- Référence du protocole public pour intégrer CyMD à une application hôte.
- Même documentation dans la version web et le plugin ; les anciens liens d’aide restent compatibles.

[Documentation française](https://mrmybal.github.io/CyMD/Documentation/Documentation.html#/fr/overview) · [English documentation](https://mrmybal.github.io/CyMD/Documentation/Documentation.html#/en/overview)

## English

This release adds a complete offline manual in English and French, current screenshots, diagrams and examples. Open it with F1, the help button or contextual help. The reader includes Ctrl+K search, topic navigation, themes, reading-position restoration and in-window image enlargement. The web edition and embedded plugin include the same manual, with compatibility for previous help links and a public integration protocol reference.

Downloads include Windows x64 installer and portable builds, macOS Universal DMG and ZIP (Intel and Apple Silicon), Linux x64 AppImage and DEB, and CyMD-plugin.zip. Installed Windows builds support update download and installation from the Help menu. Portable, macOS and Linux builds use manual downloads. Windows/Apple distribution signing and Apple notarization are not provided.

CyMD reste distribué sous GNU AGPL v3.0 uniquement. Les dépendances tierces conservent leurs licences respectives. Interfaces français et anglais incluses.
