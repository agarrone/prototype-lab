import type { TokenUsage } from "./types";

type AlbertChatResponse = {
  choices?: { message?: { content?: string } }[];
  usage?: TokenUsage;
};

export const defaultAlbertApiUrl =
  "https://albert.api.etalab.gouv.fr/v1/chat/completions";

function containsJsonObject(content: string) {
  const cleanedContent = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleanedContent);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
  } catch {
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return false;

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
    } catch {
      return false;
    }
  }
}

function mergeUsage(first?: TokenUsage, second?: TokenUsage): TokenUsage | undefined {
  if (!first && !second) return undefined;

  return {
    prompt_tokens: (first?.prompt_tokens ?? 0) + (second?.prompt_tokens ?? 0),
    completion_tokens:
      (first?.completion_tokens ?? 0) + (second?.completion_tokens ?? 0),
    total_tokens: (first?.total_tokens ?? 0) + (second?.total_tokens ?? 0),
  };
}

export async function callModel({
  apiKey,
  apiUrl,
  model,
  messages,
  temperature = 0.1,
}: {
  apiKey: string;
  apiUrl: string;
  model: string;
  messages: { role: "system" | "user"; content: string }[];
  temperature?: number;
}) {
  async function requestModel(nextMessages: typeof messages) {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: nextMessages,
        temperature,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Le service de génération n'a pas pu répondre. ${detail}`);
    }

    const data = (await response.json()) as AlbertChatResponse;
    return {
      content: data.choices?.[0]?.message?.content?.trim() ?? "",
      usage: data.usage,
    };
  }

  const firstResponse = await requestModel(messages);

  if (containsJsonObject(firstResponse.content)) {
    return firstResponse;
  }

  const repairResponse = await requestModel([
    ...messages,
    {
      role: "user",
      content: `La réponse précédente n'était pas un objet JSON valide :
${firstResponse.content.slice(0, 2000) || "[réponse vide]"}

Reformule uniquement le résultat attendu sous la forme d'un objet JSON valide, sans markdown ni texte autour.`,
    },
  ]);

  if (!containsJsonObject(repairResponse.content)) {
    throw new Error(
      "Le service de génération n'a pas produit de réponse structurée après une seconde tentative.",
    );
  }

  return {
    content: repairResponse.content,
    usage: mergeUsage(firstResponse.usage, repairResponse.usage),
  };
}
