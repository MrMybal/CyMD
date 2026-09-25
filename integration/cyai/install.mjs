import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
const root=resolve(process.argv[2]||'')
if(!existsSync(join(root,'cyai/server.py')))throw Error('Specify the CyAIOrchestrator source directory')
if(readFileSync(join(root,'cyai/service.py'),'utf8').includes("if action == 'cymd_open':")){
  cpSync('integration/cyai/cymd-editor.js',join(root,'cyai/web/cymd-editor.js'))
  cpSync('release/plugin',join(root,'cyai/web/cymd'),{recursive:true})
  console.log('Updated the installed CyMD bundle and adapter.');process.exit(0)
}
const changes=new Map()
function edit(file,from,to){const current=changes.get(file)||readFileSync(join(root,file),'utf8');if(!current.includes(from))throw Error(`Unsupported host source: ${file}`);changes.set(file,current.replace(from,to));}
edit('cyai/plugins.py',"DEFAULTS = [","DEFAULTS = [\n    {'id':'cymd','name':'CyMD','type':'document','enabled':True,'button':'Ouvrir CyMD'},")
edit('cyai/plugins.py',"        self.grants = {}","        self.config['plugins'].setdefault('cymd', dict(DEFAULTS[0]))\n        self.grants = {}")
edit('cyai/plugins.py',"{'annotation','mcp'}","{'annotation','mcp','document'}")
edit('cyai/plugins.py',"        if p['type']=='mcp':","        if p['type']=='document' and p['id']!='cymd':\n            raise ValueError('Seul le plugin document CyMD intégré est pris en charge.')\n        if p['type']=='mcp':")
edit('cyai/service.py',"        if action == 'preview_cymd':",`        if action == 'cymd_open':
            project = self.project_for_conversation(data['conversation_id'])
            self.plugins.plugin('cymd', project['id'])
            if not data.get('id'):
                return {'name': 'Sans titre.md'}
            from .media import locate
            row, meta, path = locate(self.store, data['id'])
            if row['conversation_id'] != data['conversation_id']:
                raise ValueError('Pièce jointe hors conversation.')
            if path.stat().st_size > 50*1024*1024 or not row['name'].lower().endswith(('.cymd','.md','.markdown')):
                raise ValueError('Document incompatible ou supérieur à 50 Mo.')
            return {'name': row['name'], 'url': '/media/'+row['id']}
        if action == 'preview_cymd':`)
edit('cyai/server.py',"                    if path.startswith('/cyannota/'):",`                    if path.startswith('/cymd/'):
                        root = (webroot/'cymd').resolve()
                        file = (root/(unquote(path[len('/cymd/'):]) or 'index.html')).resolve()
                        if not file.is_relative_to(root) or not file.is_file() or file.suffix not in {'.js','.css','.html','.png','.txt','.zip','.json'}:
                            return self.send(404, {'error':'Fichier CyMD absent.'})
                        return self.send(200,file.read_bytes(),mimetypes.guess_type(file.name)[0] or 'application/octet-stream',embedded=True)
                    if path.startswith('/cyannota/'):`)
edit('cyai/server.py','"media.js"}', '"media.js", "cymd-editor.js"}')
edit('cyai/web/index.html','<script src="/media.js">','<script src="/cymd-editor.js"></script><script src="/media.js">')
edit('cyai/web/media.js',"  await action('open_cymd'","  if(cymdEnabled()){await openCymdEditor(doc.dataset.mediaDocument);return;}\n  await action('open_cymd'")
edit('cyai/web/media.js','>Ouvrir avec Windows</button>',">${cymdEnabled()?'Ouvrir dans CyMD':'Ouvrir avec Windows'}</button>")
edit('cyai/web/plugins.js',"p.type==='annotation'?'Éditeur", "p.type==='document'?'Éditeur Markdown et documents CyMD intégré.':p.type==='annotation'?'Éditeur")
edit('cyai/web/plugins.js',"items.map(p=>p.type==='annotation'?", "items.map(p=>p.type==='document'?`<button type=\"button\" class=\"cyannota-button\" data-plugin-action=\"cymd\" title=\"Ouvrir CyMD\" aria-label=\"Ouvrir CyMD\"><img src=\"/cymd/logo.png\" alt=\"\"></button>`:p.type==='annotation'?")
edit('cyai/web/plugins.js',"if(p.cytools)return configureCytool(p);", "if(p.type==='document'){openDialog('CyMD','<p>Éditeur Markdown intégré. Enregistrer crée une nouvelle pièce jointe ; les originaux sont conservés.</p><p><a href=\"/cymd/LICENSE.txt\" target=\"_blank\">Licence AGPL v3.0</a> · <a href=\"/cymd/source.zip\" download>Sources de CyMD</a></p>',async()=>{});return;}if(p.cytools)return configureCytool(p);")
edit('cyai/web/plugins.js'," if(op==='web')", " if(op==='cymd')await openCymdEditor();\n if(op==='web')")
edit('pyproject.toml','"web/cyannota/*",','"web/cymd/*", "web/cymd/assets/*", "web/cyannota/*",')
const backup=resolve('output/cyai-before-cymd')
for(const [file,value] of changes){const path=join(root,file);const destination=join(backup,file);mkdirSync(resolve(destination,'..'),{recursive:true});if(!existsSync(destination))cpSync(path,destination);writeFileSync(path,value);}
cpSync('integration/cyai/cymd-editor.js',join(root,'cyai/web/cymd-editor.js'))
cpSync('release/plugin',join(root,'cyai/web/cymd'),{recursive:true})
console.log(`Installed embedded CyMD in ${root}; restart CyAI to load the plugin.`)
