'use strict';
function openApero() {
  AperoGame.start(game);
  renderApero();
}
function renderApero() {
  scores();
  const s = game.apero;
  if (s.phase === 'intro') { show('apero-intro'); return; }
  if (s.phase === 'question') { renderDelivery(); show('delivery'); return; }
  if (s.phase === 'correction') { renderDeliveryCorrection(); show('delivery-correction'); return; }
  if (s.phase === 'bonus') {
    $('bonus-answer').hidden = !s.bonusRevealed;
    $('bonus-reveal').hidden = s.bonusRevealed;
    $('apero-finish').hidden = !s.bonusRevealed;
    show('apero-bonus'); return;
  }
  $('apero-totals').textContent = AperoGame.totals(game).map((total, i) => `${game.teams[i].name} : ${total} / 30 points sur cette manche`).join(' · ');
  show('apero-end');
}
function updateDeliveryStatus() {
  const count = game.apero.answers.reduce((n, a) => n + Number(a.department !== null) + Number(a.number !== null), 0);
  $('delivery-validate').disabled = !AperoGame.ready(game);
  $('delivery-status').textContent = count === 4 ? 'Les deux équipes ont répondu. Prêt à corriger !' : `${count} / 4 choix enregistrés. Complétez les deux réponses de chaque équipe.`;
}
function renderDelivery() {
  const s = game.apero, d = AperoGame.deliveries[s.index];
  $('delivery-progress').textContent = `L’APÉRO LOCAL / LIVRAISON ${s.index + 1} SUR 3`;
  $('delivery-title').textContent = d.city;
  $('delivery-answers').replaceChildren(...game.teams.map((team, teamIndex) => {
    const panel = document.createElement('section'); panel.className = `delivery-team team-${teamIndex}`;
    const heading = document.createElement('h2'); heading.textContent = team.name; panel.append(heading);
    for (const field of ['department', 'number']) {
      const group = document.createElement('fieldset');
      const legend = document.createElement('legend'); legend.textContent = field === 'department' ? 'Dans quel département se trouve cette ville ?' : 'Quel est son numéro ?'; group.append(legend);
      const choices = document.createElement('div'); choices.className = `delivery-choices ${field}`;
      (field === 'department' ? d.departments : d.numbers).forEach((value, optionIndex) => {
        const label = document.createElement('label');
        const radio = document.createElement('input'); radio.type = 'radio'; radio.name = `team-${teamIndex}-${field}`; radio.value = value; radio.required = true;
        radio.checked = s.answers[teamIndex][field] === value;
        radio.addEventListener('change', () => { AperoGame.choose(game, teamIndex, field, value); updateDeliveryStatus(); });
        const letter = document.createElement('span'); letter.className = 'option-letter'; letter.textContent = String.fromCharCode(65 + optionIndex);
        const text = document.createElement('span'); text.textContent = value;
        label.append(radio, letter, text); choices.append(label);
      });
      group.append(choices); panel.append(group);
    }
    return panel;
  }));
  updateDeliveryStatus();
}
function renderDeliveryCorrection() {
  const s = game.apero, d = AperoGame.deliveries[s.index];
  $('correction-progress').textContent = `LIVRAISON ${s.index + 1} / ${d.city.toLocaleUpperCase('fr')}`;
  $('delivery-correction-title').textContent = d.title;
  $('delivery-solution').textContent = `Département : ${d.department} (${d.number}).`;
  $('delivery-awards').replaceChildren(...s.results[s.index].map((r, i) => {
    const card = document.createElement('article'); card.className = `delivery-award team-${i}`;
    const title = document.createElement('h2'); title.textContent = `${game.teams[i].name} : +${r.points} points`;
    const department = document.createElement('p'); department.textContent = `${r.departmentCorrect ? '✓' : '✕'} ${r.department} → +${r.departmentCorrect ? 5 : 0} points`;
    const number = document.createElement('p'); number.textContent = `${r.numberCorrect ? '✓' : '✕'} Numéro ${r.number} → +${r.numberCorrect ? 5 : 0} points`;
    card.append(title, department, number); return card;
  }));
  $('department-map').src = `assets/maps/${d.number}.svg`;
  $('department-map').alt = `Carte de la ${d.department}, avec ${d.city} et ${d.prefecture}. Le département est en sauge et les communes en corail.`;
  $('department-prefecture').textContent = `PRÉFECTURE : ${d.prefecture}`;
  $('department-facts').replaceChildren(...d.facts.map(fact => { const li = document.createElement('li'); li.textContent = fact; return li; }));
  $('department-illustrations').hidden = d.number !== '17';
  $('delivery-next').textContent = s.index === 2 ? 'LE BONUS FINAL →' : 'LIVRAISON SUIVANTE →';
}
$('apero-begin').addEventListener('click', () => { AperoGame.begin(game); renderApero(); });
$('delivery-form').addEventListener('submit', event => {
  event.preventDefault();
  if (AperoGame.validate(game)) renderApero();
});
$('delivery-next').addEventListener('click', () => { if (AperoGame.next(game)) renderApero(); });
$('bonus-reveal').addEventListener('click', () => {
  AperoGame.revealBonus(game);
  $('bonus-answer').hidden = false; $('bonus-reveal').hidden = true; $('apero-finish').hidden = false;
  $('bonus-answer').setAttribute('tabindex', '-1'); $('bonus-answer').focus();
});
$('apero-finish').addEventListener('click', () => { if (AperoGame.finish(game)) renderApero(); });
document.querySelectorAll('.apero-back').forEach(button => button.addEventListener('click', () => { scores(); show('journey'); }));
