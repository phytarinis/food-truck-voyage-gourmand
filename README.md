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
- Carnet des six manches : « L’apéro local » et « À quelle sauce ? » sont jouables en cliquant sur leurs noms. Les manches 3 à 6 restent « À venir ». La démo est indépendante.
- Démonstration : trois indices, une tentative par équipe à chaque indice. Le formateur valide la réponse orale. Les deux échecs ouvrent l’indice suivant ; une réussite termine le défi et attribue les points. Après six échecs, personne ne marque.
- L’équipe 1 commence la première démonstration. L’équipe de départ alterne à chaque nouvelle démonstration ; elle commence aussi chaque indice de ce défi. Rejouer conserve les scores.
- Correction et bouton de réinitialisation avec confirmation. Les données restent en mémoire : recharger ou fermer la page efface la partie.

Les jokers sont des compteurs visuels, sans action. Les manches 3 à 6 ne sont pas développées. L’illustration d’accueil validée est conservée ; les trois logos partenaires sont intégrés dans l’en-tête. Rien n’est publié automatiquement.

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

Le parcours comprend maintenant : accueil → équipes → règles → carnet de route → démonstration → correction. Les règles présentent les futurs « Plats piégés » et leur barème provisoire ; aucun joker ni nouvelle question n’est activé.

Le personnage et le camion des pages intérieures sont des vignettes SVG réutilisant l’image d’accueil validée, sans modification de ce fichier. `assets/frites.svg` illustre la correction. Le carnet relie les six escales. `renderRoute({ current, completed })` dans `app.js` affiche les états (indices de manches de 0 à 5) et la position du camion ; les manches 1 et 2 font progresser cet itinéraire. La démo ne change pas l’état des manches.


## Manche 1 — L’apéro local

Le nom « L’apéro local » sur le plateau ouvre la manche : introduction, Montpon-Ménestérol, Jonzac, Barbezieux-Saint-Hilaire, bonus sans points puis bilan. Les deux équipes répondent simultanément, sans indices ni alternance. Les quatre départements et les quatre numéros restent visibles dans chaque espace de réponse. La correction exige les quatre choix (deux par équipe).

`apero.js` contient les livraisons et les règles ; `apero-ui.js` gère les nouveaux écrans. Chaque bonne composante vaut 5 points, indépendamment de l’autre ; maximum 30 points par équipe. Une validation fige la correction et attribue les points une seule fois. Reprendre une question conserve les choix ; reprendre une correction ou un bilan ne modifie pas les scores. Le bonus ne modifie jamais les scores. La manche terminée ne peut pas être recommencée sans réinitialiser la partie. Recharger la page efface toujours toute la partie, comme auparavant.

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

Aucune déclinaison de tenue n’est disponible dans les ressources validées : le même compagnon de l’accueil est donc réutilisé fidèlement, sans fabriquer de nouveaux personnages ou de tenues approximatives. `career-illustrations.js` prévoit cinq emplacements `src` pour des illustrations approuvées : service avec plateau, cuisine, réception, entretien et restauration rapide. Tant que `src` est vide, le SVG reprend exactement le personnage de l’accueil. Pour intégrer un visuel validé, renseigner seulement son chemin local et son texte alternatif dans cette configuration.

Logos officiels utilisés dans l’en-tête :
- `assets/Logo sans fond.png` — Labo Épicé, PNG RGBA 500×500.
- `assets/Logo_AFEPT-removebg-preview.png` — AFEPT transparent, PNG RGBA 696×359.
- `assets/Copie de Gironde_1 (1).png` — E2C Gironde, PNG RGBA 2363×2363, accompagné de la mention « Site de Coutras ».

Les fichiers des logos restent intacts. Les viewports SVG retirent uniquement l’excès de marge transparente pour les afficher à une taille lisible, sans redessiner ni déformer les marques. Le logo AFEPT transparent est repris de main sans remplacer les autres modifications de la branche. L’illustration d’accueil reste inchangée.


## Manche 2 — À quelle sauce ?

Depuis la deuxième escale : introduction → trois énigmes (foie gras, chocolatine/pain au chocolat, huîtres) → bonus Nouvelle-Aquitaine → bilan → pause métier cuisine → carnet. Chaque équipe transmet ses réponses par écrit au formateur ; aucun champ de spécialité n’est affiché à l’écran. Les deux appellations de la viennoiserie sont acceptées par le formateur.

`sauce.js` gère un indice commun et des réponses propres à chaque équipe. Une erreur aux indices 1 ou 2 enregistre la réponse et met l’équipe en attente, sans changer l’indice. « Dévoiler l’indice suivant » apparaît seulement quand chaque équipe a répondu ou a déjà trouvé ; le formateur déclenche alors la révélation commune. Une équipe ayant trouvé conserve ses points et ne répond plus, tandis que l’autre peut poursuivre seule. La troisième erreur termine sa recherche à zéro. Une réussite attribue 20, 15 ou 10 points selon l’indice commun, une seule fois. La correction attend la fin des deux recherches. Maximum : 60 points par équipe sur cette manche, ajoutés aux scores généraux.

Chaque bouton de validation ouvre une confirmation annulable. Un jeton propre au jeu, à l’énigme, à l’indice commun, à l’équipe et à son état refuse les confirmations répétées ou périmées. Un second jeton protège la révélation commune contre les clics répétés. Une équipe en attente ne peut pas répondre une deuxième fois au même indice. Les validations n’affectent ni la réponse de l’autre équipe ni les jokers. Revenir au carnet puis reprendre la manche conserve les indices et les résultats, sans réattribuer les points. La réinitialisation et le rechargement effacent la partie, comme auparavant.

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

Le maximum de cette manche est donc de 75 points par équipe, ajoutés aux scores cumulés. Les jetons empêchent les confirmations et validations périmées ; les transitions et la révélation géographique sont protégées contre les répétitions. Revenir au carnet puis reprendre conserve la phase et les choix, y compris le masquage du drapeau corail. Le rechargement et la réinitialisation effacent la partie, comme auparavant.

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

Maximum : 45 points par équipe. Le bonus collectif B (un fleuve se jette dans la mer ou l’océan, une rivière dans un autre cours d’eau) ne modifie ni scores ni jokers. Le bilan détaille les trois défis et le score cumulé. La réinitialisation et le rechargement effacent la partie, comme auparavant.

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
