"""Page builders. Every page is generated for both languages; copy lives here and in data/*.json."""
import json, datetime, urllib.parse
from build import (T, PAGES, MENU, REST, JOBS, TRUCKD, AUTHOR, SITE, CITY, E, url, rel, price, tr, page, crumbs,
                   site_nav, footer, lang_link, concept_bar, mobile_nav, author_json, head, SRC, OUT, LOGO)
from art import art, TRUCK

THREE = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" crossorigin defer></script>\n'
FORM_HINT = {'ru': 'Нажимая «Отправить», вы откроете письмо в своём почтовом приложении. Адрес — заглушка концепта.',
             'en': 'Pressing “Send” opens a pre-filled email in your mail app. The address is a concept placeholder.'}


def L(lang, ru, en): return ru if lang == 'ru' else en


def J(x): return json.dumps(x, ensure_ascii=False)


def P(lang, here, path, h=''): return rel(url(lang, here), url(lang, path)) + h


def items_by(cat): return [i for i in MENU['items'] if i['cat'] == cat]


def cat_name(cid, lang): return next(tr(c['name'], lang) for c in MENU['categories'] if c['id'] == cid)


def badges(it, lang, only=('new', 'spicy', 'veg', 'night')):
    return ''.join(f'<span class="badge b-{t}">{tr(MENU["tags"][t], lang)}</span>' for t in it['tags'] if t in only)


def dish_card(it, lang, here, cls='reveal'):
    href = P(lang, here, 'menu/' + it['slug'] + '/')
    return (f'<a class="dish-card {cls}" href="{href}" data-tags="{" ".join(it["tags"])}" style="--c1:{it["c1"]};--c2:{it["c2"]}">'
            f'<div class="dish-art">{art(it["art"], **it.get("artOpt", {}))}<div class="badges">{badges(it, lang)}</div></div>'
            f'<div class="dish-body"><h3>{E(tr(it["name"], lang))}</h3><p>{E(tr(it["desc"], lang))}</p>'
            f'<div class="dish-meta"><b>{price(it["price"], lang)}</b><span>{it["kcal"]} {T[lang]["kcal"]}</span></div></div></a>')


def faq_html(items):
    return ''.join(f'<details><summary>{E(q)}<i aria-hidden="true"></i></summary><div class="ans">{E(a)}</div></details>' for q, a in items)


def field(kind, name, label, lang, req=False, opts=None, ph='', full=False, rows=4, value=''):
    r = ' required' if req else ''; star = ' <span aria-hidden="true">*</span>' if req else ''
    cls = 'field full' if full else 'field'
    if kind == 'select':
        o = ''.join(f'<option value="{E(v)}"{" selected" if v == value else ""}>{E(t)}</option>' for v, t in opts)
        ctrl = f'<select id="f-{name}" name="{name}"{r}>{o}</select>'
    elif kind == 'textarea':
        ctrl = f'<textarea id="f-{name}" name="{name}" rows="{rows}" placeholder="{E(ph)}"{r}></textarea>'
    elif kind == 'check':
        return f'<label class="check full"><input type="checkbox" name="{name}"{r}> <span>{label}</span></label>'
    else:
        ctrl = f'<input id="f-{name}" name="{name}" type="{kind}" placeholder="{E(ph)}" autocomplete="{ {"name": "name", "tel": "tel", "email": "email"}.get(name, "off") }"{r}>'
    return f'<div class="{cls}"><label for="f-{name}">{label}{star}</label>{ctrl}</div>'


def form(lang, fid, mail, subject, fields, submit):
    return (f'<form class="form" id="{fid}" data-mailto="{mail}" data-subject="{E(subject)}" novalidate>'
            f'<div class="form-grid">{"".join(fields)}</div>'
            f'<div class="form-foot"><button class="btn primary" type="submit">{submit}</button><p class="form-note">{FORM_HINT[lang]}</p></div>'
            f'<p class="form-status" role="status" aria-live="polite"></p></form>')


def consent(lang):
    return field('check', 'consent', L(lang, 'Согласен на обработку персональных данных', 'I agree to the processing of my personal data'), lang, req=True)


def json_ld_home():
    u = SITE
    p = {'@type': 'Person', '@id': u + '#author', 'name': AUTHOR['name'], 'alternateName': AUTHOR.get('handle'), 'url': AUTHOR.get('portfolio'),
         'sameAs': [x for x in [(AUTHOR.get('telegram') or {}).get('url'), AUTHOR.get('portfolio')] + [q['url'] for q in AUTHOR.get('projects', [])] if x]}
    return {'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebSite', '@id': u + '#website', 'url': u, 'name': 'Bunly', 'inLanguage': ['ru', 'en'], 'creator': {'@id': u + '#author'}},
        {'@type': 'WebPage', '@id': u + '#webpage', 'url': u, 'isPartOf': {'@id': u + '#website'}, 'name': 'Bunly — 3D concept', 'author': {'@id': u + '#author'}}, p]}


# ------------------------------------------------------------------ HOME
def build_home(lang):
    here = ''; t = T[lang]
    journey = (SRC / 'src' / f'home_journey_{lang}.html').read_text(encoding='utf-8')
    main = (SRC / 'src' / f'home_main_{lang}.html').read_text(encoding='utf-8')
    journey = journey.replace('<a class="btn ghost hide-sm" href="#restaurants">', f'<a class="btn ghost hide-sm" href="{P(lang, here, PAGES["restaurants"])}">')
    import re
    journey = re.sub(r'<button class="lang-btn"[^>]*>(EN|RU)</button>', lang_link(lang, here), journey)
    more_menu = f'<p class="more"><a class="btn outline" href="{P(lang, here, PAGES["menu"])}">{t["all_menu"]}</a></p>\n    </section>\n  </div>\n\n  <section class="block" id="highlights"'
    main = main.replace('    </section>\n  </div>\n\n  <section class="block" id="highlights"', more_menu, 1)
    main = main.replace('<ul class="city-list" id="cityList"></ul>', f'<ul class="city-list" id="cityList"></ul><a class="more-link" href="{P(lang, here, PAGES["restaurants"])}">{t["all_rest"]}</a>', 1)
    assert t['all_menu'] in main and t['all_rest'] in main
    body = journey + '<div id="content">\n' + site_nav(lang, 'home', here) + main + footer(lang, here) + '</div>\n'
    title = L(lang, 'Bunly — фастфуд со вкусом дома (3D-концепт)', 'Bunly — fast food that tastes like home (3D concept)')
    desc = L(lang, 'Концепт сети быстрого питания в Беларуси: 3D-тур от поля до подноса, своя пекарня, открытая кухня, доставка и ночное меню.',
             'A concept fast-food chain in Belarus: a 3D tour from field to tray, its own bakery, an open kitchen, delivery and a night menu.')
    ld = '<script type="application/ld+json" id="ld-json">' + J(json_ld_home()) + '</script>\n'
    scripts = THREE + f'<script src="{rel(url(lang, here), "assets/map.js")}" defer></script>\n<script src="{rel(url(lang, here), "assets/home.js")}" defer></script>\n'
    page(lang, 'home', here, title, desc, body, scripts=scripts, extra_head=ld, home=True)


