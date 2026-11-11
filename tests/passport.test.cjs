const {test}=require('node:test');
const assert=require('node:assert/strict');
const F=require('../passport.js');
const {createGame}=require('../game.js');
function fresh(){const g=createGame(['Corail','Sauge']);F.start(g);F.begin(g);return g;}
function respond(g,t,correct){const stamp=F.token(g,t);assert.ok(stamp);assert.equal(F.validate(g,t,correct,stamp),true);assert.equal(F.validate(g,t,correct,stamp),false);}
function play(g,outcomes,order=[0,1]){
 for(let level=0;level<3;level++){
  for(const t of order){
   if(g.passport.players[t].status!=='searching')continue;
   const other=structuredClone(g.passport.players[1-t]);respond(g,t,outcomes[t]===level);
   assert.equal(g.passport.clueIndex,level);assert.deepEqual(g.passport.players[1-t],other);
   if(other.status==='searching')assert.equal(F.canRevealNextClue(g),false);
  }
  if(g.passport.phase==='answer')return;
  const token=F.nextClueToken(g);assert.ok(token);assert.equal(F.revealNextClue(g,token),true);assert.equal(F.revealNextClue(g,token),false);
 }
 assert.fail('les recherches devraient être terminées');
}
function locate(g,codes){assert.ok(F.startLocation(g));for(const code of codes){const stamp=F.locationToken(g);assert.ok(F.chooseRegion(g,code,stamp));assert.ok(F.lockFlag(g,stamp));assert.equal(F.lockFlag(g,stamp),false);}assert.ok(F.revealLocation(g));assert.equal(F.revealLocation(g),false);assert.ok(F.discover(g));}
for(let puzzle=0;puzzle<3;puzzle++)for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(const order of [[0,1],[1,0]]){
 test(`manche5 défi${puzzle+1} recherches ${a}/${b}, ordre ${order}`,()=>{
  const g=fresh();for(let q=0;q<puzzle;q++){play(g,[3,3]);locate(g,['FRA','FRA']);F.next(g);}
  play(g,[a,b],order);assert.equal(g.passport.phase,'answer');assert.equal(F.canRevealNextClue(g),false);
  assert.deepEqual(g.teams.map(t=>t.score),[[20,15,10,0][a],[20,15,10,0][b]]);assert.deepEqual(g.teams.map(t=>t.jokers),[2,2]);
 });
}
for(const choices of [['BEL','BEL'],['BEL','PRT'],['PRT','BEL'],['PRT','PRT'],['ROU','ESP']]){
 test(`drapeaux ${choices.join('/')} : déplacement, validation, protection +5`,()=>{
  const g=fresh();play(g,[0,0]);assert.equal(F.chooseRegion(g,'BEL',null),false);assert.equal(F.revealLocation(g),false);
  assert.ok(F.startLocation(g));const stamp0=F.locationToken(g);assert.equal(F.lockFlag(g,stamp0),false);assert.equal(F.chooseRegion(g,'fake',stamp0),false);
  assert.ok(F.chooseRegion(g,'DEU',stamp0));assert.ok(F.chooseRegion(g,choices[0],stamp0));assert.ok(F.lockFlag(g,stamp0));
  assert.equal(F.chooseRegion(g,'BEL',stamp0),false);assert.equal(F.revealLocation(g),false);assert.equal(F.discover(g),false);
  const stamp1=F.locationToken(g);assert.ok(F.chooseRegion(g,choices[1],stamp1));assert.ok(F.lockFlag(g,stamp1));
  assert.equal(F.locationToken(g),null);assert.deepEqual(g.teams.map(t=>t.score),[20,20]);
  assert.ok(F.revealLocation(g));const expected=choices.map(c=>20+(c==='BEL'?5:0));assert.deepEqual(g.teams.map(t=>t.score),expected);
  assert.equal(F.revealLocation(g),false);assert.equal(F.lockFlag(g,stamp1),false);assert.equal(F.chooseRegion(g,'BEL',stamp1),false);
  assert.deepEqual(g.passport.location.choices,choices);assert.deepEqual(g.teams.map(t=>t.score),expected);assert.ok(F.discover(g));assert.deepEqual(F.totals(g),expected);
 });
}
for(const choice of [0,1,2])test(`parcours, bonus ${choice} sans points ni jokers, reprise et bilan`,()=>{
 const g=fresh();g.teams[0].score=30;g.teams[1].score=50;
 assert.equal(F.finish(g),false);assert.equal(F.next(g),false);
 for(let q=0;q<3;q++){play(g,[0,2]);locate(g,[F.puzzles[q].region,F.puzzles[q].region]);assert.ok(F.next(g));}
 assert.equal(g.passport.phase,'bonus');assert.deepEqual(g.teams.map(t=>t.score),[105,95]);const snapshot=structuredClone(g);
 assert.equal(F.revealBonus(g),false);assert.equal(F.finish(g),false);assert.equal(F.chooseBonus(g,3),false);
 assert.ok(F.chooseBonus(g,choice));assert.ok(F.revealBonus(g));assert.equal(F.revealBonus(g),false);assert.equal(F.chooseBonus(g,0),false);assert.ok(F.finish(g));assert.equal(F.finish(g),false);
 F.start(g);assert.equal(g.passport.phase,'complete');assert.deepEqual(g.teams,snapshot.teams);assert.deepEqual(F.totals(g),[75,45]);
 assert.equal(g.apero,undefined);assert.equal(g.sauce,undefined);assert.deepEqual(g.teams.map(t=>t.jokers),[2,2]);
});
test('jetons anciens refusés après réinitialisation, indice ou spécialité suivante',()=>{
 const g=fresh(),old=F.token(g,0);respond(g,0,false);respond(g,1,false);F.revealNextClue(g,F.nextClueToken(g));assert.equal(F.validate(g,0,true,old),false);
 respond(g,0,true);respond(g,1,true);const flagBefore=F.locationToken(g);assert.equal(flagBefore,null);locate(g,['BEL','BEL']);F.next(g);assert.equal(F.validate(g,0,true,old),false);
 const h=fresh();assert.equal(F.validate(h,0,true,old),false);assert.equal(F.validate(h,2,true,F.token(h,0)),false);assert.equal(F.validate(h,0,'true',F.token(h,0)),false);
});
test('les jetons des manches 3 et 5 ne sont pas interchangeables et leurs états restent indépendants',()=>{
 const France=require('../france.js');const g=fresh();France.start(g);France.begin(g);const previous=structuredClone(g.france);
 assert.equal(F.validate(g,0,true,France.token(g,0)),false);assert.equal(France.validate(g,0,true,F.token(g,0)),false);
 respond(g,0,true);respond(g,1,true);locate(g,['BEL','BEL']);assert.deepEqual(g.france,previous);
});
test('47 pays sourcés, capitales cohérentes, destinations actuelles et bonus A',()=>{
 const fs=require('node:fs'),map=require('../europe-map.js');const source=JSON.parse(fs.readFileSync('assets/maps/europe-countries.geojson'));
 assert.equal(map.countries.length,47);assert.deepEqual(map.countries.map(r=>r.code).sort(),F.regionCodes.slice().sort());
 assert.deepEqual(F.puzzles.map(p=>p.region),['BEL','PRT','ROU']);assert.deepEqual(F.puzzles.map(p=>p.capital),['Bruxelles','Lisbonne','Bucarest']);
 for(const c of map.countries){assert.equal(c.name,source.features.find(f=>f.properties.code===c.code).properties.nom);assert.match(c.path,/^M/);assert.ok(c.center[0]>0&&c.center[0]<900&&c.center[1]>0&&c.center[1]<680);}
 for(const p of F.puzzles){assert.equal(map.capitals[p.region].name,p.capital);assert.ok(fs.existsSync(`assets/maps/passport-${p.region.toLowerCase()}.svg`));}
 assert.equal(F.bonus.correctIndex,0);assert.match(F.bonus.explanation,/siège officiel/);assert.match(F.puzzles[2].fact,/personnage fictif/);
});
