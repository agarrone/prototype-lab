export type AssistantTestDataset = {
  reference: string;
  title: string;
  organization: string;
  parquetUrl: string;
};

export const assistantTestDatasets: AssistantTestDataset[] = [
  {
    reference: "catalogue-des-donnees-de-data-gouv-fr",
    title: "Catalogue des données de data.gouv.fr",
    organization: "data.gouv.fr",
    parquetUrl:
      "https://hydra.s3.rbx.io.cloud.ovh.net/parquet/f868cca6-8da1-4369-a78d-47463f19a9a3.parquet",
  },
  {
    reference: "repertoire-national-des-elus-1",
    title: "Répertoire national des élus",
    organization: "Ministère de l’Intérieur",
    parquetUrl:
      "https://object.files.data.gouv.fr/hydra-parquet/hydra-parquet/2876a346-d50c-4911-934e-19ee07b0e503.parquet",
  },
  {
    reference:
      "carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2022",
    title: "Carte des loyers — Indicateurs de loyers d’annonce par commune en 2022",
    organization: "Ministère de la Transition écologique",
    parquetUrl:
      "https://hydra.s3.rbx.io.cloud.ovh.net/parquet/dfb542cd-a808-41e2-9157-8d39b5c24edb.parquet",
  },
  {
    reference: "statistiques-dvf",
    title: "Statistiques DVF",
    organization: "data.gouv.fr",
    parquetUrl:
      "https://object.files.data.gouv.fr/hydra-parquet/hydra-parquet/851d342f-9c96-41c1-924a-11a7a7aae8a6.parquet",
  },
  {
    reference: "petitions-de-lassemblee-nationale",
    title: "Pétitions de l’Assemblée nationale",
    organization: "data.gouv.fr",
    parquetUrl:
      "https://hydra.s3.rbx.io.cloud.ovh.net/parquet/c94c9dfe-23eb-45aa-acd1-7438c4e977db.parquet",
  },
  {
    reference:
      "logements-vacants-du-parc-prive-par-commune-departement-region-france-de-2020-a-2026",
    title:
      "Logements vacants du parc privé par commune, département, région et France, de 2020 à 2026",
    organization: "Ministère de la Transition écologique",
    parquetUrl:
      "https://hydra.s3.rbx.io.cloud.ovh.net/parquet/41744167-0321-4e22-8e4f-6974522d5185.parquet",
  },
  {
    reference: "liste-des-festivals-en-france",
    title: "Liste des festivals en France",
    organization: "Ministère de la Culture",
    parquetUrl:
      "https://object.files.data.gouv.fr/hydra-parquet/hydra-parquet/47ac11c2-8a00-46a7-9fa8-9b802643f975.parquet",
  },
  {
    reference: "liste-des-radars-fixes-en-france",
    title: "Liste des radars fixes en France",
    organization: "Ministère de l’Intérieur",
    parquetUrl:
      "https://object.files.data.gouv.fr/hydra-parquet/hydra-parquet/17f7cfd9-a5fe-4b6a-9f5d-3625feaa396e.parquet",
  },
];
