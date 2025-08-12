import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { setLanguageAtom } from '../store/i18nStore'
import type { Language } from '../i18n/config'

export function useLocaleFromUrl() {
  const { lang } = useParams()
  const setLanguage = useSetAtom(setLanguageAtom)

  useEffect(() => {
    if (lang) setLanguage(lang as Language)
  }, [lang, setLanguage])
}
