const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await browser.newPage({reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(const [width,height] of [[1366,768],[1280,720]]){
  await p.setViewportSize({width,height});await p.goto(process.env.GAME_TEST_URL||'http://127.0.0.1:8010');await p.evaluate(()=>{game=null;localStorage.clear()});await p.reload();
  await p.locator('.welcome-illustration').evaluate(i=>i.decode());assert.match(await p.locator('.welcome-illustration').getAttribute('src'),/accueil-retouche/);
  const noScroll=async()=>assert.equal(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth),true);
  await noScroll();assert.equal(await p.locator('.topbar').isVisible(),false);
  await p.screenshot({path:`/tmp/accueil-${width}.png`});
  await p.keyboard.press('Tab');assert.equal(await p.locator('#onward').evaluate(n=>n===document.activeElement),true);await p.keyboard.press('Enter');assert.equal(await p.locator('#setup').isVisible(),true);
  await p.evaluate(()=>show('welcome'));await p.locator('#onward').click();await p.locator('#team-one').fill('Les gourmands');await p.locator('#team-two').fill('Les voyageurs');await p.locator('#team-form button').click();await p.locator('#rules-next').click();
  await noScroll();assert.equal(await p.locator('#play,.demo-launch,#challenge,#result').count(),0);assert.equal(await p.locator('.route-round-open').count(),6);
  assert.equal(await p.locator('#route-truck.on-route').count(),0);
  for(const button of await p.locator('.route-round-open').all()){const r=await button.boundingBox();assert(r.y>=0&&r.y+r.height<=height)}
  await p.screenshot({path:`/tmp/carnet-${width}.png`});
  for(let i=0;i<6;i++){
   await p.evaluate(i=>{const keys=['apero','sauce','france','gps','passport','world'];game[keys[i]]={phase:'complete'};scores();show('journey')},i);
   assert.equal(await p.locator('#route-truck span').innerText(),`ESCALE ${i+1}`);await p.reload();assert.equal(await p.locator('#route-truck span').innerText(),`ESCALE ${i+1}`);
   await p.evaluate(()=>{game.routeCurrent=0;show('journey')});assert.equal(await p.locator('#route-truck span').innerText(),`ESCALE ${i+1}`);
  }
  assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers])),[[0,2],[0,2]]);
  console.log(`Accueil / carnet ${width}×${height} : clavier, souris, six étapes, sans débordement, progression sauvegardée OK`);
 }
 // Une ancienne démo interrompue ne bloque pas la reprise des jokers.
 await p.evaluate(()=>{game.challenge={done:false};saveProgress()});await p.reload();assert.equal(await p.evaluate(()=>game.challenge),null);
 assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
