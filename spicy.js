/* Plat piégé : deux piments par équipe, quatre questions, aucun retrait de points. */
(function(root){
 'use strict';
 const questions=[
  {id:'spiders',topic:'Cambodge — Quelle spécialité ?',question:'Au Cambodge, quelle spécialité peut-on réellement déguster ?',options:['Des mygales frites et assaisonnées.','Des méduses caramélisées au sucre de palme.','Des papillons grillés au lait de coco.'],correctIndex:0,explanation:'Au Cambodge, notamment dans la région de Skuon, on peut trouver des araignées frites vendues comme spécialité locale.',quote:"Moi qui trouvais déjà les olives à l'apéro aventureuses…"},
  {id:'cuy',topic:'Pérou — Quel animal ?',question:'Au Pérou, quel animal est traditionnellement cuisiné dans certaines régions ?',options:["Le cochon d'Inde, appelé cuy.",'Le chinchilla farci au maïs.','Le lama en croûte de cacao.'],correctIndex:0,explanation:"Le cuy est un plat traditionnel des Andes, notamment au Pérou. Il s'agit du cochon d'Inde, également élevé pour l'alimentation dans certaines communautés.",quote:"Un cochon d'Inde ?! Je vais regarder les animaleries autrement…"},
  {id:'eggs',topic:'Chine — Les œufs de cent ans',question:'En Chine, que sont les fameux « œufs de cent ans » ?',options:['Des œufs couvés pendant cent jours.','Des œufs conservés selon une méthode traditionnelle.','Des œufs cuits dans du thé pendant une semaine.'],correctIndex:1,explanation:"Les œufs de cent ans sont conservés pendant plusieurs semaines ou mois grâce à une méthode traditionnelle. Ils n'ont pas réellement cent ans !",quote:"Cent ans ?! Heureusement que la date limite n'est pas écrite sur la coquille !"},
  {id:'scorpions',topic:'Chine — Brochettes au marché',question:'Sur certains marchés chinois, quelle brochette insolite peut-on trouver ?',options:['Des étoiles de mer fourrées au riz.','Des scorpions grillés.','Des scarabées au caramel salé.'],correctIndex:1,explanation:"On trouve des brochettes de scorpions sur certains marchés touristiques chinois. Il ne s'agit pas d'une pratique représentative de l'ensemble de la cuisine chinoise.",quote:'Je préfère quand même les brochettes qui ne piquent pas avant la cuisson !'}
 ];
 const normalScreens=new Set(['delivery-correction','france-location','spicy-break','journey','apero-intro','apero-end','sauce-intro','sauce-end','france-intro','france-end','gps-intro','gps-end','passport-intro','passport-end','world-intro','world-end','world-transition']);
 const roundKeys=['apero','sauce','france','gps','passport','world'];let nextSession=1;
 function state(game){if(!game.spicy)game.spicy={id:nextSession++,serial:0,seen:[],window:null,used:[],active:null,history:[],finale:null};return game.spicy;}
 function allComplete(game){return Boolean(game&&roundKeys.every(key=>game[key]?.phase==='complete'));}
 function hasQuestion(game){
  if(game.challenge&&!game.challenge.done)return true;
  if(game.apero?.phase==='question'||game.apero?.phase==='bonus'&&!game.apero.bonusRevealed)return true;
  for(const key of ['sauce','france','passport']){const s=game[key];if(s&&(['search','answer','location'].includes(s.phase)||s.phase==='bonus'&&!s.bonus.revealed))return true;}
  if(['placement','compare'].includes(game.gps?.phase)||game.gps?.phase==='bonus'&&!game.gps.bonus.revealed)return true;
  return game.world?.phase==='placement';
 }
 function observe(game){
  if(!game)return null;const s=state(game);
  for(const key of roundKeys){const r=game[key];if(!r?.results)continue;r.results.forEach((result,index)=>{
   if(!result)return;if(['france','passport'].includes(key)&&!result.every(p=>typeof p.region==='string'))return;
   const id=`${key}:${index}`;if(s.seen.includes(id))return;s.seen.push(id);s.window={key:id,ready:false,spent:false};
  });}return s;
 }
 function release(game,key){const s=observe(game);if(!s?.window||s.window.key!==key)return false;s.window.ready=true;return true;}
 function available(game){const s=state(game);return questions.filter(q=>!s.used.includes(q.id));}
 function canNormal(game,context){
  if(!game||!normalScreens.has(context)||(context==='delivery-correction'&&game.apero?.phase!=='correction')||(context==='france-location'&&game.france?.phase!=='correction'))return false;const s=observe(game);
  return Boolean(!s.active&&!s.finale&&!allComplete(game)&&!hasQuestion(game)&&s.window?.ready&&!s.window.spent&&available(game).length&&game.teams.some(t=>t.jokers>0));
 }
 function windowToken(game,context){if(!canNormal(game,context))return null;const s=state(game);return `spicy:${s.id}:window:${s.window.key}`;}
 function beginFinale(game){
  if(!game||!allComplete(game)||hasQuestion(game))return false;const s=state(game);if(s.active)return false;
  if(!s.finale)s.finale={phase:'open',willing:[true,true],lastOwner:null,scores:null};return s.finale.phase==='open';
 }
 function finaleOwners(game){
  const s=state(game),f=s.finale;if(f?.phase!=='open'||s.active||!allComplete(game)||hasQuestion(game)||!available(game).length)return [];
  const eligible=[0,1].filter(team=>f.willing[team]&&game.teams[team].jokers>0);
  if(eligible.length===2&&f.lastOwner!==null)return [1-f.lastOwner];return eligible;
 }
 function finaleToken(game){const s=state(game);return s.finale?.phase==='open'&&!s.active?`spicy:${s.id}:finale:${s.serial}`:null;}
 function willing(game,team,value){const s=state(game);if(s.finale?.phase!=='open'||s.active||![0,1].includes(team)||typeof value!=='boolean')return false;s.finale.willing[team]=value;return true;}
 function start(game,{owner,mode,questionId,context,stamp}){
  if(!game)return false;const s=state(game);if(s.active||![0,1].includes(owner)||!['self','challenge'].includes(mode)||game.teams[owner].jokers<=0||!available(game).some(q=>q.id===questionId))return false;
  const final=s.finale?.phase==='open';
  if(final){if(!allComplete(game)||hasQuestion(game)||context!=='spicy-finale'||stamp!==finaleToken(game)||!finaleOwners(game).includes(owner))return false;}
  else if(!stamp||stamp!==windowToken(game,context))return false;
  if(!final)s.window.spent=true;
  game.teams[owner].jokers--;s.used.push(questionId);s.serial++;
  s.active={id:s.serial,owner,respondent:mode==='self'?owner:1-owner,mode,questionId,selected:null,revealed:false,awardedTo:null,points:0,kind:final?'finale':'normal',boundary:s.window?.key||null};return true;
 }
 function activeToken(game){const s=game?.spicy;return s?.active?`spicy:${s.id}:question:${s.active.id}`:null;}
 function choose(game,index,stamp){const a=game?.spicy?.active;if(!a||a.revealed||stamp!==activeToken(game)||!Number.isInteger(index)||index<0||index>2)return false;a.selected=index;return true;}
 function reveal(game,stamp){
  const s=game?.spicy,a=s?.active;if(!a||a.revealed||a.selected===null||stamp!==activeToken(game))return false;
  const q=questions.find(q=>q.id===a.questionId),correct=a.selected===q.correctIndex;
  a.revealed=true;a.correct=correct;
  a.awardedTo=a.mode==='self'?(correct?a.owner:null):(correct?a.respondent:a.owner);a.points=a.awardedTo===null?0:10;
  if(a.awardedTo!==null)game.teams[a.awardedTo].score+=a.points;
  s.history.push({...a});return true;
 }
 function finish(game,stamp){const s=game?.spicy,a=s?.active;if(!a?.revealed||stamp!==activeToken(game))return false;if(a.kind==='finale')s.finale.lastOwner=a.owner;s.active=null;return true;}
 function closeFinale(game){const s=game?.spicy;if(!s||s.finale?.phase!=='open'||s.active||!allComplete(game)||hasQuestion(game))return false;s.finale.phase='closed';s.finale.scores=game.teams.map(t=>({name:t.name,score:t.score,jokers:t.jokers}));return true;}
 const api={questions,roundKeys,state,observe,allComplete,hasQuestion,release,available,canNormal,windowToken,beginFinale,finaleOwners,finaleToken,willing,start,activeToken,choose,reveal,finish,closeFinale};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SpicyGame=api;
})(globalThis);
