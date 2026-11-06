//------------------------------------------------------------------------------------------------//
// SONTADEG ARSELLAN - GRAPHIQUES : OUTILS SVG, MISE EN PAGE, COURBES ET BARRES                   //
//                                                                                                //
// Dessine en SVG les graphiques temporels et le résumé du bandeau (courbes, barres, anneau),     //
// avec la mise en page (ascenseur, hauteur, téléphone) et le regroupement des séquences.         //
// Tout est en px du viewBox : on ajoute des éléments au svg, on n'en retire jamais.              //
//------------------------------------------------------------------------------------------------//

"use strict";

//- OUTILS DE DESSIN SVG -------------------------------------------------------------------------//
// Crée un élément SVG avec ses attributs et ses enfants.
function svgEl(tag, attrs, children){
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for(const k in attrs) el.setAttribute(k, attrs[k]);
  (children||[]).forEach(c=>el.appendChild(c));
  return el;
}
// Crée un <text> SVG positionné (classe et alignement facultatifs).
function textEl(x,y,txt,cls,anchor){
  const t = svgEl('text',{x,y,class:cls||'', 'text-anchor':anchor||'start'});
  t.textContent = txt;
  return t;
}

// Compteur pour donner un id unique à chaque clipPath de drawAvgLines.
let avgClipSeq = 0;
// Marge droite : plus large quand des moyennes sont tracées, pour loger leurs étiquettes.
function avgPadRight(opts){ return opts && opts.avgLines && opts.avgLines.length ? 84 : 20; }
// Trace les moyennes en pointillés (couleur de la lettre, gris pour Σ) avec une étiquette en bout de ligne.
// lines : [{values, color, name, mean}] ; xAt/yAt : indice de tranche / valeur -> px ; rightX : bord droit.
// darken : le pointillé passe en noir là où il traverse une surface colorée (data-fill), sinon il serait
//   invisible ; les surfaces doivent donc être déjà dans le svg à l'appel (technique : clipPath).
// extend : la ligne court d'un bord à l'autre du graphique (barres), prolongée en i=-0,5 et i=n-0,5.
function drawAvgLines(svg, lines, xAt, yAt, rightX, darken, extend){
  if(!lines || !lines.length) return;
  let clipRef = null;
  if(darken){
    const fills = svg.querySelectorAll('[data-fill]');
    if(fills.length){
      const id = 'avg-clip-'+(++avgClipSeq);
      const clip = svgEl('clipPath',{id});
      fills.forEach(f=>clip.appendChild(f.cloneNode(false)));
      svg.appendChild(svgEl('defs',{},[clip]));
      clipRef = `url(#${id})`;
    }
  }
  const labels = [];
  lines.forEach(l=>{
    const vals = l.values, m = vals.length;
    const pts = vals.map((v,i)=>[i,v]);
    if(extend && m>0){
      pts.unshift([-0.5, m>1 ? vals[0]-0.5*(vals[1]-vals[0]) : vals[0]]);
      pts.push([m-0.5, m>1 ? vals[m-1]+0.5*(vals[m-1]-vals[m-2]) : vals[m-1]]);
    }
    const d = pts.map(([i,v],k)=>(k?'L':'M')+xAt(i).toFixed(1)+','+yAt(v).toFixed(1)).join(' ');
    svg.appendChild(svgEl('path',{d, fill:'none', stroke:l.color, 'stroke-width':1.5, 'stroke-dasharray':'5,4'}));
    if(clipRef) svg.appendChild(svgEl('path',{d, fill:'none', stroke:'#0d0d0d', 'stroke-width':2, 'stroke-dasharray':'5,4', 'clip-path':clipRef}));
    labels.push({y:yAt(pts[pts.length-1][1]), l});
  });
  labels.sort((a,b)=>a.y-b.y);
  let prev = -Infinity;
  labels.forEach(o=>{
    // étiquette à droite, centrée sur sa ligne, décalée si deux moyennes se chevauchent
    const y = Math.max(o.y+3.5, prev+11); prev = y;
    const t = textEl(rightX+6, y, tr('moy. {name} {val}',{name:o.l.name, val:fmtAvg(o.l.mean)}), 'axis-label', 'start');
    t.style.fill = o.l.color;
    svg.appendChild(t);
  });
}

