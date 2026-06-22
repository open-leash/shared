export const FIRST_PARTY_PLUGIN_MANIFESTS = [
    {
        id: "openleash.prompt-compression",
        slug: "token-saver",
        name: "Token Saver",
        description: "Trim noisy context before every model call.",
        version: "1.0.0",
        publisher: "openleash",
        runtime: "openleash-core",
        entrypoint: "plugins/prompt-compression",
        events: ["prompt.beforeSubmit"],
        permissions: ["event:read", "prompt:read", "prompt:write", "model:invoke", "audit:write", "usage:write"],
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
        description: "Catch suspicious instructions before they spread.",
        version: "1.0.0",
        publisher: "openleash",
        runtime: "openleash-core",
        entrypoint: "plugins/skill-scanner",
        events: ["openleash.startup", "agent.detected", "skill.changed"],
        permissions: ["event:read", "filesystem:read", "decision:write", "model:invoke", "audit:write", "log:write", "signal:write", "notification:send"],
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
        description: "Mask secrets before agents send them.",
        version: "1.0.0",
        publisher: "openleash",
        runtime: "openleash-core",
        entrypoint: "plugins/dlp",
        events: ["prompt.beforeSubmit"],
        permissions: ["event:read", "prompt:read", "prompt:write", "decision:write", "model:invoke", "audit:write", "signal:write"],
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
        description: "Approve, deny, or log risky agent actions.",
        version: "1.0.0",
        publisher: "openleash",
        runtime: "openleash-core",
        entrypoint: "plugins/security-evaluator",
        events: ["prompt.beforeSubmit", "agent.response", "tool.beforeUse", "tool.afterUse"],
        permissions: ["event:read", "prompt:read", "tool:read", "decision:write", "model:invoke", "audit:write", "log:write", "signal:write", "usage:write", "notification:send"],
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
        description: "See every MCP server, tool, and call.",
        version: "1.0.0",
        publisher: "openleash",
        runtime: "openleash-core",
        entrypoint: "plugins/mcp-scanner",
        events: ["tool.beforeUse", "tool.afterUse"],
        permissions: ["event:read", "tool:read", "audit:write", "signal:write"],
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
        description: "Send agent incidents to your SOC stack.",
        version: "1.0.0",
        publisher: "openleash",
        runtime: "openleash-core",
        entrypoint: "plugins/siem-exporter",
        events: ["prompt.beforeSubmit", "agent.response", "tool.beforeUse", "tool.afterUse", "session.started", "session.ended", "skill.changed", "log.emitted"],
        permissions: ["event:read", "prompt:read", "tool:read", "network:access", "audit:write", "log:write"],
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
];
export const FIRST_PARTY_PLUGIN_MARKETPLACE = FIRST_PARTY_PLUGIN_MANIFESTS.map((plugin, index) => {
    const details = {
        "openleash.prompt-compression": {
            shortDescription: "Trim noisy context before every model call.",
            longDescription: "Token Saver compresses oversized prompts, preserves the useful context, and keeps agent runs cheaper without changing how developers work.",
            heroTagline: "Cut agent and prompt costs.",
            iconText: "TS",
            visualPng: "/plugins/token-saver.png",
            installCount: 18420,
            downloadCount: 42380,
            weeklyDownloadCount: 2840,
            trendPercent: 18,
            rating: 4.9,
            featuredRank: 1,
            seoTitle: "token-saver Plugin for OpenLeash",
            seoDescription: "Install token-saver to reduce AI agent token usage, compress prompts, and control model spend across OpenLeash-managed agents."
        },
        "openleash.security-evaluator": {
            shortDescription: "Approve, deny, or log risky agent actions.",
            longDescription: "sec-evaluator applies active OpenLeash policies to prompts, responses, and tool use so teams get live decisions and auditable findings from one pipeline.",
            heroTagline: "Enforce policy on every agent move.",
            iconText: "SE",
            visualPng: "/plugins/sec-evaluator.png",
            installCount: 12680,
            downloadCount: 31920,
            weeklyDownloadCount: 2210,
            trendPercent: 12,
            rating: 4.8,
            featuredRank: 2,
            seoTitle: "sec-evaluator Plugin for OpenLeash",
            seoDescription: "Use sec-evaluator to enforce security policy across AI agent prompts, responses, and tool calls."
        },
        "openleash.dlp": {
            shortDescription: "Mask secrets before agents send them.",
            longDescription: "Data Leakage Prevention detects keys, credentials, tokens, PHI, and PII before prompts leave the agent workflow.",
            heroTagline: "Stop sensitive data from leaking.",
            iconText: "DL",
            visualPng: "/plugins/data-leakage-prevention.png",
            installCount: 10140,
            downloadCount: 27650,
            weeklyDownloadCount: 1960,
            trendPercent: 9,
            rating: 4.8,
            featuredRank: 3,
            seoTitle: "data-leakage-prevention Plugin for OpenLeash",
            seoDescription: "Install data-leakage-prevention to mask or block secrets, credentials, PII, and sensitive prompt data before it reaches model providers."
        },
        "openleash.skill-scanner": {
            shortDescription: "Catch suspicious instructions before they spread.",
            longDescription: "Skill Scanner watches agent skill folders, inventories new skills, and flags risky instructions before they quietly spread across developer machines.",
            heroTagline: "Scan every skill for malicious behavior.",
            iconText: "SK",
            visualPng: "/plugins/skill-scanner.png",
            installCount: 9300,
            downloadCount: 21480,
            weeklyDownloadCount: 1510,
            trendPercent: 14,
            rating: 4.7,
            featuredRank: 4,
            seoTitle: "skill-scanner Plugin for OpenLeash",
            seoDescription: "Use skill-scanner to detect malicious AI agent skills, suspicious instructions, and skill drift in OpenLeash."
        },
        "openleash.mcp-scanner": {
            shortDescription: "See every MCP server, tool, and call.",
            longDescription: "MCP Scanner discovers MCP servers and tool calls, redacts secrets from audit data, and keeps tool usage searchable.",
            heroTagline: "Map your MCP attack surface.",
            iconText: "MC",
            visualPng: "/plugins/mcp-scanner.png",
            installCount: 8120,
            downloadCount: 18890,
            weeklyDownloadCount: 1320,
            trendPercent: 21,
            rating: 4.7,
            featuredRank: 5,
            seoTitle: "mcp-scanner Plugin for OpenLeash",
            seoDescription: "Install mcp-scanner to audit MCP servers, tool calls, and risk signals across OpenLeash-managed agents."
        },
        "openleash.siem-exporter": {
            shortDescription: "Send agent incidents to your SOC stack.",
            longDescription: "SIEM Exporter forwards OpenLeash decisions, policy findings, tool events, and identity context using Splunk HEC, ECS-shaped JSON, or HTTPS webhooks.",
            heroTagline: "Export agent security events to SIEM.",
            iconText: "SX",
            visualPng: "/plugins/siem-exporter.png",
            installCount: 6540,
            downloadCount: 14980,
            weeklyDownloadCount: 980,
            trendPercent: 19,
            rating: 4.7,
            featuredRank: 6,
            seoTitle: "siem-exporter Plugin for OpenLeash",
            seoDescription: "Install siem-exporter to forward OpenLeash AI agent security events, policy findings, and incidents to SIEM and SOC tools."
        }
    };
    const detail = details[plugin.id] ?? {
        shortDescription: plugin.description,
        longDescription: plugin.description,
        heroTagline: plugin.description,
        iconText: "OL",
        visualPng: `/plugins/${plugin.slug ?? plugin.id.split(".").pop() ?? plugin.id}.png`,
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
});
export const HOOK_AGENT_METADATA = {
    claude: { kind: "claude-code", displayName: "Claude Code" },
    codex: { kind: "codex", displayName: "OpenAI Codex" },
    cursor: { kind: "cursor", displayName: "Cursor" },
    gemini: { kind: "gemini", displayName: "Google Gemini CLI" },
    opencode: { kind: "opencode", displayName: "OpenCode" },
    openclaw: { kind: "openclaw", displayName: "OpenClaw" },
    nanoclaw: { kind: "nanoclaw", displayName: "NanoClaw" }
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
    adminSecurity: "2026-06-22.admin-security.v1",
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
};
export function apiVersionHeaders(functionName) {
    return {
        [OPENLEASH_API_FUNCTION_HEADER]: functionName,
        [OPENLEASH_API_VERSION_HEADER]: OPENLEASH_API_CONTRACTS[functionName]
    };
}
export function apiContractFor(functionName) {
    return {
        functionName,
        version: OPENLEASH_API_CONTRACTS[functionName]
    };
}
const MCP_TOOL_PATTERNS = [
    /^mcp__([A-Za-z0-9_.-]+)__(.+)$/i,
    /^mcp[:.]([A-Za-z0-9_.-]+)[:.](.+)$/i
];
const SECRET_ARGUMENT_KEY = /(api[_-]?key|access[_-]?token|auth(?:orization)?|bearer|client[_-]?secret|credential|password|private[_-]?key|refresh[_-]?token|secret|session[_-]?token|token)/i;
export function parseMcpToolName(toolName) {
    const name = String(toolName ?? "").trim();
    if (!name)
        return undefined;
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
export function mcpToolCallFromEvent(event) {
    const parsed = parseMcpToolName(event.tool?.name) ??
        mcpToolCallFromRaw(event.raw);
    if (!parsed)
        return undefined;
    const args = redactMcpArguments(event.tool?.input ?? rawToolInput(event.raw) ?? {});
    return {
        ...parsed,
        arguments: args,
        argumentSummary: summarizeMcpArguments(args)
    };
}
export function redactMcpArguments(value, depth = 0) {
    if (depth > 8)
        return "[TRUNCATED]";
    if (Array.isArray(value))
        return value.slice(0, 50).map((item) => redactMcpArguments(item, depth + 1));
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).slice(0, 100).map(([key, item]) => [
            key,
            SECRET_ARGUMENT_KEY.test(key) ? "[REDACTED]" : redactMcpArguments(item, depth + 1)
        ]));
    }
    if (typeof value === "string")
        return value.length > 800 ? `${value.slice(0, 800)}...` : value;
    return value;
}
export function summarizeMcpArguments(value) {
    if (!value || typeof value !== "object")
        return value === undefined ? "" : String(value).slice(0, 180);
    const entries = Object.entries(value).slice(0, 4);
    if (entries.length === 0)
        return "No arguments";
    return entries.map(([key, item]) => `${key}: ${argumentValuePreview(item)}`).join(" · ").slice(0, 240);
}
function argumentValuePreview(value) {
    if (value === "[REDACTED]")
        return "[REDACTED]";
    if (value === null || value === undefined)
        return String(value);
    if (typeof value === "string")
        return value.length > 54 ? `${value.slice(0, 54)}...` : value;
    if (typeof value === "number" || typeof value === "boolean")
        return String(value);
    if (Array.isArray(value))
        return `[${value.length} item${value.length === 1 ? "" : "s"}]`;
    return "{...}";
}
function normalizeMcpServerName(value) {
    return value.trim().replace(/\s+/g, "-").slice(0, 160);
}
function rawToolInput(raw) {
    if (!raw || typeof raw !== "object")
        return undefined;
    const record = raw;
    const tool = record.tool && typeof record.tool === "object" ? record.tool : undefined;
    return record.tool_input ?? record.toolInput ?? tool?.input ?? record.input;
}
function mcpToolCallFromRaw(raw) {
    if (!raw || typeof raw !== "object")
        return undefined;
    const record = raw;
    const serverName = record.mcp_server ??
        record.mcpServer ??
        record.server_name ??
        record.serverName ??
        (record.tool && typeof record.tool === "object" ? record.tool.serverName : undefined);
    const toolName = record.tool_name ??
        record.toolName ??
        (record.tool && typeof record.tool === "object" ? record.tool.name : undefined);
    if (typeof serverName !== "string" || typeof toolName !== "string")
        return undefined;
    return {
        serverName: normalizeMcpServerName(serverName),
        toolName,
        fullToolName: parseMcpToolName(toolName)?.fullToolName ?? `mcp__${normalizeMcpServerName(serverName)}__${toolName}`
    };
}
export const EDITION_CAPABILITIES = {
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
