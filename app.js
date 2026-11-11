'use strict';
const { clues, rounds, createGame, startChallenge, answer } = FoodTruckGame;
const $ = id => document.getElementById(id);
let game;
function show(id) {
  document.body.classList.toggle('welcome-mode', id === 'welcome');
  document.querySelectorAll('.screen').forEach(screen => { screen.hidden = screen.id !== id; });
  $('reset').hidden = id === 'welcome';
  const heading = $(id).querySelector('h1');
  if (heading && heading.hasAttribute('tabindex')) heading.focus();
  window.scrollTo(0, 0);
}
function scores() {
  document.querySelectorAll('.scoreboard').forEach(board => {
    board.replaceChildren(...game.teams.map((team, index) => {
      const card = document.createElement('div');
      card.className = `score team-${index}`;
      const name = document.createElement('strong');
      name.textContent = team.name;
      const points = document.createElement('span');
      points.className = 'score-points';
      points.textContent = `${team.score} pts`;
      const jokers = document.createElement('small');
      jokers.className = 'joker-counter';
      const peppers = document.createElement('span');
      peppers.className = 'pepper-pair';
      peppers.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 2; i++) {
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.classList.add('joker-pepper');
        icon.classList.toggle('is-used', i >= team.jokers);
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttribute('href', '#pepper-icon');
        icon.append(use);
        peppers.append(icon);
      }
      const label = document.createElement('span');
      label.textContent = `${team.jokers} jokers disponibles · à venir`;
      jokers.append(peppers, label);
      card.append(name, points, jokers);
      return card;
    }));
  });
}
function renderChallenge(message = '') {
  const c = game.challenge;
  if (c.done) { renderResult(); return; }
  scores();
  $('clue').textContent = clues[c.clueIndex].text;
  $('clue-number').textContent = `INDICE 0${c.clueIndex + 1} / 03`;
  $('clue-progress').textContent = clues.map((_, i) => i <= c.clueIndex ? '●' : '○').join(' ');
  $('points').textContent = `${clues[c.clueIndex].points} POINTS`;
  $('active-team').textContent = game.teams[c.active].name;
  $('attempt-status').textContent = 'Une tentative par équipe pour cet indice.';
  $('feedback').textContent = message;
}
function launch() {
  startChallenge(game);
  renderChallenge();
  show('challenge');
}
function renderResult() {
  scores();
  const c = game.challenge;
  $('outcome').textContent = c.winner === null ? 'Personne n’a trouvé cette fois : 0 point pour les deux équipes. Le voyage continue !' : `${game.teams[c.winner].name} remporte ${c.awarded} points. Bien joué !`;
  show('result');
}
$('onward').addEventListener('click', () => { show('setup'); $('team-one').focus(); });
$('team-form').addEventListener('submit', event => {
  event.preventDefault();
  const inputs = [$('team-one'), $('team-two')];
  for (const input of inputs) {
    input.setCustomValidity(input.value.trim() ? '' : 'Saisissez un nom d’équipe.');
    if (!input.reportValidity()) return;
  }
  game = createGame(inputs.map(input => input.value));
  scores();
  show('rules');
});
$('rules-next').addEventListener('click', () => show('journey'));
[$('team-one'), $('team-two')].forEach(input => input.addEventListener('input', () => input.setCustomValidity('')));
// État de présentation prêt pour les futures manches. La démo ne fait pas
// progresser cet itinéraire : aucune des six manches n’est encore jouable.
function renderRoute({ current = null, completed = [] } = {}) {
  $('rounds').replaceChildren();
  rounds.forEach((title, index) => {
    const state = completed.includes(index) ? 'complete' : current === index ? 'active' : 'pending';
    const card = document.createElement('li');
    card.className = `route-stop ${state}`;
    if (state === 'active') card.setAttribute('aria-current', 'step');
    const number = document.createElement('span'); number.className = 'stop-number'; number.textContent = `0${index + 1}`;
    const name = document.createElement('h2'); name.textContent = title;
    const status = document.createElement('small'); status.textContent = { pending: 'À venir', active: 'En cours', complete: 'Terminée' }[state];
    card.append(number, name, status); $('rounds').append(card);
  });
  const truck = $('route-truck');
  truck.style.setProperty('--stop', current === null ? 0 : current + 1);
  truck.classList.toggle('on-route', current !== null);
  truck.querySelector('span').textContent = current === null ? 'AU DÉPART' : `ESCALE ${current + 1}`;
}
renderRoute();
$('play').addEventListener('click', launch);
$('replay').addEventListener('click', launch);
$('back-to-journey').addEventListener('click', () => { scores(); show('journey'); });
$('correct').addEventListener('click', () => { answer(game, true); renderChallenge(); });
$('wrong').addEventListener('click', () => {
  const previous = game.challenge.clueIndex;
  const team = game.teams[game.challenge.active].name;
  answer(game, false);
  renderChallenge(previous === game.challenge.clueIndex ? `${team} n’a pas trouvé. À l’autre équipe de tenter sa chance !` : 'Les deux équipes ont tenté leur chance. Voici l’indice suivant !');
});
$('reset').addEventListener('click', () => $('reset-dialog').showModal());
$('cancel-reset').addEventListener('click', () => $('reset-dialog').close());
$('confirm-reset').addEventListener('click', () => {
  $('reset-dialog').close(); game = null; $('team-form').reset();
  [$('team-one'), $('team-two')].forEach(input => input.setCustomValidity(''));
  show('welcome'); $('onward').focus();
});
