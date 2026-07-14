const boundaryUrls = {
  regions:
    "https://object.data.gouv.fr/contours-administratifs/2025/geojson/regions-1000m.geojson",
  departments:
    "https://object.data.gouv.fr/contours-administratifs/2025/geojson/departements-1000m.geojson",
} as const;

export const runtime = "nodejs";

export async function GET(request: Request) {
  const level = new URL(request.url).searchParams.get("level");

  if (level !== "regions" && level !== "departments") {
    return Response.json(
      { error: "Niveau géographique inconnu." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(boundaryUrls[level], {
      next: { revalidate: 86_400 },
    });

    if (!response.ok) {
      throw new Error(`La ressource de contours répond ${response.status}.`);
    }

    const geojson = await response.text();

    return new Response(geojson, {
      headers: {
        "Content-Type": "application/geo+json; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Data-Source": "data.gouv.fr/contours-administratifs/2025/1000m",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Les contours administratifs sont indisponibles.",
      },
      { status: 502 },
    );
  }
}
