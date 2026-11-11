"""Cartes métropolitaines IGN, sans dépendance. Exécuter depuis la racine."""
import json, math
from pathlib import Path
from html import escape
features=json.loads(Path('assets/maps/mainland.geojson').read_text())['features']
communes=json.loads(Path('assets/maps/source.geojson').read_text())['features']
bycode={f['properties']['code']:f for f in features+communes}
def rings(f):
 g=f['geometry']; polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
 return [r for p in polys for r in p]
def center(f):
 r=max(rings(f),key=lambda r:abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(r,r[1:]))))
 terms=[(a,b,a[0]*b[1]-b[0]*a[1]) for a,b in zip(r,r[1:])];area=sum(t for a,b,t in terms)
 return(sum((a[0]+b[0])*t for a,b,t in terms)/(3*area),sum((a[1]+b[1])*t for a,b,t in terms)/(3*area))
def projector(fs,x,y,w,h):
 cos=math.cos(math.radians(46));pts=[p for f in fs for r in rings(f) for p in r]
 xmin,xmax=min(p[0]*cos for p in pts),max(p[0]*cos for p in pts);ymin,ymax=min(p[1] for p in pts),max(p[1] for p in pts)
 scale=min(w/(xmax-xmin),h/(ymax-ymin));dx=(w-(xmax-xmin)*scale)/2;dy=(h-(ymax-ymin)*scale)/2
 return lambda p:(x+dx+(p[0]*cos-xmin)*scale,y+dy+(ymax-p[1])*scale)
def path(f,project):return ' '.join('M'+'L'.join(f'{x:.1f},{y:.1f}' for x,y in map(project,r))+'Z' for r in rings(f))
def departments(project, selected=None, fs=None):
 return ''.join(f'<path data-code="{f["properties"]["code"]}" d="{path(f,project)}" fill="'+('#b5c6a3' if f['properties']['code']==selected else '#fffaf0')+'" stroke="'+('#d94532' if f['properties']['code']==selected else '#738578')+'" stroke-width="'+('2.5' if f['properties']['code']==selected else '1')+'" fill-rule="evenodd"/>' for f in (fs or features))
def dot(p,label):
 x,y=p;return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="9" fill="#172e39" stroke="#fffaf0" stroke-width="2"/><text x="{x:.1f}" y="{y+4:.1f}" text-anchor="middle" font-size="12" fill="#fffaf0">{label}</text>'
for dept,towns in [('24',[('24294','Montpon-Ménestérol'),('24322','Périgueux')]),('17',[('17197','Jonzac'),('17300','La Rochelle')]),('16',[('16028','Barbezieux-Saint-Hilaire'),('16015','Angoulême')])]:
 project=projector(features,15,20,510,500);local=projector([bycode[dept]],600,235,260,265)
 svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 550" font-family="Arial,sans-serif"><title>France métropolitaine : '+escape(bycode[dept]['properties']['nom'])+'</title><rect width="900" height="550" rx="12" fill="#e4ece7"/>',departments(project,dept)]
 svg+=['<text x="565" y="40" font-size="18" fill="#546155">FRANCE MÉTROPOLITAINE</text>',f'<text x="565" y="75" font-size="27" font-weight="bold" fill="#172e39">{escape(bycode[dept]["properties"]["nom"])} ({dept})</text>']
 for i,(code,name) in enumerate(towns):
  svg.append(dot(project(center(bycode[code])),i+1));svg.append(dot((578,118+i*58),i+1))
  lines={'Montpon-Ménestérol':['Montpon-Ménestérol'],'Barbezieux-Saint-Hilaire':['Barbezieux-','Saint-Hilaire']}.get(name,[name])
  for j,line in enumerate(lines):svg.append(f'<text x="600" y="{124+i*58+j*24}" font-size="23" fill="#172e39">{escape(line)}</text>')
 svg.append('<text x="600" y="226" font-size="16" fill="#546155">ZOOM SUR LE DÉPARTEMENT</text>');svg.append(departments(local,dept,[bycode[dept]]))
 for i,(code,name) in enumerate(towns):svg.append(dot(local(center(bycode[code])),i+1))
 svg.append('<text x="20" y="534" font-size="12" fill="#546155">IGN / Admin Express COG 2018 · Licence Ouverte · repères communaux · nord en haut</text></svg>')
 Path(f'assets/maps/france-{dept}.svg').write_text(''.join(svg))
# Numéros INSEE réels. Zoom de l’Île-de-France pour séparer les petits départements.
idf=['75','77','78','91','92','93','94','95'];idf_fs=[bycode[c] for c in idf]
project=projector(features,10,20,580,590);zoom=projector(idf_fs,640,145,230,245)
svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 640" font-family="Arial,sans-serif"><title>Numéros des 96 départements de France métropolitaine</title><rect width="900" height="640" rx="12" fill="#e4ece7"/>',departments(project)]
for f in features:
 if f['properties']['code'] in idf:continue
 x,y=project(center(f));svg.append(f'<text data-number="{f["properties"]["code"]}" x="{x:.1f}" y="{y+5:.1f}" text-anchor="middle" font-size="16" font-weight="bold" fill="#172e39">{f["properties"]["code"]}</text>')
svg.append('<rect x="620" y="95" width="265" height="330" rx="8" fill="#f4efdf" stroke="#a9b49c"/><text x="637" y="126" font-size="20" fill="#172e39">ZOOM ÎLE-DE-FRANCE</text>');svg.append(departments(zoom,fs=idf_fs))
# Les 4 plus petits territoires sont légendés hors de leurs contours exacts.
labels={'75':(648,450),'92':(648,483),'93':(648,516),'94':(648,549)}
for f in idf_fs:
 code=f['properties']['code'];x,y=zoom(center(f))
 if code in labels:
  tx,ty=labels[code];svg.append(f'<path d="M{x:.1f} {y:.1f}L{tx-12} {ty-7}" stroke="#738578" fill="none"/><circle cx="{x:.1f}" cy="{y:.1f}" r="3" fill="#d94532"/><text data-number="{code}" x="{tx}" y="{ty}" font-size="16" fill="#172e39">{code} · {escape(f["properties"]["nom"])}</text>')
 else:svg.append(f'<text data-number="{code}" x="{x:.1f}" y="{y+5:.1f}" text-anchor="middle" font-size="16" font-weight="bold" fill="#172e39">{code}</text>')
svg.append('<text x="20" y="625" font-size="12" fill="#546155">IGN / Admin Express COG 2018 · Licence Ouverte · codes INSEE · nord en haut</text></svg>')
Path('assets/maps/france-numeros.svg').write_text(''.join(svg))
