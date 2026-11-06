//------------------------------------------------------------------------------------------------//
// SONTADEG ARSELLAN                                                      - DICTIONNAIRE ANGLAIS  //
//                                                                                                //
// Traduction anglaise de l'interface. Chaque ligne associe un texte français (la clé, à gauche)  //
// à sa traduction (la valeur, à droite) : exempel   "Charger le résumé": "Load the summary",     //
//------------------------------------------------------------------------------------------------//


//------------------------------------------------------------------------------------------------//
// POUR AJOUTER UNE LANGUE                                                                        //
//  1. Copier ce fichier sous le nom langue-xx.js (xx = code de la langue, par ex. « de »).       //
//  2. Remplacer I18N.en par I18N.xx, puis traduire les valeurs.                                  //
//  3. Dans langues.js, ajouter la langue à LANGS : xx: {name:'Deutsch', locale:'de-DE'},         //
//  4. Dans Sontadeg_Arsellan.html, ajouter <script src="js/langue-xx.js"></script>               //
//     à la suite de celle de langue-en.js.                                                       //
//                                                                                                //
// Une phrase absente d'ici reste en français.                                                    //
// L'ordre des lignes est sans importance : elles sont rangées par zone de l'interface.           //
//------------------------------------------------------------------------------------------------//

"use strict";

