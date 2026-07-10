import { stripCodeFence } from "../utils";

export function sanitizeSelectSql(sql: string) {
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
