import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowLeftLine, RiFlaskLine } from "@remixicon/react";
import { DatasetPageTemplate } from "../templates/page";
import { ExplorateurSqlEtIaPrototype } from "../explorateur-sql-et-ia/page";
import { fetchDatagouvDataset } from "@/lib/datagouv";
import { DatasetSelection } from "./dataset-selection";
import { assistantTestDatasets } from "./datasets";

export const metadata: Metadata = {
  title: "Tester l’assistant de données — Prototype data.gouv.fr",
  description: "Un prototype pour tester un assistant d’exploration des jeux de données.",
};

const container = "mx-auto w-full max-w-[78rem] px-4 lg:px-6";

export default async function TestAssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ dataset?: string; parquet?: string }>;
}) {
  const { dataset: reference, parquet } = await searchParams;

  if (!reference || !parquet) {
    return <AssistantTestHome />;
  }

  const dataset = await fetchDatagouvDataset(reference).catch(() => null);
  if (!dataset) return <AssistantTestHome error="Ce jeu de données n’a pas pu être chargé." />;

  const registeredResource = dataset.resources.find(
    (resource) => resource.parquetUrl === parquet,
  );
  const proposedDataset = assistantTestDatasets.find(
    (item) => item.reference === reference && item.parquetUrl === parquet,
  );
  if (!registeredResource && !proposedDataset) {
    return (
      <AssistantTestHome error="La ressource Parquet sélectionnée n’appartient pas à ce jeu de données." />
    );
  }
  const availableParquetResources = dataset.resources.flatMap((resource) =>
    resource.parquetUrl
      ? [
          {
            id: resource.id,
            name: resource.title,
            url: resource.parquetUrl,
          },
        ]
      : [],
  );
  if (
    proposedDataset &&
    !availableParquetResources.some((resource) => resource.url === parquet)
  ) {
    availableParquetResources.push({
      id: "selected-parquet",
      name: "Version Parquet du jeu de données",
      url: parquet,
    });
  }

  return (
    <DatasetPageTemplate
      dataset={dataset}
      showTabs={false}
      topContent={
        <div className={`${container} pb-3`}>
          <Link href="/prototypes/test-assistant" className="inline-flex h-9 items-center gap-2 text-[13px] font-medium text-[#000091] underline underline-offset-4">
            <RiArrowLeftLine aria-hidden className="h-4 w-4" />
            Choisir un autre jeu de données
          </Link>
        </div>
      }
    >
      <div className="mt-8 w-full border-t border-[#dddddd] py-6">
        <div className="px-4 lg:px-6">
          <ExplorateurSqlEtIaPrototype
            embedded
            initialAssistantOpen
            allowCustomResourceUrl={false}
            standardResourceList
            datasetReference={dataset.slug || dataset.id}
            contextOrganization={dataset.organizationName}
            contextTitle={dataset.title}
            showContextLogo={false}
            showContextUpdatedAt={false}
            showUpdateAndDownloadInfo={false}
            initialResource={{
              id: registeredResource?.id ?? "selected-parquet",
              name: registeredResource?.title ?? "Version Parquet du jeu de données",
              url: parquet,
            }}
            initialResources={availableParquetResources}
          />
        </div>
      </div>
    </DatasetPageTemplate>
  );
}

function AssistantTestHome({ error }: { error?: string }) {
  return (
    <main className="min-h-dvh bg-white text-[#161616]">
      <div className={`${container} py-10 lg:py-14`}>
        <section className="max-w-3xl pb-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 text-[13px] font-medium text-[#000091]">
              <RiFlaskLine aria-hidden className="h-5 w-5" />
              Une expérimentation data.gouv.fr
            </div>
            <h1 className="text-3xl font-bold leading-[1.2] tracking-[-0.02em] sm:text-4xl lg:text-[44px]">
              Posez vos questions directement aux données
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-7 text-[#3a3a3a]">
              Ce prototype permet d’explorer un jeu de données en langage naturel. Choisissez un jeu de données, puis demandez à l’assistant de décrire ses colonnes, de rechercher une information ou de comparer des valeurs.
            </p>
            <p className="mt-5 max-w-2xl text-[14px] leading-6 text-[#666666]">
              Il s’agit d’un prototype : les réponses peuvent être incomplètes ou erronées. Votre retour nous aide à comprendre ce qui vous semble utile, confus ou manquant pendant le test.
            </p>
          </div>
        </section>
        {error ? <p role="alert" className="mb-5 border-l-4 border-[#ce0500] bg-[#fef4f4] p-4 text-[14px] text-[#ce0500]">{error}</p> : null}
        <DatasetSelection />
      </div>
    </main>
  );
}
