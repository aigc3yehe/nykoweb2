/**
 * API 使用示例
 * 展示如何使用新的API服务进行各种操作
 */

import api from './index'
import type {
  LoginRequest,
  GenerateContentRequest,
  CreateWorkflowRequest,
  ModelGenerateRequest
} from './types'

// 1. 认证示例
export const authExamples = {
  // 用户登录
  async login() {
    try {
      const loginRequest: LoginRequest = {
        provider: 'google',
        google_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...'
      }
      
      const response = await api.auth.login(loginRequest)
      console.log('Login successful:', response)
      
      // 设置令牌以供后续请求使用
      api.setBearerToken(response.access_token)
      
      return response
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },

  // 管理员注册用户
  async registerUser() {
    try {
      // 需要先设置管理员令牌
      api.setAgentToken('admin_agent_token_here')
      
      const response = await api.auth.register({
        role: 'user',
        did: 'did:google:123456789',
        email: 'user@example.com',
        expires_in: '7d'
      })
      
      console.log('User registered:', response)
      return response
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }
}

// 2. 用户管理示例
export const userExamples = {
  // 获取用户信息
  async getUserInfo(did: string) {
    try {
      const userInfo = await api.users.getUserInfo(did)
      console.log('User info:', userInfo)
      return userInfo
    } catch (error) {
      console.error('Failed to get user info:', error)
      throw error
    }
  },

  // 获取用户计划状态
  async getUserPlan(did: string) {
    try {
      const planState = await api.users.getUserPlan(did, true)
      console.log('User plan:', planState)
      return planState
    } catch (error) {
      console.error('Failed to get user plan:', error)
      throw error
    }
  },

  // 管理员更新用户角色
  async updateUserRole(did: string, role: 'admin' | 'user' | 'whitelist' | 'banned') {
    try {
      const result = await api.users.updateRole(did, { role })
      console.log('Role updated:', result)
      return result
    } catch (error) {
      console.error('Failed to update role:', error)
      throw error
    }
  }
}

// 3. 内容管理示例
export const contentExamples = {
  // 获取内容列表
  async getContentsList() {
    try {
      const contents = await api.contents.getContentsList({
        page: 1,
        page_size: 20,
        order: 'created_at',
        desc: 'desc',
        type: 'image'
      })
      console.log('Contents list:', contents)
      return contents
    } catch (error) {
      console.error('Failed to get contents:', error)
      throw error
    }
  },

  // 生成AI内容
  async generateContent() {
    try {
      const request: GenerateContentRequest = {
        user: 'did:google:123456789',
        provider: 'flux',
        model: 'flux-kontext-pro',
        source: 'model',
        source_id: 1,
        prompt: '一只可爱的小猫在花园里玩耍',
        input_type: ['text'],
        output_type: ['image'],
        aigc_config: {
          width: 1024,
          height: 1024
        }
      }
      
      const response = await api.contents.generateContent(request)
      console.log('Content generation started:', response)
      
      // 轮询生成状态
      const checkStatus = async () => {
        const status = await api.contents.getGenerateState({
          task_id: response.task_id
        })
        console.log('Generation status:', status)
        
        if (status.status === 'success') {
          console.log('Generation completed:', status.upscaled_urls)
        } else if (status.status === 'failed') {
          console.error('Generation failed:', status.error)
        } else {
          // 继续轮询
          setTimeout(checkStatus, 5000)
        }
      }
      
      setTimeout(checkStatus, 5000)
      return response
    } catch (error) {
      console.error('Failed to generate content:', error)
      throw error
    }
  },

  // 点赞内容
  async likeContent(contentId: number, isLiked: boolean) {
    try {
      const result = await api.contents.likeContent(contentId, { is_liked: isLiked })
      console.log('Like action:', result)
      return result
    } catch (error) {
      console.error('Failed to like content:', error)
      throw error
    }
  }
}

// 4. 工作流管理示例
export const workflowExamples = {
  // 获取工作流列表
  async getWorkflowsList() {
    try {
      const workflows = await api.workflows.getWorkflowsList({
        page: 1,
        page_size: 10,
        order: 'usage',
        desc: 'desc'
      })
      console.log('Workflows list:', workflows)
      return workflows
    } catch (error) {
      console.error('Failed to get workflows:', error)
      throw error
    }
  },

  // 创建工作流
  async createWorkflow() {
    try {
      const request: CreateWorkflowRequest = {
        name: '我的AI图像生成工作流',
        description: '基于Flux模型的高质量图像生成',
        user: 'did:google:123456789',
        prompt: '生成美丽的风景图片',
        input_type: ['text', 'image'],
        output_type: ['image'],
        provider: 'flux',
        model: 'flux-kontext-pro',
        reference_images: [
          'https://example.com/ref1.jpg',
          'https://example.com/ref2.jpg'
        ]
      }
      
      const response = await api.workflows.createWorkflow(request)
      console.log('Workflow created:', response)
      return response
    } catch (error) {
      console.error('Failed to create workflow:', error)
      throw error
    }
  },

  // 使用工作流生成内容
  async generateWithWorkflow(workflowId: number) {
    try {
      const response = await api.workflows.generateContent({
        user: 'did:google:123456789',
        workflow_id: workflowId,
        text_value: '一个美丽的日落场景',
        width: 1024,
        height: 1024,
        n: 1
      })
      console.log('Workflow generation started:', response)
      return response
    } catch (error) {
      console.error('Failed to generate with workflow:', error)
      throw error
    }
  }
}

// 5. 模型管理示例
export const modelExamples = {
  // 获取模型列表
  async getModelsList() {
    try {
      const models = await api.models.getModelsList({
        page: 1,
        page_size: 10,
        order: 'usage',
        desc: 'desc',
        tag: 'anime'
      })
      console.log('Models list:', models)
      return models
    } catch (error) {
      console.error('Failed to get models:', error)
      throw error
    }
  },

  // 使用模型生成内容
  async generateWithModel(modelId: number) {
    try {
      const request: ModelGenerateRequest = {
        user: 'did:google:123456789',
        model_id: modelId,
        version: 1,
        prompt: '一只可爱的动漫风格猫咪',
        base_model: 'sdxl-base-1.0',
        width: 1024,
        height: 1024,
        negative_prompt: '模糊，低质量'
      }
      
      const response = await api.models.generateContent(request)
      console.log('Model generation started:', response)
      return response
    } catch (error) {
      console.error('Failed to generate with model:', error)
      throw error
    }
  }
}

// 6. 积分系统示例
export const pointsExamples = {
  // 获取当前积分
  async getCurrentPoints(userDid: string) {
    try {
      const points = await api.points.getCurrentPoints(userDid, true)
      console.log('Current points:', points)
      return points
    } catch (error) {
      console.error('Failed to get points:', error)
      throw error
    }
  },

  // 获取排行榜
  async getLeaderboard() {
    try {
      const leaderboard = await api.points.getLeaderboard({
        page: 1,
        page_size: 50
      })
      console.log('Leaderboard:', leaderboard)
      return leaderboard
    } catch (error) {
      console.error('Failed to get leaderboard:', error)
      throw error
    }
  }
}

// 7. 支付系统示例
export const paymentExamples = {
  // 创建支付会话
  async createPaymentSession() {
    try {
      const response = await api.payments.createCheckoutSession({
        plan: 'premium',
        mode: 'subscription',
        success_url: 'https://app.mavae.ai/success',
        cancel_url: 'https://app.mavae.ai/cancel'
      })
      console.log('Payment session created:', response)
      
      // 重定向到支付页面
      window.location.href = response.url
      return response
    } catch (error) {
      console.error('Failed to create payment session:', error)
      throw error
    }
  },

  // 验证支付结果
  async verifyPayment(sessionId: string) {
    try {
      const verification = await api.payments.verifyCheckoutSession(sessionId)
      console.log('Payment verification:', verification)
      return verification
    } catch (error) {
      console.error('Failed to verify payment:', error)
      throw error
    }
  }
}

// 8. 文件上传示例
export const fileExamples = {
  // 上传文件
  async uploadFiles(files: FileList) {
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })
      
      const response = await api.files.uploadFiles(formData)
      console.log('Files uploaded:', response)
      return response
    } catch (error) {
      console.error('Failed to upload files:', error)
      throw error
    }
  }
}

