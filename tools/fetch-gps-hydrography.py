"""Optional source refresh. Shapely 2.1.2; pinned upstream commit + SHA-256.
Generate the checked-in extracts, then run generate-gps-hydrography.py offline.
"""
import hashlib,json,urllib.request
from pathlib import Path
from shapely.geometry import shape,mapping,box
from shapely.ops import unary_union
REV='ca96624a56bd078437bca8184e78163e5039ad19'
BASE=f'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/{REV}/geojson/'
EXPECTED={'ne_10m_rivers_lake_centerlines.geojson':'bb854a900ecbd3b408df46d5e16e3e0f974ba55993f9d8b5c26e855273c0905a','ne_10m_ocean.geojson':'f9696a1337c746a0f6c8c13bc60d0f230d2ef8d105198d5657726c8f8e763fc2'}
def fetch(name):
 b=urllib.request.urlopen(BASE+name,timeout=60).read()
 assert hashlib.sha256(b).hexdigest()==EXPECTED[name],f'Unexpected source contents: {name}'
 return json.loads(b)
def write(name,features):
 ROOT.joinpath(name+'.geojson').write_text(json.dumps({'type':'FeatureCollection','features':features},ensure_ascii=False,separators=(',',':'))+'\n')
ROOT=Path('assets/maps/hydrography');ROOT.mkdir(parents=True,exist_ok=True)
s=fetch('ne_10m_rivers_lake_centerlines.geojson')
f=[f for f in s['features'] if f['properties']['name'] in ['Seine','Loire','Garonne','Dordogne','Rhône','Rhine','Rhin'] and f['geometry'] and not shape(f['geometry']).is_empty]
write('rivers',f)
w=unary_union([shape(f['geometry']) for f in fetch('ne_10m_ocean.geojson')['features']])
for name,region in [('coastal-water',box(-1.3,44.8,-.3,45.7)),('marine-context',box(-10,39,12,54))]:
 write(name,[{'type':'Feature','properties':{'source':'Natural Earth ne_10m_ocean'},'geometry':mapping(w.intersection(region))}])
