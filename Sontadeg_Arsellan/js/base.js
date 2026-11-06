//------------------------------------------------------------------------------------------------//
// SONTADEG ARSELLAN - BASE : ICÔNES, CONSTANTES ET ÉTAT                                          //
//                                                                                                //
// Graphismes et icônes au format SVG,                                                            //
// Constantes utiles au design de l'appli,                                                         //
// variables et fonctions communes au reste de l'application.                                     //
//------------------------------------------------------------------------------------------------//

"use strict";

//- ICÔNES ET LOGO (SVG) -------------------------------------------------------------------------//
// Logo Sontadeg Arsellan (contours blanc) : affiché dans le bandeau et sur l'écran d'accueil.
const LOGO_SVG = '<svg id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="97 33 341 82">' + '<defs><style>.logo-ln{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:.99px;}</style></defs><path class="logo-ln" d="M164.67,52.46s2.72-1.57,6.18,4.43c3.46,6,.75,7.57.75,7.57"/><rect class="logo-ln" x="159.24" y="52.36" width="9.54" height="16.95" transform="translate(-8.45 90.15) rotate(-30)"/><polyline class="logo-ln" points="156.42 57.22 135.17 69.49 142.1 81.48 163.34 69.22"/><polyline class="logo-ln" points="135.82 70.61 121.09 79.11 126.72 88.87 141.45 80.37"/><polyline class="logo-ln" points="121.72 80.21 107.39 88.49 111.75 96.04 126.09 87.77"/><polyline class="logo-ln" points="111.75 96.04 112.72 97.71 108.33 100.24 102.04 89.35 106.43 86.82 107.39 88.49"/><line class="logo-ln" x1="390.67" y1="97.53" x2="390.67" y2="100.87"/><line class="logo-ln" x1="392.34" y1="99.2" x2="389" y2="99.2"/><line class="logo-ln" x1="427.87" y1="105.01" x2="432.87" y2="110"/><line class="logo-ln" x1="432.87" y1="105.01" x2="427.87" y2="110"/><line class="logo-ln" x1="108.73" y1="63.18" x2="106.18" y2="65.72"/><line class="logo-ln" x1="108.73" y1="65.72" x2="106.18" y2="63.18"/><line class="logo-ln" x1="163.34" y1="92.92" x2="163.34" y2="96.52"/><line class="logo-ln" x1="165.14" y1="94.72" x2="161.54" y2="94.72"/><line class="logo-ln" x1="120.53" y1="44.78" x2="120.53" y2="52.4"/><line class="logo-ln" x1="124.34" y1="48.59" x2="116.71" y2="48.59"/><line class="logo-ln" x1="131.19" y1="108.13" x2="128.65" y2="110.67"/><line class="logo-ln" x1="131.19" y1="110.67" x2="128.65" y2="108.13"/><g><path class="logo-ln" d="M185.56,75.09c1.62,3.83,5.68,6.32,11.02,6.32,6.9,0,11.07-4.29,11.07-9.45,0-11.65-21.28-9.91-21.28-21.04,0-4.58,3.59-8.93,10.67-8.93,4.99,0,8.06,2.2,9.45,5.22"/><path class="logo-ln" d="M229.96,49.23c-9.51,0-11.88,9.91-11.88,16.23,0,7.83,3.59,15.94,11.94,15.94s11.94-8.12,11.94-15.94c0-6.32-2.38-16.23-11.88-16.23"/><path class="logo-ln" d="M274.6,81.41v-24.06c0-5.04-2.32-8.12-6.78-8.12-5.16,0-8.99,4.06-12.52,8.12M255.3,49.23v32.18"/><path class="logo-ln" d="M285.33,52.36h15.25M301.39,79.84c-1.04.93-2.67,1.57-4.64,1.57-3.59,0-5.62-2.03-5.62-6.78v-31.48"/><path class="logo-ln" d="M330.43,81.41c-.17-2.15-.23-5.62-.23-8v-13.91c0-5.62-2.26-10.26-8.99-10.26-4.93,0-7.83,2.26-9.74,6.67M330.2,63.55h-3.54c-11.71,0-16.58,3.07-16.58,9.68,0,4.23,2.55,8.17,8.06,8.17,4.99,0,8.87-3.3,12.06-7.54"/><path class="logo-ln" d="M364.81,73.46c-2.49,4.93-6.26,7.94-11.19,7.94-7.88,0-11.02-7.65-11.02-16.17,0-9.74,3.88-16,10.96-16,4.23,0,8.12,2.2,11.25,7.77M364.81,38.22v43.19"/><path class="logo-ln" d="M378.26,63.72h22.26c0-6.49-2.15-14.49-10.55-14.49-7.25,0-11.83,6.03-11.83,16.23,0,9.22,3.71,15.94,12,15.94,5.45,0,8.46-2.96,9.91-6.38"/><path class="logo-ln" d="M412.81,87.61c1.97,3.3,5.28,4.81,9.57,4.81,6.67,0,10.49-3.71,10.49-10.9v-32.29M432.87,57c-3.13-5.57-7.01-7.77-11.19-7.77-7.13,0-11.02,6.26-11.02,15.42,0,8.23,3.13,15.6,11.02,15.6,4.93,0,8.7-2.78,11.19-7.36"/></g><g><path class="logo-ln" d="M204.27,110.25l-8.18-20.91h-.12l-8.3,20.91M190.3,103.65h11.37"/><path class="logo-ln" d="M210.77,99.6h5.73c3.04,0,5.61-1.86,5.61-5.05,0-2.69-1.83-5.05-5.98-5.05h-5.36M222.51,110.25l-5.45-10.66M210.77,110.25v-20.75"/><path class="logo-ln" d="M228.09,106.88c.87,2.04,3.04,3.38,5.89,3.38,3.69,0,5.92-2.29,5.92-5.05,0-6.23-11.37-5.3-11.37-11.24,0-2.45,1.92-4.77,5.7-4.77,2.66,0,4.31,1.18,5.05,2.79"/><path class="logo-ln" d="M247.01,99.23h10.66M258.19,109.94h-11.18v-20.44h11.18"/><polyline class="logo-ln" points="274.86 109.94 265.01 109.94 265.01 89.19"/><polyline class="logo-ln" points="289.98 109.94 280.12 109.94 280.12 89.19"/><path class="logo-ln" d="M309.68,110.25l-8.18-20.91h-.12l-8.3,20.91M295.71,103.65h11.37"/><polyline class="logo-ln" points="316.18 110.25 316.18 89.34 316.3 89.34 330.31 110.1 330.43 110.1 330.4 89.19"/></g></svg>';

