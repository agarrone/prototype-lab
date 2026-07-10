import type { SqlExecutionEvidence } from "./types";

export function addResultLimitDisclosure(
  answer: string,
  evidence: SqlExecutionEvidence[],
) {
  const finalEvidence = evidence.at(-1);
  const limitMatch = finalEvidence?.sql.match(/\blimit\s+(\d+)\b/i);

  if (!finalEvidence || !limitMatch) {
    return answer;
  }

  const limit = Number(limitMatch[1]);
  if (!Number.isFinite(limit) || finalEvidence.result.rowCount < limit) {
    return answer;
  }

  return `${answer}\n\n_La sortie est limitée aux ${limit} premières lignes ; d’autres résultats, notamment des ex æquo, peuvent ne pas être affichés._`;
}
