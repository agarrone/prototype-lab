import type { AssistantToolCall, PlannerDecision } from "../types";
import { parseJsonObject, stripCodeFence } from "../utils";
import { sanitizeSelectSql } from "./sql";

type ToolName = AssistantToolCall["tool"];
type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | undefined {
  return typeof value === "object" && value !== null
    ? (value as JsonRecord)
    : undefined;
}

function normalizeToolPayload(parsed: JsonRecord) {
  const nestedCall =
    asRecord(parsed.toolCall) ??
    asRecord(parsed.tool_call) ??
    asRecord(parsed.function);
  const source = nestedCall ?? parsed;
  const rawTool = source.tool ?? source.name ?? source.tool_name;
  const rawArguments =
    source.arguments ?? source.args ?? source.input ?? parsed.arguments;
  let argumentsRecord = asRecord(rawArguments);

  if (!argumentsRecord && typeof rawArguments === "string") {
    try {
      argumentsRecord = JSON.parse(rawArguments) as JsonRecord;
    } catch {
      argumentsRecord = undefined;
    }
  }

  return {
    tool: typeof rawTool === "string" ? rawTool : undefined,
    arguments: argumentsRecord ?? {},
  };
}

function extractSqlCandidate(content: string) {
  const cleanedContent = stripCodeFence(content);
  const jsonSqlMatch = cleanedContent.match(
    /"sql"\s*:\s*"((?:\\.|[^"\\])*)"/i,
  );

  if (jsonSqlMatch) {
    try {
      return JSON.parse(`"${jsonSqlMatch[1]}"`) as string;
    } catch {
      return jsonSqlMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    }
  }

  const fencedSqlMatch = content.match(/```(?:sql)?\s*([\s\S]*?)```/i);
  if (fencedSqlMatch) {
    return fencedSqlMatch[1].trim();
  }

  const statementMatch = cleanedContent.match(/\b(?:SELECT|WITH)\b[\s\S]*/i);
  return statementMatch?.[0]
    .replace(/```[\s\S]*$/i, "")
    .replace(/\n(?:Explication|Explanation|Description)\s*:[\s\S]*$/i, "")
    .trim();
}

export function parseToolCall(
  content: string,
  expectedTool?: ToolName,
): AssistantToolCall {
  let parsed: JsonRecord;

  try {
    parsed = parseJsonObject<JsonRecord>(content);
  } catch (error) {
    if (expectedTool === "execute_sql") {
      const sql = extractSqlCandidate(content);

      if (!sql) {
        throw error;
      }

      return {
        tool: "execute_sql",
        arguments: { sql: sanitizeSelectSql(sql), show: true },
      };
    }
    throw error;
  }

  const normalized = normalizeToolPayload(parsed);
  const tool = normalized.tool ?? expectedTool;
  const args = normalized.arguments;

  if (tool === "inspect_schema") {
    return { tool: "inspect_schema", arguments: {} };
  }

  if (
    tool === "execute_sql" &&
    typeof (args.sql ?? parsed.sql) === "string"
  ) {
    const sql = (args.sql ?? parsed.sql) as string;
    const description = args.description ?? parsed.description;
    const show = args.show ?? parsed.show;

    return {
      tool: "execute_sql",
      arguments: {
        sql: sanitizeSelectSql(sql),
        description:
          typeof description === "string"
            ? description.trim()
            : undefined,
        show: typeof show === "boolean" ? show : true,
      },
    };
  }

  if (
    tool === "create_chart" &&
    asRecord(args.spec ?? parsed.spec)
  ) {
    const description = args.description ?? parsed.description;

    return {
      tool: "create_chart",
      arguments: {
        description:
          typeof description === "string"
            ? description.trim()
            : undefined,
        spec: (args.spec ?? parsed.spec) as Record<string, unknown>,
      },
    };
  }

  throw new Error(
    expectedTool
      ? `Le modèle n'a pas produit un appel ${expectedTool} exploitable.`
      : "Le modèle n'a pas appelé un tool autorisé.",
  );
}

export function parsePlannerDecision(content: string): PlannerDecision {
  let parsed: {
    action?: "use_tools" | "answer_direct" | "ask_clarification";
    answer?: string;
    question?: string;
    confidence?: "high" | "medium" | "low";
    interpretation?: {
      goal?: string;
      unresolved?: unknown[];
    };
    reasoning?: string;
  };

  try {
    parsed = parseJsonObject(content);
  } catch {
    return {
      action: "ask_clarification",
      question:
        "Je n’ai pas réussi à cadrer la demande de façon suffisamment fiable. Peux-tu préciser le résultat attendu ?",
      reasoning:
        "La décision produite n’était pas structurée ; aucun tool n’a été lancé par précaution.",
    };
  }

  if (parsed.action === "answer_direct" || (!parsed.action && parsed.answer)) {
    return {
      action: "answer_direct",
      answer: parsed.answer?.trim() || "Je peux répondre sans interroger les données.",
      reasoning: parsed.reasoning?.trim(),
    };
  }

  if (parsed.action === "ask_clarification") {
    return {
      action: "ask_clarification",
      question:
        parsed.question?.trim() ||
        "Peux-tu préciser le résultat que tu souhaites obtenir ?",
      reasoning: parsed.reasoning?.trim(),
    };
  }

  const toolCall = parseToolCall(content);
  const hasUnresolvedChoices = (parsed.interpretation?.unresolved?.length ?? 0) > 0;

  if (
    toolCall.tool === "execute_sql" &&
    (parsed.confidence !== "high" || hasUnresolvedChoices)
  ) {
    return {
      action: "ask_clarification",
      question:
        parsed.question?.trim() ||
        "Plusieurs interprétations restent possibles. Peux-tu préciser la mesure, la dimension ou le périmètre attendu ?",
      reasoning:
        parsed.reasoning?.trim() ||
        "L’interprétation n’est pas assez certaine pour lancer une analyse fiable.",
    };
  }

  return { action: "use_tools", toolCall };
}
