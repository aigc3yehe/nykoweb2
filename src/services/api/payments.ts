import { apiService } from './base'
import { API_ENDPOINTS } from './config'
import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponseDto,
  VerifyCheckoutSessionResponseDto,
  PaymentInfoResponseDto,
  CancelSubscriptionResponseDto
} from './types'

/**
 * 支付系统API服务
 */
export class PaymentsApiService {
  /**
   * 创建支付会话
   * @param request 支付会话请求参数
   * @returns 支付会话响应
   */
  async createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponseDto> {
    return apiService.post<CreateCheckoutSessionResponseDto>(
      API_ENDPOINTS.PAYMENTS.CREATE_SESSION,
      request,
      { requiresAuth: true }
    )
  }

  /**
   * 验证支付会话
   * @param sessionId 支付会话ID
   * @returns 验证响应
   */
  async verifyCheckoutSession(sessionId: string): Promise<VerifyCheckoutSessionResponseDto> {
    return apiService.get<VerifyCheckoutSessionResponseDto>(
      API_ENDPOINTS.PAYMENTS.VERIFY_SESSION(sessionId),
      undefined,
      { requiresAuth: true }
    )
  }

  /**
   * 获取支付信息
   * @param userId 用户DID
   * @returns 支付信息响应
   */
  async getPaymentInfo(userId: string): Promise<PaymentInfoResponseDto> {
    return apiService.get<PaymentInfoResponseDto>(
      API_ENDPOINTS.PAYMENTS.GET_INFO(userId),
      undefined,
      { requiresAuth: true }
    )
  }

  /**
   * 取消订阅
   * @param userId 用户DID
   * @returns 取消订阅响应
   */
  async cancelSubscription(userId: string): Promise<CancelSubscriptionResponseDto> {
    return apiService.delete<CancelSubscriptionResponseDto>(
      API_ENDPOINTS.PAYMENTS.CANCEL(userId),
      { requiresAuth: true }
    )
  }
}

// 导出单例实例
export const paymentsApi = new PaymentsApiService() 