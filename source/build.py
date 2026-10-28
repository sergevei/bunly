#!/usr/bin/env python3
"""Build the multi-page Bunly site into the repository root (the folder above source/).

    python3 source/build.py

Reads source/data/*.json and source/src/*, writes index.html, en/, menu/, restaurants/, about/, food-truck/,
careers/, contacts/, 404.html, assets/ and sitemap.xml. Pure Python 3, no dependencies.
"""
import json, os, re, shutil, html, datetime, pathlib
from art import art, TRUCK

SRC = pathlib.Path(__file__).resolve().parent
OUT = SRC.parent
D = lambda n: json.loads((SRC / 'data' / n).read_text(encoding='utf-8'))
AUTHOR = json.loads((OUT / 'author.json').read_text(encoding='utf-8'))
MENU, REST, JOBS, TRUCKD = D('menu.json'), D('restaurants.json'), D('jobs.json'), D('truck.json')
SITE = AUTHOR['site']['url'].rstrip('/') + '/'
TODAY = datetime.date.today().isoformat()
LANGS = ('ru', 'en')
E = html.escape

CITY = {'ru': ['Минск', 'Брест', 'Гродно', 'Витебск', 'Гомель', 'Могилёв', 'Барановичи', 'Бобруйск', 'Пинск', 'Орша', 'Лида', 'Жлобин', 'Дзержинск'],
        'en': ['Minsk', 'Brest', 'Grodno', 'Vitebsk', 'Gomel', 'Mogilev', 'Baranovichi', 'Bobruisk', 'Pinsk', 'Orsha', 'Lida', 'Zhlobin', 'Dzerzhinsk']}

PAGES = {'home': '', 'menu': 'menu/', 'restaurants': 'restaurants/', 'about': 'about/', 'truck': 'food-truck/', 'careers': 'careers/', 'contacts': 'contacts/'}
NAV = ['menu', 'restaurants', 'about', 'truck', 'careers', 'contacts']

T = {
 'ru': dict(menu='Меню', restaurants='Рестораны', about='О нас', truck='Фудтрак', careers='Работа', contacts='Контакты', home='Главная',
   order='Заказать', find='Найти ресторан', other='EN', other_aria='Switch to English', other_full='English', open_menu='Открыть меню', close_menu='Закрыть меню',
   concept='Bunly — концепт сети быстрого питания. Меню, цены, адреса, цифры и отзывы на этой странице — заглушки.', concept_b='Концепт',
   tagline='Фастфуд со вкусом дома. Местные фермы, своя пекарня и открытая кухня.', help='Помощь', company='Компания',
   delivery='Доставка и приложение', faq='Вопросы', copy='© 2026 Bunly (концепт). Bunly — вымышленный бренд, созданный как дизайн-концепт. Все названия, цены, адреса, цифры и отзывы — заглушки и не описывают реальную компанию.',
   about_dev='О разработчике', breakfast='Завтраки до 10:00', night='Ночное меню с 23:00', app='Скачать приложение →',
   nav_sub=dict(home='3D-тур', menu='Бургеры и не только', restaurants='31 адрес', about='С поля на поднос', truck='Летний тур', careers='Вакансии', contacts='Связаться'),
   cur='руб.', kcal='ккал', g='г', crumbs='Навигация', all_menu='Всё меню →', all_rest='Все адреса →', mobile='Мобильное меню', main='Главное меню'),
 'en': dict(menu='Menu', restaurants='Restaurants', about='About', truck='Food truck', careers='Careers', contacts='Contacts', home='Home',
   order='Order now', find='Find a restaurant', other='RU', other_aria='Переключить на русский', other_full='Русский', open_menu='Open menu', close_menu='Close menu',
   concept='Bunly is a concept brand for a fast-food chain. Menu, prices, locations, numbers and reviews shown here are placeholders.', concept_b='Concept',
   tagline='Fast food that tastes like home. Local farms, our own bakery and an open kitchen.', help='Help', company='Company',
   delivery='Delivery and app', faq='FAQ', copy='© 2026 Bunly (concept). Bunly is a fictional brand created as a design concept. All names, prices, locations, figures and reviews are placeholders and do not describe a real company.',
   about_dev='About the developer', breakfast='Breakfast until 10:00', night='Night menu from 23:00', app='Get the app →',
   nav_sub=dict(home='3D tour', menu='Burgers and more', restaurants='31 places', about='Field to tray', truck='Summer tour', careers='Jobs', contacts='Get in touch'),
   cur='BYN', kcal='kcal', g='g', crumbs='Breadcrumbs', all_menu='Full menu →', all_rest='All locations →', mobile='Mobile', main='Main'),
}

LOGO = ('<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="10" fill="#E5412D"/><path d="M7 15.2a9 7.4 0 0 1 18 0z" fill="#FFC531"/>'
        '<rect x="6.5" y="17" width="19" height="2.6" rx="1.3" fill="#fff"/><path d="M7.5 21.4h17a3.6 3.6 0 0 1-3.6 3.6H11.1a3.6 3.6 0 0 1-3.6-3.6z" fill="#FFC531"/></svg>')
