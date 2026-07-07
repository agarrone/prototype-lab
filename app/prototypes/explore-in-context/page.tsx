import type { Metadata } from "next";
import { ExplorerPrototype } from "../explorateur/page";
import { DatasetPageTemplate } from "../templates/page";
import {
  defaultDatasetSummary,
  fetchDatagouvDataset,
} from "@/lib/datagouv";
import { DatasetSwitcher } from "./dataset-switcher";

export const metadata: Metadata = {
  title: "Explore in context - Prototype Lab",
  description:
    "Prototype d'intégration de l'explorateur directement dans une page dataset data.gouv.fr.",
};

const frContainerClass = "mx-auto w-full max-w-[78rem] px-4 lg:px-6";

export default async function ExploreInContextPage({
  searchParams,
}: {
  searchParams: Promise<{ dataset?: string }>;
}) {
  const { dataset: datasetReference } = await searchParams;
  const dataset = datasetReference
    ? await fetchDatagouvDataset(datasetReference).catch(() => defaultDatasetSummary)
    : defaultDatasetSummary;

  return (
    <DatasetPageTemplate dataset={dataset}>
      <div className={`${frContainerClass} pt-6`}>
        <DatasetSwitcher currentDataset={dataset} />
        <ExplorerPrototype
          embedded
          datasetReference={dataset.slug || dataset.id}
          datasetResources={dataset.resources}
          returnTo={`/prototypes/explore-in-context?dataset=${encodeURIComponent(
            dataset.slug || dataset.id,
          )}`}
        />
      </div>
    </DatasetPageTemplate>
  );
}
