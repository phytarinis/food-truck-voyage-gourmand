const test=require('node:test'),assert=require('node:assert/strict'),P=require('../passport.js'),G=require('../game.js');
const game=()=>{const g=G.createGame(['Corail','Sauge']);P.start(g);P.begin(g);return g;};
const answer=(g,t,c)=>P.validate(g,t,c,P.token(g,t));
test('annulation persistée : score, indices et jetons restent cohérents',()=>{
 let g=game();const stale=P.token(g,0);answer(g,0,false);answer(g,1,true);P.revealNextClue(g,P.nextClueToken(g));
 g=JSON.parse(JSON.stringify(g));assert.ok(P.undoValidation(g));assert.deepEqual(g.teams.map(t=>t.score),[0,0]);assert.equal(g.passport.clueIndex,0);
 assert.equal(g.passport.players[0].status,'waiting');assert.equal(P.validate(g,0,true,stale),false);
 assert.equal(P.undoValidation(g),false);answer(g,1,false);P.revealNextClue(g,P.nextClueToken(g));
 answer(g,0,true);answer(g,1,true);P.startLocation(g);assert.ok(P.undoValidation(g));assert.equal(g.passport.phase,'search');assert.deepEqual(g.teams.map(t=>t.score),[15,0]);
});
test('placer un drapeau ferme l’annulation ; aucun effet sur les jokers',()=>{
 const g=game();answer(g,0,true);answer(g,1,true);P.startLocation(g);P.chooseRegion(g,'BEL',P.locationToken(g));
 assert.equal(P.undoValidation(g),false);assert.deepEqual(g.teams.map(t=>t.jokers),[2,2]);
});
test('annulation refusée pendant un piment',()=>{
 const g=game();answer(g,0,true);g.spicy={active:{}};assert.equal(P.undoValidation(g),false);assert.equal(answer(g,1,true),false);
});
