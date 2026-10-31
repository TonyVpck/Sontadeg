//-------------------------------------------------------------------------------------------//
// SONTADEG page d'acceuil // Fichier de langue                            FRANCAIS ---------//
//-------------------------------------------------------------------------------------------//

window.SONTADEG_LANGS = window.SONTADEG_LANGS || {};

window.SONTADEG_LANGS.fr = {
  code: "FR",
  name: "Français",

  strings: {
    title: "Sontadeg – Borne de sondage anonyme",

    logoLabel: "Sontadeg",
    summaryTitle: "Interface ouverte pour enquêtes locales",
    summaryText: "Sontadeg est une borne de sondage open-source pour événements et espaces publics. Construisez votre borne, posez une question à vos publics, puis exportez les résultats ou explorez-les avec Arsellan, notre outil de datavisualisation.",

    stepsLabel: "Découvrir Sontadeg",
    step1Title: "Fabriquer",
    step1Text: "Construire sa borne",
    step2Title: "Installer",
    step2Text: "Flasher le firmware",
    step3Title: "Explorer",
    step3Text: "Visualiser les résultats",

    illustrationLabel: "Dessin de la borne Sontadeg avec ses six boutons",
    footer: "Edulab Rennes 2, Labfab | Septembre 2026 v1.2 [CC-BY-SA]",
    langLabel: "Langue"
  },

  questions: [
    {
      question: "De quelle ville viens-tu ?",
      answers: ["Rennes", "Angers", "Quimper", "Vannes", "Tours", "Nantes"]
    },
    {
      question: "Comment es-tu venu·e ?",
      answers: ["à pied", "en vélo", "en train", "en voiture", "en bus ou métro", "autrement"]
    },
    {
      question: "Comment nous connais-tu ?",
      answers: [
        "par des amis",
        "par votre réputation",
        "par vos affiches",
        "par vos réseaux",
        "par la presse",
        "par hasard"
      ]
    }
  ]
};
