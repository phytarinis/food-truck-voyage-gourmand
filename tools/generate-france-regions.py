"""France et DROM : projection des contours IGN, sans simplification des frontières.
Usage : python3 tools/generate-france-regions.py (hors ligne).
"""
import json, math
from pathlib import Path
from html import escape
source=json.loads(Path('assets/maps/regions-france.geojson').read_text())['features']
def rings(f):
    g=f['geometry']; polygons=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    return [r for p in polygons for r in p]
def centroid(f):
    def area(r): return sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(r,r[1:]))
    r=max(rings(f),key=lambda r:abs(area(r))); total=area(r)
    return [sum((a[i]+b[i])*(a[0]*b[1]-b[0]*a[1]) for a,b in zip(r,r[1:]))/(3*total) for i in [0,1]]
def projection(features,width,height,pad):
    pts=[p for f in features for r in rings(f) for p in r]; cos=math.cos(math.radians(sum(p[1] for p in pts)/len(pts)))
    xmin,xmax=min(p[0]*cos for p in pts),max(p[0]*cos for p in pts); ymin,ymax=min(p[1] for p in pts),max(p[1] for p in pts)
    scale=min((width-2*pad)/(xmax-xmin),(height-2*pad)/(ymax-ymin))
    dx=(width-(xmax-xmin)*scale)/2;dy=(height-(ymax-ymin)*scale)/2
    return lambda p: [round(dx+(p[0]*cos-xmin)*scale,2),round(dy+(ymax-p[1])*scale,2)]
main=[f for f in source if int(f['properties']['code'])>10]; project_main=projection(main,660,560,28)
labels={'11':['Île-de-','France'],'24':['Centre-','Val de Loire'],'27':['Bourgogne-','Franche-','Comté'],'28':['Normandie'],'32':['Hauts-de-','France'],'44':['Grand Est'],'52':['Pays de','la Loire'],'53':['Bretagne'],'75':['Nouvelle-','Aquitaine'],'76':['Occitanie'],'84':['Auvergne-','Rhône-Alpes'],'93':['Provence-Alpes-','Côte d’Azur'],'94':['Corse']}
data=[]
for f in source:
    code=f['properties']['code'];mainland=int(code)>10;proj=project_main if mainland else projection([f],180,120,12)
    path=' '.join('M'+'L'.join(f'{x},{y}' for x,y in map(proj,r))+'Z' for r in rings(f))
    data.append(dict(code=code,name=f['properties']['nom'],mainland=mainland,path=path,center=proj(centroid(f)),labels=labels.get(code,[f['properties']['nom']])))
Path('france-regions.js').write_text('/* Généré par tools/generate-france-regions.py — IGN / france-geojson, Licence Ouverte. */\nglobalThis.FranceRegions = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 560"><title>France métropolitaine, Corse incluse : régions administratives</title>']
for f in data:
    if f['mainland']:svg.append(f'<path d="{f["path"]}" fill="#bcc9ad" stroke="#172e39" stroke-width="1.3" fill-rule="evenodd"/>')
svg.append('</svg>');Path('assets/maps/france-metropolitaine-regions.svg').write_text(''.join(svg))
