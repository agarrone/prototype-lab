export type AgentPhase = "plan" | "generate_sql" | "create_chart" | "synthesize";

export type TokenUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

export type InspectSchemaResult = {
  table: string;
  rows: number | string;
  columns: { name: string; type: string; examples: unknown[] }[];
};

export type ExecuteSqlResult = {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
};

export type SqlExecutionEvidence = {
  description?: string;
  sql: string;
  result: ExecuteSqlResult;
};

export type SqlExecutionFailure = {
  sql: string;
  error: string;
};

export type VegaLiteSpec = Record<string, unknown>;

export type AssistantToolCall =
  | { tool: "inspect_schema"; arguments?: Record<string, never> }
  | {
      tool: "execute_sql";
      arguments: { sql: string; description?: string; show?: boolean };
    }
  | {
      tool: "create_chart";
      arguments: { description?: string; spec: VegaLiteSpec };
    };

export type PlannerDecision =
  | { action: "use_tools"; toolCall: AssistantToolCall }
  | { action: "answer_direct"; answer: string; reasoning?: string }
  | { action: "ask_clarification"; question: string; reasoning?: string };

export type StructuredAgentAnswer = {
  answer: string;
  reasoning?: string;
  sql?: string;
};

export type AgentRequest = {
  phase?: AgentPhase;
  question?: string;
  resourceName?: string;
  tableName?: string;
  schema?: InspectSchemaResult;
  sql?: string;
  executionResult?: ExecuteSqlResult;
  previousSqlResults?: SqlExecutionEvidence[];
  previousSqlErrors?: SqlExecutionFailure[];
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
};

export type AgentModelConfig = {
  apiKey: string;
  apiUrl: string;
  model: string;
};
