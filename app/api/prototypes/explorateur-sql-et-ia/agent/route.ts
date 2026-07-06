import { execFile } from "node:child_process";
import { stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

export const runtime = "nodejs";

type AgentRequest = {
  question?: string;
  resourceId?: string;
  resourceName?: string;
  tableName?: string;
  columns?: string[];
  previewRows?: Record<string, string>[];
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

type StructuredAgentAnswer = {
  answer: string;
  reasoning?: string;
  sql?: string;
  chart?: ChartSpec;
};

type SqlGeneration = {
  sql: string;
  reasoning?: string;
  chart?: ChartSpec;
};

type ChartSpec = {
  type: "bar" | "line" | "histogram" | "map";
  title: string;
  xKey: string;
  yKey: string;
  data: Record<string, unknown>[];
};

type ToolTraceItem = {
  tool: "get_resource_context" | "execute_query" | "create_chart";
  summary: string;
  show?: boolean;
};

type ProposedAction =
  | {
      type: "apply_filter";
      payload: {
        filters: ProposedFilter[];
      };
    }
  | {
      type: "none";
    };

type ProposedFilter = {
  key: string;
  label: string;
  value: string;
  type: string;
  count: number;
};

const defaultAlbertApiUrl =
  "https://albert.api.etalab.gouv.fr/v1/chat/completions";
const resourceConfigs = {
  resultats_electoraux: {
    tableName: "resultats_electoraux",
    url: "https://www.data.gouv.fr/api/1/datasets/r/ff16d511-10c0-405e-9b35-511723948fce",
    cacheFileName: "prototype-lab-resultats-electoraux.parquet",
  },
  deces: {
    tableName: "deces",
    url: "https://www.data.gouv.fr/api/1/datasets/r/d7aed239-8dc1-46dd-bc66-3d18097cb7ea",
    cacheFileName: "prototype-lab-deces.parquet",
  },
} satisfies Record<
  string,
  {
    tableName: string;
    url: string;
    cacheFileName: string;
  }
>;
const resultLimit = 50;
const execFileAsync = promisify(execFile);

const datasetMetadata = {
  resultats_electoraux: {
    title: "Résultats électoraux consolidés",
    description:
      "Ressource de résultats électoraux consolidés par élection, département, commune et bureau de vote.",
    tags: ["élections", "résultats", "communes", "départements"],
    producer: "data.gouv.fr",
    updateFrequency: "Ponctuelle",
  },
  deces: {
    title: "Fichier des personnes décédées",
    description:
      "Fichier national des personnes décédées, distribué sous forme de ressource Parquet.",
    tags: ["décès", "état civil", "personnes"],
    producer: "INSEE",
    updateFrequency: "Mensuelle",
  },
};

const resourceSchemas = {
  resultats_electoraux: [
  { key: "id_election", type: "identifier", description: "Identifiant de l’élection" },
  { key: "id_brut_miom", type: "identifier", description: "Identifiant source MIOM" },
  { key: "code_departement", type: "referenceData", description: "Code département" },
  { key: "libelle_departement", type: "reference", description: "Nom du département" },
  { key: "code_commune", type: "identifier", description: "Code commune" },
  { key: "libelle_commune", type: "reference", description: "Nom de la commune" },
  { key: "code_bv", type: "identifier", description: "Code bureau de vote" },
  { key: "inscrits", type: "number", description: "Nombre d’inscrits" },
  { key: "abstentions", type: "number", description: "Nombre d’abstentions" },
  { key: "votants", type: "number", description: "Nombre de votants" },
  { key: "blancs", type: "number", description: "Nombre de bulletins blancs" },
  { key: "nuls", type: "number", description: "Nombre de bulletins nuls" },
  { key: "exprimes", type: "number", description: "Nombre de suffrages exprimés" },
  {
    key: "ratio_abstentions_inscrits",
    type: "number",
    description: "Part des abstentions parmi les inscrits",
  },
  {
    key: "ratio_votants_inscrits",
    type: "number",
    description: "Part des votants parmi les inscrits",
  },
  {
    key: "ratio_exprimes_votants",
    type: "number",
    description: "Part des exprimés parmi les votants",
  },
  ],
  deces: [
    { key: "nomprenom", type: "text", description: "Nom et prénoms de la personne décédée" },
    { key: "sexe", type: "category", description: "Sexe" },
    { key: "datenaiss", type: "date", description: "Date de naissance" },
    { key: "codelieunaiss", type: "identifier", description: "Code du lieu de naissance" },
    { key: "lieunaiss", type: "reference", description: "Lieu de naissance" },
    { key: "paysnaiss", type: "reference", description: "Pays de naissance" },
    { key: "datedeces", type: "date", description: "Date de décès" },
    { key: "codelieudeces", type: "identifier", description: "Code du lieu de décès" },
    { key: "lieudeces", type: "reference", description: "Lieu de décès" },
    { key: "actedeces", type: "identifier", description: "Numéro d’acte de décès" },
  ],
} satisfies Record<
  string,
  {
    key: string;
    type: string;
    description: string;
  }[]
>;

const datasetAssistantSystemPrompt = `You are a dataset exploration assistant embedded in the data.gouv.fr tabular explorer.
You help users understand, explore, query and visualise a single tabular resource.
You are not a general-purpose assistant.
You only operate on the currently opened resource.
Your answers must always be grounded in:
- resource context
- profiling
- dataset metadata
- query results
Never invent data, columns, values or counts.
Core principles:
- evidence-first
- tool-driven
- profiling-assisted
You have access to these tools:
- get_resource_context
- execute_query
- create_chart
Use them whenever necessary.
Use profiling to guide query planning.
Use SQL to obtain final evidence.
If ambiguous, ask.
If empty, explain.
If impossible, say so.
Be concise, factual and pedagogical.

Tool prompt — get_resource_context
Use get_resource_context when:
- you are unsure about the schema
- you need profiling information
- you need metadata context
- you need to generate starter questions
The resource context includes:
- schema
- profiling
- metadata
Use profiling to:
- detect null-heavy columns
- detect high-cardinality columns
- identify common values
- identify date ranges
- identify geographic dimensions
- guide SQL query design
Do not use profiling as final evidence.

Tool prompt — execute_query
Use execute_query whenever the answer requires actual data.
This includes:
- counts
- samples
- filtering
- sorting
- aggregations
- rankings
- distributions
Rules:
- never use SELECT *
- select only needed columns
- always LIMIT raw row outputs
- aggregate in SQL whenever possible
- filter NULL values explicitly when relevant
- use ORDER BY for rankings
- limit high-cardinality outputs to top-N
Use:
show=false for exploratory queries
show=true only for final queries
Exploratory queries may be used to:
- inspect distinct values
- inspect distributions
- validate assumptions
- inspect samples
Final queries must directly answer the user’s question.

Tool prompt — create_chart
Use create_chart when:
- the user explicitly asks for a chart
- the result is easier to understand visually
- the question concerns trends, distributions, rankings or geography
Always prepare data first with SQL.
Rules:
- aggregate before charting
- filter NULL values
- limit categories to top-N when necessary
- sort values appropriately
Use:
- bar charts for categories
- line charts for time
- histograms for distributions
- maps for geographic data
Prefer maps when the user asks about location, spatial distribution, or geographic coverage.`;

function parseNumericCell(row: Record<string, string>, key: string) {
  const value = Number(row[key]);

  return Number.isFinite(value) ? value : 0;
}

function buildPreviewContext(previewRows: Record<string, string>[] = []) {
  const numericTotals = ["inscrits", "abstentions", "votants", "blancs", "nuls", "exprimes"].map(
    (key) => ({
      key,
      total: previewRows.reduce((sum, row) => sum + parseNumericCell(row, key), 0),
    }),
  );
  const byDepartment = previewRows.reduce<Record<string, number>>((accumulator, row) => {
    const label = row.libelle_departement || row.code_departement || "Non renseigné";
    accumulator[label] = (accumulator[label] ?? 0) + parseNumericCell(row, "votants");

    return accumulator;
  }, {});
  const byElection = previewRows.reduce<Record<string, number>>((accumulator, row) => {
    const label = row.id_election || "Non renseigné";
    accumulator[label] = (accumulator[label] ?? 0) + 1;

    return accumulator;
  }, {});

  return {
    rowCount: previewRows.length,
    numericTotals,
    byDepartment,
    byElection,
    sampleRows: previewRows.slice(0, 8),
  };
}

function normalizePreviewRow(row: Record<string, string>) {
  return {
    id_election: row.id_election ?? row.idElection ?? "",
    id_brut_miom: row.id_brut_miom ?? row.idBrutMiom ?? "",
    code_departement: row.code_departement ?? row.codeDepartement ?? "",
    libelle_departement: row.libelle_departement ?? row.libelleDepartement ?? "",
    code_commune: row.code_commune ?? row.codeCommune ?? "",
    libelle_commune: row.libelle_commune ?? row.libelleCommune ?? "",
    code_bv: row.code_bv ?? row.codeBv ?? "",
    inscrits: row.inscrits ?? "",
    abstentions: row.abstentions ?? "",
    votants: row.votants ?? "",
    blancs: row.blancs ?? "",
    nuls: row.nuls ?? "",
    exprimes: row.exprimes ?? "",
    ratio_abstentions_inscrits:
      row.ratio_abstentions_inscrits ?? row.ratioAbstentionsInscrits ?? "",
    ratio_votants_inscrits:
      row.ratio_votants_inscrits ?? row.ratioVotantsInscrits ?? "",
    ratio_exprimes_votants:
      row.ratio_exprimes_votants ?? row.ratioExprimesVotants ?? "",
  };
}

function getFrequentValues(
  previewRows: Record<string, string>[],
  key: string,
) {
  const counts = previewRows.reduce<Map<string, number>>((accumulator, row) => {
    const value = row[key];

    if (!value) {
      return accumulator;
    }

    accumulator.set(value, (accumulator.get(value) ?? 0) + 1);
    return accumulator;
  }, new Map<string, number>());

  return Array.from(counts.entries())
    .sort((first, second) => second[1] - first[1])
    .slice(0, 5)
    .map(([value, count]) => ({ value, count }));
}

function getResourceSchema(resourceId: string) {
  return (
    resourceSchemas[resourceId as keyof typeof resourceSchemas] ??
    resourceSchemas.resultats_electoraux
  );
}

function getResourceMetadata(resourceId: string) {
  return (
    datasetMetadata[resourceId as keyof typeof datasetMetadata] ??
    datasetMetadata.resultats_electoraux
  );
}

function getResourceContext(resourceId: string, previewRows: Record<string, string>[] = []) {
  const schema = getResourceSchema(resourceId);
  const profiling = schema.map((column) => {
    const values = previewRows.map((row) => row[column.key]).filter(Boolean);
    const numericValues = values
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    return {
      key: column.key,
      type: column.type,
      nullCount: Math.max(0, previewRows.length - values.length),
      cardinality: new Set(values).size,
      frequentValues: getFrequentValues(previewRows, column.key),
      min:
        numericValues.length > 0
          ? Math.min(...numericValues)
          : values.slice().sort()[0],
      max:
        numericValues.length > 0
          ? Math.max(...numericValues)
          : values.slice().sort().at(-1),
    };
  });

  return {
    schema,
    profiling: {
      rowCount: previewRows.length,
      columns: profiling,
      geographicDimensions: [
        "code_departement",
        "libelle_departement",
        "code_commune",
        "libelle_commune",
      ],
    },
    metadata: getResourceMetadata(resourceId),
  };
}

function parseStructuredAnswer(content: string): StructuredAgentAnswer {
  const cleanedContent = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleanedContent) as Partial<StructuredAgentAnswer>;

    return {
      answer: parsed.answer?.trim() || content,
      reasoning: parsed.reasoning?.trim(),
      sql: parsed.sql?.trim(),
      chart: parsed.chart,
    };
  } catch {
    return { answer: content };
  }
}

