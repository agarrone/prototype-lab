export type AgentPhase =
  | "plan"
  | "generate_sql"
  | "create_chart"
  | "create_map"
  | "synthesize";

export type DatasetMetadataResult = {
  id: string;
  slug: string;
  title: string;
  description: string;
  organization: string;
  page: string;
  license: string;
  lastUpdate: string;
  qualityScore: number;
  resources: Array<{
    id: string;
    title: string;
    format: string;
    url?: string;
    parquetUrl?: string;
  }>;
};

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

export type MapSpec =
  | {
      type: "points";
      title: string;
      latitudeField: string;
      longitudeField: string;
      labelField?: string;
      valueField?: string;
      colorField?: string;
      cluster?: boolean;
    }
  | {
      type: "choropleth";
      title: string;
      boundary: "france-regions" | "france-departments";
      dataKey: string;
      boundaryKey: "code";
      valueField: string;
      labelField?: string;
    };

export type AssistantToolCall =
  | { tool: "get_dataset_metadata"; arguments?: Record<string, never> }
  | { tool: "inspect_schema"; arguments?: Record<string, never> }
  | {
      tool: "execute_sql";
      arguments: { sql: string; description?: string; show?: boolean };
    }
  | {
      tool: "create_chart";
      arguments: { description?: string; spec: VegaLiteSpec };
    }
  | {
      tool: "create_map";
      arguments: { description?: string; spec: MapSpec };
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
  datasetReference?: string;
  tableName?: string;
  schema?: InspectSchemaResult;
  datasetMetadata?: DatasetMetadataResult;
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
