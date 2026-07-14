import * as duckdb from "@duckdb/duckdb-wasm";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

export type InspectSchemaResult = {
  table: string;
  rows: number | string;
  columns: {
    name: string;
    type: string;
    examples: unknown[];
  }[];
};

export type ExecuteSqlResult = {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
};

export type DatasetRowsResult = {
  columns: string[];
  rows: Record<string, unknown>[];
  offset: number;
  limit: number;
  totalRows: number;
};

export type DatasetQuery = {
  columns: string[];
  search?: string;
  categoryFilters?: Record<string, string[]>;
  numberRanges?: Record<string, { min?: string; max?: string }>;
  dateFilters?: Record<
    string,
    { mode: "before" | "after" | "between"; value: string; endValue: string }
  >;
  sort?: { key: string; direction: "asc" | "desc" } | null;
  limit: number;
  offset: number;
};

const defaultParquetUrl =
  "https://hydra.s3.rbx.io.cloud.ovh.net/parquet/f868cca6-8da1-4369-a78d-47463f19a9a3.parquet";
const parquetFileName = "catalogue-data-gouv.parquet";
const tableName = "data";
const resultLimit = 50;

let connectionPromise: Promise<AsyncDuckDBConnection> | null = null;
let activeParquetUrl = defaultParquetUrl;
let activeDatabase: duckdb.AsyncDuckDB | null = null;
let activeWorker: Worker | null = null;

function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function quoteLiteral(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

function buildWhereClause(query: DatasetQuery) {
  const conditions: string[] = [];
  const search = query.search?.trim();

  if (search && query.columns.length > 0) {
    const pattern = quoteLiteral(`%${search}%`);
    conditions.push(
      `(${query.columns
        .map(
          (column) =>
            `CAST(${quoteIdentifier(column)} AS VARCHAR) ILIKE ${pattern}`,
        )
        .join(" OR ")})`,
    );
  }

  Object.entries(query.categoryFilters ?? {}).forEach(([column, values]) => {
    if (values.length === 0) return;
    conditions.push(
      `${quoteIdentifier(column)} IN (${values.map(quoteLiteral).join(", ")})`,
    );
  });

  Object.entries(query.numberRanges ?? {}).forEach(([column, range]) => {
    if (range.min?.trim()) {
      const min = Number(range.min);
      if (Number.isFinite(min)) {
        conditions.push(
          `TRY_CAST(${quoteIdentifier(column)} AS DOUBLE) >= ${min}`,
        );
      }
    }
    if (range.max?.trim()) {
      const max = Number(range.max);
      if (Number.isFinite(max)) {
        conditions.push(
          `TRY_CAST(${quoteIdentifier(column)} AS DOUBLE) <= ${max}`,
        );
      }
    }
  });

  Object.entries(query.dateFilters ?? {}).forEach(([column, filter]) => {
    if (!filter.value.trim() && !filter.endValue.trim()) return;
    const field = `TRY_CAST(${quoteIdentifier(column)} AS TIMESTAMP)`;
    if (filter.mode === "before" && filter.value) {
      conditions.push(`${field} < TRY_CAST(${quoteLiteral(filter.value)} AS TIMESTAMP)`);
    } else if (filter.mode === "after" && filter.value) {
      conditions.push(`${field} > TRY_CAST(${quoteLiteral(filter.value)} AS TIMESTAMP)`);
    } else if (filter.mode === "between") {
      if (filter.value) {
        conditions.push(`${field} >= TRY_CAST(${quoteLiteral(filter.value)} AS TIMESTAMP)`);
      }
      if (filter.endValue) {
        conditions.push(`${field} <= TRY_CAST(${quoteLiteral(filter.endValue)} AS TIMESTAMP)`);
      }
    }
  });

  return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
}

function normalizeValue(value: unknown): unknown {
  if (typeof value === "bigint") {
    return Number.isSafeInteger(Number(value)) ? Number(value) : value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string" && value.length > 240) {
    return `${value.slice(0, 237)}...`;
  }

  return value;
}

function tableToRows(table: { schema: { fields: { name: string }[] }; toArray: () => unknown[] }) {
  const columns = table.schema.fields.map((field) => field.name);

  return table.toArray().map((row) => {
    const record = row as Record<string, unknown>;

    return Object.fromEntries(
      columns.map((column) => [column, normalizeValue(record[column])]),
    );
  });
}

function sanitizeSelectSql(sql: string) {
  const trimmedSql = sql.trim().replace(/^```(?:sql)?\s*/i, "").replace(/```$/i, "").replace(/;+\s*$/g, "");
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

function normalizeParquetUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Le lien Parquet n’est pas une URL valide.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Le lien Parquet doit utiliser HTTP ou HTTPS.");
  }

  if (!url.pathname.toLowerCase().endsWith(".parquet")) {
    throw new Error("Le lien doit cibler un fichier .parquet.");
  }

  return url.toString();
}

