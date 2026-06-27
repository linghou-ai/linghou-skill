---
name: linghou-skill
description: "用于说明 Linghou 系统支持哪些操作浏览器的方法，并给出具体 `lh` 命令和 MCP 调用。只要用户询问 `lh` CLI、浏览器列表、登录、install-host、exec、evaluate、scriptCode、script-file、commandSlug、script 管理、MCP `/tools/call` 或 `browser_execute_command` 参数，就使用这个 skill。范围只限浏览器操作方法、命令和 MCP 参数。"
---

# linghou-skill

使用这个 skill 时，只围绕 Linghou 系统支持的浏览器操作方法回答：

- 用 `lh` 命令行操作浏览器
- 用 MCP 的 `browser_execute_command` 操作浏览器

除非用户明确要求排查实现，否则把回答保持在 CLI/MCP 的用户操作层。

## 先做这些

1. 判断用户是在问 `lh` 命令，还是 MCP 调用。
2. 如果是 `lh`，优先给出具体命令、必要参数和验证命令。
3. 如果是 MCP，优先给出 `browser_execute_command` 的 JSON 参数和对应的 `lh`
   等价命令。
4. 如果需要确认当前实现，读取当前仓库中的：
   - `lhcli` 的命令定义
   - `docs/coordination/COORDINATION-CONTRACT.md` 的 Exec / MCP 小节
   - `docs/protocols-and-shared-types.md` 的 Exec / MCP 字段说明

## 系统支持的浏览器操作方法

### 0. 准备和选择浏览器

```bash
lh config set market-url <market-url>
lh config set realtime-url <realtime-url>
lh login
lh whoami
lh install-host --browser chrome --extension-id <extension-id>
lh browsers list
```

### 1. 用 `lh exec` 执行浏览器内置命令

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> --params '<json>' <command>
```

### 2. 用 `lh exec` 执行一次性 JS 源码

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> --script-code 'return document.title' evaluate
```

### 3. 用 `lh exec` 执行本地 JS 文件

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> --script-file ./task.js evaluate
```

### 4. 用 `lh script` 保存脚本，再用 `commandSlug` 执行

```bash
lh script create --name "Collect title" --slug collect-title --code 'return document.title'
lh exec --browser-id <browser-id> --tab-id <tab-id> --command-slug collect-title evaluate
```

### 5. 用 MCP 操作浏览器

```bash
curl -sS <realtime-url>/tools/call \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":"req-1","method":"tools/call","params":{"name":"browser_execute_command","arguments":{"operation_id":"<uuid>","browser_ids":["<browser-id>"],"command":"evaluate","tabId":123,"scriptCode":"return document.title"}}}'
```

MCP arguments 与 `lh exec` 对应：

```json
{
  "operation_id": "<uuid>",
  "browser_ids": ["<browser-id>"],
  "command": "evaluate",
  "tabId": 123,
  "scriptCode": "return document.title"
}
```

`scriptCode` 表示一次性脚本源码。`commandSlug` 表示已经保存的脚本 slug。
这两个字段不要同时使用。

`loc-*` 和 `rem-*` 只作为选择目标浏览器时的提示：本地目标通常是 `loc-*`，
远程目标通常是 `rem-*`。不要在用户没问时展开底层连接实现。

## 参考文件路由

只读取当前任务需要的参考文件：

- `lh` 命令行：读 `references/cli-workflows.md`。
- MCP 工具调用：读 `references/mcp-workflows.md`。

## 工作规则

- 直接给可执行命令，不要写大段背景。
- 需要占位值时，用 `<browser-id>`、`<tab-id>`、`<slug>`、`<token>`。
- 区分 `scriptCode` 和 `commandSlug`，只说明使用差异和命令写法。
- 解释 MCP 时，把字段和 `lh` 命令逐项对应。
- `lh exec` 的 `<command>` 在命令末尾，例如 `... evaluate`。
- 如果命令可能随实现变化，先用 `lh --help` 或源码确认。

## 验证

按任务选择最小验证：

- skill 自身变更：`npx skills add <repo-or-path> --list`
- CLI 文档或行为确认：`lh --help`、`lh <subcommand> --help`
- MCP 字段确认：检查 Exec/MCP 契约文档或 shared protocol 类型
