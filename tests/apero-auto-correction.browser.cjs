const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.APERO_TEST_URL||'http://127.0.0.1:8008');await page.evaluate(()=>localStorage.clear());await page.reload();
 await page.locator('#onward').click();await page.locator('#team-one').fill('Corail');await page.locator('#team-two').fill('Sauge');await page.locator('#team-form button').click();await page.locator('#rules-next').click();await page.locator('.route-round-open').first().click();
 const cases=[['Dordogne','24','Gironde','33',[10,0]],['Gironde','17','Charente-Maritime','24',[15,5]],['Gironde','33','Charente','16',[15,15]]];
 const scores=()=>page.evaluate(()=>game.teams.map(t=>t.score));
 for(let i=0;i<3;i++){
  const [d0,n0,d1,n1,expected]=cases[i],before=await scores();
  assert.equal(await page.locator(".delivery-instruction").count(),0);
  for(const [team,dep,num]of[[0,d0,n0],[1,d1,n1]]){
   await page.locator(`input[name="team-${team}-department"][value="${dep}"]`).check();await page.locator(`input[name="team-${team}-number"][value="${num}"]`).check();
   if(team===1){assert.equal(await page.locator('#delivery input[name^="team-0-"]').count(),0);assert.deepEqual(await scores(),before);assert.equal(await page.locator('#delivery-correction').isVisible(),false)}
   await page.locator('#delivery-record').click();
   if(team===0){assert.equal(await page.locator('#delivery').isVisible(),true);assert.equal(await page.locator('#delivery input:checked').count(),0);assert.deepEqual(await scores(),before)}
  }
  // Aucune action entre le second clic d’enregistrement et ces assertions.
  assert.equal(await page.locator('#delivery-correction').isVisible(),true);assert.equal(await page.evaluate(()=>game.apero.phase),'correction');assert.equal(await page.locator('#delivery-validate').count(),0);assert.deepEqual(await scores(),expected);
  const result=await page.evaluate(()=>JSON.stringify(game.apero.results));await page.evaluate(()=>{document.querySelector('#delivery-record').click();document.querySelector('#delivery-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});assert.deepEqual(await scores(),expected);assert.equal(await page.evaluate(()=>JSON.stringify(game.apero.results)),result);
  await page.reload();await page.locator('.route-round-open').first().click();assert.equal(await page.locator('#delivery-correction').isVisible(),true);assert.deepEqual(await scores(),expected);assert.equal(await page.evaluate(()=>JSON.stringify(game.apero.results)),result);assert.equal(await page.evaluate(()=>AperoGame.validate(game)),false);
  console.log(`Livraison ${i+1} : correction immédiate, scores ${expected}, sauvegarde et double clic OK`);
  if(i===2)assert.equal(await page.locator('#delivery-next-label').innerText(),'Défi découverte');
  await page.locator('#delivery-next').click();assert.equal(await page.locator('#spicy-break').isVisible(),false);
 }
 assert.equal(await page.locator('#apero-bonus').isVisible(),true);assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