function parseSqlGeneration(content: string): SqlGeneration {
  const cleanedContent = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleanedContent) as Partial<SqlGeneration>;

    return {
      sql: parsed.sql?.trim() ?? "",
      reasoning: parsed.reasoning?.trim(),
      chart: parsed.chart,
    };
  } catch {
    return { sql: cleanedContent };
  }
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

async function ensureParquetFile(resourceId: string) {
  const resourceConfig =
    resourceConfigs[resourceId as keyof typeof resourceConfigs] ??
    resourceConfigs.resultats_electoraux;
  const parquetPath = path.join(tmpdir(), resourceConfig.cacheFileName);

  try {
    const file = await stat(parquetPath);

    if (file.size > 0) {
      return parquetPath;
    }
  } catch {
    // The first query downloads the parquet file into the system temp folder.
  }

  const response = await fetch(resourceConfig.url);

  if (!response.ok) {
    throw new Error(`Impossible de télécharger le fichier Parquet (${response.status}).`);
  }

  const parquetBuffer = Buffer.from(await response.arrayBuffer());
  await writeFile(parquetPath, parquetBuffer);

  return parquetPath;
}

function sanitizeSelectSql(sql: string) {
  const trimmedSql = sql.trim().replace(/;+\s*$/g, "");
  const forbiddenPattern =
    /\b(insert|update|delete|drop|alter|create|attach|detach|copy|install|load|pragma|call)\b/i;

  if (!/^(select|with)\b/i.test(trimmedSql) || forbiddenPattern.test(trimmedSql)) {
    throw new Error("La requête générée n'est pas une requête SELECT autorisée.");
  }

  return trimmedSql;
}

