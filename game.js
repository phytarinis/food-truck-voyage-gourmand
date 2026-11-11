/* Moteur indépendant de l’interface : futurs défis et manches peuvent le réutiliser. */
(function (root) {
  'use strict';
  const clues = [
    { points: 20, text: "Je suis une spécialité d'un pays dont la capitale accueille plusieurs grandes institutions de l'Union européenne." },
    { points: 15, text: 'La capitale de mon pays est Bruxelles, en Belgique.' },
    { points: 10, text: 'On me prépare avec des pommes de terre et on me sert souvent dans un cornet avec de la sauce.' }
  ];
  const rounds = ["L’apéro local", 'À quelle sauce ?', 'La France et ses spécialités', 'Le GPS a perdu la boule !', 'Passeport gourmand', 'Tour du monde'];
  function createGame(names) {
    return { teams: names.map(name => ({ name: name.trim(), score: 0, jokers: 2 })), nextStarter: 0, challenge: null };
  }
  function startChallenge(game) {
    const starter = game.nextStarter;
    game.challenge = { starter, active: starter, clueIndex: 0, attempts: [false, false], done: false, winner: null, awarded: 0 };
    game.nextStarter = 1 - starter;
  }
  function answer(game, correct) {
    const c = game.challenge;
    if (!c || c.done) return;
    c.attempts[c.active] = true;
    if (correct) {
      c.winner = c.active;
      c.awarded = clues[c.clueIndex].points;
      game.teams[c.active].score += c.awarded;
      c.done = true;
    } else if (!c.attempts[1 - c.active]) {
      c.active = 1 - c.active;
    } else if (c.clueIndex < clues.length - 1) {
      c.clueIndex++;
      c.attempts = [false, false];
      c.active = c.starter;
    } else {
      c.done = true;
    }
  }
  const api = { clues, rounds, createGame, startChallenge, answer };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FoodTruckGame = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
