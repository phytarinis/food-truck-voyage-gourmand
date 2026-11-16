'use strict';
let passportSelectedTeam = null;
function openPassport() {
  PassportGame.start(game); game.routeCurrent = 4; renderPassport();
}
function renderPassport() {
  const s = game.passport;
  if (s.phase === 'intro') PassportGame.begin(game);
  const next = PassportGame.nextClueToken(game);
  if (next) PassportGame.revealNextClue(game, next);
  if (s.phase === 'answer') PassportGame.startLocation(game);
  // Reprise des anciennes sauvegardes, y compris une correction déjà révélée.
  if (s.phase === 'location' && s.location.locked.every(Boolean)) {
    PassportGame.revealLocation(game);
    PassportGame.discover(game);
  }
  scores();
  if (s.phase === 'search') { renderPassportSearch(); show('passport-search'); return; }
  if (['location', 'correction'].includes(s.phase)) { renderPassportLocation(); show('passport-location'); return; }
  if (s.phase === 'bonus') { renderPassportBonus(); show('passport-bonus'); return; }
  openCareerPause(4);
}
function renderPassportSearch() {
  const s = game.passport, puzzle = PassportGame.puzzles[s.puzzleIndex];
  const available = s.players.map((p, team) => p.status === 'searching' ? team : -1).filter(team => team >= 0);
  if (!available.includes(passportSelectedTeam)) passportSelectedTeam = available[0];
  const team = passportSelectedTeam;
  $('passport-progress').textContent = `MANCHE 05 / ÉNIGME ${s.puzzleIndex + 1} SUR 3`;
  $('passport-live').textContent = '';
  // Ne pas signaler une réussite via le score avant la réponse de l'autre équipe.
  $('passport-search').querySelectorAll('.score-points').forEach((node, t) => {
    const player = s.players[t];
    const pending = player.status === 'found' && player.clueIndex === s.clueIndex && s.players.some(p => p.status === 'searching');
    node.textContent = `${game.teams[t].score - (pending ? player.points : 0)} pts`;
  });
  $('passport-destination-title').textContent = puzzle.searchTitle;
  $('passport-mystery').hidden = !puzzle.quote;
  $('passport-mystery-quote').textContent = puzzle.quote || '';
  $('passport-sound-status').textContent = '';
  const panel = document.createElement('article'); panel.className = 'passport-common-clue';
  const info = document.createElement('div'); info.className = 'sauce-clue-info';
  info.textContent = `INDICE ${s.clueIndex + 1} / 3 · ${PassportGame.points[s.clueIndex]} points possibles`;
  const clue = document.createElement('p'); clue.className = 'sauce-current-clue'; clue.textContent = puzzle.clues[s.clueIndex];
  const selector = document.createElement('div'); selector.className = 'passport-team-selector'; selector.setAttribute('aria-label', 'Équipe à valider');
  for (const t of available) {
    const button = document.createElement('button'); button.type = 'button'; button.className = `secondary team-${t}`;
    button.textContent = game.teams[t].name; button.setAttribute('aria-pressed', String(t === team));
    button.onclick = () => { passportSelectedTeam = t; renderPassportSearch(); };
    selector.append(button);
  }
  const turn = document.createElement('h2'); turn.id = 'passport-active-team'; turn.tabIndex = -1;
  turn.textContent = `Réponse de ${game.teams[team].name}`;
  const controls = document.createElement('div'); controls.className = 'sauce-controls';
  for (const correct of [false, true]) {
    const button = document.createElement('button'); button.type = 'button'; button.className = correct ? 'primary' : 'secondary';
    button.textContent = correct ? '✓ Bonne réponse' : '✕ Mauvaise réponse';
    button.dataset.team = String(team); button.dataset.correct = String(correct);
    button.setAttribute('aria-label', `${correct ? 'Bonne' : 'Mauvaise'} réponse pour ${game.teams[team].name}`);
    const stamp = PassportGame.token(game, team);
    button.onclick = event => {
      if (event.detail > 1 || game?.spicy?.active || !PassportGame.validate(game, team, correct, stamp)) return;
      passportSelectedTeam = null; renderPassport();
      if (game.passport.phase === 'search') $('passport-active-team').focus({preventScroll:true});
    };
    controls.append(button);
  }
  panel.append(info, clue, selector, turn, controls);
  $('passport-panels').replaceChildren(panel);
  syncPassportUndo();
}
function syncPassportUndo() {
  for (const button of document.querySelectorAll('.passport-undo')) button.hidden = !game.passport.lastValidation;
}
for (const button of document.querySelectorAll('.passport-undo')) button.onclick = () => {
  if (!game?.spicy?.active && PassportGame.undoValidation(game)) { passportSelectedTeam = null; renderPassport(); }
};
function passportRegionName(code) { return EuropeMap.countries.find(region => region.code === code)?.name || ''; }
function renderPassportBonus() {
  const state = game.passport.bonus, data = PassportGame.bonus;
  $('passport-bonus-title').textContent = data.title;
  $('passport-bonus-question').textContent = data.question;
  $('passport-bonus-options').replaceChildren(...data.options.map((text, index) => {
    const item = document.createElement('li');
    const label = document.createElement('label');
    const input = document.createElement('input'); input.type = 'radio'; input.name = 'passport-bonus-choice'; input.value = String(index); input.required = true;
    input.checked = state.selected === index; input.disabled = state.revealed;
    const copy = document.createElement('span'); copy.textContent = text; label.append(input, copy);
    const letter = document.createElement('span'); letter.className = 'passport-bonus-letter'; letter.textContent = String.fromCharCode(65 + index) + '.'; item.append(letter, label);
    if (state.revealed && index === data.correctIndex) item.classList.add('bonus-correct');
    input.addEventListener('change', () => {
      PassportGame.chooseBonus(game, index); $('passport-bonus-reveal').disabled = false;
      $('passport-bonus-status').textContent = `Proposition ${String.fromCharCode(65 + index)} retenue collectivement.`;
    });
    return item;
  }));
  $('passport-bonus-reveal').disabled = state.selected === null;
  $('passport-bonus-reveal').hidden = state.revealed;
  $('passport-bonus-status').hidden = state.revealed;
  $('passport-bonus-status').textContent = state.selected === null ? 'Le formateur sélectionne la proposition du groupe.' : `Proposition ${String.fromCharCode(65 + state.selected)} retenue collectivement.`;
  $('passport-bonus-answer').hidden = !state.revealed;

  $('passport-bonus-finish').hidden = !state.revealed;
  $('passport-bonus-solution').textContent = state.revealed ? 'A. ' + data.options[data.correctIndex] : '';
  $('passport-bonus-explanation').textContent = state.revealed ? data.explanation : '';
  $('passport-bonus-photo').hidden = !state.revealed;
  $('passport-bonus').classList.toggle('passport-bonus-with-photo', state.revealed);
  if (state.revealed) renderPassportPhoto($('passport-bonus-photo'), PassportPhotos.strasbourg);
  else $('passport-bonus-photo').replaceChildren();
}
$('passport-bonus-form').addEventListener('submit', event => {
  event.preventDefault();
  if (PassportGame.revealBonus(game)) { renderPassportBonus(); $('passport-bonus-answer').focus(); }
});
$('passport-bonus-finish').addEventListener('click', () => { if (PassportGame.finish(game)) renderPassport(); });
$('passport-next').addEventListener('click', () => { if (PassportGame.next(game)) renderPassport(); });

