export const runtime = "nodejs";

type AgentRequest = {
  phase?: "plan" | "generate_sql" | "synthesize";
  question?: string;
  resourceName?: string;
  tableName?: string;
  schema?: InspectSchemaResult;
  sql?: string;
  executionResult?: ExecuteSqlResult;
  conversationHistory?: {
    role: "user" | "assistant";
    content: string;
  }[];
};

type AlbertChatResponse = {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
};

type InspectSchemaResult = {
  table: string;
  rows: number | string;
  columns: {
    name: string;
    type: string;
    examples: unknown[];
  }[];
};

type ExecuteSqlResult = {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
};

type AssistantToolCall =
  | {
      tool: "inspect_schema";
      arguments?: Record<string, never>;
    }
  | {
      tool: "execute_sql";
      arguments: {
        sql: string;
      };
    };

type PlannerDecision =
  | {
      action: "use_tools";
      toolCall: AssistantToolCall;
    }
  | {
      action: "answer_direct";
      answer: string;
      reasoning?: string;
    };

type StructuredAgentAnswer = {
  answer: string;
  reasoning?: string;
  sql?: string;
};

const defaultAlbertApiUrl =
  "https://albert.api.etalab.gouv.fr/v1/chat/completions";

const datasetAssistantSystemPrompt = `Tu es un assistant d'exploration de données pour data.gouv.fr.
Tu es un Dataset Viewer Assistant spécialisé, pas un assistant généraliste.
Tu aides l'utilisateur à explorer et analyser un fichier tabulaire chargé localement dans DuckDB-WASM.
Tu disposes uniquement de deux tools :
- inspect_schema
- execute_sql

Principes fixes :
- Tool-aware : tu raisonnes d'abord sur la demande, puis tu utilises les tools seulement quand ils sont nécessaires.
- Evidence-first : toute réponse factuelle sur les données doit venir du contexte de ressource, du schéma inspecté ou du résultat execute_sql.
- Pas d'invention : tu ne devines jamais un nombre, un nom de colonne, une valeur ou une table.
- Concision : tu réponds brièvement, avec des puces si la réponse a plusieurs parties.
- Sécurité : tu ne modifies jamais les données.

Tu ne connais jamais le schéma à l'avance.
Tu dois appeler inspect_schema avant d'écrire une requête SQL si la question nécessite les données et que le schéma n'est pas encore connu.
Tu écris uniquement du SQL compatible DuckDB.
Tu privilégies des requêtes simples, lisibles, efficaces, et fondées sur les colonnes présentes dans le schéma.
Quand tu réponds à une question :
1. Comprends la demande.
2. Décide si les tools sont nécessaires.
3. Si la réponse dépend des données, inspecte le schéma si nécessaire.
4. Génère puis exécute une requête SQL si nécessaire.
5. Explique brièvement le résultat ou la réponse directe.
Ne fais jamais d'hypothèse sur les noms de colonnes.
Si une information n'existe pas dans le fichier ou n'est pas prouvée par la requête, indique-le clairement.
Si l'utilisateur demande une visualisation, produis d'abord une requête SQL qui prépare les données au bon grain. Ne produis pas de spécification graphique : aucun tool de graphique n'est disponible dans ce POC.`;

const sqlPlannerPrompt = `Tu décides de la prochaine action.
Tu peux répondre directement uniquement si la question porte sur :
- ton fonctionnement ;
- les principes du POC ;
- les tools disponibles ;
- la confidentialité ;
- les limites générales ;
- une clarification qui ne nécessite pas de lire les données.

Si la question demande une valeur, un comptage, une liste, une distribution, un résumé du fichier, des colonnes présentes, ou toute information factuelle sur les données :
→ utilise les tools.

Si le schéma n'est pas disponible et que les tools sont nécessaires :
→ appelle inspect_schema.
Sinon, si le schéma est disponible et que les tools sont nécessaires :
→ appelle execute_sql avec une requête SQL DuckDB répondant à la question.
Pour chaque requête, vise le minimum nécessaire : colonnes explicites, agrégations SQL, filtres sur les valeurs non nulles si nécessaire, LIMIT pour les listes ou échantillons.

Réponds uniquement avec du JSON valide :
{"action":"answer_direct","answer":"...","reasoning":"..."}
ou
{"action":"use_tools","tool":"inspect_schema","arguments":{}}
ou
{"action":"use_tools","tool":"execute_sql","arguments":{"sql":"SELECT ..."}}`;

