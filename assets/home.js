
(function(){
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mq=matchMedia('(max-width: 760px)');
let carousel=mq.matches; document.documentElement.classList.toggle('is-carousel',carousel);

/* ---------------- Language ---------------- */
const LANG=document.documentElement.lang==='en'?'en':'ru', LOC=LANG==='ru'?'ru-RU':'en-US';
const I={
 en:{of:' of ',goStop:'Go to stop ',soundOn:'Turn ambient sound on',soundOff:'Turn ambient sound off',slide:'slide',show:'Show ',add:'Add to order',cur:'BYN',pause:'Pause autoplay',play:'Start autoplay',inc:'Included',notInc:'Not included',review:'Review ',showRev:'Show review ',stars:'5 out of 5',truck:'truck',fail:'The 3D tour could not load. Scroll down for everything else.',
   hq:n=>'Head office \u00b7 '+n+' restaurants',km:k=>k+' km from Minsk',rest:n=>n+(n>1?' restaurants':' restaurant'),stop:'food truck stop'},
 ru:{of:' из ',goStop:'Перейти к остановке ',soundOn:'Включить фоновый звук',soundOff:'Выключить фоновый звук',slide:'слайд',show:'Показать: ',add:'В заказ',cur:'руб.',pause:'Остановить автопрокрутку',play:'Запустить автопрокрутку',inc:'Включено',notInc:'Не включено',review:'Отзыв ',showRev:'Показать отзыв ',stars:'5 из 5',truck:'фудтрак',fail:'3D-тур не загрузился. Листайте ниже, там всё остальное.',
   hq:n=>'Главный офис \u00b7 '+n+' '+plural(n,'ресторан','ресторана','ресторанов'),km:k=>k+' км от Минска',rest:n=>n+' '+plural(n,'ресторан','ресторана','ресторанов'),stop:'стоянка фудтрака'},
}[LANG];
function plural(n,a,b,c){ const m10=n%10, m100=n%100; return m10===1&&m100!==11?a:(m10>=2&&m10<=4&&(m100<10||m100>=20)?b:c); }

/* ---------------- Tour content ---------------- */
const CAMS=[{t:[1,1,-1],fs:38},{t:[46,1,-3],fs:38},{t:[81,1,-2],fs:27},{t:[122,2,-3],fs:40},{t:[167,1,0],fs:38},{t:[203,2,-1],fs:36},{t:[242,1,-3],fs:36}];
const SCENE_TXT={
 en:[
 {name:'Fields',title:'It starts in local fields',text:'Potatoes, grain, dairy and beef come from farms across the country, so most of what you eat travels less than a day.',facts:[['Partner farms','60+'],['Local ingredients','85%'],['Field to kitchen','Under 24 h']]},
 {name:'Bakery',title:'We bake our own buns',text:'Buns, sauces and pies are made in our own production, tested in our lab and delivered chilled to every restaurant before sunrise.',facts:[['Buns a day','120,000'],['Checks per batch','14'],['Deliveries','Every morning']]},
 {name:'Kitchen',title:'An open kitchen you can visit',text:'Every burger is built to order in about two minutes. Book a free tour and see the grill, fryers and assembly line up close.',facts:[['Build time','About 2 min'],['Fries','Cut fresh daily'],['Kitchen tours','Free, weekends']]},
 {name:'Restaurant',title:'Breakfast, lunch and dinner',text:'Thirty-one restaurants with dine-in, takeaway and drive-thru. Breakfast runs until 10:00, lunch combos from 12:00 to 16:00.',facts:[['Restaurants','31'],['Drive-thru','12 locations'],['Breakfast','Until 10:00']]},
 {name:'Delivery',title:'Order in the app, eat at home',text:'Pick your meal, apply this month\u2019s coupon and watch the courier on the map until the bag is at your door.',facts:[['Average delivery','28 min'],['Coupons','New every month'],['Phones','iOS, Android, Huawei']]},
 {name:'Night',title:'Hungry at 2 a.m.? We\u2019re open',text:'Nine restaurants never close. After 23:00 the night menu keeps the favourites hot, and late couriers ride until 3:00.',facts:[['Night menu','23:00 to 06:00'],['Open 24/7','9 restaurants'],['Late delivery','Until 3:00']]},
 {name:'On wheels',title:'Bunly on wheels',text:'Our food truck tours smaller towns all summer and comes to festivals, with Kids Boxes, toys and the full combo menu.',facts:[['Towns visited','40+ this year'],['Kids Box','With a toy'],['Events','Book the truck']]},
 ],
 ru:[
 {name:'Поля',title:'Всё начинается в местных полях',text:'Картофель, зерно, молоко и говядина приезжают с белорусских ферм, поэтому почти всё, что вы едите, в пути меньше суток.',facts:[['Фермы-партнёры','60+'],['Местные продукты','85%'],['С поля на кухню','До 24 ч']]},
 {name:'Пекарня',title:'Булочки печём сами',text:'Булочки, соусы и пирожки делаем на своём производстве, проверяем в лаборатории и до рассвета развозим по всем ресторанам.',facts:[['Булочек в день','120 000'],['Проверок на партию','14'],['Доставка','Каждое утро']]},
 {name:'Кухня',title:'Открытая кухня, в которую можно зайти',text:'Каждый бургер собирают под заказ примерно за две минуты. Запишитесь на бесплатную экскурсию и посмотрите на гриль и фритюр вблизи.',facts:[['Сборка','Около 2 мин'],['Картофель','Режем каждый день'],['Экскурсии','Бесплатно, в выходные']]},
 {name:'Ресторан',title:'Завтрак, обед и ужин',text:'Тридцать один ресторан: в зале, навынос и в драйве. Завтраки до 10:00, обеденные комбо с 12:00 до 16:00.',facts:[['Ресторанов','31'],['Драйв','12 адресов'],['Завтраки','До 10:00']]},
 {name:'Доставка',title:'Закажите в приложении, ешьте дома',text:'Выберите блюда, примените купон месяца и следите за курьером на карте, пока пакет не окажется у вашей двери.',facts:[['Средняя доставка','28 мин'],['Купоны','Новые каждый месяц'],['Телефоны','iOS, Android, Huawei']]},
 {name:'Ночь',title:'Голодны в два часа ночи? Мы открыты',text:'Девять ресторанов работают круглосуточно. После 23:00 действует ночное меню, а курьеры ездят до 3:00.',facts:[['Ночное меню','23:00–06:00'],['Круглосуточно','9 ресторанов'],['Поздняя доставка','До 3:00']]},
 {name:'На колёсах',title:'Bunly на колёсах',text:'Летом наш фудтрак ездит по небольшим городам и приезжает на фестивали: с Kids Box, игрушками и полным меню комбо.',facts:[['Городов','40+ за год'],['Kids Box','С игрушкой'],['События','Закажите фудтрак']]},
 ]}[LANG];
const SCENES=SCENE_TXT.map((s,i)=>Object.assign({cam:CAMS[i]},s));
const HS_POS=[[0,[-8,1.2,-3]],[0,[8,1.4,-7]],[1,[44,8.6,-6]],[1,[31,5.2,-6]],[2,[76,2.4,-5]],[2,[74.4,2.4,2.2]],[3,[133,2.4,-2]],[3,[105.5,3.2,2.4]],[4,[155,11,-4]],[4,[170,2,0]],[5,[200,7,-1]],[5,[208,1.6,5]],[6,[234.6,2.6,-1.6]],[6,[249,3.6,4]]];
const HS_TXT={
 en:[['Local potatoes','Fries are cut from potatoes harvested a few hours\u2019 drive from our kitchens.'],['Grain for our buns','Regional wheat is milled into flour and baked into buns every night.'],['Own bakery','Buns are baked overnight and reach every restaurant by breakfast.'],['Quality lab','Each batch is checked on 14 points, from bun colour to patty weight, before it ships.'],['Two-sided grill','Patties cook on both sides at once, so every one comes out the same.'],['Kitchen tours','Families and school groups can book a free tour and build their own burger.'],['Drive-thru','Order at the speaker and pick up at the window in about three minutes.'],['Summer terrace','Outdoor seating with free Wi-Fi and phone charging.'],['Bunly app','Save favourites, use coupons and pay in two taps.'],['Live tracking','See the courier on the map from the kitchen to your door.'],['Night menu','A shorter menu from 23:00 that keeps the favourites hot and fast.'],['Late couriers','Delivery runs until 3:00 in the biggest cities.'],['Food truck','Comes to towns without a restaurant and to festivals on request.'],['Kids Box','A smaller meal with a toy from the current collection.']],
 ru:[['Местный картофель','Картошку фри режем из клубней, выращенных в паре часов езды от наших кухонь.'],['Зерно для булочек','Пшеницу из соседних областей мелют в муку и каждую ночь превращают в булочки.'],['Своя пекарня','Булочки пекут ночью, и к завтраку они уже в каждом ресторане.'],['Лаборатория качества','Каждую партию проверяют по 14 пунктам, от цвета булочки до веса котлеты.'],['Двусторонний гриль','Котлеты жарятся сразу с двух сторон, поэтому все получаются одинаковыми.'],['Экскурсии на кухню','Семьи и школьные классы могут бесплатно прийти и собрать свой бургер.'],['Драйв','Заказ у микрофона, выдача в окне примерно через три минуты.'],['Летняя терраса','Столики на улице, бесплатный Wi-Fi и зарядка для телефона.'],['Приложение Bunly','Любимые блюда, купоны и оплата в два касания.'],['Курьер на карте','Видно, где курьер, от кухни до вашей двери.'],['Ночное меню','С 23:00 короткое меню, в котором есть все хиты.'],['Ночные курьеры','В крупных городах доставка работает до 3:00.'],['Фудтрак','Приезжает в города без ресторана и на фестивали по заявке.'],['Kids Box','Детский обед с игрушкой из текущей коллекции.']]}[LANG];
const HOTSPOTS=HS_POS.map(([s,p],i)=>({s,p,t:HS_TXT[i][0],x:HS_TXT[i][1]}));
const N=SCENES.length;


/* ---------------- Overlay UI ---------------- */
const card=document.getElementById('card'), nav=document.getElementById('sceneNav');
SCENES.forEach((s,i)=>{ const b=document.createElement('button'); b.innerHTML=(i+1)+'<span class="nm">'+s.name+'</span>'; b.setAttribute('aria-label',I.goStop+(i+1)+': '+s.name); b.addEventListener('click',()=>goScene(i)); nav.appendChild(b); });
let shown=-1;
function renderCard(i){ const s=SCENES[i];
  document.getElementById('cardStep').textContent=(i+1)+I.of+N+' \u00b7 '+s.name;
  document.getElementById('cardTitle').textContent=s.title; document.getElementById('cardText').textContent=s.text;
  document.getElementById('cardFacts').innerHTML=s.facts.map(([k,v])=>'<dt>'+k+'</dt><dd>'+v+'</dd>').join(''); card.classList.remove('out'); }
function setCard(i){ if(i===shown) return; const first=shown<0; shown=i;
  [...nav.children].forEach((b,k)=>b.setAttribute('aria-current',k===i?'true':'false')); closeTip();
  if(first||reduced){ renderCard(i); return; } card.classList.add('out'); setTimeout(()=>renderCard(shown),220); }
let mobileIndex=0;
function goScene(i){ i=Math.max(0,Math.min(N-1,i)); if(carousel){ mobileIndex=i; document.getElementById('swipeHint').classList.add('gone'); return; }
  const j=document.getElementById('journey'); scrollTo({top:j.offsetTop+(i/(N-1))*(j.offsetHeight-innerHeight),behavior:reduced?'auto':'smooth'}); }
const tip=document.getElementById('tip'); let tipI=-1;
function closeTip(){ tip.hidden=true; tipI=-1; }
document.getElementById('stage').addEventListener('click',e=>{ if(!e.target.closest('.hot')&&!e.target.closest('.tip')) closeTip(); });
addEventListener('keydown',e=>{ if(e.key==='Escape'&&tipI>=0) closeTip(); });
const overlay=document.getElementById('overlay');
const hotEls=HOTSPOTS.map((h,i)=>{ const b=document.createElement('button'); b.className='hot hidden'; b.setAttribute('aria-label',h.t);
  b.addEventListener('click',e=>{ e.stopPropagation(); if(tipI===i){closeTip();return;} tipI=i; document.getElementById('tipTitle').textContent=h.t; document.getElementById('tipText').textContent=h.x; tip.hidden=false; });
  overlay.insertBefore(b,tip); return b; });

let audio=null; const soundBtn=document.getElementById('soundBtn');
soundBtn.addEventListener('click',()=>{
  if(!audio){ const C=window.AudioContext||window.webkitAudioContext; if(!C) return; const ctx=new C(), g=ctx.createGain(); g.gain.value=0; g.connect(ctx.destination);
    [220,277.2,329.6,440].forEach((f,i)=>{ const o=ctx.createOscillator(); o.type='sine'; o.frequency.value=f; const og=ctx.createGain(); og.gain.value=.05/(i+1); o.connect(og).connect(g); o.start(); }); audio={ctx,g,on:false}; }
  audio.on=!audio.on; audio.ctx.resume(); audio.g.gain.setTargetAtTime(audio.on?.3:0,audio.ctx.currentTime,.5);
  soundBtn.setAttribute('aria-pressed',String(audio.on)); soundBtn.setAttribute('aria-label',audio.on?I.soundOff:I.soundOn);
  document.getElementById('wave').setAttribute('d',audio.on?'M16 9a4 4 0 010 6M19 6a8 8 0 010 12':'M17 9l4 6M21 9l-4 6'); });

/* ---------------- Marquee + counters ---------------- */
const partners=LANG==='ru'?['Зелёная долина','Неманский молочник','Северная мельница','Старый дуб','Солнечная несушка','Ягодный край','Липовый мёд','Чистая вода','Поле и камень','Корни Полесья']:['Green Valley Farms','Neman Dairy Co.','Northmill Grain','Old Oak Beef','Sunny Hen Eggs','Berry Lane','Linden Honey','Clearwater Drinks','Field & Stone','Polesie Roots'];
document.getElementById('mtrack').innerHTML=[...partners,...partners].map((n,i)=>'<span'+(i>=partners.length?' aria-hidden="true"':'')+'><i></i>'+n+'</span>').join('');

/* ---------------- Tabs ---------------- */
(function(){ const btns=[...document.querySelectorAll('#menu [role=tab]')];
  function sel(b){ btns.forEach(x=>{ const on=x===b; x.setAttribute('aria-selected',String(on)); x.tabIndex=on?0:-1; document.getElementById(x.getAttribute('aria-controls')).hidden=!on; }); }
  btns.forEach((b,i)=>{ b.addEventListener('click',()=>sel(b)); b.addEventListener('keydown',e=>{ if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ e.preventDefault(); const n=btns[(i+(e.key==='ArrowRight'?1:-1)+btns.length)%btns.length]; n.focus(); sel(n); } }); }); })();

/* ---------------- Motion slider ---------------- */
const sesame=(cx,cy)=>'<ellipse cx="'+cx+'" cy="'+cy+'" rx="7" ry="3.6" fill="#FFF3D6" transform="rotate('+((cx*7)%50-25)+' '+cx+' '+cy+')"/>';
const ART={
 burger:'<svg viewBox="0 0 400 400" aria-hidden="true"><g class="float"><ellipse cx="200" cy="352" rx="140" ry="14" fill="rgba(35,26,21,.14)"/><path d="M78 296h244q0 44-40 44H118q-40 0-40-44z" fill="#E08E35"/><rect x="62" y="252" width="276" height="44" rx="22" fill="#5E321C"/><path d="M68 248h264l-16 30-22-12-26 24-26-20-28 26-28-24-26 20-24-22-22 16z" fill="#FFC531"/><rect x="62" y="206" width="276" height="44" rx="22" fill="#6B3B22"/><path d="M58 206q22-20 44 0t44 0t44 0t44 0t44 0t44 0t40 0v10H58z" fill="#7CC35A"/><rect x="74" y="186" width="252" height="18" rx="9" fill="#E5412D"/><path d="M70 188q0-128 130-128t130 128z" fill="#F0A845"/><path d="M112 140q28-52 92-56" stroke="#FFD58A" stroke-width="12" stroke-linecap="round" fill="none"/>'+[[150,100],[200,88],[250,104],[175,130],[230,135],[275,150],[125,150],[200,160]].map(p=>sesame(...p)).join('')+'</g></svg>',
 fries:'<svg viewBox="0 0 400 400" aria-hidden="true"><g class="float"><ellipse cx="200" cy="356" rx="110" ry="12" fill="rgba(35,26,21,.14)"/>'+[[120,90,-10],[145,70,-5],[170,60,-2],[195,50,2],[220,62,5],[245,72,8],[270,92,12],[160,100,-3],[210,95,3],[255,110,9],[135,120,-8]].map(([x,y,r])=>'<rect x="'+x+'" y="'+y+'" width="20" height="150" rx="6" fill="#FFC531" stroke="#E9A72B" stroke-width="3" transform="rotate('+r+' '+(x+10)+' 220)"/>').join('')+'<path d="M102 190h196l-26 160H128z" fill="#E5412D"/><path d="M102 190q98 40 196 0" fill="#C7311F"/><circle cx="200" cy="268" r="34" fill="#fff"/><path d="M180 266a20 15 0 0 1 40 0z" fill="#FFC531"/><rect x="179" y="270" width="42" height="5" rx="2.5" fill="#E5412D"/><path d="M182 279h36a7 7 0 0 1-7 7h-22a7 7 0 0 1-7-7z" fill="#FFC531"/></g></svg>',
 nuggets:'<svg viewBox="0 0 400 400" aria-hidden="true"><g class="float"><ellipse cx="200" cy="356" rx="130" ry="12" fill="rgba(35,26,21,.14)"/><path d="M80 200h240l-22 146H102z" fill="#FFC531"/>'+[[130,180,34,26],[180,165,36,27],[232,172,34,25],[275,190,30,24],[155,205,34,25],[210,200,36,26],[255,212,30,23]].map(([x,y,a,b])=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+a+'" ry="'+b+'" fill="#E39A45"/><ellipse cx="'+(x-8)+'" cy="'+(y-7)+'" rx="'+a*.45+'" ry="'+b*.3+'" fill="#F3BC6B"/>').join('')+'<path d="M80 220h240l-3 20H83z" fill="#E5412D"/><path d="M100 262h200" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-dasharray="2 24"/><ellipse cx="320" cy="300" rx="44" ry="14" fill="#fff"/><path d="M276 300v28q44 18 88 0v-28" fill="#fff"/><ellipse cx="320" cy="300" rx="38" ry="10" fill="#C7311F"/></g></svg>',
 sundae:'<svg viewBox="0 0 400 400" aria-hidden="true"><g class="float"><ellipse cx="200" cy="358" rx="90" ry="11" fill="rgba(35,26,21,.14)"/><path d="M118 210h164l-26 140H144z" fill="rgba(255,255,255,.7)" stroke="#fff" stroke-width="4"/><ellipse cx="200" cy="214" rx="96" ry="30" fill="#FFF6EA"/><ellipse cx="200" cy="180" rx="78" ry="28" fill="#FFF6EA"/><ellipse cx="200" cy="148" rx="58" ry="24" fill="#FFF6EA"/><ellipse cx="200" cy="120" rx="36" ry="20" fill="#FFF6EA"/><path d="M196 96q12-30 6-40" stroke="#FFF6EA" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M126 196q20 30 34 0q14 40 30 0q16 34 32 0q14 42 30 0q16 26 26 0q-10-30-76-40q-66 8-76 40z" fill="#E5412D"/><path d="M200 70c-18-4-30 10-24 26 8 18 28 22 40 6 10-14 2-30-16-32z" fill="#E5412D"/><path d="M190 64l10-14 10 14" stroke="#3FA34D" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="192" cy="82" r="2.6" fill="#FFE07A"/><circle cx="204" cy="90" r="2.6" fill="#FFE07A"/></g></svg>',
 coffee:'<svg viewBox="0 0 400 400" aria-hidden="true"><g class="float"><ellipse cx="200" cy="356" rx="96" ry="12" fill="rgba(35,26,21,.16)"/><path d="M130 120h140l-18 230H148z" fill="#FFFFFF"/><path d="M137 200h126l-7 84H144z" fill="#E5412D"/><circle cx="200" cy="242" r="22" fill="#fff"/><path d="M188 240a12 9 0 0 1 24 0z" fill="#FFC531"/><rect x="186" y="243" width="28" height="4" rx="2" fill="#E5412D"/><rect x="118" y="104" width="164" height="22" rx="8" fill="#5E321C"/><rect x="132" y="90" width="136" height="18" rx="8" fill="#7A4628"/><path d="M170 76q-16-20 0-40t0-40" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"/><path d="M215 76q-16-20 0-40" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".6"/></g></svg>',
 pie:'<svg viewBox="0 0 400 400" aria-hidden="true"><g class="float"><ellipse cx="200" cy="330" rx="140" ry="13" fill="rgba(35,26,21,.14)"/><g transform="rotate(-8 200 230)"><rect x="70" y="170" width="260" height="130" rx="40" fill="#E9A54B"/><rect x="70" y="170" width="260" height="110" rx="40" fill="#F3BC6B"/>'+[110,160,210,260].map(x=>'<path d="M'+x+' 205l26 40" stroke="#B43A2A" stroke-width="14" stroke-linecap="round"/><path d="M'+x+' 205l26 40" stroke="#E5412D" stroke-width="7" stroke-linecap="round"/>').join('')+'</g><circle cx="300" cy="128" r="26" fill="#C7311F"/><circle cx="262" cy="140" r="24" fill="#E5412D"/><path d="M300 102q-10-40-30-52M262 116q4-36 8-66" stroke="#3FA34D" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="292" cy="120" r="6" fill="#fff" opacity=".5"/></g></svg>',
};
const DISHES_TXT={
 en:[['Signature','Homestead Double','Two beef patties, aged cheddar, pickles and our house sauce on a bun baked last night.'],['Local potatoes','Golden Fries','Cut from local potatoes every morning, fried crisp and salted just right.'],['Share box','Crispy Chicken Box','Twenty nuggets and strips for the table, with two sauces of your choice.'],['Dessert','Strawberry Swirl','Soft-serve made with local milk, under a thick strawberry topping.'],['Bunly Café','Morning Latte','Double espresso and steamed local milk, from the café counter.'],['Baked here','Cherry Pie','Flaky pastry from our own bakery, filled with sour cherries.']],
 ru:[['Фирменный','Деревенский Дабл','Две говяжьи котлеты, выдержанный чеддер, огурчики и фирменный соус на булочке, испечённой этой ночью.'],['Местный картофель','Золотая фри','Режем из белорусского картофеля каждое утро, жарим до хруста и солим в меру.'],['На компанию','Чикен-бокс','Двадцать наггетсов и стрипсов на весь стол и два соуса на выбор.'],['Десерт','Клубничный вихрь','Мягкое мороженое на местном молоке под густым клубничным топпингом.'],['Bunly Кафе','Утренний латте','Двойной эспрессо и вспененное местное молоко из кофейного уголка.'],['Своя выпечка','Вишнёвый пирожок','Слоёное тесто из нашей пекарни и кислая вишня внутри.']]}[LANG];
const DISHES=[['burger','8.90','#FFD66B','#FFB23E'],['fries','2.90','#FFE7A8','#FF8A5B'],['nuggets','12.40','#FFCDB8','#FF7A59'],['sundae','2.50','#FFD7E2','#FF8FB3'],['coffee','3.20','#EBD9C5','#C99A6B'],['pie','1.90','#FBD0C6','#F27560']].map(([k,pr,c1,c2],i)=>({k,p:LANG==='ru'?pr.replace('.',','):pr,c1,c2,tag:DISHES_TXT[i][0],name:DISHES_TXT[i][1],d:DISHES_TXT[i][2]}));

const mTrack=document.getElementById('mTrack'), mProg=document.getElementById('mProg');
mTrack.innerHTML=DISHES.map((d,i)=>'<figure class="mslide" role="group" aria-roledescription="slide" aria-label="'+(i+1)+I.of+DISHES.length+': '+d.name+'" style="--c1:'+d.c1+';--c2:'+d.c2+'"><div class="txt"><span class="tag">'+d.tag+'</span><h3>'+d.name+'</h3><p>'+d.d+'</p><div class="price"><b>'+d.p+' '+I.cur+'</b><a class="btn" href="#app" tabindex="-1">'+I.add+'</a></div></div><div class="art">'+ART[d.k]+'</div><span class="big" aria-hidden="true">0'+(i+1)+'</span></figure>').join('');
mProg.innerHTML=DISHES.map((d,i)=>'<button aria-label="'+I.show+d.name+'"><span><i></i></span></button>').join('');
document.getElementById('mAll').textContent=String(DISHES.length).padStart(2,'0');
const slides=[...mTrack.children], bars=[...mProg.children];
let mIdx=0, playing=!reduced, mT=0, mLast=performance.now(), hoverPause=false, mVisible=false;
const AUTOPLAY=5200;
function slideLeft(i){ return slides[i].offsetLeft-slides[0].offsetLeft; }
function mGo(i,user){ i=(i+slides.length)%slides.length; mTrack.scrollTo({left:slideLeft(i),behavior:reduced?'auto':'smooth'}); setM(i); mT=0; }
function setM(i){ if(i===mIdx&&slides[i].classList.contains('is-active')) return; mIdx=i; slides.forEach((s,k)=>{ s.classList.toggle('is-active',k===i); s.querySelector('a').tabIndex=k===i?0:-1; });
  bars.forEach((b,k)=>{ b.classList.toggle('done',k<i); b.setAttribute('aria-current',String(k===i)); if(k!==i) b.querySelector('i').style.width=k<i?'100%':'0'; });
  document.getElementById('mNow').textContent=String(i+1).padStart(2,'0'); }
setM(0);
bars.forEach((b,i)=>b.addEventListener('click',()=>mGo(i,true)));
document.getElementById('mPrev').addEventListener('click',()=>mGo(mIdx-1,true));
document.getElementById('mNext').addEventListener('click',()=>mGo(mIdx+1,true));
mTrack.addEventListener('keydown',e=>{ if(e.key==='ArrowRight'){e.preventDefault();mGo(mIdx+1,true);} if(e.key==='ArrowLeft'){e.preventDefault();mGo(mIdx-1,true);} });
const playBtn=document.getElementById('mPlay');
function setPlay(p){ playing=p; playBtn.setAttribute('aria-pressed',String(p)); playBtn.setAttribute('aria-label',p?I.pause:I.play); document.getElementById('mPlayIc').setAttribute('d',p?'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z':'M8 5l11 7-11 7z'); }
setPlay(playing); playBtn.addEventListener('click',()=>setPlay(!playing));
['mouseenter','focusin'].forEach(ev=>mTrack.addEventListener(ev,()=>hoverPause=true));
['mouseleave','focusout'].forEach(ev=>mTrack.addEventListener(ev,()=>hoverPause=false));
new IntersectionObserver(es=>{ mVisible=es[0].isIntersecting; }).observe(mTrack);
let scrollRaf=0;
mTrack.addEventListener('scroll',()=>{ if(scrollRaf) return; scrollRaf=requestAnimationFrame(()=>{ scrollRaf=0; const sl=mTrack.scrollLeft, w=slides[0].offsetWidth+22; let best=0,bd=1e9;
  slides.forEach((s,k)=>{ const o=(slideLeft(k)-sl)/w; s.style.setProperty('--o',Math.max(-1.5,Math.min(1.5,o)).toFixed(3)); s.style.setProperty('--gx',(70-o*30).toFixed(1)+'%'); if(Math.abs(o)<bd){bd=Math.abs(o);best=k;} });
  if(best!==mIdx){ setM(best); mT=0; } }); },{passive:true});
(function tick(n){ requestAnimationFrame(tick); const dt=n-mLast; mLast=n; if(!playing||hoverPause||!mVisible||reduced) return; mT+=dt; const p=Math.min(1,mT/AUTOPLAY); bars[mIdx].querySelector('i').style.width=(p*100)+'%'; if(p>=1) mGo(mIdx+1); })(performance.now());

/* ---------------- Pricing ---------------- */
const sw=document.getElementById('billing');
sw.addEventListener('click',()=>{ const y=sw.getAttribute('aria-checked')!=='true'; sw.setAttribute('aria-checked',String(y));
  document.getElementById('lblM').classList.toggle('on',!y); document.getElementById('lblY').classList.toggle('on',y);
  document.querySelectorAll('.amt').forEach(a=>{ a.classList.add('flip'); setTimeout(()=>{ const s=a.querySelector('[data-p]'); s.textContent=y?s.dataset.year:s.dataset.month; a.classList.remove('flip'); },reduced?0:180); });
  document.querySelectorAll('.per').forEach(p=>p.textContent=y?p.dataset.perYear:p.dataset.perMonth); });
const Y='<span class="yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2"><path d="M6 12l4 4 8-8"/></svg></span><span class="sr">'+I.inc+'</span>';
const X='<span class="no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M7 7l10 10M17 7L7 17"/></svg></span><span class="sr">'+I.notInc+'</span>';
const CMP=LANG==='ru'?[['Купоны в приложении каждый месяц',1,1,1],['Баллы за 1 руб.','1','2','2'],['Бесплатная доставка от 15 руб.',0,1,1],['Напиток в подарок каждый день',0,1,'на 4 человек'],['Новинки раньше всех',0,1,1],['Kids Box каждую неделю',0,0,1],['Экскурсия на кухню для семьи',0,0,1],['Участников в аккаунте','1','1','4']]
 :[['Monthly app coupons',1,1,1],['Points per 1 BYN','1','2','2'],['Free delivery over 15 BYN',0,1,1],['Free daily drink',0,1,'4 people'],['Early access to new items',0,1,1],['Weekly Kids Box',0,0,1],['Family kitchen tour',0,0,1],['Members on account','1','1','4']];

document.getElementById('cmpBody').innerHTML=CMP.map(r=>'<tr><th scope="row">'+r[0]+'</th>'+r.slice(1).map((v,i)=>'<td'+(i===1?' class="hlc"':'')+'>'+(v===1?Y:v===0?X:'<b>'+v+'</b>')+'</td>').join('')+'</tr>').join('');

/* ---------------- Reviews ---------------- */
const REV=LANG==='ru'?[
 ['Картошка здесь правда пахнет картошкой. Дети после бассейна каждый раз просят заехать.','Ганна','Мама двоих детей, Минск','#E5412D'],
 ['Водил свой класс на экскурсию на кухню. Двадцать четыре девятилетки собрали бургеры, и никто не заплакал. Маленькое чудо.','Павел','Учитель, Гродно','#3FA34D'],
 ['Смена заканчивается в 1:30, а драйв всегда открыт. Ночной дабл — моя награда за день.','Оксана','Медсестра, Гомель','#7C4DFF'],
 ['В приложении видел, как курьер едет через Двину. Еда приехала горячей через 24 минуты.','Дмитрий','Студент, Витебск','#F08A24'],
 ['Фудтрак приехал на наш городской праздник. Самая длинная очередь за день, и она того стоила.','Лена','Организатор праздников, Пинск','#00A3A3'],
 ['Plus окупается одним бесплатным кофе. Завтрак перед работой стал привычкой.','Иван','Инженер, Брест','#C7311F'],
]:[
 ['The fries actually taste like potatoes. My kids ask to stop here after every swimming lesson.','Hanna','Mom of two, Minsk','#E5412D'],
 ['I did the kitchen tour with my class. Twenty-four nine-year-olds built burgers and nobody cried. Small miracle.','Pavel','Teacher, Grodno','#3FA34D'],
 ['Night shift ends at 1:30 and the drive-thru is always open. The Midnight Double is my reward.','Oksana','Nurse, Gomel','#7C4DFF'],
 ['The app showed the courier riding across the river. Food arrived hot in 24 minutes.','Dmitri','Student, Vitebsk','#F08A24'],
 ['The food truck came to our town festival. Longest queue of the day, and worth it.','Lena','Event organiser, Pinsk','#00A3A3'],
 ['Plus pays for itself with the free coffee alone. Breakfast before work is now a habit.','Ivan','Engineer, Brest','#C7311F'],
];

const rTrack=document.getElementById('rTrack'), rDots=document.getElementById('rDots');
rTrack.innerHTML=REV.map(([q,n,r,c],i)=>'<figure class="rcard" aria-label="'+I.review+(i+1)+I.of+REV.length+'"><div class="stars" aria-label="'+I.stars+'">★★★★★</div><blockquote>'+(LANG==='ru'?'\u00ab'+q+'\u00bb':'\u201c'+q+'\u201d')+'</blockquote><figcaption><span class="av" style="background:'+c+'" aria-hidden="true">'+n[0]+'</span><span><b>'+n+'</b>'+r+'</span></figcaption></figure>').join('');
const rCards=[...rTrack.children];
rDots.innerHTML=rCards.map((c,i)=>'<button aria-label="'+I.showRev+(i+1)+'"></button>').join('');
const rDotEls=[...rDots.children]; let rIdx=0;
function rGo(i){ i=Math.max(0,Math.min(rCards.length-1,i)); rTrack.scrollTo({left:rCards[i].offsetLeft-rCards[0].offsetLeft,behavior:reduced?'auto':'smooth'}); }
rDotEls.forEach((d,i)=>d.addEventListener('click',()=>rGo(i)));
document.getElementById('rPrev').addEventListener('click',()=>rGo(rIdx-1));
document.getElementById('rNext').addEventListener('click',()=>rGo(rIdx+1));
rTrack.addEventListener('keydown',e=>{ if(e.key==='ArrowRight'){e.preventDefault();rGo(rIdx+1);} if(e.key==='ArrowLeft'){e.preventDefault();rGo(rIdx-1);} });
function rSync(){ const sl=rTrack.scrollLeft; let best=0,bd=1e9; rCards.forEach((c,k)=>{ const d=Math.abs(c.offsetLeft-rCards[0].offsetLeft-sl); if(d<bd){bd=d;best=k;} }); rIdx=best; rDotEls.forEach((d,k)=>d.setAttribute('aria-current',String(k===best))); }
rTrack.addEventListener('scroll',()=>requestAnimationFrame(rSync),{passive:true}); rSync();

/* ---------------- FAQ ---------------- */
const FAQ=LANG==='ru'?[
 ['Откуда ваши продукты?','Большая часть — от белорусских ферм и производителей: картофель, мука, молоко, яйца и говядина. Булочки, соусы и пирожки каждую ночь делает наша пекарня.'],
 ['До скольки подают завтраки?','Завтраки — до 10:00 во всех ресторанах. Обеденные комбо — с 12:00 до 16:00, ночное меню — с 23:00 в круглосуточных ресторанах.'],
 ['Как быстро доставка?','В среднем 28 минут. В приложении курьер виден на карте, так что вы всегда знаете, когда ждать пакет.'],
 ['Можно записаться на экскурсию на кухню?','Да. По выходным экскурсии бесплатны для семей и школьных классов. Запишитесь в приложении в разделе «Рестораны».'],
 ['Может ли фудтрак приехать на наш праздник?','Летом фудтрак ездит по небольшим городам, его можно заказать на фестиваль или большое событие. Оставьте заявку в чате приложения.'],
 ['Есть ли что-то при аллергии или диете?','У каждого блюда в приложении указаны аллергены. Есть растительная котлета, а большинство бургеров можно заказать без булочки.'],
]:[
 ['Where do your ingredients come from?','Most come from farms and producers inside the country: potatoes, flour, dairy, eggs and beef. Our own bakery makes the buns, sauces and pies every night.'],
 ['Until when is breakfast served?','Breakfast is served until 10:00 in every restaurant. Lunch combos run from 12:00 to 16:00, and the night menu starts at 23:00 in 24/7 locations.'],
 ['How fast is delivery?','The average delivery takes 28 minutes. The app shows the courier live on the map so you always know when to expect the bag.'],
 ['Can I book a kitchen tour?','Yes. Tours are free on weekends for families and school groups. Book a slot in the app under Restaurants.'],
 ['Can the food truck come to our event?','The truck tours smaller towns in summer and can be booked for festivals and large events. Send a request through the app chat.'],
 ['Is there something for allergies or diets?','Every item in the app lists its allergens. There is a plant-based patty, and most burgers can be ordered without the bun.'],
];

document.getElementById('faqList').innerHTML=FAQ.map(([q,a])=>'<details><summary>'+q+'<i aria-hidden="true"></i></summary><div class="ans">'+a+'</div></details>').join('');


if(typeof THREE==='undefined'){ document.getElementById('loader').textContent=I.fail; setCard(0); return; }

/* ---------------- 3D world: setup ---------------- */
const canvas=document.getElementById('world');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
const DAY=new THREE.Color(0xF6EFE4), DUSK=new THREE.Color(0x1C1638);
const camera=new THREE.OrthographicCamera(-1,1,1,-1,-500,1000);
const DIR=new THREE.Vector3(1,.92,1).normalize(), RIGHT=new THREE.Vector3(1,0,-1).normalize();
const hemi=new THREE.HemisphereLight(0xffffff,0xD8CDBE,.85); scene.add(hemi);
const sun=new THREE.DirectionalLight(0xFFF6EA,.62); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); sun.shadow.bias=-.0008; sun.shadow.normalBias=.02; scene.add(sun,sun.target);
const SUN=new THREE.Vector3(-30,60,24);
const L=(c,o={})=>new THREE.MeshLambertMaterial(Object.assign({color:c},o));
const M={white:L(0xffffff),wall:L(0xFBF6EE),cream:L(0xFFF1D9),ground:L(0xEEEADF),brand:L(0xE5412D),brandD:L(0xC7311F),sun:L(0xFFC531),leaf:L(0x3FA34D),
  dark:L(0x3A322D),ink:L(0x231A15),grey:L(0xD6CFC4),steel:L(0xC9CED6),wood:L(0xB07A4F),trunk:L(0x9C7556),soil:L(0x9C7A57),soilD:L(0x86664A),potato:L(0x7FB35E,{flatShading:true}),
  wheat:L(0xF1D27A),wheat2:L(0xE3BC55),tree:L(0x9FCB8A,{flatShading:true}),tree2:L(0x7DB86A,{flatShading:true}),grass:L(0xDCEBC9),
  bun:L(0xE9A54B),bunTop:L(0xF0AE52),patty:L(0x6B3B22),lettuce:L(0x7CC35A,{flatShading:true}),tomato:L(0xE5412D),cheese:L(0xFFC531),brick:L(0xB45F45),glass:L(0x3B3F4E)};
