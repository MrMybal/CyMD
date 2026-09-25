# CyMD

Éditeur et lecteur **Markdown** simple, façon Bloc-notes, avec un rendu **en direct** comme sur Discord :
images, vidéos, aperçus de liens, cases à cocher, tableaux, code coloré… Fonctionne sous Windows, macOS
et Linux (Electron), et aussi dans un navigateur (avec quelques limites).

## Fonctionnalités

- **Français et anglais** : choix dans la barre d'outils ou **Affichage → Langue**, mémorisé
  entre les lancements et synchronisé entre fenêtres. Le système choisit le français pour les
  langues système francophones, l'anglais sinon. Le changement préserve les documents et l'annulation.

- **Onglets façon Chrome** : plusieurs documents par fenêtre ; glisser un onglet pour le réordonner, vers
  une autre fenêtre, ou hors de la fenêtre pour en créer une nouvelle. Un fichier ouvert depuis
  l'explorateur arrive en onglet dans la fenêtre déjà ouverte (pas de nouveau démarrage).
- **Barre d'outils** (fichiers + mise en forme) et **barre flottante sur la sélection**, comme sur Discord :
  gras, italique, souligné (`<u>…</u>`), barré, citation, code, spoiler (`||…||`), lien.
- **Numéros de ligne** en option (bouton `#` ou menu Affichage).
- **4 vues** : *Live* (par défaut, la syntaxe n'apparaît que sur l'élément où se trouve le curseur),
  *Côte à côte* (brut + aperçu, défilement synchronisé), *Brut* (texte seul) et *Lecture*.
