"""
Builds the project pages in the Shevitsa design from the original pages' text.

Usage:  python _tools/build_project.py            (all projects)
        python _tools/build_project.py letuscook  (one project)

The wording is read straight from backup-original/<slug>.html so it is never
retyped. Paragraphs are only split where the original already had a line break
or at the start of a sentence listed in 'breaks'. Navigation, footer and the
"Our projects" line are shared with the homepage. GitHub Pages ignores folders
starting with "_", so this folder isn't published.
"""
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSET_V = '6'  # bump when shevitsa.css / shevitsa.js change, so browsers refetch them

# ---------------------------------------------------------------------------
# Per-project layout choices. Fact values are quoted from each original text.
#   breaks: sentences that start a new chapter (exact original wording)
#   after:  what follows chapter N — a wide photo, a pair of photos, or the menu
# ---------------------------------------------------------------------------
PROJECTS = {
    'writeitdown': {
        'folder': 'write it down', 'poster_slug': 'writeitdown',
        'facts': [('Dates', 'March 11–19, 2025'), ('Location', 'Youtopia Center in Stara Zagora, Bulgaria'),
                  ('Participants', 'youth workers, NGO leaders, and educators from across Europe'),
                  ('Format', 'Erasmus+ training course')],
        'flags': [],
        'after': {1: ('photo', 'product-1'), 5: ('duo', 'books-1', 'app-3')},
        'alts': {
            'app-1': 'Participants seated in a circle during a session',
            'product-1': 'Participants listening during a workshop',
            'branding-1': 'A participant grilling outdoors in the evening',
            'books-1': 'A long table set for a cultural evening',
            'app-2': 'Participants working on laptops',
            'product-2': 'A presentation on a screen during the training',
            'branding-2': 'Participants talking in the evening',
            'books-2': 'A team working on laptops at a shared table',
            'app-3': 'Two participants holding their Youthpass certificates',
        },
    },
    'doityourself': {
        'folder': 'doityourself', 'poster_slug': 'doityourself',
        'facts': [('Dates', '11-19 March 2025'), ('Location', 'Youtopia Center in Stara Zagora, Bulgaria'),
                  ('Participants', 'youth workers from across Europe'), ('Format', 'Erasmus+ training course')],
        'flags': [],
        'after': {0: ('photo', 'books-2'), 1: ('duo', 'books-1', 'product-2')},
        'alts': {
            'app-1': 'Participants seated in a circle',
            'product-1': 'Two participants laughing during a session',
            'branding-1': 'The group seated in a circle during a session',
            'books-1': 'Participants outdoors at sunset',
            'app-2': 'A participant performing an exercise in front of the group',
            'product-2': 'An outdoor group activity on the grass',
            'branding-2': 'Participants in masks and sunglasses during an improvisation exercise',
            'books-2': 'An outdoor game on the grass',
            'app-3': 'Participants talking in the training room',
        },
    },
    'stepforward': {
        'folder': 'stepforward', 'poster_slug': 'stepforward',
        'facts': [('Dates', 'January 15 to 21, 2025'), ('Location', 'Stara Zagora, Bulgaria'),
                  ('Countries', 'Romania, Bulgaria, Hungary, and North Macedonia'), ('Format', 'Erasmus+ youth exchange')],
        'flags': ['ro', 'bg', 'hu', 'mk'],
        'after': {0: ('photo', 'app-1'), 1: ('duo', 'app-2', 'branding-2')},
        'alts': {
            'app-1': 'Participants seated in a large circle',
            'product-1': 'Participants relaxing during a session',
            'branding-1': 'Participants sitting together on a sofa',
            'books-1': 'Participants seated in the sunny training room',
            'app-2': 'Participants working on a creative task at a table',
            'product-2': 'A participant presenting Bulgarian phrases translated to English',
            'branding-2': 'Two participants holding their certificates',
            'books-2': 'A participant speaking to the group',
            'app-3': 'Participants watching a presentation',
        },
    },
    'keeptalking': {
        'folder': 'keeptalking', 'poster_slug': 'keeptalking',
        'facts': [('Dates', '8–14 January 2025'), ('Location', 'Youtopia Center near Stara Zagora'),
                  ('Countries', 'Greece, Romania, Slovakia, and Bulgaria'), ('Format', 'Erasmus+ youth exchange')],
        'flags': ['gr', 'ro', 'sk', 'bg'],
        'after': {0: ('photo', 'app-3'), 1: ('duo', 'branding-1', 'app-2')},
        'alts': {
            'app-1': 'Tablets laid out on chairs for an activity',
            'product-1': 'The group seated in a circle',
            'branding-1': 'A Greek cultural evening table with flags and food',
            'books-1': 'Participants talking on a sofa',
            'app-2': 'Participants playing a game at a table',
            'product-2': 'Participants relaxing on sofas',
            'branding-2': 'A participant presenting a slide to the group',
            'books-2': 'Participants during a group activity',
            'app-3': 'The whole group holding their Youthpass certificates',
        },
    },
    'letuscook': {
        'folder': 'letuscook', 'poster_slug': 'letuscook',
        'facts': [('Dates', '12–20 January 2026'), ('Location', 'Stara Zagora, Bulgaria'),
                  ('Countries', 'Bulgaria, Romania, Poland, and Greece'), ('Format', 'Youth Exchange')],
        'flags': ['bg', 'ro', 'pl', 'gr'],
        'breaks': ['From the very beginning', 'Each national group', 'In addition to the culinary',
                   'A special highlight', 'The evenings were filled'],
        'after': {1: ('photo', 'books-1'), 2: ('menu',), 4: ('duo', 'app-2', 'branding-2')},
        'menu': [('gr', 'Greek moussaka and tzatziki'), ('pl', 'Polish pierogi and zapiekanki'),
                 ('bg', 'Bulgarian banitsa and Shopska salad'), ('ro', 'Romanian mamaliga, mici, and papanasi')],
        'alts': {
            'app-1': 'Participants preparing food together in the kitchen',
            'app-2': 'Participants cooking at a shared table',
            'app-3': 'A team chopping vegetables and preparing a recipe',
            'books-1': 'An international team cooking together',
            'books-2': 'A participant setting up a cooking station',
            'branding-1': 'A participant smiling at a cooking station',
            'branding-2': 'An evening activity with lights',
            'product-1': 'Participants waving during a cooking workshop',
            'product-2': 'Two participants holding their Youthpass certificates',
        },
    },
    'democracyunderpressure': {
        'folder': 'democracyunderpressure', 'poster_slug': 'democracyunderpressure',
        'facts': [('Dates', '20–28 January 2026'), ('Location', 'Stara Zagora, Bulgaria'),
                  ('Countries', 'Bulgaria, Romania, Greece, North Macedonia, and Turkey'), ('Format', 'Erasmus+ Training Course')],
        'flags': ['bg', 'ro', 'gr', 'mk', 'tr'],
        'breaks': ['Participants engaged in a wide range', 'A key highlight of the programme', 'The training course placed',
                   'One of the most impactful', 'Cultural exchange was also'],
        'after': {1: ('photo', 'branding-2'), 3: ('duo', 'product-1', 'product-2')},
        'alts': {
            'app-1': 'Participants seated in the training room',
            'product-1': 'A participant leading an activity',
            'branding-1': 'A participant presenting to the group',
            'app-3': 'Participants seated on sofas during a session',
            'app-2': 'A participant leading an exercise in the training room',
            'product-2': 'Participants holding their Youthpass certificates',
            'branding-2': 'Participants reading together on a sofa',
            'books-2': 'A participant speaking in front of the group',
            'books-1': 'Participants talking on sofas',
        },
    },
    'faciliteasy': {
        'folder': 'faciliteasy', 'poster_slug': 'faciliteasy',
        'facts': [('Dates', '23 February – 3 March 2026'), ('Location', 'Stara Zagora, Bulgaria'),
                  ('Countries', 'Romania, Poland, Bulgaria, and Greece'), ('Format', 'Erasmus+ Training Course')],
        'flags': ['ro', 'pl', 'bg', 'gr'],
        'breaks': ['Participants explored the city', 'Throughout the project, participants', 'Working in mixed-nationality',
                   'A special cultural highlight', 'The project concluded'],
        'after': {1: ('duo', 'branding-1', 'app-2'), 4: ('photo', 'product-1')},
        'alts': {
            'app-1': 'Participants performing in front of the group',
            'product-1': 'The group at the Martenitsa Parade in Stara Zagora',
            'branding-1': 'Participants rehearsing a role play',
            'books-1': 'Participants walking outdoors at dusk',
            'app-2': 'A participant playing a role during a simulation',
            'product-2': 'Participants talking on a sofa',
            'branding-2': 'Two participants holding their certificates',
            'books-2': 'Participants seated around the training room',
            'app-3': 'Participants at a table during an activity',
        },
    },
}
ORDER = ['writeitdown', 'doityourself', 'stepforward', 'keeptalking', 'letuscook', 'democracyunderpressure', 'faciliteasy']

