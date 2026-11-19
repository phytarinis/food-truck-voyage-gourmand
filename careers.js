/* Pauses collectives : ce module ne lit ni ne modifie scores, jokers ou manches. */
(function (root) {
  'use strict';
  const jobs = [
    {
      name: "Serveur / Serveuse", afterRound: 1,
      title: "Le service, une mission d'équipe !",
      statements: [
        "On peut débuter dans certains établissements sans diplôme et apprendre sur le terrain.",
        "La préparation de la salle et le suivi des demandes des clients sont généralement confiés à d'autres salariés.",
        "Le métier permet de travailler en saison, à la mer, à la montagne et parfois à l'étranger."
      ], falseIndex: 1,
      explanation: "Le service ne se limite pas à prendre les commandes et apporter les plats. Selon l'établissement, le serveur participe aussi à la mise en place, accueille les clients, répond à leurs demandes et veille au bon déroulement du repas.",
      quote: "Entre la mise en place et les demandes, mon carnet de commandes va servir !",
      facts: [
        { icon: 'door', text: 'Métier accessible pour débuter selon les postes.' },
        { icon: 'compass', text: 'Possibilités de contrats saisonniers et de mobilité.' },
        { icon: 'speech', text: 'Compétences : relation client, communication, organisation.' }
      ]
    },
    {
      name: "Cuisinier / Cuisinière", afterRound: 2,
      title: 'En cuisine, ça chauffe !',
      statements: [
        "Un cuisinier peut évoluer vers des postes comme chef de partie ou chef de cuisine.",
        "La créativité et l'adaptation des recettes sont des compétences utiles.",
        "Quand on débute en cuisine, on passe d'abord par les corvées d'épluchage avant de pouvoir préparer de vrais plats."
      ], falseIndex: 2,
      explanation: "Les débutants participent souvent aux préparations de base, dont l'épluchage. Mais leur apprentissage ne se limite pas à ces tâches : ils peuvent progressivement réaliser des préparations, cuisiner et gagner en autonomie selon leur formation et leur poste.",
      quote: "Éplucher, oui… mais j’ai aussi des recettes à apprendre !",
      facts: [
        { icon: 'spark', text: 'Créativité et compétences techniques.' },
        { icon: 'speech', text: 'Travail en équipe et organisation.' },
        { icon: 'stairs', text: "Possibilités d'évolution professionnelle." }
      ]
    },
    {
      name: "Réceptionniste", afterRound: 3,
      title: 'Réception : bienvenue à bord !',
      statements: [
        "Les réservations, la facturation et le suivi administratif sont généralement gérés par d'autres services.",
        "Le réceptionniste accueille les clients, les renseigne et les aide à trouver des solutions.",
        "L'anglais est utile et les compétences linguistiques peuvent se développer avec la formation et l'expérience."
      ], falseIndex: 0,
      explanation: "La réception ne se limite pas à l'accueil. Selon l'établissement, le réceptionniste peut gérer les réservations, les arrivées et départs, la facturation, les demandes des clients et différentes tâches administratives.",
      quote: "Accueil, réservations, factures… ce comptoir cache bien son jeu !",
      facts: [
        { icon: 'compass', text: "Missions variées : accueil, réservations et suivi administratif." },
        { icon: 'speech', text: 'Relation client et sens du service.' },
        { icon: 'spark', text: 'Développement des langues et des outils numériques.' }
      ]
    },
    {
      name: "Entretien hôtelier", afterRound: 4,
      title: 'Chambre impeccable, mission essentielle !',
      statements: [
        "Ce métier contribue directement au confort et à la satisfaction des clients.",
        "En entretien hôtelier, les possibilités d'évolution sont limitées : même avec de l'expérience, on reste généralement au même poste.",
        "Le personnel d'entretien hôtelier doit organiser son travail en tenant compte des départs et des arrivées des clients."
      ], falseIndex: 1,
      explanation: "Le personnel d'entretien hôtelier assure la propreté et le confort des chambres et des espaces communs. Avec de l'expérience, et parfois une formation complémentaire, il peut évoluer vers des fonctions de référent, gouvernant ou gouvernante, responsable d'étage ou d'équipe. Les possibilités varient selon les établissements : l'évolution n'est pas automatique, mais elle existe.",
      quote: "Et si mon prochain étage, c’était de coordonner une équipe ?",
      facts: [
        { icon: 'door', text: 'Métier indispensable au fonctionnement des établissements.' },
        { icon: 'spark', text: 'Rigueur, autonomie et organisation.' },
        { icon: 'stairs', text: "Possibilités d'évolution et de travail dans différents types d'hébergements." }
      ]
    },
    {
      name: "Équipier polyvalent en restauration rapide", afterRound: 5,
      title: 'Le rush du siècle !',
      statements: [
        "Certains postes permettent de débuter sans diplôme et d'être formé sur place.",
        "En restauration rapide, les équipiers sont principalement affectés au service ; la préparation des produits est réservée aux cuisiniers.",
        "L'expérience peut permettre d'évoluer vers des fonctions de formateur, chef d'équipe ou responsable."
      ], falseIndex: 1,
      explanation: "La polyvalence est une caractéristique importante du métier. Selon l'établissement et son organisation, les équipiers peuvent participer à la préparation des produits, au service, à l'encaissement, à l'accueil et à l'entretien des espaces.",
      quote: "Ah, donc je peux passer des burgers à la caisse sans changer de métier !",
      facts: [
        { icon: 'door', text: 'Possibilités de premier emploi.' },
        { icon: 'spark', text: 'Polyvalence et compétences transférables.' },
        { icon: 'stairs', text: "Formation interne et perspectives d'évolution." }
      ]
    }
  ];
  function createPause(index) {
    if (!Number.isInteger(index) || index < 0 || index >= jobs.length) throw new RangeError('Pause métier inconnue');
    return { index, selected: null, revealed: false };
  }
  function select(state, choice) {
    if (state.revealed || !Number.isInteger(choice) || choice < 0 || choice > 2) return false;
    state.selected = choice; return true;
  }
  function reveal(state) {
    if (state.revealed || state.selected === null) return false;
    state.revealed = true; return true;
  }
  const api = { jobs, createPause, select, reveal };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CareerPauses = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
