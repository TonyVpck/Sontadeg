//------------------------------------------------------------------------------------------------//
// SONTADEG ARSELLAN - VUES : MATRICES, VUES COMPLÈTES ET EXPORT SVG                              //
//                                                                                                //
// Rendus matriciels (Chaleur / Points / Bâtons), vues Chronologie, Cycles et Séquences,          //
// export SVG de la vue active et du résumé.                                                      //
//------------------------------------------------------------------------------------------------//

"use strict";

//- RENDUS MATRICIELS (CHALEUR / POINTS / BÂTONS) ------------------------------------------------//
// Convertit « #RRGGBB » en [r, g, b].
function hexToRgb(hex){
  const h = hex.replace('#','');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
// Couleur d'une case Chaleur : interpolation entre le fond neutre et l'accent du bouton, selon t ∈ [0,1].
// Renvoie « rgb(r,g,b) ».
function heatColor(t, accentHex){
  const from = [64,64,64]; // fond neutre, ≈ --panel-raised (#404040) du CSS
  const to = accentHex ? hexToRgb(accentHex) : [227,163,78]; // ambre par défaut
  const r = Math.round(from[0]+(to[0]-from[0])*t);
  const g = Math.round(from[1]+(to[1]-from[1])*t);
  const b = Math.round(from[2]+(to[2]-from[2])*t);
  return `rgb(${r},${g},${b})`;
}

//- GÉOMÉTRIE ET EN-TÊTES DES MATRICES -----------------------------------------------------------//
// Mise en page d'une matrice : width/height du SVG, colW, rowH, marges, pos[], units, yTime (ordonnée
// des étiquettes) et colX(ci).
// cols : [{idx, label, gapBefore?, dayLabel?}] ; gapBefore = écart en colonnes ; dayLabel = libellé du bloc.
// light : bande empilée sous une autre (sans en-tête) ; hasCfg : un ☰ doit tenir sous la date.
// colW = 24 par défaut ; en taille réelle défilable (scrollAllowed) il suit le zoom, borné par MAX_CHART_PX.
function matrixGeom(rows, cols, light, hasCfg){
  const rowH = rows.length>1 ? 18 : 22, leftPad = 62, rightPad = 12, bottomPad = 6;
  const hasDay = cols.some(c=>c.dayLabel);
  const withCfg = !!(hasCfg && hasDay);   // ☰ sous la date : une ligne de plus
  const topPad = light ? 2 : (hasDay ? (withCfg ? 54 : 34) : 18);      // light : pas d'en-tête (dessiné une seule fois pour la pile)
  let acc = 0;
  const pos = cols.map((c,i)=>{ acc += c.gapBefore||0; return i+acc; });
  const units = cols.length + acc;
  const colW = scrollAllowed() ? Math.max(2, Math.min(24*state.zoom, (MAX_CHART_PX-leftPad-rightPad)/Math.max(1,units))) : 24;
  return {withCfg, yTime: hasDay ? (withCfg ? 48 : 28) : 12, colW, rowH, leftPad, rightPad, bottomPad, topPad, hasDay, pos, units,
    width: leftPad + units*colW + rightPad,
    height: topPad + rows.length*rowH + bottomPad,
    colX: ci => leftPad + pos[ci]*colW};
}
// En-têtes de colonnes : une étiquette toutes les N colonnes, libellés de blocs (jours, sessions, périodes)
// avec séparateurs pointillés, ☰ (cfgUI) et frontières de session cliquables (boundaries).
// Ajoute des éléments à svg ; en mode light, seulement les séparateurs.
function drawMatrixHeader(svg, cols, g, nRows, boundaries, cfgUI, light){
  if(light){   // séparateurs seuls, pour rester continus d'une bande à l'autre
    if(!g.hasDay) return;
    const st = []; cols.forEach((c,ci)=>{ if(c.dayLabel) st.push(ci); });
    st.forEach((ci,k)=>{
      if(k===0) return;
      const gx = (g.colX(st[k]-1)+g.colW-2 + g.colX(ci))/2;
      svg.appendChild(svgEl('line',{x1:gx, y1:0, x2:gx, y2:g.topPad+nRows*g.rowH, stroke:'var(--line-700)','stroke-dasharray':'2,3'}));
    });
    return;
  }
  const maxLen = Math.max(1, ...cols.map(c=>String(c.label).length));
  const labelEvery = Math.max(1, Math.ceil((maxLen*6+10)/g.colW));   // une étiquette dès que la place le permet
  const yTime = g.yTime;
  cols.forEach((c,ci)=>{
    if(ci%labelEvery===0) svg.appendChild(textEl(g.colX(ci)+g.colW/2, yTime, c.label, 'axis-label', 'middle'));
  });
  const cfgXs = (cfgUI && g.hasDay) ? drawCfgUI(svg, cfgUI, ci=>g.colX(ci), ci=>g.colX(ci)+g.colW-2, 29, 0) : [];   // centré sous la date
  if(boundaries) drawBoundaryUI(svg, boundaries, ci=>g.colX(ci), g.colW, 11, []);
  if(!g.hasDay) return;
  const starts = []; cols.forEach((c,ci)=>{ if(c.dayLabel) starts.push(ci); });
  const blocks = starts.map((ci,k)=>({from:ci, to:(k+1<starts.length ? starts[k+1] : cols.length)-1, label:cols[ci].dayLabel, ts:cols[ci].ts, custom:cols[ci].blockLabel, customShort:cols[ci].blockShort}));
  const avgW = blocks.reduce((sum,b)=>sum+(g.colX(b.to)+g.colW-g.colX(b.from)),0)/blocks.length;
  const short = avgW < 64, boxW = short ? 30 : 56;
  let lastRight = -Infinity;
  blocks.forEach((b,bi)=>{
    const x0 = g.colX(b.from), x1 = g.colX(b.to)+g.colW-2;
    if(bi>0){
      const gx = (g.colX(blocks[bi-1].to)+g.colW-2 + x0)/2;
      svg.appendChild(svgEl('line',{x1:gx, y1:4, x2:gx, y2:g.topPad+nRows*g.rowH, stroke:'var(--line-700)','stroke-dasharray':'2,3'}));
    }
    const cx = (x0+x1)/2;
    if(cx-boxW/2 >= lastRight+4){
      svg.appendChild(textEl(cx, 11, b.custom!=null ? (short && b.customShort ? b.customShort : b.custom) : dayLabelAbs(b.ts, short), 'axis-label', 'middle'));
      lastRight = cx+boxW/2;
    }
  });
}
// ☰ de réglages des lignes (ex. jours de la semaine de la matrice Cycles), à gauche de la lettre du groupe.
// Sans effet sans opts.rowCfg ; clic → rowCfg.onClick(élément).
function drawRowCfg(svg, g, opts){
  const it = opts.rowCfg; if(!it) return;
  const el = svgEl('g',{class:'ui-only cfg-btn'+(it.custom?' on':''), transform:`translate(11,${g.yTime-4})`, style:'cursor:pointer'});
  el.appendChild(svgEl('rect',{class:'box', x:-8,y:-8,width:16,height:16,rx:3}));
  [-3.2,0,3.2].forEach(yy=>el.appendChild(svgEl('line',{x1:-4,y1:yy,x2:4,y2:yy})));
  const tt = svgEl('title',{}); tt.textContent = tr('Réglages : {title}',{title:it.title}); el.appendChild(tt);
  el.addEventListener('click', ev=>{ ev.stopPropagation(); it.onClick(el); });
  svg.appendChild(el);
}
// Lettre du groupe (A–F ou Z) à la couleur d'accent, titre en infobulle. Sur la ligne s'il n'y en a qu'une,
// sinon sur l'en-tête.
function drawGroupBadge(svg, g, rows, opts){
  if(!opts.groupLetter) return;
  const single = rows.length===1;
  const y = single ? g.topPad + g.rowH/2 + 4 : g.yTime;
  const x = g.leftPad-8 - (single && rows[0] ? String(rows[0]).length*7+10 : 0);   // une seule ligne nommée (ex. « Sam ») : lettre à gauche du nom
  const t = textEl(x, y, opts.groupLetter, 'y-tick', 'end');
  t.setAttribute('style', `font-size:13px; font-weight:700; fill:${opts.accent||'var(--paper-50)'}`);
  if(opts.groupTitle){ const tt = svgEl('title',{}); tt.textContent = opts.groupTitle; t.appendChild(tt); }
  svg.appendChild(t);
}
// Matrice Chaleur : une case par (ligne, colonne), teinte proportionnelle au maximum (0 = fond sombre).
// rows : libellés de lignes ; matrix[ligne][col.idx] : comptes ; opts : cols, accent, light, boundaries, cfgUI,
// rowCfg, groupLetter/groupTitle.
// Ajoute à container un SVG à viewBox (s'adapte à la largeur) ou, si la matrice déborde et que le zoom le permet,
// un SVG à largeur fixe avec ascenseur.
function renderMatrixHeatmap(container, rows, matrix, opts){
  const cols = opts.cols; // une entrée {idx, label, …} par colonne affichée
  const maxV = Math.max(1, ...cols.flatMap(c=>matrix.map(row=>row[c.idx])));
  const g = matrixGeom(rows, cols, opts.light, !!opts.cfgUI);
  const scrolled = scrollAllowed() && g.width > (container.clientWidth||0) + 1;
  const svg = svgEl('svg',{class:'chart', viewBox:`0 0 ${g.width} ${g.height}`, width:scrolled?g.width:'100%', height:g.height});
  markDense(svg, g.colW * Math.min(1, (container.clientWidth||g.width)/g.width));
  drawMatrixHeader(svg, cols, g, rows.length, opts.boundaries, opts.cfgUI, opts.light);
  drawGroupBadge(svg, g, rows, opts);
  drawRowCfg(svg, g, opts);
  rows.forEach((rowLabelTxt,ri)=>{
    const y = g.topPad + ri*g.rowH;
    if(rowLabelTxt) svg.appendChild(textEl(g.leftPad-8, y+g.rowH/2+3, rowLabelTxt, 'bar-label y-tick', 'end'));
    cols.forEach((c,ci)=>{
      const x = g.colX(ci);
      const v = matrix[ri][c.idx];
      const rect = svgEl('rect',{x, y, width:Math.max(1,g.colW-2), height:Math.max(1,g.rowH-2), rx:2,
        fill: v===0 ? 'var(--ink-900)' : heatColor(v/maxV, opts.accent)});
      const title = svgEl('title',{});
      title.textContent = `${rowLabelTxt?rowLabelTxt+' · ':''}${c.label} : ${v}`;
      rect.appendChild(title);
      svg.appendChild(rect);
    });
  });
  const wrap = document.createElement('div'); wrap.className='chart-wrap';
  mountChart(wrap, svg, g.leftPad, g.height, scrolled);
  container.appendChild(wrap);
}

// Matrice Points : un disque par case non nulle, rayon de 2 à 10 px selon la racine du ratio au maximum.
// Mêmes paramètres et effets que renderMatrixHeatmap.
function renderMatrixDots(container, rows, matrix, opts){
  const cols = opts.cols;
  const maxV = Math.max(1, ...cols.flatMap(c=>matrix.map(row=>row[c.idx])));
  const g = matrixGeom(rows, cols, opts.light, !!opts.cfgUI);
  const scrolled = scrollAllowed() && g.width > (container.clientWidth||0) + 1;
  const svg = svgEl('svg',{class:'chart', viewBox:`0 0 ${g.width} ${g.height}`, width:scrolled?g.width:'100%', height:g.height});
  markDense(svg, g.colW * Math.min(1, (container.clientWidth||g.width)/g.width));
  drawMatrixHeader(svg, cols, g, rows.length, opts.boundaries, opts.cfgUI, opts.light);
  drawGroupBadge(svg, g, rows, opts);
  drawRowCfg(svg, g, opts);
  rows.forEach((rowLabelTxt,ri)=>{
    const rowTop = g.topPad + ri*g.rowH, y = rowTop + g.rowH/2;
    svg.appendChild(textEl(g.leftPad-8, y+3, rowLabelTxt, 'bar-label y-tick', 'end'));
    cols.forEach((c,ci)=>{
      const v = matrix[ri][c.idx];
      if(v<=0) return;
      const x = g.colX(ci) + g.colW/2;
      const r = 2 + Math.sqrt(v/maxV)*8;
      const circ = svgEl('circle',{cx:x.toFixed(1), cy:y.toFixed(1), r:r.toFixed(1), fill:opts.accent});
      const title = svgEl('title',{});
      title.textContent = `${rowLabelTxt} · ${c.label} : ${v}`;
      circ.appendChild(title);
      svg.appendChild(circ);
    });
  });
  const wrap = document.createElement('div'); wrap.className='chart-wrap';
  mountChart(wrap, svg, g.leftPad, g.height, scrolled);
  container.appendChild(wrap);
}

// Matrice Bâtons : mini-barre ancrée en bas de chaque case, hauteur proportionnelle au maximum
// (lecture plus précise : Chaleur < Points < Bâtons). Mêmes paramètres et effets que renderMatrixHeatmap.
function renderMatrixBars(container, rows, matrix, opts){
  const cols = opts.cols;
  const maxV = Math.max(1, ...cols.flatMap(c=>matrix.map(row=>row[c.idx])));
  const g = matrixGeom(rows, cols, opts.light, !!opts.cfgUI);
  const scrolled = scrollAllowed() && g.width > (container.clientWidth||0) + 1;
  const svg = svgEl('svg',{class:'chart', viewBox:`0 0 ${g.width} ${g.height}`, width:scrolled?g.width:'100%', height:g.height});
  markDense(svg, g.colW * Math.min(1, (container.clientWidth||g.width)/g.width));
  drawMatrixHeader(svg, cols, g, rows.length, opts.boundaries, opts.cfgUI, opts.light);
  drawGroupBadge(svg, g, rows, opts);
  drawRowCfg(svg, g, opts);
  const barW = g.colW*0.5;
  rows.forEach((rowLabelTxt,ri)=>{
    const rowTop = g.topPad + ri*g.rowH;
    const rowBottom = rowTop + g.rowH - 3;
    if(rowLabelTxt) svg.appendChild(textEl(g.leftPad-8, rowTop+g.rowH/2+3, rowLabelTxt, 'bar-label y-tick', 'end'));
    svg.appendChild(svgEl('line',{x1:g.leftPad, y1:rowBottom, x2:g.leftPad+g.units*g.colW, y2:rowBottom, class:'grid-line'}));
    cols.forEach((c,ci)=>{
      const v = matrix[ri][c.idx];
      if(v<=0) return;
      const h = Math.max(1, (v/maxV)*(g.rowH-5));
      const x = g.colX(ci) + (g.colW-barW)/2;
      const y = rowBottom - h;
      const rect = svgEl('rect',{x, y, width:barW, height:h, rx:1, fill:opts.accent});
      const title = svgEl('title',{});
      title.textContent = `${rowLabelTxt?rowLabelTxt+' · ':''}${c.label} : ${v}`;
      rect.appendChild(title);
      svg.appendChild(rect);
    });
  });
  const wrap = document.createElement('div'); wrap.className='chart-wrap';
  mountChart(wrap, svg, g.leftPad, g.height, scrolled);
  container.appendChild(wrap);
}

// Prépare un groupe par bouton A–F coché, plus Z (spam) si activé, chacun avec sa couleur.
// filtered : événements déjà filtrés. Renvoie [{key, label, color, events}].
function buildHeatmapGroups(filtered){
  const buttonsToPlot = state.activeButtons.filter(b=>state.filters.buttons.has(b));
  const groups = buttonsToPlot.map(b=>({
    key:b, label:labelFor(b), color:BUTTON_COLORS[b],
    events: filtered.filter(e=>!e.isSpam && e.bouton===b)
  }));
  if(state.filters.spam){
    groups.push({key:'Z', label:tr('Spam'), color:SPAM_COLOR, events: filtered.filter(e=>e.isSpam)});
  }
  return groups;
}

// Rend une matrice par groupe dans un conteneur .heatmap-groups ; cellMode : 'dots' (Points), 'baton' (Bâtons),
// sinon Chaleur. rowLabelsFn(groupe) → libellés de lignes ; buildMatrixFn(groupe) → matrice de comptes ;
// extra : options communes (cfgUI, rowCfg, boundaries…).
// Seul le premier groupe porte les ☰ et frontières ; les suivants à une ligne sont « light » (pile compacte).
function renderHeatmapGroups(container, groups, rowLabelsFn, buildMatrixFn, cols, cellMode, extra){
  const grid = document.createElement('div'); grid.className='heatmap-groups';
  container.appendChild(grid);   // dans le DOM d'abord : les matrices mesurent la largeur disponible
  groups.forEach((g,gi)=>{
    const block = document.createElement('div'); block.className='heatmap-group';
    grid.appendChild(block);
    const rows = rowLabelsFn(g);
    const strip = rows.length===1;
    if(!strip && gi>0) block.style.marginTop = '6px';
    const renderFn = cellMode==='dots' ? renderMatrixDots : cellMode==='baton' ? renderMatrixBars : renderMatrixHeatmap;
    const groupTitle = `${g.label} (${g.events.length})`;
    renderFn(block, rows, buildMatrixFn(g), Object.assign({accent:g.color, cols, groupLetter:g.key, groupTitle, light: strip && gi>0}, extra||{}, gi>0 ? {boundaries:null, cfgUI:null, rowCfg:null} : {}));
    block.querySelectorAll('rect > title, circle > title').forEach(t=>{ t.textContent = g.label+' · '+t.textContent; });
  });
// Défilement synchronisé entre les grilles.
  const wraps = Array.from(grid.querySelectorAll('.chart-scroller'));
  wraps.slice(0,-1).forEach(w=>w.classList.add('no-bar'));   // un seul ascenseur visible (le dernier), les autres suivent
  let syncing = false;
  wraps.forEach(w=>w.addEventListener('scroll', ()=>{
    if(syncing) return; syncing = true;
    wraps.forEach(o=>{ if(o!==w) o.scrollLeft = w.scrollLeft; });
    syncing = false;
  }));
}

//- VUES COMPLÈTES (CHRONOLOGIE, CYCLES, SÉQUENCES) ----------------------------------------------//
// Chaque vue assemble : filtrage, axe (tranches), séries, moyennes, puis dessin (courbes/barres ou matrices).
// Deux horloges : NTP (absMs, horodatage absolu) et REL (relSec, secondes depuis le début de session),
// sessions bout à bout ou « collées » (state.relGlue).
// Piège : en mode Σ, la part grise des barres empilées est le reste non détaillé, pas le total.

//- CHALEUR/POINTS/BÂTONS DE CHRONOLOGIE (NTP) ---------------------------------------------------//
// Bande 1D de Chronologie (mêmes tranches que Courbes/Barres), une ligne par bouton A–F (+ Z = spam).
// L'axe suit les bornes réglées ; les jours ne sont étiquetés que s'il y en a plusieurs.
function renderTemporalStrip(container, filtered, cellMode){
  if(filtered.length===0){ emptyState(container,tr('Aucune donnée pour ces réglages.')); return; }
  const groups = buildHeatmapGroups(filtered);
  if(groups.length===0){ emptyState(container,tr('Aucune option sélectionnée.')); return; }
  const tl = buildTimeline(state.granularity);
  const problem = timelineProblem(tl);
  if(problem){ emptyState(container, problem); return; }
  const {buckets, gapBefore, blocks} = tl;
  const blockStart = new Map(blocks.map(b=>[b.from, b]));
  const cols = buckets.map((b,i)=>{
    const col = {idx:i, label:bucketLabelAbs(b, state.granularity), gapBefore:gapBefore[i]};
    if(blocks.length>1 && blockStart.has(i)){ col.dayLabel = true; col.ts = blockStart.get(i).ts; }
    return col;
  });
  function buildMatrix(g){
    const row = new Array(buckets.length).fill(0);
    g.events.forEach(e=>{ const k = tl.locate(e.absMs); if(k>=0) row[k]++; });
    return [row];
  }
  renderHeatmapGroups(container, groups, ()=>[''], buildMatrix, cols, cellMode, {cfgUI: blockCfgItems('day', tl.days.map(d=>({key:d.key, from:d.from, to:d.to})))});
}

// Numéros de session (mode REL), triés : l'axe les montre toutes, même sans vote après filtrage.
// visibleOnly écarte les sessions masquées dans leurs réglages (sessCfgOf(x).hidden).
function relSessions(visibleOnly){
  const all = [...new Set(state.events.filter(e=>e.relSec!=null).map(e=>e.session))].sort((a,b)=>a-b);
  return visibleOnly ? all.filter(x=>{ const c = sessCfgOf(x); return !(c && c.hidden); }) : all;
}
// Colle/décolle la session sess à la précédente (state.relGlue) et redessine en gardant le défilement.
function toggleGlue(sess){
  const keep = Array.from(document.querySelectorAll('.chart-scroller')).map(e=>e.scrollLeft);
  if(state.relGlue.has(sess)) state.relGlue.delete(sess); else state.relGlue.add(sess);
  render();
  document.querySelectorAll('.chart-scroller').forEach((e,i)=>{ if(keep[i]!=null) e.scrollLeft = keep[i]; });
}
// Colle toutes les sessions visibles (sauf la première) ou les sépare toutes, puis redessine.
function setAllGlue(on){
  state.relGlue = on ? new Set(relSessions(true).slice(1)) : new Set();
  render();
}
// Met les sessions (mode REL) bout à bout : chacune va de « Depuis » à « Jusqu'à », séparée de la suivante par
// GAP_BARS barres, ou « collée » (state.relGlue) : le temps continue d'une session à l'autre (axe cumulatif).
// Sert à Chronologie.
// Renvoie {xValues (temps relatif des tranches), gapBefore, blocks (sessions collées, avec label/short),
//   perSession, boundaries (frontières cliquables), joins, spans, idxOf(e) → indice de tranche ou -1, tooMany}.
// tooMany : MAX_BUCKETS dépassé, afficher un message au lieu du graphique.
function buildRelConcat(sessions){
  const xValues = [], gapBefore = [], blocks = [], perSession = {}, boundaries = [], joins = [], spans = [];
  let tooMany = false, runOffset = 0, prev = null;
  sessions.forEach((s,k)=>{
    if(tooMany) return;
    const sessMax = Math.max(0, ...state.events.filter(e=>e.session===s && e.relSec!=null).map(e=>e.relSec));
    const rt = buildRelTimeline(sessMax, state.granularity, sessCfgOf(s));
    if(rt.tooMany || xValues.length+rt.buckets.length>MAX_BUCKETS){ tooMany = true; return; }
    const glued = k>0 && state.relGlue.has(s);   // collée : pas d'écart, runOffset se poursuit
    const start = xValues.length;
    if(!glued) runOffset = 0;
    rt.buckets.forEach((t,i)=>{ xValues.push(runOffset+t); gapBefore.push(i===0 && start>0 && !glued ? GAP_BARS : 0); });
    runOffset += rt.buckets.length*rt.step;
    if(glued){ const b = blocks[blocks.length-1]; b.to = xValues.length-1; b.sessions.push(s); joins.push(start); }
    else blocks.push({from:start, to:xValues.length-1, sessions:[s]});
    if(k>0) boundaries.push({idx:start, glued, session:s, prev, onClick:()=>toggleGlue(s)});
    perSession[s] = {start, n:rt.buckets.length, base:rt.base, step:rt.step};
    spans.push({key:s, from:start, to:xValues.length-1});
    prev = s;
  });
// Libellés des blocs : « Session 3 », « Sessions 3 + 4 », « Sessions 3–6 » (courts : S3, S3+4, S3–6).
  blocks.forEach(b=>{
    const a = b.sessions[0], z = b.sessions[b.sessions.length-1], n = b.sessions.length;
    b.label = n===1 ? tr('Session {n}',{n:a}) : n===2 ? tr('Sessions {a} + {z}',{a,z}) : tr('Sessions {a}–{z}',{a,z});
    b.short = n===1 ? 'S'+a : n===2 ? `S${a}+${z}` : `S${a}–${z}`;
  });
// Indice de tranche global d'un événement (session + temps relatif), -1 hors de la plage de sa session.
  const idxOf = e=>{
    const pb = perSession[e.session]; if(!pb) return -1;
    const k = Math.floor((e.relSec-pb.base)/pb.step);
    return (k<0 || k>=pb.n) ? -1 : pb.start+k;
  };
  return {xValues, gapBefore, blocks, perSession, boundaries, joins, spans, idxOf, tooMany};
}
// Chaleur/Points/Bâtons de Chronologie en mode REL : une bande par bouton, sessions bout à bout
// (buildRelConcat). ☰ de session et frontières cliquables seulement s'il y a plusieurs sessions.
function renderRelTemporalStrip(container, filtered, cellMode){
  filtered = filtered.filter(e=>e.relSec!=null);
  if(filtered.length===0){ emptyState(container,tr('Aucune donnée pour ces réglages.')); return; }
  const groups = buildHeatmapGroups(filtered);
  if(groups.length===0){ emptyState(container,tr('Aucune option sélectionnée.')); return; }
  const sessions = relSessions(true);
  const rc = buildRelConcat(sessions);
  if(rc.tooMany){ emptyState(container, timelineProblem({tooMany:true, buckets:[1]})); return; }
  const blockStart = new Map(rc.blocks.map(b=>[b.from, b]));
  const multi = sessions.length>1;
  const cols = rc.xValues.map((t,i)=>{
    const col = {idx:i, label:relLabel(t), gapBefore:rc.gapBefore[i]};
    if(multi && blockStart.has(i)){ const b = blockStart.get(i); col.dayLabel = true; col.blockLabel = b.label; col.blockShort = b.short; }
    return col;
  });
  function buildMatrix(g){
    const row = new Array(rc.xValues.length).fill(0);
    g.events.forEach(e=>{ const k = rc.idxOf(e); if(k>=0) row[k]++; });
    return [row];
  }
  renderHeatmapGroups(container, groups, ()=>[''], buildMatrix, cols, cellMode, {boundaries: multi ? rc.boundaries : null, cfgUI: blockCfgItems('sess', rc.spans)});
}
// Chaleur/Points/Bâtons de Cycles en mode REL : lignes = sessions, colonnes = temps écoulé depuis le début
// de session, une grille par bouton A–F (+ Z). L'axe couvre la plus longue session, quel que soit le filtrage.
function renderRelCyclesMatrix(container, filtered, cellMode){
  filtered = filtered.filter(e=>e.relSec!=null);
  if(filtered.length===0){ emptyState(container,tr('Aucune donnée pour ces réglages.')); return; }
  const groups = buildHeatmapGroups(filtered);
  if(groups.length===0){ emptyState(container,tr('Aucune option sélectionnée.')); return; }
  const sessions = [...new Set(filtered.map(e=>e.session))].sort((a,b)=>a-b);
  const maxRel = Math.max(0, ...state.events.filter(e=>e.relSec!=null).map(e=>e.relSec));
  const rt = buildRelTimeline(maxRel, state.granularity);
  const problem = timelineProblem(rt);
  if(problem){ emptyState(container, problem); return; }
  const n = rt.buckets.length;
  const cols = rt.buckets.map((t,i)=>({idx:i, label:relLabel(t)}));
  const rowOf = new Map(sessions.map((s,i)=>[s,i]));
  function buildMatrix(g){
    const m = sessions.map(()=>new Array(n).fill(0));
    g.events.forEach(e=>{ const k = Math.floor((e.relSec-rt.base)/rt.step); if(k>=0 && k<n) m[rowOf.get(e.session)][k]++; });
    return m;
  }
  renderHeatmapGroups(container, groups, ()=>sessions.map(s=>tr('Session {n}',{n:s})), buildMatrix, cols, cellMode);
}

//- CYCLES CHALEUR/POINTS/BÂTONS (NTP) -----------------------------------------------------------//
// Grille jour de semaine × tranche horaire (largeur de tranche : state.cyclesGranularity).
// Les périodes et jours masqués sont exclus des axes (cyclesHourAxis / cyclesWeekAxis).
function renderWeekdayHourHeatmap(container, filtered, cellMode){
  if(filtered.length===0){ emptyState(container,tr('Aucune donnée pour ces réglages.')); return; }
  const groups = buildHeatmapGroups(filtered);
  if(groups.length===0){ emptyState(container,tr('Aucune option sélectionnée.')); return; }
  const gran = state.cyclesGranularity;
  const bucketMin = GRANULARITY_MS[gran]/60000;
  const numBuckets = Math.round(1440/bucketMin);
  function colLabel(idx){
    const startMin = idx*bucketMin;
    const hh = Math.floor(startMin/60), mm = Math.round(startMin%60);
    return bucketMin<60 ? String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0') : String(hh).padStart(2,'0')+'h';
  }
  const ha = cyclesHourAxis(bucketMin), wa = cyclesWeekAxis();
  if(!ha.order.length || !wa.order.length){ emptyState(container,tr('Tout est masqué : rétablis une période ou un jour (pastille « masqués »).')); return; }
  const cols = ha.order.map((i,k)=>({idx:i, label:colLabel(i), gapBefore:ha.gapBefore[k]}));
  ha.blocks.forEach(b=>{ cols[b.from].dayLabel = true; cols[b.from].blockLabel = b.label; cols[b.from].blockShort = b.label.slice(0,3); });
  function buildMatrix(g){
    const matrix = wa.order.map(()=>new Array(numBuckets).fill(0));
    g.events.forEach(e=>{
      const r = wa.order.indexOf(cyclesWeekday(e.absMs)); if(r<0) return;
      const d = new Date(e.absMs);
      matrix[r][Math.floor((d.getHours()*60+d.getMinutes())/bucketMin)]++;
    });
    return matrix;
  }
  const cfgUI = ha.blocks.length ? cyclesCfgItems(ha.blocks) : null;
  const rowCfg = {custom:WEEK_ORDER.some(d=>cycCfgIsCustom('w'+d)), title:tr('Jours de la semaine'), onClick: el=>openCycleDaysEditor(el)};
  renderHeatmapGroups(container, groups, ()=>wa.order.map(d=>tr(WEEKDAY_LABELS[d])), buildMatrix, cols, cellMode, {cfgUI, rowCfg});
}

// Séries de la vue Chronologie (absolu et REL) : une par bouton coché, plus Somme (Σ) et Spam selon les filtres.
// idxOf(e) : indice de tranche d'un événement, ou -1 hors axe. sumEvents : tous boutons confondus (pour Σ).
// isGrouped : barres groupées (la part grise vaut alors le total).
// Renvoie [{key, label, color, values}] ; Σ en tête (clé '__sum__'), Z en queue.
function buildTemporalSeries(n, idxOf, filtered, sumEvents, isSum, asBar, isGrouped, buttonsToPlot){
  const series = buttonsToPlot.map(b=>({key:b, label:labelFor(b), color:BUTTON_COLORS[b], values:new Array(n).fill(0)}));
  filtered.forEach(e=>{
    if(e.isSpam) return;
    const bi = idxOf(e); const s = series.find(s=>s.key===e.bouton);
    if(s && bi>=0) s.values[bi]++;
  });
  let out = series;
  if(isSum){
    const totalValues = new Array(n).fill(0);
    sumEvents.forEach(e=>{ const bi = idxOf(e); if(bi>=0) totalValues[bi]++; });
    let sumValues;
    if(asBar && !isGrouped){
      // Barres empilées : part grise = non détaillé (total moins boutons cochés).
      sumValues = totalValues.map((tot,bi)=>Math.max(0, tot - series.reduce((a,ser)=>a+ser.values[bi],0)));
    } else sumValues = totalValues;
    out = [{key:'__sum__', label:tr('Somme'), color:'#BEBEBE', values:sumValues}, ...series];
  }
  if(state.filters.spam){
    const spamSeries = {key:'Z', label:tr('Spam'), color:SPAM_COLOR, values:new Array(n).fill(0)};
    filtered.forEach(e=>{ if(e.isSpam){ const bi = idxOf(e); if(bi>=0) spamSeries.values[bi]++; } });
    out.push(spamSeries);
  }
  return out;
}

// Vue Chronologie : familles Temporel (Courbes/Barres) ou Matrice (Chaleur/Points/Bâtons), mode absolu ou
// relatif, mode Somme (Σ).
// Piège Σ : la part grise d'une barre empilée est le reste non détaillé (total moins boutons cochés), pas
// le total ; la hauteur reste constante quels que soient les boutons cochés.
// Étapes : 1) données et cas vides ; 2) famille Matrice → bandes ; 3) mode NTP (axe réglé, fenêtres bout
// à bout) ; 4) mode REL (sessions bout à bout, collées ou non).
function renderTemporalView(container){
  const isSum = state.tempoMode==='sum';
  const filtered = getFilteredEvents();
  const sumEvents = isSum ? getAllButtonEventsForSum() : null;
  const hasAnyData = isSum ? (sumEvents.length>0 || filtered.length>0) : filtered.length>0;
  if(!hasAnyData){ emptyState(container,tr('Aucune donnée pour ces réglages.')); return; }

  if(CHART_FAMILY_OF[state.chartType.temporal]==='matrix'){
    if(!state.hasAnyAbsolute){ renderRelTemporalStrip(container, filtered, matrixCellMode(state.chartType.temporal)); return; }
    renderTemporalStrip(container, filtered.filter(e=>e.absMs!=null), matrixCellMode(state.chartType.temporal));
    return;
  }

  const buttonsToPlot = state.activeButtons.filter(b=>state.filters.buttons.has(b));
  const asBar = state.chartType.temporal==='bar';

  if(state.hasAnyAbsolute){
    const withAbsFiltered = filtered.filter(e=>e.absMs!=null);
    const withAbsSum = isSum ? sumEvents.filter(e=>e.absMs!=null) : [];
    if(withAbsFiltered.length===0 && withAbsSum.length===0){ emptyState(container,tr('Aucune donnée pour ces réglages.')); return; }
    // L'axe suit les bornes réglées (dates + heures), pas l'étendue des votes.
    const tl = buildTimeline(state.granularity);
    const problem = timelineProblem(tl);
    if(problem){ emptyState(container, problem); return; }
    // Séries (boutons, Σ, Z), cumul, moyennes par tranche (tous boutons), lignes de moyenne.
    const buckets = tl.buckets, idx = tl.locate;
    const axisOpts = {gapBefore:tl.gapBefore, dayBlocks: tl.blocks.length>1 ? tl.blocks : null, cfgUI: blockCfgItems('day', tl.days.map(d=>({key:d.key, from:d.from, to:d.to})))};
    const isGrouped = asBar && state.tempoShape==='alt';
    const series = buildTemporalSeries(buckets.length, e=>idx(e.absMs), withAbsFiltered, withAbsSum, isSum, asBar, isGrouped, buttonsToPlot);
    const isCumulative = state.tempoCumulative;
    const isArea = !asBar && state.tempoShape==='alt';
    const finalSeries = isCumulative?cumulativeTransform(series):series;
    // Moyennes : tous les boutons (période appliquée, cases de boutons ignorées), même découpage.
    const means = meansPerBucket(getAllEventsInPeriod().filter(e=>e.absMs!=null), e=>idx(e.absMs), buckets.length);
    setViewAvg(means, tr('par tranche de {g}',{g:GRANULARITY_LIST.find(g=>g.v===state.granularity).l}));
    const avgLines = buildAvgLines(means, buckets.length, isCumulative);
    // Dessin : barres groupées, barres empilées, sinon courbes (ou aires).
    const wrap = document.createElement('div'); wrap.className='chart-wrap';
    container.appendChild(wrap);
    if(isGrouped) renderGroupedBar(wrap, buckets, finalSeries, ms=>bucketLabelAbs(ms, state.granularity), Object.assign({avgLines}, axisOpts));
    else if(asBar) renderStackedBar(wrap, buckets, finalSeries, ms=>bucketLabelAbs(ms, state.granularity), Object.assign({avgLines}, axisOpts));
    else renderLineChart(wrap, finalSeries, buckets, ms=>bucketLabelAbs(ms, state.granularity), Object.assign({area:isArea, avgLines}, axisOpts));
  } else {
    // Mode REL : pas d'horloge, seulement le temps écoulé depuis le début de chaque session.
    const baseWithRel = (isSum ? sumEvents : filtered).filter(e=>e.relSec!=null);
    if(baseWithRel.length===0){ emptyState(container,tr('Aucune donnée pour ces réglages.')); return; }
    {
      const sessions = relSessions(true);
      // Même moteur que le mode absolu : les sessions jouent le rôle des jours.
      const rc = buildRelConcat(sessions);
      if(rc.tooMany){ emptyState(container, timelineProblem({tooMany:true, buckets:[1]})); return; }
      const {xValues, gapBefore, blocks, idxOf} = rc;
      const isGrouped = asBar && state.tempoShape==='alt';
      const relFiltered = filtered.filter(e=>e.relSec!=null);
      const relSum = isSum ? sumEvents.filter(e=>e.relSec!=null) : [];
      const series = buildTemporalSeries(xValues.length, idxOf, relFiltered, relSum, isSum, asBar, isGrouped, buttonsToPlot);
      const isCumulative = state.tempoCumulative;
      const isArea = !asBar && state.tempoShape==='alt';
      const finalSeries = isCumulative?cumulativeTransform(series):series;
      const means = meansPerBucket(getAllEventsInPeriod().filter(e=>e.relSec!=null), idxOf, xValues.length);
      setViewAvg(means, tr('par tranche de {g}',{g:GRANULARITY_LIST.find(g=>g.v===state.granularity).l}));
      const avgLines = buildAvgLines(means, xValues.length, isCumulative);
      const axisOpts = {gapBefore, dayBlocks: blocks.length>1 || rc.joins.length ? blocks : null, avgLines, joins:rc.joins, boundaries: sessions.length>1 ? rc.boundaries : null, cfgUI: blockCfgItems('sess', rc.spans)};
          const wrap = document.createElement('div'); wrap.className='chart-wrap';
      container.appendChild(wrap);
      if(isGrouped) renderGroupedBar(wrap, xValues, finalSeries, relLabel, axisOpts);
      else if(asBar) renderStackedBar(wrap, xValues, finalSeries, relLabel, axisOpts);
      else renderLineChart(wrap, finalSeries, xValues, relLabel, Object.assign({area:isArea}, axisOpts));
    }
  }
}

// Cycles en mode REL (pas d'horloge, seulement des sessions allumage → extinction) : sessions superposées
// sur un axe « temps écoulé depuis le début de session » (équivalent de l'heure du jour en mode absolu).
// Famille Matrice → renderRelCyclesMatrix. Ajoute une note « n session(s) superposée(s) » sous le graphique.
function renderRelCyclesView(container){
  if(CHART_FAMILY_OF[state.chartType.cycles]==='matrix'){ renderRelCyclesMatrix(container, getFilteredEvents(), matrixCellMode(state.chartType.cycles)); return; }
  const filtered = getFilteredEvents().filter(e=>e.relSec!=null);
  if(filtered.length===0){ emptyState(container,tr('Aucune donnée pour ces réglages.')); return; }
  const maxRel = Math.max(0, ...state.events.filter(e=>e.relSec!=null).map(e=>e.relSec));
  const rt = buildRelTimeline(maxRel, state.granularity);
  const problem = timelineProblem(rt);
  if(problem){ emptyState(container, problem); return; }
  const n = rt.buckets.length;
  const idxOf = e=>{ const k = Math.floor((e.relSec-rt.base)/rt.step); return (k<0 || k>=n) ? -1 : k; };
  const buttonsToPlot = state.activeButtons.filter(b=>state.filters.buttons.has(b));
  const series = buttonsToPlot.map(b=>({key:b,label:labelFor(b),color:BUTTON_COLORS[b],values:new Array(n).fill(0)}));
  if(state.filters.spam) series.push({key:'Z',label:tr('Spam'),color:SPAM_COLOR,values:new Array(n).fill(0)});
  filtered.forEach(e=>{
    const k = idxOf(e); if(k<0) return;
    const s = series.find(s=>s.key===(e.isSpam?'Z':e.bouton));
    if(s) s.values[k]++;
  });
  const means = meansPerBucket(getAllEventsInPeriod().filter(e=>e.relSec!=null), idxOf, n);
  setViewAvg(means, tr('par tranche de {g}',{g:GRANULARITY_LIST.find(g=>g.v===state.granularity).l}));
  const isCum = state.cyclesCumulative, asBarC = state.chartType.cycles==='bar';
  const avgLines = buildAvgLines(means, n, isCum);
  const plotSeries = isCum ? cumulativeTransform(series) : series;
  const labelFn = i=>relLabel(rt.buckets[i]);
  const cats = Array.from({length:n},(_,i)=>i);
  const wrap = document.createElement('div'); wrap.className='chart-wrap';
  container.appendChild(wrap);
  if(!asBarC) renderLineChart(wrap, plotSeries.map(s=>({label:s.label,color:s.color,values:s.values})), cats, labelFn, {area:state.cyclesShape==='alt', avgLines});
  else if(state.cyclesShape==='alt') renderGroupedBar(wrap, cats, plotSeries, labelFn, {avgLines});
  else renderStackedBar(wrap, cats, plotSeries, labelFn, {markPeak:!isCum, avgLines});
  const nSess = new Set(filtered.map(e=>e.session)).size;
  const note = document.createElement('p'); note.className='note';
  note.textContent = tr(nSess>1 ? '{n} sessions superposées.' : '{n} session superposée.', {n:nSess});
  container.appendChild(note);
}

// Vue Cycles : répartition par heure du jour ou jour de semaine (motifs récurrents, indépendants de la date),
// ou grille Chaleur/Points/Bâtons combinant les deux.
// Sans horodatage NTP : bascule sur la version REL, ou message d'absence.
// Étapes : séries vides par bouton (+ Z), remplissage selon cyclesMode, moyennes (tranches affichées), dessin.
function renderCyclesView(container){
  if(!state.hasAnyAbsolute && state.events.some(e=>e.relSec!=null)) return renderRelCyclesView(container);
  if(!state.hasAnyAbsolute){ emptyState(container,tr('Cycles demande des horodatages : ce fichier n\'en contient pas.')); return; }
  const filtered = getFilteredEvents().filter(e=>e.absMs!=null);
  if(filtered.length===0){ emptyState(container,tr('Aucune donnée pour ces réglages.')); return; }

  if(CHART_FAMILY_OF[state.chartType.cycles]==='matrix'){
    renderWeekdayHourHeatmap(container, filtered, matrixCellMode(state.chartType.cycles));
    return;
  }

  const buttonsToPlot = state.activeButtons.filter(b=>state.filters.buttons.has(b));
  const series = buttonsToPlot.map(b=>({key:b,label:labelFor(b),color:BUTTON_COLORS[b],values:null}));
  if(state.filters.spam) series.push({key:'Z',label:tr('Spam'),color:SPAM_COLOR,values:null});

  let categories, catLabelFn, opts;
  if(state.cyclesMode==='hour'){
    const bucketMin = GRANULARITY_MS[state.cyclesGranularity]/60000;
    const numBuckets = Math.round(1440/bucketMin);
    const ha = cyclesHourAxis(bucketMin);
    categories = ha.order.slice();
    catLabelFn = i=>{
      const startMin = i*bucketMin;
      const hh = Math.floor(startMin/60), mm = Math.round(startMin%60);
      return bucketMin<60 ? String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0') : String(hh).padStart(2,'0')+'h';
    };
    series.forEach(s=>{ s.values = new Array(numBuckets).fill(0); });
    filtered.forEach(e=>{
      const d = new Date(e.absMs);
      const bi = Math.floor((d.getHours()*60+d.getMinutes())/bucketMin);
      const s = series.find(s=>s.key===(e.isSpam?'Z':e.bouton));
      if(s) s.values[bi]++;
    });
    series.forEach(s=>{ const full = s.values; s.values = categories.map(c=>full[c]); });   // dans l'ordre de l'axe
    // Périodes : une étiquette par suite de tranches (raccourcie ou omise si la place manque, le ☰ reste).
    const periodBands = ha.blocks.length ? ha.blocks.map(b=>({fromIdx:b.from, toIdx:b.to+1, label:b.label})) : null;
    opts = { markPeak:true, periodBands, gapBefore:ha.gapBefore, cfgUI: ha.blocks.length ? cyclesCfgItems(ha.blocks) : null };
  } else {
    const wa = cyclesWeekAxis();
    categories = wa.order.slice();
    catLabelFn = d=>tr(WEEKDAY_LABELS[d]);
    series.forEach(s=>{ s.values = new Array(7).fill(0); });
    filtered.forEach(e=>{
      const d = cyclesWeekday(e.absMs);
      const s = series.find(s=>s.key===(e.isSpam?'Z':e.bouton));
      if(s) s.values[d]++;
    });
    series.forEach(s=>{ const full = s.values; s.values = categories.map(d=>full[d]); });
    opts = { markPeak:true, gapBefore:wa.gapBefore,
      weekendIndices: categories.map((d,k)=>(d===0||d===6)?k:-1).filter(k=>k>=0),
      cfgUI: cyclesCfgItems(categories.map((d,k)=>({key:'w'+d, from:k, to:k}))) };
  }
  // Moyennes par tranche (heure ou jour de semaine), tous boutons, période appliquée.
  const allAbs = getAllEventsInPeriod().filter(e=>e.absMs!=null);
  // Calculées sur les tranches affichées (hors périodes et jours masqués).
  if(!categories.length){ emptyState(container,tr('Tout est masqué : rétablis une période ou un jour (pastille « masqués »).')); return; }
  const keepIdx = new Map(categories.map((c,k)=>[c,k]));
  const compact = c => { const k = keepIdx.get(c); return k===undefined ? -1 : k; };
  let means;
  if(state.cyclesMode==='hour'){
    const bucketMin = GRANULARITY_MS[state.cyclesGranularity]/60000;
    means = meansPerBucket(allAbs, e=>{ const d=new Date(e.absMs); return compact(Math.floor((d.getHours()*60+d.getMinutes())/bucketMin)); }, keepIdx.size);
    setViewAvg(means, tr('par tranche de {g}',{g:GRANULARITY_LIST.find(g=>g.v===state.cyclesGranularity).l}));
  } else {
    means = meansPerBucket(allAbs, e=>compact(cyclesWeekday(e.absMs)), keepIdx.size);
    setViewAvg(means, tr('par jour de semaine'));
  }
  const isCum = state.cyclesCumulative, asBarC = state.chartType.cycles==='bar';
  const isGroupedC = asBarC && state.cyclesShape==='alt', isAreaC = !asBarC && state.cyclesShape==='alt';
  opts.avgLines = buildAvgLines(means, categories.length, isCum);
  if(isCum) opts.markPeak = false;        // le pic d'un cumul serait toujours la dernière tranche
  const plotSeries = isCum ? cumulativeTransform(series) : series;
  const wrap = document.createElement('div'); wrap.className='chart-wrap';
  container.appendChild(wrap);
  if(!asBarC){
    const finalSeries = plotSeries.map(s=>({label:s.label, color:s.color, values:s.values}));
    renderLineChart(wrap, finalSeries, categories, c=>catLabelFn(c), Object.assign({}, opts, {area:isAreaC}));
  } else if(isGroupedC){
    renderGroupedBar(wrap, categories, plotSeries, catLabelFn, opts);
  } else {
    renderStackedBar(wrap, categories, plotSeries, catLabelFn, opts);
  }
}

// Vue Séquences : classement par fréquence des séquences de 2 boutons différents ou plus (jamais un appui seul).
// Réglages : state.seqGap (intervalle), seqMaxLen (2 à 6 boutons), seqLines (nombre de lignes), seqOrdered
// (« A + C » regroupe A→C et C→A, « A → C » les distingue).
// Barres horizontales avec le total en note ; les réglages restent accessibles même si le résultat est vide.
function renderSequencesView(container){
  const filtered = getFilteredEvents();
  if(filtered.length===0){ emptyState(container,tr('Aucune donnée pour ces réglages.')); return; }
  const {combos, sizes} = clusterSequences(filtered, {gap:state.seqGap, ordered:state.seqOrdered});
  const maxLen = seqLenEffective();
  const allMulti = Object.keys(combos).filter(key=>sizes[key]>=2);
  const multiEntries = allMulti.filter(key=>sizes[key]<=maxLen)
    .map(key=>[key, combos[key]])
    .sort((a,b)=>(b[1]-a[1]) || a[0].localeCompare(b[0]));
  if(multiEntries.length===0){
    emptyState(container, allMulti.length ? tr('Aucune séquence de cette longueur à cet intervalle.') : tr('Aucune séquence à cet intervalle.'));
    return;
  }
  const totalMulti = multiEntries.reduce((s,[,c])=>s+c,0);

  const info = document.createElement('p'); info.className='note';
  info.textContent = tr('{n} séquence(s) multi-boutons détectée(s) (sur les clics à {s}s ou moins d\'écart).',{n:totalMulti, s:fmtSeconds(state.seqGap)});
  container.appendChild(info);

  const shown = state.seqLines!=null ? multiEntries.slice(0,state.seqLines) : multiEntries;
  const items = shown.map(([key,count])=>({
    label:key, count, pct: count/totalMulti*100, color:'#BEBEBE'
  }));
  // marge gauche de 150 à 260 px selon la longueur des enchaînements (« A → B → C → D → E → F »)
  const leftPad = Math.min(260, Math.max(150, Math.ceil(Math.max(...items.map(i=>i.label.length))*6.6)+20));
  const wrap = document.createElement('div'); wrap.className='chart-wrap';
  container.appendChild(wrap);
  renderHBarChart(wrap, items, {leftPad});
}

//- EXPORT IMAGE ---------------------------------------------------------------------------------//
// Deux exports SVG indépendants, chacun recomposé en un seul SVG autonome (styles de la page incorporés,
// variables CSS résolues, ni réseau ni police externe), téléchargé tel quel :
//  - exportSummary() : le résumé (question, contexte, stats, barres ou anneau)
//  - exportView()    : le graphique de la vue active, pleine largeur, sans texte additionnel (sauf les titres
//    de groupes des matrices)
// Largeur (px) d'une image exportée ; exportView() l'augmente si un graphique défilant est plus large.
const EXPORT_W_DEFAULT = 1200;
// Prépare une image d'export vide (fond + feuille de style de la page) et renvoie la boîte à outils :
//   add(el) ajoute un élément ; wrapLines(texte, police, largeurMax) coupe en lignes mesurées au canvas ;
//   txt(x, y, str, options) crée un <text> (Arial, pour un rendu identique hors du site) ;
//   place(svg, x, y, w) clone un SVG de l'appli à la largeur w et renvoie sa hauteur (null si sans viewBox) ;
//   finish(H, nom) fixe la hauteur finale et lance le téléchargement.
function exportKit(EXPORT_W = EXPORT_W_DEFAULT){
  const NS = 'http://www.w3.org/2000/svg';
  const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const FONT = 'Arial, Helvetica, sans-serif';
  const root = svgEl('svg',{xmlns:NS});
  // CSS de la page (classes axis-label, grid-line… et variables --paper-50…), nécessaire dans l'image autonome.
  const css = Array.from(document.querySelectorAll('style')).filter(st=>!st.closest('svg')).map(st=>st.textContent).join('\n');
  const styleEl = svgEl('style',{}); styleEl.textContent = css; root.appendChild(styleEl);
  const bg = svgEl('rect',{x:0,y:0,width:EXPORT_W,height:10,fill:cssv('--ink-950')}); root.appendChild(bg);
  const measure = document.createElement('canvas').getContext('2d');
  const kit = {
    root, cssv, measure,
    add(el){ root.appendChild(el); return el; },
    wrapLines(text, font, maxW){
      measure.font = font;
      const out = []; let line = '';
      String(text).split(/\s+/).forEach(w=>{
        const t = line ? line+' '+w : w;
        if(line && measure.measureText(t).width > maxW){ out.push(line); line = w; } else line = t;
      });
      if(line) out.push(line);
      return out;
    },
    txt(x,y,str,{size=12,weight=400,fill=cssv('--paper-50'),anchor='start',italic=false}={}){
      const t = svgEl('text',{x,y,'font-family':FONT,'font-size':size,'font-weight':weight,fill,'text-anchor':anchor,'font-style':italic?'italic':'normal'});
      t.textContent = str; return t;
    },
    // Place un SVG cloné à (x,y), largeur w, proportions conservées ; renvoie sa hauteur. data-fullvb (vue
    // entière d'un graphique défilant) prime sur le viewBox.
    place(svg, x, y, w){
      const fullvb = svg.getAttribute('data-fullvb') || svg.getAttribute('viewBox') || '';
      const vb = fullvb.split(/\s+/).map(Number);
      if(vb.length<4 || !vb[2] || !vb[3]) return null;
      const h = vb[3]*w/vb[2];
      const c = svg.cloneNode(true);
      c.setAttribute('viewBox', fullvb); c.removeAttribute('data-fullvb');
      c.setAttribute('x',x); c.setAttribute('y',y); c.setAttribute('width',w); c.setAttribute('height',h);
      c.setAttribute('class','chart');
      c.querySelectorAll('.ui-only').forEach(n=>n.remove());   // éléments d'interface : jamais exportés
      root.appendChild(c);
      return h;
    },
    // Fixe la hauteur finale (le fond était provisoire) et télécharge le SVG.
    finish(H, baseName){
      bg.setAttribute('height',H);
      root.setAttribute('width',EXPORT_W); root.setAttribute('height',H); root.setAttribute('viewBox',`0 0 ${EXPORT_W} ${H}`);
      saveSvgFile(root, baseName);
    },
  };
  return kit;
}
// Sérialise root en .svg et le télécharge (lien temporaire), sans rastérisation : pas de limite de taille.
// Les variables CSS (var(--paper-50)…) sont remplacées par leur valeur (Illustrator, Inkscape ne les gèrent pas).
function saveSvgFile(root, baseName){
  const cssvars = getComputedStyle(document.documentElement);
  let xml = new XMLSerializer().serializeToString(root)
    .replace(/var\((--[\w-]+)\)/g, (m,n)=>cssvars.getPropertyValue(n).trim() || m);
  xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + xml;
  const blob = new Blob([xml], {type:'image/svg+xml;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = baseName+'.svg';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
}
// Nom de fichier sans extension : « sontadeg-<question simplifiée>-<suffixe> » (sans accents, 40 caractères max).
function exportBaseName(suffix){
  const slug = ((state.resume && state.resume.question) || 'export').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40) || 'export';
  return 'sontadeg-'+slug+'-'+suffix;
}

// Export 1, le résumé : question et contexte en pleine largeur, puis stats (1/3 gauche) et résumé barres/anneau
// (2/3 droite). Stats et graphique sont relus depuis le bandeau affiché (#banner-mount) : il doit être rendu.
function exportSummary(){
  const k = exportKit(), W = EXPORT_W_DEFAULT, M = 40;
  const banner = document.getElementById('banner-mount');
  let y = M;
  const q = state.resume && state.resume.question;
  if(q){
    k.wrapLines(q, '700 28px Arial', W-2*M).forEach(line=>{ y += 34; k.add(k.txt(M, y, line, {size:28, weight:700})); });
  }
  const sub = state.resume && state.resume.sousTitre;
  if(sub){
    y += 6;
    k.wrapLines(sub, 'italic 14px Arial', W-2*M).forEach(line=>{ y += 20; k.add(k.txt(M, y, line, {size:14, fill:k.cssv('--paper-70'), italic:true})); });
  }
  y += 34;

  const colW = (W-2*M)/3, gap = 28;
  const rowTop = y;
  // stats (réponses, spam, dates) l'une sous l'autre à gauche
  let sy = rowTop + 6;
  banner.querySelectorAll('.stat-block').forEach(b=>{
    const top = b.querySelector('.top').textContent, bottom = b.querySelector('.bottom').textContent;
    const muted = b.querySelector('.top').classList.contains('muted');
    if(b.classList.contains('date-block')){
      sy += 22; k.add(k.txt(M, sy, top, {size:17, weight:600}));
      sy += 24; k.add(k.txt(M, sy, bottom, {size:17, weight:600}));
    } else {
      sy += 34;
      const vCol = muted ? k.cssv('--paper-90') : k.cssv('--paper-50');
      k.add(k.txt(M, sy, top, {size:30, weight:700, fill:vCol}));
      k.measure.font = '700 30px Arial';
      k.add(k.txt(M + k.measure.measureText(String(top)).width + 10, sy, bottom, {size:15, fill:k.cssv('--paper-70')}));
    }
    sy += 14;
  });
  // résumé barres/anneau à droite (2/3)
  const resSvg = banner.querySelector('.banner-bars svg');
  let resBottom = rowTop;
  if(resSvg){
    const vb = resSvg.getAttribute('viewBox').split(/\s+/).map(Number);
    const availW = W - 2*M - colW - gap;
    const w = Math.min(availW, vb[2]*1.7);               // agrandi pour remplir, sans excès
    const h = k.place(resSvg, W-M-w, rowTop, w) || 0;
    resBottom = rowTop + h;
  }
  y = Math.max(sy, resBottom) + M - 10;
  k.finish(y, exportBaseName('resume'));
}

// Export 2, la vue active (courbes, barres, matrices ou séquences), pleine largeur, sans titre ni menu.
// Sans effet s'il n'y a aucun graphique dans #viz-zone.
function exportView(){
  const zone = document.getElementById('viz-zone');
  const charts = zone ? Array.from(zone.querySelectorAll('svg.chart')) : [];
  if(!charts.length) return;
  const M = 16;
  // Vue entière, pas seulement la partie visible : un graphique défilant garde sa largeur réelle (1 px = 1 px).
  const vbW = svg => (svg.getAttribute('data-fullvb') || svg.getAttribute('viewBox') || '').split(/\s+/).map(Number)[2] || 0;
  const W = Math.max(EXPORT_W_DEFAULT, Math.ceil(Math.max(...charts.map(vbW)) + 2*M));
  const k = exportKit(W);
  let y = M;
  charts.forEach(svg=>{
    const group = svg.closest('.heatmap-group');
    const titleEl = group && group.querySelector('.heatmap-group-title');
    if(titleEl){   // matrices : on garde le nom du groupe (« A — Rock (95) »)
      const sw = titleEl.querySelector('.sw'), cnt = titleEl.querySelector('.count');
      const label = Array.from(titleEl.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();
      y += 14;
      k.add(svgEl('rect',{x:M+6,y:y-9,width:9,height:9,rx:2,fill:(sw && sw.style.background) || k.cssv('--paper-70')}));
      k.add(k.txt(M+21, y, label, {size:14}));
      k.measure.font = '14px Arial';
      if(cnt) k.add(k.txt(M+21+k.measure.measureText(label).width+6, y, cnt.textContent, {size:12, fill:k.cssv('--paper-90')}));
      y += 12;
    }
    const h = k.place(svg, M, y, W-2*M);
    if(h!=null) y += h + (titleEl ? 18 : 0);
  });
  y += M;
  const chartType = state.chartType[state.selectedView];
  const typeName = tr({line:'courbes', bar:'barres', heatmap:'chaleur', dots:'points', baton:'batons'}[chartType]);   // sert au nom du fichier exporté
  const viewName = {temporal:'dans-le-temps', cycles:'cycles', sequences:'sequences'}[state.selectedView] || 'vue';
  k.finish(y, exportBaseName(viewName + (typeName && state.selectedView!=='sequences' ? '-'+typeName : '')));
}