const winMat=L(0xBFD3E6,{emissive:0xFFC56B,emissiveIntensity:0});
const lampMat=L(0xFFF4D6,{emissive:0xFFD27A,emissiveIntensity:.05});
const tickers=[];
const geo={}; const bg=(w,h,d)=>geo[w+'_'+h+'_'+d]||(geo[w+'_'+h+'_'+d]=new THREE.BoxGeometry(w,h,d));
function box(w,h,d,m,x,y,z,p,ns){ const me=new THREE.Mesh(bg(w,h,d),m); me.position.set(x,y,z); if(!ns) me.castShadow=true; me.receiveShadow=true; (p||scene).add(me); return me; }
function mesh(g,m,x,y,z,p,ns){ const me=new THREE.Mesh(g,m); me.position.set(x,y,z); if(!ns) me.castShadow=true; me.receiveShadow=true; (p||scene).add(me); return me; }
function tex(draw,w=512,h=256){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.anisotropy=4; return t; }
function rr(x,X,Y,W,H,R){ x.beginPath(); x.moveTo(X+R,Y); x.arcTo(X+W,Y,X+W,Y+H,R); x.arcTo(X+W,Y+H,X,Y+H,R); x.arcTo(X,Y+H,X,Y,R); x.arcTo(X,Y,X+W,Y,R); x.closePath(); }
const F=LANG==='ru'?'700 {s}px Rubik, Manrope, Arial, sans-serif':'700 {s}px "Bricolage Grotesque", Manrope, Arial, sans-serif';
const TX=(en,ru)=>LANG==='ru'?ru:en;
function fitText(x,text,max,start){ let s=start; x.font=F.replace('{s}',s); while(x.measureText(text).width>max&&s>10){ s-=2; x.font=F.replace('{s}',s); } return s; }
function signTex(text,bgc='#E5412D',fg='#fff',w=512,h=128){ return tex((x)=>{ x.fillStyle=bgc; rr(x,0,0,w,h,Math.min(h*.3,40)); x.fill(); x.fillStyle=fg; fitText(x,text,w*.82,h*.5); x.textAlign='center'; x.textBaseline='middle'; x.fillText(text,w/2,h/2+3); },w,h); }
function plane(w,h,t,x,y,z,ry=0,p,basic){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),basic?new THREE.MeshBasicMaterial({map:t,transparent:true}):new THREE.MeshLambertMaterial({map:t,transparent:true})); m.position.set(x,y,z); m.rotation.y=ry; (p||scene).add(m); return m; }
const dm=new THREE.Object3D();
function inst(g,m,list,shadow){ const im=new THREE.InstancedMesh(g,m,list.length); list.forEach((q,i)=>{ dm.position.set(q[0],q[1],q[2]); dm.rotation.set(0,q[6]||0,0); dm.scale.set(q[3]||1,q[4]||1,q[5]||1); dm.updateMatrix(); im.setMatrixAt(i,dm.matrix); }); im.castShadow=!!shadow; im.receiveShadow=true; scene.add(im); return im; }
function windows(x,z,w,d,h,floors){ for(let f=0;f<floors;f++){ const y=1.6+f*(h-1)/floors; for(let i=-w/2+1;i<w/2-.5;i+=1.6) box(.9,.8,.06,winMat,x+i,y,z+d/2+.04,null,true); for(let i=-d/2+1;i<d/2-.5;i+=1.6) box(.06,.8,.9,winMat,x+w/2+.04,y,z+i,null,true); } }
function roofProps(x,z,w,d,h){ const y=h+.4, n=1+Math.floor(Math.random()*2);
  for(let i=0;i<n;i++){ const ax=x+(Math.random()-.5)*(w-2), az=z+(Math.random()-.5)*(d-2); box(1,.7,.8,M.grey,ax,y+.35,az); box(.6,.08,.6,M.dark,ax,y+.74,az,null,true); } }
