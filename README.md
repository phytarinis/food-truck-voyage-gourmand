# food-truck-voyage-gourmand
Jeu pédagogique numérique – Labo Épicé × E2C Coutras

## Lancer le jeu

Ouvrir `index.html` dans Chrome (Chromebook compris), Firefox ou Edge. Aucun serveur, compte, accès Internet ou installation n’est nécessaire. Tous les fichiers doivent rester dans le même dossier, avec le sous-dossier `assets`.

Pour le développement, un serveur local facultatif :

```sh
cd /workspace/food-truck-voyage-gourmand
python3 -m http.server 8000 --bind 0.0.0.0
```

## Jeu disponible

- Accueil, noms des deux équipes, scores et compteurs de deux jokers par équipe.
- Carnet des six manches jouables, de « L’apéro local » à « Tour du monde ». La démo est indépendante.
- Démonstration : trois indices, une tentative par équipe à chaque indice. Le formateur valide la réponse orale. Les deux échecs ouvrent l’indice suivant ; une réussite termine le défi et attribue les points. Après six échecs, personne ne marque.
- L’équipe 1 commence la première démonstration. L’équipe de départ alterne à chaque nouvelle démonstration ; elle commence aussi chaque indice de ce défi. Rejouer conserve les scores.
- Correction et bouton de réinitialisation avec confirmation. La partie est sauvegardée localement sur cet appareil ; recharger reprend la progression. Seule une nouvelle partie confirmée l’efface.

Les deux piments de chaque équipe permettent maintenant de jouer aux « Plats piégés », entre les défis ou pendant la phase des derniers piments. L’illustration d’accueil validée est conservée ; les trois logos partenaires sont intégrés dans l’en-tête. Rien n’est publié automatiquement.

## Modifier le jeu

- `index.html` : écrans et structure accessible.
- `styles.css` : palette, projection 16:9 et adaptation aux petits écrans.
- `assets/road-trip.svg` : illustration originale du food truck et du personnage.
- `game.js` : données des manches, indices et moteur de règles indépendant du DOM.
- `app.js` : navigation et affichage. Les noms des équipes sont insérés comme texte.

Le moteur peut accueillir d’autres défis plus tard ; il n’attribue jamais deux fois les points d’un défi terminé.

## Vérifier les règles

Avec Node.js (uniquement pour les tests, inutile pour jouer) :

```sh
node --test tests/*.test.cjs
```

Vérification manuelle : démarrer deux équipes, tester une bonne réponse à chaque indice, six mauvaises réponses, l’alternance en rejouant, puis l’annulation et la confirmation de la réinitialisation.


## Habillage BD et règles

Le parcours comprend maintenant : accueil → équipes → règles → carnet de route → démonstration → correction. Les règles présentent les « Plats piégés » et leurs deux modes sans retrait de points.

Le personnage et le camion des pages intérieures sont des vignettes SVG réutilisant l’image d’accueil validée, sans modification de ce fichier. `assets/frites.svg` illustre la correction. Le carnet relie les six escales. `renderRoute({ current, completed })` dans `app.js` affiche les états (indices de manches de 0 à 5) et la position du camion ; les manches 1 et 2 font progresser cet itinéraire. La démo ne change pas l’état des manches.


## Manche 1 — L’apéro local

Le nom « L’apéro local » sur le plateau ouvre la manche : introduction, Montpon-Ménestérol, Jonzac, Barbezieux-Saint-Hilaire, bonus sans points puis bilan. Les deux équipes répondent simultanément, sans indices ni alternance. Les quatre départements et les quatre numéros restent visibles dans chaque espace de réponse. La correction exige les quatre choix (deux par équipe).

`apero.js` contient les livraisons et les règles ; `apero-ui.js` gère les nouveaux écrans. Chaque bonne composante vaut 5 points, indépendamment de l’autre ; maximum 30 points par équipe. Une validation fige la correction et attribue les points une seule fois. Reprendre une question conserve les choix ; reprendre une correction ou un bilan ne modifie pas les scores. Le bonus ne modifie jamais les scores. La manche terminée ne peut pas être recommencée sans réinitialiser la partie. Recharger la page conserve désormais la partie grâce à la sauvegarde locale.

Les cartes proviennent de contours IGN Admin Express COG 2018, distribués par france-geojson sous Licence Ouverte. Départements et communes sont dessinés d’après ces données, sans tracés inventés ; les points sont des repères communaux. Voir `assets/maps/ATTRIBUTION.md`. Le générateur standard Python `tools/generate-maps.py` recrée les SVG hors ligne à partir de `assets/maps/source.geojson`. Les cartes n’exigent aucun service distant lorsque l’on joue.

Tests du navigateur (facultatifs pour les développeurs ; Playwright et Chromium nécessaires uniquement pour ce contrôle) : lancer un serveur local, puis `APERO_TEST_URL=http://127.0.0.1:8000 node tests/apero.browser.cjs`. Le script vérifie le parcours complet, la reprise, les gains indépendants, le bonus sans points, la fin de manche, la démo, la réinitialisation et cinq tailles d’écran.

### Retouches visuelles de la manche 1

- Introduction avec une seule grande vignette du personnage ; réponses sous forme de cartes A/B/C/D, conservant les boutons radio et le clavier.
- Corrections : France métropolitaine, limites départementales, département surligné, repères communaux et zoom local. Bonus avec les 96 codes départementaux INSEE et un zoom Île-de-France, agrandissable dans un onglet.
- Navigation avec le food truck existant. Les moteurs `game.js` et `apero.js` ne changent pas.
- Six JPEG fournis sont associés aux corrections dans `culture-photos.js`, affichés entiers et agrandissables. Les références photographiques fournies sont liées aux sources et licences, avec un statut non vérifié tant que la correspondance n’a pas pu être confirmée. La photo de remplacement évoquant la BD à Angoulême est conservée avec l’accord de l’utilisateur ; ses crédits restent à vérifier, sans utiliser ceux du festival de 2013. Voir `assets/photos/README.md` pour les noms exacts et limites de vérification. Aucun réglage réseau n’est changé.
- Logos fournis : `assets/Logo sans fond.png` (Labo Épicé) et `assets/logo_couleur (2).jpg` (AFEPT). E2C Coutras reste une identification distincte. Le fichier `assets/Copie de Gironde_1 (1).png` représente E2C Gironde et n’est pas employé comme logo AFEPT.

## Cinq pauses métiers — Deux vérités, une idée reçue !

Depuis le bilan de L’apéro local : **Pause métier → Serveur / Serveuse → Carnet de route**. Le groupe choisit une seule affirmation collectivement, puis le formateur révèle l’idée reçue. Trois informations accompagnées de pictogrammes complètent la correction. Aucun point n’est attribué et aucun joker n’est consommé. Revenir à la pause conserve le choix et la révélation, sans nouveau gain.

`careers.js` contient les cinq métiers, leurs textes validés, les positions des idées reçues (B, C, A, B, B) et un moteur indépendant des scores et de la progression. `careers-ui.js` affiche un écran réutilisable et conserve l’état de chaque pause dans `game.careerPauses`. La réinitialisation du jeu efface aussi ces états.

