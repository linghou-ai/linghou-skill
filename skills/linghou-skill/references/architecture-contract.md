# Linghou Architecture Contract

Use this reference when the work touches component ownership, route boundaries,
field naming, shared protocols, or cross-submodule coordination.

## Component Boundaries

| Component | Owns | Does Not Own |
|---|---|---|
| Browser extension | Real browser execution, popup state, Market-tab login bridge, remote WebSocket client, local Native Messaging client, `scriptPolicy` URL enforcement before governed script execution | User accounts, script definitions, token revocation state, task persistence |
| lhcli | CLI login, config, browser list/rename/forget commands, script create/update/delete/toggle/info/list/search, `lh exec`, local Native Messaging host, local IPC | Market script approval rules, realtime browser registry, extension UI |
| linghou-realtime | `/api/health`, `/api/browsers*`, `/api/exec`, `/tools/call`, `/tasks/*`, `/ws`, task dispatch, browser registry, token introspection cache, `rem-*` WebSocket sessions | Web sessions, command CRUD, script public plaza, password auth |
| Market | Web login/session, CLI/plugin token issue/revoke, user accounts, command definitions, public script pages, admin review/audit, `commandSlug` resolve | Browser dispatch, realtime task state, local Native Messaging |
| shared package | Canonical TypeScript protocols, entities, schema, constants, command errors/targets | Rust mirror implementation details |

## Identity and Transport

- `loc-*` browser IDs belong to local Native Messaging / local IPC.
- `rem-*` browser IDs belong to remote realtime WebSocket sessions.
- A remote browser ID is signed and verified by realtime.
- A local browser ID is derived or returned by the Native Messaging host.
- Plugin tokens have `scope='plugin'` and connect to `/ws`.
- CLI and agent tokens call realtime HTTP/MCP execution routes.
- Tokens travel in `Authorization: Bearer <jwt>`, not in URLs.

## Execution Paths

### One-off dynamic automation

`scriptCode` is raw dynamic source. It is useful for temporary, task-specific
automation:

1. CLI/agent sends an exec request with `scriptCode`.
2. realtime or local IPC forwards the source to the extension.
3. the extension runs it through the browser-side executor.

It has no script-level scan, audit, URL policy, capability declaration, Market
version, or source retention. Browser APIs may still reject restricted pages.

### Governed reusable script

`commandSlug` is the managed asset path:

1. CLI/agent names a script by semantic slug.
2. Market resolves the slug to code plus `BrowserScriptPolicy`.
3. realtime or lhcli forwards `scriptCode` plus `scriptPolicy`.
4. the extension checks URL policy before execution.

Use this path for anything that should be reused, published, reviewed, searched,
versioned, or executed by name.

## Field Naming Rules

- Exec REST, MCP, and task query use snake_case for transport fields:
  `operation_id`, `browser_ids`, `task_id`, `browser_id`,
  `idempotency_window_ms`.
- Browser dispatch compatibility fields stay camelCase:
  `tabId`, `scriptCode`, `commandSlug`.
- Native Messaging uses camelCase:
  `requestId`, `browserId`, `tabId`, `scriptCode`, `scriptPolicy`.
- Browser entities use camelCase:
  `browserId`, `friendlyName`, `isDefault`, `lastSeenAt`, `forgottenAt`.
- Market script operations use `slug` as the stable public/CLI identifier.
  Do not reintroduce numeric script IDs as an execution or management path.

## Drift Checks

Before editing shared behavior, compare:

- docs contract vs `linghou/packages/shared/src/protocols`
- TypeScript shared types vs Rust mirrors in `lhcli`
- realtime request/response handling vs CLI serialization
- Market resolve routes vs realtime/local resolve callers
- extension dispatch handling vs `scriptCode` and `scriptPolicy` semantics

When these disagree, treat the coordination contract and current shared types as
the source of truth, then update the stale implementation or documentation.
