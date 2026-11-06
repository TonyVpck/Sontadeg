//------------------------------------------------------------------------------------------------//
// SONTADEG ARSELLAN - TEMPS : FENÊTRES HORAIRES, CYCLES, CHRONOLOGIE, MOYENNES                   //
//                                                                                                //
// Calcul du temps, sans dessin : fenêtres horaires, axes, tranches, cumul et moyennes.           //
// L'axe suit les bornes réglées (dates/heures, ou Depuis/Jusqu'à en REL), pas les votes filtrés. //
// Une fenêtre horaire est [hs, he[ en minutes : hs > he traverse minuit, hs = he vaut 24 h.      //
//------------------------------------------------------------------------------------------------//

"use strict";

//- FENÊTRES HORAIRES ----------------------------------------------------------------------------//

const GAP_BARS = 1.5;      // blanc entre deux fenêtres non contiguës, en largeurs de barre
const MAX_BUCKETS = 5000;  // tranches max par axe (au-delà : « Plage trop large »)

// Minuit local de n jours plus loin, sûr aux changements d'heure (contrairement à +86400000).
function addDays(ms, n){ const d=new Date(ms); d.setDate(d.getDate()+n); d.setHours(0,0,0,0); return d.getTime(); }

// Fenêtre [hs, he[ autour des heures utilisées (used[h] vrai si l'heure h a des votes), avec 1 h de marge.
// Linéaire (premier → dernier créneau), sauf si passer par minuit est plus court (alors hs > he).
// Renvoie null si aucune heure n'est utilisée ou si la marge couvre 24 h.
function windowAroundHours(used){
  if(!used.some(Boolean)) return null;
  const padded = used.map((_,h)=>used[h] || used[(h+23)%24] || used[(h+1)%24]);
  if(!padded.some(v=>!v)) return null;
  // Fenêtre linéaire : du premier au dernier créneau utilisé, sauf si passer par minuit la raccourcit.
  const hrs = used.map((u,h)=>u?h:-1).filter(h=>h>=0);
  const lin = {hs: Math.max(0, Math.min(...hrs)-1)*60, he: Math.min(24, Math.max(...hrs)+2)*60};
  let best = 0, bestStart = 0;
  for(let h=0; h<24; h++){
    if(padded[h]) continue;
    if(padded[(h+23)%24]) {           // début d'un creux
      let len = 0; while(!padded[(h+len)%24]) len++;
      if(len>best){ best = len; bestStart = h; }
    }
  }
  const hs = ((bestStart+best)%24)*60;           // premier créneau après le creux
  let he = bestStart*60;                          // début du creux (exclusif)
  if(he===0) he = 1440;
  const circLen = ((he-hs)+1440)%1440 || 1440;
  return (hs>he && circLen < (lin.he-lin.hs)) ? {hs, he} : lin;
}
// Cache de la fenêtre automatique, invalidé quand state.events est remplacé (comparé par référence).
let _autoHourCache = null;
// Fenêtre horaire par défaut : 1 h autour des heures de votes de tout le journal (en minutes depuis minuit).
// Vaut {0, 1440} sans vote en NTP ou si elle couvre 24 h.
function autoHourWindow(){
  if(_autoHourCache && _autoHourCache.events===state.events) return _autoHourCache.win;
  const used = new Array(24).fill(false);
  state.events.forEach(e=>{ if(e.absMs!=null) used[new Date(e.absMs).getHours()] = true; });
  const win = windowAroundHours(used) || {hs:0, he:1440};
  _autoHourCache = {events:state.events, win};
  return win;
}
// Fenêtre horaire quotidienne active (en minutes, fin exclue) : les bornes réglées (hourStart / hourEnd)
// l'emportent champ par champ sur l'automatique. Globale ; par jour, voir windowForDay.
function hourWindow(){
  const auto = autoHourWindow();
  const hs = state.filters.hourStart!=null ? state.filters.hourStart : auto.hs;
  let he = state.filters.hourEnd!=null ? state.filters.hourEnd : auto.he;
  if(he>=1439) he = 1440;
  return {hs, he};
}
// Vrai si la minute du jour m (0-1439) est dans la fenêtre w = {hs, he}, minuit compris.
function minuteInWindow(m, w){
  if(w.hs<w.he) return m>=w.hs && m<w.he;
  return m>=w.hs || m<w.he;           // traverse minuit (hs = he : 24 h)
}
// Vrai si la tranche [m, m+len[ touche la fenêtre w, même partiellement (hs = he : toujours vrai).
function minutesTouchWindow(m, len, w){
  if(w.hs<w.he) return m<w.he && m+len>w.hs;
  return m+len>w.hs || m<w.he;
}

