import { ExplorerPrototype } from "../explorateur/page";
import type { DatagouvDatasetSummary } from "@/lib/datagouv";

export function ResourceViewer({
  dataset,
  showResourceNavigation = true,
  contentViewsOnly = false,
}: {
  dataset: DatagouvDatasetSummary;
  showResourceNavigation?: boolean;
  contentViewsOnly?: boolean;
}) {
  const datasetReference = dataset.slug || dataset.id;

  return (
    <section>
      <ExplorerPrototype
        embedded
        showResourceNavigation={showResourceNavigation}
        contentViewsOnly={contentViewsOnly}
        datasetReference={datasetReference}
        datasetResources={dataset.resources}
        returnTo={`/prototypes/explore-in-context?dataset=${encodeURIComponent(
          datasetReference,
        )}`}
      />
    </section>
  );
}
