# Révision pédagogique des cinq pauses métiers

Branche : `feat/revision-pedagogique-pauses-metiers`, créée depuis le dernier `main` disponible, `690ad72` (PR #38 fusionnée). PR de livraison sans fusion automatique.

## Textes intégrés
Les quinze affirmations et les cinq corrections fournies ont été reprises sans reformulation ; l'ordre A/B/C est conservé. Les deux paragraphes de la correction Entretien hôtelier sont réunis dans le paragraphe existant, sans perte de texte.

| Métier | Idée reçue | Thème révisé |
| --- | --- | --- |
| Serveur / Serveuse | B | Mise en place de la salle et suivi des demandes des clients |
| Cuisinier / Cuisinière | C | Apprentissage progressif, au-delà des corvées d'épluchage |
| Réceptionniste | A | Réservations, facturation et suivi administratif |
| Entretien hôtelier | B | Possibilités d'évolution réelles mais non automatiques |
| Équipier polyvalent en restauration rapide | B | Polyvalence, y compris la préparation des produits |

En Entretien hôtelier, C porte désormais sur l'organisation du travail selon les départs et les arrivées : l'ancienne affirmation sur la coordination d'équipe a bien été remplacée. Les textes exacts validés servent aussi de référence de test dans [career-pedagogy.json](../../tests/fixtures/career-pedagogy.json).

Les bulles Serveur, Cuisine, Réception et Entretien ont été adaptées aux nouvelles corrections. Celle de la restauration rapide, déjà cohérente avec la polyvalence, est conservée. La première information complémentaire de Réception cite désormais les missions administratives. Aucune bulle ni explication n'est révélée avant le choix collectif et la révélation.

## Présentation et mécanismes
- Titre « Deux vérités, une idée reçue ! » inchangé.
- Nom complet du métier visible dans le contenu pour les cinq pauses ; les libellés courts de l'en-tête restent inchangés.
- Consigne visible avant sélection : « Quelle affirmation vous semble fausse ? Discutez-en avant de choisir ! » Elle disparaît après révélation pour laisser la place à la correction.
- Trois affirmations, deux vraies et une fausse, un seul choix collectif : aucune nouvelle étape, aucun formulaire ni validation supplémentaire.
- Fonctions `createPause`, `select` et `reveal`, indices B/C/A/B/B, navigation et format de sauvegarde inchangés. Aucun point ni joker ajouté ou retiré. Les anciennes réponses sauvegardées restent compatibles.
- Les styles compacts déjà utilisés pour l'Entretien hôtelier s'appliquent maintenant aux cinq pauses avec leur libellé visible. L'espacement avant la correction est réduit de 4 px au total pour faire tenir le texte le plus long à 1280 × 720, sans réduire la police des affirmations.

## Illustrations : état constaté dans main
Aucun fichier d'image, symbole, logo, ni `career-illustrations.js` n'a été modifié. Dans le `main` de départ, les cinq entrées `src` sont encore vides : le rendu réutilise donc le personnage de l'accueil via `#companion-art`. Les variantes professionnelles figurent dans la PR #35 non fusionnée ; cette révision pédagogique ne les remplace pas et ne reprend pas les autres modifications de cette PR. Le rendu conditionnel des variantes reste intact pour leur future intégration.

Les tests attendent le décodage du personnage avant les captures pour éviter une illustration temporairement vide. Les captures documentent bien le rendu actuel de `main`, pas des illustrations nouvelles ou supposées intégrées.

## Fichiers modifiés
- `careers.js` : affirmations, noms complets, corrections, bulles et un repère complémentaire de Réception ; moteur inchangé.
- `careers-ui.js` : libellé du métier sur les cinq pauses et visibilité de la consigne.
- `index.html` : consigne et emplacement dynamique du nom du métier.
- `styles.css` : commentaire du style commun et ajustement de 4 px des marges de correction.
- `tests/careers.test.cjs`, `tests/careers.browser.cjs`, `tests/startup-careers.browser.cjs` : contrôles de contenu et attentes d'affichage actualisées.
- `tests/careers-pedagogy.browser.cjs`, `tests/fixtures/career-pedagogy.json` : validation des textes approuvés, reprises et transitions.
- Ce dossier : bilan et vingt captures (cinq métiers × question/correction × deux résolutions).

## Tests effectués
- `node --test tests/*.test.cjs` : **860 tests réussis**, aucun échec. Le nouveau contrôle compare les quinze affirmations, cinq corrections et indices à la référence validée et vérifie le remplacement de C en Entretien hôtelier.
- `tests/careers-pedagogy.browser.cjs` : **réussi à 1366 × 768 et 1280 × 720** : affichage exact, noms, consigne, ordre A/B/C, absence de verdict/bulle/correction prématurés, réponses B/C/A/B/B, illustrations conservées, scores 85/70 et jokers 1/2 inchangés, sauvegarde avant et après révélation, cinq passages vers la manche suivante avec transitions réelles, aucun défilement.
- `tests/careers.browser.cjs` : **réussi**, quinze choix (bons et mauvais), cinq révélations, répétitions, clavier, scores/jokers et remise à zéro ; 1920, 1366, 1024, 390 et 320 px.
- `tests/startup-careers.browser.cjs` : **réussi**, cinq pauses, choix/corrections/navigation, reprise, scores et piments conservés sur cinq formats.
- `tests/ergonomie-integration.browser.cjs` : **réussi aux deux résolutions**, enchaînement Serveur → manche 2 → Cuisine → manche 3 → Réception, points uniques et sauvegarde.
- `tests/lot1.browser.cjs` : **réussi aux deux résolutions**, cinq pauses, navigation, règles, carnet, repère dynamique et sauvegarde.
- `tests/gps.browser.cjs` : **réussi aux deux résolutions**, manche 4 complète, pause Entretien, corrections et absence de défilement.
- Les scénarios historiques `careers`, `startup-careers`, `ergonomie-integration` et `gps` utilisent `tests/helpers/legacy-rounds.cjs` pour neutraliser uniquement les introductions de manches. Le test pédagogique et `lot1` vérifient les transitions réelles sans ce préchargement.
- `git diff --check` : réussi.

## Captures
Les fichiers suivent le format `pause-N-question-LARGEUR.png` et `pause-N-correction-LARGEUR.png`, N de 1 à 5 et LARGEUR 1366 ou 1280.

Exemples : [Service — question 1280](pause-1-question-1280.png), [Entretien — correction 1280](pause-4-correction-1280.png), [Restauration rapide — correction 1366](pause-5-correction-1366.png).

Aucun blocage de contenu. La seule limite constatée concerne les variantes professionnelles encore absentes de `main`, décrite ci-dessus.
