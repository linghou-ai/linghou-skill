# linghou-skill

Codex skill for Linghou browser automation work.

This repository is structured for the `skills` CLI. It contains one installable
skill at `skills/linghou-skill/SKILL.md`.

## Install

List available skills:

```bash
npx skills add linghou-ai/linghou-skill --list
```

Install only this skill:

```bash
npx skills add linghou-ai/linghou-skill --skill linghou-skill
```

Install for Codex explicitly:

```bash
npx skills add linghou-ai/linghou-skill --skill linghou-skill --agent codex
```

If this repository is private, run the command from a machine whose GitHub
credentials can clone `linghou-ai/linghou-skill`.

## What It Covers

Use this skill when an agent is working on Linghou browser automation:

- operating a real user browser from AI, CLI, or automation tooling
- deciding between local Native Messaging and remote realtime WebSocket paths
- keeping one-off `scriptCode` execution separate from governed `commandSlug`
  scripts
- publishing, updating, discovering, reviewing, or executing reusable browser
  scripts through the CLI and Market
- checking protocol drift across `linghou`, `linghou-realtime`, `lhcli`, and
  shared documentation

## Repository Layout

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

## Local Development

From this repository:

```bash
npx skills add . --list
npx skills add . --skill linghou-skill
```

From a parent project that tracks this repository as a submodule:

```bash
git submodule update --init --recursive
npx skills add ./skills/linghou-skill --skill linghou-skill
```
