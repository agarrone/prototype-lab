import PreviewDashboardClient from "./PreviewDashboardClient";
import {
  buildEmptyPreviewDashboard,
  fetchPreviewDashboardData,
} from "./preview-dashboard-data";

export default async function PreviewDashboardPage() {
  const result = await fetchPreviewDashboardData().catch((error: unknown) => ({
    data: buildEmptyPreviewDashboard(),
    error:
      error instanceof Error
        ? error.message
        : "Impossible de charger les données de prévisualisation.",
  }));

  return <PreviewDashboardClient data={result.data} error={result.error} />;
}
