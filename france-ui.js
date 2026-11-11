'use strict';
let pendingFranceValidation = null;
let pendingFranceClueToken = null;
function openFrance() {
  FranceGame.start(game); game.routeCurrent = 2; renderFrance();
}
function renderFrance() {
  scores();
  const s = game.france;
  if (s.phase === 'intro') { show('france-intro'); return; }
  if (s.phase === 'search') { renderFranceSearch(); show('france-search'); return; }
  if (s.phase === 'answer') {
    $('france-answer-title').textContent = FranceGame.puzzles[s.puzzleIndex].title;
    renderFranceAwards('france-search-awards', false); show('france-answer'); return;
  }
  if (s.phase === 'location') { renderFranceLocation(); show('france-location'); return; }
  if (s.phase === 'correction') { renderFranceCorrection(); show('france-correction'); return; }
  if (s.phase === 'bonus') { renderFranceBonus(); show('france-bonus'); return; }
  $('france-totals').replaceChildren(...FranceGame.totals(game).map((total, team) => {
    const card = document.createElement('article'); card.className = `delivery-award team-${team}`;
    const title = document.createElement('h2'); title.textContent = game.teams[team].name;
    const round = document.createElement('p'); round.textContent = `Manche 3 : +${total} / 75 points`;
    const cumulative = document.createElement('strong'); cumulative.textContent = `Score cumulé : ${game.teams[team].score} points`;
    card.append(title, round, cumulative); return card;
  })); show('france-end');
}

function renderFranceSearch() {
  const s = game.france, puzzle = FranceGame.puzzles[s.puzzleIndex];
  $('france-progress').textContent = `MANCHE 03 / ÉNIGME ${s.puzzleIndex + 1} SUR 3`;
  $('france-live').textContent = '';
  $('france-panels').replaceChildren(...s.players.map((player, team) => {
    const panel = document.createElement('article'); panel.className = `sauce-panel team-${team}`;
    const title = document.createElement('h2'); title.textContent = game.teams[team].name; title.tabIndex = -1;
    const top = document.createElement('div'); top.className = 'sauce-panel-top';
    const status = document.createElement('span'); status.className = `sauce-status ${player.status}`;
    status.textContent = { searching: 'En recherche', waiting: 'En attente', found: 'Trouvé !', exhausted: 'Aucun point' }[player.status]; top.append(title, status);
    const info = document.createElement('div'); info.className = 'sauce-clue-info';
    const index = document.createElement('span'); index.textContent = `INDICE ${s.clueIndex + 1} / 3`;
    const value = document.createElement('strong'); value.textContent = player.status === 'searching' ? `${FranceGame.points[s.clueIndex]} points possibles` : player.status === 'waiting' ? 'Réponse enregistrée' : `+${player.points} points`;
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
      const stamp = FranceGame.token(game, team);
      button.addEventListener('click', () => askFranceValidation(team, correct, stamp)); row.append(button);
    }
    controls.append(caption, row); panel.append(controls);
    if (player.status !== 'searching') {
      const waiting = document.createElement('p'); waiting.className = 'sauce-waiting'; waiting.textContent = player.status === 'waiting' ? 'Réponse enregistrée. En attente de l’indice suivant.' : 'Recherche terminée. En attente de la fin des deux recherches.'; panel.append(waiting);
    }
    return panel;
  }));
  pendingFranceClueToken = FranceGame.nextClueToken(game);
  $('france-clue-gate').hidden = !pendingFranceClueToken;
}

