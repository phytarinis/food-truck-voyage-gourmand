"""Localisation d’Arcachon sur les limites IGN de Nouvelle-Aquitaine.
Aucun contour inventé ; exécuter depuis la racine du dépôt.
"""
import json,math
from pathlib import Path
all_features=json.loads(Path('assets/maps/mainland.geojson').read_text())['features']
codes=['16','17','19','23','24','33','40','47','64','79','86','87']
features=[f for f in all_features if f['properties']['code'] in codes]
town=json.loads(Path('assets/maps/arcachon.geojson').read_text())
def rings(f):
 g=f['geometry'];polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
 return [r for p in polys for r in p]
pts=[p for f in features for r in rings(f) for p in r];cos=math.cos(math.radians(45))
xmin,xmax=min(p[0]*cos for p in pts),max(p[0]*cos for p in pts);ymin,ymax=min(p[1] for p in pts),max(p[1] for p in pts)
scale=min(420/(xmax-xmin),415/(ymax-ymin))
def project(p):return (25+(p[0]*cos-xmin)*scale,25+(ymax-p[1])*scale)
def path(f):return ' '.join('M'+'L'.join(f'{x:.1f},{y:.1f}' for x,y in map(project,r))+'Z' for r in rings(f))
r=max(rings(town),key=len);terms=[(a,b,a[0]*b[1]-b[0]*a[1]) for a,b in zip(r,r[1:])];area=sum(t for a,b,t in terms)
center=(sum((a[0]+b[0])*t for a,b,t in terms)/(3*area),sum((a[1]+b[1])*t for a,b,t in terms)/(3*area));x,y=project(center)
svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 480" font-family="Arial,sans-serif"><title>Arcachon, au bord du bassin, en Nouvelle-Aquitaine</title><rect width="680" height="480" rx="12" fill="#e4ece7"/>']
for f in features:
 code=f['properties']['code'];svg.append(f'<path data-code="{code}" d="{path(f)}" fill="'+('#d6b1a0' if code=='33' else '#c5d1b4')+'" stroke="#536a60" stroke-width="1.3" fill-rule="evenodd"/>')
svg.append(f'<path d="M{x:.1f} {y:.1f}L470 325" stroke="#172e39" fill="none" stroke-width="1.5"/><circle cx="{x:.1f}" cy="{y:.1f}" r="6" fill="#d94532" stroke="#fffaf0" stroke-width="2"/>')
svg.append('<text x="455" y="65" font-size="21" fill="#172e39">NOUVELLE-</text><text x="455" y="93" font-size="21" fill="#172e39">AQUITAINE</text><text x="475" y="307" font-size="23" font-weight="bold" fill="#172e39">Arcachon</text><text x="475" y="335" font-size="17" fill="#172e39">Au bord du bassin</text><text x="475" y="360" font-size="15" fill="#536a60">Gironde (33)</text><text x="20" y="465" font-size="12" fill="#536a60">IGN / Admin Express COG 2018 · Licence Ouverte · repère communal · nord en haut</text></svg>')
Path('assets/maps/nouvelle-aquitaine-arcachon.svg').write_text(''.join(svg))
