# Photos culturelles à ajouter

Les six emplacements restent volontairement sans photographie. Aucun fichier sans licence vérifiée ni fausse photographie n’est utilisé.

1. Ajouter ici les photographies réutilisables après vérification de leurs droits.
2. Ouvrir `culture-photos.js` et renseigner les cinq champs de chaque entrée :
   - `src` : chemin relatif du fichier, par exemple `assets/photos/lascaux.jpg` ;
   - `alt` : description de la vraie photographie ;
   - `credit` : auteur et mentions exigées ;
   - `source` : URL de la page d’origine comportant la licence ;
   - `license` : licence exacte (et sa version si applicable).
3. Conserver ou adapter `caption` à la photographie effectivement choisie. « Châteaux du Périgord » devra par exemple préciser le château photographié.

L’image n’apparaît que lorsque `src`, `credit`, `source` et `license` sont tous renseignés. Sinon, la légende et l’emplacement « Photo à ajouter » restent visibles. Le crédit, la licence et le lien source sont affichés sous chaque photographie. Il ne s’agit pas d’une vérification automatique des droits : ils doivent être contrôlés avant l’ajout.

Préférer des images horizontales d’au moins 600 pixels de large ; la zone de présentation est recadrée avec `object-fit: cover`. Ne pas renseigner un exemple de chemin si le fichier n’existe pas réellement.