function askFranceValidation(team, correct, stamp) {
  if (!stamp || FranceGame.token(game, team) !== stamp || $('france-confirm').open) return;
  const player = game.france.players[team];
  pendingFranceValidation = { team, correct, stamp };
  $('france-confirm-text').textContent = correct
    ? `Attribuer ${FranceGame.points[player.clueIndex]} points à ${game.teams[team].name} et terminer sa recherche ? La correction attend la fin des deux recherches.`
    : `Valider une mauvaise réponse pour ${game.teams[team].name} ? ${player.clueIndex === 2 ? 'Sa recherche se terminera avec 0 point.' : 'Sa réponse sera enregistrée sans dévoiler le prochain indice. Le formateur pourra le révéler quand chaque équipe aura répondu ou aura déjà trouvé.'}`;
  $('france-confirm').showModal(); $('france-cancel').focus();
}
function franceRegionName(code) { return FranceRegions.find(region => region.code === code)?.name || ''; }
function renderFranceAwards(id, includeLocation) {
  const s = game.france;
  $(id).replaceChildren(...s.results[s.puzzleIndex].map((result, team) => {
    const card = document.createElement('article'); card.className = `delivery-award team-${team}`;
    const title = document.createElement('h2'); title.textContent = `${game.teams[team].name} : +${result.points + (includeLocation ? result.locationPoints : 0)} points`;
    const detail = document.createElement('p'); detail.textContent = result.status === 'found' ? `Spécialité : ${result.points} points, indice ${result.clueIndex + 1}.` : 'Spécialité : 0 point après trois indices.';
    card.append(title, detail);
    if (includeLocation) {
      const region = document.createElement('p'); region.textContent = `Drapeau : ${franceRegionName(result.region)} · +${result.locationPoints} points.`; card.append(region);
    }
    return card;
  }));
}
function renderFranceCorrection() {
  const s = game.france, puzzle = FranceGame.puzzles[s.puzzleIndex];
  $('france-correction-progress').textContent = `MANCHE 03 / DÉCOUVERTE ${s.puzzleIndex + 1} SUR 3`;
  $('france-correction-title').textContent = puzzle.title;
  renderFranceAwards('france-awards', true);
  $('france-cultural-title').textContent = puzzle.heading;
  $('france-fact').textContent = puzzle.fact;
  $('france-correct-region').textContent = `Région : ${franceRegionName(puzzle.region)}`;
  const photo = FrancePhotos[puzzle.id];
  const image = document.createElement('img'); image.src = photo.src; image.alt = photo.alt;
  const caption = document.createElement('figcaption'); appendFrancePhotoCredit(caption, photo);
  $('france-photo').replaceChildren(image, caption);
  $('france-photo').dataset.specialty = puzzle.id;
  $('france-next').textContent = s.puzzleIndex === 2 ? 'LE BONUS COLLECTIF →' : 'ÉNIGME SUIVANTE →';
}
function renderFranceBonus() {
  const state = game.france.bonus, data = FranceGame.bonus;
  $('france-bonus-title').textContent = data.title;
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
$('france-bonus-finish').addEventListener('click', () => { if (FranceGame.finish(game)) renderFrance(); });
$('france-begin').addEventListener('click', () => { FranceGame.begin(game); renderFrance(); });
$('france-cancel').addEventListener('click', () => $('france-confirm').close());
$('france-confirm').addEventListener('close', () => { pendingFranceValidation = null; });
$('france-confirm-answer').addEventListener('click', () => {
  const action = pendingFranceValidation; pendingFranceValidation = null; $('france-confirm').close();
  if (!action || !game || !FranceGame.validate(game, action.team, action.correct, action.stamp)) return;
  const phase = game.france.phase; renderFrance();
  if (phase === 'search') {
    $('france-live').textContent = `${game.teams[action.team].name} : ${action.correct ? 'recherche terminée' : 'réponse enregistrée'}. L’indice affiché reste commun aux deux équipes.`;
    $('france-panels').children[action.team].querySelector('h2').focus();
  }
});
$('france-next-clue').addEventListener('click', () => {
  const stamp = pendingFranceClueToken; pendingFranceClueToken = null;
  if (game && FranceGame.revealNextClue(game, stamp)) {
    renderFrance();
    $('france-live').textContent = `L’indice ${game.france.clueIndex + 1} est maintenant visible pour les deux équipes.`;
    const active = game.france.players.findIndex(player => player.status === 'searching');
    if (active >= 0) $('france-panels').children[active].querySelector('h2').focus();
  }
});
$('france-next').addEventListener('click', () => { if (FranceGame.next(game)) renderFrance(); });
$('france-career').addEventListener('click', () => { if (game?.france?.phase === 'complete') openCareerPause(2); });
document.querySelectorAll('.france-back').forEach(button => button.addEventListener('click', () => { scores(); show('journey'); }));


function franceSvg(tag, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value)); return element;
}
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
  $('france-discover').hidden = !l.revealed;
  $('france-region-answer').hidden = !l.revealed;
  $('france-region-answer').replaceChildren();
  if (l.revealed) {
    const title = document.createElement('h2'); title.textContent = `Bonne région : ${franceRegionName(puzzle.region)}`;
    const awards = document.createElement('p'); awards.textContent = s.players.map((p, team) => `${game.teams[team].name} : +${p.locationPoints} points`).join(' · ');
    $('france-region-answer').append(title, awards);
  }
  function select(code) {
    if (!FranceGame.chooseRegion(game, code, stamp)) return;
    renderFranceLocation();
    $('france-map-board').querySelector(`[data-region="${code}"]`).focus({ preventScroll: true });
  }
  function drawMap(regions, mainland) {
    const svg = franceSvg('svg', { viewBox: mainland ? '0 0 660 560' : '0 0 180 120', role: 'group', 'aria-label': mainland ? 'Les 13 régions de France métropolitaine, Corse incluse' : regions[0].name });
    const labels = [], flags = [];
    for (const region of regions) {
      const selected = !bothLocked && l.choices[l.activeTeam] === region.code;
      const path = franceSvg('path', { d: region.path, 'data-region': region.code, role: 'button', tabindex: stamp ? '0' : '-1', 'aria-label': region.name, 'aria-pressed': String(selected), 'aria-disabled': String(!stamp), class: `france-region${selected ? ' is-selected' : ''}${l.revealed && puzzle.region === region.code ? ' is-correct' : ''}` });
      const title = franceSvg('title'); title.textContent = region.name; path.append(title);
      path.addEventListener('click', () => select(region.code));
      path.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(region.code); } });
      svg.append(path);
      if (mainland) {
        const offset = { '52': [-20, -8], '24': [8, 12], '28': [-10, -10] }[region.code] || [0, 0];
        const labelX = region.center[0] + offset[0], labelY = region.center[1] + offset[1];
        const text = franceSvg('text', { x: labelX, y: labelY - (region.labels.length - 1) * 11, class: 'france-region-label', 'text-anchor': 'middle', 'aria-hidden': 'true' });
        region.labels.forEach((line, index) => { const span = franceSvg('tspan', { x: labelX, dy: index ? '22' : '0' }); span.textContent = line; text.append(span); }); labels.push(text);
      }
      l.choices.forEach((code, team) => {
        // Le premier choix ne laisse ni drapeau, ni sélection, ni libellé pendant le tour sauge.
        if (code !== region.code || (!bothLocked && team !== l.activeTeam)) return;
        const shared = bothLocked && l.choices[0] === l.choices[1];
        const x = region.center[0] + (shared ? team === 0 ? -40 : 8 : -14), y = region.center[1] - 52;
        const flag = franceSvg('g', { transform: `translate(${x},${y}) scale(1.3)`, class: `france-flag team-${team}`, role: 'img', 'aria-label': `Drapeau ${team === 0 ? 'corail' : 'sauge'} : ${region.name}` });
        flag.append(franceSvg('path', { d: 'M0 38V0M1 2H26L20 12L26 22H1', class: 'france-flag-shape' }));
        const number = franceSvg('text', { x: '10', y: '17', 'aria-hidden': 'true' }); number.textContent = String(team + 1); flag.append(number); flags.push(flag);
      });
    }
    svg.append(...labels, ...flags); return svg;
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
  if (FranceGame.revealLocation(game)) { scores(); renderFranceLocation(); $('france-region-answer').focus(); }
});
$('france-discover').addEventListener('click', () => { if (FranceGame.discover(game)) renderFrance(); });

// Les photos et leurs sources restent réservées aux corrections découvertes.
function appendFrancePhotoCredit(container, photo) {
  container.append(photo.credit + ' · ');
  for (const [url, label] of [[photo.source, 'Source'], [photo.licenseUrl, photo.license]]) {
    const link = document.createElement('a'); link.href = url; link.textContent = label; link.target = '_blank'; link.rel = 'noopener';
    container.append(link, ' · ');
  }
  container.append('Image affichée entière, sans retouche ni recadrage par le jeu.');
}
function appendFrancePhotoCredits(container) {
  const s = game?.france;
  if (!s) return;
  FranceGame.puzzles.forEach((puzzle, index) => {
    // La recherche seule ne suffit pas : attendre la correction géographique.
    const corrected = index < s.puzzleIndex || (index === s.puzzleIndex && ['correction', 'bonus', 'complete'].includes(s.phase));
    if (!corrected) return;
    const article = document.createElement('article');
    const title = document.createElement('h3'); title.textContent = `Manche 3 — ${puzzle.answer}`;
    const credit = document.createElement('p'); appendFrancePhotoCredit(credit, FrancePhotos[puzzle.id]);
    article.append(title, credit); container.append(article);
  });
}
