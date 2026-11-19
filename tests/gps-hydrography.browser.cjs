const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
 const p=await browser.newPage({hasTouch:true,reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));const cdp=await p.context().newCDPSession(p);
 const url=process.env.GPS_TEST_URL||'http://127.0.0.1:8030';
 const fresh=async()=>{await p.goto(url);await p.evaluate(()=>{localStorage.clear();game=FoodTruckGame.createGame(['Corail','Sauge']);game.teams[0].score=100;game.teams[1].score=60;GpsGame.start(game);game.gps.index=1;game.gps.phase='placement';game.gps.placements=[[null,null,null],[null,null,null]];renderGps()})};
 const fit=async label=>assert.equal(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth),true,label);
 const at=async(point)=>p.evaluate(point=>{const p=new DOMPoint(...point).matrixTransform(document.querySelector('#gps-map').getScreenCTM());return {x:p.x,y:p.y}},point);
 const anchor=id=>p.evaluate(id=>GpsHydrography.rivers.find(r=>r.id===id).anchor,id);
 const drag=async(label,id,touch=false)=>{
  const piece=p.locator(`#gps-map [data-label="${label}"]`),start=await at(await piece.evaluate(e=>[+e.dataset.x,+e.dataset.y])),end=await at(await anchor(id));
  if(touch){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[end]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else{await p.mouse.move(start.x,start.y);await p.mouse.down();await p.mouse.move(end.x,end.y,{steps:8});await p.mouse.up()}
  assert.equal(await p.evaluate(label=>GpsGame.riverId(game.gps.placements[game.gps.team][label]),label),id,`dépôt ${label} sur ${id}${touch?' tactile':''}`);
 };
 const keyboard=async(label,id)=>{
  const target=await anchor(id);let current=await p.locator(`#gps-map [data-label="${label}"]`).evaluate(e=>[+e.dataset.x,+e.dataset.y]);await p.locator(`#gps-map [data-label="${label}"]`).focus();
  for(const [axis,positive,negative]of [[0,'ArrowRight','ArrowLeft'],[1,'ArrowDown','ArrowUp']]){
   let distance=target[axis]-current[axis],key=distance>0?positive:negative;
   for(let n=Math.floor(Math.abs(distance)/20);n>0;n--)await p.keyboard.press('Shift+'+key);
   current=await p.locator(`#gps-map [data-label="${label}"]`).evaluate(e=>[+e.dataset.x,+e.dataset.y]);distance=target[axis]-current[axis];key=distance>0?positive:negative;
   for(let n=Math.round(Math.abs(distance)/6);n>0;n--)await p.keyboard.press(key);
   current=await p.locator(`#gps-map [data-label="${label}"]`).evaluate(e=>[+e.dataset.x,+e.dataset.y]);
  }
  assert.equal(await p.evaluate(label=>GpsGame.riverId(game.gps.placements[game.gps.team][label]),label),id,`clavier ${label}`);
 };
 const reload=async()=>{await p.reload();await p.locator('.route-round-open').nth(3).click()};
 fs.mkdirSync('docs/validation-hydrographie',{recursive:true});
 for(const[width,height]of[[1366,768],[1280,720]]){
  await p.setViewportSize({width,height});await fresh();
  assert.equal(await p.locator('.gps-hydro-line').count(),6);assert.equal(await p.locator('.gps-drop-zone,.gps-river-hit,.gps-correct-label,.gps-gironde-inset').count(),0);
  assert.deepEqual(await p.locator('#gps-map text').allTextContents(),['GARONNE','SEINE','RHIN']);
  assert.doesNotMatch(await p.locator('#gps-map').textContent(),/Loire|Dordogne|Rhône|Bec|Gironde|REPÈRE/);
  await fit(`placement ${width}`);await p.screenshot({path:`docs/validation-hydrographie/placement-${width}.png`});
  await drag(0,'e');const wrong=await p.evaluate(()=>game.gps.placements[0][0]);await drag(0,'c');assert.notDeepEqual(await p.evaluate(()=>game.gps.placements[0][0]),wrong);
  await drag(1,'a');await drag(2,'b');const saved=await p.evaluate(()=>game.gps.placements[0]);await reload();assert.deepEqual(await p.evaluate(()=>game.gps.placements[0]),saved);
  await p.locator('#gps-lock').click();assert.equal(await p.locator('.gps-river-piece.team-0').count(),0);assert.equal(await p.locator('.gps-river-piece.team-1').count(),3);assert.equal(await p.evaluate(()=>game.gps.team),1);
  await drag(0,'d',true);await drag(1,'e');await keyboard(2,'f');await fit(`Sauge ${width}`);await p.locator('#gps-lock').click();
  assert.equal(await p.evaluate(()=>game.gps.phase),'correction');assert.equal(await p.locator('.gps-river-piece').count(),6);assert.equal(await p.locator('.gps-hydro-name').count(),6);
  assert.deepEqual(await p.locator('.gps-hydro-name').allTextContents(),['Seine','Rhin','Garonne','Dordogne','Loire','Rhône']);
  assert.match(await p.locator('#gps-correction').innerText(),/La Garonne rejoint la Dordogne au bec d'Ambès.*estuaire de la Gironde.*océan Atlantique/s);
  assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>t.score)),[115,60]);assert.equal(await p.evaluate(()=>GpsGame.reveal(game)),false);
  assert.equal(await p.locator('.gps-gironde-inset').count(),1);await fit(`correction ${width}`);
  await p.screenshot({path:`docs/validation-hydrographie/correction-${width}.png`});await reload();assert.deepEqual(await p.evaluate(()=>game.teams.map(t=>t.score)),[115,60]);assert.equal(await p.locator('.gps-river-piece').count(),6);
  // Nouvelle partie : placement des trois étiquettes uniquement au clavier.
  await fresh();for(const[i,id]of['c','a','b'].entries())await keyboard(i,id);assert.equal(await p.locator('#gps-lock').isEnabled(),true);await p.locator('#gps-lock').click();assert.equal(await p.evaluate(()=>game.gps.team),1);
  console.log(`Hydrographie ${width}×${height} : 6 tracés, aucun indice, souris/tactile/clavier, leurres, masquage, comparaison, +15/+0 uniques, sauvegardes, correction et actions sans défilement OK`);
 }
 assert.deepEqual(errors,[]);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
