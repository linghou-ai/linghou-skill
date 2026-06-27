# Linghou CLI 工作流

当任务涉及 `lh` 使用、脚本发布、浏览器执行、本地助手安装或 CLI 路径调试时，
读取本参考。

在正式记录命令前，用 `lh --help` 或当前 `lhcli` 源码确认精确 flag。下面的
示例描述的是意图和期望路由。

## 设置与身份

典型设置：

```bash
lh config set market-url https://linghou.loock.vip
lh config set realtime-url https://linghou.loock.vip
lh login
lh whoami
```

本地浏览器助手设置：

```bash
lh install-host --browser chrome --extension-id <extension-id>
lh install-host --browser edge --extension-id <extension-id>
```

浏览器发现：

```bash
lh browsers list
lh browsers rename <browser-id> <friendly-name>
lh browsers forget <browser-id>
```

执行前先判断 browser ID：

- `loc-*`：本地 Native Messaging / 本地 IPC 路径
- `rem-*`：远程 realtime WebSocket 路径

## 一次性执行

只把原始源码用于不需要成为受治理资产的临时自动化：

```bash
lh exec evaluate --browser-id <loc-or-rem-id> --tab-id <tab-id> --script-code 'return document.title'
lh exec evaluate --browser-id <loc-or-rem-id> --tab-id <tab-id> --script-file ./task.js
```

期望行为：

- 请求携带 `scriptCode`。
- 不发生 Market 脚本 resolve。
- 不应用脚本级扫描、审核、URL 策略、版本或可见性规则。
- 插件仍在浏览器正常限制内执行。

## 可复用脚本生命周期

任何可复用内容都应使用 Market 支持的脚本：

```bash
lh script create --slug collect-page-title --file ./collect-page-title.js --match-url 'https://example.com/*'
lh script update collect-page-title --file ./collect-page-title.js
lh script info collect-page-title
lh script list
lh script search title
lh script toggle collect-page-title
lh script delete collect-page-title
```

按 slug 执行：

```bash
lh exec evaluate --browser-id <loc-or-rem-id> --tab-id <tab-id> --command-slug collect-page-title
```

期望行为：

- 请求携带 `commandSlug`，而不是用户直接传入的裸代码。
- 在公开 exec 边界，`commandSlug` 和 `scriptCode` 互斥。
- 对 `rem-*`，realtime 通过 Market internal command resolve。
- 对 `loc-*`，`lhcli` 使用用户 CLI token 通过 Market resolve，然后通过本地
  IPC / Native Messaging 转发解析出的代码和 `scriptPolicy`。
- 插件执行解析出的代码前，先强制检查 `matchUrl` 和 `denyUrl`。

## 调试清单

本地执行失败时：

1. 确认插件能连接 `com.linghou.lhcli`。
2. 确认 host registration 匹配当前浏览器和 extension ID。
3. 确认插件已有或能收到 `loc-*` 本地 browser ID。
4. 检查 `lhcli` 配置和 token 状态。
5. 验证该 browser ID 的本地 IPC endpoint registration。

远程执行失败时：

1. 确认插件有 plugin token 和已签名的 `rem-*` browser ID。
2. 确认 WebSocket 连接到所选 realtime origin 的 `/ws`。
3. 确认 realtime 接受首条 `connect` 消息。
4. 分别检查 token scope/version 和 browser ID 签名失败。
5. dispatch 前确认 `GET /api/browsers` 显示浏览器在线。

`commandSlug` 失败时：

1. 确认脚本存在，且 slug 是语义化标识而不是数字 ID。
2. 确认脚本 enabled、未 revoked、scan passed、moderation approved。
3. 确认可见性允许当前调用方执行。
4. 确认 URL 策略匹配目标 tab。
5. 确认 `scriptPolicy` 到达插件。