document.querySelectorAll('.passport-back').forEach(button => button.addEventListener('click', () => { scores(); show('journey'); }));



let passportView = { key: '', zoom: 1, x: 450, y: 340 };
function renderPassportLocation() {
  const s=game.passport,l=s.location,puzzle=PassportGame.puzzles[s.puzzleIndex],bothLocked=l.locked.every(Boolean),stamp=PassportGame.locationToken(game);
  const viewKey=`${s.id}:${s.puzzleIndex}:${bothLocked?'compare':l.activeTeam}`;
  if(passportView.key!==viewKey)passportView={key:viewKey,zoom:1,x:450,y:340};
  $('passport-location-specialty').textContent=`MANCHE 05 / ÉNIGME ${s.puzzleIndex+1} SUR 3`;
  $('passport-location-title').textContent=puzzle.title;
  $('passport-cultural-title').textContent=puzzle.heading;
  $('passport-fact').textContent=puzzle.fact;
  renderPassportPhoto($('passport-photo'),PassportPhotos[puzzle.id]);
  syncPassportUndo();
  $('passport-next').hidden=s.phase!=='correction';
  $('passport-next').textContent=s.puzzleIndex===2?'LE DÉFI →':'DESTINATION SUIVANTE →';
  $('passport-map-turn').textContent=bothLocked?'Les deux drapeaux sont plantés !':`${game.teams[l.activeTeam].name} · drapeau ${l.activeTeam===0?'corail':'sauge'}`;
  $('passport-map-turn').className=`passport-map-turn${bothLocked?'':` team-${l.activeTeam}`}`;
  $('passport-map-choice').replaceChildren();
  if(bothLocked){l.choices.forEach((code,team)=>{const p=document.createElement('p');p.textContent=`${game.teams[team].name} : ${l.revealed?passportRegionName(code):'drapeau posé'}`;$('passport-map-choice').append(p)})}
  else $('passport-map-choice').textContent=l.choices[l.activeTeam]?'Votre drapeau est posé. Vous pouvez encore le déplacer.':'Cliquez directement sur un pays pour poser votre drapeau.';
  $('passport-lock-flag').hidden=bothLocked;$('passport-lock-flag').disabled=!stamp||!l.choices[l.activeTeam];$('passport-lock-flag').textContent=`Valider le drapeau ${l.activeTeam===0?'corail':'sauge'}`;
  $('passport-lock-flag').onclick=event=>{if(event.detail>1||!PassportGame.lockFlag(game,stamp))return;renderPassport();if(game.passport.phase==='correction')$('passport-region-answer').focus({preventScroll:true});else $('passport-map-turn').focus({preventScroll:true})};
  $('passport-map-turn').tabIndex=-1;

  $('passport-region-answer').hidden=!l.revealed;$('passport-region-answer').replaceChildren();
  if(l.revealed){
    const title=document.createElement('h2');title.textContent=`${puzzle.answer} · capitale : ${puzzle.capital}`;
    $('passport-region-answer').append(title);
  }
  function select(code){if(!PassportGame.chooseRegion(game,code,stamp))return;renderPassportLocation();$('passport-map-board').querySelector(`[data-region="${code}"]`).focus({preventScroll:true})}
  const width=900/passportView.zoom,height=680/passportView.zoom;
  const svg=FlagMap.render({regions:EuropeMap.countries,location:l,correctCode:puzzle.region,canSelect:stamp,onSelect:select,showLabels:false,showNames:l.revealed,viewBox:`${passportView.x-width/2} ${passportView.y-height/2} ${width} ${height}`,label:'Carte interactive des pays d’Europe',flagScale:1.3/passportView.zoom,exactAnchor:true});
  svg.id='passport-europe-svg';
  if(l.revealed){
    const capital=EuropeMap.capitals[puzzle.region],dot=FlagMap.svg('circle',{cx:capital.point[0],cy:capital.point[1],r:5,class:'passport-capital',role:'img','aria-label':capital.name});
    const title=FlagMap.svg('title');title.textContent=capital.name;dot.append(title);svg.append(dot);
    const capitalLabel=FlagMap.svg('text',{x:capital.point[0]+20,y:capital.point[1]+35,class:'passport-capital-label'});capitalLabel.textContent=capital.name;svg.append(capitalLabel);
  }
  $('passport-map-board').replaceChildren(svg);$('passport-map-board').dataset.activeTeam=String(l.activeTeam);
  $('passport-zoom-status').textContent=`Zoom ${Math.round(passportView.zoom*100)} %`;
  $('passport-zoom-in').disabled=passportView.zoom>=4.096;$('passport-zoom-out').disabled=passportView.zoom<=1;
  for(const direction of ['left','right','up','down'])$('passport-pan-'+direction).disabled=passportView.zoom===1;
}
function passportFrame(zoom,dx=0,dy=0){
  const s=game?.passport;if(!['location','correction'].includes(s?.phase))return;
  passportView.zoom=Math.max(1,Math.min(4.096,zoom));const w=900/passportView.zoom,h=680/passportView.zoom;
  passportView.x=Math.max(w/2,Math.min(900-w/2,passportView.x+dx*w/4));passportView.y=Math.max(h/2,Math.min(680-h/2,passportView.y+dy*h/4));renderPassportLocation();
}
$('passport-zoom-in').addEventListener('click',()=>passportFrame(passportView.zoom*1.6));
$('passport-zoom-out').addEventListener('click',()=>passportFrame(passportView.zoom/1.6));
$('passport-zoom-reset').addEventListener('click',()=>{passportView.x=450;passportView.y=340;passportFrame(1)});
for(const[direction,dx,dy]of[['left',-1,0],['right',1,0],['up',0,-1],['down',0,1]])$('passport-pan-'+direction).addEventListener('click',()=>passportFrame(passportView.zoom,dx,dy));
// Trois notes originales, synthétisées localement ; seulement sur demande.
let passportAudio = null;
$('passport-sound').addEventListener('click',async()=>{
 if(game?.passport?.phase!=='search'||game.passport.puzzleIndex!==2)return;
 const Audio=window.AudioContext||window.webkitAudioContext;
 if(!Audio){$('passport-sound-status').textContent='Son indisponible. Le jeu continue sans audio.';return;}
 $('passport-sound').disabled=true;
 try{
  passportAudio ||= new Audio();await passportAudio.resume();const start=passportAudio.currentTime;
  for(const[index,frequency]of[130.81,138.59,123.47].entries()){
   const oscillator=passportAudio.createOscillator(),gain=passportAudio.createGain(),at=start+index*.3;
   oscillator.type='sine';oscillator.frequency.value=frequency;
   gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.035,at+.03);gain.gain.linearRampToValueAtTime(0,at+.28);
   oscillator.connect(gain);gain.connect(passportAudio.destination);oscillator.start(at);oscillator.stop(at+.3);
   oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};
  }
  $('passport-sound-status').textContent='Trois notes originales, jouées à faible volume.';
 }catch{ $('passport-sound-status').textContent='Son indisponible. Le jeu continue sans audio.'; }
 finally{setTimeout(()=>{$('passport-sound').disabled=false},1000);}
});

