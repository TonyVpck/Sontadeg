//-------------------------------------------------------------------------------------------//
// Page principale                                                                  ---------//
//                                                                                  ---------//
// *on personnalise ici textuelement les questions et les réponses du sondage       ---------//
// *on à accès ici à la page config et pouvons exporter les résultats en .csv       ---------//
//-------------------------------------------------------------------------------------------//

String SendText(int Choix1, int Choix2, int Choix3, int Choix4, int Choix5, int Choix6, int SpamCount, String question, String texteA, String texteB, String texteC, String texteD, String texteE, String texteF, String ActiveButtons, bool SondageStart) {
  bool activeA = ActiveButtons.indexOf('A') != -1;
  bool activeB = ActiveButtons.indexOf('B') != -1;
  bool activeC = ActiveButtons.indexOf('C') != -1;
  bool activeD = ActiveButtons.indexOf('D') != -1;
  bool activeE = ActiveButtons.indexOf('E') != -1;
  bool activeF = ActiveButtons.indexOf('F') != -1;

  // les tailles et le nombre d'icones change avant et apèrs le lancement du sondage.
  int iconSize = SondageStart ? 65 : 90;
  int iconGap = SondageStart ? 15 : 20;

  // Pourcentage calculé seulement sur les boutons actifs
  int totalVotes = 0;
  if (activeA) totalVotes += Choix1;
  if (activeB) totalVotes += Choix2;
  if (activeC) totalVotes += Choix3;
  if (activeD) totalVotes += Choix4;
  if (activeE) totalVotes += Choix5;
  if (activeF) totalVotes += Choix6;

  float percentA = totalVotes > 0 ? (float)Choix1 / totalVotes * 100 : 0;
  float percentB = totalVotes > 0 ? (float)Choix2 / totalVotes * 100 : 0;
  float percentC = totalVotes > 0 ? (float)Choix3 / totalVotes * 100 : 0;
  float percentD = totalVotes > 0 ? (float)Choix4 / totalVotes * 100 : 0;
  float percentE = totalVotes > 0 ? (float)Choix5 / totalVotes * 100 : 0;
  float percentF = totalVotes > 0 ? (float)Choix6 / totalVotes * 100 : 0;

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

  pageWeb += ".poll-box {\n";
  pageWeb += "  margin: 4px 0;\n";
  pageWeb += "  padding: 0;\n";
  pageWeb += "}\n";

  pageWeb += ".bar-container {\n";
  pageWeb += "  background-color: #aaa;\n";
  pageWeb += "  border-radius: 5px;\n";
  pageWeb += "  overflow: hidden;\n";
  pageWeb += "}\n";

  pageWeb += ".bar {\n";
  pageWeb += "  height: 25px;\n";
  pageWeb += "  background-color: white;\n";
  pageWeb += "  text-align: right;\n";
  pageWeb += "  align-items: center;\n";
  pageWeb += "  color: #888;\n";
  pageWeb += "  padding: 4px 5px 0px 5px;\n";
  pageWeb += "  box-sizing: border-box;\n";
  pageWeb += "}\n";

  pageWeb += ".result {\n";
  pageWeb += "  display: flex;\n";
  pageWeb += "  justify-content: space-between;\n";
  pageWeb += "  align-items: flex-start;\n";
  pageWeb += "  margin: 0;\n";
  pageWeb += "  padding: 0;\n";
  pageWeb += "}\n";

  pageWeb += ".spamline {\n";
  pageWeb += "  display: inline-flex;\n";  
  pageWeb += "  justify-content: flex-end;\n"; 
  pageWeb += "  align-items: center;\n";
  pageWeb += "  width: 100%;\n";
  pageWeb += "  color: #888;\n";
  pageWeb += "  text-align: right;\n";
  pageWeb += "}\n";

  pageWeb += ".editable {\n";
  pageWeb += "  border: none;\n";
  pageWeb += "  background: none;\n";
  pageWeb += "  color: white;\n";
  pageWeb += "  font-size: 16px;\n";
  pageWeb += "  resize: none;\n";
  pageWeb += "  outline: none;\n";
  pageWeb += "  width: 100%;\n";
  pageWeb += "  box-sizing: border-box;\n";
  pageWeb += "  margin: 0;\n";
  pageWeb += "  padding: 0;\n";
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

  pageWeb += ".pre-launch-message {\n";
  pageWeb += "  color: #999;\n";
  pageWeb += "  font-size: 14px;\n";
  pageWeb += "  text-align: center;\n";
  pageWeb += "  margin: 0px 0 10px 0;\n";
  pageWeb += "}\n";

  pageWeb += ".export-buttons-container {\n";
  pageWeb += "display: flex;\n";
  pageWeb += "justify-content: center;\n";
  pageWeb += "gap: " + String(iconGap) + "px;\n";
  pageWeb += "margin-top: 20px;\n";
  pageWeb += "flex-wrap: wrap;\n";
  pageWeb += "}\n";
  pageWeb += ".export-button {\n";
  pageWeb += "padding: 0;\n";
  pageWeb += "background-color: transparent;\n";
  pageWeb += "border: none;\n";
  pageWeb += "cursor: pointer;\n";
  pageWeb += "display: flex;\n";
  pageWeb += "align-items: center;\n";
  pageWeb += "justify-content: center;\n";
  pageWeb += "}\n";

  pageWeb += ".export-button svg {\n";
  pageWeb += "width: " + String(iconSize) + "px;\n";
  pageWeb += "height: " + String(iconSize) + "px;\n";
  pageWeb += "stroke: #fff;\n";
  pageWeb += "}\n";

  pageWeb += ".logo {\n";
  pageWeb += "width: 100%;\n";
  pageWeb += "max-width: 300px;\n";
  pageWeb += "margin: 0 auto;\n";
  pageWeb += "}\n";

  pageWeb += "footer {\n";
  pageWeb += "text-align: center;\n";
  pageWeb += "padding: 10px 0;\n";
  pageWeb += "color: #888;\n";
  pageWeb += "}\n";
  pageWeb += "footer a {\n";
  pageWeb += "color: #007BFF;\n";
  pageWeb += "text-decoration: none;\n";
  pageWeb += "}\n";
  pageWeb += "footer a:hover {\n";
  pageWeb += "text-decoration: underline;\n";
  pageWeb += "}\n";
  pageWeb += "</style>\n";
  pageWeb += "</head>\n";
  pageWeb += "<body>\n";

  pageWeb += sontadegLogoHTML();

  if (!SondageStart) {
    pageWeb += "<p class=\"pre-launch-message\">" + String(LANG_MSG_AVANT_LANCEMENT_L1) + "<br>" + String(LANG_MSG_AVANT_LANCEMENT_L2) + "</p>\n";
  }

  pageWeb += "<form action='/savetext' method='post'>\n";
  pageWeb += "<h1><textarea name=\"question\" class=\"editablequestion\">" + charsCorrection(question) + "</textarea></h1>\n";  // Champ pour la question

  if (activeA) {
    pageWeb += "<div class=\"poll-box\">\n";
    pageWeb += "<div class=\"bar-container\"><div class=\"bar\" style=\"width:" + String(percentA) + "%;\">" + String(percentA, 1) + "%</div></div>\n";
    pageWeb += "<div class=\"result\"><textarea name=\"texteA\" class=\"editable\">" + charsCorrection(texteA) + "</textarea><span>(" + String(Choix1) + ")</span></div>\n";
    pageWeb += "</div>\n";
  }

  if (activeB) {
    pageWeb += "<div class=\"poll-box\">\n";
    pageWeb += "<div class=\"bar-container\"><div class=\"bar\" style=\"width:" + String(percentB) + "%;\">" + String(percentB, 1) + "%</div></div>\n";
    pageWeb += "<div class=\"result\"><textarea name=\"texteB\" class=\"editable\">" + charsCorrection(texteB) + "</textarea><span>(" + String(Choix2) + ")</span></div>\n";
    pageWeb += "</div>\n";
  }

  if (activeC) {
    pageWeb += "<div class=\"poll-box\">\n";
    pageWeb += "<div class=\"bar-container\"><div class=\"bar\" style=\"width:" + String(percentC) + "%;\">" + String(percentC, 1) + "%</div></div>\n";
    pageWeb += "<div class=\"result\"><textarea name=\"texteC\" class=\"editable\">" + charsCorrection(texteC) + "</textarea><span>(" + String(Choix3) + ")</span></div>\n";
    pageWeb += "</div>\n";
  }

  if (activeD) {
    pageWeb += "<div class=\"poll-box\">\n";
    pageWeb += "<div class=\"bar-container\"><div class=\"bar\" style=\"width:" + String(percentD) + "%;\">" + String(percentD, 1) + "%</div></div>\n";
    pageWeb += "<div class=\"result\"><textarea name=\"texteD\" class=\"editable\">" + charsCorrection(texteD) + "</textarea><span>(" + String(Choix4) + ")</span></div>\n";
    pageWeb += "</div>\n";
  }

  if (activeE) {
    pageWeb += "<div class=\"poll-box\">\n";
    pageWeb += "<div class=\"bar-container\"><div class=\"bar\" style=\"width:" + String(percentE) + "%;\">" + String(percentE, 1) + "%</div></div>\n";
    pageWeb += "<div class=\"result\"><textarea name=\"texteE\" class=\"editable\">" + charsCorrection(texteE) + "</textarea><span>(" + String(Choix5) + ")</span></div>\n";
    pageWeb += "</div>\n";
  }

  if (activeF) {
    pageWeb += "<div class=\"poll-box\">\n";
    pageWeb += "<div class=\"bar-container\"><div class=\"bar\" style=\"width:" + String(percentF) + "%;\">" + String(percentF, 1) + "%</div></div>\n";
    pageWeb += "<div class=\"result\"><textarea name=\"texteF\" class=\"editable\">" + charsCorrection(texteF) + "</textarea><span>(" + String(Choix6) + ")</span></div>\n";
    pageWeb += "</div>\n";
  }

  pageWeb += "<div class=\"poll-box\">\n";
  pageWeb += "<div class=\"spamline\">\n";
  pageWeb += "<span>" + String(LANG_SPAM_LABEL) + "&nbsp;</span><span>(" + String(SpamCount) + ")</span>\n";
  pageWeb += "</div>\n";
  pageWeb += "</div>\n";

  pageWeb += "<div class=\"export-buttons-container\">\n";
  pageWeb += "<button class=\"export-button\" type=\"submit\">\n";

  pageWeb += SaveOKSvgHTML();

  pageWeb += "</button>\n";

  pageWeb += "</form>\n";

  pageWeb += "<form action=\"/config\" method='post'>\n";
  pageWeb += "<button class=\"export-button\" type=\"submit\">\n";

  pageWeb += PlusSvgHTML();

  pageWeb += "</button>\n";
  pageWeb += "</form>\n";

  // Bouton de téléchargement des résultats n'apparaissent que si le sondage est lancé.
  if (SondageStart) {
    pageWeb += "<form action=\"/downloadresume\" method=\"get\">";
    pageWeb += "<button class=\"export-button\" type=\"submit\">\n";

    pageWeb += ResumeSvgHTML();

    pageWeb += "</button>\n";
    pageWeb += "</form>\n";

    pageWeb += "<form action=\"/downloadlog\" method=\"get\">";
    pageWeb += "<button class=\"export-button\" type=\"submit\">\n";

    pageWeb += LogSvgHTML();

    pageWeb += "</button>\n";
    pageWeb += "</form>\n";
  }

  pageWeb += "</div>\n";

  pageWeb += "<footer>\n";
  pageWeb += "<p>SONTADEG, " + String(LANG_FOOTER_TAGLINE) + "<br>Labfab (Edulab Rennes 2) | sept. 2026 v1.2.0 [CC-BY-SA]</p>\n";
  pageWeb += "</footer>\n";
  pageWeb += "</body>\n";
  pageWeb += "</html>\n";

  return pageWeb;
}

