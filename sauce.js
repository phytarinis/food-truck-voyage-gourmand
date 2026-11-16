/* Manche 2 : indices partagés, réponses et points propres à chaque équipe. */
(function (root) {
  'use strict';
  const points = [20, 15, 10];
  const puzzles = [
    { id: 'foie-gras', answer: 'foie gras', title: "C'était le foie gras !", clues: [
      'On me retrouve souvent au menu des repas de fête.',
      "On me sert souvent avec du pain d'épices et de la confiture de figues.",
      'Ma production est contestée par des associations de défense des animaux.'
    ], facts: [
      'Une spécialité gastronomique associée notamment au Sud-Ouest.',
      "Elle est généralement produite à partir du foie de canard ou d'oie.",
      "Sa production fait l'objet de débats concernant le gavage et le bien-être animal."
    ] },
    { id: 'chocolatine', answer: 'chocolatine / pain au chocolat', title: 'Chocolatine ou pain au chocolat ?', clues: [
      'Je peux être préparée avec une pâte pur beurre.',
      'Je cache deux barres de chocolat.',
      "Passé au nord de la Garonne, je ne porte pas toujours le même nom."
    ], facts: [
      'Une viennoiserie à base de pâte levée feuilletée et de chocolat.',
      'Le nom « chocolatine » est particulièrement employé dans le Sud-Ouest.',
      "D'autres régions utilisent principalement l'appellation « pain au chocolat »."
    ], quote: 'Chocolatine ou pain au chocolat ? Je prends les deux noms… mais une seule viennoiserie !' },
    { id: 'huitres', answer: 'les huîtres', title: "C'étaient les huîtres !", clues: [
      'Je suis un produit de la mer.',
      'Je me protège derrière une coquille.',
      'On me déguste souvent crue, avec du citron ou du vinaigre.'
    ], facts: [
      'Les huîtres sont des mollusques.',
      'Elles sont élevées dans différents bassins ostréicoles.',
      "Le bassin d'Arcachon est un territoire emblématique de l'ostréiculture en Nouvelle-Aquitaine."
    ] }
  ];
  const bonus = {
    title: 'Bonus gourmand : une région, trois histoires !',
    question: 'En 2016, quelles anciennes régions ont fusionné pour former la Nouvelle-Aquitaine ?',
    options: ['Aquitaine, Limousin et Poitou-Charentes.', 'Aquitaine, Occitanie et Bretagne.', 'Limousin, Auvergne et Pays de la Loire.'],
    correctIndex: 0,
    explanation: 'En 2016, les anciennes régions Aquitaine, Limousin et Poitou-Charentes ont fusionné pour former la Nouvelle-Aquitaine.',
    quote: "Trois régions dans une seule… Heureusement qu'on a un grand camion !"
  };
  let nextId = 1;
  const newPlayers = () => [0, 1].map(() => ({ clueIndex: 0, status: 'searching', points: 0, revision: 0 }));
  function start(game) {
    if (!game.sauce) game.sauce = { id: nextId++, puzzleIndex: 0, clueIndex: 0, phase: 'search', players: newPlayers(), results: [], bonus: { selected: null, revealed: false } };
    return game.sauce;
  }
  function begin(game) { if (game.sauce?.phase === 'intro') game.sauce.phase = 'search'; }
  function token(game, team) {
    const s = game.sauce;
    if (!s || s.phase !== 'search' || ![0, 1].includes(team) || s.players[team].status !== 'searching') return null;
    return `${s.id}:${s.puzzleIndex}:${s.clueIndex}:${team}:${s.players[team].revision}`;
  }
  function validate(game, team, correct, expectedToken) {
    const current = token(game, team);
    if (!current || expectedToken !== current || typeof correct !== 'boolean') return false;
    const s = game.sauce, p = s.players[team];
    p.revision++; p.clueIndex = s.clueIndex;
    if (correct) {
      p.points = points[p.clueIndex]; p.status = 'found';
      game.teams[team].score += p.points;
    } else if (s.clueIndex === 2) p.status = 'exhausted';
    else p.status = 'waiting';
    if (s.players.every(player => player.status === 'found' || player.status === 'exhausted')) {
      s.results[s.puzzleIndex] = s.players.map(player => ({ ...player }));
      s.phase = 'correction';
    }
    return true;
  }
  function activeTeam(game) {
    return game?.sauce?.phase==='search'?game.sauce.players.findIndex(player=>player.status==='searching'):-1;
  }
  function answerToken(game) { return token(game,activeTeam(game)); }
  function respond(game,correct,stamp) {
    const team=activeTeam(game);
    if(!stamp||stamp!==answerToken(game)||!validate(game,team,correct,stamp))return false;
    const next=nextClueToken(game);
    if(next)revealNextClue(game,next);
    return true;
  }
  function canRevealNextClue(game) {
    const s = game.sauce;
    return Boolean(s && s.phase === 'search' && s.clueIndex < 2 &&
      s.players.every(player => player.status === 'waiting' || player.status === 'found') &&
      s.players.some(player => player.status === 'waiting'));
  }
  function nextClueToken(game) {
    if (!canRevealNextClue(game)) return null;
    const s = game.sauce;
    return `${s.id}:${s.puzzleIndex}:${s.clueIndex}:${s.players.map(player => player.revision).join(':')}`;
  }
  function revealNextClue(game, expectedToken) {
    const current = nextClueToken(game);
    if (!current || current !== expectedToken) return false;
    const s = game.sauce; s.clueIndex++;
    for (const player of s.players) {
      if (player.status === 'waiting') {
        player.status = 'searching'; player.clueIndex = s.clueIndex; player.revision++;
      }
    }
    return true;
  }
  function next(game) {
    const s = game.sauce;
    if (!s || s.phase !== 'correction') return false;
    if (s.puzzleIndex === puzzles.length - 1) s.phase = 'bonus';
    else { s.puzzleIndex++; s.clueIndex = 0; s.players = newPlayers(); s.phase = 'search'; }
    return true;
  }
  function chooseBonus(game, choice) {
    const s = game.sauce;
    if (!s || s.phase !== 'bonus' || s.bonus.revealed || !Number.isInteger(choice) || choice < 0 || choice >= bonus.options.length) return false;
    s.bonus.selected = choice; return true;
  }
  function revealBonus(game) {
    const s = game.sauce;
    if (!s || s.phase !== 'bonus' || s.bonus.selected === null || s.bonus.revealed) return false;
    s.bonus.revealed = true; return true;
  }
  function finish(game) {
    const s = game.sauce;
    if (!s || s.phase !== 'bonus' || !s.bonus.revealed) return false;
    s.phase = 'complete'; return true;
  }
  function totals(game) { return game.teams.map((_, team) => (game.sauce?.results || []).reduce((sum, result) => sum + result[team].points, 0)); }
  const api = { activeTeam, answerToken, respond, points, puzzles, bonus, start, begin, token, validate, canRevealNextClue, nextClueToken, revealNextClue, next, chooseBonus, revealBonus, finish, totals };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SauceGame = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
