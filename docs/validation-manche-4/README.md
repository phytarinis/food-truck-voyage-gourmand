# Manche 4 — refonte ergonomique du GPS

Branche dédiée `feat/manche-4-ergonomie`, créée depuis main `0a52edf`, contenant les refontes des manches 2 et 3 ainsi que leur résolution de conflits.

## Parcours conservé et simplifié

- Entrée directe dans « Mais où sont passées les Pyrénées ? ».
- En-tête compact « MANCHE 04 / DÉFI X SUR 3 », question principale et carte sans titre de manche redondant.
- Placements successifs avec masquage du choix corail pendant le tour sauge. Après la seconde validation, correction géographique et deux propositions apparaissent immédiatement, sans bouton de révélation.
- Scores cumulés conservés dans le bandeau, sans détail des gains répété dans la correction. Les règles restent identiques : 15 points pour chaque massif, 5 par fleuve correct, 45 points maximum par équipe.
- Même pictogramme de montagne pour les Pyrénées et les Alpes ; disparition du camion en tant qu’objet à déplacer aux Alpes. Zones, tolérances, coordonnées et interactions inchangées.
- Chronomètres conservés : 45 secondes pour les fleuves, 30 pour les Alpes, démarrage du tour sauge et absence de pénalité à expiration inchangés.
- Piment facultatif directement sur chaque correction, sans interlude. Reprise au défi suivant ou au Défi découverte après les Alpes ; les limites et modes du joker restent inchangés.
- **À la demande confirmée de l’utilisateur, la question collective « Quelle est la différence entre un fleuve et une rivière ? » est conservée**, sans points. Après sa révélation, « Terminer la manche » conduit directement à Entretien hôtelier, sans bilan intermédiaire.
- La pause 4 affiche « PAUSE MÉTIER 4 — ENTRETIEN HÔTELIER » près du titre. Ses trois propositions et l’idée reçue B sont conservées.

Les aides et les répliques existantes du personnage restent accessibles dans le volet d’aide à la manipulation pour libérer la place autour de la carte.

## Fichiers concernés

- `gps-ui.js` : transitions automatiques, pion montagne, corrections et fin directe.
- `gps.js` : uniquement la consigne des Alpes ; moteur des points, timers et validations intact.
- `index.html`, `styles.css` : présentation de la manche 4, retrait de ses écrans obsolètes, libellé et espacements de la seule pause Entretien hôtelier.
- `app.js` : contexte d’en-tête et classe de présentation propres à la manche 4.
- `careers-ui.js` : affichage conditionnel du libellé pour la seule pause 4.
- `ergonomics.js` : boutons GPS sans illustration de van, icône de carte.
- `spicy.js`, `spicy-ui.js` : autorisation et reprise depuis la correction GPS, sans changement des règles des jokers ni des autres manches.
- Tests navigateur GPS, piments et pauses ; tests unitaires du nouveau contexte de joker.

Aucune modification des fichiers des manches 1, 2, 3, 5 et 6, de leurs données, du grand final, des cartes ou de la persistance.

## Tests

**819 tests unitaires réussis.**

Parcours GPS complets aux résolutions **1366 × 768 et 1280 × 720** :

- Trois défis dans l’ordre, déplacements réels à la souris, dépôts sur les tracés des fleuves, permutation des étiquettes sur une zone occupée et alternative clavier.
- Première proposition masquée, affichage simultané après les deux validations, correction immédiate, deux montagnes proches séparées visuellement.
- Réponses correctes, incorrectes et partielles : scores finaux de test **45 / 20**, conservés après actualisation et sans nouvelle attribution sur une ancienne commande.
- Chronomètres, expiration sans pénalité, démarrage du second tour et reprise après actualisation.
- Aucun défilement vertical des cartes, corrections, Défi découverte ou pause Entretien hôtelier, avant et après révélation ; ordre clavier de la correction vers le piment puis le défi suivant.
- Défi découverte collectif sans points, maintien de la réponse B, enregistrement de la manche terminée et camion à l’étape 4 après rechargement.

Piments GPS : annulation, interdiction au milieu d’un placement, modes personnel et défi, sauvegarde pendant la question et sa correction, dépense unique et reprise exacte au défi suivant.

Non-régression : trois livraisons de la manche 1 ; parcours refondus des manches 2 et 3 ; Passeport et Tour du monde ; reprises après joker dans les six manches ; grand final ; cinq pauses métiers, démarrage et bandeaux. Aucun changement des barèmes existants.

Tests dans Chromium aux dimensions demandées, sans vidéoprojecteur physique.

## Captures

| Écran | 1366 × 768 | 1280 × 720 |
|---|---|---|
| Pyrénées | [Capture](gps-ergonomie-pyrenees-1366.png) | [Capture](gps-ergonomie-pyrenees-1280.png) |
| Correction des fleuves | [Capture](gps-ergonomie-fleuves-1366.png) | [Capture](gps-ergonomie-fleuves-1280.png) |
| Correction des Alpes | [Capture](gps-ergonomie-alpes-1366.png) | [Capture](gps-ergonomie-alpes-1280.png) |

[Entretien hôtelier : correction avec intitulé de métier visible, en 1280 × 720](gps-entretien-1280.png).

Aucune fusion automatique dans main.
