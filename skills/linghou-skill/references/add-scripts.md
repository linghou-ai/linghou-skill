# 添加脚本到 Linghou 市集

当用户要把网页操作代码保存到自己的 Linghou 平台、发布到脚本广场、修正脚本名称/描述/分类/标签，或把一次性 `scriptCode` 沉淀为可复用 `commandSlug` 时，读取本参考。

## 基本流程

1. 明确目标网站、脚本用途、执行页面、输入参数和返回结果。
2. 把代码整理成可在浏览器页面主世界执行的 JS。脚本里可以读取 `params`，但不要依赖 Node.js `import`、本地文件、CLI runtime 或外部适配器对象。
3. 先用 `lh exec ... --script-file ./script.js evaluate` 在目标页面验证。
4. 用 `lh script create` 保存到平台；已有脚本用 `lh script update`。
5. 用 `lh script info --slug <slug>` 检查公开字段和扫描状态。
6. 用 `lh script search <名称关键词>` 验证公开检索能看到。

## 字段规范

### slug

- 使用小写字母、数字和短横线。
- 语义要稳定，例如 `<site>-<action>` 或 `<site>-<object>-<action>`。
- 如果 slug 已经包含不应展示的词，不要试图改 slug；新建干净 slug，再删除旧脚本。

示例：

```text
reddit-search-results
xhs-note-extract
zhihu-question-summary
```

### name

- 使用中文名称，让用户一眼知道脚本做什么。
- 不要在名称里写不应展示的第三方项目名、来源名或内部临时代号。

### description

`description` 支持 Markdown，把它当成脚本的使用提示词。至少写清：

- `## 用途`：脚本做什么。
- `## 执行前提`：需要先打开什么页面、是否需要登录、常见风控/权限限制。
- `## 参数`：通过 `--params '<JSON>'` 传入哪些字段，哪些必填，默认值是什么。
- `## 返回值`：返回对象或数组中包含哪些字段。
- `## 示例`：给出完整 `lh exec ... --command-slug ... evaluate` 命令。

无参数脚本也要明确写“无需参数，读取当前标签页”。

### category

- `category` 按网站/平台分类，不按功能分类。
- 同一个网站可能有多个脚本，它们应使用同一个网站分类。
- 国内网站优先使用中文站点名；国际网站使用用户可识别的官方名称。

示例：

```text
小红书
知乎
微博
Reddit
Hacker News
```

不要把 `category` 写成“网页采集”“自动化”“工具”这类功能词。

### tags

- `tags` 使用中文。
- 标签表达动作、对象或场景，不替代网站分类。
- 可以有多个标签，但保持短而可筛选。

示例：

```text
搜索
帖子
笔记
评论
内容提取
发布
下载
```

### visibility

- 用户要求“可见”或要进市场时，使用 `--visibility public`。
- 未验证的草稿才使用 `hidden`；如果从草稿转公开，执行 `lh script update --slug <slug> --visibility public`。

### match-url / deny-url

- `match-url` 尽量收窄到目标网站，例如 `*://*.xiaohongshu.com/*`。
- 支持同一脚本多个域名时重复传 `--match-url`。
- 有明确禁止页面时使用 `--deny-url`。

## 创建命令模板

```bash
lh script create \
  --slug <slug> \
  --name "<中文名称>" \
  --code "$(< ./script.js)" \
  --description "$(< ./description.md)" \
  --visibility public \
  --match-url "*://*.example.com/*" \
  --capability dom.read \
  --category "<网站名>" \
  --tag "<中文标签1>" \
  --tag "<中文标签2>" \
  --timeout 30000
```

更新已有脚本：

```bash
lh script update \
  --slug <slug> \
  --code "$(< ./script.js)" \
  --description "$(< ./description.md)" \
  --visibility public \
  --match-url "*://*.example.com/*" \
  --category "<网站名>" \
  --tag "<中文标签1>" \
  --tag "<中文标签2>" \
  --timeout 30000
```

如果要替换标签，直接重复传新的 `--tag`；如果要清空再设置，先用 `--clear-tags`，再执行一次带新标签的更新命令。

## 执行命令模板

无参数：

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> evaluate \
  --command-slug <slug>
```

带参数：

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> evaluate \
  --command-slug <slug> \
  --params '{"query":"关键词","limit":10}'
```

## 验证清单

```bash
lh script info --slug <slug>
lh script search <名称关键词>
```

检查点：

- `visibility: public`
- `status: enabled`
- `scan: passed`
- `category` 是网站/平台名
- `tags` 是中文
- `description` 有 Markdown 结构，并写清参数和示例
- slug、名称、描述、分类、标签、源码注释里没有不应展示的第三方项目名或来源名

如果发现 slug 本身不合适：

```bash
lh script create ... --slug <new-clean-slug> ...
lh script delete --slug <old-bad-slug>
```
