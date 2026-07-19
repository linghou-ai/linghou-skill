# Linghou 内置浏览器命令目录

只使用本目录中的内置命令。命令集合的代码来源是 `@linghou/shared` 的 `builtin-list.ts`；修改实现时必须同步更新本文件。

## Worker：标签页、导航、页面读取

`tabs_list`、`tabs_close`、`tabs_create`、`get_all_tabs`、`get_active_tab`、`create_tab`、`close_tab`、`update_tab`、`go_back`、`go_forward`、`reload`、`capture_screenshot`、`get_page_markdown_with_iframes`、`get_page_html_with_iframes`

`tabs_list` 返回每个 tab 的 `frames` 数组，用于为 content 命令选择 `frameId` 或 `frameUrl`。不要为 frame 发现猜测或新增命令。

## Content：页面交互与查询

`snapshot`、`click`、`input`、`hover`、`scroll`、`select`、`check`、`uncheck`、`focus`、`blur`、`drag_and_drop`、`upload_file`、`right_click`、`double_click`、`press_key`、`keyboard_shortcut`、`clear_input`、`mouse_move`、`mouse_down`、`mouse_up`、`mouse_wheel`

`get_element`、`get_elements`、`get_element_text`、`get_element_attribute`、`get_element_style`、`get_element_rect`、`is_element_visible`、`is_element_enabled`、`count_elements`、`wait_for_element`、`wait_for_text`、`get_page_info`、`page_info`、`get_scroll_position`、`get_cookies`、`get_console_logs`、`screenshot`、`get_screenshot`

## Worker：存储、书签与 CDP

`bookmarks_add`、`bookmarks_list`、`get_bookmarks`、`storage_get`、`storage_set`、`get_storage`、`set_storage`、`cdp_execute`、`cdp_detach`、`cdp_get_sessions`

## Popup

`show_notification`、`update_status`、`show_config`、`open_tab`

`evaluate` 是动态脚本的执行命令：与 `--script-code`、`--script-file` 或 `--command-slug` 搭配使用；不要将它当作任意内置命令的替代品。