# ------------------------------------------------------------------ MENU
def build_menu(lang):
    here = PAGES['menu']; t = T[lang]
    cr, ld = crumbs(lang, here, [(t['menu'], None)])
    cats = ''.join(f'<a href="#{c["id"]}">{tr(c["name"], lang)}</a>' for c in MENU['categories'])
    chips = ''.join(f'<button type="button" class="chip" data-filter="{k}" aria-pressed="false">{tr(v, lang)}</button>' for k, v in MENU['tags'].items())
    secs = ''
    for c in MENU['categories']:
        its = items_by(c['id'])
        secs += (f'<section class="menu-cat" id="{c["id"]}"><h2 class="cat-title">{tr(c["name"], lang)} <small>{len(its)}</small></h2>'
                 f'<div class="dish-grid">{"".join(dish_card(i, lang, here) for i in its)}</div></section>')
    body = (f'<section class="page-hero wrap">{cr}<span class="eyebrow">{t["menu"]}</span>'
            f'<h1>{L(lang, "Меню на любое время суток.", "A menu for every hour.")}</h1>'
            f'<p class="lede">{L(lang, "Завтраки до 10:00, бургеры и комбо весь день, короткое ночное меню после 23:00. Нажмите на блюдо, чтобы увидеть состав, аллергены и пищевую ценность.", "Breakfast until 10:00, burgers and combos all day, a short night menu after 23:00. Tap a dish for ingredients, allergens and nutrition.")}</p></section>'
            f'<div class="menu-bar"><div class="wrap"><nav class="cat-links" aria-label="{L(lang, "Категории", "Categories")}">{cats}</nav>'
            f'<div class="chips" role="group" aria-label="{L(lang, "Фильтры", "Filters")}">{chips}</div></div></div>'
            f'<div class="wrap menu-wrap">{secs}<p class="empty" id="menuEmpty" hidden>{L(lang, "С такими фильтрами ничего нет. Снимите один из них.", "Nothing matches these filters. Try removing one.")}</p>'
            f'<p class="note">{L(lang, "Цены, вес и пищевая ценность — заглушки концепта.", "Prices, weights and nutrition are concept placeholders.")}</p></div>')
    page(lang, 'menu', here, L(lang, 'Меню Bunly — бургеры, курица, завтраки и десерты', 'Bunly menu — burgers, chicken, breakfast and desserts'),
         L(lang, 'Полное меню Bunly: бургеры на своих булочках, картошка из белорусского картофеля, завтраки, ночное меню, десерты и напитки.', 'The full Bunly menu: burgers on our own buns, fries from local potatoes, breakfast, the night menu, desserts and drinks.'),
         body, scripts=f'<script src="{rel(url(lang, here), "assets/pages.js")}" defer></script>\n',
         extra_head='<script type="application/ld+json">' + J(ld) + '</script>\n')
    for k, it in enumerate(MENU['items']): build_dish(lang, it, k)


def build_dish(lang, it, k):
    here = 'menu/' + it['slug'] + '/'; t = T[lang]; me = url(lang, here)
    name = tr(it['name'], lang); cn = cat_name(it['cat'], lang)
    cr, ld = crumbs(lang, here, [(t['menu'], PAGES['menu']), (cn, None if False else PAGES['menu'] + '#' + it['cat']), (name, None)])
    tags = ''.join(f'<span class="badge b-{x}">{tr(MENU["tags"][x], lang)}</span>' for x in it['tags'])
    allg = ''.join(f'<li>{tr(MENU["allergens"][a], lang)}</li>' for a in it['allergens']) or f'<li class="none">{L(lang, "Нет основных аллергенов", "No major allergens")}</li>'
    nut = [(L(lang, 'Вес', 'Weight'), f'{it["weight"]} {t["g"]}'), (L(lang, 'Энергия', 'Energy'), f'{it["kcal"]} {t["kcal"]}'),
           (L(lang, 'Белки', 'Protein'), f'{it["protein"]} {t["g"]}'), (L(lang, 'Жиры', 'Fat'), f'{it["fat"]} {t["g"]}'), (L(lang, 'Углеводы', 'Carbs'), f'{it["carbs"]} {t["g"]}')]
    same = [i for i in MENU['items'] if i['cat'] == it['cat'] and i['slug'] != it['slug']]
    other = [i for i in MENU['items'] if i['cat'] != it['cat']]
    rel_items = (same + other[k % max(1, len(other)):] + other)[:3]
    items = MENU['items']; prv, nxt = items[k - 1], items[(k + 1) % len(items)]
    body = (f'<section class="dish-hero wrap">{cr}<div class="dish-split">'
            f'<div class="dish-stage" style="--c1:{it["c1"]};--c2:{it["c2"]}">{art(it["art"], **it.get("artOpt", {}))}</div>'
            f'<div class="dish-info"><span class="eyebrow">{cn}</span><h1>{E(name)}</h1><div class="badges">{tags}</div>'
            f'<p class="lede">{E(tr(it["desc"], lang))}</p>'
            f'<div class="dish-price"><b>{price(it["price"], lang)}</b><span>{it["weight"]} {t["g"]} · {it["kcal"]} {t["kcal"]}</span></div>'
            f'<div class="card-actions"><a class="btn primary" href="{P(lang, here, "", "#app")}">{L(lang, "Заказать в приложении", "Order in the app")}</a>'
            f'<a class="btn outline" href="{P(lang, here, PAGES["restaurants"])}">{t["find"]}</a></div></div></div></section>'
            f'<section class="wrap dish-details">'
            f'<div class="panel"><h2>{L(lang, "Пищевая ценность", "Nutrition")}</h2><dl class="nutri">{"".join(f"<div><dt>{a}</dt><dd>{b}</dd></div>" for a, b in nut)}</dl>'
            f'<p class="note">{L(lang, "На одну порцию. Значения — заглушки концепта.", "Per serving. Values are concept placeholders.")}</p></div>'
            f'<div class="panel"><h2>{L(lang, "Состав", "Ingredients")}</h2><p>{E(tr(it["ingr"], lang))}</p>'
            f'<h3>{L(lang, "Аллергены", "Allergens")}</h3><ul class="allergens">{allg}</ul>'
            f'<p class="note">{L(lang, "Может содержать следы других аллергенов: всё готовится на одной кухне.", "May contain traces of other allergens: everything is cooked in one kitchen.")}</p></div></section>'
            f'<section class="wrap related"><h2 class="sec-sm">{L(lang, "Попробуйте ещё", "You might also like")}</h2><div class="dish-grid">{"".join(dish_card(i, lang, here, "") for i in rel_items)}</div>'
            f'<nav class="pager" aria-label="{L(lang, "Другие блюда", "Other dishes")}"><a href="{P(lang, here, "menu/" + prv["slug"] + "/")}">← {E(tr(prv["name"], lang))}</a>'
            f'<a href="{P(lang, here, PAGES["menu"])}">{t["menu"]}</a><a href="{P(lang, here, "menu/" + nxt["slug"] + "/")}">{E(tr(nxt["name"], lang))} →</a></nav></section>')
    page(lang, 'menu', here, f'{name} — {L(lang, "меню Bunly", "Bunly menu")}', f'{tr(it["desc"], lang)} {price(it["price"], lang)}, {it["kcal"]} {t["kcal"]}.', body,
         extra_head='<script type="application/ld+json">' + J(ld) + '</script>\n')


