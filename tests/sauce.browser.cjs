const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const url=process.env.SAUCE_TEST_URL||'http://127.0.0.1:8000';
 const open=()=>p.locator('.route-stop:nth-child(2) .route-round-open').click();
 const back=()=>p.locator('section:not([hidden]) .sauce-back').click();
 const response=async(team,correct)=>{await p.locator(`#sauce-panels button[data-team="${team}"][data-correct="${correct}"]`).click();await p.locator('#sauce-confirm-answer').click()};
 const common=async()=>{const clues=await p.locator('.sauce-current-clue').allTextContents();assert.equal(clues.length,2);assert.equal(clues[0],clues[1]);};
 const advance=async()=>{
  assert.equal(await p.locator('#sauce-next-clue').isVisible(),true);
  if(p.viewportSize().width===1366){await p.evaluate(()=>window.scrollTo(0,0));assert.ok(await p.locator('#sauce-next-clue').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight));}
  const token=await p.evaluate(()=>SauceGame.nextClueToken(game));
  await p.locator('#sauce-next-clue').click();assert.equal(await p.locator('#sauce-next-clue').isVisible(),false);
  assert.equal(await p.evaluate(stamp=>SauceGame.revealNextClue(game,stamp),token),false);await common();
 };
 await p.goto(url);await p.locator('#onward').click();await p.locator('#team-one').fill('Corail');await p.locator('#team-two').fill('Sauge');await p.locator('#team-form button').click();await p.locator('#rules-next').click();
 assert.equal(await p.locator('.route-round-open').count(),5);await open();await p.locator('#sauce-begin').click();await common();
 assert.equal(await p.locator('#sauce-search input').count(),0);assert.equal(await p.locator('#sauce-next-clue').isVisible(),false);
 await p.locator('#photo-credits-open').click();assert.doesNotMatch(await p.locator('#photo-credits-content').innerText(),/foie gras|chocolatine|huîtres/i);await p.locator('#photo-credits-close').click();
 await p.locator('button[data-team="0"][data-correct="false"]').click();await p.locator('#sauce-cancel').click();assert.equal(await p.evaluate(()=>game.sauce.clueIndex),0);
 // L’exemple demandé : corail se trompe, sauge n’a pas encore répondu.
 await response(0,false);assert.equal(await p.evaluate(()=>game.sauce.clueIndex),0);
 assert.equal(await p.locator('button[data-team="0"]:disabled').count(),2);assert.equal(await p.locator('button[data-team="1"]:enabled').count(),2);
 assert.equal(await p.locator('#sauce-next-clue').isVisible(),false);await common();
 assert.doesNotMatch(await p.locator('#sauce-search').innerText(),/pain d'épices/);
 await p.screenshot({path:'/tmp/sauce-attente-indice1.png',fullPage:true});
 await response(1,true);assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>t.score)),[0,20]);
 assert.equal(await p.evaluate(()=>game.sauce.clueIndex),0);assert.equal(await p.locator('#sauce-next-clue').isVisible(),true);
 assert.equal(await p.locator('#sauce-correction').isVisible(),false);await common();await advance();
 assert.equal(await p.evaluate(()=>game.sauce.clueIndex),1);assert.equal(await p.locator('button[data-team="1"]:disabled').count(),2);
 await back();await open();assert.equal(await p.evaluate(()=>game.sauce.clueIndex),1);await common();
 await response(0,false);assert.equal(await p.evaluate(()=>game.sauce.clueIndex),1);await advance();
 assert.equal(await p.locator('#sauce-panels .team-0 .sauce-history li').count(),2);await common();
 assert.equal(await p.locator('#sauce-correction').isVisible(),false);assert.doesNotMatch(await p.locator('#sauce-search').innerText(),/foie gras/i);
 await response(0,true);assert.match(await p.locator('#sauce-correction-title').innerText(),/foie gras/);assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>t.score)),[10,20]);
 await p.locator('#photo-credits-open').click();assert.match(await p.locator('#photo-credits-content').innerText(),/rhosoi/);assert.doesNotMatch(await p.locator('#photo-credits-content').innerText(),/Ariane|Wilfredor/);await p.locator('#photo-credits-close').click();
 await p.locator('#sauce-photo>img').evaluate(i=>i.decode());assert.equal(await p.locator('#sauce-photo>img').evaluate(i=>getComputedStyle(i).objectFit),'contain');
 await back();await open();assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>t.score)),[10,20]);
 // Une équipe trouve au premier indice, l’autre échoue aux trois.
 await p.locator('#sauce-next').click();await response(0,true);
 for(let level=0;level<3;level++){await response(1,false);if(level<2){assert.equal(await p.evaluate(()=>game.sauce.clueIndex),level);await advance();}}
 assert.match(await p.locator('#sauce-solution').innerText(),/chocolatine \/ pain au chocolat/);
 assert.match(await p.locator('#sauce-photo figcaption').innerText(),/Illustration générée par intelligence artificielle/);assert.doesNotMatch(await p.locator('#sauce-photo figcaption').innerText(),/Ariane|CC BY-SA/);
 assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>t.score)),[30,20]);
 // Deux équipes échouent : aucune révélation avant la deuxième réponse.
 await p.locator('#sauce-next').click();
 for(let level=0;level<3;level++){
  await response(0,false);assert.equal(await p.evaluate(()=>game.sauce.clueIndex),level);assert.equal(await p.locator('#sauce-next-clue').isVisible(),false);assert.equal(await p.locator('#sauce-correction').isVisible(),false);
  await response(1,false);if(level<2){assert.equal(await p.evaluate(()=>game.sauce.clueIndex),level);await advance();}
 }
 assert.equal(await p.locator('#sauce-map').isVisible(),true);await p.locator('#sauce-map img').evaluate(i=>i.decode());
 await p.locator('#photo-credits-open').click();const credits=await p.locator('#photo-credits-content').innerText();assert.match(credits,/Illustration générée par intelligence artificielle/);assert.match(credits,/Wilfredor/);assert.match(credits,/rhosoi/);assert.doesNotMatch(credits,/Ariane|CC BY-SA/);assert.equal(await p.locator('#photo-credits-content a').count(),4);await p.locator('#photo-credits-close').click();
 // Bonus et pause métier conservés.
 await p.locator('#sauce-next').click();assert.equal(await p.locator('#sauce-bonus').isVisible(),true);assert.equal(await p.locator('#sauce-bonus-reveal').isDisabled(),true);assert.equal(await p.locator('#sauce-bonus-discovery').isVisible(),false);
 await back();assert.equal(await p.locator('.route-stop:nth-child(2).complete').count(),0);await open();
 await p.locator('input[name="sauce-bonus-choice"][value="1"]').check();await p.locator('#sauce-bonus-reveal').click();assert.match(await p.locator('#sauce-bonus-solution').innerText(),/^A\./);await p.locator('#sauce-bonus-discovery img').evaluate(i=>i.decode());assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers])),[[30,2],[20,2]]);
 await back();await open();assert.equal(await p.locator('#sauce-bonus-answer').isVisible(),true);await p.locator('#sauce-bonus-finish').click();assert.match(await p.locator('#sauce-totals').innerText(),/30 \/ 60/);
 await p.locator('#sauce-career').click();assert.match(await p.locator('#career-progress').innerText(),/CUISINIER/);await p.locator('input[name=career-choice]').nth(2).check();await p.locator('#career-reveal').click();await p.locator('#career-continue').click();assert.equal(await p.locator('.route-stop:nth-child(2).complete').count(),1);assert.equal(await p.locator('.route-stop:nth-child(6) button').count(),0);assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers])),[[30,2],[20,2]]);
 await open();assert.equal(await p.locator('#sauce-end').isVisible(),true);await p.locator('#reset').click();await p.locator('#cancel-reset').click();assert.equal(await p.locator('#sauce-end').isVisible(),true);await p.locator('#reset').click();await p.locator('#confirm-reset').click();assert.equal(await p.locator('#welcome').isVisible(),true);assert.equal(await p.evaluate(()=>game),null);
 for(const [width,height]of [[1920,1080],[1366,768],[1024,768],[390,844],[320,640]]){
  await p.setViewportSize({width,height});await p.goto(url);await p.evaluate(()=>{game=FoodTruckGame.createGame(['Corail','Sauge']);openSauce()});await p.locator('#sauce-begin').click();
  for(let puzzle=0;puzzle<3;puzzle++){
   await response(0,true);await response(1,false);await common();await advance();await response(1,false);await advance();
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`recherche ${puzzle} ${width}`);await response(1,true);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`correction ${puzzle} ${width}`);await p.locator('#sauce-photo>img').evaluate(i=>i.decode());await p.locator('#sauce-next').click();
  }
  assert.equal(await p.locator('#sauce-bonus').isVisible(),true);const before=await p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers]));await p.locator('input[name="sauce-bonus-choice"]').nth(width%3).focus();await p.keyboard.press('Space');await p.locator('#sauce-bonus-reveal').click();assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers])),before);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.locator('#sauce-bonus-finish').click();assert.equal(await p.locator('#sauce-end').isVisible(),true);
  console.log('Indices synchronisés + bonus :',width,height);
 }
 assert.deepEqual(errors,[]);await browser.close();console.log('Attente, révélation explicite, recherche solo, scores, reprise, photos, bonus et réinitialisation : OK.');
})().catch(e=>{console.error(e);process.exit(1)});
