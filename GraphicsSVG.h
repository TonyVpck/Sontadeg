//-------------------------------------------------------------------------------------------//
// Fichier graphique au format SVG                                                  ---------//
//                                                                                  ---------//
// *contient les élément graphique de Sontadeg                                      ---------//
// *design des icones par Tony Vanpoucke                                            ---------//
//-------------------------------------------------------------------------------------------//

#ifndef GraphicsSVG_H
#define GraphicsSVG_H

// Logo Sontadeg en SVG
String sontadegLogoHTML() {
  String html = "<div class=\"logo\">\n";
  html += "<svg viewBox=\"0 0 377 117\" fill=\"none\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2.32\">\n";
  html += "<path d=\"M92.09,70.04c1.62,3.83,5.68,6.32,11.02,6.32,6.9,0,11.07-4.29,11.07-9.45,0-11.65-21.28-9.91-21.28-21.04,0-4.58,3.59-8.93,10.67-8.93,4.99,0,8.06,2.2,9.45,5.22\"/>\n";
  html += "<path d=\"M136.49,44.18c-9.51,0-11.88,9.91-11.88,16.23,0,7.83,3.59,15.94,11.94,15.94s11.94-8.12,11.94-15.94c0-6.32-2.38-16.23-11.88-16.23\"/>\n";
  html += "<path d=\"M181.13,76.36v-24.06c0-5.04-2.32-8.12-6.78-8.12-5.16,0-8.99,4.06-12.52,8.12M161.83,44.18v32.18\"/>\n";
  html += "<path d=\"M191.86,47.31h15.25M207.92,74.79c-1.04.93-2.67,1.57-4.64,1.57-3.59,0-5.62-2.03-5.62-6.78v-31.48\"/>\n";
  html += "<path d=\"M236.96,76.36c-.17-2.15-.23-5.62-.23-8v-13.91c0-5.62-2.26-10.26-8.99-10.26-4.93,0-7.83,2.26-9.74,6.67M236.73,58.5h-3.54c-11.71,0-16.58,3.07-16.58,9.68,0,4.23,2.55,8.17,8.06,8.17,4.99,0,8.87-3.3,12.06-7.54\"/>\n";
  html += "<path d=\"M271.34,68.41c-2.49,4.93-6.26,7.94-11.19,7.94-7.88,0-11.02-7.65-11.02-16.17,0-9.74,3.88-16,10.96-16,4.23,0,8.12,2.2,11.25,7.77M271.34,33.17v43.19\"/>\n";
  html += "<path d=\"M284.79,58.67h22.26c0-6.49-2.15-14.49-10.55-14.49-7.25,0-11.83,6.03-11.83,16.23,0,9.22,3.71,15.94,12,15.94,5.45,0,8.46-2.96,9.91-6.38\"/>\n";
  html += "<path d=\"M319.34,82.56c1.97,3.3,5.28,4.81,9.57,4.81,6.67,0,10.49-3.71,10.49-10.9v-32.29M339.4,51.95c-3.13-5.57-7.01-7.77-11.19-7.77-7.13,0-11.02,6.26-11.02,15.42,0,8.23,3.13,15.6,11.02,15.6,4.93,0,8.7-2.78,11.19-7.36\"/>\n";
  html += "<rect x=\"8.07\" y=\"8.91\" width=\"360.86\" height=\"99.17\" fill=\"none\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2.32\"/>\n";
  html += "</svg>\n";
  html += "</div>\n";
  return html;
}

// Icone "start" de démmarage de sondage
String sondageStartSvgHTML() {
    String html = "<button class=\"export-button\" type=\"submit\" name=\"formAction\" value=\"start\">\n";
    html += "<svg viewBox='0 0 119 123'>\n";
    html += "<rect x='9.91' y='11.91' width='99.17' height='99.17' fill='#888' stroke='none'/>\n";
    html += "<polygon points='45.05 75.56 78.57 61.63 44.43 47.44 50.31 61.5 45.05 75.56' fill='none' stroke='#fff' stroke-width='1.82' stroke-linecap='round' stroke-linejoin='round'/>\n";
    html += "</svg>\n";
    html += "</button>\n";
  return html;
}

// Icone de porte pour une redirection vers la page root
String redirectSvgHTML() {
  String html = "<svg viewBox=\"0 0 119 123\">\n";
  html += "<rect x=\"9.91\" y=\"12.42\" width=\"99.17\" height=\"99.17\" fill=\"#888\" stroke=\"none\"/>\n";
  html += "<polyline points=\"45.79 84.3 45.79 39.71 73.46 39.71 73.46 84.3\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.82\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n";
  html += "<line x1=\"37.06\" y1=\"84.3\" x2=\"82.19\" y2=\"84.3\" stroke=\"#fff\" stroke-width=\"1.82\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n";
  html += "<line x1=\"64.92\" y1=\"62.01\" x2=\"68.68\" y2=\"62.01\" stroke=\"#fff\" stroke-width=\"1.82\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n";
  html += "</svg>\n";
  return html;
}

