# Manche 4 — remplacement de la carte des fleuves

Branche dédiée : `feat/manche-4-carte-hydrographique`, issue de `main`, actualisée sur `c70b40e` (fusion de la PR #37). Aucune fusion automatique.

## Réalisé
- Six cours d'eau vectoriels : Seine, Loire, Garonne, Dordogne, Rhône et Rhin. Même bleu pour les axes ; aucun nom, lettre, repère A/B/C ou zone de réponse visible pendant le placement. Les seules étiquettes à placer restent GARONNE, SEINE et RHIN.
- Surfaces vectorielles des bras aval, de la Gironde et de l'océan. L'estuaire est représenté distinctement. Après correction, un zoom géographique montre ses contours, le bec d'Ambès et l'ouverture atlantique. Aucun raccord de fleuve dessiné à main levée.
- Glisser-déposer direct avec souris et tactile. Une sélection suivie d'un clic est aussi possible. Alternative clavier : Tab sur une étiquette, flèches pour la déplacer, Maj pour accélérer. Validation possible lorsque les trois étiquettes sont déposées sur des cours d'eau ; les fleuves leurres ne sont pas signalés comme erreurs avant correction.
- Les détections utilisent la distance aux segments géographiques (12 unités SVG de tolérance, environ 8 à 9 pixels affichés aux deux résolutions) ou l'intérieur des surfaces aval. Aucune détection basée sur un rectangle de réponse ou un repère central. La Gironde demeure une réponse distincte, donc incorrecte pour GARONNE.
- Les positions libres sont sauvegardées avec leurs coordonnées et le cours d'eau identifié. Les anciennes sauvegardes `a/b/c` restent lisibles et scorables. Plusieurs étiquettes peuvent être déposées sur un même cours d'eau, pour ne pas empêcher une proposition erronée.
- Corail valide → ses placements sont masqués → Sauge place et valide → comparaison et correction immédiates. Les propositions restent colorées par équipe et reliées à leur position réelle ; leurs cartouches sont espacés lors de la comparaison.
- Noms des six cours d'eau après correction ; explication demandée sur la Garonne reproduite. Le barème reste 5 points par bonne réponse, 15 maximum, avec attribution unique et scores cumulés conservés.
- Présentation générale, chronomètre, jokers, Pyrénées, Alpes et défi collectif préservés. Aucun changement dans les autres manches.

## Sources et limites
[Sources détaillées, licence et reproduction](../../assets/maps/hydrography/README.md) ; Natural Earth (domaine public), fichiers épinglés et vérifiés par SHA-256. Le fond régional existant IGN / france-geojson est conservé.

Les données sont généralisées au 1:10 millions, conformément à la source recommandée. Le repère du bec d'Ambès est celui de la côte généralisée : il ne faut pas interpréter le zoom comme une carte topographique de précision. Les deux axes s'arrêtent à leurs surfaces d'eau avec un écart maximal d'environ 75 m, inférieur à 0.04 unité SVG sur la carte nationale ; aucun segment supplémentaire n'est inventé. Les bras sont contigus à l'estuaire, lui-même ouvert sur l'océan. Les sections de séparation de couleur sont documentées et ne revendiquent pas une délimitation réglementaire de l'estuaire.

L'accès à BD TOPAGE reste bloqué par le proxy (403). Les couches Natural Earth permettent néanmoins cette réalisation ; aucun apport de données BD TOPAGE n'est annoncé.

## Captures
- [Placement 1366 × 768](placement-1366.png), [correction 1366 × 768](correction-1366.png)
- [Placement 1280 × 720](placement-1280.png), [correction 1280 × 720](correction-1280.png)

Les captures de correction montrent volontairement Corail juste (+15) et Sauge sur trois cours d'eau leurres (+0), avec scores cumulés de démonstration (100/60 au départ).

## Tests
- Génération hors ligne : contrôles géométriques réussis (validité, contiguïté, vertices source, sections, distance aux surfaces) ; sources complètes vérifiées contre la révision épinglée, empreintes identiques.
- `node --test tests/*.test.cjs` : **859 tests réussis**, dont 28 nouveaux tests sur les six tracés, les placements corrects/incorrects, les bras aval et l'estuaire, la tolérance, les anciennes sauvegardes, les positions libres, les jetons périmés et l'attribution unique.
- `tests/gps-hydrography.browser.cjs` : **réussi aux deux résolutions**, sans défilement. Six tracés sans noms prématurés, dépôts sur les leurres puis correction du placement, souris, vrai événement tactile via Chromium, trois étiquettes au clavier, masquage, comparaison, +15/+0, reprise avant et après correction.
- `tests/gps.browser.cjs` (préchargement historique `tests/helpers/legacy-rounds.cjs`) : **réussi aux deux résolutions** ; parcours complet des Pyrénées aux Alpes puis défi collectif et pause métier, chronomètres, points uniques, sauvegarde et actions sans défilement.
- Régressions navigateur `gps-spicy`, `spicy`, `final` avec le même préchargement historique : **réussies** ; jokers, deux modes, reprise des six manches, finale, scores cumulés et parcours de fin préservés. Le préchargement neutralise uniquement les introductions de manches pour ces scénarios historiques.
- `git diff --check` : réussi.

Le tactile est testé par événements Chromium ; aucun appareil physique n'a été utilisé.
