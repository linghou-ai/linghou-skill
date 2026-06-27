# 安全与治理

当需要判断自动化应该走裸执行还是受管理脚本，或审查安全敏感的浏览器控制改动时，
读取本参考。

## 治理边界

保持一次性自动化和可复用资产分离：

- 临时工作可以使用 `scriptCode`。把它视为直接动态代码。
- 需要发现、发布、版本、可见性、URL 策略、capability 声明、审核、审计或撤销的
  可复用脚本必须使用 `commandSlug`。

不要创建把 `commandSlug` 静默降级为裸 `scriptCode` 的兼容路径。如果 Market
resolve 失败，受治理脚本执行应该明确失败。

## 安全不变量

- Bearer token 不能通过 URL 或 query string 传递。
- CLI OAuth callback 必须保持 loopback-only。
- 插件登录只通过页面桥接传递一次性授权数据；plugin bearer token 不能经过
  `postMessage`。
- Extension auth bridge 脚本只应运行在允许的 Market origin 上。
- `BROWSER_ID_SECRET` 只用于签名 browser ID。
- `INTERNAL_API_SECRET` 只用于保护服务间调用。
- Market token introspection 失败时，realtime 应 fail closed。
- forgotten browser tombstone 不能复活。
- 密码只能以带盐哈希形式保存。

## 审查问题

审查改动时，检查这些问题：

1. 代码是否保留了 `loc-*` 和 `rem-*` 的归属边界？
2. 可复用脚本是否经过 Market 治理？
3. 裸脚本路径是否清楚地保持为 raw 且未审计？
4. token scope 和 token 传输方式是否正确？
5. 内部服务调用是否使用 internal secret，而不是 browser ID secret？
6. shared 类型和 Rust 镜像是否仍兼容？
7. 如果路由、字段、schema、secret 或行为变了，文档是否已更新？

## 脚本资产卫生

可复用脚本应该包含：

- 稳定的语义化 slug
- 清楚的名称和描述
- 尽量收窄的 URL 策略
- 必要时声明 capabilities
- 合理的 timeout 预算
- 可见的 owner/review 状态
- 通过 CLI/Market 路径形成的更新历史

不要把每个小任务都变成受治理脚本。这个分界是有意设计的：raw script 适合探索，
受治理脚本适合其他人可以发现和信任的可重复自动化。