- **Copier-coller** : image collée (capture d'écran…) → ajoutée au document ; HTML d'une page web ou de
  Word → converti en Markdown ; URL collée sur une sélection → lien ; `Ctrl+Shift+V` → texte brut.
- **Glisser-déposer** d'images, vidéos et fichiers ; un `.md`/`.cymd` déposé est ouvert.
- **Aperçus de liens** façon Discord sous chaque URL « nue » (Open Graph, YouTube lisible dans l'aperçu).
  `<https://…>` entre chevrons = pas d'aperçu.
- Images redimensionnables : `![légende|300](image.png)`.
- Rechercher / remplacer, correcteur orthographique, thème clair/sombre, export HTML autonome.
- Rapide même sur les gros fichiers (le rendu Live ne se calcule qu'autour de la zone visible).

## Deux formats

### `.md` : Markdown simple (mode dossier)

Un fichier texte standard. Les images et vidéos référencées sont lues **dans le dossier du fichier et ses
sous-dossiers** (`![photo](images/photo.jpg)`). Les médias collés sont écrits dans un sous-dossier
`assets/` à l'enregistrement. L'encodage, le BOM et les fins de ligne (CRLF/LF) du fichier sont conservés.

### `.cymd` : document tout-en-un

Une archive **ZIP** (comme `.docx`/`.epub`) qui regroupe tout ; on peut l'ouvrir avec 7-Zip :

```
mimetype          application/x-cymd
manifest.json     { format, version, main, created, modified }
document.md       le texte Markdown
previews.json     aperçus de liens { url: { title, description, image, … } }
assets/…          images, vidéos, fichiers
previews/…        miniatures des aperçus (lisibles hors connexion)
```

Les médias qui ne sont plus utilisés dans le texte ne sont pas enregistrés.
*Fichier → Enregistrer sous* permet de passer d'un format à l'autre : les fichiers du dossier sont
regroupés dans le `.cymd`, ou extraits à côté du `.md`.

## Raccourcis

| Raccourci | Action |
| --- | --- |
| Ctrl+T (ou Ctrl+N) / Ctrl+Shift+N | Nouvel onglet / nouvelle fenêtre |
| Ctrl+W / Ctrl+Shift+W | Fermer l'onglet / la fenêtre |
| Ctrl+Tab / Ctrl+Shift+Tab | Onglet suivant / précédent |
| Ctrl+O, Ctrl+S, Ctrl+Shift+S | Ouvrir (plusieurs fichiers possibles), enregistrer, enregistrer sous |
| Ctrl+1 … Ctrl+4 | Live, Côte à côte, Brut, Lecture |
| Ctrl+B / I / U / E / K | Gras, italique, souligné, code, lien |
| Ctrl+Shift+X | Barré |
| Ctrl+Shift+1 / 2 / 3 | Titre 1 / 2 / 3 |
| Ctrl+Shift+8 / 7 / 9 / . | Liste à puces / numérotée / cases à cocher / citation |
| Tab / Shift+Tab | Indenter / désindenter (listes) |
| Ctrl+F | Rechercher / remplacer |
| Ctrl+clic | Ouvrir un lien |

## Mises à jour

La version Windows installée recherche une nouvelle release stable GitHub 15 secondes après le
démarrage. **Aide → Rechercher des mises à jour…** permet aussi de lancer la recherche manuellement.
Le téléchargement et le redémarrage demandent confirmation. L'installation est bloquée tant qu'une
fenêtre contient des documents non enregistrés. « Plus tard » conserve le téléchargement ; la même
commande permet de reprendre l'installation. Fermer normalement CyMD n'installe pas la mise à jour.

La version portable, les autres systèmes et le mode développement proposent d'ouvrir les
[releases GitHub](https://github.com/MrMybal/CyMD/releases) pour une installation manuelle.

### Formats distribués

| Système | Sans installation | Installation | Architecture |
| --- | --- | --- | --- |
| Windows | Exécutable portable `.exe` | Installeur NSIS `.exe` | x64 |
| macOS | Archive `.zip` contenant l'application `.app` | Image `.dmg`, copie vers Applications | Universal : Intel et Apple Silicon |
| Linux | `.AppImage` | Paquet `.deb` pour Debian/Ubuntu | x64 |

Sur Linux, rendre l'AppImage exécutable avant de la lancer (`chmod +x CyMD-*.AppImage`).
Selon la distribution, le support FUSE peut être nécessaire. Le paquet `.deb` s'installe avec
le gestionnaire de paquets. Sur macOS, la signature Developer ID et la notarisation sont à configurer
avant une diffusion validée par Gatekeeper ; aucun certificat Apple n'est inclus dans le projet.

Les paquets sont construits sur leur système cible. La configuration multiplateforme ne remplace pas
un test réel sur Windows, macOS et Linux. Les raccourcis d'édition utilisent aussi Cmd sur macOS.
Les mises à jour automatiques restent limitées à Windows installé ; ailleurs, le menu ouvre les releases.

### Préparer une release

1. Augmenter la version avec `npm version patch --no-git-tag-version`, puis committer les changements.
2. Créer le tag correspondant (`vX.Y.Z`) et le pousser sur GitHub.
3. Le workflow compile et teste sur Windows, macOS et Linux. Une fois les trois compilations
   réussies, il crée une **release brouillon** contenant tous les paquets et métadonnées de mise à jour.
4. Tester les applications sur chaque système, puis publier le brouillon comme release stable.

Le lancement manuel du workflow construit uniquement les paquets et les conserve comme artefacts
GitHub Actions ; il ne crée pas de release. Les commandes locales ne poussent ni code ni tag.

Pour une compilation locale : `npm run dist:win`. Joindre ensemble les fichiers générés dans
`release/` : `latest.yml` doit correspondre exactement à l'installeur fourni. Les commandes de
compilation locales ne publient rien. Aucun jeton GitHub n'est nécessaire dans l'application.

Une ancienne version sans ce système nécessite une première installation manuelle. Une mise à jour
complète s'évalue entre deux versions installées distinctes et des releases publiées compatibles.

## Plugin intégré

CyMD peut être affiché et édité dans une iframe au sein d'une autre application.
`npm run build:plugin` génère le bundle dans `release/plugin`, avec la licence et les sources.
Le [protocole d'intégration](docs/integration.md) fournit l'ouverture, l'état des modifications
et la sauvegarde confirmée par l'hôte.

Pour les sources locales de CyAIOrchestrator :
`node integration/cyai/install.mjs CHEMIN_VERS_CYAIORCHESTRATOR`, après construction du plugin.
Redémarrer ensuite CyAI depuis ces sources (ou reconstruire son application distribuée).
Le plugin ajoute un bouton CyMD et ouvre les pièces jointes `.cymd` dans l'éditeur.
Chaque sauvegarde ajoute une nouvelle pièce jointe ; le document original est conservé.

## Licence

Copyright © 2026 Cyberalien.

CyMD est distribué sous la **GNU Affero General Public License v3.0 uniquement**
(`AGPL-3.0-only`). Le texte intégral est disponible dans [LICENSE](LICENSE).
Les dépendances tierces conservent leurs licences respectives.

## Développement

```bash
npm ci
npm run dev        # Electron + Vite avec rechargement à chaud
npm run dev:web    # version navigateur seule (http://localhost:5173)
npm run build      # vérification TypeScript + build de production (dist/)
npm start          # build puis lance Electron sur dist/
npm run dist       # installeur (NSIS + portable sous Windows) dans release/
npm run dist:win   # Windows : portable + NSIS, à lancer sur Windows
npm run dist:mac   # macOS : DMG + ZIP universal, à lancer sur macOS
npm run dist:linux # Linux : AppImage + DEB x64, à lancer sur Linux
npm run dist:dir   # application non empaquetée dans release/, pour tester
```

Si Electron ne démarre pas après `npm install` (binaire manquant), lancer :
`node node_modules/electron/install.js`.

Icônes : le logo source est `assets/branding/cymd-logo-yellow.png`. Après l'avoir modifié, régénérer
toutes les icônes (exécutable, installeur, fenêtre, interface, favicon) avec
`powershell -ExecutionPolicy Bypass -File scripts/make-icons.ps1` (option `-Source autre-logo.png`).

Test de fumée automatisé (ouvre un fichier, exécute un script dans la fenêtre, enregistre une capture) :
`SMOKE_SCRIPT=etapes.js SMOKE_OUT=sortie electron scripts/smoke.cjs fichier.md`.

### Organisation

Les traductions anglaises sont centralisées dans `locales/en.json` ; les clés constituent les
textes français. Les moteurs `src/i18n.ts` et `electron/i18n.cjs` partagent ce catalogue.
Les guides intégrés existent en français et en anglais. Les fichiers utilisateur ne sont pas traduits.

```
electron/main.cjs        fenêtres, menus, fichiers, protocole cymd://, aperçus de liens (réseau)
assets/branding/         logo source pour régénérer les icônes
electron/preload.cjs     pont sécurisé vers le rendu
src/app.ts               contrôleur : documents, modes, enregistrement, médias
src/editor/              CodeMirror 6 : mode Live, widgets, commandes, copier-coller
src/preview/             rendu Markdown (markdown-it + DOMPurify) et hydratation
src/ui/                  onglets, barre d'outils, menus, icônes (Lucide)
src/embeds/              aperçus de liens et cartes façon Discord
src/doc/                 modèle de document, format .cymd, chemins, types de médias
src/platform/            Electron / navigateur
build/icon.ico, icon.png icônes de l'exécutable et de l'installeur (générées)
electron/icon.png        icône de fenêtre / « À propos » (générée)
public/logo.png          logo de l'interface et favicon (généré)
```

### Sécurité

Rendu isolé (`sandbox`, `contextIsolation`), HTML nettoyé par DOMPurify, aucune navigation dans la
fenêtre (les liens s'ouvrent dans le navigateur), protocole `cymd://` limité au dossier des documents
ouverts, liens vers des fichiers locaux jamais exécutés (affichés dans l'explorateur), aperçus de liens
récupérés dans une session réseau séparée, sans cookies.

### Version navigateur

Ouvre et enregistre les fichiers (directement avec Chrome/Edge, par téléchargement ailleurs), mais ne
peut pas lire les images du dossier d'un `.md` ni récupérer les aperçus de liens (CORS). Le format
`.cymd` y fonctionne entièrement.
