//------------------------------------------------------------------------------------------------//
// SONTADEG ARSELLAN - LANGUES (TRADUCTION DE L'INTERFACE)                                        //
//                                                                                                //
// Traduit l'interface et propose le choix de la langue.                                          //
// Les textes sont écrits en français dans le code, entre tr('…') : c'est la langue source.       //
// Pour une autre langue, tr() cherche la phrase dans le dictionnaire I18N.<code>, sinon garde    //
// le français. Valeurs variables : {nom}, par exemple tr('Session {n}', {n:3}).                  //
// Attention : la phrase française sert de clé. La modifier sans mettre à jour les dictionnaires  //
// la fait retomber en français, sans erreur.                                                     //
// Ajouter une langue : voir l'en-tête de langue-en.js.                                           //
// Chargé en premier, puis les dictionnaires (langue-en.js…) ; dépend de render() (interface.js). //
//------------------------------------------------------------------------------------------------//

"use strict";

//- LANGUES (I18N) -------------------------------------------------------------------------------//
// Langues disponibles : nom affiché dans le sélecteur et code de formatage des dates et nombres.
const LANGS = {
  fr: {name:'Français', locale:'fr-FR'},
  en: {name:'English',  locale:'en-GB'},
};
// Langue de départ : celle du navigateur si elle est dans LANGS, sinon le français (rien n'est mémorisé).
function detectLang(){
  const wanted = ((navigator.languages && navigator.languages[0]) || navigator.language || 'fr').slice(0,2).toLowerCase();
  return LANGS[wanted] ? wanted : 'fr';
}
// Langue active (code de LANGS), modifiée seulement par setLang().
let LANG = detectLang();
// Code de formatage de la langue active (ex. « fr-FR »).
function locale(){ return LANGS[LANG].locale; }
// Secondes écrites selon la langue (virgule en français : 2,5 ; point en anglais : 2.5).
function fmtSeconds(n){ return LANG==='fr' ? String(n).replace('.',',') : String(n); }
// Met à jour les textes hors du rendu principal : titre de l'onglet, langue du document, pied de page.
function applyStatic(){
  document.documentElement.lang = LANG;
  document.title = tr('Sontadeg Arsellan — Explorateur de réponses');
  const f = document.getElementById('app-footer');
  if(f) f.textContent = tr('Sontadeg Arsellan // Labfab (Edulab Rennes 2) | nov. 2026 v1.2.0 [CC-BY-SA]. Aucune donnée ne quitte ton navigateur.');
}
// Change de langue puis redessine toute l'application.
function setLang(code){ if(!LANGS[code] || code===LANG) return; LANG = code; applyStatic(); render(); }
// Sélecteur de langue : deux lettres sans cadre (« FR »), un clic ouvre le menu des langues de LANGS.
// Le menu se ferme au clic extérieur ou sur Échap.
function langPicker(){
  const box = document.createElement('div'); box.className = 'lang-pick';
  const head = document.createElement('button'); head.type = 'button'; head.textContent = LANG.toUpperCase();
  head.setAttribute('aria-label','Language / Langue'); head.setAttribute('aria-haspopup','listbox'); head.setAttribute('aria-expanded','false');
  const menu = document.createElement('div'); menu.className = 'lang-menu'; menu.setAttribute('role','listbox'); menu.hidden = true;
  Object.keys(LANGS).forEach(code=>{
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role','option');
    b.textContent = code.toUpperCase()+' · '+LANGS[code].name;
    if(code===LANG){ b.className = 'on'; b.setAttribute('aria-selected','true'); }
    b.addEventListener('click', ()=>{ close(); setLang(code); });
    menu.appendChild(b);
  });
  function close(){ menu.hidden = true; box.classList.remove('open'); head.setAttribute('aria-expanded','false'); document.removeEventListener('click', outside, true); document.removeEventListener('keydown', onKey, true); }
  function outside(e){ if(!box.contains(e.target)) close(); }
  function onKey(e){ if(e.key==='Escape') close(); }
  head.addEventListener('click', ()=>{
    if(!menu.hidden){ close(); return; }
    menu.hidden = false; box.classList.add('open'); head.setAttribute('aria-expanded','true');
    document.addEventListener('click', outside, true); document.addEventListener('keydown', onKey, true);
  });
  box.appendChild(head); box.appendChild(menu);
  return box;
}
// Traduit une phrase française (qui sert de clé) vers la langue active ; vars remplace les marqueurs {nom}.
// Sans traduction connue, la phrase reste en français.
function tr(fr, vars){
  const dict = I18N[LANG];
  let out = (dict && dict[fr]!==undefined) ? dict[fr] : fr;
  if(vars) out = out.replace(/\{(\w+)\}/g, (m,k)=> vars[k]!==undefined ? vars[k] : m);
  return out;
}
// Dictionnaires par langue, remplis par les fichiers langue-xx.js (le français n'en a pas besoin).
const I18N = {};