// Icônes svg utilisées dans l'application.
const ICON_RESUME_SVG = '<svg id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 119 123"><defs><style>.icon-r-1{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.82px;}.icon-r-2{fill:#2d2d2d;stroke:#fff;stroke-miterlimit:10;}</style></defs><rect class="icon-r-2" x="9.91" y="11.53" width="99.17" height="99.17"/><g><path class="icon-r-1" d="M32.56,75.94h6.51c3.45,0,6.37-2.11,6.37-5.74,0-3.06-2.08-5.74-6.79-5.74h-6.09M45.9,88.04l-6.19-12.11M32.56,88.04v-23.58"/><path class="icon-r-1" d="M53.81,75.52h12.11M66.52,87.69h-12.7v-23.23h12.7"/><path class="icon-r-1" d="M73.03,84.21c.99,2.32,3.45,3.84,6.69,3.84,4.19,0,6.72-2.6,6.72-5.74,0-7.07-12.91-6.02-12.91-12.77,0-2.78,2.18-5.42,6.47-5.42,3.03,0,4.89,1.34,5.74,3.17"/></g><polyline class="icon-r-1" points="77.36 38.7 59.66 30.71 41.64 38.85"/></svg>';
const ICON_LOG_SVG = '<svg id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 119 123"><defs><style>.icon-l-1{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.82px;}.icon-l-2{fill:#2d2d2d;stroke:#fff;stroke-miterlimit:10;}</style></defs><rect class="icon-l-2" x="9.91" y="12.3" width="99.17" height="99.17"/><g><polyline class="icon-l-1" points="41.68 87.91 30.27 87.91 30.27 63.89"/><path class="icon-l-1" d="M55.55,63.89c-6.78,0-9.4,6.42-9.4,12.16,0,4.81,1.86,12.23,9.43,12.23s9.43-7.42,9.43-12.23c0-5.74-2.62-12.16-9.4-12.16"/><path class="icon-l-1" d="M88.72,69.01c-1.33-3.37-3.8-5.13-7.46-5.13-5.81,0-9.43,4.45-9.43,12.19,0,6.74,2.65,12.19,9.61,12.19,2.87,0,5.24-.93,7.06-2.04v-9.93h-6.35"/></g><polyline class="icon-l-1" points="77.36 38.7 59.66 30.71 41.64 38.85"/></svg>';
const ICON_SEQ_SVG = '<svg id="Calque_1" data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 119 123"><defs><style>.icon-s-1{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.42px;}.icon-s-2{fill:#2d2d2d;}</style></defs><rect class="icon-s-2" x="9.91" y="13.19" width="99.17" height="99.17"/><rect class="icon-s-1" x="21" y="55" width="15" height="15.4"/><line class="icon-s-1" x1="39" y1="62.7" x2="49" y2="62.7"/><polyline class="icon-s-1" points="45 58.7 49 62.7 45 66.7"/><rect class="icon-s-1" x="52" y="55" width="15" height="15.4"/><line class="icon-s-1" x1="70" y1="62.7" x2="80" y2="62.7"/><polyline class="icon-s-1" points="76 58.7 80 62.7 76 66.7"/><rect class="icon-s-1" x="83" y="55" width="15" height="15.4"/></svg>';
const ICON_EXPORT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 119 123"><defs><style>.icon-ne-1{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.82px;}.icon-ne-2{fill:#2d2d2d;}</style></defs><rect class="icon-ne-2" x="9.91" y="12.45" width="99.17" height="99.17"/><polyline class="icon-ne-1" points="41.64 80.66 59.34 88.66 77.36 80.52"/><path class="icon-ne-1" d="M26.55,64.9c1.15,2.72,4.04,4.5,7.84,4.5,4.91,0,7.88-3.05,7.88-6.72,0-8.29-15.14-7.05-15.14-14.97,0-3.26,2.56-6.35,7.59-6.35,3.55,0,5.73,1.57,6.72,3.71"/><polyline class="icon-ne-1" points="48.87 41.35 59.14 69.19 59.3 69.19 69.53 41.35"/><path class="icon-ne-1" d="M95.76,47.25c-1.53-3.88-4.37-5.9-8.58-5.9-6.68,0-10.85,5.11-10.85,14.02,0,7.75,3.05,14.02,11.05,14.02,3.3,0,6.02-1.07,8.13-2.35v-11.43h-7.3"/></svg>';
const ICON_RESET_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 119 123"><defs><style>.icon-vx-1{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.6px;}.icon-vx-2{fill:#2d2d2d;}</style></defs><rect class="icon-vx-2" x="9.91" y="12.45" width="99.17" height="99.17"/><path class="icon-vx-1" d="M59.5,38 A24,24 0 1 1 35.5,62"/><polyline class="icon-vx-1" points="28.5,68 35.5,57 43.5,68"/></svg>';
const ICON_HIDE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 119 123"><defs><style>.icon-nh-1{fill:none;stroke:#fff;stroke-linecap:round;stroke-miterlimit:10;stroke-width:1.82px;}.icon-nh-2{fill:#2d2d2d;}</style></defs><rect class="icon-nh-2" x="9.91" y="12.45" width="99.17" height="99.17"/><path class="icon-nh-1" d="M101.16,68.99s-3.62-24.99-41.66-24.99-41.66,24.99-41.66,24.99"/><circle class="icon-nh-1" cx="59.5" cy="64.97" r="12.5"/><line class="icon-nh-1" x1="35.57" y1="88.91" x2="90.38" y2="34.09"/></svg>';
const ICON_INFO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="7.5" fill="none" stroke="currentColor"/><line x1="9" y1="8" x2="9" y2="13" stroke="currentColor" stroke-linecap="round"/><circle cx="9" cy="5.3" r="0.9" fill="currentColor"/></svg>';
const ICON_FITWIDTH_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><rect x="1.5" y="3.5" width="15" height="11" rx="1.5" fill="none" stroke="currentColor"/><line x1="4.5" y1="9" x2="13.5" y2="9" stroke="currentColor" stroke-linecap="round"/><polyline points="6.5,6.8 4.3,9 6.5,11.2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><polyline points="11.5,6.8 13.7,9 11.5,11.2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_GLUE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 119 123"><defs><style>.icon-vg-1{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.4px;}.icon-vg-2{fill:#2d2d2d;}</style></defs><rect class="icon-vg-2" x="9.91" y="12.45" width="99.17" height="99.17"/><rect class="icon-vg-1" x="24" y="52" width="23" height="22"/><rect class="icon-vg-1" x="47" y="52" width="23" height="22"/><rect class="icon-vg-1" x="70" y="52" width="23" height="22"/><line class="icon-vg-1" x1="59.5" y1="32" x2="59.5" y2="44"/><line class="icon-vg-1" x1="53.5" y1="38" x2="65.5" y2="38"/></svg>';
const ICON_ADJUST_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 119 123"><defs><style>.icon-va-1{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.4px;}.icon-va-2{fill:#2d2d2d;}</style></defs><rect class="icon-va-2" x="9.91" y="12.45" width="99.17" height="99.17"/><line class="icon-va-1" x1="24" y1="62" x2="50" y2="62"/><polyline class="icon-va-1" points="43,54 51,62 43,70"/><line class="icon-va-1" x1="95" y1="62" x2="69" y2="62"/><polyline class="icon-va-1" points="76,54 68,62 76,70"/><line class="icon-va-1" x1="24" y1="44" x2="24" y2="80"/><line class="icon-va-1" x1="95" y1="44" x2="95" y2="80"/></svg>';
const ICON_BARS_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 119 123"><defs><style>.icon-nb-1{fill:none;stroke:#fff;stroke-miterlimit:10;}.icon-nb-2{fill:#2d2d2d;}</style></defs><rect class="icon-nb-2" x="9.91" y="12.45" width="99.17" height="99.17"/><line class="icon-nb-1" x1="24.07" y1="37.48" x2="86.81" y2="37.48"/><line class="icon-nb-1" x1="24.07" y1="49.49" x2="43.63" y2="49.49"/><line class="icon-nb-1" x1="24.07" y1="61.5" x2="70.41" y2="61.5"/><line class="icon-nb-1" x1="24.07" y1="73.51" x2="73.47" y2="73.51"/><line class="icon-nb-1" x1="24.07" y1="85.52" x2="56.05" y2="85.52"/></svg>';
const ICON_RING_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 119 123"><defs><style>.icon-nr-1{fill:none;stroke:#fff;stroke-miterlimit:10;}.icon-nr-2{fill:#2d2d2d;}</style></defs><rect class="icon-nr-2" x="9.91" y="12.45" width="99.17" height="99.17"/><line class="icon-nr-1" x1="79.79" y1="78.71" x2="84.18" y2="82.31"/><line class="icon-nr-1" x1="34.82" y1="41.77" x2="39.21" y2="45.37"/><line class="icon-nr-1" x1="89.95" y1="52.41" x2="84.54" y2="54.12"/><line class="icon-nr-1" x1="34.46" y1="69.96" x2="29.05" y2="71.67"/><line class="icon-nr-1" x1="59.5" y1="88.3" x2="59.5" y2="93.98"/><circle class="icon-nr-1" cx="59.5" cy="62.03" r="29.02"/></svg>';
// Bascule « ordre des appuis » de la vue Séquences : A → F (ordre respecté, bouton actif) ou A + F (ordre
// ignoré, défaut).
const ICON_ORDER_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 119 123"><defs><style>.icon-od-1{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.42px;}.icon-od-2{fill:#2d2d2d;}</style></defs><rect class="icon-od-2" x="9.91" y="13.19" width="99.17" height="99.17"/><path class="icon-od-1" d="M39.3,75.16l-9.34-23.89h-.14l-9.48,23.89M23.34,67.62h12.99"/><polyline class="icon-od-1" points="59.24 71.08 75.23 62.8 75.23 62.66 59.24 54.38"/><line class="icon-od-1" x1="75.23" y1="62.66" x2="46.6" y2="62.66"/><path class="icon-od-1" d="M84.54,62.88h11.47M84.54,75.16v-23.71h12.07"/></svg>';
const ICON_ORDER_OFF_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 119 123"><defs><style>.icon-oo-1{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.42px;}.icon-oo-2{fill:#2d2d2d;}</style></defs><rect class="icon-oo-2" x="9.91" y="13.19" width="99.17" height="99.17"/><path class="icon-oo-1" d="M39.3,75.16l-9.34-23.89h-.14l-9.48,23.89M23.34,67.62h12.99"/><line class="icon-oo-1" x1="53" y1="62.7" x2="71" y2="62.7"/><line class="icon-oo-1" x1="62" y1="53.7" x2="62" y2="71.7"/><path class="icon-oo-1" d="M84.54,62.88h11.47M84.54,75.16v-23.71h12.07"/></svg>';

