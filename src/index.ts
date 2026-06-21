export type AgentKind =
  | "claude-code"
  | "codex"
  | "openclaw"
  | "nanoclaw"
  | "salesforce-agentforce"
  | "azure-ai-foundry"
  | "microsoft-copilot-studio"
  | "aws-bedrock-agentcore"
  | "google-vertex-ai"
  | "n8n"
  | "zapier-agents"
  | "openai-codex-cloud"
  | "cursor"
  | "gemini"
  | "opencode"
  | "cline"
  | "continue"
  | "windsurf"
  | "github-copilot"
  | "kiro"
  | "aider"
  | "zed"
  | "unknown";

export type HookEventName =
  | "SessionStart"
  | "UserPromptSubmit"
  | "PreToolUse"
  | "PostToolUse"
  | "SubagentStart"
  | "SubagentStop"
  | "Notification"
  | "SessionEnd"
  | "Stop";

export type PipelineEvent =
  | "openleash.startup"
  | "agent.detected"
  | "skill.changed"
  | "prompt.beforeSubmit"
  | "agent.response"
  | "tool.beforeUse"
  | "tool.afterUse"
  | "session.started"
  | "session.ended";

export type PluginPermission =
  | "event:read"
  | "prompt:read"
  | "prompt:write"
  | "tool:read"
  | "decision:write"
  | "model:invoke"
  | "network:access"
  | "filesystem:read"
  | "filesystem:write"
  | "storage:read"
  | "storage:write"
  | "audit:write"
  | "notification:send";

export type PluginEffect =
  | "observe"
  | "transform"
  | "ask"
  | "deny"
  | "notify"
  | "inventory";

export type PluginRuntime =
  | "node"
  | "openleash-core";

export type PluginOrdering = {
  before?: string[];
  after?: string[];
  priority?: number;
};

export type PluginSettingSchema = {
  type: "object";
  additionalProperties?: boolean;
  properties?: Record<string, unknown>;
  required?: string[];
};

export type OpenLeashPluginManifest = {
  id: string;
  slug?: string;
  name: string;
  description: string;
  version: string;
  publisher: "openleash" | string;
  runtime: PluginRuntime;
  entrypoint: string;
  events: PipelineEvent[];
  permissions: PluginPermission[];
  effects: PluginEffect[];
  ordering?: PluginOrdering;
  configSchema?: PluginSettingSchema;
  defaultConfig?: Record<string, unknown>;
  tags?: string[];
};

export type PluginMarketplaceReviewStatus = "approved" | "pending_review" | "rejected";
export type PluginMarketplaceSource = "first_party" | "community" | "private";

export type PluginMarketplaceListing = OpenLeashPluginManifest & {
  slug: string;
  developerName: string;
  developerUrl?: string;
  source: PluginMarketplaceSource;
  reviewStatus: PluginMarketplaceReviewStatus;
  shortDescription: string;
  longDescription: string;
  heroTagline: string;
  packageUrl?: string;
  repositoryUrl?: string;
  documentationUrl?: string;
  iconText: string;
  installCount: number;
  downloadCount: number;
  weeklyDownloadCount: number;
  trendPercent: number;
  rating: number;
  featuredRank?: number | null;
  seoTitle: string;
  seoDescription: string;
  createdAt?: string;
  updatedAt?: string;
};

export type OrganizationPluginPolicy = {
  allowUserMarketplaceInstalls: boolean;
  allowUserCommunityPlugins: boolean;
  mandatoryPluginIds: string[];
  defaultPluginIds: string[];
};

export type PluginCatalogItem = OpenLeashPluginManifest & {
  slug?: string;
  marketplace?: PluginMarketplaceListing;
  settings: PluginSettingState;
  organizationPolicy?: {
    mandatory: boolean;
    defaultEnabled: boolean;
    userInstallAllowed: boolean;
  };
};

export type PluginSettingState = {
  enabled: boolean;
  config: Record<string, unknown>;
  orderingPriority?: number | null;
  updatedAt?: string;
};

