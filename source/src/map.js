/* Bunly 3D restaurant map: shared by the home page and the restaurants page. Needs three.js (r128). */
(function(){
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const LANG=document.documentElement.lang==='en'?'en':'ru';
function plural(n,a,b,c){ const m10=n%10, m100=n%100; return m10===1&&m100!==11?a:(m10>=2&&m10<=4&&(m100<10||m100>=20)?b:c); }
const I={
 en:{truck:'truck',hq:n=>'Head office \u00b7 '+n+' restaurants',km:k=>k+' km from Minsk',rest:n=>n+(n>1?' restaurants':' restaurant'),stop:'food truck stop'},
 ru:{truck:'фудтрак',hq:n=>'Главный офис \u00b7 '+n+' '+plural(n,'ресторан','ресторана','ресторанов'),km:k=>k+' км от Минска',rest:n=>n+' '+plural(n,'ресторан','ресторана','ресторанов'),stop:'стоянка фудтрака'},
}[LANG];
/* ---------------- Map list ---------------- */
const CITIES=[['Minsk',27.56,53.90,1,15],['Brest',23.69,52.10,0,2],['Grodno',23.83,53.68,0,2],['Vitebsk',30.20,55.19,0,2],['Gomel',30.98,52.44,0,2],['Mogilev',30.33,53.90,0,2],['Baranovichi',26.01,53.13,0,1],['Bobruisk',29.22,53.14,0,1],['Pinsk',26.07,52.12,0,1],['Orsha',30.40,54.51,0,1],['Lida',25.30,53.89,0,1],['Zhlobin',30.02,52.89,0,0],['Dzerzhinsk',27.14,53.68,0,1]];
if(LANG==='ru') ['Минск','Брест','Гродно','Витебск','Гомель','Могилёв','Барановичи','Бобруйск','Пинск','Орша','Лида','Жлобин','Дзержинск'].forEach((n,i)=>CITIES[i][0]=n);
const cityList=document.getElementById('cityList'); if(!cityList) return;
cityList.innerHTML=CITIES.map((c,i)=>'<li><button type="button" data-i="'+i+'" class="'+(c[3]?'hq':'')+'" aria-pressed="false">'+c[0]+'<small>'+(c[4]?c[4]:I.truck)+'</small></button></li>').join('');
let mapHover=-1, mapPin=-1;
let lastPin=-2;
function mapSync(){ const i=mapPin>=0?mapPin:mapHover; if(mapPin!==lastPin){ lastPin=mapPin; document.dispatchEvent(new CustomEvent('bunly:city',{detail:{i:mapPin}})); } if(window.__map) window.__map.highlight(i,mapPin>=0); cityList.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.i===mapPin))); }
function mapSelect(i){ mapPin=mapPin===i?-1:i; mapSync(); }
const cIdx=e=>{ const b=e.target.closest('button[data-i]'); return b?+b.dataset.i:null; };
cityList.addEventListener('mouseover',e=>{ const i=cIdx(e); if(i!==null&&i!==mapHover){ mapHover=i; mapSync(); } });
cityList.addEventListener('mouseleave',()=>{ mapHover=-1; mapSync(); });
cityList.addEventListener('focusin',e=>{ const i=cIdx(e); if(i!==null){ mapHover=i; mapSync(); } });
cityList.addEventListener('focusout',()=>{ mapHover=-1; mapSync(); });
cityList.addEventListener('click',e=>{ const i=cIdx(e); if(i!==null) mapSelect(i); });
document.getElementById('restaurants').addEventListener('keydown',e=>{ if(e.key==='Escape'&&mapPin>=0){ mapPin=-1; mapSync(); } });



