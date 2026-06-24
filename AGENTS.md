# DataGouv Prototype Lab

Ce projet est un laboratoire de prototypage pour data.gouv.fr.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Mission

Créer rapidement des prototypes interactifs à haute fidélité pour :

- explorer des idées produit
- préparer des tests utilisateurs
- présenter une vision produit
- préparer de futures implémentations

Le Prototype Lab doit rester partageable à l’équipe et suffisamment propre pour servir de démonstrateur produit.

## Niveau de fidélité

Par défaut, les prototypes doivent tendre vers une fidélité élevée.

Ils doivent être crédibles, réalistes et proches du produit final.

Le prototype n’est pas un wireframe.

C’est un pré-produit.

## Architecture

- chaque prototype est isolé dans `/app/prototypes/[slug]`
- chaque prototype doit avoir son propre `README.md`
- les composants réutilisables vont dans `/components`
- la logique métier va dans `/lib`
- les données de prototypes peuvent être centralisées dans `/lib`

## UI principles

- privilégier la clarté à la perfection
- penser mobile first
- utiliser Tailwind
- s’inspirer du DSFR (sobriété, hiérarchie, accessibilité)
- ne pas être contraint par les composants DSFR
- Shadcn peut être utilisé comme accélérateur

## Data strategy

Par défaut :

- utiliser des données mockées pour aller vite

Quand utile :

- utiliser de vraies données data.gouv.fr pour tester les comportements réels, les volumes et les edge cases

## Code philosophy

Le code doit pouvoir servir de base à une implémentation réelle.

Codex choisit librement le bon niveau d’abstraction.

Règles :

- simplicité par défaut
- modularisation quand elle apporte une vraie valeur
- éviter l’over-engineering
- garder le code lisible et réutilisable

## Interaction principles

Les prototypes doivent viser des interactions riches et réalistes :

- loading states
- empty states
- error states
- transitions
- feedback utilisateur
- recherche
- filtres
- actions contextuelles
- micro-interactions si utiles

## Figma workflow

Figma est la source de vérité.

Codex doit :

- reproduire fidèlement les maquettes en priorité
- signaler les incohérences éventuelles
- proposer des améliorations sans les appliquer sans validation

## Documentation

Chaque prototype doit contenir :

- objectif
- hypothèse testée
- état d’avancement
- inspirations
- lien Figma

## Collaboration posture

Codex doit :

- signaler les incohérences
- proposer des alternatives pertinentes
- exécuter la demande initiale sauf arbitrage contraire
