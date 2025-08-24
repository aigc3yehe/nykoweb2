# 符合Tailwind CSS规范的主题系统

## 🎨 概述

我们基于最新的设计规范创建了完整的light/dark主题系统，完全遵循Tailwind CSS的dark mode最佳实践，提供了统一的颜色管理和主题切换功能。

## ✨ 主要特性

### 1. 完整的设计系统
- **背景色层级**: Primary、Secondary、Tertiary、Quaternary
- **文本色系统**: 主要、次要、提示、禁用、状态文本
- **线条色系统**: 细微、粗线条
- **链接色系统**: 默认、按下、禁用状态
- **组件专用色**: 弹窗、聊天、开关、按钮等

### 2. 遵循Tailwind CSS规范
- **标准dark:前缀**: 完全遵循Tailwind CSS的dark mode语法
- **嵌套颜色定义**: 使用`dark: { DEFAULT: '#color' }`结构
- **自动响应**: 基于`darkMode: 'class'`配置自动切换
- **JavaScript工具函数**: 编程方式获取和设置主题

### 3. 智能主题切换
- **自动检测**: 根据系统主题偏好自动切换
- **本地存储**: 记住用户的主题选择
- **实时监听**: 监听系统主题变化并响应
- **手动控制**: 提供手动切换主题的API

## 🚀 快速开始

### 使用标准Tailwind CSS dark mode语法（推荐）

```html
<!-- 背景色 -->
<div class="bg-primary dark:bg-primary-dark">主背景色</div>
<div class="bg-secondary dark:bg-secondary-dark">次背景色</div>
<div class="bg-tertiary dark:bg-tertiary-dark">第三级背景色</div>

<!-- 文本色 -->
<div class="text-text-main dark:text-text-main-dark">主要文本</div>
<div class="text-text-secondary dark:text-text-secondary-dark">次要文本</div>
<div class="text-text-tips dark:text-text-tips-dark">提示文本</div>

<!-- 边框色 -->
<div class="border border-line-subtle dark:border-line-subtle-dark">细微边框</div>
<div class="border border-line-strong dark:border-line-strong-dark">粗边框</div>

<!-- 链接色 -->
<a class="text-link-default dark:text-link-default-dark">默认链接</a>

<!-- 组件色 -->
<div class="bg-pop-ups dark:bg-pop-ups-dark">弹窗背景</div>
<div class="bg-chat-bg dark:bg-chat-bg-dark">聊天背景</div>
```

### JavaScript工具函数

```typescript
import { setTheme, getCurrentTheme, toggleTheme } from './utils/theme';

// 获取当前主题
const currentTheme = getCurrentTheme(); // 'light' | 'dark'

// 设置主题
setTheme('dark');

// 切换主题
const newTheme = toggleTheme();
```

## 📁 文件结构

```
src/
├── index.css                 # CSS变量和工具类定义
├── utils/
│   └── theme.ts             # 主题工具函数
├── components/
│   └── ui/
│       ├── ThemeToggle.tsx  # 主题切换组件
│       └── ThemeDemo.tsx    # 主题演示组件
└── tailwind.config.js       # Tailwind配置

docs/
├── theme_guide.md           # 详细使用指南
└── THEME_SYSTEM.md         # 系统概述（本文件）
```

## 🎯 颜色规范

### Light主题核心颜色
- **主背景**: `#F3F5F9` - 页面主背景
- **次背景**: `#FFFFFF` - 卡片、弹窗背景
- **主要文本**: `#121314` - 标题、重要文本
- **次要文本**: `#686E7D` - 描述、说明文本
- **默认链接**: `#4458FF` - 链接颜色
- **成功状态**: `#1C7E33` - 成功文本
- **错误状态**: `#CA3542` - 错误文本
- **警告状态**: `#9A6300` - 警告文本