# ---------------------------------------------------------------------------
def read(p):
    return (ROOT / p).read_text(encoding='utf-8')


def strip_comments(s):
    return re.sub(r'<!--.*?-->', '', s, flags=re.S)


def image_size(path):
    from PIL import Image
    with Image.open(ROOT / path) as im:
        return im.size


def tidy(t):
    return re.sub(r'\s+', ' ', t).strip()


def extract_original(slug):
    s = strip_comments(read(f'backup-original/{slug}.html'))
    title = tidy(re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S).group(1))
    main = s[s.find('<section id="service-details"'):s.find('</section>')]
    sidebar_title = tidy(re.search(r'<div class="service-box">\s*<h4>(.*?)</h4>', main, re.S).group(1))
    link = re.search(r'<div class="download-catalog">\s*<a href="([^"]+)"[^>]*>.*?<span>(.*?)</span>', main, re.S)
    body = main[main.find('<div class="col-lg-8'):]
    h3 = tidy(re.search(r'<h3>(.*?)</h3>', body, re.S).group(1))
    # Paragraphs and lists, in order
    blocks = []
    for m in re.finditer(r'<p>(.*?)</p>|<ul>(.*?)</ul>', body, re.S):
        if m.group(1) is not None:
            blocks.append(('p', m.group(1)))
        else:
            items = [tidy(i) for i in re.findall(r'<li>\s*<i[^>]*></i>\s*<span>(.*?)</span>\s*</li>', m.group(2), re.S)]
            blocks.append(('ul', items))
    gal = s[s.find('<section id="portfolio"'):]
    gal_h2 = tidy(re.search(r'<h2>(.*?)</h2>', gal).group(1))
    gal_intro = tidy(re.search(r'<div class="container section-title"[^>]*>.*?<p>(.*?)</p>', gal, re.S).group(1))
    imgs = [Path(f).stem for f in re.findall(r'<img src="assets/img/([^"]+)"', gal) if 'cofounded' not in f]
    disclaimer = tidy(re.search(r'<p>\s*(Funded by the European Union.*?)</p>', gal, re.S).group(1))
    return dict(title=title, sidebar_title=sidebar_title, link=link.group(1), link_label=tidy(link.group(2)),
                h3=h3, blocks=blocks, gal_h2=gal_h2, gal_intro=gal_intro, imgs=imgs, disclaimer=disclaimer)


