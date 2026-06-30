# Preview dashboard

## Objectif

Suivre les familles de formats du catalogue data.gouv.fr et vérifier lesquelles peuvent être prévisualisées à partir d'un export réel.

## Hypothèse testée

Une table synthétique branchée sur les vraies ressources permet d'identifier rapidement les familles à améliorer et les formats déjà couverts.

## État d'avancement

Prototype alimenté par un snapshot agrégé de l'URL de ressource :

https://demo.data.gouv.fr/api/1/datasets/r/982d9dd0-365a-4c4b-8a83-75dec40c36bb

Le dashboard utilise les vraies données du CSV pour afficher les familles de formats, la part prévisualisable, les sources et les dernières dates de prévisualisation.

Le CSV source est volumineux ; le prototype embarque donc un snapshot agrégé local plutôt que de retélécharger et parser le fichier complet à chaque affichage.

## Inspirations

- Explorateur de données
- Interfaces DSFR compactes
- Tableaux de suivi opérationnels

## Lien Figma

À ajouter lorsque disponible.