export const FIRST_PARTY_PLUGIN_MANIFESTS = [
  {
    id: "openleash.prompt-compression",
    slug: "token-saver",
    name: "Token Saver",
    description: "Compresses prompts before they reach agent models to reduce token usage and cost.",
    version: "1.0.0",
    publisher: "openleash",
    runtime: "openleash-core",
    entrypoint: "plugins/prompt-compression",
    events: ["prompt.beforeSubmit"],
    permissions: ["event:read", "prompt:read", "prompt:write", "model:invoke", "audit:write"],
    effects: ["transform", "observe"],
    ordering: { priority: 100, before: ["openleash.dlp"] },
    configSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        enabled: { type: "boolean" },
        level: { enum: ["light", "standard", "maximum"] },
        conciseResponse: { type: "boolean" },
        model: { type: "string" }
      }
    },
    defaultConfig: {
      enabled: false,
      level: "standard",
      conciseResponse: false
    },
    tags: ["tokens", "cost", "prompt"]
  },
  {
    id: "openleash.skill-scanner",
    slug: "skill-scanner",
    name: "Skill Scanner",
    description: "Scans agent skills for suspicious instructions and records skill inventory.",
    version: "1.0.0",
    publisher: "openleash",
    runtime: "openleash-core",
    entrypoint: "plugins/skill-scanner",
    events: ["openleash.startup", "agent.detected", "skill.changed"],
    permissions: ["event:read", "filesystem:read", "decision:write", "model:invoke", "audit:write", "notification:send"],
    effects: ["observe", "ask", "inventory"],
    ordering: { priority: 150 },
    defaultConfig: {
      enabled: true,
      suspiciousRiskThreshold: 50
    },
    tags: ["skills", "security", "inventory"]
  },
  {
    id: "openleash.dlp",
    slug: "data-leakage-prevention",
    name: "Data Leakage Prevention",
    description: "Masks or blocks sensitive prompt data before submission.",
    version: "1.0.0",
    publisher: "openleash",
    runtime: "openleash-core",
    entrypoint: "plugins/dlp",
    events: ["prompt.beforeSubmit"],
    permissions: ["event:read", "prompt:read", "prompt:write", "decision:write", "model:invoke", "audit:write"],
    effects: ["transform", "deny", "observe"],
    ordering: { priority: 200, after: ["openleash.prompt-compression"] },
    configSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        enabled: { type: "boolean" },
        action: { enum: ["mask", "block"] },
        categories: {
          type: "array",
          items: { enum: ["pii", "phi", "tokens", "keys", "credentials"] }
        },
        model: { type: "string" }
      }
    },
    defaultConfig: {
      enabled: false,
      action: "mask",
      categories: ["pii", "phi", "tokens", "keys", "credentials"]
    },
    tags: ["security", "privacy", "prompt"]
  },
  {
    id: "openleash.security-evaluator",
    slug: "sec-evaluator",
    name: "Security Evaluator",
    description: "Evaluates prompts, agent responses, and tool actions against organization policy.",
    version: "1.0.0",
    publisher: "openleash",
    runtime: "openleash-core",
    entrypoint: "plugins/security-evaluator",
    events: ["prompt.beforeSubmit", "agent.response", "tool.beforeUse", "tool.afterUse"],
    permissions: ["event:read", "prompt:read", "tool:read", "decision:write", "model:invoke", "audit:write", "notification:send"],
    effects: ["observe", "ask", "deny"],
    ordering: { priority: 300, after: ["openleash.dlp"] },
    configSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        enabled: { type: "boolean" },
        policySet: { type: "string" }
      }
    },
    defaultConfig: {
      enabled: true,
      policySet: "active"
    },
    tags: ["security", "policy", "approval"]
  },
  {
    id: "openleash.mcp-scanner",
    slug: "mcp-scanner",
    name: "MCP Scanner",
    description: "Discovers and inventories MCP tool calls for audit and risk review.",
    version: "1.0.0",
    publisher: "openleash",
    runtime: "openleash-core",
    entrypoint: "plugins/mcp-scanner",
    events: ["tool.beforeUse", "tool.afterUse"],
    permissions: ["event:read", "tool:read", "audit:write"],
    effects: ["observe", "inventory"],
    ordering: { priority: 400, after: ["openleash.security-evaluator"] },
    defaultConfig: {
      enabled: true,
      redactSecrets: true
    },
    tags: ["mcp", "inventory", "audit"]
  },
  {
    id: "openleash.siem-exporter",
    slug: "siem-exporter",
    name: "SIEM Exporter",
    description: "Forwards OpenLeash security events and incidents to SOC and SIEM systems.",
    version: "1.0.0",
    publisher: "openleash",
    runtime: "openleash-core",
    entrypoint: "plugins/siem-exporter",
    events: ["prompt.beforeSubmit", "agent.response", "tool.beforeUse", "tool.afterUse", "session.started", "session.ended", "skill.changed"],
    permissions: ["event:read", "prompt:read", "tool:read", "network:access", "audit:write"],
    effects: ["observe", "notify"],
    ordering: { priority: 900, after: ["openleash.security-evaluator", "openleash.mcp-scanner"] },
    configSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        enabled: { type: "boolean" },
        protocol: { enum: ["ecs-json", "splunk-hec", "generic-webhook"] },
        endpointUrl: { type: "string" },
        bearerToken: { type: "string" },
        hecToken: { type: "string" },
        source: { type: "string" },
        sourcetype: { type: "string" },
        index: { type: "string" },
        minSeverity: { enum: ["info", "low", "medium", "high", "critical"] },
        includePrompt: { type: "boolean" },
        includeToolArguments: { type: "boolean" }
      }
    },
    defaultConfig: {
      enabled: false,
      protocol: "ecs-json",
      endpointUrl: "",
      bearerToken: "",
      hecToken: "",
      source: "openleash",
      sourcetype: "openleash:security",
      index: "security",
      minSeverity: "info",
      includePrompt: false,
      includeToolArguments: false
    },
    tags: ["siem", "soc", "ecs", "splunk", "syslog", "incident-response"]
  }
] satisfies OpenLeashPluginManifest[];

