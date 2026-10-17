"""
Builds safeclick.html, the page for the SAFE CLICK project (2026-1-BG01-KA210-YOU-000453902).

Usage:  python _tools/build_safeclick.py      (then python _tools/i18n.py for /bg)

The wording comes from the project announcement. The page shares the head,
navigation and footer with the other pages, and adds its own "terminal" look
from assets/css/safeclick.css and assets/js/safeclick.js. It is not linked
from the homepage yet.
"""
import html
from pathlib import Path

from build_project import ASSET_V, ROOT, chrome_top, extract_original, image_size, shared_from_home, stitch_flag

SLUG = 'safeclick'
LOGOS = 'assets/img/projects/safeclick'  # PHOTO: logo-safeclick.png, partner-iyac.png, partner-ctv.png, partner-vizija.png

TITLE = 'SAFE CLICK'
TAGLINE = 'Building Digital Resilience and Cyber Capacity in Youth Work'
NUMBER = '2026-1-BG01-KA210-YOU-000453902'

INTRO = [
    'We are excited to announce the launch of our new Erasmus+ project “SAFE CLICK – Building Digital Resilience '
    'and Cyber Capacity in Youth Work”.',
    'The project officially starts on <b>1 September 2026</b> and will run until <b>31 August 2027</b>, bringing together '
    'organisations from Bulgaria, Serbia, and Romania to strengthen digital resilience, cybersecurity awareness, and '
    'digital safety in the youth and NGO sector.',
]
COORDINATION = ('The project is coordinated by International Youth Activity Center (Bulgaria) in partnership with '
                'Inicijativa Vizija (Serbia) and Asociația Colțul Tinerilor din Vest (Romania).')
TOGETHER = ('Together, we aim to support youth workers and non-governmental organisations in becoming more aware of '
            'digital risks and better prepared to protect their organisations, data, and the young people they work with.')

# (logo file, role, organisation, country, flag)
PARTNERS = [
    ('partner-iyac', 'Coordinator', 'International Youth Activity Center', 'Bulgaria', 'bg'),
    ('partner-vizija', 'Partner', 'Inicijativa Vizija', 'Serbia', 'rs'),
    ('partner-ctv', 'Partner', 'Asociația Colțul Tinerilor din Vest', 'Romania', 'ro'),
]

GOALS = [
    'Assessing the level of cybersecurity awareness and digital preparedness among NGOs and youth workers.',
    'Identifying the most common knowledge gaps, risky organisational practices, and digital threats.',
    'Developing a web-based tool for self-assessment of digital risks, providing practical and personalised recommendations.',
    'Strengthening the cybersecurity knowledge and skills of youth workers through an international training course.',
    'Developing practical methodologies, educational sessions, and realistic cybersecurity scenarios for use in non-formal education.',
]

ACTIVITIES = [
    ('Cybersecurity Awareness Assessment and Threat Mapping',
     'research will be conducted in the three partner countries through surveys and interviews with NGOs and youth '
     'workers in order to identify their main cybersecurity challenges, vulnerabilities, and level of preparedness.'),
    ('Development of a Digital Tool for NGO Cyber Resilience',
     'based on the research findings, the partners will develop a free web-based self-assessment tool that will help '
     'organisations evaluate their digital risks and receive practical recommendations on how to improve their cybersecurity.'),
    ('Capacity Building Training Course and Joint Development of Educational Tools',
     'youth workers from the partner countries will take part in an international training course focused on digital '
     'safety and cybersecurity. During the activity, participants will also contribute to the development of practical '
     'educational methodologies and materials.'),
    ('National multiplier events',
     'three final events, one in each partner country, will present the project results, demonstrate the digital '
     'self-assessment tool, and introduce the educational resources developed during the project.'),
]

BENEFIT = [
    'The main target groups of SAFE CLICK are youth workers and staff members of non-governmental organisations.',
    'Young people will also benefit from the project through local workshops, campaigns, and educational activities '
    'delivered by trained youth workers.',
    'The project aims to involve at least 50 organisations, train at least 24 youth workers, organise at least 12 local '
    'educational activities, and reach at least 300 young people. A library of at least 15 realistic digital threat '
    'scenarios will also be developed as part of the project’s educational resources.',
]
# The targets from the paragraph above, as counters
TARGETS = [('50', 'organisations involved'), ('24', 'youth workers trained'), ('12', 'local educational activities'),
           ('300', 'young people reached'), ('15', 'realistic digital threat scenarios')]

