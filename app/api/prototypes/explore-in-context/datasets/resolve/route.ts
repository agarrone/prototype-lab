import { fetchDatagouvDataset } from "@/lib/datagouv";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input")?.trim() ?? "";

  if (!input) {
    return Response.json(
      { error: "Lien, slug ou identifiant de dataset manquant." },
      { status: 400 },
    );
  }

  try {
    const dataset = await fetchDatagouvDataset(input);
    return Response.json({ dataset });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de charger ce jeu de données.",
      },
      { status: 404 },
    );
  }
}
