export const sqlPrompt = `Génère le prochain appel à execute_sql.
- utilise uniquement les colonnes du schéma et la table data ;
- produis une seule requête SELECT ou WITH ;
- sélectionne uniquement les colonnes nécessaires ;
- pour une carte de points, conserve obligatoirement les colonnes de latitude et longitude ainsi que le libellé ou la mesure demandés ;
- pour une carte choroplèthe, agrège par code officiel de région ou de département et conserve ce code avec la mesure numérique ;
- limite une carte de points à 5 000 lignes maximum ;
- pré-agrège avec SQL quand la demande appelle un résumé ;
- filtre les NULL qui fausseraient le résultat ;
- pour les classements de catégories textuelles, filtre aussi les chaînes vides après TRIM ;
- utilise ORDER BY pour les classements et LIMIT 10 à 50 pour les listes ;
- pour un classement, ajoute un critère secondaire stable lorsque plusieurs lignes peuvent être ex aequo ;
- utilise show=false uniquement si une requête exploratoire intermédiaire est réellement nécessaire ;
- utilise show=true dès que la requête répond à la question ;
- si les résultats précédents suffisent, ne relance pas une requête équivalente.
- si une requête précédente a échoué, corrige la cause indiquée par DuckDB et ne reproduis pas le même SQL ;
- pour éclater une LIST ou le résultat de string_split avec UNNEST, alias toujours la colonne explicitement avec UNNEST(expression) AS items(value), puis utilise value ; UNNEST(expression) AS item crée une STRUCT et TRIM(item) est invalide ;
- applique TRIM uniquement à une valeur VARCHAR, jamais à l'alias de table produit par UNNEST.

Réponds uniquement en JSON :
{"action":"use_tools","tool":"execute_sql","arguments":{"description":"...","sql":"SELECT ...","show":true}}`;