//- CYCLES ---------------------------------------------------------------------------------------//
// Récurrences par heure du jour (Nuit / Matin / Après-midi / Soir) ou par jour de semaine ; NTP seulement.
// Réglages ☰ dans state.cycCfg (hidden, hs, he) : clés 'p0'-'p3' (périodes) et 'w0'-'w6' (jours, 0 = dimanche).

//- PÉRIODES, JOURS ET AXES ----------------------------------------------------------------------//
// Périodes de la journée [lo, hi[ en minutes depuis minuit ; k = clé de réglage.
const PERIODS = [   // libellé traduit à la lecture (getter)
  {k:'p0', get label(){ return tr('Nuit'); },       lo:0,    hi:360},
  {k:'p1', get label(){ return tr('Matin'); },      lo:360,  hi:720},
  {k:'p2', get label(){ return tr('Après-midi'); }, lo:720,  hi:1080},
  {k:'p3', get label(){ return tr('Soir'); },       lo:1080, hi:1440},
];
// Ordre d'affichage des jours de semaine (indices JS : 0 = dimanche), lundi en premier.
const WEEK_ORDER = [1,2,3,4,5,6,0];                                
// Noms des jours indexés par getDay().
const WEEKDAY_LONG = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];   // à traduire : tr(WEEKDAY_LONG[d])
// Réglages ☰ d'une période ou d'un jour (clé 'pN' / 'wN') ; objet vide si aucun.
const cycCfgOf = k => state.cycCfg.get(k) || {};
// Fenêtre effective [hs, he[ d'une période : bornes réglées, sinon celles par défaut.
function periodWin(p){ const c = cycCfgOf(p.k); return {hs: c.hs!=null ? c.hs : p.lo, he: c.he!=null ? c.he : p.hi}; }
// Jour de semaine (0 = dimanche) d'un vote : celui de la soirée de départ
// (01:30 compte pour la veille si la fenêtre passe minuit).
function cyclesWeekday(ms){ return new Date(dayKeyOf(ms)).getDay(); }
// Axe des heures (tranches de bucketMin minutes) depuis le début de la fenêtre : 22:00 → 05:00 d'un seul tenant.
// Une période masquée ou réduite retire ses tranches et laisse un blanc (GAP_BARS) ; blocs si tranches <= 6 h.
// Renvoie {order: tranches du jour, gapBefore: blanc avant chacune, blocks: périodes {key, label, from, to}}.
function cyclesHourAxis(bucketMin){
  const n = Math.round(1440/bucketMin), win = hourWindow(), bands = bucketMin<=360;
  const full = win.hs===0 && win.he>=1440;
  const start = full ? 0 : Math.floor(win.hs/bucketMin) % n;
  const order = [], gapBefore = [], blocks = [];
  let prevK = -2;
  for(let k=0;k<n;k++){
    const i = (start+k)%n, m = i*bucketMin;
    if(!minutesTouchWindow(m, bucketMin, win)) continue;
    let per = null;
    if(bands){
      per = PERIODS[Math.min(3, Math.floor(m/360))];
      if(cycCfgOf(per.k).hidden) continue;
      const pw = periodWin(per);
      if(!(m < pw.he && m+bucketMin > pw.hs)) continue;
    }
    const gap = (order.length && k!==prevK+1) ? GAP_BARS : 0;
    order.push(i); gapBefore.push(gap); prevK = k;
    if(per){
      const last = blocks[blocks.length-1];
      if(last && last.key===per.k && !gap) last.to = order.length-1;
      else blocks.push({key:per.k, label:per.label, from:order.length-1, to:order.length-1});
    }
  }
  return {order, gapBefore, blocks};
}
// Axe des jours de semaine : ceux couverts par les dates, sans les masqués, lundi d'abord.
// Renvoie {order: jours 0-6, gapBefore} ; blanc entre deux jours non consécutifs.
function cyclesWeekAxis(){
  const days = activeWeekdays();
  const order = WEEK_ORDER.filter(d=>days.has(d) && !cycCfgOf('w'+d).hidden);
  const gapBefore = order.map((d,k)=>k>0 && WEEK_ORDER.indexOf(d)!==WEEK_ORDER.indexOf(order[k-1])+1 ? GAP_BARS : 0);
  return {order, gapBefore};
}
// Vrai si la période / le jour key a un réglage modifié (masqué ou bornes changées).
function cycCfgIsCustom(key){ const c = cycCfgOf(key); return !!(c.hidden || c.hs!=null || c.he!=null); }
// Titre traduit d'une clé de réglage : période 'pN' ou jour 'wN'.
function cycTitle(key){ return key[0]==='p' ? PERIODS[+key[1]].label : tr(WEEKDAY_LONG[+key[1]]); }
// Éléments ☰ des Cycles (un par période ou jour) ; spans = {key, from, to}, comme les blocs de cyclesHourAxis.
function cyclesCfgItems(spans){
  return spans.map(sp=>({kind:'cyc', key:sp.key, from:sp.from, to:sp.to, custom:cycCfgIsCustom(sp.key), title:cycTitle(sp.key), onClick: el=>openCycleEditor(sp.key, el)}));
}
// Clés triées des périodes / jours masqués de la vue : les deux en Matrice, sinon selon le mode (heure / jour).
function cyclesHidden(){
  const matrix = CHART_FAMILY_OF[state.chartType.cycles]==='matrix';
  const out = []; state.cycCfg.forEach((c,k)=>{
    if(!c.hidden) return;
    if(matrix || (k[0]==='p') === (state.cyclesMode==='hour')) out.push(k);
  });
  return out.sort();
}
// Fenêtre {hs, he} ajustée aux votes filtrés de la période p (1 h de marge, bornée à la période).
// Renvoie null sans vote ; l'heure est lue brute (getHours), sans rattachement à la soirée de départ.
function fitPeriod(p){
  const used = new Set();
  getFilteredEvents().forEach(e=>{
    if(e.absMs==null) return;
    const d = new Date(e.absMs), m = d.getHours()*60+d.getMinutes();
    if(m>=p.lo && m<p.hi) used.add(Math.floor(m/60));
  });
  if(!used.size) return null;
  const lo = Math.min(...used), hi = Math.max(...used);
  return {hs: Math.max(p.lo, lo*60-60), he: Math.min(p.hi, (hi+1)*60+60)};
}
// Jours de semaine (0-6) ayant au moins un vote filtré (soirée rattachée au jour de départ).
function cyclesWeekdaysWithVotes(){
  const set = new Set(); getFilteredEvents().forEach(e=>{ if(e.absMs!=null) set.add(cyclesWeekday(e.absMs)); });
  return set;
}