Les pauses serveur et cuisine sont reliées respectivement aux bilans des manches 1 et 2. Les pauses réceptionniste, entretien hôtelier et restauration rapide restent prêtes pour la suite, sans simuler l’achèvement des manches non développées. Lors du développement des manches suivantes, leur bilan pourra appeler `openCareerPause(index)` avec un indice de 0 à 4 ; l’appel ne termine aucune manche et ne lance pas la suivante. Le bouton de sortie rejoint le carnet.

Vérifications : `node --test tests/*.test.cjs`. Tests navigateur facultatifs avec Playwright et Chromium : `CAREER_TEST_URL=http://127.0.0.1:8000 node tests/careers.browser.cjs`. Ils exercent les 15 choix possibles, les révélations, le clavier, la répétition, les scores/jokers et cinq tailles d’écran. Le test `tests/apero.browser.cjs` vérifie aussi la liaison réelle entre le bilan de la manche 1, la pause serveur et le carnet.

### Disposition des pauses et illustrations métier

Les cinq pauses partagent la composition 60/40 : affirmations verticales à gauche, grand compagnon validé à droite. La réplique humoristique n’apparaît qu’après la révélation. Les corrections et les trois repères métier sont conservés, sans modification du moteur ni des textes validés.

Le lot 2 fournit désormais cinq variantes professionnelles de la même héroïne dans `assets/careers/`, référencées par `career-illustrations.js`. Les tenues et accessoires identifient le métier ; les affirmations et réponses du composant restent inchangées. Voir [le compte rendu du lot 2](docs/LOT2.md).

Logos officiels utilisés dans l’en-tête :
- `assets/Logo sans fond.png` — Labo Épicé, PNG RGBA 500×500.
- `assets/Logo_AFEPT-removebg-preview.png` — AFEPT transparent, PNG RGBA 696×359.
- `assets/Copie de Gironde_1 (1).png` — E2C Gironde, PNG RGBA 2363×2363, accompagné de la mention « Site de Coutras ».

Les fichiers des logos restent intacts. Les viewports SVG retirent uniquement l’excès de marge transparente pour les afficher à une taille lisible, sans redessiner ni déformer les marques. Le logo AFEPT transparent est repris de main sans remplacer les autres modifications de la branche. L’illustration d’accueil reste inchangée.


## Manche 2 — À quelle sauce ?

Depuis la deuxième escale : introduction → trois énigmes (foie gras, chocolatine/pain au chocolat, huîtres) → bonus Nouvelle-Aquitaine → bilan → pause métier cuisine → carnet. Chaque équipe transmet ses réponses par écrit au formateur ; aucun champ de spécialité n’est affiché à l’écran. Les deux appellations de la viennoiserie sont acceptées par le formateur.

`sauce.js` gère un indice commun et des réponses propres à chaque équipe. Une erreur aux indices 1 ou 2 enregistre la réponse et met l’équipe en attente, sans changer l’indice. « Dévoiler l’indice suivant » apparaît seulement quand chaque équipe a répondu ou a déjà trouvé ; le formateur déclenche alors la révélation commune. Une équipe ayant trouvé conserve ses points et ne répond plus, tandis que l’autre peut poursuivre seule. La troisième erreur termine sa recherche à zéro. Une réussite attribue 20, 15 ou 10 points selon l’indice commun, une seule fois. La correction attend la fin des deux recherches. Maximum : 60 points par équipe sur cette manche, ajoutés aux scores généraux.

Chaque bouton de validation ouvre une confirmation annulable. Un jeton propre au jeu, à l’énigme, à l’indice commun, à l’équipe et à son état refuse les confirmations répétées ou périmées. Un second jeton protège la révélation commune contre les clics répétés. Une équipe en attente ne peut pas répondre une deuxième fois au même indice. Les validations n’affectent ni la réponse de l’autre équipe ni les jokers. Revenir au carnet puis reprendre la manche conserve les indices et les résultats, sans réattribuer les points. La réinitialisation confirmée efface la partie ; le rechargement la conserve.

`sauce-ui.js` gère ces nouveaux écrans. Trois visuels fournis sont intégrés via `sauce-photos.js` : photographie de foie gras, illustration de boulangère et photographie d’huîtres. L’utilisateur a expressément demandé de conserver l’illustration IA pour la chocolatine : elle porte la mention « Illustration générée par intelligence artificielle », sans auteur ni licence Wikimedia attribués à tort. Les deux photographies reprennent les références Wikimedia fournies par l’utilisateur ; la comparaison avec les originaux reste bloquée par HTTP 403. Aucun réglage réseau n’a été modifié.

Le lien « Crédits photos » du pied de page ouvre les auteurs, titres, sources et licences des énigmes déjà corrigées uniquement, afin de ne pas révéler les autres spécialités. Les trois visuels sont affichés entiers avec `object-fit: contain`, sans retouche ni recadrage par le jeu. Les chemins exacts et les informations de provenance sont documentés dans `assets/photos/SAUCE.md`. La configuration distingue `verified` (vérification externe) de `approvedForDisplay` (affichage explicitement confirmé par l’utilisateur) ; une future photo non approuvée doit avoir sa correspondance et ses droits vérifiés avant affichage.

La carte des huîtres situe Arcachon au bord du bassin dans la région Nouvelle-Aquitaine, en reprenant les limites IGN 2018 et le contour communal. Sources dans `assets/maps/ATTRIBUTION.md` ; génération hors ligne avec `python3 tools/generate-arcachon-map.py`.

Tests : `node --test tests/*.test.cjs`. Test navigateur facultatif : `SAUCE_TEST_URL=http://127.0.0.1:8000 node tests/sauce.browser.cjs`. Il vérifie les deux progressions, confirmation/annulation, correction différée, reprise, pause cuisine, fin de manche, réinitialisation et cinq tailles d’écran. Seules les deux premières escales sont jouables ; leur sélection depuis le carnet n’ajoute pas de condition de déblocage nouvelle.

### Bonus final de la manche 2 — Une région, trois histoires

Après les huîtres, le bouton « Le bonus gourmand » ouvre une question collective sur les régions fusionnées en 2016. Le formateur sélectionne A, B ou C puis révèle la réponse. La bonne réponse est A (Aquitaine, Limousin et Poitou-Charentes). La carte historique et la réplique du compagnon restent masquées avant la révélation.

Ce bonus ne change ni les scores ni les jokers, quelle que soit la réponse sélectionnée. La manche 2 reste en cours jusqu’au clic sur « Terminer la manche » après révélation ; le bilan propose ensuite la pause cuisine. Retourner au carnet conserve le choix et la correction sans attribuer de points supplémentaires. `sauce.js` expose `chooseBonus`, `revealBonus` et `finish` pour ce parcours.

La carte est générée hors ligne par `python3 tools/generate-regions-bonus-map.py` à partir de `assets/maps/anciennes-regions-nouvelle-aquitaine.geojson`. Les trois contours proviennent du fichier historique `regions-avant-redecoupage-2015.geojson` de france-geojson ; aucune frontière n’est redessinée. Attribution et Licence Ouverte dans `assets/maps/ATTRIBUTION.md`.

Les trois visuels et leurs crédits sont conservés : rhosoi / CC BY 2.0, illustration IA sans attribution à Ariane Corisande, Wilfredor / CC0 1.0. La comparaison des originaux Wikimedia est toujours refusée par HTTP 403 dans l’environnement ; aucune validation externe réussie n’est revendiquée.


