import { execFile } from "node:child_process";
import { stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

export const runtime = "nodejs";

type AgentRequest = {
  question?: string;
  resourceName?: string;
  tableName?: string;
  columns?: string[];
  previewRows?: Record<string, string>[];
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
};

type SqlGeneration = {
  sql: string;
  reasoning?: string;
};

const defaultAlbertApiUrl =
  "https://albert.api.etalab.gouv.fr/v1/chat/completions";
const parquetUrl =
  "https://www.data.gouv.fr/api/1/datasets/r/ff16d511-10c0-405e-9b35-511723948fce";
const parquetPath = path.join(
  tmpdir(),
  "prototype-lab-resultats-electoraux.parquet",
);
const resultLimit = 50;
const execFileAsync = promisify(execFile);

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
    const label = row.libelleDepartement || row.codeDepartement || "Non renseigné";
    accumulator[label] = (accumulator[label] ?? 0) + parseNumericCell(row, "votants");

    return accumulator;
  }, {});
  const byElection = previewRows.reduce<Record<string, number>>((accumulator, row) => {
    const label = row.idElection || "Non renseigné";
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

async function ensureParquetFile() {
  try {
    const file = await stat(parquetPath);

    if (file.size > 0) {
      return parquetPath;
    }
  } catch {
    // The first query downloads the parquet file into the system temp folder.
  }

  const response = await fetch(parquetUrl);

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

async function runDuckDbQuery(sql: string) {
  const localParquetPath = await ensureParquetFile();
  const safeSql = sanitizeSelectSql(sql);
  const scriptPath = path.join(process.cwd(), "scripts", "run-duckdb-query.cjs");
  const { stdout } = await execFileAsync(
    process.execPath,
    [scriptPath, localParquetPath, safeSql, String(resultLimit)],
    { maxBuffer: 1024 * 1024 * 10 },
  );

  return JSON.parse(stdout) as Record<string, unknown>[];
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

  const columns = body.columns?.length ? body.columns.join(", ") : "non renseignées";
  const tableName = body.tableName ?? "resultats_electoraux";
  const resourceName = body.resourceName ?? "Résultats électoraux consolidés";
  const previewContext = buildPreviewContext(body.previewRows);
  let generatedSql = "";
  let generatedReasoning = "";
  let queryRows: Record<string, unknown>[] = [];

  try {
    const sqlGenerationContent = await callAlbert({
      apiKey,
      apiUrl,
      model,
      messages: [
        {
          role: "system",
          content:
            "Tu génères une requête SQL DuckDB pour répondre à une question sur une table Parquet électorale. Réponds uniquement en JSON valide avec les clés sql et reasoning. La requête doit être un SELECT ou WITH, utiliser la table resultats_electoraux, et rester concise. N'utilise pas INSTALL, LOAD, COPY, CREATE, DROP, UPDATE, DELETE, INSERT ou PRAGMA.",
        },
        {
          role: "user",
          content: `Ressource: ${resourceName}
Table SQL: ${tableName}
Colonnes disponibles: ${columns}
Contexte calculé sur l'aperçu courant:
${JSON.stringify(previewContext, null, 2)}

Question utilisateur: ${question}`,
        },
      ],
    });
    const sqlGeneration = parseSqlGeneration(sqlGenerationContent);
    generatedSql = sqlGeneration.sql;
    generatedReasoning = sqlGeneration.reasoning ?? "";
    queryRows = await runDuckDbQuery(generatedSql);
  } catch (error) {
    return Response.json(
      {
        answer:
          "Je n'ai pas réussi à exécuter une requête sur le fichier complet.",
        reasoning:
          error instanceof Error ? error.message : "Erreur inconnue pendant l'analyse.",
        sql: generatedSql,
        model,
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
        content:
          "Tu es un assistant data pour data.gouv.fr. Réponds en français, en texte clair et concis. Tu reçois une question, la requête SQL exécutée sur le fichier Parquet complet, et les résultats. Réponds uniquement en JSON valide avec les clés answer, reasoning et sql. answer doit donner la réponse utilisateur en texte. reasoning doit résumer la méthode. sql doit reprendre la requête SQL exécutée.",
      },
      {
        role: "user",
        content: `Question utilisateur: ${question}
Ressource: ${resourceName}
Table SQL: ${tableName}
Requête exécutée:
${generatedSql}
Raisonnement de génération:
${generatedReasoning}
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
    model,
  });
}
