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