//-------------------------------------------------------------------------------------------//
// Page de lancement de sondage                                                     ---------//
//                                                                                  ---------//
// *on personnalise ici textuelement les questions et les réponses du sondage       ---------//
// *on à accès ici à la page config et pouvons exporter les résultats en .csv       ---------//
//-------------------------------------------------------------------------------------------//
String SendLaunched(String NomduReseauAP) {
  String pageWeb = "<!DOCTYPE html><html lang=\"fr\">\n";
  pageWeb += "<head>\n";
  pageWeb += "<meta charset=\"UTF-8\">\n";
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
  pageWeb += "  justify-content: center;\n";
  pageWeb += "  align-items: center;\n";
  pageWeb += "  min-height: 100vh;\n";
  pageWeb += "}\n";
  pageWeb += ".logo {\n";
  pageWeb += "  width: 100%;\n";
  pageWeb += "  max-width: 300px;\n";
  pageWeb += "  margin: 0 auto 5px auto;\n";
  pageWeb += "}\n";
  pageWeb += ".launch-text {\n";
  pageWeb += "  font-size: 18px;\n";
  pageWeb += "  line-height: 1.3;\n";
  pageWeb += "  margin: 0;\n";
  pageWeb += "}\n";
  pageWeb += ".rescue-link {\n";
  pageWeb += "  margin-top: 35px;\n";
  pageWeb += "  display: flex;\n";
  pageWeb += "}\n";
  pageWeb += ".rescue-link svg {\n";
  pageWeb += "  width: 90px;\n";
  pageWeb += "  height: 90px;\n";
  pageWeb += "}\n";
  pageWeb += "</style>\n";
  pageWeb += "</head>\n";
  pageWeb += "<body>\n";

  pageWeb += sontadegLogoHTML();

  pageWeb += "<p class=\"launch-text\">" + String(LANG_TITRE_SONDAGE_LANCE) + "<br>" + String(LANG_SOUSTITRE_REDEMARRAGE) + "</p>\n";
  pageWeb += "<a class=\"rescue-link\" href=\"http://" + charsCorrection(NomduReseauAP) + ".local/\">\n";
  
  pageWeb += redirectSvgHTML() ;

  pageWeb += "</a>\n";

  pageWeb += "</body>\n";
  pageWeb += "</html>\n";

  return pageWeb;
}