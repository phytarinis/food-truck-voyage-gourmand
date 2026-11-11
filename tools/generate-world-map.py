"""Planisphère à sept continents, Natural Earth 1:50m, domaine public.
Hors ligne ; dépendance de développement shapely==2.1.2.
"""
import json
from pathlib import Path
from shapely.geometry import shape,Point
from shapely.ops import unary_union
countries=json.loads(Path('assets/maps/world-countries.geojson').read_text())['features']
regions=json.loads(Path('assets/maps/world-geographic-regions.geojson').read_text())['features']
lookup={f['properties']['NAME']:shape(f['geometry']) for f in regions}
keys={'Europe':'EUROPE','Asia':'ASIA','Africa':'AFRICA','North America':'NORTH AMERICA','South America':'SOUTH AMERICA','Oceania':'AUSTRALIA','Antarctica':'ANTARCTICA'}
names={'Europe':'Europe','Asia':'Asie','Africa':'Afrique','North America':'Amérique du Nord','South America':'Amérique du Sud','Oceania':'Océanie','Antarctica':'Antarctique'}
masks={key:lookup[value] for key,value in keys.items()}
masks['Oceania']=unary_union([masks['Oceania'],lookup['NEW GUINEA'],lookup['HAWAIIAN ISLANDS']])
groups={k:[] for k in keys}
def polygons(g):
 if g.is_empty:return []
 if g.geom_type=='Polygon':return [g]
 if hasattr(g,'geoms'):return [p for part in g.geoms for p in polygons(part)]
 return []
# Découper chaque composante terrestre à partir des masques physiques :
# Russie, Turquie, Égypte et territoires ultramarins ne sont pas affectés
# en bloc au continent politique de leur État souverain.
for f in countries:
 fallback=f['properties']['continent']
 for land in polygons(shape(f['geometry'])):
  parts={};remaining=land
  for key,mask in masks.items():
   part=remaining.intersection(mask)
   if part.area>1e-12:parts[key]=part;remaining=remaining.difference(part)
  for key,g in parts.items():groups[key].extend(polygons(g))
  for rest in polygons(remaining):
   # Petits écarts de résolution des côtes : rattachement au morceau physique
   # le plus proche ; pour les îles isolées, classification continentale NE.
   key=min(parts,key=lambda k:rest.representative_point().distance(parts[k])) if parts else fallback
   if key not in groups:key=min(masks,key=lambda k:rest.representative_point().distance(masks[k]))
   groups[key].append(rest)
merged={key:unary_union(parts) for key,parts in groups.items()}
project=lambda p:[round((p[0]+180)*1000/360,3),round((90-p[1])*500/180,3)]
def rings(g):return [list(g.exterior.coords)]+[list(r.coords) for r in g.interiors]
def shape_data(g):
 polylist=[[list(map(project,ring)) for ring in rings(poly)] for poly in polygons(g)]
 path=' '.join('M'+'L'.join(f'{x},{y}' for x,y in ring)+'Z' for poly in polylist for ring in poly)
 return polylist,path
continents=[]
centers={'Europe':[15,53],'Asia':[100,40],'Africa':[20,5],'North America':[-105,40],'South America':[-60,-15],'Oceania':[135,-25],'Antarctica':[0,-78]}
for key,g in merged.items():
 polylist,path=shape_data(g)
 if not g.covers(Point(centers[key])):raise ValueError(('Centre hors du continent',key))
 continents.append({'code':key,'name':names[key],'path':path,'polygons':polylist,'center':project(centers[key])})
destinations={}
for code in ['JPN','AUS','MEX','MAR']:
 f=next(f for f in countries if f['properties']['code']==code);g=shape(f['geometry']);largest=max(polygons(g),key=lambda p:p.area);p=largest.representative_point();_,path=shape_data(g)
 destinations[code]={'path':path,'point':project([p.x,p.y])}
data={'continents':continents,'destinations':destinations,'viewBox':[0,0,1000,500]}
Path('world-map.js').write_text('/* Généré par tools/generate-world-map.py — Natural Earth, domaine public. */\n(function(root){const data='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined"&&module.exports)module.exports=data;else root.WorldMap=data;})(globalThis);\n')
# Contrôle topologique : aucune surface terrestre perdue ou comptée deux fois.
base=unary_union([shape(f['geometry']) for f in countries]);all_land=unary_union(list(merged.values()))
assert base.symmetric_difference(all_land).area<1e-6
assert abs(sum(g.area for g in merged.values())-all_land.area)<1e-6
print('Sept continents, topologie conservée ;',len(continents),'zones.')
