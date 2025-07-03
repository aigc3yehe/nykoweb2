# MAVAE API 服务系统

这是一个完整的、类型安全的 API 服务系统，实现了 MAVAE 平台的所有 API 接口。

## 特性

- 🔒 **类型安全**: 完整的 TypeScript 类型定义
- 🔄 **自动重试**: 内置重试机制，提高请求可靠性
- 🔑 **认证管理**: 自动处理 Bearer Token 和 Privy Token
- ⚡ **错误处理**: 统一的错误处理和异常抛出
- 📝 **完整覆盖**: 实现了所有 API 文档中的接口
- 🎯 **模块化设计**: 按功能模块组织的清晰架构

## 安装和设置

### 环境变量

在 `.env` 文件中配置基础 URL：

```env
VITE_API_BASE_URL=https://api.mavae.ai
```

### 基本使用

```typescript
import api from '@/services/api'

// 设置认证令牌
api.setBearerToken('your_jwt_token_here')

// 获取用户信息
const userInfo = await api.users.getUserInfo('did:google:123456789')
```

## API 模块

### 1. 认证模块 (Auth)

```typescript
// 用户登录
const loginResponse = await api.auth.login({
  provider: 'google',
  google_token: 'your_google_token'
})

// 设置令牌供后续使用
api.setBearerToken(loginResponse.access_token)
```

### 2. 用户模块 (Users)

```typescript
// 获取用户信息
const userInfo = await api.users.getUserInfo('did:google:123456789')

// 获取用户计划状态
const planState = await api.users.getUserPlan('did:google:123456789')

// 管理员功能：更新用户角色
await api.users.updateRole('did:google:123456789', { role: 'admin' })
```

### 3. 内容模块 (Contents)

```typescript
// 获取内容列表
const contents = await api.contents.getContentsList({
  page: 1,
  page_size: 20,
  type: 'image'
})

// 生成AI内容
const generateResponse = await api.contents.generateContent({
  user: 'did:google:123456789',
  provider: 'flux',
  model: 'flux-kontext-pro',
  source: 'model',
  source_id: 1,
  prompt: '一只可爱的小猫',
  input_type: ['text'],
  output_type: ['image']
})

// 检查生成状态
const status = await api.contents.getGenerateState({
  task_id: generateResponse.task_id
})
```

### 4. 工作流模块 (Workflows)

```typescript
// 获取工作流列表
const workflows = await api.workflows.getWorkflowsList({
  page: 1,
  page_size: 10
})

// 创建工作流
const workflowResponse = await api.workflows.createWorkflow({
  name: '我的工作流',
  user: 'did:google:123456789',
  provider: 'flux',
  model: 'flux-kontext-pro',
  input_type: ['text'],
  output_type: ['image']
})
```

### 5. 模型模块 (Models)

```typescript
// 获取模型列表
const models = await api.models.getModelsList({
  page: 1,
  page_size: 10
})

// 使用模型生成内容
const modelResponse = await api.models.generateContent({
  user: 'did:google:123456789',
  model_id: 1,
  prompt: '动漫风格的猫咪',
  base_model: 'sdxl-base-1.0'
})
```

### 6. 积分系统 (Points)

```typescript
// 获取当前积分
const points = await api.points.getCurrentPoints('did:google:123456789')

// 获取排行榜
const leaderboard = await api.points.getLeaderboard({
  page: 1,
  page_size: 50
})
```

### 7. 支付系统 (Payments)

```typescript
// 创建支付会话
const paymentSession = await api.payments.createCheckoutSession({
  plan: 'premium',
  mode: 'subscription',
  success_url: 'https://app.mavae.ai/success',
  cancel_url: 'https://app.mavae.ai/cancel'
})

// 重定向到支付页面
window.location.href = paymentSession.url
```

### 8. 文件上传 (Files)

```typescript
// 上传文件
const formData = new FormData()
formData.append('files', file)

const uploadResponse = await api.files.uploadFiles(formData)
```

## 错误处理