export const FIRST_PARTY_PLUGIN_MARKETPLACE = FIRST_PARTY_PLUGIN_MANIFESTS.map((plugin, index) => {
  const details: Record<string, Pick<PluginMarketplaceListing, "shortDescription" | "longDescription" | "heroTagline" | "iconText" | "installCount" | "downloadCount" | "weeklyDownloadCount" | "trendPercent" | "rating" | "featuredRank" | "seoTitle" | "seoDescription">> = {
    "openleash.prompt-compression": {
      shortDescription: "Compress runaway prompts before they reach models.",
      longDescription: "Token Saver trims oversized prompts before submission, keeps useful context, and can add concise-response guidance so teams spend fewer tokens without retraining their agents.",
      heroTagline: "Cut prompt spend without slowing developers down.",
      iconText: "TS",
      installCount: 18420,
      downloadCount: 42380,
      weeklyDownloadCount: 2840,
      trendPercent: 18,
      rating: 4.9,
      featuredRank: 1,
      seoTitle: "token-saver Plugin for OpenLeash",
      seoDescription: "Install token-saver to compress AI agent prompts, reduce token usage, and control model spend across OpenLeash-managed agents."
    },
    "openleash.security-evaluator": {
      shortDescription: "Evaluate prompts, responses, and tool use against policy.",
      longDescription: "sec-evaluator applies your active OpenLeash policies to prompts, responses, and tool actions, producing approvals, denials, and auditable findings from one managed pipeline.",
      heroTagline: "Turn organization policy into live agent guardrails.",
      iconText: "SE",
      installCount: 12680,
      downloadCount: 31920,
      weeklyDownloadCount: 2210,
      trendPercent: 12,
      rating: 4.8,
      featuredRank: 2,
      seoTitle: "sec-evaluator Plugin for OpenLeash",
      seoDescription: "Use sec-evaluator to enforce OpenLeash policies across AI agent prompts, responses, and tool calls."
    },
    "openleash.dlp": {
      shortDescription: "Mask or block sensitive prompt data before it leaves.",
      longDescription: "Data Leakage Prevention detects sensitive categories such as keys, credentials, tokens, PHI, and PII before prompts leave the agent workflow.",
      heroTagline: "Keep secrets and customer data out of model prompts.",
      iconText: "DL",
      installCount: 10140,
      downloadCount: 27650,
      weeklyDownloadCount: 1960,
      trendPercent: 9,
      rating: 4.8,
      featuredRank: 3,
      seoTitle: "data-leakage-prevention Plugin for OpenLeash",
      seoDescription: "Install data-leakage-prevention to mask or block sensitive AI agent prompt data before it reaches model providers."
    },
    "openleash.skill-scanner": {
      shortDescription: "Inventory and review agent skills as they appear.",
      longDescription: "Skill Scanner watches agent skill folders, inventories new skills, and flags suspicious instructions for review before they quietly spread across developer machines.",
      heroTagline: "See every agent skill before it becomes hidden behavior.",
      iconText: "SK",
      installCount: 9300,
      downloadCount: 21480,
      weeklyDownloadCount: 1510,
      trendPercent: 14,
      rating: 4.7,
      featuredRank: 4,
      seoTitle: "skill-scanner Plugin for OpenLeash",
      seoDescription: "Use skill-scanner to inventory and review AI agent skills, suspicious instructions, and skill drift in OpenLeash."
    },
    "openleash.mcp-scanner": {
      shortDescription: "Track MCP tools and calls for audit and risk review.",
      longDescription: "MCP Scanner discovers MCP servers and tool calls, redacts secrets from audit data, and gives security teams a searchable view of tool usage.",
      heroTagline: "Make MCP tool usage visible and reviewable.",
      iconText: "MC",
      installCount: 8120,
      downloadCount: 18890,
      weeklyDownloadCount: 1320,
      trendPercent: 21,
      rating: 4.7,
      featuredRank: 5,
      seoTitle: "mcp-scanner Plugin for OpenLeash",
      seoDescription: "Install mcp-scanner to audit Model Context Protocol tools, calls, and risk signals across OpenLeash-managed agents."
    },
    "openleash.siem-exporter": {
      shortDescription: "Forward OpenLeash security events to SOC and SIEM tools.",
      longDescription: "SIEM Exporter sends OpenLeash decisions, policy findings, tool events, and identity context to security operations platforms using ECS-shaped JSON, Splunk HEC-compatible payloads, or a generic HTTPS webhook.",
      heroTagline: "Connect OpenLeash agent security telemetry to your SOC.",
      iconText: "SX",
      installCount: 6540,
      downloadCount: 14980,
      weeklyDownloadCount: 980,
      trendPercent: 19,
      rating: 4.7,
      featuredRank: 6,
      seoTitle: "siem-exporter Plugin for OpenLeash",
      seoDescription: "Install siem-exporter to forward OpenLeash AI agent security events, policy findings, and incidents to SIEM and SOC systems."
    }
  };
  const detail = details[plugin.id] ?? {
    shortDescription: plugin.description,
    longDescription: plugin.description,
    heroTagline: plugin.description,
    iconText: "OL",
    installCount: Math.max(1000, 5000 - index * 500),
    downloadCount: Math.max(2000, 12000 - index * 900),
    weeklyDownloadCount: Math.max(300, 1200 - index * 100),
    trendPercent: Math.max(4, 16 - index),
    rating: 4.6,
    featuredRank: index + 1,
    seoTitle: `${plugin.name} Plugin for OpenLeash`,
    seoDescription: plugin.description
  };
  return {
    ...plugin,
    slug: plugin.slug ?? plugin.id.split(".").pop() ?? plugin.id,
    developerName: "OpenLeash",
    developerUrl: "https://openleash.com",
    source: "first_party",
    reviewStatus: "approved",
    packageUrl: `openleash:first-party/${plugin.slug ?? plugin.id}`,
    repositoryUrl: "https://github.com/open-leash/openleash",
    documentationUrl: `https://docs.openleash.com/plugins/${plugin.slug ?? plugin.id}`,
    ...detail
  };
}) satisfies PluginMarketplaceListing[];