//- ÉDITEURS ☰ (PÉRIODE, JOURS, LISTE DES MASQUÉS) -----------------------------------------------//
// Éditeur d'une période (heures, ajuster, masquer) ou d'un jour (masquer), ancré sur anchor.
// Les bornes ne sont gardées que si elles réduisent la période (null = défaut) ; validées à la fermeture.
function openCycleEditor(key, anchor){
  const isP = key[0]==='p', per = isP ? PERIODS[+key[1]] : null;
  const c0 = cycCfgOf(key);
  const ed = openEditorShell(anchor, ()=>{   // a et b (champs d'heure) sont déclarés plus bas
    if(!isP) return;
    setCfg(state.cycCfg, key, c=>{
      const hs = a.value ? parseHM(a.value) : null, he = b.value ? normHe(parseHM(b.value)) : null;
      c.hs = (hs!=null && hs>per.lo) ? Math.min(hs, per.hi-1) : null;
      c.he = (he!=null && he<per.hi) ? Math.max(he, per.lo+1) : null;
    });
    render();
  });
  const title = document.createElement('div'); title.className='be-title'; title.textContent = cycTitle(key);
  ed.el.appendChild(title);
  let a, b, fit;
  if(isP){
    const cur = periodWin(per);
    const row = document.createElement('div'); row.className='be-row';
    a = document.createElement('input'); b = document.createElement('input'); a.type = b.type = 'time';
    a.value = fmtHM(cur.hs); b.value = fmtHM(Math.min(1439, cur.he));
    const arrow = document.createElement('span'); arrow.textContent = '→';
    row.appendChild(a); row.appendChild(arrow); row.appendChild(b); ed.el.appendChild(row);
  }
  const links = document.createElement('div'); links.className='be-links';
  if(isP){
    fit = document.createElement('a'); fit.textContent = tr('ajuster aux votes');
    const w = fitPeriod(per), fv = w ? {a:fmtHM(w.hs), b:fmtHM(Math.min(1439,w.he))} : null;
    if(!fv) fit.className = 'disabled';
    const defV = {a:fmtHM(per.lo), b:fmtHM(Math.min(1439, per.hi))};
    let before = null;
    const isFit = ()=>!!fv && a.value===fv.a && b.value===fv.b;
    const sync = ()=>fit.classList.toggle('active', isFit());
    fit.addEventListener('click', ()=>{
      if(!fv) return;
      if(isFit()){ const r = before || defV; a.value = r.a; b.value = r.b; before = null; }
      else { before = {a:a.value, b:b.value}; a.value = fv.a; b.value = fv.b; }
      sync();
    });
    a.addEventListener('input', sync); b.addEventListener('input', sync);
    links.appendChild(fit); sync();
  }
  const hide = document.createElement('a'); hide.textContent = tr('masquer');
  hide.addEventListener('click', ()=>{ _editor.commit = null; setCfg(state.cycCfg, key, c=>{ c.hidden = true; }); closeBlockEditor(false); render(); });
  links.appendChild(hide); ed.el.appendChild(links);
  ed.place(); if(a) a.focus();
}
// Matrice : un seul ☰ pour les jours ; décoché = masqué. Validé à la fermeture.
function openCycleDaysEditor(anchor){
  const days = activeWeekdays(), boxes = [];
  const ed = openEditorShell(anchor, ()=>{
    boxes.forEach(({d,cb})=>setCfg(state.cycCfg, 'w'+d, c=>{ c.hidden = cb.checked ? null : true; }));
    render();
  });
  const title = document.createElement('div'); title.className='be-title'; title.textContent = tr('Jours affichés'); ed.el.appendChild(title);
  WEEK_ORDER.filter(d=>days.has(d)).forEach(d=>{
    const row = document.createElement('label'); row.className='be-item be-check';
    const cb = document.createElement('input'); cb.type='checkbox'; cb.checked = !cycCfgOf('w'+d).hidden;
    const t = document.createElement('span'); t.textContent = tr(WEEKDAY_LONG[d]);
    row.appendChild(cb); row.appendChild(t); ed.el.appendChild(row); boxes.push({d, cb});
  });
  ed.place();
}
// Liste des périodes / jours masqués, avec « rétablir » pour chacun (puce « n masqués » de la barre).
function openCyclesHiddenList(anchor){
  const ed = openEditorShell(anchor, null);
  const title = document.createElement('div'); title.className='be-title'; title.textContent = tr('Masqués'); ed.el.appendChild(title);
  cyclesHidden().forEach(k=>{
    const row = document.createElement('div'); row.className='be-item';
    const t = document.createElement('span'); t.textContent = cycTitle(k);
    const a = document.createElement('a'); a.textContent = tr('rétablir');
    a.addEventListener('click', ()=>{ setCfg(state.cycCfg, k, c=>{ c.hidden = null; }); closeBlockEditor(false); render(); });
    row.appendChild(t); row.appendChild(a); ed.el.appendChild(row);
  });
  ed.place();
}

