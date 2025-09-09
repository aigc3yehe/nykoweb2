import React from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useNavigate, useLocation } from 'react-router-dom'
import { languageAtom, setLanguageAtom } from '../../store/i18nStore'
import { SUPPORTED_LANGUAGES, Language } from '../../i18n/config'
import { closeSidebarAtom } from '../../store/sidebarStore'
import CloseIcon from '../../assets/mavae/close.svg'
import CloseIconDark from '../../assets/mavae/dark/close.svg'
import CheckIcon from '../../assets/mavae/check.svg'
import CheckIconDark from '../../assets/mavae/dark/check.svg'
import ThemeAdaptiveIcon from './ThemeAdaptiveIcon'

interface MobileLanguageSelectorProps {
  isOpen: boolean
  onClose: () => void
}

const MobileLanguageSelector: React.FC<MobileLanguageSelectorProps> = ({
  isOpen,
  onClose
}) => {
  const [currentLanguage] = useAtom(languageAtom)
  const setLanguage = useSetAtom(setLanguageAtom)
  const closeSidebar = useSetAtom(closeSidebarAtom)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLanguageSelect = (langCode: Language) => {
    // 1) 更新全局语言状态
    setLanguage(langCode)
    // 2) 将当前路径替换为新语言前缀
    //    /en/xxx -> /zh-CN/xxx
    const newPath = location.pathname.replace(/^\/(en|zh-CN|zh-HK)(\/|$)/, `/${langCode}$2`)
    // 如果当前路径没有语言前缀（理论上不该发生），则在前面加上
    const finalPath = newPath.startsWith('/') ? newPath : `/${langCode}${location.pathname}`
    navigate(finalPath + location.search, { replace: true })

    onClose()
    closeSidebar() // 关闭侧边栏
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 backdrop-blur-xl md:hidden">
      <div className="flex flex-col w-full h-full bg-secondary dark:bg-secondary-dark">
        {/* 头部关闭按钮区域 */}
        <div className="w-full h-14 flex items-center justify-between px-2.5 pr-4 border-b border-line-subtle dark:border-line-subtle-dark bg-secondary dark:bg-secondary-dark">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-tertiary dark:hover:bg-tertiary-dark rounded-lg transition-colors"
            aria-label="Close language selector"
          >
            <ThemeAdaptiveIcon
              lightIcon={CloseIcon}
              darkIcon={CloseIconDark}
              alt="Close"
              size="lg"
            />
          </button>
          <div className="flex-1" /> {/* 占位，保持关闭按钮在左侧 */}
        </div>

        {/* 内容区域 */}
        <div className="flex-1 w-full pt-6">
          <div className="space-y-0">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLanguage === lang.code
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className="w-full h-12 flex items-center justify-between px-4 transition-colors hover:bg-tertiary dark:hover:bg-tertiary-dark"
                >
                  {/* 左侧语言名称 */}
                  <span className="font-switzer font-medium text-base leading-6 text-text-main dark:text-text-main-dark">
                    {lang.name}
                  </span>

                  {/* 右侧选中图标 */}
                  {isSelected && (
                    <ThemeAdaptiveIcon
                      lightIcon={CheckIcon}
                      darkIcon={CheckIconDark}
                      alt="Selected"
                      size="md"
                      className="w-5 h-5"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileLanguageSelector
