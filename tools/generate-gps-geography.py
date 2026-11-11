"""Génère les données de la manche 4 hors ligne ; dépendance : shapely==2.1.2.
Les fleuves et massifs proviennent de Natural Earth, la France de IGN/france-geojson.
"""
import json,math
from pathlib import Path
from shapely.geometry import shape,box,mapping,Point
from shapely.ops import unary_union,transform,nearest_points
source=json.loads(Path('assets/maps/gps-source.geojson').read_text())['features']
features=json.loads(Path('assets/maps/regions-france.geojson').read_text())['features']
main=[f for f in features if int(f['properties']['code'])>10]
def rings(f):
 g=f['geometry'];polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
 return [r for p in polys for r in p]
pts=[p for f in main for r in rings(f) for p in r]
cos=math.cos(math.radians(sum(p[1] for p in pts)/len(pts)))
xmin,xmax=min(p[0]*cos for p in pts),max(p[0]*cos for p in pts)
ymin,ymax=min(p[1] for p in pts),max(p[1] for p in pts)
scale=min(604/(xmax-xmin),504/(ymax-ymin));dx=(660-(xmax-xmin)*scale)/2;dy=(560-(ymax-ymin)*scale)/2
project=lambda p:[round(dx+(p[0]*cos-xmin)*scale,3),round(dy+(ymax-p[1])*scale,3)]
name=lambda f:f['properties'].get('name',f['properties'].get('NAME'))
lookup={name(f):shape(f['geometry']) for f in source}
france=unary_union([shape(f['geometry']) for f in main])
# Tampon métrique pédagogique à latitude de référence 46°, en kilomètres.
metric_cos=math.cos(math.radians(46));to_km=lambda x,y,z=None:(x*111.32*metric_cos,y*111.32)
from_km=lambda x,y,z=None:(x/(111.32*metric_cos),y/111.32)
def buffered(g,km):return transform(from_km,transform(to_km,g).buffer(km,quad_segs=16))
def polys(g):
 if g.geom_type=='Polygon':return [list(map(list,g.exterior.coords))]+[list(map(list,r.coords)) for r in g.interiors]
 return [r for part in g.geoms for r in polys(part)]
def polygons(g):
 if g.geom_type=='Polygon':return [polys(g)]
 return [p for part in g.geoms for p in polygons(part)]
def path(g):return ' '.join('M'+'L'.join(f'{x},{y}' for x,y in map(project,r))+'Z' for r in polys(g))
pyrenees=lookup['PYRENEES'];alps=lookup['ALPS'].intersection(france)
zones={}
for key,g,km in [('pyrenees',pyrenees,25),('alps',alps,25)]:
 tolerance=buffered(g,km)
 if key=='alps':tolerance=tolerance.intersection(france)
 zones[key]={'path':path(g),'tolerance':polygons(tolerance),'toleranceKm':km}
rivers=[]
for key,name_fr,anchor in [('Seine','Seine',[1.15,49.1]),('Rhine','Rhin',[7.85,48.4]),('Garonne','Garonne',[0.6,44.3])]:
 g=lookup[key]
 if key=='Rhine':g=unary_union([g,lookup['Rhin']]).intersection(box(6.5,47.5,8.5,49.05))
 lines=[g] if g.geom_type=='LineString' else list(g.geoms)
 p=' '.join('M'+'L'.join(f'{x},{y}' for x,y in map(project,line.coords)) for line in lines)
 rivers.append({'id':chr(97+len(rivers)),'name':name_fr,'path':p,'anchor':project(nearest_points(g,Point(anchor))[0].coords[0])})
landmarks=[{'name':n,'position':project(p)} for n,p in [('Toulouse',[1.444,43.604]),('Bordeaux',[-0.579,44.838]),('Paris',[2.352,48.857]),('Rouen',[1.099,49.443]),('Strasbourg',[7.752,48.573]),('Mont-Blanc',[6.865,45.833])]]
data={'projection':dict(cos=cos,xmin=xmin,ymax=ymax,scale=scale,dx=dx,dy=dy),'zones':zones,'rivers':rivers,'landmarks':landmarks}
Path('gps-geography.js').write_text('/* Généré hors ligne : Natural Earth (domaine public), IGN / france-geojson (Licence Ouverte). */\n(function(root){const data='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined"&&module.exports)module.exports=data;else root.GpsGeography=data;})(globalThis);\n')