# ------------------------------------------------------------------ RESTAURANTS
def build_restaurants(lang):
    here = PAGES['restaurants']; t = T[lang]
    cr, ld = crumbs(lang, here, [(t['restaurants'], None)])
    feats = REST['features']
    chips = ''.join(f'<button type="button" class="chip" data-feature="{k}" aria-pressed="false">{tr(v, lang)}</button>' for k, v in feats.items())
    groups = ''
    for ci in sorted({r['city'] for r in REST['restaurants']}, key=lambda c: (c != 0, CITY[lang][c])):
        rs = [r for r in REST['restaurants'] if r['city'] == ci]; cname = CITY[lang][ci]
        cards = ''
        for r in rs:
            addr = tr(r['address'], lang); nm = tr(r['name'], lang)
            q = urllib.parse.quote(f'{addr}, {CITY["ru"][ci]}, Беларусь')
            fl = ''.join(f'<li class="f-{f}">{tr(feats[f], lang)}</li>' for f in r['features'])
            text = f'{nm} {addr} {cname} {CITY["en"][ci]} {CITY["ru"][ci]}'.lower()
            cards += (f'<article class="rest-card" data-city="{ci}" data-features="{" ".join(r["features"])}" data-text="{E(text)}">'
                      f'<h3>{E(nm)}</h3><p class="addr">{E(addr)}, {cname}</p><p class="hours"><span aria-hidden="true">◷</span> {r["hours"] if r["hours"] != "24/7" else L(lang, "Круглосуточно", "Open 24/7")}</p>'
                      f'<ul class="feat">{fl}</ul><a class="btn outline sm" href="https://yandex.by/maps/?text={q}" target="_blank" rel="noopener">{L(lang, "Маршрут", "Directions")}</a></article>')
        groups += f'<section class="rest-city" data-city="{ci}"><h2>{cname} <small>{len(rs)}</small></h2><div class="rest-grid">{cards}</div></section>'
    body = (f'<section class="page-hero wrap compact">{cr}<span class="eyebrow">{t["restaurants"]}</span>'
            f'<h1>{L(lang, "31 ресторан в 13 городах.", "31 restaurants in 13 towns.")}</h1>'
            f'<p class="lede">{L(lang, "Нажмите на город на карте или в списке, чтобы увидеть его адреса. Фильтры помогут найти драйв, доставку или ресторан, который не закрывается.", "Pick a town on the map or in the list to see its addresses. Filters find drive-thrus, delivery or places that never close.")}</p></section>'
            f'<section class="map-sec" id="restaurants" aria-label="{L(lang, "Карта ресторанов", "Restaurant map")}"><div class="map-stage"><canvas id="mapCanvas" aria-hidden="true"></canvas><div class="map-labels" id="mapLabels"></div></div>'
            f'<div class="map-overlay"><div class="map-panel"><span class="eyebrow">{L(lang, "Карта", "Map")}</span><h2 class="sec">{L(lang, "Выберите город.", "Choose a town.")}</h2>'
            f'<div class="map-kpis"><div><b data-count="31">0</b><span>{L(lang, "ресторан", "restaurants")}</span></div><div><b data-count="12">0</b><span>{L(lang, "с драйвом", "drive-thru")}</span></div><div><b data-count="9">0</b><span>{L(lang, "круглосуточно", "open 24/7")}</span></div></div>'
            f'<ul class="city-list" id="cityList"></ul><a class="more-link" href="#list">{L(lang, "К списку адресов ↓", "To the address list ↓")}</a></div></div></section>'
            f'<section class="wrap block rest-sec" id="list"><div class="rest-tools">'
            f'<label class="search"><span class="sr">{L(lang, "Поиск по адресу", "Search by address")}</span><input type="search" id="restSearch" placeholder="{L(lang, "Улица, район или город", "Street, area or town")}"></label>'
            f'<div class="chips" role="group" aria-label="{L(lang, "Фильтры", "Filters")}">{chips}</div>'
            f'<button type="button" class="chip city-chip" id="cityClear" hidden></button><span class="count" id="restCount" aria-live="polite"></span></div>'
            f'<div class="rest-groups">{groups}</div><p class="empty" id="restEmpty" hidden>{L(lang, "Ничего не нашлось. Попробуйте убрать фильтр.", "Nothing found. Try removing a filter.")}</p>'
            f'<p class="note">{L(lang, "Адреса и часы работы — заглушки концепта.", "Addresses and opening hours are concept placeholders.")}</p></section>')
    found = L(lang, 'Найдено: {n}', 'Found: {n}')
    scripts = THREE + f'<script src="{rel(url(lang, here), "assets/map.js")}" defer></script>\n<script src="{rel(url(lang, here), "assets/pages.js")}" defer></script>\n'
    page(lang, 'restaurants', here, L(lang, 'Рестораны Bunly — адреса на карте Беларуси', 'Bunly restaurants — locations across Belarus'),
         L(lang, 'Все рестораны Bunly на 3D-карте: адреса, часы работы, драйв, доставка и круглосуточные рестораны в 13 городах Беларуси.', 'Every Bunly restaurant on a 3D map: addresses, hours, drive-thru, delivery and 24/7 locations in 13 towns.'),
         body.replace('{found}', found), scripts=scripts, extra_head='<script type="application/ld+json">' + J(ld) + '</script>\n')


