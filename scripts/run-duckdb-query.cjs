const duckdb = require("duckdb");

const [, , parquetPath, sql, limitArg = "50", tableNameArg = "resultats_electoraux"] = process.argv;

if (!parquetPath || !sql) {
  console.error("Usage: node scripts/run-duckdb-query.cjs <parquetPath> <sql> [limit]");
  process.exit(1);
}

const limit = Number(limitArg) || 50;
const tableName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableNameArg)
  ? tableNameArg
  : "resultats_electoraux";
const escapedParquetPath = parquetPath.replace(/'/g, "''");
const db = new duckdb.Database(":memory:");
const connection = db.connect();

function run(statement) {
  return new Promise((resolve, reject) => {
    connection.run(statement, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function all(statement) {
  return new Promise((resolve, reject) => {
    connection.all(statement, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

function normalizeValue(value) {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

async function main() {
  await run(
    `CREATE VIEW ${tableName} AS SELECT * FROM read_parquet('${escapedParquetPath}')`,
  );

  const rows = await all(`SELECT * FROM (${sql}) AS agent_query LIMIT ${limit}`);
  const normalizedRows = rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, normalizeValue(value)]),
    ),
  );

  console.log(JSON.stringify(normalizedRows));
}

main()
  .catch((error) => {
    console.error(error?.stack ?? String(error));
    process.exitCode = 1;
  })
  .finally(() => {
    try {
      connection.close();
    } catch {}

    try {
      db.close();
    } catch {}
  });
