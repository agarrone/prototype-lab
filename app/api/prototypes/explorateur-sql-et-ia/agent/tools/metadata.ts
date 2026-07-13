import { fetchDatagouvDataset } from "@/lib/datagouv";
import type { DatasetMetadataResult } from "../types";

export async function getDatasetMetadata(
  reference: string,
): Promise<DatasetMetadataResult> {
  const dataset = await fetchDatagouvDataset(reference);

  return {
    id: dataset.id,
    slug: dataset.slug,
    title: dataset.title,
    description: dataset.description,
    organization: dataset.organizationName,
    page: dataset.page,
    license: dataset.licenseLabel,
    lastUpdate: dataset.lastUpdateLabel,
    qualityScore: dataset.qualityScore,
    resources: dataset.resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      format: resource.format,
      url: resource.url,
      parquetUrl: resource.parquetUrl,
    })),
  };
}