# ------------------------------------------------------------------ ABOUT
ICONS = {
 'farm': '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 50h48" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M14 50V30l12-10 12 10v20" fill="#E5412D"/><path d="M22 50V38h8v12" fill="#FBF6EE"/><path d="M42 50V22a4 4 0 0 1 8 0v28" fill="#FFC531"/><path d="M10 30l16-13 16 13" stroke="currentColor" stroke-width="3" fill="none" stroke-linejoin="round"/></svg>',
 'bakery': '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 38a20 15 0 0 1 40 0z" fill="#FFC531"/><rect x="10" y="40" width="44" height="6" rx="3" fill="#E5412D"/><path d="M12 48h40a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6z" fill="#FFC531"/><circle cx="26" cy="30" r="1.8" fill="#fff"/><circle cx="34" cy="27" r="1.8" fill="#fff"/><circle cx="40" cy="32" r="1.8" fill="#fff"/></svg>',
 'lab': '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M26 10h12M28 10v14L14 50a4 4 0 0 0 3.5 6h29A4 4 0 0 0 50 50L36 24V10" stroke="currentColor" stroke-width="3" fill="none" stroke-linejoin="round"/><path d="M19 42h26l5 9H14z" fill="#3FA34D"/><circle cx="30" cy="36" r="3" fill="#3FA34D"/></svg>',
 'kitchen': '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="30" width="44" height="22" rx="4" fill="#E5412D"/><rect x="14" y="24" width="36" height="6" rx="3" fill="currentColor"/><path d="M22 18q4-6 0-10M32 18q4-6 0-10M42 18q4-6 0-10" stroke="#FFC531" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="24" cy="41" r="4" fill="#FFC531"/><circle cx="40" cy="41" r="4" fill="#FFC531"/></svg>',
}


def build_about(lang):
    here = PAGES['about']; t = T[lang]
    cr, ld = crumbs(lang, here, [(t['about'], None)])
    stats = [(31, '', L(lang, 'ресторан в 13 городах', 'restaurants in 13 towns')), (60, '+', L(lang, 'ферм-партнёров', 'partner farms')),
             (120000, '', L(lang, 'булочек печём за ночь', 'buns baked every night')), (1400, '', L(lang, 'человек в команде', 'people on the team'))]
    st = ''.join(f'<div class="stat"><b data-count="{n}" data-suffix="{s}">0</b><span>{x}</span></div>' for n, s, x in stats)
    steps = [('farm', L(lang, 'Местные фермы', 'Local farms'), L(lang, 'Картофель, мука, молоко, яйца и говядина приезжают от 60 белорусских хозяйств. Большинство — в пределах дня пути.', 'Potatoes, flour, dairy, eggs and beef come from 60 Belarusian farms, most of them within a day’s drive.'), '85%', L(lang, 'местных продуктов', 'local ingredients')),
             ('bakery', L(lang, 'Своя пекарня', 'Our own bakery'), L(lang, 'Каждую ночь в Минске печём булочки и пирожки и к утру развозим их по всем ресторанам.', 'Every night in Minsk we bake buns and pies and deliver them to every restaurant by morning.'), '120 000', L(lang, 'булочек за ночь', 'buns a night')),
             ('lab', L(lang, 'Лаборатория качества', 'Quality lab'), L(lang, 'Каждую партию проверяем по 14 пунктам: от цвета булочки до веса котлеты и температуры хранения.', 'Every batch is checked on 14 points, from bun colour to patty weight and storage temperature.'), '14', L(lang, 'проверок на партию', 'checks per batch')),
             ('kitchen', L(lang, 'Открытая кухня', 'An open kitchen'), L(lang, 'Бургер собирают при вас примерно за две минуты. По выходным на кухню можно прийти с экскурсией.', 'Your burger is built in front of you in about two minutes. On weekends you can tour the kitchen.'), L(lang, '2 мин', '2 min'), L(lang, 'на сборку бургера', 'to build a burger'))]
    sp = ''.join(f'<article class="step reveal"><div class="ic">{ICONS[i]}</div><h3>{a}</h3><p>{b}</p><div class="fact"><b>{c}</b><span>{d}</span></div></article>' for i, a, b, c, d in steps)
    tl = [('2019', L(lang, 'Первый ресторан на Немиге', 'First restaurant on Nemiga'), L(lang, 'Двенадцать столиков, один гриль и очередь до угла в первый же день.', 'Twelve tables, one grill and a queue round the corner on day one.')),
          ('2020', L(lang, 'Доставка и приложение', 'Delivery and the app'), L(lang, 'Запустили курьеров и приложение с отслеживанием заказа на карте.', 'We launched couriers and an app with live order tracking.')),
          ('2021', L(lang, 'Своя пекарня', 'Our own bakery'), L(lang, 'Перестали покупать булочки и начали печь их сами.', 'We stopped buying buns and started baking our own.')),
          ('2022', L(lang, 'Драйв и 24/7', 'Drive-thru and 24/7'), L(lang, 'Первые рестораны с драйвом и ночным меню.', 'The first drive-thru restaurants and the night menu.')),
          ('2023', L(lang, 'Фудтрак', 'The food truck'), L(lang, 'Bunly на колёсах поехал по городам, где нет ресторана.', 'Bunly on wheels started touring towns without a restaurant.')),
          ('2025', L(lang, 'Bunly Клуб', 'Bunly Club'), L(lang, 'Подписка с бесплатной доставкой и напитком каждый день.', 'A subscription with free delivery and a daily drink.')),
          ('2026', L(lang, '31 ресторан', '31 restaurants'), L(lang, 'От Бреста до Витебска — и это только начало.', 'From Brest to Vitebsk, and we are just getting started.'))]
    tlh = ''.join(f'<li class="reveal"><span class="yr">{y}</span><div><h3>{a}</h3><p>{b}</p></div></li>' for y, a, b in tl)
    partners = L(lang, ['Зелёная долина', 'Неманский молочник', 'Северная мельница', 'Старый дуб', 'Солнечная несушка', 'Ягодный край', 'Липовый мёд', 'Чистая вода', 'Поле и камень', 'Корни Полесья'],
                 ['Green Valley Farms', 'Neman Dairy Co.', 'Northmill Grain', 'Old Oak Beef', 'Sunny Hen Eggs', 'Berry Lane', 'Linden Honey', 'Clearwater Drinks', 'Field & Stone', 'Polesie Roots'])
    mq = ''.join(f'<span><i></i>{p}</span>' for p in partners) + ''.join(f'<span aria-hidden="true"><i></i>{p}</span>' for p in partners)
    vals = [(L(lang, 'Местное — значит свежее', 'Local means fresh'), L(lang, 'Чем короче путь от поля, тем вкуснее еда и тем меньше лишнего в составе.', 'The shorter the trip from the field, the better the taste and the shorter the ingredient list.')),
            (L(lang, 'Открыто — значит честно', 'Open means honest'), L(lang, 'Кухня видна из зала, состав и аллергены каждого блюда — на сайте и в приложении.', 'The kitchen is visible from the dining room; every dish lists its ingredients and allergens.')),
            (L(lang, 'Быстро, но без спешки', 'Fast, never rushed'), L(lang, 'Две минуты на бургер — это про хорошо отлаженную кухню, а не про экономию на продуктах.', 'Two minutes per burger is about a well-run kitchen, not cutting corners.'))]
    vh = ''.join(f'<article class="value reveal"><span class="num">0{i + 1}</span><h3>{a}</h3><p>{b}</p></article>' for i, (a, b) in enumerate(vals))
    body = (f'<section class="page-hero wrap">{cr}<span class="eyebrow">{t["about"]}</span><h1>{L(lang, "Кормим так, как кормили бы дома.", "We feed people the way we would at home.")}</h1>'
            f'<p class="lede">{L(lang, "Bunly начинался с одного ресторана в Минске и простой идеи: фастфуд может быть местным, честным и очень вкусным. Вот как это устроено.", "Bunly started with one restaurant in Minsk and a simple idea: fast food can be local, honest and really tasty. Here is how it works.")}</p></section>'
            f'<div class="wrap"><div class="stats">{st}</div></div>'
            f'<section class="wrap block"><span class="eyebrow">{L(lang, "С поля на поднос", "Field to tray")}</span><h2 class="sec">{L(lang, "Четыре шага до вашего бургера.", "Four steps to your burger.")}</h2><div class="steps">{sp}</div></section>'
            f'<div class="marquee" aria-label="{L(lang, "Партнёры (вымышленные названия)", "Partners (invented names)")}"><p class="marquee-label">{L(lang, "Выращиваем и готовим вместе с 60+ местными партнёрами", "Grown and made with 60+ local partners")}</p><div class="mtrack">{mq}</div></div>'
            f'<section class="wrap block"><span class="eyebrow">{L(lang, "История", "Story")}</span><h2 class="sec">{L(lang, "Как мы росли.", "How we grew.")}</h2><ol class="timeline">{tlh}</ol></section>'
            f'<section class="wrap block" style="padding-top:0"><span class="eyebrow">{L(lang, "Ценности", "Values")}</span><h2 class="sec">{L(lang, "Во что мы верим.", "What we believe.")}</h2><div class="values">{vh}</div></section>'
            f'<section class="wrap"><div class="band"><div><h2>{L(lang, "Приходите на экскурсию по кухне.", "Come and tour the kitchen.")}</h2><p>{L(lang, "Бесплатно по выходным для семей и школьных классов: гриль, фритюр и свой собственный бургер.", "Free on weekends for families and school groups: the grill, the fryers and a burger you build yourself.")}</p></div>'
            f'<div class="btns"><a class="btn white" href="{P(lang, here, PAGES["contacts"], "?topic=tour#form")}">{L(lang, "Записаться", "Book a tour")}</a><a class="btn line" href="{P(lang, here, PAGES["careers"])}">{L(lang, "Работать у нас", "Work with us")}</a></div></div></section>')
    page(lang, 'about', here, L(lang, 'О Bunly — местные фермы, своя пекарня и открытая кухня', 'About Bunly — local farms, our own bakery and an open kitchen'),
         L(lang, 'История Bunly: от первого ресторана на Немиге до 31 адреса, своя пекарня, лаборатория качества и экскурсии по кухне.', 'The Bunly story: from the first restaurant on Nemiga to 31 locations, our bakery, quality lab and kitchen tours.'),
         body, extra_head='<script type="application/ld+json">' + J(ld) + '</script>\n')


