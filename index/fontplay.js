//--------------------------------------------------------------------------------------------------//
// PAGE D'ACCEUIL SONTADEG - typo pour illusration vecto de la borne                       ---------//
//                                                                                         ---------//
// Lit la liste des questions de la langue courante (fichiers lang/xx.js, via              ---------//
// SontadegI18n) et la police à trait unique (relief-singleline.js), pose chaque ligne     ---------//
// de texte à plat, la déforme en vue isométrique, puis la trace trait après trait dans    ---------//
// SontadegI18n) les illustrations sont tirées au hasard toutes les 10 s.                  ---------//
//--------------------------------------------------------------------------------------------------//

(function () {
  'use strict';

  var FONT = window.RELIEF_SINGLELINE;
  var I18N = window.SontadegI18n;
  var host = document.getElementById('ink');
  if (!FONT || !I18N || !host) return;

  var NS = 'http://www.w3.org/2000/svg';

  //- REGLAGES ---------------------------------------------------------------------------------------//
  var CFG = {
    interval: 10000,   // durée d'un exemple à l'écran (ms)
    draw: 3000,        // durée du tracé complet (ms)
    fade: 800,         // fondu de sortie (ms), doit correspondre au CSS (.set)

    // parametre et coordonnées de construcation des typos à ~30° en isometrique
    matrix: { a: 0.02122, b: 0.01194, c: -0.02433, d: 0.01446 },
    origin: { x: 550.19, y: 269.78 },   // milieu de la ligne de base de la question

    question: {
      size: 1,            // 1 = taille naturelle de la police
      maxWidth: 11900     // si la question est plus large, elle est réduite pour tenir
    },
    answers: {
      size: 0.9,
      x: -4891,                                      // début des réponses (par rapport au centre de la question)
      rows: [2000, 3539, 4993, 6518, 7979, 9591]     // ligne de base de chaque réponse (un bouton chacune)
    }
  };

  //- LECTURE DES GLYPHES ------------------------------------------------------------------------------//
  var cache = {};

  function parseGlyph(ch) {
    if (cache[ch]) return cache[ch];
    var src = FONT.glyphs[ch];
    var glyph = { adv: 500, subs: [], x0: 0, x1: 0 };
    if (!src) {
      if (window.console) console.warn('[ink] caractère absent de la police : "' + ch + '"');
      return (cache[ch] = glyph);
    }
    glyph.adv = src[0];

    var re = /([MmLlHhVvCcSsQqTtZz])([^MmLlHhVvCcSsQqTtZz]*)/g;
    var m, cur = null, x = 0, y = 0, minX = Infinity, maxX = -Infinity;

    function pt(px, py) {
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      return [px, py];
    }

    while ((m = re.exec(src[1]))) {
      var cmd = m[1];
      var up = cmd.toUpperCase();
      var rel = cmd !== up;
      var n = (m[2].match(/-?\d*\.?\d+/g) || []).map(Number);
      var i = 0;

      if (up === 'Z') { continue; }

      var step = { M: 2, L: 2, T: 2, H: 1, V: 1, S: 4, Q: 4, C: 6 }[up];
      while (i + step <= n.length) {
        var ox = rel ? x : 0, oy = rel ? y : 0, seg;
        if (up === 'M' && i === 0) {
          x = ox + n[i]; y = oy + n[i + 1];
          cur = [{ c: 'M', p: [pt(x, y)] }];
          glyph.subs.push(cur);
        } else if (up === 'M' || up === 'L' || up === 'T') {
          x = ox + n[i]; y = oy + n[i + 1];
          cur.push({ c: up === 'T' ? 'T' : 'L', p: [pt(x, y)] });
        } else if (up === 'H') {
          x = ox + n[i];
          cur.push({ c: 'L', p: [pt(x, y)] });
        } else if (up === 'V') {
          y = oy + n[i];
          cur.push({ c: 'L', p: [pt(x, y)] });
        } else if (up === 'C') {
          seg = [pt(ox + n[i], oy + n[i + 1]), pt(ox + n[i + 2], oy + n[i + 3]), pt(ox + n[i + 4], oy + n[i + 5])];
          x = ox + n[i + 4]; y = oy + n[i + 5];
          cur.push({ c: 'C', p: seg });
        } else if (up === 'S' || up === 'Q') {
          seg = [pt(ox + n[i], oy + n[i + 1]), pt(ox + n[i + 2], oy + n[i + 3])];
          x = ox + n[i + 2]; y = oy + n[i + 3];
          cur.push({ c: up, p: seg });
        }
        i += step;
        if (up === 'M') { up = 'L'; step = 2; }   // paires suivantes d'un M = lignes
      }
    }
    if (minX !== Infinity) { glyph.x0 = minX; glyph.x1 = maxX; }
    return (cache[ch] = glyph);
  }

  //- MISE EN PAGE -------------------------------------------------------------------------------------//
  // Renvoie les glyphes avec leur position le long de la ligne + l'étendue de l'encre.
  function layoutLine(text) {
    var pen = 0, items = [], l = Infinity, r = -Infinity;
    for (var i = 0; i < text.length; i++) {
      var g = parseGlyph(text.charAt(i));
      if (g.subs.length) {
        items.push({ g: g, pen: pen });
        if (pen + g.x0 < l) l = pen + g.x0;
        if (pen + g.x1 > r) r = pen + g.x1;
      }
      pen += g.adv;
    }
    if (l === Infinity) { l = 0; r = 0; }
    return { items: items, left: l, right: r };
  }

  function f(v) { return Math.round(v * 100) / 100; }

  // Projette un glyphe (coordonnées police) dans le dessin et renvoie un tracé par trait.
  function projectGlyph(glyph, pen, size, px, py) {
    var M = CFG.matrix, O = CFG.origin;
    function map(p) {
      var ux = px + size * (pen + p[0]);   // plan : x vers la droite
      var uy = py - size * p[1];           // plan : y vers le bas (la police a y vers le haut)
      return f(O.x + M.a * ux + M.c * uy) + ' ' + f(O.y + M.b * ux + M.d * uy);
    }
    return glyph.subs.map(function (sub) {
      var d = '';
      for (var i = 0; i < sub.length; i++) {
        d += sub[i].c + sub[i].p.map(map).join(' ');
      }
      return d;
    });
  }

  //- DESSIN DES QUESTIONS ------------------------------------------------------------------------------//
  function addLine(group, text, size, startX, baseY, strokes) {
    var line = layoutLine(text);
    line.items.forEach(function (it) {
      projectGlyph(it.g, it.pen, size, startX, baseY).forEach(function (d) {
        var p = document.createElementNS(NS, 'path');
        p.setAttribute('d', d);
        group.appendChild(p);
        strokes.push(p);
      });
    });
  }

  function buildSet(q) {
    var group = document.createElementNS(NS, 'g');
    group.setAttribute('class', 'set');
    var strokes = [];

    // Question : centrée sur l'axe, réduite si elle est trop large.
    var ql = layoutLine(q.question);
    var size = CFG.question.size;
    var natural = (ql.right - ql.left) * size;
    if (natural > CFG.question.maxWidth) size *= CFG.question.maxWidth / natural;
    var qx = -size * (ql.left + ql.right) / 2;
    addLine(group, q.question, size, qx, 0, strokes);

    // Réponses : alignées à gauche, une ligne par bouton.
    (q.answers || []).slice(0, CFG.answers.rows.length).forEach(function (txt, i) {
      addLine(group, txt, CFG.answers.size, CFG.answers.x, CFG.answers.rows[i], strokes);
    });

    host.appendChild(group);
    return { el: group, strokes: strokes, lens: null, anims: [] };
  }

  var sets = [];

  // Construit tous les exemples d'un pool et mesure la longueur de chaque trait
  function buildAll(pool) {
    sets = pool.map(buildSet);
    sets.forEach(function (s) {
      s.lens = s.strokes.map(function (p) {
        var L = 0;
        try { L = p.getTotalLength(); } catch (e) { }
        // état de départ : trait invisible (tiret décalé hors du tracé, sans point aux extrémités)
        p.style.strokeDasharray = L + ' ' + (L + 5);
        p.style.strokeDashoffset = String(L + 3);
        return L;
      });
    });
  }

  //- ANIMATION ----------------------------------------------------------------------------------//
  function stop(s) {
    s.anims.forEach(function (a) { a.cancel(); });
    s.anims = [];
  }

  function draw(s) {
    stop(s);
    var total = s.lens.reduce(function (a, b) { return a + b; }, 0) || 1;
    var acc = 0;
    s.strokes.forEach(function (p, i) {
      var L = s.lens[i];
      var delay = (acc / total) * CFG.draw * 0.9;
      var dur = Math.max(120, (L / total) * CFG.draw);
      s.anims.push(p.animate(
        [{ strokeDashoffset: L + 3 }, { strokeDashoffset: 0 }],
        { duration: dur, delay: delay, easing: 'linear', fill: 'both' }
      ));
      acc += L;
    });
  }

  function showStatic(s) {
    stop(s);
    s.strokes.forEach(function (p) { p.style.strokeDashoffset = '0'; });
    s.el.classList.add('is-on');
  }

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var current = -1, timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function pickNext() {
    if (sets.length === 1) return 0;
    var n;
    do { n = Math.floor(Math.random() * sets.length); } while (n === current);
    return n;
  }

  function cycle() {
    clearTimers();
    if (!sets.length) return;
    sets.forEach(function (s) { s.el.classList.remove('is-on'); stop(s); });
    current = pickNext();
    var s = sets[current];
    s.el.classList.add('is-on');
    draw(s);
    later(function () { s.el.classList.remove('is-on'); }, CFG.interval - CFG.fade);
    later(cycle, CFG.interval);
  }

  // Compose les exemples pour la langue courante et relance l'animation.
  function load() {
    clearTimers();
    sets.forEach(stop);
    while (host.firstChild) host.removeChild(host.firstChild);
    current = -1;
    buildAll(I18N.questions() || []);
    if (!sets.length) return;
    if (reduceMotion) {
      showStatic(sets[Math.floor(Math.random() * sets.length)]);
    } else if (!document.hidden) {
      cycle();
    }
  }

  document.addEventListener('sontadeg:lang', load);

  if (!reduceMotion) {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { clearTimers(); } else { cycle(); }
    });
  }

  load();

  // Petit accès pour les tests / la mise au point (ex. SontadegInk.show(0)).
  window.SontadegInk = {
    get count() { return sets.length; },
    show: function (i) {
      clearTimers();
      sets.forEach(function (s) { s.el.classList.remove('is-on'); stop(s); });
      showStatic(sets[i]);
    }
  };
})();
