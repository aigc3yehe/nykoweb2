import React, { useEffect, useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useSearchParams } from 'react-router-dom'
import { selectedPaymentMethodAtom, showPaymentDropdownAtom, pricingAtom } from '../store/pricingStore'
import { useI18n } from '../hooks/useI18n'
import { paymentService } from '../services/paymentService'
import { showToastAtom } from '../store/imagesStore'
import DownIcon from '../assets/mavae/pay_down.svg'
import DownIconDark from '../assets/mavae/dark/pay_down.svg'
import StripeIcon from '../assets/web2/stripe.svg'
import HelIcon from '../assets/web2/hel.svg'
import OkIcon from '../assets/mavae/ok.svg'
import OkIconDark from '../assets/mavae/dark/ok.svg'
import NoIcon from '../assets/mavae/no.svg'
import NoIconDark from '../assets/mavae/dark/no.svg'
import FreeVipIcon from '../assets/mavae/vip/free.svg'
import FreeVipIconDark from '../assets/mavae/dark/vip/free.svg'
import PlusVipIcon from '../assets/mavae/vip/plus.svg'
import PlusVipIconDark from '../assets/mavae/dark/vip/plus.svg'
import ProVipIcon from '../assets/mavae/vip/pro.svg'
import ProVipIconDark from '../assets/mavae/dark/vip/pro.svg'
import { fetchUserDetailsAtom } from '../store/loginStore'
import Seo from '../components/Seo'
import { useLocaleFromUrl } from '../hooks/useLocaleFromUrl'
import ThemeAdaptiveIcon from '../components/ui/ThemeAdaptiveIcon'

