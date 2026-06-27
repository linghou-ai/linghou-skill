# Linghou 架构契约

当任务涉及组件归属、路由边界、字段命名、共享协议或跨子模块协作时，读取本参考。

## 组件边界

| 组件 | 拥有 | 不拥有 |
|---|---|---|
| 浏览器插件 | 真实浏览器执行、popup 状态、Market 标签页登录桥接、远程 WebSocket 客户端、本地 Native Messaging 客户端、受治理脚本执行前的 `scriptPolicy` URL 校验 | 用户账号、脚本定义、token 撤销状态、任务持久化 |
| `lhcli` | CLI 登录、配置、浏览器 list/rename/forget、脚本 create/update/delete/toggle/info/list/search、`lh exec`、本地 Native Messaging host、本地 IPC | Market 脚本审核规则、realtime 浏览器注册表、插件 UI |
| `linghou-realtime` | `/api/health`、`/api/browsers*`、`/api/exec`、`/tools/call`、`/tasks/*`、`/ws`、任务调度、浏览器注册表、token introspection 缓存、`rem-*` WebSocket session | Web session、命令 CRUD、脚本公开广场、密码鉴权 |
| Market | Web 登录/session、CLI/plugin token 签发和撤销、用户账号、命令定义、公开脚本页面、后台审核/审计、`commandSlug` resolve | 浏览器 dispatch、realtime 任务状态、本地 Native Messaging |
| shared 包 | 权威 TypeScript 协议、实体、schema、常量、命令错误和目标 | Rust 镜像实现细节 |

## 身份与传输

- `loc-*` browser ID 属于本地 Native Messaging / 本地 IPC。
- `rem-*` browser ID 属于远程 realtime WebSocket session。
- 远程 browser ID 由 realtime 签名并校验。
- 本地 browser ID 由 Native Messaging host 派生或返回。
- 插件 token 的 `scope='plugin'`，用于连接 `/ws`。
- CLI 和 agent token 调用 realtime HTTP/MCP 执行路由。
- token 通过 `Authorization: Bearer <jwt>` 传递，不放进 URL。

## 执行路径

### 一次性动态自动化

`scriptCode` 是原始动态源码，适合临时的、面向单次任务的自动化：

1. CLI/agent 发送包含 `scriptCode` 的 exec 请求。
2. realtime 或本地 IPC 把源码转发给插件。
3. 插件通过浏览器侧执行器运行源码。

它没有脚本级扫描、审计、URL 策略、capability 声明、Market 版本或源码留痕。
浏览器 API 仍可能拒绝在受限页面执行。

### 受治理的可复用脚本

`commandSlug` 是受管理的资产路径：

1. CLI/agent 用语义化 slug 指定脚本。
2. Market 把 slug resolve 为代码和 `BrowserScriptPolicy`。
3. realtime 或 `lhcli` 转发 `scriptCode` 和 `scriptPolicy`。
4. 插件执行前检查 URL 策略。

任何需要复用、发布、审核、搜索、版本化或按名称执行的脚本，都应该走这条路径。

## 字段命名规则

- Exec REST、MCP 和 task 查询的传输字段使用 snake_case：
  `operation_id`, `browser_ids`, `task_id`, `browser_id`,
  `idempotency_window_ms`.
- 浏览器 dispatch 兼容字段保持 camelCase：
  `tabId`, `scriptCode`, `commandSlug`.
- Native Messaging 使用 camelCase：
  `requestId`, `browserId`, `tabId`, `scriptCode`, `scriptPolicy`.
- Browser entity 使用 camelCase：
  `browserId`, `friendlyName`, `isDefault`, `lastSeenAt`, `forgottenAt`.
- Market 脚本操作使用 `slug` 作为稳定的公开/CLI 标识。不要重新引入数字脚本
  ID 作为执行或管理路径。

## 漂移检查

修改共享行为前，比较这些位置：

- 文档契约 vs `linghou/packages/shared/src/protocols`
- TypeScript shared 类型 vs `lhcli` 中的 Rust 镜像
- realtime 请求/响应处理 vs CLI 序列化
- Market resolve 路由 vs realtime/local resolve 调用方
- 插件 dispatch 处理 vs `scriptCode` 和 `scriptPolicy` 语义

如果它们不一致，以协调契约和当前 shared 类型为事实来源，再更新过期实现或文档。
