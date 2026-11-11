/* Manche 4 : placements successifs et correction collective, sans modifier les autres manches. */
(function(root){
 'use strict';
 const geography=typeof module!=='undefined'&&module.exports?require('./gps-geography.js'):root.GpsGeography;
 const challenges=[
  {id:'pyrenees',title:'Mais où sont passées les Pyrénées ?',instruction:"Déplacez la chaîne de montagnes à l'endroit où se trouvent les Pyrénées.",quote:"Il me dit que les Pyrénées sont au nord de la France… Vous êtes sûrs qu'il fonctionne, ce truc ?",duration:0,reveal:'Révéler les Pyrénées',facts:["Les Pyrénées forment une chaîne de montagnes entre la France et l'Espagne. Elles s'étendent de l'océan Atlantique à la mer Méditerranée."]},
  {id:'rivers',title:"Le GPS s'emmêle les fleuves !",instruction:'Placez les trois noms sur les bons fleuves.',quote:"La Garonne, la Seine, le Rhin… Il me donne trois noms et il ne sait même plus où ils coulent !",duration:45,reveal:'Révéler les fleuves',facts:["Garonne : traverse notamment Toulouse et Bordeaux avant de rejoindre l'estuaire de la Gironde.","Seine : traverse notamment Paris et Rouen avant de se jeter dans la Manche.","Rhin : longe notamment une partie de la frontière entre la France et l'Allemagne, avant de poursuivre vers la mer du Nord."]},
  {id:'alps',title:'Livraison urgente dans les Alpes !',instruction:'Retrouvez les Alpes et placez le food truck au bon endroit !',quote:"Alerte fondue ! Si on n'arrive pas rapidement, le fromage va figer ! Et une fondue solide, ça va être compliqué à servir…",duration:30,reveal:'Révéler les Alpes',facts:["Les Alpes se situent dans l'est et le sud-est de la France, notamment près des frontières suisse et italienne. Elles abritent le massif du Mont-Blanc."]}
 ];
 const riverLabels=['GARONNE','SEINE','RHIN'];
 const bonus={title:'Fleuve ou rivière : quelle différence ?',question:'Quelle est la différence entre un fleuve et une rivière ?',options:["Un fleuve est toujours plus long qu'une rivière.","Un fleuve se jette dans la mer ou l'océan, tandis qu'une rivière rejoint un autre cours d'eau.","Un fleuve traverse plusieurs départements, contrairement à une rivière."],correctIndex:1,explanation:"Ce n'est pas la taille du cours d'eau qui fait la différence. Un fleuve rejoint directement la mer ou l'océan, tandis qu'une rivière se jette dans un autre cours d'eau.",quote:"Bon, maintenant je sais reconnaître un fleuve… Reste à éviter de garer le camion dedans !"};
 let nextId=1;
 const freshPlacements=index=>index===1?[[null,null,null],[null,null,null]]:[null,null];
 function start(game){if(!game.gps)game.gps={id:nextId++,index:0,phase:'intro',team:0,locked:[false,false],placements:freshPlacements(0),timers:[null,null],results:[],bonus:{selected:null,revealed:false}};return game.gps;}
 function begin(game){if(game.gps?.phase!=='intro')return false;game.gps.phase='placement';return true;}
 function token(game){const s=game?.gps;return s?.phase==='placement'&&!s.locked[s.team]?`${s.id}:${s.index}:${s.team}`:null;}
 function project(point){const p=geography.projection;return [p.dx+(point[0]*p.cos-p.xmin)*p.scale,p.dy+(p.ymax-point[1])*p.scale];}
 function unproject(point){const p=geography.projection;return [((point[0]-p.dx)/p.scale+p.xmin)/p.cos,p.ymax-(point[1]-p.dy)/p.scale];}
 function placePoint(game,point,stamp){
  const current=token(game),s=game?.gps;
  if(!current||stamp!==current||s.index===1||!Array.isArray(point)||point.length!==2||!point.every(Number.isFinite))return false;
  const [x,y]=project(point);if(x<0||x>660||y<0||y>560)return false;
  s.placements[s.team]=point.slice();return true;
 }
 function placeRiver(game,label,slot,stamp){
  const current=token(game),s=game?.gps;
  if(!current||current!==stamp||s.index!==1||!Number.isInteger(label)||label<0||label>2||!geography.rivers.some(r=>r.id===slot))return false;
  const placements=s.placements[s.team],previous=placements[label],occupant=placements.indexOf(slot);
  if(occupant>=0&&occupant!==label)placements[occupant]=previous;
  placements[label]=slot;return true;
 }
 function ready(game){const s=game?.gps;return Boolean(token(game)&&(s.index===1?s.placements[s.team].every(Boolean):s.placements[s.team]));}
 function startTimer(game,stamp,now){
  const s=game?.gps;if(!token(game)||stamp!==token(game)||!Number.isFinite(now)||!challenges[s.index].duration||s.timers[s.team]!==null)return false;
  s.timers[s.team]={startedAt:now};return true;
 }
 function remaining(game,now){
  const s=game.gps,duration=challenges[s.index].duration*1000,timer=s.timers[s.team];
  return Math.max(0,duration-(timer?Math.max(0,now-timer.startedAt):0));
 }
 function lock(game,stamp,now){
  const current=token(game),s=game?.gps;if(!current||current!==stamp||!ready(game)||!Number.isFinite(now))return false;
  s.locked[s.team]=true;
  if(s.team===0){s.team=1;if(challenges[s.index].duration)s.timers[1]={startedAt:now};}
  else s.phase='compare';return true;
 }
 function inRing(point,ring){let inside=false;const [x,y]=point;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))inside=!inside;}return inside;}
 function inZone(point,zone){return geography.zones[zone].tolerance.some(polygon=>inRing(point,polygon[0])&&!polygon.slice(1).some(ring=>inRing(point,ring)));}
 function awarded(index,placement){
  if(index===1)return riverLabels.reduce((sum,label,i)=>sum+(geography.rivers.find(r=>r.id===placement[i])?.name.toLocaleUpperCase('fr')===label?5:0),0);
  return inZone(placement,index===0?'pyrenees':'alps')?15:0;
 }
 function reveal(game){
  const s=game?.gps;if(s?.phase!=='compare'||!s.locked.every(Boolean))return false;
  const awards=s.placements.map(p=>awarded(s.index,p));s.phase='correction';
  s.results[s.index]={awards,placements:s.placements.map(p=>p.slice())};awards.forEach((points,team)=>{game.teams[team].score+=points;});return true;
 }
 function next(game){const s=game?.gps;if(s?.phase!=='correction')return false;if(s.index===2)s.phase='bonus';else{s.index++;s.phase='placement';s.team=0;s.locked=[false,false];s.placements=freshPlacements(s.index);s.timers=[null,null];}return true;}
 function chooseBonus(game,index){const s=game?.gps;if(s?.phase!=='bonus'||s.bonus.revealed||!Number.isInteger(index)||index<0||index>2)return false;s.bonus.selected=index;return true;}
 function revealBonus(game){const s=game?.gps;if(s?.phase!=='bonus'||s.bonus.revealed||s.bonus.selected===null)return false;s.bonus.revealed=true;return true;}
 function finish(game){const s=game?.gps;if(s?.phase!=='bonus'||!s.bonus.revealed)return false;s.phase='complete';return true;}
 function totals(game){return [0,1].map(team=>(game.gps?.results||[]).reduce((sum,r)=>sum+r.awards[team],0));}
 const api={challenges,riverLabels,bonus,start,begin,token,project,unproject,placePoint,placeRiver,ready,startTimer,remaining,lock,inZone,reveal,next,chooseBonus,revealBonus,finish,totals};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GpsGame=api;
})(globalThis);
