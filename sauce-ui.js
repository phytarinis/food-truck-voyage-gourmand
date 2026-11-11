'use strict';
let pendingSauceValidation = null;
let pendingSauceClueToken = null;
function openSauce() {
  SauceGame.start(game); game.routeCurrent = 1; renderSauce();
}
function renderSauce() {
  scores();
  const s = game.sauce;
  if (s.phase === 'intro') { show('sauce-intro'); return; }
  if (s.phase === 'search') { renderSauceSearch(); show('sauce-search'); return; }
  if (s.phase === 'correction') { renderSauceCorrection(); show('sauce-correction'); return; }
  if (s.phase === 'bonus') { renderSauceBonus(); show('sauce-bonus'); return; }
  $('sauce-totals').textContent = SauceGame.totals(game).map((total, team) => `${game.teams[team].name} : ${total} / 60 points sur cette manche`).join(' · ');
  show('sauce-end');
}
function renderSauceSearch() {
  const s = game.sauce, puzzle = SauceGame.puzzles[s.puzzleIndex];
  $('sauce-progress').textContent = `MANCHE 02 / ÉNIGME ${s.puzzleIndex + 1} SUR 3`;
  $('sauce-live').textContent = '';
  $('sauce-panels').replaceChildren(...s.players.map((player, team) => {
    const panel = document.createElement('article'); panel.className = `sauce-panel team-${team}`;
    const title = document.createElement('h2'); title.textContent = game.teams[team].name; title.tabIndex = -1;
    const top = document.createElement('div'); top.className = 'sauce-panel-top';
    const status = document.createElement('span'); status.className = `sauce-status ${player.status}`;
    status.textContent = { searching: 'En recherche', waiting: 'En attente', found: 'Trouvé !', exhausted: 'Aucun point' }[player.status]; top.append(title, status);
    const info = document.createElement('div'); info.className = 'sauce-clue-info';
    const index = document.createElement('span'); index.textContent = `INDICE ${s.clueIndex + 1} / 3`;
    const value = document.createElement('strong'); value.textContent = player.status === 'searching' ? `${SauceGame.points[s.clueIndex]} points possibles` : player.status === 'waiting' ? 'Réponse enregistrée' : `+${player.points} points`;
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
      const stamp = SauceGame.token(game, team);
      button.addEventListener('click', () => askSauceValidation(team, correct, stamp)); row.append(button);
    }
    controls.append(caption, row); panel.append(controls);
    if (player.status !== 'searching') {
      const waiting = document.createElement('p'); waiting.className = 'sauce-waiting'; waiting.textContent = player.status === 'waiting' ? 'Réponse enregistrée. En attente de l’indice suivant.' : 'Recherche terminée. En attente de la fin des deux recherches.'; panel.append(waiting);
    }
    return panel;
  }));
  pendingSauceClueToken = SauceGame.nextClueToken(game);
  $('sauce-clue-gate').hidden = !pendingSauceClueToken;
}

