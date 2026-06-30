import snapshot from "./preview-dashboard-snapshot.json";

export type SourceBreakdown = {
  label: string;
  count: number;
  share: number;
};

export type FormatDetail = {
  id: string;
  format: string;
  count: number;
  catalogShare: number;
  previewableCount: number;
  previewableShare: number;
  errorShare: number;
  tooBigShare: number;
  averageSize: number | null;
  latestPreviewUpdate: string | null;
  previews: string[];
  sourceBreakdown: SourceBreakdown[];
};

export type FormatFamily = {
  id: string;
  family: string;
  count: number;
  catalogShare: number;
  previewableCount: number;
  previewableShare: number;
  averageSize: number | null;
  latestPreviewUpdate: string | null;
  icon: "table" | "geo" | "document" | "code" | "archive" | "service";
  details: FormatDetail[];
};

export type PreviewDashboardData = {
  sourceUrl: string;
  staticCsvUrl: string | null;
  generatedAt: string;
  statsMonth?: string;
  totalResources: number;
  previewableResources: number;
  previewableShare: number;
  resourcesWithSize: number;
  averageSize: number | null;
  latestPreviewUpdate: string | null;
  sourceBreakdown: SourceBreakdown[];
  sourceStatsSourceUrl?: string;
  previewBreakdown: SourceBreakdown[];
  monthlyStats?: Record<
    string,
    {
      totalResources: number;
      previewableResources: number;
      previewableShare: number;
    }
  >;
  families: FormatFamily[];
  resourcePreview?: {
    sourceUrl: string;
    columns: string[];
    rows: string[][];
  };
};

export function buildEmptyPreviewDashboard(): PreviewDashboardData {
  return {
    sourceUrl:
      "https://demo.data.gouv.fr/api/1/datasets/r/982d9dd0-365a-4c4b-8a83-75dec40c36bb",
    staticCsvUrl: null,
    generatedAt: new Date().toISOString(),
    statsMonth: undefined,
    totalResources: 0,
    previewableResources: 0,
    previewableShare: 0,
    resourcesWithSize: 0,
    averageSize: null,
    latestPreviewUpdate: null,
    sourceBreakdown: [],
    sourceStatsSourceUrl: undefined,
    previewBreakdown: [],
    monthlyStats: {},
    families: [],
    resourcePreview: undefined,
  };
}

export async function fetchPreviewDashboardData() {
  return {
    data: snapshot as PreviewDashboardData,
    error: null,
  };
}
