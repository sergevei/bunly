/* Bunly inner pages: menu filters, restaurant search + map sync, careers filters, mailto forms. */
(function(){
const LANG=document.documentElement.lang==='en'?'en':'ru';
const tx=(ru,en)=>LANG==='ru'?ru:en;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function plural(n,a,b,c){ const m10=n%10, m100=n%100; return m10===1&&m100!==11?a:(m10>=2&&m10<=4&&(m100<10||m100>=20)?b:c); }
function toggleChip(b){ const on=b.getAttribute('aria-pressed')!=='true'; b.setAttribute('aria-pressed',String(on)); return on; }

/* ---------- Menu: tag filters (all selected tags must match) ---------- */
const menuWrap=$('.menu-wrap');
if(menuWrap){
  const active=new Set();
  function apply(){ let shown=0;
    $$('.menu-cat').forEach(sec=>{ let n=0; $$('.dish-card',sec).forEach(c=>{ const tags=c.dataset.tags.split(' '); const ok=[...active].every(t=>tags.includes(t)); c.hidden=!ok; if(ok) n++; }); sec.hidden=n===0; shown+=n; });
    $('#menuEmpty').hidden=shown>0; }
  $$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{ toggleChip(b)?active.add(b.dataset.filter):active.delete(b.dataset.filter); apply(); }));
}

/* ---------- Restaurants: features + search + town from the map ---------- */
const restGroups=$('.rest-groups');
if(restGroups){
  const feats=new Set(); let q='', city=-1;
  const NAMES=tx(['Минск','Брест','Гродно','Витебск','Гомель','Могилёв','Барановичи','Бобруйск','Пинск','Орша','Лида','Жлобин','Дзержинск'],['Minsk','Brest','Grodno','Vitebsk','Gomel','Mogilev','Baranovichi','Bobruisk','Pinsk','Orsha','Lida','Zhlobin','Dzerzhinsk']);
  const clear=$('#cityClear');
  function apply(){ let n=0;
    $$('.rest-city').forEach(g=>{ let k=0; $$('.rest-card',g).forEach(c=>{ const f=c.dataset.features.split(' ');
      const ok=(city<0||+c.dataset.city===city)&&[...feats].every(x=>f.includes(x))&&(!q||c.dataset.text.includes(q)); c.hidden=!ok; if(ok) k++; }); g.hidden=k===0; n+=k; });
    $('#restEmpty').hidden=n>0;
    $('#restCount').textContent=tx('Найдено: '+n+' '+plural(n,'ресторан','ресторана','ресторанов'),'Found: '+n+(n===1?' restaurant':' restaurants'));
    clear.hidden=city<0; if(city>=0) clear.textContent=NAMES[city]+' ✕'; }
  $$('[data-feature]').forEach(b=>b.addEventListener('click',()=>{ toggleChip(b)?feats.add(b.dataset.feature):feats.delete(b.dataset.feature); apply(); }));
  $('#restSearch').addEventListener('input',e=>{ q=e.target.value.trim().toLowerCase(); apply(); });
  clear.addEventListener('click',()=>{ city=-1; if(window.BunlyMap) BunlyMap.select(-1); apply(); });
  document.addEventListener('bunly:city',e=>{ city=e.detail.i; apply(); if(city>=0&&matchMedia('(max-width: 960px)').matches){ /* stay on the map on phones */ } });
  apply();
  const go=()=>{ if(window.BunlyMap) BunlyMap.init(); };
  const ready=document.fonts&&document.fonts.ready?Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))]):Promise.resolve();
  ready.then(go);
}

/* ---------- Careers: town + area filters, apply button ---------- */
const jobsEl=$('.jobs');
if(jobsEl){
  const types=new Set(); const sel=$('#jobCity');
  function apply(){ const c=sel.value; let n=0;
    $$('.job').forEach(j=>{ const ok=(!c||j.dataset.cities.split(' ').includes(c))&&(!types.size||types.has(j.dataset.type)); j.hidden=!ok; if(ok) n++; });
    $('#jobEmpty').hidden=n>0; $('#jobCount').textContent=tx(n+' '+plural(n,'вакансия','вакансии','вакансий'),n+(n===1?' position':' positions')); }
  sel.addEventListener('change',apply);
  $$('[data-type]').forEach(b=>b.addEventListener('click',()=>{ toggleChip(b)?types.add(b.dataset.type):types.delete(b.dataset.type); apply(); }));
  $$('[data-apply]').forEach(b=>b.addEventListener('click',()=>{ const f=$('#applyForm'); f.job.value=b.dataset.apply; if(sel.value) f.city.value=sel.value;
    $('#apply').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); setTimeout(()=>f.name.focus({preventScroll:true}),400); }));
  apply();
}

/* ---------- Contacts: ?topic=tour preselects the topic ---------- */
const cf=$('#contactForm');
if(cf){ try{ const t=new URLSearchParams(location.search).get('topic'); if(t&&cf.topic.querySelector('option[value="'+CSS.escape(t)+'"]')) cf.topic.value=t; }catch(e){} }

/* ---------- Forms: validate, then open a pre-filled email ---------- */
$$('form[data-mailto]').forEach(f=>f.addEventListener('submit',e=>{ e.preventDefault(); const st=$('.form-status',f);
  const bad=$$('[required]',f).filter(el=>el.type==='checkbox'?!el.checked:!String(el.value).trim());
  $$('.field, .check',f).forEach(x=>x.classList.remove('invalid')); bad.forEach(el=>el.closest('.field, .check').classList.add('invalid'));
  if(bad.length){ st.textContent=tx('Заполните отмеченные поля.','Please fill in the highlighted fields.'); st.className='form-status err'; bad[0].focus(); return; }
  const lines=$$('.field',f).map(fl=>{ const el=$('input,select,textarea',fl), lab=$('label',fl).textContent.replace('*','').trim();
    const v=el.tagName==='SELECT'?el.options[el.selectedIndex].text:el.value; return el.value?lab+': '+v:''; }).filter(Boolean);
  const href='mailto:'+f.dataset.mailto+'?subject='+encodeURIComponent(f.dataset.subject)+'&body='+encodeURIComponent(lines.join('\n'));
  st.textContent=tx('Открываем почтовое приложение…','Opening your mail app…'); st.className='form-status ok'; location.href=href; }));
})();
