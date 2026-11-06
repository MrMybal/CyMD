---
id: editing
title: Écrire et mettre en forme
description: Choisissez une vue, mettez le texte en forme et sélectionnez le contenu.
section: Guide / Rédaction
order: 10
sourceRevision: 3
---

## Live : écrire sans les balises {#live}
**Ctrl+1** active Live. Titres, gras, images, tâches et tableaux sont affichés directement. Les balises Markdown restent masquées, même pendant la sélection. Glissez pour sélectionner le texte ; la barre flottante permet d’appliquer gras, italique, souligné, barré, citation, code, spoiler et lien.
Les tableaux sont des blocs rendus : sélectionnez leur contenu affiché pour le copier. Passez en Brut ou Côte à côte pour modifier les cellules ou les balises.
```image
{"id":"live-editor","src":"assets/cymd-live-fr.jpg","alt":"Vue Live avec notes mises en forme et cases à cocher","controls":"minimal"}
```
## Côte à côte {#split}
**Ctrl+2** affiche le Markdown et son aperçu ensemble. Le défilement est synchronisé. Cette vue aide à corriger un lien ou à vérifier un tableau tout en modifiant sa syntaxe.
```image
{"id":"split-editor","src":"assets/cymd-split-fr.jpg","alt":"Source Markdown à gauche et aperçu à droite","controls":"minimal"}
```
## Brut {#raw}
**Ctrl+3** affiche le texte Markdown. Modifiez ici les balises, les lignes de tableaux et les délimiteurs de code. Changer de vue ne convertit ni ne supprime le document.
## Lecture {#read}
**Ctrl+4** affiche le document sans édition du texte. Un double-clic dans le document revient à l’édition. Utilisez cette vue pour relire avant de partager.
```image
{"id":"reading-editor","src":"assets/cymd-read-fr.jpg","alt":"Vue Lecture : tâches, citation, tableau et code coloré","controls":"minimal"}
```
## Mise en forme courante {#formatting}
Sélectionnez le texte avant de cliquer sur un bouton. **Ctrl+B**, **Ctrl+I**, **Ctrl+U**, **Ctrl+E** et **Ctrl+K** appliquent gras, italique, souligné, code en ligne et lien. Le menu des titres permet de choisir un niveau. **#** affiche les numéros de ligne.
Une liste continue avec Entrée ; Tab et Maj+Tab règlent son indentation. Cliquez sur une case de tâche pour modifier son état. Un spoiler utilise `||texte||` ; le contenu se révèle au survol ou au clic.
Utilisez **Ctrl+F** pour rechercher/remplacer. **Ctrl+Z** annule une modification.
## Onglets et fenêtres {#tabs}
**Ctrl+T** crée un onglet, **Ctrl+W** le ferme, **Ctrl+Tab** passe au suivant. Glissez un onglet pour le réordonner. Sur ordinateur, il peut rejoindre une autre fenêtre CyMD ou se détacher dans une nouvelle fenêtre. Ces opérations sont limitées dans le navigateur.
La fermeture d’un document modifié propose d’enregistrer, d’abandonner ou d’annuler. Un fichier ouvert depuis l’explorateur rejoint l’application en cours.
## Langue et thème {#preferences}
Choisissez français ou anglais dans la barre d’outils ; sur ordinateur, le menu **Affichage → Langue** est aussi disponible. Le choix est mémorisé et synchronisé entre fenêtres. Les documents existants ne sont pas traduits et l’annulation est conservée.
Le menu Affichage propose les thèmes clair, sombre et système, le zoom et la largeur de lecture. Le manuel possède son propre sélecteur de thème et suit le système clair/sombre par défaut.

Sur ordinateur, faites un clic droit sur un mot signalé pour afficher les corrections proposées ou l’ajouter au dictionnaire. Leur disponibilité dépend du dictionnaire du système.