// Note de confidentialité
function privacyNote(){
  const el = document.createElement('p'); el.className = 'privacy-note';
  el.innerHTML = ICON_INFO_SVG + '<span>' + tr('Les fichiers chargés dans cette page sont seulement visualisés. Aucune donnée n\'est ainsi stockée ni envoyée.') + '</span>';
  return el;
}

//- CONSTANTES -----------------------------------------------------------------------------------//
// couleurs utilisées, familles de graphiques, seuils et libellés
// attention, les couleurs des boutons existent aussi dans le CSS (les modifier aux deux endroits si besoin)
const BUTTON_COLORS = {A:'#E3A34E', B:'#4FA8A0', C:'#9C86D6', D:'#D97C93', E:'#5F9BD1', F:'#8FBF63'};        // Couleur des boutons (identique à --btn-A…--btn-F dans le style.css à la section BASE).
const CHART_FAMILY_OF = {line:'temporal', bar:'temporal', heatmap:'matrix', dots:'matrix', baton:'matrix'};  // Familles de graphiques
function matrixCellMode(v){ return v==='dots'?'dots' : v==='baton'?'baton' : 'grid'; }                       // Différents rendus de la matrice.
const SPAM_COLOR = '#8A8A8A';                                                                                // Gris des spam Z (identique à --spam dans le style.css à la section BASE).
const VIEWS = [                                                                                              // Type de vue entre linéaire ou cyclique
  {id:'temporal', get label(){ return tr('Chronologie'); }},
  {id:'cycles',   get label(){ return tr('Cycles'); }},
];
// Vue Séquences : réglages proposés (durées en secondes, le journal est à la seconde près).
const SEQ_GAP_DEFAULT = 5;                                            // Intervalle de réponse par défaut : écart maximal entre deux appuis consécutifs d'une même séquence (cf. clusterSequences).
const SEQ_GAP_OPTIONS = [1.5, 2, 2.5, 3, 3.5, 4, 5, 10, 15, 20, 30];  // Valeurs proposées dans le menu « Intervalle de réponse ».
const SEQ_GAP_MAX = 30;                                               // Intervalle le plus large : sert à savoir s'il existe des séquences (icône du bandeau).
const SEQ_LINES_OPTIONS = [5, 10, 15, 30, null];                      // Nombres de lignes affichées dans le classement (null = toutes).
const SEQ_LINES_DEFAULT = 15;                                         // Nombre de lignes affichées par défaut.
const SEQ_LEN_MAX = 6;                                                // Longueur maximale d'une séquence (nombre de boutons différents).
const WEEKDAY_LABELS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];   // Jours de la semaine (clés françaises : toujours lues via tr(WEEKDAY_LABELS[d]))

