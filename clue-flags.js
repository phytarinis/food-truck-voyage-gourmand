/* Moteur partagé des indices synchronisés et drapeaux : manches 3 et 5. */
(function(root){
 'use strict';
 const Flags=typeof module!=='undefined'&&module.exports?require('./flag-choices.js'):root.FlagChoices;
 function createRound({key, points, puzzles, bonus, regionCodes}) {
  let nextId = 1;
  const newPlayers = () => [0, 1].map(() => ({ clueIndex: 0, status: 'searching', points: 0, locationPoints: 0, revision: 0 }));
  function start(game) {
    if (!game[key]) game[key] = { id: nextId++, puzzleIndex: 0, clueIndex: 0, phase: 'intro', players: newPlayers(), results: [], bonus: { selected: null, revealed: false } };
    return game[key];
  }
  function begin(game) { if (game[key]?.phase === 'intro') game[key].phase = 'search'; }
  function token(game, team) {
    const s = game[key];
    if (!s || s.phase !== 'search' || ![0, 1].includes(team) || s.players[team].status !== 'searching') return null;
    return `${key}:${s.id}:${s.puzzleIndex}:${s.clueIndex}:${team}:${s.players[team].revision}`;
  }
  function validate(game, team, correct, expectedToken) {
    const current = token(game, team);
    if (!current || expectedToken !== current || typeof correct !== 'boolean') return false;
    const s = game[key], p = s.players[team];
    p.revision++; p.clueIndex = s.clueIndex;
    if (correct) {
      p.points = points[p.clueIndex]; p.status = 'found';
      game.teams[team].score += p.points;
    } else if (s.clueIndex === 2) p.status = 'exhausted';
    else p.status = 'waiting';
    if (s.players.every(player => player.status === 'found' || player.status === 'exhausted')) {
      s.results[s.puzzleIndex] = s.players.map(player => ({ ...player }));
      s.phase = 'answer';
    }
    return true;
  }
  function canRevealNextClue(game) {
    const s = game[key];
    return Boolean(s && s.phase === 'search' && s.clueIndex < 2 &&
      s.players.every(player => player.status === 'waiting' || player.status === 'found') &&
      s.players.some(player => player.status === 'waiting'));
  }
  function nextClueToken(game) {
    if (!canRevealNextClue(game)) return null;
    const s = game[key];
    return `${key}:${s.id}:${s.puzzleIndex}:${s.clueIndex}:${s.players.map(player => player.revision).join(':')}`;
  }
  function revealNextClue(game, expectedToken) {
    const current = nextClueToken(game);
    if (!current || current !== expectedToken) return false;
    const s = game[key]; s.clueIndex++;
    for (const player of s.players) {
      if (player.status === 'waiting') {
        player.status = 'searching'; player.clueIndex = s.clueIndex; player.revision++;
      }
    }
    return true;
  }
  function startLocation(game) {
    const s = game[key];
    if (!s || s.phase !== 'answer') return false;
    s.location = Flags.create();
    s.phase = 'location'; return true;
  }
  function locationToken(game) {
    const s = game[key], l = s?.location;
    if (s?.phase !== 'location' || !l || l.revealed || l.locked.every(Boolean)) return null;
    return Flags.token(l,`${key}:${s.id}:${s.puzzleIndex}:flag`);
  }
  function chooseRegion(game, code, stamp) {
    return Flags.select(game[key]?.location,code,stamp,locationToken(game),choice=>regionCodes.includes(choice));
  }
  function lockFlag(game, stamp) {
    return Flags.lock(game[key]?.location,stamp,locationToken(game));
  }
  function revealLocation(game) {
    const s=game[key];if(s?.phase!=='location')return false;
    const awards=Flags.reveal(s.location,choice=>choice===puzzles[s.puzzleIndex].region,5);
    if(!awards)return false;
    s.players.forEach((p,team)=>{
      p.locationPoints=awards[team];game.teams[team].score+=awards[team];
      Object.assign(s.results[s.puzzleIndex][team],{locationPoints:awards[team],region:s.location.choices[team]});
    });return true;
  }
  function discover(game) {
    if (game[key]?.phase !== 'location' || !game[key].location.revealed) return false;
    game[key].phase = 'correction'; return true;
  }
  function next(game) {
    const s = game[key];
    if (!s || s.phase !== 'correction') return false;
    if (s.puzzleIndex === puzzles.length - 1) s.phase = 'bonus';
    else { s.puzzleIndex++; s.clueIndex = 0; s.players = newPlayers(); s.phase = 'search'; }
    return true;
  }
  function chooseBonus(game, choice) {
    const s = game[key];
    if (!s || s.phase !== 'bonus' || s.bonus.revealed || !Number.isInteger(choice) || choice < 0 || choice >= bonus.options.length) return false;
    s.bonus.selected = choice; return true;
  }
  function revealBonus(game) {
    const s = game[key];
    if (!s || s.phase !== 'bonus' || s.bonus.selected === null || s.bonus.revealed) return false;
    s.bonus.revealed = true; return true;
  }
  function finish(game) {
    const s = game[key];
    if (!s || s.phase !== 'bonus' || !s.bonus.revealed) return false;
    s.phase = 'complete'; return true;
  }
  function totals(game) { return game.teams.map((_, team) => (game[key]?.results || []).reduce((sum, result) => sum + result[team].points + result[team].locationPoints, 0)); }
  const api = { points, puzzles, bonus, regionCodes, startLocation, locationToken, chooseRegion, lockFlag, revealLocation, discover, start, begin, token, validate, canRevealNextClue, nextClueToken, revealNextClue, next, chooseBonus, revealBonus, finish, totals };
  return api;
 }
 if(typeof module!=='undefined'&&module.exports)module.exports=createRound;
 else root.createClueFlagRound=createRound;
})(globalThis);
