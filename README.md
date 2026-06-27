# linghou-skill

用于 Linghou 浏览器自动化工作的 Codex skill。

这个仓库按 `skills` CLI 可识别的结构组织，包含一个可安装的 skill：
`skills/linghou-skill/SKILL.md`。

## 安装

查看仓库中可用的 skill：

```bash
npx skills add linghou-ai/linghou-skill --list
```

只安装这个 skill：

```bash
npx skills add linghou-ai/linghou-skill --skill linghou-skill
```

显式安装到 Codex：

```bash
npx skills add linghou-ai/linghou-skill --skill linghou-skill --agent codex
```

如果仓库是私有仓库，请在已有 GitHub clone 权限的机器上执行这些命令。

## 适用范围

当 agent 处理 Linghou 浏览器自动化相关任务时使用这个 skill：

- 让 AI、CLI 或自动化工具操作用户真实浏览器
- 在本地 Native Messaging 和远程 realtime WebSocket 通道之间做判断
- 区分一次性 `scriptCode` 执行和受治理的 `commandSlug` 脚本
- 通过 CLI 和 Market 发布、更新、发现、审核或执行可复用浏览器脚本
- 检查 `linghou`、`linghou-realtime`、`lhcli` 和共享文档之间的协议漂移

## 仓库结构

```text
skills/
  linghou-skill/
    SKILL.md
    references/
      architecture-contract.md
      cli-workflows.md
      safety-and-governance.md
examples/
  prompts.md
```

## 本地开发

在本仓库内：

```bash
npx skills add . --list
npx skills add . --skill linghou-skill
```

如果父项目把本仓库作为 submodule 引入：

```bash
git submodule update --init --recursive
npx skills add ./linghou-skill --skill linghou-skill
```
