'use strict';
let finalRevealTimer=null,finalGameRef=null;
const finalReturn=document.createElement('button');finalReturn.id='final-return';finalReturn.className='text-button';finalReturn.textContent='Revenir aux résultats';finalReturn.hidden=true;$('reset').before(finalReturn);
function finalIsClosed(){return Boolean(GrandFinal.snapshot(game));}
function finalText(tag,text,className){const n=document.createElement(tag);n.textContent=text;if(className)n.className=className;return n;}
function syncFinalAccess(id){
 if(finalGameRef!==game){clearTimeout(finalRevealTimer);finalRevealTimer=null;finalGameRef=game;$('final-scores').replaceChildren();$('final-winner').textContent='';$('final-tie').hidden=true;}
 finalReturn.hidden=!finalIsClosed()||id==='final-results';
 if(finalIsClosed()){
  $('play').disabled=true;$('spicy-open').hidden=true;
  if(id==='journey'){
   renderRoute({current:5,completed:[0,1,2,3,4,5]});
   let panel=$('final-career-links');if(!panel){panel=document.createElement('nav');panel.id='final-career-links';panel.className='final-career-links';panel.setAttribute('aria-label','Revoir les cinq pauses métiers');$('journey').append(panel);}
   panel.hidden=false;panel.replaceChildren(finalText('h2','Les cinq pauses métiers'));
   CareerPauses.jobs.forEach((job,i)=>{const b=finalText('button',job.name,'secondary');b.onclick=()=>openFinalCareer(i);panel.append(b)});
  }
 }else if($('final-career-links'))$('final-career-links').hidden=true;
}
function openGrandFinal(){if(!finalIsClosed())return;show('final-arrival');}
const souvenirPaths=[
 ['Galette bretonne','<path d="M8 9 48 8 50 48 9 50Z" fill="var(--orange)"/><path d="m9 9 17 16L48 8M9 50l17-25 24 23" fill="none"/><circle cx="29" cy="28" r="7" fill="var(--cream)"/>'],
 ['Montagnes','<path d="m3 49 18-35 13 22 8-25 16 38Z" fill="var(--sage)"/><path d="m14 28 7-14 8 14-8-4Zm21 1 7-18 8 18-8-5Z" fill="var(--cream)"/>'],
 ['Deux drapeaux','<path d="M11 53V9m26 44V15M12 9h20l-5 9 5 9H12" fill="var(--red)"/><path d="M38 15h18l-5 8 5 8H38" fill="var(--sage)"/>'],
 ['Kangourou','<path d="m16 44 8-16 9-5 1-10 6-8 2 12 8 6-10 4-3 13 12 11H31l-4-8-13 10H4Z" fill="var(--sage)"/><circle cx="42" cy="21" r="1"/>'],
 ['Piment','<use href="#pepper-icon" x="8" y="4" width="45" height="50"/>'],
 ['Globe terrestre','<circle cx="30" cy="29" r="23" fill="var(--sage)"/><ellipse cx="30" cy="29" rx="11" ry="23" fill="none"/><path d="M7 29h46M12 15h36M12 43h36"/>']
];
$('final-souvenirs').replaceChildren(...souvenirPaths.map(([label,art],i)=>{const li=finalText('li','');li.style.setProperty('--order',i);const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 60 60');svg.setAttribute('aria-hidden','true');svg.innerHTML=art;li.append(svg,finalText('span',label));return li;}));
function openFinalResults(){
 const result=GrandFinal.outcome(game);if(!result)return;
 clearTimeout(finalRevealTimer);$('final-scores').replaceChildren();$('final-winner').textContent='';$('final-tie').hidden=true;$('final-reveal').classList.remove('is-revealed');$('final-reveal').setAttribute('aria-busy','true');show('final-results');
 const ref=game;
 const reveal=()=>{if(game!==ref||!finalIsClosed())return;
  $('final-scores').replaceChildren(...result.teams.map((t,i)=>{const card=finalText('article','',`final-score team-${i}${result.winner===i?' final-winning':''}`);card.append(finalText('p',i===0?'ÉQUIPE CORAIL':'ÉQUIPE SAUGE','eyebrow'),finalText('h2',t.name),finalText('strong',`${t.score} points`));return card}));
  $('final-winner').textContent=result.winner===null?'ÉGALITÉ PARFAITE !':`${result.teams[result.winner].name} a mis le feu aux fourneaux !`;
  $('final-tie').hidden=result.winner!==null;$('final-reveal').classList.add('is-revealed');$('final-reveal').setAttribute('aria-busy','false');
 };
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)reveal();else finalRevealTimer=setTimeout(reveal,650);
}
function reviewPhoto(photo){
 const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src=photo.src;img.alt=photo.alt||photo.caption||'';img.loading='lazy';caption.textContent=`${photo.credit||photo.author||'Crédit en attente de vérification'}${photo.license?' — '+photo.license:''}. `;
 for(const [url,label]of[[photo.source,'Source'],[photo.licenseUrl,'Licence']])if(url){const a=finalText('a',label);a.href=url;a.target='_blank';a.rel='noopener';caption.append(a,' · ');}
 caption.append(photo.changes||'Affichage entier, sans nouveau recadrage.');if(photo.history)caption.append(' '+photo.history);figure.append(img,caption);return figure;
}
function finalReviewMap(index,data){
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
 const mainland=index===2?data.region.length===2&&Number(data.region)>6:true;
 const regions=index===4?EuropeMap.countries:index===5?WorldMap.continents:FranceRegions.filter(r=>index===2?r.mainland===mainland&&(mainland||r.code===data.region):r.mainland);
 svg.setAttribute('viewBox',index===4?'0 0 900 680':index===5?'0 0 1000 500':mainland?'0 0 660 560':'0 0 180 120');svg.classList.add('final-review-map');svg.setAttribute('role','img');svg.setAttribute('aria-label',index===3?'Correction géographique : '+data.title:'Destination : '+(data.heading||data.destination||data.title));
 for(const region of regions){const path=document.createElementNS(ns,'path');path.setAttribute('d',region.path);path.setAttribute('fill',(region.code===(data.region||data.continent))?'var(--red)':'var(--sage)');path.setAttribute('stroke','var(--ink)');path.setAttribute('stroke-width','.6');svg.append(path);}
 if(index===3){const shapes=data.id==='rivers'?GpsGeography.rivers:[GpsGeography.zones[data.id]];for(const shape of shapes){const path=document.createElementNS(ns,'path');path.setAttribute('d',shape.path);path.setAttribute('fill',data.id==='rivers'?'none':'var(--red)');path.setAttribute('stroke','var(--red)');path.setAttribute('stroke-width','4');svg.append(path);}}
 if(index===5&&data.id==='pollution'){const z=WorldGame.pollutionTolerance||{west:-170,east:-120,south:20,north:45},a=WorldGame.project([z.west,z.north]),b=WorldGame.project([z.east,z.south]),rect=document.createElementNS(ns,'rect');for(const[k,v]of Object.entries({x:a[0],y:a[1],width:b[0]-a[0],height:b[1]-a[1],fill:'var(--red)',opacity:'.5'}))rect.setAttribute(k,v);svg.append(rect);}
 return svg;
}
function openFinalReview(index){
 if(!finalIsClosed())return;
 const catalogs=[AperoGame.deliveries,SauceGame.puzzles,FranceGame.puzzles,GpsGame.challenges,PassportGame.puzzles,WorldGame.challenges],keys=SpicyGame.roundKeys;
 $('final-review-title').textContent=FoodTruckGame.rounds[index];const content=$('final-review-content');content.replaceChildren();
 catalogs[index].forEach((data,i)=>{const article=document.createElement('article');article.className='final-review-card';article.append(finalText('h2',data.title),finalText('p',data.fact||(data.facts||[]).join(' ')));
  if(index===0)article.append(finalText('p',`${data.city} · ${data.department} (${data.number}) · Préfecture : ${data.prefecture}`));
  const result=game[keys[index]].results[i],awards=Array.isArray(result)?result.map(r=>(r.points||0)+(r.locationPoints||0)):result.awards;
  article.append(finalText('p',awards.map((points,t)=>`${game.teams[t].name} : +${points} points`).join(' · '),'outcome'));
  if([2,3,4,5].includes(index))article.append(finalReviewMap(index,data));
  if(index===0){const map=document.createElement('img');map.src=`assets/maps/france-${data.number}.svg`;map.alt=`Carte de ${data.department} dans la France métropolitaine`;map.className='final-review-map';article.append(map);}
  const photos=index===0?CulturePhotos[data.number]:index===1?[SaucePhotos[data.id]]:index===2?[FrancePhotos[data.id]]:index===4?[PassportPhotos[data.id]]:index===5?[WorldPhotos[data.id]]:[];
  const images=document.createElement('div');images.className='final-review-photos';for(const photo of photos||[])if(photo)images.append(reviewPhoto(photo));article.append(images);
  if(data.photoNote)article.append(finalText('p',data.photoNote));content.append(article);
 });
 const bonuses=[{question:$('apero-bonus-title').textContent,explanation:$('bonus-answer').textContent},SauceGame.bonus,FranceGame.bonus,GpsGame.bonus,PassportGame.bonus];const b=bonuses[index];
 if(b){const card=document.createElement('article');card.className='final-review-card';card.append(finalText('h2','Le bonus collectif · sans points'),finalText('p',b.question||''),finalText('p',b.explanation||''));if(b.options&&Number.isInteger(b.correctIndex))card.append(finalText('strong',b.options[b.correctIndex]));if(b.reference)card.append(finalText('p',b.reference));content.append(card);}
 const source=finalText('a','Sources cartographiques et licences');source.href='assets/maps/ATTRIBUTION.md';source.target='_blank';source.rel='noopener';content.append(source);
 show('final-review-screen');
}
function openFinalCareer(index){if(!finalIsClosed())return;const job=CareerPauses.jobs[index];$('final-review-title').textContent=`${job.name} — ${job.title}`;const content=$('final-review-content');content.replaceChildren(finalText('p','Pause métier · consultation sans points','eyebrow'),finalText('p',`L’idée reçue : « ${job.statements[job.falseIndex]} »`),finalText('p',job.explanation),finalText('p',job.quote,'speech'));job.facts.forEach(f=>content.append(finalText('p',f.text)));show('final-review-screen');}
$('final-to-memories').onclick=()=>{if(finalIsClosed())show('final-memories')};$('final-to-results').onclick=openFinalResults;
finalReturn.onclick=openFinalResults;$('final-review').onclick=()=>{clearTimeout(finalRevealTimer);scores();show('journey')};$('final-review-back').onclick=()=>show('journey');$('final-new-game').onclick=()=>$('reset-dialog').showModal();
$('confirm-reset').addEventListener('click',()=>{clearTimeout(finalRevealTimer);finalRevealTimer=null;spicyPending=null;spicySetup=null;currentCareerIndex=0;gpsSelectedLabel=0;gpsDrag=null;pendingFranceValidation=null;pendingFranceClueToken=null;pendingPassportValidation=null;passportView={key:'',zoom:1,x:450,y:340};if(passportAudio){passportAudio.close().catch(()=>{});passportAudio=null;}document.querySelectorAll('dialog[open]').forEach(d=>d.close());renderRoute();});