/* ---------------- Restaurants map: 3D ---------------- */
const BY_DOTS="1r|v.2.u|u.6.2.1.o|t.b.n|p.f.3.4.g|o.g.1.6.g|n.r.d|m.r.e|m.s.d|n.q.e|n.r.d|k.u.d|k.u.d|i.v.e|i.v.e|h.x.d|i.x.c|h.x.d|h.z.b|h.z.b|e.2.2.z.a|b.17.9|c.18.7|3.1g.8|4.1f.8|4.1j.4|4.1j.4|4.1k.3|5.1k.2|5.1j.3|6.1c.1.4.4|5.1b.4.1.6|6.1a.b|6.1a.b|6.1c.9|6.1b.a|4.1e.9|2.1g.9|2.1g.9|1.1h.9|3.1g.8|4.1c.b|5.19.d|4.8.7.u.e|4.5.e.p.f|3.4.j.l.g|6.1.k.1.1.9.1.9.f|t.1.5.1.3.8.g|14.1.5.2.f|1a.1.g";
let started_=false;
function initMap(){ if(started_||typeof THREE==='undefined') return; started_=true;
  const sec=document.getElementById('restaurants'), stageEl=sec.querySelector('.map-stage'), cv=document.getElementById('mapCanvas'), labelsEl=document.getElementById('mapLabels');
  const r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true}); r.setPixelRatio(Math.min(devicePixelRatio,2)); r.setClearColor(0x000000,0);
  const s=new THREE.Scene(); s.fog=new THREE.Fog(0xffffff,44,100);
  const cam=new THREE.PerspectiveCamera(30,1,.1,300);
  s.add(new THREE.HemisphereLight(0xffffff,0xA89E90,.9)); const dl=new THREE.DirectionalLight(0xffffff,.45); dl.position.set(-12,30,18); s.add(dl);
  const K=4.2, KX=Math.cos(53.6*Math.PI/180)*K;
  const proj=(lon,lat)=>new THREE.Vector3((lon-28)*KX,0,-(lat-53.6)*K);
  const land=[];
  BY_DOTS.split('|').forEach((row,ri)=>{ const lat=56.2-ri*.1, off=(ri%2)*.08; let c=0, isL=false;
    row.split('.').forEach(run=>{ const n=parseInt(run,36); if(isL) for(let k=0;k<n;k++) land.push(proj(23+off+(c+k)*.16,lat)); c+=n; isL=!isL; }); });
  const HQ=proj(CITIES[0][1],CITIES[0][2]); const dHQ=land.map(p=>p.distanceTo(HQ)); const maxD=Math.max(...dHQ);
  const landMesh=new THREE.InstancedMesh(new THREE.CylinderGeometry(.13,.13,.1,6),new THREE.MeshLambertMaterial({color:0xffffff}),land.length); s.add(landMesh);
  const dum=new THREE.Object3D(); const jit=land.map(()=>Math.random()*.12-.06);
  const ringMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false});
  const rgs=new THREE.Group(); rgs.position.set(HQ.x,-.06,HQ.z); s.add(rgs);
  for(let k=1;k<=6;k++){ const g=new THREE.Mesh(new THREE.RingGeometry(k*2.6-.03,k*2.6+.03,128),ringMat); g.rotation.x=-Math.PI/2; rgs.add(g); }
  const sweep=new THREE.Mesh(new THREE.CircleGeometry(16,64,0,.5),new THREE.MeshBasicMaterial({color:0xE5412D,transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false})); sweep.rotation.x=-Math.PI/2; rgs.add(sweep);
  const BR=0xE5412D, pillarGeo=new THREE.CylinderGeometry(.1,.1,1,10); pillarGeo.translate(0,.5,0);
  const pillarMat=new THREE.MeshLambertMaterial({color:BR,emissive:0x5A1008}), truckMat=new THREE.MeshLambertMaterial({color:0xFFC531,emissive:0x5A3A00}), ringG=new THREE.RingGeometry(.24,.36,32);
  const toR=Math.PI/180;
  const km=(a,b)=>{ const dLa=(b[2]-a[2])*toR, dLo=(b[1]-a[1])*toR; const x=Math.sin(dLa/2)**2+Math.cos(a[2]*toR)*Math.cos(b[2]*toR)*Math.sin(dLo/2)**2; return Math.round(6371*2*Math.asin(Math.sqrt(x))/5)*5; };
  const order=CITIES.map((c,i)=>i).slice(1).sort((a,b)=>proj(CITIES[a][1],CITIES[a][2]).distanceTo(HQ)-proj(CITIES[b][1],CITIES[b][2]).distanceTo(HQ));
  const cities=CITIES.map((c,i)=>{ const pos=proj(c[1],c[2]), hq=i===0, tk=!c[4];
    const pillar=new THREE.Mesh(pillarGeo,tk?truckMat:pillarMat); pillar.position.copy(pos); pillar.scale.set(hq?1.6:1,.001,hq?1.6:1); s.add(pillar);
    const ringM=new THREE.MeshBasicMaterial({color:tk?0xFFB23E:BR,transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false}); const ring=new THREE.Mesh(ringG,ringM); ring.rotation.x=-Math.PI/2; ring.position.set(pos.x,.08,pos.z); s.add(ring);
    const o={i,pos,hq,pillar,ring,ringM,height:hq?4.4:tk?.7:1+c[4]*.45,km:km(CITIES[0],c),delay:hq?.4:1.3+order.indexOf(i)*.09};
    if(!hq){ const a=HQ.clone().setY(.15), b=pos.clone().setY(.15), d=a.distanceTo(b), mid=a.clone().add(b).multiplyScalar(.5); mid.y=.8+d*.3;
      o.curve=new THREE.QuadraticBezierCurve3(a,mid,b); o.arcMat=new THREE.MeshBasicMaterial({color:tk?0xFFB23E:BR,transparent:true,opacity:.4,depthWrite:false});
      o.arcGeo=new THREE.TubeGeometry(o.curve,60,.04,6,false); o.arcCount=o.arcGeo.index.count; o.arcGeo.setDrawRange(0,0); s.add(new THREE.Mesh(o.arcGeo,o.arcMat));
      o.pulse=new THREE.Mesh(new THREE.SphereGeometry(.14,10,8),new THREE.MeshBasicMaterial({color:tk?0xFFB23E:BR})); o.pulse.visible=false; s.add(o.pulse);
      o.phase=Math.random(); o.dir=Math.random()<.5?1:-1; o.speed=.18+Math.random()*.08; }
    return o; });
  const labels=cities.map(c=>{ const b=document.createElement('button'); b.type='button'; b.tabIndex=-1; b.className='mlabel'+(c.hq?' hq':''); b.innerHTML='<span></span>';
    b.addEventListener('click',()=>mapSelect(c.i)); b.addEventListener('mouseenter',()=>{ mapHover=c.i; mapSync(); }); b.addEventListener('mouseleave',()=>{ mapHover=-1; mapSync(); });
    labelsEl.appendChild(b); return b; });
  let hi=-1, pinned=false;
  function relabel(){ cities.forEach((c,i)=>{ const chip=i===hi||(c.hq&&hi<0); const C=CITIES[i];
    const sub=c.hq?I.hq(C[4]):(I.km(c.km)+' \u00b7 '+(C[4]?I.rest(C[4]):I.stop));
    labels[i].querySelector('span').innerHTML=chip?C[0]+'<small>'+sub+'</small>':C[0];
    labels[i].classList.toggle('chip',chip); labels[i].classList.toggle('dim',hi>=0&&!chip); }); }
  function theme(){ const cs=getComputedStyle(document.documentElement), bgc=new THREE.Color(cs.getPropertyValue('--bg').trim()||'#FBF6EE'), ink=new THREE.Color(cs.getPropertyValue('--ink').trim()||'#231A15');
    const dark=bgc.r+bgc.g+bgc.b<1.2; s.fog.color.copy(bgc); const base=bgc.clone().lerp(ink,dark?.3:.2), c=new THREE.Color();
    land.forEach((p,i)=>{ c.copy(base).offsetHSL(0,0,jit[i]*(dark?.6:.35)); landMesh.setColorAt(i,c); }); landMesh.instanceColor.needsUpdate=true; ringMat.color.copy(ink); ringMat.opacity=dark?.1:.07; }
  theme(); matchMedia('(prefers-color-scheme: dark)').addEventListener('change',theme);
  const look=new THREE.Vector3(), lookT=new THREE.Vector3(), off=new THREE.Vector3(), offT=new THREE.Vector3();
  const BASE_LOOK=new THREE.Vector3(0,0,.6), BASE_OFF=new THREE.Vector3(4,37,32); look.copy(BASE_LOOK); off.copy(BASE_OFF);
  let W=1,H=1,fit=1;
  function size(){ W=stageEl.clientWidth; H=stageEl.clientHeight; r.setSize(W,H,false); cam.aspect=W/H; fit=cam.aspect<1.25?Math.min(1.5,1.05/cam.aspect):1; s.fog.near=44*fit; s.fog.far=100*fit;
    labelsEl.classList.toggle('compact',W<600); if(W>960) cam.setViewOffset(W,H,-W*.19,0,W,H); else cam.clearViewOffset(); cam.updateProjectionMatrix(); }
  size(); addEventListener('resize',size);
  let tx=0,ty=0,px=0,py=0;
  stageEl.addEventListener('pointermove',e=>{ const b=stageEl.getBoundingClientRect(); tx=(e.clientX-b.left)/b.width*2-1; ty=(e.clientY-b.top)/b.height*2-1; });
  stageEl.addEventListener('pointerleave',()=>{ tx=0; ty=0; });
  cv.addEventListener('click',()=>{ if(mapPin>=0){ mapPin=-1; mapSync(); } });
  window.__map={highlight(i,pin){ hi=i; pinned=pin; relabel(); }}; relabel(); mapSync();
  let on=false, started=false, rev=0, t=0, lt=performance.now();
  new IntersectionObserver(es=>{ on=es[0].isIntersecting; if(on&&es[0].intersectionRatio>.2) started=true; },{threshold:[0,.2,.5]}).observe(sec);
  if(reduced){ started=true; rev=99; }
  const ease=x=>1-Math.pow(1-x,3), cl=x=>x<0?0:x>1?1:x, pv2=new THREE.Vector3();
  (function loop(n){ requestAnimationFrame(loop); const dt=Math.min(.05,(n-lt)/1000); lt=n; if(!on) return;
    if(started&&!reduced){ rev+=dt; t+=dt; }
    const waveR=((t%8)/8)*maxD*1.25;
    for(let i=0;i<land.length;i++){ const p=land[i], k=ease(cl((rev-dHQ[i]/maxD*1.3)/.55)), w=reduced?0:Math.exp(-((dHQ[i]-waveR)**2)/1.2)*.22;
      dum.position.set(p.x,-1.2*(1-k)+w,p.z); dum.scale.set(Math.max(.001,k),1+w*4,Math.max(.001,k)); dum.updateMatrix(); landMesh.setMatrixAt(i,dum.matrix); }
    landMesh.instanceMatrix.needsUpdate=true; rgs.rotation.y=reduced?0:-t*.35; sweep.visible=!reduced;
    cities.forEach(c=>{ const g=ease(cl((rev-c.delay)/.7)), act=hi===c.i, faded=hi>=0&&!act&&!c.hq;
      c.pillar.scale.y+=((c.height*(act?1.8:1)*g||.001)-c.pillar.scale.y)*(reduced?1:Math.min(1,dt*8));
      const ph=(t*.8+c.i*.13)%1; c.ring.scale.setScalar(Math.max(.001,g*(reduced?1:1+ph*(c.hq?2.6:1.4)))); c.ringM.opacity=(reduced?.5:.75*(1-ph))*(faded?.3:1);
      if(c.curve){ const a=cl((rev-c.delay)/.9); c.arcGeo.setDrawRange(0,Math.floor(c.arcCount*ease(a)/3)*3);
        const tgo=act?.95:(hi>=0?.08:.38); c.arcMat.opacity+=(tgo-c.arcMat.opacity)*(reduced?1:Math.min(1,dt*6));
        c.pulse.visible=a>=1&&!reduced&&!faded; if(c.pulse.visible){ let q=(t*c.speed*(act?2:1)+c.phase)%1; if(c.dir<0) q=1-q; c.curve.getPoint(q,c.pulse.position); c.pulse.scale.setScalar(act?1.35:1); } } });
    const focus=hi>=0&&pinned?cities[hi]:null; lookT.copy(focus?focus.pos:BASE_LOOK); offT.copy(BASE_OFF).multiplyScalar((focus?.55:1)*fit);
    const kk=reduced?1:1-Math.exp(-dt*2.4); look.lerp(lookT,kk); off.lerp(offT,kk);
    px+=(tx-px)*(reduced?1:Math.min(1,dt*3)); py+=(ty-py)*(reduced?1:Math.min(1,dt*3));
    const ang=(reduced?0:Math.sin(t*.06)*.14)+px*.12, cx=off.x*Math.cos(ang)-off.z*Math.sin(ang), cz=off.x*Math.sin(ang)+off.z*Math.cos(ang);
    cam.position.set(look.x+cx,look.y+off.y-py*1.5,look.z+cz); cam.lookAt(look); r.render(s,cam);
    cities.forEach((c,i)=>{ pv2.copy(c.pos); pv2.y=c.pillar.scale.y+.12; pv2.project(cam); labels[i].style.transform='translate('+((pv2.x+1)/2*W).toFixed(1)+'px,'+((1-pv2.y)/2*H).toFixed(1)+'px)'; labels[i].classList.toggle('on',rev>c.delay+.5); });
  })(performance.now());
}

window.BunlyMap={init:initMap,select(i){ mapPin=i; mapSync(); }};
})();
