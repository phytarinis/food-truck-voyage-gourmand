'use strict';
function openSauce() {
 if(presentRound(1))return;
  SauceGame.start(game); game.routeCurrent = 1; renderSauce();
}
function renderSauce() {
  scores();
  const s = game.sauce;
  if(s.phase==='intro')SauceGame.begin(game);
  if(SauceGame.canRevealNextClue(game))SauceGame.revealNextClue(game,SauceGame.nextClueToken(game));
  if (s.phase === 'search') { renderSauceSearch(); show('sauce-search'); return; }
  if (s.phase === 'correction') { renderSauceCorrection(); show('sauce-correction'); return; }
  if (s.phase === 'bonus') { renderSauceBonus(); show('sauce-bonus'); return; }
  openCareerPause(1);
}
function renderSauceSearch() {
  $('sauce-photo').replaceChildren();
  const s=game.sauce,puzzle=SauceGame.puzzles[s.puzzleIndex],team=SauceGame.activeTeam(game),stamp=SauceGame.answerToken(game);
  $('sauce-clue-info').textContent=`Indice ${s.clueIndex+1} sur 3 · ${SauceGame.points[s.clueIndex]} points possibles`;
  $('sauce-clue').textContent=puzzle.clues[s.clueIndex];$('sauce-live').textContent='';
  $('sauce-team-status').replaceChildren(...s.players.map((player,i)=>{
    const item=document.createElement('li');item.className=`team-${i}`;
    item.textContent=`${game.teams[i].name} · ${player.status==='found'?`Trouvé : ${player.points} points`:player.status==='exhausted'?'Recherche terminée : 0 point':player.status==='waiting'?'Réponse enregistrée':'En recherche'}`;return item;
  }));
  $('sauce-respondent').textContent=team<0?'':`À ${game.teams[team].name} de répondre`;
  $('sauce-respondent').className=`team-${team}`;
  $('sauce-response-controls').replaceChildren(...[false,true].map(correct=>{
    const button=document.createElement('button');button.type='button';button.className=correct?'primary':'secondary';button.textContent=correct?'Bonne réponse':'Mauvaise réponse';button.dataset.correct=String(correct);button.dataset.team=String(team);button.disabled=!stamp;
    button.setAttribute('aria-label',`${correct?'Bonne':'Mauvaise'} réponse pour ${team<0?'':game.teams[team].name}`);
    button.onclick=()=>{if(SauceGame.respond(game,correct,stamp)){renderSauce();saveProgress();if(game.sauce.phase==='search')$('sauce-respondent').focus()}};return button;
  }));
}
function renderSauceCorrection() {
  const s = game.sauce, puzzle = SauceGame.puzzles[s.puzzleIndex];
  $('sauce-correction-title').textContent = puzzle.title;
  $('sauce-facts').replaceChildren(...puzzle.facts.map(fact => { const item = document.createElement('li'); item.textContent = fact; return item; }));
  $('sauce-correction-quote').hidden = !puzzle.quote;
  $('sauce-correction-quote').textContent = puzzle.quote || '';
  $('sauce-map').hidden = puzzle.id !== 'huitres';
  renderSaucePhoto(puzzle);
  $('sauce-next').textContent = s.puzzleIndex === 2 ? 'DÉFI DÉCOUVERTE →' : 'ÉNIGME SUIVANTE →';
}
function renderSaucePhoto(puzzle) {
  const photo = SaucePhotos[puzzle.id];
  const figure = $('sauce-photo'); figure.replaceChildren();
  const canDisplay = photo.src && (photo.approvedForDisplay === true || (photo.credit && photo.source && photo.license && photo.verified === true));
  if (canDisplay) {
    const image = document.createElement('img'); image.src = photo.src; image.alt = photo.alt; figure.append(image);
    const caption = document.createElement('figcaption');
    caption.append(`${photo.kind === 'ai-illustration' ? '' : 'Crédit fourni : '}${photo.credit}`);
    for (const [url, label] of [[photo.licenseUrl, photo.license], [photo.source, 'Source']]) {
      if (!url) continue;
      const link = document.createElement('a'); link.href = url; link.textContent = label; link.target = '_blank'; link.rel = 'noopener';
      caption.append(' · ', link);
    }
    figure.append(caption);
  } else {
    const placeholder = document.createElement('div'); placeholder.className = 'sauce-photo-placeholder';
    const frame = document.createElement('span'); frame.className = 'photo-frame'; frame.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span'); text.textContent = 'Photographie de la spécialité à ajouter'; placeholder.append(frame, text);
    const caption = document.createElement('figcaption'); caption.textContent = puzzle.answer;
    figure.append(placeholder, caption);
  }
}
function renderSauceBonus() {
  const state = game.sauce.bonus, data = SauceGame.bonus;
  $('sauce-bonus-title').textContent = data.question;
  $('sauce-bonus-options').replaceChildren(...data.options.map((text, index) => {
    const item = document.createElement('li');
    const label = document.createElement('label');
    const input = document.createElement('input'); input.type = 'radio'; input.name = 'sauce-bonus-choice'; input.value = String(index); input.required = true;
    input.checked = state.selected === index; input.disabled = state.revealed;
    const copy = document.createElement('span'); copy.textContent = text; label.append(input, copy); item.append(label);
    if (state.revealed && index === data.correctIndex) item.classList.add('bonus-correct');
    input.addEventListener('change', () => {
      SauceGame.chooseBonus(game, index); $('sauce-bonus-reveal').disabled = false;
      $('sauce-bonus-status').textContent = `Proposition ${String.fromCharCode(65 + index)} retenue collectivement.`;
    });
    return item;
  }));
  $('sauce-bonus-reveal').disabled = state.selected === null;
  $('sauce-bonus-reveal').hidden = state.revealed;
  $('sauce-bonus-status').hidden = state.revealed;
  $('sauce-bonus-status').textContent = state.selected === null ? 'Le formateur sélectionne la proposition du groupe.' : `Proposition ${String.fromCharCode(65 + state.selected)} retenue collectivement.`;
  $('sauce-bonus-answer').hidden = !state.revealed;
  $('sauce-bonus-discovery').hidden = !state.revealed;
  $('sauce-bonus-finish').hidden = !state.revealed;
  $('sauce-bonus-solution').textContent = state.revealed ? 'A. ' + data.options[data.correctIndex] : '';
  $('sauce-bonus-explanation').textContent = state.revealed ? data.explanation : '';
  $('sauce-bonus-quote').textContent = state.revealed ? data.quote : '';
}
$('sauce-bonus-form').addEventListener('submit', event => {
  event.preventDefault();
  if (SauceGame.revealBonus(game)) { renderSauceBonus(); $('sauce-bonus-answer').focus(); }
});
$('sauce-bonus-finish').addEventListener('click', () => { if (SauceGame.finish(game)) renderSauce(); });
$('sauce-next').addEventListener('click', () => { if (SauceGame.next(game)) renderSauce(); });
document.querySelectorAll('.sauce-back').forEach(button => button.addEventListener('click', () => { scores(); show('journey'); }));