const sqlGeneratorPrompt = `Tu génères une requête SQL DuckDB.
Contraintes :
- utiliser uniquement les colonnes présentes dans le schéma ;
- produire une seule requête SQL ;
- uniquement SELECT ou WITH ;
- sélectionner uniquement les colonnes nécessaires, éviter SELECT * sauf demande d'échantillon brut ;
- ajouter LIMIT 10 à 50 pour les échantillons et listes, et ne pas dépasser 100 lignes pour un résultat final ;
- pré-agréger en SQL avec GROUP BY, COUNT, AVG, MEDIAN ou autres agrégats quand la question demande un résumé ;
- filtrer les valeurs NULL qui fausseraient un calcul ou une visualisation demandée ;
- trier les classements avec ORDER BY explicite ;
- utiliser des alias explicites ;
- utiliser la table data ;
- entourer avec des guillemets doubles les noms de colonnes qui contiennent un point ou un caractère spécial ;
- ne produire aucun texte autour du SQL.`;

function stripCodeFence(content: string) {
  return content
    .trim()
    .replace(/^```(?:json|sql)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function parseJsonObject<T>(content: string) {
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

function parseToolCall(content: string): AssistantToolCall {
  const parsed = parseJsonObject<Partial<AssistantToolCall>>(content);

  if (parsed.tool === "inspect_schema") {
    return { tool: "inspect_schema", arguments: {} };
  }

  if (
    parsed.tool === "execute_sql" &&
    typeof parsed.arguments === "object" &&
    parsed.arguments !== null &&
    "sql" in parsed.arguments &&
    typeof parsed.arguments.sql === "string"
  ) {
    return {
      tool: "execute_sql",
      arguments: { sql: sanitizeSelectSql(parsed.arguments.sql) },
    };
  }

  throw new Error("Le modèle n'a pas appelé un tool autorisé.");
}

function parsePlannerDecision(content: string): PlannerDecision {
  const parsed = parseJsonObject<
    Partial<{
      action: "use_tools" | "answer_direct";
      answer: string;
      reasoning: string;
    }> &
      Partial<AssistantToolCall>
  >(content);

  if (parsed.action === "answer_direct") {
    return {
      action: "answer_direct",
      answer: parsed.answer?.trim() || "Je peux répondre sans interroger les données.",
      reasoning: parsed.reasoning?.trim(),
    };
  }

  return {
    action: "use_tools",
    toolCall: parseToolCall(content),
  };
}

function parseStructuredAnswer(content: string): StructuredAgentAnswer {
  try {
    const parsed = parseJsonObject<Partial<StructuredAgentAnswer>>(content);

    return {
      answer: parsed.answer?.trim() || stripCodeFence(content),
      reasoning: parsed.reasoning?.trim(),
      sql: parsed.sql?.trim(),
    };
  } catch {
    return { answer: stripCodeFence(content) };
  }
}

function sanitizeSelectSql(sql: string) {
  const trimmedSql = stripCodeFence(sql).replace(/;+\s*$/g, "");
  const forbiddenPattern =
    /\b(insert|update|delete|drop|alter|create|copy|attach|detach|install|load|pragma|call)\b/i;

  if (!/^(select|with)\b/i.test(trimmedSql) || forbiddenPattern.test(trimmedSql)) {
    throw new Error("La requête générée n'est pas une requête SELECT autorisée.");
  }

  if (trimmedSql.includes(";")) {
    throw new Error("Une seule requête SQL est autorisée.");
  }

  return trimmedSql;
}

async function callAlbert({
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
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Albert n'a pas pu répondre. ${detail}`);
  }

  const data = (await response.json()) as AlbertChatResponse;

  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

function getConversationHistory(body: AgentRequest) {
  return (body.conversationHistory ?? []).slice(-8).map((message) => ({
    role: message.role,
    content: message.content.slice(0, 1200),
  }));
}