export type PluginRunStatus = "skipped" | "passed" | "modified" | "blocked" | "needs_question" | "failed";

export type PluginFinding = {
  title: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  summary: string;
  evidence?: string[];
};

export type PluginRunRecord = {
  pluginId: string;
  event: PipelineEvent;
  status: PluginRunStatus;
  summary: string;
  durationMs?: number;
  findings?: PluginFinding[];
  metadata?: Record<string, unknown>;
};

export type PluginPromptCompressionLevel = "light" | "standard" | "maximum";
export type PluginDlpCategory = "pii" | "phi" | "tokens" | "keys" | "credentials";
export type PluginDlpAction = "block" | "mask";

export type PluginPromptCompressionRequest = {
  prompt: string;
  level: PluginPromptCompressionLevel;
  conciseResponse?: boolean;
  model?: string;
};

export type PluginPromptCompressionConfig = {
  enabled: boolean;
  level: PluginPromptCompressionLevel;
  conciseResponse: boolean;
  model: string;
};

export type PluginPromptCompressionResult = {
  prompt: string;
  model: string;
  originalLength: number;
  compressedLength: number;
  ratio: number;
};

export type PluginDlpInspectionRequest = {
  prompt: string;
  action: PluginDlpAction;
  categories: PluginDlpCategory[];
  model?: string;
};

export type PluginDlpConfig = {
  enabled: boolean;
  action: PluginDlpAction;
  categories: PluginDlpCategory[];
  model: string;
};

export type PluginPromptPipelineConfig = {
  compression: PluginPromptCompressionConfig;
  dlp: PluginDlpConfig;
};

export type PluginDlpInspectionResult = {
  prompt: string;
  blocked: boolean;
  matched: boolean;
  masked: boolean;
  model: string;
  categories: PluginDlpCategory[];
  findings: Array<{ category: PluginDlpCategory; quote: string; reason: string }>;
};

export type PluginPolicyEvaluationRequest = {
  request: EvaluationRequest;
  policies: Policy[];
};

export type PluginPolicyEvaluationResult = {
  results: PolicyDecision[];
  model: string;
};