// Barres horizontales (bandeau résumé, Séquences) : remplace le contenu de container par un svg neuf.
// Largeur = item.pct si présent, sinon relative au max de la série.
// items : [{label, count, pct?, color, letter?, letterColor?}] ; opts : rowH, gap, leftPad, rightPad, fontSize,
// autoPad (marges ajustées au texte).
function renderHBarChart(container, items, opts){
  opts = opts||{};
  const avail = container.clientWidth||560;
  const width = avail>=560 ? avail : Math.max(260, avail);   // petit écran : largeur réelle, sans mise à l'échelle
  const small = width<560;
  const rowH=opts.rowH||32, gap=opts.gap!=null?opts.gap:10, topPad=6;
  let leftPad=opts.leftPad||190, rightPad=opts.rightPad!=null?opts.rightPad:90;
  if(opts.autoPad){
    // marges au plus juste : étiquettes à gauche, lettre + « nombre · % » à droite
    const fs = opts.fontSize||11, ls = opts.fontSize ? opts.fontSize+1 : 12;
    const est = (str,size)=>str.length*size*0.62;
    leftPad = Math.min(leftPad, Math.ceil(Math.max(...items.map(i=>est(String(i.label),fs))) + 18));
    rightPad = Math.min(rightPad, Math.ceil(Math.max(...items.map(i=>{
      const v = i.pct!=null ? `${i.count} · ${i.pct.toFixed(1)}%` : `${i.count}`;
      return 8 + (i.letter ? est(i.letter,ls)+6 : 0) + est(v,fs);
    })) + 4));
  }
  if(small){ leftPad = Math.min(leftPad, Math.round(width*0.34)); rightPad = Math.min(rightPad, Math.round(width*0.32)); }
  const fitLabel = str => { const maxCh = Math.floor((leftPad-14)/((opts.fontSize||11)*0.58)); return str.length>maxCh ? str.slice(0,Math.max(1,maxCh-1))+'…' : str; };   // libellé trop long : coupé avec « … »
  const height = topPad*2 + Math.max(1,items.length)*(rowH+gap) - gap;
  const maxCount = Math.max(1, ...items.map(i=>i.count));
  const barMaxW = Math.max(40, width-leftPad-rightPad);
  const svg = svgEl('svg',{class:'chart', viewBox:`0 0 ${width} ${height}`, width:'100%', height});
  const valueSize = opts.fontSize || 11;
  const letterSize = opts.fontSize ? opts.fontSize+1 : 12;
  function estWidth(str, size){ return str.length * size * 0.62; }

  items.forEach((it,i)=>{
    const y = topPad + i*(rowH+gap);
    const w = it.pct!=null ? Math.max(2,(it.pct/100)*barMaxW) : Math.max(2,(it.count/maxCount)*barMaxW);

    const lbl = textEl(leftPad-10, y+rowH/2+4, fitLabel(String(it.label)), 'bar-label', 'end');
    { const tt = svgEl('title',{}); tt.textContent = String(it.label); lbl.appendChild(tt); }
    if(opts.fontSize) lbl.setAttribute('style', `font-size:${opts.fontSize}px`);
    svg.appendChild(lbl);
    svg.appendChild(svgEl('rect',{x:leftPad,y,width:barMaxW,height:rowH,rx:3,fill:'var(--panel-raised)'}));
    svg.appendChild(svgEl('rect',{x:leftPad,y,width:w,height:rowH,rx:3,fill:it.color}));

    const valTxt = it.pct!=null ? `${it.count} · ${it.pct.toFixed(1)}%` : `${it.count}`;
    const letterTxt = it.letter || '';
    const gapPx = 6;
    let cursorX = leftPad + barMaxW + 8;
    if(letterTxt){
      const lt = textEl(cursorX, y+rowH/2+4, letterTxt, '', 'start');
      lt.setAttribute('style', `font-size:${letterSize}px; font-weight:700; fill:${it.letterColor||it.color}`);
      svg.appendChild(lt);
      cursorX += estWidth(letterTxt, letterSize) + gapPx;
    }
    const val = textEl(cursorX, y+rowH/2+4, valTxt, 'bar-value', 'start');
    if(opts.fontSize) val.setAttribute('style', `font-size:${valueSize}px`);
    svg.appendChild(val);
  });
  container.innerHTML='';
  container.appendChild(svg);
}

// Résumé en anneau : un arc par bouton (A–F) proportionnel à son pourcentage, légende à droite.
// Même contrat que renderHBarChart (items avec pct et count) ; remplace le contenu de container.
function renderDonut(container, items){
  const barRowH = 19; // hauteur de barre de référence (épaisseur de l'anneau = 0,7x)
  const height = 156; // hauteur fixe (≈ 6 barres) pour que l'anneau reste compact
  const strokeW = barRowH * 0.7;
  const padY = 8;
  const outerR = (height - padY*2 - strokeW) / 2;
  const cx = outerR + strokeW/2 + 10;
  const cy = height/2;
  const circumference = 2*Math.PI*outerR;

  const width = Math.max(420, container.clientWidth||420);
  const svg = svgEl('svg',{class:'chart', viewBox:`0 0 ${width} ${height}`, width:'100%', height});

  const track = svgEl('circle',{cx,cy,r:outerR,fill:'none',stroke:'var(--panel-raised)','stroke-width':strokeW});
  svg.appendChild(track);

  // rotation de -90° : le premier arc part de 12 h et non de 3 h
  const g = svgEl('g',{transform:`rotate(-90 ${cx} ${cy})`});
  let cumulative = 0;
  items.forEach(it=>{
    const pct = it.pct||0;
    if(pct<=0) return;
    const segLen = Math.max(0, (pct/100)*circumference - 1.5); // petit espace entre segments
    const circle = svgEl('circle',{
      cx, cy, r:outerR, fill:'none', stroke:it.color, 'stroke-width':strokeW,
      'stroke-dasharray':`${segLen} ${circumference-segLen}`,
      'stroke-dashoffset':`${-cumulative}`,
    });
    const title = svgEl('title',{});
    title.textContent = `${it.label} : ${it.count} · ${pct.toFixed(1)}%`;
    circle.appendChild(title);
    g.appendChild(circle);
    cumulative += (pct/100)*circumference;
  });
  svg.appendChild(g);

  // légende : lettre colorée, libellé, nombre · pourcentage
  const legendX = cx + outerR + strokeW/2 + 26;
  const rowH = Math.min(24, height/Math.max(1,items.length));
  const topOffset = (height - rowH*items.length)/2;
  items.forEach((it,i)=>{
    const y = topOffset + i*rowH + rowH/2;
    const letter = textEl(legendX, y+4, it.letter||'', '', 'start');
    letter.setAttribute('style', `font-size:13px; font-weight:700; fill:${it.letterColor||it.color}`);
    svg.appendChild(letter);
    const lbl = textEl(legendX+18, y+4, it.label, 'bar-label', 'start');
    svg.appendChild(lbl);
    const val = textEl(width-10, y+4, `${it.count} · ${it.pct.toFixed(1)}%`, 'bar-value', 'end');
    svg.appendChild(val);
  });

  container.innerHTML='';
  container.appendChild(svg);
}

