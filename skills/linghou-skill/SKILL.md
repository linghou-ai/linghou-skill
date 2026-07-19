---
name: linghou-skill
description: "用于通过 Linghou 操作真实浏览器：读取网页内容、获取标签页、截图、页面交互、执行临时或市集脚本、CDP 调试，以及说明对应的 `lh` CLI 和 MCP 调用。只要用户询问 `lh`、浏览器或标签页、网页内容、截图、点击/输入、evaluate、scriptCode、script-file、commandSlug、脚本管理或发布、MCP `/tools/call` 或 `browser_execute_command` 参数，就使用这个 skill。"
---

# linghou-skill

使用这个 skill 时，只围绕 Linghou 系统支持的浏览器操作方法回答：

- 用 `lh` 命令行操作浏览器
- 用 MCP 的 `browser_execute_command` 操作浏览器
- 用 `lh script` 把网页操作脚本保存、更新、公开到 Linghou 市集

除非用户明确要求排查实现，否则把回答保持在 CLI/MCP 的用户操作层。

## 决策顺序

1. 先选择目标浏览器：`lh browsers list`。用户未提供 tab ID 时，再用 `tabs_list` 查找目标页。
2. 只读网页内容时，优先 `get_page_markdown_with_iframes`；Markdown 不足才用 HTML 或临时脚本。
3. 点击、输入、滚动或表单操作前，先调用 `snapshot` 获得 Ref，再优先用 Ref 操作元素。
4. 内置命令无法完成时，才使用 `--script-code` / `--script-file`；需要复用或发布时改用 `commandSlug`。
5. 只有脚本无法满足网络、性能或调试协议级需求时，才使用 `lh cdp`。
6. 命令必须存在于 `references/command-catalog.md`；不要猜测命令名或参数。

默认使用 `lh`。用户明确接入 agent 或要求 JSON-RPC 时，再给 MCP 参数与等价 `lh` 命令。

## 快速工作流

### 阅读、提取或分析页面

```bash
lh browsers list
lh exec --browser-id <browser-id> tabs_list
lh exec --browser-id <browser-id> --tab-id <tab-id> get_page_markdown_with_iframes
```

### 点击、输入或填写表单

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> snapshot
lh exec --browser-id <browser-id> --tab-id <tab-id> --params '{"ref":"@e1"}' click
lh exec --browser-id <browser-id> --tab-id <tab-id> --params '{"ref":"@e2","value":"hello"}' input
```

页面跳转或异步更新后，重新 `snapshot`，不要复用旧 Ref。

### 失败时

1. 重新执行 `tabs_list`，确认 tab ID 仍有效且 URL 正确。
2. 确认目标页可以注入；浏览器内部页等受限页面不能执行 content 命令。
3. 用 `lh browsers list` 确认目标浏览器在线；本地目标是 `loc-*`，远程目标是 `rem-*`。
4. 连续两次超时或执行失败，提示用户检查扩展是否已安装、连接并处于运行状态。

详见 `references/browser-workflows.md`。

## 系统支持的浏览器操作方法

### 0. 准备和选择浏览器

```bash
lh config set market-url <market-url>
lh config set realtime-url <realtime-url>
lh login
lh whoami
lh install-host --browser chrome --extension-id <extension-id>
lh browsers list
lh exec --browser-id <browser-id> tabs_list
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

保存到市集的公开脚本要遵守发布口径：

- 不要在 slug、名称、描述、分类、标签或源码注释中出现不应展示的第三方项目名或来源名。
- `description` 支持 Markdown，把它当成给用户/agent 的提示词，写清用途、执行前提、参数、返回值和示例。
- `category` 按网站/平台分类；同一个网站的多个脚本使用同一个网站分类。
- `tags` 使用中文，表达动作、内容类型或场景。

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

- 按任务选择命令、处理 tab/Ref/超时：读 `references/browser-workflows.md`。
- 确认可用内置命令及其分组：读 `references/command-catalog.md`。
- `lh` 命令行：读 `references/cli-workflows.md`。
- 添加、保存、发布市集脚本：读 `references/add-scripts.md`。
- MCP 工具调用：读 `references/mcp-workflows.md`。

## 工作规则

- 直接给可执行命令，不要写大段背景。
- 需要占位值时，用 `<browser-id>`、`<tab-id>`、`<slug>`、`<token>`。
- 阅读优先 `get_page_markdown_with_iframes`；交互前先 `snapshot`，再优先使用 Ref。
- 不要把 tab ID 同时放进 `--tab-id` 和 `--params`。
- 页面刷新、跳转或显著更新后，重新获取 snapshot；旧 Ref 可能失效。
- 区分 `scriptCode` 和 `commandSlug`，只说明使用差异和命令写法。
- 解释 MCP 时，把字段和 `lh` 命令逐项对应。
- `lh exec` 的 `<command>` 在命令末尾，例如 `... evaluate`。
- 内置命令不能满足时才使用动态脚本；动态脚本仍不能满足时才使用 CDP。
- 发布脚本时，先检查公开字段是否干净、分类是否按网站、标签是否中文。
- 如果命令可能随实现变化，先用 `lh --help` 或源码确认。

## 验证

按任务选择最小验证：

- skill 自身变更：`npx skills add <repo-or-path> --list`
- CLI 文档或行为确认：`lh --help`、`lh <subcommand> --help`
- MCP 字段确认：检查 Exec/MCP 契约文档或 shared protocol 类型
