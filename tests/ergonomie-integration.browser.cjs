// Régression des transitions communes après combinaison des refontes 2 et 3.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),p=await b.newPage({reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(const [width,height]of [[1366,768],[1280,720]]){
  await p.setViewportSize({width,height});await p.goto(process.env.GAME_TEST_URL||'http://127.0.0.1:8010');
  await p.evaluate(()=>{game=FoodTruckGame.createGame(['Les épices','Les voyageurs']);AperoGame.start(game);AperoGame.begin(game);for(const d of AperoGame.deliveries){for(let t=0;t<2;t++){AperoGame.choose(game,t,'department',d.department);AperoGame.choose(game,t,'number',d.number);}AperoGame.validate(game);AperoGame.next(game);}AperoGame.chooseBonus(game,1);AperoGame.revealBonus(game);AperoGame.finish(game);openCareerPause(0)});
  const apero=await p.evaluate(()=>JSON.stringify(game.apero));
  const career=async(index)=>{assert.equal(await p.evaluate(()=>currentCareerIndex),index);await p.locator('input[name=career-choice]').first().check();await p.locator('#career-reveal').click();await p.locator('#career-continue').click()};
  await career(0);assert.equal(await p.locator('#sauce-search').isVisible(),true);
  for(let q=0;q<3;q++){for(let t=0;t<2;t++)await p.locator(`#sauce-response-controls button[data-team="${t}"][data-correct="true"]`).click();await p.locator('#sauce-next').click();assert.equal(await p.locator('#spicy-break').isVisible(),false)}
  await p.locator('input[name=sauce-bonus-choice]').first().check();await p.locator('#sauce-bonus-reveal').click();await p.locator('#sauce-bonus-finish').click();await career(1);
  assert.equal(await p.locator('#france-search').isVisible(),true);assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>t.score)),[90,90]);
  for(let q=0;q<3;q++){
   for(let t=0;t<2;t++)await p.locator(`#france-panels button[data-team="${t}"][data-correct="true"]`).click();
   await p.locator('#france-open-map').click();const region=await p.evaluate(()=>FranceGame.puzzles[game.france.puzzleIndex].region);
   for(let t=0;t<2;t++){await p.locator(`.france-region[data-region="${region}"]`).focus();await p.keyboard.press('Space');await p.locator('#france-lock-flag').click();}
   await p.locator('#france-reveal-region').click();assert.equal(await p.locator('#france-culture').isVisible(),true);await p.locator('#france-next').click();assert.equal(await p.locator('#spicy-break').isVisible(),false);
  }
  await p.locator('input[name=france-bonus-choice]').nth(1).check();await p.locator('#france-bonus-reveal').click();await p.locator('#france-bonus-finish').click();await career(2);
  assert.equal(await p.locator('#journey').isVisible(),true);assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers])),[[165,2],[165,2]]);assert.equal(await p.evaluate(()=>JSON.stringify(game.apero)),apero);assert.equal(await p.locator('#route-truck span').innerText(),'ESCALE 3');
  await p.reload();assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers])),[[165,2],[165,2]]);assert.equal(await p.locator('#route-truck span').innerText(),'ESCALE 3');assert.equal(await p.locator('.route-stop.complete').count(),3);
  console.log(`Intégration ${width}×${height} : Serveuse → manche 2 → Cuisinier → manche 3 → Réceptionniste, 165 points uniques, piments et sauvegarde OK`);
 }
 assert.deepEqual(errors,[]);await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
