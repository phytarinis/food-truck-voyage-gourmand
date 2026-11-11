const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createGame, startChallenge, answer } = require('../game.js');
function fresh() { const game = createGame(['Corail', 'Sauge']); startChallenge(game); return game; }
test('scores et jokers initiaux ; alternance au défi suivant', () => {
  const g = fresh();
  assert.deepEqual(g.teams.map(t => [t.score, t.jokers]), [[0, 2], [0, 2]]);
  assert.equal(g.challenge.active, 0);
  answer(g, true); startChallenge(g);
  assert.equal(g.challenge.active, 1);
  assert.equal(g.teams[0].score, 20);
});
test('chaque équipe tente une fois avant de passer à l’indice suivant', () => {
  const g = fresh();
  for (let clue = 0; clue < 3; clue++) {
    assert.equal(g.challenge.clueIndex, clue);
    assert.equal(g.challenge.active, 0);
    answer(g, false);
    assert.equal(g.challenge.clueIndex, clue);
    assert.equal(g.challenge.active, 1);
    assert.deepEqual(g.challenge.attempts, [true, false]);
    answer(g, false);
  }
  assert.equal(g.challenge.done, true);
  assert.equal(g.challenge.winner, null);
  assert.deepEqual(g.teams.map(t => t.score), [0, 0]);
});
for (let clue = 0; clue < 3; clue++) {
  for (let winner = 0; winner < 2; winner++) {
    test(`${[20,15,10][clue]} points à l’équipe ${winner + 1}, attribution unique`, () => {
      const g = fresh();
      for (let i = 0; i < clue * 2 + winner; i++) answer(g, false);
      answer(g, true);
      assert.equal(g.challenge.done, true);
      assert.equal(g.challenge.winner, winner);
      assert.equal(g.teams[winner].score, [20,15,10][clue]);
      assert.equal(g.teams[1 - winner].score, 0);
      answer(g, true); answer(g, false);
      assert.equal(g.teams[winner].score, [20,15,10][clue]);
    });
  }
}
test('équipe 2 commence : son échec donne la main à l’équipe 1', () => {
  const g = fresh(); answer(g, false); answer(g, true); startChallenge(g);
  answer(g, false); assert.equal(g.challenge.active, 0);
  answer(g, false); assert.equal(g.challenge.active, 1);
  assert.equal(g.challenge.clueIndex, 1);
});
