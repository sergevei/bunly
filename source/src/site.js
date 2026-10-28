/* Bunly shared script: language, developer credit, mobile menu, counters, generic tabs, reveal. */
(function(){
const LANG=document.documentElement.lang==='en'?'en':'ru';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOC=LANG==='ru'?'ru-RU':'en-US';
window.BUNLY_LANG=LANG;
/* ---------------- Developer credit (from author.json) ---------------- */
(function(){ let A=null; try{ A=JSON.parse(document.getElementById('author-data').textContent); }catch(e){ return; } if(!A) return;
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safe=u=>/^https:\/\//.test(u||'')?esc(u):'#';
  const tr=o=>o&&typeof o==='object'?(o[LANG]||o.en||''):(o||'');
  const ru=LANG==='ru', ext=' target="_blank" rel="noopener"';
  const links=[];
  if(A.telegram&&A.telegram.url) links.push('<a class="btn devmain" href="'+safe(A.telegram.url)+'"'+ext+'>'+(ru?'Написать в Telegram':'Message on Telegram')+'</a>');
  if(A.portfolio) links.push('<a class="btn devlink" href="'+safe(A.portfolio)+'"'+ext+'>'+(ru?'Портфолио':'Portfolio')+'</a>');
  (A.projects||[]).forEach(p=>{ if(p&&p.name&&p.url) links.push('<a class="btn devlink" href="'+safe(p.url)+'"'+ext+'>'+(ru?'Смотреть ':'See ')+esc(p.name)+'</a>'); });
  const dev=document.getElementById('devCredit');
  if(dev) dev.innerHTML='<div class="dev-mark" aria-hidden="true">'+esc(A.initials||'')+'</div><div><h3>'+(ru?'Дизайн и разработка: ':'Designed and developed by ')+esc(A.name)+'</h3><p>'+esc(tr(A.pitch))+'</p></div><div class="dev-links">'+links.join('')+'</div>';
  const mc=document.getElementById('mCredit');
  if(mc&&A.telegram&&A.telegram.url){ mc.href=A.telegram.url; mc.textContent=(ru?'Сайт сделал ':'Site by ')+(A.handle||A.name); }
})();

/* ---------------- Mobile menu ---------------- */
(function(){ const mnav=document.getElementById('mnav'), closeBtn=document.getElementById('menuClose'); if(!mnav||!closeBtn) return;
const openers=[...document.querySelectorAll('.menu-btn[aria-controls="mnav"]')];
let opener=null; mnav.inert=true;
const isOpen=()=>mnav.classList.contains('open');
function openM(btn){ opener=btn;
  mnav.inert=false; mnav.classList.add('open'); document.documentElement.style.overflow='hidden';
  openers.forEach(b=>b.setAttribute('aria-expanded','true')); setTimeout(()=>closeBtn.focus({preventScroll:true}),60); }
function closeM(returnFocus){ if(!isOpen()) return; mnav.classList.remove('open'); mnav.inert=true; document.documentElement.style.overflow='';
  openers.forEach(b=>b.setAttribute('aria-expanded','false')); if(returnFocus&&opener) opener.focus({preventScroll:true}); }
openers.forEach(b=>b.addEventListener('click',()=>openM(b)));
closeBtn.addEventListener('click',()=>closeM(true));
mnav.addEventListener('click',e=>{ if(e.target.closest('a')) closeM(false); });
addEventListener('keydown',e=>{ if(!isOpen()) return;
  if(e.key==='Escape'){ e.preventDefault(); closeM(true); return; }
  if(e.key==='Tab'){ const f=[...mnav.querySelectorAll('a[href],button')].filter(el=>el.offsetParent!==null), first=f[0], last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); } } });
addEventListener('resize',()=>{ if(innerWidth>760) closeM(false); });


})();
/* ---------------- Counters ---------------- */
document.querySelectorAll('[data-count]').forEach(el=>{
  new IntersectionObserver((es,o)=>{ if(!es[0].isIntersecting) return; o.disconnect(); const end=+el.dataset.count, suf=el.dataset.suffix||'', t0=performance.now();
    (function st(n){ const p=reduced?1:Math.min(1,(n-t0)/1400); const v=Math.round(end*(1-Math.pow(1-p,3))); el.innerHTML=v.toLocaleString(LOC)+(suf?'<small>'+suf.trim()+'</small>':''); if(p<1) requestAnimationFrame(st); })(t0); },{threshold:.4}).observe(el); });


/* ---------------- Generic tabs: [data-tabs] > [role=tab][aria-controls] ---------------- */
document.querySelectorAll('[data-tabs]').forEach(list=>{ const btns=[...list.querySelectorAll('[role=tab]')];
  function sel(b){ btns.forEach(x=>{ const on=x===b; x.setAttribute('aria-selected',String(on)); x.tabIndex=on?0:-1; const p=document.getElementById(x.getAttribute('aria-controls')); if(p) p.hidden=!on; }); }
  btns.forEach((b,i)=>{ b.addEventListener('click',()=>sel(b)); b.addEventListener('keydown',e=>{ if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ e.preventDefault(); const n=btns[(i+(e.key==='ArrowRight'?1:-1)+btns.length)%btns.length]; n.focus(); sel(n); } }); }); });

/* ---------------- Reveal on scroll ---------------- */
if(!reduced&&'IntersectionObserver' in window){ const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }),{rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el)); } else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));
})();
