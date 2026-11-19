# Lot 2 — Compte rendu pédagogique et ressources

Branche mise à jour depuis `main` au commit `930bcfc` (PR #39 fusionnée), en conservant les améliorations du lot 2. Les quinze affirmations, cinq corrections, bulles et indices B/C/A/B/B de la PR #39 sont conservés intégralement. Les moteurs de score, cartes interactives, sauvegardes et grand final restent ceux de ce `main`. Voir le [bilan de réconciliation](validation-pr35/BILAN.md).

## Modifications intégrées

- **Accueil** : retouche légère générée à partir de l’image actuelle (même format 1672 × 941, composition, héroïne, food truck rouge, titre, identité Labo Épicé et position du bouton). L’original `Le grand voyage gourmand en van.png` reste intact ; la version affichée est `assets/accueil-retouche.png`.
- **Équipes** : les deux logos existants encadrent désormais le personnage, sans nouvelle marque.
- **Manche 1** : département crème/orange, numéro sauge/vert ; seuls les départements révélés sont accentués. « numéros des départements » est souligné en orange dans le défi.
- **Manches 2 et 3** : mots-clés limités aux indices déjà visibles ; noms des plats accentués après révélation. Le titre de correction de la galette utilise « galette bretonne », avec la réponse et l’explication sur le sarrasin conservées.
- **Anciennes régions** : comparaison côte à côte avant/depuis 2016, sans héroïne. Les trois limites historiques IGN/france-geojson locales sont reprises, et leur union forme le contour de la Nouvelle-Aquitaine. Même projection et même échelle pour les deux cartes ; aucune frontière inventée. Générateur : `tools/generate-lot2-maps.py`, dépendance de développement Shapely 2.1.2.
- **Population** : illustration de groupe diversifié dans le style du jeu, explicitement décrite comme illustration sans valeur statistique. Le chiffre proposé de 67 millions et la référence Insee 2026 n’ont pas été modifiés.
- **GPS** : mots-clés des massifs/fleuves après correction, mentions du gâteau à la broche et de la tartiflette, clarification Garonne–Dordogne–Gironde et nouveau schéma pédagogique. Le schéma est étiqueté non cartographique ; il distingue les affluents du cours principal et l’estuaire des cours d’eau.
- **Passeport** : mots-clés sans ajout d’indices ; Belgique accentuée uniquement après découverte. L’encadré roumain autonome est supprimé, son information intégrée au troisième indice. Le son facultatif est conservé dans une commande discrète. Titres neutres maintenus.
- **Monde** : « Un steak qui fait des bonds ! » et « Une ancienne escale de chasse à la baleine ». Le texte parle des expéditions des XIXe et XXe siècles dans les mers australes, sans présenter une tradition culinaire actuelle ni une chasse pratiquée dans le jeu. Cartes et zones d’évaluation inchangées.
- **Métiers** : cinq variantes professionnelles du même personnage, générées à partir de la référence des transitions : service, cuisine, réception, entretien, restauration rapide. Nom du métier unique dans le contenu et en-tête compact sans répétition ; illustration agrandie au même emplacement. Affirmations, réponses, explications, progression et absence de points conservées.

## Formulation roumaine proposée à validation pédagogique

1. « Je suis un pays d’Europe traversé par les montagnes des Carpates. » (inchangé)
2. « Une de mes régions les plus célèbres est la Transylvanie, associée à de nombreuses légendes. » (inchangé)
3. **« Ma capitale est Bucarest. Livraison urgente : mon client a demandé sa viande très, très saignante… comme dans les histoires de Dracula ! »**

Il reste exactement trois indices, avec le barème 20 / 15 / 10. Aucune quatrième étape ni autre validation n’est ajoutée.

## Vérification de la Garonne

La carte interactive de la PR #38, désormais dans `main`, est conservée : six cours d'eau vectoriels, bras aval, Gironde distincte et ouverte sur l'Atlantique, placement direct sans repères A/B/C visibles. Les données, zones de détection et gestionnaires d'interaction ne sont pas remplacés par l'ancienne carte du lot 2. Le schéma collectif original reste disponible après révélation.

Les sources, limites de précision et contrôles géométriques restent ceux de [la carte hydrographique](../assets/maps/hydrography/README.md). Les mentions culinaires du lot 2 et les accents colorés sont conservés dans le seul rendu de correction, sans mutation des données du moteur GPS.

## Photographies encore à fournir

Les quatre photographies suivantes ne figurent pas dans les ressources disponibles. L’accès à l’API et aux fiches Wikimedia Commons a renvoyé HTTP 403 le 18 novembre 2026 ; il n’a pas permis de vérifier une nouvelle licence et son auteur. Aucune image non vérifiée ou illustration générée présentée comme photographie n’a été intégrée.

| Ressource | Fichier proposé | Utilisation prévue |
| --- | --- | --- |
| Paysage du massif des Pyrénées | `pyrenees-paysage.jpg` | Vue dominante de la correction Pyrénées |
| Gâteau à la broche | `gateau-a-la-broche.jpg` | Petite photographie culinaire associée |
| Paysage des Alpes | `alpes-paysage.jpg` | Vue dominante de la correction Alpes |
| Tartiflette | `tartiflette.jpg` | Petite photographie culinaire associée |

À fournir avec chaque fichier : source originale, nom de l’auteur, licence autorisant la réutilisation et lien de licence. Privilégier une largeur d’au moins 1600 pixels pour le paysage et 800 pixels pour le plat. Les emplacements ne sont pas remplacés par des cadres vides dans le jeu ; les cartes et informations pédagogiques restent affichées.

## Illustrations ajoutées et provenance

- `assets/careers/{serveuse,cuisiniere,receptionniste,entretien,restauration-rapide}.png` : variantes de la même héroïne, référence `assets/transitions/02-cuisine.png`, issue de l’héroïne originale.
- `assets/population-france.png` : illustration originale de groupe, même référence de style, sans données chiffrées.
- `assets/accueil-retouche.png` : retouche fidèle de l’accueil existant. L’original est conservé.
- `assets/maps/bonus-regions-comparaison.svg` : contours historiques locaux IGN/france-geojson, Licence Ouverte, source et précision documentées dans `assets/maps/ATTRIBUTION.md`.
- `assets/maps/garonne-fleuve-riviere.svg` : schéma explicatif original, non cartographique, reprenant les relations hydrologiques demandées.

Aucune illustration professionnelle ne reste manquante. Les quatre ressources photographiques ci-dessus constituent le reliquat de ce lot.

## Validation réalisée

- 864 tests unitaires réussis, dont les trois indices roumains, les nouveaux titres, la comparaison régionale et la distinction Garonne/estuaire.
- Suite dédiée du lot 2 : six manches, trois niveaux d’indices, corrections et accents, comparatif, schéma masqué avant réponse, population et cinq métiers ; absence de défilement aux résolutions 1280 × 720 et 1366 × 768.
- Sept scripts navigateur réussis sans préchargement : transitions réelles, lot 1, lot 2, pédagogie métiers, hydrographie, carnet et piments sans indices. Les 23 autres scripts historiques réussissent avec le préchargement documenté, soit 30 scripts au total.
- 23 suites navigateur historiques réussies avec leur préchargement de présentation documenté, sans substitution des moteurs ni des sauvegardes. Les attentes des tests sont alignées sur les textes validés de la PR #39 et sur les nouveaux visuels ; aucune ancienne question métier n’est réintroduite.
- Les contrôles des métiers couvrent aussi 320 × 640, 390 × 844, 1024 × 768 et 1920 × 1080. Les parcours des cartes, les deux modes de piment, les sauvegardes, le grand final et ses conclusions restent fonctionnels.

Les seuls éléments non intégrés sont les quatre photographies à droits vérifiables listées ci-dessus. Aucun test ne reste en échec à la livraison.
