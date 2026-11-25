# Publication de données géographiques

## Objectif

Rendre concret un scénario où data.gouv.fr devient le catalogue unique des données publiques, y compris géographiques : publier un GeoPackage, créer ou référencer des services WFS, puis consulter la fiche publique et ses modalités de réutilisation. cartes.gouv.fr conserve l’exploration cartographique.

Le prototype sert à discuter des choix fonctionnels, du modèle de données et de leurs implications techniques. Il ne fige pas de solution.

## Hypothèse testée

Intégrer les couches et les services WFS au parcours de publication data.gouv.fr permet de publier et de diffuser un GeoPackage sans que le producteur ait à comprendre l’architecture d’un système d’information géographique.

## Parcours de démonstration

1. Décrire le jeu de données (dont la généalogie).
2. Ajouter un GeoPackage, par téléversement ou par URL, et suivre son analyse.
3. Consulter et décrire ses couches, avec un aperçu cartographique.
4. Configurer un ou plusieurs WFS, et éventuellement référencer un WFS externe.
5. Prévisualiser et publier, puis suivre la génération des services.
6. Consulter la fiche publique (« Voir la fiche publique »).

Raccourcis de démo : « Simuler un fichier invalide » montre une erreur bloquante, une URL de WFS externe sans `wfs` ni `geoserver` montre un échec de lecture du GetCapabilities, et le sélecteur d’état de l’écran final bascule un service entre en cours, disponible et erreur.

## Modèle fonctionnel

Les types et données fictives sont dans [`lib/publication-geo.ts`](../../../lib/publication-geo.ts).

| Niveau | Objet | Points clés |
| --- | --- | --- |
| Jeu de données | `PublicDataset` | Métadonnées générales, généalogie (facultative), couverture et granularité spatiales, règles d’accès |
| Ressource | `GeoPackageResource` | Titre et description éditables ; format, taille, nombre de couches, type de contenu et emprise détectés ; URL d’origine conservée en cas d’import par URL |
| Ressource | `HostedWfs` | Lié à un seul GeoPackage (`sourceResourceId`) ; un GeoPackage peut alimenter plusieurs WFS ; statut `generating`, `available` ou `error` |
| Ressource | `ExternalWfs` | URL conservée, métadonnées issues du GetCapabilities, couches sélectionnées, aucune synchronisation |
| Couche | `SourceLayer` | Table du GeoPackage : nom, description, géométrie, EPSG, nombre d’objets, emprise, schéma attributaire |
| Couche | `PublishedLayer` | Couche exposée par un WFS, avec des métadonnées propres au service : nom technique, titre, description, mots-clés |

Les WFS restent des ressources du jeu de données. Ils ne deviennent pas des objets `dataservice`.

`PublishedLayer.sourceTables` est un tableau pour laisser la place à de futures correspondances avancées. En V1, il contient toujours une seule table.

## Audit du prototype précédent (V2) et ajustements

### Déjà conforme, conservé

- Les trois niveaux : jeu de données, ressource GeoPackage, couches.
- Couverture spatiale et granularité au niveau de la fiche.
- Métadonnées de ressource détectées automatiquement (format, taille, couches, contenu, emprise).
- Informations techniques et schéma attributaire des couches.
- Import par fichier ou par URL.
- Génération asynchrone avec les statuts en cours, disponible et erreur.
- Interface, composants et charte visuelle : aucune refonte.

### Écarts corrigés

| Écart constaté | Ajustement |
| --- | --- |
| Pas de champ Généalogie | Champ texte facultatif à l’étape 2, affiché sur la fiche publique |
| Import par URL sans conservation de l’adresse d’origine | URL d’origine conservée et affichée, avec la mention de la copie hébergée |
| Ajout instantané, sans analyse | Même parcours d’analyse pour le fichier et l’URL, avec erreurs bloquantes et avertissements non bloquants |
| Pas d’aperçu des couches | Aperçu cartographique simulé avec sélection des couches (fichier, service, fiche publique) |
| Service WMS et styles | Retirés : la V1 se limite au WFS |
| Choix de projection et de format de réponse | Remplacés par une configuration automatique affichée en lecture seule (formats, tous les attributs, projection source, droits hérités) |
| Un seul WFS possible | Plusieurs WFS par GeoPackage, chacun avec ses couches |
| Métadonnées des couches partagées entre services | Métadonnées propres à chaque service, préremplies depuis la couche source |
| Pas de nom technique validé | Noms techniques du service et des couches générés, éditables et validés (format, longueur, unicité) |
| Pas de référencement de WFS externe | Parcours distinct : URL, lecture du GetCapabilities, sélection des couches, métadonnées complétables |
| Pas de fiche publique | Fiche publique avec une liste unique de ressources, aperçu, accès WFS, aide QGIS et téléchargement des couches |
| Le bandeau promettait d’ajouter des services plus tard | Retiré et signalé comme question ouverte |
| Modifier une couche semblait modifier le fichier | Mention explicite : décrire une couche ne modifie pas ses données sources |

### Règles provisoires introduites pour le prototype

À confirmer, elles servent seulement à rendre le parcours crédible :

- Nom technique de service : minuscules, chiffres et tirets, 3 à 63 caractères, unique.
- Nom technique de couche : minuscules, chiffres et tirets bas, unique dans le service.
- Seuil d’export asynchrone : 100 000 objets.
- Formats de réponse WFS affichés : GML 3.2 et GeoJSON.
- URL des services hébergés : `geoservices.data.gouv.fr/wfs/{nom}`, fictive.
- Un seul GeoPackage par jeu de données dans la démo, pour garder le parcours lisible. Le modèle en accepte plusieurs.

## Questions ouvertes

Elles sont signalées dans l’interface d’administration par un encart « Question ouverte » quand c’est utile.

- Correspondances avancées entre tables sources et couches publiées.
- Infrastructure de génération et de diffusion des services (Géoplateforme ou autre).
- Protocoles et standards au-delà du WFS.
- Exigences ISO/INSPIRE et thématiques INSPIRE.
- Niveau de la résolution spatiale (jeu de données, ressource ou couche).
- Projections et reprojection : la projection source est conservée en V1.
- Organisation des ressources et services sur la fiche publique (liste unique provisoire).
- Indexation des couches pour la recherche.
- Mises à jour des GeoPackages et synchronisation des WFS.
- Création de services après publication.
- Tables non géographiques : signalées à l’analyse, non traitées.
- Couches en erreur bloquante et relance des services en échec.
- Synchronisation des métadonnées des WFS externes.
- Récupération des exports asynchrones.
- Choix des formats de téléchargement par les réutilisateurs.

## État d’avancement

Version 3 : parcours complet de bout en bout, avec la fiche publique. Analyse, génération des services, GetCapabilities, aperçus cartographiques et téléchargements sont simulés. Aucun backend géographique.

Le cas d’exemple est un GeoPackage fictif sur les milieux aquatiques et les zones humides du Bas-Rhin.

## Inspirations

- Parcours de publication actuel de data.gouv.fr et composants du frontend `datagouv/cdata`
- Guide officiel « Publier un jeu de données »
- DSFR et composants data.gouv.fr
- Note « Vers un catalogue géographique unifié sur data.gouv.fr » et arbitrages produit associés

## Lien Figma

Non fourni.
