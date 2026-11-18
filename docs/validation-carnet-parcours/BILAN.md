# Carnet de route : parcours 01 → 06

Branche : `fix/carnet-parcours-lisible`, créée depuis le dernier `origin/main` disponible, `2e422630bcb9a4b4a76063991d497cf7109f1cd3`.

## Modification
Le titre de l'étape 06 était séparé de son numéro et remontait près de l'étape 04. Chaque étape possède maintenant un cartouche unique regroupant numéro, titre et état. « 06 — Tour du monde » occupe la dernière portion de la route, sous les étapes 04 et 05, sans chevauchement.

Le tracé sinueux existant permet cette clarification sans changer les virages : il est conservé, comme le paysage, la palette, les illustrations, le camion et les liens des six manches. Trois flèches sont replacées dans les espaces entre étapes. Les décorations et les coordonnées d'affichage du camion sont ajustées autour des nouveaux cartouches. La règle de progression du camion reste inchangée : seules les manches terminées le font avancer. Les états, le repère dynamique « PROCHAINE ESCALE » et la sauvegarde sont conservés. Les seuls changements JavaScript concernent les coordonnées d'affichage du camion ; aucun moteur de manche ni barème n'est modifié.

## Captures à valider
Les captures utilisent deux équipes de démonstration et une progression simulée pour rendre les états visibles :
- [1366 × 768 — départ](carnet-1366-depart.png)
- [1366 × 768 — prochaine escale 06](carnet-1366-escale-06.png)
- [1280 × 720 — départ](carnet-1280-depart.png)
- [1280 × 720 — prochaine escale 06](carnet-1280-escale-06.png)

## Tests effectués
- `node --test tests/*.test.cjs` : **830 tests réussis**, aucun échec.
- `GAME_TEST_URL=http://127.0.0.1:8020 node tests/carnet-layout.browser.cjs` : réussi à **1366 × 768 et 1280 × 720**. Vérifie les sept états (0 à 6 manches terminées), les six cartouches contenus dans la carte, aucun chevauchement entre cartouches ou avec le camion, association numéro/titre, séparation de 06, prochaine escale, reprise après actualisation, absence de déplacement du camion lors d'un simple changement de manche, état « En cours », six liens au clavier avec démarrage réel des transitions et absence de défilement horizontal/vertical. Un premier passage a détecté une collision du camion à l'arrivée ; les coordonnées ont été corrigées puis tous les états ont été retestés aux deux résolutions.
- `GAME_TEST_URL=http://127.0.0.1:8020 node tests/lot1.browser.cjs` : réussi aux deux résolutions ; repère dynamique sans collision, sauvegarde, pauses métier, navigation et camion inchangés lors d'un défi intermédiaire.
- `GAME_TEST_URL=http://127.0.0.1:8020 node tests/round-transitions.browser.cjs` : réussi aux deux résolutions ; six présentations, démarrage exact, sauvegarde, pauses, migration, grand final et consultation préservés.
- `GAME_TEST_URL=http://127.0.0.1:8020 NODE_OPTIONS=--require=./tests/helpers/legacy-rounds.cjs node tests/accueil-carnet.browser.cjs` : réussi aux deux résolutions ; accès clavier/souris, six étapes visibles, progression sauvegardée, scores et piments préservés. Le préchargement neutralise les seules introductions de manches pour ce scénario historique ; les transitions réelles sont vérifiées séparément ci-dessus.
- `git diff --check` : réussi.

La branche est livrée pour validation visuelle, sans fusion automatique dans `main`.
