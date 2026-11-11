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
