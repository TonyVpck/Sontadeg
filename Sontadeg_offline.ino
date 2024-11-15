//////////////////////////////////////////////////////////////////////////////
///   _____             _            _                          Aout 2024  ///
///  / ____|           | |          | |                                    ///
/// | (___   ___  _ __ | |_ __ _  __| | ___  __ _                          ///
///  \___ \ / _ \| '_ \| __/ _` |/ _` |/ _ \/ _` |                         ///
///  ____) | (_) | | | | || (_| | (_| |  __/ (_| |                         ///
/// |_____/ \___/|_| |_|\__\__,_|\__,_|\___|\__, |                         ///
///                                          __/ |                         ///
/// Borne d'enquête public libre de droit   |___/                          ///
///                                                                        ///
/// Imagine a l'Edulab Rennes 2, membre Labfab - RENNNES                   ///
/// Code par : Tony Vanpoucke(logique & svg), Olivier Bernier(page web)    ///
///   avec la gentille aide de :                                           ///
/// Michal Parusinski, Wing-Anh Luy, Cyprien Roudet, Baptiste Gautier      ///
/// Tuto wiki : http://sitededocaremplir.com                               ///
/// Licence : CC-By-Sa                                                     ///
//////////////////////////////////////////////////////////////////////////////

//----------------------------------------------//
// ADRESSE page Sontadeg : 192.168.1.4 ---------//

String NomduReseau = "Sontadeg";  // Nom du réseau wifi du sondage
String MotdePasse = "";           // Mot de passe du réseau wifi du sondage

// ATTENTION - le mot de passe doit faire soit 0 caractères soit 8 ou plus sinon
// La configuration de votre réseau wifi ne se fera pas (ni mot de passe, ni nom de réseau !).
//----------------------------------------------//

// Bibliotheque : Gestion du Wifi du NodeMCUv3 (a installer)
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DNSServer.h>
#include <Wire.h>
#include <WiFiClient.h>
#include <Effortless_SPIFFS.h>

#include "SontadegRoot.h"
#include "SontadegConfig.h"

//- Initialisation de Sontadeg ------------------------------//
//-----------------------------------------------------------//

// filtre anti clics-frenetique (pour éviter le spam de bouton)
int DelaiAntiSpam = 8000;
int ToleranceSpam = 1;
int SeuilSpamBtn = 250;
int MultiReponse = 0;
int DelaiInterReponse = 2500;

// Creation du serveur web
ESP8266WebServer ServeurWebSondage(80);
DNSServer dnsServer;

// Creation d'un systeme de sauvegarde des donnees
eSPIFFS fileSystem;

// Declaration des Variables
int BoutonReset = 2;
int BoutonA = 0;
int BoutonB = 4;
int BoutonC = 5;
int BoutonD = 13;
int BoutonE = 12;
int BoutonF = 14;

// Variables pour stocker les resultats du sondage (au total 6, une par bouton sondage)
int Choix1, Choix2, Choix3, Choix4, Choix5, Choix6;

String question = "Comment allez-vous ?";
String texteA = "Je dirais plutot A";
String texteB = "Je me sens B";
String texteC = "Je suis d'avis de dire C";
String texteD = "Mon coeur balance pour D";
String texteE = "Certainement E";
String texteF = "Je suis sure de dire F";

unsigned long resetStartTime = 0;
bool resetActive = false;

int MultiClicCount = 0;
int spam = 0;
int previousButton;

unsigned long previousTime;
unsigned long currentTime;

int debounce = 0;

void setup() {
  delay(1000);
  Serial.begin(9600);

  pinMode(BoutonReset, INPUT_PULLUP);
  pinMode(BoutonA, INPUT_PULLUP);
  pinMode(BoutonB, INPUT_PULLUP);
  pinMode(BoutonC, INPUT_PULLUP);
  pinMode(BoutonD, INPUT_PULLUP);
  pinMode(BoutonE, INPUT_PULLUP);
  pinMode(BoutonF, INPUT_PULLUP);

  loadSave();
  configDuWifi();
  MonitorCount();
}

//- Attente d'une action utilisateur ------------------------//
//-----------------------------------------------------------//

