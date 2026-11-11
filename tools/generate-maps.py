"""Projection équirectangulaire locale ; aucune limite administrative redessinée.
Relancer depuis la racine : python3 tools/generate-maps.py
"""
import json, math
from pathlib import Path
from html import escape
features=json.loads(Path('assets/maps/source.geojson').read_text())['features']
bycode={f['properties']['code']:f for f in features}
def rings(feature):
    g=feature['geometry']
    polygons=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    return [r for p in polygons for r in p]
def representative(feature):
    # Centroïde de la plus grande composante : repère communal, pas adresse précise.
    ring=max(rings(feature),key=lambda r:abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(r,r[1:]))))
    terms=[(a,b,a[0]*b[1]-b[0]*a[1]) for a,b in zip(ring,ring[1:])]
    area=sum(t for a,b,t in terms)
    return (sum((a[0]+b[0])*t for a,b,t in terms)/(3*area),sum((a[1]+b[1])*t for a,b,t in terms)/(3*area))
for dept, towns in [('24',[('24294','Montpon-Ménestérol'),('24322','Périgueux')]),('17',[('17197','Jonzac'),('17300','La Rochelle')]),('16',[('16028','Barbezieux-Saint-Hilaire'),('16015','Angoulême')])]:
    towns=sorted(towns,key=lambda t:representative(bycode[t[0]])[1],reverse=True)
    pts=[p for r in rings(bycode[dept]) for p in r]
    cos=math.cos(math.radians(45.5))
    xmin,xmax=min(p[0]*cos for p in pts),max(p[0]*cos for p in pts)
    ymin,ymax=min(p[1] for p in pts),max(p[1] for p in pts)
    scale=min(335/(xmax-xmin),285/(ymax-ymin))
    def project(p):return (32+(p[0]*cos-xmin)*scale,30+(ymax-p[1])*scale)
    def path(f):
        return ' '.join('M'+'L'.join(f'{x:.2f},{y:.2f}' for x,y in map(project,r))+'Z' for r in rings(f))
    svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 360" role="img">',f'<title>{escape(bycode[dept]["properties"]["nom"])} : communes et préfecture</title>','<defs><clipPath id="map"><rect x="8" y="8" width="376" height="332" rx="10"/></clipPath></defs>','<rect x="8" y="8" width="376" height="332" rx="10" fill="#e5ece5"/>','<g clip-path="url(#map)" stroke="#89958a" stroke-width="1" fill="#f4efdf" fill-rule="evenodd">']
    for code in ['16','17','24','33']:
        svg.append(f'<path d="{path(bycode[code])}"'+(' fill="#b5c6a3" stroke="#172e39" stroke-width="1.8"' if code==dept else '')+'/>')
    for code,name in towns:svg.append(f'<path d="{path(bycode[code])}" fill="#d94532" stroke="#9c3428" stroke-width="1"/>')
    svg.append('</g>')
    for i,(code,name) in enumerate(towns):
        x,y=project(representative(bycode[code])); ly=95+i*130
        svg.append(f'<path d="M{x:.2f} {y:.2f}L397 {ly}" stroke="#172e39" fill="none" stroke-width="1.3"/><circle cx="{x:.2f}" cy="{y:.2f}" r="4" fill="#d94532" stroke="#fffaf0" stroke-width="1.5"/><text x="404" y="{ly-10}" fill="#172e39" font-family="Arial,sans-serif" font-size="20" font-weight="bold">')
        # Noms longs sur deux lignes pour projection et petits écrans.
        lines={'Montpon-Ménestérol':['Montpon-','Ménestérol'],'Barbezieux-Saint-Hilaire':['Barbezieux-','Saint-Hilaire']}.get(name,[name])
        for j,line in enumerate(lines):svg.append(f'<tspan x="404" dy="{0 if j==0 else 25}">{escape(line)}</tspan>')
        svg.append('</text>')
    svg.append('<g stroke="#172e39" fill="#172e39"><path d="M365 54V28m-5 7 5-7 5 7" fill="none"/><text x="360" y="23" stroke="none" font-size="12" font-family="Arial">N</text></g><text x="18" y="355" font-family="Arial,sans-serif" font-size="10" fill="#546155">IGN / Admin Express COG 2018 · Licence Ouverte · repères communaux</text></svg>')
    Path(f'assets/maps/{dept}.svg').write_text(''.join(svg))
