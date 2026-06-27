# Linghou MCP 工作流

当任务涉及 MCP 调用、agent 接入或把 `lh exec` 行为映射成 MCP 工具调用时，读取本参考。
回答时只说明操作浏览器的 MCP 方法、具体参数和对应的 `lh` 命令。

## MCP 入口

Linghou 的 MCP 执行入口是 realtime 的 JSON-RPC 接口：

```text
POST /tools/call
```

工具名：

```text
browser_execute_command
```

最小 `curl` 调用：

```bash
curl -sS <realtime-url>/tools/call \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":"req-1","method":"tools/call","params":{"name":"browser_execute_command","arguments":{"operation_id":"<uuid>","browser_ids":["<browser-id>"],"command":"evaluate","tabId":123,"scriptCode":"return document.title"}}}'
```

MCP arguments 与 `lh exec` 是同一套执行语义。直接调用时应显式传：

- `operation_id`：UUID，作为幂等键
- `browser_ids`：目标浏览器 ID 列表
- `command`：浏览器命令，例如 `evaluate`
- `params`：命令参数
- `tabId`：目标 tab ID，需要页面注入时传
- `scriptCode`：一次性执行的脚本源码
- `commandSlug`：已保存脚本的 slug
- `idempotency_window_ms`：可选幂等窗口

`scriptCode` 和 `commandSlug` 是互斥的执行方式，不要同时传。

## 方法 1：MCP 执行一次性 JS

```json
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "method": "tools/call",
  "params": {
    "name": "browser_execute_command",
    "arguments": {
      "operation_id": "00000000-0000-4000-8000-000000000000",
      "browser_ids": ["rem-example"],
      "command": "evaluate",
      "tabId": 123,
      "scriptCode": "return document.title"
    }
  }
}
```

对应 `lh`：

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> --script-code 'return document.title' evaluate
```

## 方法 2：MCP 执行已保存脚本

```json
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "method": "tools/call",
  "params": {
    "name": "browser_execute_command",
    "arguments": {
      "operation_id": "00000000-0000-4000-8000-000000000000",
      "browser_ids": ["rem-example"],
      "command": "evaluate",
      "tabId": 123,
      "commandSlug": "collect-title"
    }
  }
}
```

对应 `lh`：

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> --command-slug collect-title evaluate
```

## 方法 3：MCP 执行浏览器内置命令

```json
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "method": "tools/call",
  "params": {
    "name": "browser_execute_command",
    "arguments": {
      "operation_id": "00000000-0000-4000-8000-000000000000",
      "browser_ids": ["rem-example"],
      "command": "click",
      "tabId": 123,
      "params": {
        "selector": "button"
      }
    }
  }
}
```

对应 `lh`：

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> --params '{"selector":"button"}' click
```

## 返回值

返回内容按 `ExecResponse` 理解：

- `operation_id`
- `task_id`
- `status`: `completed` / `partial` / `failed`
- `results`: 每个浏览器一条结果，包含 `browser_id`、`status`、`result` 或 `error`

## 与 `lh` 的对应关系

| `lh` 用法 | MCP 对应 |
|---|---|
| `lh browsers list` | 先选择要填入 `browser_ids` 的浏览器 |
| `lh exec ... --script-code ... evaluate` | `command: "evaluate"` + `scriptCode` |
| `lh exec ... --script-file ... evaluate` | 读取文件后填入 `scriptCode` |
| `lh exec ... --command-slug ... evaluate` | `command: "evaluate"` + `commandSlug` |
| `lh exec ... --params '<json>' <command>` | `command` + `params` |
| `lh exec --operation-id ...` | 传入同一个 `operation_id` |

如果用户在问 MCP，只说明 MCP 工具名、参数形状、鉴权方式、`lh` 等价命令和
返回值如何解释。

## 调试顺序

1. 确认 MCP 调用目标是 realtime origin。
2. 确认请求使用可执行 scope 的 bearer token。
3. 确认 `browser_ids` 来自当前可用浏览器列表。
4. 确认 `operation_id` 是 UUID。
5. 确认 `scriptCode` 和 `commandSlug` 没有同时出现。
6. 根据 `results[].error.code` 判断是离线、鉴权、参数还是浏览器执行失败。