RESULTS = [
    'By the end of the project, NGOs and youth workers will have access to practical and freely available resources '
    'that can help them better understand and manage digital risks.',
    'The project will produce a web-based digital risk self-assessment tool, a collection of realistic cybersecurity '
    'scenarios, and a toolkit containing methodologies and educational materials that youth workers can use and adapt '
    'in their own activities.',
    'All project results will remain freely available online, allowing other youth organisations and NGOs across '
    'Europe to use them beyond the lifetime of the project.',
]
# The three outputs named above
OUTPUTS = [('bi-ui-checks-grid', 'Digital risk self-assessment tool'),
           ('bi-collection', 'Realistic cybersecurity scenarios'),
           ('bi-tools', 'Toolkit of methodologies and educational materials')]

WHY = [
    'Digital safety is becoming increasingly important for youth organisations and NGOs, which regularly work with '
    'personal and sensitive information but often have limited access to specialised IT support and cybersecurity training.',
    'SAFE CLICK aims to make cybersecurity more practical, understandable, and accessible, helping organisations develop '
    'safer digital practices and enabling youth workers to transfer this knowledge to young people in their communities.',
]

TUNED = [
    'More information about the project research, international training, digital self-assessment tool, local '
    'activities, and opportunities to get involved will be shared soon.',
    'Follow the SAFE CLICK journey and join us in building a safer and more digitally resilient youth sector.',
]

# Terminal lines in the hero (decorative; the same facts are in the text below)
BOOT = ['./safe_click --init', 'partners: BG · RS · RO', '2026-09-01 → 2027-08-31', 'status: launched']


def logo(name, alt, cls, loading='lazy'):
    src = f'{LOGOS}/{name}.png'
    w, h = image_size(src)
    return f'<img class="{cls}" src="{src}" alt="{html.escape(alt)}" width="{w}" height="{h}" loading="{loading}" decoding="async">'