MENU_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>'


def url(lang, path):
    return ('en/' if lang == 'en' else '') + path


def rel(frm, to):
    """Relative link between two site paths like 'en/menu/' and 'restaurants/' (folders end with '/')."""
    depth = frm.count('/')
    r = '../' * depth + to
    return r or './'


def price(v, lang):
    s = f'{v:.2f}'
    return (s.replace('.', ',') + ' руб.') if lang == 'ru' else (s + ' BYN')


def tr(o, lang):
    return o.get(lang) or o.get('en', '') if isinstance(o, dict) else (o or '')


# ---------------------------------------------------------------- partials
def concept_bar(lang):
    t = T[lang]; item = f'<span class="concept-item"><b>{t["concept_b"]}</b>{t["concept"]}<i></i></span>'
    return f'<div class="concept-bar" role="note" aria-label="{E(t["concept"])}"><div class="concept-track" aria-hidden="true">{item * 4}</div></div>\n'


def lang_link(lang, here, cls='lang-btn'):
    t = T[lang]; other = 'en' if lang == 'ru' else 'ru'
    target = rel(url(lang, here), url(other, here))
    return f'<a class="{cls}" href="{target}" hreflang="{other}" lang="{other}" aria-label="{t["other_aria"]}">{t["other"] if cls == "lang-btn" else t["other_full"]}</a>'


def site_nav(lang, page, here):
    t = T[lang]; me = url(lang, here)
    links = ''.join(f'<a href="{rel(me, url(lang, PAGES[k]))}"{" aria-current=\"page\"" if k == page else ""}>{t[k]}</a>' for k in NAV)
    return (f'<div class="site-nav"><div class="in">'
            f'<a class="wordmark" href="{rel(me, url(lang, ""))}" style="font-size:20px">{LOGO}Bunly</a>'
            f'<nav class="links" aria-label="{t["main"]}">{links}</nav>'
            f'<div class="nav-acts"><a class="btn primary" href="{rel(me, url(lang, ""))}#app">{t["order"]}</a></div>'
            f'{lang_link(lang, here)}'
            f'<button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="mnav" aria-label="{t["open_menu"]}">{MENU_ICON}</button>'
            f'</div></div>\n')


def mobile_nav(lang, page, here):
    t = T[lang]; me = url(lang, here)
    items = ''.join(f'<a href="{rel(me, url(lang, PAGES[k]))}" style="--i:{i}"{" aria-current=\"true\"" if k == page else ""}>{t[k]} <small>{t["nav_sub"][k]}</small></a>'
                    for i, k in enumerate(['home'] + NAV))
    return (f'<div class="mnav" id="mnav" role="dialog" aria-modal="true" aria-label="{t["menu"]}">'
            f'<div class="mnav-top"><a class="wordmark" href="{rel(me, url(lang, ""))}">{LOGO}Bunly</a>'
            f'<button class="mnav-close" id="menuClose" aria-label="{t["close_menu"]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'
            f'<nav aria-label="{t["mobile"]}">{items}</nav>'
            f'<div class="acts"><a class="btn primary" href="{rel(me, url(lang, ""))}#app">{t["order"]}</a><a class="btn outline" href="{rel(me, url(lang, PAGES["restaurants"]))}">{t["find"]}</a>{lang_link(lang, here, "btn outline lang-full")}</div>'
            f'<div class="mnav-foot"><span>{t["breakfast"]}<br>{t["night"]}</span><a href="{rel(me, url(lang, ""))}#app">{t["app"]}</a></div>'
            f'<a class="mnav-credit" id="mCredit" target="_blank" rel="noopener"></a></div>\n')


def footer(lang, here):
    t = T[lang]; me = url(lang, here); P = lambda k, h='': rel(me, url(lang, PAGES[k])) + h
    cats = ''.join(f'<a href="{P("menu", "#" + c["id"])}">{tr(c["name"], lang)}</a>' for c in MENU['categories'][:4])
    return (f'<footer class="site-foot"><div class="wrap"><div class="foot">'
            f'<div><a class="wordmark" href="{P("home")}" style="color:var(--ink);margin-bottom:12px">{LOGO}Bunly</a><p>{t["tagline"]}</p></div>'
            f'<div><h4>{t["menu"]}</h4>{cats}</div>'
            f'<div><h4>{t["company"]}</h4><a href="{P("about")}">{t["about"]}</a><a href="{P("truck")}">{t["truck"]}</a><a href="{P("careers")}">{t["careers"]}</a><a href="{P("contacts")}">{t["contacts"]}</a></div>'
            f'<div><h4>{t["help"]}</h4><a href="{P("restaurants")}">{t["restaurants"]}</a><a href="{P("home", "#app")}">{t["delivery"]}</a><a href="{P("contacts", "#faq")}">{t["faq"]}</a>{lang_link(lang, here, "foot-lang")}</div>'
            f'</div><p class="small">{t["copy"]}</p><aside class="dev" id="devCredit" aria-label="{t["about_dev"]}"></aside></div></footer>\n')


