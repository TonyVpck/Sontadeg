//////////////////////////////////////////////////////////////////////////////
///   _____             _            _                          Sept 2026  ///
///  / ____|           | |          | |                                    ///
/// | (___   ___  _ __ | |_ __ _  __| | ___  __ _                          ///
///  \___ \ / _ \| '_ \| __/ _` |/ _` |/ _ \/ _` |                         ///
///  ____) | (_) | | | | || (_| | (_| |  __/ (_| |                         ///
/// |_____/ \___/|_| |_|\__\__,_|\__,_|\___|\__, |                         ///
///                                          __/ |                         ///
/// Borne d'enquête public libre de droit   |___/                          ///
///                                                                        ///
/// Imagine a l'Edulab Rennes 2, membre Labfab - RENNNES                   ///
/// Code par : Tony Vanpoucke(scenario & svg), Olivier Bernier(page web),  ///
///   avec la gentille aide de : Michal Parusinski, Cyprien Roudet,        ///
///   algorithmie et fonctions matériel avancées aidées avec assistant.    ///
/// Tuto wiki : http://sitededocaremplir.com                               ///
/// Licence : CC-By-Sa                                                     ///
//////////////////////////////////////////////////////////////////////////////

//----------------------------------------------------------------//
// ADRESSE page Sontadeg : sontadeg.local ou 192.168.1.4 ---------//

String NomduReseauAP = "Sontadeg";  // Nom du réseau wifi du sondage
String MotdePasseAP = "";           // Mot de passe du réseau wifi du sondage

// ATTENTION - le mot de passe doit faire soit 0 caractères soit 8 ou plus sinon
// La configuration de votre réseau wifi ne se fera pas (ni mot de passe, ni nom de réseau !).
//----------------------------------------------------------------//

String NomduReseauNET = "";
String MotdePasseNET = "";
String WifiMode;

// Bibliothèques standard du core ESP32 Arduino, aucune installation manuelle nécessaire (incluses avec le board package "esp32" dans l'IDE)
#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <ESPmDNS.h>
#include <time.h>
#include <WiFiClient.h>
#include <FastLED.h>
#include <vector>
#include <LittleFS.h>


//- Fonction d'écriture de journal de votes -----------------//
//-----------------------------------------------------------//

struct VoteEvent {
  bool isNtp;           // true = horodatage NTP, false = temps relatif depuis le boot.
  uint32_t timestamp;   // horodatage epoch si connecté à internet (NTP), sinon secondes depuis boot (REL).
  uint16_t session;     // numéro de session de boot (seulement quand le sondage à débuté).
  char bouton;          // 'A'..'F', 'Z' pour spam
};
 
//- Debug de textes web -------------------------------------//
//-----------------------------------------------------------//

// Evite les erreurs de compatibilité des caractères spéciaux.
String charsCorrection(String text) {
  text.replace("&", "&amp;");  
  text.replace("'", "&#39;");
  text.replace("\"", "&quot;");
  text.replace("<", "&lt;");
  text.replace(">", "&gt;");
  return text;
}

//- Gestion des sauvegardes ---------------------------------//
//-----------------------------------------------------------//

template <typename T>
bool lfsRead(const char *path, T &value) {
  File f = LittleFS.open(path, FILE_READ);
  if (!f || f.size() == 0) { if (f) f.close(); return false; }
  value = (T)f.parseInt();
  f.close();
  return true;
}
 
template <typename T>
void lfsWrite(const char *path, T value) {
  File f = LittleFS.open(path, FILE_WRITE);
  if (!f) return;
  f.print((long)value);
  f.close();
}
 
bool lfsRead(const char *path, String &value) {
  File f = LittleFS.open(path, FILE_READ);
  if (!f || f.size() == 0) { if (f) f.close(); return false; }
  value = f.readString();
  f.close();
  return true;
}
 
void lfsWrite(const char *path, const String &value) {
  File f = LittleFS.open(path, FILE_WRITE);
  if (!f) return;
  f.print(value);
  f.close();
}

//- Gestion des pages web -----------------------------------//
//-----------------------------------------------------------//

#include "lang.h"            // Fichier de langues
#include "GraphicsSVG.h"     // Fichier logos et icones
#include "SontadegRoot.h"    // Fichier page web princiaple
#include "SontadegConfig.h"  // Fichier page de config

//- Initialisation de Sontadeg ------------------------------//
//-----------------------------------------------------------//

// filtre anti clics-frenetique (pour éviter le spam de bouton)
int DelaiAntiSpam = 8000;
int ToleranceSpam = 1;
int SeuilSpamBtn = 250;
int MultiReponse = 0;
int DelaiInterReponse = 2500;

// gestion de l'antispam
unsigned long antiSpamStartTime = 0;
bool antiSpamActive = false;

// Configuration du bandeau led
#define LED_PIN 4
#define NUM_LEDS 120
#define LED_TYPE WS2812
#define COLOR_ORDER GRB

// Variables des leds
int LedActive = 1;    // Variable pour activer/désactiver les LEDs
int BoutonAnim = 1;   // Variable pour activer/désactiver les animations boutons
int AnimSpam = 1;  // Anime quand meme les boutons pendant un spam détecté (masque l'antispam à l'usager), déactivable
uint8_t Red = 255;    // Composante rouge (0-255)
uint8_t Green = 255;  // Composante verte (0-255)
uint8_t Blue = 255;   // Composante bleue (0-255)

CRGB leds[NUM_LEDS];
bool ledAnimationActive = false;
unsigned long animStart = 0;
uint8_t Brightness = 255;  // Luminosité des leds
int animTempo = 350;       // Durée totale de l'animation

// Creation du serveur web
WebServer ServeurWebSondage(80);
DNSServer dnsServer;
bool OnlineMode;
IPAddress monIP;  // adresse du point d'accès - affichée dans le panneau d'infos de la config
IPAddress monSTAIP;  // adresse côté réseau local (STA) - filet de secours si mDNS fait des siennes

