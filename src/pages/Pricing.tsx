import React, { useEffect, useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useSearchParams } from 'react-router-dom'
import { selectedPaymentMethodAtom, showPaymentDropdownAtom, pricingAtom } from '../store/pricingStore'
import { useI18n } from '../hooks/useI18n'
import { paymentService } from '../services/paymentService'
import { showToastAtom } from '../store/imagesStore'
import DownIcon from '../assets/web2/pricing_down.svg'
import StripeIcon from '../assets/web2/stripe.svg'
import HelIcon from '../assets/web2/hel.svg'
import OkIcon from '../assets/web2/ok.svg'
import NoIcon from '../assets/web2/no.svg'
import { fetchUserDetailsAtom } from '../store/loginStore'

const Pricing: React.FC = React.memo(() => {
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useAtom(selectedPaymentMethodAtom)
  const [showPaymentDropdown, setShowPaymentDropdown] = useAtom(showPaymentDropdownAtom)
  const [pricingState] = useAtom(pricingAtom)
  const showToast = useSetAtom(showToastAtom)
  const [isProcessing, setIsProcessing] = useState(false)
  const fetchUserDetails = useSetAtom(fetchUserDetailsAtom)

  // 支付方式选项
  const paymentMethods = [
    { id: 'stripe' as const, name: 'Stripe', icon: StripeIcon },
    { id: 'hel' as const, name: 'Hel', icon: HelIcon }
  ]

  // 处理URL参数
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const sessionId = searchParams.get('session_id')
    const provider = searchParams.get('provider') as 'stripe' | 'hel' || 'stripe'

    if (success === 'true' && sessionId) {
      // 支付成功，验证会话
      handlePaymentSuccess(sessionId, provider)
    } else if (canceled === 'true') {
      // 支付取消
      showToast({
        severity: 'info',
        message: 'Payment canceled'
      })
    }
  }, [searchParams])

  // 处理支付成功
  const handlePaymentSuccess = async (sessionId: string, provider: 'stripe' | 'hel' = 'stripe') => {
    try {
      setIsProcessing(true)
      const result = await paymentService.handlePaymentSuccess(sessionId, provider)
      console.log('Payment successful:', result)
      showToast({
        severity: 'success',
        message: 'Payment successful'
      })
      // 支付成功后刷新用户信息
      fetchUserDetails()
    } catch (error) {
      showToast({
        severity: 'error',
        message: 'Payment verification failed, please contact customer service'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // 处理套餐订阅
  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      showToast({
        severity: 'info',
        message: 'Free plan does not require subscription'
      })
      return
    }

    try {
      setIsProcessing(true)
      // 根据选择的支付方式调用相应的支付渠道
      await paymentService.redirectToPayment(planId, selectedPaymentMethod)
    } catch (error) {
      showToast({
        severity: 'error',
        message: 'Failed to create payment session, please try again later'
      })
      setIsProcessing(false)
    }
  }

  const handlePaymentMethodSelect = (method: typeof selectedPaymentMethod) => {
    setSelectedPaymentMethod(method)
    setShowPaymentDropdown(false)
  }

  // 获取套餐样式类
  const getPlanStyle = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'w-full md:w-[21.25rem] h-[33.125rem] border border-design-line-light-gray bg-white dark:bg-gray-800'
      case 'premium':
        return 'w-full md:w-[21.25rem] h-[33.125rem] border border-design-main-blue bg-premium-gradient'
      case 'premium_plus':
        return 'w-full md:w-[21.25rem] h-[33.125rem] border border-[#00D13B] bg-premium-plus-gradient'
      default:
        return 'w-full md:w-[21.25rem] h-[33.125rem] border border-design-line-light-gray bg-white dark:bg-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[1100px] flex flex-col gap-10">
        {/* 标题区域 */}
        <div className="relative w-full flex flex-col gap-2">
          {/* 主标题 */}
          <h1 className="font-lexend font-bold text-4xl leading-[100%] text-center text-[#1F2937] dark:text-white capitalize">
            {t('pricing.title')} {/* en: Plans & pricing / zh: 套餐与定价 */}
          </h1>
          
          {/* 副标题 */}
          <p className="font-lexend font-normal text-base leading-[100%] text-center text-[#6B7280] dark:text-gray-400 capitalize">
            {t('pricing.subtitle')} {/* en: Upgrade to gain access to Premium features / zh: 升级以获得高级功能 */}
          </p>
          
          {/* 支付方式选择器 - 移动端显示在副标题下面，PC端绝对定位到右下角 */}
          <div className="flex justify-center md:absolute md:bottom-0 md:right-0 md:justify-start">
            <div className="relative">
              <button
                onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                className="w-[113px] h-8 flex items-center justify-center gap-1.5 px-3.5 py-2 border border-[#E5E7EB] dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <img 
                  src={paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon} 
                  alt={selectedPaymentMethod} 
                  className="w-4 h-4" 
                />
                <span className="font-lexend font-normal text-sm leading-[100%] text-[#4B5563] dark:text-gray-300">
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                </span>
                <img src={DownIcon} alt="Down" className="w-4 h-4" />
              </button>
              
              {/* 下拉菜单 */}
              {showPaymentDropdown && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 md:left-auto md:right-0 md:transform-none mt-1.5 w-[110px] bg-white dark:bg-gray-800 border border-[#3741514D] dark:border-gray-600 rounded-md p-2 shadow-lg z-10">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                      className={`w-full h-8 flex items-center gap-1.5 px-4 py-2 rounded-md transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'bg-[#EEF2FF] dark:bg-blue-900/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <img src={method.icon} alt={method.name} className="w-4 h-4" />
                      <span className="font-lexend font-normal text-sm leading-[100%] text-[#4B5563] dark:text-gray-300">
                        {method.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 套餐列表 */}
        <div className="w-full flex flex-col md:flex-row gap-6 justify-center">
          {pricingState.plans.map((plan) => (
            <div
              key={plan.id}
              className={`${getPlanStyle(plan.id)} rounded-lg p-7.5 flex flex-col transition-all hover:shadow-lg`}
            >
              {/* 套餐名称 */}
              <h3 className="font-lexend font-bold text-2xl text-[#1F2937] dark:text-white mb-2">
                {plan.name}
              </h3>
              
              {/* 套餐价格 */}
              <div className="flex items-end gap-1 mb-2">
                <div className="font-lexend font-medium text-[2.25rem] leading-[100%] text-[#1F2937] dark:text-white capitalize">
                  {plan.price}
                </div>
                <div className="font-lexend font-normal text-xs leading-[100%] text-[#6B7280] dark:text-gray-400 capitalize mb-1">
                  /Month
                </div>
              </div>
              
              {/* 套餐描述 */}
              <p className="font-lexend font-normal text-base text-[#6B7280] dark:text-gray-400 mb-6">
                {plan.description}
              </p>
              
              {/* 按钮 - 移到features上面 */}
              {plan.buttonText && (
                <button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isProcessing || plan.id === 'free'}
                  className={`w-full h-12 rounded-md font-lexend font-medium text-sm transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.id === 'premium' ? 'bg-design-main-blue hover:bg-[#0800E6] text-white' :
                    plan.id === 'premium_plus' ? 'bg-design-light-green hover:bg-[#00E041] text-black' :
                    'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-[#1F2937] dark:text-white'
                  }`}
                >
                  {isProcessing ? 'Processing...' : plan.buttonText}
                </button>
              )}
              
              {/* 功能列表 */}
              <div className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5">
                      <img 
                        src={feature.supported ? OkIcon : NoIcon} 
                        alt={feature.supported ? "Supported" : "Not supported"} 
                        className="w-5 h-5" 
                      />
                    </div>
                    <div>
                      <div className="font-lexend font-medium text-sm text-[#1F2937] dark:text-white">
                        {feature.title}
                      </div>
                      {feature.subtitle && (
                        <div className="font-lexend font-normal text-xs text-[#6B7280] dark:text-gray-400">
                          {feature.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 提示信息 */}
              {plan.tips && (
                <p className="font-lexend font-normal text-xs text-[#6B7280] dark:text-gray-400 mt-3 text-center">
                  {plan.tips}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

Pricing.displayName = 'Pricing'

export default Pricing