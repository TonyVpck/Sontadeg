//-------------------------------------------------------------------------------------------//
// Fichier de langue                                                   FRANÇAIS     ---------//
//                                                                                  ---------//
// Pour changer la langue de Sontadeg :                                             ---------//
// copiez le contenu d'un autre langXX.h et collez le entièrement dans "lang.h"     ---------//
//-------------------------------------------------------------------------------------------//

#ifndef LANG_H
#define LANG_H

// ================== Contenu par défaut du sondage ==================
const char *LANG_QUESTION_DEFAUT = "Comment allez-vous ?";
const char *LANG_TEXTE_A_DEFAUT = "Je dirais plutot A";
const char *LANG_TEXTE_B_DEFAUT = "Je me sens B";
const char *LANG_TEXTE_C_DEFAUT = "Je suis d'avis de dire C";
const char *LANG_TEXTE_D_DEFAUT = "Mon coeur balance pour D";
const char *LANG_TEXTE_E_DEFAUT = "Certainement E";
const char *LANG_TEXTE_F_DEFAUT = "Je suis sure de dire F";

// ================== Descriptif ==================
const char *LANG_FOOTER_TAGLINE = "interface ouverte pour enquêtes locale";

// ================== Page princiaple (sontadegRoot.h) ==================
const char *LANG_SPAM_LABEL = "Nombre de spams";
const char *LANG_TOOLTIP_CSV_RESUME = "CSV résumé (question + votes)";
const char *LANG_TOOLTIP_CSV_LOG = "CSV journal détaillé (horodaté)";
const char *LANG_MSG_AVANT_LANCEMENT_L1 = "[MODE CONFIGURATION]";
const char *LANG_MSG_AVANT_LANCEMENT_L2 = "Personnalisez avant de lancez l'enquête dans la page config. Les votes ne sont pas enregistrés avant le lancement";
const char *LANG_TITRE_SONDAGE_LANCE = "Enquête lancé avec succès";
const char *LANG_SOUSTITRE_REDEMARRAGE = "On réinitialise Sontadeg !";

// ================== Page de configuration (sontadegConfig.h) ==================
const char *LANG_H2_ID_BORNE = "Identifiants de la borne";
const char *LANG_LABEL_NOM_BORNE = "Nom de la borne";
const char *LANG_TOOLTIP_NOM_BORNE = "Nom de la borne et de l'adresse de la page web X.local";
const char *LANG_LABEL_MDP = "Mot de passe";
const char *LANG_TOOLTIP_MDP = "Optionnel, doit faire soit 0 soit 8 ou plus";

const char *LANG_H2_PARAMETRES_BORNE = "Paramètres";
const char *LANG_LABEL_DESCRIPTION = "Note et descprition";
const char *LANG_TOOLTIP_DESCRIPTION = "Note libre pour les admins, 80 caractères maximum.";
const char *LANG_LABEL_BOUTONS_ACTIFS = "Boutons actifs";
const char *LANG_TOOLTIP_BOUTONS_ACTIFS = "Boutons à activer ou déactiver de A à F.";
const char *LANG_LABEL_INTERVALLE_SAVE = "Délai de sauvegarde";
const char *LANG_TOOLTIP_INTERVALLE_SAVE = "Fréquence d'écriture du journal de votes (en minutes).";

const char *LANG_H2_CONFIG_RESEAU = "Configuration réseau";
const char *LANG_LABEL_NOM_RESEAU = "Nom du réseau WiFi";
const char *LANG_TOOLTIP_NOM_RESEAU = "Pour l'horodatage, nom du point wifi pour une connexion internet";
const char *LANG_LABEL_CLE_WIFI = "Clée du WiFi";
const char *LANG_TOOLTIP_CLE_WIFI = "Pour l'horodatage, mot de passe de la connexion internet";
const char *LANG_LABEL_ETAT = "État";
const char *LANG_TOOLTIP_ETAT = "Mode de connexion";
const char *LANG_WIFI_CONNECTE = "connecté";
const char *LANG_WIFI_HORS_LIGNE = "hors-ligne";
const char *LANG_LABEL_HORODATAGE = "Horodatage";
const char *LANG_TOOLTIP_HORODATAGE = "Récupère l'heure exact sur internet si internet est actif";

const char *LANG_H2_FONCTIONNEMENT_WIFI = "Comportement du Wi-Fi";
const char *LANG_LABEL_AP_ACTIF = "Mode point d'accès";
const char *LANG_TOOLTIP_AP_ACTIF = "Permet d'acceder à la page du sondage via un point wifi (AP)";
const char *LANG_LABEL_STA_ACTIF = "Accès par le réseau";
const char *LANG_TOOLTIP_STA_ACTIF = "Permet d'acceder à la page du sondage via le réseau local à X.local (STA)";

const char *LANG_H2_ANTISPAM = "Anti-clic frénétique";
const char *LANG_LABEL_SEUIL_SPAM = "Seuil détection de spam";
const char *LANG_TOOLTIP_SEUIL_SPAM = "Délai minimal admis entre 2 clics (en milliseconde).";
const char *LANG_LABEL_TOLERANCE_SPAM = "Tolerance aux spams";
const char *LANG_TOOLTIP_TOLERANCE_SPAM = "Laisser passer la réponse avant un spam ? (0 ou 1).";
const char *LANG_LABEL_NB_REPONSES = "Nb de réponses maxi";
const char *LANG_TOOLTIP_NB_REPONSES = "Ma question demande jusqu'à X réponses différentes.";
const char *LANG_LABEL_DELAI_INTER = "Temps entre réponses";
const char *LANG_TOOLTIP_DELAI_INTER = "Temps accepté entre deux réponses (en milliseconde).";
const char *LANG_LABEL_DELAI_ANTISPAM = "Temps de réactivation";
const char *LANG_TOOLTIP_DELAI_ANTISPAM = "Temps avant de pouvoir recliquer après un spam ou une réponse de trop (en milliseconde).";

const char *LANG_H2_LEDS = "Gestion des LEDs";
const char *LANG_LABEL_LED_ACTIVE = "Activer les leds";
const char *LANG_TOOLTIP_LED_ACTIVE = "Leds éteintes à 0, allumées à 1, sur batterie, les leds consomment beaucoup";
const char *LANG_LABEL_BOUTON_ANIM = "Boutons réactifs";
const char *LANG_TOOLTIP_BOUTON_ANIM = "Animation lors de l'appui des boutons.";
const char *LANG_LABEL_ANIM_SPAM = "Spam réactifs";
const char *LANG_TOOLTIP_ANIM_SPAM = "l'animation des boutons continue même durant un spam.";
const char *LANG_LABEL_ROUGE = "Lumière rouge";
const char *LANG_TOOLTIP_ROUGE = "Taux de rouge dans les leds (255 max).";
const char *LANG_LABEL_VERT = "Lumière verte";
const char *LANG_TOOLTIP_VERT = "Taux de vert dans les leds (255 max).";
const char *LANG_LABEL_BLEU = "Lumière bleue";
const char *LANG_TOOLTIP_BLEU = "Taux de bleue dans les leds (255 max).";

const char *LANG_H2_INFOS = "Informations";
const char *LANG_LABEL_SESSION = "Session en cours";
const char *LANG_LABEL_FLASH = "Espace utilisé";
const char *LANG_LABEL_EVENTS_MEMOIRE = "Compte d'événements";
const char *LANG_LABEL_ADRESSE_IP = "IP de la borne";
const char *LANG_LABEL_DERNIERS_EVENTS = "3 derniers événements";
const char *LANG_LABEL_ADRESSE_IP_STA = "IP (réseau local)";

#endif