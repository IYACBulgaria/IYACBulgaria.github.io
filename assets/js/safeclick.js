/* SAFE CLICK page: terminal motion on top of shevitsa.js.
   Everything here is decoration; the page reads the same without it. */
(() => {
  'use strict';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const onView = (el, fn, threshold = 0.3) => {
    if (!('IntersectionObserver' in window)) return fn();
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); fn(); }
    }, { threshold });
    io.observe(el);
  };

  /* ---------- Boot lines type themselves, one after another ---------- */
  const lines = [...document.querySelectorAll('.sc-line[data-type]')];
  const typeLine = (line) => new Promise((done) => {
    const text = line.querySelector('span:last-child');
    const full = text.textContent;
    text.textContent = '';
    line.classList.add('is-typing');
    let i = 0;
    const step = () => {
      text.textContent = full.slice(0, ++i);
      if (i < full.length) setTimeout(step, 18 + Math.random() * 38);
      else { line.classList.remove('is-typing'); line.classList.add('is-typed'); setTimeout(done, 160); }
    };
    step();
  });
  if (reduceMotion) lines.forEach((l) => l.classList.add('is-typed'));
  else setTimeout(() => lines.reduce((p, l) => p.then(() => typeLine(l)), Promise.resolve()), 350);

  /* ---------- Text that decrypts into place ---------- */
  const GLYPHS = '01×#$%&<>/\\{}[]=+*';
  document.querySelectorAll('[data-scramble]').forEach((el) => {
    if (reduceMotion) return;
    const final = el.textContent.trim();
    // Screen readers get the real text; the scrambling layer is visual only
    el.innerHTML = `<span class="sr-only">${final}</span><span aria-hidden="true"></span>`;
    const out = el.lastChild;
    out.textContent = final;
    const run = () => {
      const start = performance.now(), dur = 1400;
      const frame = (t) => {
        const k = Math.min(1, (t - start) / dur);
        const fixed = Math.floor(k * final.length);
        let html = '';
        for (let i = 0; i < final.length; i++) {
          const ch = final[i];
          if (i < fixed || ch === ' ') html += ch === '<' ? '&lt;' : ch;
          else html += `<span class="sc-glyph">${GLYPHS[(Math.random() * GLYPHS.length) | 0].replace('<', '&lt;').replace('&', '&amp;')}</span>`;
        }
        out.innerHTML = html;
        if (k < 1) requestAnimationFrame(frame); else out.textContent = final;
      };
      requestAnimationFrame(frame);
    };
    onView(el, () => setTimeout(run, 900), 0.5);
  });

  /* ---------- Stitch rain: crosses and bits falling behind the hero ---------- */
  const canvas = document.querySelector('.sc-rain');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    // A gentle drizzle: few threads, slow, and each stitch drawn once as a thread enters a new cell
    const CELL = 18, CHARS = ['×', '×', '×', '0', '1'];
    const thread = (h) => ({ y: Math.random() * -h, v: 14 + Math.random() * 22, cell: -1, on: Math.random() < 0.45 });
    let cols = [], w = 0, h = 0, running = false, visible = false, last = 0;
    const resize = () => {
      const nw = canvas.clientWidth, nh = canvas.clientHeight;
      if (nw === w && Math.abs(nh - h) < 2) return;
      const widthChanged = nw !== w;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = nw; h = nh;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = '600 13px "JetBrains Mono", monospace';
      if (widthChanged || !cols.length) cols = Array.from({ length: Math.ceil(w / CELL) }, () => thread(h));
    };
    const tick = (t) => {
      if (!running) return;
      const dt = Math.min((t - last) / 1000 || 0.016, 0.05); last = t;
      // slow fade, so stitches leave soft trails instead of strobing
      ctx.fillStyle = 'rgba(23, 10, 13, 0.06)';
      ctx.fillRect(0, 0, w, h);
      cols.forEach((c, i) => {
        if (!c.on) return;
        c.y += c.v * dt;
        const cell = Math.floor(c.y / CELL);
        if (cell !== c.cell && c.y > 0) {
          c.cell = cell;
          ctx.fillStyle = i % 3 ? 'rgba(240, 160, 24, 0.55)' : 'rgba(200, 30, 60, 0.6)';
          ctx.fillText(CHARS[(Math.random() * CHARS.length) | 0], i * CELL + 3, cell * CELL);
        }
        if (c.y > h + 60) Object.assign(c, thread(h), { y: Math.random() * -160 });
      });
      requestAnimationFrame(tick);
    };
    const toggle = () => {
      const should = visible && !document.hidden;
      if (should && !running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
      else if (!should) running = false;
    };
    // The rain fades away as the hero scrolls up, rather than following the page
    const hero = canvas.closest('.sc-hero') || canvas;
    const fade = () => { canvas.style.opacity = String(0.4 * Math.max(0, 1 - scrollY / (hero.offsetHeight * 0.6))); };
    resize(); fade();
    // Only real size changes reset it (phone address bars change the height while scrolling)
    ('ResizeObserver' in window) ? new ResizeObserver(resize).observe(canvas) : addEventListener('resize', resize);
    addEventListener('scroll', fade, { passive: true });
    document.addEventListener('visibilitychange', toggle);
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; toggle(); }).observe(canvas);
  }

  /* ---------- The logo is scanned into its hoop, and tilts toward the pointer ---------- */
  const badge = document.querySelector('.sc-badge');
  if (badge) {
    onView(badge, () => setTimeout(() => badge.classList.add('is-scanned'), reduceMotion ? 0 : 500), 0.4);
    if (finePointer && !reduceMotion) {
      let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
      const loop = () => {
        x += (tx - x) * 0.12; y += (ty - y) * 0.12;
        badge.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg)`;
        raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.01 ? requestAnimationFrame(loop) : 0;
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
      badge.addEventListener('pointermove', (e) => {
        const r = badge.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 14;
        ty = -((e.clientY - r.top) / r.height - 0.5) * 14;
        kick();
      });
      badge.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
    }
  }

  /* ---------- Activities: the pipeline fills as you scroll ---------- */
  const pipe = document.querySelector('[data-pipeline]');
  if (pipe) {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) onView(pipe, () => pipe.style.setProperty('--p', 1), 0.2);
    else window.gsap.fromTo(pipe, { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: pipe, start: 'top 75%', end: 'bottom 60%', scrub: 0.4 } });
  }
})();
