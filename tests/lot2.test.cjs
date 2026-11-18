const test=require('node:test'),assert=require('node:assert/strict'),P=require('../passport.js'),W=require('../world.js'),G=require('../gps.js'),Geo=require('../gps-geography.js'),fs=require('node:fs');
test('Roumanie : trois indices, progression et barèmes conservés',()=>{
 assert.deepEqual(P.points,[20,15,10]);for(const p of P.puzzles)assert.equal(p.clues.length,3);
 const p=P.puzzles[2];assert.equal(p.quote,undefined);assert.doesNotMatch(p.clues.slice(0,2).join(' '),/très, très saignante|Dracula/);
 assert.equal(p.clues[2],'Ma capitale est Bucarest. Livraison urgente : mon client a demandé sa viande très, très saignante… comme dans les histoires de Dracula !');
});
test('titres et traitement historique de la sixième manche',()=>{
 assert.equal(W.challenges[1].title,'Un steak qui fait des bonds !');assert.equal(W.challenges[4].title,'Une ancienne escale de chasse à la baleine');
 assert.match(W.challenges[4].fact,/XIXe et XXe siècles/);assert.match(W.challenges[4].fact,/ni une tradition culinaire actuelle ni une chasse pratiquée dans le jeu/);
});
test('Garonne : tracé source arrêté avant l’estuaire ; pas de modification des repères',()=>{
 const r=Geo.rivers.find(r=>r.name==='Garonne'),coordinates=[...r.path.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map(m=>G.unproject([+m[1],+m[2]]));
 assert.ok(Math.max(...coordinates.map(p=>p[1]))<45);assert.match(G.challenges[1].facts[0],/Dordogne.*bec d’Ambès.*estuaire de la Gironde/);
 const svg=fs.readFileSync('assets/maps/garonne-fleuve-riviere.svg','utf8');for(const name of['Garonne','Dordogne','Gironde','Atlantique','Tarn','Lot'])assert.ok(svg.includes(name));assert.match(svg,/non cartographique/);
});
test('cartes comparatives : trois régions historiques et contour actuel identifié',()=>{
 const s=fs.readFileSync('assets/maps/bonus-regions-comparaison.svg','utf8');assert.deepEqual([...s.matchAll(/data-region="(\d+)"/g)].map(m=>m[1]).sort(),['54','72','74','75']);
 for(const label of['Avant 2016','Depuis 2016','Aquitaine','Limousin','Poitou-Charentes'])assert.ok(s.includes(label));
});
