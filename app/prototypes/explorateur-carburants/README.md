# Explorateur des prix des carburants

Objectif : reproduire les fonctionnalités de l’explorateur carburants en reprenant le design DVF.
Hypothèse : la cohérence de la sidebar, de la recherche flottante et de la légende facilite la navigation entre explorateurs.
État : exploration, données fictives. Figma : non fourni.
Inspirations : explorateur-dvf et https://explore.data.gouv.fr/fr/prix-carburants.

Sidebar : choix du carburant, interrupteur des ruptures, prix moyen et médian (hors ruptures), fiche station au clic. Carte : points colorés suivant les terciles, ruptures en noir, détail des six carburants au survol et au focus clavier, dates par carburant, recherche en haut à gauche et légende en bas à droite. Pas de tableau, export, liste comparative ou filtre de services.

600 stations fictives, dont 576 exemples générés autour de 48 villes métropolitaines. Recherche limitée aux communes et adresses de démonstration (48 villes, dont Bordeaux, Montpellier, Paris, Lyon et Marseille). Les statistiques portent sur la sélection de recherche ; déplacer la carte ne change pas le périmètre. Les égalités de prix peuvent déséquilibrer les groupes de la légende. Fond cartographique externe identique à DVF.

La recherche localise une adresse ou commune de démonstration sans filtrer les stations. Les filtres carburant et ruptures ne modifient pas le cadrage. Moyenne et médiane portent sur tous les prix disponibles du carburant choisi, indépendamment de la recherche et de la zone visible.
