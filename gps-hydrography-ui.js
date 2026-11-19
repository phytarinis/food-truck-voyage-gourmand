/* Defi 2 uniquement : surfaces et lignes proviennent des extraits Natural Earth. */
function gpsHydroPathPolygons(polygons,project){
 return polygons.map(poly=>poly.map(ring=>'M'+ring.map(p=>project(p).join(',')).join('L')+'Z').join(' ')).join(' ');
}
function renderGpsHydroMap(svg,s,active,corrected){
 const hydro=GpsHydrography;
 for(const river of hydro.rivers){
  if(river.waterPath)svg.append(gpsElement('path',{d:river.waterPath,class:'gps-river-water','aria-hidden':'true'}));
  svg.append(gpsElement('path',{d:river.path,class:'gps-hydro-line','aria-hidden':'true'}));
 }
 svg.append(gpsElement('path',{d:hydro.estuary.path,class:'gps-estuary','aria-hidden':'true'}));
 const reserved=corrected?[{x:5,y:350,w:220,h:205}]:[];
 if(corrected){
  for(const river of hydro.rivers){
   const [x,y]=river.anchor;
   const label=gpsElement('text',{x,y:y-16,class:'gps-correct-label gps-hydro-name','text-anchor':'middle'});label.textContent=river.name;svg.append(label);
   reserved.push({x:x-river.name.length*6,y:y-38,w:river.name.length*12,h:25});
  }
  renderGpsGirondeInset(svg);
 }
 const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
 for(const team of active?[s.team]:[0,1]){
  s.placements[team].forEach((placement,label)=>{
   const anchor=typeof placement==='string'?hydro.rivers.find(r=>r.id===placement)?.anchor:placement?.point?GpsGame.project(placement.point):null;
   let [x,y]=anchor||[100+label*230,45];
   if(!active){
    const offsets=[[0,team===0?-23:23],[0,team===0?-60:60],[-90,0],[90,0],[-90,-55],[90,55],[0,-100],[0,100],[-170,0],[170,0]];
    for(const [dx,dy] of offsets){
     const nx=Math.max(76,Math.min(584,x+dx)),ny=Math.max(24,Math.min(536,y+dy)),rect={x:nx-72,y:ny-20,w:144,h:40};
     if(!reserved.some(r=>overlaps(rect,r))){x=nx;y=ny;reserved.push(rect);break;}
    }
   }
   if(anchor){
    if(!active)svg.append(gpsElement('path',{d:`M${anchor[0]},${anchor[1]}L${x},${y}`,class:`gps-placement-link team-${team}`}));
    svg.append(gpsElement('circle',{cx:anchor[0],cy:anchor[1],r:4,class:`gps-anchor team-${team}`}));
   }
   svg.append(gpsRiverPiece(x,y,team,label,active));
  });
 }
}
function renderGpsGirondeInset(svg){
 const g=gpsElement('g',{class:'gps-gironde-inset','aria-label':'Zoom géographique : confluence, estuaire de la Gironde et ouverture sur l’Atlantique',role:'img','pointer-events':'none'});
 g.append(gpsElement('rect',{x:5,y:350,width:220,height:205,rx:8}));
 const project=([lon,lat])=>[15+(lon+1.24)*220,385+(45.68-lat)*180];
 const water=gpsHydroPathPolygons(GpsHydrography.coastalWater,project);
 const defs=gpsElement('defs'),clip=gpsElement('clipPath',{id:'gps-gironde-clip'});clip.append(gpsElement('rect',{x:10,y:380,width:210,height:166}));defs.append(clip);g.append(defs);
 g.append(gpsElement('path',{d:water,class:'gps-ocean','clip-path':'url(#gps-gironde-clip)'}));
 for(const river of GpsHydrography.rivers.filter(r=>r.waterPolygons.length))g.append(gpsElement('path',{d:gpsHydroPathPolygons(river.waterPolygons,project),class:'gps-river-water'}));
 g.append(gpsElement('path',{d:gpsHydroPathPolygons(GpsHydrography.estuary.polygons,project),class:'gps-estuary'}));
 for(const [point,tx,ty] of [[GpsHydrography.confluence.coordinates,80,477],[[-.55,44.92],90,535],[[-.54,45.023],196,535]]){
  const [x,y]=project(point);g.append(gpsElement('path',{d:`M${x},${y}L${tx},${ty}`,class:'gps-inset-callout'}));
 }
 const [x,y]=project(GpsHydrography.confluence.coordinates);g.append(gpsElement('circle',{cx:x,cy:y,r:3,class:'gps-confluence'}));
 for(const [text,tx,ty,size] of [['GIRONDE · ZOOM',17,372,17],['Atlantique',15,405,16],['Gironde',91,445,18],['Bec d’Ambès',15,474,17],['Garonne',15,550,17],['Dordogne',132,550,17]]){
  const label=gpsElement('text',{x:tx,y:ty,'font-size':size});label.textContent=text;g.append(label);
 }
 svg.append(g);
}
