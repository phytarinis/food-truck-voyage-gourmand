const {chromium}=require('playwright'),assert=require('node:assert/strict');
const completePreviousRounds=require('./helpers/complete-previous-rounds.cjs');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),p=await b.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.WORLD_TEST_URL||'http://127.0.0.1:8008');
 await p.evaluate(completePreviousRounds);
 assert.equal(await p.evaluate(()=>Object.values(game.careerPauses).filter(p=>p.revealed).length),5);
 assert.equal(await p.locator('#world-challenge-title').innerText(),'Une livraison de sushis !');
 // Reprise au milieu d’un placement : le choix corail reste masqué pour sauge.
 await p.evaluate(()=>{const stamp=WorldGame.token(game);WorldGame.choose(game,'Asia',stamp);WorldGame.lock(game,stamp);renderWorld();});
 await p.reload();await p.locator('.route-round-open').nth(5).click();
 assert.equal(await p.locator('#world-map-board .france-flag.team-0').count(),0);
 assert.equal(await p.evaluate(()=>game.world.location.activeTeam),1);
 for(let i=0;i<6;i++){
  await p.evaluate(()=>{
   const s=game.world;
   for(const t of[0,1]){if(s.location.locked[t])continue;const stamp=WorldGame.token(game);WorldGame.choose(game,s.index===5?[-150,32]:WorldGame.challenges[s.index].continent,stamp);WorldGame.lock(game,stamp);}
   renderWorld();
  });
  await p.locator('#world-reveal').click();
  const points=await p.evaluate(()=>game.teams.map(t=>t.score));
  await p.reload();await p.locator('.route-round-open').nth(5).click();
  assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>t.score)),points);
  assert.equal(await p.locator('#world-challenge').isVisible(),true);
  await p.locator('#world-next').click();assert.equal(await p.locator('#spicy-break').isVisible(),false);
 }
 assert.equal(await p.evaluate(()=>SpicyGame.allComplete(game)),true);
 assert.equal(await p.locator('#spicy-finale').isVisible(),true);
 assert.equal(await p.locator('#world-transition').isVisible(),false);
 const saved=await p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers]));
 await p.reload();assert.equal(await p.locator('#spicy-finale').isVisible(),true);
 await p.locator('#spicy-final-close').click();assert.equal(await p.locator('#final-arrival').isVisible(),true);
 assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>[t.score,t.jokers])),saved);
 await p.locator('#final-to-memories').click();await p.locator('#final-to-results').click();
 assert.equal(await p.locator('#final-scores article').count(),2);
 // Après clôture, l'entrée de la manche 6 retrouve le grand final sans message provisoire.
 await p.evaluate(()=>renderWorld());assert.equal(await p.locator('#final-arrival').isVisible(),true);
 assert.deepEqual(errors,[]);await b.close();console.log('Six manches et cinq pauses par les moteurs : reprise, derniers piments, clôture et grand final directs OK');
})().catch(e=>{console.error(e);process.exit(1)});
