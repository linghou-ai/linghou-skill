---
name: linghou-skill
description: "用于 Linghou 浏览器自动化基础设施工作：AI 或 CLI 操作用户真实浏览器、本地 Native Messaging、远程 realtime WebSocket 执行、lhcli 工作流、Market 脚本治理、scriptCode 与 commandSlug 的取舍，以及 linghou、linghou-realtime、lhcli 和共享文档之间的协议漂移。只要用户要求调试、实现、审查、记录或操作 Linghou 浏览器控制和可复用浏览器脚本，就使用这个 skill。"
---

# linghou-skill

使用这个 skill 时，要让 Linghou 浏览器自动化相关工作在浏览器插件、CLI、
realtime 服务、Market 和协调文档之间保持一致。

Linghou 的核心产品边界是：

> AI、CLI 和自动化工具可以稳定、安全地操作用户真实浏览器，同时把可复用
> 浏览器脚本沉淀为可管理、可发现、可审核的资产。

## 先做这些

1. 先判断当前工作区和任务类型：
   - 通过 Native Messaging 做本地浏览器控制
   - 通过 realtime WebSocket 做远程浏览器控制
   - CLI 登录、host 安装、浏览器列表或执行
   - 脚本发布、更新、发现、审核或执行
   - 跨项目协议、schema、字段、路由或鉴权漂移
2. 如果任务发生在 Linghou monorepo/workspace 中，改代码前先读当前事实来源：
   - `docs/coordination/COORDINATION-CONTRACT.md`
   - `docs/protocols-and-shared-types.md`
   - `docs/architecture.md`
3. 检查相关实现归属：
   - `linghou/packages/extension` 负责浏览器侧执行
   - `lhcli` 负责 CLI 和 Native Messaging host 行为
   - `linghou-realtime` 负责 HTTP、MCP、WebSocket、任务调度和浏览器状态
   - `linghou/packages/market` 负责鉴权、token、脚本、公开广场和后台审核
   - `linghou/packages/shared` 负责 TypeScript 协议、实体、schema 和常量
4. 保持文档和代码同步。任何协议、路由、鉴权、schema、secret、字段命名
   或共享类型变更，都应同步更新协调文档。

## 核心判断

要明确选择执行路径。

- 一次性动态自动化使用 `scriptCode`。它是直接转发给浏览器侧执行器的原始
  源码，不要把它描述成受治理或已审计的脚本。
- 可复用脚本使用 `commandSlug`。它必须通过 Market resolve，并携带
  `scriptPolicy`，这样可见性、版本、URL 策略、capability、审核状态和撤销
  状态才可执行。
- `loc-*` 目标走本地 Native Messaging / 本地 IPC。
- `rem-*` 目标走远程 realtime WebSocket。

不要随意混用这些概念。Linghou 的很多回归都来自把本地 browser ID 当成远程
browser ID、把受治理脚本当成裸源码，或只修改共享协议的一侧实现。

## 参考文件路由

只读取当前任务需要的参考文件：

- 拓扑、组件归属、字段命名和契约不变量：读
  `references/architecture-contract.md`。
- CLI 具体流程和命令意图：读 `references/cli-workflows.md`。
- 安全、治理和审核边界：读 `references/safety-and-governance.md`。

## 工作规则

- 优先相信当前协调文档和共享类型，不要根据单个实现猜测协议。
- 声称跨项目行为已修复前，要检查所有受影响子模块。
- 保持 Market 负责身份和脚本治理、realtime 负责浏览器调度和状态的边界。
- 调试连接失败时，沿实际路径取证：插件存储和日志、Native Messaging host
  或 WebSocket 握手、token scope/version、browser ID 前缀/签名，以及
  realtime/Market 路由。
- 添加可复用自动化时，把它做成 `commandSlug` 脚本并走 CLI/Market 治理，
  不要藏在临时 `scriptCode` 里。
- 修改协议语义时，同一次变更里更新测试和文档。

## 验证

按改动范围选择验证方式：

- 共享协议或 schema 改动：运行 shared 包测试和 typecheck
- realtime 执行或 WebSocket 改动：运行 realtime 测试，并做直接 health 或
  exec 检查
- CLI/Native Messaging 改动：运行 Rust 测试和相关 `lh` 命令流程
- Market 鉴权或脚本改动：运行 Market 测试/build，并实际访问受影响路由或页面
- 跨项目行为：至少验证一条端到端路径，不要只依赖孤立单元测试

如果用户要求生产部署或线上行为，本地通过不够。要验证真实部署路径，并报告
具体执行过的检查。
