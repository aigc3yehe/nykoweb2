import { apiService } from './base'
import { API_ENDPOINTS } from './config'
import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponseDto,
  VerifyCheckoutSessionResponseDto,
  PaymentInfoResponseDto,
  CancelSubscriptionResponseDto,
  TransactionObjectDto,
  GetUserPortalResponseDto
} from './types'

/**
 * 支付系统API服务
 */
export class PaymentsApiService {
  /**
   * 创建Stripe支付会话
   * @param request 支付会话请求参数
   * @returns 支付会话响应
   */
  async createStripeCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponseDto> {
    return apiService.post<CreateCheckoutSessionResponseDto>(
      API_ENDPOINTS.PAYMENTS.STRIPE.CREATE_SESSION,
      request,
      { requiresAuth: true }
    )
  }

  /**
   * 验证Stripe支付会话
   * @param sessionId 支付会话ID
   * @returns 验证响应
   */
  async verifyStripeCheckoutSession(sessionId: string): Promise<VerifyCheckoutSessionResponseDto> {
    return apiService.get<VerifyCheckoutSessionResponseDto>(
      API_ENDPOINTS.PAYMENTS.STRIPE.VERIFY_SESSION(sessionId),
      undefined,
      { requiresAuth: true }
    )
  }

  /**
   * 获取Stripe支付信息
   * @param userId 用户DID
   * @returns 支付信息响应
   */
  async getStripePaymentInfo(userId: string): Promise<PaymentInfoResponseDto> {
    return apiService.get<PaymentInfoResponseDto>(
      API_ENDPOINTS.PAYMENTS.STRIPE.GET_INFO(userId),
      undefined,
      { requiresAuth: true }
    )
  }

  /**
   * 获取用户Portal URL
   * @param userId 用户DID
   * @returns 用户Portal URL响应
   */
  async getUserPortal(userId: string): Promise<GetUserPortalResponseDto> {
    return apiService.get<GetUserPortalResponseDto>(
      API_ENDPOINTS.PAYMENTS.STRIPE.PORTAL(userId),
      undefined,
      { requiresAuth: true }
    )
  }

  /**
   * 取消Stripe订阅
   * @param userId 用户DID
   * @returns 取消订阅响应
   */
  async cancelStripeSubscription(userId: string): Promise<CancelSubscriptionResponseDto> {
    return apiService.delete<CancelSubscriptionResponseDto>(
      API_ENDPOINTS.PAYMENTS.STRIPE.CANCEL(userId),
      { requiresAuth: true }
    )
  }

  /**
   * 获取Hel交易信息
   * @param signature 交易签名
   * @returns 交易信息
   */
  async getHelTransaction(signature: string): Promise<TransactionObjectDto> {
    return apiService.get<TransactionObjectDto>(
      API_ENDPOINTS.PAYMENTS.HEL.GET_TRANSACTION(signature),
      undefined,
      { requiresAuth: true }
    )
  }

  // 兼容旧版本的方法
  /**
   * 创建支付会话（兼容旧版本）
   * @param request 支付会话请求参数
   * @returns 支付会话响应
   */
  async createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponseDto> {
    return this.createStripeCheckoutSession(request)
  }

  /**
   * 验证支付会话（兼容旧版本）
   * @param sessionId 支付会话ID
   * @returns 验证响应
   */
  async verifyCheckoutSession(sessionId: string): Promise<VerifyCheckoutSessionResponseDto> {
    return this.verifyStripeCheckoutSession(sessionId)
  }

  /**
   * 获取支付信息（兼容旧版本）
   * @param userId 用户DID
   * @returns 支付信息响应
   */
  async getPaymentInfo(userId: string): Promise<PaymentInfoResponseDto> {
    return this.getStripePaymentInfo(userId)
  }

  /**
   * 获取用户Portal URL（兼容旧版本）
   * @param userId 用户DID
   * @returns 用户Portal URL响应
   */
  async getPortal(userId: string): Promise<GetUserPortalResponseDto> {
    return this.getUserPortal(userId)
  }

  /**
   * 取消订阅（兼容旧版本）
   * @param userId 用户DID
   * @returns 取消订阅响应
   */
  async cancelSubscription(userId: string): Promise<CancelSubscriptionResponseDto> {
    return this.cancelStripeSubscription(userId)
  }
}

// 导出单例实例
export const paymentsApi = new PaymentsApiService() 