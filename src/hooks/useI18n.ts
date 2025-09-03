import { useAtom } from 'jotai'
import { languageAtom } from '../store/i18nStore'
import { en } from '../locales/en'
import { zhCN } from '../locales/zh-CN'
import { zhHK } from '../locales/zh-HK'

const messages = {
  en,
  'zh-CN': zhCN,
  'zh-HK': zhHK
}

export const useI18n = () => {
  const [language] = useAtom(languageAtom)
  
  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.')
    let value: any = (messages as any)[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    let result = value || key
    
    // 替换参数
    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue)
      })
    }
    
    return result
  }
  
  return { t, language }
}