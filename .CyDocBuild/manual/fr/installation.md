---
id: installation
title: Installation et mises à jour
description: Choisissez un paquet et mettez à jour l’application de bureau.
section: Référence
order: 50
sourceRevision: 3
---

## Choisir un paquet {#packages}
| Système | Option portable | Installation | Architecture |
| --- | --- | --- | --- |
| Windows | .exe portable | .exe NSIS | x64 |
| macOS | .zip contenant .app | .dmg puis copie dans Applications | Universal, Intel + Apple Silicon |
| Linux | .AppImage | .deb pour Debian/Ubuntu | x64 |
Rendez l’AppImage exécutable (`chmod +x CyMD-*.AppImage`). Le support FUSE peut être nécessaire selon la distribution. Installez le .deb avec le gestionnaire de paquets.
La signature Apple Developer ID/notarisation et la signature Windows ne sont pas configurées dans ce projet. Android n’est pas actuellement pris en charge.
## Mises à jour {#updates}
Windows installé recherche une release stable GitHub environ 15 secondes après le démarrage. **Aide → Rechercher des mises à jour** lance aussi la recherche. Le téléchargement et l’installation demandent confirmation. Les documents non enregistrés bloquent l’installation.
« Plus tard » conserve le téléchargement ; la même commande permet de reprendre. Fermer normalement CyMD n’installe pas la mise à jour.
Windows portable, macOS, Linux et les versions de développement ouvrent les releases pour une installation manuelle. Une ancienne version sans système de mise à jour nécessite une installation manuelle initiale.
Les mises à jour nécessitent Internet, contrairement au manuel installé. Remplacer l’application remplace aussi le manuel livré.
## Navigateur et plugin {#web}
La version navigateur ne nécessite pas d’installation. Dans sa fenêtre de documentation, **Télécharger le manuel hors ligne** fournit un ZIP : extrayez tout son contenu puis ouvrez **Documentation.html** par une URL de fichier. Le même export est fourni avec le plugin.
La sécurité du navigateur empêche une page hébergée d’ouvrir librement des fichiers locaux. Son aide intégrée utilise le même lecteur sous l’URL de l’hôte ; le manuel extrait et l’application de bureau l’ouvrent directement en file://.
