/* La finale ne calcule aucun gain : elle lit le verrou du moteur de jokers. */
(function(root){
 'use strict';
 function snapshot(game){
  const f=game?.spicy?.finale;
  if(f?.phase!=='closed'||!Array.isArray(f.scores)||f.scores.length!==2)return null;
  return f.scores.map(t=>({name:String(t.name),score:t.score}));
 }
 function outcome(game){const teams=snapshot(game);if(!teams)return null;return {teams,winner:teams[0].score===teams[1].score?null:teams[0].score>teams[1].score?0:1};}
 const api={snapshot,outcome};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GrandFinal=api;
})(typeof globalThis!=='undefined'?globalThis:this);
