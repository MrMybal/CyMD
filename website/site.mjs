import {render,locales} from './view.mjs';
const assets=JSON.parse(document.getElementById('site-assets').textContent);
let lang=new URL(location.href).searchParams.get('lang')==='fr'?'fr':'en', mode='live', activeImage=0, previousFocus;
const root=document.getElementById('site');
const t=()=>locales[lang];
function paint(focusSelector){
 const scroll=scrollY;
 root.innerHTML=render(lang,mode,assets);
 document.documentElement.lang=lang;
 document.title=t().title;
 document.querySelector('meta[name=description]').content=t().description;
 wire(); if(focusSelector)document.querySelector(focusSelector)?.focus({preventScroll:true});
 window.scrollTo(0,scroll);
}
function shots(){return [...document.querySelectorAll('[data-zoom]')];}
function showImage(index){
 const list=shots();activeImage=(index+list.length)%list.length;
 const source=list[activeImage].querySelector('img'),dialog=document.querySelector('.lightbox');
 dialog.querySelector('img').src=source.src;dialog.querySelector('img').alt=source.alt;
 dialog.querySelector('.lightbox-caption').textContent=source.alt;
 dialog.querySelector('.lightbox-count').textContent=(activeImage+1)+' / '+list.length;
 if(!dialog.open){previousFocus=document.activeElement;dialog.showModal();document.body.classList.add('modal-open');dialog.querySelector('[data-close]').focus();}
}
function setMode(value,focus=true){ mode=value;paint(focus?'[data-mode="'+value+'"]':null); }
function wire(){
 document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{
  lang=b.dataset.lang;const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);paint('[data-lang="'+lang+'"]');
 }));
 document.querySelectorAll('[data-mode]').forEach(b=>{
  b.addEventListener('click',()=>setMode(b.dataset.mode));
  b.addEventListener('keydown',e=>{
   const ids=['live','split','raw','read'];let i=ids.indexOf(mode);
   if(e.key==='ArrowRight')i=(i+1)%4;else if(e.key==='ArrowLeft')i=(i+3)%4;else if(e.key==='Home')i=0;else if(e.key==='End')i=3;else return;
   e.preventDefault();setMode(ids[i]);
  });
 });
 shots().forEach((b,i)=>b.addEventListener('click',()=>showImage(i)));
 const d=document.querySelector('.lightbox');
 d.querySelector('[data-close]').addEventListener('click',()=>d.close());
 d.querySelector('[data-prev]').addEventListener('click',()=>showImage(activeImage-1));
 d.querySelector('[data-next]').addEventListener('click',()=>showImage(activeImage+1));
 d.addEventListener('click',e=>{if(e.target===d)d.close();});
 d.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showImage(activeImage-1);}if(e.key==='ArrowRight'){e.preventDefault();showImage(activeImage+1);}});
 d.addEventListener('close',()=>{document.body.classList.remove('modal-open');previousFocus?.focus({preventScroll:true});});
}
paint();
window.addEventListener('popstate',()=>{lang=new URL(location.href).searchParams.get('lang')==='fr'?'fr':'en';paint();});