function building(x,z,w,d,h,m=M.wall,floors=0,stripe,noDoor){ box(w,h,d,m,x,h/2,z); box(w+.3,.4,d+.3,M.grey,x,h+.2,z); if(stripe) box(w+.05,.5,d+.05,stripe,x,h-.6,z); roofProps(x,z,w,d,h);
  if(!noDoor&&w>=4){ box(1.4,1.9,.08,M.ink,x,.95,z+d/2+.05,null,true); box(2.4,.14,1.1,M.brand,x,2.2,z+d/2+.55); } if(floors) windows(x,z,w,d,h,floors); }
const iA=new THREE.IcosahedronGeometry(1,0), tT=new THREE.CylinderGeometry(.13,.16,.9,6), coneT=new THREE.ConeGeometry(.9,2.2,7);
function tree(x,z,s=1,pine){ const g=new THREE.Group(); mesh(tT,M.trunk,0,.45,0,g,true); if(pine){ mesh(coneT,M.tree2,0,1.9,0,g); } else { const c=mesh(iA,Math.random()<.5?M.tree:M.tree2,0,1.6,0,g); c.scale.set(1,1.15,1); } g.position.set(x,0,z); g.scale.setScalar(s*(.8+Math.random()*.4)); scene.add(g); return g; }
const SKIN=[0xF2C9A5,0xE0AC85,0xC68A63,0xF5D3B5], SHIRT=[0xE5412D,0x3FA34D,0xFFC531,0x4D7CFE,0x231A15,0xF08A24,0x7C4DFF], PANTS=[0x2E3A55,0x3B4A6B,0x6B5B4B,0x1E2235,0x8A7A66], HAIR=[0x2B1D14,0x5A3A22,0x111111,0xC9A06A,0x8A5A33];
const legG=new THREE.CylinderGeometry(.095,.08,.62,8); legG.translate(0,-.31,0);
const armG=new THREE.CylinderGeometry(.075,.065,.52,8); armG.translate(0,-.26,0);
const torsoG=new THREE.CylinderGeometry(.25,.21,.64,10), headG2=new THREE.SphereGeometry(.2,14,10), hairG=new THREE.SphereGeometry(.205,14,10,0,Math.PI*2,0,Math.PI*.55), shoeG=new THREE.BoxGeometry(.14,.08,.24);
const capG=new THREE.CylinderGeometry(.215,.215,.12,14), brimG=new THREE.BoxGeometry(.3,.03,.18);
const matCache={}; const LC=c=>matCache[c]||(matCache[c]=L(c));
const pick=a=>a[Math.floor(Math.random()*a.length)];
function person(x,z,ry=0,p,o={}){
  const g=new THREE.Group(), shirt=LC(o.shirt||pick(SHIRT)), pants=LC(pick(PANTS)), skin=LC(pick(SKIN));
  const lL=mesh(legG,pants,-.1,.66,0,g,true), lR=mesh(legG,pants,.1,.66,0,g,true);
  mesh(shoeG,M.ink,0,-.6,.04,lL,true); mesh(shoeG,M.ink,0,-.6,.04,lR,true);
  mesh(torsoG,shirt,0,.98,0,g);
  const aL=mesh(armG,shirt,-.31,1.25,0,g,true), aR=mesh(armG,shirt,.31,1.25,0,g,true);
  mesh(headG2,skin,0,1.52,0,g);
  if(o.hat){ mesh(capG,o.hatMat||M.brand,0,1.66,0,g,true); mesh(brimG,o.hatMat||M.brand,0,1.61,.2,g,true); }
  else { const hair=mesh(hairG,LC(pick(HAIR)),0,1.54,-.02,g,true); hair.rotation.x=-.25; }
  g.userData.limbs={lL,lR,aL,aR}; g.position.set(x,0,z); g.rotation.y=ry; if(o.s) g.scale.setScalar(o.s); (p||scene).add(g); return g; }
