# Résolution des conflits entre les refontes des manches 2 et 3

Vérification du 16 novembre 2026.

## Diagnostic

La PR nº 28 (manche 3, commit `102df0e`) était déjà fusionnée dans `main` au démarrage de cette intervention : `10cb36b`. La branche de manche 3 et ce `main` avaient le même contenu.

Les conflits reproductibles concernaient la PR nº 26, branche `feat/manche-2-ergonomie` (`6726c21`), issue d’un main plus ancien (`c732ab9`). Les deux refontes avaient modifié les mêmes composants partagés.

Le dernier main a été intégré à **cette branche existante** par un commit de fusion, sans réécrire son historique ni fusionner la PR dans main.

## Résolutions

| Fichier | Combinaison retenue |
|---|---|
| `careers-ui.js` | Serveuse → manche 2 et Cuisinier → manche 3 ; autres pauses et consultation finale conservées. |
| `ergonomics.js` (nom réel, en minuscules) | Boutons sobres et icônes de carte des trois premières manches conservés. |
| `final-ui.js` | Nettoyage des anciennes variables de confirmation supprimées dans les deux refontes ; réinitialisation et finale conservées. |
| `index.html` | Écrans simplifiés des deux manches conservés, sans réintroduire leurs anciennes introductions ou bilans ; nouvel accueil et carnet de main conservés. |
| `spicy-ui.js` | Accès, annulation, sauvegarde et reprise des piments dans les corrections des manches 2 **et** 3. |
| `spicy.js` | Deux contextes de correction autorisés avec leurs gardes respectives ; limites, questions et barèmes inchangés. |
| `styles.css` | Styles propres à la manche 2, au carnet et à la manche 3 conservés ensemble. Aucun nouveau dessin ni changement graphique ajouté. |
| `tests/sauce.browser.cjs` | Parcours de la manche 2 refondue conservé ; contrôle 1280 × 720 ajouté aux formats existants. |
| `tests/spicy.browser.cjs` | Vérification des deux corrections intégrées, en plus des quatre autres manches. |
| `tests/startup-careers.browser.cjs` | Attentes combinées pour Serveuse et Cuisinier. |

Les autres fichiers fusionnés automatiquement ont été contrôlés. Les fichiers de la manche 3, les moteurs/cartes des manches 4 à 6 et la persistance restent identiques à main. Tous les fichiers et ressources existants sont conservés.

## Validation

- **816 tests unitaires réussis.**
- **15 parcours/suites navigateur réussis** : manche 1 (correction directe), manche 2, manche 3, piments de manche 3, GPS, Passeport, Tour du monde, jokers globaux, grand final, pauses métiers, démarrage, bandeaux, ergonomie, accueil/carnet et intégration des refontes.
- Manche 3 : trois spécialités × cinq scénarios en 1366 × 768 et 1280 × 720, photos/crédits, anonymat des placements, carte et culture sur le même écran, points uniques, reprise et sortie vers Réceptionniste.
- Manche 2 : indices partagés, validations successives, scores, photos, bonus et reprise après joker, dont 1366 × 768 et 1280 × 720.
- Intégration 1366 × 768 et 1280 × 720 : Serveuse → manche 2 → Cuisinier → manche 3 → Réceptionniste ; cumul final **165 points par équipe**, deux piments préservés, résultats antérieurs intacts et camion à l’étape 3 après actualisation.
- Les suites des manches 4 à 6 et des jokers contrôlent les drapeaux masqués, révélations, points uniques, sauvegardes et reprises.
- Aucun marqueur de conflit ni fichier non résolu après résolution.

Tests exécutés dans Chromium aux dimensions demandées, sans vidéoprojecteur physique.

## GitHub

PR existante : https://github.com/phytarinis/food-truck-voyage-gourmand/pull/26

Le push Git met à jour cette PR. L’API GitHub renvoie toujours `Forbidden` : la lecture de son statut détaillé et l’édition automatique de sa description restent indisponibles. Aucune nouvelle PR nécessaire. Ouvrir la PR nº 26 pour vérifier le déploiement et les contrôles, puis valider manuellement la fusion si souhaité.

Aucune écriture ni fusion effectuée sur `main` par cette intervention.
