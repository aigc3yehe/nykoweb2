# 自动语言识别迭代方案

## 项目概述

基于现有的多语言系统，实现用户语言的自动检测和适配，包括页面meta信息和支付方式的自动选择。保持与现有系统的完全兼容性。

## 核心需求

1. **自动检测用户语言**：中国大陆用户默认简体中文，其他地区默认英文
2. **支付方式区分**：不同地区提供完全不同的支付选项
3. **保持现有功能**：用户仍可手动切换语言，不影响现有体验
4. **SEO优化**：根据语言自动更新页面meta标签

## 技术架构

### 现有系统兼容性

**现有多语言系统**：
- 语言类型：`'en' | 'zh' | 'zh-tw'`
- 状态管理：Jotai `languageAtom`
- 翻译系统：`useI18n()` Hook
- 本地存储：localStorage 'language'

**集成策略**：
- 扩展现有 `i18nStore.ts`
- 保留所有现有功能
- 添加自动检测逻辑作为初始化增强

## 实施方案

### 第一阶段：地区配置系统

#### 1.1 创建地区配置文件

**文件位置**：`src/config/regionConfig.ts`

```typescript
export interface RegionConfig {
  region: string
  language: 'en' | 'zh' | 'zh-tw'
  country: string
  
  // 页面meta信息
  meta: {
    title: string
    description: string
    keywords: string
    ogTitle: string
    ogDescription: string
    locale: string
  }
  
  // 支付配置
  payment: {
    availableMethods: ('stripe' | 'hel' | 'alipay' | 'wechat')[]
    pricingRoute: string
  }
}

export const REGION_CONFIGS: Record<string, RegionConfig> = {
  // 中国大陆 - 简体中文
  'CN': {
    region: 'CN',
    language: 'zh',
    country: 'China',
    meta: {
      title: "MAVAE - AI内容生成平台",
      description: "使用MAVAE强大的平台创建、生成和代币化您的AI内容。托管您的创意并与前沿AI模型一起构建。",
      keywords: "AI, 内容生成, 创意, 代币化, 工作流, 模型",
      ogTitle: "MAVAE - AI内容生成平台",
      ogDescription: "使用MAVAE强大的平台创建、生成和代币化您的AI内容。",
      locale: "zh_CN"
    },
    payment: {
      availableMethods: ['alipay', 'wechat'],
      pricingRoute: '/pricing-cn'
    }
  },
  
  // 默认配置 - 其他地区英文
  'DEFAULT': {
    region: 'DEFAULT',
    language: 'en',
    country: 'Global',
    meta: {
      title: "MAVAE - AI Content Generation Platform",
      description: "Create, generate, and tokenize your AI content with MAVAE's powerful platform. Host your creativity and build with cutting-edge AI models.",
      keywords: "AI, content generation, creativity, tokenization, workflow, models",
      ogTitle: "MAVAE - AI Content Generation Platform",
      ogDescription: "Create, generate, and tokenize your AI content with MAVAE's powerful platform.",
      locale: "en_US"
    },
    payment: {
      availableMethods: ['stripe', 'hel'],
      pricingRoute: '/pricing'
    }
  }
}

// 地区检测规则
export const REGION_DETECTION = {
  // 中国大陆的判断条件
  chinaMainland: {
    // IP地理位置
    countryCodes: ['CN'],
    // 浏览器语言
    languages: ['zh-CN', 'zh-Hans', 'zh-Hans-CN'],
    // 时区
    timezones: ['Asia/Shanghai', 'Asia/Beijing', 'Asia/Chongqing', 'Asia/Harbin', 'Asia/Urumqi']
  },
  
  // 默认为其他地区
  default: {
    fallback: 'DEFAULT'
  }
}
```

#### 1.2 创建地区检测服务

**文件位置**：`src/services/regionDetectionService.ts`

