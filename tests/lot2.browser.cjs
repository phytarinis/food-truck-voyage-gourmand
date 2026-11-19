const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),p=await b.newPage({reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.GAME_TEST_URL||'http://127.0.0.1:8008');
 const fit=async label=>assert.equal(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth),true,label);
 for(const [width,height]of[[1280,720],[1366,768]]){
  await p.setViewportSize({width,height});await p.locator('.welcome-illustration').evaluate(i=>i.decode());await p.evaluate(()=>show('setup'));await fit(`équipes ${width}`);
  const logos=await p.locator('.setup-partners>img,.setup-heroine,.setup-e2c').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().x));assert.ok(logos[0]<logos[1]&&logos[1]<logos[2]);
  for(let index=0;index<3;index++){
   await p.evaluate(index=>{game=FoodTruckGame.createGame(['Corail','Sauge']);AperoGame.start(game);AperoGame.begin(game);for(let i=0;i<=index;i++){const d=AperoGame.deliveries[i];for(const t of[0,1]){AperoGame.choose(game,t,'department',d.department);AperoGame.choose(game,t,'number',d.number);}AperoGame.validate(game);if(i<index)AperoGame.next(game);}renderApero()},index);
   assert.equal(await p.locator('#delivery-solution .pedagogical-key').innerText(),['Dordogne','Charente-Maritime','Charente'][index]);await fit(`correction ville ${index} ${width}`);
  }
  for(const round of['sauce','france','passport'])for(let index=0;index<3;index++){
   await p.evaluate(({round,index})=>{game=FoodTruckGame.createGame(['Corail','Sauge']);const M={sauce:SauceGame,france:FranceGame,passport:PassportGame}[round];M.start(game);M.begin(game);game[round].puzzleIndex=index;({sauce:renderSauce,france:renderFrance,passport:renderPassport}[round])()}, {round,index});
   const screen=p.locator('.screen:not([hidden])');assert.ok(await screen.locator('.pedagogical-key').count()>0);await fit(`${round} indice ${index} ${width}`);
   assert.equal(await screen.locator('#passport-mystery-quote').count(),0);
   for(const clue of[1,2]){
    await p.evaluate(({round,clue})=>{const state=game[round];state.clueIndex=clue;state.players.forEach(player=>player.clueIndex=clue);({sauce:renderSauce,france:renderFrance,passport:renderPassport}[round])();},{round,clue});
    await fit(`${round} indice ${clue+1}/${index} ${width}`);
    if(round==='passport'&&index===2&&clue<2)assert.doesNotMatch(await p.locator('#passport-search').innerText(),/très, très saignante/);
   }
   await p.evaluate(round=>{const M={sauce:SauceGame,france:FranceGame,passport:PassportGame}[round];for(const t of[0,1])M.validate(game,t,true,M.token(game,t));({sauce:renderSauce,france:renderFrance,passport:renderPassport}[round])()},round);
   assert.ok(await p.locator('.screen:not([hidden]) .pedagogical-key').count()>0);await fit(`${round} correction ${index} ${width}`);
  }
  await p.evaluate(()=>{game=FoodTruckGame.createGame(['A','B']);GpsGame.start(game);game.gps.phase='bonus';renderGps()});
  assert.equal(await p.locator('#gps-bonus-diagram').isVisible(),false);
  for(const round of['sauce','france','gps']){
   await p.evaluate(round=>{game=FoodTruckGame.createGame(['A','B']);const M={sauce:SauceGame,france:FranceGame,gps:GpsGame}[round];M.start(game);game[round].phase='bonus';M.chooseBonus(game,0);M.revealBonus(game);({sauce:renderSauce,france:renderFrance,gps:renderGps}[round])()},round);
   await fit(`${round} défi corrigé ${width}`);
   if(round==='sauce'){assert.equal(await p.locator('#sauce-bonus-discovery .companion').count(),0);assert.match(await p.locator('#sauce-bonus-discovery img').getAttribute('src'),/comparaison/);}
   if(round==='france'){assert.equal(await p.locator('.bonus-population img').count(),1);assert.equal(await p.locator('#france-bonus .bonus-map').count(),0);}
   if(round==='gps')assert.match(await p.locator('#gps-bonus .bonus-map img').getAttribute('src'),/garonne-fleuve-riviere/);
  }
  for(let index=0;index<3;index++){
   await p.evaluate(index=>{game=FoodTruckGame.createGame(['A','B']);GpsGame.start(game);GpsGame.begin(game);for(let i=0;i<=index;i++){for(const t of[0,1]){if(i===1)for(const [label,slot]of ['c','a','b'].entries())GpsGame.placeRiver(game,label,slot,GpsGame.token(game));else GpsGame.placePoint(game,i===0?[.5,42.7]:[6.5,45.5],GpsGame.token(game));GpsGame.lock(game,GpsGame.token(game),performance.now());}GpsGame.reveal(game);if(i<index)GpsGame.next(game);}renderGps()},index);
   await fit(`GPS correction ${index} ${width}`);assert.ok(await p.locator('#gps-correction .pedagogical-key').count()>0);
  }
  for(let index=0;index<6;index++){
   await p.evaluate(index=>{game=FoodTruckGame.createGame(['A','B']);WorldGame.start(game);WorldGame.begin(game);game.world.index=index;for(const t of[0,1]){const token=WorldGame.token(game);WorldGame.choose(game,index===5?[-150,32]:WorldGame.challenges[index].continent,token);WorldGame.lock(game,token);}WorldGame.reveal(game);renderWorld()},index);
   await fit(`monde correction ${index} ${width}`);
  }
  for(let index=0;index<5;index++){
   await p.evaluate(index=>{game=FoodTruckGame.createGame(['A','B']);openCareerPause(index)},index);await p.locator('#career-portrait img').evaluate(i=>i.decode());await fit(`métier ${index} ${width}`);
   assert.equal(await p.locator('#career-job-label').innerText(),await p.evaluate(index=>`PAUSE MÉTIER ${index+1} — ${CareerPauses.jobs[index].name.toLocaleUpperCase('fr')}`,index));
   const before=await p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers]));await p.locator('input[name=career-choice]').first().check();await p.locator('#career-reveal').click();await fit(`métier corrigé ${index} ${width}`);assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers])),before);
  }
  console.log(`Lot 2 : six manches, comparatif, schéma, population, cinq métiers et lisibilité ${width}×${height} OK`);
 }
 assert.deepEqual(errors,[]);await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
