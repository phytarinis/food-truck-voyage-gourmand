// Playwright et Chromium ne sont requis que pour les tests navigateur.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  const p=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(process.env.CAREER_TEST_URL || 'http://127.0.0.1:8000');
  for(let job=0;job<5;job++)for(let choice=0;choice<3;choice++){
    // Test du composant réutilisable, sans simuler l’achèvement d’une manche.
    await p.evaluate(index=>{game=FoodTruckGame.createGame(['Corail','Sauge']);game.teams[0].score=30;game.teams[1].score=15;openCareerPause(index)},job);
    assert.equal(await p.locator('.career-card').count(),3);
    assert.equal(await p.locator('#career-quote').isVisible(),false);
    assert.equal(await p.locator('#career-quote').innerText(),'');
    assert.equal(await p.locator('.partners .partner-logo').count(),3);
    assert.equal(await p.locator('.career-card').evaluateAll(cards=>cards.every((card,i)=>i===0||card.getBoundingClientRect().top>=cards[i-1].getBoundingClientRect().bottom)),true);
    assert.equal(await p.locator('#career-reveal').isDisabled(),true);
    assert.equal(await p.locator('#career-explanation').innerText(),'');
    assert.equal(await p.locator('.career-verdict').count(),0);
    await p.locator(`input[name="career-choice"][value="${choice}"]`).check();
    await p.locator('#career-reveal').click();
    assert.equal(await p.locator('.career-card.is-myth').count(),1);
    assert.equal(await p.locator('.career-card.is-truth').count(),2);
    assert.equal(await p.locator('.career-facts li').count(),3);
    assert.equal(await p.locator('#career-continue').isVisible(),true);assert.equal(await p.locator('#career-quote').isVisible(),true);assert.equal(await p.locator('#career-quote').innerText(),await p.evaluate(()=>CareerPauses.jobs[currentCareerIndex].quote));
    assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers])),[[30,2],[15,2]]);
    await p.locator('#career-continue').click();
    assert.equal(await p.locator('.route-stop.pending').count(),6);
    await p.evaluate(index=>openCareerPause(index),job);
    assert.equal(await p.locator('#career-revelation').isVisible(),true);
    assert.equal(await p.locator('#career-reveal').isVisible(),false);
    assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers])),[[30,2],[15,2]]);
  }
  for(const [width,height]of [[1920,1080],[1366,768],[1024,768],[390,844],[320,640]]){
    await p.setViewportSize({width,height});
    for(let index=0;index<5;index++){
      await p.evaluate(index=>{game=FoodTruckGame.createGame(['Corail','Sauge']);openCareerPause(index)},index);
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`question ${index} ${width}`);
      await p.locator('input[name="career-choice"][value="0"]').focus();
      await p.keyboard.press('ArrowRight');
      assert.equal(await p.locator('input[name="career-choice"]:checked').count(),1);
      await p.locator('#career-reveal').focus();await p.keyboard.press('Enter');
      assert.equal(await p.locator('#career-revelation').isVisible(),true);assert.equal(await p.locator('#career-quote').isVisible(),true);
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`révélation ${index} ${width}`);
      if(width===1366){await p.evaluate(()=>window.scrollTo(0,0));assert.ok(await p.locator('#career-continue').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight),`bouton visible ${index}`);}
      if(width===1366&&index===0)await p.screenshot({path:'/tmp/pause-serveur-revelee.png',fullPage:true});
      if(width===1366&&index===2)await p.screenshot({path:'/tmp/pause-reception-revelee.png',fullPage:true});
    }
    console.log('Pauses métiers :',width,height);
  }
  await p.locator('#reset').click();await p.locator('#confirm-reset').click();
  assert.equal(await p.locator('#welcome').isVisible(),true);
  assert.equal(await p.evaluate(()=>game),null);
  assert.deepEqual(errors,[]);await browser.close();
  console.log('15 choix, cinq révélations, répétitions, clavier, scores/jokers et réinitialisation : OK.');
})().catch(e=>{console.error(e);process.exit(1)});