function swing(g,ph,amp=.55){ const l=g.userData.limbs; if(!l) return; const s=Math.sin(ph)*amp; l.lL.rotation.x=s; l.lR.rotation.x=-s; l.aL.rotation.x=-s*.8; l.aR.rotation.x=s*.8; }
const rings=[];
function ring(x,y,z,color,r=1.2,period=1.8,flat=true){ const m=new THREE.Mesh(new THREE.TorusGeometry(r,.07,8,40),new THREE.MeshBasicMaterial({color,transparent:true})); m.position.set(x,y,z); if(flat) m.rotation.x=-Math.PI/2; scene.add(m); rings.push({m,period,phase:Math.random()}); return m; }
const bubG=new THREE.SphereGeometry(1,14,10);
// burger model
const bG={bot:new THREE.CylinderGeometry(1,.92,.36,20),pat:new THREE.CylinderGeometry(1.06,1.06,.3,20),che:new THREE.BoxGeometry(2,.06,2),let:new THREE.CylinderGeometry(1.12,1.12,.08,9),tom:new THREE.CylinderGeometry(.96,.96,.14,20),top:new THREE.SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI/2),ses:new THREE.SphereGeometry(.07,6,4)};
function burger(s=1,p,shadow=true){ const g=new THREE.Group();
  mesh(bG.bot,M.bun,0,.18,0,g,!shadow); mesh(bG.pat,M.patty,0,.51,0,g,!shadow); const c=mesh(bG.che,M.cheese,0,.69,0,g,true); c.rotation.y=Math.PI/4;
  mesh(bG.let,M.lettuce,0,.75,0,g,true); mesh(bG.tom,M.tomato,0,.86,0,g,true); const t=mesh(bG.top,M.bunTop,0,.92,0,g,!shadow); t.scale.y=.72;
  if(s>=.5) for(let k=0;k<9;k++){ const a=k*2.4, ph=.35+(k%3)*.28; const sd=mesh(bG.ses,M.white,Math.sin(ph)*Math.cos(a),.92+Math.cos(ph)*.72,Math.sin(ph)*Math.sin(a),g,true); sd.scale.set(1,.5,1.6); }
  g.scale.setScalar(s); (p||scene).add(g); return g; }
const wG=new THREE.CylinderGeometry(.24,.24,.2,14), hubG=new THREE.CylinderGeometry(.11,.11,.21,10);
function wheel(x,y,z,p,r=1){ const w=new THREE.Mesh(wG,M.ink); w.rotation.x=Math.PI/2; w.position.set(x,y,z); w.scale.set(r,1,r); p.add(w); const hb=new THREE.Mesh(hubG,M.grey); hb.rotation.x=Math.PI/2; hb.position.set(x,y,z); hb.scale.set(r,1,r); p.add(hb); }
const ext=(pts,depth,bev)=>{ const sh=new THREE.Shape(); sh.moveTo(pts[0][0],pts[0][1]); pts.slice(1).forEach(q=>sh.lineTo(q[0],q[1])); sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth:depth-2*bev,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:2,curveSegments:4}); g.translate(0,0,-(depth-2*bev)/2); return g; };
const carBodyG=ext([[-1.1,.28],[1.1,.28],[1.14,.56],[.98,.7],[.5,.74],[.22,1.08],[-.58,1.1],[-.86,.78],[-1.12,.72]],1.04,.07);
const carGlassG=ext([[.36,.79],[.19,1.03],[-.53,1.05],[-.74,.8]],1.1,.02);
const tailM=L(0xFF3B3B,{emissive:0xAA0000,emissiveIntensity:.5});
const taxiTex=signTex(LANG==='ru'?'ТАКСИ':'TAXI','#231A15','#FFC531',256,96);
function car(col,taxi){ const g=new THREE.Group(); const m=LC(taxi?0xFFC531:col);
  const b=new THREE.Mesh(carBodyG,m); b.castShadow=true; b.receiveShadow=true; g.add(b); g.add(new THREE.Mesh(carGlassG,M.glass));
  box(.05,.12,.26,lampMat,1.17,.52,.32,g,true); box(.05,.12,.26,lampMat,1.17,.52,-.32,g,true); box(.05,.1,.24,tailM,-1.17,.56,.34,g,true); box(.05,.1,.24,tailM,-1.17,.56,-.34,g,true);
  if(taxi){ box(.5,.22,.32,M.white,-.18,1.24,0,g); plane(.48,.18,taxiTex,-.18,1.24,.165,0,g); }
  [[-.68,.52],[.7,.52],[-.68,-.52],[.7,-.52]].forEach(([dx,dz])=>wheel(dx,.24,dz,g));
  scene.add(g); return g; }
function scooter(){ const g=new THREE.Group();
  box(1.3,.18,.36,M.brand,0,.42,0,g); box(.5,.5,.36,M.brand,-.35,.66,0,g); box(.12,.8,.12,M.dark,.55,.85,0,g,true); box(.08,.08,.6,M.dark,.55,1.25,0,g,true);
  wheel(.5,.24,0,g,.9); wheel(-.5,.24,0,g,.9);
  box(.62,.6,.62,M.brand,-.5,1.35,0,g); box(.64,.12,.64,M.white,-.5,1.36,0,g,true);
  const r=person(0,0,0,g,{shirt:0xE5412D,hat:true,hatMat:M.sun}); r.position.set(-.05,.18,0); r.rotation.y=Math.PI/2; r.scale.setScalar(.85); r.userData.limbs.lL.rotation.x=-1.2; r.userData.limbs.lR.rotation.x=-1.2; r.userData.limbs.aL.rotation.x=-1.1; r.userData.limbs.aR.rotation.x=-1.1;
  scene.add(g); return g; }