### Synchronisation des indices de la manche 2

`game.sauce.clueIndex` définit l’indice affiché simultanément dans les deux colonnes, y compris pour une équipe qui a déjà trouvé. `players[].clueIndex` conserve le niveau de sa réponse pour le calcul et la correction. Le nouvel état `waiting` bloque les commandes après une erreur, jusqu’à la révélation suivante. Les états `found` et `exhausted` sont les seuls qui terminent une recherche.

`canRevealNextClue`, `nextClueToken` et `revealNextClue` centralisent les conditions et la protection du bouton. Exemple : erreur corail → attente à l’indice 1 ; réussite sauge → +20 pour sauge ; clic du formateur → indice 2 commun, corail seule encore en recherche pour 15 points. Aucune réponse validée ne fait avancer automatiquement l’indice.

Les tests couvrent les 16 combinaisons de gains sur les trois énigmes, dans les deux ordres de validation, ainsi que l’attente, la poursuite en solo, les confirmations périmées, les révélations répétées, le retour au carnet, les images/crédits, le bonus sans points et la réinitialisation.

## Manche 3 — La France et ses spécialités

La troisième escale est désormais jouable : introduction → choucroute → drapeaux → découverte culturelle → galette de sarrasin → drapeaux → découverte → rougail saucisse → drapeaux → découverte → bonus population → bilan → pause métier Réceptionniste → carnet. La manche 4 reste non jouable. La démonstration reste indépendante.

- `france.js` : moteur propre à cette manche, sur le principe synchronisé de la manche 2. Un indice commun ; validations séparées, confirmations annulables ; révélation suivante explicite après les deux réponses ou une recherche déjà terminée. Une réussite donne 20/15/10 points une seule fois ; les deux recherches terminées débloquent la révélation de la spécialité.
- `france-ui.js` : écrans, confidentialité des drapeaux, corrections, bonus et transition. Les classes sobres des composants existants sont réutilisées, sans changer les moteurs des manches précédentes.
- `france-regions.js`, `assets/maps/regions-france.geojson`, `tools/generate-france-regions.py` : frontières IGN / france-geojson, 13 régions métropolitaines et 5 DROM. Génération hors ligne, attribution dans `assets/maps/ATTRIBUTION.md`. Le SVG du bonus est généré depuis les mêmes entités métropolitaines. Les collectivités d’outre-mer autres que les DROM ne sont pas représentées.
- `index.html`, `styles.css`, `app.js` : nouveaux écrans et styles limités à la manche 3, entrée de la troisième escale et suivi de progression. Les illustrations, logos et écrans antérieurs sont conservés.

### Drapeaux et points

Le formateur choisit directement une région par clic sur sa véritable surface, ou au clavier (Tab, Entrée/Espace). Une liste de boutons permet aussi de sélectionner les très petites zones. Le drapeau est déplaçable avant validation. Après validation corail, le rendu ne conserve ni drapeau, ni surbrillance, ni texte indiquant son choix pendant le tour sauge. Les deux drapeaux réapparaissent après validation sauge ; s’ils partagent la même région, ils sont décalés côte à côte. La bonne région ne s’affiche qu’après le clic explicite de révélation, qui ajoute exactement 5 points par bon choix, sans pénalité. Une équipe n’ayant pas trouvé la spécialité peut gagner les points géographiques.

Le maximum de cette manche est donc de 75 points par équipe, ajoutés aux scores cumulés. Les jetons empêchent les confirmations et validations périmées ; les transitions et la révélation géographique sont protégées contre les répétitions. Revenir au carnet puis reprendre conserve la phase et les choix, y compris le masquage du drapeau corail. Le rechargement conserve la partie ; la réinitialisation confirmée l’efface.

### Bonus et photographies

