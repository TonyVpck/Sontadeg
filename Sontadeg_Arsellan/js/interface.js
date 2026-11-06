//------------------------------------------------------------------------------------------------//
// SONTADEG ARSELLAN - INTERFACE : BLOCS, BANDEAU, PANNEAU LATÉRAL, ZOOM, RENDU, DÉMARRAGE        //
//                                                                                                //
// Tout ce que l'utilisateur manipule (bulle d'édition, bandeau, panneau latéral, zooms), le rendu//
// (renderViz, renderLayout, render) et le démarrage de l'application.                            //
// Doit rester le dernier fichier chargé : applyStatic() et render() en dépendent.                //
//------------------------------------------------------------------------------------------------//

"use strict";

//- RÉGLAGES PAR BLOC ----------------------------------------------------------------------------//

// Bulle d'édition ouverte (une seule à la fois) ou null.
// Pas de bouton fermer : clic à côté = enregistre, Échap = annule, Entrée = valide.
let _editor = null;
// Ferme la bulle ouverte et retire ses écouteurs ; si commit, appelle son enregistrement (souvent render()).
function closeBlockEditor(commit){
  if(!_editor) return;
  const ed = _editor; _editor = null;
  document.removeEventListener('pointerdown', ed.onDoc, true);
  document.removeEventListener('keydown', ed.onKey, true);
  document.removeEventListener('scroll', ed.onScroll, true);
  window.removeEventListener('resize', ed.onResize);
  ed.el.remove();
  if(commit && ed.commit) ed.commit();
}
// Crée la bulle vide (.block-editor), unique (ferme la précédente sans enregistrer), et branche sa fermeture :
// clic extérieur, défilement ou redimensionnement = enregistrer, Échap = annuler, Entrée = enregistrer.
// ed.place() la positionne sous l'ancre (au-dessus si la place manque) : à appeler une fois le contenu ajouté.
function openEditorShell(anchor, commit){
  closeBlockEditor(false);
  const el = document.createElement('div'); el.className = 'block-editor';
  document.body.appendChild(el);
  const ed = {el, commit};
  ed.onDoc = ev=>{ if(!el.contains(ev.target)) closeBlockEditor(true); };
  ed.onKey = ev=>{
    if(ev.key==='Escape'){ ev.preventDefault(); closeBlockEditor(false); }
    else if(ev.key==='Enter' && el.contains(ev.target) && ev.target.tagName==='INPUT'){ ev.preventDefault(); closeBlockEditor(true); }
  };
  ed.onScroll = ev=>{ if(!el.contains(ev.target)) closeBlockEditor(true); };
  ed.onResize = ()=>closeBlockEditor(true);
  document.addEventListener('pointerdown', ed.onDoc, true);
  document.addEventListener('keydown', ed.onKey, true);
  document.addEventListener('scroll', ed.onScroll, true);
  window.addEventListener('resize', ed.onResize);
  _editor = ed;
  ed.place = ()=>{
    const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
    let left = Math.min(Math.max(8, r.left + r.width/2 - w/2), window.innerWidth - w - 8);
    let top = r.bottom + 6; if(top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
    el.style.left = left+'px'; el.style.top = top+'px';
  };
  return ed;
}
// Conversions minutes ↔ « HH:MM » (NTP) et secondes ↔ « HH:MM:SS » (REL), au format des <input type="time">.
const fmtHM = m => String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const parseHM = v => { const [h,m] = v.split(':').map(Number); return h*60+m; };
const fmtHMS = sec => String(Math.floor(sec/3600)).padStart(2,'0')+':'+String(Math.floor((sec%3600)/60)).padStart(2,'0')+':'+String(Math.floor(sec%60)).padStart(2,'0');
const parseHMS = v => { const [h,m,s] = v.split(':').map(Number); return h*3600+m*60+(s||0); };
// Borne de fin : 23:59 (max d'un champ time) ou plus devient 1440, fin de journée.
const normHe = he => he>=1439 ? 1440 : he;
// Votes datés du jour calendaire day (clé de dayKeyOf).
function dayEventsOf(day){ return state.events.filter(e=>e.absMs!=null && dayKeyOf(e.absMs)===day); }
// NTP : fenêtre ajustée aux votes d'un jour (1 h de marge de chaque côté), {hs, he} en minutes ; null sans vote.
// Une soirée qui passe minuit donne une fenêtre qui traverse minuit (ex. 19:00 → 03:00).
function fitDayWindow(day){
  const ev = dayEventsOf(day); if(!ev.length) return null;
  const used = new Array(24).fill(false);
  ev.forEach(e=>{ used[new Date(e.absMs).getHours()] = true; });
  return windowAroundHours(used) || {hs:0, he:1440};
}
// REL : fenêtre ajustée aux votes d'une session (marge d'un pas de granularité), {lo, hi} en secondes (0-86399) ; null sans vote.
function fitSessWindow(sess){
  const ev = state.events.filter(e=>e.session===sess && e.relSec!=null); if(!ev.length) return null;
  const step = (GRANULARITY_MS[state.granularity]||GRANULARITY_MS['15min'])/1000;
  return {lo: Math.max(0, Math.min(...ev.map(e=>e.relSec)) - step), hi: Math.min(86399, Math.max(...ev.map(e=>e.relSec)) + step)};
}
// Modifie la config d'un bloc dans map : applique mut sur une copie, retire les champs null/false, supprime
// l'entrée si elle est vide.
function setCfg(map, key, mut){
  const c = Object.assign({}, map.get(key)); mut(c);
  Object.keys(c).forEach(k=>{ if(c[k]==null || c[k]===false) delete c[k]; });
  if(Object.keys(c).length) map.set(key, c); else map.delete(key);
}
// Bulle d'un bloc : kind = 'day' (NTP, key = clé de jour, HH:MM) ou 'sess' (REL, key = n° de session, HH:MM:SS).
// Une borne égale à la valeur globale est effacée à l'enregistrement : le bloc suit alors la fenêtre commune.
function openBlockEditor(kind, key, anchor){
  const ntp = kind==='day';
  const map = ntp ? state.dayCfg : state.sessCfg;
  const g = hourWindow();
  const sessMax = ntp ? 0 : Math.max(0, ...state.events.filter(e=>e.session===key && e.relSec!=null).map(e=>e.relSec));
  const gLo = state.filters.relStart!=null ? state.filters.relStart : 0, gHi = state.filters.relEnd!=null ? state.filters.relEnd : sessMax;
  const c0 = map.get(key) || {};
  const cur = ntp ? windowForDay(key) : {hs: c0.lo!=null ? c0.lo : gLo, he: c0.hi!=null ? c0.hi : gHi};
  // Enregistrement : a et b (champs d'heure) sont déclarés plus bas mais n'existent qu'à l'appel.
  const ed = openEditorShell(anchor, ()=>{
    setCfg(map, key, c=>{
      if(ntp){
        const hs = a.value ? parseHM(a.value) : null, he = b.value ? normHe(parseHM(b.value)) : null;
        c.hs = (hs!=null && hs!==g.hs) ? hs : null;
        c.he = (he!=null && he!==normHe(g.he)) ? he : null;
      } else {
        const lo = a.value ? parseHMS(a.value) : null, hi = b.value ? parseHMS(b.value) : null;
        c.lo = (lo!=null && lo!==gLo) ? lo : null;
        c.hi = (hi!=null && hi!==gHi) ? hi : null;
      }
    });
    render();
  });
  const title = document.createElement('div'); title.className='be-title'; title.textContent = blockTitle(kind, key);
  const row = document.createElement('div'); row.className='be-row';
  const a = document.createElement('input'), b = document.createElement('input');
  a.type = b.type = 'time'; if(!ntp){ a.step = b.step = '1'; }
  a.value = ntp ? fmtHM(cur.hs) : fmtHMS(cur.hs);
  b.value = ntp ? fmtHM(Math.min(1439, cur.he)) : fmtHMS(cur.he);
  const arrow = document.createElement('span'); arrow.textContent = '→';
  row.appendChild(a); row.appendChild(arrow); row.appendChild(b);
  const links = document.createElement('div'); links.className='be-links';
  const fit = document.createElement('a'); fit.textContent = tr('ajuster aux votes');
  const hide = document.createElement('a'); hide.textContent = tr('masquer');
  let fitVals = null;
  if(ntp){ const w = fitDayWindow(key); if(w) fitVals = {a:fmtHM(w.hs), b:fmtHM(Math.min(1439,w.he))}; }
  else {
    const w = fitSessWindow(key);
    if(w) fitVals = {a:fmtHMS(w.lo), b:fmtHMS(w.hi)};
  }
  if(!fitVals) fit.className='disabled';   // aucun vote : rien à ajuster
  // « ajuster » est une bascule : le second clic revient aux valeurs d'avant (ou à la fenêtre globale).
  const globalVals = ntp ? {a:fmtHM(g.hs), b:fmtHM(Math.min(1439,g.he))} : {a:fmtHMS(gLo), b:fmtHMS(gHi)};
  let before = null;
  const isFit = ()=>!!fitVals && a.value===fitVals.a && b.value===fitVals.b;
  const syncFit = ()=>fit.classList.toggle('active', isFit());
  fit.addEventListener('click', ()=>{
    if(!fitVals) return;
    if(isFit()){ const r = before || globalVals; a.value = r.a; b.value = r.b; before = null; }
    else { before = {a:a.value, b:b.value}; a.value = fitVals.a; b.value = fitVals.b; }
    syncFit();
  });
  a.addEventListener('input', syncFit); b.addEventListener('input', syncFit);
  hide.addEventListener('click', ()=>{
    _editor.commit = null;   // masquer prime sur la saisie en cours : pas d'enregistrement
    setCfg(map, key, c=>{ c.hidden = true; });
    closeBlockEditor(false); render();
  });
  links.appendChild(fit); links.appendChild(hide);
  ed.el.appendChild(title); ed.el.appendChild(row); ed.el.appendChild(links);
  syncFit(); ed.place(); a.focus();
}
// Blocs masqués
function hiddenBlocks(){
  const out = [];
  state.dayCfg.forEach((c,k)=>{ if(c.hidden) out.push({kind:'day', key:k}); });
  state.sessCfg.forEach((c,k)=>{ if(c.hidden) out.push({kind:'sess', key:k}); });
  return out.sort((x,y)=>x.key-y.key);
}
// Bulle « Masqués » : un bloc par ligne, avec un lien « rétablir » (ferme la bulle et relance render()).
function openHiddenList(anchor){
  const ed = openEditorShell(anchor, null);
  const title = document.createElement('div'); title.className='be-title'; title.textContent = tr('Masqués');
  ed.el.appendChild(title);
  hiddenBlocks().forEach(h=>{
    const row = document.createElement('div'); row.className='be-item';
    const t = document.createElement('span'); t.textContent = blockTitle(h.kind, h.key);
    const a = document.createElement('a'); a.textContent = tr('rétablir');
    a.addEventListener('click', ()=>{
      setCfg(h.kind==='day' ? state.dayCfg : state.sessCfg, h.key, c=>{ c.hidden = null; });
      closeBlockEditor(false); render();
    });
    row.appendChild(t); row.appendChild(a); ed.el.appendChild(row);
  });
  ed.place();
}
// Vrai s'il y a un réglage de bloc à réinitialiser (bornes, masquage ou session collée).
function anyBlockCfg(){ return state.dayCfg.size>0 || state.sessCfg.size>0 || state.relGlue.size>0; }
// Masque tous les jours (NTP) ou sessions (REL) ayant des votes ; les bornes déjà réglées sont conservées.
function hideAllBlocks(){
  if(state.hasAnyAbsolute){
    new Set(state.events.filter(e=>e.absMs!=null).map(e=>dayKeyOf(e.absMs))).forEach(d=>setCfg(state.dayCfg, d, c=>{ c.hidden = true; }));
  } else {
    relSessions(false).forEach(x=>setCfg(state.sessCfg, x, c=>{ c.hidden = true; }));
  }
  closeBlockEditor(false); render();
}
// REL : ajuste chaque session visible à ses votes ; les sessions masquées sont ignorées.
function adjustAllSessions(){
  relSessions(true).forEach(x=>{
    const w = fitSessWindow(x); if(!w) return;
    const gLo = state.filters.relStart!=null ? state.filters.relStart : 0;
    const sessMax = Math.max(0, ...state.events.filter(e=>e.session===x && e.relSec!=null).map(e=>e.relSec));
    const gHi = state.filters.relEnd!=null ? state.filters.relEnd : sessMax;
    setCfg(state.sessCfg, x, c=>{ c.lo = w.lo!==gLo ? w.lo : null; c.hi = w.hi!==gHi ? w.hi : null; });
  });
  closeBlockEditor(false); render();
}
// Efface tous les réglages de bloc : bornes, masquages et sessions collées.
function resetBlockCfg(){ state.dayCfg = new Map(); state.sessCfg = new Map(); state.relGlue = new Set(); closeBlockEditor(false); render(); }
// NTP : ajuste chaque jour visible à son premier et son dernier vote, ±1 h ; les jours masqués sont ignorés.
function adjustAllDays(){
  const bd = dayBounds(); if(!bd) return;
  const g = hourWindow();
  for(let d=bd.first, k=0; d<=bd.last && k<4000; d=addDays(d,1), k++){
    if(state.dayCfg.get(d) && state.dayCfg.get(d).hidden) continue;
    const w = fitDayWindow(d); if(!w) continue;
    setCfg(state.dayCfg, d, c=>{ c.hs = w.hs!==g.hs ? w.hs : null; c.he = normHe(w.he)!==normHe(g.he) ? w.he : null; });
  }
  closeBlockEditor(false); render();
}
// Boutons de la Chronologie, ajoutés à tools (à gauche de l'export) : pastille des masqués, tout ajuster,
// tout masquer, tout coller (REL, si plusieurs sessions visibles) et réinitialiser.
// Libellés et actions selon le mode NTP (jours) ou REL (sessions).
function buildTemporalTools(tools){
  // Crée un bouton-icône, l'ajoute à tools et le renvoie ; onClick reçoit le bouton.
  const mk = (svg, title, onClick, disabled)=>{
    const b = document.createElement('button'); b.className='view-mode-toggle'; b.title = title; b.setAttribute('aria-label', title);
    b.innerHTML = svg; b.disabled = !!disabled; b.addEventListener('click', ()=>onClick(b)); tools.appendChild(b); return b;
  };
  const hidden = hiddenBlocks();
  if(hidden.length){
    const chip = document.createElement('button'); chip.className='viz-chip';
    chip.textContent = tr(hidden.length>1 ? '{n} masqués' : '{n} masqué', {n:hidden.length}); chip.title = tr('Voir et rétablir les jours / sessions masqués');
    chip.addEventListener('click', ()=>openHiddenList(chip)); tools.appendChild(chip);
  }
  const ntp = state.hasAnyAbsolute;
  const nVisible = ntp ? null : relSessions(true).length;
  mk(ICON_ADJUST_SVG, ntp ? tr('Ajuster tous les jours à leurs votes (1 h avant, 1 h après)') : tr('Ajuster toutes les sessions à leurs votes'), ()=>ntp ? adjustAllDays() : adjustAllSessions());
  mk(ICON_HIDE_SVG, ntp ? tr('Masquer tous les jours') : tr('Masquer toutes les sessions'), ()=>hideAllBlocks(), ntp ? false : nVisible===0);
  if(!ntp && nVisible>1) mk(ICON_GLUE_SVG, tr('Coller toutes les sessions'), ()=>setAllGlue(true));
  mk(ICON_RESET_SVG, tr('Réinitialiser (bornes par jour ou session, masquages, sessions collées)'), ()=>resetBlockCfg(), !anyBlockCfg());
}

//- BANDEAU DU HAUT ------------------------------------------------------------------------------//
// Bandeau #banner-mount : logo, question et sous-titre, chiffres clés, résumé des votes (barres ou anneau) et icônes d'actions.

// Reconstruit tout le bandeau. Sans résumé : écran d'accueil (logo, invite, bouton de chargement du CSV, erreur persistante) ; sinon bandeau complet.
function renderBanner(){
  const mount = document.getElementById('banner-mount');
  mount.innerHTML='';

  //- CAS 1 : AUCUN RÉSUMÉ CHARGÉ → ÉCRAN D'ACCUEIL ----------------------------------------------//
  if(!state.resume){
    mount.className = 'banner empty-banner';
    const logoWrap = document.createElement('div'); logoWrap.className='welcome-logo';
    logoWrap.innerHTML = LOGO_SVG;
    mount.appendChild(logoWrap);
    const msg = document.createElement('p'); msg.className='empty-banner-msg';
    msg.textContent = tr('Charge le résumé au format CSV exporté depuis la borne Sontadeg.');
    mount.appendChild(msg);
    const btn = document.createElement('label'); btn.className='file-btn icon-only'; btn.title=tr('Charger le résumé');
    btn.innerHTML = `<span class="btn-icon">${ICON_RESUME_SVG}</span><input type="file" accept=".csv">`;
    const err = document.createElement('p'); err.className='inline-error'; err.textContent = state.resumeError || '';   // survit à un nouveau rendu (ex. chargement du journal)
    btn.querySelector('input').addEventListener('change', e=>{
      const f = e.target.files[0]; if(!f) return;
      loadResumeFile(f, msg2=>{ err.textContent=msg2; mount.appendChild(err); });
    });
    mount.appendChild(btn);
    mount.appendChild(err);
    mount.appendChild(langPicker());
    return;
  }

  //- CAS 2 : BANDEAU COMPLET ----------------------------------------------------------------------//
  // Ligne du haut : logo, chiffres clés, icônes.
  mount.className = 'banner';
  const top = document.createElement('div'); top.className='banner-top';
  const brand = document.createElement('div'); brand.className='banner-brand';
  brand.innerHTML = `<span class="brand-logo">${LOGO_SVG}</span>`;
  top.appendChild(brand);

  const row = document.createElement('div'); row.className='banner-stats-row';
  top.appendChild(row);
  mount.appendChild(top);

  // Chiffres clés : réponses, Z (spam, si > 0), puis dates (NTP), sessions (REL) ou « journal non chargé ».
  const {counts, spam, total} = computeOverview();
  // Ajoute un bloc de stat (valeur, légende dessous) à la rangée ; muted = grisé.
  function addBlock(topTxt, bottomTxt, muted){
    const b = document.createElement('div'); b.className='stat-block';
    const t = document.createElement('div'); t.className='top'+(muted?' muted':''); t.textContent=topTxt;
    const bo = document.createElement('div'); bo.className='bottom'; bo.textContent=bottomTxt;
    b.appendChild(t); b.appendChild(bo);
    row.appendChild(b);
    return b;
  }
  addBlock(total, tr('réponses'));
  if(spam>0) addBlock(spam, 'spam', true);
  if(state.ignoredLines>0){   // lignes du journal illisibles, non comptées : avertissement discret
    const w = addBlock('\u26A0\uFE0E '+state.ignoredLines, state.ignoredLines===1 ? tr('ligne ignorée') : tr('lignes ignorées'));
    w.classList.add('warn-block');
    w.title = tr('Lignes du journal incomplètes ou illisibles (temps, session ou bouton manquant) : elles n\'ont pas été prises en compte.');
  }

  if(state.hasAnyAbsolute){
    const {min,max} = dateRangeOfDataset();
    if(min && max){
      const b = document.createElement('div'); b.className='stat-block date-block';
      const t = document.createElement('div'); t.className='top'; t.textContent = tr('du {d}',{d:fmtDate(min)});
      const bo = document.createElement('div'); bo.className='bottom'; bo.textContent = tr('au {d}',{d:fmtDate(max)});
      b.appendChild(t); b.appendChild(bo);
      const nowY = new Date().getFullYear(), y0 = new Date(min).getFullYear(), y1 = new Date(max).getFullYear();
      if(y0<2024 || y1>nowY+1){   // horloge de la borne sans doute non réglée (1970…) ou horodatages en millisecondes
        b.classList.add('date-warn');
        b.title = tr('Dates invraisemblables ({y}) : l\'horloge de la borne était peut-être à l\'heure de départ, ou le fichier est inhabituel. Les jours de semaine et les dates affichés peuvent être faux.',{y:y0+(y1!==y0?' → '+y1:'')});
        const withY = (ms,y)=>{ const f = fmtDate(ms), i = f.indexOf(' '); return i<0 ? f+'/'+y : f.slice(0,i)+'/'+y+f.slice(i); };
        t.textContent = '\u26A0\uFE0E '+tr('du {d}',{d:withY(min,y0)}); bo.textContent = tr('au {d}',{d:withY(max,y1)});
      }
      row.appendChild(b);
    }
  } else if(state.events.length){
    addBlock(sessionCount(), tr('session(s) · mode relatif'));
  } else {
    const b = document.createElement('div'); b.className='stat-block';
    const t = document.createElement('div'); t.className='top muted'; t.textContent = '—';
    const bo = document.createElement('div'); bo.className='bottom'; bo.textContent = tr('journal non chargé');
    b.appendChild(t); b.appendChild(bo);
    row.appendChild(b);
  }

  // Icônes : langue, résumé en barres / anneau, Séquences (si présentes), export.
  const iconGroup = document.createElement('div'); iconGroup.className='banner-icon-group';
  iconGroup.appendChild(langPicker());

  const barsBtn = document.createElement('button');
  barsBtn.className = 'view-mode-toggle' + (state.bannerResultMode==='bars' ? ' active' : '');
  barsBtn.title = tr('Résumé en barres');
  barsBtn.innerHTML = ICON_BARS_SVG;
  barsBtn.addEventListener('click', ()=>{ state.bannerResultMode='bars'; render(); });
  iconGroup.appendChild(barsBtn);

  const ringBtn = document.createElement('button');
  ringBtn.className = 'view-mode-toggle' + (state.bannerResultMode==='ring' ? ' active' : '');
  ringBtn.title = tr('Résumé en anneau');
  ringBtn.innerHTML = ICON_RING_SVG;
  ringBtn.addEventListener('click', ()=>{ state.bannerResultMode='ring'; render(); });
  iconGroup.appendChild(ringBtn);

  // Bascule Séquences ↔ Chronologie (bouton présent seulement si le journal a des séquences).
  if(state.hasAnySequences){
  const seqBtn = document.createElement('button');
    seqBtn.className = 'view-mode-toggle' + (state.selectedView==='sequences' ? ' active' : '');
    seqBtn.title = tr('Séquences');
    seqBtn.innerHTML = ICON_SEQ_SVG;
    seqBtn.addEventListener('click', ()=>{
      state.selectedView = state.selectedView==='sequences' ? 'temporal' : 'sequences';
      render();
    });
    iconGroup.appendChild(seqBtn);
  }

  // Export du résumé
  const expBtn = document.createElement('button');
  expBtn.className = 'view-mode-toggle';
  expBtn.title = tr('Exporter le résumé en SVG');
  expBtn.setAttribute('aria-label',tr('Exporter le résumé en SVG'));
  expBtn.innerHTML = ICON_EXPORT_SVG;
  expBtn.addEventListener('click', exportSummary);
  iconGroup.appendChild(expBtn);

  top.appendChild(iconGroup);

  // Ligne du bas : question et sous-titre à gauche, résultats (barres ou anneau) à droite.
  const results = document.createElement('div'); results.className='banner-results';
  const leftCol = document.createElement('div'); leftCol.className='banner-left-col';
  const qEl = document.createElement('div'); qEl.className='banner-question';
  qEl.textContent = state.resume.question || '';
  qEl.style.display = state.resume.question ? 'block' : 'none';
  leftCol.appendChild(qEl);

  const subtitle = state.resume && state.resume.sousTitre;
  if(subtitle){
    const st = document.createElement('div'); st.className='banner-subtitle'; st.textContent=subtitle; st.title=subtitle;
    leftCol.appendChild(st);
  }
  results.appendChild(leftCol);

  const barsEl = document.createElement('div'); barsEl.className='banner-bars';
  // Un élément par bouton actif, du plus voté au moins voté ; pct = part du total des réponses.
  const items = state.activeButtons
    .map(b=>({label:state.optionLabels[b]||b, count:counts[b], pct: total>0? counts[b]/total*100:0, color:BUTTON_COLORS[b], letter:b, letterColor:BUTTON_COLORS[b]}))
    .sort((a,b)=>b.count-a.count);
  const wrap = document.createElement('div'); wrap.className='chart-wrap';
  barsEl.appendChild(wrap);
  results.appendChild(barsEl);
  mount.appendChild(results);
  // Tracé après insertion dans la page : la largeur réelle n'est connue qu'alors (sinon graphique trop étroit).
  if(state.bannerResultMode==='ring') renderDonut(wrap, items);
  else renderHBarChart(wrap, items, {leftPad:190, rowH:19, gap:6, fontSize:12, rightPad:110, autoPad:true});
}

//- PANNEAU LATÉRAL ------------------------------------------------------------------------------//
// Barre latérale : touches A–F, Z (spam) et Σ (somme), touches « moyennes », puis contrôles Affichage,
// Fenêtre temporelle et Vues. Tout est reconstruit à chaque render() depuis state.
// Les libellés passent par tr() : ne pas les modifier à la légère.

// Rangée de touches A–F (boutons actifs), Z (spam) et Σ (somme) : chacune affiche son compteur, un clic bascule son filtre.
// Σ bascule le mode Somme (state.tempoMode, voir renderTemporalView) et réinitialise les filtres ; elle n'apparaît que s'il y a des événements.
function renderKeycaps(){
  const {counts, spam} = computeOverview();   // compteurs affichés sur les touches
  const wrap = document.getElementById('keycaps');
  wrap.innerHTML='';
  // Une touche par bouton A–F présent
  state.activeButtons.forEach(b=>{
    const cap = document.createElement('button');
    const on = state.filters.buttons.has(b);
    cap.className = 'keycap' + (on?' on':'');
    cap.style.background = on ? BUTTON_COLORS[b] : '';
    cap.style.borderColor = on ? BUTTON_COLORS[b] : '';
    cap.innerHTML = `${b}<span class="count-tag">${counts[b]}</span>`;
    cap.title = labelFor(b);
    cap.addEventListener('click', ()=>{
      if(state.filters.buttons.has(b)) state.filters.buttons.delete(b);
      else state.filters.buttons.add(b);
      render();
    });
    wrap.appendChild(cap);
  });
  // Z : le spam (appuis parasites) se filtre à part
  const spamCap = document.createElement('button');
  spamCap.className = 'keycap spam' + (state.filters.spam?' on':'');
  spamCap.style.background = state.filters.spam ? SPAM_COLOR : '';
  spamCap.style.borderColor = state.filters.spam ? SPAM_COLOR : '';
  spamCap.innerHTML = `Z<span class="count-tag">${spam}</span>`;
  spamCap.title = tr('Spam');
  spamCap.addEventListener('click', ()=>{ state.filters.spam=!state.filters.spam; render(); });
  wrap.appendChild(spamCap);

  if(state.events.length){
    const isSum = state.tempoMode==='sum';
    const sumCap = document.createElement('button');
    sumCap.className = 'keycap sum' + (isSum?' on':'');
    sumCap.style.background = isSum ? '#BEBEBE' : '';
    sumCap.style.borderColor = isSum ? '#BEBEBE' : '';
    sumCap.innerHTML = 'Σ';
    sumCap.title = isSum ? tr('Somme (actif) — clique pour revenir au détail par bouton') : tr('Somme — regroupe tous les boutons en une seule courbe/barre');
    sumCap.addEventListener('click', ()=>{
      // Σ actif : vide les filtres et force la Chronologie ; désactivé : rétablit tous les boutons
      state.tempoMode = isSum ? 'detail' : 'sum';
      if(!isSum){
        state.filters.buttons = new Set();
        state.filters.spam = false;
        state.selectedView = 'temporal';
      } else {
        state.filters.buttons = new Set(state.activeButtons);
        state.filters.spam = false;
      }
      render();
    });
    wrap.appendChild(sumCap);
  }
}

// Vrai si la barre des moyennes doit être masquée.
function avgBarHidden(){
  return state.selectedView==='sequences' || CHART_FAMILY_OF[state.chartType[state.selectedView]]==='matrix';
}
// Construit la barre des moyennes, désactivées par défaut (lettre surmontée d'une barre) :
// chacune ajoute la moyenne de sa lettre à la vue (Σ̄ = moyenne de la somme). La valeur s'affiche sous la touche, pour la tranche courante (sauf en vue Séquences ni en Matrice).
function renderAvgKeys(){
  const host = document.getElementById('avg-keys');
  if(!host) return;
  host.hidden = avgBarHidden();
  host.innerHTML='';
  const wrap = document.createElement('div'); wrap.className='keycaps';
  const unit = lastAvg ? lastAvg.unit : '';

  // Touche moyenne : key = lettre, 'Z' ou 'Σ' ; color = couleur d'activation ; extraClass = classe CSS en plus.
  function makeCap(key, color, extraClass){
    const on = state.avgOn.has(key);
    const cap = document.createElement('button');
    cap.className = 'keycap avg' + (extraClass?' '+extraClass:'') + (on?' on':'');
    cap.style.background = on ? color : '';
    cap.style.borderColor = on ? color : '';
    const v = lastAvg && lastAvg.means[key]!=null ? fmtAvg(lastAvg.means[key]) : '–';
    cap.innerHTML = `<span class="ov">${key}</span><span class="count-tag">${v}</span>`;
    cap.title = (key==='Σ' ? tr('Moyenne de la somme Σ') : key==='Z' ? tr('Moyenne du spam Z') : tr('Moyenne de {x}',{x:labelFor(key)})) + (unit?' — '+unit:'');
    cap.addEventListener('click', ()=>{
      if(state.avgOn.has(key)) state.avgOn.delete(key); else state.avgOn.add(key);
      render();
    });
    return cap;
  }
  state.activeButtons.forEach(b=>wrap.appendChild(makeCap(b, BUTTON_COLORS[b])));
  // Même ordre que la première barre : A B C … Z Σ
  wrap.appendChild(makeCap('Z', SPAM_COLOR, 'spam'));
  wrap.appendChild(makeCap('Σ', '#BEBEBE', 'sum'));
  host.appendChild(wrap);
}

// Contrôles contextuels selon la vue active, reconstruits à chaque rendu : ils remplissent les blocs Affichage,
// Fenêtre temporelle et Vues via la cible courante el (réaffectée avant chaque bloc) que les add*() utilisent.
// Les valeurs vont dans state.* (jamais lues du DOM), puis render().
// Sur téléphone, ces blocs vivent dans le panneau « Réglages » (.side-extra, body.settings-open).
function renderContextControls(){
  const hostView = document.getElementById('context-controls');   // AFFICHAGE : vue, Temporel/Matrice
  const hostWin = document.getElementById('window-controls');     // FENÊTRE TEMPORELLE : granularité, dates et heures
  const hostGfx = document.getElementById('views-controls');      // VUES : forme, cumul, ligne/aire/barres
  const hostSeq = document.getElementById('sequences-controls');  // SÉQUENCES (vue Séquences seulement) : intervalle, longueur, lignes
  let el = hostView;        // cible courante des add*()
  const fel = hostWin;      // dates/heures, même bloc que la granularité
  hostView.innerHTML=''; hostWin.innerHTML=''; hostGfx.innerHTML=''; hostSeq.innerHTML='';

  // Liste de granularité (state.granularity).
  function addGranularity(options){
    const field = document.createElement('div'); field.className='field';
    field.innerHTML = '<label>'+tr('Granularité temporelle')+'</label>';
    const sel = document.createElement('select');
    options.forEach(o=>{
      const opt = document.createElement('option'); opt.value=o.v; opt.textContent=o.l;
      if(state.granularity===o.v) opt.selected=true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', ()=>{ state.granularity=sel.value; render(); });
    field.appendChild(sel);
    el.appendChild(field);
  }

  // Deux bascules : Instantané/Cumulé, puis forme (Unique/Barres multiples si asBar, sinon Lignes/Aire).
  // scope = 'cycles' ou 'temporal' choisit les clés d'état (cyclesCumulative/Shape ou tempoCumulative/Shape).
  function addShapeAndCumulativeToggles(asBar, scope){
    const kc = scope==='cycles' ? 'cyclesCumulative' : 'tempoCumulative', ks = scope==='cycles' ? 'cyclesShape' : 'tempoShape';
    const cumField = document.createElement('div'); cumField.className='field tight';
    const cumRow = document.createElement('div'); cumRow.className='toggle-row';
    [[false,tr('Instantané')],[true,tr('Cumulé')]].forEach(([v,l])=>{
      const btn = document.createElement('button'); btn.textContent=l;
      btn.className = state[kc]===v?'on':'';
      btn.addEventListener('click', ()=>{ state[kc]=v; render(); });
      cumRow.appendChild(btn);
    });
    cumField.appendChild(cumRow);
    el.appendChild(cumField);

    const shapeField = document.createElement('div'); shapeField.className='field tight';
    const shapeRow = document.createElement('div'); shapeRow.className='toggle-row';
    const shapeOptions = asBar
      ? [['interval',tr('Unique')],['alt',tr('Barres multiples')]]
      : [['interval',tr('Lignes')],['alt',tr('Aire')]];
    shapeOptions.forEach(([v,l])=>{
      const btn = document.createElement('button'); btn.textContent=l;
      btn.className = state[ks]===v?'on':'';
      btn.addEventListener('click', ()=>{ state[ks]=v; render(); });
      shapeRow.appendChild(btn);
    });
    shapeField.appendChild(shapeRow);
    el.appendChild(shapeField);
  }

  // Note affichée seulement quand le mode Somme (Σ) est actif.
  function addSommeNote(){
    if(state.tempoMode==='sum'){
      const note = document.createElement('p'); note.className='note';
      note.textContent = tr('Σ actif : la courbe grise est la somme de tous les boutons.');
      el.appendChild(note);
    }
  }

  // Champs « Dates et heures » : jours calendaires (début → fin) et plage horaire quotidienne ;
  // null dans state.filters = automatique (autoHourWindow). Seulement avec horodatage absolu (sinon addRelRange).
  function addDateRange(){
    const {min,max} = dateRangeOfDataset();
    if(min==null) return;

    // Date locale → « AAAA-MM-JJ » (<input type=date>)
    function isoDate(d){
      return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    }
    // Minutes depuis minuit ↔ « HH:MM » (<input type=time>)
    function minToHM(m){
      return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
    }
    function hmToMin(v){
      const [h,m] = v.split(':').map(Number);
      return h*60+m;
    }

    // Dates puis heures sous un seul libellé : jours calendaires inclus, plage horaire appliquée à chaque jour.
    // Une valeur égale à la plage automatique est stockée en null (= non modifiée).
    const dateField = document.createElement('div'); dateField.className='field';
    const f = state.filters;
    const dtModified = f.dayStart!=null || f.dayEnd!=null || f.hourStart!=null || f.hourEnd!=null;
    dateField.appendChild(mkLabelRow(tr('Dates et heures'), dtModified, ()=>{
      f.dayStart = f.dayEnd = f.hourStart = f.hourEnd = null; render();
    }));
    const mkRow = ()=>{ const r = document.createElement('div'); r.style.display='flex'; r.style.alignItems='center'; r.style.gap='6px'; return r; };
    const mkArrow = ()=>{ const a = document.createElement('span'); a.textContent='→'; a.style.color='var(--paper-90)'; a.style.fontSize='12px'; a.style.flex='none'; return a; };
    const mkInp = type=>{ const i = document.createElement('input'); i.type=type; i.style.flex='1'; i.style.minWidth='0'; return i; };
    const dateRow = mkRow();
    const startDateInp = mkInp('date'), endDateInp = mkInp('date');
    startDateInp.value = isoDate(new Date(state.filters.dayStart!=null ? state.filters.dayStart : dayKeyOf(min)));
    endDateInp.value = isoDate(new Date(state.filters.dayEnd!=null ? state.filters.dayEnd : dayKeyOf(max)));
    startDateInp.addEventListener('change', ()=>{
      state.filters.dayStart = startDateInp.value ? new Date(`${startDateInp.value}T00:00:00`).getTime() : null;
      render();
    });
    endDateInp.addEventListener('change', ()=>{
      state.filters.dayEnd = endDateInp.value ? new Date(`${endDateInp.value}T00:00:00`).getTime() : null;
      render();
    });
    dateRow.appendChild(startDateInp); dateRow.appendChild(mkArrow()); dateRow.appendChild(endDateInp);
    dateField.appendChild(dateRow);

    const hourRow = mkRow(); hourRow.style.marginTop='6px';
    const startHourInp = mkInp('time'), endHourInp = mkInp('time');
    startHourInp.value = minToHM(state.filters.hourStart!=null ? state.filters.hourStart : autoHourWindow().hs);
    endHourInp.value = minToHM(state.filters.hourEnd!=null ? state.filters.hourEnd : Math.min(1439, autoHourWindow().he));
    startHourInp.classList.toggle('is-auto', state.filters.hourStart==null);
    endHourInp.classList.toggle('is-auto', state.filters.hourEnd==null);
    startHourInp.title = endHourInp.title = tr("Plage horaire de chaque jour (vider un champ rétablit la plage par défaut ; 22:00 → 06:00 traverse minuit)");
    startHourInp.addEventListener('change', ()=>{
      { const v = startHourInp.value ? hmToMin(startHourInp.value) : null; state.filters.hourStart = (v!=null && v===autoHourWindow().hs) ? null : v; }
      render();
    });
    endHourInp.addEventListener('change', ()=>{
      { const v = endHourInp.value ? hmToMin(endHourInp.value) : null; state.filters.hourEnd = (v!=null && v===Math.min(1439, autoHourWindow().he)) ? null : v; }
      render();
    });
    hourRow.appendChild(startHourInp); hourRow.appendChild(mkArrow()); hourRow.appendChild(endHourInp);
    dateField.appendChild(hourRow);
    fel.appendChild(dateField);
  }

  // Ligne de libellé avec un petit « Réinitialiser » à droite, visible seulement si le réglage est modifié.
  function mkLabelRow(text, modified, onReset){
    const row = document.createElement('div'); row.className='lbl-row';
    const l = document.createElement('label'); l.textContent = text; row.appendChild(l);
    if(modified){
      const b = document.createElement('button'); b.type='button'; b.className='reset-link';
      b.title = tr('Rétablir les valeurs par défaut');
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg><span>' + tr('Réinitialiser') + '</span>';
      b.addEventListener('click', onReset); row.appendChild(b);
    }
    return row;
  }

  // Champs « Temps par session » (hh:mm:ss) : fenêtre en temps relatif (REL) depuis l'allumage de chaque session.
  // Sert quand il n'y a pas d'horodatage absolu ; absent si aucun temps relatif n'existe.
  function addRelRange(){
    if(!state.events.length) return;
    const maxSec = Math.max(0, ...state.events.filter(e=>e.relSec!=null).map(e=>e.relSec));
    if(maxSec<=0) return;
    const curStart = state.filters.relStart!=null ? state.filters.relStart : 0;
    const curEnd = state.filters.relEnd!=null ? state.filters.relEnd : maxSec;

    // Secondes ↔ « HH:MM:SS »
    function secToHMS(s){
      const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=Math.floor(s%60);
      return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');
    }
    function hmsToSec(v){
      const [h,m,s] = v.split(':').map(Number);
      return h*3600+m*60+(s||0);
    }

    const field = document.createElement('div'); field.className='field';
    const rf = state.filters;
    field.appendChild(mkLabelRow(tr('Temps par session'), rf.relStart!=null || rf.relEnd!=null, ()=>{ rf.relStart = rf.relEnd = null; render(); }));
    const row = document.createElement('div'); row.style.display='flex'; row.style.alignItems='center'; row.style.gap='6px';
    const mk = (val, title, onChange, isAuto)=>{
      const inp = document.createElement('input'); inp.type='time'; inp.step='1'; inp.value=val; inp.title=title; inp.classList.toggle('is-auto', !!isAuto);
      inp.style.flex='1'; inp.style.minWidth='0';
      inp.addEventListener('change', ()=>onChange(inp.value)); return inp;
    };
    const arrow = document.createElement('span'); arrow.textContent='→'; arrow.style.color='var(--paper-90)'; arrow.style.fontSize='12px'; arrow.style.flex='none';
    row.appendChild(mk(secToHMS(curStart), tr('Depuis (temps depuis le début de chaque session)'), v=>{ state.filters.relStart = v ? hmsToSec(v) : null; render(); }, state.filters.relStart==null));
    row.appendChild(arrow);
    row.appendChild(mk(secToHMS(curEnd), tr("Jusqu'à (temps depuis le début de chaque session)"), v=>{ state.filters.relEnd = v ? hmsToSec(v) : null; render(); }, state.filters.relEnd==null));
    field.appendChild(row);
    fel.appendChild(field);
  }

 // Choix du type de graphique en deux rangées de boutons, construites par deux appels séparés (part) :
 //  - 'family' : Temporel (graphiques sur l'axe du temps) ou Matrice (grilles heure × jour ou session) ;
 //  - 'sub'    : rendu dans la famille : Barres / Courbes (Temporel) ou Chaleur / Points / Bâtons (Matrice).
 // key = 'temporal' ou 'cycles' : chaque vue garde son choix dans state.chartType[key].
 // Changer de famille remet son rendu par défaut : Barres (Temporel) ou Chaleur (Matrice).
 // allowMatrix=false retire la famille Matrice et, si la vue y était, la remet en Barres.
 // Les deux appels actuels passent true : ce cas est prévu mais pas encore utilisé.
  function addGraphTypeToggle(key, allowMatrix, part){   // part : 'family' (Temporel/Matrice) ou 'sub' (sous-types)
    let family = CHART_FAMILY_OF[state.chartType[key]] || 'temporal';
    if(family==='matrix' && !allowMatrix){ family='temporal'; state.chartType[key]='bar'; }

    const field = document.createElement('div'); field.className='field tight';

    if(allowMatrix && part==='family'){
      const famRow = document.createElement('div'); famRow.className='toggle-row';
      [['temporal',tr('Temporel')],['matrix',tr('Matrice')]].forEach(([f,l])=>{
        const btn = document.createElement('button'); btn.textContent=l;
        btn.className = family===f?'on':'';
        btn.addEventListener('click', ()=>{
          if(family===f) return;
          state.chartType[key] = f==='temporal' ? 'bar' : 'heatmap';
          render();
        });
        famRow.appendChild(btn);
      });
      field.appendChild(famRow);
    }

    if(part==='family'){ if(field.children.length) el.appendChild(field); return; }
    const subRow = document.createElement('div'); subRow.className='toggle-row';
    const subOptions = family==='temporal'
      ? [['bar',tr('Barres')],['line',tr('Courbes')]]
      : [['heatmap',tr('Chaleur')],['dots',tr('Points')],['baton',tr('Bâtons')]];
    subOptions.forEach(([v,l])=>{
      const btn = document.createElement('button'); btn.textContent=l;
      btn.className = state.chartType[key]===v?'on':'';
      btn.addEventListener('click', ()=>{ state.chartType[key]=v; render(); });
      subRow.appendChild(btn);
    });
    field.appendChild(subRow);
    el.appendChild(field);
  }

  // Sélecteur de vue (Chronologie / Cycles), premier niveau, au-dessus du choix Temporel/Matrice.
  // Cycles est désactivé sans horodatage ; en vue Séquences (icône du bandeau), aucun des deux n'est actif.
  function addViewToggle(){
    const field = document.createElement('div'); field.className='field tight';
    const row = document.createElement('div'); row.className='toggle-row';
    VIEWS.forEach(v=>{
      const btn = document.createElement('button'); btn.textContent = v.label;
      btn.className = state.selectedView===v.id ? 'on' : '';
      if(v.id==='cycles' && !(state.hasAnyAbsolute || state.events.some(e=>e.relSec!=null))) btn.disabled = true;
      else btn.addEventListener('click', ()=>{ state.selectedView=v.id; render(); });
      row.appendChild(btn);
    });
    field.appendChild(row);
    el.appendChild(field);
    if(!state.hasAnyAbsolute && !state.events.some(e=>e.relSec!=null)){
      const note = document.createElement('p'); note.className='note';
      note.textContent = tr('Cycles demande des horodatages : ce fichier n\'en contient pas.');
      el.appendChild(note);
    }
  }

  // Ordre de la barre latérale : Filtres → Affichage → Fenêtre temporelle → Vues.
  // isMatrixMode : le type de graphique courant est une matrice (Chaleur/Points/Bâtons).
  const isCycles = state.selectedView==='cycles', isTempo = state.selectedView==='temporal';
  const ctKey = isCycles ? 'cycles' : 'temporal';
  const isMatrixMode = (isCycles||isTempo) && CHART_FAMILY_OF[state.chartType[ctKey]]==='matrix';

  // 0) SÉQUENCES : trois listes (l'ordre des appuis est un bouton de la zone graphique, cf. buildSequenceTools)
  const isSeq = state.selectedView==='sequences';
  document.getElementById('sequences-section').hidden = !isSeq;
  if(isSeq){
    // Liste « étiquette + select » ; options = [{v, l}], current = valeur choisie, onPick(valeur texte).
    const addSeqSelect = (label, options, current, onPick)=>{
      const field = document.createElement('div'); field.className='field';
      field.innerHTML = '<label>'+label+'</label>';
      const sel = document.createElement('select');
      options.forEach(o=>{
        const opt = document.createElement('option'); opt.value=o.v; opt.textContent=o.l;
        if(o.v===current) opt.selected=true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', ()=>{ onPick(sel.value); render(); });
      field.appendChild(sel);
      hostSeq.appendChild(field);
    };
    addSeqSelect(tr('Intervalle de réponse'), SEQ_GAP_OPTIONS.map(n=>({v:String(n), l:fmtSeconds(n)+' s'})), String(state.seqGap),
      v=>{ state.seqGap = Number(v); });
    const lenOptions = [];
    for(let n=2; n<=seqLenCeiling(); n++) lenOptions.push({v:String(n), l:tr('jusqu\'à {n} boutons',{n})});
    addSeqSelect(tr('Longueur de séquence'), lenOptions, String(seqLenEffective()),
      v=>{ state.seqMaxLen = Number(v)>=seqLenCeiling() ? null : Number(v); });
    addSeqSelect(tr('Lignes affichées'), SEQ_LINES_OPTIONS.map(n=>({v:n==null?'all':String(n), l:n==null?tr('Toutes'):String(n)})),
      state.seqLines==null ? 'all' : String(state.seqLines), v=>{ state.seqLines = v==='all' ? null : Number(v); });
  }

  // 1) AFFICHAGE : vue, famille Temporel/Matrice, mode Cycles (heure / jour de semaine)
  el = hostView;
  addViewToggle();
  if(isTempo && !CHART_FAMILY_OF[state.chartType.temporal]) state.chartType.temporal='bar';
  if(isTempo || isCycles) addGraphTypeToggle(ctKey, true, 'family');
  if(isCycles && state.hasAnyAbsolute && !isMatrixMode){
    const field = document.createElement('div'); field.className='field tight';
    const row = document.createElement('div'); row.className='toggle-row';
    [['hour',tr('Heure du jour')],['weekday',tr('Jour de semaine')]].forEach(([m,l])=>{
      const btn = document.createElement('button'); btn.textContent=l;
      btn.className = state.cyclesMode===m?'on':'';
      btn.addEventListener('click', ()=>{ state.cyclesMode=m; render(); });
      row.appendChild(btn);
    });
    field.appendChild(row);
    el.appendChild(field);
  }

  // 2) FENÊTRE TEMPORELLE : granularité (autre liste en Cycles sous-journalier), puis dates/heures ou temps par session
  el = hostWin;
  if(isTempo || (isCycles && !state.hasAnyAbsolute)){
    const opts = GRANULARITY_LIST.map(g=>({v:g.v,l:g.l}));
    if(!opts.find(o=>o.v===state.granularity)) state.granularity=opts[0].v;
    addGranularity(opts);
  } else if(isCycles && (isMatrixMode || state.cyclesMode==='hour')){
    const gopts = SUBDAY_GRANULARITIES.map(g=>({v:g.v,l:g.l}));
    if(!gopts.find(o=>o.v===state.cyclesGranularity)) state.cyclesGranularity='1h';
    const field = document.createElement('div'); field.className='field';
    field.innerHTML = '<label>'+tr('Granularité temporelle')+'</label>';
    const sel = document.createElement('select');
    gopts.forEach(o=>{
      const opt = document.createElement('option'); opt.value=o.v; opt.textContent=o.l;
      if(state.cyclesGranularity===o.v) opt.selected=true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', ()=>{ state.cyclesGranularity=sel.value; render(); });
    field.appendChild(sel);
    el.appendChild(field);
  }
  if(state.hasAnyAbsolute) addDateRange();
  else addRelRange();

  // 3) VUES : sous-type, note Σ, bascules cumul/forme (inutiles en Matrice) ; sections masquées en Séquences
  el = hostGfx;
  if(isTempo || isCycles){
    addGraphTypeToggle(ctKey, true, 'sub');
    if(!isMatrixMode){
      if(isTempo && state.hasAnyAbsolute) addSommeNote();
      addShapeAndCumulativeToggles(state.chartType[ctKey]==='bar', isCycles ? 'cycles' : 'temporal');
    }
  }
  document.getElementById('views-section').hidden = !(isTempo || isCycles);
  document.getElementById('display-section').hidden = !(isTempo || isCycles);
}

//- ZOOM ET RENDU --------------------------------------------------------------------------------//
// Zoom horizontal (fitMode/zoom) et vertical (vFit/vzoom), puis le rendu : renderViz (zone graphique),
// renderLayout (panneau + zone), render().
// Les curseurs de zoom survivent à renderViz, sinon le glissement s'interrompt en plein geste.

// Curseurs de zoom (créés, mis à jour ou retirés) : horizontal (bas droite, Chronologie et Cycles en REL)
// et vertical (droite, courbes/barres). Appelée en fin de renderViz. Double-clic = 100 %.
// En mode adapté (fitMode/vFit = 'fit') le curseur est grisé ; y toucher passe en taille réelle.
function syncZoomCtl(zone){
  let ctl = zone.querySelector('.zoom-ctl'), vctl = zone.querySelector('.vzoom-ctl');
  const chartSvg = zone.querySelector('svg.chart');
  const hasChart = !!chartSvg && state.selectedView!=='sequences';
  const isMatrix = CHART_FAMILY_OF[state.chartType[state.selectedView]]==='matrix';
  const wantH = hZoomView() && hasChart;                           // horizontal : Chronologie, et Cycles en relatif
  const wantV = hasChart && !isMatrix;                             // vertical : courbes / barres (pas les matrices)

  //- HORIZONTAL (BAS, À DROITE) -----------------------------------------------------------------//
  if(!wantH){ if(ctl) ctl.remove(); ctl = null; }
  else {
    if(!ctl){
      ctl = document.createElement('div'); ctl.className = 'zoom-ctl';
      ctl.innerHTML = '<button type="button" class="fit-btn">'+ICON_FITWIDTH_SVG+'</button><input type="range" min="10" max="400" step="10" aria-label="'+tr('Zoom horizontal')+'" title="'+tr('Zoom horizontal (double-clic : 100 %)')+'"><output></output>';
      ctl.querySelector('.fit-btn').addEventListener('click', ()=>{ state.fitMode = state.fitMode==='fit' ? 'real' : 'fit'; state.zoom = 1; render(); });
      const inp = ctl.querySelector('input');
      let raf = 0;
      const apply = v=>{
        state.zoom = v/100; state.fitMode = 'real'; ctl.querySelector('output').textContent = v+' %';   // toucher la barre grisée passe en taille réelle
        if(raf) return;
        raf = requestAnimationFrame(()=>{ raf = 0; rerenderKeepingCentre(); });
      };
      inp.addEventListener('input', ()=>apply(+inp.value));
      inp.addEventListener('dblclick', ()=>{ inp.value = 100; apply(100); });
      zone.appendChild(ctl);
    }
    const inp = ctl.querySelector('input'), z = Math.round(state.zoom*100), fit = state.fitMode==='fit';
    if(+inp.value !== z) inp.value = z;
    ctl.classList.toggle('off', fit);
    const fb = ctl.querySelector('.fit-btn'); fb.classList.toggle('on', fit);
    fb.title = fit ? tr('Adapté à la largeur de l\'écran : clique pour passer en taille réelle (zoom)') : tr('Adapter le graphique à la largeur de l\'écran');
    fb.setAttribute('aria-label', fb.title);
    ctl.querySelector('output').textContent = z+' %';
    if(ctl !== zone.lastElementChild) zone.appendChild(ctl);
  }

  //- VERTICAL (À DROITE DU GRAPHIQUE) -------------------------------------------------------------//
  if(!wantV){ if(vctl) vctl.remove(); return; }
  if(!vctl){
    vctl = document.createElement('div'); vctl.className = 'vzoom-ctl';
    vctl.innerHTML = '<button type="button" class="fit-btn vfit">'+ICON_FITWIDTH_SVG+'</button><input type="range" min="50" max="300" step="10" aria-label="'+tr('Zoom vertical')+'" title="'+tr('Zoom vertical (double-clic : 100 %)')+'"><output></output>';
    vctl.querySelector('.vfit').addEventListener('click', ()=>{
      if(state.vFit==='fit'){ state.vFit = 'real'; state.vzoom = Math.min(3, Math.max(0.5, Math.round(lastChartH/32)/10)); }   // on garde la hauteur actuelle puis on zoome librement
      else { state.vFit = 'fit'; state.vzoom = 1; }
      renderViz();
    });
    const vin = vctl.querySelector('input'); let vraf = 0;
    const vapply = v=>{
      state.vzoom = v/100; state.vFit = 'real'; vctl.querySelector('output').textContent = v+' %';
      if(vraf) return;
      vraf = requestAnimationFrame(()=>{ vraf = 0; rerenderKeepingCentre(); });
    };
    vin.addEventListener('input', ()=>vapply(+vin.value));
    vin.addEventListener('dblclick', ()=>{ vin.value = 100; vapply(100); });
    zone.appendChild(vctl);
  }
  const vin = vctl.querySelector('input'), vz = Math.round(state.vzoom*100), vfit = state.vFit==='fit';
  if(+vin.value !== vz) vin.value = vz;
  vctl.classList.toggle('off', vfit);
  const vb = vctl.querySelector('.vfit'); vb.classList.toggle('on', vfit);
  vb.title = vfit ? tr('Adapté à la hauteur de l\'écran : clique pour passer en taille réelle (zoom vertical)') : tr('Adapter le graphique à la hauteur de l\'écran');
  vb.setAttribute('aria-label', vb.title);
  vctl.querySelector('output').textContent = vz+' %';
  
  // Position et hauteur FIXES : calées sur le haut du graphique, curseur de 120 px comme l'horizontal
  // (le graphique fait au moins 180 px pour le contenir). La barre ne change pas de taille au zoom,
  // sinon la poignée fuit sous la souris. Bouton ↕ en haut, valeur en bas.
  const zr = zone.getBoundingClientRect(), cr = chartSvg.getBoundingClientRect();
  vctl.style.top = Math.max(0, Math.round(cr.top - zr.top)) + 'px';
  vctl.style.height = '';   // hauteur naturelle (curseur de 120 px)
}
// Re-trace la vue en gardant au centre de la fenêtre la même position relative (fraction de scrollWidth).
// Utilisée pendant le glissement des curseurs de zoom (appels regroupés par requestAnimationFrame).
function rerenderKeepingCentre(){
  const sc = document.querySelector('.chart-scroller');
  const centre = sc && sc.scrollWidth ? (sc.scrollLeft + sc.clientWidth/2)/sc.scrollWidth : null;
  renderViz();
  if(centre==null) return;
  document.querySelectorAll('.chart-scroller').forEach(e=>{ e.scrollLeft = Math.max(0, centre*e.scrollWidth - e.clientWidth/2); });
}

// Reconstruit la zone graphique : titre, contenu (Chronologie/Cycles/Séquences), outils, export SVG, curseurs.
// Remet lastAvg à null : la vue le renseigne et renderAvgKeys le lit ensuite (donc à appeler après).
function renderViz(){
  const zone = document.getElementById('viz-zone');
  lastAvg = null; // renseigné par les vues qui calculent des moyennes (voir setViewAvg)
  Array.from(zone.children).forEach(c=>{ if(!c.classList.contains('zoom-ctl') && !c.classList.contains('vzoom-ctl')) c.remove(); });   // les curseurs de zoom restent en place
  zone.classList.add('fade-in');
  setTimeout(()=>zone.classList.remove('fade-in'), 260);

  // Titre et aide de chaque vue ; sans horodatage absolu, la vue est en temps relatif (REL).
  const meta = {
    temporal:{h:tr('Chronologie'), p: state.hasAnyAbsolute ? '' : tr('Sessions mises bout à bout, temps par session depuis l\'allumage.')},
    cycles:{h:tr('Cycles'), p: state.hasAnyAbsolute ? '' : tr('Répartition des votes selon le temps par session depuis l\'allumage, toutes sessions superposées.')},
    sequences:{h:tr('Séquences'), p:tr('Combinaisons de 2 boutons ou plus pressés ensemble en un même geste.')},
  }[state.selectedView];

  const heading = document.createElement('div'); heading.className='view-heading';
  heading.innerHTML = `<h3>${meta.h}</h3>` + (meta.p ? `<p>${meta.p}</p>` : '');
  zone.appendChild(heading);

  const contentHost = document.createElement('div');
  zone.appendChild(contentHost);

  switch(state.selectedView){
    case 'temporal': renderTemporalView(contentHost); break;
    case 'cycles': renderCyclesView(contentHost); break;
    case 'sequences': renderSequencesView(contentHost); break;
  }

  if(zone.querySelector('svg.chart[data-dense]') && state.selectedView!=='sequences'){
    const note = document.createElement('p'); note.className='note';
    note.textContent = tr('Graphique très dense : clique sur l\'icône de largeur (en bas à droite) pour passer en taille réelle et lire le détail.');
    contentHost.appendChild(note);
  }
  // Barre d'outils : outils propres à la vue + export SVG si un graphique existe
  const tools = document.createElement('div'); tools.className='viz-tools';
  if(state.selectedView==='temporal') buildTemporalTools(tools);
  if(state.selectedView==='cycles' && state.hasAnyAbsolute) buildCyclesTools(tools);
  if(state.selectedView==='sequences') buildSequenceTools(tools);   // à gauche de l'export SVG (ajouté après)
  if(zone.querySelector('svg.chart')){
    const vexp = document.createElement('button');
    vexp.className = 'view-mode-toggle viz-export';
    vexp.title = tr('Exporter la vue en SVG');
    vexp.setAttribute('aria-label',tr('Exporter la vue en SVG'));
    vexp.innerHTML = ICON_EXPORT_SVG;
    vexp.addEventListener('click', exportView);
    tools.appendChild(vexp);
  }
  if(tools.children.length) zone.appendChild(tools);
  // Matrices courtes : centrées verticalement dans l'espace libre (140 px max).
  const mgrid = zone.querySelector('.heatmap-groups');
  if(mgrid){
    const free = window.innerHeight - mgrid.getBoundingClientRect().top - 90 - mgrid.offsetHeight;
    mgrid.style.marginTop = free>24 ? Math.min(140, Math.round(free/2))+'px' : '';
  }
  syncZoomCtl(zone);
}
// Outil de la vue Séquences : bascule « ordre des appuis » (state.seqOrdered) : « A + C » regroupe A puis C
// et C puis A, « A → C » ≠ « C → A ». Toujours affiché, même sans séquence ; ajouté avant le bouton d'export.
function buildSequenceTools(tools){
  const on = state.seqOrdered;
  const b = document.createElement('button'); b.type = 'button';
  b.className = 'view-mode-toggle' + (on ? ' active' : '');
  const tip = on ? tr('Ordre des appuis respecté (A → F) : cliquer pour les regrouper (A + F)')
                 : tr('Ordre des appuis ignoré (A + F) : cliquer pour le respecter (A → F)');
  b.title = tip; b.setAttribute('aria-label', tip); b.setAttribute('aria-pressed', String(on));
  b.innerHTML = on ? ICON_ORDER_SVG : ICON_ORDER_OFF_SVG;
  b.addEventListener('click', ()=>{ state.seqOrdered = !state.seqOrdered; render(); });
  tools.appendChild(b);
}
// Redimensionnement de la fenêtre : la hauteur automatique des graphiques et le centrage des matrices suivent.
// Anti-rebond de 200 ms ; re-trace seulement si la hauteur « adaptée » a changé ou si une matrice est affichée.
let _resizeT = 0;
window.addEventListener('resize', ()=>{
  clearTimeout(_resizeT);
  _resizeT = setTimeout(()=>{
    if(!document.getElementById('viz-zone') || !state.events.length) return;
    if((state.vFit==='fit' && autoChartH()!==lastChartH) || document.querySelector('.heatmap-groups')) renderViz();
  }, 200);
});

// Panneau latéral + zone graphique ; tant que résumé ET journal ne sont pas chargés, affiche l'invite.
// Réécrit tout le DOM de #layout-mount, puis remplit le panneau et la zone graphique.
function renderLayout(){
  const mount = document.getElementById('layout-mount');
  const active = !!(state.resume && state.events.length);

  if(!active){
    mount.innerHTML='';
    mount.className = 'empty-layout';
    const card = document.createElement('div'); card.className='empty-layout-card';
    const k = document.createElement('p'); k.className='k'; k.textContent=tr('02 · JOURNAL DÉTAILLÉ');
    card.appendChild(k);
    const p = document.createElement('p');
    // Invite selon ce qui manque : le journal (cas général) ou, s'il est chargé, le résumé.
    if(!state.events.length) p.textContent = tr('Charge ensuite le détail journalisé des votes au format CSV exporté depuis la borne Sontadeg.');
    else p.textContent = tr('Journal chargé — charge aussi le résumé au format CSV exporté depuis la borne Sontadeg.');
    card.appendChild(p);
    const btn = document.createElement('label'); btn.className='file-btn icon-only'; btn.title=tr('Charger le journal détaillé');
    btn.innerHTML = `<span class="btn-icon">${ICON_LOG_SVG}</span><input type="file" accept=".csv">`;
    const err = document.createElement('p'); err.className='inline-error';
    btn.querySelector('input').addEventListener('change', e=>{
      const f = e.target.files[0]; if(!f) return;
      loadLogFile(f, msg=>{ err.textContent=msg; card.appendChild(err); });
    });
    card.appendChild(btn);
    card.appendChild(err);
    card.appendChild(privacyNote());   // sous le bouton LOG (carte visible tant que les deux fichiers ne sont pas chargés)
    mount.appendChild(card);
    return;
  }

  // Squelette : colonne latérale (Filtres + panneau Réglages : Affichage, Fenêtre temporelle, Vues) et zone graphique
  mount.className = '';
  mount.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <div class="side-section">
          <div class="side-head"><h2>${tr('Filtres')}</h2><button type="button" class="settings-btn">${tr('Réglages')}</button></div>
          <div class="keycaps" id="keycaps"></div>
          <div id="avg-keys"></div>
        </div>
        <div class="side-extra">
          <div class="sheet-head"><h2>${tr('Réglages')}</h2><button type="button" class="sheet-close">${tr('Fermer')}</button></div>
          <div class="side-section" id="display-section">
            <h2>${tr('Affichage')}</h2>
            <div id="context-controls"></div>
          </div>
          <div class="side-section" id="sequences-section" hidden>
            <h2>${tr('Séquences')}</h2>
            <div id="sequences-controls"></div>
          </div>
          <div class="side-section" id="window-section">
            <h2>${tr('Fenêtre temporelle')}</h2>
            <div id="window-controls"></div>
          </div>
          <div class="side-section" id="views-section">
            <h2>${tr('Vues')}</h2>
            <div id="views-controls"></div>
          </div>
        </div>
      </aside>
      <main class="viz-zone" id="viz-zone"></main>
    </div>`;

  // Téléphone : « Réglages » ouvre le reste du panneau par-dessus le bas de l'écran (CSS ≤ 700 px).
  const openSheet = on => document.body.classList.toggle('settings-open', on);
  mount.querySelector('.settings-btn').addEventListener('click', ()=>openSheet(true));
  mount.querySelector('.sheet-close').addEventListener('click', ()=>openSheet(false));
  renderKeycaps();
  renderContextControls();
  renderViz();
  renderAvgKeys(); // après renderViz : lit les moyennes de la vue (ordre à respecter)
}

//- DÉMARRAGE ------------------------------------------------------------------------------------//
// Définit render() (point d'entrée de tout rafraîchissement) puis lance l'application.
// Doit rester le dernier fichier chargé : applyStatic() et render() supposent tout le reste défini.

// Point d'entrée unique : reconstruit le bandeau puis la mise en page à chaque changement d'état
// (pas de rendu partiel : plus simple à raisonner, coût négligeable vu la taille des données).
function render(){
  renderBanner();
  renderLayout();
}

if(isPhone()) state.fitMode = 'real';   // téléphone : taille réelle + défilement dès le départ (isPhone() est défini dans graphiques.js)
applyStatic();   // textes statiques de la page (traduits via tr()) et réglages initiaux
render();        // premier rendu : invite de chargement tant qu'aucun CSV n'est chargé
