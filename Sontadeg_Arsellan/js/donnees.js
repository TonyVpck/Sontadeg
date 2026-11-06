//------------------------------------------------------------------------------------------------//
// SONTADEG ARSELLAN -                                                                            //
// Données : lecture des CSV, Chargement, Filtres, Granularités                                   //
//                                                                                                //
// Parse les fichiers de la borne, extrait les données et calcule les éléments                    //
// d'analyse en gérant les horodatages absolus (NTP) et relatifs (REL).                           //
//------------------------------------------------------------------------------------------------//

"use strict";

//- LECTURE DES CSV ------------------------------------------------------------------------------//

// Lit le journal détaillé (sontadeg_log.csv) et renvoie un tableau d'événements : type, session, bouton, spam,
// temps REL ou date/heure NTP ...
function parseLogCSV(text){
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length);
  const events = [];
  let ignored = 0;
  for(let i=1;i<lines.length;i++){
    const parts = lines[i].split(';');
    if(parts.length<4){ ignored++; continue; }
    const type = parts[0].trim(), temps = parts[2].trim();
    const session = parseInt(parts[1],10);
    const bouton = parts[3].trim().toUpperCase();   // le firmware écrit des majuscules ; on sécurise au cas où
    let relSec=null, epochMs=null;
    if(type==='NTP'){
      if(/^\d+$/.test(temps)) epochMs = parseInt(temps,10)*1000;
    } else if(type==='REL'){
      const m = temps.match(/^(\d+)h(\d+)m(?:(\d+)s)?$/);
      if(m) relSec = parseInt(m[1],10)*3600 + parseInt(m[2],10)*60 + (m[3] ? parseInt(m[3],10) : 0);
    }
    const timeOk = type==='NTP' ? epochMs!==null : type==='REL' ? relSec!==null : false;
    if(!timeOk || isNaN(session) || !bouton){ ignored++; continue; }
    events.push({type, session, relSec, epochMs, absMs:null, bouton, isSpam: bouton==='Z', order:i});
  }
  events.ignoredLines = ignored;
  return events;
}

// Détermine, pour chaque session, si elle possède un ancrage temporel,
//  - S'il y a des dates et heures renseignées (NTP) le timecode est ancré directement (offset 0).
//  - S'il n'y a pas de dates et heures renseignées (REL) le compte de temps passe en mode relatif (combien de
//    temps s'est écoulé depuis l'allumage).
//  - Si la session contient un mix REL+NTP, le script cherchera à reconstruire un NTP pour la session.
function computeAnchors(events){
  const bySession = {};
  events.forEach(e=>{ (bySession[e.session]=bySession[e.session]||[]).push(e); });
  // Regroupe par session en conservant l'ordre du fichier : l'ancrage dépend du voisinage immédiat des lignes.
  const sessionInfo = {};
  Object.entries(bySession).forEach(([sess, evs])=>{
    const hasNTP = evs.some(e=>e.type==='NTP');
    const hasREL = evs.some(e=>e.type==='REL');
    let info;
    if(hasNTP && !hasREL){ info = {hasAnchor:true, offsetMs:0}; }
    else if(hasNTP && hasREL){
      let offset=null;
      for(let i=0;i<evs.length;i++){
        if(evs[i].type==='NTP'){
          const prev=evs[i-1], next=evs[i+1];
          if(prev && prev.type==='REL'){ offset = evs[i].epochMs - prev.relSec*1000; break; }
          if(next && next.type==='REL'){ offset = evs[i].epochMs - next.relSec*1000; break; }
        }
      }
      if(offset===null){
        const firstNTP = evs.find(e=>e.type==='NTP');
        const firstREL = evs.find(e=>e.type==='REL');
        offset = firstNTP.epochMs - firstREL.relSec*1000;
      }
      info = {hasAnchor:true, offsetMs:offset};
    } else {
      info = {hasAnchor:false, offsetMs:null};
    }
    sessionInfo[sess]=info;
  });

  // S'il y a une date et heure, elles sont distribuées sur les événements.
  events.forEach(e=>{
    const info = sessionInfo[e.session];
    if(e.type==='NTP') e.absMs = e.epochMs;
    else if(info.hasAnchor) e.absMs = e.relSec*1000 + info.offsetMs;
    else e.absMs = null;
  });
  return sessionInfo;
}

