import React, { useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAtom, useSetAtom } from 'jotai'
import { languageAtom, setLanguageAtom } from '../../store/i18nStore'
import { SUPPORTED_LANGUAGES, Language } from '../../i18n/config'

const languages = SUPPORTED_LANGUAGES

const LanguageSelector: React.FC = React.memo(() => {
  const [language] = useAtom(languageAtom)
  const setLanguage = useSetAtom(setLanguageAtom)
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

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
        className="flex items-center justify-center h-8 px-2 rounded-md border border-border bg-background hover:bg-accent dark:bg-background dark:hover:bg-accent transition-colors gap-1"
      >
        <span className="text-xs">{currentLanguage.shortName || currentLanguage.name}</span>
        <svg className="h-3 w-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background dark:bg-background border border-border rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className="w-full px-4 py-2 text-left hover:bg-accent dark:hover:bg-accent transition-colors flex items-center space-x-3 first:rounded-t-lg last:rounded-b-lg text-foreground"
            >
              <span className="text-sm">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

LanguageSelector.displayName = 'LanguageSelector'

export default LanguageSelector