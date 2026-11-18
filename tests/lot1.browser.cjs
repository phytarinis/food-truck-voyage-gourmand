const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),p=await b.newPage({reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.GAME_TEST_URL||'http://127.0.0.1:8008');
 const fit=async label=>assert.equal(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth),true,label);
 const titles=['Deux équipes, un seul camion !','Six manches pour voyager','Des points à chaque escale','Deux piments par équipe'];
 for(const [width,height]of[[1280,720],[1366,768]]){
  await p.setViewportSize({width,height});await p.evaluate(()=>{game=FoodTruckGame.createGame(['Corail','Sauge']);show('rules')});
  assert.deepEqual(await p.locator('#rules .rule-card h2').allTextContents(),titles);
  assert.equal(await p.locator('#rules .rule-icon').count(),4);assert.equal(await p.locator('#rules button').count(),1);
  assert.equal(await p.locator('.rules-finale').innerText(),'Attachez vos ceintures… ça risque de secouer les casseroles !');
  assert.doesNotMatch(await p.locator('#rules').innerText(),/Notez|Écrivez|saisir/);
  const boxes=await p.locator('#rules .rule-card').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));
  assert.equal(boxes[0].y,boxes[1].y);assert.equal(boxes[2].y,boxes[3].y);assert.ok(boxes[2].y>boxes[0].y);
  await fit(`règles ${width}`);await p.locator('#rules-next').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('#journey').isVisible(),true);
  const baseRoad=await p.locator('.board-art .road-edge').getAttribute('d');
  for(let count=0;count<=6;count++){
   await p.evaluate(count=>{
    game=FoodTruckGame.createGame(['Corail','Sauge']);
    RoundTransitions.rounds.forEach((r,i)=>{if(i<count)game[r.key]={phase:'complete',results:[]};});
    show('journey');
   },count);
   assert.equal(await p.locator('#route-truck span').innerText(),count?`ESCALE ${count}`:'AU DÉPART');
   assert.equal(await p.locator('.next-stop-label').count(),count<6?1:0);
   if(count<6){
    assert.equal(await p.locator('.route-stop.is-next .stop-number').innerText(),String(count+1).padStart(2,'0'));
    const collisions=await p.evaluate(()=>{const badge=document.querySelector('.next-stop-label'),a=badge.getBoundingClientRect();return [...document.querySelectorAll('.route-stop:not(.is-next) h2,.route-stop:not(.is-next) .stop-number,.route-truck')].filter(e=>{const c=e.getBoundingClientRect();return a.left<c.right&&a.right>c.left&&a.top<c.bottom&&a.bottom>c.top}).length;});
    assert.equal(collisions,0,`prochaine escale ${count+1}: ${width}`);
   }
   assert.equal(await p.locator('.board-art .road-edge').getAttribute('d'),baseRoad);
   await fit(`carnet ${count} ${width}`);await p.reload();assert.equal(await p.locator('#route-truck span').innerText(),count?`ESCALE ${count}`:'AU DÉPART');
   assert.equal(await p.locator('.next-stop-label').count(),count<6?1:0);
  }
  for(let i=0;i<5;i++){
   await p.evaluate(i=>{game=FoodTruckGame.createGame(['A','B']);openCareerPause(i);const s=game.careerPauses[i];CareerPauses.select(s,0);CareerPauses.reveal(s);renderCareerPause();},i);
   const button=p.locator('#career-continue');assert.equal(await button.innerText(),'Carnet de route');assert.equal(await button.locator('.route-back-icon').count(),1);
   assert.equal(await button.evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight),true,`pause ${i+1} ${width}`);
   await button.click();assert.equal(await p.locator(i<2?'#round-transition':'#journey').isVisible(),true);
  }
  console.log(`Lot 1 : règles, parcours 01–06, repère dynamique, sauvegarde et cinq pauses ${width}×${height} OK`);
 }
 // Ne pas confondre une transition ou un défi intermédiaire avec une manche terminée.
 await p.evaluate(()=>{game=FoodTruckGame.createGame(['A','B']);show('journey')});await p.locator('.route-round-open').first().click();
 assert.equal(await p.locator('#round-start .action-van').count(),0);await p.locator('#round-start').click();
 await p.evaluate(()=>show('journey'));assert.equal(await p.locator('#route-truck span').innerText(),'AU DÉPART');
 await p.evaluate(()=>{game.apero.index=1;show('journey')});assert.equal(await p.locator('#route-truck span').innerText(),'AU DÉPART');
 // Les validations orales gardent leurs couleurs fonctionnelles, hors navigation.
 await p.evaluate(()=>{SauceGame.start(game);SauceGame.begin(game);renderSauce()});
 const good=p.locator('#sauce-response-controls [data-correct="true"]'),bad=p.locator('#sauce-response-controls [data-correct="false"]');
 assert.equal(await good.getAttribute('class'),'primary');assert.equal(await bad.getAttribute('class'),'secondary');
 assert.notEqual(await good.evaluate(e=>getComputedStyle(e).backgroundColor),await bad.evaluate(e=>getComputedStyle(e).backgroundColor));
 assert.equal(await p.locator('main button .action-van,main button use[href="#truck-art"]').count(),0);
 assert.equal(await p.locator('#final-new-game').getAttribute('class'),'primary progress-action');
 assert.equal(await p.locator('#final-review').getAttribute('class'),'secondary progress-action');
 assert.deepEqual(await p.locator('.board-art .route-direction-arrow').evaluateAll(es=>es.map(e=>[e.dataset.from,e.dataset.to])),[['1','2'],['2','3'],['3','4'],['4','5'],['5','6']]);
 assert.deepEqual(errors,[]);await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
