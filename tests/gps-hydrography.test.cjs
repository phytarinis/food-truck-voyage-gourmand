const {test}=require('node:test'),assert=require('node:assert/strict'),G=require('../gps.js'),H=require('../gps-hydrography.js'),{createGame}=require('../game.js');
const fresh=()=>{const g=createGame(['Corail','Sauge']);G.start(g);g.gps.index=1;g.gps.phase='placement';g.gps.placements=[[null,null,null],[null,null,null]];return g};
const coord=id=>{const r=H.rivers.find(r=>r.id===id);return G.unproject(r.anchor)};
const drop=(g,i,id)=>assert.ok(G.placeRiverAt(g,i,coord(id),G.token(g)));
for(const r of H.rivers)test(`tracé ${r.name} détectable à plusieurs endroits et tolérance sans repère`,()=>{
 let count=0;for(const line of r.lines)for(let i=0;i<line.length;i+=Math.max(1,Math.floor(line.length/12)))if(G.riverAt(line[i])===r.id)count++;
 assert(count>=4,`${r.name}: ${count} points détectés`);assert.equal(G.riverAt(coord(r.id)),r.id);
 const p=G.project(coord(r.id));assert.equal(G.riverAt(G.unproject([p[0]+3,p[1]+3])),r.id);
});
for(let label=0;label<3;label++)for(const r of H.rivers)test(`étiquette ${label} déposée sur ${r.name} : barème 5/0`,()=>{
 const g=fresh();for(let t=0;t<2;t++){for(let i=0;i<3;i++)drop(g,i,i===label?r.id:['c','a','b'][i]);assert.ok(G.lock(g,G.token(g),0))}
 assert.ok(G.reveal(g));const expected=10+(r.id===['c','a','b'][label]?5:0);assert.deepEqual(g.teams.map(t=>t.score),[expected,expected]);assert.equal(G.reveal(g),false);
});
test('bras aval et estuaire distincts : Gironde ne vaut pas une Garonne',()=>{
 assert.equal(G.riverAt([-.55,44.92]),'c');assert.equal(G.riverAt([-.54,45.023]),'d');assert.equal(G.riverAt([-.72,45.25]),'gironde');
 const g=fresh();for(let t=0;t<2;t++){assert.ok(G.placeRiverAt(g,0,[-.72,45.25],G.token(g)));drop(g,1,'a');drop(g,2,'b');G.lock(g,G.token(g),0)}G.reveal(g);assert.deepEqual(g.teams.map(t=>t.score),[10,10]);
});
test('placements libres sauvegardés, hors eau non validable, isolement des équipes et score unique',()=>{
 let g=fresh();g.teams[0].score=100;g.teams[1].score=60;
 assert.ok(G.placeRiverAt(g,0,[-5,47],G.token(g)));assert.equal(g.gps.placements[0][0].river,null);assert.equal(G.ready(g),false);
 for(const [i,id]of ['c','a','b'].entries())drop(g,i,id);
 const saved=JSON.stringify(g.gps.placements[0]),old=G.token(g);assert.ok(G.lock(g,old,1));assert.equal(G.placeRiverAt(g,0,coord('e'),old),false);
 g=JSON.parse(JSON.stringify(g));assert.equal(JSON.stringify(g.gps.placements[0]),saved);assert.equal(g.gps.team,1);
 for(const [i,id]of ['d','e','f'].entries())drop(g,i,id);assert.ok(G.lock(g,G.token(g),2));assert.equal(g.gps.phase,'compare');assert.ok(G.reveal(g));assert.deepEqual(g.teams.map(t=>t.score),[115,60]);
 g=JSON.parse(JSON.stringify(g));assert.equal(G.reveal(g),false);assert.deepEqual(g.teams.map(t=>t.score),[115,60]);assert.ok(G.next(g));assert.equal(g.gps.index,2);
});
test('anciennes sauvegardes avec les identifiants a/b/c toujours lisibles',()=>{
 const g=fresh();g.gps.placements=[['c','a','b'],['c','b','a']];g.gps.locked=[true,true];g.gps.phase='compare';assert.ok(G.reveal(g));assert.deepEqual(g.teams.map(t=>t.score),[15,5]);
});
test('coordonnées invalides, jetons périmés et phase corrigée ne modifient pas les placements',()=>{
 const g=fresh(),stamp=G.token(g);for(const point of [[NaN,45],[Infinity,0],[-180,-90],null])assert.equal(G.placeRiverAt(g,0,point,stamp),false);
 assert.equal(G.placeRiverAt(g,0,coord('c'),'expired'),false);assert.equal(G.placeRiverAt(g,3,coord('c'),stamp),false);assert.deepEqual(g.gps.placements[0],[null,null,null]);
});
