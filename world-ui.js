'use strict';
function openWorld(){WorldGame.start(game);game.routeCurrent=5;renderWorld();}
function worldContinentName(code){return WorldMap.continents.find(c=>c.code===code)?.name||'';}
function renderWorld(){
 scores();const s=game.world;
 if(s.phase==='intro'){show('world-intro');return;}
 if(s.phase==='complete'){
  $('world-totals').replaceChildren(...WorldGame.totals(game).map((total,team)=>{
   const card=document.createElement('article');card.className=`delivery-award team-${team}`;
   const title=document.createElement('h2');title.textContent=game.teams[team].name;
   const list=document.createElement('ul');s.results.forEach((r,index)=>{const li=document.createElement('li');li.textContent=`${WorldGame.challenges[index].destination} : +${r.awards[team]} points`;list.append(li)});
   const sum=document.createElement('p');sum.textContent=`Manche 6 : ${total} / 60 points`;
   const cumulative=document.createElement('strong');cumulative.textContent=`Score cumulé : ${game.teams[team].score} points`;
   card.append(title,list,sum,cumulative);return card;
  }));show('world-end');return;
 }
 renderWorldChallenge();show('world-challenge');
}
function renderWorldChallenge(){
 const s=game.world,l=s.location,data=WorldGame.challenges[s.index],bothLocked=l.locked.every(Boolean),corrected=s.phase==='correction',stamp=WorldGame.token(game);
 $('world-progress').textContent=`MANCHE 06 / DÉFI ${s.index+1} SUR 6`;
 $('world-challenge-title').textContent=data.title;$('world-instruction').textContent=data.instruction;
 $('world-turn').textContent=bothLocked?(corrected?'Destination révélée':'Les deux drapeaux sont plantés !'):`${game.teams[l.activeTeam].name} · drapeau ${l.activeTeam===0?'corail':'sauge'}`;
 $('world-turn').className=`world-turn${bothLocked?'':` team-${l.activeTeam}`}`;
 $('world-choice').textContent=bothLocked?'Les propositions sont verrouillées.':l.choices[l.activeTeam]===null?(s.index===5?'Cliquez dans l’océan pour poser votre drapeau.':'Cliquez directement sur une zone pour poser votre drapeau.'):'Drapeau posé. Vous pouvez encore le déplacer.';
 $('world-lock').hidden=bothLocked;$('world-lock').disabled=!stamp||l.choices[l.activeTeam]===null;$('world-lock').textContent=`Valider le drapeau ${l.activeTeam===0?'corail':'sauge'}`;
 $('world-lock').onclick=()=>{if(WorldGame.lock(game,stamp)){renderWorldChallenge();if(game.world.location.locked.every(Boolean))$('world-reveal').focus();else $('world-turn').focus()}};
 $('world-reveal').hidden=!bothLocked||corrected;$('world-reveal').textContent=s.index===5?'Révéler le septième continent':'Révéler la destination';
 $('world-next').hidden=!corrected;$('world-next').textContent=s.index===5?'BILAN DE LA MANCHE →':'DESTINATION SUIVANTE →';
 $('world-character').hidden=corrected;$('world-quote').textContent=corrected?'':data.quote;
 $('world-verdict').hidden=!corrected;$('world-verdict').replaceChildren();
 $('world-discovery').hidden=!corrected;$('world-photo').replaceChildren();$('world-fact').textContent='';$('world-discovery-title').textContent='';
 $('world-photo-note').hidden=true;$('world-photo-note').textContent='';$('world-zone-note').hidden=true;$('world-zone-note').textContent='';$('world-final-quote').hidden=true;$('world-final-quote').textContent='';
 if(corrected){
  const title=document.createElement('h2');title.textContent=s.index===5?'Pacifique Nord':worldContinentName(data.continent);
  const awards=document.createElement('p');awards.textContent=s.results[s.index].awards.map((points,team)=>`${game.teams[team].name} : +${points} points`).join(' · ');$('world-verdict').append(title,awards);
  $('world-discovery-title').textContent=s.index===5?'Une accumulation de déchets, pas un continent.':`${data.destination} · ${worldContinentName(data.continent)}`;
  $('world-fact').textContent=data.fact;renderWorldPhoto(data);
  if(data.photoNote){$('world-photo-note').hidden=false;$('world-photo-note').textContent=data.photoNote;$('world-final-quote').hidden=false;$('world-final-quote').textContent=data.finalQuote;$('world-zone-note').hidden=false;$('world-zone-note').textContent='La zone dessinée est un repère pédagogique indicatif. Elle ne représente pas une frontière scientifique du phénomène.';}
 }
 $('world-map-help').hidden=bothLocked;
 $('world-map-help').textContent=s.index===5?'Placement libre dans tous les océans. Cliquez pour déplacer le drapeau. Clavier : Tab sur la carte, puis flèches (Maj pour aller plus vite).':'Les zones suivent une convention à sept continents. Au clavier : Tab, puis Entrée ou Espace sur une zone.';
 renderWorldMap();
}
function renderWorldMap(){
 const s=game.world,l=s.location,data=WorldGame.challenges[s.index],corrected=s.phase==='correction',stamp=WorldGame.token(game),free=s.index===5;
 const select=code=>{if(WorldGame.choose(game,code,stamp)){renderWorldChallenge();$('world-map-board').querySelector(`[data-region="${code}"]`).focus({preventScroll:true})}};
 const svg=FlagMap.render({regions:WorldMap.continents,location:l,correctCode:data.continent,canSelect:!free&&stamp,onSelect:select,showLabels:false,showNames:corrected,viewBox:'0 0 1000 500',label:free?'Planisphère : placement libre dans les océans':'Planisphère : choisissez une des sept zones',flagScale:1.4,exactAnchor:true,anonymousLabel:'Zone'});
 svg.id='world-planisphere';
 const background=FlagMap.svg('rect',{x:0,y:0,width:1000,height:500,class:'world-ocean'});svg.insertBefore(background,svg.firstChild);
 if(corrected){
  if(free){
   const z=WorldGame.pollutionTolerance,[x,y]=WorldGame.project([z.west,z.north]),[right,bottom]=WorldGame.project([z.east,z.south]);
   const zone=FlagMap.svg('rect',{x,y,width:right-x,height:bottom-y,rx:9,class:'world-pollution-zone',role:'img','aria-label':'Zone pédagogique indicative dans le Pacifique Nord, sans frontière scientifique'});svg.insertBefore(zone,svg.querySelector('.france-region'));
   const label=FlagMap.svg('text',{x:x+(right-x)/2,y:y-12,'text-anchor':'middle',class:'world-map-label'});label.textContent='Pacifique Nord';svg.append(label);
  }else if(data.country){
   const destination=WorldMap.destinations[data.country],outline=FlagMap.svg('path',{d:destination.path,class:'world-destination',role:'img','aria-label':data.destination});svg.insertBefore(outline,svg.querySelector('.france-flag'));
   const dot=FlagMap.svg('circle',{cx:destination.point[0],cy:destination.point[1],r:4,class:'world-destination-dot'});const label=FlagMap.svg('text',{x:destination.point[0]+8,y:destination.point[1]+16,class:'world-map-label'});label.textContent=data.destination;svg.append(dot,label);
  }
 }
 if(free){
  const teams=FlagChoices.visibleTeams(l).filter(team=>l.choices[team]!==null),points=teams.map(team=>WorldGame.project(l.choices[team]));
  const shared=teams.length===2&&Math.hypot(points[0][0]-points[1][0],points[0][1]-points[1][1])<65;
  teams.forEach((team,i)=>{
   const actual=points[i];let x=Math.max(2,Math.min(960,actual[0])),foot=Math.max(56,Math.min(492,actual[1]));
   if(shared){const base=Math.max(60,Math.min(940,(points[0][0]+points[1][0])/2));x=base+(team===0?-42:12);foot=Math.max(56,Math.min(492,(points[0][1]+points[1][1])/2));}
   if(Math.hypot(x-actual[0],foot-actual[1])>2)svg.append(FlagMap.svg('path',{d:`M${actual[0]},${actual[1]}L${x},${foot}`,class:`world-flag-link team-${team}`}));
   svg.append(FlagMap.svg('circle',{cx:actual[0],cy:actual[1],r:3,class:`world-point team-${team}`}));
   svg.append(FlagMap.flag({x,y:foot-53.2,team,name:'Position choisie dans l’océan',scale:1.4}));
  });
  svg.setAttribute('tabindex',stamp?'0':'-1');svg.setAttribute('aria-label','Placement libre du drapeau dans les océans : utiliser les flèches pour déplacer');
  function place(point){if(!stamp)return;if(WorldGame.choose(game,point,stamp)){renderWorldChallenge();$('world-planisphere').focus({preventScroll:true});}else $('world-choice').textContent='Choisissez un point dans l’océan, en dehors des terres.';}
  svg.addEventListener('pointerup',event=>{if(!stamp||event.button!==0)return;const xy=new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());if(xy.x<0||xy.x>1000||xy.y<0||xy.y>500)return;place(WorldGame.unproject([xy.x,xy.y]));});
  svg.addEventListener('keydown',event=>{
   if(!stamp||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const p=(l.choices[l.activeTeam]||[0,0]).slice(),step=event.shiftKey?5:1;
   p[0]=Math.max(-180,Math.min(180,p[0]+(event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0)));p[1]=Math.max(-90,Math.min(90,p[1]+(event.key==='ArrowDown'?-step:event.key==='ArrowUp'?step:0)));place(p);
  });
 }
 $('world-map-board').replaceChildren(svg);$('world-map-board').dataset.activeTeam=String(l.activeTeam);
}
function appendWorldPhotoCredit(container,photo){
 container.append(`Photo : ${photo.author} — ${photo.license}. `);
 for(const[url,label]of[[photo.source,'Source Wikimedia Commons'],[photo.licenseUrl,photo.license]]){const a=document.createElement('a');a.href=url;a.textContent=label;a.target='_blank';a.rel='noopener';container.append(a,' · ');}
 container.append(photo.changes||'Image affichée entière, sans retouche ni recadrage par le jeu.');
 if(photo.history){const p=document.createElement('p');p.textContent=photo.history+' ';const a=document.createElement('a');a.href=photo.historyUrl;a.textContent='CC BY 2.0';a.target='_blank';a.rel='noopener';p.append(a);container.append(p);}
}
function renderWorldPhoto(data){
 const photo=WorldPhotos[data.id],image=document.createElement('img');image.src=photo.src;image.alt=photo.alt;image.decoding='async';
 const caption=document.createElement('figcaption');appendWorldPhotoCredit(caption,photo);
 const full=document.createElement('a');full.href=photo.original;full.textContent='Voir le fichier original';full.target='_blank';full.rel='noopener';caption.append(' · ',full);$('world-photo').replaceChildren(image,caption);
}
function appendWorldPhotoCredits(container){
 if(!game?.world)return;
 WorldGame.challenges.forEach((data,index)=>{
  if(!game.world.results[index])return;
  const article=document.createElement('article'),title=document.createElement('h3'),credit=document.createElement('div');title.textContent=`Manche 6 — ${data.destination}`;appendWorldPhotoCredit(credit,WorldPhotos[data.id]);article.append(title,credit);container.append(article);
 });
}
$('world-begin').addEventListener('click',()=>{if(WorldGame.begin(game))renderWorld()});
$('world-reveal').addEventListener('click',()=>{if(WorldGame.reveal(game)){scores();renderWorldChallenge();$('world-verdict').focus()}});
$('world-next').addEventListener('click',()=>{const s=game.world;if(s.index===5){if(WorldGame.finish(game))renderWorld()}else if(WorldGame.next(game))renderWorld()});
$('world-finish-journey').addEventListener('click',()=>{if(game?.world?.phase==='complete'){scores();show('world-transition')}});
document.querySelectorAll('.world-back').forEach(button=>button.addEventListener('click',()=>{scores();show('journey')}));
