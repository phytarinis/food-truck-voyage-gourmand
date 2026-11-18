/* Manche 5 : le moteur commun de la manche 3, avec les destinations européennes. */
(function(root){
 'use strict';
 const createRound=typeof module!=='undefined'&&module.exports?require('./clue-flags.js'):root.createClueFlagRound;
 const map=typeof module!=='undefined'&&module.exports?require('./europe-map.js'):root.EuropeMap;
 const puzzles=[
  {id:'belgium',answer:'Belgique',searchTitle:'Destination mystère n° 1',title:'Direction la Belgique !',region:'BEL',capital:'Bruxelles',heading:'Bienvenue à Bruxelles !',photo:'Photographie de frites belges à venir',fact:"Bruxelles, capitale de la Belgique, accueille plusieurs institutions européennes. Ce pays voisin de la France est réputé pour ses frites, ses gaufres et son chocolat.",clues:[
   "Mon pays accueille plusieurs institutions importantes de l'Union européenne.",
   'Ma capitale est Bruxelles et je partage une frontière avec la France.',
   'Je suis célèbre pour mes frites, mes gaufres et mon chocolat.'
  ]},
  {id:'portugal',answer:'Portugal',searchTitle:'Destination mystère n° 2',title:'Direction le Portugal !',region:'PRT',capital:'Lisbonne',heading:'Cap sur Lisbonne !',photo:'Photographie de pastéis de nata à venir',fact:"Le Portugal, dont la capitale est Lisbonne, borde l’Atlantique à l’ouest de l’Espagne. Les pastéis de nata sont de petites pâtisseries traditionnelles à la crème.",clues:[
   'Je suis un pays européen connu pour ses explorateurs qui ont parcouru les océans.',
   "Je possède une longue façade sur l'océan Atlantique et je partage ma seule frontière terrestre avec l'Espagne.",
   "Ma capitale est Lisbonne et l'une de mes spécialités sucrées est le pastel de nata."
  ]},
  {id:'romania',answer:'Roumanie',searchTitle:'Destination mystère n° 3',title:'Direction la Roumanie !',region:'ROU',capital:'Bucarest',heading:'Bienvenue au pays de Dracula !',photo:'Photographie du château de Bran à venir',fact:"La Roumanie se situe en Europe de l'Est et sa capitale est Bucarest. La Transylvanie est une région historique associée aux légendes de vampires et au personnage fictif de Dracula.",clues:[
   "Je suis un pays d'Europe traversé par les montagnes des Carpates.",
   'Une de mes régions les plus célèbres est la Transylvanie, associée à de nombreuses légendes.',
   'Ma capitale est Bucarest. Livraison urgente : mon client a demandé sa viande très, très saignante… comme dans les histoires de Dracula !'
  ]}
 ];
 const bonus={title:'DÉFI — STRASBOURG, PAS QUE DES SAUCISSES !',question:'Strasbourg est connue pour sa célèbre saucisse… mais pas seulement ! Quelle autre particularité possède cette ville française ?',options:["Elle accueille le Parlement européen.","Elle a été l'ancienne capitale de la France.","Elle accueillera les prochains Jeux olympiques."],correctIndex:0,explanation:"Strasbourg est le siège officiel du Parlement européen. Les députés européens s'y réunissent notamment pour les sessions plénières."};
 const api=createRound({key:'passport',points:[20,15,10],puzzles,bonus,regionCodes:map.countries.map(r=>r.code)});
 // Annulation propre à la manche 5 : mémoriser l'état avant la dernière validation.
 const validate=api.validate, chooseRegion=api.chooseRegion, next=api.next;
 api.validate=(game,team,correct,stamp)=>{
  if(game.spicy?.active)return false;
  const s=game.passport;
  if(!s)return false;
  const {lastValidation,...state}=s;
  const snapshot=JSON.parse(JSON.stringify(state));
  if(!validate(game,team,correct,stamp))return false;
  s.lastValidation={state:snapshot,team,points:correct?api.points[snapshot.clueIndex]:0};
  return true;
 };
 api.undoValidation=game=>{
  const s=game.passport,undo=s?.lastValidation;
  if(!undo||game.spicy?.active||!['search','answer','location'].includes(s.phase))return false;
  // Aucun jeton déjà émis ne doit redevenir valide après une annulation.
  const revision=Math.max(...s.players.map(p=>p.revision),...undo.state.players.map(p=>p.revision))+1;
  game.teams[undo.team].score-=undo.points;
  game.passport=undo.state;
  game.passport.players.forEach(p=>p.revision=revision);
  return true;
 };
 api.chooseRegion=(game,code,stamp)=>{
  if(!chooseRegion(game,code,stamp))return false;
  delete game.passport.lastValidation;return true;
 };
 api.next=game=>{if(!next(game))return false;delete game.passport.lastValidation;return true;};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PassportGame=api;
})(globalThis);
