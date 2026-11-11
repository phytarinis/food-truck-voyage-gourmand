/* Pauses collectives : ce module ne lit ni ne modifie scores, jokers ou manches. */
(function (root) {
  'use strict';
  const jobs = [
    {
      name: 'Serveuse', afterRound: 1,
      title: "Serveur ? C'est juste porter des assiettes !",
      statements: [
        'On peut débuter dans certains établissements sans diplôme et apprendre sur le terrain.',
        'Pour être serveur, il faut obligatoirement savoir porter cinq assiettes en même temps !',
        "Le métier permet de travailler en saison, à la mer, à la montagne et parfois à l'étranger."
      ], falseIndex: 1,
      explanation: "Les techniques du service s'apprennent. Il n'est pas nécessaire de réaliser des prouesses d'équilibriste pour débuter.",
      quote: "Cinq assiettes ? Moi, j'en casse déjà une avec les deux mains !",
      facts: [
        { icon: 'door', text: 'Métier accessible pour débuter selon les postes.' },
        { icon: 'compass', text: 'Possibilités de contrats saisonniers et de mobilité.' },
        { icon: 'speech', text: 'Compétences : relation client, communication, organisation.' }
      ]
    },
    {
      name: 'Cuisinière', afterRound: 2,
      title: 'En cuisine, ça chauffe !',
      statements: [
        'Un cuisinier peut évoluer vers des postes comme chef de partie ou chef de cuisine.',
        "La créativité et l'adaptation des recettes sont des compétences utiles.",
        'Avant de pouvoir cuisiner, il faut obligatoirement passer un an à éplucher des patates !'
      ], falseIndex: 2,
      explanation: 'Les professionnels apprennent progressivement différentes techniques de préparation, selon leur formation et leur poste.',
      quote: "Un an de patates ?! Mais c'est une formation ou une condamnation ?!",
      facts: [
        { icon: 'spark', text: 'Créativité et compétences techniques.' },
        { icon: 'speech', text: 'Travail en équipe et organisation.' },
        { icon: 'stairs', text: "Possibilités d'évolution professionnelle." }
      ]
    },
    {
      name: 'Réceptionniste', afterRound: 3,
      title: 'Réception : bienvenue à bord !',
      statements: [
        'Les débouchés sont limités : un réceptionniste ne peut travailler que dans un hôtel !',
        'Le réceptionniste accueille les clients, les renseigne et les aide à trouver des solutions.',
        "L'anglais est utile et les compétences linguistiques peuvent se développer avec la formation et l'expérience."
      ], falseIndex: 0,
      explanation: "Les compétences de réception et d'accueil peuvent s'exercer dans différents établissements touristiques : hôtels, résidences de tourisme, campings et autres structures d'hébergement, selon les postes.",
      quote: "Ah ! Donc le comptoir d'un hôtel n'est pas mon unique destination !",
      facts: [
        { icon: 'compass', text: "Diversité des lieux d'emploi." },
        { icon: 'speech', text: 'Relation client et sens du service.' },
        { icon: 'spark', text: 'Développement des langues et des outils numériques.' }
      ]
    },
    {
      name: 'Agente d’entretien hôtelier', afterRound: 4,
      title: 'Chambre impeccable, mission essentielle !',
      statements: [
        'Ce métier contribue directement au confort et à la satisfaction des clients.',
        "Dans ce métier, on travaille toujours seul, sans contact avec les autres salariés.",
        "Avec de l'expérience, on peut évoluer vers la coordination d'une équipe d'entretien."
      ], falseIndex: 1,
      explanation: "Les professionnels de l’entretien hôtelier échangent avec leurs collègues et coordonnent leur travail avec la réception et les autres services. Organisation, techniques d’entretien et règles d’hygiène restent essentielles.",
      quote: "Ah oui… faire une chambre impeccable, c'est tout un savoir-faire !",
      facts: [
        { icon: 'door', text: 'Métier indispensable au fonctionnement des établissements.' },
        { icon: 'spark', text: 'Rigueur, autonomie et organisation.' },
        { icon: 'stairs', text: "Possibilités d'évolution et de travail dans différents types d'hébergements." }
      ]
    },
    {
      name: 'Équipière polyvalente en restauration rapide', afterRound: 5,
      title: 'Le rush du siècle !',
      statements: [
        "Certains postes permettent de débuter sans diplôme et d'être formé sur place.",
        'Dans la restauration rapide, on fait toujours la même tâche toute la journée : retourner des steaks !',
        "L'expérience peut permettre d'évoluer vers des fonctions de formateur, chef d'équipe ou responsable."
      ], falseIndex: 1,
      explanation: "Selon l'établissement, un équipier polyvalent peut participer à la préparation, au service, à l'encaissement, à l'accueil et à l'entretien.",
      quote: 'Ah, donc je peux passer des burgers à la caisse sans changer de métier !',
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
