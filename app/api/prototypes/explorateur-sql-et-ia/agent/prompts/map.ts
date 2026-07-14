export const mapPrompt = `Crée un appel create_map à partir du résultat SQL fourni.
Utilise uniquement les colonnes et les valeurs du résultat SQL.

Deux types de cartes sont autorisés :
- points : pour des lignes contenant une latitude et une longitude ;
- choropleth : pour colorer les régions ou départements français à partir d'un code géographique et d'une mesure numérique agrégée.

Pour une carte de points :
- latitudeField et longitudeField doivent nommer les colonnes de coordonnées ;
- labelField est facultatif et sert au libellé de l'infobulle ;
- valueField est facultatif et contrôle la taille des points ;
- colorField est facultatif et distingue une catégorie ;
- active cluster sauf si le résultat contient moins de 100 points.

Pour une carte choroplèthe :
- boundary vaut france-regions ou france-departments ;
- dataKey nomme la colonne contenant le code officiel ;
- boundaryKey vaut toujours code ;
- valueField nomme la mesure numérique utilisée pour la couleur ;
- labelField est facultatif.

N'invente jamais de coordonnées, de code géographique ou de colonne. Si les colonnes nécessaires ne sont pas présentes, l'appel n'est pas possible.

Réponds uniquement en JSON avec l'une de ces formes :
{"action":"use_tools","tool":"create_map","arguments":{"description":"...","spec":{"type":"points","title":"...","latitudeField":"latitude","longitudeField":"longitude","labelField":"nom","valueField":"valeur","cluster":true}}}
{"action":"use_tools","tool":"create_map","arguments":{"description":"...","spec":{"type":"choropleth","title":"...","boundary":"france-departments","dataKey":"code_departement","boundaryKey":"code","valueField":"valeur","labelField":"nom_departement"}}}`;
