const {test}=require('node:test');
const assert=require('node:assert/strict');
const F=require('../france.js');
const {createGame}=require('../game.js');
function fresh(){const g=createGame(['Corail','Sauge']);F.start(g);F.begin(g);return g;}
function respond(g,t,correct){const stamp=F.token(g,t);assert.ok(stamp);assert.equal(F.validate(g,t,correct,stamp),true);assert.equal(F.validate(g,t,correct,stamp),false);}
function play(g,outcomes,order=[0,1]){
 for(let level=0;level<3;level++){
  for(const t of order){
   if(g.france.players[t].status!=='searching')continue;
   const other=structuredClone(g.france.players[1-t]);respond(g,t,outcomes[t]===level);
   assert.equal(g.france.clueIndex,level);assert.deepEqual(g.france.players[1-t],other);
   if(other.status==='searching')assert.equal(F.canRevealNextClue(g),false);
  }
  if(g.france.phase==='answer')return;
  const token=F.nextClueToken(g);assert.ok(token);assert.equal(F.revealNextClue(g,token),true);assert.equal(F.revealNextClue(g,token),false);
 }
 assert.fail('les recherches devraient être terminées');
}
function locate(g,codes){assert.ok(F.startLocation(g));for(const code of codes){const stamp=F.locationToken(g);assert.ok(F.chooseRegion(g,code,stamp));assert.ok(F.lockFlag(g,stamp));assert.equal(F.lockFlag(g,stamp),false);}assert.ok(F.revealLocation(g));assert.equal(F.revealLocation(g),false);assert.ok(F.discover(g));}
for(let puzzle=0;puzzle<3;puzzle++)for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(const order of [[0,1],[1,0]]){
 test(`manche3 défi${puzzle+1} recherches ${a}/${b}, ordre ${order}`,()=>{
  const g=fresh();for(let q=0;q<puzzle;q++){play(g,[3,3]);locate(g,['11','11']);F.next(g);}
  play(g,[a,b],order);assert.equal(g.france.phase,'answer');assert.equal(F.canRevealNextClue(g),false);
  assert.deepEqual(g.teams.map(t=>t.score),[[20,15,10,0][a],[20,15,10,0][b]]);assert.deepEqual(g.teams.map(t=>t.jokers),[2,2]);
 });
}
for(const choices of [['44','44'],['44','53'],['53','44'],['53','53'],['04','06']]){
 test(`drapeaux ${choices.join('/')} : déplacement, validation, protection +5`,()=>{
  const g=fresh();play(g,[0,0]);assert.equal(F.chooseRegion(g,'44',null),false);assert.equal(F.revealLocation(g),false);
  assert.ok(F.startLocation(g));const stamp0=F.locationToken(g);assert.equal(F.lockFlag(g,stamp0),false);assert.equal(F.chooseRegion(g,'fake',stamp0),false);
  assert.ok(F.chooseRegion(g,'75',stamp0));assert.ok(F.chooseRegion(g,choices[0],stamp0));assert.ok(F.lockFlag(g,stamp0));
  assert.equal(F.chooseRegion(g,'44',stamp0),false);assert.equal(F.revealLocation(g),false);assert.equal(F.discover(g),false);
  const stamp1=F.locationToken(g);assert.ok(F.chooseRegion(g,choices[1],stamp1));assert.ok(F.lockFlag(g,stamp1));
  assert.equal(F.locationToken(g),null);assert.deepEqual(g.teams.map(t=>t.score),[20,20]);
  assert.ok(F.revealLocation(g));const expected=choices.map(c=>20+(c==='44'?5:0));assert.deepEqual(g.teams.map(t=>t.score),expected);
  assert.equal(F.revealLocation(g),false);assert.equal(F.lockFlag(g,stamp1),false);assert.equal(F.chooseRegion(g,'44',stamp1),false);
  assert.deepEqual(g.france.location.choices,choices);assert.deepEqual(g.teams.map(t=>t.score),expected);assert.ok(F.discover(g));assert.deepEqual(F.totals(g),expected);
 });
}
for(const choice of [0,1,2])test(`parcours, bonus ${choice} sans points ni jokers, reprise et bilan`,()=>{
 const g=fresh();g.teams[0].score=30;g.teams[1].score=50;
 assert.equal(F.finish(g),false);assert.equal(F.next(g),false);
 for(let q=0;q<3;q++){play(g,[0,2]);locate(g,[F.puzzles[q].region,F.puzzles[q].region]);assert.ok(F.next(g));}
 assert.equal(g.france.phase,'bonus');assert.deepEqual(g.teams.map(t=>t.score),[105,95]);const snapshot=structuredClone(g);
 assert.equal(F.revealBonus(g),false);assert.equal(F.finish(g),false);assert.equal(F.chooseBonus(g,3),false);
 assert.ok(F.chooseBonus(g,choice));assert.ok(F.revealBonus(g));assert.equal(F.revealBonus(g),false);assert.equal(F.chooseBonus(g,0),false);assert.ok(F.finish(g));assert.equal(F.finish(g),false);
 F.start(g);assert.equal(g.france.phase,'complete');assert.deepEqual(g.teams,snapshot.teams);assert.deepEqual(F.totals(g),[75,45]);
 assert.equal(g.apero,undefined);assert.equal(g.sauce,undefined);assert.deepEqual(g.teams.map(t=>t.jokers),[2,2]);
});
test('jetons anciens refusés après réinitialisation, indice ou spécialité suivante',()=>{
 const g=fresh(),old=F.token(g,0);respond(g,0,false);respond(g,1,false);F.revealNextClue(g,F.nextClueToken(g));assert.equal(F.validate(g,0,true,old),false);
 respond(g,0,true);respond(g,1,true);const flagBefore=F.locationToken(g);assert.equal(flagBefore,null);locate(g,['44','44']);F.next(g);assert.equal(F.validate(g,0,true,old),false);
 const h=fresh();assert.equal(F.validate(h,0,true,old),false);assert.equal(F.validate(h,2,true,F.token(h,0)),false);assert.equal(F.validate(h,0,'true',F.token(h,0)),false);
});
test('cartographie : 18 régions, codes sources, anneaux complets, génération reproductible',()=>{
 const fs=require('node:fs'),vm=require('node:vm');const source=JSON.parse(fs.readFileSync('assets/maps/regions-france.geojson'));const context={};vm.runInNewContext(fs.readFileSync('france-regions.js','utf8'),context);
 const data=JSON.parse(JSON.stringify(context.FranceRegions));assert.equal(data.length,18);assert.equal(data.filter(r=>r.mainland).length,13);assert.deepEqual(data.map(r=>r.code).sort(),F.regionCodes.slice().sort());
 for(const r of data){const f=source.features.find(f=>f.properties.code===r.code);assert.equal(r.name,f.properties.nom);const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;assert.equal((r.path.match(/Z/g)||[]).length,polygons.flat().length);assert.ok(r.center.every(Number.isFinite));}
 const before=fs.readFileSync('france-regions.js','utf8');require('node:child_process').execFileSync('python3',['tools/generate-france-regions.py']);assert.equal(fs.readFileSync('france-regions.js','utf8'),before);
});
test('les trois manches se cumulent sans altérer les résultats précédents',()=>{
 const A=require('../apero.js'),S=require('../sauce.js');const g=createGame(['Corail','Sauge']);A.start(g);A.begin(g);
 for(const d of A.deliveries){for(const t of [0,1]){A.choose(g,t,'department',d.department);A.choose(g,t,'number',d.number);}A.validate(g);A.next(g);}A.revealBonus(g);A.finish(g);
 S.start(g);S.begin(g);for(let q=0;q<3;q++){for(const t of [0,1])S.validate(g,t,true,S.token(g,t));S.next(g);}S.chooseBonus(g,0);S.revealBonus(g);S.finish(g);
 const previous=structuredClone({apero:g.apero,sauce:g.sauce});assert.deepEqual(g.teams.map(t=>t.score),[90,90]);
 F.start(g);F.begin(g);for(let q=0;q<3;q++){play(g,[0,0]);locate(g,[F.puzzles[q].region,F.puzzles[q].region]);F.next(g);}F.chooseBonus(g,1);F.revealBonus(g);F.finish(g);
 assert.deepEqual(g.teams.map(t=>t.score),[165,165]);assert.deepEqual({apero:g.apero,sauce:g.sauce},previous);assert.deepEqual(F.totals(g),[75,75]);
});
