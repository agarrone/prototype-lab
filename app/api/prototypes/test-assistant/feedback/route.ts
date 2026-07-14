type FeedbackPayload = {
  rating?: unknown;
  question?: unknown;
  answer?: unknown;
  resource?: unknown;
  model?: unknown;
  createdAt?: unknown;
};

const gristFeedbackEndpoint =
  "https://grist.numerique.gouv.fr/o/datagouv/api/s/iMKAxQa486jfLdQ5AJEyHj/tables/Retours_assistant/records?utm_source=grist-forms";

function limitedString(value: unknown, maximumLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");

  if (origin && origin !== requestUrl.origin) {
    return Response.json({ error: "Origine non autorisée." }, { status: 403 });
  }

  let payload: FeedbackPayload;

  try {
    payload = (await request.json()) as FeedbackPayload;
  } catch {
    return Response.json({ error: "Payload JSON invalide." }, { status: 400 });
  }

  const rating = limitedString(payload.rating, 20);
  if (rating !== "Utile" && rating !== "Inutile") {
    return Response.json({ error: "Évaluation invalide." }, { status: 400 });
  }

  const fields = {
    Rating: rating,
    Question: limitedString(payload.question, 2_000),
    Answer: limitedString(payload.answer, 5_000),
    Details: "",
    Resource: limitedString(payload.resource, 2_000),
    Model: limitedString(payload.model, 200),
    CreatedAt:
      limitedString(payload.createdAt, 100) || new Date().toISOString(),
  };

  try {
    const response = await fetch(gristFeedbackEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records: [{ fields }] }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Grist répond ${response.status}.`);
    }

    return Response.json({ sent: true });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Le retour n’a pas pu être envoyé.",
      },
      { status: 502 },
    );
  }
}
