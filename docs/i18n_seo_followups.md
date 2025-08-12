## i18n & SEO 后续优化与迭代清单

更新时间：2025-08-12

### 已完成
- 语言支持：`en`、`zh-CN`、`zh-HK`；移除 `ja/ko`。
- 集中配置：`src/i18n/config.ts` 管理 `SUPPORTED_LANGUAGES/DEFAULT_LANGUAGE/hreflang/ogLocale`。
- URL 前缀：`/:lang(en|zh-CN|zh-TW)/*`。
- 语言同步：`useLocaleFromUrl` 从 URL 写入全局。
- Head 输出：`components/Seo.tsx` 基于 DOM 更新 `title/description/canonical/hreflang/og/twitter`。
- 选择器：去掉国旗 emoji，按集中配置渲染。
- 文档：`README.md` 增加词条增减说明。

### 待办（优先级从高到低）
1. 为所有页面接入 `Seo` 组件
   - `WorkflowDetail`/`ModelDetail`/`Recipes`/`Profile`/`WorkflowBuilder`/`StyleTrainer`
   - 每页定义本地化 `title/description` key（建议 `seo.<page>.title|desc`）。

2. 站点级 OG 图片与每页自定义图片
   - 站点默认：`/og-image.png`。
   - 详情页动态图：优先使用内容封面，回退到站点默认。

3. sitemap 多语言化（可脚本生成）
   - `public/sitemap.xml` 使用 `xhtml:link` 输出各语言互链。
   - 定期生成脚本（CI）按路由与内容更新。

4. `<html lang>` 随主题/语言完整覆盖
   - 目前由 `Seo` 写入；确保 SSR/预渲染后仍正确（见第 6 点）。

5. canonical 规则
   - 规范化尾斜杠与查询参数，避免重复。

6. 预渲染/SSR（可选，强 SEO）
   - 迁移到 Next.js 或使用 `vite-plugin-ssr`；输出静态 HTML，提升索引质量与首屏。

7. 多语言内容完整性校验
   - 构建脚本对比语言包 key 差异，缺失时报错或警告。

8. 语言路由与 301
   - 根路径 `/` 做 301 到 `/en`（当前为前端重定向，可在边缘配置 301）。

9. robots 与 hreflang 规范
   - 确保仅公开应索引的路径；对私有/动态页使用 `noindex`（可在 `Seo` 组件支持）。

10. `vercel.json` 检查
   - 已有 `/:path* -> /index.html` 重写，满足 SPA；如启用 SSR 需调整。

### 约定
- 语言代码：`en`、`zh-CN`、`zh-TW`。
- hreflang：`en`、`zh-CN`、`zh-TW`、`x-default`。
- og:locale：`en_US`、`zh_CN`、`zh_TW`。

