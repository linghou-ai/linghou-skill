# Linghou 浏览器任务工作流

按用户任务选择命令。先用 `lh browsers list` 选择浏览器；用户未给 tab ID 时，用 `tabs_list` 找目标页。

## 阅读、提取与分析

优先读取 Markdown，包含可访问 iframe 内容：

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> get_page_markdown_with_iframes
```

Markdown 无法保留所需结构时，改用 `get_page_html_with_iframes`。仍不能完成时，才使用 `--script-code` 或 `--script-file`。

## 页面交互

操作前先创建 snapshot，使用其返回的 Ref；不要只为阅读页面而创建 snapshot。

```bash
lh exec --browser-id <browser-id> --tab-id <tab-id> snapshot
lh exec --browser-id <browser-id> --tab-id <tab-id> --params '{"ref":"@e1"}' click
lh exec --browser-id <browser-id> --tab-id <tab-id> --params '{"ref":"@e2","value":"hello"}' input
```

页面导航、刷新、弹窗切换或异步重渲染后，重新 snapshot。元素仅能用 CSS 选择器时，先用 `count_elements`、`is_element_visible` 或 `wait_for_element` 验证。

## 截图、标签页与导航

```bash
lh exec --browser-id <browser-id> tabs_list
lh exec --browser-id <browser-id> --tab-id <tab-id> capture_screenshot
lh exec --browser-id <browser-id> --tab-id <tab-id> reload
```

创建、关闭、前进和后退等操作必须使用命令目录中已有的内置命令。

## 脚本与 CDP 的升级顺序

1. 内置命令。
2. 一次性 `--script-code` 或 `--script-file`。
3. 已验证且需要复用的脚本，用 `lh script` 保存并通过 `--command-slug` 执行。
4. 仅在需要网络、性能或协议级调试时使用 `lh cdp`。

`scriptCode` 是裸动态源码，不经过市集脚本的扫描、审核、URL 和 capability 策略；可复用或公开的操作优先使用 `commandSlug`。

## 最小故障收敛

1. tab 失败、超时或 URL 不符：重新执行 `tabs_list`，不要沿用可能过期的 tab ID。
2. content 命令失败：确认页面不是浏览器受限页面，并在交互前重新 `snapshot`。
3. 浏览器离线：执行 `lh browsers list`；本地目标检查 `lh install-host` 和扩展连接，远程目标检查 realtime 地址与 `rem-*` 在线状态。
4. 连续两次超时或执行失败：停止重试，提示用户检查扩展是否运行并已连接。
