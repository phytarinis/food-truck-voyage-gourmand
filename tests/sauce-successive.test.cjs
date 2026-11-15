const{test}=require('node:test'),assert=require('node:assert/strict'),S=require('../sauce.js'),{createGame}=require('../game.js');
for(let puzzle=0;puzzle<3;puzzle++)for(let a=0;a<4;a++)for(let b=0;b<4;b++)test(`manche 2 énigme ${puzzle+1}, réussites ${a}/${b}`,()=>{
 const g=createGame(['Corail','Sauge']);S.start(g);g.sauce.puzzleIndex=puzzle;const targets=[a,b];let steps=0;
 while(g.sauce.phase==='search'){
  const team=S.activeTeam(g),clue=g.sauce.clueIndex,stamp=S.answerToken(g),before=g.teams.map(t=>t.score),other=1-team;
  assert.ok(team>=0);assert.ok(S.respond(g,targets[team]===clue,stamp));assert.equal(S.respond(g,true,stamp),false);
  assert.equal(g.teams[other].score,before[other]);if(g.sauce.phase==='search'&&g.sauce.players[other].status==='searching'&&team===0)assert.equal(g.sauce.clueIndex,clue);
  assert.ok(++steps<=6);
 }
 const expected=targets.map(n=>n<3?S.points[n]:0);assert.equal(g.sauce.phase,'correction');assert.deepEqual(g.teams.map(t=>t.score),expected);assert.deepEqual(g.sauce.results[puzzle].map(p=>p.points),expected);assert.equal(S.respond(g,true,S.answerToken(g)),false);const saved=JSON.parse(JSON.stringify(g));assert.deepEqual(saved.teams.map(t=>t.score),expected);assert.equal(S.respond(saved,true,S.answerToken(saved)),false);
});
test('reprise entre validations : aucune révélation prématurée ni point répété',()=>{const g=createGame(['C','S']);S.start(g);const stamp=S.answerToken(g);S.respond(g,false,stamp);const restored=JSON.parse(JSON.stringify(g));assert.equal(S.activeTeam(restored),1);assert.equal(restored.sauce.clueIndex,0);assert.equal(S.respond(restored,true,stamp),false);S.respond(restored,true,S.answerToken(restored));assert.equal(restored.sauce.clueIndex,1);assert.equal(S.activeTeam(restored),0);assert.deepEqual(restored.teams.map(t=>t.score),[0,20]);S.respond(restored,false,S.answerToken(restored));assert.equal(restored.sauce.clueIndex,2);S.respond(restored,true,S.answerToken(restored));assert.deepEqual(restored.teams.map(t=>t.score),[10,20]);});
