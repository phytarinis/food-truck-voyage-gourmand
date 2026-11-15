'use strict';
// Réutiliser le visuel du bouton Livraison suivante ; les validations individuelles restent intactes.
function harmonizeActions(){
 for(const button of document.querySelectorAll('button.primary, button.text-button')){
  if(button.closest('#setup,#rules')||button.id==='career-reveal'||button.closest('.apero-screen,.france-screen')||button.id==='onward'||button.closest('#welcome')||button.matches('#correct,#wrong,[data-correct],[id$="-next-clue"]')||button.closest('.sauce-controls')||button.closest('dialog')||(!button.classList.contains('primary')&&!/carnet de route/i.test(button.textContent)))continue;
  if(button.querySelector('.action-van')||button.classList.contains('truck-next'))continue;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('action-van');svg.setAttribute('viewBox','0 0 940 740');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
  const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#truck-art');svg.append(use);button.prepend(svg);button.classList.add('van-action');
 }
}
new MutationObserver(harmonizeActions).observe(document.querySelector('main'),{childList:true,subtree:true});
harmonizeActions();
// Boutons secondaires de la manche 1 : icône de carte, aucune illustration de van.
for(const button of document.querySelectorAll('.apero-screen .apero-back')){
 button.classList.remove('text-button');button.classList.add('secondary','apero-map-back');
 const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 32 28');icon.setAttribute('aria-hidden','true');icon.innerHTML='<path d="m2 6 9-4 10 4 9-4v20l-9 4-10-4-9 4Zm9-4v20M21 6v20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>';button.prepend(icon);
}

// Manche 3 : navigation discrète vers le carnet, sans changer sa destination.
for(const button of document.querySelectorAll('.france-screen .france-back')){
 button.classList.remove('text-button');button.classList.add('secondary','apero-map-back');
 const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 32 28');icon.setAttribute('aria-hidden','true');icon.innerHTML='<path d="m2 6 9-4 10 4 9-4v20l-9 4-10-4-9 4Zm9-4v20M21 6v20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>';button.prepend(icon);
}
