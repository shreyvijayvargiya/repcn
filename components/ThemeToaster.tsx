'use client'

import { Toaster } from 'sonner'
import { useTheme } from '@/components/ThemeProvider'

export default function ThemeToaster() {
  const { theme, mounted } = useTheme()
  // Avoid theme-dependent Sonner markup until after hydration
  return (
    <Toaster
      richColors
      position="top-right"
      theme={mounted ? theme : 'light'}
    />
  )
}
