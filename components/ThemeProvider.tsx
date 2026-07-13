'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: Theme
  mounted: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export const THEME_STORAGE_KEY = 'repcn-theme'
export const THEME_COOKIE = 'repcn-theme'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

function persistTheme(theme: Theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
  document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=31536000;samesite=lax`
}

export function ThemeProvider({
  children,
  initialTheme = 'light',
}: {
  children: ReactNode
  initialTheme?: Theme
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    const fromDom = document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light'
    const preferred =
      stored === 'light' || stored === 'dark'
        ? stored
        : fromDom

    setThemeState(preferred)
    applyTheme(preferred)
    persistTheme(preferred)
    setMounted(true)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    applyTheme(next)
    persistTheme(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [setTheme, theme])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: theme,
        mounted,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
