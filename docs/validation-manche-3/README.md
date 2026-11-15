# Manche 3 : parcours et présentation simplifiés

Branche dédiée : `feat/manche-3-ergonomie`, issue de `main` (`d0dc314`, PR accueil/carnet déjà fusionnée).

## Changements

- Entrée directe dans la première recherche, notamment après la pause Cuisinier.
- Un seul indice commun et une seule paire de commandes ; réponses successives avec les noms personnalisés, exclusion des équipes ayant trouvé, progression automatique quand toutes les réponses attendues sont enregistrées.
- Suppression des confirmations et protection contre les doubles clics / décisions périmées. Le moteur partagé des indices et des drapeaux n’est pas modifié.
- Révélation du plat avec sa photo et ses crédits, sans résultats détaillés ni région ajoutée par l’interface. La photo de choucroute comporte un panneau « d’Alsace » : seul son affichage est recadré sur le plat pour masquer cette indication. Le crédit signale ce recadrage ; le fichier original est intact. Galette et rougail restent affichés entiers.
- Après révélation géographique, carte et deux drapeaux conservés ; informations culturelles dans le panneau latéral, sans page « La petite histoire ».
- Piment facultatif sur cette correction, sans écran intermédiaire. Règles, questions, dépenses et points inchangés.
- Défi découverte sur un seul écran, sans points, puis accès direct à Réceptionniste. Fin de manche, scores et progression enregistrés.
- En-têtes compacts et boutons sobres, avec icône de carte pour le carnet.

## Périmètre technique

Présentation de la manche : `france-ui.js`, section manche 3 de `index.html`, styles limités à `.france-screen` / `.france-mode`.

Adaptations partagées limitées à son intégration :

- `app.js` : contexte d’en-tête et classe de présentation.
- `careers-ui.js` : sortie de Cuisinier vers la manche 3, hors consultation de fin de jeu.
- `ergonomics.js` : boutons de la manche 3 sans van, icône de carte.
- `spicy.js`, `spicy-ui.js` : autorisation et reprise du piment depuis la correction intégrée, sans toucher à ses barèmes ni aux autres parcours.
- `final-ui.js` : suppression de deux références devenues obsolètes dans le gestionnaire partagé de réinitialisation ; séquence finale inchangée.

Aucune modification de `france.js`, `clue-flags.js`, des données cartographiques, des photos originales ou des contenus des autres manches.

## Vérifications

**767 tests unitaires réussis**, dont trois contrôles supplémentaires de l’accès au piment depuis la correction intégrée.

Parcours Chromium :

- Trois spécialités × cinq scénarios × deux formats : les deux équipes trouvent à l’indice 1 ; l’une à l’indice 1 et l’autre à l’indice 2 ; une seule trouve ; aucune ne trouve ; les deux trouvent à l’indice 3.
- Photo et crédits dès la révélation, absence d’information régionale ajoutée à cette étape, absence des crédits des futures spécialités.
- Clic géographique sur les 18 régions, choix au clavier, masquage du premier drapeau, révélation simultanée, séparation de deux drapeaux dans la même région.
- +5 de localisation attribués une seule fois, avec choix correct et incorrect ; conservation des 20 / 15 / 10 points, aucune pénalité ajoutée.
- Double clic et ancienne décision refusés ; reprise après actualisation pendant la recherche, la révélation du plat, les placements, la correction et le Défi découverte.
- Défi découverte : changement de sélection, révélation sur place, source Insee et zéro point ; sortie directe vers Réceptionniste et camion à l’étape 3 après rechargement.
- Piment facultatif : annulation, modes personnel et défi, actualisation pendant la question et sa correction, dépense unique et reprise exacte à la spécialité suivante.
- Aucun défilement des écrans essentiels en **1366 × 768** et **1280 × 720**. Contrôle horizontal complémentaire à 1024, 390 et 320 px.
- Régressions vérifiées : trois livraisons de la manche 1, parcours manche 2, cinq pauses métiers, démarrage et bandeaux, six reprises après piment et finale. Les tests des transitions attendues ont été adaptés à la sortie directe de Cuisinier vers la manche 3.

Tests dans Chromium aux dimensions demandées ; pas de vérification sur vidéoprojecteur physique.

## Captures

| Écran | 1366 × 768 | 1280 × 720 |
|---|---|---|
| Indice commun | [Capture](france-indice-1366.png) | [Capture](france-indice-1280.png) |
| Plat et photographie | [Capture](france-plat-1366.png) | [Capture](france-plat-1280.png) |
| Carte et découverte culturelle | [Capture](france-correction-1366.png) | [Capture](france-correction-1280.png) |