export type PluginStorageScope = {
  userId?: string;
  agentKind?: string;
  sessionId?: string;
  conversationId?: string;
  projectPath?: string;
  key?: string;
};

export type PluginStorageRead<T = unknown> = {
  key?: string;
  scope?: PluginStorageScope;
  value: T;
  updatedAt: string;
  expiresAt?: string | null;
};

export type PluginStorageGetRequest = {
  key: string;
  scope?: PluginStorageScope;
};

export type PluginStorageSetRequest = {
  key: string;
  value: unknown;
  scope?: PluginStorageScope;
  ttlSeconds?: number;
};

export type PluginStorageListRequest = {
  keyPrefix?: string;
  scope?: PluginStorageScope;
  limit?: number;
};

export type PluginNotificationRequest = {
  level: "info" | "warning" | "critical";
  title: string;
  summary: string;
  dedupeKey?: string;
  scope?: PluginStorageScope;
  minIntervalSeconds?: number;
};

export type PluginNotificationResult = {
  sent: boolean;
  deduped: boolean;
};

export type PluginCapabilities = {
  prompt: {
    compress(request: PluginPromptCompressionRequest): Promise<PluginPromptCompressionResult>;
  };
  dlp: {
    inspect(request: PluginDlpInspectionRequest): Promise<PluginDlpInspectionResult>;
  };
  security: {
    evaluatePolicies(request: PluginPolicyEvaluationRequest): Promise<PluginPolicyEvaluationResult>;
  };
  storage: {
    get<T = unknown>(request: PluginStorageGetRequest): Promise<PluginStorageRead<T> | undefined>;
    set(request: PluginStorageSetRequest): Promise<PluginStorageRead>;
    list<T = unknown>(request?: PluginStorageListRequest): Promise<Array<PluginStorageRead<T>>>;
    delete(request: PluginStorageGetRequest): Promise<void>;
  };
  notification: {
    send(request: PluginNotificationRequest): Promise<PluginNotificationResult>;
  };
};

export type OpenLeashEvent = {
  eventName: HookEventName;
  agentKind: AgentKind;
  agentVersion?: string;
  sessionId: string;
  projectPath?: string;
  transcript?: ConversationTurn[];
  tool?: {
    name: string;
    input?: unknown;
    output?: unknown;
  };
  prompt?: string;
  raw?: unknown;
  occurredAt: string;
};

export type McpToolCall = {
  serverName: string;
  toolName: string;
  fullToolName: string;
  arguments: unknown;
  argumentSummary: string;
};

export type ConversationTurn = {
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  at?: string;
};

export type Policy = {
  id: string;
  name: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  naturalLanguageRule: string;
  enabled: boolean;
  locked?: boolean;
};

export type PolicyDecision = {
  policyId: string;
  policyName: string;
  status: "passed" | "failed" | "needs_question";
  severity: Policy["severity"];
  explanation: string;
  evidence?: string[];
  question?: string;
};

export type EvaluationRequest = {
  computer: {
    hostname: string;
    platform: string;
    osRelease?: string;
  };
  agent: {
    kind: AgentKind;
    displayName: string;
    version?: string;
    executablePath?: string;
  };
  event: OpenLeashEvent;
};

export type EvaluationResponse = {
  decision: "allow" | "deny" | "ask";
  decisionId: string;
  summary: string;
  resolutionGuidance?: string;
  question?: string;
  results: PolicyDecision[];
};

export type MobileIdentityProvider = {
  id: string;
  type: "google" | "google_workspace" | "okta" | "azure_ad" | "ping" | "custom";
  label: string;
  organizationId?: string;
  organizationSlug?: string;
  authorizationUrl?: string;
};

export type MobileBootstrapResponse = {
  mode: OpenLeashClientMode;
  apiUrl: string;
  cloudApiUrl: string;
  providers: MobileIdentityProvider[];
  organization?: {
    id: string;
    name: string;
    slug: string;
    region?: string | null;
  };
};

export type MobileAuthStartRequest = {
  audience?: "individual" | "organization";
  organizationSlug?: string;
  organizationId?: string;
  providerType?: MobileIdentityProvider["type"];
  redirectUri: string;
};

export type MobileAuthStartResponse = {
  authorizationUrl: string;
  state: string;
  providerType: MobileIdentityProvider["type"];
  organizationId?: string;
};

export type MobileAuthExchangeRequest = {
  audience?: "individual" | "organization";
  organizationId?: string;
  organizationSlug?: string;
  providerType: MobileIdentityProvider["type"];
  authorizationCode?: string;
  idToken?: string;
  redirectUri: string;
  provisionUser?: boolean;
};

