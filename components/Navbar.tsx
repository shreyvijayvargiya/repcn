'use client'

import { Github, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

export const REPO_URL = 'https://github.com/shreyvijayvargiya/repcn'

export default function Navbar() {
  const { theme, toggleTheme, mounted } = useTheme()

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 dark:border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <a href="/" className="font-display text-xl tracking-tight text-ink">
          RepCN
        </a>

        <div className="flex items-center gap-1">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-2.5 py-2 text-sm text-muted transition hover:text-ink"
            aria-label="Open source on GitHub"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">Open source</span>
          </a>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center text-muted transition hover:text-ink"
            aria-label="Toggle color theme"
          >
            {/* Keep SSR and first client paint identical until mounted */}
            <span className="relative h-4 w-4" suppressHydrationWarning>
              {mounted ? (
                theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )
              ) : (
                <span className="block h-4 w-4" aria-hidden />
              )}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
