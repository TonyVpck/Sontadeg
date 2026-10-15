//-------------------------------------------------------------------------------------------//
// Page de configuration                                                            ---------//
//                                                                                  ---------//
// *on configure ici les options de la borne et le scéanrio du sondage              ---------//
// *on démarre ici le sondage une fois la configuration terminée                    ---------//
//-------------------------------------------------------------------------------------------//

String SendConfig(String NomduReseauAP, String MotdePasseAP, String NomduReseauNET, String MotdePasseNET, String WifiMode, int DelaiInterReponse, int DelaiAntiSpam, int SeuilSpamBtn, int ToleranceSpam, int MultiReponse, int Red, int Green, int Blue, int LedActive, int BoutonAnim, int AnimSpam, bool Horodatage, int SaveIntervalMin, String ActiveButtons, bool SondageStart, String BorneDescript, int sessionCount, String flashInfo, String eventsEnMemoire, String adresseIP, String dernierEvent1, String dernierEvent2, String dernierEvent3, bool APActive, bool STAActive, String adresseIPSTA) {
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

  pageWeb += ".event-row {\n";
  pageWeb += "  display: flex;\n";
  pageWeb += "  justify-content: flex-start;\n";
  pageWeb += "  align-items: center;\n";
  pageWeb += "  margin: 5px 0;\n";
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
  pageWeb += "  margin-top: 20px;\n";
  pageWeb += "}\n";

  pageWeb += ".onlinemode {\n";
  pageWeb += "  display: inline-flex;\n";
  pageWeb += "  justify-content: flex-end;\n";
  pageWeb += "  align-items: center;\n";
  pageWeb += "  width: 100%;\n";
  pageWeb += "  color: #888;\n";
  pageWeb += "  text-align: right;\n";
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

  pageWeb += sontadegLogoHTML();

  pageWeb += "<form action='/savereturn' method='post'>\n";
  pageWeb += "<div class='form-container'>\n";
  pageWeb += "<h2>" + String(LANG_H2_ID_BORNE) + "</h2>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_NOM_BORNE) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_NOM_BORNE) + "</span></label>\n";
  pageWeb += "<input type='text' name='NomduReseauAP' class='editable' value='" + charsCorrection(NomduReseauAP) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_MDP) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_MDP) + "</span></label>\n";
  pageWeb += "<input type='text' name='MotdePasseAP' class='editable' value='" + charsCorrection(MotdePasseAP) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<h2>" + String(LANG_H2_PARAMETRES_BORNE) + "</h2>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_DESCRIPTION) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_DESCRIPTION) + "</span></label>\n";
  pageWeb += "<input type='text' name='BorneDescript' class='editable' maxlength='80' value='" + charsCorrection(BorneDescript) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_BOUTONS_ACTIFS) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_BOUTONS_ACTIFS) + "</span></label>\n";
  pageWeb += "<input type='text' name='ActiveButtons' class='editable' value='" + charsCorrection(ActiveButtons) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_INTERVALLE_SAVE) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_INTERVALLE_SAVE) + "</span></label>\n";
  pageWeb += "<input type='number' name='SaveIntervalMin' class='editable' value='" + String(SaveIntervalMin) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<h2>" + String(LANG_H2_CONFIG_RESEAU) + "</h2>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_NOM_RESEAU) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_NOM_RESEAU) + "</span></label>\n";
  pageWeb += "<input type='text' name='NomduReseauNET' class='editable' value='" + charsCorrection(NomduReseauNET) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_CLE_WIFI) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_CLE_WIFI) + "</span></label>\n";
  pageWeb += "<input type='password' name='MotdePasseNET' class='editable' value='" + charsCorrection(MotdePasseNET) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_ETAT) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_ETAT) + "</span></label>\n";
  pageWeb += "<input type='text' name='WifiMode' class='editable' value='" + charsCorrection(WifiMode) + "' readonly>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_HORODATAGE) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_HORODATAGE) + "</span></label>\n";
  pageWeb += "<input type='number' name='Horodatage' class='editable' value='" + String(Horodatage ? 1 : 0) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<h2>" + String(LANG_H2_FONCTIONNEMENT_WIFI) + "</h2>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_AP_ACTIF) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_AP_ACTIF) + "</span></label>\n";
  pageWeb += "<input type='number' name='APActiveField' class='editable' value='" + String(APActive ? 1 : 0) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_STA_ACTIF) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_STA_ACTIF) + "</span></label>\n";
  pageWeb += "<input type='number' name='STAActiveField' class='editable' value='" + String(STAActive ? 1 : 0) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<h2>" + String(LANG_H2_ANTISPAM) + "</h2>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_SEUIL_SPAM) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_SEUIL_SPAM) + "</span></label>\n";
  pageWeb += "<input type='number' name='SeuilSpamBtn' class='editable' value='" + String(SeuilSpamBtn) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_TOLERANCE_SPAM) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_TOLERANCE_SPAM) + "</span></label>\n";
  pageWeb += "<input type='number' name='ToleranceSpam' class='editable' value='" + String(ToleranceSpam) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_NB_REPONSES) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_NB_REPONSES) + "</span></label>\n";
  pageWeb += "<input type='number' name='MultiReponse' class='editable' value='" + String(MultiReponse) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_DELAI_INTER) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_DELAI_INTER) + "</span></label>\n";
  pageWeb += "<input type='number' name='DelaiInterReponse' class='editable' value='" + String(DelaiInterReponse) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_DELAI_ANTISPAM) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_DELAI_ANTISPAM) + "</span></label>\n";
  pageWeb += "<input type='number' name='DelaiAntiSpam' class='editable' value='" + String(DelaiAntiSpam) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<h2>" + String(LANG_H2_LEDS) + "</h2>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_LED_ACTIVE) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_LED_ACTIVE) + "</span></label>\n";
  pageWeb += "<input type='number' name='LedActive' class='editable' value='" + String(LedActive) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_BOUTON_ANIM) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_BOUTON_ANIM) + "</span></label>\n";
  pageWeb += "<input type='number' name='BoutonAnim' class='editable' value='" + String(BoutonAnim) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_ANIM_SPAM) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_ANIM_SPAM) + "</span></label>\n";
  pageWeb += "<input type='number' name='AnimSpam' class='editable' value='" + String(AnimSpam) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_ROUGE) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_ROUGE) + "</span></label>\n";
  pageWeb += "<input type='number' name='Red' class='editable' value='" + String(Red) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_VERT) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_VERT) + "</span></label>\n";
  pageWeb += "<input type='number' name='Green' class='editable' value='" + String(Green) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label tooltip'>" + String(LANG_LABEL_BLEU) + "<span class='tooltiptext'>" + String(LANG_TOOLTIP_BLEU) + "</span></label>\n";
  pageWeb += "<input type='number' name='Blue' class='editable' value='" + String(Blue) + "'>\n";
  pageWeb += "</div>\n";

  pageWeb += "<h2>" + String(LANG_H2_INFOS) + "</h2>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label'>" + String(LANG_LABEL_SESSION) + "</label>\n";
  pageWeb += "<input type='text' class='editable' value='" + String(sessionCount) + "' readonly>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label'>" + String(LANG_LABEL_FLASH) + "</label>\n";
  pageWeb += "<input type='text' class='editable' value='" + charsCorrection(flashInfo) + "' readonly>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label'>" + String(LANG_LABEL_EVENTS_MEMOIRE) + "</label>\n";
  pageWeb += "<input type='text' class='editable' value='" + charsCorrection(eventsEnMemoire) + "' readonly>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label'>" + String(LANG_LABEL_ADRESSE_IP) + "</label>\n";
  pageWeb += "<input type='text' class='editable' value='" + charsCorrection(adresseIP) + "' readonly>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label'>" + String(LANG_LABEL_ADRESSE_IP_STA) + "</label>\n";
  pageWeb += "<input type='text' class='editable' value='" + charsCorrection(adresseIPSTA) + "' readonly>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class='container'>\n";
  pageWeb += "<label class='label'>" + String(LANG_LABEL_DERNIERS_EVENTS) + "</label>\n";
  pageWeb += "<input type='text' class='editable' value='" + charsCorrection(dernierEvent1) + "' readonly>\n";
  pageWeb += "</div>\n";
  pageWeb += "<div class='event-row'>\n";
  pageWeb += "<label class='label'></label>\n";
  pageWeb += "<input type='text' class='editable' value='" + charsCorrection(dernierEvent2) + "' readonly>\n";
  pageWeb += "</div>\n";
  pageWeb += "<div class='event-row'>\n";
  pageWeb += "<label class='label'></label>\n";
  pageWeb += "<input type='text' class='editable' value='" + charsCorrection(dernierEvent3) + "' readonly>\n";
  pageWeb += "</div>\n";
  
  pageWeb += "</div>\n";

  pageWeb += "<div class='export-buttons-container'>\n";
  pageWeb += "<button class='export-button' type='submit' name='formAction' value='save'>\n";

  pageWeb += SaveOKSvgHTML();

  pageWeb += "</button>\n";

  // Bouton de démarrage de sondage : apparait seulement si le sondage n'a pas débuté
  if (!SondageStart) {
    pageWeb += sondageStartSvgHTML();
  }

  pageWeb += "</div>\n";
  pageWeb += "</form>\n";

  pageWeb += "<footer>\n";
  pageWeb += "<p>SONTADEG, " + String(LANG_FOOTER_TAGLINE) + "<br>Labfab (Edulab Rennes 2) | sept. 2026 v1.2.0 [CC-BY-SA]</p>\n";
  pageWeb += "</footer>\n";
  pageWeb += "</body>\n";
  pageWeb += "</html>\n";

  return pageWeb;
}