// Lecture du CSV de résumé (sontadeg_resume.csv)
function parseResumeCSV(text){
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length);
  if(lines.length===0) return null;
  const question = lines[0].split(';')[0];
  const reserved = new Set(['spam','boutons_actifs','sous_titre','commentaire']);
  const optionRows = [];
  let spam=null, boutonsActifs=null, sousTitre=null, commentaire=null;
  for(let i=1;i<lines.length;i++){
    const parts = lines[i].split(';');
    if(parts.length<2) continue;
    const k=parts[0].trim(), v=parts.slice(1).join(';').trim();
    const kl=k.toLowerCase();
    if(kl==='spam') spam=parseInt(v,10);
    else if(kl==='boutons_actifs') boutonsActifs=v;
    else if(kl==='sous_titre') sousTitre=v;
    else if(kl==='commentaire') commentaire=v;
    else optionRows.push({label:k, count:parseInt(v,10)||0});
  }
  return {question, optionRows, spam, boutonsActifs, sousTitre, commentaire};
}

//- CHARGEMENT DES FICHIERS ----------------------------------------------------------------------//

// Lit et charge les fichiers CSV choisis par l'utilisateur. Le résumé (RES) et le journal (LOG) se chargent
// indépendamment.
function readFile(file){
  return new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onload = ()=>resolve(r.result);
    r.onerror = ()=>reject(new Error(tr('lecture impossible')));
    r.readAsText(file, 'UTF-8');
  });
}

// Charge et analyse le résumé (RES)
function loadResumeFile(file, onError){
  readFile(file).then(text=>{
    try{
      const res = parseResumeCSV(text);
      if(!res || (!res.question && res.optionRows.length===0)) throw new Error(tr('fichier vide ou illisible (attendu : la question, puis une ligne « réponse;nombre » par bouton)'));
      state.resume = res; state.resumeError = '';
      deriveState();
      render();
    }catch(err){ state.resumeError = tr('Erreur de lecture du résumé : {msg}',{msg:err.message}); onError(state.resumeError); }
  }).catch(err=>{ state.resumeError = tr('Erreur de lecture du résumé : {msg}',{msg:err.message}); onError(state.resumeError); });
}

// Charge et analyse le journal détaillé (LOG).
function loadLogFile(file, onError){
  readFile(file).then(text=>{
    try{
      const events = parseLogCSV(text);
      if(events.length===0) throw new Error(tr('aucune ligne de vote reconnue dans le journal'));
      computeAnchors(events);
      state.events = events;
      state.ignoredLines = events.ignoredLines || 0;   // Si lignes illisibles écartées (avertissement dans le bandeau)
      state.relGlue = new Set(); state.dayCfg = new Map(); state.sessCfg = new Map(); state.cycCfg = new Map();
      state.seqGap = SEQ_GAP_DEFAULT; state.seqMaxLen = null; state.seqLines = SEQ_LINES_DEFAULT; state.seqOrdered = false;   // réglages de la vue Séquences
      deriveState();
      autoGranularity();
      render();
    }catch(err){ onError(tr('Erreur de lecture du journal : {msg}',{msg:err.message})); }
  }).catch(err=>onError(tr('Erreur de lecture du journal : {msg}',{msg:err.message})));
}

