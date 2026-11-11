const { test } = require('node:test');
const assert = require('node:assert/strict');
const S = require('../sauce.js');
const { createGame } = require('../game.js');
function fresh(){const g=createGame(['Corail','Sauge']);S.start(g);S.begin(g);return g;}
function respond(g,team,correct){const stamp=S.token(g,team);assert.ok(stamp);assert.equal(S.validate(g,team,correct,stamp),true);assert.equal(S.validate(g,team,correct,stamp),false);}
function advance(g){const before=g.sauce.clueIndex,stamp=S.nextClueToken(g);assert.ok(stamp);assert.equal(S.revealNextClue(g,stamp),true);assert.equal(g.sauce.clueIndex,before+1);assert.equal(S.revealNextClue(g,stamp),false);}
// outcome = nombre d’erreurs avant réussite, ou 3 pour trois erreurs.
function play(g,outcomes,order=[0,1]){
 for(let level=0;level<3;level++){
  assert.equal(g.sauce.clueIndex,level);
  for(const team of order){
   if(g.sauce.players[team].status!=='searching')continue;
   const other=structuredClone(g.sauce.players[1-team]);
   respond(g,team,outcomes[team]===level);
   assert.equal(g.sauce.clueIndex,level);assert.deepEqual(g.sauce.players[1-team],other);
   if(other.status==='searching')assert.equal(S.canRevealNextClue(g),false);
  }
  if(g.sauce.phase==='correction')return;
  assert.ok(level<2);assert.equal(S.canRevealNextClue(g),true);advance(g);
 }
 assert.fail('Les deux recherches doivent être terminées au troisième indice.');
}
for(let puzzle=0;puzzle<3;puzzle++)for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(const order of [[0,1],[1,0]]){
 test(`énigme ${puzzle+1}, ordre ${order.join('-')} : ${[20,15,10,0][a]} / ${[20,15,10,0][b]}, indices synchronisés`,()=>{
  const g=fresh();for(let i=0;i<puzzle;i++){play(g,[3,3],order);assert.equal(S.next(g),true);}
  play(g,[a,b],order);assert.equal(g.sauce.phase,'correction');
  assert.equal(S.canRevealNextClue(g),false);assert.equal(S.nextClueToken(g),null);
  assert.deepEqual(g.teams.map(t=>t.score),[[20,15,10,0][a],[20,15,10,0][b]]);
  assert.deepEqual(g.teams.map(t=>t.jokers),[2,2]);
 });
}
test('exemple : corail se trompe, sauge trouve à 20, corail continue seule à 15',()=>{
 const g=fresh(),saugeStamp=S.token(g,1);respond(g,0,false);
 assert.equal(g.sauce.clueIndex,0);assert.equal(g.sauce.players[0].status,'waiting');
 assert.equal(S.canRevealNextClue(g),false);assert.equal(S.revealNextClue(g,null),false);
 assert.equal(S.validate(g,1,true,saugeStamp),true);assert.equal(g.teams[1].score,20);
 assert.equal(g.sauce.clueIndex,0);assert.equal(S.canRevealNextClue(g),true);
 advance(g);assert.equal(g.sauce.clueIndex,1);assert.equal(g.sauce.players[1].clueIndex,0);
 assert.equal(S.token(g,1),null);respond(g,0,true);
 assert.equal(g.sauce.phase,'correction');assert.deepEqual(g.teams.map(t=>t.score),[15,20]);
});
test('deux erreurs attendent le clic explicite et bloquent une nouvelle tentative au même indice',()=>{
 const g=fresh();respond(g,0,false);respond(g,1,false);
 assert.equal(g.sauce.clueIndex,0);assert.equal(S.token(g,0),null);assert.equal(S.token(g,1),null);
 assert.equal(S.revealNextClue(g),false);const state=g.sauce;assert.equal(S.start(g),state);
 advance(g);assert.deepEqual(g.sauce.players.map(p=>[p.status,p.clueIndex]),[['searching',1],['searching',1]]);
});
test('60 points chacun, bonus sans points et reprise sans double comptage',()=>{
 const g=fresh();g.teams.forEach(t=>{t.score=30});const state=g.sauce;
 for(let i=0;i<3;i++){assert.equal(S.next(g),false);play(g,[0,0]);assert.equal(S.start(g),state);assert.equal(S.next(g),true);}
 assert.equal(g.sauce.phase,'bonus');assert.equal(S.finish(g),false);S.chooseBonus(g,0);S.revealBonus(g);assert.equal(S.finish(g),true);
 assert.equal(S.next(g),false);assert.deepEqual(S.totals(g),[60,60]);assert.deepEqual(g.teams.map(t=>t.score),[90,90]);
 S.begin(g);S.start(g);assert.equal(g.sauce.phase,'complete');assert.deepEqual(g.teams.map(t=>t.score),[90,90]);
});
test('validations et révélations périmées refusées après changement d’indice, d’énigme ou de jeu',()=>{
 const g=fresh(),old=S.token(g,0);respond(g,0,false);respond(g,1,true);
 const gate=S.nextClueToken(g);advance(g);
 assert.equal(S.validate(g,0,true,old),false);respond(g,0,false);
 assert.equal(S.revealNextClue(g,gate),false);advance(g);respond(g,0,true);S.next(g);
 assert.equal(S.validate(g,0,true,old),false);assert.equal(S.revealNextClue(g,gate),false);
 const next=fresh();assert.equal(S.validate(next,0,true,S.token(g,0)),false);assert.deepEqual(next.teams.map(t=>t.score),[0,0]);
});
test('paramètres invalides et révélation avant réponse des deux équipes refusés',()=>{
 const g=fresh();assert.equal(S.validate(g,0,true),false);assert.equal(S.validate(g,0,'true',S.token(g,0)),false);
 for(const team of [-1,2,'0',null])assert.equal(S.token(g,team),null);
 assert.equal(S.canRevealNextClue(g),false);assert.equal(S.revealNextClue(g,'anything'),false);
 const untouched=createGame(['A','B']);assert.equal(S.token(untouched,0),null);assert.equal(S.canRevealNextClue(untouched),false);
});
for(let choice=0;choice<3;choice++)test(`bonus ${String.fromCharCode(65+choice)} inchangé : aucun point ni joker`,()=>{
 const g=fresh();for(let i=0;i<3;i++){play(g,[0,2]);S.next(g);}
 assert.equal(g.sauce.phase,'bonus');assert.equal(S.bonus.correctIndex,0);
 const before=structuredClone(g.teams);assert.equal(S.revealBonus(g),false);assert.equal(S.finish(g),false);
 assert.equal(S.chooseBonus(g,choice),true);assert.equal(S.revealBonus(g),true);
 assert.equal(S.revealBonus(g),false);assert.equal(S.chooseBonus(g,(choice+1)%3),false);
 assert.deepEqual(g.teams,before);assert.equal(S.start(g).bonus.selected,choice);
 assert.equal(S.finish(g),true);assert.equal(S.finish(g),false);assert.deepEqual(g.teams,before);
});
test('bonus inaccessible avant les trois corrections ; choix invalides refusés',()=>{
 const g=fresh();assert.equal(S.chooseBonus(g,0),false);assert.equal(S.revealBonus(g),false);assert.equal(S.finish(g),false);
 for(let i=0;i<3;i++){play(g,[3,3]);S.next(g);}
 for(const v of [-1,3,'0',null,undefined,NaN])assert.equal(S.chooseBonus(g,v),false);
 assert.equal(g.sauce.bonus.selected,null);assert.equal(S.finish(g),false);assert.deepEqual(g.teams.map(t=>[t.score,t.jokers]),[[0,2],[0,2]]);
});
