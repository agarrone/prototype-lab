import { callModel } from "./model-client";
import { chartPrompt } from "./prompts/chart";
import { mapPrompt } from "./prompts/map";
import { plannerPrompt } from "./prompts/planner";
import { addResultLimitDisclosure } from "./result-limits";
import { sqlPrompt } from "./prompts/sql";
import { synthesisPrompt } from "./prompts/synthesis";
import { systemPrompt } from "./prompts/system";
import { answerFromSchema } from "./schema-evidence";
import { parseStructuredAnswer } from "./structured-answer";
import { parsePlannerDecision, parseToolCall } from "./tools/registry";
import { sanitizeSelectSql } from "./tools/sql";
import type { AgentModelConfig, AgentRequest } from "./types";

function historyFrom(body: AgentRequest) {
  return (body.conversationHistory ?? []).slice(-8).map((message) => ({
    role: message.role,
    content: message.content.slice(0, 1200),
  }));
}

function contextFrom(body: AgentRequest) {
  return {
    resourceName:
      body.resourceName ?? "Ressource tabulaire",
    tableName: body.tableName ?? "data",
    history: historyFrom(body),
  };
}

export async function runAgentPhase(
  body: AgentRequest,
  config: AgentModelConfig,
) {
  const phase = body.phase ?? "plan";
  const question = body.question?.trim();

  if (!question) {
    return Response.json({ error: "La question est obligatoire." }, { status: 400 });
  }

  const { resourceName, tableName, history } = contextFrom(body);

  if (phase === "plan") {
    const schemaAnswer = answerFromSchema(question, body.schema);

    if (schemaAnswer?.action === "answer_direct") {
      return Response.json({
        answer: schemaAnswer.answer,
        reasoning: schemaAnswer.reasoning,
        model: config.model,
      });
    }

    const response = await callModel({
      ...config,
      messages: [
        { role: "system", content: `${systemPrompt}\n\n${plannerPrompt}` },
        {
          role: "user",
          content: `Ressource: ${resourceName}
Table: ${tableName}
Schéma disponible: ${body.schema ? "oui" : "non"}
${body.schema ? `Schéma courant:\n${JSON.stringify(body.schema, null, 2)}` : ""}
Métadonnées du jeu de données disponibles: ${body.datasetMetadata ? "oui" : "non"}
Référence du jeu de données disponible: ${body.datasetReference ? "oui" : "non"}
${body.datasetMetadata ? `Métadonnées courantes:\n${JSON.stringify(body.datasetMetadata, null, 2)}` : ""}
Historique récent:
${JSON.stringify(history, null, 2)}

Question: ${question}`,
        },
      ],
    });
    const decision = parsePlannerDecision(response.content);

    if (decision.action === "answer_direct") {
      return Response.json({
        answer: decision.answer,
        reasoning: decision.reasoning,
        model: config.model,
        usage: response.usage,
      });
    }

    if (decision.action === "ask_clarification") {
      return Response.json({
        answer: decision.question,
        reasoning: decision.reasoning,
        needsClarification: true,
        model: config.model,
        usage: response.usage,
      });
    }

    return Response.json({
      toolCall: decision.toolCall,
      model: config.model,
      usage: response.usage,
    });
  }

  if (phase === "generate_sql") {
    if (!body.schema) {
      return Response.json(
        { error: "Le schéma inspecté est obligatoire." },
        { status: 400 },
      );
    }

    const response = await callModel({
      ...config,
      messages: [
        { role: "system", content: `${systemPrompt}\n\n${sqlPrompt}` },
        {
          role: "user",
          content: `Ressource: ${resourceName}
Schéma courant:
${JSON.stringify(body.schema, null, 2)}

Métadonnées du jeu de données:
${JSON.stringify(body.datasetMetadata ?? null, null, 2)}

Résultats SQL déjà obtenus:
${JSON.stringify(body.previousSqlResults ?? [], null, 2)}

Requêtes SQL en échec à corriger:
${JSON.stringify(body.previousSqlErrors ?? [], null, 2)}

Historique récent:
${JSON.stringify(history, null, 2)}

Question: ${question}`,
        },
      ],
    });

    return Response.json({
      toolCall: parseToolCall(response.content, "execute_sql"),
      model: config.model,
      usage: response.usage,
    });
  }

  if (phase === "create_chart") {
    if (!body.schema || !body.sql || !body.executionResult) {
      return Response.json(
        { error: "Le schéma, le SQL et le résultat SQL sont obligatoires." },
        { status: 400 },
      );
    }

    const response = await callModel({
      ...config,
      messages: [
        { role: "system", content: `${systemPrompt}\n\n${chartPrompt}` },
        {
          role: "user",
          content: `Ressource: ${resourceName}
Question: ${question}
Schéma:
${JSON.stringify(body.schema, null, 2)}
Métadonnées du jeu de données:
${JSON.stringify(body.datasetMetadata ?? null, null, 2)}
SQL exécuté:
${sanitizeSelectSql(body.sql)}
Résultat SQL:
${JSON.stringify(body.executionResult, null, 2)}`,
        },
      ],
    });

    return Response.json({
      toolCall: parseToolCall(response.content, "create_chart"),
      model: config.model,
      usage: response.usage,
    });
  }

  if (phase === "create_map") {
    if (!body.schema || !body.sql || !body.executionResult) {
      return Response.json(
        { error: "Le schéma, le SQL et le résultat SQL sont obligatoires." },
        { status: 400 },
      );
    }

    const response = await callModel({
      ...config,
      messages: [
        { role: "system", content: `${systemPrompt}\n\n${mapPrompt}` },
        {
          role: "user",
          content: `Ressource: ${resourceName}
Question: ${question}
Schéma:
${JSON.stringify(body.schema, null, 2)}
Métadonnées du jeu de données:
${JSON.stringify(body.datasetMetadata ?? null, null, 2)}
SQL exécuté:
${sanitizeSelectSql(body.sql)}
Résultat SQL:
${JSON.stringify(body.executionResult, null, 2)}`,
        },
      ],
    });

    return Response.json({
      toolCall: parseToolCall(response.content, "create_map"),
      model: config.model,
      usage: response.usage,
    });
  }

  if (phase === "synthesize") {
    const evidence =
      body.previousSqlResults ??
      (body.sql && body.executionResult
        ? [{ sql: body.sql, result: body.executionResult }]
        : []);

    if (!body.schema || evidence.length === 0) {
      return Response.json(
        { error: "Le schéma et au moins un résultat SQL sont obligatoires." },
        { status: 400 },
      );
    }

    const finalSql = sanitizeSelectSql(evidence.at(-1)?.sql ?? "");
    const response = await callModel({
      ...config,
      temperature: 0.2,
      messages: [
        { role: "system", content: `${systemPrompt}\n\n${synthesisPrompt}` },
        {
          role: "user",
          content: `Question: ${question}
Schéma:
${JSON.stringify(body.schema, null, 2)}
Métadonnées du jeu de données:
${JSON.stringify(body.datasetMetadata ?? null, null, 2)}
Historique des résultats SQL:
${JSON.stringify(evidence, null, 2)}
SQL final: ${finalSql}`,
        },
      ],
    });
    const answer = response.content
      ? parseStructuredAnswer(response.content)
      : { answer: "Je n’ai pas reçu de réponse exploitable." };

    return Response.json({
      ...answer,
      answer: addResultLimitDisclosure(answer.answer, evidence),
      sql: answer.sql ?? finalSql,
      model: config.model,
      usage: response.usage,
    });
  }

  return Response.json({ error: "Phase agent inconnue." }, { status: 400 });
}
