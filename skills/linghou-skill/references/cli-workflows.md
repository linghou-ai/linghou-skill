# Linghou CLI Workflows

Use this reference when the task involves `lh` usage, script publication,
browser execution, local helper installation, or debugging a CLI path.

Confirm exact flags with `lh --help` or the current `lhcli` source before
documenting a command. The examples below describe intent and expected routing.

## Setup and Identity

Typical setup:

```bash
lh config set market-url https://linghou.loock.vip
lh config set realtime-url https://linghou.loock.vip
lh login
lh whoami
```

Local browser helper setup:

```bash
lh install-host --browser chrome --extension-id <extension-id>
lh install-host --browser edge --extension-id <extension-id>
```

Browser discovery:

```bash
lh browsers list
lh browsers rename <browser-id> <friendly-name>
lh browsers forget <browser-id>
```

Interpret browser IDs before execution:

- `loc-*`: local Native Messaging / local IPC path
- `rem-*`: remote realtime WebSocket path

## One-off Execution

Use raw source only for temporary automation that should not become a governed
asset:

```bash
lh exec evaluate --browser-id <loc-or-rem-id> --tab-id <tab-id> --script-code 'return document.title'
lh exec evaluate --browser-id <loc-or-rem-id> --tab-id <tab-id> --script-file ./task.js
```

Expected behavior:

- The request carries `scriptCode`.
- No Market script resolve happens.
- No script-level scan, review, URL policy, version, or visibility rule applies.
- The extension still executes inside the browser's normal restrictions.

## Reusable Script Lifecycle

Use Market-backed scripts for anything reusable:

```bash
lh script create --slug collect-page-title --file ./collect-page-title.js --match-url 'https://example.com/*'
lh script update collect-page-title --file ./collect-page-title.js
lh script info collect-page-title
lh script list
lh script search title
lh script toggle collect-page-title
lh script delete collect-page-title
```

Execute by slug:

```bash
lh exec evaluate --browser-id <loc-or-rem-id> --tab-id <tab-id> --command-slug collect-page-title
```

Expected behavior:

- The request carries `commandSlug`, not raw user-provided code.
- `commandSlug` and `scriptCode` are mutually exclusive at the public exec
  boundary.
- For `rem-*`, realtime resolves through Market internal command resolve.
- For `loc-*`, lhcli resolves through Market using the user's CLI token, then
  forwards resolved code plus `scriptPolicy` through local IPC / Native
  Messaging.
- The extension enforces `matchUrl` and `denyUrl` before running resolved code.

## Debugging Checklist

For local execution failures:

1. Confirm the extension can connect to `com.linghou.lhcli`.
2. Confirm host registration matches the browser and extension ID.
3. Confirm the extension has or receives a `loc-*` local browser ID.
4. Inspect `lhcli` config and token state.
5. Verify local IPC endpoint registration for that browser ID.

For remote execution failures:

1. Confirm the extension has a plugin token and a signed `rem-*` browser ID.
2. Confirm the WebSocket connects to `/ws` on the selected realtime origin.
3. Confirm realtime accepts the first `connect` message.
4. Check token scope/version and browser ID signature failures separately.
5. Confirm `GET /api/browsers` shows the browser online before dispatch.

For `commandSlug` failures:

1. Confirm the script exists and the slug is semantic, not numeric.
2. Confirm enabled, not revoked, scan passed, and moderation approved state.
3. Confirm visibility allows the caller.
4. Confirm URL policy matches the target tab.
5. Confirm `scriptPolicy` reaches the extension.
