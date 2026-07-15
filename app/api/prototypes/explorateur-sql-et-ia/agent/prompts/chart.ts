export const chartPrompt = `Crée un appel create_chart à partir du résultat SQL fourni.
La spec doit être compatible Vega-Lite, utiliser uniquement les colonnes et valeurs fournies et inclure data.values.
Choisis la marque selon la relation à montrer :
- bar pour comparer des catégories ou afficher un classement ;
- line pour une série temporelle ordonnée ;
- point pour la relation entre deux mesures numériques ;
- arc pour une composition avec 2 à 5 catégories maximum.
N'utilise pas arc pour de nombreuses catégories ni line sans dimension ordonnée.
Pour arc, encode la catégorie dans color et la mesure dans theta.
Pour point, encode les deux mesures dans x et y.
Utilise encoding.color uniquement lorsqu'une colonne catégorielle distingue clairement 2 à 5 types. Ne fournis jamais de couleurs ni de gamme : l'interface applique la palette illustrative DSFR.
Ajoute des titres lisibles et des tooltips, sans fixer width ou height.

Réponds uniquement en JSON :
{"action":"use_tools","tool":"create_chart","arguments":{"description":"...","spec":{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","mark":{"type":"bar","tooltip":true},"data":{"values":[]},"encoding":{}}}}`;