function askSauceValidation(team, correct, stamp) {
  if (!stamp || SauceGame.token(game, team) !== stamp || $('sauce-confirm').open) return;
  const player = game.sauce.players[team];
  pendingSauceValidation = { team, correct, stamp };
  $('sauce-confirm-text').textContent = correct
    ? `Attribuer ${SauceGame.points[player.clueIndex]} points à ${game.teams[team].name} et terminer sa recherche ? La correction attend la fin des deux recherches.`
    : `Valider une mauvaise réponse pour ${game.teams[team].name} ? ${player.clueIndex === 2 ? 'Sa recherche se terminera avec 0 point.' : 'Sa réponse sera enregistrée sans dévoiler le prochain indice. Le formateur pourra le révéler quand chaque équipe aura répondu ou aura déjà trouvé.'}`;
  $('sauce-confirm').showModal(); $('sauce-cancel').focus();
}
function renderSauceCorrection() {
  const s = game.sauce, puzzle = SauceGame.puzzles[s.puzzleIndex];
  $('sauce-correction-progress').textContent = `MANCHE 02 / CORRECTION ${s.puzzleIndex + 1} SUR 3`;
  $('sauce-correction-title').textContent = puzzle.title;
  $('sauce-solution').textContent = `Réponse : ${puzzle.answer}.`;
  $('sauce-awards').replaceChildren(...s.results[s.puzzleIndex].map((result, team) => {
    const card = document.createElement('article'); card.className = `delivery-award team-${team}`;
    const title = document.createElement('h2'); title.textContent = `${game.teams[team].name} : +${result.points} points`;
    const detail = document.createElement('p'); detail.textContent = result.status === 'found' ? `Trouvé à l’indice ${result.clueIndex + 1}.` : 'Trois indices, aucun point cette fois.';
    card.append(title, detail); return card;
  }));
  $('sauce-facts').replaceChildren(...puzzle.facts.map(fact => { const item = document.createElement('li'); item.textContent = fact; return item; }));
  $('sauce-correction-quote').hidden = !puzzle.quote;
  $('sauce-correction-quote').textContent = puzzle.quote || '';
  $('sauce-map').hidden = puzzle.id !== 'huitres';
  renderSaucePhoto(puzzle);
  $('sauce-next').textContent = s.puzzleIndex === 2 ? 'LE BONUS GOURMAND →' : 'ÉNIGME SUIVANTE →';
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
  $('sauce-bonus-title').textContent = data.title;
  $('sauce-bonus-question').textContent = data.question;
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
$('sauce-begin').addEventListener('click', () => { SauceGame.begin(game); renderSauce(); });
$('sauce-cancel').addEventListener('click', () => $('sauce-confirm').close());
$('sauce-confirm').addEventListener('close', () => { pendingSauceValidation = null; });
$('sauce-confirm-answer').addEventListener('click', () => {
  const action = pendingSauceValidation; pendingSauceValidation = null; $('sauce-confirm').close();
  if (!action || !game || !SauceGame.validate(game, action.team, action.correct, action.stamp)) return;
  const phase = game.sauce.phase; renderSauce();
  if (phase === 'search') {
    $('sauce-live').textContent = `${game.teams[action.team].name} : ${action.correct ? 'recherche terminée' : 'réponse enregistrée'}. L’indice affiché reste commun aux deux équipes.`;
    $('sauce-panels').children[action.team].querySelector('h2').focus();
  }
});
$('sauce-next-clue').addEventListener('click', () => {
  const stamp = pendingSauceClueToken; pendingSauceClueToken = null;
  if (game && SauceGame.revealNextClue(game, stamp)) {
    renderSauce();
    $('sauce-live').textContent = `L’indice ${game.sauce.clueIndex + 1} est maintenant visible pour les deux équipes.`;
    const active = game.sauce.players.findIndex(player => player.status === 'searching');
    if (active >= 0) $('sauce-panels').children[active].querySelector('h2').focus();
  }
});
$('sauce-next').addEventListener('click', () => { if (SauceGame.next(game)) renderSauce(); });
$('sauce-career').addEventListener('click', () => { if (game?.sauce?.phase === 'complete') openCareerPause(1); });
document.querySelectorAll('.sauce-back').forEach(button => button.addEventListener('click', () => { scores(); show('journey'); }));

// Les sources contiennent les noms des spécialités : ne montrer que les crédits
// des énigmes déjà corrigées, jamais les réponses encore en recherche.
$('photo-credits-open').addEventListener('click', () => {
  const content = $('photo-credits-content'); content.replaceChildren();
  const revealed = SauceGame.puzzles.filter((_, index) => Boolean(game?.sauce?.results[index]));
  if (!revealed.length) {
    const note = document.createElement('p'); note.textContent = 'Les crédits apparaîtront après les corrections pour préserver les spécialités à découvrir.'; content.append(note);
  }
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
  $('photo-credits-dialog').showModal(); $('photo-credits-close').focus();
});
$('photo-credits-close').addEventListener('click', () => $('photo-credits-dialog').close());