// Recalcule tout ce qui se déduit de ce qui est chargé (résumé RES et/ou journal LOG).
function deriveState(){
  let letters;
  if(state.resume && state.resume.boutonsActifs){
    letters = state.resume.boutonsActifs.trim().split('').filter(c=>/[A-Za-z]/.test(c)).map(c=>c.toUpperCase());
  } else if(state.events.length){
    letters = [...new Set(state.events.filter(e=>!e.isSpam).map(e=>e.bouton))].sort();
  } else if(state.resume && state.resume.optionRows && state.resume.optionRows.length){
    letters = ['A','B','C','D','E','F'].slice(0, state.resume.optionRows.length);
  } else {
    letters = ['A','B','C','D','E','F'];
  }
  state.activeButtons = letters;
  state.filters.buttons = new Set(letters);

  state.optionLabels = {};
  if(state.resume && state.resume.optionRows && state.resume.optionRows.length){
    letters.forEach((L,i)=>{
      if(state.resume.optionRows[i]) state.optionLabels[L] = state.resume.optionRows[i].label;
    });
  }

  // Au moins un horodatage absolu : NTP, ou REL ancré par computeAnchors().
  state.hasAnyAbsolute = state.events.some(e=>e.absMs!=null);
  if(state.events.length){
    // Une séquence multi-boutons est une combinaison d'appuis successifs (une réponse multiple en somme).
    // Cherchée à l'intervalle le plus large : l'icône Séquences reste visible quel que soit le réglage choisi.
    const {sizes} = clusterSequences(state.events, {gap:SEQ_GAP_MAX});
    state.hasAnySequences = Object.values(sizes).some(n=>n>=2);
  } else {
    state.hasAnySequences = false;
  }
}

//- FILTRAGE ET TRAITEMENT DES CSV ---------------------------------------------------------------//

// Indique si les réglages par bloc (jour en NTP ou session en REL).
function blockCfgOn(){ return state.selectedView==='temporal'; }
// Réglages propres au jour.
function dayCfgOf(day){ return (blockCfgOn() && state.dayCfg.size) ? state.dayCfg.get(day) : undefined; }
// Réglages propres à la session.
function sessCfgOf(sess){ return (blockCfgOn() && state.sessCfg.size) ? state.sessCfg.get(sess) : undefined; }
// Fenêtre horaire d'une journée.
function windowForDay(day){
  const g = hourWindow(), c = dayCfgOf(day);
  if(!c || (c.hs==null && c.he==null)) return g;
  const hs = c.hs!=null ? c.hs : g.hs;
  let he = c.he!=null ? c.he : g.he;
  if(he>=1439) he = 1440;
  return {hs, he};
}

// option de masquage, gestion des plages de jours et des fenêtres horaires.
function passesTimeBounds(e){
  if(e.absMs!=null){
    const dayMs = dayKeyOf(e.absMs);
    if(state.filters.dayStart!=null && dayMs < state.filters.dayStart) return false;
    if(state.filters.dayEnd!=null && dayMs > state.filters.dayEnd) return false;
    const c = dayCfgOf(dayMs);
    if(c && c.hidden) return false;
    if(state.filters.hourStart!=null || state.filters.hourEnd!=null || (c && (c.hs!=null || c.he!=null))){
      if(!inDayWindow(e.absMs, dayMs)) return false;
    }
  }
  if(e.relSec!=null){
    const c = sessCfgOf(e.session);
    if(c && c.hidden) return false;
    const lo = c && c.lo!=null ? c.lo : state.filters.relStart;
    const hi = c && c.hi!=null ? c.hi : state.filters.relEnd;
    if(lo!=null && e.relSec < lo) return false;
    if(hi!=null && e.relSec > hi) return false;
  }
  return true;
}

// Filtre de boutons, spam et option bornes temporelles du menu latéral.
function getFilteredEvents(){
  return state.events.filter(e=>{
    if(e.isSpam){ if(!state.filters.spam) return false; }
    else { if(!state.filters.buttons.has(e.bouton)) return false; }
    return passesTimeBounds(e);
  });
}

// Tous les événements hors spam, quelles que soient les boutons cochées (sert à la somme de boutons)
function getAllButtonEventsForSum(){
  return state.events.filter(e => !e.isSpam && passesTimeBounds(e));
}

// Compte du nombre de boutons et de spam total pour la barre de résumé en haut de l'appli.
function computeOverview(){
  const counts={}; state.activeButtons.forEach(b=>counts[b]=0);
  let spam=0;
  if(state.events.length){
    state.events.forEach(e=>{
      if(e.isSpam) spam++;
      else if(counts.hasOwnProperty(e.bouton)) counts[e.bouton]++;
    });
  } else if(state.resume && state.resume.optionRows){
    state.activeButtons.forEach((b,i)=>{
      if(state.resume.optionRows[i]) counts[b] = state.resume.optionRows[i].count || 0;
    });
    spam = state.resume.spam || 0;
  }
  const total = state.activeButtons.reduce((s,b)=>s+counts[b],0);
  return {counts, spam, total};
}

