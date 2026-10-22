(() => {
  const $ = s => document.querySelector(s);
  const scenes = [...document.querySelectorAll('.scene')];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 1, busy = false;

  /* ---------- confetti ---------- */
  const cv = $('#fx'), ctx = cv.getContext('2d');
  let parts = [], running = false;
  const size = () => { cv.width = innerWidth; cv.height = innerHeight; };
  size(); addEventListener('resize', size);
  const colors = ['#f4829a', '#ffb48f', '#d8445b', '#ffe08a', '#fff', '#ffc9d3'];
  function confetti(n = 90, x = innerWidth / 2, y = innerHeight * .55) {
    if (calm) n = Math.min(n, 15);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, w: 5 + Math.random() * 6, h: 3 + Math.random() * 5,
        r: Math.random() * 6, vr: Math.random() * .4 - .2, c: colors[i % colors.length], life: 1 });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(p => p.life > 0 && p.y < cv.height + 20);
    for (const p of parts) {
      p.vy += .25; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= .006;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    }
    if (parts.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, cv.width, cv.height); }
  }
  const center = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

  /* ---------- scene manager ---------- */
  function go(n) {
    if (busy || n === current) return;
    busy = true;
    const from = scenes[current - 1], to = scenes[n - 1];
    from.classList.remove('active'); from.classList.add('leave');
    setTimeout(() => {
      from.classList.remove('leave');
      to.classList.add('active'); current = n; busy = false;
      const f = to.querySelector('h1,h2'); if (f) { f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
      if (n === 2) confetti(50, innerWidth / 2, innerHeight * .4);
    }, calm ? 0 : 300);
  }
  document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
    const [x, y] = center(b); confetti(25, x, y); go(+b.dataset.go);
  }));

  /* ---------- scene 1 ---------- */
  $('#gift1').addEventListener('click', e => confetti(20, ...center(e.currentTarget)));

  /* ---------- scene 2: candles ---------- */
  const candleBox = $('#candles');
  function buildCandles() {
    candleBox.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const c = document.createElement('button');
      c.className = 'candle'; c.setAttribute('aria-label', `Blow out candle ${i} of 5`);
      c.innerHTML = '<span class="flame"></span>';
      c.addEventListener('click', () => {
        if (c.classList.contains('out')) return;
        c.classList.add('out'); c.setAttribute('aria-label', `Candle ${i} is out`);
        const [x, y] = center(c); confetti(8, x, y - 20);
        const left = candleBox.querySelectorAll('.candle:not(.out)').length;
        $('#hint2').textContent = left ? `${left} more to go 💨` : 'Wish made! 🎉';
        if (!left) setTimeout(() => { confetti(160, innerWidth / 2, innerHeight * .45); $('#next2').hidden = false; }, 350);
      });
      candleBox.appendChild(c);
    }
  }

  /* ---------- scene 3: conversation ---------- */
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, calm ? Math.min(ms, 300) : ms));
  $('#ask').addEventListener('click', e => {
    e.currentTarget.hidden = true;
    const typing = $('#typing');
    typing.classList.add('on');
    later(() => { typing.classList.remove('on'); $('#m2').classList.add('show');
      later(() => { typing.classList.add('on');
        later(() => { typing.classList.remove('on'); $('#m3').classList.add('show'); confetti(30, innerWidth / 2, innerHeight * .3);
          later(() => { $('#next3').hidden = false; }, 900); }, 1300); }, 2600); }, 900);
  });

  /* ---------- scene 4: gift ---------- */
  $('#gift4').addEventListener('click', e => {
    const g = e.currentTarget; if (g.classList.contains('open')) return;
    g.classList.add('open'); g.setAttribute('aria-label', 'Gift opened');
    confetti(140, ...center(g)); $('#hint4').hidden = true;
    setTimeout(() => { $('#found4').hidden = false; $('#next4').hidden = false; }, 800);
  });

  /* ---------- replay ---------- */
  $('#replay').addEventListener('click', () => {
    timers.forEach(clearTimeout); timers.length = 0;
    buildCandles();
    $('#next2').hidden = true; $('#hint2').textContent = 'Tap each candle to blow it out 💨';
    $('#m2').classList.remove('show'); $('#m3').classList.remove('show'); $('#typing').classList.remove('on');
    $('#ask').hidden = false; $('#next3').hidden = true;
    $('#gift4').classList.remove('open'); $('#gift4').setAttribute('aria-label', 'Tap to open the gift');
    $('#hint4').hidden = false; $('#found4').hidden = true; $('#next4').hidden = true;
    go(1);
  });

  buildCandles();
})();