// Horodatage activé par défaut (peut être déactivé par l'usager dans la page web configuration)
bool Horodatage = true;

// Declaration des broches boutons
int BoutonA = 18;
int BoutonB = 17;
int BoutonC = 16;
int BoutonD = 15;  
int BoutonE = 7;  
int BoutonF = 6;
int BoutonReset = 5;

// Variables pour stocker les resultats du sondage. 
int Choix1, Choix2, Choix3, Choix4, Choix5, Choix6;
int SpamCount;

// Texte des pages web par défaut tirées de lang.h (définit la langue de Sontadeg)
String question = LANG_QUESTION_DEFAUT;
String texteA = LANG_TEXTE_A_DEFAUT;
String texteB = LANG_TEXTE_B_DEFAUT;
String texteC = LANG_TEXTE_C_DEFAUT;
String texteD = LANG_TEXTE_D_DEFAUT;
String texteE = LANG_TEXTE_E_DEFAUT;
String texteF = LANG_TEXTE_F_DEFAUT;

// Boutons actifs ("ABCDEF" les 6 boutons par défaut)
String ActiveButtons = "ABCDEF";

// modes AP et STA activables ou déactivable indépendamment par l'utilisateur
bool APActive = true;
bool STAActive = true;

// Desciption informative de la borne renseignée par l'utilisateur (vide par défaut)
String BorneDescript = "";
const int BorneDescriptMax = 80;

// Démarrage du test (Bloque les sauvegardes en attendant que la borne soit configurée)
bool SondageStart = false;

unsigned long resetStartTime = 0;
bool resetActive = false;
bool resetDebounce = false;  // évite qu'un maintien >5s ne redéclenche le reset en boucle

int debounce = 0;
int MultiClicCount = 0;
int previousButton;

// currentTime / previousTime restent en millis() pour la logique anti-spam
unsigned long previousTime;
unsigned long currentTime;

//- Journal des votes -----------------------------------------//
//-------------------------------------------------------------//

std::vector<VoteEvent> voteLog;
size_t voteLogIndex = 0;          // index du prochain event non encore écrit sur flash

int sessionCount = 0;             // numéro de session en cours pour ce boot (pas encore forcément sauvegardé, voir sessionCountSaved)
bool sessionCountSaved = false;   // active la sauvegarde de session si le sondage à été démarré par l'utilisateur.

int SaveIntervalMin = 15;         // intervalle de sauvegarde en minutes (15 min par défaut)
unsigned long lastSaveTime = 0;
const int SaveIntervalMinMin = 1;  // borne mini pour éviter un flush en boucle si 0

const char *VOTE_LOG_PATH = "/votelog.csv";

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

  // Montage du systeme de sauvegarde LittleFS
  if (!LittleFS.begin(true)) {
    Serial.println("Erreur montage LittleFS - config et journal de votes indisponibles");
  }

  recomputeCountsFromLog();  // reconstitue Choix1-6/SpamCount depuis le journal
  loadSave();
  configDuWifi();

  // Augementation du numero de session.
  sessionCount++;

  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(Brightness);

  // Animation de démarrage (si les leds sont actives)
  if (LedActive == 1) {
    fill_solid(leds, NUM_LEDS, CRGB::Black);  // Éteindre toutes les LEDs
    FastLED.show();

    for (int introLed = 0; introLed <= 255; introLed++) {
      FastLED.setBrightness(introLed);  // Allumer progressivement les LEDs
      fill_solid(leds, NUM_LEDS, CRGB(Red, Green, Blue));
      FastLED.show();
      delay(10);
    }
    FastLED.setBrightness(Brightness);
  }
  configLedColor();
  Serial.println("Chargement des données du sondage : ");
  MonitorCount();
  Serial.print("Session n°");
  Serial.print(sessionCount);
  Serial.println(" (candidat - persisté à la première sauvegarde réelle, après lancement du sondage)");
  Serial.println("Sontadeg démarré !");

  lastSaveTime = millis();
}

//- Attente d'une action utilisateur ------------------------//
//-----------------------------------------------------------//

void loop() {
  dnsServer.processNextRequest();
  ServeurWebSondage.handleClient();
  ledAnimation();
  inactiveButtonBlinkAnimation();

  currentTime = millis();  // Met à jour la période d'appui du bouton actuel

  if (digitalRead(BoutonA) == LOW && debounce == 0) {
    debounce = 1;
    delay(50);
    Serial.println();
    checkButtonPress(0, 'A', Choix1);
  } else if (digitalRead(BoutonB) == LOW && debounce == 0) {
    debounce = 1;
    delay(50);
    Serial.println();
    checkButtonPress(1, 'B', Choix2);
  } else if (digitalRead(BoutonC) == LOW && debounce == 0) {
    debounce = 1;
    delay(50);
    Serial.println();
    checkButtonPress(2, 'C', Choix3);
  } else if (digitalRead(BoutonD) == LOW && debounce == 0) {
    debounce = 1;
    delay(50);
    Serial.println();
    checkButtonPress(3, 'D', Choix4);
  } else if (digitalRead(BoutonE) == LOW && debounce == 0) {
    debounce = 1;
    delay(50);
    Serial.println();
    checkButtonPress(4, 'E', Choix5);
  } else if (digitalRead(BoutonF) == LOW && debounce == 0) {
    debounce = 1;
    delay(50);
    Serial.println();
    checkButtonPress(5, 'F', Choix6);
  } else if (digitalRead(BoutonA) == HIGH && digitalRead(BoutonB) == HIGH && digitalRead(BoutonC) == HIGH && digitalRead(BoutonD) == HIGH && digitalRead(BoutonE) == HIGH && digitalRead(BoutonF) == HIGH && debounce == 1) {
    debounce = 0;
    delay(50);
  }

  checkResetButton();
  checkPeriodicSave();
}