export type MobileAuthExchangeResponse = {
  success: boolean;
  tokens: {
    accessToken: string;
    expiresAt: string;
  };
  user: {
    id: string;
    email: string;
    display_name: string;
    role: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    region?: string | null;
  };
  authMode: "sso" | "google" | "development";
};

export type MobileDeviceRegisterRequest = {
  platform: "ios" | "android" | "web" | "unknown";
  pushToken?: string;
  deviceName?: string;
  appVersion?: string;
};

export type MobilePendingApproval = {
  id: string;
  summary: string;
  question?: string;
  created_at: string;
  agent_name: string;
  agent_kind: AgentKind;
  project_path?: string | null;
  project_name?: string | null;
  primary_policy?: string | null;
  quote?: string | null;
  purpose_summary?: string | null;
  recent_context?: Array<{
    role: ConversationTurn["role"];
    content: string;
    at?: string;
  }>;
  triggered_policies: Array<{
    policy_name: string;
    status: string;
    severity: string;
    explanation: string;
    evidence?: string[];
  }>;
};

export type MobileStateResponse = {
  user: MobileAuthExchangeResponse["user"];
  organization: MobileAuthExchangeResponse["organization"];
  apiUrl: string;
  mode: OpenLeashClientMode;
  pendingApprovals: MobilePendingApproval[];
  clientConfig: {
    approvalNotifications: boolean;
    managedByOrganization: boolean;
  };
};

export type MobileDecisionResolveRequest = {
  resolution: "allow" | "deny";
  resolutionGuidance?: string;
};

export type MobileDecisionResolveResponse = {
  id: string;
  decision: "ask";
  resolution: "allow" | "deny";
  resolution_guidance?: string | null;
  resolved_at: string;
} | null;

export type HookAgentSlug =
  | "claude"
  | "codex"
  | "cursor"
  | "gemini"
  | "opencode"
  | "openclaw"
  | "nanoclaw";

export const HOOK_AGENT_METADATA: Record<HookAgentSlug, { kind: AgentKind; displayName: string }> = {
  claude: { kind: "claude-code", displayName: "Claude Code" },
  codex: { kind: "codex", displayName: "OpenAI Codex" },
  cursor: { kind: "cursor", displayName: "Cursor" },
  gemini: { kind: "gemini", displayName: "Google Gemini CLI" },
  opencode: { kind: "opencode", displayName: "OpenCode" },
  openclaw: { kind: "openclaw", displayName: "OpenClaw" },
  nanoclaw: { kind: "nanoclaw", displayName: "NanoClaw" }
};

export type HookContextQuery = {
  user_token?: string;
  token?: string;
  agent_version?: string;
  client_version?: string;
  hostname?: string;
  platform?: string;
  os_release?: string;
};

export const OPENLEASH_API_FUNCTION_HEADER = "x-openleash-api-function";
export const OPENLEASH_API_VERSION_HEADER = "x-openleash-api-version";

