import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {render,locales} from '../website/view.mjs';
import {createDocumentation,parseLink,hasAnchor} from 'cydoc';
const root=resolve('output/pages'), html=readFileSync(join(root,'index.html'),'utf8');
const assets=JSON.parse(html.match(/<script type="application\/json" id="site-assets">([\s\S]*?)<\/script>/)[1]);
const docs=createDocumentation(JSON.parse(readFileSync(join(root,'Documentation/DocData/manifest.json'),'utf8')));
function shape(value){if(Array.isArray(value))return value.map(shape);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,shape(v)]));return typeof value;}
assert.deepEqual(shape(locales.en),shape(locales.fr),'Locale schemas must match');
let links=0;
for(const lang of ['en','fr']) for(const mode of ['live','split','raw','read']){
 const markup=render(lang,mode,assets), ids=new Set([...markup.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
 assert.equal(ids.size,[...markup.matchAll(/\bid="([^"]+)"/g)].length,'Duplicate IDs');
 for(const [,raw] of markup.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const value=raw.replaceAll('&amp;','&');links++;
  if(/^https:/.test(value)){assert.ok(value.startsWith('https://github.com/MrMybal/CyMD'),'Unexpected external destination');continue;}
  if(value.startsWith('#')){assert.ok(ids.has(value.slice(1)),value);continue;}
  if(value.startsWith('?'))continue;
  const url=new URL(value,'https://example.test/CyMD/');
  assert.ok(url.pathname.startsWith('/CyMD/'));
  assert.ok(existsSync(join(root,url.pathname.slice('/CyMD/'.length))),value);
  if(value.includes('Documentation.html#')){
   const route=parseLink(url.hash),found=docs.resolve(route.pageId,route.locale);
   assert.equal(route.locale,lang);assert.ok(found&&!found.fallback,value);
   if(route.anchor)assert.ok(hasAnchor(found.page,route.anchor),value);
  }
 }
 assert.match(markup,new RegExp('aria-selected="true" tabindex="0" data-mode="'+mode+'"'));
 assert.ok(!/\bundefined\b|@@[A-Z]+@@/.test(markup));
 assert.equal((markup.match(/<h1>/g)||[]).length,1);
}
for(const name of readdirSync(join(root,'site-assets'))){
 const m=name.match(/\.([a-f0-9]{12})\.[^.]+$/);assert.ok(m,name);
 assert.equal(createHash('sha256').update(readFileSync(join(root,'site-assets',name))).digest('hex').slice(0,12),m[1],name);
 if(name.endsWith('.js'))for(const [,dep] of readFileSync(join(root,'site-assets',name),'utf8').matchAll(/from ['"](\.\/[^'"]+)['"]/g))assert.ok(existsSync(join(root,'site-assets',dep)),dep);
}
assert.match(html,/<html lang="en">/);assert.ok(existsSync(join(root,'editor.html')));
assert.equal(readFileSync(join(root,'editor.html'),'utf8'),readFileSync('dist/index.html','utf8'),'Editor bundle preserved');
for(const [,file] of html.matchAll(/(?:src|href)="(\.\/site-assets\/[^"]+)"/g))assert.ok(existsSync(join(root,file)));
console.log('Showcase: EN/FR, four view panels, '+links+' references, hashed assets and original web editor verified.');
