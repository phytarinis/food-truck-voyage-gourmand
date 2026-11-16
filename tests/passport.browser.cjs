const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.PASSPORT_TEST_URL||'http://127.0.0.1:8008');
 const score=()=>p.evaluate(()=>game.teams.map(t=>t.score));
 const respond=async(team,correct)=>{
  const select=p.locator('.passport-team-selector button').filter({hasText:team?'Sauge':'Corail'});
  await select.click();await p.locator(`#passport-panels [data-team="${team}"][data-correct="${correct}"]`).click();
  assert.equal(await p.locator('dialog[open]').count(),0);
 };
 const fit=async(label)=>{
  // Progression unique dans l’en-tête, à chaque étape et après reprise.
  const expected=await p.evaluate(()=>game.passport.phase==='bonus'?'MANCHE 05 / DÉFI · COLLECTIF · SANS POINTS':`MANCHE 05 / ÉNIGME ${game.passport.puzzleIndex+1} SUR 3`);
  assert.equal(await p.locator('#screen-context').innerText(),expected,label);
  assert.equal(await p.locator('.passport-screen .eyebrow').count(),0,label);
  assert.equal(await p.locator('.passport-screen .action-van,.passport-screen .van-action').count(),0,label);
  await p.evaluate(()=>scrollTo(0,0));
  const size=await p.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}));
  assert.ok(size.scrollWidth<=size.width&&size.scrollHeight<=size.height,`${label}: ${JSON.stringify(size)}`);
 };
 const reopen=async()=>{await p.reload();await p.evaluate(()=>openPassport());};
 const choose=async code=>{await p.locator(`#passport-map-board [data-region="${code}"]`).focus();await p.keyboard.press('Space');};
 for(const [width,height]of[[1280,720],[1366,768]]){
  await p.setViewportSize({width,height});
  await p.evaluate(()=>{game=FoodTruckGame.createGame(['Corail','Sauge']);openPassport()});
  assert.equal(await p.locator('#passport-search').isVisible(),true);
  for(const [index,code]of['BEL','PRT','ROU'].entries()){
   assert.equal(await p.locator('#passport-panels .sauce-current-clue').count(),1);
   assert.equal(await p.locator('#passport-destination-title').innerText(),`Destination mystère n° ${index+1}`);
   assert.doesNotMatch(await p.locator('#passport-search').innerText(),/pastéis|Transylvanie|Dracula|Roumanie/);
   await fit(`search ${index} ${width}`);
   const before=await score();
   // Le premier résultat ne révèle ni solution ni attribution détaillée.
   await respond(1,true);
   assert.equal(await p.locator('#passport-search .score-points').nth(1).innerText(),`${before[1]} pts`);
   assert.equal(await p.evaluate(()=>game.passport.clueIndex),0);
   assert.equal(await p.locator('#passport-search').isVisible(),true);
   assert.doesNotMatch(await p.locator('#passport-panels').innerText(),/Trouvé|20 points obtenus|Belgique|Portugal|Roumanie/);
   await p.locator('#passport-search .passport-undo').click();assert.deepEqual(await score(),before);
   await respond(0,false);await respond(1,true);
   assert.equal(await p.evaluate(()=>game.passport.clueIndex),1);
   await reopen();assert.equal(await p.evaluate(()=>game.passport.clueIndex),1);
   await p.locator('#passport-search .passport-undo').click();assert.equal(await p.evaluate(()=>game.passport.clueIndex),0);
   await respond(1,true);await respond(0,false);
   assert.equal(await p.evaluate(()=>game.passport.clueIndex),2);
   await respond(0,true);
   assert.equal(await p.locator('#passport-location').isVisible(),true);
   assert.equal(await p.locator('#passport-photo img').count(),1);
   assert.match(await p.locator('#passport-photo figcaption').innerText(),/sans retouche ni recadrage/);
   await fit(`location ${index} ${width}`);
   // Annuler la dernière réponse après découverte reste possible avant tout placement.
   await p.locator('#passport-location .passport-undo').click();
   assert.equal(await p.locator('#passport-search').isVisible(),true);await respond(0,true);
   if(index===0){
    await p.locator('#passport-zoom-in').click();await p.locator('#passport-zoom-in').click();
    assert.match(await p.locator('#passport-zoom-status').innerText(),/256/);
    const point=await p.evaluate(code=>{const c=EuropeMap.countries.find(c=>c.code===code),path=document.querySelector(`#passport-map-board [data-region="${code}"]`),q=new DOMPoint(...c.center).matrixTransform(path.getScreenCTM());return{x:q.x,y:q.y}},code);
    await p.mouse.click(point.x,point.y);
    assert.equal(await p.evaluate(()=>game.passport.location.choices[0]),code);
   }
   await choose(code);assert.equal(await p.locator('#passport-location .passport-undo').isVisible(),false);
   await p.locator('#passport-lock-flag').click();
   assert.match(await p.locator('#passport-zoom-status').innerText(),/100/);
   assert.equal(await p.locator('#passport-map-board .france-flag').count(),0);
   await reopen();assert.equal(await p.locator('#passport-map-board .france-flag').count(),0);
   await choose(index===1?'ESP':code);await p.locator('#passport-lock-flag').click();
   assert.equal(await p.evaluate(()=>game.passport.phase),'correction');
   assert.equal(await p.locator('#passport-map-board .france-flag').count(),2);
   assert.equal(await p.locator('#passport-map-board .is-correct').getAttribute('data-region'),code);
   assert.deepEqual(await score(),[before[0]+15,before[1]+(index===1?20:25)]);
   assert.equal(await p.evaluate(()=>PassportGame.revealLocation(game)),false);
   await fit(`correction ${index} ${width}`);
   assert.equal(await p.locator('#passport-next .action-van').count(),0);
   assert.equal(await p.locator('#passport-spicy').isVisible(),true);
   if(index===0){
    const saved=await score();await p.locator('#passport-spicy').click();
    assert.equal(await p.locator('#spicy-setup').isVisible(),true);
    // Reprise du contexte de correction sans jouer : ni score ni piment modifié.
    await p.evaluate(()=>{spicySetup=null;renderPassport()});assert.deepEqual(await score(),saved);
   }
   await reopen();assert.deepEqual(await score(),[before[0]+15,before[1]+(index===1?20:25)]);
   await fit(`correction reprise ${index} ${width}`);
   await p.locator('#passport-next').click();assert.equal(await p.locator('#spicy-break').isVisible(),false);
  }
  assert.equal(await p.locator('#passport-bonus').isVisible(),true);await fit(`défi ${width}`);
  assert.match(await p.locator('#passport-bonus-title').innerText(),/DÉFI/);
  const before=await score();await p.locator('[name=passport-bonus-choice]').nth(0).check();await p.locator('#passport-bonus-reveal').click();
  assert.equal(await p.locator('#passport-bonus-photo img').count(),1);assert.deepEqual(await score(),before);
  await fit(`défi corrigé ${width}`);await reopen();assert.equal(await p.locator('#passport-bonus-answer').isVisible(),true);await fit(`défi repris ${width}`);
  await p.locator('#passport-bonus-finish').click();assert.equal(await p.locator('#career-pause').isVisible(),true);
  assert.match(await p.locator('#screen-context').innerText(),/Équipier polyvalent en restauration rapide/);
  assert.equal(await p.evaluate(()=>game.passport.phase),'complete');
  console.log(`Parcours complet, annulation, sauvegarde, carte et affichage ${width}×${height} : OK`);
 }
 // Épuisement des indices : aucune révélation avant la dernière réponse des deux équipes.
 await p.evaluate(()=>{game=FoodTruckGame.createGame(['Corail','Sauge']);openPassport()});
 for(let clue=0;clue<3;clue++){
  await respond(0,false);assert.equal(await p.evaluate(()=>game.passport.phase),'search');
  await respond(1,false);
 }
 assert.deepEqual(await score(),[0,0]);assert.equal(await p.evaluate(()=>game.passport.phase),'location');
 assert.equal(await p.evaluate(()=>SpicyGame.canNormal(game,'passport-location')),false);
 assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
