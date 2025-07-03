import { apiService } from './base'
import { API_ENDPOINTS } from './config'
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest 
} from './types'

/**
 * 认证模块API服务
 */
export class AuthApiService {
  /**
   * 用户登录
   * @param request 登录请求参数
   * @returns 登录响应，包含用户DID和访问令牌
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    return apiService.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      request
    )
  }

  /**
   * 管理员用户注册
   * @param request 注册请求参数
   * @returns JWT令牌字符串
   */
  async register(request: RegisterRequest): Promise<string> {
    return apiService.post<string>(
      API_ENDPOINTS.AUTH.REGISTER,
      request,
      {
        requiresAuth: true,
        requiresAgentToken: true,
      }
    )
  }

  /**
   * 设置认证令牌
   * @param token Bearer令牌
   */
  setBearerToken(token: string): void {
    apiService.setBearerToken(token)
  }

  /**
   * 设置代理令牌
   * @param token 代理令牌
   */
  setAgentToken(token: string): void {
    apiService.setAgentToken(token)
  }
}

// 导出单例实例
export const authApi = new AuthApiService() 