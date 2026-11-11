"""Cartes Passeport gourmand. Génération hors ligne, dépendance shapely==2.1.2.
Source : Natural Earth 1:10m (pays et villes), domaine public ; bonus IGN existant.
"""
import json,math
from pathlib import Path
from html import escape
from shapely.geometry import shape
countries=json.loads(Path('assets/maps/europe-countries.geojson').read_text())['features']
places=json.loads(Path('assets/maps/passport-cities.geojson').read_text())['features']
city={f['properties']['name']:f['geometry']['coordinates'] for f in places}
def rings(g):
 if g['type']=='Polygon':return g['coordinates']
 return [r for poly in g['coordinates'] for r in poly]
# Lambert azimutale équivalente, centre 10°E / 52°N (Europe).
lon0,lat0=map(math.radians,[10,52])
def laea(p):
 lon,lat=map(math.radians,p[:2]);dlon=lon-lon0
 k=math.sqrt(2/(1+math.sin(lat0)*math.sin(lat)+math.cos(lat0)*math.cos(lat)*math.cos(dlon)))
 return [k*math.cos(lat)*math.sin(dlon),k*(math.cos(lat0)*math.sin(lat)-math.sin(lat0)*math.cos(lat)*math.cos(dlon))]
def fit(points,w,h,pad=24):
 xmin,xmax=min(p[0] for p in points),max(p[0] for p in points);ymin,ymax=min(p[1] for p in points),max(p[1] for p in points)
 scale=min((w-2*pad)/(xmax-xmin),(h-2*pad)/(ymax-ymin));dx=(w-(xmax-xmin)*scale)/2;dy=(h-(ymax-ymin)*scale)/2
 return lambda p:[round(dx+(p[0]-xmin)*scale,3),round(dy+(ymax-p[1])*scale,3)]
allpts=[laea(p) for f in countries for ring in rings(f['geometry']) for p in ring];projected=fit(allpts,900,680)
project=lambda p:projected(laea(p))
def path(f,proj):return ' '.join('M'+'L'.join(f'{x},{y}' for x,y in map(proj,ring))+'Z' for ring in rings(f['geometry']))
data=[]
for f in countries:
 g=shape(f['geometry']);largest=max(list(g.geoms),key=lambda g:g.area) if g.geom_type=='MultiPolygon' else g
 center=largest.representative_point();data.append({'code':f['properties']['code'],'name':f['properties']['nom'],'path':path(f,project),'center':project([center.x,center.y])})
data.sort(key=lambda r:r['code'])
capitals={code:{'name':name,'point':project(city[ne])} for code,name,ne in [('BEL','Bruxelles','Brussels'),('PRT','Lisbonne','Lisbon'),('ROU','Bucarest','Bucharest')]}
js={'countries':data,'capitals':capitals,'viewBox':[0,0,900,680]}
Path('europe-map.js').write_text('/* Généré par tools/generate-europe-map.py : Natural Earth, domaine public. */\n(function(root){const data='+json.dumps(js,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined"&&module.exports)module.exports=data;else root.EuropeMap=data;})(globalThis);\n')
for code,name,ne in [('BEL','Belgique','Brussels'),('PRT','Portugal','Lisbon'),('ROU','Roumanie','Bucharest')]:
 f=next(f for f in countries if f['properties']['code']==code);local=fit([laea(p) for ring in rings(f['geometry']) for p in ring],440,280,25);proj=lambda p:local(laea(p));x,y=proj(city[ne]);capital=capitals[code]['name']
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 280" font-family="Arial,sans-serif"><title>{name} et sa capitale, {capital}</title><rect width="440" height="280" fill="#fffaf0"/><path d="{path(f,proj)}" fill="#bccba6" stroke="#172e39" stroke-width="1.5" fill-rule="evenodd"/><circle cx="{x}" cy="{y}" r="5" fill="#d94532" stroke="#172e39"/><text x="{min(x+12,330)}" y="{min(y+20,265)}" font-size="20" font-weight="bold" fill="#172e39" stroke="#fffaf0" stroke-width="3" paint-order="stroke">{capital}</text></svg>'
 Path(f'assets/maps/passport-{code.lower()}.svg').write_text(svg)
# Strasbourg sur le fond métropolitain identique aux manches précédentes.
france=json.loads(Path('assets/maps/regions-france.geojson').read_text())['features'];main=[f for f in france if int(f['properties']['code'])>10]
pts=[p for f in main for r in rings(f['geometry']) for p in r];cos=math.cos(math.radians(sum(p[1] for p in pts)/len(pts)))
proj=fit([[p[0]*cos,p[1]] for p in pts],660,560,28);project_fr=lambda p:proj([p[0]*cos,p[1]])
x,y=project_fr(city['Strasbourg']);svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 560" font-family="Arial,sans-serif"><title>Strasbourg, siège officiel du Parlement européen, située dans le Grand Est en France</title>']
for f in main:svg.append(f'<path d="{path(f,project_fr)}" fill="#dce3cf" stroke="#172e39" stroke-width="1.2" fill-rule="evenodd"/>')
svg.append(f'<circle cx="{x}" cy="{y}" r="7" fill="#d94532" stroke="#172e39"/><path d="M{x} {y}L450 70" stroke="#172e39" fill="none"/><text x="360" y="57" fill="#172e39" font-size="29" font-weight="bold">Strasbourg</text></svg>');Path('assets/maps/passport-strasbourg.svg').write_text(''.join(svg))