def author_json():
    return '<script type="application/json" id="author-data">\n' + json.dumps(AUTHOR, ensure_ascii=False, indent=2).replace('</', '<\\/') + '\n</script>\n'


def head(lang, here, title, desc, css_rel, extra_head='', ld=None):
    me = url(lang, here); ru_u, en_u = SITE + url('ru', here), SITE + url('en', here)
    icon = lambda f: rel(me, f)
    loc = 'ru_RU' if lang == 'ru' else 'en_US'; alt = 'en_US' if lang == 'ru' else 'ru_RU'
    ldj = ''
    if ld: ldj = '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>\n'
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<link rel="canonical" href="{SITE + me}">
<link rel="alternate" hreflang="ru" href="{ru_u}">
<link rel="alternate" hreflang="en" href="{en_u}">
<link rel="alternate" hreflang="x-default" href="{ru_u}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="author" content="{E(AUTHOR['name'])}">
<meta name="theme-color" content="#E5412D">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="{icon('favicon.ico')}" sizes="48x48">
<link rel="icon" href="{icon('favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="{icon('apple-touch-icon.png')}">
<link rel="manifest" href="{icon('site.webmanifest')}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Bunly">
<meta property="og:title" content="{E(title)}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{SITE + me}">
<meta property="og:image" content="{SITE}og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="{loc}">
<meta property="og:locale:alternate" content="{alt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{E(title)}">
<meta name="twitter:description" content="{E(desc)}">
<meta name="twitter:image" content="{SITE}og-image.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Manrope:wght@400;500;600;700&family=Rubik:wght@500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{css_rel}">
{extra_head}{ldj}</head>
'''


def crumbs(lang, here, trail):
    """trail: [(name, site_path_or_None)] after Home; None marks the current page."""
    me = url(lang, here); t = T[lang]
    items = [(t['home'], '')] + trail
    li = ''.join((f'<li><a href="{rel(me, url(lang, h))}">{E(n)}</a></li>' if h is not None else f'<li aria-current="page">{E(n)}</li>') for n, h in items)
    ld = {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': SITE + url(lang, h if h is not None else here)} for i, (n, h) in enumerate(items)]}
    return f'<nav class="crumbs" aria-label="{t["crumbs"]}"><ol>{li}</ol></nav>', ld


def page(lang, key, here, title, desc, body, scripts='', extra_head='', ld=None, home=False):
    me = url(lang, here)
    out = head(lang, here, title, desc, rel(me, 'assets/site.css'), extra_head, ld)
    out += '<body' + (' class="home"' if home else ' class="inner"') + '>\n' + concept_bar(lang)
    if home: out += body
    else:
        out += site_nav(lang, key, here) + '<main id="main">\n' + body + '</main>\n' + footer(lang, here)
    out += mobile_nav(lang, key, here) + author_json()
    out += f'<script src="{rel(me, "assets/site.js")}" defer></script>\n' + scripts + '</body>\n</html>\n'
    dest = OUT / me / 'index.html' if me else OUT / 'index.html'
    dest.parent.mkdir(parents=True, exist_ok=True); dest.write_text(out, encoding='utf-8')
    SITEMAP.append(here)


SITEMAP = []

if __name__ == '__main__':
    import build as B, pages
    SITEMAP = B.SITEMAP
    # clean generated output
    for d in ['en', 'menu', 'restaurants', 'about', 'food-truck', 'careers', 'contacts', 'assets']:
        shutil.rmtree(OUT / d, ignore_errors=True)
    (OUT / 'assets').mkdir()
    for f in ['site.css', 'site.js', 'home.js', 'map.js', 'pages.js']:
        shutil.copy(SRC / 'src' / f, OUT / 'assets' / f)
    for lang in LANGS:
        pages.build_all(lang)
    pages.build_404()
    # sitemap
    seen = []
    [seen.append(h) for h in SITEMAP if h not in seen]
    rows = []
    for h in seen:
        alts = ''.join(f'\n    <xhtml:link rel="alternate" hreflang="{l}" href="{SITE + url(l, h)}"/>' for l in LANGS) + f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{SITE + url("ru", h)}"/>'
        for l in LANGS:
            pr = '1.0' if h == '' else ('0.6' if h.count('/') > 1 else '0.8')
            rows.append(f'  <url>\n    <loc>{SITE + url(l, h)}</loc>{alts}\n    <lastmod>{TODAY}</lastmod>\n    <priority>{pr if l == "ru" else str(round(float(pr) - .1, 1))}</priority>\n  </url>')
    (OUT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + '\n'.join(rows) + '\n</urlset>\n', encoding='utf-8')
    print('built', len(seen) * 2, 'pages into', OUT)
