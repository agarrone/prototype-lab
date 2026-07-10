import { defaultAlbertApiUrl } from "./model-client";
import { runAgentPhase } from "./orchestrator";
import type { AgentRequest } from "./types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.ALBERT_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error:
          "Clé API du service de génération absente. Ajoutez ALBERT_API_KEY dans .env.local.",
      },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as AgentRequest;

    return await runAgentPhase(body, {
      apiKey,
      apiUrl: process.env.ALBERT_API_URL ?? defaultAlbertApiUrl,
      model: process.env.ALBERT_MODEL ?? "albert-large",
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur inconnue pendant l'analyse.",
        model: process.env.ALBERT_MODEL ?? "albert-large",
      },
      { status: 200 },
    );
  }
}
