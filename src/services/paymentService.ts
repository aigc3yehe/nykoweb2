import { api } from './api'
import type { CreateCheckoutSessionRequest, PaymentMode } from './api/types'

/**
 * 支付服务
 */
export class PaymentService {
  /**
   * 创建Stripe支付会话
   * @param planId 套餐ID
   * @param mode 支付模式
   * @returns 支付会话URL
   */
  async createStripePaymentSession(planId: string, mode: PaymentMode = 'subscription', lang: string = 'en'): Promise<string> {
    try {
      const request: CreateCheckoutSessionRequest = {
        plan: planId,
        mode: mode,
        //success_url: 'https://www.mavae.ai/pricing?success=true&provider=stripe&session_id={CHECKOUT_SESSION_ID}',
        //cancel_url: 'https://www.mavae.ai/pricing?canceled=true&provider=stripe'
        success_url: `${window.location.origin}/${lang}/pricing?success=true&provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/${lang}/pricing?canceled=true&provider=stripe`
      }

      const response = await api.payments.createStripeCheckoutSession(request)
      return response.url
    } catch (error) {
      console.error('Failed to create Stripe payment session:', error)
      throw new Error('Failed to create Stripe payment session')
    }
  }

  /**
   * 验证Stripe支付会话
   * @param sessionId 会话ID
   * @returns 验证结果
   */
  async verifyStripePaymentSession(sessionId: string) {
    try {
      const response = await api.payments.verifyStripeCheckoutSession(sessionId)
      return response
    } catch (error) {
      console.error('Failed to verify Stripe payment session:', error)
      throw new Error('Failed to verify Stripe payment session')
    }
  }

  /**
   * 获取Hel交易信息
   * @param signature 交易签名
   * @returns 交易信息
   */
  async getHelTransaction(signature: string) {
    try {
      const response = await api.payments.getHelTransaction(signature)
      return response
    } catch (error) {
      console.error('Failed to get Hel transaction information:', error)
      throw new Error('Failed to get Hel transaction information')
    }
  }

  /**
   * 处理支付成功
   * @param sessionId 会话ID
   * @param provider 支付提供商
   */
  async handlePaymentSuccess(sessionId: string, provider: 'stripe' | 'hel' = 'stripe') {
    try {
      if (provider === 'stripe') {
        const verification = await this.verifyStripePaymentSession(sessionId)
        if (verification.success) {
          console.log('Stripe payment successful:', verification)
          return verification
        } else {
          throw new Error('Stripe payment verification failed')
        }
      } else if (provider === 'hel') {
        // Hel支付通过webhook处理，这里可以获取交易信息
        const transaction = await this.getHelTransaction(sessionId)
        console.log('Hel payment successful:', transaction)
        return transaction
      } else {
        throw new Error('Unsupported payment provider')
      }
    } catch (error) {
      console.error('Failed to handle payment success:', error)
      throw error
    }
  }

  /**
   * 跳转到支付页面
   * @param planId 套餐ID
   * @param provider 支付提供商
   * @param lang 语言前缀（如 'en', 'zh'）
   */
  async redirectToPayment(planId: string, provider: 'stripe' | 'hel' = 'stripe', lang: string = 'en') {
    try {
      if (provider === 'stripe') {
        const paymentUrl = await this.createStripePaymentSession(planId, 'subscription', lang)
        window.location.href = paymentUrl
      } else if (provider === 'hel') {
        // Helio仅支持premium套餐，直接跳转到测试链接
        if (planId === 'premium') {
          window.location.href = 'https://app.hel.io/pay/6868f3ae1ad680ade010fda7'
        } else {
          throw new Error('Helio payment currently only supports Premium plan')
        }
      } else {
        throw new Error('Unsupported payment provider')
      }
    } catch (error) {
      console.error('Failed to redirect to payment page:', error)
      throw error
    }
  }

  // 兼容旧版本的方法
  /**
   * 创建支付会话（兼容旧版本，默认使用Stripe）
   * @param planId 套餐ID
   * @param mode 支付模式
   * @param lang 语言前缀（如 'en', 'zh'）
   * @returns 支付会话URL
   */
  async createPaymentSession(planId: string, mode: PaymentMode = 'subscription', lang: string = 'en'): Promise<string> {
    return this.createStripePaymentSession(planId, mode, lang)
  }

  /**
   * 验证支付会话（兼容旧版本，默认使用Stripe）
   * @param sessionId 会话ID
   * @returns 验证结果
   */
  async verifyPaymentSession(sessionId: string) {
    return this.verifyStripePaymentSession(sessionId)
  }

  /**
   * 管理订阅 - 跳转到Stripe Portal
   * @param userId 用户DID
   */
  async manageSubscription(userId: string) {
    try {
      const portalResponse = await api.payments.getUserPortal(userId)
      if (portalResponse.url) {
        window.location.href = portalResponse.url
      } else {
        throw new Error('Portal URL not available')
      }
    } catch (error) {
      console.error('Failed to get portal URL:', error)
      throw new Error('Failed to access subscription management portal')
    }
  }
}

// 导出单例实例
export const paymentService = new PaymentService() 