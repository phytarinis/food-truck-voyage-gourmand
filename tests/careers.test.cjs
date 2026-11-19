const { test } = require('node:test');
const assert = require('node:assert/strict');
const C = require('../careers.js');
const { createGame } = require('../game.js');
test('cinq pauses dans l’ordre et positions des idées reçues validées', () => {
  assert.deepEqual(C.jobs.map(j=>j.afterRound),[1,2,3,4,5]);
  assert.deepEqual(C.jobs.map(j=>j.falseIndex),[1,2,0,1,1]);
  for (const job of C.jobs) { assert.equal(job.statements.length,3); assert.equal(job.facts.length,3); }
});
for (let job=0;job<5;job++) {
  for(let choice=0;choice<3;choice++) {
    test(`${C.jobs[job].name} : choix ${String.fromCharCode(65+choice)}, révélation unique sans gain ni joker`, () => {
      const game=createGame(['Corail','Sauge']); game.teams[0].score=30;game.teams[1].score=15;
      const before=structuredClone(game);
      const pause=C.createPause(job);
      assert.equal(C.reveal(pause),false);assert.equal(pause.revealed,false);
      assert.equal(C.select(pause,choice),true);assert.equal(pause.selected,choice);
      assert.equal(C.reveal(pause),true);assert.equal(pause.revealed,true);
      assert.equal(C.reveal(pause),false);assert.equal(C.select(pause,(choice+1)%3),false);
      assert.equal(pause.selected,choice);assert.deepEqual(game,before);
    });
  }
}
test('choix changeable avant révélation, valeurs invalides refusées', () => {
  const p=C.createPause(0);assert.equal(C.select(p,1),true);assert.equal(C.select(p,2),true);
  for(const value of [-1,3,NaN,'0',null,undefined])assert.equal(C.select(p,value),false);
  assert.equal(p.selected,2);
  for(const index of [-1,5,NaN,'0'])assert.throws(()=>C.createPause(index),RangeError);
});
test('les quinze affirmations et les cinq corrections correspondent aux textes validés',()=>{
 const expected=require('./fixtures/career-pedagogy.json');
 assert.deepEqual(C.jobs.map(({name,statements,falseIndex,explanation})=>({name,statements,falseIndex,explanation})),expected);
 // C organise désormais le travail : l'évolution est discutée en B et expliquée après révélation.
 assert.doesNotMatch(C.jobs[3].statements[2],/évoluer|coordination/);
 assert.match(C.jobs[3].explanation,/l'évolution n'est pas automatique, mais elle existe/);
 assert.doesNotMatch(C.jobs.map(j=>j.quote).join(' '),/Cinq assiettes|Un an de patates|unique destination/);
});