//- Config du WIFI et action de la page WEB -----------------//
//-----------------------------------------------------------//

void configDuWifi() {
  //Adresse manuel de Sontadeg : 192.168.1.4
  IPAddress local_IP(192, 168, 4, 1);
  IPAddress gateway(192, 168, 4, 1);
  IPAddress subnet(255, 255, 255, 0);

  WiFi.mode(WIFI_AP_STA);                        // mode fixe, jamais changé à l'exécution - seuls softAP()/begin() sont basculés ensuite
  // Désactive la reconnexion auto en tâche de fond : sans ça, un SSID/mdp faux fait retenter l'ESP32
  // indéfiniment, ce qui force des changements de canal radio en boucle et casse l'AP en continu
  // (l'AP et la STA partagent la même radio/canal sur l'ESP32).
  WiFi.setAutoReconnect(false);
  WiFi.softAPConfig(local_IP, gateway, subnet);  // Configurer l'IP fixe

  if (APActive) {
    WiFi.softAP(NomduReseauAP, MotdePasseAP);
  }
  monIP = WiFi.softAPIP();

  dnsServer.setErrorReplyCode(DNSReplyCode::ServerFailure);
  dnsServer.start(53, "*", local_IP);

  // Accès à internet
  if (STAActive && !NomduReseauNET.isEmpty()) {
    WiFi.begin(NomduReseauNET.c_str(), MotdePasseNET.c_str());
    int attenteWifi = 0;
    while (WiFi.status() != WL_CONNECTED && attenteWifi < 30) {
      delay(200);
      Serial.print("·");
      attenteWifi++;
    }
    Serial.println();
    if (WiFi.status() == WL_CONNECTED) {
      WifiMode = LANG_WIFI_CONNECTE;
      OnlineMode = true;
      monSTAIP = WiFi.localIP();
      // Configuration NTP nécessaire pour l'horodatage
      configTime(0, 0, "pool.ntp.org", "time.nist.gov");
      struct tm timeinfo;
      if (!getLocalTime(&timeinfo, 5000)) {
        Serial.println("NTP indisponible malgré connexion WiFi - passage en mode REL");
        OnlineMode = false;  // si on ne trouve pas d'heure fiable : Sontadeg passe en calcule d'heure relatif
      }
    } else {
      WifiMode = LANG_WIFI_HORS_LIGNE;
      OnlineMode = false;
      monSTAIP = IPAddress(0, 0, 0, 0);
      WiFi.disconnect(true);  // stoppe net les tentatives STA (radio rendue à l'AP), pas de retry en tâche de fond
    }
  } else {
    WifiMode = LANG_WIFI_HORS_LIGNE;
    OnlineMode = false;
    monSTAIP = IPAddress(0, 0, 0, 0);
  }

  // mDNS initialisé
  if (!MDNS.begin(NomduReseauAP)) {
    Serial.println("Erreur lors du démarrage de MDNS");
  } else {
    MDNS.addService("http", "tcp", 80);
  }

  ServeurWebSondage.on("/", handle_OnConnect);  // Page principale du sondage
  ServeurWebSondage.on("/config", handle_Config);
  ServeurWebSondage.on("/savetext", HTTP_POST, handleFormText);
  ServeurWebSondage.on("/savereturn", HTTP_POST, handleSaveConfig);
  ServeurWebSondage.on("/downloadresume", HTTP_GET, handleDownloadResumeCSV);
  ServeurWebSondage.on("/downloadlog", HTTP_GET, handleDownloadLogCSV);
  ServeurWebSondage.onNotFound(handle_OnConnect);
  ServeurWebSondage.begin();

  Serial.println();
  Serial.println("SONTADEG - Borne d'enquête public");
  Serial.print("Adresse du Point d'Accès : ");
  Serial.print(NomduReseauAP);
  Serial.print(".local");
  Serial.print(" || ");
  Serial.print(monIP);
  if (!MotdePasseAP.isEmpty()) {
    Serial.print(" || Mdp : ");
    Serial.println(MotdePasseAP);
  } else {
    Serial.println();
  }
  Serial.print("Mode ");
  Serial.println(WifiMode);
}

//- Accès web à Sontadeg (Mode AP et STA) ------------------------//
//----------------------------------------------------------------//

// Activation du mode AP (acces point) par défaut (peut être déactivé dans la page config ou via un appui du bouton reset)
void setAPRadio(bool enable) {
  if (enable) {
    WiFi.softAP(NomduReseauAP, MotdePasseAP);
  } else {
    WiFi.softAPdisconnect(true);
  }
}

// Activation du mode STA (station) par défaut (peut être déactivé dans la page config)
void setSTARadio(bool enable) {
  if (enable) {
    if (!NomduReseauNET.isEmpty()) {
      WiFi.begin(NomduReseauNET.c_str(), MotdePasseNET.c_str());
      int attente = 0;
      while (WiFi.status() != WL_CONNECTED && attente < 15) {
        delay(200);
        attente++;
      }
      if (WiFi.status() == WL_CONNECTED) {
        WifiMode = LANG_WIFI_CONNECTE;
        OnlineMode = true;
        monSTAIP = WiFi.localIP();
        configTime(0, 0, "pool.ntp.org", "time.nist.gov");
        struct tm timeinfo;
        if (!getLocalTime(&timeinfo, 5000)) {
          OnlineMode = false;
        }
      } else {
        WifiMode = LANG_WIFI_HORS_LIGNE;
        OnlineMode = false;
        monSTAIP = IPAddress(0, 0, 0, 0);
        WiFi.disconnect(true);  // stoppe net les tentatives STA, évite les changements de canal en boucle qui cassent l'AP
      }
    }
  } else {
    WiFi.disconnect(true);
    WifiMode = LANG_WIFI_HORS_LIGNE;
    OnlineMode = false;
    monSTAIP = IPAddress(0, 0, 0, 0);
  }
}

