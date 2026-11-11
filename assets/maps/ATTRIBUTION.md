# Sources des cartes de L’apéro local

Contours : IGN, Admin Express COG, édition 2018 ; noms et codes INSEE 2018.
Distribution GeoJSON : [Grégoire David / france-geojson](https://github.com/gregoiredavid/france-geojson), version disponible le 11 novembre 2026.
Données sous [Licence Ouverte / Open Licence Etalab](https://www.etalab.gouv.fr/licence-ouverte-open-licence/), réutilisation avec attribution.

Fichiers d’origine : `departements.geojson` et `departements/{16-charente,17-charente-maritime,24-dordogne}/communes-*.geojson` sur la branche `master` du dépôt cité. Les dix entités utiles sont conservées sans redessiner ni simplifier leurs coordonnées dans `source.geojson`.

`python3 tools/generate-maps.py` régénère les trois SVG hors ligne. Projection équirectangulaire locale à latitude 45,5°. Le département est sauge et les communes sont corail. Les points représentent les centroïdes communaux, et non une adresse ou une position GPS du centre-ville. Le nord est indiqué ; ces cartes pédagogiques ne servent pas à la navigation. Aucune modification des limites n’est effectuée.
