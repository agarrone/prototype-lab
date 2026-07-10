export const runtime = "nodejs";

type AgentRequest = {
  phase?: "plan" | "generate_sql" | "create_chart" | "synthesize";
  question?: string;
  resourceName?: string;
  tableName?: string;
  schema?: InspectSchemaResult;
  sql?: string;
  executionResult?: ExecuteSqlResult;
  previousSqlResults?: SqlExecutionEvidence[];
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
  usage?: TokenUsage;
};

type TokenUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
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

type SqlExecutionEvidence = {
  description?: string;
  sql: string;
  result: ExecuteSqlResult;
};

type VegaLiteSpec = Record<string, unknown>;

type AssistantToolCall =
  | {
      tool: "inspect_schema";
      arguments?: Record<string, never>;
    }
  | {
      tool: "execute_sql";
      arguments: {
        sql: string;
        description?: string;
        show?: boolean;
      };
    }
  | {
      tool: "create_chart";
      arguments: {
        description?: string;
        spec: VegaLiteSpec;
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

function parseJsonStringLiteral(value: string) {
  try {
    return JSON.parse(`"${value}"`) as string;
  } catch {
    return value.replace(/\\"/g, '"').replace(/\\n/g, "\n");
  }
}

function normalizeStructuredText(value: unknown) {
  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (Array.isArray(value)) {
    const lines = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);

    return lines.length > 0 ? lines.join("\n") : undefined;
  }

  return undefined;
}

function extractStructuredAnswerFields(content: string): Partial<StructuredAgentAnswer> {
  const cleanedContent = stripCodeFence(content);
  const answerMatch = cleanedContent.match(
    /"answer"\s*:\s*"((?:\\.|[^"\\])*)"/,
  );
  const reasoningArrayMatch = cleanedContent.match(
    /"reasoning"\s*:\s*\[([\s\S]*?)\]\s*,?\s*"sql"/,
  );
  const reasoningStringMatch = cleanedContent.match(
    /"reasoning"\s*:\s*"((?:\\.|[^"\\])*)"/,
  );
  const sqlMatch = cleanedContent.match(/"sql"\s*:\s*"((?:\\.|[^"\\])*)"/);

  const reasoning = reasoningArrayMatch
    ? Array.from(
        reasoningArrayMatch[1].matchAll(/"((?:\\.|[^"\\])*)"/g),
        (match) => parseJsonStringLiteral(match[1]).trim(),
      )
        .filter(Boolean)
        .join("\n")
    : reasoningStringMatch
      ? parseJsonStringLiteral(reasoningStringMatch[1]).trim()
      : undefined;

  return {
    answer: answerMatch ? parseJsonStringLiteral(answerMatch[1]).trim() : undefined,
    reasoning,
    sql: sqlMatch ? parseJsonStringLiteral(sqlMatch[1]).trim() : undefined,
  };
}

const defaultAlbertApiUrl =
  "https://albert.api.etalab.gouv.fr/v1/chat/completions";

