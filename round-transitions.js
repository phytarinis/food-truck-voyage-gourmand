/* Présentations narratives : aucun calcul de score ni changement de phase de jeu. */
(function(root){
 'use strict';
 const rounds=[
  {key:'apero',title:"L'apéro local",dialogue:"Avant de partir à l'autre bout du monde, vérifions déjà si vous savez où on habite !",image:'01-carte-locale.png',alt:'Notre héroïne tenant une carte routière locale.'},
  {key:'sauce',title:'À quelle sauce ?',dialogue:'On reste en Nouvelle-Aquitaine. Ici, même les spécialités ont du caractère !',image:'02-cuisine.png',alt:'Notre héroïne en tablier, une cuillère de cuisine à la main.'},
  {key:'france',title:'La France et ses spécialités',dialogue:"Livraison nationale ! J'espère que votre GPS est meilleur que le mien…",image:'03-commandes.png',alt:'Notre héroïne avec son carnet de commandes et un crayon.'},
  {key:'gps',title:'Le GPS a perdu la boule !',dialogue:'Mon GPS confond les montagnes et les fleuves. Ça promet pour les livraisons !',image:'04-gps-envers.png',alt:'Notre héroïne perplexe tenant un GPS à l’envers.'},
  {key:'passport',title:'Passeport gourmand',dialogue:"Direction l'Europe ! Carte d'identité en poche… enfin, je crois !",image:'05-carte-identite.png',alt:'Notre héroïne montrant une carte d’identité, et non un passeport.'},
  {key:'world',title:'Tour du monde',dialogue:"Cette fois, on traverse les continents ! J'espère que le camion sait nager.",image:'06-tour-du-monde.png',alt:'Notre héroïne avec une valise et un globe terrestre.'}
 ];
 function shouldPresent(game,index){
  if(!game||!Number.isInteger(index)||!rounds[index]||game.roundTransitions?.seen?.[index])return false;
  // Une ancienne partie déjà engagée reprend son défi, même sans cet indicateur récent.
  const round=game[rounds[index].key];
  return !round||round.phase==='intro';
 }
 function open(game,index){
  if(!shouldPresent(game,index))return false;
  game.roundTransitions ||= {seen:{},pending:null};
  game.roundTransitions.pending=index;return true;
 }
 function accept(game,index){
  const state=game?.roundTransitions;
  if(!state||state.pending!==index||!shouldPresent(game,index))return false;
  state.seen[index]=true;state.pending=null;return true;
 }
 const api={rounds,shouldPresent,open,accept};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RoundTransitions=api;
})(globalThis);