```typescript
import { REGION_CONFIGS, REGION_DETECTION, RegionConfig } from '../config/regionConfig'

export class RegionDetectionService {
  private static instance: RegionDetectionService
  
  public static getInstance(): RegionDetectionService {
    if (!RegionDetectionService.instance) {
      RegionDetectionService.instance = new RegionDetectionService()
    }
    return RegionDetectionService.instance
  }
  
  /**
   * 检测用户地区配置
   * 优先级：浏览器语言 > 时区 > IP地理位置 > 默认
   */
  public detectRegionConfig(): RegionConfig {
    // 1. 检查浏览器语言
    if (this.isChinaMainlandByLanguage()) {
      return REGION_CONFIGS.CN
    }
    
    // 2. 检查时区
    if (this.isChinaMainlandByTimezone()) {
      return REGION_CONFIGS.CN
    }
    
    // 3. 默认返回全球配置
    return REGION_CONFIGS.DEFAULT
  }
  
  private isChinaMainlandByLanguage(): boolean {
    const userLanguages = navigator.languages || [navigator.language]
    return userLanguages.some(lang => 
      REGION_DETECTION.chinaMainland.languages.some(cnLang => 
        lang.toLowerCase().startsWith(cnLang.toLowerCase())
      )
    )
  }
  
  private isChinaMainlandByTimezone(): boolean {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      return REGION_DETECTION.chinaMainland.timezones.includes(timezone)
    } catch {
      return false
    }
  }
  
  /**
   * 获取当前地区的支付方式
   */
  public getAvailablePaymentMethods(): string[] {
    const config = this.detectRegionConfig()
    return config.payment.availableMethods
  }
  
  /**
   * 获取当前地区的定价页面路由
   */
  public getPricingRoute(): string {
    const config = this.detectRegionConfig()
    return config.payment.pricingRoute
  }
}

export const regionDetectionService = RegionDetectionService.getInstance()
```

### 第二阶段：集成现有多语言系统

#### 2.1 扩展现有的 i18nStore

**文件位置**：`src/store/i18nStore.ts` (修改现有文件)

```typescript
import { atom } from 'jotai'
import { regionDetectionService } from '../services/regionDetectionService'

export type Language = 'en' | 'zh' | 'zh-tw'

export interface I18nMessages {
  [key: string]: string | I18nMessages
}

export const languageAtom = atom<Language>('en')

export const setLanguageAtom = atom(
  null,
  (_, set, language: Language) => {
    set(languageAtom, language)
    localStorage.setItem('language', language)
    // 语言切换时更新meta标签
    updatePageMeta(language)
  }
)

// 增强的语言初始化 - 保持兼容现有逻辑
export const initLanguageAtom = atom(
  null,
  (_, set) => {
    // 1. 优先使用用户保存的语言偏好
    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && ['en', 'zh', 'zh-tw'].includes(savedLang)) {
      set(languageAtom, savedLang)
      updatePageMeta(savedLang)
      return
    }
    
    // 2. 使用地区检测确定默认语言
    const regionConfig = regionDetectionService.detectRegionConfig()
    const detectedLang = regionConfig.language
    
    // 3. 浏览器语言兼容检查 (保持现有逻辑)
    const browserLang = navigator.language.split('-')[0] as Language
    const supportedLangs: Language[] = ['en', 'zh', 'zh-tw']
    
    // 4. 最终语言决策
    const finalLang = supportedLangs.includes(detectedLang) ? detectedLang : 
                     (supportedLangs.includes(browserLang) ? browserLang : 'en')
    
    set(languageAtom, finalLang)
    updatePageMeta(finalLang)
  }
)

// Meta标签更新函数
function updatePageMeta(language: Language): void {
  const regionConfig = regionDetectionService.detectRegionConfig()
  
  // 只有当检测到的语言与当前语言匹配时才使用地区配置
  const shouldUseRegionMeta = regionConfig.language === language
  
  if (shouldUseRegionMeta) {
    const meta = regionConfig.meta
    
    // 更新页面标题
    document.title = meta.title
    
    // 更新meta标签
    updateMetaTag('name', 'description', meta.description)
    updateMetaTag('name', 'keywords', meta.keywords)
    updateMetaTag('property', 'og:title', meta.ogTitle)
    updateMetaTag('property', 'og:description', meta.ogDescription)
    updateMetaTag('property', 'og:locale', meta.locale)
    
    // 更新html lang属性
    document.documentElement.lang = language === 'zh-tw' ? 'zh-TW' : language
  }
}

function updateMetaTag(attribute: string, name: string, content: string): void {
  let element = document.querySelector(`meta[${attribute}="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}
```

#### 2.2 扩展翻译文件

**在现有翻译文件中添加meta信息**：

**文件位置**：`src/locales/zh.ts` (修改现有文件)

```typescript
export const zh = {
  // ... 现有的所有翻译内容保持不变
  nav: {
    discover: '发现',
    creativeTools: '创意工具',
    // ... 现有内容
  },
  header: {
    search: '搜索...',
    credits: '积分',
    // ... 现有内容
  },
  // ... 所有现有内容保持不变
  
  // 新增：页面meta信息 (用于备用)
  meta: {
    title: "MAVAE - AI内容生成平台",
    description: "使用MAVAE强大的平台创建、生成和代币化您的AI内容。托管您的创意并与前沿AI模型一起构建。",
    keywords: "AI, 内容生成, 创意, 代币化, 工作流, 模型"
  }
}
```

**文件位置**：`src/locales/en.ts` (修改现有文件)

```typescript
export const en = {
  // ... 现有的所有翻译内容保持不变
  nav: {
    discover: 'Discover',
    creativeTools: 'Creative Tools',
    // ... 现有内容
  },
  header: {
    search: 'Search...',
    credits: 'Credits',
    // ... 现有内容
  },
  // ... 所有现有内容保持不变
  
  // 新增：页面meta信息 (用于备用)
  meta: {
    title: "MAVAE - AI Content Generation Platform",
    description: "Create, generate, and tokenize your AI content with MAVAE's powerful platform. Host your creativity and build with cutting-edge AI models.",
    keywords: "AI, content generation, creativity, tokenization, workflow, models"
  }
}
```

### 第三阶段：支付系统集成

#### 3.1 修改定价页面组件

**文件位置**：`src/pages/Pricing.tsx` (修改现有文件)

```typescript
import React, { useEffect, useState, useMemo } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useSearchParams } from 'react-router-dom'
import { selectedPaymentMethodAtom, showPaymentDropdownAtom, pricingAtom } from '../store/pricingStore'
import { useI18n } from '../hooks/useI18n'
import { paymentService } from '../services/paymentService'
import { showToastAtom } from '../store/imagesStore'
import { regionDetectionService } from '../services/regionDetectionService'
// ... 现有的其他imports