function appendPassportPhotoCredit(container, photo) {
  container.append(photo.credit + ' · ');
  for (const [url,label] of [[photo.source,'Source Wikimedia Commons'],[photo.licenseUrl,photo.license]]) {
    const link=document.createElement('a');link.href=url;link.textContent=label;link.target='_blank';link.rel='noopener';container.append(link,' · ');
  }
  container.append('Image affichée entière, sans retouche ni recadrage par le jeu.');
}
function renderPassportPhoto(figure, photo) {
  const image=document.createElement('img');image.src=photo.src;image.alt=photo.alt;
  const caption=document.createElement('figcaption');appendPassportPhotoCredit(caption,photo);
  const full=document.createElement('a');full.href=photo.src;full.textContent='Agrandir la photographie';full.target='_blank';full.rel='noopener';caption.append(' · ',full);
  figure.replaceChildren(image,caption);
}
function appendPassportPhotoCredits(container) {
  const s=game?.passport;if(!s)return;
  const entries=PassportGame.puzzles.filter((_,index)=>index<s.puzzleIndex||(index===s.puzzleIndex&&['answer','location','correction','bonus','complete'].includes(s.phase))).map(p=>[p.answer,PassportPhotos[p.id]]);
  // Ne pas divulguer la solution du bonus via ses crédits avant révélation.
  if(s.bonus.revealed)entries.push(['Défi Strasbourg',PassportPhotos.strasbourg]);
  for(const[label,photo]of entries){const article=document.createElement('article'),title=document.createElement('h3'),credit=document.createElement('p');title.textContent=`Manche 5 — ${label}`;appendPassportPhotoCredit(credit,photo);article.append(title,credit);container.append(article);}
}
