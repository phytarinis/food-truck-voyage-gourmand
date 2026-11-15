'use strict';
// Les transitions automatiques restent propres à la manche 3.
function settleFranceSearch() {
  if (game?.france?.phase === 'intro') FranceGame.begin(game);
  const stamp = FranceGame.nextClueToken(game);
  if (stamp) FranceGame.revealNextClue(game, stamp);
}
function openFrance() {
  FranceGame.start(game); game.routeCurrent = 2; renderFrance();
}
function renderFrance() {
  settleFranceSearch();
  // Reprendre aussi une ancienne sauvegarde arrêtée avant « La petite histoire ».
  if (game.france.phase === 'location' && game.france.location.revealed) FranceGame.discover(game);
  scores();
  const s = game.france;
  if (s.phase === 'search') { renderFranceSearch(); show('france-search'); return; }
  if (s.phase === 'answer') {
    $('france-answer-title').textContent = FranceGame.puzzles[s.puzzleIndex].title;
    renderFrancePhoto(); show('france-answer'); return;
  }
  if (['location', 'correction'].includes(s.phase)) { renderFranceLocation(); show('france-location'); return; }
  if (s.phase === 'bonus') { renderFranceBonus(); show('france-bonus'); return; }
  openCareerPause(2);
}
function renderFrancePhoto() {
  const puzzle = FranceGame.puzzles[game.france.puzzleIndex], photo = FrancePhotos[puzzle.id];
  const image = document.createElement('img'); image.src = photo.src; image.alt = photo.alt;
  const caption = document.createElement('figcaption'); appendFrancePhotoCredit(caption, photo);
  $('france-photo').replaceChildren(image, caption);
  $('france-photo').dataset.specialty = puzzle.id;
}
function renderFranceSearch() {
  const s = game.france, puzzle = FranceGame.puzzles[s.puzzleIndex];
  const team = s.players.findIndex(player => player.status === 'searching');
  $('france-live').textContent = '';
  const panel = document.createElement('article'); panel.className = `france-common-clue team-${team}`;
  const info = document.createElement('div'); info.className = 'sauce-clue-info';
  const index = document.createElement('span'); index.textContent = `Indice ${s.clueIndex + 1} / 3`;
  const value = document.createElement('strong'); value.textContent = `${FranceGame.points[s.clueIndex]} points possibles`;
  info.append(index, value);
  const clue = document.createElement('p'); clue.className = 'sauce-current-clue'; clue.textContent = puzzle.clues[s.clueIndex];
  const turn = document.createElement('h2'); turn.id = 'france-active-team'; turn.tabIndex = -1;
  turn.textContent = `À ${game.teams[team].name} de répondre`;
  const controls = document.createElement('div'); controls.className = 'sauce-controls';
  for (const correct of [false, true]) {
    const button = document.createElement('button'); button.type = 'button';
    button.className = correct ? 'primary' : 'secondary';
    button.textContent = correct ? '✓ Bonne réponse' : '✕ Mauvaise réponse';
    button.setAttribute('aria-label', `${correct ? 'Bonne' : 'Mauvaise'} réponse pour ${game.teams[team].name}`);
    button.dataset.team = String(team); button.dataset.correct = String(correct);
    const stamp = FranceGame.token(game, team);
    button.addEventListener('click', event => {
      // Le second événement d’un double clic ne doit pas répondre pour l’autre équipe.
      if (event.detail > 1 || game?.spicy?.active || !FranceGame.validate(game, team, correct, stamp)) return;
      renderFrance();
      if (game.france.phase === 'search') $('france-active-team').focus({preventScroll:true});
    });
    controls.append(button);
  }
  panel.append(info, clue, turn, controls);
  $('france-panels').replaceChildren(panel);
}
function franceRegionName(code) { return FranceRegions.find(region => region.code === code)?.name || ''; }
function renderFranceBonus() {
  const state = game.france.bonus, data = FranceGame.bonus;
  $('france-bonus-question').textContent = data.question;
  $('france-bonus-options').replaceChildren(...data.options.map((text, index) => {
    const item = document.createElement('li');
    const label = document.createElement('label');
    const input = document.createElement('input'); input.type = 'radio'; input.name = 'france-bonus-choice'; input.value = String(index); input.required = true;
    input.checked = state.selected === index; input.disabled = state.revealed;
    const copy = document.createElement('span'); copy.textContent = text; label.append(input, copy);
    const letter = document.createElement('span'); letter.className = 'france-bonus-letter'; letter.textContent = String.fromCharCode(65 + index) + '.'; item.append(letter, label);
    if (state.revealed && index === data.correctIndex) item.classList.add('bonus-correct');
    input.addEventListener('change', () => {
      FranceGame.chooseBonus(game, index); $('france-bonus-reveal').disabled = false;
      $('france-bonus-status').textContent = `Proposition ${String.fromCharCode(65 + index)} retenue collectivement.`;
    });
    return item;
  }));
  $('france-bonus-reveal').disabled = state.selected === null;
  $('france-bonus-reveal').hidden = state.revealed;
  $('france-bonus-status').hidden = state.revealed;
  $('france-bonus-status').textContent = state.selected === null ? 'Le formateur sélectionne la proposition du groupe.' : `Proposition ${String.fromCharCode(65 + state.selected)} retenue collectivement.`;
  $('france-bonus-answer').hidden = !state.revealed;
  $('france-bonus-discovery').hidden = !state.revealed;
  $('france-bonus-finish').hidden = !state.revealed;
  $('france-bonus-solution').textContent = state.revealed ? 'B. ' + data.options[data.correctIndex] : '';
  $('france-bonus-explanation').textContent = state.revealed ? data.explanation : '';
  $('france-bonus-quote').textContent = state.revealed ? data.quote : '';
  $('france-bonus-reference').replaceChildren();
  if (state.revealed) {
    $('france-bonus-reference').append(data.reference + ' ');
    const source = document.createElement('a'); source.href = data.source; source.textContent = 'Insee — publication du 13 janvier 2026'; source.target = '_blank'; source.rel = 'noopener'; $('france-bonus-reference').append(source);
  }
}
$('france-bonus-form').addEventListener('submit', event => {
  event.preventDefault();
  if (FranceGame.revealBonus(game)) { renderFranceBonus(); $('france-bonus-answer').focus(); }
});
$('france-bonus-finish').addEventListener('click', () => { if (FranceGame.finish(game)) { scores(); saveProgress(); openCareerPause(2); } });
$('france-next').addEventListener('click', () => { if (FranceGame.next(game)) renderFrance(); });
document.querySelectorAll('.france-back').forEach(button => button.addEventListener('click', () => { scores(); show('journey'); }));


