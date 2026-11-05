---
id: overview
title: Bienvenue dans CyMD
description: Bienvenue dans CyMD
section: Pour commencer
order: 0
sourceRevision: 1
---

CyMD est un bloc-notes Markdown pour vos notes, votre documentation et vos documents illustrés. L’application fonctionne sous Windows, macOS et Linux. La version navigateur partage l’éditeur, avec des [limites sur les fichiers et le réseau](doc:troubleshooting#browser).

## Votre premier document {#getting-started}
1. Choisissez **Nouveau** ou appuyez sur **Ctrl+N** (Cmd sur macOS).
2. Écrivez un titre, un paragraphe et une liste de tâches. **Live** affiche la mise en forme sans les balises Markdown.
3. Cliquez sur **Enregistrer**. Choisissez **.md** pour le texte simple ou **.cymd** pour réunir texte et images.
4. Fermez puis rouvrez le fichier enregistré pour le vérifier avant de le partager.

```diagram
{"type":"flow","title":"Écrire, enregistrer, partager","nodes":[{"id":"n0","label":"Écrire ses notes","x":0,"y":20,"width":210},{"id":"n1","label":"Enregistrer .md ou .cymd","x":270,"y":20,"width":210},{"id":"n2","label":"Ouvrir et partager","x":540,"y":20,"width":210}],"edges":[{"from":"n0","to":"n1"},{"from":"n1","to":"n2"}]}
```

## Se repérer dans l’interface {#interface}
La première ligne contient les onglets. La barre d’outils regroupe les fichiers et la mise en forme, puis la langue, les numéros de ligne, les vues et le bouton de documentation. La barre du bas indique la position du curseur, le nombre de mots et l’encodage.

```image
{"id":"interface","src":"assets/cymd-live.jpg","alt":"Éditeur Live : onglets, barre d’outils, liste de tâches et barre d’état.","controls":"minimal"}
```
Les captures illustrent l’éditeur ; le bouton de documentation a été ajouté après leur réalisation. Utilisez les commandes de l’image pour zoomer. L’agrandissement reste dans cette fenêtre ; **Échap** rétablit sa taille.

## Utiliser ce manuel {#help}
Ouvrez **Aide → Documentation CyMD**, le bouton en forme de livre ou **F1**. **Maj+F1** ouvre la section de la vue actuelle. Dans l’application de bureau, les pages, images et schémas sont installés localement et fonctionnent sans Internet.
À l’ouverture de l’aide, la langue suit celle du logiciel. Le lecteur permet de basculer entre français et anglais. Si une traduction manque, le contenu anglais est affiché.

Recherchez un mot, utilisez le sommaire ou suivez les liens ci-dessous. Les positions de lecture sont conservées lors de la navigation dans la session. Les favoris, notes et préférences de thème utilisent le stockage local du navigateur lorsqu’il est disponible.
- [Écrire et sélectionner le texte](doc:editing#live)
- [Choisir un format de fichier](doc:documents#formats)
- [Insérer une image](doc:media#images)
- [Essayer les exemples](doc:example)
- [Raccourcis clavier](doc:shortcuts)

## Accessibilité {#accessibility}
Utilisez **Tab** pour atteindre les liens et commandes, **Entrée/Espace** pour les activer, et les boutons de zoom nommés de l’image si vous n’utilisez pas de molette. Les commandes restent accessibles au toucher. Le lecteur propose aussi un thème à contraste élevé. Aucun média ne démarre automatiquement dans ce manuel.