const cloudM=new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.92});
function puffs(x,y,z,n=7,spread=3,sc=1){ const ps=[]; for(let i=0;i<n;i++){ const s=new THREE.Mesh(bubG,cloudM); scene.add(s); ps.push({s,ph:i/n}); }
  tickers.push(t=>ps.forEach(p=>{ const u=(t*.18+p.ph)%1; p.s.position.set(x+u*spread,y+u*6,z-u*1.5); p.s.scale.setScalar((.45+u*1.4)*sc); })); }
// glowing ground lines with pulses
const lineCore=new THREE.MeshBasicMaterial({color:0xFFB23E}), lineGlow=new THREE.MeshBasicMaterial({color:0xFFB23E,transparent:true,opacity:.25,depthWrite:false});
const pulseM=new THREE.MeshBasicMaterial({color:0xFFFFFF}), pulseG=new THREE.SphereGeometry(.16,8,6);
function dataLine(pts,n=3,speed=.18){ const path=new THREE.CurvePath(); for(let i=0;i<pts.length-1;i++) path.add(new THREE.LineCurve3(new THREE.Vector3(pts[i][0],.14,pts[i][1]),new THREE.Vector3(pts[i+1][0],.14,pts[i+1][1])));
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(path,pts.length*20,.06,5,false),lineCore)); scene.add(new THREE.Mesh(new THREE.TubeGeometry(path,pts.length*20,.2,6,false),lineGlow));
  const ps=[]; for(let k=0;k<n;k++){ const m=new THREE.Mesh(pulseG,pulseM); scene.add(m); ps.push(m); }
  tickers.push(t=>ps.forEach((m,k)=>{ const u=((t*speed)+k/n)%1; path.getPointAt(u,m.position); m.position.y=.2; })); }
// floating note cards
function noteTex(icon,title,sub,bgc='#FFFFFF',fg='#231A15',accent='#E5412D'){ return tex((x,w,h)=>{ x.fillStyle='rgba(35,26,21,.18)'; rr(x,8,12,w-14,h-18,26); x.fill(); x.fillStyle=bgc; rr(x,4,4,w-12,h-22,26); x.fill(); x.beginPath(); x.moveTo(46,h-19); x.lineTo(36,h-4); x.lineTo(66,h-19); x.fill();
  x.fillStyle=accent; x.beginPath(); x.arc(62,(h-18)/2+2,34,0,7); x.fill(); x.font='38px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(icon,62,(h-18)/2+4);
  x.textAlign='left'; x.fillStyle=fg; fitText(x,title,w-130,34); x.fillText(title,112,(h-18)/2-12); x.fillStyle=fg==='#fff'?'rgba(255,255,255,.8)':'#6E625A'; x.font='600 24px Manrope, Arial, sans-serif'; x.fillText(sub,112,(h-18)/2+22); },360,150); }
const sprites=[];
function note(t,x,y,z,s=1){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthWrite:false})); sp.scale.set(4.2*s,1.75*s,1); sp.position.set(x,y,z); scene.add(sp); sprites.push({s:sp,y,ph:sprites.length*.7}); return sp; }
const spinners=[], movers=[];

/* ---------------- Streets and life shared by all scenes ---------------- */
function streets(){
  const asphalt=L(0x4F4A49), walk=L(0xF7F2EA), hedge=L(0x6FAE6A,{flatShading:true}), stone=L(0xE9E3D8);
  box(330,.07,4.4,asphalt,120,.04,14,null,true);
  box(330,.09,1.6,walk,120,.05,11.1,null,true); box(330,.09,1.6,walk,120,.05,16.9,null,true);
  const dashes=[]; for(let i=0;i<106;i++) dashes.push([-44+i*3.1,.09,14]); inst(new THREE.BoxGeometry(1.4,.02,.14),M.white,dashes);
  [20,60,100,140,180,220].forEach(x=>{
    box(3.6,.07,46,asphalt,x,.04,-11.2,null,true); box(.9,.09,46,walk,x-2.3,.05,-11.2,null,true); box(.9,.09,46,walk,x+2.3,.05,-11.2,null,true);
    for(let k=0;k<6;k++) box(.5,.03,1.6,M.white,x-1.5+k*.6,.1,10.6,null,true); });
  box(330,.05,6,M.grass,120,.025,21.5,null,true);
  const hedges=[], flowers=[]; for(let x=-40;x<280;x+=11){ hedges.push([x+3.5,.23,18.3]); }
  inst(new THREE.BoxGeometry(7.5,.45,.7),hedge,hedges,true);
  // streetlights
  const poles=[]; for(let x=-38;x<278;x+=11){ poles.push([x,10.4,1]); poles.push([x+5.5,17.6,-1]); }
  const pI=inst(new THREE.CylinderGeometry(.07,.09,3.4,8),M.dark,poles.map(([x,z])=>[x,1.7,z]),true);
  inst(new THREE.BoxGeometry(.08,.08,1.1),M.dark,poles.map(([x,z,s])=>[x,3.35,z+s*.5]));
  inst(new THREE.BoxGeometry(.5,.18,.32),lampMat,poles.map(([x,z,s])=>[x,3.25,z+s]));
  // light pools that appear at night
  const poolM=new THREE.MeshBasicMaterial({color:0xFFD27A,transparent:true,opacity:0,depthWrite:false});
  const pools=new THREE.InstancedMesh(new THREE.CircleGeometry(1.8,24),poolM,poles.length); poles.forEach(([x,z,s],i)=>{ dm.position.set(x,.12,z+s); dm.rotation.set(-Math.PI/2,0,0); dm.scale.set(1,1,1); dm.updateMatrix(); pools.setMatrixAt(i,dm.matrix); }); scene.add(pools);
  window.__pool=poolM;
  // benches
  for(let x=-30;x<272;x+=33){ box(1.6,.12,.5,M.wood,x,.55,17.6); box(1.6,.5,.1,M.wood,x,.85,17.85); }
  // traffic
  const carCols=[0xE5412D,0xFFFFFF,0x231A15,0x4D7CFE,0x3FA34D,0xD6CFC4,0xF08A24,0x7C4DFF];
  const cars=[]; for(let i=0;i<14;i++){ const east=i%2===0, g=car(carCols[i%carCols.length],i%5===2); cars.push({g,east,off:i*23+Math.random()*6,sp:6+Math.random()*3}); }
  // bakery delivery truck on the boulevard
  const tk=truck(); cars.push({g:tk,east:true,off:140,sp:5.2});
  tickers.push(t=>cars.forEach(c=>{ const span=340, u=((c.off+t*c.sp)%span+span)%span; const x=c.east?-45+u:295-u; c.g.position.set(x,0,c.east?13.1:14.9); c.g.rotation.y=c.east?0:Math.PI; }));
  // pedestrians
  const walkers=[]; for(let i=0;i<12;i++){ const top=i%2===0; const g=person(0,0,0); walkers.push({g,z:top?11.1:16.9,dir:top?1:-1,off:Math.random()*320,sp:.9+Math.random()*.6}); }
  tickers.push(t=>walkers.forEach(w=>{ const u=((w.off+t*w.sp)%320+320)%320; w.g.position.set(w.dir>0?-40+u:280-u,Math.abs(Math.sin(t*7.5+w.off))*.05,w.z+(w.dir>0?-.3:.3)); swing(w.g,t*7.5+w.off); w.g.rotation.y=w.dir>0?Math.PI/2:-Math.PI/2; }));
  // clouds
  const clouds=[]; for(let i=0;i<12;i++){ const g=new THREE.Group(); for(let k=0;k<4;k++){ const s=new THREE.Mesh(bubG,cloudM); s.scale.set(1.8+Math.random(),1+Math.random()*.6,1.4); s.position.set(k*1.6-2.4,Math.random()*.5,Math.random()*.8); g.add(s); }
    g.position.set(-40+i*28+Math.random()*10,10+Math.random()*5,-48-Math.random()*14); scene.add(g); clouds.push({g,x0:g.position.x,sp:.5+Math.random()*.6}); }
  window.__clouds=clouds;
  tickers.push(t=>clouds.forEach(c=>{ c.g.position.x=-50+(((c.x0+50)+t*c.sp)%340); }));
  // trees along the back and the verge
  for(let x=-34;x<=278;x+=6){ if(Math.random()<.65) tree(x+Math.random()*3,20.5+Math.random()*3,1); if(Math.random()<.7) tree(x+Math.random()*3,-22-Math.random()*8,1.2,Math.random()<.4); }
  // filler blocks behind scenes
  [[-24,-28,6,6,8],[30,-30,6,5,10],[66,-30,7,5,12],[96,-29,5,6,7],[134,-30,6,6,11],[174,-29,7,5,9],[214,-30,6,6,8],[262,-27,6,6,10]].forEach(b=>building(...b,M.wall,Math.floor(b[4]/2.6),null,true));
}
function truck(){ const g=new THREE.Group();
  box(4.6,2.3,2.1,M.white,-.9,1.65,0,g); box(1.7,1.9,2.1,M.brand,2.3,1.45,0,g); box(.06,.8,1.8,M.glass,3.16,1.85,0,g,true);
  const t=signTex(TX('Bunly Bakery','Пекарня Bunly'),'#E5412D','#fff',512,140); plane(3.8,1.04,t,-.9,1.75,1.06,0,g); plane(3.8,1.04,t,-.9,1.75,-1.06,Math.PI,g);
  [[-2.4,.95],[-1.2,.95],[2.3,.95],[-2.4,-.95],[-1.2,-.95],[2.3,-.95]].forEach(([dx,dz])=>wheel(dx,.36,dz,g,1.5));
  box(4.8,.2,2,M.dark,-.9,.5,0,g,true); scene.add(g); return g; }

/* ---------------- Scene 1: fields ---------------- */
function sceneFields(){
  box(13,.12,14,M.soil,-8,.06,-4,null,true);
  const ridges=[], plants=[]; for(let z=-10.2;z<=2.6;z+=1.3){ ridges.push([-8,.16,z]); for(let x=-14;x<=-2.2;x+=1.0) plants.push([x+(Math.random()-.5)*.25,.42,z,.9+Math.random()*.3,.8,.9+Math.random()*.3,Math.random()*3]); }
  inst(new THREE.BoxGeometry(12.6,.16,.5),M.soilD,ridges); inst(new THREE.IcosahedronGeometry(.42,0),M.potato,plants,true);
  box(12,.5,9,M.wheat,8,.25,-7.5,null,true); for(let z=-11.6;z<=-3.4;z+=1.05) box(12,.06,.32,M.wheat2,8,.52,z,null,true);
  // windmill
  mesh(new THREE.CylinderGeometry(.7,1.3,9,8),M.white,-4,4.5,-15); mesh(new THREE.ConeGeometry(1.1,1.4,8),M.brand,-4,9.7,-15);
  const blades=new THREE.Group(); blades.position.set(-3.3,8.8,-14.3); blades.rotation.y=Math.PI/4; scene.add(blades);
  const hub=new THREE.Group(); blades.add(hub); for(let k=0;k<4;k++){ const b=box(.5,4.2,.08,M.cream,0,2.2,0,null); const arm=new THREE.Group(); arm.add(b); arm.rotation.z=k*Math.PI/2; hub.add(arm); }
  spinners.push({o:hub,ax:'z',sp:.9});
  // barn and silo
  box(6,4,5,M.brandD,9,2,3); const r1=box(6.5,.22,3.4,M.dark,9,4.9,1.75); r1.rotation.x=-.6; const r2=box(6.5,.22,3.4,M.dark,9,4.9,4.25); r2.rotation.x=.6;
  const tri=new THREE.Shape(); tri.moveTo(-2.5,0); tri.lineTo(2.5,0); tri.lineTo(0,1.7); tri.closePath();
  const gab=mesh(new THREE.ExtrudeGeometry(tri,{depth:5.9,bevelEnabled:false}),M.brandD,6.05,4,3); gab.rotation.y=Math.PI/2;
  box(2.2,2.6,.08,M.white,9,1.3,5.54,null,true); box(1.9,2.3,.1,M.brandD,9,1.3,5.56,null,true);
  const xb=box(2.6,.14,.12,M.white,9,1.3,5.62,null,true); xb.rotation.z=.85; const xb2=box(2.6,.14,.12,M.white,9,1.3,5.62,null,true); xb2.rotation.z=-.85;
  mesh(new THREE.CylinderGeometry(1.4,1.4,8,18),M.white,15,4,-1); mesh(new THREE.SphereGeometry(1.42,18,10,0,Math.PI*2,0,Math.PI/2),M.brand,15,8,-1);
  for(let y=1.5;y<8;y+=1.6) mesh(new THREE.CylinderGeometry(1.43,1.43,.12,18),M.grey,15,y,-1,null,true);
  // crates of potatoes and hay bales
  [[4,7],[5.3,7],[4.65,7,1]].forEach(([x,z,up])=>{ box(1.1,.7,.9,M.wood,x,up?1.05:.35,z); });
  [[12,7.4],[13.6,7.4],[12.8,7.4,1]].forEach(([x,z,up])=>{ const h=mesh(new THREE.CylinderGeometry(.6,.6,1,14),M.wheat,x,up?1.5:.6,z); h.rotation.z=Math.PI/2; });
  // fence
  const posts=[]; for(let x=-14.6;x<=-1.4;x+=1.2) posts.push([x,.4,3.6]); inst(new THREE.BoxGeometry(.12,.8,.12),M.wood,posts); box(13.2,.08,.06,M.wood,-8,.62,3.6,null,true); box(13.2,.08,.06,M.wood,-8,.32,3.6,null,true);
  // tractor
  const tr=new THREE.Group(); box(2,1,1.2,M.leaf,0,1,0,tr); box(1,1.1,1.1,M.leaf,-.5,2,0,tr); box(.9,.8,1.12,M.glass,-.5,2.05,0,tr,true); box(.1,.8,.1,M.dark,.7,1.8,.3,tr,true);
  wheel(-.6,.65,.62,tr,2.6); wheel(-.6,.65,-.62,tr,2.6); wheel(.75,.4,.6,tr,1.6); wheel(.75,.4,-.6,tr,1.6); scene.add(tr);
  movers.push({type:'pingpong',o:tr,x0:-13,x1:0,z:5.4,speed:.08});
  // farmers
  person(-11,-1.3,.6); person(-5.4,-6.5,2.4);
  box(.12,2.4,.12,M.dark,2,1.2,8.6); plane(3.6,1,signTex(TX('Local farms','Местные фермы'),'#3FA34D'),2,2.8,8.68);
  [[-17,-6],[-17,0],[18,-12],[3,-15],[12,-15]].forEach(([x,z])=>tree(x,z,1.1));
}