//- OUTILS DE LA BARRE ---------------------------------------------------------------------------//
// Ajuste tout aux votes : périodes (mode heure ou Matrice) et jours (mode jour ou Matrice) selon la vue.
// Période ou jour sans vote : masqué. Période hors fenêtre horaire : laissée telle quelle.
function adjustAllCycles(){
  const matrix = CHART_FAMILY_OF[state.chartType.cycles]==='matrix';
  if(matrix || state.cyclesMode==='hour'){
    const win = hourWindow();
    PERIODS.forEach(per=>{
      if(!minutesTouchWindow(per.lo, per.hi-per.lo, win)) return;   // période hors fenêtre : rien à ajuster
      const w = fitPeriod(per);
      setCfg(state.cycCfg, per.k, c=>{
        if(!w){ c.hidden = true; c.hs = c.he = null; return; }
        c.hidden = null; c.hs = w.hs>per.lo ? w.hs : null; c.he = w.he<per.hi ? w.he : null;
      });
    });
  }
  if(matrix || state.cyclesMode==='weekday'){
    const has = cyclesWeekdaysWithVotes();
    activeWeekdays().forEach(d=>setCfg(state.cycCfg, 'w'+d, c=>{ c.hidden = has.has(d) ? null : true; }));
  }
  render();
}
// Barre des Cycles : puce des masqués, « ajuster aux votes » et réinitialisation (grisée si cycCfg est vide).
// tools = conteneur DOM.
function buildCyclesTools(tools){
  // Fabrique un bouton d'icône ; onClick reçoit le bouton (ancrage d'un éventuel éditeur).
  const mk = (svg, title, onClick, disabled)=>{
    const b = document.createElement('button'); b.className='view-mode-toggle'; b.title = title; b.setAttribute('aria-label', title);
    b.innerHTML = svg; b.disabled = !!disabled; b.addEventListener('click', ()=>onClick(b)); tools.appendChild(b); return b;
  };
  const hidden = cyclesHidden();
  if(hidden.length){
    const chip = document.createElement('button'); chip.className='viz-chip';
    chip.textContent = tr(hidden.length>1 ? '{n} masqués' : '{n} masqué', {n:hidden.length}); chip.title = tr('Voir et rétablir les périodes / jours masqués');
    chip.addEventListener('click', ()=>openCyclesHiddenList(chip)); tools.appendChild(chip);
  }
  mk(ICON_ADJUST_SVG, tr('Ajuster aux votes (périodes : 1 h avant et après ; jours : seulement ceux qui ont des votes)'), ()=>adjustAllCycles());
  mk(ICON_RESET_SVG, tr('Réinitialiser (périodes et jours masqués ou réduits)'), ()=>{ state.cycCfg = new Map(); closeBlockEditor(false); render(); }, state.cycCfg.size===0);
}