async function runDuckDbQuery({
  sql,
  resourceId,
  tableName,
}: {
  sql: string;
  resourceId: string;
  tableName: string;
}) {
  const localParquetPath = await ensureParquetFile(resourceId);
  const safeSql = sanitizeSelectSql(sql);
  const scriptPath = path.join(process.cwd(), "scripts", "run-duckdb-query.cjs");
  const { stdout } = await execFileAsync(
    process.execPath,
    [scriptPath, localParquetPath, safeSql, String(resultLimit), tableName],
    { maxBuffer: 1024 * 1024 * 10 },
  );

  return JSON.parse(stdout) as Record<string, unknown>[];
}

async function executeQuery({
  sql,
  show,
  resourceId,
  tableName,
}: {
  sql: string;
  show: boolean;
  resourceId: string;
  tableName: string;
}) {
  return {
    tool: "execute_query" as const,
    show,
    sql: sanitizeSelectSql(sql),
    rows: await runDuckDbQuery({ sql, resourceId, tableName }),
  };
}

function createChart({
  chart,
  rows,
}: {
  chart?: ChartSpec;
  rows: Record<string, unknown>[];
}) {
  if (!chart) {
    return undefined;
  }

  return {
    ...chart,
    data: rows.slice(0, 12),
  };
}

