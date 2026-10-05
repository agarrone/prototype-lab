# Explorateur des personnes décédées

## Objectif
Intégrer la recherche de personnes dans une page data.gouv.fr, cohérente avec DVF in a page.

## Hypothèse testée
La recherche par identité, dates et lieux permet de retrouver une personne sans manipuler les fichiers sources.

## État d’avancement
Recherche locale simple et avancée, critères supprimables, pagination, tableaux sur ordinateur et cartes sur mobile. Fiche modale, retour aux résultats et permalien. Données de démonstration uniquement : 128 sources locales, dont une opposition, soit 127 fiches consultables. Les mentions de démonstration sont volontairement absentes de l’interface.

## Modèle de données
`DeathSource` dans `/lib/deces.ts` reprend les 12 colonnes fournies : nom, prenoms, sexe, date_naissance, code_insee_naissance, commune_naissance, pays_naissance, date_deces, code_insee_deces, numero_acte_deces, fichier_origine, opposition.
Prénoms séparés par des virgules, sexe M/F, dates AAAAMMJJ avec composantes inconnues à zéro. L’adaptateur prépare les libellés pour l’interface ; les communes de décès, départements et pays de décès proviennent d’un référentiel géographique local distinct. Aucun numéro de ligne n’est inventé dans la fiche. Source affichée : fichier_origine.
Les oppositions sont exclues avant recherche et résolution des permaliens.

## Dates et filtres
Dates exactes, années et périodes inclusives ; une date partielle ne correspond à un filtre que si toute sa période possible y est comprise. Une année inconnue est exclue des recherches par date. L’âge exact n’est calculé que lorsque les deux dates sont complètes. Exemples de dates au mois, à l’année et inconnues dans les données.
Recherche par sexe, âge ou plage d’âges, commune, département et pays. Suggestions accessibles au clavier ; référentiel limité à huit communes françaises. Ni recherche floue ni export à ce stade.

## Inspirations
- `/prototypes/explorateur-dvf-in-a-page` et cartes d’information DVF.
- https://deces.matchid.io/search
- https://www.deces-en-france.fr/
- https://www.data.gouv.fr/datasets/fichier-des-personnes-decedees
- Captures et schéma fournis dans la conversation.

## Lien Figma
Non fourni.

## Tableau de résultats
Grille inspirée de l’explorateur : en-têtes typés de 48 px, lignes de 32 px et séparateurs de cellules. Colonnes distinctes pour noms, prénoms, dates, communes et âge. Menus par colonne avec tris croissant/décroissant et filtres par valeurs multiples, recherche et effectifs. Tri/filtrage avant pagination de 20 lignes ; filtres cumulables et retirables. Réinitialisation à chaque nouvelle recherche principale. Défilement horizontal sur petit écran. Le nom ouvre la fiche.

Filtres alignés sur Explore in a page : popover de 260 px ancré à la colonne, fermeture extérieure/Échap, en-tête gris « Filtrer : », tris communs. Texte : recherche et cases à cocher. Âge : bornes min/max. Dates : avant/après/entre. Les filtres se cumulent avant pagination ; les valeurs inconnues sont exclues des intervalles.

Colonnes actuelles du tableau : nom, prénoms, sexe, date et commune de naissance, pays de naissance, date et commune de décès, fichier d’origine. Toutes disposent du tri et des filtres. L’âge reste dans la fiche et la recherche avancée, sans colonne dans le tableau.

## Alignement Explore in a page
Comparaison visuelle directe avec la référence : barre d’outils de recherche globale, sélection des colonnes, compteur de lignes, badges gris pour valeurs catégorielles et menus texte compacts. Dates : calendrier navigable et modes Avant/Après/Entre. Affichage progressif de 30 lignes, au lieu de la pagination. Les filtres restent combinables ; le nom conserve l’accès à la fiche.

## Variante recherche latérale
La disposition par défaut place le formulaire dans un panneau gauche de 300 px, repliable, avec défilement indépendant et actions collantes. La boîte fait 740 px de haut sur ordinateur (hauteur disponible en vue agrandie). La sidebar a été validée : elle est désormais la disposition unique, sans sélecteur de variante.
Sur mobile, « Modifier la recherche » ouvre un dialogue plein écran ; la validation retourne aux résultats. Le tableau devient des cartes utilisant réellement le composant `components/explorer-mobile-card.tsx`, également utilisé par l’explorateur de référence : quatre champs, dépliage des suivants. Les filtres du tableau et le panneau de fiche restent partagés entre les deux dispositions.