# ------------------------------------------------------------------ FOOD TRUCK
def build_truck(lang):
    here = PAGES['truck']; t = T[lang]
    cr, ld = crumbs(lang, here, [(t['truck'], None)])
    MON = {'ru': ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
           'en': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']}
    def dfmt(s):
        d = datetime.date.fromisoformat(s)
        return f'{d.day} {MON["ru"][d.month - 1]}' if lang == 'ru' else f'{MON["en"][d.month - 1]} {d.day}'
    rows = ''.join(f'<li class="reveal"><time datetime="{s}">{dfmt(s)}</time><b>{ru if lang == "ru" else en}</b><span>{tr(ev, lang)}</span></li>' for s, ru, en, ev in TRUCKD['stops'])
    facts = [('40+', L(lang, 'городов за сезон', 'towns a season')), ('300', L(lang, 'порций в час', 'meals an hour')), ('8 ч', L(lang, 'работы без розетки', 'hours off-grid')) if lang == 'ru' else ('8 h', 'hours off-grid'), ('4', L(lang, 'человека в команде', 'people on board'))]
    fh = ''.join(f'<div class="stat"><b>{a}</b><span>{b}</span></div>' for a, b in facts)
    picks = [i for i in MENU['items'] if i['slug'] in ('homestead-classic', 'golden-fries', 'crispy-chicken-burger', 'strawberry-swirl')]
    how = [(L(lang, 'Оставьте заявку', 'Send a request'), L(lang, 'Дата, город и примерное число гостей. Ответим в течение дня.', 'Date, town and roughly how many guests. We reply within a day.')),
           (L(lang, 'Согласуем меню', 'Agree the menu'), L(lang, 'Классика, детские боксы или специальное меню под ваш праздник.', 'The classics, kids boxes or a special menu for your event.')),
           (L(lang, 'Приезжаем и кормим', 'We arrive and serve'), L(lang, 'Нужна только ровная площадка 8×4 метра. Остальное привезём сами.', 'All we need is a flat 8×4 m spot. We bring everything else.'))]
    hh = ''.join(f'<li class="reveal"><span class="n">{i + 1}</span><h3>{a}</h3><p>{b}</p></li>' for i, (a, b) in enumerate(how))
    guests = [('', L(lang, 'Выберите', 'Choose'))] + [(g, g) for g in (L(lang, 'до 100', 'up to 100'), '100–300', '300–1000', L(lang, 'больше 1000', 'over 1000'))]
    fields = [field('text', 'name', L(lang, 'Имя', 'Name'), lang, req=True), field('tel', 'tel', L(lang, 'Телефон', 'Phone'), lang, req=True, ph='+375 ...'),
              field('email', 'email', 'Email', lang), field('date', 'date', L(lang, 'Дата события', 'Event date'), lang, req=True),
              field('text', 'town', L(lang, 'Город или место', 'Town or venue'), lang, req=True), field('select', 'guests', L(lang, 'Гостей', 'Guests'), lang, opts=guests),
              field('textarea', 'message', L(lang, 'Расскажите о празднике', 'Tell us about the event'), lang, full=True, ph=L(lang, 'Формат, время, пожелания по меню', 'Format, timing, menu wishes')), consent(lang)]
    faq = faq_html([(L(lang, 'Сколько стоит заказать фудтрак?', 'How much does it cost to book the truck?'), L(lang, 'Выезд по Минской области бесплатный от 150 порций. Для других областей считаем отдельно.', 'Within the Minsk region the visit is free from 150 meals. Other regions are priced individually.')),
                    (L(lang, 'Нужно ли электричество?', 'Do you need electricity?'), L(lang, 'Нет, у фудтрака свой генератор и запас воды на 8 часов работы.', 'No, the truck has its own generator and water for 8 hours.')),
                    (L(lang, 'Можно оплатить картой?', 'Can guests pay by card?'), L(lang, 'Да, принимаем карты, оплату телефоном и купоны из приложения.', 'Yes: cards, phone payments and app coupons.')),
                    (L(lang, 'За сколько нужно бронировать?', 'How far ahead should I book?'), L(lang, 'Летом лучше за 3–4 недели, в остальное время хватит недели.', 'In summer 3–4 weeks ahead, otherwise a week is enough.'))])
    body = (f'<section class="page-hero wrap split">{cr}<div class="hero-grid"><div><span class="eyebrow">{t["truck"]}</span><h1>{L(lang, "Bunly на колёсах.", "Bunly on wheels.")}</h1>'
            f'<p class="lede">{L(lang, "Фудтрак с полным меню комбо, детскими боксами и игрушками. Летом ездит по городам без ресторана, весь год — на фестивали и праздники.", "A food truck with the full combo menu, kids boxes and toys. In summer it tours towns without a restaurant, all year round it comes to festivals and parties.")}</p>'
            f'<div class="card-actions"><a class="btn primary" href="#book">{L(lang, "Заказать фудтрак", "Book the truck")}</a><a class="btn outline" href="#tour">{L(lang, "Где мы будем", "Where we’ll be")}</a></div></div>'
            f'<div class="truck-art">{TRUCK}</div></div></section>'
            f'<div class="wrap"><div class="stats">{fh}</div></div>'
            f'<section class="wrap block" id="tour"><span class="eyebrow">{tr(TRUCKD["season"], lang)}</span><h2 class="sec">{L(lang, "Где ловить фудтрак.", "Where to catch the truck.")}</h2><ol class="schedule">{rows}</ol>'
            f'<p class="note">{L(lang, "Даты и события — заглушки концепта.", "Dates and events are concept placeholders.")}</p></section>'
            f'<section class="wrap block" style="padding-top:0"><span class="eyebrow">{t["menu"]}</span><h2 class="sec">{L(lang, "Что есть на борту.", "What’s on board.")}</h2><div class="dish-grid">{"".join(dish_card(i, lang, here) for i in picks)}</div></section>'
            f'<section class="wrap block" style="padding-top:0"><span class="eyebrow">{L(lang, "Как это работает", "How it works")}</span><h2 class="sec">{L(lang, "Три шага до праздника.", "Three steps to the party.")}</h2><ol class="how">{hh}</ol></section>'
            f'<section class="wrap block form-sec" id="book"><div><span class="eyebrow">{L(lang, "Заявка", "Request")}</span><h2 class="sec">{L(lang, "Пригласите фудтрак.", "Invite the truck.")}</h2>'
            f'<p class="lede">{L(lang, "Фестиваль, корпоратив, выпускной или день города — расскажите, и мы предложим меню.", "A festival, company party, graduation or city day: tell us and we’ll suggest a menu.")}</p></div>'
            + form(lang, 'bookForm', 'events@bunly.example', L(lang, 'Заявка на фудтрак', 'Food truck request'), fields, L(lang, 'Отправить заявку', 'Send request')) +
            f'</section><section class="wrap block faq" style="padding-top:0"><div><span class="eyebrow">{t["faq"]}</span><h2 class="sec">{L(lang, "Частые вопросы.", "Common questions.")}</h2></div><div>{faq}</div></section>')
    page(lang, 'truck', here, L(lang, 'Фудтрак Bunly — летний тур и заказ на праздник', 'Bunly food truck — summer tour and event booking'),
         L(lang, 'Фудтрак Bunly: расписание летнего тура по городам Беларуси, меню на борту и заявка на фестиваль или праздник.', 'The Bunly food truck: summer tour dates across Belarus, the on-board menu and booking for festivals and parties.'),
         body, scripts=f'<script src="{rel(url(lang, here), "assets/pages.js")}" defer></script>\n', extra_head='<script type="application/ld+json">' + J(ld) + '</script>\n')


# ------------------------------------------------------------------ CAREERS
def build_careers(lang):
    here = PAGES['careers']; t = T[lang]
    cr, ld = crumbs(lang, here, [(t['careers'], None)])
    perks = [('🎓', L(lang, 'Обучим с нуля', 'Training from zero'), L(lang, 'Две недели с наставником, оплачиваемые с первого дня.', 'Two weeks with a mentor, paid from day one.')),
             ('🕐', L(lang, 'Гибкий график', 'Flexible hours'), L(lang, 'Смены от 4 часов, можно совмещать с учёбой.', 'Shifts from 4 hours, easy to combine with studies.')),
             ('🍔', L(lang, 'Питание за наш счёт', 'Free meals'), L(lang, 'Обед из меню на каждой смене.', 'A meal from the menu every shift.')),
             ('📈', L(lang, 'Рост внутри', 'Grow with us'), L(lang, 'Половина директоров ресторанов начинали на кассе.', 'Half of our restaurant managers started at the till.')),
             ('🌙', L(lang, 'Ночные надбавки', 'Night bonus'), L(lang, '+20% за ночные смены и такси домой.', '+20% for night shifts and a taxi home.')),
             ('📄', L(lang, 'Официально', 'Proper contract'), L(lang, 'Трудовой договор, отпуск и больничные.', 'Employment contract, paid leave and sick days.'))]
    ph = ''.join(f'<article class="perk reveal"><span class="em" aria-hidden="true">{e}</span><h3>{a}</h3><p>{b}</p></article>' for e, a, b in perks)
    city_opts = [('', L(lang, 'Все города', 'All towns'))] + [(str(i), CITY[lang][i]) for i in range(13) if i != 11]
    sel = f'<label class="select"><span class="sr">{L(lang, "Город", "Town")}</span><select id="jobCity">{"".join(f"<option value={chr(34)}{v}{chr(34)}>{n}</option>" for v, n in city_opts)}</select></label>'
    chips = ''.join(f'<button type="button" class="chip" data-type="{k}" aria-pressed="false">{tr(v, lang)}</button>' for k, v in JOBS['types'].items())
    jobs = ''
    for j in JOBS['jobs']:
        cities = ', '.join(CITY[lang][c] for c in j['cities'])
        reqs = ''.join(f'<li>{E(r)}</li>' for r in j['reqs'][lang])
        jobs += (f'<details class="job" data-type="{j["type"]}" data-cities="{" ".join(map(str, j["cities"]))}" id="job-{j["id"]}"><summary>'
                 f'<div><h3>{E(tr(j["title"], lang))}</h3><p class="meta"><span>{tr(JOBS["types"][j["type"]], lang)}</span><span>{tr(j["salary"], lang)}</span><span>{tr(j["schedule"], lang)}</span></p></div><i aria-hidden="true"></i></summary>'
                 f'<div class="job-body"><p>{E(tr(j["about"], lang))}</p><ul>{reqs}</ul><p class="cities"><b>{L(lang, "Города:", "Towns:")}</b> {cities}</p>'
                 f'<button type="button" class="btn primary" data-apply="{j["id"]}">{L(lang, "Откликнуться", "Apply")}</button></div></details>')
    job_opts = [('', L(lang, 'Выберите', 'Choose'))] + [(j['id'], tr(j['title'], lang)) for j in JOBS['jobs']] + [('other', L(lang, 'Другое', 'Other'))]
    fields = [field('text', 'name', L(lang, 'Имя и фамилия', 'Full name'), lang, req=True), field('tel', 'tel', L(lang, 'Телефон', 'Phone'), lang, req=True, ph='+375 ...'),
              field('select', 'city', L(lang, 'Город', 'Town'), lang, req=True, opts=[('', L(lang, 'Выберите', 'Choose'))] + city_opts[1:]),
              field('select', 'job', L(lang, 'Вакансия', 'Position'), lang, req=True, opts=job_opts),
              field('textarea', 'message', L(lang, 'Пара слов о себе', 'A few words about you'), lang, full=True, ph=L(lang, 'Опыт, удобный график, когда можете выйти', 'Experience, preferred hours, when you can start')), consent(lang)]
    body = (f'<section class="page-hero wrap">{cr}<span class="eyebrow">{t["careers"]}</span><h1>{L(lang, "Приходите работать в Bunly.", "Come and work at Bunly.")}</h1>'
            f'<p class="lede">{L(lang, "Кухня, зал, доставка и офис. Многие у нас начинали с первой работы — и остались надолго.", "Kitchen, front of house, delivery and office. Many of us started here as a first job and stayed.")}</p></section>'
            f'<section class="wrap"><div class="perks">{ph}</div></section>'
            f'<section class="wrap block" id="jobs"><span class="eyebrow">{L(lang, "Вакансии", "Open positions")}</span><h2 class="sec">{L(lang, "Кого мы ищем.", "Who we’re looking for.")}</h2>'
            f'<div class="rest-tools">{sel}<div class="chips" role="group" aria-label="{L(lang, "Направление", "Area")}">{chips}</div><span class="count" id="jobCount" aria-live="polite"></span></div>'
            f'<div class="jobs">{jobs}</div><p class="empty" id="jobEmpty" hidden>{L(lang, "В этом городе таких вакансий пока нет. Оставьте анкету — позовём, когда появятся.", "No such positions in this town yet. Leave your details and we’ll call when one opens.")}</p></section>'
            f'<section class="wrap block form-sec" id="apply"><div><span class="eyebrow">{L(lang, "Анкета", "Application")}</span><h2 class="sec">{L(lang, "Откликнитесь за минуту.", "Apply in a minute.")}</h2>'
            f'<p class="lede">{L(lang, "Резюме не обязательно. Перезвоним в течение двух рабочих дней.", "No CV needed. We’ll call you back within two working days.")}</p></div>'
            + form(lang, 'applyForm', 'jobs@bunly.example', L(lang, 'Отклик на вакансию', 'Job application'), fields, L(lang, 'Отправить анкету', 'Send application')) + '</section>')
    page(lang, 'careers', here, L(lang, 'Работа в Bunly — вакансии в ресторанах и доставке', 'Careers at Bunly — jobs in restaurants and delivery'),
         L(lang, 'Вакансии Bunly: повар, кассир, курьер, ночная смена, менеджер, пекарь. Обучение с нуля, гибкий график и питание.', 'Jobs at Bunly: cook, cashier, courier, night crew, manager, baker. Training from zero, flexible hours and free meals.'),
         body, scripts=f'<script src="{rel(url(lang, here), "assets/pages.js")}" defer></script>\n', extra_head='<script type="application/ld+json">' + J(ld) + '</script>\n')


# ------------------------------------------------------------------ CONTACTS
FAQ_ALL = {
 'ru': [('Откуда ваши продукты?', 'Большая часть — от белорусских ферм и производителей: картофель, мука, молоко, яйца и говядина. Булочки, соусы и пирожки каждую ночь делает наша пекарня.'),
        ('До скольки подают завтраки?', 'Завтраки — до 10:00 во всех ресторанах. Обеденные комбо — с 12:00 до 16:00, ночное меню — с 23:00 в круглосуточных ресторанах.'),
        ('Как быстро доставка?', 'В среднем 28 минут. В приложении курьер виден на карте, так что вы всегда знаете, когда ждать пакет.'),
        ('Что делать, если в заказе чего-то не хватает?', 'Напишите в чат приложения или через форму на этой странице — вернём деньги или привезём недостающее.'),
        ('Можно записаться на экскурсию на кухню?', 'Да. По выходным экскурсии бесплатны для семей и школьных классов. Выберите тему «Экскурсия на кухню» в форме выше.'),
        ('Есть ли что-то при аллергии или диете?', 'У каждого блюда в меню указаны аллергены и пищевая ценность. Есть растительная котлета, а большинство бургеров можно заказать без булочки.'),
        ('Как работает Bunly Клуб?', 'Это подписка в приложении: бесплатная доставка от 15 руб., напиток в подарок каждый день и двойные баллы. Отменить можно в любой момент.'),
        ('Можно ли провести у вас детский праздник?', 'Да, в ресторанах с детской зоной. Напишите нам, и администратор подберёт время.'),
        ('Принимаете ли вы карты и оплату телефоном?', 'Да, во всех ресторанах, в драйве, у курьеров и в фудтраке.'),
        ('Как стать поставщиком?', 'Выберите тему «Сотрудничество» в форме и расскажите о хозяйстве или продукте.')],
 'en': [('Where do your ingredients come from?', 'Most come from Belarusian farms and producers: potatoes, flour, dairy, eggs and beef. Our own bakery makes the buns, sauces and pies every night.'),
        ('Until when is breakfast served?', 'Until 10:00 in every restaurant. Lunch combos run from 12:00 to 16:00, the night menu starts at 23:00 in 24/7 locations.'),
        ('How fast is delivery?', 'About 28 minutes on average. The app shows the courier on the map so you always know when to expect the bag.'),
        ('Something is missing from my order. What now?', 'Message us in the app chat or through the form on this page and we’ll refund you or bring what’s missing.'),
        ('Can I book a kitchen tour?', 'Yes. Tours are free on weekends for families and school groups. Choose “Kitchen tour” in the form above.'),
        ('Is there something for allergies or diets?', 'Every dish on the menu lists its allergens and nutrition. There is a plant-based patty, and most burgers can be ordered without the bun.'),
        ('How does Bunly Club work?', 'It’s an in-app subscription: free delivery over 15 BYN, a free daily drink and double points. Cancel any time.'),
        ('Can we hold a kids’ party with you?', 'Yes, in restaurants with a kids area. Write to us and the manager will find a time.'),
        ('Do you take cards and phone payments?', 'Yes, everywhere: restaurants, drive-thru, couriers and the food truck.'),
        ('How do I become a supplier?', 'Choose “Partnership” in the form and tell us about your farm or product.')]}


def build_contacts(lang):
    here = PAGES['contacts']; t = T[lang]
    cr, ld = crumbs(lang, here, [(t['contacts'], None)])
    cards = [('☎', L(lang, 'Горячая линия', 'Hotline'), '+375 17 000-00-00', 'tel:+375170000000', L(lang, 'Ежедневно с 8:00 до 23:00', 'Daily 8:00–23:00')),
             ('✉', L(lang, 'Почта для гостей', 'Guest email'), 'hello@bunly.example', 'mailto:hello@bunly.example', L(lang, 'Отвечаем в течение дня', 'We reply within a day')),
             ('⌂', L(lang, 'Главный офис', 'Head office'), L(lang, 'Минск, пр-т Победителей, 9', 'Minsk, Pobediteley Ave 9'), None, L(lang, 'Пн–Пт, 9:00–18:00', 'Mon–Fri, 9:00–18:00')),
             ('✦', L(lang, 'Партнёрам и прессе', 'Partners and press'), 'partners@bunly.example', 'mailto:partners@bunly.example', L(lang, 'Поставки, совместные проекты, интервью', 'Supply, collaborations, interviews'))]
    ch = ''.join(f'<article class="contact reveal"><span class="em" aria-hidden="true">{e}</span><h3>{a}</h3>' + (f'<a href="{h}">{E(b)}</a>' if h else f'<p class="big">{E(b)}</p>') + f'<p>{c}</p></article>' for e, a, b, h, c in cards)
    topics = [('', L(lang, 'Выберите тему', 'Choose a topic')), ('review', L(lang, 'Отзыв о ресторане', 'Restaurant feedback')), ('order', L(lang, 'Вопрос о заказе', 'Order question')),
              ('tour', L(lang, 'Экскурсия на кухню', 'Kitchen tour')), ('partner', L(lang, 'Сотрудничество', 'Partnership')), ('press', L(lang, 'Пресса', 'Press'))]
    rests = [('', L(lang, 'Не важно', 'Any'))] + [(r['id'], f'{tr(r["name"], lang)} — {CITY[lang][r["city"]]}') for r in REST['restaurants']]
    fields = [field('select', 'topic', L(lang, 'Тема', 'Topic'), lang, req=True, opts=topics), field('select', 'restaurant', L(lang, 'Ресторан', 'Restaurant'), lang, opts=rests),
              field('text', 'name', L(lang, 'Имя', 'Name'), lang, req=True), field('email', 'email', 'Email', lang, req=True),
              field('textarea', 'message', L(lang, 'Сообщение', 'Message'), lang, req=True, full=True, rows=5), consent(lang)]
    body = (f'<section class="page-hero wrap">{cr}<span class="eyebrow">{t["contacts"]}</span><h1>{L(lang, "Мы на связи.", "We’re listening.")}</h1>'
            f'<p class="lede">{L(lang, "Позвоните, напишите или оставьте сообщение в форме. Все контакты — заглушки концепта.", "Call, email or use the form. All contact details are concept placeholders.")}</p></section>'
            f'<section class="wrap"><div class="contacts">{ch}</div></section>'
            f'<section class="wrap block form-sec" id="form"><div><span class="eyebrow">{L(lang, "Обратная связь", "Feedback")}</span><h2 class="sec">{L(lang, "Напишите нам.", "Write to us.")}</h2>'
            f'<p class="lede">{L(lang, "Похвалить, пожаловаться, записаться на экскурсию или предложить сотрудничество — всё сюда.", "Praise, complaints, kitchen tours or partnership ideas: it all goes here.")}</p></div>'
            + form(lang, 'contactForm', 'hello@bunly.example', L(lang, 'Сообщение с сайта Bunly', 'Message from the Bunly site'), fields, L(lang, 'Отправить', 'Send')) +
            f'</section><section class="wrap block faq" id="faq" style="padding-top:0"><div><span class="eyebrow">{t["faq"]}</span><h2 class="sec">{L(lang, "Ответы на частые вопросы.", "Answers to common questions.")}</h2></div><div>{faq_html(FAQ_ALL[lang])}</div></section>')
    faq_ld = {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in FAQ_ALL[lang]]}
    page(lang, 'contacts', here, L(lang, 'Контакты Bunly — горячая линия, почта и обратная связь', 'Contact Bunly — hotline, email and feedback'),
         L(lang, 'Контакты Bunly: горячая линия, почта, главный офис в Минске, форма обратной связи и ответы на частые вопросы.', 'Contact Bunly: hotline, email, the Minsk head office, a feedback form and answers to common questions.'),
         body, scripts=f'<script src="{rel(url(lang, here), "assets/pages.js")}" defer></script>\n',
         extra_head='<script type="application/ld+json">' + J(ld) + '</script>\n<script type="application/ld+json">' + J(faq_ld) + '</script>\n')


