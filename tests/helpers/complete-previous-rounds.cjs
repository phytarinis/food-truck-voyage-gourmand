// Parcours de référence obtenu par les moteurs, sans écrire de phase « complete ».
module.exports=function completePreviousRounds(){
 const must=value=>{if(!value)throw new Error('Action du parcours complet refusée');};
 game=FoodTruckGame.createGame(['Corail','Sauge']);
 AperoGame.start(game);AperoGame.begin(game);
 for(let i=0;i<3;i++){
  const d=AperoGame.deliveries[i];
  for(const t of[0,1]){must(AperoGame.choose(game,t,'department',d.department));must(AperoGame.choose(game,t,'number',d.number));}
  must(AperoGame.validate(game));must(AperoGame.next(game));
 }
 must(AperoGame.chooseBonus(game,0));must(AperoGame.revealBonus(game));must(AperoGame.finish(game));
 for(const M of[SauceGame,FranceGame,PassportGame]){
  M.start(game);M.begin(game);
  for(let i=0;i<3;i++){
   for(const t of[0,1])must(M.validate(game,t,true,M.token(game,t)));
   if(M!==SauceGame){
    must(M.startLocation(game));
    for(const t of[0,1]){const stamp=M.locationToken(game);must(M.chooseRegion(game,M.puzzles[i].region,stamp));must(M.lockFlag(game,stamp));}
    must(M.revealLocation(game));must(M.discover(game));
   }
   must(M.next(game));
  }
  must(M.chooseBonus(game,0));must(M.revealBonus(game));must(M.finish(game));
 }
 GpsGame.start(game);GpsGame.begin(game);
 for(let i=0;i<3;i++){
  for(const t of[0,1]){
   if(i===1)for(const [label,slot]of ['c','a','b'].entries())must(GpsGame.placeRiver(game,label,slot,GpsGame.token(game)));
   else must(GpsGame.placePoint(game,i===0?[.5,42.7]:[6.5,45.5],GpsGame.token(game)));
   must(GpsGame.lock(game,GpsGame.token(game),performance.now()));
  }
  must(GpsGame.reveal(game));must(GpsGame.next(game));
 }
 must(GpsGame.chooseBonus(game,0));must(GpsGame.revealBonus(game));must(GpsGame.finish(game));
 game.careerPauses={};
 CareerPauses.jobs.forEach((job,index)=>{const pause=CareerPauses.createPause(index);must(CareerPauses.select(pause,job.falseIndex));must(CareerPauses.reveal(pause));game.careerPauses[index]=pause;});
 openWorld();
};