export async function POST(request: Request) {
  const apiKey = process.env.ALBERT_API_KEY;
  const apiUrl = process.env.ALBERT_API_URL ?? defaultAlbertApiUrl;
  const model = process.env.ALBERT_MODEL ?? "albert-large";

  if (!apiKey) {
    return Response.json(
      {
        error:
          "Clé API Albert absente. Ajoutez ALBERT_API_KEY dans .env.local.",
      },
      { status: 500 },
    );
  }

  const body = (await request.json()) as AgentRequest;
  const phase = body.phase ?? "plan";
  const question = body.question?.trim();

  if (!question) {
    return Response.json(
      { error: "La question est obligatoire." },
      { status: 400 },
    );
  }

  const resourceName = body.resourceName ?? "Catalogue des jeux de données data.gouv.fr";
  const tableName = body.tableName ?? "data";
  const conversationHistory = getConversationHistory(body);

  try {
    if (phase === "plan") {
      const plannerContent = await callAlbert({
        apiKey,
        apiUrl,
        model,
        messages: [
          {
            role: "system",
            content: `${datasetAssistantSystemPrompt}

${sqlPlannerPrompt}`,
          },
          {
            role: "user",
            content: `Ressource: ${resourceName}
Table attendue après chargement: ${tableName}
Schéma disponible: non
Historique de discussion récent:
${JSON.stringify(conversationHistory, null, 2)}

Question utilisateur: ${question}`,
          },
        ],
      });
      const plannerDecision = parsePlannerDecision(plannerContent);

      if (plannerDecision.action === "answer_direct") {
        return Response.json({
          answer: plannerDecision.answer,
          reasoning: plannerDecision.reasoning,
          model,
        });
      }

      return Response.json({
        toolCall: plannerDecision.toolCall,
        model,
      });
    }

    if (phase === "generate_sql") {
      if (!body.schema) {
        return Response.json(
          { error: "Le schéma inspecté est obligatoire." },
          { status: 400 },
        );
      }

      const sqlContent = await callAlbert({
        apiKey,
        apiUrl,
        model,
        messages: [
          {
            role: "system",
            content: `${datasetAssistantSystemPrompt}

${sqlPlannerPrompt}

${sqlGeneratorPrompt}`,
          },
          {
            role: "user",
            content: `Ressource: ${resourceName}
Tool inspect_schema output:
${JSON.stringify(body.schema, null, 2)}

Historique de discussion récent:
${JSON.stringify(conversationHistory, null, 2)}

Question utilisateur: ${question}

Réponds uniquement avec un appel tool execute_sql en JSON.`,
          },
        ],
      });

      return Response.json({
        toolCall: parseToolCall(sqlContent),
        model,
      });
    }

    if (phase === "synthesize") {
      if (!body.schema || !body.executionResult || !body.sql) {
        return Response.json(
          { error: "Le schéma, le SQL et le résultat SQL sont obligatoires." },
          { status: 400 },
        );
      }

      const safeSql = sanitizeSelectSql(body.sql);
      const rawAnswer = await callAlbert({
        apiKey,
        apiUrl,
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `${datasetAssistantSystemPrompt}

La requête a déjà été exécutée avec execute_sql dans le navigateur de l'utilisateur.
Réponds uniquement en JSON valide avec les clés :
- answer: réponse concise dans la langue de la question utilisateur
- reasoning: méthode courte, indiquant les preuves utilisées : inspect_schema puis execute_sql local
- sql: SQL exécuté
Règles de synthèse :
- commence par le résultat concret ;
- ne mentionne que les nombres et valeurs présents dans execute_sql output ;
- si le résultat est limité, dis que la sortie affichée est limitée ;
- si la question ne peut pas être tranchée avec les colonnes disponibles, dis-le clairement ;
- n'invente aucune valeur en dehors des résultats fournis.`,
          },
          {
            role: "user",
            content: `Question utilisateur: ${question}
Tool inspect_schema output:
${JSON.stringify(body.schema, null, 2)}

SQL exécuté:
${safeSql}

Tool execute_sql output:
${JSON.stringify(body.executionResult, null, 2)}`,
          },
        ],
      });
      const structuredAnswer = rawAnswer
        ? parseStructuredAnswer(rawAnswer)
        : {
            answer: "Albert n'a pas retourné de réponse exploitable.",
          };

      return Response.json({
        ...structuredAnswer,
        sql: structuredAnswer.sql ?? safeSql,
        model,
      });
    }

    return Response.json({ error: "Phase agent inconnue." }, { status: 400 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Erreur inconnue pendant l'analyse.",
        model,
      },
      { status: 200 },
    );
  }
}
