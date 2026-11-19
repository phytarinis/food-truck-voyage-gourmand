"""Comparaison historique exacte (données IGN locales) et schéma hydrologique explicite."""
import json,math
from pathlib import Path
from shapely.geometry import shape
from shapely.ops import unary_union
features=json.loads(Path('assets/maps/anciennes-regions-nouvelle-aquitaine.geojson').read_text())['features']
shapes=[shape(f['geometry']) for f in features];union=unary_union(shapes)
xmin,ymin,xmax,ymax=union.bounds;cos=math.cos(math.radians(45));scale=min(245/((xmax-xmin)*cos),235/(ymax-ymin))
def project(x,y,offset):return offset+35+(x-xmin)*cos*scale,55+(ymax-y)*scale
def polygons(g):return [g] if g.geom_type=='Polygon' else list(g.geoms)
def path(g,offset):
 out=[]
 for p in polygons(g):
  for ring in [p.exterior,*p.interiors]:out.append('M'+'L'.join(f'{a:.2f},{b:.2f}' for a,b in (project(x,y,offset) for x,y in ring.coords))+'Z')
 return ' '.join(out)
colors=['#e0b478','#8fac87','#cfb6a2']
svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 310" font-family="Arial,sans-serif"><title>Comparaison des régions : avant 2016 et depuis 2016</title><rect width="1200" height="310" rx="10" fill="#fffaf0"/><path d="M600 12v286" stroke="#bdc3b3"/><g fill="#172e39" font-size="25" font-weight="bold"><text x="220" y="30" text-anchor="middle">Avant 2016</text><text x="820" y="30" text-anchor="middle">Depuis 2016</text></g>']
for i,(f,g) in enumerate(zip(features,shapes)):
 name=f['properties']['nom'];cx,cy=project(g.representative_point().x,g.representative_point().y,0);ly={'Poitou-Charentes':100,'Limousin':165,'Aquitaine':235}[name]
 svg.append(f'<path data-region="{f["properties"]["code"]}" d="{path(g,0)}" fill="{colors[i]}" stroke="#172e39" stroke-width="1.3" fill-rule="evenodd"/><path d="M{cx:.1f} {cy:.1f}L300 {ly}" fill="none" stroke="#61705f"/><text x="315" y="{ly+6}" font-size="23" fill="#172e39">{name}</text>')
svg.append(f'<path data-region="75" d="{path(union,600)}" fill="#8fac87" stroke="#172e39" stroke-width="1.5" fill-rule="evenodd"/><text x="925" y="157" font-size="25" fill="#172e39">Nouvelle-<tspan x="925" dy="32">Aquitaine</tspan></text></svg>')
Path('assets/maps/bonus-regions-comparaison.svg').write_text(''.join(svg))
# Schéma de relations hydrologiques, volontairement NON géographique (aucune fausse frontière).
s='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" font-family="Arial,sans-serif"><title>Fleuve et rivières : exemple de la Garonne</title><desc>Le Tarn et le Lot sont des affluents de la Garonne. Au bec d’Ambès, la Garonne et la Dordogne forment l’estuaire de la Gironde qui débouche dans l’océan Atlantique. Schéma non cartographique.</desc><defs><marker id="flow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#347487"/></marker></defs><rect width="720" height="440" rx="12" fill="#fffaf0"/><path d="M0 0H155V190H0Z" fill="#d7e7e4"/><text x="20" y="55" font-size="23" fill="#172e39">Océan</text><text x="20" y="83" font-size="23" fill="#172e39">Atlantique</text><path d="M335 172Q240 150 155 116L155 152Q245 187 335 188Z" fill="#b6d4c4" stroke="#557d6c" stroke-width="2"/><text x="175" y="105" font-size="21" fill="#172e39">Estuaire de la Gironde</text><path d="M300 170 170 137" stroke="#347487" stroke-width="3" marker-end="url(#flow)"/><path d="M315 395Q280 320 320 250L335 180" fill="none" stroke="#347487" stroke-width="9"/><path d="M305 300 323 240" stroke="#347487" stroke-width="3" marker-end="url(#flow)"/><text x="330" y="350" font-size="25" font-weight="bold" fill="#172e39">Garonne</text><text x="330" y="380" font-size="18" fill="#53615a">cours principal</text><path d="M560 72 335 180" fill="none" stroke="#347487" stroke-width="6"/><path d="M458 121 390 154" stroke="#347487" stroke-width="3" marker-end="url(#flow)"/><text x="482" y="56" font-size="23" fill="#172e39">Dordogne</text><path d="M545 245 318 266M115 325 300 330" stroke="#347487" stroke-width="4"/><path d="M485 248 420 255M160 326 230 329" stroke="#347487" stroke-width="3" marker-end="url(#flow)"/><text x="545" y="235" font-size="21" fill="#172e39">Lot</text><text x="73" y="310" font-size="21" fill="#172e39">Tarn</text><text x="500" y="287" font-size="18" fill="#53615a">affluents</text><circle cx="335" cy="180" r="7" fill="#bd6629"/><text x="360" y="181" font-size="22" font-weight="bold" fill="#172e39">Bec d’Ambès</text><text x="360" y="207" font-size="17" fill="#53615a">confluence Garonne–Dordogne</text><text x="20" y="426" font-size="15" fill="#53615a">Schéma pédagogique non cartographique · sens d’écoulement indiqué par les flèches</text></svg>'''
Path('assets/maps/garonne-fleuve-riviere.svg').write_text(s)