const Pricing: React.FC = React.memo(() => {
  const { t } = useI18n()
  useLocaleFromUrl()
  const [searchParams] = useSearchParams()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useAtom(selectedPaymentMethodAtom)
  const [showPaymentDropdown, setShowPaymentDropdown] = useAtom(showPaymentDropdownAtom)
  const [pricingState] = useAtom(pricingAtom)
  const showToast = useSetAtom(showToastAtom)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const fetchUserDetails = useSetAtom(fetchUserDetailsAtom)

  // 支付方式选项
  const paymentMethods = [
    { id: 'stripe' as const, name: 'Stripe', icon: StripeIcon },
    { id: 'hel' as const, name: 'Hel', icon: HelIcon }
  ]

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // 获取 VIP 图标
  const getVipIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return { light: FreeVipIcon, dark: FreeVipIconDark }
      case 'premium':
        return { light: PlusVipIcon, dark: PlusVipIconDark }
      case 'premium_plus':
        return { light: ProVipIcon, dark: ProVipIconDark }
      default:
        return { light: FreeVipIcon, dark: FreeVipIconDark }
    }
  }

  // 获取套餐样式类
  const getPlanStyle = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'md:w-[22.5rem] h-[33.0625rem] md:max-w-[22.5rem] border border-line-subtle dark:border-line-subtle-dark bg-pop-ups dark:bg-pop-ups-dark backdrop-blur-[20px]'
      case 'premium':
        return 'md:w-[22.5rem] h-[33.0625rem] md:max-w-[22.5rem] border border-line-strong dark:border-line-strong-dark bg-pop-ups dark:bg-pop-ups-dark backdrop-blur-[20px]'
      case 'premium_plus':
        return 'md:w-[22.5rem] h-[33.0625rem] md:max-w-[22.5rem] border border-line-strong dark:border-line-strong-dark bg-pop-ups dark:bg-pop-ups-dark backdrop-blur-[20px]'
      default:
        return 'md:w-[22.5rem] h-[33.0625rem] md:max-w-[22.5rem] border border-line-subtle dark:border-line-subtle-dark bg-pop-ups dark:bg-pop-ups-dark backdrop-blur-[20px]'
    }
  }



  return (
    <div className="w-full flex flex-col md:gap-10 bg-secondary dark:bg-secondary-dark md:bg-transparent md:p-8">
      <Seo title={t('pricing.title') + ' - MAVAE'} description={t('pricing.subtitle')} image="/og-image.png" />
      {/* 标题区域 */}
      <div className="relative w-full flex flex-col gap-4 p-4 md:gap-2 md:p-0">
        {/* 主标题 */}
        <h1 className="font-switzer font-bold text-[2.25rem] leading-[100%] text-left md:text-center text-text-main dark:text-text-main-dark capitalize">
          {t('pricing.title')} {/* en: Plans & pricing / zh: 套餐与定价 */}
        </h1>

        {/* 副标题 */}
        <p className="font-switzer font-normal text-base leading-[100%] text-left md:text-center text-text-secondary dark:text-text-secondary-dark capitalize">
          {t('pricing.subtitle')} {/* en: Upgrade to gain access to Premium features / zh: 升级以获得高级功能 */}
        </p>

        {/* 支付方式选择器 - 移动端显示在副标题下面，PC端绝对定位到右下角 */}
        <div className="flex justify-start md:absolute md:bottom-0 md:right-0 md:justify-start">
          <div className="relative">
            <button
              onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
              className="min-w-[7.0625rem] h-10 flex items-center justify-center gap-1.5 pt-2 pr-3.5 pb-2 pl-3.5 rounded-md bg-quaternary dark:bg-quaternary-dark hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <img
                src={paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon}
                alt={selectedPaymentMethod}
                className="w-4 h-4"
              />
              <span className="font-lexend font-normal text-sm leading-[100%] text-link-default dark:text-link-default-dark">
                {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
              </span>
              <ThemeAdaptiveIcon
                lightIcon={DownIcon}
                darkIcon={DownIconDark}
                alt="Down"
                className="w-4 h-4"
              />
            </button>

            {/* 下拉菜单 */}
            {showPaymentDropdown && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 md:left-auto md:right-0 md:transform-none mt-1.5 w-[110px] bg-white dark:bg-gray-800 border border-[#3741514D] dark:border-gray-600 rounded-md p-2 shadow-lg z-10">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                    className={`w-full h-8 flex items-center gap-1.5 px-4 py-2 rounded-md transition-colors ${selectedPaymentMethod === method.id
                      ? 'bg-[#EEF2FF] dark:bg-blue-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    <img src={method.icon} alt={method.name} className="w-4 h-4" />
                    <span className="font-lexend font-normal text-sm leading-[100%] text-link-default dark:text-link-default-dark">
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
      <div className="w-full flex flex-col md:flex-row gap-8 md:gap-6 justify-center px-4 md:px-0">
        {/* 移动端倒序显示：Pro, Plus, Free；PC端正常顺序：Free, Plus, Pro */}
        {(isMobile ? [...pricingState.plans].reverse() : pricingState.plans).map((plan) => (
          <div
            key={plan.id}
            className={`${getPlanStyle(plan.id)} w-full md:w-auto rounded-xl p-[1.875rem] flex flex-col transition-all hover:shadow-lg gap-6`}
          >
            {/* 套餐名称 - 使用 VIP 图标 */}
            <div className="flex flex-col gap-2.5">
              <ThemeAdaptiveIcon
                lightIcon={getVipIcon(plan.id).light}
                darkIcon={getVipIcon(plan.id).dark}
                alt={plan.name}
                className="w-[4.5rem] h-8"
              />
              {/* 套餐价格 */}
              <div className="flex items-end gap-1">
                <div className="font-switzer font-black text-[2.5rem] leading-[100%] text-text-main dark:text-text-main-dark capitalize">
                  {plan.price}
                </div>
                <div className="font-switzer font-normal text-xs leading-[100%] text-text-secondary dark:text-text-secondary-dark capitalize mb-1">
                  /Month
                </div>
              </div>
              {/* 套餐描述 */}
              <p className="font-switzer font-normal text-sm leading-[100%] text-text-secondary dark:text-text-secondary-dark capitalize">
                {plan.description}
              </p>
            </div>

            {/* 功能列表和按钮区域 */}
            <div className="flex flex-col gap-4">
              {/* 功能列表 */}
              <div className="flex flex-col gap-4">
                {plan.features.map((feature, featureIndex) => (
                  <React.Fragment key={featureIndex}>
                    <div className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5">
                        <ThemeAdaptiveIcon
                          lightIcon={feature.supported ? OkIcon : NoIcon}
                          darkIcon={feature.supported ? OkIconDark : NoIconDark}
                          alt={feature.supported ? "Supported" : "Not supported"}
                          className="w-5 h-5"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="font-switzer font-normal text-sm leading-[100%] text-text-secondary dark:text-text-secondary-dark capitalize">
                          {feature.title}
                        </div>
                        {feature.subtitle && (
                          <div className="font-switzer font-normal text-sm leading-[100%] text-text-tips dark:text-text-tips-dark capitalize">
                            {feature.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* 分割线 - 除了最后一个feature */}
                    {featureIndex < plan.features.length - 1 && (
                      <div className="w-[18.75rem] h-0 border border-line-subtle dark:border-line-subtle-dark"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* 按钮 */}
              {plan.buttonText && (
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isProcessing || plan.id === 'free'}
                  className={`w-full h-12 px-4 gap-1 rounded-full font-switzer font-medium text-base leading-6 text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${plan.id === 'premium'
                    ? 'bg-link-default dark:bg-link-default-dark hover:bg-link-pressed dark:hover:bg-link-pressed-dark text-white'
                    : plan.id === 'premium_plus'
                      ? 'bg-[#FFEDB6] hover:bg-[#FFE5A3] text-black'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-text-main dark:text-text-main-dark'
                    }`}
                >
                  {isProcessing ? 'Processing...' : plan.buttonText}
                </button>
              )}
            </div>

            {/* 提示信息 - 在最底部 */}
            {plan.tips && (
              <p className="font-switzer font-normal text-xs leading-[100%] text-text-tips dark:text-text-tips-dark text-center mt-auto">
                {plan.tips}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
})

Pricing.displayName = 'Pricing'

export default Pricing