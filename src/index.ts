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

export type HookAgentSlug = "claude" | "codex" | "cursor" | "openclaw" | "nanoclaw";

export const HOOK_AGENT_METADATA: Record<HookAgentSlug, { kind: AgentKind; displayName: string }> = {
  claude: { kind: "claude-code", displayName: "Claude Code" },
  codex: { kind: "codex", displayName: "OpenAI Codex" },
  cursor: { kind: "cursor", displayName: "Cursor" },
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
  desktopEnroll: "2026-06-03.desktop-enroll.v1",
  adminOverview: "2026-05-16.admin-overview.v1",
  adminMcpServers: "2026-05-27.admin-mcp-servers.v1",
  adminMcpServerDetail: "2026-05-27.admin-mcp-server-detail.v1",
  adminSkills: "2026-05-27.admin-skills.v1",
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

export type OpenLeashEdition = "standalone" | "managed-cloud" | "managed-self-hosted";

export type OpenLeashClientMode = "community" | "cloud" | "enterprise";

export type BillingMode =
  | "none"
  | "external";

export type DeploymentMode =
  | "local-only"
  | "openleash-cloud"
  | "self-hosted-private";

export type DataStoreMode =
  | "local-db"
  | "postgres";

export type EditionCapabilities = {
  edition: OpenLeashEdition;
  deploymentMode: DeploymentMode;
  billingMode: BillingMode;
  dashboard: "settings" | "ciso-dashboard";
  endUserControls: "full-local-control" | "tray-and-approvals-only";
  rulesManagedBy: "end-user" | "admin-dashboard";
  identity: "none" | "sso-oauth";
  modelKey: "byok-local" | "byok-tenant" | "managed";
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
  standalone: [
    {
      edition: "standalone",
      deploymentMode: "local-only",
      billingMode: "none",
      dashboard: "settings",
      endUserControls: "full-local-control",
      rulesManagedBy: "end-user",
      identity: "none",
      modelKey: "byok-local",
      dataStore: "local-db",
      mdmDeployment: false,
      automaticUpdates: true
    }
  ],
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