function renderFranceLocation() {
  const s = game.france, l = s.location, puzzle = FranceGame.puzzles[s.puzzleIndex];
  const bothLocked = l.locked.every(Boolean), stamp = FranceGame.locationToken(game);
  $('france-location-specialty').textContent = puzzle.title;
  $('france-map-turn').textContent = bothLocked ? 'Les deux drapeaux sont plantés !' : `${game.teams[l.activeTeam].name} · drapeau ${l.activeTeam === 0 ? 'corail' : 'sauge'}`;
  $('france-map-turn').className = `france-map-turn${bothLocked ? '' : ` team-${l.activeTeam}`}`;
  $('france-map-choice').replaceChildren();
  if (bothLocked) {
    l.choices.forEach((code, team) => {
      const line = document.createElement('p'); line.textContent = `${game.teams[team].name} : ${franceRegionName(code)}`; $('france-map-choice').append(line);
    });
  } else $('france-map-choice').textContent = l.choices[l.activeTeam] ? `Choix actuel : ${franceRegionName(l.choices[l.activeTeam])}. Modifiable jusqu’à validation.` : 'Cliquez sur une région pour poser votre drapeau.';
  const lock = $('france-lock-flag'); lock.hidden = bothLocked; lock.disabled = !stamp || !l.choices[l.activeTeam]; lock.textContent = `Valider le drapeau ${l.activeTeam === 0 ? 'corail' : 'sauge'}`;
  lock.onclick = () => {
    if (!FranceGame.lockFlag(game, stamp)) return;
    renderFranceLocation();
    if (game.france.location.locked.every(Boolean)) $('france-reveal-region').focus();
    else $('france-map-board').querySelector('[role="button"]').focus();
  };
  $('france-reveal-region').hidden = !bothLocked || l.revealed;
  $('france-culture').hidden = !l.revealed;
  $('france-next').hidden = !l.revealed;
  $('france-next').textContent = s.puzzleIndex === 2 ? 'Défi découverte →' : 'Spécialité suivante →';
  $('france-map-controls-title').hidden = l.revealed;
  $('france-location').querySelector('.france-map-instruction').hidden = l.revealed;
  $('france-location-title').textContent = l.revealed ? 'La région dévoilée !' : 'Place-moi sur la carte !';
  $('france-region-answer').hidden = !l.revealed;
  $('france-region-answer').replaceChildren();
  if (l.revealed) {
    const title = document.createElement('h2'); title.textContent = `Bonne région : ${franceRegionName(puzzle.region)}`;
    $('france-region-answer').append(title);
  }
  $('france-cultural-title').textContent = l.revealed ? puzzle.heading : '';
  $('france-fact').textContent = l.revealed ? puzzle.fact : '';
  $('france-map-choice').hidden = l.revealed;
  $('france-map-turn').hidden = l.revealed;
  function select(code) {
    if (!FranceGame.chooseRegion(game, code, stamp)) return;
    renderFranceLocation();
    $('france-map-board').querySelector(`[data-region="${code}"]`).focus({ preventScroll: true });
  }
  function drawMap(regions, mainland) {
    return FlagMap.render({ regions, mainland, location: l, correctCode: puzzle.region, canSelect: stamp, onSelect: select });
  }
  const mainland = document.createElement('div'); mainland.className = 'france-mainland';
  mainland.append(drawMap(FranceRegions.filter(r => r.mainland), true));
  const insets = document.createElement('div'); insets.className = 'france-insets';
  FranceRegions.filter(r => !r.mainland).forEach(region => {
    const inset = document.createElement('div'); inset.className = 'france-inset';
    const label = document.createElement('span'); label.textContent = region.name;
    inset.append(drawMap([region], false), label); insets.append(inset);
  });
  $('france-map-board').replaceChildren(mainland, insets);
  $('france-map-board').dataset.activeTeam = String(l.activeTeam);
  $('france-location').querySelector('.france-map-help').hidden = bothLocked;
  $('france-location').querySelector('details').hidden = bothLocked;
  $('france-region-list').replaceChildren(...FranceRegions.slice().sort((a, b) => a.name.localeCompare(b.name, 'fr')).map(region => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = region.name; button.disabled = !stamp;
    button.addEventListener('click', () => select(region.code)); return button;
  }));
}
$('france-open-map').addEventListener('click', () => { if (FranceGame.startLocation(game)) renderFrance(); });
$('france-reveal-region').addEventListener('click', () => {
  if (FranceGame.revealLocation(game)) { FranceGame.discover(game); renderFrance(); $('france-region-answer').focus({preventScroll:true}); }
});