// Bornes des horodatages absolus présents dans le journal.
function dateRangeOfDataset(){
  let min=null, max=null;
  state.events.forEach(e=>{
    if(e.absMs!=null){
      if(min===null||e.absMs<min) min=e.absMs;
      if(max===null||e.absMs>max) max=e.absMs;
    }
  });
  return {min, max};
}

// En mode REL, calcule le nombre de sessions distinctes dans le journal.
function sessionCount(){
  return new Set(state.events.map(e=>e.session)).size;
}

//- FORMATAGE ET GRANULARITES --------------------------------------------------------------------//

// Formatage de l'horodatage dans une norme « jj/mm hh:mm ».
function fmtDate(ms){
  const d = new Date(ms);
  return d.toLocaleDateString(locale(),{day:'2-digit',month:'2-digit'}) + ' ' + d.toLocaleTimeString(locale(),{hour:'2-digit',minute:'2-digit'});
}
// Libellé des lettres de bouton.
function labelFor(letter){
  return state.optionLabels[letter] ? `${letter} — ${state.optionLabels[letter]}` : letter;
}

// Calcule des données en fonction de la granularité.
const GRANULARITY_LIST = [
  {v:'5min',    l:'5 min',     ms:5*60000},
  {v:'10min',   l:'10 min',    ms:10*60000},
  {v:'15min',   l:'15 min',    ms:15*60000},
  {v:'30min',   l:'30 min',    ms:30*60000},
  {v:'1h',      l:'1 h',       ms:3600000},
  {v:'2h',      l:'2 h',       ms:2*3600000},
  {v:'4h',      l:'4 h',       ms:4*3600000},
  {v:'6h',      l:'6 h',       ms:6*3600000},
  {v:'12h',     l:'12 h',      ms:12*3600000},
  {v:'1j',      get l(){ return tr('1 jour'); },    ms:86400000},
  {v:'3j',      get l(){ return tr('3 jours'); },   ms:3*86400000},
  {v:'1semaine',get l(){ return tr('1 semaine'); }, ms:7*86400000},
  {v:'2semaines',get l(){ return tr('2 semaines'); }, ms:14*86400000},
];
// Durée nominale (ms) de chaque granularité.
const GRANULARITY_MS = Object.fromEntries(GRANULARITY_LIST.map(g=>[g.v,g.ms]));
// Granularités strictement inférieures à un jour.
const SUBDAY_GRANULARITIES = GRANULARITY_LIST.filter(g=>g.ms<86400000);

// Aligne les infos de temps en fonction de la granularités.
function alignAbs(ms, gran){
  const bucketMs = GRANULARITY_MS[gran];
  const d = new Date(ms);
  if(bucketMs < 86400000){
    const dayStart = new Date(d); dayStart.setHours(0,0,0,0);
    const offset = d.getTime()-dayStart.getTime();
    return dayStart.getTime() + Math.floor(offset/bucketMs)*bucketMs;
  }
  if(gran==='1j'){ d.setHours(0,0,0,0); return d.getTime(); }
  if(gran==='3j'){
    // numéro du jour calendaire local depuis 1970, regroupé par blocs de 3, puis minuit local de ce jour
    const n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())/86400000);
    return new Date(1970, 0, 1 + n - (((n%3)+3)%3)).getTime();
  }
  if(gran==='1semaine'){
    const day=d.getDay(); const diff=(day===0?-6:1-day); d.setDate(d.getDate()+diff); d.setHours(0,0,0,0); return d.getTime();
  }
  if(gran==='2semaines'){
    // paires de semaines (lundi → dimanche suivant), comptées depuis le lundi 29/12/1969
    const n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())/86400000);
    const monday = n - ((d.getDay()+6)%7);
    return new Date(1970, 0, 1 + (Math.floor((monday+3)/14)*14 - 3)).getTime();
  }
}
