---
id: troubleshooting
title: Résoudre un problème
description: Retrouvez les médias manquants et résolvez les problèmes d’enregistrement.
section: Référence
parent: installation
order: 60
sourceRevision: 3
---

## Je ne vois pas les balises Markdown {#markers}
C’est le fonctionnement prévu de Live. Passez en [Brut ou Côte à côte](doc:editing#raw) pour les modifier. Utilisez aussi ces vues pour la structure des tableaux.
## Une image manque {#images}
Vérifiez le chemin relatif et placez l’image dans le dossier du .md ou un sous-dossier. Pour partager, envoyez aussi le dossier ou enregistrez en .cymd. Un navigateur ne peut pas lire librement les fichiers voisins.
## Limites du navigateur {#browser}
L’enregistrement direct dépend du navigateur et des permissions du sélecteur de fichiers. Un téléchargement est une copie enregistrée ; vérifiez son emplacement. Les nouveaux aperçus peuvent être bloqués par CORS. CyMD ne fournit ni stockage serveur ni synchronisation de compte.
## L’enregistrement n’est pas confirmé {#saving}
Ne fermez pas le document. Vérifiez la destination et les boîtes de dialogue. Dans une application hôte, une erreur ou un délai dépassé laisse le document modifié ; réessayez après vérification de l’hôte. Une mise à jour attend également les documents non enregistrés.
## La documentation manque {#help}
Réinstallez le paquet complet. Pour un manuel extrait, gardez ensemble Documentation.html, DocAI.md et le dossier DocData complet. Ouvrez Documentation.html après extraction du ZIP.
## Une vidéo ne se lit pas {#video}
Vérifiez le fichier et la prise en charge de son codec dans le navigateur cible. Une vidéo en ligne nécessite toujours Internet. CyMD ne convertit pas les vidéos.