//- ÉTAT -----------------------------------------------------------------------------------------//
// Variables globales de l'application (données chargées, réglages des vues, filtres).

const state = {
  //- DONNÉES CHARGÉES ---------------------------------------------------------------------------//
  events: [],                               // événements parsés du journal (vide tant qu'il n'est pas chargé)
  ignoredLines: 0,                          // lignes illisibles écartées à la lecture du journal (avertissement dans le bandeau)
  activeButtons: ['A','B','C','D','E','F'], // lettres réellement actives (via boutons_actifs ou déduites du journal)
  optionLabels: {},                         // lettre -> texte de l'option (depuis le résumé)
  resume: null,                             // résumé parsé (question, sous-titre, comptes déclarés...)
  hasAnyAbsolute: false,                    // au moins un événement a-t-il un horodatage absolu (NTP ou REL ancré) ?
  hasAnySequences: false,                   // le journal contient-il des séquences multi-boutons ? (calculé par deriveState)
  
  //- VUE ACTIVE ET OPTIONS D'AFFICHAGE ----------------------------------------------------------//
  selectedView: 'temporal',                                      // vue active : 'temporal', 'cycles' ou 'sequences'
  filters: { buttons: new Set(['A','B','C','D','E','F']),        // Boutons actifs ou non trouvé dans le CSV
  spam:false, dayStart:null, dayEnd:null, hourStart:null, hourEnd:null, relStart:null, relEnd:null },
  
  //- CHRONOLOGIE (VUE « TEMPORAL ») -------------------------------------------------------------//
  granularity: '15min',           // taille de tranche pour Dans le temps (Courbes/Barres/Chaleur/Points/Bâtons)
  tempoShape: 'interval',         // 'interval' ou 'alt' ('alt' = Aire en Courbes, Barres multiples en Barres)
  tempoMode: 'detail',            // 'detail' ou 'sum' — le mode Somme (Σ) : voir renderTemporalView
  bannerResultMode: 'bars',       // 'bars' ou 'ring' — résumé du bandeau en barres ou en anneau
  
  //- CYCLES -------------------------------------------------------------------------------------//
  cyclesShape: 'interval',         // Cycles : 'interval' ou 'alt' (Aire en Courbes, Barres multiples en Barres)
  cyclesCumulative: false,         // Cycles : Cumulé actif ou non
  tempoCumulative: false,          // Cumulé actif ou non (Dans le temps)
  
  //- ZOOM ET TAILLE DES GRAPHIQUES --------------------------------------------------------------//
  vFit: 'fit',                     // hauteur : 'fit' (remplit l'écran) ou 'real' (320 px × zoom vertical)
  vzoom: 1,                        // zoom vertical en taille réelle : 0,5 à 3
  zoom: 1,                         // zoom horizontal (Taille réelle seulement) : 0,1 à 4, 1 = largeur par tranche d'origine
  fitMode: 'fit',                  // largeur des graphiques : 'fit' (adapter à l'écran) ou 'real' (taille réelle, avec ascenseur)
  
  //- RÉGLAGES PAR BLOC (CYCLES) ----------------------------------------------------------------//
  // Période/jour de semaine ; NTP : jour ; REL : session).
  cycCfg: new Map(),               // Cycles : réglages par période et par jour de semaine.
  dayCfg: new Map(),               // en mode NTP : réglages propres à un jour.
  sessCfg: new Map(),              // en mode REL : réglages propres à une session.
  relGlue: new Set(),              // en mode REL : sessions « collées » à la précédente (ids de session)
  
  //- TYPE DE GRAPHIQUE, MODE ET MOYENNES --------------------------------------------------------//
  chartType: { temporal:'bar', cycles:'bar' }, // type de graphique actif par vue (voir CHART_FAMILY_OF)
  cyclesMode: 'hour',                          // Cycles : 'hour' (heure du jour) ou 'weekday' (jour de semaine)
  cyclesGranularity: '1h',                     // largeur des tranches horaires en mode Cycles (sous-journalier uniquement)
  //- SÉQUENCES (remis à zéro à chaque nouveau journal) ------------------------------------------//
  seqGap: SEQ_GAP_DEFAULT,         // intervalle de réponse : écart maximal (s) entre deux appuis d'une même séquence
  seqMaxLen: null,                 // longueur maximale (boutons différents) ; null = toutes, jusqu'au nombre de boutons actifs
  seqLines: SEQ_LINES_DEFAULT,     // nombre de lignes du classement ; null = toutes
  seqOrdered: false,               // false : « A + C » (combinaison) ; true : « A → C » (ordre des appuis respecté)

  //- MOYENNES -----------------------------------------------------------------------------------//
  avgOn: new Set(),                            // touches « moyennes » actives : lettres et/ou 'Σ' (désactivées par défaut)
};

// Moyennes de la vue en cours (posées par chaque vue pendant renderViz() et renderAvgKeys(). null quand la vue
// n'a rien à moyenner (état vide, Séquences...).
let lastAvg = null;

