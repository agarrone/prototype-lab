import { ExplorerPrototype } from "../explorateur/page";
import type { DatagouvDatasetSummary } from "@/lib/datagouv";

export function ResourceViewer({ dataset }: { dataset: DatagouvDatasetSummary }) {
  const datasetReference = dataset.slug || dataset.id;

  return (
    <section>
      <ExplorerPrototype
        embedded
        datasetReference={datasetReference}
        datasetResources={dataset.resources}
        returnTo={`/prototypes/explore-in-context?dataset=${encodeURIComponent(
          datasetReference,
        )}`}
      />
    </section>
  );
}
