'use strict';
let pendingPassportValidation = null;
let pendingPassportClueToken = null;
function openPassport() {
  PassportGame.start(game); game.routeCurrent = 4; renderPassport();
}
function renderPassport() {
  scores();
  const s = game.passport;
  if (s.phase === 'intro') { show('passport-intro'); return; }
  if (s.phase === 'search') { renderPassportSearch(); show('passport-search'); return; }
  if (s.phase === 'answer') {
    $('passport-answer-title').textContent = PassportGame.puzzles[s.puzzleIndex].title;
    renderPassportAwards('passport-search-awards', false); show('passport-answer'); return;
  }
  if (s.phase === 'location') { renderPassportLocation(); show('passport-location'); return; }
  if (s.phase === 'correction') { renderPassportCorrection(); show('passport-correction'); return; }
  if (s.phase === 'bonus') { renderPassportBonus(); show('passport-bonus'); return; }
  $('passport-totals').replaceChildren(...PassportGame.totals(game).map((total, team) => {
    const card = document.createElement('article'); card.className = `delivery-award team-${team}`;
    const title = document.createElement('h2'); title.textContent = game.teams[team].name;
    const round = document.createElement('p'); round.textContent = `Manche 5 : +${total} / 75 points`;
    const cumulative = document.createElement('strong'); cumulative.textContent = `Score cumulé : ${game.teams[team].score} points`;
    const details = document.createElement('ul');
    s.results.forEach((result,index)=>{const item=document.createElement('li');item.textContent=`${PassportGame.puzzles[index].answer} : ${result[team].points} + ${result[team].locationPoints} points de localisation`;details.append(item);});
    card.append(title, details, round, cumulative); return card;
  })); show('passport-end');
}

function renderPassportSearch() {
  const s = game.passport, puzzle = PassportGame.puzzles[s.puzzleIndex];
  $('passport-progress').textContent = `MANCHE 05 / ÉNIGME ${s.puzzleIndex + 1} SUR 3`;
  $('passport-live').textContent = '';
  $('passport-destination-title').textContent = puzzle.searchTitle;
  $('passport-mystery').hidden = !puzzle.quote;
  $('passport-mystery-quote').textContent = puzzle.quote || '';
  $('passport-sound-status').textContent = '';
  $('passport-panels').replaceChildren(...s.players.map((player, team) => {
    const panel = document.createElement('article'); panel.className = `sauce-panel team-${team}`;
    const title = document.createElement('h2'); title.textContent = game.teams[team].name; title.tabIndex = -1;
    const top = document.createElement('div'); top.className = 'sauce-panel-top';
    const status = document.createElement('span'); status.className = `sauce-status ${player.status}`;
    status.textContent = { searching: 'En recherche', waiting: 'En attente', found: 'Trouvé !', exhausted: 'Aucun point' }[player.status]; top.append(title, status);
    const info = document.createElement('div'); info.className = 'sauce-clue-info';
    const index = document.createElement('span'); index.textContent = `INDICE ${s.clueIndex + 1} / 3`;
    const value = document.createElement('strong'); value.textContent = player.status === 'searching' ? `${PassportGame.points[s.clueIndex]} points possibles` : player.status === 'waiting' ? 'Réponse enregistrée' : `+${player.points} points`;
    info.append(index, value);
    const clue = document.createElement('p'); clue.className = 'sauce-current-clue'; clue.textContent = puzzle.clues[s.clueIndex];
    panel.append(top, info, clue);
    if (s.clueIndex > 0) {
      const history = document.createElement('div'); history.className = 'sauce-history';
      const label = document.createElement('h3'); label.textContent = 'Indices déjà révélés';
      const list = document.createElement('ol');
      puzzle.clues.slice(0, s.clueIndex).forEach(text => { const item = document.createElement('li'); item.textContent = text; list.append(item); });
      history.append(label, list); panel.append(history);
    }
    const controls = document.createElement('div'); controls.className = 'sauce-controls';
    const caption = document.createElement('span'); caption.textContent = 'COMMANDES DU FORMATEUR';
    const row = document.createElement('div');
    for (const correct of [false, true]) {
      const button = document.createElement('button'); button.type = 'button';
      button.className = correct ? 'primary' : 'secondary';
      button.textContent = correct ? '✓ Bonne réponse' : '✕ Mauvaise réponse';
      button.setAttribute('aria-label', `${correct ? 'Bonne' : 'Mauvaise'} réponse pour ${game.teams[team].name}`);
      button.dataset.team = String(team); button.dataset.correct = String(correct);
      button.disabled = player.status !== 'searching';
      const stamp = PassportGame.token(game, team);
      button.addEventListener('click', () => askPassportValidation(team, correct, stamp)); row.append(button);
    }
    controls.append(caption, row); panel.append(controls);
    if (player.status !== 'searching') {
      const waiting = document.createElement('p'); waiting.className = 'sauce-waiting'; waiting.textContent = player.status === 'waiting' ? 'Réponse enregistrée. En attente de l’indice suivant.' : 'Recherche terminée. En attente de la fin des deux recherches.'; panel.append(waiting);
    }
    return panel;
  }));
  pendingPassportClueToken = PassportGame.nextClueToken(game);
  $('passport-clue-gate').hidden = !pendingPassportClueToken;
}

