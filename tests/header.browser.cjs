const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage({reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.HEADER_TEST_URL||'http://127.0.0.1:8008');await p.evaluate(()=>{localStorage.clear();game=FoodTruckGame.createGame(['Équipe Corail','Équipe Sauge']);game.teams[0].score=35;game.teams[1].score=20;SauceGame.start(game);SauceGame.begin(game);renderSauce()});
 for(const[width,height]of[[1366,768],[1920,1080],[1024,768],[390,844]]){
  await p.setViewportSize({width,height});
  await p.evaluate(()=>show('welcome'));assert.equal(await p.locator('.welcome-illustration').isVisible(),true);assert.equal(await p.locator('.topbar').isVisible(),false);
  await p.evaluate(()=>show('setup'));assert.equal(await p.locator('.partners').isVisible(),true);assert.equal(await p.locator('.partner-logo:visible').count(),1);assert.equal(await p.locator('.setup-partners>img,.setup-partners>svg').count(),2);
  const original=await p.evaluate(()=>JSON.stringify(game));
  for(const id of await p.locator('.screen').evaluateAll(ns=>ns.map(n=>n.id).filter(id=>!['welcome','setup'].includes(id)))){
   await p.evaluate(id=>{scores();show(id)},id);
   assert.equal(await p.locator('.partners').isVisible(),false,`${id}: logos`);assert.equal(await p.locator('footer>span:first-child').isVisible(),false);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${id} ${width}: débordement`);
   const board=p.locator(`#${id} .scoreboard`).first();
   if(await board.count()){
    const cards=await board.locator('.score').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom}}));assert.equal(cards.length,2);assert.equal(cards[0].y,cards[1].y);assert.ok(cards[0].right<=cards[1].x);
    assert.deepEqual(await board.locator('.score-points').allTextContents(),['35 pts','20 pts']);
    assert.ok(await board.locator('.score-points').evaluateAll(ns=>ns.every(n=>n.scrollWidth<=n.clientWidth)),`${id}: scores coupés`);
   }
  }
  assert.equal(await p.evaluate(()=>JSON.stringify(game)),original,'Le changement de présentation ne modifie pas la partie');
  await p.evaluate(()=>renderSauce());assert.match(await p.locator('#screen-context').innerText(),/Manche 2.*quelle sauce/i);
  if(width>=1024)assert.ok((await p.locator('.topbar').boundingBox()).height<=56);
  if(width===1366)await p.screenshot({path:'/tmp/bandeau-captures/apres.png'});
  await p.evaluate(()=>{openCareerPause(2)});assert.match(await p.locator('#screen-context').innerText(),/Pause métier 3.*Réceptionniste/i);
 }
 // Validation réelle des deux équipes : scores et navigation préservés.
 await p.setViewportSize({width:1366,height:768});await p.evaluate(()=>{game=FoodTruckGame.createGame(['Corail','Sauge']);SauceGame.start(game);SauceGame.begin(game);renderSauce()});
 for(let team=0;team<2;team++){await p.locator(`#sauce-panels button[data-team="${team}"][data-correct="true"]`).click();await p.locator('#sauce-confirm-answer').click()}
 assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>t.score)),[20,20]);assert.equal(await p.locator('#sauce-correction').isVisible(),true);assert.match(await p.locator('#screen-context').innerText(),/Manche 2/i);assert.deepEqual(errors,[]);await b.close();console.log('Bandeaux : tous écrans, logos limités aux pages 1/2, scores côte à côte, quatre formats et validation réelle OK');
})().catch(e=>{console.error(e);process.exit(1)});
