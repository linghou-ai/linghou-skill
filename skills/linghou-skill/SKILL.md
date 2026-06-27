---
name: linghou-skill
description: "Use this for Linghou browser automation infrastructure work: AI or CLI control of a user's real browser, local Native Messaging, remote realtime WebSocket execution, lhcli workflows, Market script governance, scriptCode vs commandSlug decisions, and protocol drift across linghou, linghou-realtime, lhcli, and shared docs. Trigger whenever the user asks to debug, implement, review, document, or operate Linghou browser control or reusable browser scripts."
---

# linghou-skill

Use this skill to keep Linghou browser automation work aligned across the
browser extension, CLI, realtime service, Market, and coordination docs.

Linghou's core product boundary is:

> AI, CLI, and automation tools should be able to operate the user's real
> browser in a stable and safe way, while reusable browser scripts become
> manageable, discoverable, reviewable assets.

## Start Here

1. Identify the workspace and current task type:
   - local browser control through Native Messaging
   - remote browser control through realtime WebSocket
   - CLI login, host install, browser listing, or execution
   - script publication, update, discovery, review, or execution
   - protocol/schema/field/route/auth drift across projects
2. If the task is in the Linghou monorepo/workspace, read the current source of
   truth before changing code:
   - `docs/coordination/COORDINATION-CONTRACT.md`
   - `docs/protocols-and-shared-types.md`
   - `docs/architecture.md`
3. Inspect the relevant implementation owners:
   - `linghou/packages/extension` for browser-side execution
   - `lhcli` for CLI and Native Messaging host behavior
   - `linghou-realtime` for HTTP, MCP, WebSocket, task dispatch, and browser state
   - `linghou/packages/market` for auth, tokens, scripts, public plaza, and admin review
   - `linghou/packages/shared` for TypeScript protocols, entities, schema, constants
4. Keep docs and code synchronized. Any protocol, route, auth, schema, secret,
   field naming, or shared-type change should update the coordination docs.

## Core Decisions

Choose the execution path explicitly.

- Use `scriptCode` for one-off dynamic automation. It is raw source forwarded to
  the browser-side executor and should not be described as governed or audited.
- Use `commandSlug` for reusable scripts. It must resolve through Market and
  carry `scriptPolicy` so visibility, versioning, URL policy, capabilities,
  review status, and revocation stay enforceable.
- Use `loc-*` targets for local Native Messaging / local IPC paths.
- Use `rem-*` targets for remote realtime WebSocket paths.

Do not mix these concepts casually. Most Linghou regressions come from treating
a local browser ID like a remote browser ID, treating a governed script like raw
source, or changing one side of a shared protocol without the other projects.

## Reference Routing

Read only the references needed for the task:

- For topology, component ownership, field naming, and contract invariants, read
  `references/architecture-contract.md`.
- For concrete CLI flows and command intent, read `references/cli-workflows.md`.
- For safety, governance, and review boundaries, read
  `references/safety-and-governance.md`.

## Working Rules

- Prefer the current coordination docs and shared types over inferred behavior.
- Check all affected submodules before claiming a cross-project behavior is
  fixed.
- Preserve the distinction between Market-owned identity/script governance and
  realtime-owned browser dispatch/state.
- When debugging connection failures, gather evidence from the exact path:
  extension storage/logs, Native Messaging host or WebSocket handshake, token
  scope/version, browser ID prefix/signature, and realtime/Market routes.
- When adding reusable automation, make it a `commandSlug` script and route it
  through CLI/Market governance instead of hiding it in ad hoc `scriptCode`.
- When changing protocol semantics, update tests and docs in the same change.

## Verification

Select verification based on the files touched:

- shared protocol/schema changes: run shared package tests/typecheck
- realtime execution or WebSocket changes: run realtime tests and direct health
  or exec checks
- CLI/Native Messaging changes: run Rust tests and relevant `lh` command flows
- Market auth/script changes: run Market tests/build and exercise the affected
  route or page
- cross-project behavior: verify at least one end-to-end path, not only isolated
  unit tests

If the user asks for production deployment or live behavior, local green is not
enough. Verify the live deployment path and report the exact checks performed.
