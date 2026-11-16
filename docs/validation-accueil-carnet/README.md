# Accueil, carnet et finitions de la manche 1

Base : main `61f63a9`. La branche de refonte de la manche 2 reste séparée.

- Nouvelle illustration d’accueil : `assets/Le grand voyage gourmand en van.png`, intacte. Anciennes ressources conservées. Zone transparente EN ROUTE recalée et utilisable au clavier.
- Manche 1 : consigne répétée supprimée ; la troisième correction propose « Défi découverte ». Aucun changement des calculs ou transitions.
- Carnet : titres répétitifs supprimés, plateau proportionné, démonstration retirée de l’interface et de ses commandes. Tracé, étapes, illustrations et progression conservés.
- Nettoyage des références au bouton démo dans les accès partagés ; une ancienne sauvegarde abandonne seulement la démo interrompue, sans changer les scores.

## Vérifications

764 tests unitaires réussis.

Parcours navigateur Chromium :

- Trois livraisons, réponses correctes, incorrectes et partielles, correction immédiate, rafraîchissement et double clic sans double attribution ; bouton vers le Défi découverte.
- Accueil à la souris et au clavier, carnet sans défilement à 1366 × 768 et 1280 × 720, six boutons visibles, six positions successives conservées après rechargement, scores et piments conservés.
- Défi découverte : sélection, changement, révélation, zéro point, carte et sauvegarde.
- Régressions ergonomie et manche 1 sur cinq formats ; bandeaux sur quatre formats.
- Jokers : six reprises de manches, modes, dépenses, clôture et réinitialisation ; finale sur cinq formats.

Les contrôles sont exécutés dans Chromium avec les dimensions Chromebook / projection ; aucun matériel de vidéoprojection physique utilisé.

Captures 1366 × 768 : [accueil](accueil-1366.png) et [carnet](carnet-1366.png).