/* ---------------- Scene 2: bakery ---------------- */
function sceneBakery(){
  building(45,-7,12,8,7,M.wall,1,M.brand); windows(45,-7,12,8,7,0);
  for(let i=-5;i<=5;i+=1.6) box(.9,.8,.06,winMat,45+i,4.0,-2.96,null,true);
  plane(7.6,1.5,signTex(TX('Bunly Bakery','Пекарня Bunly')),45,5.5,-2.9);
  box(1.2,13,1.2,M.grey,49.5,6.5,-9.5); box(1.4,.4,1.4,M.brand,49.5,12.8,-9.5); puffs(49.5,13.4,-9.5);
  // conveyor of buns
  box(19,.5,1.8,M.dark,45,1,0); box(19,.12,.14,M.grey,45,1.32,.9,null,true); box(19,.12,.14,M.grey,45,1.32,-.9,null,true);
  const legs=[]; for(let x=36;x<=54;x+=3) { legs.push([x,.38,.7]); legs.push([x,.38,-.7]); } inst(new THREE.BoxGeometry(.2,.76,.2),M.grey,legs);
  box(1.8,2.2,2.2,M.white,35.4,1.1,0); box(1.82,.5,2.22,M.brand,35.4,2,0,null,true);
  const bunG=new THREE.SphereGeometry(.55,16,8,0,Math.PI*2,0,Math.PI/2), baseG=new THREE.CylinderGeometry(.55,.52,.2,16);
  const buns=[]; for(let i=0;i<10;i++){ const g=new THREE.Group(); mesh(baseG,M.bun,0,.1,0,g,true); const t=mesh(bunG,M.bunTop,0,.2,0,g); t.scale.y=.75; scene.add(g); buns.push(g); }
  movers.push({type:'belt',objs:buns,x0:36.4,x1:54,y:1.25,z:0,speed:1.6});
  // quality lab
  building(31.5,-6,5,5,4,M.white,0,M.leaf,true); box(.9,.8,.06,winMat,29.9,1.6,-3.46,null,true); box(.9,.8,.06,winMat,33.1,1.6,-3.46,null,true); box(1.3,1.9,.08,M.ink,31.5,.95,-3.45,null,true);
  plane(3.9,.9,signTex(TX('Quality lab','Лаборатория'),'#3FA34D'),31.5,3.05,-3.4);
  const chk=new THREE.Group(); chk.position.set(31.5,6.2,-6); scene.add(chk); box(.5,1.2,.4,M.leaf,-.45,-.15,0,chk).rotation.z=.75; box(.5,2.2,.4,M.leaf,.35,.25,0,chk).rotation.z=-.6;
  movers.push({type:'bob',o:chk,y:6.2,a:.25}); ring(31.5,4.6,-6,0x3FA34D,1.2,2);
  // parked truck at the loading dock
  const tk=truck(); tk.position.set(53,0,5);
  // flour sacks
  const sacks=[]; for(let i=0;i<6;i++) sacks.push([38+(i%3)*.9,.35+Math.floor(i/3)*.6,4.8+(i%2)*.2]); inst(new THREE.BoxGeometry(.8,.55,.5),M.cream,sacks,true);
  for(let i=0;i<3;i++) person(40+i*2,-1.9,Math.PI,null,{hat:true,hatMat:M.white,shirt:0xFFFFFF});
  [[27,3],[57,-6],[26,-12]].forEach(([x,z])=>tree(x,z,1.1));
}

/* ---------------- Scene 3: open kitchen ---------------- */
function sceneKitchen(){
  const floor=tex((x,w,h)=>{ const n=16; for(let i=0;i<n;i++) for(let j=0;j<n*.75;j++){ x.fillStyle=(i+j)%2?'#F3EDE3':'#E2D9CB'; x.fillRect(i*w/n,j*w/n,w/n,w/n); } },512,384);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(16,12),new THREE.MeshLambertMaterial({map:floor})); fl.rotation.x=-Math.PI/2; fl.position.set(80,.08,-2); fl.receiveShadow=true; scene.add(fl);
  box(16,4.6,.4,M.wall,80,2.3,-8.2); box(.4,4.6,12.4,M.wall,71.8,2.3,-2);
  box(16.02,.5,.42,M.brand,80,4.3,-8.2,null,true); box(.42,.5,12.42,M.brand,71.8,4.3,-2,null,true);
  // order screen
  const scr=tex((x,w,h)=>{ x.fillStyle='#231A15'; rr(x,0,0,w,h,18); x.fill(); x.fillStyle='#FFC531'; x.font=F.replace('{s}',30); x.fillText(TX('PREPARING','ГОТОВИМ'),30,52); x.fillStyle='#3FA34D'; x.fillText(TX('READY','ГОТОВО'),w/2+30,52);
    x.fillStyle='#fff'; x.font=F.replace('{s}',46); ['129','130','131'].forEach((n,i)=>x.fillText(n,30+i*80,118)); x.fillStyle='#7CE08A'; ['127','128'].forEach((n,i)=>x.fillText(n,w/2+30+i*86,118)); x.fillStyle='#3A322D'; x.fillRect(w/2,24,3,h-48); },512,170);
  plane(3.9,1.3,scr,80,3.1,-7.98,0,null,true);
  // grill
  box(5,1,2,M.steel,76,.5,-6.2); const glow=L(0xFF8A3D,{emissive:0xFF5A1F,emissiveIntensity:.6}); box(4.6,.08,1.6,glow,76,1.04,-6.2,null,true);
  const lid=box(4.6,.16,1.6,M.dark,76,1.8,-6.2); movers.push({type:'lid',o:lid});
  const patG=new THREE.CylinderGeometry(.34,.34,.14,14), pats=[]; for(let i=0;i<4;i++) for(let j=0;j<2;j++){ const p=mesh(patG,M.patty,74.5+i*1,1.16,-6.6+j*.8,null,true); pats.push({p,ph:(i+j*2)/8}); }
  movers.push({type:'flip',items:pats});
  // fryers
  box(3,1,2,M.steel,82,.5,-6.2); const oil=L(0xE3B341,{emissive:0x8A5A00,emissiveIntensity:.25}); box(1.1,.06,1.3,oil,81.3,1.02,-6.2,null,true); box(1.1,.06,1.3,oil,82.7,1.02,-6.2,null,true);
  const baskets=[]; [81.3,82.7].forEach((x,k)=>{ const g=new THREE.Group(); g.position.set(x,1.2,-6.2); scene.add(g); box(1,.4,1.1,M.grey,0,0,0,g,true); for(let f=0;f<7;f++) box(.08,.5,.08,M.sun,-.35+f*.12,.3,(f%3-1)*.25,g,true); box(.08,.08,1,M.dark,0,.3,.9,g,true); baskets.push({g,ph:k*.5}); });
  movers.push({type:'baskets',items:baskets}); puffs(82,1.4,-6.2,4,.4,.28);
  box(2.4,1.3,1.6,M.steel,86.3,.65,-6.4); [85.6,86.3,87].forEach(x=>{ mesh(new THREE.CylinderGeometry(.18,.14,.5,10),M.white,x,1.55,-6.2,null,true); });
  // assembly line
  box(12,1,1.6,M.steel,80,.5,-1.6); box(12,.06,1.1,M.dark,80,1.03,-1.6,null,true);
  const bs=[]; for(let i=0;i<6;i++) bs.push(burger(.36,null,false)); movers.push({type:'belt',objs:bs,x0:74.4,x1:85.6,y:1.06,z:-1.6,speed:1.2,build:true});
  // staff
  person(75,-4.6,Math.PI,null,{hat:true,shirt:0x231A15}); person(77.2,-4.6,Math.PI,null,{hat:true,shirt:0x231A15}); person(82,-4.6,Math.PI,null,{hat:true,shirt:0x231A15});
  person(78,-3,0,null,{hat:true,shirt:0x231A15}); person(83,-3,0,null,{hat:true,shirt:0x231A15}); person(86.6,-4.6,Math.PI,null,{hat:true,shirt:0x231A15});
  // pickup counter
  box(7,1.1,1,M.brand,83,.55,2.6); box(7.2,.1,1.2,M.white,83,1.15,2.6,null,true);
  box(1.6,.06,1.1,M.sun,82,1.24,2.6,null,true); burger(.32,null,false).position.set(81.6,1.27,2.6);
  const cup=mesh(new THREE.CylinderGeometry(.22,.17,.6,12),M.white,82.5,1.55,2.6); box(.04,.4,.04,M.brand,82.55,1.95,2.6,null,true);
  const heat=L(0xFFD27A,{emissive:0xFFB23E,emissiveIntensity:.8}); [81,83,85].forEach(x=>{ box(.06,1.4,.06,M.dark,x,3.3,2.6,null,true); box(.7,.25,.5,heat,x,2.55,2.6,null,true); });
  for(let i=0;i<3;i++) person(81+i*1.6,4.2,Math.PI);
  // a school group on a tour
  for(let i=0;i<5;i++) person(73.4+(i%3)*1.1,1.6+Math.floor(i/3)*1.2,Math.PI*.75,null,{hat:true,hatMat:M.sun,s:.72});
  person(76.2,2.4,-Math.PI/2,null,{hat:true,shirt:0x231A15});
  [[92,-10],[92,6],[69,-12]].forEach(([x,z])=>tree(x,z,1.1));
}

/* ---------------- Scene 4: restaurant and drive-thru ---------------- */
function sceneRestaurant(){
  box(12,5,8,M.wall,120,2.5,-5); box(12.3,.4,8.3,M.grey,120,5.2,-5); box(12.06,1.2,8.06,M.brand,120,4.3,-5,null,true);
  box(7,2.4,.08,winMat,120.5,1.7,-.97,null,true); box(.08,2.4,4.6,winMat,126.04,1.7,-5.8,null,true);
  box(1.6,2.2,.1,M.ink,115,1.1,-.95,null,true); box(2.6,.14,1.2,M.sun,115,2.5,-.4);
  plane(6.4,1.12,signTex('Bunly'),120.4,4.3,-.94);
  const big=burger(1.9); big.position.set(120,5.4,-5); spinners.push({o:big,ax:'y',sp:.5});
  ring(120,5.5,-5,0xFFC531,2.6,2.4);
  // drive-thru lane
  const lanePts=[[110.5,-5],[111.5,-12],[121,-13.2],[131,-12],[132.4,-5],[131,1.8],[121,3],[111.5,1.8]].map(([x,z])=>new THREE.Vector3(x,.06,z));
  const lane=new THREE.CatmullRomCurve3(lanePts,true);
  const laneM=new THREE.Mesh(new THREE.TubeGeometry(lane,120,1.25,6,true),L(0x5A5352)); laneM.scale.y=.04; laneM.position.y=.04; laneM.receiveShadow=true; scene.add(laneM);
  const laneLine=new THREE.Mesh(new THREE.TubeGeometry(lane,160,.06,4,true),M.sun); laneLine.position.y=.06; scene.add(laneLine);
  const dcars=[]; [0xFFFFFF,0x4D7CFE,0x231A15,0x3FA34D].forEach((c,i)=>dcars.push(car(c)));
  movers.push({type:'loop',curve:lane,objs:dcars,speed:.035,gap:.25});
  // pickup window and menu board
  box(.3,1.2,1.4,M.sun,126.1,1.6,-2); box(1,.12,1.8,M.brand,126.5,2.4,-2);
  box(.16,2.6,.16,M.dark,134.6,1.3,-8.6); box(.16,2.6,.16,M.dark,134.6,1.3,-6.4);
  const mb=tex((x,w,h)=>{ x.fillStyle='#231A15'; rr(x,0,0,w,h,20); x.fill(); x.fillStyle='#FFC531'; x.font=F.replace('{s}',40); x.fillText(TX('ORDER HERE','ЗАКАЗ ЗДЕСЬ'),28,60);
    x.font='600 26px Manrope, Arial'; (LANG==='ru'?[['Деревенский Дабл','8,90'],['Золотая фри','2,90'],['Чикен-бокс','12,40'],['Клубничный вихрь','2,50']]:[['Homestead Double','8.90'],['Golden Fries','2.90'],['Chicken Box','12.40'],['Strawberry Swirl','2.50']]).forEach(([n,p],i)=>{ x.fillStyle='#fff'; x.fillText(n,28,118+i*44); x.fillStyle='#FFC531'; x.fillText(p,w-110,118+i*44); }); },420,300);
  const board=plane(2.6,1.86,mb,134.62,2.4,-7.5,Math.PI/2); board.position.x=134.72;
  // terrace
  box(6,.08,6,L(0xE9E3D8),105.5,.06,2.4,null,true);
  [[104,0.6,0],[107,0.6,1],[104,4.2,1],[107,4.2,0]].forEach(([x,z,c])=>{ mesh(new THREE.CylinderGeometry(.5,.5,.08,14),M.white,x,.8,z); box(.08,.8,.08,M.dark,x,.4,z,null,true);
    box(.08,2.4,.08,M.dark,x,1.2,z,null,true); mesh(new THREE.ConeGeometry(1.4,.7,8),c?M.sun:M.brand,x,2.5,z);
    [[-.7,0],[.7,0]].forEach(([dx])=>box(.5,.5,.5,M.wood,x+dx,.25,z)); });
  person(103.3,1.4,.4); person(107.7,3.4,-2.5); person(104.6,4.9,2.8);
  // flags
  [113,115,117].forEach((x,i)=>{ box(.08,4,.08,M.grey,x,2,8.6,null,true); const f=box(1,.6,.04,i===1?M.sun:M.brand,x+.5,3.6,8.6,null,true); movers.push({type:'flag',o:f,ph:i}); });
  // guests walking in
  const gs=[]; for(let i=0;i<4;i++){ const g=person(0,0,0); gs.push({g,ph:i/4}); }
  movers.push({type:'enter',items:gs});
  [[100.5,-12],[139,-14],[109,-15]].forEach(([x,z])=>tree(x,z,1.15));
}

