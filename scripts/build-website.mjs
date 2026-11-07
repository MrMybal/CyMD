import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {render} from '../website/view.mjs';
export function buildWebsite(output='output/pages'){
 const dest=resolve(output,'site-assets');mkdirSync(dest,{recursive:true});const assets={};
 function asset(name,bytes){const hash=createHash('sha256').update(bytes).digest('hex').slice(0,12),dot=name.lastIndexOf('.'),file=name.slice(0,dot)+'.'+hash+name.slice(dot);writeFileSync(join(dest,file),bytes);return './site-assets/'+file;}
 for(const name of readdirSync('website/assets'))assets[name]=asset(name,readFileSync(join('website/assets',name)));
 for(const locale of ['en','fr'])for(const mode of ['live','split','read']){const name=mode+'-'+locale+'.jpg';assets[name]=asset(name,readFileSync('.CyDocBuild/assets/cymd-'+mode+'-'+locale+'.jpg'));}
 assets['logo.png']=asset('logo.png',readFileSync('public/logo.png'));
 const modules={};
 for(const name of ['content','view','site']){
  let source=readFileSync('website/'+name+'.mjs','utf8');
  for(const [dependency,file]of Object.entries(modules))source=source.replaceAll('./'+dependency+'.mjs','./'+file.split('/').at(-1));
  modules[name]=asset(name+'.js',source);
 }
 const css=asset('style.css',readFileSync('website/style.css'));
 const html=readFileSync('website/index.html','utf8').replace('@@STYLE@@',css).replace('@@SCRIPT@@',modules.site).replace('@@CONTENT@@',render('en','live',assets)).replace('@@ASSETS@@',JSON.stringify(assets).replaceAll('<','\\u003c'));
 writeFileSync(join(output,'index.html'),html);console.log('Static CyMD showcase generated with content-hashed assets.');
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(import.meta.filename))buildWebsite(process.argv[2]);