```typescript
import { ApiError } from '@/services/api'

try {
  const userInfo = await api.users.getUserInfo('invalid_did')
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.statusCode, error.message)
    console.error('Error data:', error.data)
  } else {
    console.error('Unknown error:', error)
  }
}
```

## 配置选项

### 基础配置

```typescript
import { API_CONFIG } from '@/services/api'

// 查看当前配置
console.log('Base URL:', API_CONFIG.BASE_URL)
console.log('Timeout:', API_CONFIG.TIMEOUT)
console.log('Retry attempts:', API_CONFIG.RETRY.ATTEMPTS)
```

### 自定义请求配置

```typescript
// 带自定义配置的请求
const userInfo = await api.users.getUserInfo('did:google:123456789', {
  timeout: 60000,        // 60秒超时
  retries: 5,           // 重试5次
  requiresAuth: true,   // 需要认证
  headers: {            // 自定义请求头
    'Custom-Header': 'value'
  }
})
```

## 最佳实践

### 1. 错误处理

```typescript
const handleApiCall = async () => {
  try {
    const result = await api.users.getUserInfo('did:google:123456789')
    return result
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.statusCode) {
        case 401:
          // 处理未授权
          console.error('用户未登录')
          break
        case 403:
          // 处理权限不足
          console.error('权限不足')
          break
        case 404:
          // 处理未找到
          console.error('资源不存在')
          break
        default:
          console.error('API错误:', error.message)
      }
    }
    throw error
  }
}
```

### 2. 令牌管理

```typescript
// 在应用启动时设置令牌
const initializeApi = (token: string) => {
  api.setBearerToken(token)
}

// 登录后更新令牌
const handleLogin = async (googleToken: string) => {
  const response = await api.auth.login({
    provider: 'google',
    google_token: googleToken
  })
  
  // 更新 API 令牌
  api.setBearerToken(response.access_token)
  
  return response
}
```

### 3. 分页数据处理

```typescript
const loadAllContents = async () => {
  let page = 1
  const allContents = []
  
  while (true) {
    const response = await api.contents.getContentsList({
      page,
      page_size: 50
    })
    
    if (!response.contents || response.contents.length === 0) {
      break
    }
    
    allContents.push(...response.contents)
    page++
  }
  
  return allContents
}
```

### 4. 生成状态轮询

```typescript
const generateAndWait = async (request: GenerateContentRequest) => {
  const generateResponse = await api.contents.generateContent(request)
  
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const status = await api.contents.getGenerateState({
          task_id: generateResponse.task_id
        })
        
        if (status.status === 'success') {
          resolve(status.upscaled_urls)
        } else if (status.status === 'failed') {
          reject(new Error(status.error || '生成失败'))
        } else {
          // 继续轮询
          setTimeout(checkStatus, 3000)
        }
      } catch (error) {
        reject(error)
      }
    }
    
    setTimeout(checkStatus, 3000)
  })
}
```

## 与现有代码的兼容性

新的 API 服务系统与现有的 `userService.ts` 保持兼容。现有代码可以继续使用，同时逐步迁移到新的 API 系统：

```typescript
// 旧的方式（仍然可用）
import { queryUser } from '@/services/userService'
const user = await queryUser({ did: 'did:google:123456789' })

// 新的方式（推荐）
import api from '@/services/api'
const userInfo = await api.users.getUserInfo('did:google:123456789')
```

## 示例代码

查看 `examples.ts` 文件获取完整的使用示例，包括：

- 完整的认证流程
- 内容生成和管理
- 工作流创建和使用
- 支付处理
- 文件上传
- 推荐系统

## 类型导出

所有类型都可以单独导入：

```typescript
import type {
  UserBaseInfo,
  ContentItem,
  WorkflowDto,
  GenerateContentRequest,
  LoginResponse
} from '@/services/api'
```

## 支持和维护

这个 API 服务系统是根据最新的 MAVAE API 文档实现的。如果 API 发生变化，只需要：

1. 更新 `types.ts` 中的类型定义
2. 更新对应服务类中的方法
3. 更新 `config.ts` 中的端点配置

系统的模块化设计使得维护和扩展变得简单。 