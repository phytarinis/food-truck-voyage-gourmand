'use strict';
let gpsSelectedLabel = 0;
let gpsDrag = null;
function openGps(){
 if(presentRound(3))return;
 GpsGame.start(game);game.routeCurrent=3;renderGps();}
function gpsElement(tag,attributes={}){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attributes).forEach(([key,value])=>e.setAttribute(key,value));return e;}
function renderGps(){
 const s=game.gps;
 if(s.phase==='intro')GpsGame.begin(game);
 // Anciennes sauvegardes et seconde validation : correction immédiate et unique.
 if(s.phase==='compare')GpsGame.reveal(game);
 scores();
 if(['placement','compare','correction'].includes(s.phase)){renderGpsPlacement();show('gps-placement');return;}
 if(s.phase==='bonus'){renderGpsBonus();show('gps-bonus');return;}
 openCareerPause(3);
}
function renderGpsPlacement(){
 const s=game.gps,data=GpsGame.challenges[s.index],active=s.phase==='placement',corrected=s.phase==='correction',stamp=GpsGame.token(game);
 $('gps-placement').classList.toggle('gps-hydro-challenge',s.index===1);
 $('gps-placement-title').textContent=data.title;$('gps-instruction').textContent=data.instruction;
 $('gps-turn').textContent=active?`${game.teams[s.team].name} · placement ${s.team===0?'corail':'sauge'}`:corrected?'La correction du GPS':'Les deux propositions sont visibles';
 $('gps-turn').className=`gps-turn${active?` team-${s.team}`:''}`;
 $('gps-character').hidden=!active;$('gps-quote').textContent=active?data.quote:'';
 $('gps-timer-panel').hidden=!active||!data.duration;
 $('gps-timer-start').onclick=()=>{if(GpsGame.startTimer(game,stamp,performance.now()))updateGpsTimer()};updateGpsTimer();
 $('gps-lock').hidden=!active;$('gps-lock').disabled=!GpsGame.ready(game);$('gps-lock').textContent=`Valider le placement ${s.team===0?'corail':'sauge'}`;
 $('gps-lock').onclick=()=>{if(GpsGame.lock(game,stamp,performance.now())){gpsSelectedLabel=0;renderGps();if(game.gps.phase==='correction')$('gps-correction').focus({preventScroll:true});else $('gps-turn').focus({preventScroll:true});}};
 $('gps-turn').tabIndex=-1;
 $('gps-correction').hidden=!corrected;$('gps-next').hidden=!corrected;$('gps-next').textContent=s.index===2?'Défi découverte →':'Défi suivant →';
 $('gps-facts').replaceChildren();$('gps-tolerance').textContent='';
 if(corrected){
  const facts=s.index===1?["La Garonne rejoint la Dordogne au bec d'Ambès. Leur confluence forme l'estuaire de la Gironde, qui débouche dans l'océan Atlantique."]:data.facts;
  facts.forEach(fact=>{const li=document.createElement('li');li.textContent=fact;$('gps-facts').append(li)});
  $('gps-tolerance').textContent=s.index===1?'Les six cours d’eau sont nommés sur la carte. Les contours de la Gironde sont distincts des fleuves. Tracés généralisés Natural Earth (1:10 millions).':'Validation pédagogique : zone du massif, avec une marge de 25 km. Pour les Alpes, la zone reste limitée au territoire français.';
 }
 $('gps-turn').hidden=!active;
 $('gps-choice-status').hidden=!active;
 $('gps-choice-status').textContent=active?(GpsGame.ready(game)?'Placement prêt. Vous pouvez encore le modifier.':s.index===1?'Déposez chaque étiquette sur un cours d’eau bleu avant de valider.':'Saisissez l’objet et déplacez-le sur la carte.'):'Les choix sont verrouillés. Ils restent visibles pendant la correction.';
 $('gps-help').hidden=!active;$('gps-manipulation').hidden=!active;
 $('gps-help').textContent=s.index===1?'Glissez chaque étiquette sur un tracé bleu, ou sélectionnez-la puis cliquez sur la carte. Clavier : Tab pour choisir une étiquette, flèches pour la déplacer, Maj pour accélérer.':'Glissez l’objet, sans rotation. Autre possibilité : cliquez sur la carte pour le placer. Clavier : Tab sur l’objet, puis flèches (Maj pour aller plus vite).';
 renderGpsMap();
}
function updateGpsTimer(){
 const s=game?.gps;if(!s||s.phase!=='placement')return;
 const duration=GpsGame.challenges[s.index].duration;if(!duration)return;
 const seconds=Math.ceil(GpsGame.remaining(game,performance.now())/1000);
 $('gps-timer').textContent=`00:${String(seconds).padStart(2,'0')}`;
 $('gps-timer-start').disabled=s.timers[s.team]!==null;
 const message=seconds===0?'Temps écoulé : vous pouvez terminer le placement.':s.timers[s.team]?'Le temps n’a aucune conséquence sur les points.':'Le formateur lance le chronomètre.';
 if($('gps-timer-status').textContent!==message)$('gps-timer-status').textContent=message;
}
setInterval(()=>{if(!$('gps-placement').hidden)updateGpsTimer()},200);
function renderGpsMap(){
 const s=game.gps,active=s.phase==='placement',corrected=s.phase==='correction',stamp=GpsGame.token(game),svg=$('gps-map');svg.replaceChildren();gpsDrag=null;
 svg.append(gpsElement('rect',{x:0,y:0,width:660,height:560,rx:10,class:'gps-map-background'}));
 if(s.index===1)svg.append(gpsElement('path',{d:GpsHydrography.oceanPath,class:'gps-ocean','aria-hidden':'true'}));
 for(const r of FranceRegions.filter(r=>r.mainland))svg.append(gpsElement('path',{d:r.path,class:'gps-land','aria-hidden':'true'}));
 const visibleTeams=active?[s.team]:[0,1];
 if(corrected&&s.index!==1){
  const key=s.index===0?'pyrenees':'alps';svg.append(gpsElement('path',{d:GpsGeography.zones[key].path,class:'gps-true-zone','aria-label':s.index===0?'Emplacement des Pyrénées':'Emplacement des Alpes françaises',role:'img'}));
  const p=GpsGame.project(s.index===0?[0.5,42.3]:[6.3,44.5]);const label=gpsElement('text',{x:p[0],y:p[1]+24,class:'gps-correct-label','text-anchor':'middle'});label.textContent=s.index===0?'PYRÉNÉES':'ALPES FRANÇAISES';svg.append(label);
 }
 if(s.index===1){
  renderGpsHydroMap(svg,s,active,corrected);
 }else{
  const positions=visibleTeams.map(team=>s.placements[team]?GpsGame.project(s.placements[team]):[95,85]);
  const close=!active&&Math.hypot(positions[0][0]-positions[1][0],positions[0][1]-positions[1][1])<118;
  visibleTeams.forEach((team,i)=>{
   const original=positions[i];let display=original;
   if(close){const base=Math.max(135,Math.min(525,(positions[0][0]+positions[1][0])/2));display=[base+(team===0?-68:68),Math.max(48,Math.min(512,(positions[0][1]+positions[1][1])/2))];}
   else display=[Math.max(60,Math.min(600,original[0])),Math.max(48,Math.min(512,original[1]))];
   if(!active){svg.append(gpsElement('path',{d:`M${original[0]},${original[1]}L${display[0]},${display[1]}`,class:`gps-placement-link team-${team}`}));svg.append(gpsElement('circle',{cx:original[0],cy:original[1],r:5,class:`gps-anchor team-${team}`}));}
   const piece=gpsPointPiece(display[0],display[1],team,s.index,active);svg.append(piece);
  });
 }
 if(corrected){
  const landmarks=GpsGeography.landmarks.filter(l=>s.index===2&&l.name==='Mont-Blanc');
  for(const landmark of landmarks){const dot=gpsElement('circle',{cx:landmark.position[0],cy:landmark.position[1],r:4,class:'gps-landmark'});const title=gpsElement('title');title.textContent=landmark.name;dot.append(title);svg.append(dot);}
 }
}
function gpsPointPiece(x,y,team,index,active){
 const label='Chaîne de montagnes';
 const g=gpsElement('g',{transform:`translate(${x},${y})`,'data-x':x,'data-y':y,'data-kind':'point',class:`gps-piece gps-point team-${team}`,role:'button',tabindex:active?0:-1,'aria-disabled':String(!active),'aria-label':`${label}, proposition ${team===0?'corail':'sauge'}${active?' : flèches pour déplacer':''}`});
 g.append(gpsElement('rect',{x:-60,y:-48,width:120,height:96,rx:8,class:'gps-piece-hit'}));
 g.append(gpsElement('path',{d:'M-51 24 -25-25 -7 5 12-32 52 24Z',class:'gps-mountains'}));g.append(gpsElement('path',{d:'m-35-6 10-19 12 21-11-5ZM0-13 12-32 25-11 13-16Z',class:'gps-snow'}));
 const badge=gpsElement('text',{x:44,y:-28,class:'gps-team-number'});badge.textContent=String(team+1);g.append(badge);
 g.addEventListener('keydown',event=>{
  if(!active||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  event.preventDefault();const delta=event.shiftKey?20:6,point=game.gps.placements[team]?GpsGame.project(game.gps.placements[team]):[x,y];
  point[0]=Math.max(0,Math.min(660,point[0]+(event.key==='ArrowLeft'?-delta:event.key==='ArrowRight'?delta:0)));point[1]=Math.max(0,Math.min(560,point[1]+(event.key==='ArrowUp'?-delta:event.key==='ArrowDown'?delta:0)));
  if(GpsGame.placePoint(game,GpsGame.unproject(point),GpsGame.token(game))){renderGpsPlacement();$('gps-map').querySelector('[data-kind="point"]').focus({preventScroll:true});}
 });return g;
}
function gpsRiverPiece(x,y,team,label,active){
 const g=gpsElement('g',{transform:`translate(${x},${y})`,'data-x':x,'data-y':y,'data-kind':'river','data-label':label,class:`gps-piece gps-river-piece team-${team}${active&&gpsSelectedLabel===label?' is-selected':''}`,role:'button',tabindex:active?0:-1,'aria-disabled':String(!active),'aria-pressed':String(active&&gpsSelectedLabel===label),'aria-label':`${GpsGame.riverLabels[label]}, équipe ${team===0?'corail':'sauge'}${active?' : flèches pour déplacer, Maj pour accélérer':''}`});
 g.append(gpsElement('rect',{x:-74,y:-42,width:148,height:84,rx:8,class:'gps-piece-hit'}));g.append(gpsElement('rect',{x:-67,y:-16,width:134,height:32,rx:5,class:'gps-label-card'}));
 const text=gpsElement('text',{'text-anchor':'middle',y:6});text.textContent=GpsGame.riverLabels[label];g.append(text);
 g.addEventListener('keydown',event=>{
  if(!active)return;
  if(['Enter',' '].includes(event.key)){event.preventDefault();gpsSelectedLabel=label;renderGpsPlacement();$('gps-map').querySelector(`[data-label="${label}"]`).focus({preventScroll:true});}
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
   event.preventDefault();const delta=event.shiftKey?20:6;
   const point=[x+(event.key==='ArrowLeft'?-delta:event.key==='ArrowRight'?delta:0),y+(event.key==='ArrowUp'?-delta:event.key==='ArrowDown'?delta:0)];
   point[0]=Math.max(0,Math.min(660,point[0]));point[1]=Math.max(0,Math.min(560,point[1]));
   gpsSelectedLabel=label;GpsGame.placeRiverAt(game,label,GpsGame.unproject(point),GpsGame.token(game));renderGpsPlacement();$('gps-map').querySelector(`[data-label="${label}"]`).focus({preventScroll:true});
  }
 });return g;
}
function gpsLocalPoint(event){const matrix=$('gps-map').getScreenCTM();if(!matrix)return null;const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());return [p.x,p.y];}
$('gps-map').addEventListener('pointerdown',event=>{
 if(event.button!==0||!game||game.gps?.phase!=='placement')return;
 const piece=event.target.closest('[data-kind]'),point=gpsLocalPoint(event);if(!point)return;
 const stamp=GpsGame.token(game);gpsDrag={pointer:event.pointerId,stamp,piece,start:point,last:point,origin:piece?[Number(piece.dataset.x),Number(piece.dataset.y)]:point,moved:false};
 if(piece?.dataset.kind==='river')gpsSelectedLabel=Number(piece.dataset.label);
 $('gps-map').setPointerCapture(event.pointerId);event.preventDefault();
});
$('gps-map').addEventListener('pointermove',event=>{
 if(!gpsDrag||gpsDrag.pointer!==event.pointerId)return;const point=gpsLocalPoint(event);if(!point)return;
 gpsDrag.last=point;gpsDrag.moved ||= Math.hypot(point[0]-gpsDrag.start[0],point[1]-gpsDrag.start[1])>3;
 if(gpsDrag.piece){const x=Math.max(0,Math.min(660,gpsDrag.origin[0]+point[0]-gpsDrag.start[0])),y=Math.max(0,Math.min(560,gpsDrag.origin[1]+point[1]-gpsDrag.start[1]));gpsDrag.piece.setAttribute('transform',`translate(${x},${y})`);}
});
$('gps-map').addEventListener('pointerup',event=>{
 const drag=gpsDrag;if(!drag||drag.pointer!==event.pointerId)return;gpsDrag=null;
 if($('gps-map').hasPointerCapture(event.pointerId))$('gps-map').releasePointerCapture(event.pointerId);
 if(GpsGame.token(game)!==drag.stamp)return;
 const raw=gpsLocalPoint(event)||drag.last;
 const point=drag.piece&&drag.moved?[drag.origin[0]+raw[0]-drag.start[0],drag.origin[1]+raw[1]-drag.start[1]]:raw;
 if(game.gps.index===1){
  if(!drag.piece||drag.moved){
   GpsGame.placeRiverAt(game,gpsSelectedLabel,GpsGame.unproject(point),drag.stamp);
  }
 }else if(!drag.piece||drag.moved)GpsGame.placePoint(game,GpsGame.unproject([Math.max(0,Math.min(660,point[0])),Math.max(0,Math.min(560,point[1]))]),drag.stamp);
 renderGpsPlacement();
});
$('gps-map').addEventListener('pointercancel',()=>{gpsDrag=null;if(game?.gps?.phase==='placement')renderGpsPlacement();});
function renderGpsBonus() {
  const state = game.gps.bonus, data = GpsGame.bonus;
  $('gps-bonus-question').textContent = data.question;
  $('gps-bonus-options').replaceChildren(...data.options.map((text, index) => {
    const item = document.createElement('li');
    const label = document.createElement('label');
    const input = document.createElement('input'); input.type = 'radio'; input.name = 'gps-bonus-choice'; input.value = String(index); input.required = true;
    input.checked = state.selected === index; input.disabled = state.revealed;
    const copy = document.createElement('span'); copy.textContent = text; label.append(input, copy);
    const letter = document.createElement('span'); letter.className = 'gps-bonus-letter'; letter.textContent = String.fromCharCode(65 + index) + '.'; item.append(letter, label);
    if (state.revealed && index === data.correctIndex) item.classList.add('bonus-correct');
    input.addEventListener('change', () => {
      GpsGame.chooseBonus(game, index); $('gps-bonus-reveal').disabled = false;
      $('gps-bonus-status').textContent = `Proposition ${String.fromCharCode(65 + index)} retenue collectivement.`;
    });
    return item;
  }));
  $('gps-bonus-reveal').disabled = state.selected === null;
  $('gps-bonus-reveal').hidden = state.revealed;
  $('gps-bonus-status').hidden = state.revealed;
  $('gps-bonus-status').textContent = state.selected === null ? 'Le formateur sélectionne la proposition du groupe.' : `Proposition ${String.fromCharCode(65 + state.selected)} retenue collectivement.`;
  $('gps-bonus-answer').hidden = !state.revealed;
  $('gps-bonus-discovery').hidden = !state.revealed;
  $('gps-bonus-finish').hidden = !state.revealed;
  $('gps-bonus-solution').textContent = state.revealed ? 'B. ' + data.options[data.correctIndex] : '';
  $('gps-bonus-explanation').textContent = state.revealed ? data.explanation : '';
  $('gps-bonus-quote').textContent = state.revealed ? data.quote : '';
}

$('gps-next').addEventListener('click',()=>{if(GpsGame.next(game)){gpsSelectedLabel=0;renderGps()}});
$('gps-bonus-form').addEventListener('submit',event=>{event.preventDefault();if(GpsGame.revealBonus(game)){renderGpsBonus();$('gps-bonus-answer').focus()}});
$('gps-bonus-finish').addEventListener('click',()=>{if(GpsGame.finish(game))renderGps()});
document.querySelectorAll('.gps-back').forEach(button=>button.addEventListener('click',()=>{gpsDrag=null;scores();show('journey')}));