def split_sentences(text, breaks):
    """Split at the given sentence starts; the pieces joined back equal the original."""
    chunks, rest = [], text
    for b in breaks:
        m = re.search(r'(?<=[.!?”"]) (?=(?:<b>)?' + re.escape(b) + ')', rest)
        if not m:
            continue
        chunks.append(rest[:m.start()].strip())
        rest = rest[m.end():]
    chunks.append(rest.strip())
    assert tidy(' '.join(chunks)) == tidy(text)
    return chunks


def shared_from_home():
    s = read('index.html')
    footer = s[s.find('  <footer id="footer"'):s.find('</footer>') + len('</footer>')]
    footer = footer.replace('href="#', 'href="index.html#')
    patches = re.findall(r'<li class="patch">.*?</li>', s, re.S)
    return footer, patches


def stitch_flag(code, cls='facts__flag'):
    return f'<span class="stitch {cls}" data-flag="{code}" data-cell="10" data-speed="5" aria-hidden="true"></span>'


def build(slug):
    cfg = PROJECTS[slug]
    gdir = f'assets/img/projects/{slug}'
    o = extract_original(slug)
    footer, patches = shared_from_home()

    # The last paragraph closes the story on the crimson band; the rest become chapters
    paras = [i for i, b in enumerate(o['blocks']) if b[0] == 'p']
    closing = tidy(o['blocks'][paras[-1]][1])
    story_blocks = []  # ('chapter', html) | ('list', items)
    for i, (kind, val) in enumerate(o['blocks']):
        if i == paras[-1]:
            continue
        if kind == 'ul':
            story_blocks.append(('list', val))
            continue
        for sub in re.split(r'<br\s*/?>', val):
            if tidy(sub):
                for ch in split_sentences(tidy(sub), cfg.get('breaks', [])):
                    story_blocks.append(('chapter', ch))

    def photo(name):
        src = f'{gdir}/{name}.jpg'
        w, h = image_size(src)
        return (f'<figure class="story__photo"><img src="{src}" alt="{html.escape(cfg["alts"][name])}" '
                f'width="{w}" height="{h}" loading="lazy" decoding="async"></figure>')

    story, n = [], -1
    for kind, val in story_blocks:
        if kind == 'list':
            items = '\n'.join(
                f'            <li data-reveal style="--d:{k}"><span class="highlights__n" aria-hidden="true">{k + 1:02d}</span><span>{t}</span></li>'
                for k, t in enumerate(val))
            story.append(f'        <div class="container">\n          <ol class="highlights">\n{items}\n          </ol>\n        </div>')
            continue
        n += 1
        cls = ' class="story__lede"' if n == 0 else ''
        story.append(f'        <div class="container story__col"><p{cls} data-reveal>{val}</p></div>')
        extra = cfg['after'].get(n)
        if not extra:
            continue
        if extra[0] == 'photo':
            story.append(f'        <div class="story__wide" data-reveal>{photo(extra[1])}</div>')
        elif extra[0] == 'duo':
            story.append('        <div class="container story__duo">\n'
                         f'          <div data-parallax="0">{photo(extra[1])}</div>\n'
                         f'          <div data-parallax="0.18">{photo(extra[2])}</div>\n'
                         '        </div>')
        elif extra[0] == 'menu':
            cards = '\n'.join(
                f'            <li class="dish" data-reveal style="--d:{k}">{stitch_flag(c, "dish__flag")}'
                f'<span class="dish__name">{t}</span></li>'
                for k, (c, t) in enumerate(cfg['menu']))
            # The dishes are already named in the text above, so this is visual only
            story.append(f'        <div class="container">\n          <ul class="menu" aria-hidden="true">\n{cards}\n          </ul>\n        </div>')

    facts = []
    for label, value in cfg['facts']:
        flags = ''
        if label == 'Countries' and cfg['flags']:
            flags = '<span class="facts__flags">' + ''.join(stitch_flag(c) for c in cfg['flags']) + '</span>'
        facts.append(f'            <div><dt>{label}</dt><dd>{flags}<span class="facts__value">{value}</span></dd></div>')

    tiles = []
    for k, name in enumerate(o['imgs']):
        src = f'{gdir}/{name}.jpg'
        w, h = image_size(src)
        tiles.append(f'          <button class="gtile" type="button" data-index="{k}" aria-label="Open photo {k + 1} of {len(o["imgs"])}">'
                     f'<img src="{src}" alt="{html.escape(cfg["alts"][name])}" width="{w}" height="{h}" loading="lazy" decoding="async"></button>')

    others = [p for p in patches if f'href="{slug}.html"' not in p]
    poster = f'assets/img/home/posters/{cfg["poster_slug"]}.jpg'
    pw, ph = image_size(poster)
    description = html.escape(re.sub('<[^>]+>', '', next(v for k, v in story_blocks if k == 'chapter')))

    page = f'''<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{o['title']}</title>
  <meta name="description" content="{description}">
  <meta name="theme-color" content="#F2ECE3">
  <script>document.documentElement.classList.add('js');</script>

  <!-- Favicons -->
  <link href="assets/img/favicon.png" rel="icon">
  <link href="assets/img/apple-touch-icon.png" rel="apple-touch-icon">

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com" rel="preconnect">
  <link href="https://fonts.gstatic.com" rel="preconnect" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wdth,wght@0,75..100,400..700;1,75..100,400..700&display=swap" rel="stylesheet">

  <!-- Icons -->
  <link href="assets/vendor/bootstrap-icons/bootstrap-icons.min.css" rel="stylesheet">

  <!-- Shevitsa design system -->
  <link href="assets/css/shevitsa.css?v={ASSET_V}" rel="stylesheet">

  <!-- Motion (the page works fully without these) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js" defer></script>
  <script src="assets/js/shevitsa.js?v={ASSET_V}" defer></script>

  <!-- Generated by _tools/build_project.py — the text comes from the original page. -->
</head>

<body class="project-page">

  <a class="skip-link" href="#main">Skip to content</a>

  <header id="header" class="nav">
    <div class="nav__inner">
      <a href="index.html" class="nav__logo" aria-label="IYAC Bulgaria home">
        <img src="assets/img/logo.png" alt="IYAC Bulgaria" width="140" height="140">
      </a>

      <nav id="navmenu" class="nav__menu" aria-label="Main">
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="index.html#projects" class="is-active" aria-current="page">Projects</a></li>
          <li><a href="index.html#contact">Contact</a></li>
          <li class="only-mobile"><a href="index.html#about">About</a></li>
        </ul>
        <span class="nav__seam" aria-hidden="true"></span>
      </nav>

      <div class="lang" role="group" aria-label="Language">
        <a class="lang__opt is-active" href="{slug}.html" hreflang="en" lang="en" aria-current="true">EN</a>
        <a class="lang__opt" href="bg/{slug}.html" hreflang="bg" lang="bg">BG</a>
      </div>

      <a class="btn btn--red btn--sm nav__cta" href="index.html#about">About</a>

      <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="navmenu" aria-label="Open menu">
        <span></span><span></span>
      </button>
    </div>
    <div class="nav__progress" aria-hidden="true"><span></span></div>
  </header>

  <main id="main" class="main">

    <!-- ===== Project hero ===== -->
    <section class="phero">
      <div class="container phero__grid">
        <div class="phero__copy">
          <nav class="crumbs" aria-label="Breadcrumb">
            <ol>
              <li><a href="index.html">Home</a></li>
              <li aria-current="page">{o['title']}</li>
            </ol>
          </nav>
          <h1 class="phero__title" data-split="mask">{o['title']}</h1>
          <h2 class="phero__tag" data-split="mask">{o['h3']}</h2>
          <dl class="facts" data-reveal>
{chr(10).join(facts)}
          </dl>
          <div class="phero__actions" data-reveal style="--d:1">
            <span class="phero__label">{o['sidebar_title']}</span>
            <a class="btn btn--red btn--lg" href="{o['link']}" target="_blank" rel="noopener"><i class="bi bi-camera-reels" aria-hidden="true"></i> {o['link_label']} <i class="bi bi-arrow-up-right" aria-hidden="true"></i></a>
          </div>
        </div>

        <figure class="phero__poster" data-pendulum>
          <span class="phero__cord" aria-hidden="true"></span>
          <div class="phero__swing">
            <span class="patch__peg" aria-hidden="true"></span>
            <!-- PHOTO: project poster -->
            <img src="{poster}" alt="{o['title']} poster" width="{pw}" height="{ph}" fetchpriority="high">
          </div>
        </figure>
      </div>
    </section>

    <div class="band" data-band="1" aria-hidden="true"><div class="band__track"></div></div>

    <!-- ===== Story ===== -->
    <article class="story">
{chr(10).join(story)}
    </article>

    <!-- ===== Closing ===== -->
    <section class="skills section">
      <div class="container">
        <p class="skills__text" data-scrub-words>{closing}</p>
      </div>
    </section>

    <!-- ===== Gallery ===== -->
    <section id="gallery" class="gallery section">
      <div class="container">
        <header class="section-head" data-reveal>
          <h2 class="eyebrow">{o['gal_h2']}</h2>
          <p class="intro" data-scrub-words>{o['gal_intro']}</p>
        </header>
        <div class="gallery__grid" data-gallery>
{chr(10).join(tiles)}
        </div>
      </div>
    </section>

    <!-- ===== Funding ===== -->
    <section class="funding">
      <div class="container funding__inner" data-reveal>
        <img src="assets/img/cofounded.png" alt="Co-funded by the European Union" width="4119" height="919" loading="lazy" decoding="async">
        <p>{o['disclaimer']}</p>
      </div>
    </section>

    <!-- ===== Other projects ===== -->
    <section id="projects" class="projects section">
      <div class="container">
        <header class="section-head section-head--split" data-reveal>
          <div>
            <h2 class="eyebrow">Our projects</h2>
          </div>
          <div class="carousel__controls" data-carousel-controls>
            <button class="icon-btn" type="button" data-prev aria-label="Previous project"><i class="bi bi-arrow-left" aria-hidden="true"></i></button>
            <button class="icon-btn" type="button" data-next aria-label="Next project"><i class="bi bi-arrow-right" aria-hidden="true"></i></button>
          </div>
        </header>
      </div>

      <div class="carousel" data-carousel>
        <div class="carousel__viewport">
          <span class="carousel__cord" aria-hidden="true"></span>
          <ul class="carousel__track">

            {(chr(10) + chr(10) + '            ').join(others)}

          </ul>
        </div>
        <div class="container">
          <div class="carousel__progress" aria-hidden="true"><span></span></div>
        </div>
      </div>
    </section>

  </main>

{footer}

  <a href="#main" class="to-top icon-btn" aria-label="Back to top"><i class="bi bi-arrow-up" aria-hidden="true"></i></a>

  <!-- Full-screen photo viewer -->
  <div class="lightbox" role="dialog" aria-modal="true" aria-label="{o['gal_h2']}" hidden>
    <div class="lightbox__scrim"></div>
    <img class="lightbox__img" alt="">
    <div class="lightbox__bar">
      <span class="lightbox__count" aria-live="polite"></span>
      <button class="icon-btn lightbox__btn" type="button" data-lb="prev" aria-label="Previous photo"><i class="bi bi-arrow-left" aria-hidden="true"></i></button>
      <button class="icon-btn lightbox__btn" type="button" data-lb="next" aria-label="Next photo"><i class="bi bi-arrow-right" aria-hidden="true"></i></button>
      <button class="icon-btn lightbox__btn" type="button" data-lb="close" aria-label="Close"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
    </div>
  </div>

</body>

</html>
'''
    (ROOT / f'{slug}.html').write_text(page, encoding='utf-8')
    chapters = sum(1 for k, _ in story_blocks if k == 'chapter')
    print(f'built {slug}.html: {chapters} chapters, {len(tiles)} photos')


if __name__ == '__main__':
    for slug in (sys.argv[1:] or ORDER):
        build(slug)
