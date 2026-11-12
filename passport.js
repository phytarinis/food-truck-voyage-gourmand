/* Manche 5 : le moteur commun de la manche 3, avec les destinations européennes. */
(function(root){
 'use strict';
 const createRound=typeof module!=='undefined'&&module.exports?require('./clue-flags.js'):root.createClueFlagRound;
 const map=typeof module!=='undefined'&&module.exports?require('./europe-map.js'):root.EuropeMap;
 const puzzles=[
  {id:'belgium',answer:'Belgique',searchTitle:'Destination mystère : où va-t-on manger ?',title:'Direction la Belgique !',region:'BEL',capital:'Bruxelles',heading:'Bienvenue à Bruxelles !',photo:'Photographie de frites belges à venir',fact:"La Belgique est un pays voisin de la France. Sa capitale, Bruxelles, accueille plusieurs institutions européennes. Le pays est réputé notamment pour ses frites, ses gaufres et son chocolat.",clues:[
   "Mon pays accueille plusieurs institutions importantes de l'Union européenne.",
   'Ma capitale est Bruxelles et je partage une frontière avec la France.',
   'Je suis célèbre pour mes frites, mes gaufres et mon chocolat.'
  ]},
  {id:'portugal',answer:'Portugal',searchTitle:'Destination mystère n° 2',title:'Direction le Portugal !',region:'PRT',capital:'Lisbonne',heading:'Cap sur Lisbonne !',photo:'Photographie de pastéis de nata à venir',fact:"Le Portugal se situe à l'ouest de l'Espagne, au bord de l'océan Atlantique. Sa capitale est Lisbonne. Les pastéis de nata sont des petites pâtisseries traditionnelles à base de crème.",clues:[
   'Je suis un pays européen connu pour ses explorateurs qui ont parcouru les océans.',
   "Je possède une longue façade sur l'océan Atlantique et je partage ma seule frontière terrestre avec l'Espagne.",
   "Ma capitale est Lisbonne et l'une de mes spécialités sucrées est le pastel de nata."
  ]},
  {id:'romania',answer:'Roumanie',searchTitle:'Livraison urgente',title:'Direction la Roumanie !',region:'ROU',capital:'Bucarest',heading:'Bienvenue au pays de Dracula !',quote:'Livraison urgente ! Le client a demandé sa viande très, très saignante !',photo:'Photographie du château de Bran à venir',fact:"La Roumanie se situe en Europe de l'Est et sa capitale est Bucarest. La Transylvanie est une région historique associée aux légendes de vampires et au personnage fictif de Dracula.",clues:[
   "Je suis un pays d'Europe traversé par les montagnes des Carpates.",
   'Une de mes régions les plus célèbres est la Transylvanie, associée à de nombreuses légendes.',
   'Ma capitale est Bucarest et je suis souvent associé à la légende de Dracula.'
  ]}
 ];
 const bonus={title:'BONUS — STRASBOURG, PAS QUE DES SAUCISSES !',question:'Strasbourg est connue pour sa célèbre saucisse… mais pas seulement ! Quelle autre particularité possède cette ville française ?',options:["Elle accueille le Parlement européen.","Elle a été l'ancienne capitale de la France.","Elle accueillera les prochains Jeux olympiques."],correctIndex:0,explanation:"Strasbourg est le siège officiel du Parlement européen. Les députés européens s'y réunissent notamment pour les sessions plénières."};
 const api=createRound({key:'passport',points:[20,15,10],puzzles,bonus,regionCodes:map.countries.map(r=>r.code)});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PassportGame=api;
})(globalThis);