# ------------------------------------------------------------------ 404
def build_404():
    lang = 'ru'; t = T[lang]; here = ''
    out = head(lang, here, '404 — Bunly', L(lang, 'Страница не найдена', 'Page not found'), 'assets/site.css',
               f'<base href="{SITE}">\n<meta name="robots" content="noindex">\n').replace('<meta name="robots" content="index,follow,max-image-preview:large">\n', '')
    picks = ''.join(f'<a class="btn outline" href="{url(lang, PAGES[k])}">{t[k]}</a>' for k in ('menu', 'restaurants', 'contacts'))
    body = (f'<section class="page-hero wrap nf"><p class="nf-big" aria-hidden="true">4<span>🍔</span>4</p><h1>Такой страницы нет в меню</h1>'
            f'<p class="lede">Возможно, ссылка устарела или в адресе опечатка. Вернитесь на главную — там всё горячее.</p>'
            f'<div class="card-actions"><a class="btn primary" href="./">На главную</a>{picks}</div>'
            f'<p class="note" lang="en">Page not found. <a href="en/">Go to the English homepage →</a></p></section>')
    out += '<body class="inner">\n' + concept_bar(lang) + site_nav(lang, None, here) + '<main id="main">' + body + '</main>\n' + footer(lang, here) + mobile_nav(lang, None, here) + author_json()
    out += '<script src="assets/site.js" defer></script>\n</body>\n</html>\n'
    (OUT / '404.html').write_text(out, encoding='utf-8')


def build_all(lang):
    build_home(lang); build_menu(lang); build_restaurants(lang); build_about(lang); build_truck(lang); build_careers(lang); build_contacts(lang)
