/* Choix successifs et révélation unique, partagés par les manches 3, 5 et 6. */
(function(root){
 'use strict';
 function create(){return {activeTeam:0,choices:[null,null],locked:[false,false],revealed:false};}
 function token(state,prefix){return state&&!state.revealed&&!state.locked.every(Boolean)?`${prefix}:${state.activeTeam}`:null;}
 function select(state,choice,stamp,current,valid){
  if(!current||stamp!==current||!state||state.revealed||state.locked[state.activeTeam]||!valid(choice))return false;
  state.choices[state.activeTeam]=Array.isArray(choice)?choice.slice():choice;return true;
 }
 function lock(state,stamp,current){
  if(!current||stamp!==current||!state||state.revealed||state.locked[state.activeTeam]||state.choices[state.activeTeam]===null)return false;
  state.locked[state.activeTeam]=true;state.activeTeam=1;return true;
 }
 function reveal(state,correct,points){
  if(!state||!state.locked.every(Boolean)||state.revealed)return null;
  state.revealed=true;return state.choices.map(choice=>correct(choice)?points:0);
 }
 function visibleTeams(state){return state.locked.every(Boolean)?[0,1]:[state.activeTeam];}
 const api={create,token,select,lock,reveal,visibleTeams};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FlagChoices=api;
})(globalThis);
