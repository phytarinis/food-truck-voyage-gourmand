const test=require('node:test'),assert=require('node:assert/strict'),T=require('../round-transitions.js'),G=require('../game.js');
for(let index=0;index<6;index++)test(`transition ${index+1} : scores, reprise et validation unique`,()=>{
 let game=G.createGame(['Corail','Sauge']),before=JSON.stringify(game.teams);
 assert.ok(T.open(game,index));assert.equal(game[T.rounds[index].key],undefined);
 assert.equal(T.accept(game,(index+1)%6),false);
 game=JSON.parse(JSON.stringify(game));assert.ok(T.accept(game,index));
 assert.equal(T.accept(game,index),false);assert.equal(T.open(game,index),false);
 assert.equal(JSON.stringify(game.teams),before);
});
test('les anciennes parties engagées ou terminées ne repassent pas par la présentation',()=>{
 for(const phase of['question','search','placement','location','correction','bonus','complete'])for(let index=0;index<6;index++){
  const game=G.createGame(['A','B']);game[T.rounds[index].key]={phase};assert.equal(T.open(game,index),false);
 }
});
test('une ancienne introduction est remplacée par la transition et les indices invalides sont refusés',()=>{
 const game=G.createGame(['A','B']);game.world={phase:'intro'};assert.ok(T.open(game,5));
 for(const index of[-1,6,null,'1',1.5])assert.equal(T.open(game,index),false);
});
