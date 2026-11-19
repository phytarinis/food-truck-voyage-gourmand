/* Schéma collectif de la Garonne, distinct de la carte interactive. */
const renderGpsBonusWithoutContext=renderGpsBonus;
renderGpsBonus=function(){
 renderGpsBonusWithoutContext();
 const figure=$('gps-bonus').querySelector('figure.bonus-map');
 figure.hidden=!game.gps.bonus.revealed;
 const image=figure.querySelector('img');image.src='assets/maps/garonne-fleuve-riviere.svg';
 image.alt='Schéma non cartographique : Garonne et Dordogne confluent au bec d’Ambès, puis l’estuaire de la Gironde s’ouvre sur l’océan Atlantique.';
 figure.querySelector('figcaption').textContent='Schéma pédagogique original, non cartographique · flèches : sens de l’écoulement';
 $('gps-bonus-discovery').hidden=true;
};
