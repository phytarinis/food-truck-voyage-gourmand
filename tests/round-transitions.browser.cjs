const {chromium}=require('playwright'),assert=require('node:assert/strict');
const completePreviousRounds=require('./helpers/complete-previous-rounds.cjs');
const titles=["L'apéro local",'À quelle sauce ?','La France et ses spécialités','Le GPS a perdu la boule !','Passeport gourmand','Tour du monde'];
const dialogues=["Avant de partir à l'autre bout du monde, vérifions déjà si vous savez où on habite !",'On reste en Nouvelle-Aquitaine. Ici, même les spécialités ont du caractère !',"Livraison nationale ! J'espère que votre GPS est meilleur que le mien…",'Mon GPS confond les montagnes et les fleuves. Ça promet pour les livraisons !',"Direction l'Europe ! Carte d'identité en poche… enfin, je crois !","Cette fois, on traverse les continents ! J'espère que le camion sait nager."];
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),p=await b.newPage({reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.GAME_TEST_URL||'http://127.0.0.1:8008');
 await p.locator('#onward').click();await p.locator('#team-one').fill('Corail');await p.locator('#team-two').fill('Sauge');await p.locator('#team-form button').click();await p.locator('#rules-next').click();
 await p.locator('.route-round-open').nth(0).click();assert.equal(await p.locator('#round-transition-title').innerText(),titles[0]);
 assert.equal(await p.locator('#route-truck span').innerText(),'AU DÉPART');await p.locator('#round-start').click();assert.equal(await p.locator('#delivery').isVisible(),true);
 const target=['delivery','sauce-search','france-search','gps-placement','passport-search','world-challenge'];
 for(const [width,height]of[[1280,720],[1366,768]]){
  await p.setViewportSize({width,height});
  for(let index=0;index<6;index++){
   await p.evaluate(()=>{game=FoodTruckGame.createGame(['Corail','Sauge']);scores();show('journey')});
   const truck=await p.locator('#route-truck').getAttribute('class');
   await p.locator('.route-round-open').nth(index).click();
   assert.equal(await p.locator('#round-transition').isVisible(),true);
   assert.equal(await p.locator('#round-transition-title').innerText(),titles[index]);
   assert.equal(await p.locator('#round-transition-dialogue').innerText(),dialogues[index]);
   assert.equal(await p.locator('#round-transition-number').innerText(),`MANCHE ${String(index+1).padStart(2,'0')}`);
   assert.equal(await p.locator('#round-transition button').count(),1);
   assert.equal(await p.locator('#round-transition .scoreboard,#round-transition .action-van').count(),0);
   assert.equal(await p.locator('.topbar').isVisible(),false);
   await p.locator('#round-transition-heroine').evaluate(i=>i.decode());
   assert.equal(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth),true);
   assert.equal(await p.locator('#route-truck').getAttribute('class'),truck);
   assert.equal(await p.evaluate(index=>game[RoundTransitions.rounds[index].key],index),undefined);
   await p.reload();assert.equal(await p.locator('#round-transition').isVisible(),true);
   await p.locator('#round-start').click();assert.equal(await p.locator('#'+target[index]).isVisible(),true);
   const roundState=await p.evaluate(index=>JSON.stringify(game[RoundTransitions.rounds[index].key]),index);
   await p.reload();assert.equal(await p.locator('#'+target[index]).isVisible(),true);
   assert.equal(await p.evaluate(index=>JSON.stringify(game[RoundTransitions.rounds[index].key]),index),roundState);
   await p.evaluate(()=>show('journey'));await p.locator('.route-round-open').nth(index).click();
   assert.equal(await p.locator('#'+target[index]).isVisible(),true);
   assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers])),[[0,2],[0,2]]);
  }
  console.log(`Six présentations : titres, dialogues, variantes, sauvegarde et démarrage exacts ${width}×${height} OK`);
 }
 // Les pauses gardent leur place et ouvrent la transition suivante sans déplacement du camion.
 for(const index of[0,1,2,3,4]){
  await p.evaluate(index=>{game=FoodTruckGame.createGame(['A','B']);game[RoundTransitions.rounds[index].key]={phase:'complete',results:[]};game.careerPauses={};const pause=CareerPauses.createPause(index);CareerPauses.select(pause,0);CareerPauses.reveal(pause);game.careerPauses[index]=pause;openCareerPause(index);},index);
  await p.locator('#career-continue').click();if(index>=2){assert.equal(await p.locator('#journey').isVisible(),true);await p.locator('.route-round-open').nth(index+1).click();}assert.equal(await p.locator('#round-transition-title').innerText(),titles[index+1]);
  await p.evaluate(()=>show('journey'));assert.equal(await p.locator('#route-truck span').innerText(),`ESCALE ${index+1}`);
 }
 // Les sauvegardes antérieures n’ont pas besoin d’un indicateur inventé pour reprendre.
 await p.evaluate(()=>{game=FoodTruckGame.createGame(['A','B']);PassportGame.start(game);PassportGame.begin(game);openPassport()});
 assert.equal(await p.locator('#passport-search').isVisible(),true);
 // Parcours complet réel : le composant ne bloque ni les derniers piments ni la consultation finale.
 await p.evaluate(completePreviousRounds);assert.equal(await p.locator('#round-transition-title').innerText(),titles[5]);await p.locator('#round-start').click();
 for(let i=0;i<6;i++){
  await p.evaluate(()=>{const s=game.world;for(const t of[0,1]){const token=WorldGame.token(game);WorldGame.choose(game,s.index===5?[-150,32]:WorldGame.challenges[s.index].continent,token);WorldGame.lock(game,token);}WorldGame.reveal(game);renderWorld();});
  await p.locator('#world-next').click();assert.equal(await p.locator('#round-transition').isVisible(),false);
 }
 assert.equal(await p.locator('#spicy-finale').isVisible(),true);await p.locator('#spicy-final-close').click();
 await p.locator('#final-to-memories').click();await p.locator('#final-to-results').click();await p.locator('#final-review').click();
 await p.locator('.route-round-open').nth(0).click();assert.equal(await p.locator('#final-review-screen').isVisible(),true);
 assert.deepEqual(errors,[]);await b.close();console.log('Pauses, migration, camion, grand final et consultation préservés OK');
})().catch(e=>{console.error(e);process.exit(1)});
