const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{for(const [width,height] of [[1366,768],[1280,720]]){
 const p=await browser.newPage({viewport:{width,height}});await p.goto(process.env.SPICY_TEST_URL||'http://127.0.0.1:8008');
 await p.evaluate(()=>{game=FoodTruckGame.createGame(['Corail','Sauge']);for(const key of SpicyGame.roundKeys)game[key]={phase:'complete',results:[]};scores();show('journey')});
 await p.locator('#spicy-open').click();await p.locator('#spicy-final-play').click();
 assert.deepEqual(await p.locator('#spicy-question-options label').allTextContents(),['Piment Tornade','Piment Volcan','Piment Panique','Piment Bazooka']);
 assert.doesNotMatch(await p.locator('#spicy-setup').innerText(),/Cambodge|Pérou|Chine|œufs|scorpion|mygale/i);
 assert.equal(await p.locator('#spicy-setup img').count(),0);
 await p.locator('input[name=spicy-question-choice]').first().check();await p.locator('#spicy-launch').click();
 assert.match(await p.locator('#spicy-question').innerText(),/Cambodge/);
 await p.evaluate(()=>{game=FoodTruckGame.createGame(['Corail','Sauge']);GpsGame.start(game);game.gps.phase='bonus';renderGps()});
 assert.equal(await p.locator('#gps-bonus figure').isVisible(),false);
 await p.locator('input[name=gps-bonus-choice]').nth(1).check();await p.locator('#gps-bonus-reveal').click();
 assert.equal(await p.locator('#gps-bonus figure').isVisible(),true);
 assert.match(await p.locator('#gps-bonus figure img').getAttribute('alt'),/Garonne et Dordogne.*bec d’Ambès.*Gironde.*Atlantique/);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),true,`schéma sans défilement ${width}`);
 await p.screenshot({path:`/tmp/gironde-schema-${width}.png`});
 await p.close();
 }console.log('Choix sans indice et révélation après lancement : 2 résolutions OK');}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
