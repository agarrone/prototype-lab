import type { StructuredAgentAnswer } from "./types";
import { parseJsonObject, stripCodeFence } from "./utils";

function normalizeText(value: unknown) {
  if (typeof value === "string") return value.trim() || undefined;
  if (!Array.isArray(value)) return undefined;
  const lines = value.filter((item): item is string => typeof item === "string");
  return lines.map((item) => item.trim()).filter(Boolean).join("\n") || undefined;
}

export function parseStructuredAnswer(content: string): StructuredAgentAnswer {
  try {
    const parsed = parseJsonObject<{
      answer?: unknown;
      reasoning?: unknown;
      sql?: unknown;
    }>(content);

    return {
      answer: normalizeText(parsed.answer) || stripCodeFence(content),
      reasoning: normalizeText(parsed.reasoning),
      sql: normalizeText(parsed.sql),
    };
  } catch {
    return { answer: stripCodeFence(content) };
  }
}
