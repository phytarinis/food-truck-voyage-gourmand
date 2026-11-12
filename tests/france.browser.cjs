const continueTravel=require('./helpers/continue-travel.cjs');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'});const errors=[];
 p.on('pageerror',e=>errors.push(e.message));const url=process.env.FRANCE_TEST_URL||'http://127.0.0.1:8007';
 const scores=()=>p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers]));
 const response=async(t,correct)=>{await p.locator(`#france-panels button[data-team="${t}"][data-correct="${correct}"]`).click();await p.locator('#france-confirm-answer').click()};
 const common=async()=>{const texts=await p.locator('#france-panels .sauce-current-clue').allTextContents();assert.equal(texts.length,2);assert.equal(texts[0],texts[1]);};
 const choose=async(code)=>{
  const point=await p.evaluate(code=>{const r=FranceRegions.find(r=>r.code===code),path=document.querySelector(`#france-map-board path[data-region="${code}"]`);const v=new DOMPoint(...r.center).matrixTransform(path.getScreenCTM());return {x:v.x,y:v.y}},code);
  // A real pointer click at the projected geographic center, not dispatchEvent.
  await p.mouse.click(point.x,point.y);
  assert.equal(await p.evaluate(()=>game.france.location.choices[game.france.location.activeTeam]),code,`clic sur région ${code}`);
 };
 const checkPhoto=async(id,author,license)=>{
  await p.locator('#france-photo img').evaluate(i=>i.decode());
  assert.equal(await p.locator('#france-photo').getAttribute('data-specialty'),id);
  assert.equal(await p.locator('#france-photo img').evaluate(i=>getComputedStyle(i).objectFit),'contain');
  assert.equal(await p.locator('#france-photo img').getAttribute('src'),await p.evaluate(id=>FrancePhotos[id].src,id));
  assert.match(await p.locator('#france-photo figcaption').innerText(),new RegExp(author));
  assert.match(await p.locator('#france-photo figcaption').innerText(),/sans retouche ni recadrage/);
  assert.equal(await p.locator('#france-photo figcaption a').nth(1).getAttribute('href'),license);
  await p.locator('#photo-credits-open').click();
  assert.match(await p.locator('#photo-credits-content').innerText(),new RegExp(author));
  if(id==='choucroute')assert.doesNotMatch(await p.locator('#photo-credits-content').innerText(),/Arnaud|Benoît/);
  if(id==='galette')assert.doesNotMatch(await p.locator('#photo-credits-content').innerText(),/Benoît/);
  await p.locator('#photo-credits-close').click();
 };
 const overflow=async(label)=>assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,label);
 const back=()=>p.locator('section:not([hidden]) .france-back').click();
 const reopen=()=>p.locator('.route-stop:nth-child(3) button').click();
 await p.addInitScript(()=>localStorage.removeItem('voyage-gourmand:partie:v1'));await p.goto(url);await p.locator('#onward').click();await p.locator('#team-one').fill('Corail');await p.locator('#team-two').fill('Sauge');await p.locator('#team-form button').click();await p.locator('#rules-next').click();
 assert.equal(await p.locator('.route-round-open').count(),6);assert.equal(await p.locator('.route-stop:nth-child(6) button').count(),1);await reopen();
 await p.screenshot({path:'/tmp/france-intro-1366.png',fullPage:true});await p.locator('#france-begin').click();await common();await p.locator('#photo-credits-open').click();assert.doesNotMatch(await p.locator('#photo-credits-content').innerText(),/Brücke|Arnaud|Benoît/);await p.locator('#photo-credits-close').click();
 await response(0,false);assert.equal(await p.locator('#france-next-clue').isVisible(),false);assert.equal(await p.evaluate(()=>game.france.clueIndex),0);assert.equal(await p.locator('#france-answer').isVisible(),false);
 await response(1,true);assert.equal(await p.locator('#france-next-clue').isVisible(),true);assert.deepEqual(await scores(),[[0,2],[20,2]]);await common();
 await p.locator('#france-next-clue').click();assert.equal(await p.evaluate(()=>game.france.clueIndex),1);assert.equal(await p.locator('#france-panels button[data-team="1"]:disabled').count(),2);
 await back();await reopen();await response(0,true);assert.equal(await p.locator('#france-answer').isVisible(),true);assert.match(await p.locator('#france-answer-title').innerText(),/choucroute/);assert.deepEqual(await scores(),[[15,2],[20,2]]);
 await p.locator('#france-open-map').click();assert.equal(await p.locator('.france-region').count(),18);assert.equal(await p.locator('.france-inset').count(),5);assert.equal(await p.locator('#france-reveal-region').isVisible(),false);assert.equal(await p.locator('.france-region.is-correct').count(),0);
 // Check the geographical click target of every mainland and overseas region.
 for(const code of await p.evaluate(()=>FranceRegions.map(r=>r.code)))await choose(code);
 await choose('44');assert.equal(await p.locator('.france-flag.team-0').count(),1);await p.locator('#france-lock-flag').click();
 assert.equal(await p.locator('.france-flag').count(),0);assert.equal(await p.locator('.france-region.is-selected').count(),0);assert.doesNotMatch(await p.locator('#france-map-choice').innerText(),/Grand Est/);assert.equal(await p.locator('.france-region[aria-pressed="true"]').count(),0);
 await back();await reopen();assert.equal(await p.locator('.france-flag.team-0').count(),0);assert.doesNotMatch(await p.locator('#france-map-choice').innerText(),/Grand Est/);
 // Keyboard selection and visible focus are supported on the actual region path.
 await p.locator('.france-region[data-region="44"]').focus();await p.keyboard.press('Space');assert.equal(await p.evaluate(()=>game.france.location.choices[1]),'44');
 assert.equal(await p.locator('.france-flag.team-1').count(),1);await p.locator('#france-lock-flag').click();
 assert.equal(await p.locator('.france-flag').count(),2);const boxes=await p.locator('.france-flag').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right}}));assert.ok(boxes[0].right<boxes[1].left);
 assert.equal(await p.locator('.france-region.is-correct').count(),0);assert.deepEqual(await scores(),[[15,2],[20,2]]);
 await p.screenshot({path:'/tmp/france-drapeaux-1366.png',fullPage:true});await p.locator('#france-reveal-region').click();
 assert.equal(await p.locator('.france-region.is-correct').getAttribute('data-region'),'44');assert.equal(await p.locator('.france-flag').count(),2);assert.deepEqual(await scores(),[[20,2],[25,2]]);
 assert.equal(await p.evaluate(()=>FranceGame.revealLocation(game)),false);await back();await reopen();assert.deepEqual(await scores(),[[20,2],[25,2]]);await p.locator('#france-discover').click();assert.match(await p.locator('#france-fact').innerText(),/Alsace/);await p.locator('#france-photo img').evaluate(i=>i.decode());assert.equal(await p.locator('#france-photo img').evaluate(i=>getComputedStyle(i).objectFit),'contain');assert.equal(await p.locator('#france-photo img').count(),1);await checkPhoto('choucroute','Brücke-Osteuropa','https://creativecommons.org/publicdomain/zero/1.0/');await p.screenshot({path:'/tmp/france-photo-choucroute.png',fullPage:true});
 await continueTravel(p,'#france-next');
 // Both teams find at the same clue; one wrong flag, no penalty.
 await response(0,true);assert.equal(await p.locator('#france-answer').isVisible(),false);await response(1,true);await p.locator('#france-open-map').click();await choose('53');await p.locator('#france-lock-flag').click();await choose('75');await p.locator('#france-lock-flag').click();await p.locator('#france-reveal-region').click();assert.deepEqual(await scores(),[[45,2],[45,2]]);await p.locator('#france-discover').click();await checkPhoto('galette','Arnaud 25','https://creativecommons.org/licenses/by-sa/4.0/');await p.screenshot({path:'/tmp/france-photo-galette.png',fullPage:true});await continueTravel(p,'#france-next');
 // Neither finds after three clues; both can still win the location points.
 for(let clue=0;clue<3;clue++){await response(0,false);assert.equal(await p.locator('#france-next-clue').isVisible(),false);await response(1,false);if(clue<2)await p.locator('#france-next-clue').click();}
 await p.locator('#france-open-map').click();await choose('04');await p.locator('#france-lock-flag').click();await choose('04');await p.locator('#france-lock-flag').click();await p.locator('#france-reveal-region').click();assert.deepEqual(await scores(),[[50,2],[50,2]]);await p.locator('#france-discover').click();assert.match(await p.locator('#france-fact').innerText(),/océan Indien/);await checkPhoto('rougail','Benoît Prieur','https://creativecommons.org/publicdomain/zero/1.0/');await p.screenshot({path:'/tmp/france-photo-rougail.png',fullPage:true});await continueTravel(p,'#france-next');
 assert.equal(await p.locator('#france-bonus').isVisible(),true);assert.equal(await p.locator('#france-bonus-reveal').isDisabled(),true);assert.equal(await p.locator('#france-bonus-answer').isVisible(),false);
 await p.locator('input[name=france-bonus-choice]').nth(0).check();assert.equal(await p.locator('#france-bonus-answer').isVisible(),false);await p.locator('#france-bonus-reveal').click();assert.match(await p.locator('#france-bonus-solution').innerText(),/^B\. 67/);assert.match(await p.locator('#france-bonus-reference').innerText(),/1er janvier 2026/);assert.equal(await p.locator('#france-bonus-reference a').getAttribute('href'),'https://www.insee.fr/fr/statistiques/5225246');assert.deepEqual(await scores(),[[50,2],[50,2]]);await p.screenshot({path:'/tmp/france-bonus-1366.png',fullPage:true});
 await back();await reopen();assert.equal(await p.locator('#france-bonus-answer').isVisible(),true);await p.locator('#france-bonus-finish').click();assert.equal(await p.locator('#france-end .scoreboard .score-points').count(),2);await p.locator('#france-career').click();assert.match(await p.locator('#career-progress').innerText(),/RÉCEPTIONNISTE/);await p.locator('input[name=career-choice]').nth(0).check();await p.locator('#career-reveal').click();await p.locator('#career-continue').click();assert.equal(await p.locator('.route-stop:nth-child(3).complete').count(),1);assert.match(await p.locator('#route-truck span').innerText(),/3/);assert.equal(await p.locator('.route-stop:nth-child(6) button').count(),1);assert.deepEqual(await scores(),[[50,2],[50,2]]);
 // Responsive checks for every new screen and actual map interactions.
 for(const [width,height]of [[1920,1080],[1366,768],[1024,768],[390,844],[320,640]]){
  await p.setViewportSize({width,height});await p.goto(url);await p.evaluate(()=>{game=FoodTruckGame.createGame(['Équipe corail','Équipe sauge']);openFrance()});await overflow(`intro${width}`);await p.locator('#france-begin').click();await overflow(`recherche${width}`);
  await response(0,true);await response(1,true);await overflow(`révélation${width}`);await p.locator('#france-open-map').click();await overflow(`carte${width}`);
  // Scroll map into view on small screens before real clicks.
  await p.locator('.france-region[data-region="44"]').scrollIntoViewIfNeeded();await choose('44');await p.locator('#france-lock-flag').click();await p.locator('.france-region[data-region="44"]').scrollIntoViewIfNeeded();await choose('44');await p.locator('#france-lock-flag').click();await p.locator('#france-reveal-region').click();await overflow(`drapeaux${width}`);
  await p.screenshot({path:`/tmp/france-carte-${width}.png`,fullPage:true});await p.locator('#france-discover').click();await overflow(`culture${width}`);await p.locator('#france-photo img').evaluate(i=>i.decode());
  // Reach bonus/end without retesting all search combinations at every size.
  await p.evaluate(()=>{FranceGame.next(game);for(let q=1;q<3;q++){for(let t=0;t<2;t++)FranceGame.validate(game,t,true,FranceGame.token(game,t));FranceGame.startLocation(game);for(let t=0;t<2;t++){const token=FranceGame.locationToken(game);FranceGame.chooseRegion(game,FranceGame.puzzles[q].region,token);FranceGame.lockFlag(game,token);}FranceGame.revealLocation(game);FranceGame.discover(game);FranceGame.next(game);}renderFrance()});
  await overflow(`bonus${width}`);await p.locator('input[name=france-bonus-choice]').nth(1).check();await p.locator('#france-bonus-reveal').click();await overflow(`bonus révélé${width}`);await p.locator('#france-bonus-finish').click();await overflow(`bilan${width}`);console.log('Parcours manche 3 et affichage :',width,height);
 }
 await p.locator('#reset').click();await p.locator('#confirm-reset').click();assert.equal(await p.evaluate(()=>game),null);assert.equal(await p.locator('#welcome').isVisible(),true);assert.deepEqual(errors,[]);await browser.close();console.log('Indices, 18 zones, confidentialité, drapeaux, +5 uniques, bonus, reprise, réception, reset : OK');
})().catch(e=>{console.error(e);process.exit(1)});
