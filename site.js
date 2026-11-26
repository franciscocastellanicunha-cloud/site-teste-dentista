/* Clínica Odontológica · Samambaia Norte
   Comportamento do site. Os dados da clínica vêm de assets/js/dados.js (window.CLINICA). */
(() => {
  'use strict';
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const smooth = (p, e0, e1) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');

  /* =========================================================
     1. Dados da clínica: preenche a página a partir de dados.js
     ========================================================= */
  const C = window.CLINICA || {};
  const digits = s => String(s || '').replace(/\D/g, '');
  const waBase = 'https://wa.me/' + digits(C.whatsapp || '556134585444');
  const waLink = msg => waBase + '?text=' + encodeURIComponent(msg);
  const msgPadrao = C.mensagemWhatsApp || 'Olá! Encontrei a clínica pelo site e gostaria de obter informações sobre os tratamentos e agendar um atendimento.';
  const msgTrat = t => 'Olá! Encontrei a clínica pelo site e gostaria de informações sobre ' + t + '.';
  const E = C.endereco || {};
  const enderecoCurto = E.rua || '';
  // o CEP leva "word joiner" em volta do hífen para nunca quebrar no meio da linha
  const enderecoCidade = [E.bairro, [E.cidade, E.uf].filter(Boolean).join(' ')].filter(Boolean).join(', ') + (E.cep ? ', ' + String(E.cep).replace('-', '⁠-⁠') : '');
  const enderecoBusca = [E.rua, E.bairro, E.cidade, E.uf, E.cep].filter(Boolean).join(', ');
  const nota = Number(C.nota) || 0;
  const notaTexto = nota.toFixed(1).replace('.', ',');

  // horários: "09:00" vira "09h", "08:30" vira "08h30"; versão curta tira o zero da frente
  const hfmt = (hm, short) => {
    const [h, m] = String(hm).split(':');
    const hh = short ? String(+h) : h;
    return hh + 'h' + (m && m !== '00' ? m : '');
  };
  const H = Array.isArray(C.horarios) && C.horarios.length === 7 ? C.horarios : null;
  const ordem = [1, 2, 3, 4, 5, 6, 0]; // segunda a domingo
  function gruposHorario() {
    const grupos = [];
    ordem.forEach(i => {
      const d = H[i];
      const chave = d.fechado ? 'x' : d.abre + '-' + d.fecha;
      const g = grupos[grupos.length - 1];
      if (g && g.chave === chave) g.dias.push(d); else grupos.push({ chave, dias: [d], d });
    });
    return grupos;
  }
  const nomeDia = d => d.dia.replace('-feira', '').toLowerCase();
  function horarioResumo() {
    return gruposHorario().map(g => {
      const a = g.dias[0], b = g.dias[g.dias.length - 1];
      const nome = g.dias.length > 1 ? cap(nomeDia(a)) + ' a ' + nomeDia(b) : cap(nomeDia(a));
      return nome + ', ' + (g.d.fechado ? 'fechado' : hfmt(g.d.abre) + ' às ' + hfmt(g.d.fecha));
    });
  }
  function horarioFrase() {
    const partes = gruposHorario().filter(g => !g.d.fechado).map(g => {
      const a = g.dias[0], b = g.dias[g.dias.length - 1];
      const fem = n => /segunda|terça|quarta|quinta|sexta/.test(n);
      const quando = g.dias.length > 1
        ? 'de ' + nomeDia(a) + ' a ' + nomeDia(b)
        : (fem(nomeDia(a)) ? 'na ' : 'no ') + nomeDia(a);
      return quando + ', das ' + hfmt(g.d.abre, true) + ' às ' + hfmt(g.d.fecha, true);
    });
    if (!partes.length) return '';
    return 'O atendimento é ' + (partes.length > 1 ? partes.slice(0, -1).join(', ') + ', e ' + partes[partes.length - 1] : partes[0]) + '.';
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  const textos = {
    nome: C.nome, local: C.local, telefone: C.telefone,
    notaTexto, totalAvaliacoes: C.totalAvaliacoes != null ? String(C.totalAvaliacoes) : null,
    temaPrincipal: C.temaPrincipal && C.temaPrincipal.texto,
    temaMencoes: C.temaPrincipal && C.temaPrincipal.mencoes != null ? String(C.temaPrincipal.mencoes) : null,
    enderecoCurto, enderecoCidade,
    avisoHorario: C.avisoHorario,
    rtNome: C.responsavelTecnico && C.responsavelTecnico.nome,
    rtCro: C.responsavelTecnico && C.responsavelTecnico.cro,
    ano: String(new Date().getFullYear()),
    horarioFrase: H ? horarioFrase() : null
  };
  $$('[data-c]').forEach(el => {
    const v = textos[el.dataset.c];
    if (v != null && v !== '' && el.textContent !== v) el.textContent = v;
  });
  if (H) {
    const resumo = $('[data-c="horarioResumo"]');
    if (resumo) resumo.replaceChildren(...horarioResumo().flatMap((l, i) => (i ? [document.createElement('br'), l] : [l])));
  }

  $$('[data-wa]').forEach(a => { a.href = waLink(a.dataset.wa ? msgTrat(a.dataset.wa) : msgPadrao); });
  $$('[data-href="tel"]').forEach(a => { a.href = 'tel:+55' + digits(C.telefone); });
  $$('[data-href="avaliacoes"]').forEach(a => { if (C.linkAvaliacoes) a.href = C.linkAvaliacoes; });
  const G = C.coordenadas && isFinite(C.coordenadas.lat) && isFinite(C.coordenadas.lng) ? C.coordenadas.lat + ',' + C.coordenadas.lng : null;
  $$('[data-href="rota"]').forEach(a => {
    a.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(G || enderecoBusca) +
      (C.googlePlaceId ? '&destination_place_id=' + encodeURIComponent(C.googlePlaceId) : '');
  });
  const mapa = $('[data-map]');
  if (mapa && (G || enderecoBusca)) {
    const src = 'https://maps.google.com/maps?q=' + encodeURIComponent(G || enderecoBusca) + '&z=17&output=embed';
    if (mapa.getAttribute('src') !== src) mapa.setAttribute('src', src);
  }
  // estrelas: 4 cheias e 70% da quinta para nota 4,7 (cada estrela tem 27px e 3px de espaço)
  $$('.meter-fg').forEach(m => {
    const n = clamp(nota, 0, 5), cheias = Math.floor(n);
    m.style.width = (cheias * 30 + (n - cheias) * 27).toFixed(1) + 'px';
  });
  $$('[data-count]').forEach(el => {
    if (el.dataset.c === 'notaTexto') el.dataset.count = String(nota);
    if (el.dataset.c === 'totalAvaliacoes' && C.totalAvaliacoes != null) el.dataset.count = String(C.totalAvaliacoes);
  });

  // temas das avaliações
  const temas = $('[data-temas]');
  if (temas && Array.isArray(C.temasAvaliacoes)) {
    const top = $('.tema-top', temas);
    temas.replaceChildren(top, ...C.temasAvaliacoes.map(t => { const li = document.createElement('li'); li.textContent = t; return li; }));
  }
  // depoimentos reais (se houver)
  const depo = $('[data-depoimentos]');
  if (depo && Array.isArray(C.depoimentos) && C.depoimentos.length) {
    const tpl = $('.depo-card', depo);
    depo.replaceChildren(...C.depoimentos.slice(0, 3).map(d => {
      const f = tpl.cloneNode(true);
      f.classList.remove('slot');
      $('blockquote p', f).textContent = d.texto;
      $('figcaption', f).textContent = [d.nome, d.origem].filter(Boolean).join(' · ');
      return f;
    }));
  }

  // horários: lista, dia de hoje e "aberto agora" no horário de Brasília
  const lista = $('[data-horarios]');
  const status = $('#status');
  function agoraBrasilia() {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const get = t => (parts.find(p => p.type === t) || {}).value;
    const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { dia, min: (+get('hour') % 24) * 60 + +get('minute') };
  }
  const toMin = hm => { const [h, m] = hm.split(':'); return +h * 60 + +m; };
  function atualizaHorarios() {
    if (!H || !lista) return;
    const { dia, min } = agoraBrasilia();
    lista.replaceChildren(...ordem.map(i => {
      const d = H[i];
      const li = document.createElement('li');
      const a = document.createElement('span'); a.textContent = d.dia;
      const b = document.createElement('span'); b.textContent = d.fechado ? 'Fechado' : hfmt(d.abre) + ' às ' + hfmt(d.fecha);
      li.append(a, b);
      if (i === dia) li.classList.add('today');
      return li;
    }));
    if (status && dia >= 0) {
      const d = H[dia];
      const aberto = !d.fechado && min >= toMin(d.abre) && min < toMin(d.fecha);
      status.hidden = false;
      status.textContent = aberto ? 'Aberto agora' : 'Fechado agora';
      status.classList.toggle('open', aberto);
      status.classList.toggle('closed', !aberto);
    }
  }
  atualizaHorarios();
  setInterval(atualizaHorarios, 60000);

  // dados estruturados para o Google, sempre iguais aos dados.js
  const ld = $('#ld');
  if (ld && H) {
    const dias = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const spec = gruposHorario().filter(g => !g.d.fechado).map(g => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: g.dias.map(d => dias[H.indexOf(d)]),
      opens: g.d.abre, closes: g.d.fecha
    }));
    let data = {};
    try { data = JSON.parse(ld.textContent); } catch (_) { /* recomeça do zero */ }
    Object.assign(data, {
      '@context': 'https://schema.org', '@type': 'Dentist',
      name: [C.nome, C.local].filter(Boolean).join(' · '),
      telephone: '+55 ' + String(C.telefone || '').replace(/[()]/g, '').trim(),
      address: { '@type': 'PostalAddress', streetAddress: E.rua, addressLocality: E.cidade, addressRegion: E.uf, postalCode: E.cep, addressCountry: 'BR' },
      openingHoursSpecification: spec
    });
    if (G) data.geo = { '@type': 'GeoCoordinates', latitude: C.coordenadas.lat, longitude: C.coordenadas.lng };
    ld.textContent = JSON.stringify(data);
  }

  /* =========================================================
     2. Topo: a viagem pelo dente, guiada pela rolagem
     ========================================================= */
  function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  function splitWords(el, seed, spread) {
    if (!el) return;
    const r = rng(seed);
    const full = el.textContent.replace(/\s+/g, ' ').trim();
    const words = full.split(' ');
    el.textContent = '';
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = full;
    const vis = document.createElement('span');
    vis.className = 'split';
    vis.setAttribute('aria-hidden', 'true');
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      s.style.setProperty('--th', (i / words.length * spread + r() * 0.05).toFixed(3));
      vis.appendChild(s);
      if (i < words.length - 1) vis.appendChild(document.createTextNode(' '));
    });
    el.append(sr, vis);
  }
  splitWords($('.b2 .split-me'), 5, 0.5);
  splitWords($('.b3 .split-me'), 9, 0.5);
  splitWords($('.b5 .split-me'), 13, 0.5);
  (() => {
    const sharp = $('.b1 .sharp');
    if (!sharp) return;
    const soft = document.createElement('div');
    soft.className = 'display soft';
    soft.setAttribute('aria-hidden', 'true');
    soft.textContent = sharp.textContent;
    sharp.parentNode.appendChild(soft);
  })();

  const hero = $('#inicio');
  const pane = $('.tooth-pane');
  const camEl = $('.tooth-cam');
  const svg = $('.tooth');
  const shine = $('.tooth .shine');
  const portrait = $('.hero .portrait');
  const cue = $('.hero .cue');
  const RAMP = 0.03;
  const bands = $$('.hero .band').map((el, i, arr) => {
    const a = parseFloat(el.dataset.a), b = parseFloat(el.dataset.b);
    return { el, a, b, first: i === 0, last: i === arr.length - 1, ramp: Math.min(0.025, (b - a) * 0.35), op: -1, k: -1, live: null };
  });

  // câmera: [progresso, foco x, foco y (unidades do desenho), zoom]
  const CAM = [
    [0, 200, 300, 1], [0.15, 200, 300, 1],
    [0.24, 236, 166, 1.85], [0.40, 232, 182, 1.85],
    [0.47, 228, 262, 2.0], [0.62, 224, 294, 2.0],
    [0.69, 236, 432, 1.5], [0.82, 232, 452, 1.5],
    [0.92, 200, 300, 0.9], [1, 200, 300, 0.9]
  ];
  function camAt(p) {
    let i = 0;
    while (i < CAM.length - 2 && p > CAM[i + 1][0]) i++;
    const a = CAM[i], b = CAM[i + 1];
    const t = easeInOut(clamp((p - a[0]) / (b[0] - a[0] || 1), 0, 1));
    return [lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];
  }

  const cache = new Map();
  function put(el, prop, val) {
    if (!el) return;
    let c = cache.get(el);
    if (!c) { c = {}; cache.set(el, c); }
    if (c[prop] === val) return;
    c[prop] = val;
    if (prop.charCodeAt(0) === 45) el.style.setProperty(prop, val); else el.style[prop] = val;
  }
  function clearWritten() {
    cache.forEach((c, el) => {
      Object.keys(c).forEach(prop => { if (prop.charCodeAt(0) === 45) el.style.removeProperty(prop); else el.style[prop] = ''; });
    });
    cache.clear();
    bands.forEach(b => {
      b.el.style.opacity = '';
      b.el.style.removeProperty('--k');
      b.el.classList.remove('live');
      b.op = -1; b.k = -1; b.live = null;
    });
  }

  let geo = { unit: 1, sdx: 0, sdy: 0 };
  function measure() {
    const vh = innerHeight;
    const h = Math.min(0.8 * vh, 760);
    const ph = Math.min(0.68 * vh, 620), pw = ph * 0.78;
    geo = { unit: h / 600, sdx: -pw * 0.36, sdy: -ph * 0.05 };
  }

  let loadK = 0;
  function render(p) {
    const [fx, fy, s] = camAt(p);
    const so = easeInOut(clamp((p - 0.82) / 0.1, 0, 1));
    const tx = -s * (fx - 200) * geo.unit + geo.sdx * so;
    const ty = -s * (fy - 300) * geo.unit + geo.sdy * so;
    put(camEl, 'transform', 'translate(-50%,-50%) translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ')');
    put(svg, '--z', s.toFixed(3));
    put(pane, '--mk', (14 * (1 - so)).toFixed(1) + '%');

    const draw = Math.max(loadK, clamp(p / 0.12, 0, 1));
    put(svg, '--draw', (1 - easeOut(draw)).toFixed(3));
    put(svg, '--draw2', (1 - easeOut(clamp((p - 0.17) / 0.1, 0, 1))).toFixed(3));
    put(svg, '--enamel', clamp((p - 0.18) / 0.08, 0, 1).toFixed(3));
    put(svg, '--dentin', clamp((p - 0.34) / 0.1, 0, 1).toFixed(3));
    put(svg, '--draw3', (1 - easeOut(clamp((p - 0.4) / 0.1, 0, 1))).toFixed(3));
    put(svg, '--pulp', clamp((p - 0.44) / 0.08, 0, 1).toFixed(3));
    put(svg, '--gum', (clamp((p - 0.63) / 0.06, 0, 1) * (1 - so)).toFixed(3));
    put(svg, '--bone', (clamp((p - 0.63) / 0.08, 0, 1) * (1 - so)).toFixed(3));
    put(svg, '--trab', (1 - easeOut(clamp((p - 0.66) / 0.14, 0, 1))).toFixed(3));
    put(svg, '--l1', (smooth(p, 0.24, 0.27) * (1 - smooth(p, 0.38, 0.41))).toFixed(3));
    put(svg, '--l2', (smooth(p, 0.47, 0.5) * (1 - smooth(p, 0.6, 0.63))).toFixed(3));
    put(svg, '--l3', (smooth(p, 0.69, 0.72) * (1 - smooth(p, 0.81, 0.84))).toFixed(3));
    put(shine, 'transform', 'translateX(' + (420 * easeInOut(clamp((p - 0.25) / 0.14, 0, 1))).toFixed(1) + 'px)');

    const t2 = easeOut(clamp((p - 0.85) / 0.1, 0, 1));
    put(portrait, 'opacity', clamp((p - 0.85) / 0.04, 0, 1).toFixed(3));
    put(portrait, 'transform', 'translate(-50%,-50%) translate3d(0,' + (90 * (1 - t2)).toFixed(1) + 'px,0) scale(' + lerp(0.94, 1, t2).toFixed(3) + ')');
    put(cue, 'opacity', (1 - clamp(p / 0.04, 0, 1)).toFixed(3));
    updateBands(p);
  }

  function updateBands(p) {
    for (const b of bands) {
      let op;
      if (b.first) op = 1 - smooth(p, b.b - RAMP, b.b);
      else if (b.last) op = smooth(p, b.a, b.a + RAMP);
      else op = smooth(p, b.a, b.a + RAMP) * (1 - smooth(p, b.b - RAMP, b.b));
      op = Math.round(op * 1000) / 1000;
      let k = clamp((p - b.a) / b.ramp, 0, 1);
      if (b.first) k = Math.max(k, loadK);
      if (op !== b.op) { b.op = op; b.el.style.opacity = op; }
      const live = op > 0.5;
      if (live !== b.live) { b.live = live; b.el.classList.toggle('live', live); }
      if (Math.abs(k - b.k) > 0.008 || ((k === 0 || k === 1) && k !== b.k)) {
        b.k = k;
        b.el.style.setProperty('--k', k.toFixed(3));
      }
    }
  }

  let target = 0, shown = 0, rafId = null, lastT = 0, heroOn = true, scrubOn = false;
  function heroProgress() {
    const r = hero.getBoundingClientRect();
    const range = r.height - innerHeight;
    return range > 0 ? clamp(-r.top / range, 0, 1) : 0;
  }
  function tick(now) {
    const dt = Math.min(100, now - (lastT || now));
    lastT = now;
    shown += (target - shown) * (1 - Math.pow(1 - 0.16, dt / 16.667));
    if (Math.abs(target - shown) < 0.0005) { shown = target; rafId = null; lastT = 0; }
    else rafId = requestAnimationFrame(tick);
    render(shown);
  }
  function onScroll() {
    target = heroProgress();
    if (rafId === null && heroOn) rafId = requestAnimationFrame(tick);
  }

  let introDone = false, introRaf = null;
  function runIntro() {
    if (introDone) { loadK = 1; render(shown); return; }
    const t0 = performance.now(), D = 2000;
    const step = now => {
      const t = clamp((now - t0) / D, 0, 1);
      loadK = easeOut(t);
      render(shown);
      if (t < 1) introRaf = requestAnimationFrame(step);
      else { introDone = true; introRaf = null; }
    };
    introRaf = requestAnimationFrame(step);
  }

  function enableScrub() {
    if (scrubOn) return;
    scrubOn = true;
    root.classList.add('scrub');
    measure();
    clearWritten();
    addEventListener('scroll', onScroll, { passive: true });
    target = shown = heroProgress();
    render(shown);
    runIntro();
  }
  function disableScrub() {
    if (!scrubOn) { root.classList.remove('scrub'); return; }
    scrubOn = false;
    removeEventListener('scroll', onScroll);
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; lastT = 0; }
    if (introRaf !== null) { cancelAnimationFrame(introRaf); introRaf = null; }
    introDone = true; loadK = 1;
    root.classList.remove('scrub');
    clearWritten();
  }

  const GATES = [
    '(max-width: 720px)',
    '(orientation: portrait) and (max-width: 1024px)',
    '(orientation: portrait) and (pointer: coarse)',
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
    '(prefers-reduced-motion: reduce)'
  ];
  const MQLS = GATES.map(q => matchMedia(q));
  function applyHeroMode() {
    if (MQLS.some(m => m.matches)) disableScrub(); else enableScrub();
  }
  MQLS.forEach(m => m.addEventListener('change', applyHeroMode));
  new IntersectionObserver(es => {
    heroOn = es[0].isIntersecting;
    if (heroOn && scrubOn) onScroll();
  }).observe(hero);
  let rzT = null;
  addEventListener('resize', () => {
    clearTimeout(rzT);
    rzT = setTimeout(() => {
      if (!scrubOn) return;
      measure();
      cache.clear();
      bands.forEach(b => { b.op = -1; b.k = -1; });
      target = shown = heroProgress();
      render(shown);
    }, 120);
  }, { passive: true });
  applyHeroMode();

  /* =========================================================
     3. Navegação
     ========================================================= */
  const nav = $('.nav');
  let navS = null;
  function navCheck() {
    const s = scrollY > 24;
    if (s !== navS) { navS = s; nav.classList.toggle('scrolled', s); }
  }
  addEventListener('scroll', navCheck, { passive: true });
  navCheck();
  const menuBtn = $('.menu-btn'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });

  /* =========================================================
     4. Entradas coreografadas e elementos vivos
     ========================================================= */
  const rvIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add('in');
    rvIO.unobserve(el);
    const n = $$('.ri', el).length;
    setTimeout(() => el.classList.add('settled'), 1000 + n * 90);
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('.rv').forEach(el => {
    $$('.ri', el).forEach((c, i) => c.style.setProperty('--i', i));
    rvIO.observe(el);
  });
  const dvIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); dvIO.unobserve(e.target); }
  }), { rootMargin: '0px 0px -15% 0px' });
  $$('.divider').forEach(el => dvIO.observe(el));
  const liveIO = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('inview', e.isIntersecting)));
  $$('.sec').forEach(el => liveIO.observe(el));
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));

  /* contadores da nota */
  const fmt = (v, dec) => (dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v)));
  const counters = $$('[data-count]').map(el => ({ el, end: parseFloat(el.dataset.count), dec: +(el.dataset.dec || 0), done: false, pinned: false }));
  const cIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const c = counters.find(x => x.el === e.target);
    cIO.unobserve(c.el);
    if (c.done) return;
    const t0 = performance.now(), D = 1400;
    const step = now => {
      if (c.done) return;
      const t = clamp((now - t0) / D, 0, 1);
      c.el.textContent = fmt(c.end * easeOut(t), c.dec);
      if (t < 1) requestAnimationFrame(step); else c.done = true;
    };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  function armCounters() {
    counters.forEach(c => {
      if (c.done) return;
      c.el.textContent = fmt(0, c.dec);
      cIO.observe(c.el);
    });
  }
  function pinToFinalStates() {
    counters.forEach(c => {
      if (!c.done) { c.pinned = true; c.done = true; cIO.unobserve(c.el); }
      c.el.textContent = fmt(c.end, c.dec);
    });
  }
  function unpinFinalStates() {
    counters.forEach(c => { if (c.pinned) { c.pinned = false; c.done = false; } });
    armCounters();
  }
  reduceMQ.addEventListener('change', e => { if (e.matches) pinToFinalStates(); else unpinFinalStates(); });
  if (reduceMQ.matches) pinToFinalStates(); else armCounters();

  /* =========================================================
     5. Momento interativo: o mapa do dente
     ========================================================= */
  const mapSvg = $('.tmap-svg');
  const cap1 = $('#tmap-cap');
  const chips = $$('.tmap-btns .chip');
  const cardsBox = $('.cards');
  const cards = $$('.card', cardsBox);
  const CAPS = {
    todos: 'Seis tratamentos, do esmalte à raiz.',
    coroa: 'Coroa e esmalte: a parte que aparece no sorriso. Clareamento e próteses.',
    polpa: 'Polpa e canais: o interior do dente. Tratamento de canal.',
    raiz: 'Raiz e osso: a base que segura o dente. Implantes e cirurgia.',
    posicao: 'Posição dos dentes: o encaixe da mordida. Ortodontia.'
  };
  let sel = 'todos';
  function choose(part) {
    sel = part;
    mapSvg.dataset.sel = part;
    cap1.textContent = CAPS[part];
    chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.part === part)));
    cardsBox.classList.toggle('filtering', part !== 'todos');
    cards.forEach(c => c.classList.toggle('hit', part !== 'todos' && c.dataset.part === part));
  }
  chips.forEach(c => c.addEventListener('click', () => choose(c.dataset.part)));
  // passar o mouse num cartão acende a parte do dente, sem mudar a escolha
  cards.forEach(c => {
    c.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && sel === 'todos') mapSvg.dataset.sel = c.dataset.part; });
    c.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && sel === 'todos') mapSvg.dataset.sel = 'todos'; });
  });

  /* =========================================================
     6. Formulário: monta a mensagem e abre o WhatsApp
     ========================================================= */
  const form = $('#form-agendar');
  const err = $('#f-err');
  const okBox = $('#form-ok'), okLink = $('#form-ok-link');
  form.elements.nome.addEventListener('input', () => {
    if (form.elements.nome.value.trim()) { err.hidden = true; form.elements.nome.removeAttribute('aria-invalid'); }
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nome = form.elements.nome.value.trim();
    if (!nome) {
      err.hidden = false;
      form.elements.nome.setAttribute('aria-invalid', 'true');
      form.elements.nome.focus();
      return;
    }
    const trat = form.elements.trat.value;
    const periodo = form.elements.periodo.value;
    const linhas = [
      'Olá! Encontrei a clínica pelo site e gostaria de agendar um atendimento.',
      'Meu nome é ' + nome + '.',
      'Tenho interesse em: ' + trat + '.',
      'Melhor período para mim: ' + periodo + '.'
    ];
    const url = waLink(linhas.join('\n'));
    okLink.href = url;
    form.classList.add('sent');
    okBox.focus({ preventScroll: true });
    window.open(url, '_blank', 'noopener');
  });
})();
