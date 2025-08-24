# 主题系统使用指南

## 概述

我们基于最新的设计规范创建了完整的light/dark主题系统，包含以下核心组件：

### 1. 基础颜色系统

#### 背景色层级
- `primary` - 主背景色
- `secondary` - 次背景色  
- `tertiary` - 第三级背景色
- `quaternary` - 第四级背景色

#### 反转色系统
- `inverse-primary` - 反转主色
- `inverse-secondary` - 反转次色
- `inverse-tertiary` - 反转第三色

### 2. 文本颜色系统

#### 主要文本色
- `text-primary` - 主要文本
- `text-secondary` - 次要文本
- `text-tips` - 提示文本
- `text-disable` - 禁用文本
- `text-inverse` - 反转文本

#### 状态文本色
- `text-success` - 成功状态
- `text-error` - 错误状态
- `text-warning` - 警告状态

### 3. 线条颜色系统
- `line-subtle` - 细微线条
- `line-strong` - 粗线条

### 4. 链接颜色系统
- `link-default` - 默认链接
- `link-pressed` - 按下状态
- `link-disable` - 禁用状态

### 5. 组件专用颜色
- `pop-ups` - 弹窗背景
- `chat` - 聊天背景
- `switch` - 开关组件
- `btn-selected` - 按钮选中状态
- `brand-10` - 品牌色10%透明度

## 使用方法

### 1. Tailwind CSS 类名

#### 背景色
```html
<!-- 使用Tailwind类名 -->
<div class="bg-primary dark:bg-primary-dark">主背景色</div>
<div class="bg-secondary dark:bg-secondary-dark">次背景色</div>
<div class="bg-tertiary dark:bg-tertiary-dark">第三级背景色</div>
<div class="bg-quaternary dark:bg-quaternary-dark">第四级背景色</div>
```

#### 文本色
```html
<!-- 主要文本 -->
<div class="text-text-primary dark:text-text-primary-dark">主要文本</div>
<div class="text-text-secondary dark:text-text-secondary-dark">次要文本</div>
<div class="text-text-tips dark:text-text-tips-dark">提示文本</div>

<!-- 状态文本 -->
<div class="text-text-success dark:text-text-success-dark">成功文本</div>
<div class="text-text-error dark:text-text-error-dark">错误文本</div>
<div class="text-text-warning dark:text-text-warning-dark">警告文本</div>
```

#### 边框色
```html
<div class="border border-line-subtle dark:border-line-subtle-dark">细微边框</div>
<div class="border border-line-strong dark:border-line-strong-dark">粗边框</div>
```

#### 链接色
```html
<a class="text-link-default dark:text-link-default-dark">默认链接</a>
<a class="text-link-pressed dark:text-link-pressed-dark">按下链接</a>
<a class="text-link-disable dark:text-link-disable-dark">禁用链接</a>
```

### 2. CSS 变量工具类

#### 背景色工具类
```html
<div class="bg-primary-theme">主背景色</div>
<div class="bg-secondary-theme">次背景色</div>
<div class="bg-tertiary-theme">第三级背景色</div>
<div class="bg-quaternary-theme">第四级背景色</div>
```

#### 文本色工具类
```html
<div class="text-primary-theme">主要文本</div>
<div class="text-secondary-theme">次要文本</div>
<div class="text-tips-theme">提示文本</div>
<div class="text-disable-theme">禁用文本</div>
<div class="text-inverse-theme">反转文本</div>
<div class="text-success-theme">成功文本</div>
<div class="text-error-theme">错误文本</div>
<div class="text-warning-theme">警告文本</div>
```

#### 边框色工具类
```html
<div class="border border-subtle-theme">细微边框</div>
<div class="border border-strong-theme">粗边框</div>
```

#### 链接色工具类
```html
<a class="text-link-default">默认链接</a>
<a class="text-link-pressed">按下链接</a>
<a class="text-link-disable">禁用链接</a>
```

#### 组件背景色工具类
```html
<div class="bg-pop-ups-theme">弹窗背景</div>
<div class="bg-chat-theme">聊天背景</div>
<div class="bg-switch-theme">开关背景</div>
<div class="bg-btn-selected-theme">按钮选中背景</div>
<div class="bg-brand-10-theme">品牌色背景</div>
```

### 3. CSS 变量直接使用

```css
.my-component {
  background-color: var(--primary-bg);
  color: var(--text-primary);
  border: 1px solid var(--line-subtle);
}

.my-component:hover {
  background-color: var(--tertiary-bg);
}
```

## 主题切换

### 自动切换
系统会根据用户的系统主题偏好自动切换light/dark主题。

### 手动切换
通过添加/移除 `dark` 类名来手动切换主题：

```javascript
// 切换到暗色主题
document.documentElement.classList.add('dark');

// 切换到亮色主题
document.documentElement.classList.remove('dark');

// 检查当前主题
const isDark = document.documentElement.classList.contains('dark');
```

## 最佳实践

### 1. 优先使用工具类
推荐使用CSS变量工具类（如 `bg-primary-theme`），因为它们会自动适应主题切换。

### 2. 语义化命名
使用语义化的颜色名称，而不是具体的颜色值，这样更容易维护和理解。

### 3. 状态一致性
确保相同状态的元素在不同主题下都使用相同的颜色变量。

### 4. 测试主题切换
在开发过程中，确保测试light和dark两种主题下的显示效果。

## 颜色值对照表

### Light主题
| 颜色类型 | 十六进制值 | 用途 |
|---------|-----------|------|
| 主背景 | #F3F5F9 | 页面主背景 |
| 次背景 | #FFFFFF | 卡片、弹窗背景 |
| 主要文本 | #121314 | 标题、重要文本 |
| 次要文本 | #686E7D | 描述、说明文本 |
| 提示文本 | #9CA1AF | 提示、辅助信息 |
| 成功文本 | #1C7E33 | 成功状态 |
| 错误文本 | #CA3542 | 错误状态 |
| 警告文本 | #9A6300 | 警告状态 |
| 默认链接 | #4458FF | 链接颜色 |
| 细微线条 | #E2E4E8 | 分割线、边框 |

### Dark主题
| 颜色类型 | 十六进制值 | 用途 |
|---------|-----------|------|
| 主背景 | #000000 | 页面主背景 |
| 次背景 | #121314 | 卡片、弹窗背景 |
| 主要文本 | #FFFFFF | 标题、重要文本 |
| 次要文本 | #9CA1AF | 描述、说明文本 |
| 提示文本 | #686E7D | 提示、辅助信息 |
| 成功文本 | #4CB564 | 成功状态 |
| 错误文本 | #FF7584 | 错误状态 |
| 警告文本 | #FFD957 | 警告状态 |
| 默认链接 | #8B99FF | 链接颜色 |
| 细微线条 | #292B2F | 分割线、边框 |
