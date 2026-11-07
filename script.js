(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Split hero name into characters
  document.querySelectorAll('[data-split]').forEach((el, wi) => {
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    [...text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i + wi * 7);
      s.textContent = c;
      el.appendChild(s);
    });
  });

  // Split headings / quotes into words for masked reveal
  document.querySelectorAll('[data-words]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.textContent = '';
    words.forEach((w, i) => {
      const o = document.createElement('span'); o.className = 'w'; o.setAttribute('aria-hidden', 'true');
      const n = document.createElement('span'); n.textContent = w; o.style.setProperty('--i', i);
      n.style.setProperty('--i', i);
      o.appendChild(n); el.appendChild(o); el.appendChild(document.createTextNode(' '));
    });
    if (!el.classList.contains('reveal')) el.classList.add('reveal-words');
  });

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .reveal-words').forEach(el => io.observe(el));

  // Count-up numbers
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target, end = +el.dataset.count;
      if (reduce) { el.textContent = end; return; }
      const start = el.hasAttribute('data-plain') ? Math.round(end * 0.985) : 0;
      const dur = 1800, t0 = performance.now();
      const tick = t => {
        const p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(start + (end - start) * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

  // Chapters light up as they cross the middle of the viewport
  const chIO = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('lit', e.isIntersecting || e.boundingClientRect.top < 0));
  }, { rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('.chapter').forEach(c => chIO.observe(c));

  // Scroll-linked: progress bar, nav, timeline spine, sun parallax, active link
  const bar = document.querySelector('.progress span');
  const nav = document.querySelector('.nav');
  const spine = document.querySelector('.spine span');
  const timeline = document.querySelector('.timeline');
  const sun = document.querySelector('.sun');
  const links = [...document.querySelectorAll('.nav nav a')];
  const targets = links.map(a => document.querySelector(a.getAttribute('href')));
  let sunReady = false;
  if (sun) sun.addEventListener('animationend', () => { sun.style.opacity = 1; sun.style.transform = 'translate(-50%,0)'; sun.style.animation = 'none'; sunReady = true; onScroll(); }, { once: true });
  let ticking = false;
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    nav.classList.toggle('solid', y > 40);
    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.5 - r.top) / r.height));
      spine.style.transform = `scaleY(${p})`;
    }
    if (!reduce && sun && sunReady && y < innerHeight * 1.2) {
      sun.style.transform = `translate(-50%, ${y * 0.35}px)`;
    }
    let current = -1;
    targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < innerHeight * 0.4) current = i; });
    links.forEach((a, i) => a.classList.toggle('active', i === current));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Showroom growth road (scroll-driven)
  const road = document.getElementById('road');
  if (road) {
    const stage = road.querySelector('.road-stage');
    const svg = road.querySelector('.road-svg');
    const marksEl = road.querySelector('.road-marks');
    const van = road.querySelector('.van');
    const start = road.querySelector('.road-start');
    const countEl = road.querySelector('[data-road-count]');
    const cards = [...document.querySelectorAll('.store')];
    const NS = 'http://www.w3.org/2000/svg';
    let lane, L = 0, marks = [], vert = false;
    const build = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      vert = w < 760;
      road.classList.toggle('vert', vert);
      const pts = [];
      for (let i = 0; i <= 160; i++) {
        const t = i / 160;
        pts.push(vert
          ? [w * 0.5 + Math.sin(t * Math.PI * 2.4) * w * 0.2, h * 0.24 + t * h * 0.66]
          : [w * 0.1 + t * w * 0.82, h * 0.6 + Math.sin(t * Math.PI * 2.2) * h * 0.17 - t * h * 0.1]);
      }
      const d = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.innerHTML = `<defs><linearGradient id="roadGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${w}" y2="${h}"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#ff7a1a"/></linearGradient></defs>
        <path class="bed" d="${d}"/><path class="lane" d="${d}"/><path class="dash" d="${d}"/>`;
      lane = svg.querySelector('.lane');
      L = lane.getTotalLength();
      lane.style.strokeDasharray = L;
      const p0 = lane.getPointAtLength(0);
      start.style.left = (vert ? p0.x : p0.x) + 'px';
      start.style.top = (vert ? p0.y - 14 : p0.y - 26) + 'px';
      marksEl.innerHTML = '';
      marks = cards.map((card, i) => {
        if (!card.id) card.id = 'store-' + card.querySelector('h3').textContent.trim().toLowerCase().replace(/[^a-z]+/g, '-');
        const f = 0.07 + i * (0.88 / Math.max(1, cards.length - 1));
        const pt = lane.getPointAtLength(f * L);
        const m = document.createElement('div');
        const up = i % 2 === 0;
        m.className = 'mark ' + (vert ? (pt.x > stage.clientWidth / 2 ? 'left' : 'right') : (up ? 'up' : 'down'));
        m.style.left = pt.x + 'px'; m.style.top = pt.y + 'px';
        m.style.setProperty('--h', (up ? 54 + (i % 4) * 8 : 48 + (i % 3) * 10) + 'px');
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'pl-btn';
        btn.innerHTML = '<i></i>' + card.querySelector('h3').textContent.trim();
        btn.setAttribute('aria-label', 'Show address of the ' + card.querySelector('h3').textContent.trim() + ' showroom');
        btn.addEventListener('click', () => {
          card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
          card.classList.add('flash'); setTimeout(() => card.classList.remove('flash'), 2200);
        });
        m.innerHTML = '<span class="stem"></span><span class="dot"></span>';
        m.appendChild(btn); marksEl.appendChild(m);
        return { el: m, f };
      });
      update();
    };
    const update = () => {
      if (!lane) return;
      let p;
      if (reduce) p = 1;
      else {
        const r = road.getBoundingClientRect();
        const span = road.offsetHeight - stage.clientHeight;
        p = Math.min(1, Math.max(0, -r.top / (span * 0.85)));
      }
      const len = p * L;
      lane.style.strokeDashoffset = L - len;
      const a = lane.getPointAtLength(Math.max(0, len - 1)), b = lane.getPointAtLength(Math.min(L, len + 1));
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      const pt = lane.getPointAtLength(len);
      van.style.transform = `translate(${pt.x}px, ${pt.y}px) rotate(${ang}deg)`;
      let n = 0, last = -1;
      marks.forEach((m, i) => { const on = m.f <= p + 0.001; m.el.classList.toggle('on', on); if (on) { n++; last = i; } });
      marks.forEach((m, i) => m.el.classList.toggle('hot', i === last && p < 1));
      countEl.textContent = n;
    };
    let raf = 0;
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); }, { passive: true });
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });
    build();
  }

  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