const Pricing: React.FC = React.memo(() => {
  const { t } = useI18n()
  // ... 现有的state和atoms
  
  // 新增：根据地区获取可用支付方式
  const availablePaymentMethods = useMemo(() => {
    const availableMethods = regionDetectionService.getAvailablePaymentMethods()
    
    // 支付方式配置映射
    const methodConfigs = {
      'stripe': { id: 'stripe' as const, name: 'Stripe', icon: StripeIcon },
      'hel': { id: 'hel' as const, name: 'Hel', icon: HelIcon },
      'alipay': { id: 'alipay' as const, name: '支付宝', icon: AlipayIcon },
      'wechat': { id: 'wechat' as const, name: '微信支付', icon: WechatIcon }
    }
    
    return availableMethods
      .map(method => methodConfigs[method])
      .filter(Boolean)
  }, [])
  
  // 现有的useEffect和处理函数保持不变
  // ... 所有现有逻辑
  
  return (
    <div className={/* 现有样式 */}>
      {/* 现有的组件结构保持不变 */}
      
      {/* 支付方式选择 - 使用动态的可用方式 */}
      <div className="payment-methods">
        {availablePaymentMethods.map(method => (
          <button
            key={method.id}
            onClick={() => setSelectedPaymentMethod(method.id)}
            className={selectedPaymentMethod === method.id ? 'active' : ''}
          >
            <img src={method.icon} alt={method.name} />
            {method.name}
          </button>
        ))}
      </div>
      
      {/* 其余现有UI保持不变 */}
    </div>
  )
})
```

#### 3.2 创建动态路由配置

**文件位置**：`src/components/layout/AppLayout.tsx` (修改现有文件)

```typescript
// 在现有的AppLayout中添加动态路由支持
import { regionDetectionService } from '../../services/regionDetectionService'

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // ... 现有的逻辑保持不变
  
  // 新增：动态获取定价页面路由
  const pricingRoute = useMemo(() => {
    return regionDetectionService.getPricingRoute()
  }, [])
  
  // 在路由配置中使用动态路由
  // ... 现有返回的JSX，但需要支持动态路由
  
  return <div>{children}</div>
}
```

**文件位置**：`src/App.tsx` (修改现有文件)

```typescript
import { regionDetectionService } from './services/regionDetectionService'

