import React, { useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import GlobeIcon from '../../assets/mavae/globe.svg'
import GlobeIconDark from '../../assets/mavae/dark/globe.svg'
import ThemeAdaptiveIcon from './ThemeAdaptiveIcon'
import { setLanguageAtom } from '../../store/i18nStore'
import { SUPPORTED_LANGUAGES, Language } from '../../i18n/config'

const languages = SUPPORTED_LANGUAGES

const LanguageSelector: React.FC = React.memo(() => {
  //const [language] = useAtom(languageAtom)
  const setLanguage = useSetAtom(setLanguageAtom)
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  //const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])

  const handleLanguageSelect = useCallback((langCode: Language) => {
    // 1) 更新全局语言状态
    setLanguage(langCode)
    setIsOpen(false)
    // 2) 将当前路径替换为新语言前缀
    //    /en/xxx -> /zh-CN/xxx
    const newPath = location.pathname.replace(/^\/(en|zh-CN|zh-HK)(\/|$)/, `/${langCode}$2`)
    // 如果当前路径没有语言前缀（理论上不该发生），则在前面加上
    const finalPath = newPath.startsWith('/') ? newPath : `/${langCode}${location.pathname}`
    navigate(finalPath + location.search, { replace: true })
  }, [setLanguage, navigate, location.pathname, location.search])

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-secondary dark:hover:bg-secondary-dark transition-colors"
        aria-label="Language"
      >
        <ThemeAdaptiveIcon
          lightIcon={GlobeIcon}
          darkIcon={GlobeIconDark}
          alt="Language"
          size="md"
          className="w-6 h-6"
        />
      </button>

      {isOpen && (
        <>
          {/* 点击其他地方关闭菜单 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 py-2 bg-pop-ups dark:bg-pop-ups rounded-xl z-50" style={{width: '200px', boxShadow: '0px 8px 16px 0px #12121A1A, 0px 4px 8px 0px #12121A33'}}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className="h-12 px-4 text-left hover:bg-switch-hover dark:hover:bg-switch-hover transition-colors flex items-center gap-2 text-text-main dark:text-text-main-dark font-switzer font-medium text-base leading-6"
                style={{width: '200px'}}
              >
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
})

LanguageSelector.displayName = 'LanguageSelector'

export default LanguageSelector