I18N.en = {
  //- ACCUEIL ET LECTURE DES FICHIERS ------------------------------------------------------------//
  "Les fichiers chargés dans cette page sont seulement visualisés. Aucune donnée n'est ainsi stockée ni envoyée.": "Files loaded on this page are only displayed. No data is stored or sent.",
  "lecture impossible": "unable to read the file",
  "fichier vide ou illisible (attendu : la question, puis une ligne « réponse;nombre » par bouton)": "empty or unreadable file (expected: the question, then one “answer;count” line per button)",
  "Erreur de lecture du résumé : {msg}": "Could not read the summary: {msg}",
  "aucune ligne de vote reconnue dans le journal": "no vote line recognised in the log",
  "Erreur de lecture du journal : {msg}": "Could not read the log: {msg}",
  "ligne ignorée": "line ignored",
  "lignes ignorées": "lines ignored",
  "Lignes du journal incomplètes ou illisibles (temps, session ou bouton manquant) : elles n'ont pas été prises en compte.": "Incomplete or unreadable log lines (missing time, session or button): they were not counted.",
  "Charge le résumé au format CSV exporté depuis la borne Sontadeg.": "Load the summary CSV exported from the Sontadeg kiosk.",
  "Charger le résumé": "Load the summary",
  "02 · JOURNAL DÉTAILLÉ": "02 · DETAILED LOG",
  "Charge ensuite le détail journalisé des votes au format CSV exporté depuis la borne Sontadeg.": "Then load the detailed vote log (CSV exported from the Sontadeg kiosk).",
  "Journal chargé — charge aussi le résumé au format CSV exporté depuis la borne Sontadeg.": "Log loaded — also load the summary CSV exported from the Sontadeg kiosk.",
  "Charger le journal détaillé": "Load the detailed log",

  //- BANDEAU : RÉSUMÉ ET CHIFFRES CLÉS ----------------------------------------------------------//
  "réponses": "responses",
  "du {d}": "from {d}",
  "au {d}": "to {d}",
  "Dates invraisemblables ({y}) : l'horloge de la borne était peut-être à l'heure de départ, ou le fichier est inhabituel. Les jours de semaine et les dates affichés peuvent être faux.": "Implausible dates ({y}): the kiosk clock may still have been at its start-up time, or the file is unusual. Weekdays and dates shown may be wrong.",
  "session(s) · mode relatif": "session(s) · relative mode",
  "journal non chargé": "log not loaded",
  "Résumé en barres": "Summary as bars",
  "Résumé en anneau": "Summary as ring",
  "Séquences": "Sequences",
  "Exporter le résumé en SVG": "Export the summary as SVG",

  //- PANNEAU LATÉRAL : FILTRES ET RÉGLAGES ------------------------------------------------------//
  "Chronologie": "Timeline",
  "Cycles": "Cycles",
  "Somme (actif) — clique pour revenir au détail par bouton": "Sum (on) — click to go back to the per-button detail",
  "Somme — regroupe tous les boutons en une seule courbe/barre": "Sum — combines all buttons into a single curve/bar",
  "Moyenne de la somme Σ": "Average of the sum Σ",
  "Moyenne du spam Z": "Average of spam Z",
  "Moyenne de {x}": "Average of {x}",
  "Granularité temporelle": "Time granularity",
  "Instantané": "Instant",
  "Cumulé": "Cumulative",
  "Unique": "Single",
  "Barres multiples": "Multiple bars",
  "Lignes": "Lines",
  "Aire": "Area",
  "Σ actif : la courbe grise est la somme de tous les boutons.": "Σ on: the grey curve is the sum of all buttons.",
  "Dates et heures": "Dates and times",
  "Plage horaire de chaque jour (vider un champ rétablit la plage par défaut ; 22:00 → 06:00 traverse minuit)": "Time window of each day (clearing a field restores the default window; 22:00 → 06:00 crosses midnight)",
  "Rétablir les valeurs par défaut": "Restore default values",
  "Temps par session": "Time per session",
  "Depuis (temps depuis le début de chaque session)": "From (time since the start of each session)",
  "Jusqu'à (temps depuis le début de chaque session)": "Until (time since the start of each session)",
  "Temporel": "Temporal",
  "Matrice": "Matrix",
  "Barres": "Bars",
  "Courbes": "Curves",
  "Chaleur": "Heat",
  "Points": "Dots",
  "Bâtons": "Sticks",
  "Heure du jour": "Hour of day",
  "Jour de semaine": "Day of week",
  "Filtres": "Filters",
  "Réglages": "Settings",
  "Fermer": "Close",
  "Affichage": "Display",
  "Fenêtre temporelle": "Time window",
  "Vues": "Views",
  "masquer": "hide",
  "courbes": "curves",
  "barres": "bars",
  "chaleur": "heatmap",
  "points": "dots",
  "batons": "sticks",

  //- SÉQUENCES ----------------------------------------------------------------------------------//
  "Aucune séquence multi-boutons détectée.": "No multi-button sequence detected.",
  "Aucune séquence à cet intervalle.": "No sequence at this interval.",
  "Aucune séquence de cette longueur à cet intervalle.": "No sequence of this length at this interval.",
  "Intervalle de réponse": "Response interval",
  "Longueur de séquence": "Sequence length",
  "jusqu'à {n} boutons": "up to {n} buttons",
  "Lignes affichées": "Lines shown",
  "Toutes": "All",
  "Ordre des appuis respecté (A → F) : cliquer pour les regrouper (A + F)": "Press order kept (A → F): click to group them (A + F)",
  "Ordre des appuis ignoré (A + F) : cliquer pour le respecter (A → F)": "Press order ignored (A + F): click to keep it (A → F)",
  "{n} séquence(s) multi-boutons détectée(s) (sur les clics à {s}s ou moins d'écart).": "{n} multi-button sequence(s) detected (presses {s}s or less apart).",
  "Combinaisons de 2 boutons ou plus pressés ensemble en un même geste.": "Combinations of 2 or more buttons pressed together in a single gesture.",

  //- RÉGLAGES PAR BLOC (☰, MASQUÉS, SESSIONS COLLÉES) -------------------------------------------//
  "ajuster aux votes": "fit to votes",
  "Jours affichés": "Days shown",
  "Masqués": "Hidden",
  "rétablir": "restore",
  "{n} masqués": "{n} hidden",
  "{n} masqué": "{n} hidden",
  "Voir et rétablir les périodes / jours masqués": "Show and restore hidden periods / days",
  "Ajuster aux votes (périodes : 1 h avant et après ; jours : seulement ceux qui ont des votes)": "Fit to votes (periods: 1 h before and after; days: only those with votes)",
  "Réinitialiser": "Reset",
  "Réinitialiser (périodes et jours masqués ou réduits)": "Reset (hidden or shortened periods and days)",
  "Session {n}": "Session {n}",
  "Réglages : {title}": "Settings: {title}",
  "Séparer la session {n} de la précédente": "Separate session {n} from the previous one",
  "Coller la session {n} à la précédente": "Join session {n} to the previous one",
  "Tout est masqué : rétablis une période ou un jour (pastille « masqués »).": "Everything is hidden: restore a period or a day (the “hidden” chip).",
  "Voir et rétablir les jours / sessions masqués": "Show and restore hidden days / sessions",
  "Ajuster tous les jours à leurs votes (1 h avant, 1 h après)": "Fit every day to its votes (1 h before, 1 h after)",
  "Ajuster toutes les sessions à leurs votes": "Fit every session to its votes",
  "Masquer tous les jours": "Hide all days",
  "Masquer toutes les sessions": "Hide all sessions",
  "Coller toutes les sessions": "Join all sessions",
  "Réinitialiser (bornes par jour ou session, masquages, sessions collées)": "Reset (per-day or per-session limits, hidden items, joined sessions)",

  //- GRANULARITÉS, PÉRIODES ET JOURS ------------------------------------------------------------//
  "1 jour": "1 day",
  "3 jours": "3 days",
  "1 semaine": "1 week",
  "2 semaines": "2 weeks",
  "Nuit": "Night",
  "Matin": "Morning",
  "Après-midi": "Afternoon",
  "Soir": "Evening",
  "Jours de la semaine": "Days of the week",
  "Dim": "Sun",
  "Lun": "Mon",
  "Mar": "Tue",
  "Mer": "Wed",
  "Jeu": "Thu",
  "Ven": "Fri",
  "Sam": "Sat",
  "j": "d",
  "Dimanche": "Sunday",
  "Lundi": "Monday",
  "Mardi": "Tuesday",
  "Mercredi": "Wednesday",
  "Jeudi": "Thursday",
  "Vendredi": "Friday",
  "Samedi": "Saturday",

  //- GRAPHIQUES : MESSAGES, ZOOMS ET EXPORT -----------------------------------------------------//
  "Plage trop large : plus de {max} tranches. Choisis une granularité plus grande, ou réduis les dates et les heures.": "Range too wide: more than {max} slots. Pick a coarser granularity, or narrow the dates and hours.",
  "Plage vide : vérifie les dates (début après la fin ?) et les heures.": "Empty range: check the dates (start after end?) and the hours.",
  "moy. {name} {val}": "avg. {name} {val}",
  "pic · {x}": "peak · {x}",
  "Spam": "Spam",
  "Aucune donnée pour ces réglages.": "No data for these settings.",
  "Aucune option sélectionnée.": "No option selected.",
  "Sessions {a} + {z}": "Sessions {a} + {z}",
  "Sessions {a}–{z}": "Sessions {a}–{z}",
  "Somme": "Sum",
  "par tranche de {g}": "per {g} slot",
  "{n} sessions superposées.": "{n} sessions overlaid.",
  "{n} session superposée.": "{n} session overlaid.",
  "Cycles demande des horodatages : ce fichier n'en contient pas.": "Cycles needs timestamps: this file has none.",
  "par jour de semaine": "per day of the week",
  "Zoom horizontal": "Horizontal zoom",
  "Zoom horizontal (double-clic : 100 %)": "Horizontal zoom (double-click: 100%)",
  "Adapté à la largeur de l'écran : clique pour passer en taille réelle (zoom)": "Fitted to screen width: click for actual size (zoom)",
  "Adapter le graphique à la largeur de l'écran": "Fit the chart to the screen width",
  "Zoom vertical": "Vertical zoom",
  "Zoom vertical (double-clic : 100 %)": "Vertical zoom (double-click: 100%)",
  "Adapté à la hauteur de l'écran : clique pour passer en taille réelle (zoom vertical)": "Fitted to screen height: click for actual size (vertical zoom)",
  "Adapter le graphique à la hauteur de l'écran": "Fit the chart to the screen height",
  "Sessions mises bout à bout, temps par session depuis l'allumage.": "Sessions placed end to end, time per session since power-on.",
  "Répartition des votes selon le temps par session depuis l'allumage, toutes sessions superposées.": "Distribution of votes by time per session since power-on, all sessions overlaid.",
  "Graphique très dense : clique sur l'icône de largeur (en bas à droite) pour passer en taille réelle et lire le détail.": "Very dense chart: click the width icon (bottom right) for actual size and read the detail.",
  "Exporter la vue en SVG": "Export the view as SVG",

  //- TITRE DE LA PAGE ET PIED DE PAGE -----------------------------------------------------------//
  "Sontadeg Arsellan — Explorateur de réponses": "Sontadeg Arsellan — Response explorer",
  "Sontadeg Arsellan // Labfab (Edulab Rennes 2) | nov. 2026 v1.2.0 [CC-BY-SA]. Aucune donnée ne quitte ton navigateur.": "Sontadeg Arsellan // Labfab (Edulab Rennes 2) | Nov. 2026 v1.2.0 [CC-BY-SA]. No data leaves your browser.",
};