void loop() {
  dnsServer.processNextRequest();
  ServeurWebSondage.handleClient();

  currentTime = millis();  // Met à jour la période d'appui du bouton actuel

  if (digitalRead(BoutonA) == LOW && debounce == 0) {
    debounce = 1;
    delay(50);
    Serial.println();
    checkButtonPress(0, "/SondageA.txt", Choix1);
  } else if (digitalRead(BoutonB) == LOW && debounce == 0) {
    debounce = 1;
    delay(50);
    Serial.println();
    checkButtonPress(1, "/SondageB.txt", Choix2);
  } else if (digitalRead(BoutonC) == LOW && debounce == 0) {
    debounce = 1;
    delay(50);
    Serial.println();
    checkButtonPress(2, "/SondageC.txt", Choix3);
  } else if (digitalRead(BoutonD) == LOW && debounce == 0) {
    debounce = 1;
    delay(50);
    Serial.println();
    checkButtonPress(3, "/SondageD.txt", Choix4);
  } else if (digitalRead(BoutonE) == LOW && debounce == 0) {
    debounce = 1;
    delay(50);
    Serial.println();
    checkButtonPress(4, "/SondageE.txt", Choix5);
  } else if (digitalRead(BoutonF) == LOW && debounce == 0) {
    debounce = 1;
    delay(50);
    Serial.println();
    checkButtonPress(5, "/SondageF.txt", Choix6);
  } else if (digitalRead(BoutonA) == HIGH && digitalRead(BoutonB) == HIGH && digitalRead(BoutonC) == HIGH && digitalRead(BoutonD) == HIGH && digitalRead(BoutonE) == HIGH && digitalRead(BoutonF) == HIGH && debounce == 1) {
    debounce = 0;
    delay(50);
  }

  checkResetButton();
}

//- Config du WIFI et action de la page WEB -----------------//
//-----------------------------------------------------------//

void configDuWifi() {
  //Adresse manuel de Sontadeg : 192.168.1.4
  IPAddress local_IP(192, 168, 4, 1);
  IPAddress gateway(192, 168, 4, 1);
  IPAddress subnet(255, 255, 255, 0);

  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(local_IP, gateway, subnet);  // Configurer l'IP fixe
  WiFi.softAP(NomduReseau, MotdePasse);
  IPAddress monIP = WiFi.softAPIP();

  Serial.println();
  Serial.println("SONTADEG - Borne d'enquête public");
  Serial.print("Adresse IP de ce Point d'Accès : ");
  Serial.println(monIP);

  dnsServer.setErrorReplyCode(DNSReplyCode::ServerFailure);
  dnsServer.start(53, "*", local_IP);

  ServeurWebSondage.on("/", handle_OnConnect);  // Page principale du sondage
  ServeurWebSondage.on("/config", handle_Config);
  ServeurWebSondage.on("/savetext", HTTP_POST, handleFormText);
  ServeurWebSondage.on("/savereturn", HTTP_POST, handleSaveConfig);
  ServeurWebSondage.on("/downloadcsv", HTTP_GET, handleDownloadCSV);
  ServeurWebSondage.onNotFound(handle_OnConnect);
  ServeurWebSondage.begin();
  Serial.println("Serveur HTTP démarré");
  return;
}

//- Affichage du sondage dans le port serie de arduino ------//
//-----------------------------------------------------------//

void MonitorCount() {
  Serial.print(Choix1);
  Serial.print(" - ");
  Serial.print(Choix2);
  Serial.print(" - ");
  Serial.print(Choix3);
  Serial.print(" - ");
  Serial.print(Choix4);
  Serial.print(" - ");
  Serial.print(Choix5);
  Serial.print(" - ");
  Serial.println(Choix6);
  return;
}

//- Actions des boutons de Sontadeg -------------------------//
//-----------------------------------------------------------//

