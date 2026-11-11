# Photographies du Tour du monde

Les six fiches originales ont été vérifiées par l’utilisateur, qui a confirmé les auteurs, licences et fichiers avant intégration. Les tentatives d’accès depuis l’environnement ont toutes renvoyé HTTP 403 ; aucune consultation indépendante réussie n’est revendiquée et aucun paramètre réseau n’a été modifié.

| Destination | Original dans `assets/` | Auteur confirmé | Licence/statut confirmé |
| --- | --- | --- | --- |
| Japon | `Japanese_Sushi_platter.jpg` | Luvpixy | CC BY-SA 4.0 |
| Australie | `Eastern_gray_kangaroo_Macropus_giganteus.jpg` | Sklmsta | CC0 1.0 |
| Mexique | `Tacos_mexicanos (1).jpg` | Ix kimiaranda | CC BY-SA 4.0 |
| Maroc | `Couscous01.jpg` | Marokistorique | CC0 1.0 |
| Antarctique | `Penguins_on_iceberg_Antarctica.png` | Parikshit Sharma Photography | CC BY-SA 4.0 |
| Pollution marine | `Kanapou_Pollution.jpg` | NOAA's National Ocean Service | Domaine public américain, œuvre officielle NOAA ; historique Flickr CC BY 2.0 également signalé sur Commons |

## Sources

- https://commons.wikimedia.org/wiki/File:Japanese_Sushi_platter.jpg
- https://commons.wikimedia.org/wiki/File:Eastern_gray_kangaroo_Macropus_giganteus.jpg
- https://commons.wikimedia.org/wiki/File:Tacos_mexicanos.jpg
- https://commons.wikimedia.org/wiki/File:Couscous01.jpg
- https://commons.wikimedia.org/wiki/File:Penguins_on_iceberg_Antarctica.png
- https://commons.wikimedia.org/wiki/File:Kanapou_Pollution.jpg

Licences : [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), [historique CC BY 2.0](https://creativecommons.org/licenses/by/2.0/). La notice de domaine public NOAA reste documentée par le lien vers la fiche Commons ; l’historique Flickr et sa licence sont conservés dans les crédits détaillés. Aucun identifiant Flickr non fourni n’est inventé.

## Versions légères et conservation des originaux

`python3 tools/optimize-world-photos.py` (Pillow en développement uniquement) crée deux fichiers distincts sans écraser les originaux :

- `world/antarctica.webp` : largeur maximale de 1600 pixels, compression WebP qualité 84 ; environ 100 Ko contre 2,85 Mo. **Ce dérivé conserve CC BY-SA 4.0**, avec attribution à Parikshit Sharma Photography.
- `world/pollution.webp` : largeur maximale de 1600 pixels, compression WebP qualité 84 ; environ 314 Ko contre 3,12 Mo. Même référence NOAA et historique Flickr CC BY 2.0.

Le redimensionnement est proportionnel, sans recadrage, ajout ou suppression d’éléments. Les modifications techniques sont indiquées sous les photos et dans les crédits. Les quatre autres fichiers sont affichés tels quels. Toutes les images utilisent `object-fit: contain` et un lien vers leur original local. Toute adaptation ultérieure des photographies sous CC BY-SA devra conserver une licence compatible avec le partage à l’identique.

## Respect du dévoilement pédagogique

Les fichiers image ne sont insérés ni demandés au réseau avant la correction de leur défi ; la rubrique « Crédits photos » n’énumère que les destinations déjà révélées. La photo NOAA montre des déchets échoués sur une plage à Hawaï : elle illustre les conséquences de la pollution marine et ne représente pas directement la zone d’accumulation de déchets en mer. Cette distinction est explicitement affichée dans sa correction.
