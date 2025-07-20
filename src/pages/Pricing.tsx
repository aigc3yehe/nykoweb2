import React from 'react'
import { useAtom } from 'jotai'
import { selectedPaymentMethodAtom, showPaymentDropdownAtom, pricingAtom } from '../store/pricingStore'
import { useI18n } from '../hooks/useI18n'
import DownIcon from '../assets/web2/pricing_down.svg'
import StripeIcon from '../assets/web2/stripe.svg'
import HelIcon from '../assets/web2/hel.svg'

const Pricing: React.FC = React.memo(() => {
  const { t } = useI18n()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useAtom(selectedPaymentMethodAtom)
  const [showPaymentDropdown, setShowPaymentDropdown] = useAtom(showPaymentDropdownAtom)
  const [pricingState] = useAtom(pricingAtom)

  // 支付方式选项
  const paymentMethods = [
    { id: 'stripe' as const, name: 'Stripe', icon: StripeIcon },
    { id: 'hel' as const, name: 'Hel', icon: HelIcon }
  ]

  const handlePaymentMethodSelect = (method: typeof selectedPaymentMethod) => {
    setSelectedPaymentMethod(method)
    setShowPaymentDropdown(false)
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[1100px] flex flex-col gap-10">
        {/* 标题区域 */}
        <div className="relative w-full h-16 flex flex-col gap-2">
          {/* 主标题 */}
          <h1 className="font-lexend font-bold text-4xl leading-[100%] text-center text-[#1F2937] dark:text-white capitalize">
            {t('pricing.title')} {/* en: Plans & pricing / zh: 套餐与定价 */}
          </h1>
          
          {/* 副标题 */}
          <p className="font-lexend font-normal text-base leading-[100%] text-center text-[#6B7280] dark:text-gray-400 capitalize">
            {t('pricing.subtitle')} {/* en: Upgrade to gain access to Premium features / zh: 升级以获得高级功能 */}
          </p>
          
          {/* 支付方式选择器 - 绝对定位到右下角 */}
          <div className="absolute bottom-0 right-0">
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
                <div className="absolute top-full right-0 mt-1.5 w-[110px] bg-white dark:bg-gray-800 border border-[#3741514D] dark:border-gray-600 rounded-md p-2 shadow-lg z-10">
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
        <div className="w-full h-[529px] flex gap-10">
          {pricingState.plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`flex-1 rounded border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-lg ${
                index === 0 ? 'bg-red-50 dark:bg-red-900/10' :
                index === 1 ? 'bg-blue-50 dark:bg-blue-900/10' :
                'bg-green-50 dark:bg-green-900/10'
              }`}
            >
              {/* 套餐名称 */}
              <h3 className="font-lexend font-bold text-2xl text-[#1F2937] dark:text-white mb-2">
                {plan.name}
              </h3>
              
              {/* 套餐价格 */}
              <div className="font-lexend font-bold text-3xl text-[#1F2937] dark:text-white mb-2">
                {plan.price}
              </div>
              
              {/* 套餐描述 */}
              <p className="font-lexend font-normal text-base text-[#6B7280] dark:text-gray-400 mb-6">
                {plan.description}
              </p>
              
              {/* 功能列表 */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                      feature.supported ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      {feature.supported && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
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
              
              {/* 按钮 */}
              {plan.buttonText && (
                <button className={`w-full h-12 rounded-md font-lexend font-medium text-sm transition-colors ${
                  index === 1 ? 'bg-[#0900FF] hover:bg-[#0800E6] text-white' :
                  'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-[#1F2937] dark:text-white'
                }`}>
                  {plan.buttonText}
                </button>
              )}
              
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