'use strict';
let spicyPending=null,spicySetup=null,spicyGameRef=null;
const spicyBypass=new Set();
const spicyNextButtons={
 'delivery-next':['apero','index'], 'sauce-next':['sauce','puzzleIndex'], 'france-next':['france','puzzleIndex'],
 'gps-next':['gps','index'], 'passport-next':['passport','puzzleIndex'], 'world-next':['world','index']
};
function spicyObserveProgress(){if(game)SpicyGame.observe(game);}
function spicyCurrentScreen(){return document.querySelector('.screen:not([hidden])')?.id;}
function syncSpicyAccess(id){
 if(spicyGameRef!==game){spicyPending=null;spicySetup=null;spicyGameRef=game;}
 const button=$('spicy-open');button.hidden=true;
 if(!game)return;
 const s=SpicyGame.observe(game);
 $('gps-spicy').hidden=true;
 if(id==='gps-placement'&&game.gps?.phase==='correction'&&!s.active&&!s.finale){SpicyGame.release(game,`gps:${game.gps.index}`);$('gps-spicy').hidden=!SpicyGame.canNormal(game,id);}
 $('sauce-spicy').hidden=true;
 if(id==='sauce-correction'&&game.sauce?.phase==='correction'&&!s.active&&!s.finale){SpicyGame.release(game,`sauce:${game.sauce.puzzleIndex}`);$('sauce-spicy').hidden=!SpicyGame.canNormal(game,id);}
 $('passport-spicy').hidden=true;
 if(id==='passport-location'&&game.passport?.phase==='correction'&&!s.active&&!s.finale){SpicyGame.release(game,`passport:${game.passport.puzzleIndex}`);$('passport-spicy').hidden=!SpicyGame.canNormal(game,id);}
 $('france-spicy').hidden=true;
 if(id==='france-location'&&game.france?.phase==='correction'&&!s.active&&!s.finale){SpicyGame.release(game,`france:${game.france.puzzleIndex}`);$('france-spicy').hidden=!SpicyGame.canNormal(game,id);}
 $('delivery-spicy').hidden=true;
 if(id==='delivery-correction'&&game.apero?.phase==='correction'&&!s.active&&!s.finale){SpicyGame.release(game,`apero:${game.apero.index}`);$('delivery-spicy').hidden=!SpicyGame.canNormal(game,id);}
 if(!s.active&&['journey','apero-end','sauce-end','france-end','gps-end','passport-end','world-end','world-transition', 'apero-intro','sauce-intro','france-intro','gps-intro','passport-intro','world-intro'].includes(id)){
  if(SpicyGame.allComplete(game)&&!SpicyGame.hasQuestion(game)){button.hidden=false;button.textContent=s.finale?.phase==='closed'?'Scores définitifs':'🌶️ Les derniers piments';}
  else if(SpicyGame.canNormal(game,id)){button.hidden=false;button.textContent='🌶️ Plat piégé !';}
 }
 if(id==='world-transition'){
  const closed=s.finale?.phase==='closed';$('world-transition-title').textContent=closed?'Scores définitifs':'Dernière escale terminée.';
  $('world-transition').querySelector('.eyebrow').textContent=closed?'LES DERNIERS PIMENTS SONT CLÔTURÉS':'SCORES PROVISOIRES';
  $('world-transition').querySelector('.intro').textContent=closed?'Le voyage est clôturé. Retrouvez votre parcours dans le carnet de route.':'Vos scores sont provisoires. Terminez les manches restantes puis retrouvez les derniers piments avant la clôture.';
  if(closed)$('world-transition').querySelectorAll('.score-points').forEach((node,team)=>{node.textContent=`${s.finale.scores[team].score} pts`});
 }
}
function spicyResume(){
 const pending=spicyPending;if(!pending||pending.game!==game||game?.spicy?.active)return;
 spicyPending=null;spicySetup=null;
 spicyBypass.add(pending.button);
 try{pending.button.click();}finally{spicyBypass.delete(pending.button);}
}
function renderSpicyBreak(){
 if(!spicyPending||spicyPending.game!==game)return;
 if(spicyPending.button.id==='delivery-next'){renderApero();return;}
 if(spicyPending.button.id==='gps-next'){renderGps();return;}
 if(spicyPending.button.id==='sauce-next'){renderSauce();return;}
 if(spicyPending.button.id==='france-next'){renderFrance();return;}
 if(spicyPending.button.id==='passport-next'){spicyPending=null;renderPassport();return;}
 scores();const s=SpicyGame.state(game);
 $('spicy-break-status').textContent=s.window?.spent?'Un piment a déjà été joué dans cette pause. Le voyage peut reprendre.':`${SpicyGame.available(game).length} questions encore disponibles.`;
 $('spicy-break-play').disabled=!SpicyGame.canNormal(game,'spicy-break');
 $('spicy-break-next').textContent=spicyPending.label||'CONTINUER LE VOYAGE →';show('spicy-break');
}
for(const[id,[key,indexKey]]of Object.entries(spicyNextButtons)){
 $(id).addEventListener('click',event=>{
  if(spicyBypass.has($(id)))return;
  if(game?.spicy?.active){event.preventDefault();event.stopImmediatePropagation();return;}
  const round=game?.[key];if(round?.phase!=='correction')return;
  SpicyGame.release(game,`${key}:${round[indexKey]}`);
  if(key==='apero'||key==='sauce'||key==='france'||key==='gps'||key==='passport'){spicyPending=null;return;}
  if(key==='world'&&round.index===5)return;
  if(!SpicyGame.canNormal(game,'spicy-break'))return;
  event.preventDefault();event.stopImmediatePropagation();spicyPending={game,button:$(id),label:$(id).textContent.trim()};renderSpicyBreak();
 },true);
}
$('world-finish-journey').addEventListener('click',event=>{
 if(!game||game.world?.phase!=='complete'||!SpicyGame.allComplete(game))return;
 event.preventDefault();event.stopImmediatePropagation();openSpicyFinale();
},true);
function spicyRestore(screen){
 scores();
 const renderers={delivery:renderApero,apero:renderApero,sauce:renderSauce,france:renderFrance,gps:renderGps,passport:renderPassport,world:renderWorld};
 const prefix=screen?.split('-')[0];if(renderers[prefix]&&screen!=='world-transition')renderers[prefix]();else show(screen||'journey');
}
function openSpicySetup(kind='normal'){
 if(!game||game.spicy?.active)return;
 const context=kind==='finale'?'spicy-finale':spicyCurrentScreen(),stamp=kind==='finale'?SpicyGame.finaleToken(game):SpicyGame.windowToken(game,context);
 if(!stamp)return;
 const owners=kind==='finale'?SpicyGame.finaleOwners(game):[0,1].filter(team=>game.teams[team].jokers>0);
 if(!owners.length||!SpicyGame.available(game).length)return;
 spicySetup={game,kind,context,stamp,owner:owners[0],mode:'self',questionId:null};renderSpicySetup();show('spicy-setup');
}
function spicyLabel(text){const span=document.createElement('span');span.textContent=text;return span;}
function renderSpicySetup(){
 const state=spicySetup;if(!state||state.game!==game)return;
 scores();const owners=state.kind==='finale'?SpicyGame.finaleOwners(game):[0,1].filter(team=>game.teams[team].jokers>0);
 $('spicy-owner-options').replaceChildren(...game.teams.map((team,index)=>{
  const label=document.createElement('label');label.className=`spicy-choice team-${index}`;
  const input=document.createElement('input');input.type='radio';input.name='spicy-owner';input.value=String(index);input.disabled=!owners.includes(index);input.checked=state.owner===index;
  input.addEventListener('change',()=>{state.owner=index;updateSpicyPreview()});label.append(input,spicyLabel(`${team.name} · ${team.jokers} piment${team.jokers===1?'':'s'}`));return label;
 }));
 document.querySelectorAll('input[name=spicy-mode]').forEach(input=>{input.checked=input.value===state.mode;input.onchange=()=>{state.mode=input.value;updateSpicyPreview()}});
 const available=SpicyGame.available(game),used=SpicyGame.state(game).used;
 $('spicy-question-count').textContent=`Questions encore disponibles : ${available.length} / 4`;
 $('spicy-question-options').replaceChildren(...SpicyGame.questions.map(q=>{
  const label=document.createElement('label');label.className='spicy-choice';
  const input=document.createElement('input');input.type='radio';input.name='spicy-question-choice';input.value=q.id;input.disabled=used.includes(q.id);input.checked=state.questionId===q.id;
  input.addEventListener('change',()=>{state.questionId=q.id;updateSpicyPreview()});label.append(input,spicyLabel(q.topic+(input.disabled?' · déjà utilisée':'')));return label;
 }));$('spicy-setup-status').textContent='Le piment est dépensé uniquement au lancement de la question.';updateSpicyPreview();
}
function updateSpicyPreview(){
 if(!spicySetup||spicySetup.game!==game)return;
 const s=spicySetup,respondent=s.mode==='self'?s.owner:1-s.owner;
 $('spicy-target-preview').textContent=`${game.teams[s.owner].name} dépense un piment. Répond : ${game.teams[respondent].name}.${s.mode==='challenge'?' Le défi ne peut pas être refusé.':''}`;
 $('spicy-launch').disabled=!s.questionId;
}
function renderSpicyQuestion(){
 const a=game.spicy.active,q=SpicyGame.questions.find(q=>q.id===a.questionId),stamp=SpicyGame.activeToken(game);scores();
 $('spicy-photo').replaceChildren();$('spicy-explanation').textContent='';$('spicy-quote').textContent='';$('spicy-correction-title').textContent='';$('spicy-award').textContent='';
 $('spicy-question-title').textContent=q.question;$('spicy-respondent').textContent=`À ${game.teams[a.respondent].name} de répondre !`;
 $('spicy-respondent').className=`spicy-target team-${a.respondent}`;
 $('spicy-active-mode').textContent=a.mode==='self'?`${game.teams[a.owner].name} tente sa chance : bonne réponse +10, erreur 0.`:`${game.teams[a.owner].name} défie ${game.teams[a.respondent].name}. Bonne réponse : +10 à l’équipe défiée ; sinon +10 à celle qui a lancé le défi.`;
 $('spicy-answer-options').replaceChildren(...q.options.map((text,index)=>{
  const item=document.createElement('li'),label=document.createElement('label'),radio=document.createElement('input');radio.type='radio';radio.name='spicy-answer';radio.value=String(index);radio.checked=a.selected===index;
  radio.addEventListener('change',()=>{if(SpicyGame.choose(game,index,stamp)){$('spicy-validate').disabled=false;$('spicy-answer-status').textContent=`Réponse ${String.fromCharCode(65+index)} retenue. Le formateur peut la valider.`}});
  const letter=spicyLabel(String.fromCharCode(65+index)+'.');letter.className='spicy-letter';label.append(radio,spicyLabel(text));item.append(letter,label);return item;
 }));$('spicy-validate').disabled=a.selected===null;$('spicy-answer-status').textContent='Choisissez une proposition, puis faites valider le formateur.';show('spicy-question');
}
function appendSpicyPhotoCredit(container,photo){
 container.append(`Photo : ${photo.author} — Wikimedia Commons — ${photo.license}. `);
 for(const[url,label]of[[photo.source,'Source'],[photo.licenseUrl,photo.license]]){const link=document.createElement('a');link.href=url;link.textContent=label;link.target='_blank';link.rel='noopener';container.append(link,' · ');}
 container.append(photo.changes||'Image affichée entière, sans retouche ni recadrage par le jeu.');
}
function renderSpicyCorrection(){
 const a=game.spicy.active,q=SpicyGame.questions.find(q=>q.id===a.questionId),photo=SpicyPhotos[q.id];scores();
 $('spicy-correction-title').textContent=`${String.fromCharCode(65+q.correctIndex)}. ${q.options[q.correctIndex]}`;
 $('spicy-award').textContent=a.awardedTo===null?'Aucun point cette fois. Aucun point retiré.':`${game.teams[a.awardedTo].name} gagne 10 points !`;
 $('spicy-explanation').textContent=q.explanation;$('spicy-quote').textContent=q.quote;
 const image=document.createElement('img');image.src=photo.src;image.alt=photo.alt;const caption=document.createElement('figcaption');appendSpicyPhotoCredit(caption,photo);$('spicy-photo').replaceChildren(image,caption);
 $('spicy-return').textContent=a.kind==='finale'?'RETOUR AUX DERNIERS PIMENTS →':'REPRENDRE LE VOYAGE →';show('spicy-correction');
}
function openSpicyFinale(){
 if(!game)return;
 if(game.spicy?.finale?.phase==='closed'){scores();if(typeof openGrandFinal==='function')openGrandFinal();else show('world-transition');return;}
 if(!SpicyGame.beginFinale(game))return;renderSpicyFinale();
}
function renderSpicyFinale(){
 scores();const s=SpicyGame.state(game),f=s.finale;
 $('spicy-final-wishes').replaceChildren(...game.teams.map((team,index)=>{
  const label=document.createElement('label');label.className=`spicy-choice team-${index}`;const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.id=`spicy-willing-${index}`;checkbox.checked=f.willing[index];checkbox.disabled=team.jokers===0;
  checkbox.addEventListener('change',()=>{if(SpicyGame.willing(game,index,checkbox.checked))renderSpicyFinale()});label.append(checkbox,spicyLabel(`${team.name} souhaite utiliser ses piments (${team.jokers} restant${team.jokers===1?'':'s'})`));return label;
 }));const owners=SpicyGame.finaleOwners(game);
 $('spicy-final-turn').textContent=!SpicyGame.available(game).length?'Les quatre questions ont été utilisées.':!owners.length?'Aucune équipe ne souhaite ou ne peut jouer. Vous pouvez clôturer.':owners.length===2?'Le formateur choisit la première équipe.':`Au tour de ${game.teams[owners[0]].name} de jouer un piment.`;
 $('spicy-final-play').disabled=owners.length===0;
 $('spicy-final-close').textContent='Terminer les jokers et découvrir les résultats →';show('spicy-finale');
}
function appendSpicyPhotoCredits(container){
 if(!game?.spicy)return;
 for(const result of game.spicy.history){const q=SpicyGame.questions.find(q=>q.id===result.questionId),article=document.createElement('article'),title=document.createElement('h3'),credit=document.createElement('p');title.textContent=`Plat piégé ! — ${q.topic}`;appendSpicyPhotoCredit(credit,SpicyPhotos[q.id]);article.append(title,credit);container.append(article);}
}
$('spicy-open').addEventListener('click',()=>{if(SpicyGame.allComplete(game))openSpicyFinale();else openSpicySetup()});
$('delivery-spicy').addEventListener('click',()=>{if(!SpicyGame.canNormal(game,'delivery-correction'))return;spicyPending={game,button:$('delivery-next'),label:$('delivery-next-label').textContent};openSpicySetup()});
$('gps-spicy').addEventListener('click',()=>{if(!SpicyGame.canNormal(game,'gps-placement'))return;spicyPending={game,button:$('gps-next'),label:$('gps-next').textContent};openSpicySetup()});
$('sauce-spicy').addEventListener('click',()=>{if(!SpicyGame.canNormal(game,'sauce-correction'))return;spicyPending={game,button:$('sauce-next'),label:$('sauce-next').textContent};openSpicySetup()});
$('france-spicy').addEventListener('click',()=>{if(!SpicyGame.canNormal(game,'france-location'))return;spicyPending={game,button:$('france-next'),label:$('france-next').textContent};openSpicySetup()});
$('spicy-break-play').addEventListener('click',()=>openSpicySetup());$('spicy-break-next').addEventListener('click',spicyResume);
$('spicy-setup-form').addEventListener('submit',event=>{event.preventDefault();if(spicySetup?.game!==game)return;if(SpicyGame.start(game,spicySetup))renderSpicyQuestion();else $('spicy-setup-status').textContent='Ce lancement n’est plus disponible. Revenez à la pause pour vérifier les piments et les questions.';});
$('spicy-cancel-setup').addEventListener('click',()=>{const context=spicySetup?.context;spicySetup=null;if(context==='delivery-correction'||context==='sauce-correction'||context==='france-location'||context==='gps-placement')spicyPending=null;if(context==='spicy-break')renderSpicyBreak();else if(context==='spicy-finale')renderSpicyFinale();else spicyRestore(context)});
$('spicy-answer-form').addEventListener('submit',event=>{event.preventDefault();if(SpicyGame.reveal(game,SpicyGame.activeToken(game)))renderSpicyCorrection()});
$('spicy-return').addEventListener('click',()=>{
 const active=game?.spicy?.active,context=spicySetup?.context;if(!active)return;const kind=active.kind;
 if(!SpicyGame.finish(game,SpicyGame.activeToken(game)))return;
 spicySetup=null;$('spicy-photo').replaceChildren();if(kind==='finale')renderSpicyFinale();else if(context==='spicy-break'||context==='delivery-correction'||context==='sauce-correction'||context==='france-location'||context==='gps-placement')spicyResume();else spicyRestore(context);
});
$('spicy-final-play').addEventListener('click',()=>openSpicySetup('finale'));
$('spicy-final-close').addEventListener('click',()=>{if(SpicyGame.closeFinale(game)){scores();if(typeof openGrandFinal==='function')openGrandFinal();else show('world-transition')}});
$('spicy-final-back').addEventListener('click',()=>{scores();show('journey')});

$('passport-spicy').addEventListener('click',()=>openSpicySetup());
