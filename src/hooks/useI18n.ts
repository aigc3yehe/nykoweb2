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
  
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = (messages as any)[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }
  
  return { t, language }
}