void checkButtonPress(int buttonIndex, const char *fileName, int &caseCount) {

  Serial.print("temps interbouton ");
  Serial.println(currentTime - previousTime);

  //- Spam de rapidité ! -//
  if (currentTime - previousTime <= SeuilSpamBtn) {
    MultiClicCount = 0;                                     // Remet le compteur de réponse multiple à 0
    Serial.println("SPAM (spam rapidité)");

    if (ToleranceSpam == 0) {                               // Si la Tolerance 0 est activée, choisit le précédent bouton appuyé
      switch (previousButton) {
        case 0:
          ToleranceMalus(0, "/SondageA.txt", Choix1);
          break;
        case 1:
          ToleranceMalus(1, "/SondageB.txt", Choix2);
          break;
        case 2:
          ToleranceMalus(2, "/SondageC.txt", Choix3);
          break;
        case 3:
          ToleranceMalus(3, "/SondageD.txt", Choix4);
          break;
        case 4:
          ToleranceMalus(4, "/SondageE.txt", Choix5);
          break;
        case 5:
          ToleranceMalus(5, "/SondageF.txt", Choix6);
          break;
      }
    }
    delay(DelaiAntiSpam);                                    // Se met en anti-spam et bloque les boutons pour un temps
  }

  //- Spam de répétition + réponses mutliples -//
  if ((currentTime - previousTime >= SeuilSpamBtn) && (currentTime - previousTime <= DelaiInterReponse)) {
    MultiClicCount++;                                        // Ajoute 1 au nombre de réponse multiple

    // Spam de répétition
    if (previousButton == buttonIndex) {                     // Ajoute l'appui du bouton si le seuil de réponses multiples n'est pas dépassé
      MultiClicCount = 0;                                    // Remet le compteur de réponse multiple à 0
      Serial.println("SPAM (répétition)");

      if (ToleranceSpam == 0) {                              // Si la Tolerance 0 est activée, choisit le précédent bouton appuyé
        switch (previousButton) {
          case 0:
            ToleranceMalus(0, "/SondageA.txt", Choix1);
            break;
          case 1:
            ToleranceMalus(1, "/SondageB.txt", Choix2);
            break;
          case 2:
            ToleranceMalus(2, "/SondageC.txt", Choix3);
            break;
          case 3:
            ToleranceMalus(3, "/SondageD.txt", Choix4);
            break;
          case 4:
            ToleranceMalus(4, "/SondageE.txt", Choix5);
            break;
          case 5:
            ToleranceMalus(5, "/SondageF.txt", Choix6);
            break;
        }
      }
      delay(DelaiAntiSpam);                                     // Se met en anti-spam et bloque les boutons pour un temps
    }

    // Réponse multiple et acceptée
    if (MultiClicCount <= (MultiReponse - 1)) {                 // Ajoute l'appui du bouton si le seuil de réponses multiples n'est pas dépassé
      caseCount++;                                              // Ajoute +1 à l'appuie du bouton et sauvegarde la data
      previousButton = buttonIndex;
      Serial.print("Bouton ");
      Serial.print(buttonIndex);
      Serial.println(" appuyé !");
      fileSystem.saveToFile(fileName, caseCount);
      MonitorCount();

      // Trop de réponses multiples
    } else if (MultiClicCount >= (MultiReponse - 1)) {         // Si une réponse de trop est ajoutée aux réponses multiples, l'anti-spam s'active
      Serial.println("Trop de réponses");
      delay(DelaiAntiSpam);                                    // Se met en anti-spam et bloque les boutons pour un temps
    }
  }

  //- Appui unique acceptée -//
  if (currentTime - previousTime >= DelaiInterReponse) {
    MultiClicCount = 0;                                        // Remet le compteur de réponse multiple à 0
    caseCount++;                                               // Ajoute +1 à l'appuie du bouton et sauvegarde la data
    Serial.print("Bouton ");
    Serial.print(buttonIndex);
    Serial.println(" appuyé !");
    fileSystem.saveToFile(fileName, caseCount);
    MonitorCount();
  }

  previousButton = buttonIndex;                               // Stocke le numéro du bouton précédement appui
  previousTime = currentTime;                                 // Stocke la période d'appui du bouton précédent
}


