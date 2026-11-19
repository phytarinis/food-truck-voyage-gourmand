const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),expected=require('./fixtures/career-pedagogy.json');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
 const p=await b.newPage({reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const url=process.env.CAREER_TEST_URL||'http://127.0.0.1:8040',instruction='Quelle affirmation vous semble fausse ? Discutez-en avant de choisir !';
 const fit=async label=>assert.equal(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth),true,label);
 const portraitReady=()=>p.evaluate(async()=>{const image=document.querySelector('#career-portrait img');if(image)await image.decode();else{const decoded=new Image();decoded.src=document.querySelector('#companion-art image').getAttribute('href');await decoded.decode();}await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))});
 const score=()=>p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers]));
 const captureDir=process.env.CAREER_CAPTURE_DIR||'docs/validation-pauses-metiers';fs.mkdirSync(captureDir,{recursive:true});
 for(const[width,height]of[[1366,768],[1280,720]]){
  await p.setViewportSize({width,height});await p.goto(url);
  for(let i=0;i<5;i++){
   await p.evaluate(i=>{localStorage.clear();game=FoodTruckGame.createGame(['Corail','Sauge']);game.teams[0].score=85;game.teams[1].score=70;game.teams[0].jokers=1;RoundTransitions.rounds.forEach((r,n)=>{if(n<=i)game[r.key]={phase:'complete',results:[]}});openCareerPause(i)},i);
   assert.equal(await p.locator('#career-title').innerText(),'Deux vérités, une idée reçue !');
   assert.equal(await p.locator('#career-job-label').innerText(),`PAUSE MÉTIER ${i+1} — ${expected[i].name.toLocaleUpperCase('fr')}`);
   assert.equal(await p.locator('#career-instruction').innerText(),instruction);assert.equal(await p.locator('#career-instruction').isVisible(),true);
   assert.deepEqual(await p.locator('.career-statement').allTextContents(),expected[i].statements);
   assert.deepEqual(await p.locator('.career-letter').allTextContents(),['A','B','C']);
   assert.equal(await p.locator('.career-verdict,.career-card.is-myth').count(),0);assert.equal(await p.locator('#career-explanation').textContent(),'');assert.equal(await p.locator('#career-quote').isVisible(),false);
   const illustration=await p.evaluate(i=>({expected:CareerIllustrations[i].src,actual:document.querySelector('#career-portrait img')?.getAttribute('src')}),i);if(illustration.expected){assert.equal(illustration.actual,illustration.expected);await p.locator('#career-portrait img').evaluate(e=>e.decode());}else{assert.equal(await p.locator('#career-portrait use').getAttribute('href'),'#companion-art');}
   await portraitReady();await fit(`question ${i+1} ${width}`);await p.screenshot({path:`${captureDir}/pause-${i+1}-question-${width}.png`});
   // Un choix collectif se conserve avant révélation ; reprise par la manche terminée.
   await p.locator('input[name=career-choice]').nth(expected[i].falseIndex).check();await p.reload();await p.locator('.route-round-open').nth(i).click();
   assert.equal(await p.locator('#career-pause').isVisible(),true);assert.equal(await p.locator('input[name=career-choice]:checked').inputValue(),String(expected[i].falseIndex));assert.equal(await p.locator('.career-verdict').count(),0);
   await p.locator('#career-reveal').focus();await p.keyboard.press('Enter');
   assert.equal(await p.locator('.career-card.is-myth input').inputValue(),String(expected[i].falseIndex));assert.equal(await p.locator('.career-card.is-truth').count(),2);
   assert.equal(await p.locator('#career-explanation').innerText(),expected[i].explanation);assert.equal(await p.locator('#career-instruction').isVisible(),false);assert.equal(await p.locator('#career-quote').isVisible(),true);
   assert.deepEqual(await score(),[[85,1],[70,2]]);await portraitReady();await fit(`correction ${i+1} ${width}`);await p.screenshot({path:`${captureDir}/pause-${i+1}-correction-${width}.png`});
   await p.reload();await p.locator('.route-round-open').nth(i).click();assert.equal(await p.locator('#career-revelation').isVisible(),true);assert.deepEqual(await score(),[[85,1],[70,2]]);
   await p.locator('#career-continue').click();
   if(i>=2){assert.equal(await p.locator('#journey').isVisible(),true);await p.locator('.route-round-open').nth(i+1).click();}
   assert.equal(await p.locator('#round-transition').isVisible(),true);await p.locator('#round-start').click();
   const key=['sauce','france','gps','passport','world'][i];assert.equal(await p.evaluate(key=>Boolean(game[key]),key),true,`manche suivante ${key}`);assert.deepEqual(await score(),[[85,1],[70,2]]);
  }
  console.log(`Pauses métiers ${width}×${height} : textes exacts, B/C/A/B/B, consigne, illustrations, aucun indice/point/joker, reprises, cinq transitions et sans défilement OK`);
 }
 assert.deepEqual(errors,[]);
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
