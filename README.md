# CyMD

Éditeur et lecteur **Markdown** simple, façon Bloc-notes, avec un rendu **en direct** comme sur Discord :
images, vidéos, aperçus de liens, cases à cocher, tableaux, code coloré… Fonctionne sous Windows, macOS
et Linux (Electron), et aussi dans un navigateur (avec quelques limites).

## Fonctionnalités

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

## Développement

```bash
npm ci
npm run dev        # Electron + Vite avec rechargement à chaud
npm run dev:web    # version navigateur seule (http://localhost:5173)
npm run build      # vérification TypeScript + build de production (dist/)
npm start          # build puis lance Electron sur dist/
npm run dist       # installeur (NSIS + portable sous Windows) dans release/
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
