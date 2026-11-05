---
id: documents
title: Fichiers, enregistrement et partage
description: Fichiers, enregistrement et partage
section: Guide utilisateur
order: 20
sourceRevision: 1
---

## Choisir son format {#formats}
| Format | Adapté à | À partager |
| --- | --- | --- |
| .md | Texte simple, Git, autres outils Markdown | Le fichier .md et son dossier assets |
| .cymd | Notes illustrées dans un seul fichier | Le fichier .cymd |
Utilisez **Fichier → Enregistrer sous** (**Ctrl+Maj+S**) pour changer de format. Le Markdown simple conserve son encodage, son BOM et ses fins de ligne LF/CRLF.
```diagram
{"type":"flow","title":"Contenu d’un document .cymd","nodes":[{"id":"n0","label":"Texte Markdown","x":0,"y":20,"width":210},{"id":"n1","label":"Images et aperçus","x":270,"y":20,"width":210},{"id":"n2","label":"Archive ZIP .cymd","x":540,"y":20,"width":210}],"edges":[{"from":"n0","to":"n1"},{"from":"n1","to":"n2"}]}
```
Le schéma montre les contenus regroupés, et non des étapes d’export manuel.
## Enregistrer son travail {#saving}
**Ctrl+S** enregistre le document actif. Pour un nouveau fichier, choisissez un dossier et un nom. Le témoin de modification indique que des changements ne sont pas enregistrés. Conservez une copie des documents importants : CyMD n’est pas un service de sauvegarde dans le cloud.
Sur ordinateur, les médias collés dans un .md sont écrits dans un sous-dossier **assets/**. Gardez ce dossier près du document. Lors de l’enregistrement en .cymd, les ressources locales référencées sont regroupées dans l’archive. L’enregistrement d’un .cymd en .md extrait les ressources à côté du fichier. Les médias inutilisés sont omis du .cymd enregistré.
## Ouvrir et partager {#opening}
Utilisez **Ctrl+O**, déposez un .md/.cymd dans l’éditeur ou ouvrez-le depuis l’explorateur. Sur ordinateur, les images d’un .md doivent se trouver dans son dossier ou un sous-dossier. Les chemins sortant de ce dossier sont refusés.
Un .cymd est une archive ZIP. Un outil d’archivage permet de récupérer **document.md**, **assets/** et les aperçus mémorisés. Ne renommez pas simplement un .md en .cymd : utilisez Enregistrer sous.
## Exporter en HTML {#html}
La commande **Fichier → Exporter en HTML** produit une page rendue autonome. Elle sert à partager une copie lisible et ne remplace pas l’original modifiable. La lecture des vidéos dépend toujours du navigateur et des codecs du destinataire.
## Navigateur et application hôte {#browser}
Chrome/Edge peuvent proposer une ouverture et un enregistrement directs. D’autres navigateurs utilisent un sélecteur de fichiers et des téléchargements. Enregistrez avant de fermer l’onglet. Les documents ne sont pas stockés sur GitHub Pages.
Dans un éditeur CyMD intégré, l’application hôte confirme l’enregistrement. Dans CyAIOrchestrator, il crée une nouvelle pièce jointe ; l’original est conservé. Consultez le [protocole d’intégration](doc:integration).
