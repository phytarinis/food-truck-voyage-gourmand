"""Anciennes régions : limites du fichier historique france-geojson, sans redessin.
Exécution depuis la racine : python3 tools/generate-regions-bonus-map.py
"""
import json,math
from pathlib import Path
features=json.loads(Path('assets/maps/anciennes-regions-nouvelle-aquitaine.geojson').read_text())['features']
def rings(f):
 g=f['geometry'];polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
 return [r for p in polys for r in p]
pts=[p for f in features for r in rings(f) for p in r];cos=math.cos(math.radians(45))
xmin,xmax=min(p[0]*cos for p in pts),max(p[0]*cos for p in pts);ymin,ymax=min(p[1] for p in pts),max(p[1] for p in pts)
scale=min(350/(xmax-xmin),365/(ymax-ymin))
def project(p):return (20+(p[0]*cos-xmin)*scale,24+(ymax-p[1])*scale)
def path(f):return ' '.join('M'+'L'.join(f'{x:.1f},{y:.1f}' for x,y in map(project,r))+'Z' for r in rings(f))
def center(f):
 r=max(rings(f),key=len);terms=[(a,b,a[0]*b[1]-b[0]*a[1]) for a,b in zip(r,r[1:])];area=sum(t for a,b,t in terms)
 return (sum((a[0]+b[0])*t for a,b,t in terms)/(3*area),sum((a[1]+b[1])*t for a,b,t in terms)/(3*area))
colors={'Poitou-Charentes':'#bccba6','Limousin':'#345766','Aquitaine':'#df8270'}
ys={'Poitou-Charentes':95,'Limousin':190,'Aquitaine':310}
svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 430" font-family="Arial,sans-serif"><title>Les anciennes régions Aquitaine, Limousin et Poitou-Charentes composant la Nouvelle-Aquitaine</title><rect width="660" height="430" rx="12" fill="#fffaf0"/>']
for f in features:
 name=f['properties']['nom'];code=f['properties']['code'];color=colors[name]
 svg.append(f'<path data-region="{code}" d="{path(f)}" fill="{color}" stroke="#172e39" stroke-width="1.8" fill-rule="evenodd"/>')
for f in features:
 name=f['properties']['nom'];x,y=project(center(f));ly=ys[name]
 svg.append(f'<path d="M{x:.1f} {y:.1f}L400 {ly}" fill="none" stroke="#172e39" stroke-width="1.2"/><circle cx="{x:.1f}" cy="{y:.1f}" r="4" fill="#fffaf0" stroke="#172e39"/><rect x="410" y="{ly-17}" width="15" height="24" rx="2" fill="{colors[name]}"/>')
 if name=='Poitou-Charentes':
  svg.append(f'<text x="436" y="{ly-3}" font-size="25" font-weight="bold" fill="#172e39">Poitou-<tspan x="436" dy="29">Charentes</tspan></text>')
 else:svg.append(f'<text x="436" y="{ly+5}" font-size="25" font-weight="bold" fill="#172e39">{name}</text>')
svg.append('<path d="M365 51V27l-5 7m5-7 5 7" fill="none" stroke="#172e39" stroke-width="1.5"/><text x="360" y="20" font-size="13" fill="#172e39">N</text><text x="18" y="419" font-size="10" fill="#53664e">Source : france-geojson / limites historiques IGN · Licence Ouverte · nord en haut</text></svg>')
Path('assets/maps/bonus-nouvelle-aquitaine.svg').write_text(''.join(svg))
