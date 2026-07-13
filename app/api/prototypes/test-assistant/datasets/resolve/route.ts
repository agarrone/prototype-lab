import { fetchDatagouvDataset } from "@/lib/datagouv";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams.get("input")?.trim() ?? "";
  if (!input) return Response.json({ error: "Lien manquant." }, { status: 400 });

  try {
    const dataset = await fetchDatagouvDataset(input);
    const hasParquet = dataset.resources.some(
      (resource) => resource.parquetUrl,
    );
    if (!hasParquet) {
      return Response.json(
        { error: "Aucune ressource de ce jeu de données n’est disponible en version Parquet." },
        { status: 422 },
      );
    }
    return Response.json({ dataset });
  } catch {
    return Response.json(
      { error: "Le lien ne correspond pas à un jeu de données data.gouv.fr accessible." },
      { status: 404 },
    );
  }
}
