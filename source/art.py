"""Flat SVG illustrations for menu items (viewBox 400x400). Pure strings, no dependencies."""


def _svg(inner, label=''):
    return ('<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
            '<g class="float">' + inner + '</g></svg>')


def _shadow(rx=130, cy=352):
    return f'<ellipse cx="200" cy="{cy}" rx="{rx}" ry="13" fill="rgba(35,26,21,.14)"/>'


def _sesame():
    pts = [(150, 100), (200, 88), (250, 104), (175, 130), (230, 135), (275, 150), (125, 150), (200, 160)]
    return ''.join(f'<ellipse cx="{x}" cy="{y}" rx="7" ry="3.6" fill="#FFF3D6" transform="rotate({(x * 7) % 50 - 25} {x} {y})"/>' for x, y in pts)


def burger(double=False, dark=False, veg=False, chicken=False):
    bun_top = '#5B3A2E' if dark else '#F0A845'
    bun_bot = '#4A2E24' if dark else '#E08E35'
    hi = '#8A5D4A' if dark else '#FFD58A'
    patty = '#7A4B2A' if veg else ('#D99A45' if chicken else '#6B3B22')
    patty2 = '#5E321C'
    s = _shadow(140)
    s += f'<path d="M78 296h244q0 44-40 44H118q-40 0-40-44z" fill="{bun_bot}"/>'
    if double:
        s += f'<rect x="62" y="252" width="276" height="44" rx="22" fill="{patty2}"/>'
        s += '<path d="M68 248h264l-16 30-22-12-26 24-26-20-28 26-28-24-26 20-24-22-22 16z" fill="#FFC531"/>'
        s += f'<rect x="62" y="206" width="276" height="44" rx="22" fill="{patty}"/>'
        top_y = 206
    else:
        if chicken:
            s += f'<path d="M58 254q10-26 40-30q40-8 70 2q40-10 80-2q40 4 56 30q-8 30-40 36H100q-36-4-42-36z" fill="{patty}"/>'
            s += '<path d="M90 240q20-10 40-2M180 236q22-8 44 0M262 242q16-6 30 4" stroke="#B87A2E" stroke-width="5" fill="none" stroke-linecap="round"/>'
        else:
            s += f'<rect x="62" y="240" width="276" height="54" rx="26" fill="{patty}"/>'
            if not veg:
                s += '<path d="M68 236h264l-16 30-22-12-26 24-26-20-28 26-28-24-26 20-24-22-22 16z" fill="#FFC531"/>'
        top_y = 222
    lettuce = '#5DAE3E' if veg else '#7CC35A'
    s += f'<path d="M58 {top_y}q22-20 44 0t44 0t44 0t44 0t44 0t44 0t40 0v10H58z" fill="{lettuce}"/>'
    s += f'<rect x="74" y="{top_y - 20}" width="252" height="18" rx="9" fill="#E5412D"/>'
    if veg:
        s += f'<rect x="96" y="{top_y - 30}" width="210" height="10" rx="5" fill="#C04CC0" opacity=".8"/>'
    s += f'<path d="M70 {top_y - 18}q0-128 130-128t130 128z" fill="{bun_top}"/>'
    s += f'<path d="M112 {top_y - 66}q28-52 92-56" stroke="{hi}" stroke-width="12" stroke-linecap="round" fill="none"/>'
    if not dark:
        s += _sesame().replace('cy="', 'cy="').replace('<ellipse', '<ellipse') if top_y == 206 else _shift(_sesame(), 16)
    else:
        s += _shift(_sesame().replace('#FFF3D6', '#E9D8C8'), 0 if top_y == 206 else 16)
    return _svg(s)


def _shift(svg, dy):
    import re
    return re.sub(r'cy="(\d+)"', lambda m: f'cy="{int(m.group(1)) + dy}"', re.sub(r'rotate\((-?\d+) (\d+) (\d+)\)', lambda m: f'rotate({m.group(1)} {m.group(2)} {int(m.group(3)) + dy})', svg))


def fries():
    sticks = [(120, 90, -10), (145, 70, -5), (170, 60, -2), (195, 50, 2), (220, 62, 5), (245, 72, 8), (270, 92, 12), (160, 100, -3), (210, 95, 3), (255, 110, 9), (135, 120, -8)]
    s = _shadow(110, 356)
    s += ''.join(f'<rect x="{x}" y="{y}" width="20" height="150" rx="6" fill="#FFC531" stroke="#E9A72B" stroke-width="3" transform="rotate({r} {x + 10} 220)"/>' for x, y, r in sticks)
    s += '<path d="M102 190h196l-26 160H128z" fill="#E5412D"/><path d="M102 190q98 40 196 0" fill="#C7311F"/>'
    s += '<circle cx="200" cy="268" r="34" fill="#fff"/><path d="M180 266a20 15 0 0 1 40 0z" fill="#FFC531"/><rect x="179" y="270" width="42" height="5" rx="2.5" fill="#E5412D"/><path d="M182 279h36a7 7 0 0 1-7 7h-22a7 7 0 0 1-7-7z" fill="#FFC531"/>'
    return _svg(s)


