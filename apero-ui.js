'use strict';
function openApero() {
 if(presentRound(0))return;
  AperoGame.start(game);
  renderApero();
}
function renderApero() {
  scores();
  const s = game.apero;
  if (s.phase === 'intro') { AperoGame.begin(game); renderApero(); return; }
  if (s.phase === 'question') { if(AperoGame.entriesReady(game)){AperoGame.validate(game);renderApero();return;} renderDelivery(); show('delivery'); return; }
  if (s.phase === 'correction') { renderDeliveryCorrection(); show('delivery-correction'); return; }
  if (s.phase === 'bonus') {
    document.querySelectorAll('input[name=apero-discovery-choice]').forEach(input=>{input.checked=Number(input.value)===s.bonusChoice;input.disabled=s.bonusRevealed;input.closest('li').classList.toggle('discovery-correct',s.bonusRevealed&&input.value==='1');});
    $('bonus-reveal').disabled=![0,1,2].includes(s.bonusChoice);
    $('bonus-answer').hidden = !s.bonusRevealed;
    $('bonus-reveal').hidden = s.bonusRevealed;
    $('apero-finish').hidden = !s.bonusRevealed;
    show('apero-bonus'); return;
  }
  openCareerPause(0);
}
function updateDeliveryStatus() {
  const e=AperoGame.entry(game);
  const record=$('delivery-record'),arrow=document.createElement('span');arrow.textContent='→';
  record.replaceChildren(document.createTextNode(e.team===null?'Enregistrer la réponse':`Enregistrer la réponse de ${game.teams[e.team].name}`),arrow);
  record.classList.toggle('team-0',e.team===0);record.classList.toggle('team-1',e.team===1);
  record.hidden=e.team===null;
  $('delivery-record').disabled=e.draft.department===null||e.draft.number===null;

  $('delivery-status').textContent='La correction apparaît après l’enregistrement de la deuxième équipe.';
}
function renderDelivery() {
  const s=game.apero,d=AperoGame.deliveries[s.index],e=AperoGame.entry(game),stamp=AperoGame.entryToken(game);

  const city=document.createElement('span');city.className='delivery-city';city.textContent=d.city;
  $('delivery-title').replaceChildren(document.createTextNode('Dans quel département se situe '),city,document.createTextNode(' et quel est le numéro de ce département ?'));
  $('delivery-turn').textContent=e.team===null?'':`À ${game.teams[e.team].name} de répondre`;
  $('delivery-turn').className=`delivery-turn${e.team===null?'':` team-${e.team}`}`;
  $('delivery-answers').replaceChildren();
  if(e.team!==null){
    const panel=document.createElement('section');panel.className=`delivery-team team-${e.team}`;
    for(const field of ['department','number']){
      const group=document.createElement('fieldset'),legend=document.createElement('legend');group.className=`delivery-field delivery-field-${field}`;legend.textContent=field==='department'?'01 — Le département':'02 — Son numéro';group.append(legend);
      const choices=document.createElement('div');choices.className=`delivery-choices ${field}`;
      (field==='department'?d.departments:d.numbers).forEach((value,i)=>{
        const label=document.createElement('label'),radio=document.createElement('input'),letter=document.createElement('span'),text=document.createElement('span');
        radio.type='radio';radio.name=`team-${e.team}-${field}`;radio.value=value;radio.required=true;radio.checked=e.draft[field]===value;
        radio.onchange=()=>{if(AperoGame.pick(game,field,value,stamp))updateDeliveryStatus()};
        letter.className='option-letter';letter.textContent=String.fromCharCode(65+i);text.textContent=value;label.append(radio,letter,text);choices.append(label);
      });group.append(choices);panel.append(group);
    }$('delivery-answers').append(panel);
  }
  $('delivery-records').replaceChildren(...game.teams.map((team,i)=>{
    const item=document.createElement('div'),status=document.createElement('span');item.className=`delivery-record team-${i}`;
    status.textContent=`${team.name} : ${e.recorded[i]?'réponse enregistrée':'en attente'}`;item.append(status);
    if(e.recorded[i]){const edit=document.createElement('button');edit.type='button';edit.className='text-button';edit.textContent='Modifier';edit.setAttribute('aria-label',`Modifier la réponse de ${team.name}`);edit.onclick=()=>{if(AperoGame.edit(game,i)){renderDelivery();$('delivery-turn').focus()}};item.append(edit)}return item;
  }));
  updateDeliveryStatus();
}
function renderDeliveryCorrection() {
  const s = game.apero, d = AperoGame.deliveries[s.index];

  $('delivery-correction-title').textContent = d.title;
  highlightText('delivery-solution',`Département : ${d.department} (${d.number}).`,[d.department]);
  $('delivery-awards').replaceChildren(...s.results[s.index].map((r, i) => {
    const card = document.createElement('article'); card.className = `delivery-award team-${i}`;
    const title = document.createElement('h2'); title.textContent = `${game.teams[i].name} : +${r.points} points`;
    const department = document.createElement('p'); department.textContent = `${r.departmentCorrect ? '✓' : '✕'} ${r.department} → +${r.departmentCorrect ? 5 : 0} points`;
    const number = document.createElement('p'); number.textContent = `${r.numberCorrect ? '✓' : '✕'} Numéro ${r.number} → +${r.numberCorrect ? 5 : 0} points`;
    card.append(title, department, number); return card;
  }));
  $('department-map').src = `assets/maps/france-${d.number}.svg`;
  $('department-map').alt = `Carte de France métropolitaine et zoom sur la ${d.department}, avec ${d.city} (repère 1) et ${d.prefecture} (repère 2).`;
  $('department-prefecture').textContent = `PRÉFECTURE : ${d.prefecture}`;
  $('department-facts').replaceChildren();
  renderCulturePhotos(d.number);
  $('delivery-next-label').textContent = s.index === 2 ? 'Défi découverte' : 'Livraison suivante';
}
function renderCulturePhotos(department) {
  $('department-illustrations').replaceChildren(...CulturePhotos[department].map(photo => {
    const figure = document.createElement('figure'); figure.className = 'culture-photo';
    const hasPhoto = Boolean(photo.src);
    if (hasPhoto) {
      const image = document.createElement('img'); image.src = photo.src; image.alt = photo.alt;
      const link = document.createElement('a'); link.className = 'culture-photo-link';
      link.href = photo.src; link.target = '_blank'; link.rel = 'noopener';
      link.setAttribute('aria-label', `Agrandir : ${photo.caption} (nouvel onglet)`);
      link.append(image); figure.append(link);
    } else {
      const placeholder = document.createElement('div'); placeholder.className = 'culture-photo-placeholder';
      const icon = document.createElement('span'); icon.className = 'photo-frame'; icon.setAttribute('aria-hidden', 'true');
      const note = document.createElement('span'); note.textContent = 'Photo à ajouter';
      placeholder.append(icon, note); figure.append(placeholder);
    }
    const caption = document.createElement('figcaption');
    const title = document.createElement('strong'); title.textContent = photo.caption; caption.append(title);
    if (hasPhoto) {
      const credit = document.createElement('small');
      const addLink = (url, text) => {
        const link = document.createElement('a'); link.href = url; link.textContent = text;
        link.target = '_blank'; link.rel = 'noopener'; return link;
      };
      if (photo.credit) credit.append(`${photo.verification === 'verified' ? '' : 'Référence fournie : '}${photo.credit}`);
      if (photo.license) {
        credit.append(' · ');
        credit.append(photo.licenseUrl ? addLink(photo.licenseUrl, photo.license) : photo.license);
      }
      if (photo.source) credit.append(' · ', addLink(photo.source, 'Source'));
      if (!photo.credit) credit.textContent = 'Crédit et licence à vérifier';
      if (photo.verification !== 'verified' && photo.credit) {
        const status = document.createElement('span'); status.className = 'photo-credit-status';
        status.textContent = 'Correspondance et licence non vérifiées';
        credit.append(status);
      }
      caption.append(credit);
    }
    figure.append(caption); return figure;
  }));
  $('department-illustrations').hidden = false;
}
function recordDeliveryAnswer(){if(AperoGame.record(game,AperoGame.entryToken(game))){renderApero();if(game.apero.phase==='question')$('delivery-turn').focus();saveProgress()}}
$('delivery-record').addEventListener('click',recordDeliveryAnswer);
$('delivery-form').addEventListener('submit', event => {
  event.preventDefault();
  recordDeliveryAnswer();
});
$('delivery-next').addEventListener('click', () => { if (AperoGame.next(game)) renderApero(); });
document.querySelectorAll('input[name=apero-discovery-choice]').forEach(input=>input.addEventListener('change',()=>{if(AperoGame.chooseBonus(game,Number(input.value)))$('bonus-reveal').disabled=false;}));
$('bonus-reveal').addEventListener('click', () => {
  if(!AperoGame.revealBonus(game))return;
  renderApero();$('bonus-answer').setAttribute('tabindex','-1');$('bonus-answer').focus();
});
$('apero-finish').addEventListener('click', () => { if (AperoGame.finish(game)) renderApero(); });
document.querySelectorAll('.apero-back').forEach(button => button.addEventListener('click', () => { scores(); show('journey'); }));
