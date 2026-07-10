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
};

const parquetUrl =
  "https://hydra.s3.rbx.io.cloud.ovh.net/parquet/f868cca6-8da1-4369-a78d-47463f19a9a3.parquet";
const parquetFileName = "catalogue-data-gouv.parquet";
const tableName = "data";
const resultLimit = 50;

let connectionPromise: Promise<AsyncDuckDBConnection> | null = null;

function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
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

async function createConnection() {
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
  connectionPromise ??= createConnection();

  return connectionPromise;
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
  };
}
