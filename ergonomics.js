'use strict';
// Les actions restent attachées aux boutons existants ; seules leur présentation
// et les légendes des retours au carnet sont harmonisées.
const progressionButtons=new Set(['rules-next','round-start','delivery-next','apero-finish','sauce-next','sauce-bonus-finish','france-next','france-bonus-finish','gps-next','gps-bonus-finish','passport-next','passport-bonus-finish','world-next','spicy-break-next','spicy-return','spicy-final-close','final-to-memories','final-to-results','final-new-game','final-review']);
const routeBackSelector='.apero-back,.sauce-back,.france-back,.gps-back,.passport-back,.world-back,#career-continue,#spicy-final-back,#final-review-back';
function harmonizeActions(){
 for(const button of document.querySelectorAll('main button')){
  // Retirer les anciens vans des boutons sans toucher aux illustrations du jeu.
  button.querySelectorAll('.action-van,svg:has(use[href="#truck-art"])').forEach(icon=>icon.remove());
  button.classList.remove('van-action','truck-next');
  if(progressionButtons.has(button.id)||button.matches('#team-form button[type="submit"]'))button.classList.add('progress-action');
  if(button.matches(routeBackSelector)&&!button.classList.contains('route-back')){
   button.classList.remove('primary','text-button','progress-action');
   button.classList.add('secondary','route-back','apero-map-back');
   button.replaceChildren();
   const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
   icon.setAttribute('viewBox','0 0 32 28');icon.setAttribute('aria-hidden','true');icon.classList.add('route-back-icon');
   icon.innerHTML='<path d="m2 6 9-4 10 4 9-4v20l-9 4-10-4-9 4Zm9-4v20M21 6v20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>';
   button.append(icon,document.createTextNode('Carnet de route'));
  }
 }
}
new MutationObserver(harmonizeActions).observe(document.querySelector('main'),{childList:true,subtree:true});
harmonizeActions();
