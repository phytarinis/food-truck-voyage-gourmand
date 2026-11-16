'use strict';
const progressKey='voyage-gourmand:partie:v1';
function saveProgress(){
 try{
  if(!game){localStorage.removeItem(progressKey);return;}
  const pending=spicyPending?.game===game?{button:spicyPending.button.id,label:spicyPending.label}:null;
  const context=spicySetup?.game===game?spicySetup.context:null;
  localStorage.setItem(progressKey,JSON.stringify({version:1,game,pending,context,savedAt:Date.now(),clock:performance.now()}));
 }catch{/* Une restriction du stockage ne doit jamais bloquer le jeu. */}
}
function restoreProgress(){
 let saved;
 try{saved=JSON.parse(localStorage.getItem(progressKey));}catch{return;}
 if(!saved||saved.version!==1||!saved.game||!Array.isArray(saved.game.teams)||saved.game.teams.length!==2||!saved.game.teams.every(t=>typeof t.name==='string'&&Number.isFinite(t.score)&&t.score>=0&&Number.isInteger(t.jokers)&&t.jokers>=0&&t.jokers<=2))return;
 game=saved.game;
 // La démonstration retirée ne doit pas bloquer une ancienne sauvegarde.
 game.challenge=null;
 // Les chronos restent cohérents quand performance.now() repart après rechargement.
 if(game.gps?.timers)for(const timer of game.gps.timers)if(timer)timer.startedAt=performance.now()-(saved.clock-timer.startedAt)-Math.max(0,Date.now()-saved.savedAt);
 scores();show('journey');
 if(saved.pending&&spicyNextButtons[saved.pending.button])spicyPending={game,button:$(saved.pending.button),label:saved.pending.label};
 if(game.spicy?.active){spicySetup={game,context:saved.context||'journey'};if(game.spicy.active.revealed)renderSpicyCorrection();else renderSpicyQuestion();}
 else if(game.spicy?.finale?.phase==='open')renderSpicyFinale();
 else if(spicyPending)renderSpicyBreak();
}
for(const event of['click','change','submit'])document.addEventListener(event,()=>queueMicrotask(saveProgress));
window.addEventListener('pagehide',saveProgress);
restoreProgress();
