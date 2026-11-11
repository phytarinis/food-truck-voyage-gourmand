const{test}=require('node:test'),assert=require('node:assert/strict');
const W=require('../world.js'),map=require('../world-map.js'),Flags=require('../flag-choices.js'),{createGame}=require('../game.js');
function fresh(index=0){const g=createGame(['Corail','Sauge']);W.start(g);W.begin(g);g.world.index=index;return g;}
function choose(g,choice){assert.ok(W.choose(g,choice,W.token(g)));}
function lock(g){const token=W.token(g);assert.ok(W.lock(g,token));assert.equal(W.lock(g,token),false);}
function play(g,choices,order=[0,1]){
 // L’ordre des drapeaux reste obligatoirement corail, puis sauge.
 for(const choice of choices){choose(g,choice);lock(g)}
 const before=g.teams.map(t=>t.score);assert.ok(W.reveal(g));assert.equal(W.reveal(g),false);return before;
}
for(let index=0;index<5;index++)for(const a of map.continents)for(const b of map.continents){
 test(`défi ${index+1} : ${a.code} / ${b.code}, 10 ou 0 et révélation explicite`,()=>{
  const g=fresh(index),correct=W.challenges[index].continent;
  assert.equal(W.reveal(g),false);assert.equal(W.lock(g,W.token(g)),false);
  choose(g,a.code);const stamp=W.token(g);lock(g);assert.deepEqual(g.teams.map(t=>t.score),[0,0]);assert.deepEqual(Flags.visibleTeams(g.world.location),[1]);assert.equal(W.choose(g,b.code,stamp),false);assert.equal(W.reveal(g),false);
  choose(g,b.code);lock(g);assert.deepEqual(Flags.visibleTeams(g.world.location),[0,1]);assert.deepEqual(g.teams.map(t=>t.score),[0,0]);assert.ok(W.reveal(g));assert.equal(W.reveal(g),false);
  assert.deepEqual(g.teams.map(t=>t.score),[a.code===correct?10:0,b.code===correct?10:0]);assert.deepEqual(g.teams.map(t=>t.jokers),[2,2]);assert.deepEqual(g.world.results[index].choices,[a.code,b.code]);
 });
}
test('choix modifiables avant verrouillage, jamais après ; actions périmées refusées',()=>{
 const g=fresh();choose(g,'Africa');choose(g,'Asia');assert.equal(g.world.location.choices[0],'Asia');const stamp=W.token(g);lock(g);assert.equal(W.choose(g,'Europe',stamp),false);choose(g,'Asia');lock(g);assert.equal(W.token(g),null);assert.equal(W.choose(g,'Europe',stamp),false);assert.ok(W.reveal(g));assert.ok(W.next(g));assert.equal(g.world.index,1);assert.equal(W.choose(g,'Asia',stamp),false);
 const h=fresh();assert.equal(W.choose(h,'Asia',stamp),false);assert.equal(W.choose(h,'fake',W.token(h)),false);assert.equal(W.choose(h,[0,0],W.token(h)),false);
});
const accepted=[[-150,32],[-170,32],[-120,32],[-145,20],[-145,45]];
const rejected=[[-170.01,32],[-119.99,32],[-145,19.99],[-145,45.01],[-30,0],[75,-15],[0,85],[60,-55]];
for(const point of accepted)test(`zone pédagogique accepte ${point}`,()=>{assert.equal(W.inPollutionZone(point),true);const g=fresh(5);play(g,[point,point]);assert.deepEqual(g.teams.map(t=>t.score),[10,10]);});
for(const point of rejected)test(`placement libre possible, mais hors tolérance ${point}`,()=>{assert.equal(W.isOcean(point),true);assert.equal(W.inPollutionZone(point),false);const g=fresh(5);play(g,[point,[-150,32]]);assert.deepEqual(g.teams.map(t=>t.score),[0,10]);});
test('liberté de placement dans les océans, terres et coordonnées invalides refusées',()=>{
 const g=fresh(5);for(const p of [[-30,0],[75,-15],[-140,-35],[0,85],[60,-55],[-150,32]])choose(g,p);
 const previous=g.world.location.choices[0].slice();for(const p of [[138,36],[135,-25],[-102,23],[-6,32],[0,-78],[0],[Infinity,0],[0,NaN],[181,0],[0,91],null,'Asia'])assert.equal(W.choose(g,p,W.token(g)),false);
 assert.deepEqual(g.world.location.choices[0],previous);const input=[-145,32];choose(g,input);input[0]=50;assert.deepEqual(g.world.location.choices[0],[-145,32]);
});
for(const outcomes of [[true,true],[true,false],[false,true],[false,false]])test(`six défis, cumul et bilan : réussites ${outcomes}`,()=>{
 const g=fresh();g.teams[0].score=285;g.teams[1].score=100;g.passport={phase:'complete',sentinel:'préserver'};const prior=structuredClone(g.passport);
 assert.equal(W.finish(g),false);assert.equal(W.next(g),false);
 for(let i=0;i<6;i++){
  assert.equal(g.world.index,i);const good=i===5?[-150,32]:W.challenges[i].continent,bad=i===5?[-30,0]:'Europe';play(g,outcomes.map(v=>v?good:bad));
  if(i<5){assert.equal(W.finish(g),false);assert.ok(W.next(g));}else assert.equal(W.next(g),false);
 }
 assert.ok(W.finish(g));assert.equal(W.finish(g),false);assert.deepEqual(W.totals(g),outcomes.map(v=>v?60:0));assert.deepEqual(g.teams.map(t=>t.score),[285+(outcomes[0]?60:0),100+(outcomes[1]?60:0)]);assert.deepEqual(g.passport,prior);assert.deepEqual(g.teams.map(t=>t.jokers),[2,2]);W.start(g);assert.equal(g.world.phase,'complete');
});
test('sept continents cohérents, régions transcontinentales et projection entière',()=>{
 assert.equal(map.continents.length,7);assert.deepEqual(W.challenges.slice(0,5).map(c=>c.continent),['Asia','Oceania','North America','Africa','Antarctica']);
 for(const[point,code]of[[[138,36],'Asia'],[[135,-25],'Oceania'],[[-102,23],'North America'],[[-6,32],'Africa'],[[0,-78],'Antarctica'],[[0,-90],'Antarctica'],[[100,55],'Asia'],[[30,50],'Europe'],[[-52,4],'South America'],[[-2,53],'Europe'],[[-84.084,9.928],'North America']])assert.equal(W.continentAt(point),code,`${point}`);
 for(const c of map.continents)assert.equal(W.continentAt(W.unproject(c.center)),c.code);
 assert.deepEqual(W.project([-180,90]),[0,0]);assert.deepEqual(W.project([180,-90]),[1000,500]);assert.deepEqual(W.pollutionTolerance,{west:-170,east:-120,south:20,north:45});
});
test('six photographies réelles, originaux conservés, sources et dérivés attribués',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),context={window:{}};vm.runInNewContext(fs.readFileSync('world-photos.js','utf8'),context);const photos=context.window.WorldPhotos;
 assert.deepEqual(Object.keys(photos),W.challenges.map(c=>c.id));
 for(const photo of Object.values(photos)){assert.ok(fs.existsSync(photo.src));assert.ok(fs.existsSync(photo.original));assert.match(photo.source,/^https:\/\/commons.wikimedia.org\/wiki\/File:/);assert.ok(photo.author);assert.ok(photo.licenseUrl);}
 assert.equal(photos.mexico.original,'assets/Tacos_mexicanos (1).jpg');assert.match(photos.antarctica.changes,/CC BY-SA 4.0/);assert.match(photos.pollution.history,/CC BY 2.0/);assert.match(W.challenges[5].photoNote,/pas directement/);
 assert.ok(fs.statSync(photos.antarctica.src).size<fs.statSync(photos.antarctica.original).size/5);assert.ok(fs.statSync(photos.pollution.src).size<fs.statSync(photos.pollution.original).size/5);
});
test('le bilan ne peut pas déclarer terminée une manche dont cinq résultats manquent',()=>{
 const g=fresh(5);play(g,[[-150,32],[-150,32]]);assert.equal(W.finish(g),false);
});
