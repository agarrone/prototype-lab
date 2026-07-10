export const chartPrompt = `Crée un appel create_chart à partir du résultat SQL fourni.
La spec doit être compatible Vega-Lite, utiliser uniquement les colonnes et valeurs fournies et inclure data.values.
Choisis bar pour une comparaison, line pour une série temporelle, point pour une relation et arc uniquement pour peu de catégories.
Ajoute des titres lisibles et des tooltips, sans fixer width ou height.

Réponds uniquement en JSON :
{"action":"use_tools","tool":"create_chart","arguments":{"description":"...","spec":{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","mark":{"type":"bar","tooltip":true},"data":{"values":[]},"encoding":{}}}}`;