Le bonus collectif attend une sélection puis « Révéler la réponse ». B, environ 67 millions, est l’ordre de grandeur attendu. La correction indique le 1er janvier 2026, le caractère provisoire et la [publication Insee du 13 janvier 2026](https://www.insee.fr/fr/statistiques/5225246). L’utilisateur a vérifié et fourni cette référence et l’estimation de 66 792 845 habitants ; l’accès direct Insee est refusé par le réseau de l’environnement (403), sans modification des paramètres réseau. Le bonus ne touche ni aux points ni aux jokers.

Les corrections affichent les trois photographies locales via `france-photos.js`, identifiées par `data-specialty` (`choucroute`, `galette`, `rougail`). Les fichiers suivants ont été récupérés depuis `main` et restent intacts :

- `assets/Choucroute-garni_1.JPG`
- `assets/Galette_de_sarrasin_complète_bretonne.jpg`
- `assets/Rougail_saucisse_et_riz_zambrocal.jpg`

Crédits fournis par l’utilisateur : Brücke-Osteuropa / CC0 1.0 (choucroute), Arnaud 25 / CC BY-SA 4.0 (galette), Benoît Prieur / CC0 1.0 (rougail). Les crédits, liens Wikimedia et licences apparaissent sous chaque photo et dans « Crédits photos », après sa correction uniquement. Les fichiers sont affichés entiers avec `object-fit: contain`, sans retouche ni recadrage par le jeu ; aucune adaptation de la galette n’est créée. Toute adaptation ultérieure devra respecter CC BY-SA 4.0. Aucun visuel généré ni photo de substitution n’a été ajouté. Les références sont celles fournies par l’utilisateur ; aucune comparaison externe supplémentaire n’est revendiquée.

### Validation

`node --test tests/*.test.cjs` couvre notamment les 16 combinaisons de réussites/échecs des deux équipes, pour les trois énigmes et dans les deux ordres de validation, les indices verrouillés, les jetons périmés, les drapeaux, le +5 unique, le bonus sans points et le cumul réel des trois manches.

`FRANCE_TEST_URL=http://127.0.0.1:8007 node tests/france.browser.cjs` teste le parcours complet, les clics réels dans les 18 régions, le masquage corail jusque dans les sélections accessibles, les drapeaux côte à côte, la sélection au clavier, les scores, la reprise, le bonus, la pause Réceptionniste et le reset. Le rendu est vérifié en Chromium à 1920×1080, 1366×768, 1024×768, 390×844 et 320×640, sans débordement horizontal. Les parcours navigateur des manches 1, 2 et des cinq pauses métiers sont également vérifiés. Ces dimensions simulent Chromebook et projection ; aucun appareil physique n’est utilisé.

## Manche 4 — Le GPS a perdu la boule !

Branche issue de `main` après fusion de la manche 3 (PR n° 10). Depuis la quatrième escale : introduction → Pyrénées → comparaison et correction → fleuves → comparaison et correction → Alpes → comparaison et correction → bonus fleuve/rivière → bilan → pause métier n° 4 Entretien hôtelier → carnet. La manche 5 reste non jouable.

### Placements et scores

Les deux équipes jouent successivement : corail déplace et valide ; sa proposition disparaît entièrement pendant le tour sauge ; les deux placements réapparaissent après validation sauge. Le formateur déclenche ensuite la correction. Les points ne sont attribués qu’à cette révélation, une seule fois. Les choix sont modifiables avant validation et verrouillés ensuite. Retourner au carnet conserve les réponses, leur confidentialité, la phase et les chronomètres.

- Pyrénées : chaîne stylisée corail/sauge déplaçable horizontalement et verticalement, sans rotation. 15 points si le point de placement est dans la zone de tolérance, sinon 0.
- Fleuves : trois étiquettes GARONNE/SEINE/RHIN à glisser sur les tracés ou leurs grands repères anonymes A/B/C. Une étiquette sur une zone occupée échange les positions ; aucune zone n’accueille deux étiquettes de la même équipe. Les **trois placements sont obligatoires**, selon la clarification de l’utilisateur. Le barème est 5 points par bonne association ; avec trois étiquettes exclusives et toutes placées, les gains possibles sont mathématiquement **0, 5 ou 15**, pas 10. Les deux séries de réponses restent visibles et décalées à la correction.
- Alpes : miniature du food truck rouge d’origine, encadrée dans la couleur de l’équipe ; aucune nouvelle illustration de véhicule. 15 points pour une localisation correcte des Alpes françaises, sinon 0. Deux camions proches sont décalés visuellement, avec des traits vers leurs positions réelles ; la note utilise toujours les positions enregistrées, jamais les positions d’affichage.

Maximum : 45 points par équipe. Le bonus collectif B (un fleuve se jette dans la mer ou l’océan, une rivière dans un autre cours d’eau) ne modifie ni scores ni jokers. La transition conserve le score cumulé sans tableau détaillé. La réinitialisation confirmée efface la partie ; le rechargement la conserve.

### Chronomètres et accessibilité

45 secondes pour les fleuves, 30 pour les Alpes. Le formateur lance le chronomètre corail ; un nouveau compte à rebours complet commence au passage à sauge. L’expiration affiche zéro et une invitation à terminer : elle ne valide rien, ne bloque aucun placement et n’affecte pas les points. Le temps est calculé depuis une échéance de `performance.now()` ; les rafraîchissements n’allongent pas le délai. Une reprise depuis le carnet conserve le temps écoulé.

Les interactions utilisent les événements de pointeur (souris, pavé tactile, tactile). Les objets possèdent de grandes zones de saisie et ne tournent jamais. Alternatives : clic sur la carte pour positionner un pion ; flèches au clavier sur le pion (Maj pour un pas plus grand) ; sélection d’une étiquette puis clic, Entrée ou Espace sur un repère. L’aide est consultable dans un volet. Les boutons de validation/révélation et le chronomètre apparaissent en haut du panneau pour rester faciles d’accès en projection.

### Fichiers et données

- `gps.js` : moteur, réponses propres à chaque équipe, verrous, temps, scoring, bonus et bilan.
- `gps-ui.js` : écrans, glisser-déposer, alternatives clavier, affichage confidentiel et corrections.
- `gps-geography.js`, `assets/maps/gps-source.geojson`, `tools/generate-gps-geography.py` : vrais tracés Natural Earth (domaine public), massifs et zones de tolérance reproductibles de 25 km ; contours français IGN réutilisés. Sources, méthode et limites pédagogiques dans `assets/maps/ATTRIBUTION.md`.
- `index.html`, `styles.css`, `app.js` : intégration de la quatrième escale et composants visuels limités à cette manche. Accueil, logos, photos, camion, personnage et moteurs des manches précédentes conservés.

Le générateur est réservé au développement : installer `shapely==2.1.2` puis lancer `python3 tools/generate-gps-geography.py`. Les données nécessaires sont locales et le jeu fonctionne hors ligne sans installation.

### Tests

`node --test tests/*.test.cjs` couvre les localisations bonnes/fausses, les 36 combinaisons de réponses aux fleuves, les échanges exclusifs, les validations anticipées/répétées/périmées, les deux chronomètres et leur expiration sans blocage, le bonus sans points, la reprise, le cumul et la conservation des manches précédentes. Un contrôle géographique vérifie expressément que le Rhin contient le segment frontalier amont et pas seulement sa partie aval.

`GPS_TEST_URL=http://127.0.0.1:8007 node tests/gps.browser.cjs` teste le parcours complet : véritables glisser-déposer à la souris dans les deux axes, dépôt sur un tracé hors de son repère, trois étiquettes obligatoires, échanges, confidentialité, six réponses simultanées, placements proches sans chevauchement visible, clavier, chronomètres 45/30 secondes avec horloge contrôlée, scores, correction explicite, bonus, bilan, entretien hôtelier et reset. Tests à 1920×1080, 1366×768, 1024×768, 390×844 et 320×640, sans débordement horizontal. Les suites navigateur des manches 1, 2, 3, de la démonstration et des cinq pauses métiers vérifient les régressions. Chromebook et projection sont simulés par ces dimensions dans Chromium, sans appareil physique.

## Manche 5 — Passeport gourmand

Refonte ergonomique sur `feat/manche-5-ergonomie`, issue de `main` au commit `7751e5f`, après fusion des refontes des manches 2 (#26), 3 (#28) et 4 (#29).

Parcours : première énigme directement → découverte culturelle et carte → correction automatique → destination suivante → Défi Strasbourg → pause métier « Équipier polyvalent en restauration rapide ». Aucun écran d’introduction, de révélation intermédiaire, de bilan ou de pause piment imposée.

### Indices, annulation et scores

Une seule zone d’indice pour les deux équipes. L’animateur choisit l’équipe puis valide directement sa réponse orale, sans saisie ni confirmation. Le prochain indice apparaît après les réponses des équipes encore en recherche ; une équipe ayant trouvé ne répond plus. La solution attend la fin des deux recherches. Barèmes inchangés : 20/15/10 points pour le pays, +5 pour le drapeau correct, maximum 75 par équipe.

« Annuler la dernière validation » restaure l’état des indices, les réponses et le score, même après rechargement. L’annulation reste disponible après découverte du pays jusqu’au premier placement de drapeau. Les anciens jetons de validation restent invalides après annulation. Le moteur partagé `clue-flags.js` reste intact ; l’annulation est propre à `passport.js`.

### Carte et contenu

Les trois destinations restent Belgique (frites), Portugal (pastéis de nata) et Roumanie (château de Bran et personnage fictif de Dracula). Leurs photos, crédits et une courte information culturelle apparaissent à côté de la carte avant les placements. Les titres restent « Destination mystère n° 1/2/3 » pendant la recherche.

Corail place et valide son drapeau ; son placement et son cadrage sont masqués/remis à zéro pendant le tour sauge. La seconde validation révèle automatiquement les deux drapeaux, le pays correct et sa capitale, et attribue les points une seule fois. La correction reste sur le même écran, sans tableau de points supplémentaire. Zoom et déplacements restent disponibles, y compris pour la Belgique.

Les 47 surfaces et les trois capitales viennent de Natural Earth (domaine public). Les noms accessibles des zones restent anonymes pendant les placements. Sources et projection : `assets/maps/ATTRIBUTION.md`. Régénération : `python3 tools/generate-europe-map.py`, avec `shapely==2.1.2` pour le développement uniquement.

Le bouton « Jouer un piment » est disponible sur la correction, jamais pendant une réponse ou un placement inachevé. Les modes, stocks, scores et sauvegardes des jokers restent inchangés. Le Défi Strasbourg conserve sa sélection collective, sa correction et son absence de points. L’ambiance sonore facultative de la Roumanie reste déclenchée uniquement sur demande.

### Quatre photographies intégrées

`passport-photos.js` configure les quatre fichiers locaux, leurs crédits fournis, sources Wikimedia et liens de licence :

- `assets/Un_cornet_de_frites_(Grand-Place,_Bruxelles).jpg` — Benoît Prieur — CC0 1.0.
- `assets/Pasteis_de_Nata_001.jpg` — Ocdp — CC0 1.0.
- `assets/Bran_castle.jpeg` — Nicu hoandra — CC BY-SA 4.0.
- `assets/December_2007,_flags_in_front_of_Louise_Weiss_building_2.jpg` — Syced — CC0 1.0.

Chaque photo est affichée entière dans la découverte culturelle (ou la correction du Défi Strasbourg), sans étirement, retouche ou recadrage ; la signature de Bran est conservée. Les crédits et liens sont accessibles sous les photos, avec un lien d’agrandissement, ainsi que dans « Crédits photos ». La photo du Parlement n’est ni insérée dans le DOM, ni demandée au réseau, ni divulguée par les crédits avant la révélation du bonus. Les crédits des pays apparaissent dès leur découverte, avant les placements.

La fiche Commons de Bran renvoie 403 : la graphie « Nicu hoandra » est reprise de la référence fournie, sans confirmation indépendante. Aucune licence n’est changée et aucun fichier original n’est modifié. Sources, limites de vérification et obligations en cas d’adaptation future : `assets/photos/PASSPORT.md`.

### Fichiers et vérifications

`node --test tests/*.test.cjs` vérifie les combinaisons de réponses, les indices synchronisés, les scores uniques, les jetons et l’annulation persistée.

`PASSPORT_TEST_URL=http://127.0.0.1:8008 node tests/passport.browser.cjs` vérifie le parcours des trois destinations, le choix de l’équipe, les réponses aux différents indices, l’annulation, la reprise après actualisation, les photos/crédits, les drapeaux masqués, la correction automatique, les scores, le défi et la pause métier. Les actions essentielles sont vérifiées sans défilement vertical à 1366 × 768 et 1280 × 720 dans Chromium.

`PASSPORT_TEST_URL=http://127.0.0.1:8008 node tests/passport-spicy.browser.cjs` vérifie les deux modes de piment, leur annulation avant lancement, la dépense unique, le rechargement pendant la question et sa correction, et le retour au même écran de carte. Les suites unitaires et navigateur des autres manches couvrent les régressions.

## Manche 6 — Tour du monde

Refonte ergonomique sur `feat/manche-6-ergonomie`, issue de `main` au commit `8782477`, après fusion des refontes des manches précédentes et des finitions de la manche 5 (#31).

Parcours : entrée directe dans le défi des sushis → Japon/Asie → Australie/Océanie → Mexique/Amérique du Nord → Maroc/Afrique → Antarctique → surprise sur les déchets marins → derniers piments et grand final. Chaque défi conserve les deux placements, leur validation, une révélation explicite et une correction illustrée. La progression « MANCHE 06 / DÉFI X SUR 6 » apparaît uniquement dans l’en-tête supérieur.

### Carte et réponses

Les cinq premières destinations utilisent **le même planisphère et le même composant** `renderWorldMap`, adossé au rendu `FlagMap` déjà validé. Les sept surfaces proviennent de Natural Earth : Europe, Asie, Afrique, Amérique du Nord, Amérique du Sud, Océanie, Antarctique. Les pays transcontinentaux ne sont pas affectés en bloc au continent politique de leur État ; les terres sont regroupées à partir des régions physiques sources. Source, convention, projection et limites d’usage dans `assets/maps/ATTRIBUTION.md` ; génération hors ligne par `tools/generate-world-map.py`.

`flag-choices.js` extrait la gestion commune des choix, verrous et révélations des manches 3 et 5. Ces dernières continuent de l’utiliser via `clue-flags.js` avec leurs barèmes de 5 points inchangés. La manche 6 utilise la même logique de confidentialité : choix corail modifiable, validation, disparition complète de son drapeau, choix sauge, validation, deux drapeaux côte à côte si nécessaire. Aucun nom de continent n’est dessiné ni fourni dans les libellés accessibles pendant les réponses. La correction colore le continent et situe la destination (pays source mis en évidence pour les quatre premiers défis).

Une bonne localisation donne **10 points par équipe et par défi**, une seule fois au clic de révélation. La manche rapporte au maximum **60 points par équipe**, ajoutés aux scores cumulés. Le bouton « Jouer un piment » se trouve dans la correction, sans écran de pause imposé entre les défis. Les règles des jokers restent inchangées et leur déclenchement est interdit pendant un placement. Le retour au carnet conserve la phase, les réponses et leur masquage ; le rechargement conserve la partie ; la réinitialisation confirmée l’efface.

### Défi surprise : placement libre

Le sixième défi reprend la carte mais accepte un point libre dans toute surface océanique, indépendamment des zones continentales. Un clic ou un appui place le drapeau ; les flèches au clavier le déplacent (Maj pour un pas plus grand), depuis une position neutre seulement après une action du joueur. Les points sur les terres sont refusés. Le moteur conserve longitude/latitude ; le petit décalage des deux drapeaux proches ne modifie jamais leurs positions d’évaluation. Les événements de pointeur conservent la précision des coordonnées, notamment au pavé tactile.

Avant révélation : aucun nom de l’océan concerné, repère, contour, zone colorée, texte explicatif ou photographie de pollution. Après les deux validations, « Révéler le septième continent » affiche une zone **pédagogique indicative** dans le Pacifique Nord. La photo montre une plage polluée à Hawaï ; elle n’est pas une vue directe du Great Pacific Garbage Patch. Le texte explique une accumulation diffuse de plastiques, notamment de microplastiques, et non une île solide ou un véritable continent.

La tolérance est explicite dans `world.js` : longitudes **−170° à −120°**, latitudes **20° à 45°**, bornes comprises, uniquement dans l’océan. Cette marge volontairement large permet une évaluation à l’échelle d’un planisphère. **Ce rectangle n’est pas une frontière scientifique du phénomène.** Il n’est ajouté au DOM qu’à la correction ; les crédits et les fichiers des photos ne révèlent pas non plus la réponse à l’avance.

### Six photos validées et allégées

`world-photos.js` associe les six fichiers aux destinations, auteurs, licences, sources et modifications techniques. L’utilisateur a confirmé les références après vérification des fiches Commons ; l’environnement reçoit toujours 403. Les trois photos CC BY-SA 4.0 gardent leurs crédits et liens de licence. Le statut de domaine public NOAA et l’historique Flickr sous CC BY 2.0 sont tous deux conservés. Détails complets : `assets/photos/WORLD.md`.

Les originaux ne sont jamais écrasés. Deux versions proportionnelles WebP sont générées par `tools/optimize-world-photos.py` pour alléger les images les plus lourdes : Antarctique ~100 Ko et pollution ~314 Ko. Le dérivé de l’Antarctique reste sous CC BY-SA 4.0. Aucun recadrage ni image générée ; les changements de taille/compression sont annoncés dans le jeu. Les photos et leurs crédits apparaissent uniquement après la révélation de leur destination. Les crédits complets et licences sont accessibles dans un volet « Crédits et licence » sous chaque photo et dans le dialogue général des crédits. Le fichier exact des tacos est `assets/Tacos_mexicanos (1).jpg`.

### Correction compacte et grand final

La carte et la photo restent côte à côte, suivies d’une courte information culturelle et de commandes de navigation sobres, sans van ni rappel des points. Au sixième défi, la correction affiche immédiatement le Pacifique Nord, l’explication sur les microplastiques, la précision sur la plage photographiée à Hawaï et le caractère approximatif du contour pédagogique. Les actions essentielles et ces explications sont vérifiées sans défilement vertical à 1366 × 768 et 1280 × 720.

Après la dernière correction, « Le grand final » marque uniquement la manche 6 terminée par son moteur et rejoint l’entrée existante des derniers piments lorsque les six manches sont réellement terminées. Aucun écran de bilan ou de fin de manche ne s’intercale. Si d’autres manches restent inachevées, le retour au carnet avec scores provisoires reste disponible. La détection ne modifie aucune autre phase ; les règles de clôture des derniers piments sont conservées.

### Fichiers et tests

Nouveaux : `world.js`, `world-ui.js`, `world-map.js`, `world-photos.js`, `flag-choices.js`, sources géographiques sous `assets/maps`, deux versions photo sous `assets/photos/world`, générateurs, documentation et tests dédiés. Intégration dans `app.js`, `index.html`, `styles.css` et le dialogue de crédits. `clue-flags.js` et `flag-map.js` réutilisent les petits composants de drapeaux extraits sans changer le comportement des manches précédentes.

`node --test tests/*.test.cjs` couvre les 49 combinaisons de réponses des deux équipes pour chacun des cinq premiers défis, les verrous et jetons périmés, les points océaniques/terrestres, les limites de la tolérance, les scores uniques, le maximum de 60, le cumul et la conservation des autres manches, les sept continents et les références/versions photo. Le générateur vérifie également la conservation topologique des terres.

`WORLD_TEST_URL=http://127.0.0.1:8008 node tests/world.browser.cjs` vérifie les clics réels, les six défis dans l’ordre, la confidentialité, le clavier, les photographies et leurs crédits, les scores uniques, la reprise, l’absence de van et de progression répétée, le carnet et le reset. Dimensions Chromium : 1920 × 1080, 1366 × 768, 1280 × 720, 1024 × 768, 390 × 844 et 320 × 640. Les deux résolutions de projection vérifient aussi l’absence de défilement vertical et de chevauchement des corrections.

`node tests/world-spicy.browser.cjs` vérifie les deux modes de piment, la dépense unique, la sauvegarde pendant la question/correction et la reprise de la même destination. `node tests/world-finale.browser.cjs` termine les cinq premières manches et les cinq pauses avec leurs moteurs, puis les six défis ; il vérifie la reprise, l’accès direct aux derniers piments et au grand final, sans message erroné sur les manches restantes. `node tests/final.browser.cjs` couvre la suite du grand final. Les suites des autres manches, des jokers et de l’ergonomie générale couvrent les régressions.

## Jokers « Plat piégé ! »

Deux piments par équipe pour toute la partie, quatre questions uniques. Le formateur choisit le propriétaire du piment, le mode et une question disponible avant de lancer :

- **Je tente ma chance** : l’équipe joueuse gagne 10 points si elle répond juste, sinon 0.
- **Je défie l’autre équipe** : l’adversaire répond obligatoirement. Une bonne réponse lui rapporte 10 points ; une erreur rapporte 10 points à l’équipe qui a lancé le défi.

Le piment est consommé au lancement, jamais lors d’une simple consultation ou annulation. Aucun retrait de points. Un seul joker peut être joué entre deux défis principaux ; les bonus et pauses métiers ne recréent pas cet intervalle. Aucun lancement pendant une question ou une correction. Après validation collective A/B/C par le formateur, la correction révèle la photo, son crédit, l’explication et la réplique. La reprise retrouve exactement le défi suivant, sans perdre les réponses ni les scores des manches.

Après l’achèvement des six manches, « Les derniers piments » affiche les scores provisoires. Les équipes volontaires alternent ; une équipe peut jouer successivement si l’autre renonce ou n’a plus de piments. Renoncer à utiliser ses piments ne dispense pas de répondre à un défi adverse. La clôture est possible sans jouer et fige les scores définitifs. La clôture mène désormais à la séquence du grand final décrite ci-dessous. Si certaines manches restent inachevées, la transition reste provisoire.

Moteur indépendant : `spicy.js`. Interface et reprise des six parcours : `spicy-ui.js`. Références photo : `spicy-photos.js` et [crédits complets](assets/photos/SPICY.md). Les originaux sont conservés, affichés entièrement et uniquement après révélation ; la rubrique de crédits ne liste que les questions révélées.

Vérification : **704 tests unitaires réussis** (`node --test tests/*.test.cjs`). `SPICY_TEST_URL=http://127.0.0.1:8008 node tests/spicy.browser.cjs` couvre les deux modes, erreurs et réussites, unicité, reprise des six manches, verrouillage des intervalles, alternance finale, renoncement, clôture, crédits, images masquées et réinitialisation. Les sept suites navigateur existantes (six manches et pauses métiers, démo incluse) passent également. Dimensions simulées : 1920×1080, 1366×768, 1024×768, 390×844 et 320×640 ; aucun débordement horizontal. Ces vérifications Chromium ne remplacent pas un essai sur vidéoprojecteur physique.

## Le grand final

La séquence finale réutilise `SpicyGame` et son instantané de clôture : aucun nouveau moteur de jokers ni calcul de gain. Après les six manches, « DERNIER COUP DE PIMENT ! » affiche les scores provisoires, permet les deux modes existants et la clôture sans jouer. La clôture verrouille les scores, puis enchaîne : retour animé du camion et du personnage d’origine → six souvenirs → révélation simultanée des scores définitifs. Corail, sauge et égalité sont traités avec la même valorisation des deux équipes.

Les animations sont courtes, ne désactivent jamais les boutons et disparaissent avec `prefers-reduced-motion`. Aucun son n’est ajouté. Les pictogrammes des souvenirs sont de petits dessins vectoriels ; les illustrations d’origine restent inchangées.

« Revoir notre voyage » ouvre le carnet, ses six escales terminées et cinq accès métiers. Les corrections sont consultables en lecture seule : destinations, informations culturelles, cartes exactes existantes, photographies/crédits et gains enregistrés. Cette consultation ne modifie aucun état de partie, ne rejoue pas les questions et ne rapporte aucun point. « Revenir aux résultats » reste accessible. La démonstration est désactivée après clôture.

« Nouvelle partie » et le bouton de réinitialisation commun ouvrent la même confirmation, avec annulation sans modification. Confirmer efface la partie, les scores, réponses, drapeaux, chronomètres et jokers ; les références temporaires de navigation/validation sont nettoyées. Retour à l’accueil validé, inchangé. La partie suivante dispose de deux piments par équipe et quatre questions disponibles.

### Fichiers et dépendances du final

- `final.js` lit l’instantané définitif et détermine victoire/égalité, sans modifier la partie.
- `final-ui.js` orchestre la séquence, les souvenirs et les consultations en lecture seule.
- `index.html`, `styles.css`, `app.js`, `spicy-ui.js` intègrent les écrans et la navigation.
- `tests/final.test.cjs`, `tests/final.browser.cjs` vérifient la séquence ; le test navigateur des jokers suit désormais cette nouvelle continuation.

Branche `feat/grand-final`, mise à jour depuis `main` après la fusion de la PR #14 des jokers (fusion effectuée extérieurement pendant le développement). La manche 6 est intégrée via la PR #13. La PR du final vise donc directement `main`, sans dépendance non fusionnée. Aucune fusion n’a été effectuée par l’agent. Le nouveau fichier `assets/Le grand voyage gourmand.png` ajouté à `main` est conservé sans modification.

Validation du final : `node --test tests/*.test.cjs` et `FINAL_TEST_URL=http://127.0.0.1:8008 node tests/final.browser.cjs`. Le navigateur couvre un dernier joker réel, le verrou définitif, l’absence de révélation prématurée, corail/sauge/égalité, les onze consultations sans mutation, annulation/confirmation du reset, les nouveaux piments et la réduction des animations. Les cinq dimensions habituelles sont vérifiées sans débordement horizontal. Les essais utilisent Chromium avec des dimensions Chromebook/vidéoprojecteur simulées, sans matériel physique.

Résultat de validation : **709 tests unitaires réussis**, ainsi que les neuf suites navigateur (final, jokers, six manches et pauses métiers, démonstration comprise).


## Corrections graphiques et ergonomiques

L’accueil utilise maintenant la nouvelle illustration validée `assets/Le grand voyage gourmand.png`. L’ancien fichier reste intact et continue de fournir le personnage et le camion d’origine sur les autres écrans. Le bouton invisible « En route ! » suit le bouton dessiné de la nouvelle image, avec focus clavier. Les partenaires de l’en-tête restent masqués sur l’accueil ; ailleurs, la mention « Site de Coutras » a été retirée sans remplacer le logo E2C.

`ergonomics.js` harmonise les actions principales avec le visuel existant « Livraison suivante ». Les réponses bonne/mauvaise, les choix et les petites commandes restent distincts. Les champs des équipes, les cartes de réponse et les règles sont arrondis/allégés ; le personnage est agrandi et inversé avec sa bulle dans l’introduction de la manche 2. Les cinq métiers ont des titres féminins explicites. Les ressources manquantes sont détaillées dans [le bilan des corrections](docs/ERGONOMIE.md).

Le pion dépend exclusivement des manches terminées, jamais de la manche ouverte. Six positions sont prévues, sans masquer les intitulés sur ordinateur ou mobile. La route et les escales existantes restent en place, avec deux petits souvenirs vectoriels supplémentaires. Le déplacement utilise une courte transition de position, désactivée en réduction des animations ; il ne simule pas une trajectoire exacte le long de chaque courbe.

### Sauvegarde locale

`persistence.js` conserve la partie dans `localStorage` sous `voyage-gourmand:partie:v1` : noms, scores, manches, choix/drapeaux, pauses métiers, jokers et clôture finale. Au rechargement, le carnet reprend les étapes réellement terminées. Un joker interrompu reprend sa question ou sa correction et sa continuation, sans consommer un second piment ni attribuer deux fois les points. Les chronos ajustent leur origine au rechargement. La nouvelle partie confirmée efface la sauvegarde ; annuler ne change rien. Si le stockage du navigateur est indisponible, le jeu reste utilisable en mémoire. Cette sauvegarde reste propre au navigateur et à l’adresse du site, sans serveur ni compte.

### Ajustements pédagogiques et transitions

L’indice 3 de la chocolatine devient « Passé au nord de la Garonne, je ne porte pas toujours le même nom. ». L’idée reçue de l’entretien hôtelier concerne le travail solitaire ; la correction rappelle la coordination avec les collègues et les autres services. Les deux affirmations vraies sont conservées.

Dans la manche 5 uniquement, l’interface appelle automatiquement la transition existante vers l’indice suivant après les réponses de toutes les équipes encore en recherche. Le bandeau et la commande manuelle sont retirés. Les jetons, les gains 20/15/10 et les révélations distinctes de la réponse et de la carte restent identiques. Portugal : « Destination mystère n° 2 » ; Roumanie : « Livraison urgente », sans château en Transylvanie dans le préambule. Le moteur partagé des manches 3 et 5 n’est pas modifié.

Les six corrections de la manche 6 placent la carte et la grande photo côte à côte sur ordinateur, puis les explications communes et la navigation, sans perdre les drapeaux, crédits ou informations sur la pollution. Sur mobile, les supports s’empilent. Les récapitulatifs détaillés de fin des six manches sont remplacés par des transitions courtes ; les données, gains, scores cumulés et pauses restent disponibles. Le grand final est conservé.

### Vérification

709 tests unitaires et dix suites navigateur : six manches, pauses métiers, jokers, final et corrections. Les tests des anciennes manches isolent explicitement leur stockage afin de conserver des parties indépendantes. Le nouveau test `ERGONOMICS_TEST_URL=http://127.0.0.1:8008 node tests/ergonomics.browser.cjs` vérifie clavier/accueil, sauvegarde et reprise d’un joker avant et après gain, synchronisation automatique, six positions persistantes du pion, absence de chevauchement avec les intitulés, reset et six photos aux formats 1920×1080, 1366×768, 1024×768, 390×844 et 320×640.

## Manche 1 — Saisie successive des livraisons

La manche s’ouvre directement sur Montpon-Ménestérol, sans introduction. Chaque livraison présente une seule question commune et les mêmes quatre départements/quatre numéros qu’auparavant, dans une zone de sélection unique.

Corail choisit, puis « Enregistrer la réponse » mémorise sa proposition sans points ni correction. Les sélections disparaissent pour la saisie de Sauge. Après les deux enregistrements, la validation commune ouvre la correction existante et attribue +5 par département correct et +5 par numéro correct. Les noms personnalisés et les couleurs restent utilisés. « Modifier » permet de reprendre une réponse avant correction ; la validation est alors suspendue jusqu’au nouvel enregistrement. Les sélections de l’autre équipe ne sont pas affichées. Les brouillons et enregistrements sont inclus dans la sauvegarde locale existante.

`apero.js` ajoute `entry`, `pick`, `record`, `edit`, `entryToken` et `entriesReady` ; le calcul des points et les résultats pédagogiques sont conservés. Les anciennes parties à l’étape d’introduction passent à la question ; les sélections déjà présentes sont reprises. Les corrections, cartes, photos et crédits restent inchangés.

Les actions de la manche 1 utilisent des boutons sobres, sans van. Le carnet utilise une icône de carte. Depuis chaque correction, « 🌶️ Jouer un piment » ouvre le système existant et reste facultatif ; « Livraison suivante » poursuit directement, sans écran intermédiaire. Après le piment, la continuation normale est exécutée une seule fois, y compris après rafraîchissement. La question du piment, ses deux modes, les deux piments par équipe, les quatre questions uniques et la limite d’une activation par intervalle sont inchangés.

Les seuls raccords partagés sont l’autorisation de `delivery-correction` dans `spicy.js`, les branches correspondantes de `spicy-ui.js` et l’exclusion des boutons de la manche 1 dans `ergonomics.js`. Les autres manches conservent leurs introductions, boutons et interludes.

Validation : 760 tests unitaires réussis, dont les 16 combinaisons de points des deux équipes pour chacune des trois livraisons, ainsi que modification, jetons périmés, sauvegarde/migration et joker unique depuis correction. Onze suites navigateur réussies : manche 1, cinq autres manches, métiers, jokers, finale, ergonomie et bandeaux. `APERO_TEST_URL=http://127.0.0.1:8008 node tests/apero.browser.cjs` vérifie la saisie successive privée, le retour au carnet, les éditions, les rafraîchissements avant/après joker, les points uniques et la reprise à Jonzac ou au bonus. Les trois questions sont testées sans défilement nécessaire pour répondre à 1920×1080, 1366×768 et 1024×768 ; l’absence de débordement horizontal est aussi vérifiée à 390×844 et 320×640. Dimensions simulées dans Chromium, sans vidéoprojecteur physique.

## Six présentations de manches

La branche `feat/transitions-manches`, issue de `main` au commit `294430d` après fusion de la refonte de la manche 6 (#32), ajoute un seul composant narratif avant le premier défi de chaque manche. Le carnet et les cinq pauses métiers gardent leurs chemins de navigation.

`round-transitions.js` porte les six titres, dialogues et références d’images ainsi que l’état de présentation. `round-transitions-ui.js` affiche le numéro de manche, le titre, l’héroïne, sa bulle et le seul bouton « EN ROUTE ! ». Ce bouton lance uniquement la manche choisie. Aucun score, logo, van de navigation ou animation imposée ne figure dans le composant.

Les six illustrations sont des variantes générées à partir de l’héroïne originale, conservée intacte. Elles se trouvent dans `assets/transitions/`, dans six fichiers indépendants : carte locale, cuisine, commandes, GPS à l’envers, carte d’identité et globe/valise. Voir `assets/transitions/README.md` pour la référence et les accessoires. Les images restent entières et un seul fichier est chargé par transition.

`game.roundTransitions` enregistre les présentations validées et l’éventuelle présentation en cours. Il ne modifie aucun moteur, score ou état de manche terminée. Un rechargement avant validation retrouve la présentation ; après validation, les nouvelles sauvegardes reprennent l’écran de manche réellement atteint. Les anciennes sauvegardes déjà engagées reprennent leur manche sans présentation ajoutée. Les sauvegardes de joker et les derniers piments gardent leur priorité de reprise. La consultation d’un voyage clôturé reste indépendante des présentations.

Vérifications :

- `node --test tests/*.test.cjs` : règles, états existants, présentations, migration et validation unique.
- `GAME_TEST_URL=http://127.0.0.1:8008 node tests/round-transitions.browser.cjs` : six titres/dialogues exacts, six images, démarrage de la bonne manche, rechargement avant/après validation, absence de répétition, camion, pauses, sauvegardes antérieures, grand final et consultation. Dimensions 1280 × 720 et 1366 × 768, sans défilement vertical.
- Les suites navigateur historiques des mécaniques peuvent se lancer avec `NODE_OPTIONS=--require=./tests/helpers/legacy-rounds.cjs`. Ce préchargement omet uniquement la nouvelle présentation, pour conserver leurs points d’entrée historiques ; il ne remplace ni les moteurs ni la sauvegarde. La suite des présentations ci-dessus s’exécute sans ce préchargement et couvre leur intégration réelle.

## Lot 1 — Harmonisation, règles et carnet

Branche `feat/lot-1-harmonisation`, issue de `main` au commit `86e1794` après fusion des six transitions (#33). Les moteurs, questions, barèmes, illustrations, transitions et mises en page des cartes restent conservés.

`ergonomics.js` applique deux composants de présentation aux boutons existants : `progress-action` pour avancer et `route-back` pour les accès au carnet. Les vans intégrés aux boutons sont retirés ; les retours affichent une petite carte et le libellé « Carnet de route ». Les éléments et leurs gestionnaires de clic restent les mêmes, y compris les chemins existants à la fin des pauses métiers. Les validations bonne/mauvaise réponse et les commandes cartographiques ne reçoivent pas le style de progression. Le grand final donne la priorité visuelle à « Nouvelle partie », avec « Revoir notre voyage » en action secondaire.

Les règles présentent les quatre blocs demandés avec pictogrammes et la phrase sur les casseroles. L’instruction obsolète de réponse écrite dans la manche 5 est également remplacée par l’annonce orale, sans modifier la question ni la validation.

Le carnet conserve son tracé, ses illustrations, ses six étapes et les coordonnées du camion. Cinq petites flèches suivent la chaussée dans l’ordre 01 → 06 ; le panneau entre 04 et 05 est orienté vers la gauche sur ordinateur. « PROCHAINE ESCALE » signale la première manche non terminée, à partir des phases existantes. Aucun nouvel état de progression n’est stocké et le repère disparaît après les six manches. Son placement à la dernière étape évite de se confondre avec l’étape 03.

Vérifications : `node --test tests/*.test.cjs`, `GAME_TEST_URL=http://127.0.0.1:8008 node tests/lot1.browser.cjs`, et la suite réelle des transitions. La suite du lot vérifie la grille 2 × 2, les textes, les boutons, les cinq pauses, le camion, le repère et les sauvegardes à 1280 × 720 et 1366 × 768. Les parcours navigateur historiques se relancent avec le préchargement `tests/helpers/legacy-rounds.cjs` documenté ci-dessus, sans remplacer les moteurs ou les sauvegardes.


## Lot 2 — Contenus, cartes et illustrations

Branche `feat/lot-2-contenus-visuels`, issue de `main` au commit `2e42263`. Le [compte rendu détaillé](docs/LOT2.md) précise les pages concernées, les nouvelles ressources, les vérifications géographiques et la formulation roumaine proposée à validation pédagogique.

Le lot intègre une retouche fidèle de l’accueil, les logos encadrant l’héroïne à la création des équipes, les accents pédagogiques rendus sans injection HTML, la comparaison géographique avant/depuis 2016, l’illustration de population, le schéma Garonne–Dordogne–Gironde et les cinq variantes professionnelles. Les six transitions et les harmonisations du lot 1 sont conservées.

Les quatre photographies demandées (Pyrénées, gâteau à la broche, Alpes, tartiflette) restent à fournir avec droits vérifiables. Elles ne sont remplacées ni par des images douteuses ni par des illustrations présentées comme des photographies. Le tracé interactif de la Garonne n’englobe pas l’estuaire ; il reste inchangé, comme les repères de validation, tandis que l’explication et le schéma clarifient la confluence au bec d’Ambès.

`node --test tests/*.test.cjs` et `GAME_TEST_URL=http://127.0.0.1:8008 node tests/lot2.browser.cjs` couvrent les changements, notamment les trois niveaux d’indices, l’absence de dévoilement anticipé, les cartes et les corrections, ainsi que les cinq métiers aux résolutions 1280 × 720 et 1366 × 768. Les suites réelles des transitions et du lot 1 se lancent sans préchargement ; les suites historiques utilisent le préchargement documenté `tests/helpers/legacy-rounds.cjs`.
