/* Manche 1 : saisie successive indépendante, barème inchangé. */
(function (root) {
  'use strict';
  const deliveries = [
    { city: 'Montpon-Ménestérol', departments: ['Charente', 'Gironde', 'Dordogne', 'Charente-Maritime'], numbers: ['16', '17', '24', '33'], department: 'Dordogne', number: '24', prefecture: 'Périgueux', title: 'Bienvenue en Dordogne !', facts: ['Les grottes de Lascaux sont célèbres pour leurs peintures préhistoriques.', 'Autre repère : les châteaux et les paysages du Périgord.'] },
    { city: 'Jonzac', departments: ['Dordogne', 'Charente-Maritime', 'Gironde', 'Charente'], numbers: ['33', '24', '16', '17'], department: 'Charente-Maritime', number: '17', prefecture: 'La Rochelle', title: 'Bienvenue en Charente-Maritime !', facts: ['L’Aquarium de La Rochelle invite à découvrir le monde marin.', 'Fort Boyard est un fort construit en mer, célèbre grâce à l’émission télévisée.'] },
    { city: 'Barbezieux-Saint-Hilaire', departments: ['Gironde', 'Dordogne', 'Charente', 'Charente-Maritime'], numbers: ['17', '33', '16', '24'], department: 'Charente', number: '16', prefecture: 'Angoulême', title: 'Bienvenue en Charente !', facts: ['Angoulême est renommée pour la bande dessinée.', 'Autre repère : le château de Barbezieux.'] }
  ];
  const emptyAnswers = () => [{ department: null, number: null }, { department: null, number: null }];
  function start(game) {
    if (!game.apero) game.apero = { index: 0, phase: 'question', answers: emptyAnswers(), results: [], bonusRevealed: false };
    return game.apero;
  }
  function begin(game) { const s = start(game); if (s.phase === 'intro') s.phase = 'question'; }
  function choose(game, team, field, value) {
    const s = game.apero;
    if (!s || s.phase !== 'question' || ![0, 1].includes(team) || !['department', 'number'].includes(field)) return false;
    const d = deliveries[s.index];
    if (!(field === 'department' ? d.departments : d.numbers).includes(value)) return false;
    s.answers[team][field] = value;
    return true;
  }
  let nextEntryId = 1;
  function entry(game) {
    const s = game?.apero;
    if (s?.phase !== 'question') return null;
    if (!s.entry || s.entry.index !== s.index) {
      const recorded = s.answers.map(a => a.department !== null && a.number !== null);
      const team = recorded.every(Boolean) ? null : recorded.indexOf(false);
      s.entry = { id: nextEntryId++, index: s.index, team, recorded, draft: team === null ? {department:null,number:null} : {...s.answers[team]}, revision: 0 };
    }
    return s.entry;
  }
  function entryToken(game) { const e=entry(game);return e&&e.team!==null?`${e.id}:${e.index}:${e.team}:${e.revision}`:null; }
  function pick(game,field,value,stamp) {
    const e=entry(game),d=deliveries[game?.apero?.index];
    if(!e||!stamp||stamp!==entryToken(game)||!['department','number'].includes(field)||!(field==='department'?d.departments:d.numbers).includes(value))return false;
    e.draft[field]=value;return true;
  }
  function record(game,stamp) {
    const e=entry(game);
    if(!e||!stamp||stamp!==entryToken(game)||e.draft.department===null||e.draft.number===null)return false;
    game.apero.answers[e.team]={...e.draft};e.recorded[e.team]=true;e.revision++;
    e.team=e.recorded.every(Boolean)?null:e.recorded.indexOf(false);
    e.draft=e.team===null?{department:null,number:null}:{...game.apero.answers[e.team]};
    // Le second enregistrement ferme la question et attribue les points une seule fois.
    if(e.team===null)return validate(game);
    return true;
  }
  function edit(game,team) {
    const e=entry(game);if(!e||![0,1].includes(team)||!e.recorded[team])return false;
    e.team=team;e.draft={...game.apero.answers[team]};e.revision++;return true;
  }
  function entriesReady(game) { const e=entry(game);return Boolean(e&&e.team===null&&e.recorded.every(Boolean)); }
  function ready(game) { return game.apero?.phase === 'question' && game.apero.answers.every(a => a.department !== null && a.number !== null); }
  function validate(game) {
    if (!ready(game) || (game.apero.entry && !entriesReady(game))) return false;
    const s = game.apero, d = deliveries[s.index];
    const result = s.answers.map(a => {
      const departmentCorrect = a.department === d.department, numberCorrect = a.number === d.number;
      return { ...a, departmentCorrect, numberCorrect, points: 5 * Number(departmentCorrect) + 5 * Number(numberCorrect) };
    });
    // Enregistrer et fermer la question avant tout nouvel accès à la validation.
    s.results[s.index] = result;
    s.phase = 'correction';
    result.forEach((r, team) => { game.teams[team].score += r.points; });
    return true;
  }
  function next(game) {
    const s = game.apero;
    if (!s || s.phase !== 'correction') return false;
    if (s.index === deliveries.length - 1) s.phase = 'bonus';
    else { s.index++; s.answers = emptyAnswers(); s.phase = 'question'; }
    return true;
  }
  function revealBonus(game) { if (game.apero?.phase === 'bonus') game.apero.bonusRevealed = true; }
  function finish(game) {
    if (game.apero?.phase !== 'bonus' || !game.apero.bonusRevealed) return false;
    game.apero.phase = 'complete'; return true;
  }
  function totals(game) { return game.teams.map((_, team) => (game.apero?.results || []).reduce((sum, r) => sum + r[team].points, 0)); }
  const api = { entry, entryToken, pick, record, edit, entriesReady, deliveries, start, begin, choose, ready, validate, next, revealBonus, finish, totals };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AperoGame = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