// Activer ou déactiver le mode AP (acces point) via un appui du bouton reset.
void toggleAPFromButton() {
  APActive = !APActive;
  lfsWrite("/APActive.txt", APActive);
  setAPRadio(APActive);
  Serial.print("AP ");
  Serial.println(APActive ? "activé" : "désactivé");
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
  Serial.print(Choix6);
  Serial.print("  (");
  Serial.print(SpamCount);
  Serial.println(" spams)");
  return;
}

//- Journal des votes ------------------------------------------//
//--------------------------------------------------------------//

// Montrer les 3 derniers événements dans la page config.
String lastEvents[3] = {"", "", ""};

void pushLastEvent(const String &formatted) {
  lastEvents[2] = lastEvents[1];
  lastEvents[1] = lastEvents[0];
  lastEvents[0] = formatted;
}

String formatVoteEventDisplay(const VoteEvent &ev) {
  String temps;
  if (ev.isNtp) {
    time_t t = ev.timestamp;
    struct tm *tinfo = localtime(&t);
    char buf[9];
    snprintf(buf, sizeof(buf), "%02d:%02d:%02d", tinfo->tm_hour, tinfo->tm_min, tinfo->tm_sec);
    temps = String(buf);
  } else {
    uint32_t totalSec = ev.timestamp;
    uint32_t heures = totalSec / 3600;
    uint32_t minutes = (totalSec % 3600) / 60;
    uint32_t secondes = totalSec % 60;
    char buf[16];
    snprintf(buf, sizeof(buf), "%02uh%02um%02us", (unsigned)heures, (unsigned)minutes, (unsigned)secondes);
    temps = String(buf);
  }
  return String(ev.bouton) + " " + temps;
}

// Construit et ajoute un event au log.
void logVoteEvent(char bouton) {
  VoteEvent ev;
  ev.bouton = bouton;
  ev.session = sessionCount;

  if (OnlineMode && Horodatage) {
    time_t now;
    time(&now);
    ev.isNtp = true;
    ev.timestamp = (uint32_t)now;
  } else {
    ev.isNtp = false;
    ev.timestamp = millis() / 1000UL;  // secondes depuis boot
  }

  voteLog.push_back(ev);
  pushLastEvent(formatVoteEventDisplay(ev));
}

// Retire le dernier event du log (utilisé par la régulation anti-spam).
void popLastVoteEvent(char expectedBouton) {
  if (voteLog.empty()) return;
  if (voteLog.back().bouton == expectedBouton) {
    voteLog.pop_back();
    if (voteLogIndex > voteLog.size()) {
      voteLogIndex = voteLog.size();
    }
  }
}

// Formate un event en une ligne CSV : NTP;session;epoch;lettre  ou  REL;session;HHhMMmSSs;lettre
String formatVoteEvent(const VoteEvent &ev) {
  String line;
  if (ev.isNtp) {
    line = "NTP;" + String(ev.session) + ";" + String(ev.timestamp) + ";" + String(ev.bouton);
  } else {
    uint32_t totalSec = ev.timestamp;
    uint32_t heures = totalSec / 3600;
    uint32_t minutes = (totalSec % 3600) / 60;
    uint32_t secondes = totalSec % 60;
    char buf[16];
    snprintf(buf, sizeof(buf), "%02uh%02um%02us", (unsigned)heures, (unsigned)minutes, (unsigned)secondes);
    line = "REL;" + String(ev.session) + ";" + String(buf) + ";" + String(ev.bouton);
  }
  return line;
}

// Sauvegarde le journal (append des nouveaux events uniquement)
void saveVoteLog() {
  if (!SondageStart) {
    return;  // aucune écriture dans le log avant le lancement du sondage par l'utilisateur
  }
  if (voteLogIndex >= voteLog.size()) {
    return;  // rien de nouveau à écrire
  }

  // On ajoute juste les nouveaux evenements dans le log.
  File fw = LittleFS.open(VOTE_LOG_PATH, FILE_APPEND);
  if (!fw) {
    Serial.println("Erreur ouverture votelog.csv en écriture (append)");
    return;
  }

  // Sauvegarde du numéro de session (1 session correspond à un boot : sert plus tard pour avoir un csv lisible si l'horodatage ne fonctionne pas)
  if (!sessionCountSaved) {
    lfsWrite("/SessionCount.txt", sessionCount);
    sessionCountSaved = true;
  }

  for (size_t i = voteLogIndex; i < voteLog.size(); i++) {
    fw.println(formatVoteEvent(voteLog[i]));
  }
  fw.close();

  voteLogIndex = voteLog.size();
  Serial.println("Journal de votes sauvegardé sur LittleFS");
}

// Vide et réinitialise complètement le journal (utilisé par le reset).
void resetVoteLog() {
  voteLog.clear();
  voteLogIndex = 0;

  File f = LittleFS.open(VOTE_LOG_PATH, FILE_WRITE);  // FILE_WRITE tronque le fichier
  if (f) {
    f.close();
  }
}

// Sauvegarde périodique (periode choisit par l'utilisateur)
void checkPeriodicSave() {
  int interval = SaveIntervalMin;
  if (interval < SaveIntervalMinMin) interval = SaveIntervalMinMin;

  if (millis() - lastSaveTime >= (unsigned long)interval * 60000UL) {
    saveVoteLog();
    lastSaveTime = millis();
  }
}

//- Boutons actifs (activation/désactivation par lettre) ---------//
//----------------------------------------------------------------//

// Algorithme de tri des lettres actives entrée dans la page config.
String normalizeActiveButtons(String input) {
  input.toUpperCase();
  String result = "";
  for (int i = 0; i < 6; i++) {
    char c = 'A' + i;
    if (input.indexOf(c) != -1) {
      result += c;
    }
  }
  return result;
}

