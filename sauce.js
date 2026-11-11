/* Manche 2 : deux recherches indépendantes, sans saisie projetée des réponses. */
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
      "Dans le Sud-Ouest, on m'appelle chocolatine. Ailleurs, je porte souvent un autre nom !"
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
  let nextId = 1;
  const newPlayers = () => [0, 1].map(() => ({ clueIndex: 0, status: 'searching', points: 0, revision: 0 }));
  function start(game) {
    if (!game.sauce) game.sauce = { id: nextId++, puzzleIndex: 0, phase: 'intro', players: newPlayers(), results: [] };
    return game.sauce;
  }
  function begin(game) { if (game.sauce?.phase === 'intro') game.sauce.phase = 'search'; }
  function token(game, team) {
    const s = game.sauce;
    if (!s || s.phase !== 'search' || ![0, 1].includes(team) || s.players[team].status !== 'searching') return null;
    return `${s.id}:${s.puzzleIndex}:${team}:${s.players[team].revision}`;
  }
  function validate(game, team, correct, expectedToken) {
    const current = token(game, team);
    if (!current || expectedToken !== current || typeof correct !== 'boolean') return false;
    const s = game.sauce, p = s.players[team];
    p.revision++;
    if (correct) {
      p.points = points[p.clueIndex]; p.status = 'found';
      game.teams[team].score += p.points;
    } else if (p.clueIndex === 2) p.status = 'exhausted';
    else p.clueIndex++;
    if (s.players.every(player => player.status !== 'searching')) {
      s.results[s.puzzleIndex] = s.players.map(player => ({ ...player }));
      s.phase = 'correction';
    }
    return true;
  }
  function next(game) {
    const s = game.sauce;
    if (!s || s.phase !== 'correction') return false;
    if (s.puzzleIndex === puzzles.length - 1) s.phase = 'complete';
    else { s.puzzleIndex++; s.players = newPlayers(); s.phase = 'search'; }
    return true;
  }
  function totals(game) { return game.teams.map((_, team) => (game.sauce?.results || []).reduce((sum, result) => sum + result[team].points, 0)); }
  const api = { points, puzzles, start, begin, token, validate, next, totals };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SauceGame = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