def nuggets():
    s = _shadow(130, 356) + '<path d="M80 200h240l-22 146H102z" fill="#FFC531"/>'
    for x, y, a, b in [(130, 180, 34, 26), (180, 165, 36, 27), (232, 172, 34, 25), (275, 190, 30, 24), (155, 205, 34, 25), (210, 200, 36, 26), (255, 212, 30, 23)]:
        s += f'<ellipse cx="{x}" cy="{y}" rx="{a}" ry="{b}" fill="#E39A45"/><ellipse cx="{x - 8}" cy="{y - 7}" rx="{a * .45:.1f}" ry="{b * .3:.1f}" fill="#F3BC6B"/>'
    s += '<path d="M80 220h240l-3 20H83z" fill="#E5412D"/><path d="M100 262h200" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-dasharray="2 24"/>'
    s += '<ellipse cx="320" cy="300" rx="44" ry="14" fill="#fff"/><path d="M276 300v28q44 18 88 0v-28" fill="#fff"/><ellipse cx="320" cy="300" rx="38" ry="10" fill="#C7311F"/>'
    return _svg(s)


def wings():
    s = _shadow(140, 350) + '<ellipse cx="200" cy="300" rx="160" ry="34" fill="#fff"/><ellipse cx="200" cy="292" rx="146" ry="26" fill="#F4EEE6"/>'
    for x, y, r in [(130, 250, -20), (200, 236, 10), (270, 252, 30), (160, 280, 40), (240, 282, -30), (205, 270, 0)]:
        s += (f'<g transform="rotate({r} {x} {y})"><path d="M{x - 50} {y}q10-34 50-30q44 4 50 30q-6 26-50 28q-44 2-50-28z" fill="#C7311F"/>'
              f'<path d="M{x - 34} {y - 12}q20-12 44-4" stroke="#F27560" stroke-width="7" fill="none" stroke-linecap="round"/></g>')
    s += '<circle cx="150" cy="226" r="3" fill="#fff"/><circle cx="230" cy="220" r="3" fill="#fff"/><circle cx="260" cy="262" r="3" fill="#fff"/>'
    s += '<path d="M300 150l14-30M318 160l22-22M290 140l2-34" stroke="#3FA34D" stroke-width="6" stroke-linecap="round"/>'
    return _svg(s)


def muffin():
    s = _shadow(130, 350)
    s += '<path d="M84 270h232q0 50-40 56H124q-40-6-40-56z" fill="#E9B26A"/><circle cx="130" cy="300" r="3" fill="#D39A50"/><circle cx="260" cy="310" r="3" fill="#D39A50"/>'
    s += '<path d="M76 236q60-8 124-2q60-6 124 4q-6 26-26 32H100q-20-6-24-34z" fill="#FFC531"/>'
    s += '<rect x="70" y="214" width="260" height="36" rx="18" fill="#B5643A"/>'
    s += '<ellipse cx="200" cy="204" rx="118" ry="22" fill="#fff"/><ellipse cx="206" cy="200" rx="40" ry="16" fill="#FFC531"/>'
    s += '<path d="M80 204q0-90 120-90t120 90z" fill="#E9B26A"/><path d="M122 160q24-30 70-32" stroke="#F6D49A" stroke-width="10" stroke-linecap="round" fill="none"/>'
    s += ''.join(f'<circle cx="{x}" cy="{y}" r="4" fill="#F6E3BF"/>' for x, y in [(150, 140), (200, 128), (250, 146), (180, 170), (235, 176)])
    return _svg(s)


def syrniki():
    s = _shadow(150, 352) + '<ellipse cx="200" cy="300" rx="170" ry="40" fill="#fff"/><ellipse cx="200" cy="292" rx="156" ry="30" fill="#F6F0E8"/>'
    for x, y in [(140, 262), (250, 258), (195, 230)]:
        s += f'<ellipse cx="{x}" cy="{y + 14}" rx="64" ry="22" fill="#C98A4A"/><ellipse cx="{x}" cy="{y}" rx="64" ry="24" fill="#F0C27A"/><ellipse cx="{x - 10}" cy="{y - 6}" rx="30" ry="8" fill="#F8DDA8"/>'
    s += '<path d="M150 214q30-26 60-6q30-24 50 6q-20 26-56 22q-40 2-54-22z" fill="#C7311F"/><circle cx="190" cy="210" r="6" fill="#E5412D"/><circle cx="222" cy="214" r="5" fill="#E5412D"/>'
    s += '<path d="M206 192l10-18M216 196l20-10" stroke="#3FA34D" stroke-width="6" stroke-linecap="round"/>'
    return _svg(s)


