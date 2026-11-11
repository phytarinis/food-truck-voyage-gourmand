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
    { id: 'galette', answer: 'galette de sarrasin ou galette bretonne', title: "C'était la galette de sarrasin !", region: '53', heading: 'Bienvenue en Bretagne !', fact: 'Les galettes sont préparées avec du sarrasin, également appelé blé noir. On les retrouve notamment dans les crêperies bretonnes, avec de nombreuses garnitures salées.', clues: [
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
  let nextId = 1;
  const newPlayers = () => [0, 1].map(() => ({ clueIndex: 0, status: 'searching', points: 0, locationPoints: 0, revision: 0 }));
  function start(game) {
    if (!game.france) game.france = { id: nextId++, puzzleIndex: 0, clueIndex: 0, phase: 'intro', players: newPlayers(), results: [], bonus: { selected: null, revealed: false } };
    return game.france;
  }
  function begin(game) { if (game.france?.phase === 'intro') game.france.phase = 'search'; }
  function token(game, team) {
    const s = game.france;
    if (!s || s.phase !== 'search' || ![0, 1].includes(team) || s.players[team].status !== 'searching') return null;
    return `${s.id}:${s.puzzleIndex}:${s.clueIndex}:${team}:${s.players[team].revision}`;
  }
  function validate(game, team, correct, expectedToken) {
    const current = token(game, team);
    if (!current || expectedToken !== current || typeof correct !== 'boolean') return false;
    const s = game.france, p = s.players[team];
    p.revision++; p.clueIndex = s.clueIndex;
    if (correct) {
      p.points = points[p.clueIndex]; p.status = 'found';
      game.teams[team].score += p.points;
    } else if (s.clueIndex === 2) p.status = 'exhausted';
    else p.status = 'waiting';
    if (s.players.every(player => player.status === 'found' || player.status === 'exhausted')) {
      s.results[s.puzzleIndex] = s.players.map(player => ({ ...player }));
      s.phase = 'answer';
    }
    return true;
  }
  function canRevealNextClue(game) {
    const s = game.france;
    return Boolean(s && s.phase === 'search' && s.clueIndex < 2 &&
      s.players.every(player => player.status === 'waiting' || player.status === 'found') &&
      s.players.some(player => player.status === 'waiting'));
  }
  function nextClueToken(game) {
    if (!canRevealNextClue(game)) return null;
    const s = game.france;
    return `${s.id}:${s.puzzleIndex}:${s.clueIndex}:${s.players.map(player => player.revision).join(':')}`;
  }
  function revealNextClue(game, expectedToken) {
    const current = nextClueToken(game);
    if (!current || current !== expectedToken) return false;
    const s = game.france; s.clueIndex++;
    for (const player of s.players) {
      if (player.status === 'waiting') {
        player.status = 'searching'; player.clueIndex = s.clueIndex; player.revision++;
      }
    }
    return true;
  }
  function startLocation(game) {
    const s = game.france;
    if (!s || s.phase !== 'answer') return false;
    s.location = { activeTeam: 0, choices: [null, null], locked: [false, false], revealed: false };
    s.phase = 'location'; return true;
  }
  function locationToken(game) {
    const s = game.france, l = s?.location;
    if (s?.phase !== 'location' || !l || l.revealed || l.locked.every(Boolean)) return null;
    return `${s.id}:${s.puzzleIndex}:flag:${l.activeTeam}`;
  }
  function chooseRegion(game, code, stamp) {
    const current = locationToken(game);
    if (!current || current !== stamp || !regionCodes.includes(code)) return false;
    const l = game.france.location; l.choices[l.activeTeam] = code; return true;
  }
  function lockFlag(game, stamp) {
    const current = locationToken(game), l = game.france?.location;
    if (!current || current !== stamp || !l.choices[l.activeTeam]) return false;
    l.locked[l.activeTeam] = true; l.activeTeam = 1; return true;
  }
  function revealLocation(game) {
    const s = game.france, l = s?.location;
    if (s?.phase !== 'location' || !l || !l.locked.every(Boolean) || l.revealed) return false;
    l.revealed = true;
    s.players.forEach((p, team) => {
      p.locationPoints = l.choices[team] === puzzles[s.puzzleIndex].region ? 5 : 0;
      game.teams[team].score += p.locationPoints;
      Object.assign(s.results[s.puzzleIndex][team], { locationPoints: p.locationPoints, region: l.choices[team] });
    });
    return true;
  }
  function discover(game) {
    if (game.france?.phase !== 'location' || !game.france.location.revealed) return false;
    game.france.phase = 'correction'; return true;
  }
  function next(game) {
    const s = game.france;
    if (!s || s.phase !== 'correction') return false;
    if (s.puzzleIndex === puzzles.length - 1) s.phase = 'bonus';
    else { s.puzzleIndex++; s.clueIndex = 0; s.players = newPlayers(); s.phase = 'search'; }
    return true;
  }
  function chooseBonus(game, choice) {
    const s = game.france;
    if (!s || s.phase !== 'bonus' || s.bonus.revealed || !Number.isInteger(choice) || choice < 0 || choice >= bonus.options.length) return false;
    s.bonus.selected = choice; return true;
  }
  function revealBonus(game) {
    const s = game.france;
    if (!s || s.phase !== 'bonus' || s.bonus.selected === null || s.bonus.revealed) return false;
    s.bonus.revealed = true; return true;
  }
  function finish(game) {
    const s = game.france;
    if (!s || s.phase !== 'bonus' || !s.bonus.revealed) return false;
    s.phase = 'complete'; return true;
  }
  function totals(game) { return game.teams.map((_, team) => (game.france?.results || []).reduce((sum, result) => sum + result[team].points + result[team].locationPoints, 0)); }
  const api = { points, puzzles, bonus, regionCodes, startLocation, locationToken, chooseRegion, lockFlag, revealLocation, discover, start, begin, token, validate, canRevealNextClue, nextClueToken, revealNextClue, next, chooseBonus, revealBonus, finish, totals };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FranceGame = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
