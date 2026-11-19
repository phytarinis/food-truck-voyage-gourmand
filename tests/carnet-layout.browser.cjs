const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
 const p=await browser.newPage({reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const url=process.env.GAME_TEST_URL||'http://127.0.0.1:8020';
 const overlaps=(a,b)=>a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1;
 const box=selector=>p.locator(selector).evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));
 for(const [width,height] of [[1366,768],[1280,720]]){
  await p.setViewportSize({width,height});await p.goto(url);
  for(let count=0;count<=6;count++){
   await p.evaluate(count=>{localStorage.clear();game=FoodTruckGame.createGame(['Les gourmands','Les voyageurs']);RoundTransitions.rounds.forEach((r,i)=>{if(i<count)game[r.key]={phase:'complete',results:[]}});show('journey')},count);
   const cards=await box('.route-stop'),map=(await box('.route-map'))[0],truck=(await box('#route-truck'))[0];
   for(let i=0;i<6;i++){
    assert(cards[i].left>=map.left&&cards[i].right<=map.right&&cards[i].top>=map.top&&cards[i].bottom<=map.bottom,`cartouche ${i+1} dans la carte ${width}`);
    for(let j=i+1;j<6;j++)assert(!overlaps(cards[i],cards[j]),`cartouches ${i+1}/${j+1} ${width}`);
    assert(!overlaps(cards[i],truck),`camion / étape ${i+1}, progression ${count} ${width}`);
    const number=(await box(`.route-stop:nth-child(${i+1}) .stop-number`))[0],title=(await box(`.route-stop:nth-child(${i+1}) h2`))[0];
    assert(number.top>=cards[i].top&&title.bottom<=cards[i].bottom);assert(Math.abs((number.top+number.bottom-title.top-title.bottom)/2)<25,`numéro et titre groupés ${i+1}`);
   }
   assert.equal(await p.locator('.route-stop.complete').count(),count);
   assert.equal(await p.locator('.next-stop-label').count(),count<6?1:0);
   if(count<6)assert.equal(await p.locator('.is-next .stop-number').innerText(),`0${count+1}`);
   assert.equal(await p.locator('#route-truck span').innerText(),count?`ESCALE ${count}`:'AU DÉPART');
   const position=await p.locator('#route-truck').getAttribute('style');
   await p.evaluate(()=>{game.routeCurrent=4;show('journey')});assert.equal(await p.locator('#route-truck').getAttribute('style'),position);
   await p.reload();assert.equal(await p.locator('#route-truck span').innerText(),count?`ESCALE ${count}`:'AU DÉPART');
   assert.equal(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth),true,`sans défilement ${count} ${width}`);
   if(count===0||count===5){fs.mkdirSync('docs/validation-carnet-parcours',{recursive:true});await p.screenshot({path:`docs/validation-carnet-parcours/carnet-${width}-${count===0?'depart':'escale-06'}.png`});}
  }
  const last=cards=>cards[5].top>Math.max(cards[3].bottom,cards[4].bottom)+10;
  assert(last(await box('.route-stop')),'06 séparée de 04 et 05 sur la dernière portion');
  assert.equal(await p.locator('.route-stop:nth-child(6) h2').innerText(),'Tour du monde');
  assert.equal(await p.locator('.board-art .route-direction-arrow').count(),5);
  // Les six liens démarrent toujours leur vraie transition de manche.
  for(let i=0;i<6;i++){
   await p.evaluate(()=>{game=FoodTruckGame.createGame(['A','B']);show('journey')});
   await p.locator('.route-round-open').nth(i).focus();await p.keyboard.press('Enter');
   assert.equal(await p.locator('#round-transition').isVisible(),true,`lien ${i+1}`);
   await p.locator('#round-start').click();await p.evaluate(()=>show('journey'));
   assert.equal(await p.locator('#route-truck span').innerText(),'AU DÉPART');
   assert.equal(await p.locator('.route-stop.active .stop-number').count(),0); // Les états suivent les manches terminées, comme auparavant.
  }
  // État « En cours » et association numéro/titre conservés par le rendu public.
  await p.evaluate(()=>renderRoute({current:3,completed:[0,1,2]}));
  assert.equal(await p.locator('.route-stop.active small').innerText(),'En cours');
  console.log(`Carnet ${width}×${height} : 7 états de progression, sauvegarde, cartouches/06/camion sans chevauchement, 6 liens clavier et absence de défilement OK`);
 }
 assert.deepEqual(errors,[]);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
