# Manche 2 — Indice commun et validations successives

La manche s’ouvre directement sur le premier indice. La continuation de la pause Serveuse ouvre maintenant la manche 2 ; les autres pauses conservent leur destination. Le carnet peut toujours ouvrir/reprendre la manche.

Un indice unique est affiché. La zone de validation passe à la première équipe encore en recherche, puis à l’autre. Les noms personnalisés sont conservés. Une réponse correcte donne 20, 15 ou 10 points selon l’indice et retire cette équipe des validations suivantes. Une erreur attend la réponse des autres équipes encore en recherche. Lorsque toutes ont répondu, l’indice avance automatiquement ; lorsque les recherches sont terminées, la correction s’affiche. Aucun formulaire de saisie, confirmation, écran d’attente ou bouton d’indice supplémentaire.

`SauceGame.respond(game, correct, stamp)` réutilise les fonctions de validation et de révélation existantes. `activeTeam` et `answerToken` exposent la prochaine validation autorisée. Les jetons refusent les actions répétées/périmées. Les réponses, les trois textes d’indices par spécialité, le barème et le stockage des résultats sont conservés. Les sauvegardes anciennes en introduction ou en attente d’indice sont reprises dans le nouveau parcours.

Les corrections gardent leur réponse, photographie, crédits, faits et carte d’Arcachon existants. Les cartes récapitulatives de points sont retirées, mais les résultats restent en mémoire et les scores cumulés restent visibles. Le piment facultatif se lance depuis la correction via le même moteur de jokers. Une seule activation par intervalle, deux piments par équipe, quatre questions uniques et deux modes inchangés. Après le piment, la continuation de l’énigme s’exécute une seule fois, y compris après actualisation. Les autres manches gardent leurs interludes.

Le Défi découverte conserve sa question sur la Nouvelle-Aquitaine, ses propositions, sa réponse A et ses explications. Sélection collective modifiable avant révélation, correction sur le même écran et aucun point. La fin marque la manche terminée puis ouvre directement la pause Cuisinier, sans bilan intermédiaire.

## Périmètre partagé

- `app.js` : libellés du bandeau de manche 2 uniquement.
- `careers-ui.js` : continuation de la pause Serveuse vers la manche 2 uniquement.
- `ergonomics.js` : exclusion des boutons de manche 2 du van automatique et ajout de l’icône de carte aux retours de cette manche.
- `spicy.js` / `spicy-ui.js` : autorisation du lancement depuis `sauce-correction` et continuation correspondante. Aucun nouveau moteur de jokers.
- `final-ui.js` : retrait des deux références de réinitialisation devenues inutiles après suppression des confirmations de manche 2. Le grand final et ses autres nettoyages sont inchangés.

Les derniers changements de manche 1 (PR #25) sont inclus via la mise à jour depuis main. Aucune refonte de manche 3 ni modification des contenus des autres activités. Aucun fichier graphique, cartographique ou photographique n’est modifié.

## Vérifications

813 tests unitaires réussis, dont les 16 combinaisons de niveaux de réussite des deux équipes pour chacune des trois énigmes, les points uniques, les jetons périmés et la reprise entre validations.

Douze suites navigateur réussies : manche 2, cinq autres manches, jokers, cinq pauses métiers, démarrage/pauses, finale, bandeaux et contrôle visuel de manche 1. Dans la manche 2, cinq scénarios sont exécutés avec les boutons réels pour chacune des trois spécialités : deux réussites à l’indice 1, réussite à l’indice 1 puis au 2 ou au 3, une équipe ne trouvant jamais, deux échecs aux trois indices. Rafraîchissement entre réponses et pendant/après un joker, absence de double gain, photos/crédits, Défi découverte sans points et continuation vers cuisine vérifiés.

Formats Chromium : 1920×1080, 1366×768, 1024×768, 390×844 et 320×640. Contrôles, correction et fin du Défi découverte visibles sans défilement nécessaire sur ordinateur ; absence de débordement horizontal sur mobile. Les essais simulent les dimensions, sans matériel physique.