def build():
    footer, _ = shared_from_home()
    disclaimer = extract_original('letuscook')['disclaimer']

    boot = '\n'.join(
        f'            <p class="sc-line" data-type style="--i:{k}"><span class="sc-line__mark">{"$" if k == 0 else ">"}</span> <span>{t}</span></p>'
        for k, t in enumerate(BOOT))

    nodes = '\n'.join(f'''          <li class="sc-node" data-reveal style="--d:{k}">
            <div class="sc-node__ring">
              <span class="sc-node__scan" aria-hidden="true"></span>
              {logo(f, org, 'sc-node__logo')}
            </div>
            <span class="sc-node__role">{role}</span>
            <span class="sc-node__name">{org}</span>
            <span class="sc-node__country">{stitch_flag(flag, 'sc-node__flag')}<span>{country}</span></span>
          </li>''' for k, (f, role, org, country, flag) in enumerate(PARTNERS))

    goals = '\n'.join(f'''          <li class="sc-goal" data-reveal style="--d:{k}">
            <span class="sc-goal__id" aria-hidden="true">0x0{k + 1}</span>
            <span class="sc-goal__check" aria-hidden="true"></span>
            <span class="sc-goal__text">{t}</span>
          </li>''' for k, t in enumerate(GOALS))

    steps = '\n'.join(f'''          <li class="sc-step" data-reveal>
            <span class="sc-step__node" aria-hidden="true"><span>{k + 1:02d}</span></span>
            <div class="sc-step__card">
              <span class="sc-step__count" aria-hidden="true">{k + 1:02d} / {len(ACTIVITIES):02d}</span>
              <h3 class="sc-step__title">{title}</h3>
              <p class="sc-step__text">{text[0].upper() + text[1:]}</p>
            </div>
          </li>''' for k, (title, text) in enumerate(ACTIVITIES))

    stats = '\n'.join(f'''          <div class="sc-stat" data-reveal style="--d:{k}">
            <span class="sc-stat__min">at least</span>
            <span class="sc-stat__num" data-odometer="{n}">{n}</span>
            <span class="sc-stat__label">{label}</span>
          </div>''' for k, (n, label) in enumerate(TARGETS))

    outputs = '\n'.join(f'''          <li class="sc-output" data-reveal style="--d:{k}">
            <span class="sc-output__icon"><i class="bi {icon}" aria-hidden="true"></i></span>
            <span class="sc-output__name">{name}</span>
            <span class="sc-output__tag">open access</span>
          </li>''' for k, (icon, name) in enumerate(OUTPUTS))

    p = lambda items, cls='': '\n'.join(f'          <p{cls} data-reveal>{t}</p>' for t in items)
    description = html.escape(INTRO[1].replace('<b>', '').replace('</b>', ''))

    head = chrome_top(f'{TITLE} – {TAGLINE}', description, SLUG, 'project-page sc-page',
                      'Generated by _tools/build_safeclick.py — the text comes from the project announcement.')
    # The page's own look: a monospaced face and the terminal styles
    head = head.replace('  <!-- Motion (the page works fully without these) -->',
                        '  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">\n'
                        f'  <link href="assets/css/safeclick.css?v={ASSET_V}" rel="stylesheet">\n\n'
                        '  <!-- Motion (the page works fully without these) -->')
    head = head.replace(f'  <script src="assets/js/shevitsa.js?v={ASSET_V}" defer></script>\n',
                        f'  <script src="assets/js/shevitsa.js?v={ASSET_V}" defer></script>\n'
                        f'  <script src="assets/js/safeclick.js?v={ASSET_V}" defer></script>\n')
    assert 'safeclick.css' in head and 'safeclick.js' in head

    page = f'''{head}
  <main id="main" class="main">

    <!-- ===== Hero: a terminal on linen, and the project logo being scanned in a hoop ===== -->
    <section class="sc-hero">
      <div class="container">
        <nav class="crumbs" aria-label="Breadcrumb">
          <ol>
            <li><a href="index.html">Home</a></li>
            <li><a href="projects.html">Projects</a></li>
            <li aria-current="page"><span>{TITLE}</span></li>
          </ol>
        </nav>

        <div class="sc-hero__grid">
          <div class="sc-term">
            <div class="sc-term__bar" aria-hidden="true">
              <span class="sc-term__dots"><i></i><i></i><i></i></span>
              <span class="sc-term__path">iyac@stara-zagora: ~/erasmus+</span>
            </div>
            <canvas class="sc-rain" aria-hidden="true"></canvas>
            <div class="sc-term__body">
              <div class="sc-boot" aria-hidden="true">
{boot}
              </div>
              <h1 class="sc-title">
                <span class="sr-only">{TITLE}</span>
                <span class="stitch stitch--hero sc-title__stitch" data-stitch="SAFE CLICK" data-cell="10" data-speed="8" aria-hidden="true"></span>
              </h1>
              <p class="sc-tag" data-scramble>{TAGLINE}</p>
              <dl class="sc-facts">
                <div><dt>Dates</dt><dd>1 September 2026 – 31 August 2027</dd></div>
                <div><dt>Countries</dt><dd><span class="sc-facts__flags">{stitch_flag('bg')}{stitch_flag('rs')}{stitch_flag('ro')}</span><span>Bulgaria, Serbia, Romania</span></dd></div>
              </dl>
            </div>
          </div>

          <figure class="sc-badge" data-tilt>
            <div class="sc-badge__hoop">
              <div class="sc-badge__cloth">
                {logo('logo-safeclick', 'SAFE CLICK – Building Digital Resilience and Cyber Capacity in Youth Work logo', 'sc-badge__logo', 'eager')}
                <span class="sc-badge__scan" aria-hidden="true"></span>
              </div>
            </div>
            <figcaption class="sc-badge__status" aria-hidden="true"><span class="sc-led"></span><span>secure connection</span></figcaption>
          </figure>
        </div>
      </div>
    </section>

    <div class="band" data-band="12" aria-hidden="true"><div class="band__track"></div></div>

    <!-- ===== Announcement ===== -->
    <section class="section sc-intro">
      <div class="container story__col">
        <p class="story__lede" data-reveal>{INTRO[0]}</p>
        <p data-reveal>{INTRO[1]}</p>
      </div>
    </section>

    <!-- ===== Partners: three nodes on one network ===== -->
    <section class="section sc-net">
      <div class="container">
        <header class="section-head" data-reveal>
          <h2 class="eyebrow">Partnership</h2>
          <p class="sc-net__lead">{COORDINATION}</p>
        </header>
        <div class="sc-network">
          <svg class="sc-links" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true">
            <path id="sc-link" d="M50 20 H250" pathLength="1"/>
            <circle class="sc-packet" r="2.4"><animateMotion dur="3.2s" repeatCount="indefinite" path="M50 20 H250"/></circle>
            <circle class="sc-packet sc-packet--back" r="2.4"><animateMotion dur="4.1s" begin="1.2s" repeatCount="indefinite" path="M250 20 H50"/></circle>
          </svg>
          <ul class="sc-nodes">
{nodes}
          </ul>
        </div>
        <p class="sc-net__together" data-reveal>{TOGETHER}</p>
      </div>
    </section>

    <!-- ===== Goals ===== -->
    <section class="section sc-goals">
      <div class="container sc-split">
        <header class="section-head" data-reveal>
          <h2 class="eyebrow">What do we aim to achieve?</h2>
          <p class="intro">Our main goals are:</p>
        </header>
        <ol class="sc-checklist">
{goals}
        </ol>
      </div>
    </section>

    <!-- ===== Activities: a pipeline that fills as you scroll ===== -->
    <section class="section sc-acts">
      <div class="container">
        <header class="section-head" data-reveal>
          <h2 class="eyebrow">Activities ahead</h2>
          <p class="intro">Over the course of the project, the partners will work together on several key activities:</p>
        </header>
        <ol class="sc-pipeline" data-pipeline>
{steps}
        </ol>
      </div>
    </section>

    <!-- ===== Who will benefit ===== -->
    <section class="section sc-benefit">
      <div class="container">
        <header class="section-head" data-reveal>
          <h2 class="eyebrow">Who will benefit?</h2>
        </header>
        <div class="story__col sc-benefit__text">
{p(BENEFIT)}
        </div>
        <div class="sc-stats" aria-hidden="true">
{stats}
        </div>
      </div>
    </section>

    <!-- ===== Expected results ===== -->
    <section class="section sc-results">
      <div class="container sc-split">
        <div>
          <header class="section-head" data-reveal>
            <h2 class="eyebrow">Expected results</h2>
          </header>
          <div class="story__col">
{p(RESULTS)}
          </div>
        </div>
        <ul class="sc-outputs">
{outputs}
        </ul>
      </div>
    </section>

    <!-- ===== Why it matters ===== -->
    <section class="skills section sc-why">
      <div class="container">
        <h2 class="eyebrow sc-why__eyebrow" data-reveal>Why does it matter?</h2>
        <p class="skills__text" data-scrub-words>{WHY[0]}</p>
        <p class="sc-why__more" data-reveal>{WHY[1]}</p>
      </div>
    </section>

    <!-- ===== Stay tuned ===== -->
    <section class="section sc-tuned">
      <div class="container">
        <div class="sc-term sc-term--small" data-reveal>
          <div class="sc-term__bar" aria-hidden="true">
            <span class="sc-term__dots"><i></i><i></i><i></i></span>
            <span class="sc-term__path">~/safe_click/updates</span>
          </div>
          <div class="sc-term__body">
            <h2 class="sc-tuned__title"><span class="sc-line__mark" aria-hidden="true">$</span> <span>Stay tuned!</span><span class="sc-cursor" aria-hidden="true"></span></h2>
{p(TUNED, ' class="sc-tuned__text"')}
            <div class="sc-tuned__actions">
              <a class="btn btn--gold btn--lg" href="https://www.facebook.com/iyac.bulgaria" target="_blank" rel="noopener"><i class="bi bi-facebook" aria-hidden="true"></i> Facebook <i class="bi bi-arrow-up-right" aria-hidden="true"></i></a>
              <a class="btn btn--ghost btn--lg" href="https://www.instagram.com/iyac_bulgaria" target="_blank" rel="noopener"><i class="bi bi-instagram" aria-hidden="true"></i> Instagram <i class="bi bi-arrow-up-right" aria-hidden="true"></i></a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Funding ===== -->
    <section class="funding">
      <div class="container funding__inner" data-reveal>
        <img src="assets/img/cofounded.png" alt="Co-funded by the European Union" width="4119" height="919" loading="lazy" decoding="async">
        <div>
          <p class="sc-funding__num"><span>Project number</span> <span class="sc-mono">{NUMBER}</span></p>
          <p>{disclaimer}</p>
        </div>
      </div>
    </section>

  </main>

{footer}

  <a href="#main" class="to-top icon-btn" aria-label="Back to top"><i class="bi bi-arrow-up" aria-hidden="true"></i></a>

</body>

</html>
'''
    (ROOT / f'{SLUG}.html').write_text(page, encoding='utf-8')
    print(f'built {SLUG}.html')


if __name__ == '__main__':
    build()
