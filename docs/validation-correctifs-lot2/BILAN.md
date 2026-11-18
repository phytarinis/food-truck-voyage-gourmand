# Correctifs ciblés après le lot 2

## État initial et portée
Branche `fix/lot-2-piments-garonne-photos` créée depuis `origin/main` (`2e422630bcb9a4b4a76063991d497cf7109f1cd3`). La PR #35 (`feat/lot-2-contenus-visuels`, `ff0b58f`) est encore ouverte : elle n'est ni fusionnée ni reprise intégralement ici. Le schéma pédagogique de cette PR est réutilisé à l'identique. Aucun changement aux moteurs des manches, aux barèmes ou aux zones de validation.

## Réalisé
- Menu des plats piégés : Piment Tornade → spiders, Piment Volcan → cuy, Piment Panique → eggs, Piment Bazooka → scorpions. Aucun thème visible avant lancement. Correspondance stockée dans `game.spicy.choiceNames` et sérialisée par la sauvegarde existante ; migration des anciennes sauvegardes sans réinitialiser les questions utilisées. Questions, réponses, photographies et deux modes inchangés.
- Dordogne ajoutée sur la carte des fleuves, depuis ses coordonnées Natural Earth. Couche purement visuelle : les trois repères, cibles et scores restent inchangés.
- Correction textuelle : Garonne et Dordogne → bec d’Ambès → estuaire de la Gironde → Atlantique.
- Schéma collectif après révélation seulement : deux cours d'eau distincts, confluence, estuaire différencié et ouverture vers l'océan, avec sens d'écoulement. Schéma original non cartographique, sans prétention de coordonnées géographiques.

## Sources et limites géographiques
Dordogne : Natural Earth 1:10m, domaine public, fichier `ne_10m_rivers_lake_centerlines.geojson`, téléchargé depuis https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson ; extrait complet conservé dans `assets/maps/dordogne-source.geojson`.
La Garonne existante se termine à [-0.541697,44.898017], près de Bordeaux, avant le bec d’Ambès. La Dordogne disponible se termine à [-0.493723,44.997992]. Ni la couche principale ni la couche complémentaire `ne_10m_rivers_europe.geojson` ne fournissent le raccord aval et une géométrie identifiée de l'estuaire. Les accès Overpass et IGN/Geoportail consultés ont été refusés par le proxy réseau (403). Aucun segment manquant n'a été dessiné par interpolation.
**Correction cartographique incomplète** : il reste à obtenir une source licenciée du cours aval de la Garonne jusqu'au bec d’Ambès, du raccord de la Dordogne, et des limites de la Gironde jusqu'à son ouverture sur l'Atlantique. Le schéma explique correctement ces relations, mais ne remplace pas ces données sur la carte interactive.

## Photographies
**Aucune nouvelle photographie intégrée.** Les quatre ressources suivantes restent à ajouter :
1. Paysage du massif des Pyrénées (grande image, correction Pyrénées).
2. Gâteau à la broche (petite image, correction Pyrénées).
3. Paysage du massif des Alpes (grande image, correction Alpes).
4. Tartiflette (petite image, correction Alpes).
Pour chacune : fichier accessible, auteur, page source vérifiable, licence et attribution compatibles avec la redistribution. Les accès Wikimedia Commons (API et fichiers upload.wikimedia.org) et Wikipédia testés sont bloqués par le proxy (403). Aucun fichier ni crédit supposé n'a été inventé. Les corrections conservent leur carte ; aucune image n'est ajoutée au jeu de placement. La disposition des futures images ne peut donc pas être validée.

## Validation
Voir les résultats de livraison ci-dessous. Les anciens tests de parcours sont exécutés avec `tests/helpers/legacy-rounds.cjs`, qui neutralise les seules introductions de manches pour conserver leur scénario historique ; les tests des transitions réelles sont exécutés séparément.
