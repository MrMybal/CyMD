---
id: media
title: Images, vidéos et liens
description: Images, vidéos et liens
section: Guide utilisateur
order: 30
sourceRevision: 1
---

## Insérer une image {#images}
Collez une image, déposez un fichier dans l’éditeur ou utilisez le bouton de média. L’image devient une ressource du document. Pour la redimensionner, modifiez son Markdown en vue Brut :
```markdown
![Une description utile|300](assets/image.png)
```
La largeur est en pixels. Choisissez un texte alternatif utile. Si vous partagez un .md, joignez le dossier des images ; le .cymd emporte les ressources.
[Agrandir la capture de l’interface](doc:overview?media=interface&zoom=1.5).
## Coller du contenu mis en forme {#paste}
Le HTML copié depuis une page web ou Word est converti en Markdown. **Ctrl+Maj+V** colle du texte brut. Coller une URL sur du texte sélectionné crée un lien.
## Vidéos et autres fichiers {#video}
Déposez une vidéo ou utilisez le bouton de média. La lecture dépend de la plateforme et du codec ; changer l’extension ne convertit pas l’encodage. Les liens vers des fichiers locaux sont affichés dans l’explorateur plutôt qu’exécutés par CyMD.
## Aperçus de liens {#previews}
Une URL seule sur sa ligne peut produire une carte dans l’application de bureau. Cela nécessite une requête réseau. Les aperçus YouTube pris en charge sont lisibles dans l’aperçu. Entourez une URL de chevrons pour éviter la carte :
```markdown
<https://example.com>
```
Les cartes et miniatures mémorisées peuvent être conservées dans le .cymd et lues hors ligne. Une vidéo en ligne ou une page non mémorisée nécessite toujours Internet. Les restrictions du navigateur (CORS) peuvent empêcher de nouveaux aperçus.
Le manuel d’aide, lui, ne charge aucune image, police, vidéo ou ressource CDN distante.
