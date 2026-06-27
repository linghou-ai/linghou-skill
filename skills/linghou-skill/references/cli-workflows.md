# Linghou CLI 操作浏览器命令

当任务涉及 `lh` 操作浏览器时，读取本参考。回答时聚焦具体命令和参数。

当前 `lh exec` 形状是：

```bash
lh exec [OPTIONS] --browser-id <browser-id> <command>
```

也就是 `<command>` 放在最后，例如 `evaluate`。

## 设置与身份

先配置服务地址并登录：

```bash
lh config set market-url <market-url>
lh config set realtime-url <realtime-url>
lh login
lh whoami
```

安装本地浏览器助手：

```bash
lh install-host --browser chrome --extension-id <extension-id>
lh install-host --browser edge --extension-id <extension-id>
```

查看和管理浏览器：

```bash
lh browsers list
lh browsers rename --name <friendly-name> <browser-id>
lh browsers forget <browser-id>
```

执行前先判断 browser ID：

- `loc-*`：本地浏览器目标
- `rem-*`：远程浏览器目标

## 方法 1：执行浏览器内置命令

通用形状：

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> --params '<json>' <command>
```

示例：

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> --params '{"selector":"button"}' click
```

如果命令不需要 tab 或参数，可以省略 `--tab-id` 或 `--params`。

## 方法 2：执行一次性 JS 源码

执行临时脚本：

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> --script-code 'return document.title' evaluate
```

说明：

- `--script-code` 直接传源码。
- 末尾的浏览器命令是 `evaluate`。

## 方法 3：执行本地 JS 文件

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> --script-file ./task.js evaluate
```

说明：

- `--script-file` 读取本地文件内容。
- 文件内容会作为一次性脚本执行。

## 方法 4：保存脚本并通过 slug 执行

保存脚本并按 slug 复用：

```bash
lh script create --name "Collect page title" --slug collect-page-title --code 'return document.title'
lh script update --slug collect-page-title --code 'return document.title'
lh script info --slug collect-page-title
lh script list
lh script search title
lh script toggle --slug collect-page-title
lh script delete --slug collect-page-title
```

按 slug 执行：

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> --command-slug collect-page-title evaluate
```

说明：

- `--command-slug` 使用已保存脚本。
- `--command-slug` 和 `--script-code` / `--script-file` 不要混用。

## 调试清单

本地目标执行失败时：

1. `lh whoami`
2. `lh browsers list`
3. `lh install-host --browser chrome --extension-id <extension-id>`
4. 重新执行 `lh exec ... evaluate`

远程目标执行失败时：

1. `lh whoami`
2. `lh config set realtime-url <url>`
3. `lh browsers list`
4. 确认目标 `rem-*` 在线后重新执行 `lh exec ... evaluate`

`commandSlug` 失败时：

1. `lh script info <slug>`
2. `lh script list`
3. 重新执行 `lh exec --browser-id <browser-id> --tab-id <tab-id> --command-slug <slug> evaluate`