//- CHRONOLOGIE ----------------------------------------------------------------------------------//
// Axe temporel de la Chronologie : journées (une soirée qui passe minuit reste rattachée à son jour de départ),
// tranches absolues (NTP) ou relatives (REL), granularité automatique, étiquettes et cumul.
// Une « clé de journée » = minuit local en ms. Utilise alignAbs, GRANULARITY_MS, dayCfgOf, windowForDay (donnees.js).

// Clé de journée d'un horodatage : le jour calendaire, sauf si la fenêtre de la veille passe minuit
// (ex. 20:00 → 02:00) et que l'heure tombe avant sa fin : le vote est alors rattaché à la soirée de la veille.
function dayKeyOf(ms){
  const c = alignAbs(ms,'1j');
  const d = new Date(ms), m = d.getHours()*60 + d.getMinutes();
  const p = addDays(c,-1), w = windowForDay(p);
  return (w.hs>=w.he && m<w.he) ? p : c;
}
// Vrai si l'instant ms est dans la fenêtre de la journée key (qui peut déborder sur le lendemain).
function inDayWindow(ms, key){
  const c = alignAbs(ms,'1j'), d = new Date(ms), m = d.getHours()*60 + d.getMinutes(), w = windowForDay(key);
  if(w.hs<w.he) return c===key && m>=w.hs && m<w.he;
  return (c===key && m>=w.hs) || (c===addDays(key,1) && m<w.he);   // traverse minuit (hs = he : 24 h)
}
// Idem pour une tranche [t, t+len minutes[ : vrai si elle touche la fenêtre de la journée key (t en ms).
function touchesDayWindow(t, len, key){
  const c = alignAbs(t,'1j'), d = new Date(t), m = d.getHours()*60 + d.getMinutes(), w = windowForDay(key);
  if(w.hs<w.he) return c===key && m<w.he && m+len>w.hs;
  return (c===key && m+len>w.hs) || (c===addDays(key,1) && m<w.he);
}

