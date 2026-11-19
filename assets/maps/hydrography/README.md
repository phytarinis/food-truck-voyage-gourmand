# Hydrographie — manche 4, défi 2

Source : [Natural Earth, rivers + lake centerlines 1:10m](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-rivers-lake-centerlines/) et [Ocean 1:10m](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-ocean/). Données du domaine public, coordonnées WGS84 / EPSG:4326. Ces données sont généralisées pour une carte nationale ; ce n'est pas une carte de navigation ni un levé topographique. Le fond régional IGN / france-geojson reste sous Licence Ouverte (voir attribution principale).

Révision amont épinglée : `ca96624a56bd078437bca8184e78163e5039ad19`, dépôt [nvkelso/natural-earth-vector](https://github.com/nvkelso/natural-earth-vector/tree/ca96624a56bd078437bca8184e78163e5039ad19/geojson). Les SHA-256 des fichiers complets et des extraits sont dans `SOURCES.json`.

## Extraits et transformations
- `rivers.geojson` : tous les objets non vides nommés Seine, Loire, Garonne, Dordogne, Rhône, Rhin et Rhine, sans retouche de leurs coordonnées. Les trois parties de la Loire sont réunies ; les deux parties du Rhin sont réunies et limitées à l'environnement de la frontière française (emprise 6.5–8.5°E, 47.5–49.05°N). Le Rhône est limité au territoire français avec une marge de 0.01° sur la frontière ; ses branches ne sont pas remplacées par un tracé simplifié à main levée.
- `coastal-water.geojson` : intersection de la couche Ocean avec l'emprise -1.3 à -0.3°E / 44.8 à 45.7°N. Elle contient les contours réels généralisés de l'ouverture atlantique, de l'estuaire et de ses deux bras amont.
- `marine-context.geojson` : intersection de la même couche Ocean avec -10 à 12°E / 39 à 54°N, pour situer les débouchés marins sur le fond de carte.
- Le sommet de la presqu'île entre les deux bras est le vertex **[-0.596181, 45.024644]**, directement issu de la côte Natural Earth : c'est le repère **généralisé** du bec d'Ambès dans cette source. La séparation de couleur à cette latitude est une convention de représentation, pas une nouvelle rive tracée. Les deux composantes d'eau en amont sont associées à la Garonne et à la Dordogne, et la composante aval à la Gironde.
- L'ouverture de l'estuaire est découpée entre les deux vertices côtiers existants **[-1.069163, 45.57331]** et **[-0.98351, 45.586982]**. Cette section sert à la distinction de couleur avec l'océan ; elle ne constitue pas une limite administrative ou réglementaire de l'estuaire.
- Aucun axe de fleuve n'est prolongé artificiellement. Les surfaces d'eau complètent les axes amont. Les deux couches Natural Earth sont indépendamment généralisées : l'écart axe/surface est de 0.0006724° au maximum à cette jonction (environ 75 m, moins de 0.04 unité SVG sur la carte nationale), sans segment inventé pour le combler. Les surfaces des bras sont contiguës à celle de l'estuaire.
- La Gironde possède son propre polygone et n'est pas comptée comme Garonne dans le moteur. Le zoom de correction reprend ces mêmes contours vectoriels, sans dessin schématique de remplacement. Les petits traits gris du zoom sont des traits de légende, distincts des cours d'eau bleus.

Les services WFS et le téléchargement GeoJSON de BD TOPAGE 2024/2026 ont été testés ; leur domaine est refusé par le proxy réseau (403). Natural Earth fournit ici les couches nécessaires ; aucun complément BD TOPAGE n'est revendiqué.

## Reproduction
Depuis la racine du dépôt, avec Python et Shapely 2.1.2 :

```sh
# Facultatif : retélécharger les deux sources épinglées et vérifier leurs SHA-256.
python tools/fetch-gps-hydrography.py
# Hors ligne : produire le module JavaScript à partir des extraits versionnés.
python tools/generate-gps-hydrography.py
```

Le générateur vérifie la validité des surfaces, la présence des vertices cités dans la côte source, la contiguïté bras/estuaire, l'absence de recouvrement des bras avec l'estuaire et la distance sous-pixel entre axes et surfaces. Aucun accès réseau n'est requis au lancement du jeu ou de ses tests.
