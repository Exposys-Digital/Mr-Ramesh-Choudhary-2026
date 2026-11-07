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

  // Showroom orbit: build planets from the store cards
  const orbit = document.querySelector('.orbit');
  if (orbit) {
    const stores = [...document.querySelectorAll('.store')];
    const rings = [orbit.querySelector('.r1'), orbit.querySelector('.r2')];
    const inner = Math.round(stores.length * 0.4);
    const groups = [stores.slice(0, inner), stores.slice(inner)];
    groups.forEach((g, gi) => g.forEach((card, i) => {
      if (!card.id) card.id = 'store-' + card.querySelector('h3').textContent.trim().toLowerCase().replace(/[^a-z]+/g, '-');
      const p = document.createElement('div');
      p.className = 'planet';
      p.style.setProperty('--a', (i * 360 / g.length + gi * 22) + 'deg');
      const b = document.createElement('span'); b.className = 'pl-body';
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'pl-btn'; btn.tabIndex = -1;
      btn.innerHTML = '<i></i>' + card.querySelector('h3').textContent.trim();
      btn.addEventListener('click', () => {
        card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        card.classList.add('flash'); setTimeout(() => card.classList.remove('flash'), 2200);
      });
      b.appendChild(btn); p.appendChild(b); rings[gi].appendChild(p);
    }));
  }

  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
