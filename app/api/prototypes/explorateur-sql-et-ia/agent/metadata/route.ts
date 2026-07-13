import { getDatasetMetadata } from "../tools/metadata";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const reference = new URL(request.url).searchParams.get("dataset")?.trim();

  if (!reference) {
    return Response.json(
      { error: "La référence du jeu de données est obligatoire." },
      { status: 400 },
    );
  }

  try {
    return Response.json({ metadata: await getDatasetMetadata(reference) });
  } catch {
    return Response.json(
      { error: "Impossible de récupérer les métadonnées du jeu de données." },
      { status: 502 },
    );
  }
}
