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
- Carnet des six manches : « L’apéro local » est jouable en cliquant sur son nom. Les manches 2 à 6 restent « À venir ». La démo est indépendante.
- Démonstration : trois indices, une tentative par équipe à chaque indice. Le formateur valide la réponse orale. Les deux échecs ouvrent l’indice suivant ; une réussite termine le défi et attribue les points. Après six échecs, personne ne marque.
- L’équipe 1 commence la première démonstration. L’équipe de départ alterne à chaque nouvelle démonstration ; elle commence aussi chaque indice de ce défi. Rejouer conserve les scores.
- Correction et bouton de réinitialisation avec confirmation. Les données restent en mémoire : recharger ou fermer la page efface la partie.

Les jokers sont des compteurs visuels, sans action. Les manches 2 à 6 ne sont pas développées. L’illustration d’accueil validée est conservée ; les logos officiels seront intégrés ultérieurement. Rien n’est publié automatiquement.

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

Le personnage et le camion des pages intérieures sont des vignettes SVG réutilisant l’image d’accueil validée, sans modification de ce fichier. `assets/frites.svg` illustre la correction. Le carnet relie les six escales. `renderRoute({ current, completed })` dans `app.js` affiche les états (indices de manches de 0 à 5) et la position du camion ; seule la manche 1 fait progresser cet itinéraire. La démo ne change pas l’état des manches.


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
