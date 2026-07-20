# @openleash/shared

Public TypeScript contracts shared by OpenLeash clients, APIs, dashboards, and plugins.

The package contains normalized agent-event types, plugin manifests and settings schemas, runtime capability interfaces, container-protocol envelopes, and typed Island contributions. It contains contracts only: product logic, database access, hosted tenancy, and UI rendering stay in their owning applications.

## Plugin developer model

A plugin declares one manifest and one configuration schema. Plugin code receives one already-resolved, request-scoped `input.config`; it does not implement product-mode, organization-role, employee-freedom, or profile-merging branches.

OpenLeash resolves configuration in this order:

```text
manifest defaultConfig
  -> organization base settings
  -> matching organization profiles by priority
  -> user base settings when configuration is unlocked
  -> matching user profiles by priority when unlocked
```

Profiles may match an agent kind, an exact authenticated/enrolled agent runtime ID, or both. Runtime identity and organization/user scope are host-derived. A caller-supplied agent ID is never accepted as authorization scope.

Organization policy controls four independent decisions: mandatory installation, default enablement, permission for employees to install optional plugins, and permission for employees to customize configuration. A mandatory plugin cannot be removed or disabled by an employee, but it can remain configurable when the admin leaves settings unlocked.

The same contract is used by Individual Open Source, personal OpenLeash Cloud, organization OpenLeash Cloud, and Private Cloud. A manifest should declare `executionEnvironment: "cloud-only"` only when it truly depends on OpenLeash-operated infrastructure.

## Island contributions

Plugins with the narrow `island:publish` permission can contribute typed, expiring information to the OpenLeash Live Sessions Island:

```ts
await capabilities.island.annotateSession({
  key: "destructive-risk",
  label: "Destructive filesystem operation",
  detail: "Recursive deletion affects this workspace.",
  value: "critical",
  tone: "danger",
  ttlSeconds: 180,
  action: { id: "open", label: "Open session", type: "open-session" }
});

await capabilities.island.reportActivity({
  key: "test-suite",
  title: "Test suite running",
  status: "running",
  progress: { current: 18, total: 24 }
});
```

OpenLeash owns layout, accessibility, truncation, animation, scope filtering, and navigation. Plugins cannot provide HTML, CSS, JavaScript, arbitrary URLs, shell commands, custom components, or Electron IPC.

Use Island contributions for short-lived, glanceable state. Use signals and usage for durable outcomes, notifications for interruptions, scoped storage for plugin-owned state, and the manifest settings schema for configuration.

## Development

```bash
npm install
npm run typecheck
npm run build
```

Public plugin documentation: <https://docs.openleash.com/reference/plugins>