// Axe vertical : pas « rond » (1, 2, 5 × 10^k), ~44 px minimum entre repères, jamais < 1 pour des entiers ;
// traits secondaires plus clairs entre deux repères quand la place le permet.
// Ajoute lignes et libellés (classe y-tick, recopiés dans la colonne fixe par mountChart) au svg ;
// left/right/top : marges, plotH : hauteur utile, maxV : valeur au sommet.
function yGrid(svg, left, right, top, plotH, maxV){
  const intMode = Number.isInteger(maxV);
  const raw = maxV*44/Math.max(1,plotH);
  const p10 = Math.pow(10, Math.floor(Math.log10(raw)));
  let step = [1,2,5,10].map(m=>m*p10).find(s=>s>=raw*0.999999);
  if(intMode) step = Math.max(1, step);
  const pxOf = v => top + plotH - (v/maxV)*plotH;
  const eps = 1e-9, fmt = v => step>=1 ? String(Math.round(v)) : v.toFixed(step<0.1 ? 2 : 1);
  let sub = 0;
  for(const d of [5,2]){ const ms = step/d; if((!intMode || Number.isInteger(ms)) && ms*plotH/maxV >= 11){ sub = ms; break; } }
  if(sub){
    for(let v=sub; v<=maxV+eps; v+=sub){
      if(Math.abs(v/step - Math.round(v/step)) < 1e-6) continue;
      svg.appendChild(svgEl('line',{x1:left,y1:pxOf(v),x2:right,y2:pxOf(v),class:'grid-line minor',opacity:'0.45'}));
    }
  }
  for(let k=0; k*step<=maxV+eps; k++){
    const v = k*step, y = pxOf(v);
    svg.appendChild(svgEl('line',{x1:left,y1:y,x2:right,y2:y,class:'grid-line'}));
    svg.appendChild(textEl(left-8, y+3, fmt(v), 'axis-label y-tick', 'end'));
  }
  // graphique très bas (zoom 50 %) : si le pas dépasse le max, on marque au moins le sommet
  if(step > maxV+eps){
    const y = pxOf(maxV);
    svg.appendChild(svgEl('line',{x1:left,y1:y,x2:right,y2:y,class:'grid-line'}));
    svg.appendChild(textEl(left-8, y+3, intMode ? String(maxV) : maxV.toFixed(maxV<1 ? 2 : 1), 'axis-label y-tick', 'end'));
  }
}


//- MISE EN PAGE DU GRAPHIQUE --------------------------------------------------------------------//
// Largeur minimale par tranche, ascenseur horizontal, hauteur (adaptée ou réelle) et mode téléphone.
// Lit state.zoom, state.vzoom, state.fitMode ; zoom horizontal seulement en Chronologie et Cycles REL.

//- LARGEUR MINIMALE & ASCENSEUR HORIZONTAL ------------------------------------------------------//
// Si les tranches deviennent trop étroites, le graphique garde une largeur minimale et défile ;
// l'axe vertical reste fixe à gauche (copie « collante »).
// Largeur minimale d'une tranche (px, avant zoom) en courbes / en barres, et plafond de largeur du svg.
const MIN_SLOT_LINE = 12, MIN_SLOT_BAR = 14, MAX_CHART_PX = 30000;
// Hauteur « adaptée » : l'écran libre sous l'en-tête (395 px réservés), entre 320 et 620 px.
function autoChartH(){ return Math.max(320, Math.min(620, Math.round(window.innerHeight - 395))); }
// Dernière hauteur calculée, gardée pour d'autres modules.
let lastChartH = 0;
// Hauteur du graphique : « fit » = écran libre, sinon 320 px × zoom vertical (minimum 180 px).
function chartH(){ lastChartH = state.vFit==='fit' ? autoChartH() : Math.max(180, Math.round(320*state.vzoom)); return lastChartH; }
// Téléphone : toutes les vues passent en taille réelle avec défilement (une largeur d'écran ne suffit pas).
function isPhone(){ return window.matchMedia && window.matchMedia('(max-width:700px), (max-height:500px)').matches; }   // même condition que le CSS
// Vrai si la vue admet le zoom horizontal : Chronologie, Cycles en REL (temps écoulé, parfois 30 h) ou téléphone.
// Cycles en NTP reste adapté à l'écran (24 h ou 7 jours).
function hZoomView(){ return state.selectedView==='temporal' || (state.selectedView==='cycles' && !state.hasAnyAbsolute) || isPhone(); }
// Vrai si l'ascenseur horizontal est permis (« Taille réelle » sur une vue à zoom horizontal).
function scrollAllowed(){ return state.fitMode==='real' && hZoomView(); }
// Largeur du svg (px) : celle du conteneur en « Adapter », sinon tranches × largeur minimale × zoom
// (plancher 640, 280 sur téléphone ; plafond MAX_CHART_PX). padL/padR : marges ; slots : tranches, écarts compris.
function chartWidth(container, padL, padR, slots, minSlot){
  const avail = Math.max(isPhone() ? 280 : 640, container.clientWidth||640);
  if(!scrollAllowed()) return avail;                 // « Adapter » : tout tient dans la largeur
  return Math.min(MAX_CHART_PX, Math.max(avail, Math.ceil(padL + padR + slots*minSlot*state.zoom)));
}
// Vrai si le graphique dépasse la largeur visible (ascenseur + axe collant).
function isScrolled(container, width){ return scrollAllowed() && width > Math.max(isPhone() ? 280 : 640, container.clientWidth||640) + 1; }
// Mode « Adapter » : marque le graphique devenu illisible (tranches < 6 px) pour suggérer « Taille réelle ».
function markDense(svg, slotPx){ if(hZoomView() && state.fitMode!=='real' && slotPx < 6) svg.setAttribute('data-dense','1'); }
// Ajoute le graphique au conteneur. S'il défile, l'axe vertical (.y-tick) est recopié dans une colonne
// fixe à gauche ; data-fullvb garde le cadrage complet que l'export utilise.
function mountChart(container, svg, padLeft, height, scrolled){
  if(!scrolled){ container.appendChild(svg); return; }
  const vb = svg.getAttribute('viewBox').split(/\s+/).map(Number);
  svg.setAttribute('data-fullvb', svg.getAttribute('viewBox'));
  svg.setAttribute('viewBox', `${padLeft} 0 ${vb[2]-padLeft} ${height}`);
  svg.setAttribute('width', vb[2]-padLeft);
  const axis = svgEl('svg',{class:'axis-fixed', width:padLeft, height, viewBox:`0 0 ${padLeft} ${height}`});
  svg.querySelectorAll('.y-tick').forEach(t=>axis.appendChild(t.cloneNode(true)));
  const scroller = document.createElement('div'); scroller.className='chart-scroller';
  scroller.appendChild(svg);
  container.classList.add('is-scrolled');
  container.appendChild(axis);
  container.appendChild(scroller);
}