//- BORNES ET AXES -------------------------------------------------------------------------------//
// Premier et dernier jour de l'axe : dates réglées, sinon étendue du journal ; null en mode REL (pas d'horloge).
function dayBounds(){
  const {min,max} = dateRangeOfDataset();
  if(min==null) return null;
  const f = state.filters;
  return {first: f.dayStart!=null ? f.dayStart : dayKeyOf(min),
          last:  f.dayEnd!=null   ? f.dayEnd   : dayKeyOf(max)};
}
// Jours de semaine (0 = dimanche) couverts par la plage de dates (les 7 si aucune plage connue).
function activeWeekdays(){
  const all = new Set([0,1,2,3,4,5,6]);
  const b = dayBounds(); if(!b) return all;
  const s = new Set();
  for(let d=b.first, k=0; d<=b.last && k<7; d=addDays(d,1), k++) s.add(new Date(d).getDay());
  return s;
}
// Étiquette de jour : « jj/mm » (short) ou « jour abrégé jj/mm », selon la langue.
function dayLabelAbs(ms, short){
  const d = new Date(ms);
  return d.toLocaleDateString(locale(), short ? {day:'2-digit',month:'2-digit'} : {weekday:'short',day:'2-digit',month:'2-digit'});
}
// Tranches absolues de l'axe pour une granularité (NTP seulement) :
//  - sous un jour : par jour, les tranches qui touchent la fenêtre horaire, bout à bout avec un blanc (GAP_BARS)
//    là où le temps n'est pas contigu ;
//  - à partir d'un jour : tranches calendaires continues (la fenêtre ne fait alors que filtrer les votes).
// Renvoie {buckets (débuts en ms), gapBefore, blocks ({from, to, ts} : groupes contigus pour l'axe des dates),
//   days ({key, from, to}, sous un jour ou en « 1j »), hasGaps, tooMany (MAX_BUCKETS dépassé : axe tronqué),
//   locate(ms) (indice de tranche, -1 hors axe)}. Hors plage : out vide.
function buildTimeline(gran){
  const bd = dayBounds();
  const out = {buckets:[], gapBefore:[], blocks:[], days:[], hasGaps:false, tooMany:false, locate:()=>-1};
  if(!bd) return out;
  const bucketMs = GRANULARITY_MS[gran];
  const push = (t, gap)=>{ out.buckets.push(t); out.gapBefore.push(gap); return out.buckets.length>MAX_BUCKETS; };
  const keys = [];     // clé de journée de chaque tranche (sous un jour)
  if(bucketMs < 86400000){
    const len = bucketMs/60000;
    let prevEnd = null;
    outer:
    // Jours de la plage, plus le lendemain (fin d'une soirée qui passe minuit).
    for(let day=bd.first; day<=addDays(bd.last,1); day=addDays(day,1)){
      const nextDay = addDays(day,1);
      for(let t=day; t<nextDay; t+=bucketMs){
        const key = dayKeyOf(t);
        if(key<bd.first || key>bd.last) continue;
        const c = dayCfgOf(key);
        if(c && c.hidden) continue;                          // jour masqué : absent de l'axe
        if(!touchesDayWindow(t, len, key)) continue;
        if(push(t, (prevEnd!==null && t>prevEnd) ? GAP_BARS : 0)){ out.tooMany=true; break outer; }
        keys.push(key); prevEnd = t+bucketMs;
      }
    }
    // Journées : suites de tranches de même clé.
    keys.forEach((k,i)=>{
      const last = out.days[out.days.length-1];
      if(last && last.key===k && last.to===i-1) last.to = i; else out.days.push({key:k, from:i, to:i});
    });
  } else {
    const stepDays = gran==='1j' ? 1 : gran==='3j' ? 3 : gran==='2semaines' ? 14 : 7;
    for(let t=alignAbs(bd.first,gran); t<=bd.last; t=addDays(t,stepDays)){
      if(gran==='1j'){ const c = dayCfgOf(t); if(c && c.hidden) continue; }
      if(push(t,0)){ out.tooMany=true; break; }
      if(gran==='1j') out.days.push({key:t, from:out.buckets.length-1, to:out.buckets.length-1});
    }
  }
  out.hasGaps = out.gapBefore.some(g=>g>0);
  out.buckets.forEach((t,i)=>{
    if(i===0 || out.gapBefore[i]>0) out.blocks.push({from:i, to:i, ts:(keys.length ? keys[i] : t)});
    else out.blocks[out.blocks.length-1].to = i;
  });
  // Fenêtres bout à bout sans écart (ex. 24 h) : un bloc par jour pour repérer les dates.
  if(!out.hasGaps && bucketMs < 86400000 && out.days.length>1) out.blocks = out.days.map(d=>({from:d.from, to:d.to, ts:d.key}));
  const index = new Map(out.buckets.map((t,i)=>[t,i]));
  out.locate = ms => { const k = index.get(gran==='1j' ? dayKeyOf(ms) : alignAbs(ms,gran)); return k===undefined ? -1 : k; };
  return out;
}
// Mode REL (temps écoulé depuis le début de chaque session) : tranches en secondes de « Depuis » à « Jusqu'à ».
// cfg ({lo, hi}) = bornes propres à une session, prioritaires sur les filtres ; début aligné sur la tranche.
// Renvoie {buckets, base, step (s), tooMany}.
function buildRelTimeline(maxSecDefault, gran, cfg){
  const step = (GRANULARITY_MS[gran]||GRANULARITY_MS['15min'])/1000;
  const f = state.filters;
  const lo = cfg && cfg.lo!=null ? cfg.lo : (f.relStart!=null ? f.relStart : 0);
  const hi = cfg && cfg.hi!=null ? cfg.hi : (f.relEnd!=null ? f.relEnd : maxSecDefault);
  const base = Math.floor(lo/step)*step;
  const buckets = []; let tooMany = false;
  for(let t=base; t<=hi; t+=step){ buckets.push(t); if(buckets.length>MAX_BUCKETS){ tooMany=true; break; } }
  if(buckets.length===0) buckets.push(base);
  return {buckets, base, step, tooMany};
}

