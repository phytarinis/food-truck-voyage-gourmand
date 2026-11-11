const{test}=require('node:test'),assert=require('node:assert/strict'),S=require('../spicy.js'),{createGame}=require('../game.js');
function fresh(){return createGame(['Corail','Sauge'])}
function boundary(g,index=0){g.apero={phase:'correction',results:Array.from({length:index+1},()=>[{},{}])};S.observe(g);assert.ok(S.release(g,`apero:${index}`));return S.windowToken(g,'spicy-break')}
function final(g){for(const k of S.roundKeys)g[k]={phase:'complete',results:[]};assert.ok(S.beginFinale(g));}
function launch(g,{owner=0,mode='self',questionId='spiders',context='spicy-break'}={}){const stamp=context==='spicy-finale'?S.finaleToken(g):S.windowToken(g,context);assert.ok(stamp);assert.ok(S.start(g,{owner,mode,questionId,context,stamp}));return S.activeToken(g)}
function answer(g,correct=true){const a=g.spicy.active,q=S.questions.find(q=>q.id===a.questionId),stamp=S.activeToken(g);assert.equal(S.reveal(g,stamp),false);assert.ok(S.choose(g,correct?q.correctIndex:(q.correctIndex+1)%3,stamp));assert.ok(S.reveal(g,stamp));assert.equal(S.reveal(g,stamp),false);return stamp}
for(const owner of [0,1])for(const mode of ['self','challenge'])for(const correct of [true,false])test(`mode ${mode}, propriétaire ${owner}, réponse ${correct}`,()=>{
 const g=fresh();g.teams[0].score=45;g.teams[1].score=12;boundary(g);const before=g.teams.map(t=>t.score);const stamp=launch(g,{owner,mode});assert.deepEqual(g.teams.map(t=>t.jokers),owner===0?[1,2]:[2,1]);assert.equal(g.spicy.active.respondent,mode==='self'?owner:1-owner);assert.equal(S.finish(g,stamp),false);
 answer(g,correct);const winner=mode==='self'?(correct?owner:null):(correct?1-owner:owner);assert.deepEqual(g.teams.map((t,i)=>t.score-before[i]),[0,1].map(i=>i===winner?10:0));assert.ok(g.teams.every(t=>t.score>=0));assert.ok(S.finish(g,stamp));assert.equal(S.finish(g,stamp),false);assert.equal(g.spicy.history.length,1);assert.equal(S.canNormal(g,'spicy-break'),false);
});
test('deux piments, quatre questions uniques, refus des doubles lancements et réserves négatives',()=>{
 const g=fresh();assert.deepEqual(g.teams.map(t=>t.jokers),[2,2]);let i=0;
 for(const owner of [0,0,1,1]){boundary(g,i);const stamp=launch(g,{owner,questionId:S.questions[i].id});assert.equal(S.start(g,{owner,mode:'self',questionId:S.questions[(i+1)%4].id,context:'spicy-break',stamp:S.windowToken(g,'spicy-break')}),false);answer(g);S.finish(g,stamp);i++;}
 assert.deepEqual(g.teams.map(t=>t.jokers),[0,0]);assert.equal(new Set(g.spicy.used).size,4);assert.equal(S.available(g).length,0);boundary(g,i);assert.equal(S.windowToken(g,'spicy-break'),null);assert.equal(S.start(g,{owner:0,mode:'self',questionId:'spiders',context:'spicy-break',stamp:'fake'}),false);
});
test('une seule activation par intervalle ; observer et revisiter un résultat ne réouvrent pas la réserve',()=>{
 const g=fresh();boundary(g);const stamp=launch(g);answer(g);S.finish(g,stamp);for(let i=0;i<3;i++){S.observe(g);S.release(g,'apero:0');assert.equal(S.canNormal(g,'spicy-break'),false)}
 boundary(g,1);assert.ok(S.canNormal(g,'spicy-break'));const token=S.windowToken(g,'spicy-break');assert.equal(S.start(g,{owner:0,mode:'self',questionId:'spiders',context:'spicy-break',stamp:token}),false);assert.deepEqual(g.teams.map(t=>t.jokers),[1,2]);
});
test('aucun joker avant le premier défi, pendant une question/correction/pause, ni en reprenant un ancien intervalle',()=>{
 const g=fresh();assert.equal(S.canNormal(g,'journey'),false);g.apero={phase:'correction',results:[[{},{}]]};S.observe(g);assert.equal(S.canNormal(g,'journey'),false);S.release(g,'apero:0');
 for(const screen of ['delivery','delivery-correction','sauce-search','sauce-correction','france-location','spicy-correction','career-pause','gps-placement','world-challenge']){assert.equal(S.canNormal(g,screen),false);assert.equal(S.start(g,{owner:0,mode:'self',questionId:'spiders',context:screen,stamp:'fake'}),false)}
 for(const[key,phase]of[['apero','question'],['sauce','search'],['france','answer'],['france','location'],['gps','placement'],['gps','compare'],['passport','search'],['world','placement']]){const h=structuredClone(g);h[key]={phase};assert.equal(S.canNormal(h,'journey'),false,`${key}/${phase}`)}
 const h=structuredClone(g);h.sauce={phase:'bonus',bonus:{revealed:false}};assert.equal(S.canNormal(h,'journey'),false);h.challenge={done:false};assert.equal(S.canNormal(h,'journey'),false);
});
test('les résultats incomplets des drapeaux ne deviennent pas une pause de joker',()=>{
 const g=fresh();g.france={phase:'answer',results:[[{points:20},{points:15}]]};S.observe(g);assert.equal(g.spicy.window,null);g.france.results[0].forEach(p=>p.region='44');S.observe(g);assert.equal(g.spicy.window.key,'france:0');assert.equal(g.spicy.window.ready,false);
});
test('jetons périmés et nouveau jeu ne consomment rien ; tous les autres états sont conservés',()=>{
 const g=fresh();boundary(g);g.france={phase:'intro',sentinel:[1,2]};const previous=structuredClone({apero:g.apero,france:g.france});const token=launch(g);assert.equal(S.choose(g,3,token),false);assert.equal(S.choose(g,0,'bad'),false);answer(g);S.finish(g,token);assert.deepEqual({apero:g.apero,france:g.france},previous);assert.equal(S.choose(g,0,token),false);
 const h=fresh();boundary(h);assert.equal(S.start(h,{owner:0,mode:'self',questionId:'cuy',context:'spicy-break',stamp:S.windowToken(g,'spicy-break')}),false);assert.deepEqual(h.teams.map(t=>t.jokers),[2,2]);assert.deepEqual(S.state(h).used,[]);
});
test('finale : alternance obligatoire quand les deux équipes souhaitent jouer',()=>{
 const g=fresh();assert.equal(S.beginFinale(g),false);final(g);assert.deepEqual(S.finaleOwners(g),[0,1]);let index=0;
 for(const owner of [0,1,0,1]){assert.ok(S.finaleOwners(g).includes(owner));const token=launch(g,{owner,questionId:S.questions[index++].id,context:'spicy-finale'});assert.equal(S.closeFinale(g),false);assert.equal(S.willing(g,1,false),false);answer(g);S.finish(g,token);if(index<4&&g.teams[owner].jokers>0){assert.equal(S.start(g,{owner,mode:'self',questionId:S.questions[index].id,context:'spicy-finale',stamp:S.finaleToken(g)}),false)}}
 assert.deepEqual(g.teams.map(t=>[t.score,t.jokers]),[[20,0],[20,0]]);assert.ok(S.closeFinale(g));assert.equal(S.closeFinale(g),false);assert.deepEqual(g.spicy.finale.scores.map(t=>t.score),[20,20]);assert.equal(S.beginFinale(g),false);assert.equal(S.start(g,{owner:0,mode:'self',questionId:'cuy',context:'spicy-finale',stamp:'fake'}),false);
});
for(const declined of [true,false])test(`finale : deux piments successifs si adversaire ${declined?'ne souhaite pas jouer':'n’en a plus'}`,()=>{
 const g=fresh();if(!declined){boundary(g);let token=launch(g,{owner:1});answer(g);S.finish(g,token);boundary(g,1);token=launch(g,{owner:1,questionId:'cuy'});answer(g);S.finish(g,token)}final(g);if(declined)S.willing(g,1,false);
 for(const questionId of ['eggs','scorpions']){assert.deepEqual(S.finaleOwners(g),[0]);const token=launch(g,{owner:0,questionId,context:'spicy-finale'});answer(g);S.finish(g,token)}assert.equal(g.teams[0].jokers,0);
});
test('une équipe qui renonce à ses piments reste obligée de répondre au défi adverse',()=>{
 const g=fresh();final(g);S.willing(g,1,false);const token=launch(g,{owner:0,mode:'challenge',context:'spicy-finale'});assert.equal(g.spicy.active.respondent,1);answer(g,true);S.finish(g,token);assert.deepEqual(g.teams.map(t=>t.score),[0,10]);assert.deepEqual(g.teams.map(t=>t.jokers),[1,2]);
});
test('clôture sans piment utilisé : scores inchangés et photographie jamais révélée',()=>{
 const g=fresh();g.teams[0].score=345;g.teams[1].score=300;final(g);S.willing(g,0,false);S.willing(g,1,false);assert.deepEqual(S.finaleOwners(g),[]);const before=structuredClone(g.teams);assert.ok(S.closeFinale(g));assert.deepEqual(g.teams,before);assert.deepEqual(g.spicy.finale.scores,before);assert.deepEqual(g.spicy.history,[]);
});
test('les quatre photographies et licences correspondent aux fichiers fournis, avec le recadrage historique documenté',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),c={window:{}};vm.runInNewContext(fs.readFileSync('spicy-photos.js','utf8'),c);assert.deepEqual(Object.keys(c.window.SpicyPhotos),S.questions.map(q=>q.id));for(const p of Object.values(c.window.SpicyPhotos)){assert.ok(fs.existsSync(p.src));assert.ok(p.author);assert.match(p.source,/commons.wikimedia.org\/wiki\/File:/);assert.ok(p.licenseUrl)}assert.match(c.window.SpicyPhotos.scorpions.changes,/déjà recadrée/);assert.equal(c.window.SpicyPhotos.scorpions.license,'CC BY 2.0');
});
