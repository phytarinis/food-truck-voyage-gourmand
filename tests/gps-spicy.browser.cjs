const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),p=await b.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.GPS_TEST_URL||'http://127.0.0.1:8010');
 for(const mode of ['self','challenge']){
  await p.evaluate(()=>{game=FoodTruckGame.createGame(['Les montagnes','Les explorateurs']);openGps()});assert.equal(await p.evaluate(()=>SpicyGame.canNormal(game,'gps-placement')),false);assert.equal(await p.locator('#gps-spicy').isVisible(),false);
  await p.evaluate(()=>{for(let t=0;t<2;t++){GpsGame.placePoint(game,[.5,42.7],GpsGame.token(game));GpsGame.lock(game,GpsGame.token(game),performance.now());}renderGps()});
  const snapshot=await p.evaluate(()=>JSON.stringify(game.gps));await p.locator('#gps-spicy').click();await p.locator('#spicy-cancel-setup').click();assert.equal(await p.locator('#gps-placement').isVisible(),true);assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>t.jokers)),[2,2]);
  await p.locator('#gps-spicy').click();await p.locator(`input[name=spicy-mode][value=${mode}]`).check();await p.locator('input[name=spicy-question-choice][value=spiders]').check();await p.locator('#spicy-launch').click();
  await p.evaluate(()=>document.querySelector('#gps-next').click());assert.equal(await p.evaluate(()=>game.gps.index),0);assert.equal(await p.evaluate(()=>JSON.stringify(game.gps)),snapshot);
  await p.reload();assert.equal(await p.locator('#spicy-question').isVisible(),true);await p.locator('input[name=spicy-answer][value="0"]').check();await p.locator('#spicy-validate').click();assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>t.score)),mode==='self'?[25,15]:[15,25]);
  await p.reload();assert.equal(await p.locator('#spicy-correction').isVisible(),true);await p.locator('#spicy-return').click();assert.equal(await p.locator('#gps-placement').isVisible(),true);assert.equal(await p.evaluate(()=>game.gps.index),1);assert.equal(await p.locator('#spicy-break').isVisible(),false);assert.equal(await p.evaluate(()=>game.spicy.history.length),1);assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>t.jokers)),[1,2]);assert.equal(await p.evaluate(()=>SpicyGame.canNormal(game,'gps-placement')),false);
  console.log(`GPS / piment ${mode} : annulation, interdiction pendant placement, sauvegarde question/correction et reprise unique au défi suivant OK`);
 }
 assert.deepEqual(errors,[]);await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