//- GRANULARITÉ AUTOMATIQUE, ÉTIQUETTES, CUMUL ---------------------------------------------------//
const AUTO_BARS = 150;  // barres visées au maximum par la granularité automatique
// Choisit state.granularity à l'ouverture d'un journal : la plus fine (à partir de 15 min) qui donne au plus
// AUTO_BARS barres (au-delà elles se touchent), sinon la plus grande. Sans effet si le journal est vide.
// En REL, estime les barres avec les sessions bout à bout (blanc GAP_BARS entre elles).
function autoGranularity(){
  if(!state.events.length) return;
  const cands = GRANULARITY_LIST.filter(g=>g.ms>=15*60000);
  let pick = cands[cands.length-1].v;
  for(const g of cands){
    let n;
    if(state.hasAnyAbsolute){ const tl = buildTimeline(g.v); n = tl.tooMany ? Infinity : tl.buckets.length; }
    else {   // mode relatif : sessions bout à bout
      const step = g.ms/1000, sess = new Map();
      state.events.forEach(e=>{ if(e.relSec!=null) sess.set(e.session, Math.max(sess.get(e.session)||0, e.relSec)); });
      n = 0; sess.forEach(mx=>{ n += Math.floor(mx/step)+1 + GAP_BARS; });
    }
    if(n<=AUTO_BARS){ pick = g.v; break; }
  }
  state.granularity = pick;
}
// Message d'erreur traduit si la timeline ne peut pas être dessinée (trop de tranches, plage vide), sinon null.
function timelineProblem(tl){
  if(tl.tooMany) return tr('Plage trop large : plus de {max} tranches. Choisis une granularité plus grande, ou réduis les dates et les heures.',{max:MAX_BUCKETS});
  if(tl.buckets.length===0) return tr('Plage vide : vérifie les dates (début après la fin ?) et les heures.');
  return null;
}
// Étiquette d'axe d'une tranche absolue (NTP) : heure:minute sous un jour, sinon jour/mois.
function bucketLabelAbs(ms, gran){
  const d = new Date(ms);
  if(GRANULARITY_MS[gran] < 86400000) return d.toLocaleTimeString(locale(),{hour:'2-digit',minute:'2-digit'});
  return d.toLocaleDateString(locale(),{day:'2-digit',month:'2-digit'});
}
// Étiquette d'axe pour un temps écoulé (REL) en secondes (ex. « 1h23m », ou « 2j 5h » au-delà d'un jour).
function relLabel(sec){
  if(sec>=86400){ return Math.floor(sec/86400)+tr('j')+(Math.floor((sec%86400)/3600)>0?' '+Math.floor((sec%86400)/3600)+'h':''); }
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60);
  return (h>0? h+'h':'') + String(m).padStart(2,'0')+'m';
}
// Transforme chaque série en somme cumulée (contrôle Cumulé) ; renvoie de nouvelles séries.
function cumulativeTransform(series){
  return series.map(s=>{
    let running=0;
    const values = s.values.map(v=>{ running+=v; return running; });
    return Object.assign({}, s, {values});
  });
}