async function createConnection(parquetUrl: string) {
  const bundles: duckdb.DuckDBBundles = {
    mvp: {
      mainModule: new URL(
        "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm",
        import.meta.url,
      ).toString(),
      mainWorker: new URL(
        "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js",
        import.meta.url,
      ).toString(),
    },
    eh: {
      mainModule: new URL(
        "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm",
        import.meta.url,
      ).toString(),
      mainWorker: new URL(
        "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js",
        import.meta.url,
      ).toString(),
    },
  };
  const bundle = await duckdb.selectBundle(bundles);

  const worker = new Worker(bundle.mainWorker ?? bundles.mvp.mainWorker);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  activeDatabase = db;
  activeWorker = worker;
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  await db.registerFileURL(
    parquetFileName,
    parquetUrl,
    duckdb.DuckDBDataProtocol.HTTP,
    false,
  );

  const connection = await db.connect();
  await connection.query(
    `CREATE OR REPLACE VIEW ${quoteIdentifier(tableName)} AS SELECT * FROM read_parquet('${parquetFileName}')`,
  );

  return connection;
}

async function getConnection() {
  connectionPromise ??= createConnection(activeParquetUrl);

  return connectionPromise;
}

export async function configureParquetSource(value: string) {
  const nextUrl = normalizeParquetUrl(value);

  if (nextUrl === activeParquetUrl && connectionPromise) {
    return nextUrl;
  }

  const previousConnection = connectionPromise;
  connectionPromise = null;

  if (previousConnection) {
    try {
      const connection = await previousConnection;
      await connection.close();
    } catch {
      // The previous connection may already have failed during initialization.
    }
  }

  if (activeDatabase) {
    try {
      await activeDatabase.terminate();
    } catch {
      // Termination is best effort when replacing a source.
    }
  }
  activeWorker?.terminate();
  activeDatabase = null;
  activeWorker = null;
  activeParquetUrl = nextUrl;
  connectionPromise = createConnection(activeParquetUrl);

  try {
    await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }

  return nextUrl;
}

export async function cancelActiveQuery() {
  const database = activeDatabase;
  const worker = activeWorker;

  connectionPromise = null;
  activeDatabase = null;
  activeWorker = null;

  try {
    await database?.terminate();
  } catch {
    // Terminating the worker is the fallback when a query cannot be cancelled cleanly.
  } finally {
    worker?.terminate();
  }
}

export async function inspectSchema(): Promise<InspectSchemaResult> {
  const connection = await getConnection();
  const countRows = tableToRows(
    await connection.query(`SELECT COUNT(*) AS count FROM ${quoteIdentifier(tableName)}`),
  );
  const describedColumns = tableToRows(
    await connection.query(`DESCRIBE SELECT * FROM ${quoteIdentifier(tableName)}`),
  );
  const columns: InspectSchemaResult["columns"] = [];

  for (const column of describedColumns) {
    const columnName = String(column.column_name);
    const examples = tableToRows(
      await connection.query(
        `SELECT ${quoteIdentifier(columnName)} AS value
         FROM ${quoteIdentifier(tableName)}
         WHERE ${quoteIdentifier(columnName)} IS NOT NULL
         GROUP BY ${quoteIdentifier(columnName)}
         LIMIT 3`,
      ),
    );

    columns.push({
      name: columnName,
      type: String(column.column_type),
      examples: examples.map((row) => normalizeValue(row.value)),
    });
  }

  return {
    table: tableName,
    rows: normalizeValue(countRows[0]?.count) as number | string,
    columns,
  };
}

