import { locales } from './content.mjs';
export { locales };
const repo='https://github.com/MrMybal/CyMD';
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chapterIds=['views','writing','media','files','workspace','documentation','download'];
export function render(lang='en', mode='live', assets={}) {
 const t=locales[lang], doc=route=>'./Documentation/Documentation.html#/'+lang+'/'+route;
 const img=name=>assets[name+'-'+lang+'.jpg'] || './site-assets/'+name+'-'+lang+'.jpg';
 const figure=(name,alt,caption='',cls='')=>'<figure class="'+cls+'"><button class="shot" data-zoom aria-label="'+esc(t.expand+': '+alt)+'"><img src="'+img(name)+'" alt="'+esc(alt)+'" loading="lazy" decoding="async" width="1280" height="'+(['source','tools','search','light','manual'].includes(name)?720:850)+'"></button>'+(caption?'<figcaption>'+esc(caption)+'<span aria-hidden="true">↗</span></figcaption>':'')+'</figure>';
 const link=(url,label,cls='text-link')=>'<a class="'+cls+'" href="'+url+'">'+esc(label)+' <span aria-hidden="true">↗</span></a>';
 const m=t.modes.find(m=>m.id===mode)||t.modes[0];
 return `
 <a class="skip" href="#main">${t.skip}</a>
 <header class="site-header"><div class="header-inner">
  <a class="brand" href="?lang=${lang}" aria-label="CyMD"><img src="${assets['logo.png']||'./logo.png'}" width="35" height="35" alt=""><span>Cy<span class="accent">MD</span></span></a>
  <nav class="primary" aria-label="${lang==='fr'?'Navigation principale':'Main navigation'}"><a href="#views">${t.nav[0]}</a><a href="#writing">${t.nav[1]}</a><a href="${doc('overview')}">${t.nav[2]} ↗</a><a class="mobile-only" href="#download">${t.nav[3]} ↓</a></nav>
  <div class="header-actions"><div class="languages" role="group" aria-label="${t.language}"><button data-lang="en" lang="en" aria-pressed="${lang==='en'}">EN</button><button data-lang="fr" lang="fr" aria-pressed="${lang==='fr'}">FR</button></div>
  <a class="github" href="${repo}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.82.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.39.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>GitHub <span aria-hidden="true">↗</span></a>
  <a class="button small header-download" href="#download">${t.nav[3]} ↓</a></div>
 </div></header>
 <main id="main">
 <section class="hero wrap" id="top">
  <div class="hero-copy"><p class="eyebrow">${t.status}</p><h1>Cy<span>MD</span><span class="period">.</span></h1><h2>${t.intro}</h2><p class="hero-summary">${t.summary}</p>
  <div class="hero-buttons"><a class="button" href="#download">↓ ${t.download}</a><a class="button secondary" href="./editor.html">${t.try} ↗</a></div><p class="platforms">${t.platforms} <span>· AGPL v3.0</span></p></div>
  <div class="hero-visual"><div class="image-title"><span><i></i><i></i><i></i></span><span>${t.heroCaption}</span><span aria-hidden="true">↗</span></div>
   <button class="shot hero-shot" data-zoom aria-label="${esc(t.expand+': '+t.modes[0].alt)}"><img fetchpriority="high" src="${img('live')}" width="1280" height="850" alt="${esc(t.modes[0].alt)}"></button>
  </div>
 </section>
 <div class="word-strip wrap"><span>${t.strip[0]}</span>${t.strip.slice(1).map(s=>'<span>'+s+'</span>').join('')}</div>
 <nav class="chapters" aria-label="${lang==='fr'?'Chapitres de la page':'Page chapters'}"><div class="wrap">${chapterIds.map((id,i)=>'<a href="#'+id+'"><span>0'+(i+1)+'</span>'+t.chapters[i]+'</a>').join('')}</div></nav>
 <section class="section wrap" id="views"><div class="section-intro"><p class="eyebrow">${t.modesLabel}</p><h2>${t.modesTitle}</h2><p>${t.modesIntro}</p></div>
 <div class="view-tabs" role="tablist" aria-label="${lang==='fr'?'Vues de CyMD':'CyMD views'}">${t.modes.map((v,i)=>'<button role="tab" id="tab-'+v.id+'" aria-controls="view-panel" aria-selected="'+(m.id===v.id)+'" tabindex="'+(m.id===v.id?0:-1)+'" data-mode="'+v.id+'"><span>0'+(i+1)+'</span>'+v.name+'<kbd>Ctrl+'+(i+1)+'</kbd></button>').join('')}</div>
 <div class="view-panel" id="view-panel" role="tabpanel" aria-labelledby="tab-${m.id}"><div><span class="mode-number">0${t.modes.indexOf(m)+1} / 04</span><h3>${m.title}</h3><p>${m.text}</p><ul class="feature-list">${m.tags.map(s=>'<li>'+s+'</li>').join('')}</ul>${link(doc(m.doc),t.guide)}</div>${figure(m.image,m.alt)}</div><p class="image-note">${t.photoNote}</p>
 </section>
 <section class="section band" id="writing"><div class="wrap"><div class="section-intro"><p class="eyebrow">${t.toolsLabel}</p><h2>${t.toolsTitle}</h2><p>${t.toolsIntro}</p></div><div class="tool-grid">${t.tools.map(v=>'<article>'+figure(v.image,v.alt)+'<div class="tool-copy"><span class="shortcut">'+v.detail+'</span><h3>'+v.title+'</h3><p>'+v.text+'</p></div></article>').join('')}</div></div></section>
 <section class="section wrap feature-row" id="media"><div class="feature-copy"><p class="eyebrow">${t.mediaLabel}</p><h2>${t.mediaTitle}</h2><p>${t.mediaText}</p><ul class="feature-list">${t.mediaList.map(s=>'<li>'+s+'</li>').join('')}</ul>${link(doc('media'),t.guide)}<p class="fine">${t.mediaFine}</p></div>${figure('live',t.mediaAlt)}</section>
 <section class="section files-section" id="files"><div class="wrap"><div class="section-intro"><p class="eyebrow">${t.filesLabel}</p><h2>${t.filesTitle}</h2><p>${t.filesIntro}</p></div><div class="format-grid">${t.formats.map((f,i)=>'<article class="format"><span class="file-extension">'+f.extension+'</span><h3>'+f.title+'</h3><p>'+f.text+'</p><ul class="feature-list">'+f.items.map(s=>'<li>'+s+'</li>').join('')+'</ul></article>').join('')}</div>
 <div class="file-diagram" role="img" aria-label="${t.diagramLabel}"><span><b>#</b>${t.diagram[0]}</span><span class="plus" aria-hidden="true">+</span><span><b>▧</b>${t.diagram[1]}</span><span class="arrow" aria-hidden="true">→</span><span class="bundle"><b>CY</b>${t.diagram[2]}</span></div>${link(doc('documents/formats'),t.guide)}</div></section>
 <section class="section wrap" id="workspace"><div class="feature-row reverse"><div class="feature-copy"><p class="eyebrow">${t.comfortLabel}</p><h2>${t.comfortTitle}</h2><p>${t.comfortText}</p><ul class="feature-list">${t.comfortList.map(s=>'<li>'+s+'</li>').join('')}</ul>${link(doc('shortcuts'),t.guide)}</div>${figure('light',t.lightAlt,t.lightCaption)}</div></section>
 <section class="section band" id="documentation"><div class="wrap feature-row"><div class="feature-copy"><p class="eyebrow">${t.docsLabel}</p><h2>${t.docsTitle}</h2><p>${t.docsText}</p><p class="fine">${t.docsNote}</p><div class="stacked-links">${link(doc('overview'),t.docsButton,'button')}${link('./CyMD-help.zip',t.offline)}</div></div>${figure('manual',t.docsAlt)}</div></section>
 <section class="plugin wrap"><span class="code-mark" aria-hidden="true">&lt; / &gt;</span><div><p class="eyebrow">${t.pluginLabel}</p><h3>${t.pluginTitle}</h3><p>${t.pluginText}</p><div class="inline-links">${link(doc('integration'),t.pluginLink)}${link(repo+'/releases/latest/download/CyMD-plugin.zip',t.pluginDownload)}</div></div></section>
 <section class="section wrap faq"><h2>${t.faqTitle}</h2><div>${t.faq.map(([q,a])=>'<details><summary>'+q+'<span aria-hidden="true">+</span></summary><p>'+a+'</p></details>').join('')}</div></section>
 <section class="section download-section" id="download"><div class="wrap"><div class="download-intro"><div><p class="eyebrow">${t.downloadsLabel}</p><h2>${t.downloadsTitle}</h2><p>${t.downloadsText}</p></div>${link('./editor.html',t.try,'button secondary')}</div>
 <div class="downloads"><article><span class="os-mark" aria-hidden="true">⊞</span><h3>Windows</h3><p>${t.windowsDetail}</p>${link(repo+'/releases/download/v0.1.5/CyMD-Setup-0.1.5-x64.exe',t.installer+' .exe','download-link')}${link(repo+'/releases/download/v0.1.5/CyMD-Portable-0.1.5-x64.exe',t.portable+' .exe','download-link')}</article>
 <article><span class="os-mark" aria-hidden="true">⌘</span><h3>macOS</h3><p>${t.macDetail}</p>${link(repo+'/releases/download/v0.1.5/CyMD-0.1.5-macOS-universal.dmg','DMG','download-link')}${link(repo+'/releases/download/v0.1.5/CyMD-0.1.5-macOS-universal.zip','ZIP','download-link')}</article>
 <article><span class="os-mark linux-mark" aria-hidden="true">/</span><h3>Linux</h3><p>${t.linuxDetail}</p>${link(repo+'/releases/download/v0.1.5/CyMD-0.1.5-Linux-x86_64.AppImage','AppImage','download-link')}${link(repo+'/releases/download/v0.1.5/CyMD-0.1.5-Linux-amd64.deb','DEB','download-link')}</article></div><p class="fine release-note">${t.releaseNote}</p>${link(repo+'/releases',t.release)}</div></section>
 </main><footer class="wrap"><div><a class="brand" href="#top">Cy<span class="accent">MD</span></a><p>${t.footer}</p></div><nav aria-label="${lang==='fr'?'Pied de page':'Footer'}">${link(doc('overview'),t.nav[2])}${link(repo,t.source)}${link('./LICENSE.txt',t.license)}${link('#top',t.top)}</nav><span class="copyright">© 2026 Cyberalien</span></footer>
 <dialog class="lightbox" aria-label="${t.expand}"><div class="lightbox-bar"><p class="lightbox-caption"></p><button data-close aria-label="${t.close}">${t.close} <kbd>Esc</kbd> ×</button></div><img alt=""><div class="lightbox-nav"><button data-prev aria-label="${t.previous}">←</button><span class="lightbox-count"></span><button data-next aria-label="${t.next}">→</button></div></dialog>`;
}
