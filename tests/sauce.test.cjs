const { test } = require('node:test');
const assert = require('node:assert/strict');
const S = require('../sauce.js');
const { createGame } = require('../game.js');
function fresh(){const game=createGame(['Corail','Sauge']);S.start(game);S.begin(game);return game;}
function respond(game,team,correct){const stamp=S.token(game,team);assert.equal(S.validate(game,team,correct,stamp),true);assert.equal(S.validate(game,team,correct,stamp),false);}
function solve(game,team,errors){for(let i=0;i<errors;i++)respond(game,team,false);if(errors<3)respond(game,team,true);}
for(let puzzle=0;puzzle<3;puzzle++)for(let a=0;a<4;a++)for(let b=0;b<4;b++){
 test(`énigme ${puzzle+1} : équipe 1 ${[20,15,10,0][a]}, équipe 2 ${[20,15,10,0][b]} points indépendants`,()=>{
  const game=fresh();
  for(let i=0;i<puzzle;i++){solve(game,0,3);solve(game,1,3);assert.equal(S.next(game),true);}
  const other=structuredClone(game.sauce.players[1]);solve(game,0,a);
  assert.deepEqual(game.sauce.players[1],other);assert.equal(game.sauce.phase,'search');
  assert.equal(game.teams[0].score,[20,15,10,0][a]);assert.equal(S.token(game,0),null);
  solve(game,1,b);assert.equal(game.sauce.phase,'correction');
  assert.deepEqual(game.teams.map(t=>t.score),[[20,15,10,0][a],[20,15,10,0][b]]);
  assert.deepEqual(game.teams.map(t=>t.jokers),[2,2]);
 });
}
test('60 points chacun, cumul général conservé, reprise et fin sans double comptage',()=>{
 const game=fresh();game.teams.forEach(t=>{t.score=30});
 const state=game.sauce;assert.equal(S.start(game),state);
 for(let i=0;i<3;i++){assert.equal(S.next(game),false);solve(game,0,0);solve(game,1,0);assert.equal(S.start(game),state);assert.equal(S.next(game),true);}
 assert.equal(game.sauce.phase,'complete');assert.equal(S.next(game),false);assert.deepEqual(S.totals(game),[60,60]);assert.deepEqual(game.teams.map(t=>t.score),[90,90]);
 S.begin(game);S.start(game);assert.equal(game.sauce.phase,'complete');assert.deepEqual(game.teams.map(t=>t.score),[90,90]);
});
test('validations périmées, ancien indice, ancienne énigme et ancien jeu refusés',()=>{
 const game=fresh(),old=S.token(game,0);respond(game,0,false);
 assert.equal(S.validate(game,0,true,old),false);assert.equal(game.sauce.players[0].clueIndex,1);
 solve(game,0,0);solve(game,1,0);S.next(game);
 assert.equal(S.validate(game,0,true,old),false);
 const next=fresh();assert.equal(S.validate(next,0,true,S.token(game,0)),false);
 assert.deepEqual(next.teams.map(t=>t.score),[0,0]);
});
test('intercalage : l’avancée de l’autre équipe ne rend pas ma validation caduque',()=>{
 const game=fresh(),stamp=S.token(game,1);respond(game,0,false);
 assert.equal(S.validate(game,1,true,stamp),true);assert.equal(game.teams[1].score,20);
 assert.equal(game.sauce.players[0].clueIndex,1);assert.equal(game.sauce.phase,'search');
});
test('pas de validation sans confirmation courante, paramètres invalides ignorés',()=>{
 const game=fresh();assert.equal(S.validate(game,0,true),false);assert.equal(S.validate(game,0,'true',S.token(game,0)),false);
 for(const index of [-1,2,'0',null])assert.equal(S.token(game,index),null);
 const untouched=createGame(['A','B']);assert.equal(untouched.sauce,undefined);
 assert.equal(S.token(untouched,0),null);
});
