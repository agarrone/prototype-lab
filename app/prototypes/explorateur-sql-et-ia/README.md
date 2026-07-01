# Explorateur SQL et IA

## Objectif

Dupliquer l'explorateur de données existant pour préparer une variante centrée sur les interactions SQL et IA.

## Hypothèse testée

Une interface d'exploration tabulaire peut devenir plus puissante si elle expose progressivement des capacités de requêtage SQL et d'assistance IA sans perdre le contexte ressource.

## État d'avancement

Prototype branché sur le fichier Parquet électoral data.gouv.fr et préparé pour interroger Albert côté serveur.

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
