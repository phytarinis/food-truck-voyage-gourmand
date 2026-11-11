const {test}=require('node:test');const assert=require('node:assert/strict');
const G=require('../gps.js'),Geo=require('../gps-geography.js'),{createGame}=require('../game.js');
const fresh=()=>{const g=createGame(['Corail','Sauge']);G.start(g);G.begin(g);return g};
const place=(g,p)=>assert.ok(G.placePoint(g,p,G.token(g)));
const lock=g=>{const stamp=G.token(g);assert.ok(G.lock(g,stamp,1000));assert.equal(G.lock(g,stamp,1000),false)};
const correct=['c','a','b'];
const rivers=(g,p)=>p.forEach((slot,label)=>assert.ok(G.placeRiver(g,label,slot,G.token(g))));
function first(g,answers=[[.5,42.7],[2.35,48.85]]){for(const p of answers){place(g,p);lock(g)}assert.ok(G.reveal(g));assert.equal(G.reveal(g),false)}
function permutations(a){return a.length?a.flatMap((v,i)=>permutations(a.filter((_,j)=>i!==j)).map(p=>[v,...p])):[[]]}
for(const a of [true,false])for(const b of [true,false])test(`Pyrénées ${a}/${b} : deux validations, correction explicite, 15 points uniques`,()=>{
 const g=fresh();assert.equal(G.reveal(g),false);assert.equal(G.lock(g,G.token(g),0),false);
 place(g,a?[.5,42.7]:[2.35,48.85]);const old=G.token(g);lock(g);assert.deepEqual(g.teams.map(t=>t.score),[0,0]);assert.equal(g.gps.team,1);assert.equal(G.placePoint(g,[.5,42.7],old),false);assert.equal(G.reveal(g),false);
 place(g,b?[2,42.7]:[-.5,46]);lock(g);assert.equal(g.gps.phase,'compare');assert.deepEqual(g.teams.map(t=>t.score),[0,0]);assert.ok(G.reveal(g));assert.deepEqual(g.teams.map(t=>t.score),[a?15:0,b?15:0]);assert.equal(G.reveal(g),false);assert.deepEqual(g.teams.map(t=>t.jokers),[2,2]);
});
for(const a of permutations(['a','b','c']))for(const b of permutations(['a','b','c']))test(`fleuves ${a}/${b} : 5 par association, pas de doublon`,()=>{
 const g=fresh();first(g,[[2,48],[2,48]]);G.next(g);
 for(const p of [a,b]){rivers(g,p);assert.ok(G.ready(g));lock(g)}assert.equal(g.gps.phase,'compare');assert.deepEqual(g.teams.map(t=>t.score),[0,0]);assert.ok(G.reveal(g));
 const expected=[a,b].map(p=>p.reduce((sum,slot,i)=>sum+(slot===correct[i]?5:0),0));assert.deepEqual(g.teams.map(t=>t.score),expected);assert.equal(G.reveal(g),false);
});
test('les étiquettes sont déplaçables, exclusives ; un échange conserve la bijection',()=>{
 const g=fresh();first(g);G.next(g);const stamp=G.token(g);assert.equal(G.ready(g),false);
 G.placeRiver(g,0,'a',stamp);G.placeRiver(g,1,'a',stamp);assert.deepEqual(g.gps.placements[0],[null,'a',null]);assert.equal(G.ready(g),false);
 rivers(g,correct);G.placeRiver(g,0,'a',stamp);assert.deepEqual(g.gps.placements[0],['a','c','b']);assert.equal(new Set(g.gps.placements[0]).size,3);
 assert.equal(G.placeRiver(g,3,'a',stamp),false);assert.equal(G.placeRiver(g,0,'z',stamp),false);assert.equal(G.placePoint(g,[1,42],stamp),false);
});
for(const duration of [45,30])test(`chrono ${duration}s par équipe, expiration sans blocage et sans points`,()=>{
 const g=fresh();first(g,[[2,48],[2,48]]);G.next(g);
 if(duration===30){rivers(g,correct);lock(g);rivers(g,correct);lock(g);G.reveal(g);G.next(g)}
 assert.equal(G.remaining(g,0),duration*1000);const stamp=G.token(g);assert.ok(G.startTimer(g,stamp,100));assert.equal(G.startTimer(g,stamp,200),false);assert.equal(G.remaining(g,10100),duration*1000-10000);assert.equal(G.remaining(g,100000),0);
 if(duration===45)rivers(g,correct);else place(g,[6.5,45.5]);const before=g.teams.map(t=>t.score);assert.ok(G.lock(g,stamp,100000));assert.equal(G.remaining(g,100000),duration*1000);assert.equal(G.remaining(g,200000),0);
 if(duration===45)rivers(g,correct);else place(g,[6.5,45.5]);assert.ok(G.lock(g,G.token(g),200000));assert.deepEqual(g.teams.map(t=>t.score),before);assert.ok(G.reveal(g));assert.deepEqual(g.teams.map(t=>t.score),before.map(score=>score+15));
});
for(const a of [true,false])for(const b of [true,false])test(`Alpes françaises ${a}/${b} : 15 points et positions inchangées`,()=>{
 const g=fresh();first(g,[[2,48],[2,48]]);G.next(g);for(const _ of [0,1]){rivers(g,['a','b','c']);lock(g)}G.reveal(g);G.next(g);const before=g.teams.map(t=>t.score);
 for(const answer of [a,b]){place(g,answer?[6.5,45.5]:[2.35,48.85]);lock(g)}const saved=structuredClone(g.gps.placements);assert.ok(G.reveal(g));assert.deepEqual(g.gps.placements,saved);assert.deepEqual(g.teams.map((t,i)=>t.score-before[i]),[a?15:0,b?15:0]);
});
for(const choice of [0,1,2])test(`parcours, cumul, bonus ${choice}, bilan de 45 et reprise sans modification des manches précédentes`,()=>{
 const g=fresh();g.teams[0].score=165;g.teams[1].score=70;g.france={phase:'complete',sentinel:'préserver'};const previous=structuredClone(g.france);
 first(g,[[.5,42.7],[.5,42.7]]);G.next(g);for(const _ of [0,1]){rivers(g,correct);lock(g)}G.reveal(g);G.next(g);for(const _ of [0,1]){place(g,[6.5,45.5]);lock(g)}G.reveal(g);G.next(g);
 const before=structuredClone(g.teams);assert.deepEqual(before.map(t=>t.score),[210,115]);assert.equal(G.finish(g),false);assert.equal(G.revealBonus(g),false);assert.equal(G.chooseBonus(g,3),false);
 assert.ok(G.chooseBonus(g,choice));assert.ok(G.revealBonus(g));assert.equal(G.chooseBonus(g,0),false);assert.equal(G.revealBonus(g),false);assert.ok(G.finish(g));assert.equal(G.finish(g),false);G.start(g);assert.equal(g.gps.phase,'complete');assert.deepEqual(G.totals(g),[45,45]);assert.deepEqual(g.teams,before);assert.deepEqual(g.france,previous);
});
test('zones sourcées : repères corrects, confusions rejetées et marge explicite',()=>{
 for(const p of [[.5,42.7],[-1.2,43],[2,42.7]])assert.ok(G.inZone(p,'pyrenees'));
 for(const p of [[6.865,45.833],[5.72,45.18],[6.5,45.5]])assert.ok(G.inZone(p,'alps'));
 for(const p of [[2.35,48.85],[7.75,48.58],[-.58,44.84],[6.15,46.2]]){assert.equal(G.inZone(p,'pyrenees'),false);assert.equal(G.inZone(p,'alps'),false)}
 assert.equal(Geo.zones.pyrenees.toleranceKm,25);assert.equal(Geo.zones.alps.toleranceKm,25);
});
test('positions valides, aller-retour projection, actions périmées et nouvel objet de partie',()=>{
 const g=fresh();const token=G.token(g);for(const p of [[NaN,43],[Infinity,42],[0],[999,999],null])assert.equal(G.placePoint(g,p,token),false);
 const p=[6.5,45.5],back=G.unproject(G.project(p));assert.ok(Math.hypot(back[0]-p[0],back[1]-p[1])<1e-10);
 const h=fresh();assert.equal(G.placePoint(h,p,token),false);assert.equal(G.startTimer(g,token,0),false);assert.equal(G.next(g),false);
});
test('le Rhin comprend bien le segment frontalier amont, de Bâle vers Strasbourg et Lauterbourg',()=>{
 const fs=require('node:fs');const source=JSON.parse(fs.readFileSync('assets/maps/gps-source.geojson'));
 assert.ok(source.features.some(f=>f.properties.name==='Rhin'));assert.ok(source.features.some(f=>f.properties.name==='Rhine'));
 const path=Geo.rivers.find(r=>r.name==='Rhin').path;const coords=[...path.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map(m=>G.unproject([+m[1],+m[2]]));
 assert.ok(Math.min(...coords.map(p=>p[1]))<47.65);assert.ok(Math.max(...coords.map(p=>p[1]))>48.95);
 for(const point of [[7.59,47.60],[7.80,48.58]])assert.ok(coords.some(p=>Math.hypot(p[0]-point[0],p[1]-point[1])<.15));
});
