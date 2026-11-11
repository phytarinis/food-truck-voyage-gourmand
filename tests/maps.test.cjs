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