// Une chaîne valide contient au moins 2 lettres (si ce n'est pas le cas ce n'est pas pris en compte)
bool isActiveButtonsValid(const String &normalized) {
  return normalized.length() >= 2;
}

bool isButtonActive(char letter) {
  return ActiveButtons.indexOf(letter) != -1;
}

// Animation de bouton déactivé
bool inactiveBlinkActive = false;
unsigned long inactiveBlinkStart = 0;
const int inactiveBlinkPhaseMs = 120;
const int inactiveBlinkPhases = 6;  // 3 phases de clignottement

void triggerInactiveButtonBlink() {
  if (LedActive != 1) return;  // rien à animer si les LEDs sont coupées
  inactiveBlinkActive = true;
  inactiveBlinkStart = millis();
}

void inactiveButtonBlinkAnimation() {
  if (!inactiveBlinkActive) return;
  unsigned long elapsed = millis() - inactiveBlinkStart;
  int phase = elapsed / inactiveBlinkPhaseMs;

  if (phase >= inactiveBlinkPhases) {
    inactiveBlinkActive = false;
    FastLED.setBrightness(Brightness);
    configLedColor(); 
    return;
  }

  // met la couleur configurée par l'utilisateur en fin d'animation
  if (phase % 2 == 0) {
    fill_solid(leds, NUM_LEDS, CRGB::Black);
  } else {
    fill_solid(leds, NUM_LEDS, CRGB(Red, Green, Blue));
  }
  FastLED.show();
}

//- Actions des boutons de Sontadeg -------------------------//
//-----------------------------------------------------------//

void checkButtonPress(int buttonIndex, char buttonLetter, int &caseCount) {

  // si le bouton est désactivé il y a un signal visuelm mais aucun vote.
  if (!isButtonActive(buttonLetter)) {
    triggerInactiveButtonBlink();
    return;
  }

  // Déclencher le feedback LED pour tout appui de bouton
  ledAnimationActive = true;
  animStart = millis();
  Brightness = 255;
  // Si l'anti-spam est actif, vérifier si le délai est écoulé
  if (antiSpamActive) {
    if (millis() - antiSpamStartTime >= DelaiAntiSpam) {
      antiSpamActive = false;
    } else {
      // L'animation se fait quand même avec le spam pour que l'utilisateur ne se rende pas compte (sauf si AnimSpam est désactivé dans la page config).
      if (AnimSpam == 0) ledAnimationActive = false;
      return;  // Ignore l'appui du bouton pendant la période d'anti-spam
    }
  }

  Serial.print("temps interbouton ");
  Serial.println(currentTime - previousTime);

  //- Spam de rapidité ! -//
  if (currentTime - previousTime <= SeuilSpamBtn) {
    MultiClicCount = 0;
    Serial.println("SPAM (spam rapidité)");
    SpamCount++;
    logVoteEvent('Z');

    if (ToleranceSpam == 0) {
      switch (previousButton) {
        case 0: ToleranceMalus('A', Choix1); break;
        case 1: ToleranceMalus('B', Choix2); break;
        case 2: ToleranceMalus('C', Choix3); break;
        case 3: ToleranceMalus('D', Choix4); break;
        case 4: ToleranceMalus('E', Choix5); break;
        case 5: ToleranceMalus('F', Choix6); break;
      }
    }
    // Activation de l'anti-spam
    antiSpamActive = true;
    antiSpamStartTime = millis();
    if (AnimSpam == 0) ledAnimationActive = false;
    return;
  }

  //- Spam de répétition + réponses mutliples -//
  if ((currentTime - previousTime >= SeuilSpamBtn) && (currentTime - previousTime <= DelaiInterReponse)) {
    MultiClicCount++;

    // Spam de répétition
    if (previousButton == buttonIndex) {
      MultiClicCount = 0;
      Serial.println("SPAM (répétition)");
      SpamCount++;
      logVoteEvent('Z');

      if (ToleranceSpam == 0) {
        switch (previousButton) {
          case 0: ToleranceMalus('A', Choix1); break;
          case 1: ToleranceMalus('B', Choix2); break;
          case 2: ToleranceMalus('C', Choix3); break;
          case 3: ToleranceMalus('D', Choix4); break;
          case 4: ToleranceMalus('E', Choix5); break;
          case 5: ToleranceMalus('F', Choix6); break;
        }
      }
      // Activation de l'anti-spam
      antiSpamActive = true;
      antiSpamStartTime = millis();
      if (AnimSpam == 0) ledAnimationActive = false;
      return;
    }

    // Réponse multiple et acceptée
    if (MultiClicCount <= (MultiReponse - 1)) {
      caseCount++;
      previousButton = buttonIndex;
      Serial.print("Bouton ");
      Serial.print(buttonLetter);
      Serial.println(" appuyé !");
      logVoteEvent(buttonLetter);
      MonitorCount();

      // Trop de réponses multiples
    } else if (MultiClicCount >= (MultiReponse - 1)) {
      Serial.println("Trop de réponses");
      // Activation de l'anti-spam
      antiSpamActive = true;
      antiSpamStartTime = millis();
      if (AnimSpam == 0) ledAnimationActive = false;
      return;
    }
  }

  //- Appui unique acceptée -//
  if (currentTime - previousTime >= DelaiInterReponse) {
    MultiClicCount = 0;
    caseCount++;
    Serial.print("Bouton ");
    Serial.print(buttonLetter);
    Serial.println(" appuyé !");
    logVoteEvent(buttonLetter);
    MonitorCount();
  }

  previousButton = buttonIndex;
  previousTime = currentTime;
}

