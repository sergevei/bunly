#!/usr/bin/env python3
"""Sync the author block from author.json into README.md and every generated HTML page.

Edit author.json (name, links, other projects), then run from the project root:
    python3 tools/update_author.py
No dependencies beyond Python 3.
"""
import json, re, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
A = json.loads((ROOT / "author.json").read_text(encoding="utf-8"))
SITE = A.get("site", {})


def tr(v, lang="en"):
    return v.get(lang) or v.get("en", "") if isinstance(v, dict) else (v or "")


def readme_links():
    parts = []
    if SITE.get("url"):
        parts.append(f"**[🌐 Live demo]({SITE['url']})**")
    if SITE.get("video"):
        parts.append(f"**[▶ Video on YouTube]({SITE['video']})**")
    return " · ".join(parts)


def readme_author():
    lines = ["## Author", "",
             f"Designed and developed by **{A['name']}** — {tr(A.get('tagline'))}", ""]
    tg = A.get("telegram") or {}
    if tg.get("url"):
        lines.append(f"- Telegram: [{tg.get('label') or tg['url']}]({tg['url']})")
    if A.get("portfolio"):
        lines.append(f"- Portfolio: <{A['portfolio']}>")
    projects = [p for p in A.get("projects", []) if p.get("name") and p.get("url")]
    if projects:
        lines.append("- Also see: " + " · ".join(f"[{p['name']}]({p['url']})" for p in projects))
    return "\n".join(lines)


def json_ld():
    person = {"@type": "Person", "name": A["name"], "alternateName": A.get("handle"),
              "url": A.get("portfolio"),
              "sameAs": [u for u in [(A.get("telegram") or {}).get("url"), A.get("portfolio")]
                         + [p["url"] for p in A.get("projects", []) if p.get("url")] if u]}
    url = SITE.get("url", "")
    return {"@context": "https://schema.org", "@graph": [
        {"@type": "WebSite", "@id": url + "#website", "url": url, "name": SITE.get("title", ""),
         "inLanguage": ["ru", "en"], "creator": {"@id": url + "#author"}},
        {"@type": "WebPage", "@id": url + "#webpage", "url": url, "isPartOf": {"@id": url + "#website"},
         "name": SITE.get("title", "") + " — 3D concept", "author": {"@id": url + "#author"}},
        dict(person, **{"@id": url + "#author"})]}


def between(text, tag, new):
    pat = re.compile(rf"(<!-- {tag}:start -->)(.*?)(<!-- {tag}:end -->)", re.S)
    if not pat.search(text):
        sys.exit(f"README.md: markers <!-- {tag}:start --> / <!-- {tag}:end --> not found")
    return pat.sub(lambda m: m.group(1) + "\n" + new + "\n" + m.group(3), text)


def script_block(html, sid, payload):
    pat = re.compile(rf"(<script[^>]*\bid=[\"']?{sid}[\"']?[^>]*>)(.*?)(</script>)", re.S)
    data = json.dumps(payload, ensure_ascii=False, indent=2).replace("</", "<\\/")
    html, n = pat.subn(lambda m: m.group(1) + "\n" + data + "\n" + m.group(3), html)
    return html, n


readme = ROOT / "README.md"
t = readme.read_text(encoding="utf-8")
t = between(t, "links", readme_links())
t = between(t, "author", readme_author())
readme.write_text(t, encoding="utf-8")
print("README.md updated")

files = [f for f in ROOT.rglob("*.html") if "source" not in f.relative_to(ROOT).parts]
for f in sorted(files):
    name = str(f.relative_to(ROOT))
    h = f.read_text(encoding="utf-8")
    h, n1 = script_block(h, "author-data", A)
    h, n2 = script_block(h, "ld-json", json_ld()) if 'id="ld-json"' in h else (h, 0)
    f.write_text(h, encoding="utf-8")
    if n1 or n2:
        print(f"{name} updated (author block: {n1}, structured data: {n2})")