// Les photos et leurs sources restent réservées aux corrections découvertes.
function appendFrancePhotoCredit(container, photo) {
  container.append(photo.credit + ' · ');
  for (const [url, label] of [[photo.source, 'Source'], [photo.licenseUrl, photo.license]]) {
    const link = document.createElement('a'); link.href = url; link.textContent = label; link.target = '_blank'; link.rel = 'noopener';
    container.append(link, ' · ');
  }
  container.append(photo === FrancePhotos.choucroute
    ? 'Recadrage à l’affichage sur le plat pour masquer le panneau indiquant son origine ; fichier original conservé, sans retouche.'
    : 'Image affichée entière, sans retouche ni recadrage par le jeu.');
}
function appendFrancePhotoCredits(container) {
  const s = game?.france;
  if (!s) return;
  FranceGame.puzzles.forEach((puzzle, index) => {
    // Le plat et sa photo sont révélés avant sa localisation.
    const corrected = index < s.puzzleIndex || (index === s.puzzleIndex && ['answer', 'location', 'correction', 'bonus', 'complete'].includes(s.phase));
    if (!corrected) return;
    const article = document.createElement('article');
    const title = document.createElement('h3'); title.textContent = `Manche 3 — ${puzzle.answer}`;
    const credit = document.createElement('p'); appendFrancePhotoCredit(credit, FrancePhotos[puzzle.id]);
    article.append(title, credit); container.append(article);
  });
}
