/* Audit ciblé de la réconciliation PR 35 / main ; exécuter depuis la racine. */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process'),Module=require('module'),assert=require('assert/strict');
const main=cp.execFileSync('git',['rev-parse','origin/main'],{encoding:'utf8'}).trim(),original='ff0b58f79a26220d364833837ec62a00ac2fccc5';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function audit(ref,file){const expected=hash(cp.execFileSync('git',['show',ref+':'+file],{maxBuffer:30*1024*1024})),actual=hash(fs.readFileSync(file));assert.equal(actual,expected,file);return{file,reference:ref,sha256:actual,identical:true}}
const protectedFiles=['careers.js','tests/fixtures/career-pedagogy.json','game.js','apero.js','sauce.js','spicy.js','spicy-ui.js','spicy-photos.js','persistence.js','final.js','final-ui.js','gps.js','gps-geography.js','gps-hydrography.js','gps-hydrography-ui.js','gps-river-context.js','france-regions.js','europe-map.js','world-map.js','flag-map.js','flag-choices.js','clue-flags.js'];
const mapFiles=cp.execFileSync('git',['ls-tree','-r','--name-only',main,'assets/maps'],{encoding:'utf8'}).trim().split('\n').filter(f=>/\.(geojson|svg)$/.test(f));
const files=[...new Set([...protectedFiles,...mapFiles])].map(f=>audit(main,f));
const images=['serveuse','cuisiniere','receptionniste','entretien','restauration-rapide'].map(n=>audit(original,'assets/careers/'+n+'.png'));
const originalImprovements=['assets/accueil-retouche.png','assets/population-france.png','assets/maps/bonus-regions-comparaison.svg','assets/maps/garonne-fleuve-riviere.svg','career-illustrations.js','pedagogical-highlights.js','tools/generate-lot2-maps.py','france.js','passport.js','world.js','sauce-ui.js','france-ui.js','passport-ui.js','world-ui.js','apero-ui.js'].map(f=>audit(original,f));
const engineFunctions=[];
for(const file of['game.js','apero.js','sauce.js','france.js','gps.js','passport.js','world.js','careers.js','spicy.js','final.js']){
 const full=path.resolve(file),m=new Module(full,module);m.filename=full;m.paths=Module._nodeModulePaths(path.dirname(full));m._compile(cp.execFileSync('git',['show',main+':'+file],{encoding:'utf8'}),full);
 const current=require(full),before=m.exports,functions=Object.keys(before).filter(k=>typeof before[k]==='function');
 for(const key of functions)assert.equal(current[key].toString(),before[key].toString(),file+':'+key);
 if(before.points)assert.deepEqual(current.points,before.points,file+':barème');
 engineFunctions.push({file,functions,identical:true});
}
fs.writeFileSync('docs/validation-pr35/INTEGRITE.json',JSON.stringify({main,originalPr35:original,protectedFiles:files,professionalIllustrations:images,originalImprovements,engineFunctions},null,2)+'\n');console.log(files.length+' fichiers identiques à main ; 5 illustrations identiques à la PR 35 ; '+engineFunctions.reduce((n,e)=>n+e.functions.length,0)+' fonctions moteur identiques.');
