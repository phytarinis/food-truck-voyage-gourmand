const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),p=await b.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.WORLD_TEST_URL||'http://127.0.0.1:8008');
 for(const [mode,correct]of [['self',false],['challenge',true]]){
  await p.evaluate(()=>{game=FoodTruckGame.createGame(['Gourmands','Voyageurs']);WorldGame.start(game);WorldGame.begin(game);for(let t=0;t<2;t++){const stamp=WorldGame.token(game);WorldGame.choose(game,'Asia',stamp);WorldGame.lock(game,stamp);}WorldGame.reveal(game);renderWorld()});
  const state=await p.evaluate(()=>JSON.stringify(game.world));
  await p.locator('#world-spicy').click();await p.locator('#spicy-cancel-setup').click();assert.equal(await p.locator('#world-challenge').isVisible(),true);assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>t.jokers)),[2,2]);
  await p.locator('#world-spicy').click();await p.locator(`input[name=spicy-mode][value=${mode}]`).check();await p.locator('input[name=spicy-question-choice][value=spiders]').check();await p.locator('#spicy-launch').click();
  assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>t.jokers)),[1,2]);assert.equal(await p.evaluate(()=>JSON.stringify(game.world)),state);
  await p.evaluate(()=>document.querySelector('#world-next').click());assert.equal(await p.evaluate(()=>game.world.index),0);
  await p.reload();assert.equal(await p.locator('#spicy-question').isVisible(),true);await p.locator(`input[name=spicy-answer][value="${correct?0:1}"]`).check();await p.locator('#spicy-validate').click();
  assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>t.score)),mode==='self'?[10,10]:[10,20]);
  await p.reload();assert.equal(await p.locator('#spicy-correction').isVisible(),true);await p.locator('#spicy-return').click();
  assert.equal(await p.locator('#world-challenge').isVisible(),true);assert.equal(await p.evaluate(()=>game.world.index),0);assert.equal(await p.evaluate(()=>game.spicy.history.length),1);assert.equal(await p.locator('#spicy-break').isVisible(),false);
  await p.reload();await p.locator('.route-round-open').nth(4).click();assert.equal(await p.evaluate(()=>game.world.index),0);assert.equal(await p.evaluate(()=>SpicyGame.canNormal(game,'world-challenge')),false);
  console.log(`Piment manche 6 ${mode} : annulation, dépense unique, sauvegarde pendant question/correction, reprise exacte et absence de double points OK`);
 }
 await p.locator('#reset').click();await p.locator('#confirm-reset').click();assert.equal(await p.evaluate(()=>game),null);assert.deepEqual(errors,[]);await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
