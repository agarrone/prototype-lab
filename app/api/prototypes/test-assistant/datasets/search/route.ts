import { searchDatagouvDatasets } from "@/lib/datagouv";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return Response.json({ datasets: [] });

  try {
    const datasets = await searchDatagouvDatasets(query);
    return Response.json({
      datasets: datasets.filter((dataset) =>
        dataset.resources.some(
          (resource) => resource.parquetUrl,
        ),
      ),
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Recherche impossible." },
      { status: 502 },
    );
  }
}
