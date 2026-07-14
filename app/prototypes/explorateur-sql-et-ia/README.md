# Explorateur SQL et IA

## Objectif

Dupliquer l'explorateur de données existant pour préparer une variante centrée sur les interactions SQL et IA.

## Hypothèse testée

Une interface d'exploration tabulaire peut devenir plus puissante si elle expose progressivement des capacités de requêtage SQL et d'assistance IA sans perdre le contexte ressource.

## État d'avancement

Prototype branché sur le fichier Parquet électoral data.gouv.fr et préparé pour interroger Albert côté serveur. L'assistant peut produire des graphiques, des cartes de points à partir de coordonnées et des cartes choroplèthes des régions ou départements français.

Les cartes choroplèthes utilisent les contours administratifs data.gouv.fr 2025 généralisés à 1000 m, adaptés à un affichage web léger : https://www.data.gouv.fr/datasets/contours-administratifs

## Configuration Albert

Créer un fichier `.env.local` à la racine du projet :

```bash
ALBERT_API_KEY=...
ALBERT_API_URL=https://albert.api.etalab.gouv.fr/v1/chat/completions
ALBERT_MODEL=albert-large
```

La clé reste côté serveur via la route `/api/prototypes/explorateur-sql-et-ia/agent`.

## Inspirations

- data.gouv.fr
- DSFR
- Interfaces d'exploration de tables CSV
- Assistants SQL et IA intégrés aux outils de données

## Lien Figma

Non renseigné.
