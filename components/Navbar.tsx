'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, ClipboardCopy, Github, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

export const REPO_URL = 'https://github.com/shreyvijayvargiya/repcn'
export const LLM_TXT_URL = '/llm.txt'

export default function Navbar() {
  const { theme, toggleTheme, mounted } = useTheme()
  const [copied, setCopied] = useState(false)

  async function copyLlmPrompt() {
    try {
      const res = await fetch(LLM_TXT_URL)
      if (!res.ok) throw new Error('Could not load llm.txt')
      const text = await res.text()
      await navigator.clipboard.writeText(text.trim())
      setCopied(true)
      toast.success('llm.txt prompt copied')
      window.setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Copy failed')
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/80 backdrop-blur-md">
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
            onClick={() => void copyLlmPrompt()}
            className="inline-flex items-center gap-2 px-2.5 py-2 text-sm text-muted transition hover:text-ink"
            aria-label="Copy llm.txt prompt for AI agents"
            title="Copy llm.txt"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <ClipboardCopy className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {copied ? 'Copied' : 'Copy llm.txt'}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center text-muted transition hover:text-ink"
            aria-label="Toggle color theme"
          >
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