const sqlColumnToClientKey: Record<string, string> = {
  id_election: "idElection",
  id_brut_miom: "idBrutMiom",
  code_departement: "codeDepartement",
  libelle_departement: "libelleDepartement",
  code_commune: "codeCommune",
  libelle_commune: "libelleCommune",
  code_bv: "codeBv",
  inscrits: "inscrits",
  abstentions: "abstentions",
  votants: "votants",
  blancs: "blancs",
  nuls: "nuls",
  exprimes: "exprimes",
  ratio_abstentions_inscrits: "ratioAbstentionsInscrits",
  ratio_votants_inscrits: "ratioVotantsInscrits",
  ratio_exprimes_votants: "ratioExprimesVotants",
};

function inferProposedActionFromSql({
  sql,
  previewRows,
  resourceId,
}: {
  sql: string;
  previewRows: Record<string, string>[];
  resourceId: string;
}): ProposedAction {
  const schema = getResourceSchema(resourceId);
  const filters = Array.from(
    sql.matchAll(/\b([a-z_]+)\s*=\s*'([^']+)'/gi),
  )
    .map((match) => {
      const sqlKey = match[1].toLowerCase();
      const clientKey = sqlColumnToClientKey[sqlKey];
      const column = schema.find((item) => item.key === sqlKey);

      if (!clientKey || !column) {
        return null;
      }

      const value = match[2].replace(/''/g, "'");
      const count = previewRows.filter((row) => row[sqlKey] === value).length;

      return {
        key: clientKey,
        label: sqlKey,
        value,
        type: column.type,
        count,
      };
    })
    .filter(Boolean) as ProposedFilter[];

  return filters.length > 0
    ? {
        type: "apply_filter",
        payload: { filters },
      }
    : { type: "none" };
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
  const question = body.question?.trim();

  if (!question) {
    return Response.json(
      { error: "La question est obligatoire." },
      { status: 400 },
    );
  }

  const resourceId =
    body.resourceId && body.resourceId in resourceConfigs
      ? body.resourceId
      : "resultats_electoraux";
  const resourceConfig =
    resourceConfigs[resourceId as keyof typeof resourceConfigs];
  const columns = body.columns?.length ? body.columns.join(", ") : "non renseignées";
  const tableName = body.tableName ?? resourceConfig.tableName;
  const resourceName = body.resourceName ?? "Résultats électoraux consolidés";
  const previewRows = (body.previewRows ?? []).map(normalizePreviewRow);
  const conversationHistory = (body.conversationHistory ?? [])
    .slice(-8)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, 1200),
    }));
  const previewContext = buildPreviewContext(previewRows);
  const resourceContext = getResourceContext(resourceId, previewRows);
  const toolTrace: ToolTraceItem[] = [
    {
      tool: "get_resource_context",
      summary: "Schéma, profiling et métadonnées de la ressource active lus.",
    },
  ];
  let generatedSql = "";
  let generatedReasoning = "";
  let queryRows: Record<string, unknown>[] = [];
  let chart: ChartSpec | undefined;
  let proposedAction: ProposedAction = { type: "none" };

  try {
    const sqlGenerationContent = await callAlbert({
      apiKey,
      apiUrl,
      model,
      messages: [
        {
          role: "system",
          content: `${datasetAssistantSystemPrompt}

You are now planning the tool use. Return only valid JSON with:
{
  "sql": "final SQL for execute_query with show=true",
  "reasoning": "short planning note",
  "chart": optional {"type":"bar|line|histogram|map","title":"...","xKey":"...","yKey":"...","data":[]}
}
Do not answer the user yet. Use table ${tableName}. SQL column names are snake_case.`,
        },
        {
          role: "user",
          content: `Ressource: ${resourceName}
Table SQL: ${tableName}
Colonnes disponibles: ${columns}
Tool get_resource_context output:
${JSON.stringify(resourceContext, null, 2)}

Contexte calculé sur l'aperçu courant:
${JSON.stringify(previewContext, null, 2)}

Historique de discussion récent:
${JSON.stringify(conversationHistory, null, 2)}

Question utilisateur: ${question}`,
        },
      ],
    });
    const sqlGeneration = parseSqlGeneration(sqlGenerationContent);
    generatedSql = sqlGeneration.sql;
    generatedReasoning = sqlGeneration.reasoning ?? "";
    const queryResult = await executeQuery({
      sql: generatedSql,
      show: true,
      resourceId,
      tableName,
    });
    queryRows = queryResult.rows;
    proposedAction = inferProposedActionFromSql({
      sql: generatedSql,
      previewRows,
      resourceId,
    });
    chart = createChart({ chart: sqlGeneration.chart, rows: queryRows });
    toolTrace.push({
      tool: "execute_query",
      summary: `${queryRows.length} lignes retournées pour la requête finale.`,
      show: true,
    });
    if (chart) {
      toolTrace.push({
        tool: "create_chart",
        summary: `Visualisation ${chart.type} préparée à partir du résultat SQL.`,
      });
    }
  } catch (error) {
    return Response.json(
      {
        answer:
          "Je n'ai pas réussi à exécuter une requête sur le fichier complet.",
        reasoning:
          error instanceof Error ? error.message : "Erreur inconnue pendant l'analyse.",
        sql: generatedSql,
        model,
        toolTrace,
        proposedAction,
      },
      { status: 200 },
    );
  }

  const rawAnswer = await callAlbert({
    apiKey,
    apiUrl,
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `${datasetAssistantSystemPrompt}

You are now writing the final answer. Return only valid JSON with keys:
- answer: concise answer in the language of the user question
- reasoning: short method summary
- sql: the final SQL that was executed
If the result is empty, explain clearly and suggest a reformulation. Do not invent values.`,
      },
      {
        role: "user",
        content: `Question utilisateur: ${question}
Ressource: ${resourceName}
Table SQL: ${tableName}
Tool get_resource_context output:
${JSON.stringify(resourceContext, null, 2)}

Requête exécutée:
${generatedSql}
Raisonnement de génération:
${generatedReasoning}
Historique de discussion récent:
${JSON.stringify(conversationHistory, null, 2)}

Résultats DuckDB (${queryRows.length} lignes maximum):
${JSON.stringify(queryRows, null, 2)}`,
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
    chart,
    queryRows: queryRows.slice(0, 12),
    toolTrace,
    proposedAction,
    model,
  });
}
