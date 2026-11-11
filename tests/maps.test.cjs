const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, '../assets/maps', name), 'utf8');
const expected = [...Array.from({length:19},(_,i)=>String(i+1).padStart(2,'0')), '2A', '2B', ...Array.from({length:75},(_,i)=>String(i+21))].sort();
test('France métropolitaine : les 96 limites et codes INSEE réels, Corse comprise', () => {
  const source=JSON.parse(read('mainland.geojson'));
  assert.deepEqual(source.features.map(f=>f.properties.code).sort(),expected);
  const svg=read('france-numeros.svg');
  assert.deepEqual([...svg.matchAll(/data-number="([^"]+)"/g)].map(m=>m[1]).sort(),expected);
  assert.deepEqual([...svg.matchAll(/data-code="([^"]+)"/g)].map(m=>m[1]).filter((v,i,a)=>a.indexOf(v)===i).sort(),expected);
});
test('Chaque correction garde le contexte métropolitain, le département et les deux repères communaux', () => {
  for(const code of ['16','17','24']) {
    const svg=read(`france-${code}.svg`);
    const codes=[...svg.matchAll(/data-code="([^"]+)"/g)].map(m=>m[1]);
    assert.deepEqual([...new Set(codes)].sort(),expected);
    assert.equal(codes.filter(c=>c===code).length,2); // Carte nationale + zoom local.
    assert.match(svg,/repères communaux/);
    assert.match(svg,/IGN \/ Admin Express COG 2018/);
  }
});
test('localisation d’Arcachon : contours des 12 départements de Nouvelle-Aquitaine et commune INSEE',()=>{
 const svg=read('nouvelle-aquitaine-arcachon.svg');
 assert.deepEqual([...svg.matchAll(/data-code="([^"]+)"/g)].map(m=>m[1]).sort(),['16','17','19','23','24','33','40','47','64','79','86','87']);
 const town=JSON.parse(read('arcachon.geojson'));
 assert.equal(town.properties.code,'33009');assert.equal(town.properties.nom,'Arcachon');
 assert.match(svg,/repère communal/);assert.match(svg,/IGN \/ Admin Express COG 2018/);
});

test('bonus : trois anciennes régions exactes et codes historiques conservés',()=>{
 const source=JSON.parse(read('anciennes-regions-nouvelle-aquitaine.geojson'));
 assert.deepEqual(source.features.map(f=>[f.properties.code,f.properties.nom]).sort(),[['54','Poitou-Charentes'],['72','Aquitaine'],['74','Limousin']]);
 const svg=read('bonus-nouvelle-aquitaine.svg');assert.deepEqual([...svg.matchAll(/data-region="([^"]+)"/g)].map(m=>m[1]).sort(),['54','72','74']);
 for(const region of ['Aquitaine','Limousin','Poitou-Charentes'])assert.ok(svg.includes(region));
 assert.match(svg,/Licence Ouverte/);
});