// 9. 推荐系统示例
export const referralExamples = {
  // 绑定推荐码
  async bindReferralCode(userDid: string, referralCode: string) {
    try {
      const result = await api.referrals.bindReferralCode(referralCode, {
        user: userDid
      })
      console.log('Referral code bound:', result)
      return result
    } catch (error) {
      console.error('Failed to bind referral code:', error)
      throw error
    }
  },

  // 获取邀请列表
  async getInvitesList(inviteCode: string) {
    try {
      const invites = await api.referrals.getInvitesList(inviteCode, {
        page: 1,
        page_size: 20
      })
      console.log('Invites list:', invites)
      return invites
    } catch (error) {
      console.error('Failed to get invites:', error)
      throw error
    }
  }
}

// 10. 完整的使用流程示例
export const completeWorkflowExample = async () => {
  try {
    console.log('=== Complete API Workflow Example ===')
    
    // 1. 用户登录
    console.log('1. Logging in...')
    const loginResponse = await authExamples.login()
    
    // 2. 获取用户信息
    console.log('2. Getting user info...')
    const userInfo = await userExamples.getUserInfo(loginResponse.user)
    
    // 3. 获取用户计划
    console.log('3. Getting user plan...')
    const userPlan = await userExamples.getUserPlan(loginResponse.user)
    
    // 4. 获取模型列表
    console.log('4. Getting models list...')
    const models = await modelExamples.getModelsList()
    
    // 5. 生成内容
    if (models.models && models.models.length > 0) {
      console.log('5. Generating content with first model...')
      const modelId = models.models[0].model_id
      await modelExamples.generateWithModel(modelId)
    }
    
    // 6. 获取积分信息
    console.log('6. Getting points info...')
    const points = await pointsExamples.getCurrentPoints(loginResponse.user)
    
    console.log('=== Workflow completed successfully ===')
    
    return {
      user: userInfo,
      plan: userPlan,
      models: models,
      points: points
    }
  } catch (error) {
    console.error('Workflow failed:', error)
    throw error
  }
}

// 导出所有示例
export default {
  auth: authExamples,
  users: userExamples,
  contents: contentExamples,
  workflows: workflowExamples,
  models: modelExamples,
  points: pointsExamples,
  payments: paymentExamples,
  files: fileExamples,
  referrals: referralExamples,
  completeWorkflow: completeWorkflowExample
} 