function App() {
  // ... 现有的逻辑保持不变
  
  // 添加中文定价页面路由支持
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* 现有的所有路由保持不变 */}
          <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          
          {/* 新增：中文定价页面路由 */}
          <Route path="/pricing-cn" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          
          {/* 其他现有路由保持不变 */}
        </Routes>
        
        {/* 现有的组件保持不变 */}
        <Toast />
        {/* ... 其他现有组件 */}
      </AppLayout>
    </BrowserRouter>
  )
}
```


## 扩展配置指南

### 添加新地区支持

**步骤1**：在 `regionConfig.ts` 中添加新配置

```typescript
export const REGION_CONFIGS: Record<string, RegionConfig> = {
  // ... 现有配置
  
  // 新地区示例：日本
  'JP': {
    region: 'JP',
    language: 'en', // 或新增日语支持
    country: 'Japan',
    meta: {
      title: "MAVAE - AI Content Generation Platform",
      description: "日本向けのAIコンテンツ生成プラットフォーム",
      keywords: "AI, コンテンツ生成, 創造性",
      ogTitle: "MAVAE - AI Content Generation Platform",
      ogDescription: "日本向けのAIコンテンツ生成プラットフォーム",
      locale: "ja_JP"
    },
    payment: {
      availableMethods: ['stripe', 'konbini'], // 日本特有的支付方式
      pricingRoute: '/pricing-jp'
    }
  }
}
```

**步骤2**：更新检测规则

```typescript
export const REGION_DETECTION = {
  // ... 现有规则
  
  // 新增日本检测规则
  japan: {
    countryCodes: ['JP'],
    languages: ['ja', 'ja-JP'],
    timezones: ['Asia/Tokyo']
  }
}
```

**步骤3**：在 `regionDetectionService.ts` 中添加检测逻辑

```typescript
public detectRegionConfig(): RegionConfig {
  // 现有逻辑...
  
  // 新增日本检测
  if (this.isJapanByLanguage() || this.isJapanByTimezone()) {
    return REGION_CONFIGS.JP
  }
  
  // ... 其他检测逻辑
}
```

### 添加新语言支持

**步骤1**：扩展现有语言类型

```typescript
// 在 i18nStore.ts 中
export type Language = 'en' | 'zh' | 'zh-tw' | 'ja'
```

**步骤2**：添加翻译文件

```typescript
// 创建 src/locales/ja.ts
export const ja = {
  nav: {
    discover: '発見',
    // ... 日语翻译
  },
  meta: {
    title: "MAVAE - AIコンテンツ生成プラットフォーム",
    // ... 日语meta信息
  }
}
```

**步骤3**：更新 useI18n Hook

```typescript
// 在 useI18n.ts 中添加
import { ja } from '../locales/ja'

const messages = {
  en,
  zh,
  'zh-tw': zhTw,
  ja
}
```

## 技术优势

1. **完全兼容现有系统**：不破坏任何现有功能
2. **用户体验保持一致**：自动检测仅影响默认设置
3. **灵活的配置系统**：易于添加新地区和语言
4. **性能优化**：客户端检测，无需额外网络请求
5. **SEO友好**：自动更新页面meta信息

## 风险控制

1. **渐进式发布**：可以先在测试环境验证各地区配置
2. **回退机制**：检测失败时自动回退到默认配置
3. **兼容性保证**：现有用户的语言偏好不受影响
4. **错误处理**：所有检测逻辑都有try-catch保护

## 完善性建议

### 对现有功能的补充

1. **用户偏好记录**：
   - 记录用户手动切换语言的行为
   - 在后续访问时优先使用用户的主动选择

2. **A/B测试支持**：
   - 可以配置对特定用户群体使用不同的检测策略
   - 收集用户语言切换的数据分析

3. **缓存优化**：
   - 将地区检测结果缓存到localStorage
   - 避免每次页面加载都重新检测

4. **监控和分析**：
   - 记录自动检测的准确率
   - 分析用户手动切换语言的频率

5. **内容本地化**：
   - 根据检测结果预加载对应语言的静态资源
   - 优化首屏加载性能

---