// Icone Ok servant à sauvegarder
String SaveOKSvgHTML() {
  String html = "<svg viewBox='0 0 119 123'>\n";
  html += "<rect x='10.41' y='11.91' width='99.17' height='99.17' stroke='#fff' stroke-width='0' fill='#888' stroke-linecap='round' stroke-linejoin='round'/>\n";
  html += "<path d='M48.26,47.94c-7.39,0-10.24,7-10.24,13.25,0,5.24,2.03,13.33,10.28,13.33s10.28-8.09,10.28-13.33c0-6.26-2.85-13.25-10.24-13.25' stroke='#fff' stroke-width='2.32' fill='none' stroke-linecap='round' stroke-linejoin='round'/>\n";
  html += "<path d='M80.98,74.53l-10.87-11.81,10.01-9.89M67.77,45.4v29.13' stroke='#fff' stroke-width='2.32' fill='none' stroke-linecap='round' stroke-linejoin='round'/>\n";
  html += "</svg>\n";
  return html;
}

// Icone "+" servant à se rendre dans la page config
String PlusSvgHTML() {
  String html = "<svg viewBox=\"0 0 119 123\">\n";
  html += "<rect x=\"10.41\" y=\"11.91\" width=\"99.17\" height=\"99.17\" stroke=\"#fff\" stroke-width=\"0\" fill=\"#888\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n";
  html += "<line x1=\"59.5\" y1=\"47.94\" x2=\"59.5\" y2=\"74.65\" stroke=\"#fff\" stroke-width=\"2.32\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n";
  html += "<line x1=\"72.85\" y1=\"61.17\" x2=\"46.15\" y2=\"61.17\" stroke=\"#fff\" stroke-width=\"2.32\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n";
  html += "</svg>\n";
  return html;
}

// Icone de sauvegarde du résumé des résultats 
String ResumeSvgHTML() {
  String html = "<svg viewBox=\"0 0 119 123\">\n";
  html += "<rect x=\"9.91\" y=\"11.91\" width=\"99.17\" height=\"99.17\" fill=\"#888\" stroke=\"none\"/>\n";
  html += "<path d=\"M32.56,58h6.51c3.45,0,6.37-2.11,6.37-5.74,0-3.06-2.08-5.74-6.79-5.74h-6.09M45.9,70.11l-6.19-12.11M32.56,70.11v-23.58\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.82\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n";
  html += "<path d=\"M53.82,57.58h12.11M66.52,69.75h-12.7v-23.23h12.7\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.82\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n";
  html += "<path d=\"M73.03,66.27c.99,2.32,3.45,3.84,6.69,3.84,4.19,0,6.72-2.6,6.72-5.74,0-7.07-12.91-6.02-12.91-12.77,0-2.78,2.18-5.42,6.47-5.42,3.03,0,4.89,1.34,5.74,3.17\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.82\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n";
  html += "<polyline points=\"41.64 80.21 59.34 88.2 77.36 80.06\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.82\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n";
  html += "</svg>\n";
  return html;
}

// Icone de sauvegarde du journal des votes (log)
String LogSvgHTML() {
  String html = "<svg viewBox=\"0 0 119 123\">\n";
  html +=  "<rect x=\"9.91\" y=\"12.68\" width=\"99.17\" height=\"99.17\" fill=\"#888\" stroke=\"none\"/>\n";
  html +=  "<polyline points=\"41.68 70.2 30.27 70.2 30.27 46.18\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.82\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n";
  html +=  "<path d=\"M55.56,46.18c-6.78,0-9.4,6.42-9.4,12.16,0,4.81,1.86,12.23,9.43,12.23s9.43-7.42,9.43-12.23c0-5.74-2.62-12.16-9.4-12.16\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.82\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n";
  html +=  "<path d=\"M88.73,51.31c-1.33-3.37-3.8-5.13-7.46-5.13-5.81,0-9.43,4.45-9.43,12.19,0,6.74,2.65,12.19,9.61,12.19,2.87,0,5.24-.93,7.06-2.04v-9.93h-6.35\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.82\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n";
  html +=  "<polyline points=\"41.64 80.66 59.34 88.66 77.36 80.52\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.82\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n";
  html +=  "</svg>\n";
  return html;
}

#endif