export const OPENLEASH_API_CONTRACTS = {
  health: "2026-05-16.health.v1",
  tenantEnroll: "2026-05-16.tenant-enroll.v1",
  tenantEvaluate: "2026-05-16.tenant-evaluate.v1",
  tenantHookEvaluate: "2026-05-22.tenant-hook-evaluate.v1",
  tenantDecisionPoll: "2026-05-16.tenant-decision-poll.v1",
  tenantDecisionResolve: "2026-05-16.tenant-decision-resolve.v1",
  tenantTrayStatus: "2026-05-16.tenant-tray-status.v1",
  tenantSkillObservation: "2026-05-27.tenant-skill-observation.v1",
  tenantPluginsRead: "2026-06-20.tenant-plugins-read.v1",
  desktopEnroll: "2026-06-03.desktop-enroll.v1",
  adminOverview: "2026-05-16.admin-overview.v1",
  adminMcpServers: "2026-05-27.admin-mcp-servers.v1",
  adminMcpServerDetail: "2026-05-27.admin-mcp-server-detail.v1",
  adminSkills: "2026-05-27.admin-skills.v1",
  adminPluginsRead: "2026-06-20.admin-plugins-read.v1",
  adminPluginsWrite: "2026-06-20.admin-plugins-write.v1",
  adminLogs: "2026-06-03.admin-logs.v1",
  adminLogDetail: "2026-06-03.admin-log-detail.v1",
  adminTriggers: "2026-05-16.admin-triggers.v1",
  adminTriggerDetail: "2026-05-16.admin-trigger-detail.v1",
  adminEventDetail: "2026-05-16.admin-event-detail.v1",
  adminExternalAgents: "2026-05-16.admin-external-agents.v1",
  adminExternalAgentsSync: "2026-05-16.admin-external-agents-sync.v1",
  adminProviderUsageRead: "2026-06-09.admin-provider-usage-read.v1",
  adminProviderUsageWrite: "2026-06-09.admin-provider-usage-write.v1",
  adminProviderUsageSync: "2026-06-09.admin-provider-usage-sync.v1",
  adminOnboardingRead: "2026-05-16.admin-onboarding-read.v1",
  adminOnboardingWrite: "2026-05-16.admin-onboarding-write.v1",
  adminIdentityRead: "2026-05-16.admin-identity-read.v1",
  adminUsersWrite: "2026-05-16.admin-users-write.v1",
  adminDeploymentTokensRead: "2026-05-16.admin-deployment-tokens-read.v1",
  adminDeploymentTokensWrite: "2026-05-16.admin-deployment-tokens-write.v1",
  adminPoliciesRead: "2026-05-16.admin-policies-read.v1",
  adminPoliciesWrite: "2026-05-16.admin-policies-write.v1",
  adminPromptTransformsRead: "2026-06-06.admin-prompt-transforms-read.v1",
  adminPromptTransformsWrite: "2026-06-06.admin-prompt-transforms-write.v1",
  authSession: "2026-05-16.auth-session.v1",
  authLogout: "2026-05-16.auth-logout.v1",
  authSsoAuthorize: "2026-05-16.auth-sso-authorize.v1",
  authSsoCallback: "2026-05-16.auth-sso-callback.v1",
  authGoogleCallback: "2026-05-24.auth-google-callback.v1",
  mobileBootstrap: "2026-05-22.mobile-bootstrap.v1",
  mobileAuthStart: "2026-05-22.mobile-auth-start.v1",
  mobileAuthExchange: "2026-05-22.mobile-auth-exchange.v1",
  mobileModelKey: "2026-05-23.mobile-model-key.v1",
  mobileDeviceRegister: "2026-05-22.mobile-device-register.v1",
  mobileState: "2026-05-22.mobile-state.v1",
  mobileDecisionResolve: "2026-05-22.mobile-decision-resolve.v1",
  organizationsRead: "2026-05-16.organizations-read.v1",
  organizationsWrite: "2026-05-16.organizations-write.v1",
  organizationSsoProviders: "2026-05-16.organization-sso-providers.v1",
  clientUpdateCheck: "2026-05-16.client-update-check.v1",
  clientUpdateLatest: "2026-05-16.client-update-latest.v1",
  clientReleasePublish: "2026-05-16.client-release-publish.v1",
  localEvaluate: "2026-05-16.local-evaluate.v1",
  localHookEvaluate: "2026-05-22.local-hook-evaluate.v1"
} as const;

export type OpenLeashApiFunction = keyof typeof OPENLEASH_API_CONTRACTS;

export function apiVersionHeaders(functionName: OpenLeashApiFunction): Record<string, string> {
  return {
    [OPENLEASH_API_FUNCTION_HEADER]: functionName,
    [OPENLEASH_API_VERSION_HEADER]: OPENLEASH_API_CONTRACTS[functionName]
  };
}

export function apiContractFor(functionName: OpenLeashApiFunction) {
  return {
    functionName,
    version: OPENLEASH_API_CONTRACTS[functionName]
  };
}

export type OpenLeashEdition = "managed-cloud" | "managed-self-hosted";

export type OpenLeashClientMode = "community" | "cloud" | "enterprise";

export type BillingMode =
  | "none"
  | "external";

export type DeploymentMode =
  | "openleash-cloud"
  | "self-hosted-private";

export type DataStoreMode =
  | "postgres";

export type EditionCapabilities = {
  edition: OpenLeashEdition;
  deploymentMode: DeploymentMode;
  billingMode: BillingMode;
  dashboard: "ciso-dashboard";
  endUserControls: "tray-and-approvals-only";
  rulesManagedBy: "admin-dashboard";
  identity: "sso-oauth";
  modelKey: "byok-tenant" | "managed";
  dataStore: DataStoreMode;
  mdmDeployment: boolean;
  automaticUpdates: boolean;
};

const MCP_TOOL_PATTERNS = [
  /^mcp__([A-Za-z0-9_.-]+)__(.+)$/i,
  /^mcp[:.]([A-Za-z0-9_.-]+)[:.](.+)$/i
];

const SECRET_ARGUMENT_KEY = /(api[_-]?key|access[_-]?token|auth(?:orization)?|bearer|client[_-]?secret|credential|password|private[_-]?key|refresh[_-]?token|secret|session[_-]?token|token)/i;