void checkResetButton() {
  if (digitalRead(BoutonReset) == LOW) {
    if (!resetActive) {
      resetActive = true;
      resetStartTime = millis();
    } else {
      if (millis() - resetStartTime >= 5000) {               // Vérifie si le bouton est maintenu pendant 5 secondes
        Choix1 = 0;
        Choix2 = 0;
        Choix3 = 0;
        Choix4 = 0;
        Choix5 = 0;
        Choix6 = 0;
        String MotdePasse = "";

        fileSystem.saveToFile("/SondageA.txt", Choix1);
        fileSystem.saveToFile("/SondageB.txt", Choix2);
        fileSystem.saveToFile("/SondageC.txt", Choix3);
        fileSystem.saveToFile("/SondageD.txt", Choix4);
        fileSystem.saveToFile("/SondageE.txt", Choix5);
        fileSystem.saveToFile("/SondageF.txt", Choix6);
        fileSystem.saveToFile("/MotdePasse.txt", MotdePasse);

        Serial.println("Les variables et mot de passe ont été remis à zéro.");
        MonitorCount();
        resetActive = false;
      }
    }
  } else {
    resetActive = false;
  }
}

void ToleranceMalus(int previousButton, const char *fileName, int &caseCount) {
  caseCount--;  // Ajoute -1 à l'appuie du bouton précédent et sauvegarde la data
  Serial.println();
  Serial.print("Régulation de bouton ");
  Serial.println(previousButton);
  fileSystem.saveToFile(fileName, caseCount);
  MonitorCount();
}


//- Liens dans les pages web de Sontadeg --------------------//
//-----------------------------------------------------------//

void handle_OnConnect() {
  ServeurWebSondage.send(200, "text/html", SendText(Choix1, Choix2, Choix3, Choix4, Choix5, Choix6, question, texteA, texteB, texteC, texteD, texteE, texteF));
}

void handle_Config() {

  updateConfig();
  ServeurWebSondage.send(200, "text/html", SendConfig(NomduReseau, MotdePasse, DelaiInterReponse, DelaiAntiSpam, SeuilSpamBtn, ToleranceSpam, MultiReponse));
}

void handleFormText() {

  updateText();
  ServeurWebSondage.send(200, "text/html", SendText(Choix1, Choix2, Choix3, Choix4, Choix5, Choix6, question, texteA, texteB, texteC, texteD, texteE, texteF));
}

void handleSaveConfig() {

  updateConfig();
  ServeurWebSondage.send(200, "text/html", SendText(Choix1, Choix2, Choix3, Choix4, Choix5, Choix6, question, texteA, texteB, texteC, texteD, texteE, texteF));
}

void handleDownloadCSV() {

  String csvContent;
  csvContent += question + ";" + texteA + ";" + texteB + ";" + texteC + ";" + texteD + ";" + texteE + ";" + texteF + "\n";                                                      // Ajouter les en-têtes avec des points-virgules comme séparateurs
  csvContent += "Nombre de votes;" + String(Choix1) + ";" + String(Choix2) + ";" + String(Choix3) + ";" + String(Choix4) + ";" + String(Choix5) + ";" + String(Choix6) + "\n";  // Ajouter les valeurs des cases

  // Sauvegarde le contenu du CSV dans un fichier
  fileSystem.saveToFile("/data.csv", csvContent);
  String csvData;  // Lire le fichier CSV et l'envoyer en réponse
  if (fileSystem.openFromFile("/data.csv", csvData)) {
    ServeurWebSondage.send(200, "text/csv", csvData);
  } else {
    ServeurWebSondage.send(500, "text/plain", "Erreur du CSV");
  }
}

//- Chargement et sauvegarde de Sontadeg --------------------//
//-----------------------------------------------------------//