/* ---------------- Scene 5: delivery ---------------- */
function sceneDelivery(){
  const ph=new THREE.Group(); ph.position.set(155,0,-4); scene.add(ph);
  box(5.8,.6,2.6,M.dark,0,.3,0,ph); box(4.8,9.4,.6,M.ink,0,5.3,0,ph);
  const app=tex((x,w,h)=>{ x.fillStyle='#FBF6EE'; x.fillRect(0,0,w,h); x.fillStyle='#E5412D'; x.fillRect(0,0,w,120); x.fillStyle='#fff'; x.font=F.replace('{s}',50); x.fillText('Bunly',36,82);
    x.fillStyle='#F1E6D6'; rr(x,30,150,w-60,380,26); x.fill(); x.strokeStyle='#E2D5C2'; x.lineWidth=6; for(let k=0;k<5;k++){ x.beginPath(); x.moveTo(30,190+k*80); x.lineTo(w-30,190+k*80); x.stroke(); x.beginPath(); x.moveTo(60+k*95,150); x.lineTo(60+k*95,530); x.stroke(); }
    x.strokeStyle='#E5412D'; x.lineWidth=10; x.setLineDash([18,14]); x.beginPath(); x.moveTo(80,480); x.bezierCurveTo(200,470,200,260,400,220); x.stroke(); x.setLineDash([]);
    x.fillStyle='#231A15'; x.beginPath(); x.arc(80,480,20,0,7); x.fill(); x.fillStyle='#3FA34D'; x.beginPath(); x.arc(400,220,22,0,7); x.fill(); x.fillStyle='#FFC531'; x.beginPath(); x.arc(230,330,20,0,7); x.fill(); x.strokeStyle='#fff'; x.lineWidth=6; x.stroke();
    x.fillStyle='#fff'; rr(x,30,560,w-60,190,26); x.fill(); x.fillStyle='#231A15'; x.font=F.replace('{s}',40); fitText(x,TX('Arriving in 4 min','Будет через 4 мин'),w-120,40); x.fillText(TX('Arriving in 4 min','Будет через 4 мин'),60,628); x.fillStyle='#6E625A'; x.font='600 26px Manrope, Arial'; x.fillText(TX('Alex is riding to you','Алексей уже едет к вам'),60,672);
    x.fillStyle='#E5412D'; [0,1].forEach(k=>{ rr(x,60+k*95,700,85,14,7); x.fill(); }); x.fillStyle='#E2D5C2'; [2,3].forEach(k=>{ rr(x,60+k*95,700,85,14,7); x.fill(); });
    x.fillStyle='#E5412D'; rr(x,30,790,w-60,110,55); x.fill(); x.fillStyle='#fff'; x.font=F.replace('{s}',40); x.textAlign='center'; x.fillText(TX('Track order','Где мой заказ'),w/2,860); },512,960);
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(4.3,8.7),new THREE.MeshBasicMaterial({map:app})); screen.position.set(0,5.3,.31); ph.add(screen);
  movers.push({type:'phone',o:ph}); ring(155,11.3,-4,0xE5412D,1,2.2,false).rotation.y=Math.PI/4; ring(155,11.3,-4,0xE5412D,1,2.2,false).rotation.y=Math.PI/4;
  // lanes and houses
  const asphalt=L(0x5A5352); box(19,.06,1.6,asphalt,167,.05,-2,null,true); box(19,.06,1.6,asphalt,167,.05,4.5,null,true); box(1.6,.06,8.1,asphalt,158.4,.05,1.25,null,true);
  const roofG=new THREE.ConeGeometry(1.9,1.3,4), roofs=[M.sun,M.brand,M.leaf,L(0x4D7CFE)];
  [-6.5,1.2,7.8].forEach((z,r)=>[163,167,171,175].forEach((x,c)=>{ box(2.4,2,2.4,M.white,x,1,z); const rf=mesh(roofG,roofs[(r+c)%4],x,2.65,z); rf.rotation.y=Math.PI/4; box(.6,1.1,.06,M.ink,x,.55,z+1.22,null,true); box(.6,.6,.06,winMat,x+.6,1.2,z+1.22,null,true); }));
  const scs=[]; [[-2,0],[4.5,.5],[-2,.55],[4.5,.1]].forEach(([z,ph])=>{ scs.push({g:scooter(),z,ph}); }); movers.push({type:'scooters',items:scs,x0:159,x1:177});
  dataLine([[157.5,-2.6],[157.5,-2],[160,-2]],2,.3); dataLine([[157.5,-1.4],[158.4,-1.4],[158.4,4.5],[161,4.5]],2,.25);
  note(noteTex('🍔',TX('Order #4128','Заказ №4128'),TX('Cooking now','Уже готовим')),165,6.8,-6.5,1.3); note(noteTex('🛵',TX('4 min away','Через 4 мин'),TX('Alex is riding','Алексей в пути'),'#E5412D','#fff','#FFC531'),173,6.4,1.2,1.3); note(noteTex('✅',TX('Delivered','Доставлено'),TX('Enjoy your meal','Приятного аппетита'),'#3FA34D','#fff','#FFFFFF'),167,6.2,7.8,1.3);
  [[150,4],[178,-12],[150,-12]].forEach(([x,z])=>tree(x,z,1.1));
}

/* ---------------- Scene 6: night menu ---------------- */
function sceneNight(){
  box(11,4.6,7,M.brick,200,2.3,-5); box(11.3,.4,7.3,M.dark,200,4.8,-5); box(11.06,.6,7.06,M.brand,200,4.1,-5,null,true);
  box(8,2.2,.08,winMat,199,1.6,-1.47,null,true); box(.08,2.2,5,winMat,205.54,1.6,-5.4,null,true);
  box(1.4,2,.1,M.ink,195,1,-1.45,null,true); box(2.4,.14,1.1,M.sun,195,2.3,-.95);
  // neon sign on the roof
  box(.14,2,.14,M.dark,197.6,5.8,-5.5,null,true); box(.14,2,.14,M.dark,202.4,5.8,-5.5,null,true);
  const neon=tex((x,w,h)=>{ x.fillStyle='#1A1230'; rr(x,0,0,w,h,30); x.fill(); x.shadowColor='#FF4FD8'; x.shadowBlur=26; x.strokeStyle='#FF6FE0'; x.lineWidth=6; rr(x,14,14,w-28,h-28,22); x.stroke();
    x.shadowColor='#FFC531'; x.shadowBlur=30; x.fillStyle='#FFE08A'; fitText(x,TX('OPEN 24/7','ОТКРЫТО 24/7'),w*.8,96); x.textAlign='center'; x.textBaseline='middle'; x.fillText(TX('OPEN 24/7','ОТКРЫТО 24/7'),w/2,h/2+4); },640,200);
  const nm=new THREE.MeshBasicMaterial({map:neon,transparent:true}); const ns=new THREE.Mesh(new THREE.PlaneGeometry(6,1.9),nm); ns.position.set(200,7.4,-5.4); scene.add(ns); window.__neon=ns;
  plane(4,1,signTex(TX('Night menu','Ночное меню'),'#231A15','#FFC531',512,128),205.58,3.2,-5,Math.PI/2,null,true);
  // parked cars
  [[196,3.4,0x231A15],[199,3.4,0xFFC531,1],[204,3.4,0x4D7CFE]].forEach(([x,z,c,t])=>{ const g=car(c,t); g.position.set(x,0,z); g.rotation.y=Math.PI/2; });
  box(12,.05,5,L(0xD8D1C5),200,.04,3.4,null,true); for(let i=0;i<5;i++) box(.1,.03,2,M.white,194.5+i*2.8,.08,3.4,null,true);
  person(193.4,0,2.2); person(207,-1,-1.2); person(193.6,1.2,1.6);
  // late courier
  const s=scooter(); movers.push({type:'pingpong',o:s,x0:203,x1:216,z:6.8,speed:.09,face:true});
  // moon and stars
  const moonM=new THREE.MeshBasicMaterial({color:0xFFF3C4,transparent:true,opacity:0}); const moon=new THREE.Mesh(new THREE.SphereGeometry(2.4,24,16),moonM); moon.position.set(214,16,-16); scene.add(moon);
  const sp=[]; for(let i=0;i<120;i++) sp.push(184+Math.random()*48,7+Math.random()*14,-32+Math.random()*16);
  const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
  const starM=new THREE.PointsMaterial({color:0xffffff,size:2.2,sizeAttenuation:false,transparent:true,opacity:0}); scene.add(new THREE.Points(sg,starM));
  window.__night={moonM,starM,nm};
  [[188,-10],[213,-12],[190,6]].forEach(([x,z])=>tree(x,z,1.1,true));
}

