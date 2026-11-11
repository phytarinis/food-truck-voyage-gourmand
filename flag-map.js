/* Rendu des drapeaux de la manche 3, réutilisé pour la carte d’Europe. */
(function(root){
 'use strict';
 function svgElement(tag, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attributes).forEach(([key,value])=>element.setAttribute(key,value));return element;
 }
 function flag({x,y,team,name,scale=1.3}) {
  const element=svgElement('g',{transform:`translate(${x},${y}) scale(${scale})`,class:`france-flag team-${team}`,role:'img','aria-label':`Drapeau ${team===0?'corail':'sauge'} : ${name}`});
  element.append(svgElement('path',{d:'M0 38V0M1 2H26L20 12L26 22H1',class:'france-flag-shape'}));
  const number=svgElement('text',{x:'10',y:'17','aria-hidden':'true'});number.textContent=String(team+1);element.append(number);return element;
 }
  function render({regions, location:l, correctCode, canSelect:stamp, onSelect:select, mainland=true, viewBox, label, showLabels=mainland, showNames=true, flagScale=1.3, exactAnchor=false, anonymousLabel="Pays, repère"}) {
    const bothLocked = l.locked.every(Boolean);
    const svg = svgElement('svg', { viewBox: viewBox || (mainland ? '0 0 660 560' : '0 0 180 120'), role: 'group', 'aria-label': label || (mainland ? 'Les 13 régions de France métropolitaine, Corse incluse' : regions[0].name) });
    const labels = [], flags = [];
    for (const [regionIndex, region] of regions.entries()) {
      const name = showNames ? region.name : `${anonymousLabel} ${regionIndex + 1}`;
      const selected = !bothLocked && l.choices[l.activeTeam] === region.code;
      const path = svgElement('path', { d: region.path, 'data-region': region.code, role: 'button', tabindex: stamp ? '0' : '-1', 'aria-label': name, 'aria-pressed': String(selected), 'aria-disabled': String(!stamp), class: `france-region${selected ? ' is-selected' : ''}${l.revealed && correctCode === region.code ? ' is-correct' : ''}` });
      const title = svgElement('title'); title.textContent = name; path.append(title);
      path.addEventListener('click', () => select(region.code));
      path.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(region.code); } });
      svg.append(path);
      if (showLabels) {
        const offset = { '52': [-20, -8], '24': [8, 12], '28': [-10, -10] }[region.code] || [0, 0];
        const labelX = region.center[0] + offset[0], labelY = region.center[1] + offset[1];
        const text = svgElement('text', { x: labelX, y: labelY - (region.labels.length - 1) * 11, class: 'france-region-label', 'text-anchor': 'middle', 'aria-hidden': 'true' });
        region.labels.forEach((line, index) => { const span = svgElement('tspan', { x: labelX, dy: index ? '22' : '0' }); span.textContent = line; text.append(span); }); labels.push(text);
      }
      l.choices.forEach((code, team) => {
        // Le premier choix ne laisse ni drapeau, ni sélection, ni libellé pendant le tour sauge.
        if (code !== region.code || (!bothLocked && team !== l.activeTeam)) return;
        const shared = bothLocked && l.choices[0] === l.choices[1];
        const x = region.center[0] + (exactAnchor ? (shared ? (team === 0 ? -32 : 8) * flagScale : 0) : (shared ? team === 0 ? -40 : 8 : -14)), y = region.center[1] - (exactAnchor ? 40 * flagScale : 52);
        flags.push(flag({x,y,team,name,scale:flagScale}));
      });
    }
    svg.append(...labels, ...flags); return svg;
  }
 root.FlagMap={render,flag,svg:svgElement};
})(globalThis);