export async function executeSql(sql: string): Promise<ExecuteSqlResult> {
  const connection = await getConnection();
  const safeSql = sanitizeSelectSql(sql);
  const describedColumns = tableToRows(
    await connection.query(`DESCRIBE SELECT * FROM (${safeSql}) AS agent_query`),
  );
  const resultRows = tableToRows(
    await connection.query(`SELECT * FROM (${safeSql}) AS agent_query LIMIT ${resultLimit}`),
  );
  const columns = describedColumns.map((column) => String(column.column_name));

  return {
    columns,
    rows: resultRows.map((row) => columns.map((column) => normalizeValue(row[column]))),
    rowCount: resultRows.length,
  };
}

export async function getDatasetRows({
  columns,
  limit,
  offset,
}: {
  columns: string[];
  limit: number;
  offset: number;
}): Promise<DatasetRowsResult> {
  const connection = await getConnection();
  const safeLimit = Math.min(500, Math.max(1, Math.floor(limit)));
  const safeOffset = Math.max(0, Math.floor(offset));
  const selectedColumns = columns.length > 0 ? columns : ["*"];
  const selectClause =
    selectedColumns[0] === "*"
      ? "*"
      : selectedColumns.map((column) => quoteIdentifier(column)).join(", ");
  const resultRows = tableToRows(
    await connection.query(
      `SELECT ${selectClause}
       FROM ${quoteIdentifier(tableName)}
       LIMIT ${safeLimit}
       OFFSET ${safeOffset}`,
    ),
  );

  return {
    columns: selectedColumns,
    rows: resultRows,
    offset: safeOffset,
    limit: safeLimit,
    totalRows: resultRows.length,
  };
}

export async function queryDataset(query: DatasetQuery): Promise<DatasetRowsResult> {
  const connection = await getConnection();
  const safeLimit = Math.min(500, Math.max(1, Math.floor(query.limit)));
  const safeOffset = Math.max(0, Math.floor(query.offset));
  const selectedColumns = query.columns.length > 0 ? query.columns : ["*"];
  const selectClause =
    selectedColumns[0] === "*"
      ? "*"
      : selectedColumns.map(quoteIdentifier).join(", ");
  const whereClause = buildWhereClause(query);
  const orderClause = query.sort
    ? `ORDER BY ${quoteIdentifier(query.sort.key)} ${query.sort.direction.toUpperCase()} NULLS LAST`
    : "";
  const countRows = tableToRows(
    await connection.query(
      `SELECT COUNT(*) AS count FROM ${quoteIdentifier(tableName)} ${whereClause}`,
    ),
  );
  const resultRows = tableToRows(
    await connection.query(
      `SELECT ${selectClause}
       FROM ${quoteIdentifier(tableName)}
       ${whereClause}
       ${orderClause}
       LIMIT ${safeLimit}
       OFFSET ${safeOffset}`,
    ),
  );
  const totalRows = Number(countRows[0]?.count ?? 0);

  return {
    columns: selectedColumns,
    rows: resultRows,
    offset: safeOffset,
    limit: safeLimit,
    totalRows: Number.isFinite(totalRows) ? totalRows : 0,
  };
}

export async function getColumnValueOptions(column: string, search = "") {
  const connection = await getConnection();
  const field = quoteIdentifier(column);
  const searchClause = search.trim()
    ? `AND CAST(${field} AS VARCHAR) ILIKE ${quoteLiteral(`%${search.trim()}%`)}`
    : "";
  const rows = tableToRows(
    await connection.query(
      `SELECT CAST(${field} AS VARCHAR) AS value, COUNT(*) AS count
       FROM ${quoteIdentifier(tableName)}
       WHERE ${field} IS NOT NULL ${searchClause}
       GROUP BY value
       ORDER BY count DESC, value
       LIMIT 100`,
    ),
  );

  return rows.map((row) => ({
    label: String(row.value),
    count: Number(row.count),
  }));
}
