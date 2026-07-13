import type { InspectSchemaResult, PlannerDecision } from "./types";

const rowCountPatterns = [
  /\bcombien\s+(?:de\s+)?(?:lignes?|enregistrements?|entr[ée]es?|éléments?)\b/i,
  /\b(?:nombre|total)\s+(?:de|des)\s+(?:lignes?|enregistrements?)\b/i,
  /\bhow\s+many\s+(?:rows?|records?|entries)\b/i,
];

const columnListPatterns = [
  /\bquelles?\s+sont\s+les\s+colonnes\b/i,
  /\bliste\s+(?:des|les)\s+colonnes\b/i,
  /\bwhat\s+(?:are\s+the|are)\s+columns\b/i,
  /\blist\s+(?:the\s+)?columns\b/i,
];

function humanizeDuckDbType(type: string) {
  const normalized = type.trim().toUpperCase();

  if (normalized.endsWith("[]") || normalized.startsWith("LIST(") || normalized.startsWith("ARRAY(")) {
    return "liste";
  }
  if (normalized.startsWith("STRUCT(") || normalized.startsWith("MAP(")) {
    return "objet structuré";
  }
  if (/^(VARCHAR|CHAR|BPCHAR|TEXT|STRING|UUID|ENUM)/.test(normalized)) {
    return "texte";
  }
  if (/^(TINYINT|SMALLINT|INTEGER|INT|BIGINT|HUGEINT|UTINYINT|USMALLINT|UINTEGER|UBIGINT)/.test(normalized)) {
    return "nombre entier";
  }
  if (/^(DECIMAL|NUMERIC|REAL|FLOAT|DOUBLE)/.test(normalized)) {
    return "nombre décimal";
  }
  if (normalized === "BOOLEAN" || normalized === "BOOL") {
    return "oui / non";
  }
  if (normalized === "DATE") {
    return "date";
  }
  if (normalized.startsWith("TIMESTAMP") || normalized === "DATETIME") {
    return "date et heure";
  }
  if (normalized.startsWith("TIME")) {
    return "heure";
  }
  if (normalized.startsWith("INTERVAL")) {
    return "durée";
  }
  if (/^(BLOB|BIT|VARINT)/.test(normalized)) {
    return "donnée technique";
  }

  return "valeur";
}

export function answerFromSchema(
  question: string,
  schema?: InspectSchemaResult,
): PlannerDecision | undefined {
  if (!schema) {
    return undefined;
  }

  if (columnListPatterns.some((pattern) => pattern.test(question))) {
    const table = [
      "| Colonne | Type |",
      "|---|---|",
      ...schema.columns.map(
        (column) => `| \`${column.name}\` | ${humanizeDuckDbType(column.type)} |`,
      ),
    ].join("\n");

    return {
      action: "answer_direct",
      answer: `Ce fichier contient ${schema.columns.length} colonnes.\n\n${table}`,
      reasoning:
        "La liste et les types proviennent directement de la structure inspectée du fichier. Aucune requête sur les valeurs n’est nécessaire.",
    };
  }

  if (!rowCountPatterns.some((pattern) => pattern.test(question))) {
    return undefined;
  }

  const rows =
    typeof schema.rows === "number"
      ? schema.rows.toLocaleString("fr-FR")
      : schema.rows;

  const asksForRecords = /\b(?:enregistrements?|entr[ée]es?)\b/i.test(question);
  const entity = asksForRecords ? "enregistrements" : "lignes";

  return {
    action: "answer_direct",
    answer: `Ce fichier contient ${rows} ${entity}.`,
    reasoning:
      `Le nombre total est déjà fourni par la structure inspectée du fichier, où chaque ligne correspond ici à un élément demandé. Une nouvelle requête de comptage serait redondante.`,
  };
}
