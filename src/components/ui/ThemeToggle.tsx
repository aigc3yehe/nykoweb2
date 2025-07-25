import React from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { themeAtom, toggleThemeAtom } from '../../store/themeStore'

const ThemeToggle: React.FC = React.memo(() => {
  const [theme] = useAtom(themeAtom)
  const toggleTheme = useSetAtom(toggleThemeAtom)

  return (
    <button
      onClick={() => toggleTheme()}
      className="flex items-center justify-center h-8 w-8 rounded-md border border-border bg-background hover:bg-accent dark:bg-background dark:hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  )
})

ThemeToggle.displayName = 'ThemeToggle'

export default ThemeToggle