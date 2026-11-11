# Sources des cartes de L’apéro local

Contours : IGN, Admin Express COG, édition 2018 ; noms et codes INSEE 2018.
Distribution GeoJSON : [Grégoire David / france-geojson](https://github.com/gregoiredavid/france-geojson), version disponible le 11 novembre 2026.
Données sous [Licence Ouverte / Open Licence Etalab](https://www.etalab.gouv.fr/licence-ouverte-open-licence/), réutilisation avec attribution.

Fichiers d’origine : `departements.geojson` et `departements/{16-charente,17-charente-maritime,24-dordogne}/communes-*.geojson` sur la branche `master` du dépôt cité. Les dix entités utiles sont conservées sans redessiner ni simplifier leurs coordonnées dans `source.geojson`.

`python3 tools/generate-maps.py` régénère les trois SVG hors ligne. Projection équirectangulaire locale à latitude 45,5°. Le département est sauge et les communes sont corail. Les points représentent les centroïdes communaux, et non une adresse ou une position GPS du centre-ville. Le nord est indiqué ; ces cartes pédagogiques ne servent pas à la navigation. Aucune modification des limites n’est effectuée.

## Cartes métropolitaines

`mainland.geojson` conserve les 96 départements métropolitains du même jeu IGN Admin Express COG 2018 / france-geojson (y compris 2A et 2B). `python3 tools/generate-france-maps.py` produit les vues `france-16.svg`, `france-17.svg`, `france-24.svg` et `france-numeros.svg` sans réseau. Les limites et codes ne sont pas inventés : ils proviennent des propriétés INSEE et coordonnées source. Le zoom Île-de-France isole les départements très petits. Les cartes ont le nord en haut ; la précision d’affichage est pédagogique, non adaptée à la navigation.

## Nouvelle-Aquitaine et bassin d’Arcachon

`nouvelle-aquitaine-arcachon.svg` reprend les limites des 12 départements de la région dans `mainland.geojson` et le repère communal d’Arcachon (INSEE 33009). Son contour d’origine, sans modification, est conservé dans `arcachon.geojson` et provient du fichier `departements/33-gironde/communes-33-gironde.geojson` de france-geojson, même source IGN 2018 et Licence Ouverte. La carte localise Arcachon au bord du bassin ; elle ne prétend pas tracer le périmètre marin du bassin. Génération hors ligne : `python3 tools/generate-arcachon-map.py`.

## Bonus : anciennes régions de la Nouvelle-Aquitaine

`anciennes-regions-nouvelle-aquitaine.geojson` conserve les trois entités historiques Aquitaine (72), Limousin (74) et Poitou-Charentes (54), extraites sans modification des coordonnées du fichier [regions-avant-redecoupage-2015.geojson](https://github.com/gregoiredavid/france-geojson/blob/master/regions-avant-redecoupage-2015.geojson). Source : france-geojson, fonds administratifs IGN selon la documentation du projet, Licence Ouverte Etalab. Ces contours historiques sont distincts du fichier des départements actuels ; aucune limite n’est inventée ni tracée à la main.

`python3 tools/generate-regions-bonus-map.py` génère `bonus-nouvelle-aquitaine.svg` hors ligne. La projection locale est équirectangulaire à 45° ; les trois couleurs identifient les anciennes régions. Les points servent uniquement à relier les noms à leurs surfaces, pas à localiser des villes.

## Manche 3 : les 18 régions françaises

`regions-france.geojson` est le fichier intégral `regions-avec-outre-mer.geojson` de [france-geojson](https://github.com/gregoiredavid/france-geojson/blob/master/regions-avec-outre-mer.geojson), récupéré le 11 novembre 2026. Source du jeu selon sa documentation : IGN Admin Express COG 2018, codes et noms INSEE ; Licence Ouverte Etalab. Il contient les 13 régions métropolitaines, Corse comprise, et les 5 DROM. Les autres collectivités ultramarines ne sont pas des régions administratives et ne sont pas représentées ici.

`python3 tools/generate-france-regions.py` produit `france-regions.js` et `france-metropolitaine-regions.svg` hors ligne. Le fichier diffusé par france-geojson est déjà simplifié à partir des tracés IGN, selon la documentation de ce projet. Chaque anneau de ce fichier est projeté, sans suppression ni simplification supplémentaire des frontières (coordonnées SVG arrondies à 0,01 unité d’affichage). Projection équirectangulaire locale, nord en haut ; les DROM utilisent des encarts à des échelles différentes, explicitement signalés. Les noms, codes, formes et positions des drapeaux sont issus de ces entités ; aucune frontière n’est dessinée à main levée. Les drapeaux sont des repères pédagogiques à l’intérieur de la région, pas des adresses. Les libellés et marqueurs n’interceptent pas les clics sur les surfaces. Une liste de boutons fournit une alternative pour les très petites zones.

## Manche 4 : montagnes et fleuves

Le fond reprend `regions-france.geojson` et les surfaces métropolitaines générées dans `france-regions.js` : IGN Admin Express COG 2018 / france-geojson, Licence Ouverte Etalab, comme pour la manche 3. Aucun nom de massif n’est ajouté avant correction.

`gps-source.geojson` conserve six entités avec leurs coordonnées et propriétés d’origine, extraites le 11 novembre 2026 de [Natural Earth Vector](https://github.com/nvkelso/natural-earth-vector) :

- [`ne_10m_rivers_lake_centerlines.geojson`](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_rivers_lake_centerlines.geojson) : `Garonne`, `Seine`, **`Rhin` et `Rhine`**. Le Rhin est découpé en plusieurs entités dans la source : `Rhin` contient notamment le segment frontalier Bâle–Strasbourg–Lauterbourg, et `Rhine` sa partie aval. Les deux sont réunis ; la portion montrée est limitée à la fenêtre longitude 6,5–8,5°, latitude 47,5–49,05°. Les tracés ne sont pas dessinés à main levée.
- [`ne_10m_geography_regions_polys.geojson`](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_geography_regions_polys.geojson) : `PYRENEES` et `ALPS`. Ce sont des représentations généralisées des massifs à l’échelle 1:10 millions ; elles ne constituent pas des limites réglementaires ni un relevé topographique local.

Natural Earth est dans le **domaine public** ([conditions d’utilisation](https://www.naturalearthdata.com/about/terms-of-use/), [présentation et licence](https://github.com/nvkelso/natural-earth-vector#readme)). Les sources sont également créditées sous la carte du jeu.

### Génération et tolérance

`python3 tools/generate-gps-geography.py` génère `gps-geography.js` hors ligne. Dépendance de développement : `shapely==2.1.2` ; aucune dépendance ni connexion n’est nécessaire pour jouer. La projection est exactement celle du fond métropolitain de la manche 3, nord en haut. Les tracés SVG sont arrondis à 0,001 unité d’affichage. Les repères A/B/C sont placés sur les géométries des fleuves, pas à des positions inventées ; les étiquettes sont décalées avec un trait de liaison pour laisser voir l’eau.

La zone de correction des Pyrénées provient de `PYRENEES`, sur les deux versants du massif. Celle des Alpes est l’intersection de `ALPS` avec l’union du territoire métropolitain IGN : on demande bien les Alpes françaises.

La tolérance de validation ajoute **25 km autour de ces surfaces**. Ce tampon pédagogique est calculé dans un plan équirectangulaire en kilomètres à latitude de référence 46° (`x = longitude × 111,32 × cos(46°)`, `y = latitude × 111,32`). Il est reproductible et reste limité au territoire français pour les Alpes. Il ne prétend pas mesurer une distance géodésique au kilomètre près. `gps.js` teste le point déposé dans les polygones de tolérance, trous exclus ; les décalages visuels des pions n’interviennent jamais dans le calcul.

Les points de Toulouse, Bordeaux, Paris, Rouen, Strasbourg et du Mont-Blanc sont des repères pédagogiques arrondis, visibles à la correction uniquement. Aucun repère urbain n’est utilisé pour noter les réponses.

## Manche 5 : Passeport gourmand — Europe et capitales

`europe-countries.geojson` provient de [Natural Earth Vector, ne_10m_admin_0_countries.geojson](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_0_countries.geojson), téléchargé le 11 novembre 2026. Les 47 entités européennes utilisées sont conservées avec leurs noms français et identifiants Natural Earth (`ADM0_A3` enregistré sous `code`, `NAME_FR` sous `nom`, `NE_ID`). La Turquie et Chypre sont incluses ; les dépendances périphériques ne font pas partie de la sélection. Les données Natural Earth sont dans le **domaine public** ([conditions d’utilisation](https://www.naturalearthdata.com/about/terms-of-use/)). Le fond reprend leur représentation cartographique de référence, y compris les espaces au statut disputé ; ce support pédagogique ne prétend pas trancher ces statuts.

La géométrie est découpée automatiquement dans une fenêtre −25° à 45° de longitude, 34° à 72° de latitude : la Russie et certains territoires périphériques sont donc partiellement hors cadre. Les lignes de découpage aux bords du fond ne sont pas des frontières nationales. Les îles et territoires hors de cette fenêtre ne sont pas dessinés. Aucune frontière entre les destinations demandées et leurs voisins n’est inventée. Natural Earth 1:10 millions est un fond généralisé ; la précision d’affichage n’est pas celle d’un plan cadastral.

`passport-cities.geojson` conserve les quatre points `Brussels`, `Lisbon`, `Bucharest` et `Strasbourg` de [ne_10m_populated_places_simple.geojson](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_populated_places_simple.geojson), même source et domaine public. Les points représentent les villes à l’échelle cartographique, pas une adresse ou un bâtiment institutionnel.

`python3 tools/generate-europe-map.py` produit hors ligne :

- `europe-map.js` : surfaces cliquables et repères intérieurs, obtenus par la géométrie de chaque pays, ainsi que les points des trois capitales.
- `passport-bel.svg`, `passport-prt.svg`, `passport-rou.svg` : vues des pays et de leurs capitales, pour les corrections.
- `passport-strasbourg.svg` : Strasbourg repérée sur le fond métropolitain IGN / france-geojson existant (Licence Ouverte Etalab), avec le point de ville Natural Earth (domaine public).

Projection de l’Europe : Lambert azimutale équivalente centrée sur 10°E / 52°N, sans simplification supplémentaire des frontières. Les coordonnées SVG sont arrondies à 0,001 unité d’affichage. Le générateur nécessite `shapely==2.1.2` en développement ; aucun accès réseau ni dépendance externe n’est nécessaire pour jouer. Les données sources figées sont conservées localement. Les noms des pays ne sont pas dessinés sur le plateau avant correction ; les libellés accessibles restent également anonymes. Le zoom et le déplacement ne changent aucune géométrie ni le code du pays réellement sélectionné.

## Manche 6 : planisphère à sept continents

`world-countries.geojson` conserve les géométries du fichier [Natural Earth, ne_50m_admin_0_countries.geojson](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson), récupéré le 11 novembre 2026. Les propriétés utiles (code administratif, nom, continent) sont conservées ; les autres attributs sont retirés. `world-geographic-regions.geojson` conserve les sept entités de type `Continent`, ainsi que `NEW GUINEA` et `HAWAIIAN ISLANDS`, de [ne_50m_geography_regions_polys.geojson](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_geography_regions_polys.geojson). Natural Earth est dans le **domaine public** ([conditions d’utilisation](https://www.naturalearthdata.com/about/terms-of-use/)).

`python3 tools/generate-world-map.py` génère `world-map.js` hors ligne, avec `shapely==2.1.2` en développement. Il utilise une convention à **sept continents** : Europe, Asie, Afrique, Amérique du Nord (avec l’Amérique centrale), Amérique du Sud, Océanie, Antarctique. Les limites Europe/Asie suivent les régions physiques Natural Earth, pas l’affectation de tout un État à un continent. Les composantes transcontinentales sont découpées par ces régions ; les petits écarts de résolution des côtes sont rattachés au morceau physique le plus proche. Les îles isolées utilisent la catégorie continentale de la source ; pour les entités classées « Seven seas », le générateur utilise la région physique la plus proche. La Nouvelle-Guinée et l’archipel hawaïen font partie de l’Océanie. Les territoires ultramarins ne sont pas déplacés sur le continent de leur métropole : la Guyane française est notamment rattachée à l’Amérique du Sud.

Les polygones sont fusionnés sans simplification supplémentaire et le générateur vérifie que l’union des terres n’a perdu aucune surface ni introduit de doublon. Le Mexique est en Amérique du Nord ; l’Australie en Océanie. Les contours du Japon, de l’Australie, du Mexique et du Maroc utilisés en correction proviennent des mêmes géométries de pays. Les repères de ces destinations sont des points intérieurs, pas des positions de villes.

Projection équirectangulaire sur l’intégralité du monde, longitudes −180° à 180°, latitudes −90° à 90°. Elle garde l’Antarctique visible et déforme les surfaces aux hautes latitudes : elle ne permet pas de comparer les superficies. Les coordonnées SVG sont arrondies à 0,001 unité. Le pôle Sud, limite singulière de cette projection, est explicitement classé en Antarctique dans le moteur. Cette carte pédagogique n’est pas un outil de navigation ni un relevé de limites continentales universellement convenues.