//- ICÔNES DE RÉGLAGE ET BLOCS JOUR / SESSION ----------------------------------------------------//
// Éléments sous l'axe : ☰ de réglage par jour (NTP) ou session (REL), boutons + / − pour coller ou séparer des
// sessions, étiquettes de jour et de période, raccords. Les éléments ui-only (☰, +/−) ne sont pas exportés ;
// séparateurs et raccords le sont. slotLayout/runsOf gèrent les écarts (GAP_BARS) avant certains indices.

//- ICÔNE DE RÉGLAGE SOUS CHAQUE JOUR (NTP) / SESSION (REL) --------------------------------------//
// Vrai si le jour ou la session (kind 'day' | 'sess') a un réglage propre (masqué, début/fin, bornes lo/hi).
function cfgIsCustom(kind, key){
  const c = (kind==='day' ? state.dayCfg : state.sessCfg).get(key);
  return !!(c && (c.hidden || c.hs!=null || c.he!=null || c.lo!=null || c.hi!=null));
}
// Titre d'infobulle d'un bloc : « Session n » en REL, sinon la date longue du jour avec capitale.
function blockTitle(kind, key){
  if(kind==='sess') return tr('Session {n}',{n:key});
  const t = new Date(key).toLocaleDateString(locale(),{weekday:'long',day:'numeric',month:'long'});
  return t.charAt(0).toUpperCase()+t.slice(1);
}
// Prépare les icônes ☰ des blocs (spans : [{key, from, to}], indices de tranches) ; null hors Chronologie.
function blockCfgItems(kind, spans){
  if(!blockCfgOn() || !spans || !spans.length) return null;
  return spans.map(sp=>({kind, key:sp.key, from:sp.from, to:sp.to, custom:cfgIsCustom(kind, sp.key), title:blockTitle(kind, sp.key),
    onClick: el=>openBlockEditor(kind, sp.key, el)}));
}
// Bouton « ☰ » dans un carré, ui-only ; plus sombre quand le bloc a des réglages propres. Renvoie les x
// dessinés
// (drawBoundaryUI s'en sert pour éviter les superpositions). xl/xr : bords gauche/droit (px) d'une tranche ;
// labelOff : décalage horizontal.
function drawCfgUI(svg, items, xl, xr, y, labelOff){
  const xs = [];
  if(!items || !items.length) return xs;
  let lastX = -Infinity;
  items.forEach(it=>{
    const x = (xl(it.from)+xr(it.to))/2 + (labelOff||0);
    if(x - lastX < 20) return;       // trop serrés : on n'en dessine qu'un sur plusieurs
    lastX = x; xs.push(x);
    const g = svgEl('g',{class:'ui-only cfg-btn'+(it.custom?' on':''), transform:`translate(${x},${y})`, style:'cursor:pointer'});
    g.appendChild(svgEl('rect',{class:'box', x:-8,y:-8,width:16,height:16,rx:3}));
    [-3.2,0,3.2].forEach(yy=>g.appendChild(svgEl('line',{x1:-4,y1:yy,x2:4,y2:yy})));
    const tt = svgEl('title',{}); tt.textContent = tr('Réglages : {title}',{title:it.title}); g.appendChild(tt);
    g.addEventListener('click', ev=>{ ev.stopPropagation(); it.onClick(g); });
    svg.appendChild(g);
  });
  return xs;
}
// Boutons « + » / « − » entre sessions (REL) pour coller ou séparer ; ui-only.
// leftEdge(i) : bord gauche (px) de la tranche i hors écart ; avoid : x déjà pris par des ☰.
// boundaries : [{idx, glued, session, onClick}] ; séparé, le bouton se place au milieu de l'écart GAP_BARS.
function drawBoundaryUI(svg, boundaries, leftEdge, slotW, y, avoid){
  if(!boundaries || !boundaries.length) return;
  let lastX = -Infinity;
  boundaries.forEach(b=>{
    const x = b.glued ? leftEdge(b.idx) : leftEdge(b.idx) - GAP_BARS*slotW/2;
    if(x - lastX < 18) return;       // trop serrés (mode « Adapter » dense) : on n'en dessine qu'un sur plusieurs
    if(avoid && avoid.some(a=>Math.abs(a-x) < 18)) return;   // la place est prise par une icône ☰
    lastX = x;
    const g = svgEl('g',{class:'ui-only glue-btn', transform:`translate(${x},${y})`, style:'cursor:pointer'});
    g.appendChild(svgEl('rect',{x:-8,y:-8,width:16,height:16,rx:3,fill:'var(--ink-900)',stroke:'var(--line-500)'}));
    g.appendChild(textEl(0,5,b.glued?'−':'+','axis-label','middle'));
    const tt = svgEl('title',{}); tt.textContent = b.glued ? tr('Séparer la session {n} de la précédente',{n:b.session}) : tr('Coller la session {n} à la précédente',{n:b.session});
    g.appendChild(tt);
    g.addEventListener('click', b.onClick);
    svg.appendChild(g);
  });
}
// Étiquettes de périodes (Nuit / Matin / Après-midi / Soir) sous l'axe, séparées par un pointillé.
// bands : [{fromIdx, toIdx (exclu), label}] ; x0Of/x1Of : bords gauche/droit (px) d'une suite de tranches.
// Libellé raccourci à 3 lettres puis omis si la place manque (le ☰ reste, avec la période dans son infobulle).
function drawPeriodBands(svg, bands, x0Of, x1Of, gapOf, yLabel, yTop, yBottom){
  (bands||[]).forEach((band,bi)=>{
    const x0 = x0Of(band.fromIdx), x1 = x1Of(band.toIdx-1), w = x1-x0;
    if(band.label){
      const full = band.label.length*6.3+8, short = 3*6.3+8;
      const txt = w>=full ? band.label : w>=short ? band.label.slice(0,3)+'.' : '';
      if(txt) svg.appendChild(textEl((x0+x1)/2, yLabel, txt, 'axis-label','middle'));
    }
    if(bi>0){
      const gx = x0 - (gapOf(band.fromIdx)||0);   // gapOf : décalage en px (moitié du blanc éventuel avant la période)
      svg.appendChild(svgEl('line',{x1:gx,y1:yTop,x2:gx,y2:yBottom,stroke:'var(--line-700)','stroke-dasharray':'2,3'}));
    }
  });
}
// Raccords de sessions collées : fin pointillé vertical à la jonction (exporté). joins : indices de tranche où
// deux sessions se touchent.
function drawJoins(svg, joins, xAt, top, bottom){
  (joins||[]).forEach(i=>svg.appendChild(svgEl('line',{x1:xAt(i), y1:top, x2:xAt(i), y2:bottom, stroke:'var(--line-500)', 'stroke-dasharray':'1,3'})));
}
// Positions des tranches avec des écarts (en largeurs de tranche) avant certains indices (gapBefore[i] > 0).
// Renvoie {pos[i], total} : position de chaque indice et largeur totale en tranches.
function slotLayout(n, gapBefore){
  const pos = new Array(n); let acc = 0;
  for(let i=0;i<n;i++){ acc += (gapBefore && gapBefore[i]) || 0; pos[i] = i+acc; }
  return {pos, total:n+acc};
}
// Blocs contigus [{from, to}] séparés par les écarts de gapBefore (un seul sans écart) ; sert à couper courbes
// et aires.
function runsOf(n, gapBefore){
  const runs = [];
  for(let i=0;i<n;i++){
    if(i===0 || (gapBefore && gapBefore[i]>0)) runs.push({from:i, to:i}); else runs[runs.length-1].to = i;
  }
  return runs;
}
// Étiquettes de jour sous l'axe (une par bloc, clairsemées si étroits) et séparateurs pointillés dans les écarts.
// xl(i)/xr(i) : bords gauche/droit (px) de la tranche i ; dayBlocks : [{from, to, label?, short?, ts}] ;
// libellé abrégé sous 64 px de large moyenne.
function drawDayBlocks(svg, dayBlocks, xl, xr, yLabel, yTop, yBottom){
  if(!dayBlocks || !dayBlocks.length) return;
  const avgW = dayBlocks.reduce((sum,b)=>sum+(xr(b.to)-xl(b.from)),0)/dayBlocks.length;
  const short = avgW < 64, boxW = short ? 30 : 56;
  let lastRight = -Infinity;
  dayBlocks.forEach((b,bi)=>{
    const x0 = xl(b.from), x1 = xr(b.to);
    if(bi>0){
      const gx = (xr(dayBlocks[bi-1].to) + x0)/2;
      svg.appendChild(svgEl('line',{x1:gx, y1:yTop, x2:gx, y2:yBottom, stroke:'var(--line-700)','stroke-dasharray':'2,3'}));
    }
    const cx = (x0+x1)/2;
    if(cx-boxW/2 >= lastRight+4){
      svg.appendChild(textEl(cx, yLabel, b.label!=null ? (short && b.short ? b.short : b.label) : dayLabelAbs(b.ts, short), 'axis-label', 'middle'));
      lastRight = cx+boxW/2;
    }
  });
}

