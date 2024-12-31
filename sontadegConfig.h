String SendConfig(String NomduReseau, String MotdePasse, int DelaiInterReponse, int DelaiAntiSpam, int SeuilSpamBtn, int ToleranceSpam, int MultiReponse, int Red, int Green, int Blue, int LedActive, int BoutonAnim) {
  String pageWeb = "<!DOCTYPE html><html lang=\"fr\">\n";
  pageWeb += "<head>\n";
  pageWeb += "<meta charset=\"UTF-8\">\n";
  pageWeb += "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n";
  pageWeb += "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n";
  pageWeb += "<title>Sontadeg</title>\n";
  pageWeb += "<style>\n";

  pageWeb += "body {\n";
  pageWeb += "  font-family: Arial, sans-serif;\n";
  pageWeb += "  background-color: #3D3D3D;\n";
  pageWeb += "  color: white;\n";
  pageWeb += "  text-align: center;\n";
  pageWeb += "  padding: 20px;\n";
  pageWeb += "  display: flex;\n";
  pageWeb += "  flex-direction: column;\n";
  pageWeb += "  min-height: 100vh;\n";
  pageWeb += "}\n";

  pageWeb += ".form-container {\n";
  pageWeb += "  display: flex;\n";
  pageWeb += "  flex-direction: column;\n";
  pageWeb += "  align-items: center;\n";
  pageWeb += "  width: 100%;\n";
  pageWeb += "}\n";

  pageWeb += ".container {\n";
  pageWeb += "  display: flex;\n";
  pageWeb += "  justify-content: flex-start;\n";
  pageWeb += "  align-items: center;\n";
  pageWeb += "  margin: 10px 0;\n";
  pageWeb += "  width: 300px;\n";
  pageWeb += "}\n";

  pageWeb += ".label {\n";
  pageWeb += "  font-size: 16px;\n";
  pageWeb += "  color: #ddd;\n";
  pageWeb += "  text-align: left;\n";
  pageWeb += "  margin-right: 5px;\n";
  pageWeb += "  width: 200px;\n";
  pageWeb += "}\n";

  pageWeb += ".tooltip {\n";
  pageWeb += "  position: relative;\n";
  pageWeb += "  display: inline-block;\n";
  pageWeb += "  cursor: pointer;\n";
  pageWeb += "}\n";

  pageWeb += ".tooltip .tooltiptext {\n";
  pageWeb += "  visibility: hidden;\n";
  pageWeb += "  width: 300px;\n";
  pageWeb += "  background-color: #555;\n";
  pageWeb += "  color: #fff;\n";
  pageWeb += "  text-align: center;\n";
  pageWeb += "  border-radius: 5px;\n";
  pageWeb += "  padding: 5px;\n";
  pageWeb += "  position: absolute;\n";
  pageWeb += "  z-index: 1;\n";
  pageWeb += "  bottom: 100%;\n";
  pageWeb += "  left: 50%;\n";
  pageWeb += "  margin-left: -100px;\n";
  pageWeb += "  opacity: 0;\n";
  pageWeb += "  transition: opacity 0.4s;\n";
  pageWeb += "}\n";

  pageWeb += ".tooltip:hover .tooltiptext {\n";
  pageWeb += "  visibility: visible;\n";
  pageWeb += "  opacity: 1;\n";
  pageWeb += "}\n";

  pageWeb += ".editable {\n";
  pageWeb += "  border: none;\n";
  pageWeb += "  background: none;\n";
  pageWeb += "  color: white;\n";
  pageWeb += "  font-size: 16px;\n";
  pageWeb += "  font-weight: 550;\n";
  pageWeb += "  resize: none;\n";
  pageWeb += "  outline: none;\n";
  pageWeb += "  box-sizing: border-box;\n";
  pageWeb += "  width: 100px;\n";
  pageWeb += "  margin: 0 10px;\n";
  pageWeb += "  padding: 5px;\n";
  pageWeb += "  text-align: left; /* Aligner le texte des champs de saisie à gauche */\n";
  pageWeb += "}\n";
  pageWeb += "input[type=number]::-webkit-outer-spin-button,\n";
  pageWeb += "input[type=number]::-webkit-inner-spin-button {\n";
  pageWeb += "  -webkit-appearance: none;\n";
  pageWeb += "  margin: 0;\n";
  pageWeb += "}\n";
  pageWeb += "input[type=number] {\n";
  pageWeb += "  -moz-appearance: textfield;\n";
  pageWeb += "}\n";

  pageWeb += ".editablequestion {\n";
  pageWeb += "  border: none;\n";
  pageWeb += "  background: none;\n";
  pageWeb += "  width: 100%;\n";
  pageWeb += "  color: white;\n";
  pageWeb += "  font-size: 22px;\n";
  pageWeb += "  font-weight: bold;\n";
  pageWeb += "  text-align: center;\n";
  pageWeb += "  resize: none;\n";
  pageWeb += "  outline: none;\n";
  pageWeb += "}\n";

  pageWeb += ".export-buttons-container {\n";
  pageWeb += "  display: flex;\n";
  pageWeb += "  justify-content: center;\n";
  pageWeb += "  gap: 20px;\n";
  pageWeb += "  margin-top: 30px;\n";
  pageWeb += "}\n";

  pageWeb += ".export-button {\n";
  pageWeb += "  padding: 0;\n";
  pageWeb += "  background-color: transparent;\n";
  pageWeb += "  border: none;\n";
  pageWeb += "  cursor: pointer;\n";
  pageWeb += "  display: flex;\n";
  pageWeb += "  align-items: center;\n";
  pageWeb += "  justify-content: center;\n";
  pageWeb += "}\n";

  pageWeb += ".export-button svg {\n";
  pageWeb += "  width: 90px;\n";
  pageWeb += "  height: 90px;\n";
  pageWeb += "  stroke: #fff;\n";
  pageWeb += "}\n";

  pageWeb += ".logo {\n";
  pageWeb += "  width: 100%;\n";
  pageWeb += "  max-width: 300px;\n";
  pageWeb += "  margin: 0 auto;\n";
  pageWeb += "}\n";

  pageWeb += "footer {\n";
  pageWeb += "  text-align: center;\n";
  pageWeb += "  padding: 10px 0;\n";
  pageWeb += "  color: #888;\n";
  pageWeb += "}\n";

  pageWeb += "footer a {\n";
  pageWeb += "  color: #007BFF;\n";
  pageWeb += "  text-decoration: none;\n";
  pageWeb += "}\n";

  pageWeb += "footer a:hover {\n";
  pageWeb += "  text-decoration: underline;\n";
  pageWeb += "}\n";
  pageWeb += "</style>\n";
  pageWeb += "</head>\n";
  pageWeb += "<body>\n";

  pageWeb += "<div class=\"logo\">\n";
  pageWeb += "<svg viewBox=\"0 0 377 117\" fill=\"none\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2.32\">\n";
  pageWeb += "<path d=\"M92.09,70.04c1.62,3.83,5.68,6.32,11.02,6.32,6.9,0,11.07-4.29,11.07-9.45,0-11.65-21.28-9.91-21.28-21.04,0-4.58,3.59-8.93,10.67-8.93,4.99,0,8.06,2.2,9.45,5.22\"/>\n";
  pageWeb += "<path d=\"M136.49,44.18c-9.51,0-11.88,9.91-11.88,16.23,0,7.83,3.59,15.94,11.94,15.94s11.94-8.12,11.94-15.94c0-6.32-2.38-16.23-11.88-16.23\"/>\n";
  pageWeb += "<path d=\"M181.13,76.36v-24.06c0-5.04-2.32-8.12-6.78-8.12-5.16,0-8.99,4.06-12.52,8.12M161.83,44.18v32.18\"/>\n";
  pageWeb += "<path d=\"M191.86,47.31h15.25M207.92,74.79c-1.04.93-2.67,1.57-4.64,1.57-3.59,0-5.62-2.03-5.62-6.78v-31.48\"/>\n";
  pageWeb += "<path d=\"M236.96,76.36c-.17-2.15-.23-5.62-.23-8v-13.91c0-5.62-2.26-10.26-8.99-10.26-4.93,0-7.83,2.26-9.74,6.67M236.73,58.5h-3.54c-11.71,0-16.58,3.07-16.58,9.68,0,4.23,2.55,8.17,8.06,8.17,4.99,0,8.87-3.3,12.06-7.54\"/>\n";
  pageWeb += "<path d=\"M271.34,68.41c-2.49,4.93-6.26,7.94-11.19,7.94-7.88,0-11.02-7.65-11.02-16.17,0-9.74,3.88-16,10.96-16,4.23,0,8.12,2.2,11.25,7.77M271.34,33.17v43.19\"/>\n";
  pageWeb += "<path d=\"M284.79,58.67h22.26c0-6.49-2.15-14.49-10.55-14.49-7.25,0-11.83,6.03-11.83,16.23,0,9.22,3.71,15.94,12,15.94,5.45,0,8.46-2.96,9.91-6.38\"/>\n";
  pageWeb += "<path d=\"M319.34,82.56c1.97,3.3,5.28,4.81,9.57,4.81,6.67,0,10.49-3.71,10.49-10.9v-32.29M339.4,51.95c-3.13-5.57-7.01-7.77-11.19-7.77-7.13,0-11.02,6.26-11.02,15.42,0,8.23,3.13,15.6,11.02,15.6,4.93,0,8.7-2.78,11.19-7.36\"/>\n";
  pageWeb += "<rect x=\"8.07\" y=\"8.91\" width=\"360.86\" height=\"99.17\" fill=\"none\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2.32\"/>\n";
  pageWeb += "</svg>\n";
  pageWeb += "</div>\n";

  pageWeb += "<form action='/savereturn' method='post'>\n";
  pageWeb += "<div class='form-container'>\n";
  pageWeb += "<h2>Configuration réseau</h2>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>Nom du réseau<span class='tooltiptext'>Nom du point wifi et de l'adresse de la page web X.local</span></label>\n";
  pageWeb += "<input type='text' name='NomduReseau' class='editable' value='" + NomduReseau + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>Mot de passe WiFi<span class='tooltiptext'>Optionnel, doit faire soit 0 soit 8 ou plus</span></label>\n";
  pageWeb += "<input type='text' name='MotdePasse' class='editable' value='" + MotdePasse + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<h2>Anti-clic frénétique</h2>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>Seuil détection de spam<span class='tooltiptext'>Délai minimal admis entre 2 clics (en milliseconde).</span></label>\n";
  pageWeb += "<input type='number' name='SeuilSpamBtn' class='editable' value='" + String(SeuilSpamBtn) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>Tolerance aux spams<span class='tooltiptext'>Laisser passer la réponse avant un spam ? (0 ou 1).</span></label>\n";
  pageWeb += "<input type='number' name='ToleranceSpam' class='editable' value='" + String(ToleranceSpam) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>Nb de réponses maxi<span class='tooltiptext'>Ma question demande jusqu'à X réponses différentes.</span></label>\n";
  pageWeb += "<input type='number' name='MultiReponse' class='editable' value='" + String(MultiReponse) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>Temps entre réponses<span class='tooltiptext'>Temps accepté entre deux réponses (en milliseconde).</span></label>\n";
  pageWeb += "<input type='number' name='DelaiInterReponse' class='editable' value='" + String(DelaiInterReponse) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>Temps de réactivation<span class='tooltiptext'>Temps avant de pouvoir recliquer après qu'un spam ou une réponse de trop soit détecté (en milliseconde).</span></label>\n";
  pageWeb += "<input type='number' name='DelaiAntiSpam' class='editable' value='" + String(DelaiAntiSpam) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<h2>Gestion des LEDs</h2>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>Activer les leds<span class='tooltiptext'>Leds éteintes à 0, allumées à 1. Si vous êtes sur batterie, nous vous conseillons d'éteindre les leds</span></label>\n";
  pageWeb += "<input type='number' name='LedActive' class='editable' value='" + String(LedActive) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>Boutons réactifs<span class='tooltiptext'>Animation lors de l'appui des boutons.</span></label>\n";
  pageWeb += "<input type='number' name='BoutonAnim' class='editable' value='" + String(BoutonAnim) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>Lumière rouge<span class='tooltiptext'>Taux de rouge dans les leds (255 max).</span></label>\n";
  pageWeb += "<input type='number' name='Red' class='editable' value='" + String(Red) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>Lumière verte<span class='tooltiptext'>Taux de vert dans les leds (255 max).</span></label>\n";
  pageWeb += "<input type='number' name='Green' class='editable' value='" + String(Green) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>Lumière bleue<span class='tooltiptext'>Taux de bleue dans les leds (255 max).</span></label>\n";
  pageWeb += "<input type='number' name='Blue' class='editable' value='" + String(Blue) + "'>\n";
  pageWeb += "</div>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='export-buttons-container'>\n";
  pageWeb += "<button class='export-button' type='submit'>\n";
  pageWeb += "<svg viewBox='0 0 119 123'>\n";
  pageWeb += "<rect x='10.41' y='11.91' width='99.17' height='99.17' stroke='#fff' stroke-width='0' fill='#888' stroke-linecap='round' stroke-linejoin='round'/>\n";
  pageWeb += "<path d='M48.26,47.94c-7.39,0-10.24,7-10.24,13.25,0,5.24,2.03,13.33,10.28,13.33s10.28-8.09,10.28-13.33c0-6.26-2.85-13.25-10.24-13.25' stroke='#fff' stroke-width='2.32' fill='none' stroke-linecap='round' stroke-linejoin='round'/>\n";
  pageWeb += "<path d='M80.98,74.53l-10.87-11.81,10.01-9.89M67.77,45.4v29.13' stroke='#fff' stroke-width='2.32' fill='none' stroke-linecap='round' stroke-linejoin='round'/>\n";
  pageWeb += "</svg>\n";
  pageWeb += "</button>\n";
  pageWeb += "</div>\n";
  pageWeb += "</form>\n";

  pageWeb += "<footer>\n";
  pageWeb += "<p>SONTADEG, interface ouverte pour enquêtes locale<br>Edulab Rennes 2, Labfab | Novembre 2024 v1.0.0 [CC-BY-SA]</p>\n";
  pageWeb += "</footer>\n";
  pageWeb += "</body>\n";
  pageWeb += "</html>\n";

  return pageWeb;
}
