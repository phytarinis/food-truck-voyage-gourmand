const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await browser.newPage({reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.FRANCE_TEST_URL||'http://127.0.0.1:8010');
 const scores=()=>p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers]));
 const fit=async(label)=>{await p.evaluate(()=>scrollTo(0,0));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),true,label)};
 const response=async(team,correct)=>{assert.equal(await p.locator('#france-active-team').innerText(),`À ${team===0?'Les gourmands':'Les voyageurs'} de répondre`);await p.locator(`#france-panels button[data-team="${team}"][data-correct="${correct}"]`).click()};
 const reload=async()=>{await p.reload();assert.equal(await p.locator('#journey').isVisible(),true);await p.locator('.route-round-open').nth(2).click()};
 const choose=async(code)=>{
  const pos=await p.evaluate(code=>{const r=FranceRegions.find(r=>r.code===code),path=document.querySelector(`#france-map-board path[data-region="${code}"]`),v=new DOMPoint(...r.center).matrixTransform(path.getScreenCTM());return {x:v.x,y:v.y}},code);
  await p.mouse.click(pos.x,pos.y);assert.equal(await p.evaluate(()=>game.france.location.choices[game.france.location.activeTeam]),code);
 };
 const prepare=async(q)=>p.evaluate(q=>{
  game=FoodTruckGame.createGame(['Les gourmands','Les voyageurs']);FranceGame.start(game);FranceGame.begin(game);
  for(let i=0;i<q;i++){
   for(let level=0;level<3;level++){for(let t=0;t<2;t++)FranceGame.validate(game,t,false,FranceGame.token(game,t));if(level<2)FranceGame.revealNextClue(game,FranceGame.nextClueToken(game));}
   FranceGame.startLocation(game);for(let t=0;t<2;t++){const stamp=FranceGame.locationToken(game);FranceGame.chooseRegion(game,'11',stamp);FranceGame.lockFlag(game,stamp);}FranceGame.revealLocation(game);FranceGame.discover(game);FranceGame.next(game);
  }renderFrance();
 },q);
 for(const [width,height] of [[1366,768],[1280,720]]){
  await p.setViewportSize({width,height});
  assert.equal(await p.locator('#france-intro,#france-confirm,#france-correction,#france-end,#france-discover,#france-next-clue').count(),0);
  for(let q=0;q<3;q++)for(const outcomes of [[0,0],[0,1],[0,3],[3,3],[2,2]]){
   await prepare(q);
   assert.match(await p.locator('#screen-context').innerText(),new RegExp(`Énigme ${q+1} sur 3 · En équipes`));
   await fit(`indice ${q}/${outcomes}/${width}`);
   if(q===0&&outcomes[1]===0){await p.locator('#photo-credits-open').click();assert.doesNotMatch(await p.locator('#photo-credits-content').innerText(),/Brücke|Arnaud|Benoît/);await p.locator('#photo-credits-close').click();}
   if(q===0&&outcomes[0]===0&&outcomes[1]===0)await p.screenshot({path:`/tmp/france-indice-${width}.png`});
   for(let level=0;level<3;level++){
    for(let team=0;team<2;team++){
     if(await p.evaluate(t=>game.france.players[t].status!=='searching',team))continue;
     assert.equal(await p.locator('#france-panels .sauce-current-clue').count(),1);
     assert.match(await p.locator('#france-panels .sauce-clue-info').innerText(),new RegExp(`Indice ${level+1} / 3`));
     const before=await p.evaluate(()=>game.france.clueIndex),stamp=await p.evaluate(t=>FranceGame.token(game,t),team);
     await response(team,outcomes[team]===level);
     assert.equal(await p.evaluate(({team,stamp})=>FranceGame.validate(game,team,true,stamp),{team,stamp}),false,'ancienne décision refusée');
     if(q===0&&outcomes[0]===0&&outcomes[1]===1&&level===0&&team===0)await reload();
     if(team===0&&await p.evaluate(()=>game.france.players[1].status==='searching'))assert.equal(await p.evaluate(()=>game.france.clueIndex),before);
    }
    if(await p.locator('#france-answer').isVisible())break;
   }
   const expected=outcomes.map(i=>[20,15,10,0][i]);assert.deepEqual(await scores(),expected.map(n=>[n,2]));
   assert.equal(await p.locator('#france-answer').isVisible(),true);
   await p.locator('#france-photo img').evaluate(i=>i.decode());
   assert.equal(await p.locator('#france-photo img').evaluate(i=>getComputedStyle(i).objectFit),q===0?'cover':'contain');
   assert.equal(await p.locator('#france-search-awards').count(),0);
   const regionName=await p.evaluate(()=>franceRegionName(FranceGame.puzzles[game.france.puzzleIndex].region));
   assert.equal((await p.locator('#france-answer').innerText()).includes(regionName),false);
   assert.match(await p.locator('#france-photo figcaption').innerText(),q===0?/Recadrage à l’affichage/:/sans retouche ni recadrage/);
   assert.equal(await p.locator('#france-photo figcaption a').count(),2);
   assert.equal(await p.locator('#france-photo img').getAttribute('src'),await p.evaluate(()=>FrancePhotos[FranceGame.puzzles[game.france.puzzleIndex].id].src));
   const author=['Brücke-Osteuropa','Arnaud 25','Benoît Prieur'][q];
   await p.locator('#photo-credits-open').click();assert.match(await p.locator('#photo-credits-content').innerText(),new RegExp(author));if(q===0)assert.doesNotMatch(await p.locator('#photo-credits-content').innerText(),/Arnaud|Benoît/);await p.locator('#photo-credits-close').click();
   await fit(`plat ${q}/${width}`);
   if(q===0&&outcomes[1]===0){await p.screenshot({path:`/tmp/france-plat-${width}.png`});await reload();assert.deepEqual(await scores(),expected.map(n=>[n,2]));}
   await p.locator('#france-open-map').click();await fit(`carte ${q}/${width}`);
   assert.match(await p.locator('#screen-context').innerText(),new RegExp(`Carte ${q+1} sur 3`));
   assert.equal(await p.locator('.france-region').count(),18);assert.equal(await p.locator('.france-inset').count(),5);
   assert.equal(await p.locator('#france-culture').isVisible(),false);assert.equal(await p.locator('#france-fact').innerText(),'');
   const region=await p.evaluate(()=>FranceGame.puzzles[game.france.puzzleIndex].region);
   if(q===0&&outcomes[1]===0)for(const code of await p.evaluate(()=>FranceRegions.map(r=>r.code)))await choose(code);
   await choose(region);await p.locator('#france-lock-flag').click();
   assert.equal(await p.locator('.france-flag').count(),0);assert.equal(await p.locator('.france-region.is-selected').count(),0);
   assert.doesNotMatch(await p.locator('#france-map-choice').innerText(),new RegExp(regionName));
   if(q===0&&outcomes[1]===0){await reload();assert.equal(await p.locator('.france-flag').count(),0);}
   const second=outcomes[1]===3?'11':region;
   await p.locator(`.france-region[data-region="${second}"]`).focus();await p.keyboard.press('Space');await p.locator('#france-lock-flag').click();
   assert.equal(await p.locator('.france-flag').count(),2);assert.equal(await p.locator('#france-culture').isVisible(),false);
   if(second===region){const boxes=await p.locator('.france-flag').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return [r.left,r.right]}));assert(boxes[0][1]<boxes[1][0]);}
   await p.locator('#france-reveal-region').click();expected[0]+=5;if(second===region)expected[1]+=5;
   assert.equal(await p.locator('#france-location').isVisible(),true);assert.equal(await p.locator('.france-flag').count(),2);
   assert.equal(await p.locator('#france-culture').isVisible(),true);assert.match(await p.locator('#france-region-answer').innerText(),new RegExp(regionName));
   assert.deepEqual(await scores(),expected.map(n=>[n,2]));assert.equal(await p.evaluate(()=>FranceGame.revealLocation(game)),false);
   await fit(`correction ${q}/${outcomes}/${width}`);
   if(q===0&&outcomes[1]===0){await p.screenshot({path:`/tmp/france-correction-${width}.png`});await reload();assert.equal(await p.locator('#france-culture').isVisible(),true);assert.deepEqual(await scores(),expected.map(n=>[n,2]));}
   assert.equal(await p.locator('.france-screen .action-van').count(),0);
   await p.locator('#france-next').click();assert.equal(await p.locator('#spicy-break').isVisible(),false);
   if(q===2){
    assert.equal(await p.locator('#france-bonus').isVisible(),true);assert.match(await p.locator('#screen-context').innerText(),/Défi découverte · Collectif · Sans points/);
    assert.equal(await p.locator('#france-bonus-reveal').isDisabled(),true);
    await p.locator('input[name=france-bonus-choice]').nth(0).check();await p.locator('input[name=france-bonus-choice]').nth(2).check();assert.equal(await p.locator('#france-bonus-answer').isVisible(),false);
    await reload();assert.equal(await p.locator('input[name=france-bonus-choice]').nth(2).isChecked(),true);
    await p.locator('#france-bonus-reveal').click();assert.match(await p.locator('#france-bonus-solution').innerText(),/^B\. 67/);assert.match(await p.locator('#france-bonus-reference').innerText(),/2026/);
    assert.deepEqual(await scores(),expected.map(n=>[n,2]));await fit(`découverte révélée ${width}`);
    await reload();assert.equal(await p.locator('#france-bonus-answer').isVisible(),true);await p.locator('#france-bonus-finish').click();
    assert.equal(await p.locator('#career-pause').isVisible(),true);assert.equal(await p.evaluate(()=>currentCareerIndex),2);assert.equal(await p.evaluate(()=>game.france.phase),'complete');
    assert.deepEqual(await scores(),expected.map(n=>[n,2]));await p.reload();assert.equal(await p.locator('#route-truck span').innerText(),'ESCALE 3');
   }
  }
  console.log(`Trois spécialités × cinq scénarios : indice commun, photos, 18 régions, confidentialité, +5 uniques, bonus, sauvegarde, réception, sans défilement ${width}×${height} OK`);
 }
 // Un double clic n’enregistre pas la réponse de l’autre équipe.
 await prepare(0);await p.locator('#france-panels button[data-correct="true"]').dblclick();assert.deepEqual(await scores(),[[20,2],[0,2]]);assert.equal(await p.evaluate(()=>game.france.players[1].status),'searching');
 // La pause Cuisinier mène directement au premier indice de la manche 3.
 await p.evaluate(()=>{game=FoodTruckGame.createGame(['Les gourmands','Les voyageurs']);openCareerPause(1)});await p.locator('input[name=career-choice]').first().check();await p.locator('#career-reveal').click();await p.locator('#career-continue').click();assert.equal(await p.locator('#france-search').isVisible(),true);
 // Les formats plus étroits restent accessibles avec défilement vertical.
 for(const [width,height]of [[1024,768],[390,844],[320,640]]){
  await p.setViewportSize({width,height});await prepare(0);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await response(0,true);await response(1,true);await p.locator('#france-open-map').click();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 }
 assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