void checkResetButton() {
  if (digitalRead(BoutonReset) == LOW) {
    if (!resetActive) {
      resetActive = true;
      resetDebounce = false;
      resetStartTime = millis();
    } else if (!resetDebounce && millis() - resetStartTime >= 5000) {  // Vérifie si le bouton est maintenu pendant 5 secondes
      Choix1 = 0;
      Choix2 = 0;
      Choix3 = 0;
      Choix4 = 0;
      Choix5 = 0;
      Choix6 = 0;
      SpamCount = 0;

      resetVoteLog();  // vide la RAM et les fichiers sauvées (log et préférences sauvegardées dans la page config)

      SondageStart = false;
      lfsWrite("/SondageStart.txt", SondageStart);

      APActive = true;
      STAActive = true;
      lfsWrite("/APActive.txt", APActive);
      lfsWrite("/STAActive.txt", STAActive);
      setAPRadio(true);
      setSTARadio(true);

      Serial.println();
      Serial.println("Les variables et le journal de votes ont été remis à zéro.");
      MonitorCount();

      resetDebounce = true;
    }
  } else {
    if (resetActive && !resetDebounce) {
      unsigned long heldFor = millis() - resetStartTime;
      if (heldFor >= 50) {  // anti-rebond simple, ignore un bruit électrique très court
        toggleAPFromButton();  // appui court = bascule AP
      }
    }
    resetActive = false;
    resetDebounce = false;
  }
}

void ToleranceMalus(char boutonLetter, int &caseCount) {
  caseCount--;                     // Ajoute -1 à l'appuie du bouton précédent et sauvegarde la data
  popLastVoteEvent(boutonLetter);  // retire le dernier event du log s'il correspond
  Serial.println();
  Serial.print("Régulation de bouton ");
  Serial.println(boutonLetter);
  MonitorCount();
}

//- Liens dans les pages web de Sontadeg --------------------//
//-----------------------------------------------------------//

void handle_OnConnect() {
  ServeurWebSondage.sendHeader("Cache-Control", "no-store");
  ServeurWebSondage.send(200, "text/html", SendText(Choix1, Choix2, Choix3, Choix4, Choix5, Choix6, SpamCount, question, texteA, texteB, texteC, texteD, texteE, texteF, ActiveButtons, SondageStart));
}

void handle_Config() {
  updateConfig();

  String flashInfo = String(LittleFS.usedBytes() / 1024.0 / 1024.0, 2) + " / " + String(LittleFS.totalBytes() / 1024.0 / 1024.0, 2) + " MB";
  String eventsEnMemoire = String(voteLog.size());
  String adresseIP = monIP.toString();
  String adresseIPSTA = OnlineMode ? monSTAIP.toString() : "-";
  // Tant que le sondage n'est pas lancé on affiche 0 pour poue le numero de session.
  int sessionDisplay = SondageStart ? sessionCount : 0;

  ServeurWebSondage.sendHeader("Cache-Control", "no-store");
  ServeurWebSondage.send(200, "text/html", SendConfig(NomduReseauAP, MotdePasseAP, NomduReseauNET, MotdePasseNET, WifiMode, DelaiInterReponse, DelaiAntiSpam, SeuilSpamBtn, ToleranceSpam, MultiReponse, Red, Green, Blue, LedActive, BoutonAnim, AnimSpam, Horodatage, SaveIntervalMin, ActiveButtons, SondageStart, BorneDescript, sessionDisplay, flashInfo, eventsEnMemoire, adresseIP, lastEvents[0], lastEvents[1], lastEvents[2], APActive, STAActive, adresseIPSTA));
}

void handleFormText() {
  updateText();
  ServeurWebSondage.sendHeader("Cache-Control", "no-store");
  ServeurWebSondage.send(200, "text/html", SendText(Choix1, Choix2, Choix3, Choix4, Choix5, Choix6, SpamCount, question, texteA, texteB, texteC, texteD, texteE, texteF, ActiveButtons, SondageStart));
}

void handleSaveConfig() {
  updateConfig();

  if (ServeurWebSondage.hasArg("formAction") && ServeurWebSondage.arg("formAction") == "start") {
    SondageStart = true;
    lfsWrite("/SondageStart.txt", SondageStart);
    ServeurWebSondage.send(200, "text/html", SendLaunched(NomduReseauAP));
    delay(500);
    ESP.restart();
    return;
  }

  ServeurWebSondage.sendHeader("Cache-Control", "no-store");
  ServeurWebSondage.send(200, "text/html", SendText(Choix1, Choix2, Choix3, Choix4, Choix5, Choix6, SpamCount, question, texteA, texteB, texteC, texteD, texteE, texteF, ActiveButtons, SondageStart));
}

// Export CSV du résumé 
void handleDownloadResumeCSV() {
  String csvContent;
  csvContent += question + ";nombre de réponses\n";
  csvContent += texteA + ";" + String(Choix1) + "\n";
  csvContent += texteB + ";" + String(Choix2) + "\n";
  csvContent += texteC + ";" + String(Choix3) + "\n";
  csvContent += texteD + ";" + String(Choix4) + "\n";
  csvContent += texteE + ";" + String(Choix5) + "\n";
  csvContent += texteF + ";" + String(Choix6) + "\n";
  csvContent += "spam;" + String(SpamCount) + "\n";
  csvContent += "boutons_actifs;" + ActiveButtons + "\n";
  csvContent += "sous_titre;" + BorneDescript + "\n";

  ServeurWebSondage.sendHeader("Content-Disposition", "attachment; filename=sontadeg_resume.csv");
  ServeurWebSondage.send(200, "text/csv", csvContent);
}

// Export du journal détaillé
void handleDownloadLogCSV() {
  saveVoteLog();  // s'assurer que tout est bien écrit avant l'export

  String csvContent = "type;session;temps;bouton\n";

  File f = LittleFS.open(VOTE_LOG_PATH, FILE_READ);
  if (f) {
    while (f.available()) {
      csvContent += (char)f.read();
    }
    f.close();
  }
  // Si le fichier n'existe pas encore (aucun vote depuis le dernier reset), on garde juste l'en-tête dans le CSV.
  ServeurWebSondage.sendHeader("Content-Disposition", "attachment; filename=sontadeg_log.csv");
  ServeurWebSondage.send(200, "text/csv", csvContent);
}

