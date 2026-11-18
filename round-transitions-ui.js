'use strict';
function roundOpeners(){return [openApero,openSauce,openFrance,openGps,openPassport,openWorld];}
function roundRenderers(){return [renderApero,renderSauce,renderFrance,renderGps,renderPassport,renderWorld];}
function presentRound(index){
 if(!RoundTransitions.open(game,index))return false;
 renderRoundTransition();return true;
}
function renderRoundTransition(){
 const index=game?.roundTransitions?.pending,data=RoundTransitions.rounds[index];
 if(!data||!RoundTransitions.shouldPresent(game,index))return false;
 $('round-transition-number').textContent=`MANCHE ${String(index+1).padStart(2,'0')}`;
 $('round-transition-title').textContent=data.title;
 $('round-transition-dialogue').textContent=data.dialogue;
 const image=$('round-transition-heroine');image.src=`assets/transitions/${data.image}`;image.alt=data.alt;
 const ref=game;
 $('round-start').onclick=event=>{
  if(event.detail>1||game!==ref||!RoundTransitions.accept(game,index))return;
  roundOpeners()[index]();
 };
 show('round-transition');return true;
}
// Seules les nouvelles parties ayant validé une transition reprennent l’écran de manche.
// Les anciennes sauvegardes gardent leur point d’entrée habituel dans le carnet.
function roundResumeIndex(screen){
 if(!game?.roundTransitions)return null;
 return RoundTransitions.rounds.findIndex((data,index)=>{
  const prefix=index===0?'delivery':data.key;
  return game.roundTransitions.seen[index]&&game[data.key]?.phase!=='complete'&&
   (screen===prefix||screen?.startsWith(prefix+'-')||(index===0&&screen==='apero-bonus'));
 });
}
