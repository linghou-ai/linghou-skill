# linghou-skill

用于说明 Linghou 系统支持哪些操作浏览器的方法，并给出具体 `lh` 命令和 MCP
调用的 Codex skill。

这个仓库按 `skills` CLI 可识别的结构组织，包含一个可安装的 skill：
`skills/linghou-skill/SKILL.md`。

## 开源许可

本仓库是开源仓库，使用 MIT License。你可以直接从 GitHub 安装、查看和复用
skill 内容。

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

## 适用范围

当 agent 需要回答或操作这些内容时使用这个 skill：

- `lh login`、`lh whoami`、`lh config`、`lh install-host`
- `lh browsers list|rename|forget`
- `lh exec ... evaluate`、`scriptCode`、`script-file`、`commandSlug`
- `lh exec ... --params '<json>' <command>`
- `lh script create|update|info|list|search|toggle|delete`
- MCP `/tools/call` 和 `browser_execute_command` 参数

这个 skill 只覆盖浏览器操作方法、命令和 MCP 参数。

## 仓库结构

```text
skills/
  linghou-skill/
    SKILL.md
    references/
      cli-workflows.md
      mcp-workflows.md
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
