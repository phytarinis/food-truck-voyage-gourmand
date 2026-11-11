'use strict';
let currentCareerIndex = 0;
// Point d’entrée réutilisable pour les prochaines manches. Seule la manche 1
// l’appelle actuellement ; aucune autre manche n’est simulée ou terminée ici.
function openCareerPause(index) {
  if (!game) return;
  const state = CareerPauses.createPause(index);
  if (!game.careerPauses) game.careerPauses = {};
  if (!game.careerPauses[index]) game.careerPauses[index] = state;
  currentCareerIndex = index;
  renderCareerPause();
  show('career-pause');
}
const careerIcons = {
  door: '<path d="M7 28V4h19v24M2 28h30M20 16h1M12 8h8"/>',
  compass: '<circle cx="17" cy="17" r="13"/><path d="m23 10-4 11-9 3 4-10Z"/>',
  speech: '<path d="M4 4h26v19H15L7 30v-7H4Zm5 7h16M9 16h11"/>',
  spark: '<path d="m17 3 4 9 10 4-10 4-4 10-4-10-10-4 10-4ZM27 1v6m-3-3h6"/>',
  stairs: '<path d="M3 29h27M5 27v-7h7v-7h7V6h9M19 6h9v9"/>'
};
function renderCareerPause() {
  const state = game.careerPauses[currentCareerIndex], job = CareerPauses.jobs[currentCareerIndex];
  scores();
  $('career-progress').textContent = `PAUSE MÉTIER ${currentCareerIndex + 1} / ${job.name.toLocaleUpperCase('fr')} · ENTRE LES MANCHES ${job.afterRound} ET ${job.afterRound + 1}`;
  $('career-title').textContent = job.title;
  $('career-quote').hidden = !state.revealed;
  $('career-quote').textContent = state.revealed ? job.quote : '';
  const illustration = CareerIllustrations[currentCareerIndex];
  const portrait = $('career-portrait'); portrait.replaceChildren();
  portrait.dataset.career = String(currentCareerIndex + 1);
  if (illustration.src) {
    const image = document.createElement('img'); image.src = illustration.src; image.alt = illustration.alt;
    portrait.append(image);
  } else {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 380 696'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Notre compagnon de voyage, repris de l’illustration d’accueil validée');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use'); use.setAttribute('href', '#companion-art');
    svg.append(use); portrait.append(svg);
  }
  $('career-cards').replaceChildren(...job.statements.map((statement, index) => {
    const card = document.createElement('label'); card.className = 'career-card';
    const input = document.createElement('input'); input.type = 'radio'; input.name = 'career-choice'; input.value = String(index); input.required = true;
    input.checked = state.selected === index; input.disabled = state.revealed;
    const letter = document.createElement('span'); letter.className = 'career-letter'; letter.textContent = String.fromCharCode(65 + index);
    const text = document.createElement('span'); text.className = 'career-statement'; text.textContent = statement;
    card.append(input, letter, text);
    if (state.revealed) {
      const myth = index === job.falseIndex;
      card.classList.add(myth ? 'is-myth' : 'is-truth');
      const badge = document.createElement('span'); badge.className = 'career-verdict'; badge.textContent = myth ? '✕ IDÉE REÇUE' : '✓ VRAI';
      card.append(badge);
    }
    input.addEventListener('change', () => {
      CareerPauses.select(state, index);
      $('career-reveal').disabled = false;
      $('career-choice-status').textContent = `Proposition ${String.fromCharCode(65 + index)} retenue collectivement. Prêts à découvrir ?`;
    });
    return card;
  }));
  $('career-reveal').disabled = state.selected === null;
  $('career-reveal').hidden = state.revealed;
  $('career-choice-status').hidden = state.revealed;
  if (!state.revealed) $('career-choice-status').textContent = state.selected === null ? 'Le formateur sélectionne votre proposition.' : `Proposition ${String.fromCharCode(65 + state.selected)} retenue collectivement.`;
  $('career-revelation').hidden = !state.revealed;
  $('career-continue').hidden = !state.revealed;
  // Ne placer la correction et les informations dans le DOM qu’à la révélation.
  $('career-feedback').textContent = '';
  $('career-explanation').textContent = '';
  $('career-facts').replaceChildren();
  if (state.revealed) {
    $('career-feedback').textContent = state.selected === job.falseIndex ? 'Bien vu ! Vous avez débusqué l’idée reçue.' : 'Surprise ! L’idée reçue se cachait en ' + String.fromCharCode(65 + job.falseIndex) + '.';
    $('career-explanation').textContent = job.explanation;
    $('career-facts').append(...job.facts.map(fact => {
      const item = document.createElement('li');
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); icon.setAttribute('viewBox', '0 0 34 34'); icon.setAttribute('aria-hidden', 'true'); icon.innerHTML = careerIcons[fact.icon];
      const text = document.createElement('span'); text.textContent = fact.text;
      item.append(icon, text); return item;
    }));
  }
}
$('career-start').addEventListener('click', () => {
  if (game?.apero?.phase === 'complete') openCareerPause(0);
});
$('career-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!game?.careerPauses) return;
  if (CareerPauses.reveal(game.careerPauses[currentCareerIndex])) {
    renderCareerPause(); $('career-revelation').focus();
  }
});
$('career-continue').addEventListener('click', () => {
  if (game?.careerPauses?.[currentCareerIndex]?.revealed) { scores(); show('journey'); }
});
