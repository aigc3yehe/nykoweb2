# MAVAE Web2

## 多语言（i18n）

项目的多语言配置已集中管理：

- 配置文件：`src/i18n/config.ts`
  - `SUPPORTED_LANGUAGES`: `en`、`zh-CN`（简体中文）、`zh-TW`（繁体中文）
  - `DEFAULT_LANGUAGE`: 默认语言
- 语言状态：`src/store/i18nStore.ts`
  - 读取/保存用户选择到 `localStorage`
  - 根据浏览器语言在 `en`/`zh-CN`/`zh-TW` 之间自动回退
- 语言包：
  - 英文：`src/locales/en.ts`
  - 简体中文：`src/locales/zh-CN.ts`
  - 繁体中文：`src/locales/zh-TW.ts`
  - 旧文件 `src/locales/zh.ts` 仅为兼容保留，请迁移到 `zh-CN.ts`
- 在组件中取词：
  - `const { t } = useI18n()`，示例：`t('pricing.title')`

### 增减词条

1. 在所有语言包中添加同名 key，保持层级一致：

```ts
// en.ts
export const en = { pricing: { title: 'Plans & pricing', subtitle: 'Upgrade to gain access to Premium features', cta: 'Upgrade now' } }

// zh-CN.ts
export const zhCN = { pricing: { title: '套餐与定价', subtitle: '升级以获得高级功能', cta: '立即升级' } }

// zh-TW.ts
export const zhTW = { pricing: { title: '方案與定價', subtitle: '升級以獲得高級功能', cta: '立即升級' } }
```

2. 组件使用：`t('pricing.cta')`

3. 若某语言缺失 key，会退回显示该 key 文本，便于在开发时发现遗漏。

### 新增语言（可选）

1. 在 `src/i18n/config.ts` 的 `SUPPORTED_LANGUAGES` 中追加；
2. 新建语言包文件并在 `useI18n.ts` 中引入；
3. 在 `i18nStore.ts` 中完善浏览器语言映射；
4. 语言选择下拉基于 `SUPPORTED_LANGUAGES` 自动渲染。