const datasetAssistantSystemPrompt = `Tu es un assistant d'exploration de données pour data.gouv.fr.
Tu es un Dataset Viewer Assistant spécialisé, pas un assistant généraliste.
Tu aides l'utilisateur à explorer et analyser un fichier tabulaire chargé localement dans DuckDB-WASM.
Tu disposes uniquement de trois tools :
- inspect_schema
- execute_sql
- create_chart

Tool inspect_schema :
- À utiliser avant toute requête SQL si le schéma courant n'est pas déjà disponible.
- Sert à connaître le nom de table, le nombre de lignes, les colonnes, leurs types DuckDB et quelques exemples.
- Sert de preuve pour choisir les bonnes colonnes, les bons opérateurs et éviter les champs inventés.
- Ne suffit pas pour répondre à une question factuelle sur les valeurs du fichier : dans ce cas, il faut ensuite execute_sql.

Tool execute_sql :
- À utiliser pour toute réponse qui dépend des données : comptages, listes, exemples, agrégations, distributions, classements, filtres, échantillons.
- L'appel doit toujours inclure une description courte du but de la requête.
- Tu peux utiliser plusieurs appels execute_sql pour une même question si une requête exploratoire est utile avant la requête finale.
- Utilise show=false pour une requête exploratoire intermédiaire.
- Utilise show=true pour la requête finale dont le résultat sera présenté à l'utilisateur.
- Le SQL doit être en lecture seule, compatible DuckDB, et basé uniquement sur les colonnes du schéma.
- Pour les catégories nombreuses, utilise un top-N avec ORDER BY et LIMIT.
- Pour les résumés, pré-agrège en SQL avec GROUP BY, COUNT, AVG, MEDIAN, MIN, MAX ou équivalent.
- Filtre explicitement les NULL quand ils fausseraient un calcul ou une comparaison.
- Réutilise les résultats SQL précédents quand ils suffisent ; ne relance pas une requête inutile.

Tool create_chart :
- À utiliser uniquement quand l'utilisateur demande explicitement ou implicitement un graphique, une visualisation, un diagramme, une courbe, un histogramme ou une comparaison visuelle.
- Toujours utiliser execute_sql avant create_chart : les données du graphique doivent venir d'une requête SQL déjà exécutée.
- La spec doit être compatible Vega-Lite et contenir data.values avec les lignes déjà retournées par execute_sql.
- Pré-agrège toujours les données en SQL avant create_chart ; ne compte pas sur Vega-Lite pour faire les agrégations importantes.
- Limite les axes catégoriels à 20 catégories maximum, via une requête top-N si nécessaire.
- Filtre les valeurs NULL qui casseraient la visualisation et mentionne cette limite dans la réponse.

Principes fixes :
- Tool-aware : tu raisonnes d'abord sur la demande, puis tu utilises les tools seulement quand ils sont nécessaires.
- Evidence-first : toute réponse factuelle sur les données doit venir du contexte de ressource, du schéma inspecté ou du résultat execute_sql.
- Pas d'invention : tu ne devines jamais un nombre, un nom de colonne, une valeur ou une table.
- Concision : tu réponds brièvement, avec des puces si la réponse a plusieurs parties.
- Format tabulaire : quand le résultat est naturellement structuré en lignes et colonnes, utilise un tableau Markdown. C'est notamment le cas pour la liste des colonnes, les top-N, les classements, les distributions, les comparaisons et les exemples de lignes.
- Sécurité : tu ne modifies jamais les données.

Tu ne connais jamais le schéma à l'avance.
Tu dois toujours appeler inspect_schema en priorité avant le premier execute_sql d'une question qui nécessite les données.
Tu écris uniquement du SQL compatible DuckDB.
Tu privilégies des requêtes simples, lisibles, efficaces, et fondées sur les colonnes présentes dans le schéma.
Quand tu réponds à une question :
1. Comprends la demande.
2. Décide si les tools sont nécessaires.
3. Si la réponse dépend des données, inspecte le schéma si nécessaire.
4. Génère puis exécute une ou plusieurs requêtes SQL si nécessaire.
5. Si une visualisation est demandée, crée une spec graphique fondée sur le résultat SQL.
6. Explique brièvement le résultat ou la réponse directe.
Ne fais jamais d'hypothèse sur les noms de colonnes.
Si une information n'existe pas dans le fichier ou n'est pas prouvée par la requête, indique-le clairement.
Si l'utilisateur demande une visualisation, produis d'abord une requête SQL qui prépare les données au bon grain, puis utilise create_chart.`;

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

Si la question demande seulement si une information, un champ ou une colonne existe dans le fichier :
→ utilise inspect_schema ; execute_sql n'est nécessaire que si l'utilisateur demande ensuite une valeur calculée, un total, un top, une distribution ou des exemples de lignes.

Si le schéma n'est pas disponible et que les tools sont nécessaires :
→ appelle inspect_schema.
Sinon, si le schéma est disponible et que les tools sont nécessaires :
→ appelle execute_sql avec la prochaine requête SQL DuckDB utile.
Tu peux demander plusieurs execute_sql successifs si une première requête sert à explorer ou valider avant la requête finale.
Pour chaque requête, vise le minimum nécessaire : colonnes explicites, agrégations SQL, filtres sur les valeurs non nulles si nécessaire, LIMIT pour les listes ou échantillons.

Réponds uniquement avec du JSON valide :
{"action":"answer_direct","answer":"...","reasoning":"..."}
ou
{"action":"use_tools","tool":"inspect_schema","arguments":{}}
ou
{"action":"use_tools","tool":"execute_sql","arguments":{"sql":"SELECT ...","description":"...","show":true}}

