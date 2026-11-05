---
id: integration
title: Intégrer CyMD dans une application
description: Intégrer CyMD dans une application
section: Référence développeur
order: 100
sourceRevision: 1
---

## Construire et installer {#build}

`npm run build:plugin` produit `release/plugin` et l'archive `release/CyMD-plugin.zip` : éditeur web, manifeste, licence AGPL v3.0 et sources correspondantes. Servez ce dossier sur HTTP(S), par exemple sous `/cymd/`. Aucun serveur Electron n'est requis.

Le manifeste décrit le plugin ; l'hôte doit implémenter ce protocole pour l'installer comme éditeur. Un import dans un catalogue MCP seul ne suffit pas.

Pour installer dans les sources locales de CyAIOrchestrator, exécutez `node integration/cyai/install.mjs CHEMIN_VERS_CYAIORCHESTRATOR` après le build du plugin. Redémarrez depuis ces sources ou reconstruisez l’application distribuée.

## Ouvrir un éditeur {#open}

Chargez une iframe avec `index.html?integration=1&parentOrigin=ORIGINE&session=IDENTIFIANT`, où ORIGINE est l'origine HTTP(S) exacte de l'hôte et IDENTIFIANT un identifiant aléatoire neuf pour cette ouverture.

Chaque message contient `protocol: "cymd.integration"`, `version: 1`, `session`, `source` (`"host"` ou `"cymd"`) et `type`. Utilisez une origine exacte pour `postMessage`. Vérifiez toujours `event.origin`, `event.source`, la version et la session côté hôte. Ne transmettez aucun chemin disque arbitraire.

1. CyMD envoie `ready` après initialisation.
2. L'hôte envoie `open` avec `name`, `file` (Blob ou File), et éventuellement `locale: "fr" | "en"`. Une seule ouverture initiale est acceptée par iframe. Formats : `.cymd`, `.md`, `.markdown`, maximum 50 Mio. Pour un nouveau document, envoyez un Blob Markdown vide et un nom terminé par `.md`.
3. CyMD envoie `state` avec `title` et `dirty`. L'hôte doit confirmer l'abandon avant de fermer une fenêtre contenant des modifications et bloquer la fermeture pendant une sauvegarde.
## Confirmer chaque enregistrement {#save}

4. À l'enregistrement, CyMD envoie `save` avec `requestId`, `name` et `file`. L'hôte stocke le document, puis répond `save-result` avec le même `requestId` et `ok: true`. En cas d'échec : `ok: false, error: "message"`. Sans confirmation dans les 60 secondes, la sauvegarde échoue et les modifications restent non enregistrées.
5. L'hôte peut envoyer `command` avec `command: "save"` ou `"save-as"`. CyMD peut envoyer `close-request` ou `error` avec `message`.

## Ressources et limites {#limits}

La sauvegarde HTML et les fichiers ouverts directement depuis le navigateur restent des téléchargements ou des enregistrements locaux. Les ressources intégrées au `.cymd` sont conservées. Le mode intégré n'a pas d'accès au système de fichiers de l'hôte ; les images relatives d'un Markdown simple et les aperçus réseau dépendent des ressources disponibles et de la politique du serveur hôte.

Dans CyAIOrchestrator, le plugin ouvre une pièce jointe dans l'éditeur. Enregistrer ajoute une nouvelle pièce jointe à la conversation, sélectionnée pour le prochain message ; l'original est conservé. Les enregistrements suivants créent aussi une nouvelle pièce jointe. Un redémarrage de CyAI est nécessaire après installation des fichiers du plugin.

Le bouton d’aide ouvre le lecteur livré dans une boîte de dialogue. Conservez tout le dossier help et CyMD-help.zip. Le ZIP extrait permet une lecture directe en file://.

## Exemple minimal côté hôte {#example}

Enregistrez le gestionnaire avant d’affecter l’URL de l’iframe. Cet extrait montre la connexion initiale ; ajoutez l’enregistrement, les erreurs et la confirmation de fermeture avant de le déployer.

```javascript
const session = crypto.randomUUID();
const editorOrigin = window.location.origin;
window.addEventListener("message", event => {
  const message = event.data;
  if (event.origin !== editorOrigin ||
      event.source !== iframe.contentWindow ||
      message?.protocol !== "cymd.integration" ||
      message.version !== 1 || message.session !== session ||
      message.source !== "cymd") return;
  if (message.type === "ready") iframe.contentWindow.postMessage({
    protocol: "cymd.integration", version: 1, session, source: "host",
    type: "open", name: "Notes.md", locale: "fr",
    file: new Blob(["# Notes\n"], { type: "text/markdown" })
  }, editorOrigin);
});
iframe.src = "/cymd/index.html?integration=1&parentOrigin=" +
  encodeURIComponent(location.origin) + "&session=" + encodeURIComponent(session);
```

L’adaptateur complet se trouve dans `integration/cyai/cymd-editor.js`.