void loadSave() {
  fileSystem.openFromFile("/SondageA.txt", Choix1);
  fileSystem.openFromFile("/SondageB.txt", Choix2);
  fileSystem.openFromFile("/SondageC.txt", Choix3);
  fileSystem.openFromFile("/SondageD.txt", Choix4);
  fileSystem.openFromFile("/SondageE.txt", Choix5);
  fileSystem.openFromFile("/SondageF.txt", Choix6);

  fileSystem.openFromFile("/TexteA.txt", texteA);
  fileSystem.openFromFile("/TexteB.txt", texteB);
  fileSystem.openFromFile("/TexteC.txt", texteC);
  fileSystem.openFromFile("/TexteD.txt", texteD);
  fileSystem.openFromFile("/TexteE.txt", texteE);
  fileSystem.openFromFile("/TexteF.txt", texteF);
  fileSystem.openFromFile("/Question.txt", question);

  fileSystem.openFromFile("/NomduReseau.txt", NomduReseau);
  fileSystem.openFromFile("/MotdePasse.txt", MotdePasse);

  fileSystem.openFromFile("/DelaiInterReponse.txt", DelaiInterReponse);
  fileSystem.openFromFile("/DelaiAntiSpam.txt", DelaiAntiSpam);
  fileSystem.openFromFile("/SeuilSpamBtn.txt", SeuilSpamBtn);
  fileSystem.openFromFile("/ToleranceSpam.txt", ToleranceSpam);
  fileSystem.openFromFile("/MultiReponse.txt", MultiReponse);
}

void updateConfig() {
  if (ServeurWebSondage.hasArg("NomduReseau")) {
    NomduReseau = ServeurWebSondage.arg("NomduReseau");
    fileSystem.saveToFile("/NomduReseau.txt", NomduReseau);
  }
  if (ServeurWebSondage.hasArg("MotdePasse")) {
    MotdePasse = ServeurWebSondage.arg("MotdePasse");
    fileSystem.saveToFile("/MotdePasse.txt", MotdePasse);
  }
  if (ServeurWebSondage.hasArg("DelaiInterReponse")) {
    DelaiInterReponse = ServeurWebSondage.arg("DelaiInterReponse").toInt();
    fileSystem.saveToFile("/DelaiInterReponse.txt", DelaiInterReponse);
  }
  if (ServeurWebSondage.hasArg("DelaiAntiSpam")) {
    DelaiAntiSpam = ServeurWebSondage.arg("DelaiAntiSpam").toInt();
    fileSystem.saveToFile("/DelaiAntiSpam.txt", DelaiAntiSpam);
  }
  if (ServeurWebSondage.hasArg("SeuilSpamBtn")) {
    SeuilSpamBtn = ServeurWebSondage.arg("SeuilSpamBtn").toInt();
    fileSystem.saveToFile("/SeuilSpamBtn.txt", SeuilSpamBtn);
  }
  if (ServeurWebSondage.hasArg("ToleranceSpam")) {
    ToleranceSpam = ServeurWebSondage.arg("ToleranceSpam").toInt();
    fileSystem.saveToFile("/ToleranceSpam.txt", ToleranceSpam);
  }
  if (ServeurWebSondage.hasArg("MultiReponse")) {
    MultiReponse = ServeurWebSondage.arg("MultiReponse").toInt();
    fileSystem.saveToFile("/MultiReponse.txt", MultiReponse);
  }
}

void updateText() {
  if (ServeurWebSondage.hasArg("texteA")) {
    texteA = ServeurWebSondage.arg("texteA");
    fileSystem.saveToFile("/TexteA.txt", texteA);
  }
  if (ServeurWebSondage.hasArg("texteB")) {
    texteB = ServeurWebSondage.arg("texteB");
    fileSystem.saveToFile("/TexteB.txt", texteB);
  }
  if (ServeurWebSondage.hasArg("texteC")) {
    texteC = ServeurWebSondage.arg("texteC");
    fileSystem.saveToFile("/TexteC.txt", texteC);
  }
  if (ServeurWebSondage.hasArg("texteD")) {
    texteD = ServeurWebSondage.arg("texteD");
    fileSystem.saveToFile("/TexteD.txt", texteD);
  }
  if (ServeurWebSondage.hasArg("texteE")) {
    texteE = ServeurWebSondage.arg("texteE");
    fileSystem.saveToFile("/TexteE.txt", texteE);
  }
  if (ServeurWebSondage.hasArg("texteF")) {
    texteF = ServeurWebSondage.arg("texteF");
    fileSystem.saveToFile("/TexteF.txt", texteF);
  }
  if (ServeurWebSondage.hasArg("question")) {
    question = ServeurWebSondage.arg("question");
    fileSystem.saveToFile("/Question.txt", question);
  }
}
