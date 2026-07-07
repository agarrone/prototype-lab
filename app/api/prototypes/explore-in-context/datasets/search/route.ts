import { searchDatagouvDatasets } from "@/lib/datagouv";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return Response.json({ datasets: [] });
  }

  try {
    const datasets = await searchDatagouvDatasets(query);
    return Response.json({ datasets });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de rechercher les jeux de données.",
      },
      { status: 502 },
    );
  }
}
