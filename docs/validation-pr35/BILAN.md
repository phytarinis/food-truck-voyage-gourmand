# Mise à jour et sécurisation de la PR #35

Branche existante : `feat/lot-2-contenus-visuels`. Mise à jour par fusion de `main` **dans cette branche**, sans réécriture de l'historique et sans fusion de la PR dans `main`.

- Tête initiale PR #35 : `ff0b58f79a26220d364833837ec62a00ac2fccc5`.
- `main` intégré : `930bcfc88135b9c670e5f07d387fff5de0988724`, incluant la PR #39 et les correctifs précédents (#36, #37, #38).

## Conflits résolus

| Fichier | Résolution |
| --- | --- |
| `careers-ui.js` | Rendu de `main` conservé : nom complet du métier, nouvelle consigne et corrections de la PR #39. Le chargement des cinq images du lot 2 reste assuré par `career-illustrations.js`, inchangé. |
| `gps.js` | Version de `main` conservée **à l'octet près** : carte hydrographique, positions libres, détection, compatibilité des sauvegardes et attribution unique des points. |
| `gps-ui.js` | Interactions et texte hydrographique de `main` conservés ; accents colorés, mentions culinaires des massifs et schéma collectif du lot 2 préservés dans le rendu. Les données du moteur ne sont pas modifiées par ces mentions. |
| `styles.css` | Conservation des deux ensembles : styles du carnet et de l'hydrographie de `main`, ajouts visuels du lot 2 et portraits professionnels. Ajustement local de la marge des actions métiers pour faire tenir la correction la plus longue à 1280 × 720. Aucune réduction des textes ou de leurs polices. |
| `assets/maps/ATTRIBUTION.md` | Conservation des attributions du comparatif régional et du schéma du lot 2 **et** des sources de la nouvelle hydrographie. |
| `tests/startup-careers.browser.cjs` | Consigne validée de la PR #39 et en-tête compact du lot 2. |

Les autres fichiers de `main` ont été intégrés normalement. En particulier, `careers.js` et la référence `tests/fixtures/career-pedagogy.json` sont identiques à `main` : aucune des quinze affirmations ni des cinq corrections validées n'a été remplacée. Les indices restent **B / C / A / B / B**, les bulles actualisées de la PR #39 restent présentes, et C en Entretien porte bien sur l'organisation des départs/arrivées.

## Contrôles d'intégrité

Résultats détaillés : [INTEGRITE.json](INTEGRITE.json). Audit reproductible depuis la racine :

```sh
node tools/audit-pr35-integration.cjs
```

- **51 fichiers et données cartographiques identiques à `main`**, notamment `careers.js`, la référence des textes approuvés, les moteurs de jeu/piments/GPS, les sauvegardes, le grand final, les cartes vectorielles et leurs sources.
- **130 fonctions moteur identiques** dans les dix modules de jeu. Les fonctions de calcul et de validation ne sont pas modifiées ; les barèmes exportés sont également vérifiés.
- **Cinq illustrations professionnelles identiques à la PR #35 d'origine**, vérifiées par SHA-256 : service, cuisine, réception, entretien hôtelier, restauration rapide.
- **Quinze autres ressources/améliorations du lot 2 identiques à l'origine**, dont l'accueil retouché, le groupe de population, le comparatif régional, le schéma collectif, les références des portraits, les accents pédagogiques et les contenus spécifiques de Roumanie et du monde.

## Fichiers ajustés pour cette réconciliation

En plus des six fichiers en conflit :

- `tests/gps.browser.cjs`, `tests/passport.browser.cjs`, `tests/ergonomics.browser.cjs` : attentes désormais conformes aux noms et textes de la PR #39. L'ancienne assertion « toujours seul » et son ancienne correction sont remplacées par la référence approuvée ; le contenu du jeu n'a pas été modifié pour satisfaire un ancien test.
- `tests/lot2.browser.cjs` : nom métier validé, tout en vérifiant les portraits professionnels.
- `tests/lot2.test.cjs` : contrôle de l'hydrographie actuelle, au lieu d'exiger l'ancien tracé incomplet. Vérifie aussi le schéma collectif et les repères internes compatibles avec les anciennes sauvegardes.
- `tests/careers-pedagogy.browser.cjs`, `tests/gps-hydrography.browser.cjs` : répertoire de captures configurable, pour conserver intactes les captures historiques des PR #38/#39.
- `docs/LOT2.md`, ce dossier et `tools/audit-pr35-integration.cjs` : compte rendu actualisé et preuves de conservation.

Le détail des contenus propres au lot 2 reste dans [LOT2.md](../LOT2.md). Les quatre photographies géographiques/culinaires déjà signalées comme manquantes dans ce lot restent hors de cette mise à jour ; aucune nouvelle image supposée photographique n'a été ajoutée.

## Tests et contrôles visuels

- `node --test tests/*.test.cjs` : **864 tests réussis, aucun échec**.
- **30 scripts navigateur réussis, aucun échec restant** : [résultats consolidés](TESTS_NAVIGATEUR.json).
- Sept scripts s'exécutent sans préchargement : `lot1`, `lot2`, `round-transitions`, `careers-pedagogy`, `carnet-layout`, `gps-hydrography`, `targeted-lot2`.
- Les 23 scénarios historiques utilisent `tests/helpers/legacy-rounds.cjs`, qui neutralise uniquement les présentations de manches pour leur scénario historique ; aucun moteur ni stockage n'est remplacé.
- Les contrôles couvrent les six manches, les drapeaux et cartes, les dépôts souris/tactile/clavier, la confidentialité, les points uniques, les deux modes de piment, les sauvegardes/reprises, les cinq pauses métiers et leurs transitions, le carnet et le grand final.
- **1366 × 768 et 1280 × 720** : cinq métiers illustrés, quinze affirmations exactes, cinq corrections complètes, nouvelle consigne, nom du métier, verdicts uniquement après révélation, scores/jokers inchangés, actions essentielles sans défilement. Le lot 2 vérifie aussi les indices, corrections, population, comparatif régional et schéma collectif aux deux résolutions.
- Les suites historiques contrôlent également 1920, 1024, 390 et 320 px.
- Des attentes obsolètes et un débordement de moins de quelques pixels ont été détectés au premier passage ; ils ont été corrigés, puis les cinq scripts concernés ont été relancés avec succès.
- `git diff --check` et absence de marqueurs de conflit : vérifiés.

Captures : [cinq métiers — questions et corrections](metiers/), [hydrographie](hydrographie/). Exemples : [Service, question à 1366](metiers/pause-1-question-1366.png), [Entretien, correction à 1280](metiers/pause-4-correction-1280.png), [Restauration rapide, correction à 1366](metiers/pause-5-correction-1366.png).

La mise à jour est proposée pour validation dans la PR #35 ; aucune fusion automatique n'est activée ou effectuée.