export function parseMcpToolName(toolName?: string): Pick<McpToolCall, "serverName" | "toolName" | "fullToolName"> | undefined {
  const name = String(toolName ?? "").trim();
  if (!name) return undefined;
  for (const pattern of MCP_TOOL_PATTERNS) {
    const match = name.match(pattern);
    if (match?.[1] && match[2]) {
      return {
        serverName: normalizeMcpServerName(match[1]),
        toolName: match[2],
        fullToolName: name
      };
    }
  }
  return undefined;
}

export function mcpToolCallFromEvent(event: OpenLeashEvent): McpToolCall | undefined {
  const parsed =
    parseMcpToolName(event.tool?.name) ??
    mcpToolCallFromRaw(event.raw);
  if (!parsed) return undefined;
  const args = redactMcpArguments(event.tool?.input ?? rawToolInput(event.raw) ?? {});
  return {
    ...parsed,
    arguments: args,
    argumentSummary: summarizeMcpArguments(args)
  };
}

export function redactMcpArguments(value: unknown, depth = 0): unknown {
  if (depth > 8) return "[TRUNCATED]";
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => redactMcpArguments(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).slice(0, 100).map(([key, item]) => [
        key,
        SECRET_ARGUMENT_KEY.test(key) ? "[REDACTED]" : redactMcpArguments(item, depth + 1)
      ])
    );
  }
  if (typeof value === "string") return value.length > 800 ? `${value.slice(0, 800)}...` : value;
  return value;
}

export function summarizeMcpArguments(value: unknown): string {
  if (!value || typeof value !== "object") return value === undefined ? "" : String(value).slice(0, 180);
  const entries = Object.entries(value as Record<string, unknown>).slice(0, 4);
  if (entries.length === 0) return "No arguments";
  return entries.map(([key, item]) => `${key}: ${argumentValuePreview(item)}`).join(" · ").slice(0, 240);
}

function argumentValuePreview(value: unknown): string {
  if (value === "[REDACTED]") return "[REDACTED]";
  if (value === null || value === undefined) return String(value);
  if (typeof value === "string") return value.length > 54 ? `${value.slice(0, 54)}...` : value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `[${value.length} item${value.length === 1 ? "" : "s"}]`;
  return "{...}";
}

function normalizeMcpServerName(value: string) {
  return value.trim().replace(/\s+/g, "-").slice(0, 160);
}

function rawToolInput(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return undefined;
  const record = raw as Record<string, unknown>;
  const tool = record.tool && typeof record.tool === "object" ? record.tool as Record<string, unknown> : undefined;
  return record.tool_input ?? record.toolInput ?? tool?.input ?? record.input;
}

function mcpToolCallFromRaw(raw: unknown): Pick<McpToolCall, "serverName" | "toolName" | "fullToolName"> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const record = raw as Record<string, unknown>;
  const serverName =
    record.mcp_server ??
    record.mcpServer ??
    record.server_name ??
    record.serverName ??
    (record.tool && typeof record.tool === "object" ? (record.tool as Record<string, unknown>).serverName : undefined);
  const toolName =
    record.tool_name ??
    record.toolName ??
    (record.tool && typeof record.tool === "object" ? (record.tool as Record<string, unknown>).name : undefined);
  if (typeof serverName !== "string" || typeof toolName !== "string") return undefined;
  return {
    serverName: normalizeMcpServerName(serverName),
    toolName,
    fullToolName: parseMcpToolName(toolName)?.fullToolName ?? `mcp__${normalizeMcpServerName(serverName)}__${toolName}`
  };
}

export const EDITION_CAPABILITIES: Record<OpenLeashEdition, EditionCapabilities[]> = {
  "managed-cloud": [
    {
      edition: "managed-cloud",
      deploymentMode: "openleash-cloud",
      billingMode: "external",
      dashboard: "ciso-dashboard",
      endUserControls: "tray-and-approvals-only",
      rulesManagedBy: "admin-dashboard",
      identity: "sso-oauth",
      modelKey: "byok-tenant",
      dataStore: "postgres",
      mdmDeployment: true,
      automaticUpdates: true
    }
  ],
  "managed-self-hosted": [
    {
      edition: "managed-self-hosted",
      deploymentMode: "self-hosted-private",
      billingMode: "none",
      dashboard: "ciso-dashboard",
      endUserControls: "tray-and-approvals-only",
      rulesManagedBy: "admin-dashboard",
      identity: "sso-oauth",
      modelKey: "byok-tenant",
      dataStore: "postgres",
      mdmDeployment: true,
      automaticUpdates: true
    }
  ]
};