def salad():
    s = _shadow(140, 352) + '<path d="M60 220h280q-10 110-140 120Q70 330 60 220z" fill="#fff"/><path d="M60 220h280" stroke="#EDE4D8" stroke-width="6"/>'
    for x, y, r, c in [(110, 200, 40, '#7CC35A'), (170, 186, 46, '#5DAE3E'), (240, 190, 44, '#7CC35A'), (290, 206, 34, '#5DAE3E'), (200, 206, 40, '#9FD08A')]:
        s += f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>'
    for x, y in [(140, 190), (230, 176), (270, 212)]:
        s += f'<circle cx="{x}" cy="{y}" r="17" fill="#E5412D"/><circle cx="{x - 5}" cy="{y - 6}" r="4" fill="#FF8A6B"/>'
    s += '<ellipse cx="185" cy="214" rx="22" ry="9" fill="#E6F4DF" stroke="#7CC35A" stroke-width="4"/><ellipse cx="300" cy="186" rx="16" ry="7" fill="#F5C2D6" stroke="#E5412D" stroke-width="3"/>'
    return _svg(s)


def sundae():
    s = _shadow(90, 358)
    s += '<path d="M118 210h164l-26 140H144z" fill="rgba(255,255,255,.7)" stroke="#fff" stroke-width="4"/>'
    s += '<ellipse cx="200" cy="214" rx="96" ry="30" fill="#FFF6EA"/><ellipse cx="200" cy="180" rx="78" ry="28" fill="#FFF6EA"/><ellipse cx="200" cy="148" rx="58" ry="24" fill="#FFF6EA"/><ellipse cx="200" cy="120" rx="36" ry="20" fill="#FFF6EA"/>'
    s += '<path d="M196 96q12-30 6-40" stroke="#FFF6EA" stroke-width="16" stroke-linecap="round" fill="none"/>'
    s += '<path d="M126 196q20 30 34 0q14 40 30 0q16 34 32 0q14 42 30 0q16 26 26 0q-10-30-76-40q-66 8-76 40z" fill="#E5412D"/>'
    s += '<path d="M200 70c-18-4-30 10-24 26 8 18 28 22 40 6 10-14 2-30-16-32z" fill="#E5412D"/><path d="M190 64l10-14 10 14" stroke="#3FA34D" stroke-width="7" fill="none" stroke-linecap="round"/>'
    return _svg(s)


def pie():
    s = _shadow(140, 330) + '<g transform="rotate(-8 200 230)"><rect x="70" y="170" width="260" height="130" rx="40" fill="#E9A54B"/><rect x="70" y="170" width="260" height="110" rx="40" fill="#F3BC6B"/>'
    for x in (110, 160, 210, 260):
        s += f'<path d="M{x} 205l26 40" stroke="#B43A2A" stroke-width="14" stroke-linecap="round"/><path d="M{x} 205l26 40" stroke="#E5412D" stroke-width="7" stroke-linecap="round"/>'
    s += '</g><circle cx="300" cy="128" r="26" fill="#C7311F"/><circle cx="262" cy="140" r="24" fill="#E5412D"/><path d="M300 102q-10-40-30-52M262 116q4-36 8-66" stroke="#3FA34D" stroke-width="5" fill="none" stroke-linecap="round"/>'
    return _svg(s)


def coffee():
    s = _shadow(96, 356)
    s += '<path d="M130 120h140l-18 230H148z" fill="#FFFFFF"/><path d="M137 200h126l-7 84H144z" fill="#E5412D"/>'
    s += '<circle cx="200" cy="242" r="22" fill="#fff"/><path d="M188 240a12 9 0 0 1 24 0z" fill="#FFC531"/><rect x="186" y="243" width="28" height="4" rx="2" fill="#E5412D"/>'
    s += '<rect x="118" y="104" width="164" height="22" rx="8" fill="#5E321C"/><rect x="132" y="90" width="136" height="18" rx="8" fill="#7A4628"/>'
    s += '<path d="M170 76q-16-20 0-40t0-40" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"/>'
    return _svg(s)