Quand tu produis reasoning pour answer_direct, écris en langage naturel, en 2 à 4 phrases. Explique ce que tu as compris, pourquoi aucun tool n'est nécessaire, et quelle limite éventuelle tu gardes en tête. Ne révèle pas de chaîne de pensée interne : décris seulement la méthode observable.`;

const sqlGeneratorPrompt = `Tu génères un appel au tool execute_sql.
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
- ajouter une description courte, dans la langue de l'utilisateur, qui explique le but de la requête ;
- mettre show à true pour la requête finale qui répond à l'utilisateur ;
- ne produire aucun texte autour du JSON.

Format obligatoire :
{"action":"use_tools","tool":"execute_sql","arguments":{"description":"...","sql":"SELECT ...","show":true}}`;

const chartGeneratorPrompt = `Tu génères un appel au tool create_chart.
Les données SQL ont déjà été exécutées localement. Tu dois créer une spec Vega-Lite simple et lisible.

Contraintes :
- produire uniquement du JSON valide ;
- utiliser uniquement les colonnes présentes dans execute_sql output ;
- inclure data.values avec les lignes SQL fournies, sans inventer de valeur ;
- choisir mark parmi "bar", "line", "point", "arc" ;
- pour une comparaison catégorielle, préfère mark "bar" ;
- pour une série temporelle, préfère mark "line" si une colonne date/timestamp existe ;
- pour une distribution numérique, préfère mark "bar" avec les données déjà groupées par SQL ;
- ajouter des titres lisibles aux axes ;
- ajouter tooltip sur les champs affichés ;
- ne pas fixer width ou height ;
- ne pas produire de texte autour du JSON.

Format obligatoire :
{"action":"use_tools","tool":"create_chart","arguments":{"description":"...","spec":{"$schema":"https://vega.github.io/schema/vega-lite/v5.json","mark":{"type":"bar","tooltip":true},"data":{"values":[...]},"encoding":{...}}}}`;

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
      arguments: {
        sql: sanitizeSelectSql(parsed.arguments.sql),
        description:
          "description" in parsed.arguments &&
          typeof parsed.arguments.description === "string"
            ? parsed.arguments.description.trim()
            : undefined,
        show:
          "show" in parsed.arguments &&
          typeof parsed.arguments.show === "boolean"
            ? parsed.arguments.show
            : true,
      },
    };
  }

  if (
    parsed.tool === "create_chart" &&
    typeof parsed.arguments === "object" &&
    parsed.arguments !== null &&
    "spec" in parsed.arguments &&
    typeof parsed.arguments.spec === "object" &&
    parsed.arguments.spec !== null
  ) {
    return {
      tool: "create_chart",
      arguments: {
        description:
          "description" in parsed.arguments &&
          typeof parsed.arguments.description === "string"
            ? parsed.arguments.description.trim()
            : undefined,
        spec: parsed.arguments.spec as VegaLiteSpec,
      },
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
    const parsed = parseJsonObject<
      Partial<{
        answer: unknown;
        reasoning: unknown;
        sql: unknown;
      }>
    >(content);
    const answer = normalizeStructuredText(parsed.answer);
    const fallbackFields = answer ? undefined : extractStructuredAnswerFields(content);

    return {
      answer: answer || fallbackFields?.answer || stripCodeFence(content),
      reasoning:
        normalizeStructuredText(parsed.reasoning) || fallbackFields?.reasoning,
      sql: normalizeStructuredText(parsed.sql) || fallbackFields?.sql,
    };
  } catch {
    const extractedFields = extractStructuredAnswerFields(content);

    return {
      answer: extractedFields.answer || stripCodeFence(content),
      reasoning: extractedFields.reasoning,
      sql: extractedFields.sql,
    };
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
    throw new Error(`Le service de génération n'a pas pu répondre. ${detail}`);
  }

  const data = (await response.json()) as AlbertChatResponse;

  return {
    content: data.choices?.[0]?.message?.content?.trim() ?? "",
    usage: data.usage,
  };
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
          "Clé API du service de génération absente. Ajoutez ALBERT_API_KEY dans .env.local.",
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
      const plannerResponse = await callAlbert({
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
      const plannerDecision = parsePlannerDecision(plannerResponse.content);

      if (plannerDecision.action === "answer_direct") {
        return Response.json({
          answer: plannerDecision.answer,
          reasoning: plannerDecision.reasoning,
          model,
          usage: plannerResponse.usage,
        });
      }

      return Response.json({
        toolCall: plannerDecision.toolCall,
        model,
        usage: plannerResponse.usage,
      });
    }

    if (phase === "generate_sql") {
      if (!body.schema) {
        return Response.json(
          { error: "Le schéma inspecté est obligatoire." },
          { status: 400 },
        );
      }

      const sqlResponse = await callAlbert({
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

Requêtes SQL déjà exécutées pour cette question:
${JSON.stringify(body.previousSqlResults ?? [], null, 2)}

Historique de discussion récent:
${JSON.stringify(conversationHistory, null, 2)}

Question utilisateur: ${question}

Réponds uniquement avec le prochain appel tool execute_sql en JSON, incluant description, sql et show.
Si une requête précédente suffit déjà, génère une requête finale simple qui expose le résultat utile avec show=true.`,
          },
        ],
      });

      return Response.json({
        toolCall: parseToolCall(sqlResponse.content),
        model,
        usage: sqlResponse.usage,
      });
    }

    if (phase === "create_chart") {
      if (!body.schema || !body.sql || !body.executionResult) {
        return Response.json(
          { error: "Le schéma, le SQL et le résultat SQL sont obligatoires." },
          { status: 400 },
        );
      }

      const chartResponse = await callAlbert({
        apiKey,
        apiUrl,
        model,
        messages: [
          {
            role: "system",
            content: `${datasetAssistantSystemPrompt}

${chartGeneratorPrompt}`,
          },
          {
            role: "user",
            content: `Ressource: ${resourceName}
Question utilisateur: ${question}
Tool inspect_schema output:
${JSON.stringify(body.schema, null, 2)}

SQL exécuté:
${sanitizeSelectSql(body.sql)}

Tool execute_sql output:
${JSON.stringify(body.executionResult, null, 2)}

Réponds uniquement avec le prochain appel tool create_chart en JSON.`,
          },
        ],
      });

      return Response.json({
        toolCall: parseToolCall(chartResponse.content),
        model,
        usage: chartResponse.usage,
      });
    }

    if (phase === "synthesize") {
      const sqlEvidence =
        body.previousSqlResults ??
        (body.sql && body.executionResult
          ? [{ sql: body.sql, result: body.executionResult }]
          : []);

      if (!body.schema || sqlEvidence.length === 0) {
        return Response.json(
          { error: "Le schéma et au moins un résultat SQL sont obligatoires." },
          { status: 400 },
        );
      }

      const finalSql = sanitizeSelectSql(sqlEvidence.at(-1)?.sql ?? "");
      const answerResponse = await callAlbert({
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
- reasoning: chaîne de texte en langage naturel, plus détaillée que la réponse, décrivant la méthode observable. Ne retourne jamais un tableau.
- sql: SQL exécuté
Règles pour reasoning :
- écris 3 à 6 phrases courtes dans une seule chaîne JSON ;
- explique ce que tu as compris de la question ;
- indique que j'ai vérifié la structure du fichier avant d'analyser les données, avec les colonnes utiles retenues ;
- indique pourquoi l'analyse effectuée répond à la question ;
- mentionne les limites visibles : LIMIT, valeurs NULL filtrées, top-N, colonnes absentes ou résultat vide ;
- reste en langage naturel, sans jargon inutile ;
- ne mentionne pas Albert, DuckDB-WASM, inspect_schema ou execute_sql dans answer ou reasoning ;
- ne révèle pas de chaîne de pensée interne, ne spécule pas, et ne mentionne que les preuves fournies.
Règles de synthèse :
- commence par le résultat concret ;
- utilise un tableau Markdown lorsque la réponse est naturellement tabulaire : colonnes du fichier, top-N, classement, distribution, comparaison ou exemples de lignes ;
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
${finalSql}

Historique des tool execute_sql:
${JSON.stringify(sqlEvidence, null, 2)}`,
          },
        ],
      });
      const structuredAnswer = answerResponse.content
        ? parseStructuredAnswer(answerResponse.content)
        : {
            answer: "Je n’ai pas reçu de réponse exploitable.",
          };

      return Response.json({
        ...structuredAnswer,
        sql: structuredAnswer.sql ?? finalSql,
        model,
        usage: answerResponse.usage,
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
