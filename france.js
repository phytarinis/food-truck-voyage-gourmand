/* Manche 3 : indices partagés, réponses et points propres à chaque équipe. */
(function (root) {
  'use strict';
  const points = [20, 15, 10];
  const puzzles = [
    { id: 'choucroute', answer: 'choucroute garnie', title: "C'était la choucroute !", region: '44', heading: "Direction l'Alsace !", fact: "La choucroute garnie est emblématique de l'Alsace, aujourd'hui située dans la région Grand Est. Strasbourg est l'une des villes emblématiques du territoire.", clues: [
      "Je suis un plat généreux qu'on apprécie quand il fait froid.",
      'On y retrouve des saucisses, de la charcuterie et des pommes de terre.',
      'Mon ingrédient principal est le chou fermenté.'
    ] },
    { id: 'galette', answer: 'galette de sarrasin ou galette bretonne', title: "C'était la galette bretonne !", region: '53', heading: 'Bienvenue en Bretagne !', fact: 'Les galettes sont préparées avec du sarrasin, également appelé blé noir. On les retrouve notamment dans les crêperies bretonnes, avec de nombreuses garnitures salées.', clues: [
      'Je suis ronde, mais on me replie souvent en carré.',
      'On me déguste salée, avec du jambon, du fromage et parfois un œuf.',
      'Je suis préparée avec de la farine de sarrasin, aussi appelée blé noir.'
    ] },
    { id: 'rougail', answer: 'rougail saucisse', title: "C'était le rougail saucisse !", region: '04', heading: 'Cap sur La Réunion !', fact: "La Réunion est un département et une région d'outre-mer français, situé dans l'océan Indien. Le rougail saucisse est un plat emblématique de sa cuisine créole.", clues: [
      "Je suis un plat familial souvent accompagné de riz et relevé d'épices.",
      'Je mélange des saucisses, des tomates, des oignons et parfois du piment.',
      "Je suis une spécialité de La Réunion, une île française de l'océan Indien."
    ] }
  ];
  const regionCodes = ['11','24','27','28','32','44','52','53','75','76','84','93','94','01','02','03','04','06'];
  const bonus = {
    title: "BONUS — ON EST COMBIEN DANS L'HEXAGONE ?",
    question: "Combien d'habitants compte environ la France métropolitaine ?",
    options: ['47 millions', '67 millions', '87 millions'], correctIndex: 1,
    explanation: 'B — Environ 67 millions : un ordre de grandeur parmi les trois propositions, pas un décompte exact.',
    // Donnée Insee et référence vérifiées et communiquées par l’utilisateur le 11/11/2026.
    reference: 'Au 1er janvier 2026, la France métropolitaine compte environ 67 millions d’habitants (source : Insee, estimation provisoire).',
    source: 'https://www.insee.fr/fr/statistiques/5225246',
    quote: "67 millions de personnes… Heureusement que je ne dois pas livrer tout le monde aujourd'hui !"
  };
  const createRound = typeof module !== 'undefined' && module.exports ? require('./clue-flags.js') : root.createClueFlagRound;
  const api = createRound({ key: 'france', points, puzzles, bonus, regionCodes });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FranceGame = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
