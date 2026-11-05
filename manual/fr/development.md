---
id: development
title: Construire et maintenir CyMD
description: Construire et maintenir CyMD
section: Référence développeur
order: 110
sourceRevision: 2
---

## Construire depuis les sources {#build}


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

## Organisation {#layout}

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

## Sécurité {#security}

Rendu isolé (`sandbox`, `contextIsolation`), HTML nettoyé par DOMPurify, aucune navigation dans la
fenêtre (les liens s'ouvrent dans le navigateur), protocole `cymd://` limité au dossier des documents
ouverts, liens vers des fichiers locaux jamais exécutés (affichés dans l'explorateur), aperçus de liens
récupérés dans une session réseau séparée, sans cookies.

## Version navigateur {#browser}

**[Ouvrir CyMD en ligne](https://MrMybal.github.io/CyMD/)** — sans installation.

Les documents s'ouvrent et s'enregistrent sur votre appareil ; ils ne sont pas stockés
sur GitHub. Pensez à enregistrer vos modifications avant de fermer l'onglet.
La licence et les sources déployées sont accessibles depuis le bas de l'éditeur.

Le workflow **Web editor and documentation** publie les changements concernés sur main
et les nouvelles releases stables sur GitHub Pages. Il peut aussi être lancé manuellement.
La source Pages du dépôt doit être **GitHub Actions**. `npm run build:pages` prépare
le site dans `output/pages/`, avec le manuel bilingue complet dans `help/` et des
chemins relatifs compatibles avec `/CyMD/`.


Ouvre et enregistre les fichiers (directement avec Chrome/Edge, par téléchargement ailleurs), mais ne
peut pas lire les images du dossier d'un `.md` ni récupérer les aperçus de liens (CORS). Le format
`.cymd` y fonctionne entièrement.

## Préparer une release {#release}


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

## Générer la documentation {#documentation}

`npm run docs:build` · `npm run docs:check` · `npm run test:help`

CyDoc 0.1.0 est installé depuis l’archive figée dans vendor/. Seul le module image est activé. Les schémas sont compilés en SVG. Les sources de src/doc sont indexées lexicalement ; aucune API sémantique TypeScript ou TypeDoc n’est supposée. Consultez [l’implémentation du format](doc:source-src-doc-cymd-ts).