function askPassportValidation(team, correct, stamp) {
  if (!stamp || PassportGame.token(game, team) !== stamp || $('passport-confirm').open) return;
  const player = game.passport.players[team];
  pendingPassportValidation = { team, correct, stamp };
  $('passport-confirm-text').textContent = correct
    ? `Attribuer ${PassportGame.points[player.clueIndex]} points à ${game.teams[team].name} et terminer sa recherche ? La correction attend la fin des deux recherches.`
    : `Valider une mauvaise réponse pour ${game.teams[team].name} ? ${player.clueIndex === 2 ? 'Sa recherche se terminera avec 0 point.' : 'Sa réponse sera enregistrée sans dévoiler le prochain indice. Le formateur pourra le révéler quand chaque équipe aura répondu ou aura déjà trouvé.'}`;
  $('passport-confirm').showModal(); $('passport-cancel').focus();
}
function passportRegionName(code) { return EuropeMap.countries.find(region => region.code === code)?.name || ''; }
function renderPassportAwards(id, includeLocation) {
  const s = game.passport;
  $(id).replaceChildren(...s.results[s.puzzleIndex].map((result, team) => {
    const card = document.createElement('article'); card.className = `delivery-award team-${team}`;
    const title = document.createElement('h2'); title.textContent = `${game.teams[team].name} : +${result.points + (includeLocation ? result.locationPoints : 0)} points`;
    const detail = document.createElement('p'); detail.textContent = result.status === 'found' ? `Pays : ${result.points} points, indice ${result.clueIndex + 1}.` : 'Pays : 0 point après trois indices.';
    card.append(title, detail);
    if (includeLocation) {
      const region = document.createElement('p'); region.textContent = `Drapeau : ${passportRegionName(result.region)} · +${result.locationPoints} points.`; card.append(region);
    }
    return card;
  }));
}
function renderPassportCorrection() {
  const s = game.passport, puzzle = PassportGame.puzzles[s.puzzleIndex];
  $('passport-correction-progress').textContent = `MANCHE 05 / DÉCOUVERTE ${s.puzzleIndex + 1} SUR 3`;
  $('passport-correction-title').textContent = puzzle.title;
  renderPassportAwards('passport-awards', true);
  $('passport-cultural-title').textContent = puzzle.heading;
  $('passport-fact').textContent = puzzle.fact;
  $('passport-correct-region').textContent = `Pays : ${passportRegionName(puzzle.region)}`;
  const placeholder = document.createElement('div'); placeholder.className = 'sauce-photo-placeholder';
  const frame = document.createElement('span'); frame.className = 'photo-frame'; frame.setAttribute('aria-hidden','true');
  const text = document.createElement('span'); text.textContent = puzzle.photo; placeholder.append(frame,text);
  const caption = document.createElement('figcaption'); caption.textContent = puzzle.answer;
  $('passport-photo').replaceChildren(placeholder,caption);
  $('passport-country-map').src = `assets/maps/passport-${puzzle.region.toLowerCase()}.svg`;
  $('passport-country-map').alt = `${puzzle.answer} et sa capitale, ${puzzle.capital}`;
  $('passport-photo').dataset.specialty = puzzle.id;
  $('passport-next').textContent = s.puzzleIndex === 2 ? 'LE BONUS COLLECTIF →' : 'ÉNIGME SUIVANTE →';
}
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
}
$('passport-bonus-form').addEventListener('submit', event => {
  event.preventDefault();
  if (PassportGame.revealBonus(game)) { renderPassportBonus(); $('passport-bonus-answer').focus(); }
});
$('passport-bonus-finish').addEventListener('click', () => { if (PassportGame.finish(game)) renderPassport(); });
$('passport-begin').addEventListener('click', () => { PassportGame.begin(game); renderPassport(); });
$('passport-cancel').addEventListener('click', () => $('passport-confirm').close());
$('passport-confirm').addEventListener('close', () => { pendingPassportValidation = null; });
$('passport-confirm-answer').addEventListener('click', () => {
  const action = pendingPassportValidation; pendingPassportValidation = null; $('passport-confirm').close();
  if (!action || !game || !PassportGame.validate(game, action.team, action.correct, action.stamp)) return;
  const phase = game.passport.phase; renderPassport();
  if (phase === 'search') {
    $('passport-live').textContent = `${game.teams[action.team].name} : ${action.correct ? 'recherche terminée' : 'réponse enregistrée'}. L’indice affiché reste commun aux deux équipes.`;
    $('passport-panels').children[action.team].querySelector('h2').focus();
  }
});
$('passport-next-clue').addEventListener('click', () => {
  const stamp = pendingPassportClueToken; pendingPassportClueToken = null;
  if (game && PassportGame.revealNextClue(game, stamp)) {
    renderPassport();
    $('passport-live').textContent = `L’indice ${game.passport.clueIndex + 1} est maintenant visible pour les deux équipes.`;
    const active = game.passport.players.findIndex(player => player.status === 'searching');
    if (active >= 0) $('passport-panels').children[active].querySelector('h2').focus();
  }
});
$('passport-next').addEventListener('click', () => { if (PassportGame.next(game)) renderPassport(); });
$('passport-career').addEventListener('click', () => { if (game?.passport?.phase === 'complete') openCareerPause(4); });
document.querySelectorAll('.passport-back').forEach(button => button.addEventListener('click', () => { scores(); show('journey'); }));