//- Chargement et sauvegarde de Sontadeg --------------------//
//-----------------------------------------------------------//

void recomputeCountsFromLog() {
  Choix1 = Choix2 = Choix3 = Choix4 = Choix5 = Choix6 = 0;
  SpamCount = 0;

  File f = LittleFS.open(VOTE_LOG_PATH, FILE_READ);
  if (!f) return;  // pas encore de fichier - premier boot, tout reste à 0

  while (f.available()) {
    String line = f.readStringUntil('\n');
    line.trim();
    if (line.length() == 0) continue;
    char lettre = line.charAt(line.length() - 1);
    switch (lettre) {
      case 'A': Choix1++; break;
      case 'B': Choix2++; break;
      case 'C': Choix3++; break;
      case 'D': Choix4++; break;
      case 'E': Choix5++; break;
      case 'F': Choix6++; break;
      case 'Z': SpamCount++; break;
    }
  }
  f.close();
}

void loadSave() {
  lfsRead("/SessionCount.txt", sessionCount);
  lfsRead("/SondageStart.txt", SondageStart);

  lfsRead("/TexteA.txt", texteA);
  lfsRead("/TexteB.txt", texteB);
  lfsRead("/TexteC.txt", texteC);
  lfsRead("/TexteD.txt", texteD);
  lfsRead("/TexteE.txt", texteE);
  lfsRead("/TexteF.txt", texteF);
  lfsRead("/Question.txt", question);
  lfsRead("/ActiveButtons.txt", ActiveButtons);
  lfsRead("/APActive.txt", APActive);
  lfsRead("/STAActive.txt", STAActive);

  lfsRead("/NomduReseauAP.txt", NomduReseauAP);
  lfsRead("/BorneDescript.txt", BorneDescript);
  lfsRead("/MotdePasseAP.txt", MotdePasseAP);
  lfsRead("/MotdePasseNET.txt", MotdePasseNET);
  lfsRead("/NomduReseauNET.txt", NomduReseauNET);

  lfsRead("/DelaiInterReponse.txt", DelaiInterReponse);
  lfsRead("/DelaiAntiSpam.txt", DelaiAntiSpam);
  lfsRead("/SeuilSpamBtn.txt", SeuilSpamBtn);
  lfsRead("/ToleranceSpam.txt", ToleranceSpam);
  lfsRead("/MultiReponse.txt", MultiReponse);
  lfsRead("/SaveIntervalMin.txt", SaveIntervalMin);

  lfsRead("/Red.txt", Red);
  lfsRead("/Green.txt", Green);
  lfsRead("/Blue.txt", Blue);
  lfsRead("/LedActive.txt", LedActive);
  lfsRead("/BoutonAnim.txt", BoutonAnim);
  lfsRead("/AnimSpam.txt", AnimSpam);
  lfsRead("/Horodatage.txt", Horodatage);
}

