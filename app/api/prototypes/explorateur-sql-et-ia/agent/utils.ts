export function stripCodeFence(content: string) {
  return content
    .trim()
    .replace(/^```(?:json|sql)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

export function parseJsonObject<T>(content: string) {
  const cleanedContent = stripCodeFence(content);

  try {
    return JSON.parse(cleanedContent) as T;
  } catch {
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Le modèle n'a pas retourné de JSON exploitable.");
    }
    return JSON.parse(jsonMatch[0]) as T;
  }
}