/* ---------------- Scene 7: food truck festival ---------------- */
function sceneFestival(){
  box(26,.06,18,L(0xCDE5B4),240,.04,-3,null,true); box(26,.08,1.6,L(0xE9E3D8),240,.05,3.2,null,true);
  // truck
  const ft=new THREE.Group(); ft.position.set(237.5,0,-3); scene.add(ft);
  box(5.4,2.8,2.6,M.brand,-1,1.95,0,ft); box(1.9,2.1,2.5,M.wall,2.65,1.6,0,ft); box(.06,.9,2.2,M.glass,3.62,2,0,ft,true);
  box(3,1.1,.06,M.ink,-1.2,2.2,1.32,ft,true); box(3.2,.12,.5,M.white,-1.2,1.6,1.5,ft,true);
  const aw=tex((x,w,h)=>{ for(let i=0;i<8;i++){ x.fillStyle=i%2?'#FFFFFF':'#FFC531'; x.fillRect(i*w/8,0,w/8,h); } },256,64);
  const awning=new THREE.Mesh(new THREE.BoxGeometry(3.4,.1,1.2),new THREE.MeshLambertMaterial({map:aw})); awning.position.set(-1.2,3.05,1.85); awning.rotation.x=.38; awning.castShadow=true; ft.add(awning);
  [[-2.8,.9],[-.2,.9],[2.7,.95],[-2.8,-.9],[-.2,-.9],[2.7,-.95]].forEach(([dx,dz])=>wheel(dx,.4,dz,ft,1.7));
  box(4.6,.14,.14,M.dark,-1,3.5,0,ft,true); plane(4.6,1.05,signTex(TX('Bunly on Wheels','Bunly на колёсах')),-1,4.05,.12,0,ft);
  const mini=burger(.6); mini.position.set(2.65,2.7,0); ft.add(mini); spinners.push({o:mini,ax:'y',sp:1});
  for(let i=0;i<5;i++) person(236.3-i*.2,-.3+i*1.05,Math.PI+(Math.random()-.5)*.4);
  // tables
  [[231,2],[233.8,-8.2],[244.5,-9]].forEach(([x,z])=>{ box(2.2,.1,1,M.wood,x,.75,z); box(2.2,.08,.35,M.wood,x,.45,z+.7); box(2.2,.08,.35,M.wood,x,.45,z-.7); box(.1,.75,.8,M.dark,x-.9,.37,z,null,true); box(.1,.75,.8,M.dark,x+.9,.37,z,null,true); });
  person(231.2,2.9,Math.PI*.9); person(233,-7.3,Math.PI);
  // kids box
  const kb=new THREE.Group(); kb.position.set(249,0,3.6); scene.add(kb); box(2.6,2.2,2.6,M.white,0,1.1,0,kb);
  [[-.6,1.4,0xE5412D],[.5,.8,0xFFC531],[.6,1.7,0x3FA34D],[-.5,.6,0x4D7CFE]].forEach(([dx,y,c])=>{ const d=mesh(new THREE.CylinderGeometry(.34,.34,.04,16),LC(c),dx,y,1.31,kb,true); d.rotation.x=Math.PI/2; const d2=mesh(new THREE.CylinderGeometry(.34,.34,.04,16),LC(c),1.31,y,-dx,kb,true); d2.rotation.z=Math.PI/2; });
  const hd=mesh(new THREE.TorusGeometry(.7,.12,8,20,Math.PI),M.brand,0,2.2,0,kb); hd.rotation.y=Math.PI/4;
  movers.push({type:'squash',o:kb});
  for(let i=0;i<3;i++) person(246.6+i*.9,6+(i%2)*.4,Math.PI*1.2,null,{s:.72});
  // playground slide
  box(.14,2.4,.14,M.sun,246,1.2,-10.6); box(.14,2.4,.14,M.sun,247.4,1.2,-10.6); box(.14,2.4,.14,M.sun,246,1.2,-9.2); box(.14,2.4,.14,M.sun,247.4,1.2,-9.2);
  box(1.6,.14,1.6,M.brand,246.7,2.4,-9.9); const sl=box(1,.1,3.6,M.leaf,246.7,1.25,-7.4); sl.rotation.x=.66;
  // string lights
  const bulbs=[]; const poleXY=[[229,-12],[251,-12],[251,6],[229,6]]; poleXY.forEach(([x,z])=>box(.12,4.2,.12,M.dark,x,2.1,z,null,true));
  for(let k=0;k<4;k++){ const a=poleXY[k], b=poleXY[(k+1)%4]; for(let i=1;i<14;i++){ const u=i/14; bulbs.push([a[0]+(b[0]-a[0])*u,4.1-Math.sin(u*Math.PI)*1,a[1]+(b[1]-a[1])*u]); } }
  inst(new THREE.SphereGeometry(.13,8,6),lampMat,bulbs);
  // balloons
  const balloons=[]; const bCols=[M.brand,M.sun,M.leaf,L(0x4D7CFE),L(0xFF8FB3)];
  for(let i=0;i<9;i++){ const g=new THREE.Group(); const b=mesh(new THREE.SphereGeometry(.42,14,10),bCols[i%5],0,0,0,g,true); b.scale.y=1.2; box(.02,1,.02,M.dark,0,-.95,0,g,true); scene.add(g); balloons.push({g,x:232+Math.random()*16,z:-10+Math.random()*8,ph:Math.random()}); }
  tickers.push(t=>balloons.forEach(b=>{ const u=(t*.07+b.ph)%1; b.g.position.set(b.x+Math.sin(t+b.ph*9)*.6,3+u*20,b.z); b.g.scale.setScalar(u>.9?(1-u)*10:Math.min(1,u*8)); }));
  [[226,-12],[254,-12],[226,5],[256,4],[262,-6]].forEach(([x,z])=>tree(x,z,1.2));
}

function build(){
  box(460,.2,160,M.ground,120,-.1,0,null,true);
  streets(); sceneFields(); sceneBakery(); sceneKitchen(); sceneRestaurant(); sceneDelivery(); sceneNight(); sceneFestival();
}

/* ---------------- HTML labels in the scene ---------------- */
const WL=[{s:2,p:[82,2.7,-6.2],t:TX('Fryers','Фритюр')},{s:2,p:[79,2.1,-1.6],t:TX('Assembly line','Линия сборки')},{s:2,p:[85.6,2.3,2.6],t:TX('Pickup','Выдача'),c:'hotc'},{s:3,p:[131.6,1.2,-10.5],t:TX('Drive-thru lane','Полоса драйва')}];
let wlEls=[];

/* ---------------- Loop ---------------- */
let W=1,H=1;
function resize(){ const st=document.getElementById('stage'); W=st.clientWidth; H=st.clientHeight; renderer.setSize(W,H,false); }
addEventListener('resize',()=>{ carousel=mq.matches; document.documentElement.classList.toggle('is-carousel',carousel); resize(); });
const smooth=t=>t*t*(3-2*t), clamp=x=>x<0?0:x>1?1:x;
function target(){ if(carousel) return mobileIndex; const r=document.getElementById('journey').getBoundingClientRect(); const p=clamp(-r.top/(r.height-H)); const s=p*(N-1), i=Math.min(N-2,Math.floor(s)); return i+smooth(clamp((s-i-.18)/.64)); }
let sx=null; canvas.addEventListener('pointerdown',e=>{ if(carousel) sx=e.clientX; }); canvas.addEventListener('pointerup',e=>{ if(!carousel||sx===null) return; const dx=e.clientX-sx; sx=null; if(Math.abs(dx)>40) goScene(mobileIndex+(dx<0?1:-1)); });
canvas.addEventListener('pointercancel',()=>{ sx=null; });
let cs=0,last=performance.now(),time=0,visible=true;
new IntersectionObserver(es=>{ visible=es[0].isIntersecting; }).observe(document.getElementById('stage'));
const tg=new THREE.Vector3(), pv=new THREE.Vector3(), tmp=new THREE.Vector3(), tan=new THREE.Vector3();
HOTSPOTS.forEach(h=>h.v=new THREE.Vector3(...h.p));
function project(v){ pv.copy(v).project(camera); return [(pv.x+1)/2*W,(1-pv.y)/2*H]; }
let nightOn=false;
function frame(now){
  requestAnimationFrame(frame); const dt=Math.min(.05,(now-last)/1000); last=now;
  const st=target(); setCard(Math.round(st)); if(!visible) return;
  if(!reduced) time+=dt; cs=reduced?st:cs+(st-cs)*(1-Math.exp(-dt*3.2));
  const i=Math.min(N-2,Math.floor(cs)), f=cs-i, A=SCENES[i].cam, B=SCENES[i+1].cam;
  tg.set(A.t[0]+(B.t[0]-A.t[0])*f,A.t[1]+(B.t[1]-A.t[1])*f,A.t[2]+(B.t[2]-A.t[2])*f);
  let fs=A.fs+(B.fs-A.fs)*f; const asp=W/H; if(asp<1.2) fs*=Math.min(2.2,1.2/asp*.78);
  if(!carousel) tg.addScaledVector(RIGHT,-fs*asp*.12); else tg.y-=fs*.1;
  camera.left=-fs*asp/2; camera.right=fs*asp/2; camera.top=fs/2; camera.bottom=-fs/2; camera.position.copy(tg).addScaledVector(DIR,200); camera.lookAt(tg); camera.updateProjectionMatrix();
  sun.position.copy(tg).add(SUN); sun.target.position.copy(tg); const sc=sun.shadow.camera, ex=Math.max(fs*asp,fs)*.95; sc.left=-ex; sc.right=ex; sc.top=ex; sc.bottom=-ex; sc.near=1; sc.far=200; sc.updateProjectionMatrix();
  // night around the 24/7 scene
  const dk=clamp(1-Math.abs(cs-5)*1.25);
  renderer.setClearColor(DAY.clone().lerp(DUSK,dk)); hemi.intensity=.85-.4*dk; hemi.color.setRGB(1-.5*dk,1-.45*dk,1-.15*dk); hemi.groundColor.setRGB(.85-.6*dk,.8-.55*dk,.75-.4*dk);
  sun.intensity=.62-.38*dk; sun.color.setRGB(1-.35*dk,1-.3*dk,1); winMat.emissiveIntensity=.12+1*dk; lampMat.emissiveIntensity=.05+1.2*dk;
  if(window.__pool) window.__pool.opacity=dk*.32; if(window.__night){ window.__night.moonM.opacity=dk; window.__night.starM.opacity=dk; }
  if((dk>.4)!==nightOn){ nightOn=dk>.4; document.documentElement.classList.toggle('is-night',nightOn); }
  rings.forEach(r=>{ const p=((time/r.period)+r.phase)%1; r.m.scale.setScalar(.4+p*2.2); r.m.material.opacity=1-p; });
  sprites.forEach(o=>{ o.s.position.y=o.y+Math.sin(time*1.2+o.ph)*.25; });
  tickers.forEach(fn=>fn(time,dt));
  spinners.forEach(s=>{ s.o.rotation[s.ax]+=s.sp*dt*(reduced?0:1); });
  movers.forEach(m=>{
    if(m.type==='pingpong'){ const p=(time*m.speed)%2, u=p<1?p:2-p; m.o.position.set(m.x0+(m.x1-m.x0)*smooth(u),0,m.z); m.o.rotation.y=p<1?0:Math.PI; }
    else if(m.type==='belt') m.objs.forEach((o,k)=>{ const span=m.x1-m.x0, u=((time*m.speed)+k*span/m.objs.length)%span; o.position.set(m.x0+u,m.y,m.z);
      if(m.build){ if(o.userData.s===undefined) o.userData.s=o.scale.x; o.scale.setScalar(o.userData.s*Math.max(.001,Math.min(1,u/1.2,(span-u)/1.2))); } });
    else if(m.type==='bob') m.o.position.y=m.y+Math.sin(time*1.6)*m.a;
    else if(m.type==='lid') m.o.position.y=1.32+.5*(.5+.5*Math.sin(time*1.5));
    else if(m.type==='flip') m.items.forEach(c=>{ const u=((time/3)+c.ph)%1; if(u<.16){ const k=u/.16; c.p.position.y=1.16+Math.sin(k*Math.PI)*.55; c.p.rotation.x=k*Math.PI; } else { c.p.position.y=1.16; c.p.rotation.x=0; } });
    else if(m.type==='baskets') m.items.forEach(b=>{ b.g.position.y=1.15+.45*Math.max(0,Math.sin(time*.9+b.ph*6)); });
    else if(m.type==='loop') m.objs.forEach((o,k)=>{ const u=((time*m.speed)+k*m.gap+10)%1; m.curve.getPointAt(u,tmp); o.position.set(tmp.x,0,tmp.z); m.curve.getTangentAt(u,tan); o.rotation.y=Math.atan2(-tan.z,tan.x); });
    else if(m.type==='phone') m.o.rotation.y=.62+Math.sin(time*.5)*.28;
    else if(m.type==='scooters') m.items.forEach(s=>{ const p=(time*.06+s.ph*2)%2, u=p<1?p:2-p; s.g.position.set(m.x0+(m.x1-m.x0)*smooth(u),0,s.z); s.g.rotation.y=p<1?0:Math.PI; });
    else if(m.type==='flag') m.o.rotation.y=Math.sin(time*3+m.ph)*.25;
    else if(m.type==='enter') m.items.forEach((g,k)=>{ const u=((time*.07)+g.ph)%1; g.g.position.set(114.6+k*.5,Math.abs(Math.sin(time*7.5+k))*.05,10.6-u*10.8); g.g.rotation.y=Math.PI; swing(g.g,time*7.5+k); g.g.scale.setScalar(u>.93?Math.max(.001,(1-u)/.07):Math.min(1,u*14)); });
    else if(m.type==='squash'){ const s=Math.max(0,Math.sin(time*2.6)); m.o.scale.set(1+s*.05,1-s*.07+Math.max(0,-Math.sin(time*2.6))*.04,1+s*.05); }
  });
  renderer.render(scene,camera);
  HOTSPOTS.forEach((h,k)=>{ const el=hotEls[k], show=Math.abs(cs-h.s)<.45, [x,y]=project(h.v); el.classList.toggle('hidden',!show||x<10||x>W-10||y<60||y>H-60); el.style.transform='translate('+x+'px,'+y+'px)';
    if(k===tipI){ if(!show) closeTip(); else tip.style.transform='translate('+Math.min(W-272,Math.max(12,x+20))+'px,'+Math.min(H-150,Math.max(64,y-30))+'px)'; } });
  WL.forEach((w,k)=>{ const el=wlEls[k], show=Math.abs(cs-w.s)<.45&&!carousel, [x,y]=project(w.v); el.classList.toggle('hidden',!show); el.style.left=x+'px'; el.style.top=y+'px'; });
}
const ready=document.fonts&&document.fonts.ready?Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))]):Promise.resolve();
ready.then(()=>{ build();
  wlEls=WL.map(w=>{ w.v=new THREE.Vector3(...w.p); const d=document.createElement('div'); d.className='wlabel hidden'+(w.c?' '+w.c:''); d.textContent=w.t; d.setAttribute('aria-hidden','true'); overlay.insertBefore(d,overlay.firstChild); return d; });
  resize(); cs=target(); document.getElementById('loader').classList.add('done'); requestAnimationFrame(frame); if(window.BunlyMap) BunlyMap.init(); window.__bunlyInfo=()=>renderer.info.render; });

})();