let passportView = { key: '', zoom: 1, x: 450, y: 340 };
function renderPassportLocation() {
  const s=game.passport,l=s.location,puzzle=PassportGame.puzzles[s.puzzleIndex],bothLocked=l.locked.every(Boolean),stamp=PassportGame.locationToken(game);
  const viewKey=`${s.id}:${s.puzzleIndex}:${bothLocked?'compare':l.activeTeam}`;
  if(passportView.key!==viewKey)passportView={key:viewKey,zoom:1,x:450,y:340};
  $('passport-location-specialty').textContent=`LOCALISATION ${s.puzzleIndex+1} / 3 · EUROPE`;
  $('passport-map-turn').textContent=bothLocked?'Les deux drapeaux sont plantés !':`${game.teams[l.activeTeam].name} · drapeau ${l.activeTeam===0?'corail':'sauge'}`;
  $('passport-map-turn').className=`passport-map-turn${bothLocked?'':` team-${l.activeTeam}`}`;
  $('passport-map-choice').replaceChildren();
  if(bothLocked){l.choices.forEach((code,team)=>{const p=document.createElement('p');p.textContent=`${game.teams[team].name} : ${l.revealed?passportRegionName(code):'drapeau posé'}`;$('passport-map-choice').append(p)})}
  else $('passport-map-choice').textContent=l.choices[l.activeTeam]?'Votre drapeau est posé. Vous pouvez encore le déplacer.':'Cliquez directement sur un pays pour poser votre drapeau.';
  $('passport-lock-flag').hidden=bothLocked;$('passport-lock-flag').disabled=!stamp||!l.choices[l.activeTeam];$('passport-lock-flag').textContent=`Valider le drapeau ${l.activeTeam===0?'corail':'sauge'}`;
  $('passport-lock-flag').onclick=()=>{if(!PassportGame.lockFlag(game,stamp))return;renderPassportLocation();if(game.passport.location.locked.every(Boolean))$('passport-reveal-region').focus();else $('passport-map-turn').focus()};
  $('passport-map-turn').tabIndex=-1;
  $('passport-reveal-region').hidden=!bothLocked||l.revealed;$('passport-discover').hidden=!l.revealed;
  $('passport-region-answer').hidden=!l.revealed;$('passport-region-answer').replaceChildren();
  if(l.revealed){
    const title=document.createElement('h2');title.textContent=`${puzzle.answer} · capitale : ${puzzle.capital}`;
    const points=document.createElement('p');points.textContent=s.players.map((p,team)=>`${game.teams[team].name} : +${p.locationPoints} points`).join(' · ');$('passport-region-answer').append(title,points);
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
  const s=game?.passport;if(s?.phase!=='location')return;
  passportView.zoom=Math.max(1,Math.min(4.096,zoom));const w=900/passportView.zoom,h=680/passportView.zoom;
  passportView.x=Math.max(w/2,Math.min(900-w/2,passportView.x+dx*w/4));passportView.y=Math.max(h/2,Math.min(680-h/2,passportView.y+dy*h/4));renderPassportLocation();
}
$('passport-zoom-in').addEventListener('click',()=>passportFrame(passportView.zoom*1.6));
$('passport-zoom-out').addEventListener('click',()=>passportFrame(passportView.zoom/1.6));
$('passport-zoom-reset').addEventListener('click',()=>{passportView.x=450;passportView.y=340;passportFrame(1)});
for(const[direction,dx,dy]of[['left',-1,0],['right',1,0],['up',0,-1],['down',0,1]])$('passport-pan-'+direction).addEventListener('click',()=>passportFrame(passportView.zoom,dx,dy));
$('passport-open-map').addEventListener('click',()=>{if(PassportGame.startLocation(game))renderPassport()});
$('passport-reveal-region').addEventListener('click',()=>{if(PassportGame.revealLocation(game)){scores();renderPassportLocation();$('passport-region-answer').focus()}});
$('passport-discover').addEventListener('click',()=>{if(PassportGame.discover(game))renderPassport()});

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
