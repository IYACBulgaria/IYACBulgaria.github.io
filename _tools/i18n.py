"""
Builds the Bulgarian site in /bg from the English pages.

Usage:  python _tools/i18n.py            build every page in /bg
        python _tools/i18n.py --units    list the English text units (for translating)

How it works: every text-bearing element (paragraph, heading, label, link...)
is looked up whole in the BG dictionary (_tools/bg.py), so sentences keep their
inline bold text and links. Alt text, aria-labels and the meta description are
translated the same way. Any English left untranslated is reported, never
silently published.
"""
import html as htmllib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ['index', 'writeitdown', 'doityourself', 'stepforward', 'keeptalking',
         'letuscook', 'democracyunderpressure', 'faciliteasy',
         'writethechange', 'beyondthegame', 'breakthesilence', 'atasteofeurope']

TEXT_TAGS = 'p|h1|h2|h3|h4|dt|dd|span|a|button|title|label|figcaption|small'
INLINE = r'(?:[^<]|<(?:/?(?:b|strong|em)\b[^>]*|br\s*/?)>|<a\b[^>]*>[^<]*</a>|<i\b[^>]*></i>)'
ELEMENT = re.compile(r'<(' + TEXT_TAGS + r')(\s[^>]*)?>(' + INLINE + r'*)</\1>', re.S)
ICONS_EDGE = re.compile(r'^(\s*(?:<i\b[^>]*></i>\s*)*)(.*?)(\s*(?:<i\b[^>]*></i>\s*)*)$', re.S)
ATTRS = re.compile(r'\b(alt|aria-label|title|data-underline)="([^"]*)"')
META_DESC = re.compile(r'(<meta name="description" content=")([^"]*)(")')

# Text that stays the same in both languages
KEEP = {'IYAC', 'EN', 'BG', 'IYAC Bulgaria', '+359 88 792 8282', 'iyac.bulgaria@gmail.com',
        'Write It Down!', 'Do It Yourself!', 'Step Forward!', 'Keep Talking!', 'Let us cook!',
        'Democracy Under Pressure', 'Faciliteasy', 'Write it Down!', 'Let Us Cook!', 'Facebook', 'Instagram',
        'Write the Change', 'Beyond the Game', 'Break the Silence', 'A Taste of Europe'}

# Patterns for text that contains numbers
PATTERNS = [
    (re.compile(r'^Open photo (\d+) of (\d+)$'), r'Отвори снимка \1 от \2'),
]


def tidy(t):
    return re.sub(r'\s+', ' ', t).strip()


def has_words(t):
    return bool(re.search(r'[A-Za-z]{2,}', re.sub(r'<[^>]+>', '', t)))


def units(page_html):
    """Yield every translatable string on a page (element text and attributes)."""
    body = re.sub(r'<!--.*?-->', '', page_html, flags=re.S)
    body = re.sub(r'<script\b[^>]*>.*?</script>', '', body, flags=re.S)
    for m in ELEMENT.finditer(body):
        core = tidy(ICONS_EDGE.match(m.group(3)).group(2))
        if core and has_words(core):
            yield core
    for m in ATTRS.finditer(body):
        if has_words(m.group(2)):
            yield tidy(m.group(2))
    # (the meta description repeats the first paragraph and reuses its translation)


def strip_tags(t):
    return tidy(re.sub(r'<[^>]+>', '', t))


def lookup(text, bg, missing):
    if text in KEEP:
        return text
    if text in bg:
        return bg[text]
    # Plain-text copies of a translated paragraph (e.g. the meta description)
    for en, tr in bg.items():
        if '<' in en and strip_tags(en) == text:
            return strip_tags(tr)
    for rx, rep in PATTERNS:
        if rx.match(text):
            return rx.sub(rep, text)
    missing.add(text)
    return text


def translate(page_html, bg, missing):
    def el(m):
        tag, attrs, inner = m.group(1), m.group(2) or '', m.group(3)
        lead, core, trail = ICONS_EDGE.match(inner).groups()
        if not tidy(core) or not has_words(core):
            return m.group(0)
        return f'<{tag}{attrs}>{lead}{lookup(tidy(core), bg, missing)}{trail}</{tag}>'

    # Leave scripts untouched
    parts = re.split(r'(<script\b[^>]*>.*?</script>)', page_html, flags=re.S)
    out = []
    for part in parts:
        if part.startswith('<script'):
            out.append(part)
            continue
        part = ELEMENT.sub(el, part)
        part = ATTRS.sub(lambda m: f'{m.group(1)}="{lookup(tidy(m.group(2)), bg, missing) if has_words(m.group(2)) else m.group(2)}"', part)
        part = META_DESC.sub(lambda m: m.group(1) + htmllib.escape(lookup(tidy(htmllib.unescape(m.group(2))), bg, missing), quote=True) + m.group(3), part)
        out.append(part)
    return ''.join(out)


def localise_paths(page_html, slug):
    """/bg pages live one folder down: point assets up a level and swap the language switch."""
    s = page_html.replace('<html lang="en">', '<html lang="bg">')
    s = re.sub(r'(\b(?:src|href)=")(assets/)', r'\1../\2', s)
    # Language switch: EN goes up to the English page, BG is this page
    s = re.sub(r'<div class="lang" role="group" aria-label="[^"]*">.*?</div>',
               f'<div class="lang" role="group" aria-label="Език">\n'
               f'        <a class="lang__opt" href="../{slug}.html" hreflang="en" lang="en">EN</a>\n'
               f'        <a class="lang__opt is-active" href="{slug}.html" hreflang="bg" lang="bg" aria-current="true">BG</a>\n'
               f'      </div>', s, flags=re.S)
    # The Bulgarian font (Cyrillic)
    s = s.replace('family=Instrument+Sans:', 'family=Roboto+Flex:opsz,wdth,wght@8..144,75..100,400..700&family=Instrument+Sans:')
    return s


def alternates(page_html, slug, lang):
    base = 'https://iyacbulgaria.com/'
    links = (f'  <link rel="alternate" hreflang="en" href="{base}{slug}.html">\n'
             f'  <link rel="alternate" hreflang="bg" href="{base}bg/{slug}.html">\n'
             f'  <link rel="alternate" hreflang="x-default" href="{base}{slug}.html">\n')
    if 'hreflang="x-default"' in page_html:
        return page_html
    return page_html.replace('  <meta name="theme-color"', links + '  <meta name="theme-color"', 1)


def main():
    if '--units' in sys.argv:
        seen = []
        for slug in PAGES:
            for u in units((ROOT / f'{slug}.html').read_text(encoding='utf-8')):
                if u not in seen and u not in KEEP and not any(rx.match(u) for rx, _ in PATTERNS):
                    seen.append(u)
        print(json.dumps(seen, ensure_ascii=False, indent=1))
        return

    sys.path.insert(0, str(Path(__file__).parent))
    from bg import BG
    (ROOT / 'bg').mkdir(exist_ok=True)
    missing = set()
    for slug in PAGES:
        en_path = ROOT / f'{slug}.html'
        en = alternates(en_path.read_text(encoding='utf-8'), slug, 'en')
        en_path.write_text(en, encoding='utf-8')  # English pages get the hreflang links too
        bg_html = localise_paths(translate(en, BG, missing), slug)
        (ROOT / 'bg' / f'{slug}.html').write_text(bg_html, encoding='utf-8')
    if missing:
        print('UNTRANSLATED:')
        for m in sorted(missing):
            print('  -', m[:120])
        sys.exit(1)
    print(f'built {len(PAGES)} Bulgarian pages in /bg — everything translated')


if __name__ == '__main__':
    main()
