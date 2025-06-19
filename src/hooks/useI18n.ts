import { useAtom } from 'jotai'
import { languageAtom } from '../store/i18nStore'
import { en } from '../locales/en'
import { zh } from '../locales/zh'

const messages = {
  en,
  zh,
  ja: en, // 暂时使用英文
  ko: en  // 暂时使用英文
}

export const useI18n = () => {
  const [language] = useAtom(languageAtom)
  
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = messages[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }
  
  return { t, language }
}