//- MOYENNES -------------------------------------------------------------------------------------//
// Moyennes de votes par tranche (lignes pointillées, valeurs sous les touches) : calcul et lignes à tracer.
// Clés : A–F, Z (spam), Σ (somme). Utilise state.activeButtons, state.avgOn, passesTimeBounds, BUTTON_COLORS, SPAM_COLOR.

// Affichage compact d'une moyenne : entier dès 10, 1 décimale de 1 à 10, 2 décimales sous 1.
function fmtAvg(v){ return v>=10 ? String(Math.round(v)) : v>=1 ? v.toFixed(1) : v.toFixed(2); }
// Moyenne de votes par tranche pour chaque lettre, le spam (Z) et la somme Σ (sans le spam).
// bucketOf(e) = indice de tranche (-1 hors plage) ; n = nombre total de tranches (les vides comptent).
function meansPerBucket(events, bucketOf, n){
  const counts = {Z:0}; state.activeButtons.forEach(b=>counts[b]=0);
  let total = 0;
  events.forEach(e=>{
    const k = e.isSpam ? 'Z' : e.bouton;
    if(!(k in counts)) return;
    const i = bucketOf(e);
    if(i<0 || i>=n) return;
    counts[k]++;
    if(!e.isSpam) total++;
  });
  const means = {};
  state.activeButtons.forEach(b=>{ means[b] = n>0 ? counts[b]/n : 0; });
  means['Z'] = n>0 ? counts.Z/n : 0;
  means['Σ'] = n>0 ? total/n : 0;
  return means;
}
// Événements de la période (bornes appliquées, spam compris), sans filtre de boutons : base des moyennes.
function getAllEventsInPeriod(){ return state.events.filter(passesTimeBounds); }
// Mémorise les moyennes de la vue (lastAvg) pour les valeurs sous les touches ; unit = unité de la tranche.
function setViewAvg(means, unit){ lastAvg = {means, unit}; }
// Lignes de moyenne à tracer : touches de state.avgOn parmi A–F, Z et Σ. En mode Cumulé, une rampe
// (moyenne × tranches écoulées) : le rythme moyen attendu.
// n = nombre de tranches ; renvoie [{name, mean, color, values}] (Σ en gris).
function buildAvgLines(means, n, cumulative){
  if(!means) return [];
  return [...state.activeButtons,'Z','Σ']
    .filter(k=>state.avgOn.has(k) && means[k]!=null)
    .map(k=>({
      name:k, mean:means[k], color:k==='Σ' ? '#BEBEBE' : k==='Z' ? SPAM_COLOR : BUTTON_COLORS[k],
      values:Array.from({length:n},(_,i)=>cumulative ? means[k]*(i+1) : means[k]),
    }));
}
// Plus grande valeur des lignes de moyenne (0 si aucune), pour dimensionner l'axe.
function avgLinesMax(lines){ return lines&&lines.length ? Math.max(0,...lines.flatMap(l=>l.values)) : 0; }