def shake():
    s = _shadow(96, 356)
    s += '<path d="M128 130h144l-20 220H148z" fill="#FFFFFF"/><path d="M134 190h132l-14 160H148z" fill="#D9894A"/><path d="M138 230h124" stroke="#fff" stroke-width="8" opacity=".5"/>'
    s += '<path d="M120 132q10-50 80-52q70 2 80 52z" fill="#FFF6EA"/><path d="M140 112q30-24 60-8q30-18 54 6" stroke="#C98A4A" stroke-width="8" fill="none" stroke-linecap="round"/>'
    s += '<rect x="214" y="30" width="14" height="110" rx="7" fill="#E5412D" transform="rotate(14 221 85)"/><circle cx="200" cy="74" r="14" fill="#C7311F"/>'
    return _svg(s)


def cup():
    s = _shadow(96, 356)
    s += '<path d="M126 120h148l-22 230H148z" fill="#fff"/><path d="M132 180h136l-14 150H146z" fill="#E5412D" opacity=".88"/>'
    s += ''.join(f'<rect x="{x}" y="{y}" width="26" height="26" rx="6" fill="#FFFFFF" opacity=".55" transform="rotate({r} {x + 13} {y + 13})"/>' for x, y, r in [(156, 196, 12), (206, 214, -10), (176, 250, 24)])
    s += '<circle cx="170" cy="290" r="9" fill="#7A1F2A"/><circle cx="222" cy="300" r="7" fill="#7A1F2A"/><circle cx="196" cy="272" r="6" fill="#3B1530"/>'
    s += '<rect x="118" y="106" width="164" height="20" rx="8" fill="#F1E6D6"/><rect x="214" y="26" width="14" height="96" rx="7" fill="#FFC531" transform="rotate(10 221 74)"/>'
    s += '<path d="M268 128l26-8 4 20-24 6z" fill="#FFE07A"/>'
    return _svg(s)


KINDS = dict(burger=burger, fries=fries, nuggets=nuggets, wings=wings, muffin=muffin, syrniki=syrniki, salad=salad,
             sundae=sundae, pie=pie, coffee=coffee, shake=shake, cup=cup)


def art(kind, **opt):
    return KINDS[kind](**opt)


TRUCK = ('<svg viewBox="0 0 640 380" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="truck-svg">'
         '<ellipse cx="320" cy="340" rx="260" ry="16" fill="rgba(35,26,21,.14)"/>'
         '<rect x="60" y="120" width="380" height="190" rx="26" fill="#E5412D"/><rect x="440" y="170" width="140" height="140" rx="22" fill="#FBF6EE"/>'
         '<path d="M470 186h84l18 56h-102z" fill="#3B3F4E"/><rect x="60" y="282" width="520" height="28" rx="14" fill="#C7311F"/>'
         '<rect x="110" y="150" width="220" height="90" rx="12" fill="#231A15"/>'
         '<path d="M100 132h240l-12 34H112z" fill="#FFC531"/><path d="M100 132h40l-6 34h-28zM180 132h40l-4 34h-36zM260 132h40l-2 34h-38z" fill="#fff"/>'
         '<g transform="translate(160 176)"><path d="M10 40a50 36 0 0 1 100 0z" fill="#FFC531"/><rect x="6" y="46" width="108" height="12" rx="6" fill="#fff"/><path d="M12 64h96a14 14 0 0 1-14 14H26a14 14 0 0 1-14-14z" fill="#FFC531"/></g>'
         '<rect x="350" y="150" width="70" height="120" rx="10" fill="#C7311F"/><circle cx="406" cy="212" r="5" fill="#FFC531"/>'
         '<g class="wheel" style="transform-origin:150px 312px"><circle cx="150" cy="312" r="38" fill="#231A15"/><circle cx="150" cy="312" r="16" fill="#D6CFC4"/><path d="M150 278v68M116 312h68" stroke="#3A322D" stroke-width="6"/></g>'
         '<g class="wheel" style="transform-origin:500px 312px"><circle cx="500" cy="312" r="38" fill="#231A15"/><circle cx="500" cy="312" r="16" fill="#D6CFC4"/><path d="M500 278v68M466 312h68" stroke="#3A322D" stroke-width="6"/></g>'
         '<g class="balloon b1"><ellipse cx="96" cy="70" rx="22" ry="27" fill="#FFC531"/><path d="M96 97q-6 14 0 26" stroke="#231A15" stroke-width="2" fill="none"/></g>'
         '<g class="balloon b2"><ellipse cx="140" cy="46" rx="20" ry="25" fill="#3FA34D"/><path d="M140 71q6 14 0 50" stroke="#231A15" stroke-width="2" fill="none"/></g>'
         '</svg>')