void updateConfig() {
  if (ServeurWebSondage.hasArg("ActiveButtons")) {
    String normalized = normalizeActiveButtons(ServeurWebSondage.arg("ActiveButtons"));
    if (isActiveButtonsValid(normalized)) {
      ActiveButtons = normalized;
      lfsWrite("/ActiveButtons.txt", ActiveButtons);
    }
    // s'il y a moins de 2 ou plus de 6 lettres rien n'est sauvegardé et l'ancienne valeure est conservée
  }
  if (ServeurWebSondage.hasArg("NomduReseauAP")) {
    NomduReseauAP = ServeurWebSondage.arg("NomduReseauAP");
    lfsWrite("/NomduReseauAP.txt", NomduReseauAP);
  }
  if (ServeurWebSondage.hasArg("BorneDescript")) {
    BorneDescript = ServeurWebSondage.arg("BorneDescript");
    if (BorneDescript.length() > BorneDescriptMax) {
      BorneDescript = BorneDescript.substring(0, BorneDescriptMax);  // sécurité au cas où le maxlength HTML aurait été contourné
    }
    lfsWrite("/BorneDescript.txt", BorneDescript);
  }
  if (ServeurWebSondage.hasArg("MotdePasseAP")) {
    MotdePasseAP = ServeurWebSondage.arg("MotdePasseAP");
    lfsWrite("/MotdePasseAP.txt", MotdePasseAP);
  }
  bool credentialsChanged = false;
  if (ServeurWebSondage.hasArg("NomduReseauNET")) {
    String nouveau = ServeurWebSondage.arg("NomduReseauNET");
    if (nouveau != NomduReseauNET) credentialsChanged = true;
    NomduReseauNET = nouveau;
    lfsWrite("/NomduReseauNET.txt", NomduReseauNET);
  }
  if (ServeurWebSondage.hasArg("MotdePasseNET")) {
    String nouveau = ServeurWebSondage.arg("MotdePasseNET");
    if (nouveau != MotdePasseNET) credentialsChanged = true;
    MotdePasseNET = nouveau;
    lfsWrite("/MotdePasseNET.txt", MotdePasseNET);
  }
  // écriture des états des mode AP/STA traités
  if (ServeurWebSondage.hasArg("APActiveField")) {
    bool nouveau = ServeurWebSondage.arg("APActiveField").toInt() != 0;
    if (nouveau != APActive) {
      APActive = nouveau;
      lfsWrite("/APActive.txt", APActive);
      setAPRadio(APActive);
    }
  }
  bool staToggleHandled = false;
  if (ServeurWebSondage.hasArg("STAActiveField")) {
    bool nouveau = ServeurWebSondage.arg("STAActiveField").toInt() != 0;
    if (nouveau != STAActive) {
      STAActive = nouveau;
      lfsWrite("/STAActive.txt", STAActive);
      setSTARadio(STAActive);
      staToggleHandled = true;
    }
  }
  if (credentialsChanged && STAActive && !staToggleHandled) {
    setSTARadio(true);
  }
  if (ServeurWebSondage.hasArg("DelaiInterReponse")) {
    DelaiInterReponse = ServeurWebSondage.arg("DelaiInterReponse").toInt();
    lfsWrite("/DelaiInterReponse.txt", DelaiInterReponse);
  }
  if (ServeurWebSondage.hasArg("DelaiAntiSpam")) {
    DelaiAntiSpam = ServeurWebSondage.arg("DelaiAntiSpam").toInt();
    lfsWrite("/DelaiAntiSpam.txt", DelaiAntiSpam);
  }
  if (ServeurWebSondage.hasArg("SeuilSpamBtn")) {
    SeuilSpamBtn = ServeurWebSondage.arg("SeuilSpamBtn").toInt();
    lfsWrite("/SeuilSpamBtn.txt", SeuilSpamBtn);
  }
  if (ServeurWebSondage.hasArg("ToleranceSpam")) {
    ToleranceSpam = ServeurWebSondage.arg("ToleranceSpam").toInt();
    lfsWrite("/ToleranceSpam.txt", ToleranceSpam);
  }
  if (ServeurWebSondage.hasArg("MultiReponse")) {
    MultiReponse = ServeurWebSondage.arg("MultiReponse").toInt();
    lfsWrite("/MultiReponse.txt", MultiReponse);
  }
  if (ServeurWebSondage.hasArg("SaveIntervalMin")) {
    int v = ServeurWebSondage.arg("SaveIntervalMin").toInt();
    if (v < SaveIntervalMinMin) v = SaveIntervalMinMin;  // borne mini, évite un flush en boucle
    SaveIntervalMin = v;
    lfsWrite("/SaveIntervalMin.txt", SaveIntervalMin);
  }
  if (ServeurWebSondage.hasArg("Red")) {
    Red = ServeurWebSondage.arg("Red").toInt();
    lfsWrite("/Red.txt", Red);
  }
  if (ServeurWebSondage.hasArg("Green")) {
    Green = ServeurWebSondage.arg("Green").toInt();
    lfsWrite("/Green.txt", Green);
  }
  if (ServeurWebSondage.hasArg("Blue")) {
    Blue = ServeurWebSondage.arg("Blue").toInt();
    lfsWrite("/Blue.txt", Blue);
  }
  if (ServeurWebSondage.hasArg("LedActive")) {
    LedActive = ServeurWebSondage.arg("LedActive").toInt();
    lfsWrite("/LedActive.txt", LedActive);
  }
  if (ServeurWebSondage.hasArg("BoutonAnim")) {
    BoutonAnim = ServeurWebSondage.arg("BoutonAnim").toInt();
    lfsWrite("/BoutonAnim.txt", BoutonAnim);
  }
  if (ServeurWebSondage.hasArg("AnimSpam")) {
    AnimSpam = ServeurWebSondage.arg("AnimSpam").toInt();
    lfsWrite("/AnimSpam.txt", AnimSpam);
  }
  if (ServeurWebSondage.hasArg("Horodatage")) {
    Horodatage = ServeurWebSondage.arg("Horodatage").toInt();
    lfsWrite("/Horodatage.txt", Horodatage);
  }
  configLedColor();  // Met à jour la couleur des LEDs après changement de configuration
}

void updateText() {
  if (ServeurWebSondage.hasArg("texteA")) {
    texteA = ServeurWebSondage.arg("texteA");
    lfsWrite("/TexteA.txt", texteA);
  }
  if (ServeurWebSondage.hasArg("texteB")) {
    texteB = ServeurWebSondage.arg("texteB");
    lfsWrite("/TexteB.txt", texteB);
  }
  if (ServeurWebSondage.hasArg("texteC")) {
    texteC = ServeurWebSondage.arg("texteC");
    lfsWrite("/TexteC.txt", texteC);
  }
  if (ServeurWebSondage.hasArg("texteD")) {
    texteD = ServeurWebSondage.arg("texteD");
    lfsWrite("/TexteD.txt", texteD);
  }
  if (ServeurWebSondage.hasArg("texteE")) {
    texteE = ServeurWebSondage.arg("texteE");
    lfsWrite("/TexteE.txt", texteE);
  }
  if (ServeurWebSondage.hasArg("texteF")) {
    texteF = ServeurWebSondage.arg("texteF");
    lfsWrite("/TexteF.txt", texteF);
  }
  if (ServeurWebSondage.hasArg("question")) {
    question = ServeurWebSondage.arg("question");
    lfsWrite("/Question.txt", question);
  }
}

//- Gestion de la bande LED de Sontadeg ----------//
//------------------------------------------------//

// Mettre à jour la couleur des LEDs
void configLedColor() {
  if (LedActive == 1) {
    fill_solid(leds, NUM_LEDS, CRGB(Red, Green, Blue));
  } else {
    fill_solid(leds, NUM_LEDS, CRGB::Black);
  }
  FastLED.show();
}

// Animation des LEDs lors d'un appui
void ledAnimation() {
  if (ledAnimationActive && LedActive == 1 && BoutonAnim == 1) {
    unsigned long animProgress = millis() - animStart;

    if (animProgress < animTempo) {
      // Première moitié : extinction
      if (animProgress < animTempo / 2) {
        Brightness = 255 - (animProgress * 510 / animTempo);
      }
      // Deuxième moitié : allumage
      else {
        Brightness = (animProgress - animTempo / 2) * 510 / animTempo;
      }

      FastLED.setBrightness(Brightness);
      fill_solid(leds, NUM_LEDS, CRGB(Red, Green, Blue));
      FastLED.show();
    } else {
      // Animation terminée
      ledAnimationActive = false;
      FastLED.setBrightness(255);
      configLedColor();
    }
  }
}