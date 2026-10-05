/* =========================================================
   IYAC Bulgaria — "Shevitsa" motion engine
   Cross-stitch rendering, spring physics, scroll storytelling.
   Everything is progressive enhancement: without JS the page
   is complete, just not embroidered.
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  // Interface words the script sets itself (the page text is translated in the HTML)
  const BG = root.lang === 'bg';
  const t = (en, bg) => (BG ? bg : en);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------- Physics ---------- */
  // Spring with Apple-style parameters: damping ratio + response (seconds)
  function stepSpring(s, target, dt, damping, response) {
    const k = Math.pow((2 * Math.PI) / response, 2);
    const c = (4 * Math.PI * damping) / response;
    const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      s.v += (-k * (s.x - target) - c * s.v) * h;
      s.x += s.v * h;
    }
  }
  const project = (v, rate = 0.998) => ((v / 1000) * rate) / (1 - rate);
  const rubberband = (o, dim, c = 0.55) => (o * dim * c) / (dim + c * Math.abs(o));

  // Small deterministic random (so patterns are the same on every visit)
  const rand = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  /* =========================================================
     Cross-stitch pattern library
     ========================================================= */
  const FONT = {
    A: ['01110','10001','10001','11111','10001','10001','10001'],
    B: ['11110','10001','10001','11110','10001','10001','11110'],
    C: ['01111','10000','10000','10000','10000','10000','01111'],
    D: ['11110','10001','10001','10001','10001','10001','11110'],
    E: ['11111','10000','10000','11110','10000','10000','11111'],
    F: ['11111','10000','10000','11110','10000','10000','10000'],
    G: ['01111','10000','10000','10011','10001','10001','01111'],
    H: ['10001','10001','10001','11111','10001','10001','10001'],
    I: ['11111','00100','00100','00100','00100','00100','11111'],
    J: ['00111','00010','00010','00010','00010','10010','01100'],
    K: ['10001','10010','10100','11000','10100','10010','10001'],
    L: ['10000','10000','10000','10000','10000','10000','11111'],
    M: ['10001','11011','10101','10101','10001','10001','10001'],
    N: ['10001','11001','10101','10011','10001','10001','10001'],
    O: ['01110','10001','10001','10001','10001','10001','01110'],
    P: ['11110','10001','10001','11110','10000','10000','10000'],
    Q: ['01110','10001','10001','10001','10101','10010','01101'],
    R: ['11110','10001','10001','11110','10100','10010','10001'],
    S: ['01111','10000','10000','01110','00001','00001','11110'],
    T: ['11111','00100','00100','00100','00100','00100','00100'],
    U: ['10001','10001','10001','10001','10001','10001','01110'],
    V: ['10001','10001','10001','10001','10001','01010','00100'],
    W: ['10001','10001','10001','10101','10101','10101','01010'],
    X: ['10001','10001','01010','00100','01010','10001','10001'],
    Y: ['10001','10001','01010','00100','00100','00100','00100'],
    Z: ['11111','00001','00010','00100','01000','10000','11111'],
    0: ['01110','10001','10011','10101','11001','10001','01110'],
    1: ['00100','01100','00100','00100','00100','00100','01110'],
    2: ['01110','10001','00001','00010','00100','01000','11111'],
    3: ['11110','00001','00001','01110','00001','00001','11110'],
    4: ['00010','00110','01010','10010','11111','00010','00010'],
    5: ['11111','10000','11110','00001','00001','10001','01110'],
    6: ['00110','01000','10000','11110','10001','10001','01110'],
    7: ['11111','00001','00010','00100','01000','01000','01000'],
    8: ['01110','10001','10001','01110','10001','10001','01110'],
    9: ['01110','10001','10001','01111','00001','00010','01100'],
    '!': ['1','1','1','1','1','0','1'],
    '-': ['000','000','000','111','000','000','000'],
    '.': ['0','0','0','0','0','0','1'],
  };

  const ICONS = {
    heart: ['0110110','1111111','1111111','1111111','0111110','0011100','0001000'],
    globe: ['0011100','0101010','1111111','1010101','1111111','0101010','0011100'],
    home:  ['0001000','0011100','0111110','1111111','0100010','0101010','0111110'],
    x:     ['101','010','101'],
  };

  const fromRows = (rows) => {
    const cells = [];
    rows.forEach((r, y) => [...r].forEach((b, x) => { if (b === '1') cells.push([x, y]); }));
    return { cells, w: Math.max(...rows.map((r) => r.length)), h: rows.length };
  };

  const fromRule = (R, rule) => {
    const cells = [];
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) if (rule(x, y)) cells.push([x + R, y + R]);
    return { cells, w: R * 2 + 1, h: R * 2 + 1 };
  };

  const MOTIFS = {
    // Bulgarian eight-pointed star
    star: () => fromRule(5, (x, y) => {
      const d = Math.abs(x) + Math.abs(y);
      return d === 5 || (x === 0 && Math.abs(y) <= 3) || (y === 0 && Math.abs(x) <= 3) || (Math.abs(x) === Math.abs(y) && Math.abs(x) <= 2);
    }),
    cross: () => fromRule(2, (x, y) => x === 0 || y === 0),
    diamond: () => fromRule(4, (x, y) => [4, 2, 0].includes(Math.abs(x) + Math.abs(y))),
    corner: () => {
      const cells = [];
      for (let i = 0; i < 8; i++) { cells.push([i, 0]); if (i) cells.push([0, i]); }
      [[2, 2], [3, 2], [2, 3], [4, 2], [2, 4], [3, 3]].forEach((c) => cells.push(c));
      return { cells, w: 8, h: 8 };
    },
    rosette: () => fromRule(15, (x, y) => {
      const ax = Math.abs(x), ay = Math.abs(y), d = ax + ay;
      return d === 15 || d === 12 ||
        (x === 0 && ay <= 9) || (y === 0 && ax <= 9) ||
        (ax === ay && ax <= 6 && ax > 0) ||
        (d === 9 && (x + y) % 2 === 0 && ax > 0 && ay > 0) ||
        (d === 4 && (ax === 0 || ay === 0 || ax === ay));
    }),
  };

  function textCells(text) {
    const cells = []; let x0 = 0;
    for (const ch of text.toUpperCase()) {
      if (ch === ' ') { x0 += 3; continue; }
      const g = FONT[ch]; if (!g) continue;
      g.forEach((row, y) => [...row].forEach((b, x) => { if (b === '1') cells.push([x0 + x, y]); }));
      x0 += g[0].length + 1;
    }
    return { cells, w: Math.max(1, x0 - 1), h: 7 };
  }

  // A unique embroidered strip for every project, generated from its number
  function bandCells(seed, cols = 30) {
    const cells = []; const kind = (seed - 1) % 4; const off = seed % 3;
    for (let x = 0; x < cols; x++) {
      const m = (x + off) % 4;
      if (kind === 0) cells.push([x, [2, 1, 0, 1][m]]);
      if (kind === 1) { if (m === 1) cells.push([x, 0], [x, 2]); if (m === 0 || m === 2) cells.push([x, 1]); }
      if (kind === 2) { if (m === 1) cells.push([x, 0], [x, 1], [x, 2]); else if (m !== 3) cells.push([x, 1]); }
      if (kind === 3) { const k = (x + off) % 6; if (k < 3 && (k + 0) % 2 === 0) cells.push([x, 0], [x, 2]); if (k === 1) cells.push([x, 1]); if (k === 4) cells.push([x, 1]); }
    }
    return { cells, w: cols, h: 3 };
  }

  // Folk band tile: chained diamonds
  function bandTile() {
    const cells = [];
    for (let y = -4; y <= 4; y++) for (let x = -6; x <= 5; x++) {
      const d = Math.abs(x) + Math.abs(y);
      if (d === 4 || d === 0 || (d === 2 && (x === 0 || y === 0)) || (y === 0 && Math.abs(x) >= 5)) cells.push([x + 6, y + 4]);
    }
    return { cells, w: 12, h: 9 };
  }

  /* ---------- SVG builder ----------
     Real cross-stitch is sewn row by row: a row of "/" half-stitches
     left→right, then back right→left closing each with "\".        */
  function buildSVG({ cells, w, h }, cell = 10, speed = 6, opts = {}) {
    const pad = cell * 0.2, sw = opts.strokeWidth || cell * 0.24;
    const rows = new Map(), colors = new Map();
    cells.forEach(([x, y, c]) => { if (!rows.has(y)) rows.set(y, []); rows.get(y).push(x); if (c) colors.set(`${x},${y}`, c); });
    const order = [...rows.keys()].sort((a, b) => a - b);
    const crosses = new Map(); let t = 0;
    order.forEach((y) => {
      const xs = rows.get(y).sort((a, b) => a - b);
      xs.forEach((x) => { crosses.set(`${x},${y}`, { x, y, d1: t }); t += speed; });
      [...xs].reverse().forEach((x) => { crosses.get(`${x},${y}`).d2 = t; t += speed; });
    });
    let out = '';
    crosses.forEach(({ x, y, d1, d2 }) => {
      const X = x * cell, Y = y * cell;
      const c = colors.get(`${x},${y}`);
      out += `<g class="x" data-cx="${X + cell / 2}" data-cy="${Y + cell / 2}"${c ? ` style="color:${c}"` : ''}>` +
        `<path pathLength="1" d="M${X + pad} ${Y + cell - pad}L${X + cell - pad} ${Y + pad}" style="--d:${d1}ms"/>` +
        `<path pathLength="1" d="M${X + pad} ${Y + pad}L${X + cell - pad} ${Y + cell - pad}" style="--d:${d2}ms"/></g>`;
    });
    const par = opts.preserve ? ` preserveAspectRatio="${opts.preserve}"` : '';
    return { html: `<svg viewBox="0 0 ${w * cell} ${h * cell}"${par} style="stroke-width:${sw}">${out}</svg>`, duration: t };
  }

  // Flags of the partner countries, in cross-stitch (12 × 9)
  const W_FLAG = 12, H_FLAG = 9;
  const band3 = (v, n, a, b, c) => [a, b, c][Math.min(2, Math.floor((v * 3) / n))];
  const FLAGS = {
    bg: (x, y) => band3(y, H_FLAG, '#FFFFFF', '#00966E', '#D62612'),
    hu: (x, y) => band3(y, H_FLAG, '#CD2A3E', '#FFFFFF', '#436F4D'),
    ro: (x) => band3(x, W_FLAG, '#002B7F', '#FCD116', '#CE1126'),
    pl: (x, y) => (y < 5 ? '#FFFFFF' : '#DC143C'),
    lu: (x, y) => band3(y, H_FLAG, '#ED2939', '#FFFFFF', '#00A1DE'),
    md: (x, y) => {
      // Blue, yellow, red, with the eagle as a small brown-gold emblem in the centre
      if (x >= 5 && x <= 6 && y >= 3 && y <= 5) return y === 5 ? '#CC092F' : '#A6772D';
      return band3(x, W_FLAG, '#0046AE', '#FFD200', '#CC092F');
    },
    gr: (x, y) => (x < 5 && y < 5
      ? ((x === 2 || y === 2) ? '#FFFFFF' : '#0D5EAF')
      : (y % 2 ? '#FFFFFF' : '#0D5EAF')),
    sk: (x, y) => {
      // Red shield with a white cross over blue hills, set toward the hoist
      const inShield = x >= 2 && x <= 6 && y >= 2 && y <= 7 && !(y === 7 && (x === 2 || x === 6));
      if (inShield) {
        if (y === 7 || (y === 6 && (x === 3 || x === 5))) return '#0B4EA2';
        if ((x === 4 && y >= 3 && y <= 6) || (y === 4 && x >= 3 && x <= 5)) return '#FFFFFF';
        return '#EE1C25';
      }
      return band3(y, H_FLAG, '#FFFFFF', '#0B4EA2', '#EE1C25');
    },
    mk: (x, y) => {
      // A sun with eight rays reaching the edges and corners
      const dx = x + 0.5 - W_FLAG / 2, dy = y + 0.5 - H_FLAG / 2, d = Math.hypot(dx, dy);
      if (d < 2.05) return '#FFE600';
      const a = Math.atan2(dy, dx), rays = [0, Math.PI / 2, Math.PI, -Math.PI / 2,
        Math.atan2(4.5, 6), Math.atan2(4.5, -6), Math.atan2(-4.5, 6), Math.atan2(-4.5, -6)];
      const tol = 0.035 + d * 0.014; // rays widen toward the edge
      return rays.some((r) => Math.abs(Math.atan2(Math.sin(a - r), Math.cos(a - r))) < tol) ? '#FFE600' : '#D20000';
    },
    tr: (x, y) => {
      // White crescent and star on red
      const cx = x + 0.5, cy = y + 0.5;
      const inOuter = Math.hypot(cx - 4.6, cy - 4.5) < 3.1, inInner = Math.hypot(cx - 5.5, cy - 4.5) < 2.5;
      const star = Math.abs(cx - 8.5) + Math.abs(cy - 4.5) <= 1.1;
      return (inOuter && !inInner) || star ? '#FFFFFF' : '#E30A17';
    },
  };
  const flagCells = (code) => {
    const cells = [];
    for (let y = 0; y < H_FLAG; y++) for (let x = 0; x < W_FLAG; x++) cells.push([x, y, FLAGS[code](x, y)]);
    return { cells, w: W_FLAG, h: H_FLAG };
  };

  function renderStitch(el) {
    const cell = Number(el.dataset.cell || 10);
    const speed = Number(el.dataset.speed || 6);
    let pattern;
    if (el.dataset.stitch) pattern = textCells(el.dataset.stitch);
    else if (el.dataset.icon) pattern = fromRows(ICONS[el.dataset.icon]);
    else if (el.dataset.motif) pattern = MOTIFS[el.dataset.motif]();
    else if (el.dataset.bandSeed) pattern = bandCells(Number(el.dataset.bandSeed));
    else if (el.dataset.flag && FLAGS[el.dataset.flag]) pattern = flagCells(el.dataset.flag);
    if (!pattern) return;
    const { html, duration } = buildSVG(pattern, cell, speed, el.dataset.bandSeed ? { preserve: 'xMidYMid meet' } : {});
    el.innerHTML = html;
    el._duration = duration;
  }

  const stitches = [...document.querySelectorAll('.stitch')];
  stitches.forEach(renderStitch);

  const sew = (el) => el.classList.add(reduceMotion ? 'is-static' : 'is-sewn');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    stitches.forEach((el) => el.classList.add('is-static'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { sew(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.25 });
    stitches.forEach((el) => { if (!el.classList.contains('stitch--hero')) io.observe(el); });
  }

  /* ---------- Hero: sew the name, then the underline ---------- */
  const heroWord = document.querySelector('.stitch--hero');
  const tagline = document.querySelector('[data-underline]');
  if (tagline) {
    const word = tagline.dataset.underline;
    tagline.innerHTML = tagline.innerHTML.replace(word,
      `<span class="u-stitch">${word}<svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M0 6 L5 2 L10 8 L15 2 L20 8 L25 2 L30 8 L35 2 L40 8 L45 2 L50 8 L55 2 L60 8 L65 2 L70 8 L75 2 L80 8 L85 2 L90 8 L95 2 L100 6"/></svg></span>`);
  }
  const underline = document.querySelector('.u-stitch');
  if (heroWord) {
    if (reduceMotion) { heroWord.classList.add('is-static'); underline && underline.classList.add('is-sewn'); }
    else {
      setTimeout(() => sew(heroWord), 250);
      setTimeout(() => underline && underline.classList.add('is-sewn'), 250 + (heroWord._duration || 1200) * 0.85);
    }
  }

  /* ---------- Hero: stitches react like fabric ---------- */
  if (heroWord && !reduceMotion) {
    const svg = heroWord.querySelector('svg');
    const vb = svg.viewBox.baseVal;
    const xs = [...svg.querySelectorAll('g.x')].map((g) => ({
      g, cx: Number(g.dataset.cx), cy: Number(g.dataset.cy),
      sx: { x: 0, v: 0 }, sy: { x: 0, v: 0 }, tx: 0, ty: 0,
    }));
    const area = heroWord.closest('.hero__copy') || heroWord;
    let px = -1e4, py = -1e4, running = false, last = 0;
    const R = 60, PUSH = 26;

    const tick = (t) => {
      const dt = Math.min((t - last) / 1000 || 0.016, 0.033); last = t;
      let moving = false;
      xs.forEach((c) => {
        const dx = c.cx - px, dy = c.cy - py, d = Math.hypot(dx, dy);
        if (d < R && d > 0.01) { const f = Math.pow(1 - d / R, 2) * PUSH; c.tx = (dx / d) * f; c.ty = (dy / d) * f; }
        else { c.tx = 0; c.ty = 0; }
        stepSpring(c.sx, c.tx, dt, 0.45, 0.5);
        stepSpring(c.sy, c.ty, dt, 0.45, 0.5);
        if (Math.abs(c.sx.x) + Math.abs(c.sy.x) + Math.abs(c.sx.v) + Math.abs(c.sy.v) > 0.05) {
          moving = true;
          c.g.setAttribute('transform', `translate(${c.sx.x.toFixed(2)} ${c.sy.x.toFixed(2)})`);
        } else if (c.g.hasAttribute('transform')) c.g.removeAttribute('transform');
      });
      if (moving || px > -1e3) requestAnimationFrame(tick); else running = false;
    };
    const kick = () => { if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); } };
    const toLocal = (e) => {
      const r = svg.getBoundingClientRect();
      const s = vb.width / r.width;
      return [(e.clientX - r.left) * s, (e.clientY - r.top) * s];
    };
    if (finePointer) {
      area.addEventListener('pointermove', (e) => { [px, py] = toLocal(e); kick(); });
      area.addEventListener('pointerleave', () => { px = py = -1e4; kick(); });
    }
    // A tap or click makes the stitches jump outward and settle back
    heroWord.addEventListener('pointerdown', (e) => {
      const [qx, qy] = toLocal(e);
      xs.forEach((c) => {
        const dx = c.cx - qx, dy = c.cy - qy, d = Math.hypot(dx, dy) || 1;
        const f = Math.max(0, 1 - d / 140) * 900;
        c.sx.v += (dx / d) * f; c.sy.v += (dy / d) * f;
      });
      if (navigator.vibrate) navigator.vibrate(8);
      kick();
    });
  }

  /* =========================================================
     Embroidery hoop: the photo is cross-stitched; scrolling or
     brushing over it unpicks the stitches to reveal the photo.
     ========================================================= */
  const FABRIC = 'rgba(251,248,243,0.8)'; // the photo ghosts through the linen

  class Hoop {
    constructor(el) {
      this.el = el;
      this.fabric = el.querySelector('.hoop__fabric');
      this.img = el.querySelector('img');
      this.cv = el.querySelector('canvas');
      this.brush = el.querySelector('.hoop__brush');
      this.ctx = this.cv.getContext('2d');
      this.p = 0; this.ripped = 0; this.lastPt = null;
      const ready = () => { this.build(); this.bind(); };
      this.img.complete && this.img.naturalWidth ? ready() : this.img.addEventListener('load', ready, { once: true });
    }

    build() {
      const w = this.fabric.clientWidth, h = this.fabric.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      this.w = w; this.h = h;
      this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.step = w < 420 ? 8 : 10;
      this.rad = clamp(w * 0.14, 46, 84);          // brush radius (bigger on touch)
      this.el.style.setProperty('--bs', `${Math.round(this.rad * 2)}px`);
      const cols = this.cols = Math.ceil(w / this.step), rows = this.rows = Math.ceil(h / this.step);

      // Sample the photo exactly as object-fit: cover crops it
      const tmp = document.createElement('canvas'); tmp.width = cols; tmp.height = rows;
      const tc = tmp.getContext('2d', { willReadFrequently: true });
      const img = this.img, ir = img.naturalWidth / img.naturalHeight, br = w / h;
      let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
      const [fx, fy] = (getComputedStyle(img).objectPosition || '50% 50%').split(' ').map((v) => parseFloat(v) / 100);
      if (ir > br) { sw = sh * br; sx = (img.naturalWidth - sw) * (isNaN(fx) ? 0.5 : fx); }
      else { sh = sw / br; sy = (img.naturalHeight - sh) * (isNaN(fy) ? 0.5 : fy); }
      tc.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
      let data;
      try { data = tc.getImageData(0, 0, cols, rows).data; } catch (_) { root.classList.add('no-stitchfx'); return; }

      const rnd = rand(7);
      this.cells = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = (r * cols + c) * 4;
        const lum = (0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2]) / 255;
        const dist = Math.hypot((c + 0.5) / cols - 0.5, (r + 0.5) / rows - 0.5) / 0.5;
        if (dist > 1.03) continue;
        this.cells.push({
          c, r, level: clamp(Math.round(Math.pow(1 - lum, 0.8) * 8), 0, 8),
          thr: dist * 0.72 + rnd() * 0.28, open: false, ripped: false,
        });
      }
      this.sorted = [...this.cells].sort((a, b) => a.thr - b.thr);
      this.grid = new Map(this.cells.map((cell) => [cell.r * cols + cell.c, cell]));
      this.ptr = 0;

      const ctx = this.ctx;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = FABRIC; ctx.fillRect(0, 0, w, h);
      ctx.lineCap = 'round';
      for (let L = 1; L <= 8; L++) {
        ctx.beginPath();
        this.cells.forEach((cell) => { if (cell.level === L) this.path(cell); });
        this.style(L); ctx.stroke();
      }
      const p = this.p; this.p = 0; this.setProgress(p);
    }

    style(L) {
      const t = L / 8;
      this.ctx.strokeStyle = `rgba(${Math.round(92 + 50 * (1 - t))},0,${Math.round(17 + 10 * (1 - t))},${(0.35 + t * 0.65).toFixed(2)})`;
      this.ctx.lineWidth = 1.1 + t * 2;
    }
    path(cell) {
      const s = this.step, x = cell.c * s, y = cell.r * s, p = 1.4;
      this.ctx.moveTo(x + p, y + s - p); this.ctx.lineTo(x + s - p, y + p);
      this.ctx.moveTo(x + p, y + p); this.ctx.lineTo(x + s - p, y + s - p);
    }
    open(cell) {
      if (cell.open) return; cell.open = true;
      this.ctx.clearRect(cell.c * this.step, cell.r * this.step, this.step, this.step);
    }
    close(cell) {
      if (!cell.open || cell.ripped) return; cell.open = false;
      const s = this.step, x = cell.c * s, y = cell.r * s, ctx = this.ctx;
      ctx.fillStyle = FABRIC; ctx.fillRect(x, y, s, s);
      if (cell.level) { ctx.beginPath(); this.path(cell); this.style(cell.level); ctx.stroke(); }
    }

    setProgress(p) {
      if (!this.sorted) return;
      p = clamp(p, 0, 1);
      const limit = p * 1.02;
      while (this.ptr < this.sorted.length && this.sorted[this.ptr].thr <= limit) this.open(this.sorted[this.ptr++]);
      while (this.ptr > 0 && this.sorted[this.ptr - 1].thr > limit) this.close(this.sorted[--this.ptr]);
      this.p = p;
      this.updateHint();
    }
    updateHint() { this.el.classList.toggle('is-unstitched', this.p > 0.15 || this.ripped > this.cells.length * 0.05); }

    // Unpick a round patch of stitches
    ripAt(x, y, rad) {
      const s = this.step;
      for (let cy = Math.floor((y - rad) / s); cy <= Math.floor((y + rad) / s); cy++) {
        for (let cx = Math.floor((x - rad) / s); cx <= Math.floor((x + rad) / s); cx++) {
          const cell = this.grid.get(cy * this.cols + cx);
          if (!cell || cell.ripped) continue;
          if (Math.hypot(cx * s + s / 2 - x, cy * s + s / 2 - y) > rad) continue;
          cell.ripped = true; this.ripped++; this.open(cell);
        }
      }
    }

    local(e) {
      const r = this.cv.getBoundingClientRect();
      return [(e.clientX - r.left) * (this.w / r.width), (e.clientY - r.top) * (this.h / r.height)];
    }

    // Brush strokes are interpolated, so fast sweeps leave no gaps
    stroke(e) {
      if (!this.grid) return;
      const [x, y] = this.local(e);
      const rad = this.rad * (e.pointerType === 'touch' ? 1.2 : 1);
      this.moveBrush(x, y);
      const last = this.lastPt || [x, y];
      const dist = Math.hypot(x - last[0], y - last[1]);
      const n = Math.max(1, Math.ceil(dist / (rad * 0.35)));
      for (let i = 1; i <= n; i++) this.ripAt(last[0] + ((x - last[0]) * i) / n, last[1] + ((y - last[1]) * i) / n, rad);
      this.lastPt = [x, y];
      this.updateHint();
    }

    moveBrush(x, y) {
      if (!this.brush) return;
      const ox = this.fabric.offsetLeft, oy = this.fabric.offsetTop;
      this.brush.style.transform = `translate(${(ox + x).toFixed(1)}px, ${(oy + y).toFixed(1)}px)`;
    }

    bind() {
      if (this.bound) return; this.bound = true;
      const cv = this.cv;
      cv.addEventListener('pointerenter', (e) => { this.lastPt = null; if (e.pointerType === 'mouse') this.el.classList.add('is-brushing'); });
      cv.addEventListener('pointerleave', () => { this.lastPt = null; this.el.classList.remove('is-brushing'); });
      cv.addEventListener('pointerdown', (e) => { this.lastPt = null; this.el.classList.add('is-brushing'); this.stroke(e); });
      cv.addEventListener('pointermove', (e) => this.stroke(e));
      const lift = (e) => { if (e.pointerType !== 'mouse') this.el.classList.remove('is-brushing'); this.lastPt = null; };
      cv.addEventListener('pointerup', lift);
      cv.addEventListener('pointercancel', lift);
      let rT = 0;
      addEventListener('resize', () => {
        clearTimeout(rT);
        rT = setTimeout(() => { if (Math.abs(this.fabric.clientWidth - this.w) > 2) { this.ripped = 0; this.build(); } }, 150);
      });
    }

    // How far the visitor has scrolled into the hero, 0 → 1
    progressFromScroll() {
      const vh = innerHeight;
      const top = this.el.getBoundingClientRect().top + scrollY;
      const start = Math.max(0, top - vh * 0.72);
      return (scrollY - start) / (vh * 0.55);
    }
  }

  let hoop = null;
  const hoopEl = document.getElementById('hoop');
  if (hoopEl) {
    if (reduceMotion) root.classList.add('no-stitchfx');
    else hoop = new Hoop(hoopEl);
  }

  /* ---------- Folk bands that slide with scroll ---------- */
  const bands = [...document.querySelectorAll('[data-band]')].map((band) => {
    const track = band.querySelector('.band__track');
    const tileCell = 7, tileW = 12 * tileCell, tileH = 9 * tileCell;
    const color = getComputedStyle(band).color;
    const { html } = buildSVG(bandTile(), tileCell, 0, { strokeWidth: 1.6 });
    // One tiny SVG tile, repeated as a background: light on the DOM, cheap to move
    const svg = html.replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${tileW}" height="${tileH}" `)
      .replace(/ pathLength="1"/g, '').replace(/ style="--d:[^"]*"/g, '')
      .replace(/<path /g, `<path fill="none" stroke="${color}" stroke-linecap="round" `);
    const scale = (band.clientHeight - 10) / tileH, w = tileW * scale;
    track.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    track.style.backgroundSize = `${w}px ${tileH * scale}px`;
    return { track, dir: Number(band.dataset.band), w };
  });

  /* ---------- Navigation ---------- */
  const nav = document.querySelector('.nav');
  const toTop = document.querySelector('.to-top');
  const toggle = document.querySelector('.nav__toggle');
  const progress = document.querySelector('.nav__progress span');

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? t('Close menu', 'Затвори менюто') : t('Open menu', 'Отвори менюто'));
  };
  toggle && toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  document.querySelectorAll('.nav__menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (e) => { if (nav.classList.contains('is-open') && !nav.contains(e.target)) setMenu(false); });

  const seam = document.querySelector('.nav__seam');
  const navLinks = [...document.querySelectorAll('.nav__menu a')];
  const links = navLinks.filter((a) => a.dataset.spy);
  let activeLink = navLinks.find((a) => a.classList.contains('is-active')) || null;
  const moveSeam = (a) => {
    if (!seam) return;
    if (!a || a.offsetParent === null) { seam.style.opacity = '0'; return; }
    seam.style.width = `${a.offsetWidth - 28}px`;
    seam.style.transform = `translateX(${a.offsetLeft + 14}px)`;
    seam.style.opacity = '1';
  };
  if (finePointer) {
    navLinks.forEach((a) => a.addEventListener('pointerenter', () => moveSeam(a)));
    document.querySelector('.nav__menu').addEventListener('pointerleave', () => moveSeam(activeLink));
  }
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const link = links.find((l) => l.dataset.spy === en.target.id);
        if (!link) return;
        links.forEach((l) => l.classList.toggle('is-active', l === link));
        activeLink = link; moveSeam(link);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((l) => { const s = document.getElementById(l.dataset.spy); s && spy.observe(s); });
  }

  // Project pages: the seam rests under "Projects" (re-measured once fonts load)
  if (activeLink) { moveSeam(activeLink); document.fonts && document.fonts.ready.then(() => moveSeam(activeLink)); }

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add('is-in'));

  /* =========================================================
     Projects: patches pegged on a washing line.
     1:1 drag, velocity hand-off, flick projection, rubber-band
     edges — and each patch swings on its peg like a pendulum.
     ========================================================= */
  class Clothesline {
    constructor(el, controls) {
      this.el = el;
      this.viewport = el.querySelector('.carousel__viewport');
      this.track = el.querySelector('.carousel__track');
      this.cards = [...this.track.children];
      this.bar = el.querySelector('.carousel__progress span');
      this.prevBtn = controls && controls.querySelector('[data-prev]');
      this.nextBtn = controls && controls.querySelector('[data-next]');
      this.s = { x: 0, v: 0 };
      this.target = 0; this.spring = { damping: 1, response: 0.5 };
      this.animating = false; this.press = null; this.suppressClick = false;
      // Each patch is a slightly different pendulum, so they don't move in lockstep
      this.swing = this.cards.map((_, i) => ({ x: 0, v: 0, damping: 0.16 + (i % 3) * 0.04, response: 0.95 + (i % 4) * 0.12 }));
      this.swinging = false;
      this.measure(); this.bind(); this.render();
    }

    measure() {
      const cs = getComputedStyle(this.track);
      const padL = parseFloat(cs.paddingLeft), padR = parseFloat(cs.paddingRight);
      const last = this.cards[this.cards.length - 1];
      this.vw = this.viewport.clientWidth;
      this.max = 0;
      this.min = Math.min(0, this.vw - (last.offsetLeft + last.offsetWidth + padR));
      const snaps = this.cards.map((c) => clamp(-(c.offsetLeft - padL), this.min, this.max));
      this.snaps = snaps.filter((v, i) => i === 0 || Math.abs(v - snaps[i - 1]) > 1);
    }
    nearestIndex(x) {
      let best = 0, bd = Infinity;
      this.snaps.forEach((s, i) => { const d = Math.abs(s - x); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    animateTo(target, { velocity = this.s.v, damping = 1, response = 0.5 } = {}) {
      this.target = target; this.s.v = velocity; this.spring = { damping, response };
      if (!this.animating) { this.animating = true; this.last = performance.now(); requestAnimationFrame(this.tick); }
      this.kickSwing();
    }
    tick = (t) => {
      if (!this.animating) return;
      const dt = Math.min((t - this.last) / 1000, 1 / 30); this.last = t;
      stepSpring(this.s, this.target, dt, this.spring.damping, this.spring.response);
      if (Math.abs(this.s.x - this.target) < 0.15 && Math.abs(this.s.v) < 8) { this.s.x = this.target; this.s.v = 0; this.animating = false; }
      this.render();
      if (this.animating) requestAnimationFrame(this.tick);
    };
    stop() { this.animating = false; }

    // Pendulum: the faster the line moves, the further patches lean back
    kickSwing() {
      if (this.swinging) return;
      this.swinging = true; this.swingLast = performance.now();
      requestAnimationFrame(this.swingTick);
    }
    nudge(impulse) { this.swing.forEach((s, i) => { s.v += impulse * (0.7 + (i % 3) * 0.2); }); this.kickSwing(); }
    swingTick = (t) => {
      const dt = Math.min((t - this.swingLast) / 1000, 1 / 30); this.swingLast = t;
      const target = clamp(this.s.v * 0.0042, -16, 16);
      let alive = this.animating || !!(this.press && this.press.dragging);
      this.swing.forEach((s, i) => {
        stepSpring(s, target, dt, s.damping, s.response);
        if (Math.abs(s.x) > 0.02 || Math.abs(s.v) > 0.05) alive = true;
        this.cards[i].style.setProperty('--swing', `${s.x.toFixed(2)}deg`);
      });
      if (alive) requestAnimationFrame(this.swingTick); else this.swinging = false;
    };

    render() {
      const x = this.s.x;
      this.track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      const range = this.max - this.min;
      this.bar && this.bar.style.setProperty('--p', range ? clamp((this.max - x) / range, 0, 1).toFixed(4) : 1);
      if (this.prevBtn) this.prevBtn.disabled = x >= this.max - 1;
      if (this.nextBtn) this.nextBtn.disabled = x <= this.min + 1;
    }

    bind() {
      const vp = this.viewport;
      vp.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        this.stop(); // grab it mid-flight from the on-screen position
        this.suppressClick = false;
        this.press = { id: e.pointerId, x0: e.clientX, y0: e.clientY, start: this.s.x, dragging: false, hist: [{ x: e.clientX, t: e.timeStamp }] };
      });
      vp.addEventListener('pointermove', (e) => {
        const p = this.press;
        if (!p || e.pointerId !== p.id) return;
        const dx = e.clientX - p.x0, dy = e.clientY - p.y0;
        if (!p.dragging) {
          if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { this.release(e, true); return; }
          if (Math.abs(dx) < 8) return;
          p.dragging = true; p.x0 = e.clientX; p.start = this.s.x;
          try { vp.setPointerCapture(e.pointerId); } catch (_) {}
          this.el.classList.add('is-dragging');
        }
        const raw = p.start + (e.clientX - p.x0);
        let x = raw;
        if (raw > this.max) x = this.max + rubberband(raw - this.max, this.vw);
        else if (raw < this.min) x = this.min - rubberband(this.min - raw, this.vw);
        p.hist.push({ x: e.clientX, t: e.timeStamp }); if (p.hist.length > 6) p.hist.shift();
        const a = p.hist[0], b = p.hist[p.hist.length - 1];
        this.s.v = b.t > a.t ? ((b.x - a.x) / (b.t - a.t)) * 1000 : 0;
        this.s.x = x;
        this.render(); this.kickSwing();
      });
      vp.addEventListener('pointerup', (e) => this.release(e, false));
      vp.addEventListener('pointercancel', (e) => this.release(e, true));
      vp.addEventListener('click', (e) => {
        if (this.suppressClick) { e.preventDefault(); e.stopPropagation(); this.suppressClick = false; }
      }, true);

      let wheelTimer = 0;
      vp.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault(); this.stop();
        let x = this.s.x - e.deltaX;
        if (x > this.max) x = this.max + rubberband(x - this.max, this.vw) * 0.5;
        if (x < this.min) x = this.min - rubberband(this.min - x, this.vw) * 0.5;
        this.s.v = -e.deltaX * 30;
        this.s.x = clamp(x, this.min - 120, this.max + 120);
        this.render(); this.kickSwing();
        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => this.animateTo(this.snaps[this.nearestIndex(this.s.x)], { velocity: 0, damping: 1, response: 0.45 }), 120);
      }, { passive: false });

      this.prevBtn && this.prevBtn.addEventListener('click', () => this.step(-1));
      this.nextBtn && this.nextBtn.addEventListener('click', () => this.step(1));
      this.track.addEventListener('focusin', (e) => {
        const card = e.target.closest('.patch'); if (!card) return;
        this.viewport.scrollLeft = 0;
        const i = this.cards.indexOf(card);
        this.animateTo(this.snaps[Math.min(i, this.snaps.length - 1)], { damping: 1, response: 0.5 });
      });
      let rT = 0;
      addEventListener('resize', () => {
        clearTimeout(rT);
        rT = setTimeout(() => { const i = this.nearestIndex(this.s.x); this.measure(); this.s.x = this.snaps[i]; this.s.v = 0; this.stop(); this.render(); }, 100);
      });
    }
    step(dir) {
      const base = this.animating ? this.target : this.s.x;
      const i = clamp(this.nearestIndex(base) + dir, 0, this.snaps.length - 1);
      this.animateTo(this.snaps[i], { damping: 1, response: 0.6 });
    }
    release(e, cancelled) {
      const p = this.press;
      if (!p || (e && e.pointerId !== p.id)) return;
      this.press = null; this.el.classList.remove('is-dragging');
      if (!p.dragging) return;
      this.suppressClick = true;
      const lastT = p.hist[p.hist.length - 1].t;
      const v = e && e.timeStamp - lastT > 60 ? 0 : this.s.v;
      let target;
      if (this.s.x > this.max) target = this.max;
      else if (this.s.x < this.min) target = this.min;
      else {
        target = this.snaps[this.nearestIndex(this.s.x + project(v))];
        const cur = this.nearestIndex(this.s.x);
        if (Math.abs(v) > 300 && target === this.snaps[cur]) target = this.snaps[clamp(cur + (v < 0 ? 1 : -1), 0, this.snaps.length - 1)];
      }
      this.animateTo(target, { velocity: v, damping: 0.82, response: 0.5 });
    }
  }

  let line = null;
  const carouselEl = document.querySelector('[data-carousel]');
  const controls = document.querySelector('[data-carousel-controls]');
  if (carouselEl) {
    if (reduceMotion) {
      carouselEl.classList.add('is-native');
      const vp = carouselEl.querySelector('.carousel__viewport');
      const bar = carouselEl.querySelector('.carousel__progress span');
      const card = carouselEl.querySelector('.patch');
      const update = () => { const max = vp.scrollWidth - vp.clientWidth; bar && bar.style.setProperty('--p', max ? (vp.scrollLeft / max).toFixed(4) : 1); };
      vp.addEventListener('scroll', update, { passive: true }); update();
      controls && controls.querySelector('[data-prev]').addEventListener('click', () => vp.scrollBy({ left: -(card.offsetWidth + 20) }));
      controls && controls.querySelector('[data-next]').addEventListener('click', () => vp.scrollBy({ left: card.offsetWidth + 20 }));
    } else {
      const start = () => { line = new Clothesline(carouselEl, controls); };
      document.fonts && document.fonts.ready ? document.fonts.ready.then(start) : start();
    }
  }

  /* ---------- Project poster: hangs from a peg and swings like a pendulum ---------- */
  let pendulum = null;
  const pendEl = document.querySelector('[data-pendulum] .phero__swing');
  if (pendEl && !reduceMotion) {
    const st = { x: -9, v: 0 };
    let last = 0, running = false, lastPX = null, lastPT = 0;
    pendEl.style.setProperty('--swing', `${st.x}deg`);
    const tick = (t) => {
      const dt = Math.min((t - last) / 1000 || 0.016, 0.033); last = t;
      stepSpring(st, 0, dt, 0.14, 1.25);          // lightly damped: a real swing
      pendEl.style.setProperty('--swing', `${st.x.toFixed(2)}deg`);
      if (Math.abs(st.x) + Math.abs(st.v) > 0.02) requestAnimationFrame(tick);
      else { running = false; pendEl.style.setProperty('--swing', '0deg'); }
    };
    const kick = () => { if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); } };
    pendulum = { nudge: (v) => { st.v = clamp(st.v + v, -90, 90); kick(); } };
    setTimeout(kick, 350); // swings into place, as if just hung up
    // Brushing past it with the mouse pushes it along
    pendEl.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (lastPX !== null) {
        const vx = ((e.clientX - lastPX) / Math.max(1, e.timeStamp - lastPT)) * 1000;
        pendulum.nudge(clamp(-vx * 0.015, -30, 30));
      }
      lastPX = e.clientX; lastPT = e.timeStamp;
    });
    pendEl.addEventListener('pointerleave', () => { lastPX = null; });
    // A tap pushes it away from the finger
    pendEl.addEventListener('pointerdown', (e) => {
      const r = pendEl.getBoundingClientRect();
      pendulum.nudge(((e.clientX - (r.left + r.width / 2)) / r.width) * 140);
    });
  }

  /* ---------- One scroll loop for everything scroll-linked ---------- */
  let lastY = scrollY, lastT = performance.now(), ticking = false;
  const projectsEl = document.getElementById('projects');
  const onFrame = () => {
    ticking = false;
    const y = scrollY, now = performance.now();
    const vy = ((y - lastY) / Math.max(1, now - lastT)) * 1000; lastY = y; lastT = now;

    nav.classList.toggle('is-scrolled', y > 8);
    toTop && toTop.classList.toggle('is-visible', y > innerHeight * 1.2);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress && progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

    if (!reduceMotion) {
      bands.forEach((b) => { const m = (((y * 0.35 * b.dir) % b.w) + b.w) % b.w; b.track.style.transform = `translate3d(${(-m).toFixed(1)}px,0,0)`; });
      hoop && hoop.setProgress(hoop.progressFromScroll());
      if (pendulum && Math.abs(vy) > 60 && y < innerHeight * 1.2) pendulum.nudge(clamp(vy, -3000, 3000) * 0.003);
      // Scrolling past the washing line makes the patches sway
      if (line && projectsEl) {
        const r = projectsEl.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0 && Math.abs(vy) > 50) line.nudge(clamp(vy, -3000, 3000) * 0.004);
      }
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }, { passive: true });
  onFrame();

  /* ---------- Copy email ---------- */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.classList.add('is-done'); btn.setAttribute('aria-label', t('Email address copied', 'Имейл адресът е копиран'));
        setTimeout(() => { btn.classList.remove('is-done'); btn.setAttribute('aria-label', t('Copy email address', 'Копирай имейл адреса')); }, 1800);
      } catch (_) { /* clipboard blocked — the mailto link still works */ }
    });
  });

  /* ---------- Headlines rise word by word out of a mask ---------- */
  const masks = [...document.querySelectorAll('[data-split="mask"]')];
  masks.forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w, i) => `<span class="mw" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`).join(' ');
  });
  if (reduceMotion || !('IntersectionObserver' in window)) masks.forEach((el) => el.classList.add('is-in'));
  else {
    const mio = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); mio.unobserve(en.target); } });
    }, { threshold: 0.3 });
    masks.forEach((el) => {
      // The hero name rises once the stitched "IYAC" is half sewn
      if (el.closest('.hero')) setTimeout(() => el.classList.add('is-in'), 250 + (heroWord && heroWord._duration ? heroWord._duration * 0.45 : 500));
      else mio.observe(el);
    });
  }

  /* ---------- Numbers roll up like an odometer ---------- */
  const odometers = [...document.querySelectorAll('[data-odometer]')].map((el) => {
    const value = el.dataset.odometer;
    el.innerHTML = `<span class="sr-only">${value}</span><span class="odo" aria-hidden="true">${
      [...value].map(() => `<span class="odo__col">${'01234567890123456789'.split('').map((d) => `<span>${d}</span>`).join('')}</span>`).join('')
    }</span>`;
    return { el, value };
  });
  const rollIn = (o, oi) => {
    [...o.el.querySelectorAll('.odo__col')].forEach((col, i) => {
      const target = `translateY(${(Number(o.value[i]) + 10) * -0.9}em)`;
      if (reduceMotion) { col.style.transform = target; return; }
      col.animate([{ transform: 'translateY(0)' }, { transform: target }],
        { duration: 1600 + i * 220 + oi * 140, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' });
    });
  };
  if ('IntersectionObserver' in window && !reduceMotion) {
    const oio = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { rollIn(odometers.find((o) => o.el === en.target), odometers.findIndex((o) => o.el === en.target)); oio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    odometers.forEach((o) => oio.observe(o.el));
  } else odometers.forEach(rollIn);

  /* ---------- CTA photos drift toward the pointer (springs) ---------- */
  const collage = [...document.querySelectorAll('.collage__item')];
  const cta = document.querySelector('.cta');
  if (cta && collage.length && finePointer && !reduceMotion) {
    const st = collage.map((el) => ({ el, d: Number(el.dataset.depth || 0.5), x: { x: 0, v: 0 }, y: { x: 0, v: 0 } }));
    let nx = 0, ny = 0, last = 0, running = false;
    const tick = (t) => {
      const dt = Math.min((t - last) / 1000 || 0.016, 0.033); last = t;
      let moving = false;
      st.forEach((s) => {
        stepSpring(s.x, nx * 34 * s.d, dt, 0.85, 0.9);
        stepSpring(s.y, ny * 26 * s.d, dt, 0.85, 0.9);
        s.el.style.setProperty('--mx', `${s.x.x.toFixed(2)}px`);
        s.el.style.setProperty('--my', `${s.y.x.toFixed(2)}px`);
        if (Math.abs(s.x.v) + Math.abs(s.y.v) > 0.05 || Math.abs(s.x.x - nx * 34 * s.d) > 0.05) moving = true;
      });
      if (moving) requestAnimationFrame(tick); else running = false;
    };
    const kick = () => { if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); } };
    cta.addEventListener('pointermove', (e) => {
      const r = cta.getBoundingClientRect();
      nx = ((e.clientX - r.left) / r.width - 0.5) * -2;
      ny = ((e.clientY - r.top) / r.height - 0.5) * -2;
      kick();
    });
    cta.addEventListener('pointerleave', () => { nx = ny = 0; kick(); });
  }

  /* =========================================================
     Gallery: masonry columns + a full-screen viewer that grows
     out of the tapped photo and shrinks back into it. Swipe
     sideways for the next photo, swipe down to close.
     ========================================================= */
  const galleryGrid = document.querySelector('[data-gallery]');
  const gTiles = galleryGrid ? [...galleryGrid.querySelectorAll('.gtile')] : [];
  let galleryCols = [];
  if (galleryGrid) {
    let n = 0, depthTweens = [];
    const layout = () => {
      const want = innerWidth >= 900 ? 3 : 2;
      if (want === n) return;
      n = want;
      galleryCols = Array.from({ length: n }, () => { const c = document.createElement('div'); c.className = 'gallery__col'; return c; });
      const heights = new Array(n).fill(0);
      gTiles.forEach((t) => {
        const img = t.querySelector('img');
        const i = heights.indexOf(Math.min(...heights));
        galleryCols[i].appendChild(t);
        heights[i] += Number(img.getAttribute('height')) / Number(img.getAttribute('width')) + 0.05;
      });
      galleryGrid.replaceChildren(...galleryCols);
      galleryGrid.classList.add('is-masonry');
      galleryGrid.style.setProperty('--cols', n);
      // Depth: the middle column drifts at its own pace
      depthTweens.forEach((tw) => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); });
      depthTweens = [];
      if (window.gsap && window.ScrollTrigger && !reduceMotion && n === 3) {
        window.gsap.registerPlugin(window.ScrollTrigger);
        galleryCols.forEach((c, i) => {
          const sp = [0, 0.14, 0.05][i]; if (!sp) return;
          depthTweens.push(window.gsap.fromTo(c, { '--py': `${sp * 240}px` }, {
            '--py': `${-sp * 240}px`, ease: 'none',
            scrollTrigger: { trigger: galleryGrid, start: 'top bottom', end: 'bottom top', scrub: true },
          }));
        });
      } else galleryCols.forEach((c) => c.style.removeProperty('--py'));
    };
    layout();
    let gT = 0;
    addEventListener('resize', () => { clearTimeout(gT); gT = setTimeout(layout, 150); });
  }

  class Lightbox {
    constructor(el, tiles) {
      this.el = el; this.tiles = tiles;
      this.img = el.querySelector('.lightbox__img');
      this.scrim = el.querySelector('.lightbox__scrim');
      this.count = el.querySelector('.lightbox__count');
      this.btn = { prev: el.querySelector('[data-lb="prev"]'), next: el.querySelector('[data-lb="next"]'), close: el.querySelector('[data-lb="close"]') };
      this.st = { x: { x: 0, v: 0 }, y: { x: 0, v: 0 }, s: { x: 1, v: 0 }, o: { x: 0, v: 0 } };
      this.tg = { x: 0, y: 0, s: 1, o: 0 };
      this.spring = { d: 1, r: 0.45 };
      this.index = -1; this.isOpen = false; this.running = false; this.done = null; this.drag = null;
      tiles.forEach((t, i) => t.addEventListener('click', () => this.open(i)));
      this.btn.close.addEventListener('click', () => this.close());
      this.btn.prev.addEventListener('click', () => this.go(-1));
      this.btn.next.addEventListener('click', () => this.go(1));
      this.scrim.addEventListener('click', () => this.close());
      el.addEventListener('keydown', (e) => this.key(e));
      this.bindDrag();
      addEventListener('resize', () => { if (this.isOpen) { this.place(this.index); this.render(); } });
    }

    size(i) { const im = this.tiles[i].querySelector('img'); return [Number(im.getAttribute('width')), Number(im.getAttribute('height'))]; }
    fit(i) {
      const [w0, h0] = this.size(i), ar = w0 / h0, small = innerWidth < 600;
      const padX = small ? 12 : 56, top = small ? 56 : 48, bottom = small ? 96 : 104;
      const maxW = innerWidth - padX * 2, maxH = innerHeight - top - bottom;
      let w = maxW, h = w / ar;
      if (h > maxH) { h = maxH; w = h * ar; }
      return { left: (innerWidth - w) / 2, top: top + (maxH - h) / 2, width: w, height: h };
    }
    place(i) {
      const r = this.rect = this.fit(i);
      Object.assign(this.img.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    }
    // Where the tile sits, expressed as a transform of the full-screen image (spatial consistency)
    fromTile(i) {
      const t = this.tiles[i].getBoundingClientRect(), r = this.rect;
      return { x: t.left + t.width / 2 - (r.left + r.width / 2), y: t.top + t.height / 2 - (r.top + r.height / 2), s: t.width / r.width };
    }
    render() {
      const { x, y, s, o } = this.st;
      this.img.style.transform = `translate3d(${x.x.toFixed(2)}px, ${y.x.toFixed(2)}px, 0) scale(${s.x.toFixed(4)})`;
      this.scrim.style.opacity = clamp(o.x, 0, 1).toFixed(3);
    }
    animate(tg, spring, done) {
      Object.assign(this.tg, tg); this.spring = spring; this.done = done || null;
      if (reduceMotion) {
        Object.keys(this.tg).forEach((k) => { this.st[k].x = this.tg[k]; this.st[k].v = 0; });
        this.render(); const d = this.done; this.done = null; d && d(); return;
      }
      if (!this.running) { this.running = true; this.last = performance.now(); requestAnimationFrame(this.tick); }
    }
    tick = (t) => {
      if (!this.running) return;
      const dt = Math.min((t - this.last) / 1000, 1 / 30); this.last = t;
      let settled = true;
      const eps = { x: 0.4, y: 0.4, s: 0.001, o: 0.004 };
      Object.keys(this.st).forEach((k) => {
        stepSpring(this.st[k], this.tg[k], dt, this.spring.d, this.spring.r);
        if (Math.abs(this.st[k].x - this.tg[k]) > eps[k] || Math.abs(this.st[k].v) > eps[k] * 10) settled = false;
      });
      if (settled) Object.keys(this.st).forEach((k) => { this.st[k].x = this.tg[k]; this.st[k].v = 0; });
      this.render();
      if (settled) { this.running = false; const d = this.done; this.done = null; d && d(); }
      else requestAnimationFrame(this.tick);
    };
    stop() { this.running = false; this.done = null; }

    show(i) {
      const im = this.tiles[i].querySelector('img');
      this.img.src = im.currentSrc || im.src; this.img.alt = im.alt;
      this.count.textContent = `${i + 1} / ${this.tiles.length}`;
      this.btn.prev.disabled = i === 0; this.btn.next.disabled = i === this.tiles.length - 1;
      [i - 1, i + 1].forEach((j) => { if (this.tiles[j]) { const p = new Image(); p.src = this.tiles[j].querySelector('img').src; } });
    }
    open(i) {
      if (this.isOpen) return;
      this.isOpen = true; this.index = i; this.lastFocus = document.activeElement;
      this.el.hidden = false;
      root.style.overflow = 'hidden';
      this.show(i); this.place(i);
      const f = this.fromTile(i);
      Object.assign(this.st, { x: { x: f.x, v: 0 }, y: { x: f.y, v: 0 }, s: { x: f.s, v: 0 }, o: { x: 0, v: 0 } });
      this.render();
      this.tiles[i].classList.add('is-hidden');
      this.el.classList.add('is-open');
      this.animate({ x: 0, y: 0, s: 1, o: 1 }, { d: 1, r: 0.45 });
      this.btn.close.focus({ preventScroll: true });
    }
    close() {
      if (!this.isOpen || this.closing) return;
      this.closing = true;
      const tile = this.tiles[this.index], tr = tile.getBoundingClientRect();
      if (tr.bottom < 0 || tr.top > innerHeight) { tile.scrollIntoView({ block: 'center' }); }
      const f = this.fromTile(this.index);
      this.el.classList.remove('is-open');
      this.animate({ x: f.x, y: f.y, s: f.s, o: 0 }, { d: 1, r: 0.4 }, () => {
        tile.classList.remove('is-hidden');
        this.el.hidden = true; this.isOpen = false; this.closing = false;
        root.style.overflow = '';
        this.lastFocus && this.lastFocus.focus({ preventScroll: true });
      });
    }
    // Slide to the neighbouring photo, carrying the swipe's velocity
    go(dir, velocity = 0) {
      if (!this.isOpen || this.closing) return;
      const ni = this.index + dir;
      if (ni < 0 || ni >= this.tiles.length) { this.st.x.v = velocity; this.animate({ x: 0 }, { d: 0.8, r: 0.4 }); return; }
      this.st.x.v = velocity;
      this.animate({ x: -dir * innerWidth }, { d: 1, r: 0.32 }, () => {
        this.tiles[this.index].classList.remove('is-hidden');
        this.index = ni;
        this.tiles[ni].classList.add('is-hidden');
        this.show(ni); this.place(ni);
        this.st.x.x = dir * innerWidth * 0.6; this.st.x.v = 0;
        this.render();
        this.animate({ x: 0, y: 0, s: 1, o: 1 }, { d: 1, r: 0.38 });
      });
    }
    key(e) {
      if (e.key === 'Escape') { e.preventDefault(); this.close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); this.go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); this.go(-1); }
      else if (e.key === 'Tab') {
        const f = [this.btn.prev, this.btn.next, this.btn.close].filter((b) => !b.disabled);
        const i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    }
    bindDrag() {
      const img = this.img;
      img.addEventListener('dragstart', (e) => e.preventDefault());
      img.addEventListener('pointerdown', (e) => {
        if (this.closing) return;
        this.stop(); // grab it mid-flight
        try { img.setPointerCapture(e.pointerId); } catch (_) {}
        this.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, bx: this.st.x.x, by: this.st.y.x, axis: null, hist: [{ x: e.clientX, y: e.clientY, t: e.timeStamp }] };
      });
      img.addEventListener('pointermove', (e) => {
        const d = this.drag; if (!d || e.pointerId !== d.id) return;
        const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
        if (!d.axis) { if (Math.hypot(dx, dy) < 8) return; d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; this.el.classList.add('is-dragging'); }
        d.hist.push({ x: e.clientX, y: e.clientY, t: e.timeStamp }); if (d.hist.length > 6) d.hist.shift();
        if (d.axis === 'x') {
          const edge = (dx > 0 && this.index === 0) || (dx < 0 && this.index === this.tiles.length - 1);
          this.st.x.x = d.bx + (edge ? Math.sign(dx) * rubberband(Math.abs(dx), innerWidth) : dx);
        } else {
          const y = dy > 0 ? dy : -rubberband(-dy, innerHeight);
          const k = clamp(Math.abs(y) / innerHeight, 0, 1);
          this.st.y.x = d.by + y;
          this.st.s.x = 1 - k * 0.35;
          this.st.o.x = 1 - k * 1.3;
        }
        this.render();
      });
      const end = (e) => {
        const d = this.drag; if (!d || e.pointerId !== d.id) return;
        this.drag = null; this.el.classList.remove('is-dragging');
        if (!d.axis) return;
        const a = d.hist[0], b = d.hist[d.hist.length - 1], dt = Math.max(1, b.t - a.t);
        const stale = e.timeStamp - b.t > 60;
        const vx = stale ? 0 : ((b.x - a.x) / dt) * 1000, vy = stale ? 0 : ((b.y - a.y) / dt) * 1000;
        if (d.axis === 'y') {
          if (this.st.y.x > 110 || vy > 700) { this.st.y.v = vy; this.close(); }
          else { this.st.y.v = vy; this.animate({ y: 0, s: 1, o: 1 }, { d: 0.9, r: 0.35 }); }
        } else {
          const projected = this.st.x.x + project(vx);
          if (projected < -innerWidth * 0.3 && this.index < this.tiles.length - 1) this.go(1, vx);
          else if (projected > innerWidth * 0.3 && this.index > 0) this.go(-1, vx);
          else { this.st.x.v = vx; this.animate({ x: 0 }, { d: 0.85, r: 0.35 }); }
        }
      };
      img.addEventListener('pointerup', end);
      img.addEventListener('pointercancel', end);
    }
  }
  const lightboxEl = document.querySelector('.lightbox');
  if (lightboxEl && gTiles.length) new Lightbox(lightboxEl, gTiles);

  /* =========================================================
     Scroll storytelling (GSAP + ScrollTrigger)
     ========================================================= */
  const { gsap, ScrollTrigger } = window;
  if (gsap && ScrollTrigger && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    root.classList.add('has-scrollfx');

    // Hero: copy lifts away faster than the hoop, which grows toward you
    if (document.querySelector('.hero')) {
      gsap.to('.hero__copy', { y: -110, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hoop', { y: 60, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    // Project hero: the copy drifts up while the poster stays hung (no fade: it read as a white film)
    if (document.querySelector('.phero')) {
      gsap.to('.phero__copy', { y: -80, ease: 'none', scrollTrigger: { trigger: '.phero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    // Story photos: the picture moves inside its frame (depth)
    gsap.utils.toArray('.story__photo').forEach((f) => {
      gsap.fromTo(f.querySelector('img'), { yPercent: -6, scale: 1.14 }, { yPercent: 6, scale: 1.14, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Depth: elements with data-parallax move at their own pace (via a CSS variable,
    // so it never fights the reveal transitions)
    const mmDepth = gsap.matchMedia();
    mmDepth.add('(min-width: 900px)', () => {
      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        const sp = Number(el.dataset.parallax); if (!sp) return;
        gsap.fromTo(el, { '--py': `${sp * 260}px` }, {
          '--py': `${sp * -260}px`, ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    });

    // About: a framed photo opens to fill the screen, the headline lands on it
    const mm = gsap.matchMedia();
    if (document.querySelector('.zoom')) mm.add({ small: '(max-width: 767px)', large: '(min-width: 768px)' }, (ctx) => {
      const from = ctx.conditions.small ? 'inset(18% 5% 18% 5% round 24px)' : 'inset(14% 20% 14% 20% round 32px)';
      gsap.timeline({ scrollTrigger: { trigger: '.zoom', start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
        .fromTo('.zoom__frame', { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 }, 0)
        .fromTo('.zoom__img', { scale: 1.3 }, { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
        .fromTo('.zoom__scrim', { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.35 }, 0.6)
        .fromTo('.zoom__caption', { opacity: 0, y: 60 }, { opacity: 1, y: 0, ease: 'power3.out', duration: 0.4 }, 0.62)
        .to({}, { duration: 0.35 });
    });

    // Paragraphs light up word by word as they scroll through
    document.querySelectorAll('[data-scrub-words]').forEach((el) => {
      const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      const wrap = (text, bold) => text.split(/(\s+)/).map((w) => (w.trim() ? `<span class="sw">${bold ? `<b>${esc(w)}</b>` : esc(w)}</span>` : w)).join('');
      el.innerHTML = [...el.childNodes].map((n) => wrap(n.textContent, n.nodeType === 1 && /^(B|STRONG)$/.test(n.tagName))).join('').trim();
      gsap.fromTo(el.querySelectorAll('.sw'), { opacity: 0.16 }, {
        opacity: 1, ease: 'none', stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: true },
      });
    });

    // CTA collage: photos at different depths, rising past the headline
    collage.forEach((el) => {
      const d = Number(el.dataset.depth || 0.5);
      // Smaller drift on narrow screens so photos never slide over the headline
      const amp = () => (innerWidth < 900 ? 50 : 170) * d;
      gsap.fromTo(el, { '--py': () => `${amp()}px` }, { '--py': () => `${-amp()}px`, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    });
    if (collage.length) gsap.from(collage, { scale: 0.8, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.cta', start: 'top 70%' } });

    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
    addEventListener('load', () => ScrollTrigger.refresh());
  }
})();

