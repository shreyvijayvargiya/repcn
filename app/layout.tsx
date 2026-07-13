import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Navbar from '@/components/Navbar'
import { ThemeProvider, type Theme } from '@/components/ThemeProvider'
import ThemeToaster from '@/components/ThemeToaster'
import './globals.css'

export const metadata: Metadata = {
  title: 'RepCN',
  description:
    'Open-source tool to paste a React component, generate a repo, push to GitHub, and deploy to Vercel.',
}

const themeInitScript = `
(function() {
  try {
    var key = 'repcn-theme';
    var stored = localStorage.getItem(key);
    var cookieMatch = document.cookie.match(/(?:^|; )repcn-theme=([^;]*)/);
    var fromCookie = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (fromCookie === 'light' || fromCookie === 'dark'
        ? fromCookie
        : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    var root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const store = await cookies()
  const cookieTheme = store.get('repcn-theme')?.value
  const initialTheme: Theme =
    cookieTheme === 'dark' || cookieTheme === 'light' ? cookieTheme : 'light'

  return (
    <html
      lang="en"
      className={initialTheme === 'dark' ? 'dark' : undefined}
      style={{ colorScheme: initialTheme }}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider initialTheme={initialTheme}>
          <Navbar />
          {children}
          <ThemeToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