### Dark主题核心颜色
- **主背景**: `#000000` - 页面主背景
- **次背景**: `#121314` - 卡片、弹窗背景
- **主要文本**: `#FFFFFF` - 标题、重要文本
- **次要文本**: `#9CA1AF` - 描述、说明文本
- **默认链接**: `#8B99FF` - 链接颜色
- **成功状态**: `#4CB564` - 成功文本
- **错误状态**: `#FF7584` - 错误文本
- **警告状态**: `#FFD957` - 警告文本

## 🔧 组件使用

### ThemeToggle组件

```tsx
import ThemeToggle from './components/ui/ThemeToggle';

// 默认大小
<ThemeToggle />

// 自定义大小
<ThemeToggle size="lg" />

// 自定义样式
<ThemeToggle className="custom-class" />
```

### ThemeDemo组件

```tsx
import ThemeDemo from './components/ui/ThemeDemo';

// 在开发环境中查看主题效果
<ThemeDemo />
```

## 📋 最佳实践

### 1. 遵循Tailwind CSS规范
始终使用标准的`dark:`前缀语法，这是Tailwind CSS推荐的做法，确保与生态系统的兼容性。

### 2. 语义化命名
使用语义化的颜色名称，如`text-main`、`bg-secondary`，而不是具体的颜色值。

### 3. 一致的颜色层级
按照设计系统的层级使用颜色：Primary → Secondary → Tertiary → Quaternary。

### 4. 测试主题切换
在开发过程中，确保测试light和dark两种主题下的显示效果。

### 5. 颜色配置结构
在`tailwind.config.js`中使用嵌套结构定义颜色：
```javascript
colors: {
  'text-main': {
    DEFAULT: '#121314',
    dark: {
      DEFAULT: '#FFFFFF',
    }
  }
}
```

## 🔄 迁移指南

### 从旧主题系统迁移

1. **替换颜色类名**:
   ```html
   <!-- 旧版本 -->
   <div class="bg-design-main-blue">...</div>
   
   <!-- 新版本 -->
   <div class="bg-link-default dark:bg-link-default-dark">...</div>
   ```

2. **更新文本颜色**:
   ```html
   <!-- 旧版本 -->
   <div class="text-design-main-text">...</div>
   
   <!-- 新版本 -->
   <div class="text-text-main dark:text-text-main-dark">...</div>
   ```

3. **更新边框颜色**:
   ```html
   <!-- 旧版本 -->
   <div class="border-design-line-light-gray">...</div>
   
   <!-- 新版本 -->
   <div class="border border-line-subtle dark:border-line-subtle-dark">...</div>
   ```

4. **颜色配置迁移**:
   ```javascript
   // 旧版本
   colors: {
     design: {
       'main-text': '#121314',
       dark: {
         'main-text': '#FFFFFF',
       }
     }
   }
   
   // 新版本 (符合Tailwind CSS规范)
   colors: {
     'text-main': {
       DEFAULT: '#121314',
       dark: {
         DEFAULT: '#FFFFFF',
       }
     }
   }
   ```

## 🐛 常见问题

### Q: 主题切换不生效？
A: 确保在main.tsx中调用了`initializeTheme()`函数。

### Q: 如何自定义主题颜色？
A: 修改`tailwind.config.js`中的颜色定义，使用嵌套结构定义light和dark变体。

### Q: 如何添加新的颜色变量？
A: 在`tailwind.config.js`中添加新的颜色定义，遵循`{ DEFAULT: '#color', dark: { DEFAULT: '#color' } }`结构。

### Q: 为什么要使用这种颜色结构？
A: 这是Tailwind CSS官方推荐的dark mode实现方式，确保与Tailwind生态系统的最佳兼容性。

## 📞 支持

如果你在使用过程中遇到问题，请参考：
1. `docs/theme_guide.md` - 详细使用指南
2. `src/components/ui/ThemeDemo.tsx` - 主题演示组件
3. `src/utils/theme.ts` - 工具函数文档
