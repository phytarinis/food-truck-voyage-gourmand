const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createGame, startChallenge, answer } = require('../game.js');
const A = require('../apero.js');
function fresh() { const g = createGame(['Corail', 'Sauge']); A.start(g); A.begin(g); return g; }
function fill(g, team, departmentCorrect, numberCorrect) {
  const d = A.deliveries[g.apero.index];
  A.choose(g, team, 'department', departmentCorrect ? d.department : d.departments.find(v => v !== d.department));
  A.choose(g, team, 'number', numberCorrect ? d.number : d.numbers.find(v => v !== d.number));
}
for (let index = 0; index < 3; index++) {
  for (const [dep, num, points] of [[true,true,10],[true,false,5],[false,true,5],[false,false,0]]) {
    test(`livraison ${index+1} : département ${dep}, numéro ${num}, +${points} par équipe`, () => {
      const g = fresh();
      for (let i=0;i<index;i++) { fill(g,0,false,false); fill(g,1,false,false); A.validate(g); A.next(g); }
      fill(g,0,dep,num); fill(g,1,dep,num);
      assert.equal(A.validate(g),true);
      assert.deepEqual(g.teams.map(t=>t.score),[points,points]);
      assert.equal(A.validate(g),false); assert.equal(A.validate(g),false);
      assert.deepEqual(g.teams.map(t=>t.score),[points,points]);
    });
  }
}
test('pas de correction partielle ; choix modifiables avant validation uniquement', () => {
  const g=fresh(); fill(g,0,true,true);
  assert.equal(A.validate(g),false); assert.equal(g.apero.phase,'question');
  assert.deepEqual(g.teams.map(t=>t.score),[0,0]);
  A.choose(g,1,'department','Gironde');assert.equal(A.ready(g),false);
  A.choose(g,1,'number','24');assert.equal(A.ready(g),true);
  A.choose(g,1,'department','Dordogne');A.validate(g);
  assert.equal(A.choose(g,1,'number','16'),false);
  assert.deepEqual(g.teams.map(t=>t.score),[10,10]);
});
test('30 points maximum, bonus sans points, reprise sans réinitialisation', () => {
  const g=fresh();
  for (let i=0;i<3;i++) {
    fill(g,0,true,true);fill(g,1,true,true);A.validate(g);
    const state=g.apero;A.start(g);assert.equal(g.apero,state);
    A.next(g);assert.equal(A.next(g),false);
  }
  assert.equal(g.apero.phase,'bonus');assert.equal(A.finish(g),false);
  A.revealBonus(g);A.revealBonus(g);assert.equal(A.finish(g),true);assert.equal(A.finish(g),false);
  assert.deepEqual(A.totals(g),[30,30]);assert.deepEqual(g.teams.map(t=>t.score),[30,30]);
  assert.equal(A.start(g).phase,'complete');assert.deepEqual(g.teams.map(t=>t.jokers),[2,2]);
});
test('scores indépendants et cumul avec la démo, sans changer son alternance', () => {
  const g=fresh();startChallenge(g);answer(g,true);
  fill(g,0,true,false);fill(g,1,false,true);A.validate(g);
  assert.deepEqual(g.teams.map(t=>t.score),[25,5]);assert.deepEqual(A.totals(g),[5,5]);
  startChallenge(g);assert.equal(g.challenge.active,1);
});
test('choix invalides ignorés ; nouveau jeu sans progression', () => {
  const g=fresh();assert.equal(A.choose(g,2,'number','24'),false);assert.equal(A.choose(g,0,'number','99'),false);assert.equal(A.choose(g,0,'other','24'),false);
  assert.equal(A.ready(g),false);assert.equal(createGame(['A','B']).apero,undefined);
});
