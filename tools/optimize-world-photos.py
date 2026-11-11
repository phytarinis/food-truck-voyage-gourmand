"""Versions légères demandées pour Chromebook ; originaux jamais écrasés.
Dépendance de développement : Pillow. Pas de recadrage ni retouche de contenu.
"""
from pathlib import Path
from PIL import Image,ImageOps
out=Path('assets/photos/world');out.mkdir(parents=True,exist_ok=True)
for source,name in [('Penguins_on_iceberg_Antarctica.png','antarctica.webp'),('Kanapou_Pollution.jpg','pollution.webp')]:
 with Image.open(Path('assets')/source) as original:
  image=ImageOps.exif_transpose(original).convert('RGB');image.thumbnail((1600,1600),Image.Resampling.LANCZOS)
  target=out/name;image.save(target,'WEBP',quality=84,method=6,icc_profile=original.info.get('icc_profile',b''))
  print(source,'→',target,image.size,target.stat().st_size,'octets')
