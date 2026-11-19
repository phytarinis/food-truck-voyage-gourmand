/* Manche 6 : sept continents, puis un placement libre dans les océans. */
(function(root){
 'use strict';
 const Flags=typeof module!=='undefined'&&module.exports?require('./flag-choices.js'):root.FlagChoices;
 const map=typeof module!=='undefined'&&module.exports?require('./world-map.js'):root.WorldMap;
 const challenges=[
  {id:'japan',country:'JPN',destination:'Japon',continent:'Asia',title:'Une livraison de sushis !',quote:"Une commande de sushis ? Super ! Mais mon GPS me propose six continents… On va éviter de livrer ça aux pingouins !",instruction:"Sur quel continent se trouve le Japon, pays d'origine des sushis ?",fact:"Les sushis sont une spécialité japonaise. Le Japon est un pays insulaire situé en Asie de l'Est."},
  {id:'australia',country:'AUS',destination:'Australie',continent:'Oceania',title:'Un steak qui fait des bonds !',quote:"Le client veut venir récupérer sa commande en sautant… J'espère qu'il ne va pas atterrir sur le capot !",instruction:"Sur quel continent se trouve l'Australie, célèbre pour ses kangourous ?",fact:"L'Australie fait partie de l'Océanie. Elle est notamment connue pour ses kangourous, des marsupiaux emblématiques du pays."},
  {id:'mexico',country:'MEX',destination:'Mexique',continent:'North America',title:'Les tacos attendent leur livraison !',quote:"Des tacos, ça me connaît ! Mais mon GPS hésite entre l'Amérique du Nord et l'Amérique du Sud… Vous allez devoir m'aider !",instruction:'Sur quel continent se trouve le Mexique, pays des tacos ?',fact:'Le Mexique se situe en Amérique du Nord. Les tacos sont une spécialité traditionnelle mexicaine, préparée avec une tortilla garnie de différents ingrédients.'},
  {id:'morocco',country:'MAR',destination:'Maroc',continent:'Africa',title:'Un couscous en route !',quote:"Un couscous pour le Maroc ! J'ai préparé la semoule, les légumes… mais mon GPS ne sait toujours pas sur quel continent livrer !",instruction:'Sur quel continent se trouve le Maroc ?',fact:"Le Maroc se situe au nord-ouest de l'Afrique. Le couscous est un plat traditionnel partagé par plusieurs pays du Maghreb."},
  {id:'antarctica',destination:'Antarctique',continent:'Antarctica',title:'Une ancienne escale de chasse à la baleine',quote:"Une ancienne escale liée à la chasse à la baleine… Aujourd’hui, notre livraison se limite à l’histoire et à la géographie !",instruction:'Sur quel continent se trouve le pôle Sud ?',fact:"Aux XIXe et XXe siècles, des expéditions ont chassé la baleine dans les mers australes. L’Antarctique entoure le pôle Sud : cette escale historique ne décrit ni une tradition culinaire actuelle ni une chasse pratiquée dans le jeu."},
  {id:'pollution',destination:'Le « septième continent »',title:'Surprise : le « septième continent » !',quote:"Attendez… Mon GPS vient de découvrir un septième continent ! Et apparemment, il est fait de plastique… Vous êtes sûrs qu'on doit livrer là-bas ?!",instruction:'Où se trouve le fameux « septième continent » de déchets ? Placez votre drapeau sur la carte du monde.',fact:"Le « septième continent » n'est pas un véritable continent ni une île solide de déchets. C'est une zone de l'océan Pacifique Nord où les courants concentrent de nombreux déchets plastiques, notamment des microplastiques.",photoNote:'Cette photographie montre des déchets échoués sur une plage à Hawaï. Elle illustre la pollution marine, mais ne représente pas directement la zone d’accumulation du Pacifique Nord.',finalQuote:"Bon… On a fait le tour du monde pour découvrir des spécialités. Pas pour retrouver nos emballages au milieu de l'océan !"}
 ];
 // Marge pédagogique volontairement large, et non frontière scientifique.
 const pollutionTolerance={west:-170,east:-120,south:20,north:45};
 const project=p=>[(p[0]+180)*1000/360,(90-p[1])*500/180];
 const unproject=p=>[p[0]*360/1000-180,90-p[1]*180/500];
 function inRing(point,ring){let inside=false;const[x,y]=point;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if(((a[1]>y)!==(b[1]>y))&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
 function inPolygons(point,polygons){return polygons.some(poly=>inRing(point,poly[0])&&!poly.slice(1).some(r=>inRing(point,r)));}
 function validPoint(p){return Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=-180&&p[0]<=180&&p[1]>=-90&&p[1]<=90;}
 function continentAt(p){if(!validPoint(p))return null;if(p[1]===-90)return 'Antarctica';const xy=project(p);return map.continents.find(c=>inPolygons(xy,c.polygons))?.code||null;}
 function isOcean(p){return validPoint(p)&&!continentAt(p);}
 function inPollutionZone(p){const z=pollutionTolerance;return isOcean(p)&&p[0]>=z.west&&p[0]<=z.east&&p[1]>=z.south&&p[1]<=z.north;}
 let nextId=1;
 function start(game){if(!game.world)game.world={id:nextId++,index:0,phase:'intro',location:null,results:[]};return game.world;}
 function begin(game){if(game.world?.phase!=='intro')return false;game.world.phase='placement';game.world.location=Flags.create();return true;}
 function token(game){const s=game?.world;return s?.phase==='placement'?Flags.token(s.location,`world:${s.id}:${s.index}:flag`):null;}
 function choose(game,choice,stamp){const s=game?.world;return Flags.select(s?.location,choice,stamp,token(game),value=>s.index===5?isOcean(value):map.continents.some(c=>c.code===value));}
 function lock(game,stamp){return Flags.lock(game?.world?.location,stamp,token(game));}
 function reveal(game){
  const s=game?.world;if(s?.phase!=='placement')return false;
  const awards=Flags.reveal(s.location,choice=>s.index===5?inPollutionZone(choice):choice===challenges[s.index].continent,10);
  if(!awards)return false;
  s.results[s.index]={choices:s.location.choices.map(c=>Array.isArray(c)?c.slice():c),awards};s.phase='correction';
  awards.forEach((points,team)=>{game.teams[team].score+=points});return true;
 }
 function next(game){const s=game?.world;if(s?.phase!=='correction'||s.index>=5)return false;s.index++;s.location=Flags.create();s.phase='placement';return true;}
 function finish(game){const s=game?.world;if(s?.phase!=='correction'||s.index!==5||s.results.length!==6||s.results.filter(Boolean).length!==6)return false;s.phase='complete';return true;}
 function totals(game){return[0,1].map(team=>(game.world?.results||[]).reduce((sum,r)=>sum+r.awards[team],0));}
 const api={challenges,pollutionTolerance,project,unproject,continentAt,isOcean,inPollutionZone,start,begin,token,choose,lock,reveal,next,finish,totals};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WorldGame=api;
})(globalThis);