// Les sources contiennent les noms des spécialités : ne montrer que les crédits
// des énigmes déjà corrigées, jamais les réponses encore en recherche.
$('photo-credits-open').addEventListener('click', () => {
  const content = $('photo-credits-content'); content.replaceChildren();
  const revealed = SauceGame.puzzles.filter((_, index) => Boolean(game?.sauce?.results[index]));
  for (const puzzle of revealed) {
    const photo = SaucePhotos[puzzle.id];
    const article = document.createElement('article');
    const title = document.createElement('h3'); title.textContent = `${puzzle.answer} — ${photo.title || puzzle.answer}`;
    const credit = document.createElement('p'); credit.textContent = photo.kind === 'ai-illustration' ? photo.credit : photo.credit ? `Référence fournie : ${photo.credit}` : 'Auteur à renseigner.';
    const links = document.createElement('p');
    for (const [url, label] of [[photo.source, 'Source Wikimedia Commons'], [photo.licenseUrl, photo.license]]) {
      if (!url) continue;
      const link = document.createElement('a'); link.href = url; link.textContent = label; link.target = '_blank'; link.rel = 'noopener';
      if (links.childNodes.length) links.append(' · '); links.append(link);
    }
    const status = document.createElement('p'); status.className = 'photo-credit-status';
    status.textContent = photo.kind === 'ai-illustration' || photo.verified ? 'Aucune retouche ni recadrage par le jeu. Image affichée entière.' : photo.approvedForDisplay ? 'Affichage confirmé par l’utilisateur. Référence Wikimedia fournie ; comparaison avec l’original inaccessible (403). Aucune retouche ni recadrage par le jeu.' : 'Photo non affichée : correspondance et droits en attente de confirmation.';
    article.append(title, credit, links, status); content.append(article);
  }
  if (typeof appendFrancePhotoCredits === 'function') appendFrancePhotoCredits(content);
  if (typeof appendPassportPhotoCredits === 'function') appendPassportPhotoCredits(content);
  if (typeof appendWorldPhotoCredits === 'function') appendWorldPhotoCredits(content);
  if (typeof appendSpicyPhotoCredits === 'function') appendSpicyPhotoCredits(content);
  if (!content.childElementCount) {
    const note = document.createElement('p'); note.textContent = 'Les crédits apparaîtront après les corrections pour préserver les spécialités à découvrir.'; content.append(note);
  }
  $('photo-credits-dialog').showModal(); $('photo-credits-close').focus();
});
$('photo-credits-close').addEventListener('click', () => $('photo-credits-dialog').close());