//- RENDU COURBES / BARRES / BARRES MULTIPLES ----------------------------------------------------//
// Trois rendus de séries temporelles (Chronologie, Cycles) : courbes, barres empilées, barres multiples.
// Options communes (opts) : gapBefore, dayBlocks, periodBands, boundaries, cfgUI, joins, avgLines.
// Chacun vide le container puis y monte un svg neuf.

// Courbes (Chronologie, Cycles), avec aire optionnelle : opaque, la série de plus faible moyenne est peinte
// en dernier (au premier plan) pour ne pas être masquée par les grandes.
// series : [{values, color, dashed?}] ; xValues/xLabelFn : étiquettes de l'axe ; opts.breaks : coupures de session.
// Courbes et aires sont coupées aux écarts (gapBefore).
function renderLineChart(container, series, xValues, xLabelFn, opts){
  opts = opts||{};
  const width = chartWidth(container, 46, avgPadRight(opts), Math.max(1, slotLayout(xValues.length, opts.gapBefore).total-1), MIN_SLOT_LINE);
  const scrolled = isScrolled(container, width);
  const height = chartH();
  const dayBlocks = opts.dayBlocks && opts.dayBlocks.length ? opts.dayBlocks : null;
  const bnd = opts.boundaries && opts.boundaries.length ? opts.boundaries : null;
  const cfg = opts.cfgUI && opts.cfgUI.length ? opts.cfgUI : null;
  const pad = {left:46, right:avgPadRight(opts), top:16, bottom: ((dayBlocks||opts.periodBands) ? 54 : 38) + ((bnd||cfg) ? 18 : 0)};
  const plotW = width-pad.left-pad.right, plotH = height-pad.top-pad.bottom;
  const maxY = Math.max(1, ...series.flatMap(s=>s.values), avgLinesMax(opts.avgLines));
  const n = xValues.length;
  const lay = slotLayout(n, opts.gapBefore);              // écarts entre fenêtres (jours) éventuels
  const span = n>1 ? lay.pos[n-1] : 0;
  const xPos = i => pad.left + (span<=0 ? 0 : (lay.pos[i]/span)*plotW);
  const yPos = v => pad.top + plotH - (v/maxY)*plotH;
  const runs = runsOf(n, opts.gapBefore);                 // les courbes sont coupées aux écarts
  const isBreak = i => i>0 && opts.gapBefore && opts.gapBefore[i]>0;

  const svg = svgEl('svg',{class:'chart', viewBox:`0 0 ${width} ${height}`, width:scrolled?width:'100%', height});
  markDense(svg, plotW/Math.max(1,span));
  // graduations et lignes de grille horizontales
  yGrid(svg, pad.left, width-pad.right, pad.top, plotH, maxY);
  // repères de rupture de session (trait vertical + libellé)
  if(opts.breaks){
    opts.breaks.forEach(b=>{
      const x = xPos(b.index);
      svg.appendChild(svgEl('line',{x1:x,y1:pad.top,x2:x,y2:height-pad.bottom,stroke:'var(--line-500)','stroke-dasharray':'3,3'}));
      svg.appendChild(textEl(x+4, pad.top+10, b.label, 'axis-label'));
    });
  }
  // étiquettes de l'axe x (une sur labelEvery pour éviter le chevauchement)
  const labelEvery = scrolled ? Math.max(1, Math.ceil(56/(plotW/Math.max(1,span)))) : Math.max(1, Math.ceil(n/8));
  for(let i=0;i<n;i+=labelEvery){
    svg.appendChild(textEl(xPos(i), height-pad.bottom+16, xLabelFn(xValues[i]), 'axis-label', 'middle'));
  }
  drawDayBlocks(svg, dayBlocks, xPos, xPos, height-pad.bottom+34, pad.top, height-pad.bottom+6);
  if(opts.periodBands) drawPeriodBands(svg, opts.periodBands, xPos, xPos, i=>0, height-pad.bottom+34, pad.top, height-pad.bottom+6);
  drawJoins(svg, opts.joins, i=>(xPos(i-1)+xPos(i))/2, pad.top, height-pad.bottom);
  const cfgXs = drawCfgUI(svg, cfg, xPos, xPos, height-9);
  drawBoundaryUI(svg, bnd, i=>xPos(i)-plotW/Math.max(1,span)/2, plotW/Math.max(1,span), height-9, cfgXs);
  // aire sous les courbes, opaque : plus forte moyenne en arrière-plan, plus faible au premier plan
  if(opts.area){
    const avgOf = s => s.values.reduce((a,b)=>a+b,0)/(s.values.length||1);
    const ordered = series.slice().sort((a,b)=>avgOf(b)-avgOf(a));
    ordered.forEach(s=>{
      let d = '';
      runs.forEach(r=>{                                   // une forme fermée par bloc (jour)
        d += `M${xPos(r.from).toFixed(1)},${yPos(0).toFixed(1)} `;
        for(let i=r.from;i<=r.to;i++) d += `L${xPos(i).toFixed(1)},${yPos(s.values[i]).toFixed(1)} `;
        d += `L${xPos(r.to).toFixed(1)},${yPos(0).toFixed(1)} Z `;
      });
      svg.appendChild(svgEl('path',{d, fill:s.color, opacity:'1', stroke:'none', 'data-fill':'1'}));
    });
  }
  // traits des séries (rupture « M » à chaque écart)
  series.forEach(s=>{
    let d='';
    s.values.forEach((v,i)=>{
      const x=xPos(i), y=yPos(v);
      d += (i===0||isBreak(i)?'M':'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
    });
    const path = svgEl('path',{d, fill:'none', stroke:s.color, 'stroke-width':2, 'stroke-dasharray': s.dashed?'5,4':'none'});
    svg.appendChild(path);
  });
  drawAvgLines(svg, opts.avgLines, xPos, yPos, width-pad.right, !!opts.area);
  container.innerHTML='';
  mountChart(container, svg, pad.left, height, scrolled);

}

// Barres empilées (une pile par tranche, hauteur = somme des séries : compatible avec le mode Somme Σ).
// En Cycles : repères optionnels (pic, bandes de période, ombrage week-end).
// catX(i) : bord gauche de la tranche i ; slotC(i) : centre, prolongé aux bords pour les moyennes étendues.
function renderStackedBar(container, categories, series, catLabelFn, opts){
  opts = opts||{};
  const width = chartWidth(container, 46, avgPadRight(opts), slotLayout(categories.length, opts.gapBefore).total, MIN_SLOT_BAR);
  const scrolled = isScrolled(container, width);
  const height=chartH();
  const dayBlocks = opts.dayBlocks && opts.dayBlocks.length ? opts.dayBlocks : null;
  const bnd = opts.boundaries && opts.boundaries.length ? opts.boundaries : null;
  const cfg = opts.cfgUI && opts.cfgUI.length ? opts.cfgUI : null;
  const pad={left:46,right:avgPadRight(opts),top:16,bottom: ((opts.periodBands || dayBlocks) ? 62 : 46) + ((bnd||cfg) ? 18 : 0)};
  const plotW=width-pad.left-pad.right, plotH=height-pad.top-pad.bottom;
  const totals = categories.map((c,i)=>series.reduce((s,ser)=>s+ser.values[i],0));
  const maxTotal = Math.max(1, ...totals, avgLinesMax(opts.avgLines));
  const n=categories.length;
  const lay = slotLayout(n, opts.gapBefore);              // écarts entre fenêtres (jours) éventuels
  const step = plotW/lay.total;
  const bw = Math.max(4, step*0.7);
  const catX = i => pad.left + (i<n ? lay.pos[i] : lay.total+(i-n))*step;   // bord gauche de la tranche i
  // centre de la tranche i ; i<0 → bord gauche du graphique, i>n-1 → bord droit (lignes de moyenne prolongées)
  const slotC = i => i<0 ? pad.left : i>n-1 ? pad.left+lay.total*step : catX(i)+step/2;

  const svg = svgEl('svg',{class:'chart', viewBox:`0 0 ${width} ${height}`, width:scrolled?width:'100%', height});
  markDense(svg, step);

  // ombrage léger des tranches de week-end derrière les barres
  if(opts.weekendIndices){
    opts.weekendIndices.forEach(i=>{
      svg.appendChild(svgEl('rect',{x:catX(i),y:pad.top,width:step,height:plotH,fill:'#FFFFFF',opacity:'0.035'}));
    });
  }
  // bandes de périodes de la journée avec leur libellé sous l'axe
  if(opts.periodBands) drawPeriodBands(svg, opts.periodBands, catX, i=>catX(i)+step, i=>((opts.gapBefore&&opts.gapBefore[i])||0)*step/2, height-pad.bottom+34, pad.top, height-pad.bottom+6);

  yGrid(svg, pad.left, width-pad.right, pad.top, plotH, maxTotal);

  let peakIdx=-1, peakVal=-1;
  categories.forEach((c,i)=>{
    let yCursor = pad.top+plotH;
    const x = catX(i) + (step-bw)/2;
    series.forEach(ser=>{
      const v = ser.values[i];
      if(v<=0) return;
      const h = (v/maxTotal)*plotH;
      yCursor -= h;
      svg.appendChild(svgEl('rect',{x,y:yCursor,width:bw,height:h,fill:ser.color,'data-fill':'1'}));
    });
    if(opts.markPeak && totals[i]>peakVal){ peakVal=totals[i]; peakIdx=i; }
    const labelEvery = scrolled ? Math.max(1, Math.ceil(56/step)) : Math.max(1, Math.ceil(n/12));
    if(i%labelEvery===0){
      svg.appendChild(textEl(x+bw/2, height-pad.bottom+16, catLabelFn(c), 'axis-label','middle'));
    }
  });

  drawDayBlocks(svg, dayBlocks, catX, i=>catX(i)+step, height-pad.bottom+34, pad.top, height-pad.bottom+6);
  drawJoins(svg, opts.joins, catX, pad.top, height-pad.bottom);
  const cfgXs = drawCfgUI(svg, cfg, catX, i=>catX(i)+step, height-9);
  drawBoundaryUI(svg, bnd, catX, step, height-9, cfgXs);
  // lignes de moyenne (touches « moyennes »), tracées au centre des barres
  drawAvgLines(svg, opts.avgLines, slotC, v=>pad.top+plotH-(v/maxTotal)*plotH, width-pad.right, true, true);
  // repère du pic (libellé au-dessus de la barre la plus haute)
  if(opts.markPeak && peakIdx>=0){
    const x = slotC(peakIdx);
    const y = pad.top+plotH-(peakVal/maxTotal)*plotH;
    svg.appendChild(textEl(x, y-8, tr('pic · {x}',{x:catLabelFn(categories[peakIdx])}), 'axis-label','middle'));
  }

  container.innerHTML='';
  mountChart(container, svg, pad.left, height, scrolled);

}

// Barres multiples côte à côte (une par série) ; la largeur minimale d'une tranche croît avec leur nombre.
// Mêmes options que renderStackedBar, sans pic ni ombrage week-end.
function renderGroupedBar(container, categories, series, catLabelFn, opts){
  opts = opts||{};
  const width = chartWidth(container, 46, avgPadRight(opts), slotLayout(categories.length, opts.gapBefore).total, Math.max(MIN_SLOT_BAR, series.length*7+6));
  const scrolled = isScrolled(container, width);
  const height = chartH();
  const dayBlocks = opts.dayBlocks && opts.dayBlocks.length ? opts.dayBlocks : null;
  const bnd = opts.boundaries && opts.boundaries.length ? opts.boundaries : null;
  const cfg = opts.cfgUI && opts.cfgUI.length ? opts.cfgUI : null;
  const pad = {left:46, right:avgPadRight(opts), top:16, bottom: ((dayBlocks||opts.periodBands) ? 62 : 46) + ((bnd||cfg) ? 18 : 0)};
  const plotW = width-pad.left-pad.right, plotH = height-pad.top-pad.bottom;
  const maxVal = Math.max(1, ...series.flatMap(s=>s.values), avgLinesMax(opts.avgLines));
  const n = categories.length;
  const lay = slotLayout(n, opts.gapBefore);              // écarts entre fenêtres (jours) éventuels
  const step = plotW/lay.total;
  const catX = i => pad.left + lay.pos[i]*step;           // bord gauche de la tranche i
  const slotC = i => i<0 ? pad.left : i>n-1 ? pad.left+lay.total*step : catX(i)+step/2;
  const groupPad = step*0.15;
  const usableW = Math.max(1, step - groupPad*2);
  const barGap = 1;
  const barW = Math.max(1, (usableW - (series.length-1)*barGap)/series.length);

  const svg = svgEl('svg',{class:'chart', viewBox:`0 0 ${width} ${height}`, width:scrolled?width:'100%', height});
  markDense(svg, step);
  yGrid(svg, pad.left, width-pad.right, pad.top, plotH, maxVal);
  categories.forEach((c,i)=>{
    const groupX = catX(i) + groupPad;
    series.forEach((ser,si)=>{
      const v = ser.values[i];
      if(v<=0) return;
      const h = (v/maxVal)*plotH;
      const x = groupX + si*(barW+barGap);
      const y = pad.top+plotH-h;
      svg.appendChild(svgEl('rect',{x,y,width:barW,height:h,rx:1,fill:ser.color,'data-fill':'1'}));
    });
    const labelEvery = scrolled ? Math.max(1, Math.ceil(56/step)) : Math.max(1, Math.ceil(n/12));
    if(i%labelEvery===0){
      svg.appendChild(textEl(slotC(i), height-pad.bottom+16, catLabelFn(c), 'axis-label','middle'));
    }
  });
  drawDayBlocks(svg, dayBlocks, catX, i=>catX(i)+step, height-pad.bottom+34, pad.top, height-pad.bottom+6);
  if(opts.periodBands) drawPeriodBands(svg, opts.periodBands, catX, i=>catX(i)+step, i=>((opts.gapBefore&&opts.gapBefore[i])||0)*step/2, height-pad.bottom+34, pad.top, height-pad.bottom+6);
  drawJoins(svg, opts.joins, catX, pad.top, height-pad.bottom);
  const cfgXs = drawCfgUI(svg, cfg, catX, i=>catX(i)+step, height-9);
  drawBoundaryUI(svg, bnd, catX, step, height-9, cfgXs);
  drawAvgLines(svg, opts.avgLines, slotC, v=>pad.top+plotH-(v/maxVal)*plotH, width-pad.right, true, true);
  container.innerHTML='';
  mountChart(container, svg, pad.left, height, scrolled);
}

// Message (HTML tel quel) affiché quand une vue n'a rien à montrer avec les filtres actifs.
function emptyState(container, msg){
  container.innerHTML = `<div class="empty-state">${msg}</div>`;
}

//- REGROUPEMENT DE SÉQUENCES --------------------------------------------------------------------//
// Regroupe les appuis de chaque session en séquences (vue Séquences). Deux appuis consécutifs séparés d'au
// plus opts.gap secondes (SEQ_GAP_DEFAULT par défaut) font partie de la même séquence ; l'écart se mesure entre
// appuis successifs, pas depuis le premier (A, +4 s B, +4 s C = une seule séquence de 8 s).
// opts.ordered : false = combinaison triée sans doublon (« A + C » : A puis C ou C puis A) ;
//   true = ordre respecté (« A → C »), répétitions consécutives fusionnées (A, A, C = A → C).
// Tri par temps (absMs en NTP, sinon relSec en REL) ; événements sans temps ignorés.
// Renvoie {combos, sizes, totalClusters} : combos[clé] = nombre de séquences de cette clé ; sizes[clé] = nombre
//   de boutons DIFFÉRENTS (« A → B → A » en compte 2) ; une séquence exige sizes >= 2.
function clusterSequences(filteredEvents, opts){
  const gapMax = opts && opts.gap!=null ? opts.gap : SEQ_GAP_DEFAULT;
  const ordered = !!(opts && opts.ordered);
  const bySession = {};
  filteredEvents.forEach(e=>{ (bySession[e.session]=bySession[e.session]||[]).push(e); });
  const combos = {}, sizes = {};
  let totalClusters = 0;
  Object.values(bySession).forEach(evs=>{
    // temps en secondes pour le tri et le regroupement : absMs si présent, sinon relSec
    const withTime = evs.filter(e=>e.absMs!=null || e.relSec!=null)
      .map(e=>({...e, timeVal: e.absMs!=null ? e.absMs/1000 : e.relSec}));
    withTime.sort((a,b)=>(a.timeVal-b.timeVal) || (a.order-b.order));   // à égalité de seconde : ordre du fichier
    let cluster=[];
    // clôt la séquence en cours : compte sa clé (combinaison ou enchaînement) puis la vide
    function flush(){
      if(cluster.length){
        const letters = cluster.map(e=>e.bouton);
        const key = ordered
          ? letters.filter((b,i)=>i===0 || b!==letters[i-1]).join(' → ')
          : [...new Set(letters)].sort().join(' + ');
        combos[key]=(combos[key]||0)+1;
        sizes[key]=new Set(letters).size;
        totalClusters++;
      }
      cluster=[];
    }
    withTime.forEach(e=>{
      if(cluster.length===0){ cluster.push(e); return; }
      const gap = e.timeVal - cluster[cluster.length-1].timeVal;
      if(gap<=gapMax){ cluster.push(e); }
      else { flush(); cluster.push(e); }
    });
    flush();
  });
  return {combos, sizes, totalClusters};
}
// Longueur maximale d'une séquence : nombre de boutons actifs, entre 2 et SEQ_LEN_MAX.
function seqLenCeiling(){ return Math.max(2, Math.min(SEQ_LEN_MAX, state.activeButtons.length)); }
// Longueur maximale retenue : le réglage de l'utilisateur, sinon le plafond.
function seqLenEffective(){ return state.seqMaxLen!=null ? Math.min(state.seqMaxLen, seqLenCeiling()) : seqLenCeiling(); }

