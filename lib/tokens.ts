import { cookies } from 'next/headers'

export const GITHUB_TOKEN_COOKIE = 'repcn_github_token'
export const VERCEL_TOKEN_COOKIE = 'repcn_vercel_token'
export const VERCEL_TEAM_COOKIE = 'repcn_vercel_team_id'

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
}

export async function getGitHubToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(GITHUB_TOKEN_COOKIE)?.value || process.env.GITHUB_TOKEN || null
}

export async function getVercelToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(VERCEL_TOKEN_COOKIE)?.value || process.env.VERCEL_TOKEN || null
}

export async function getVercelTeamId(): Promise<string | undefined> {
  const store = await cookies()
  return (
    store.get(VERCEL_TEAM_COOKIE)?.value ||
    process.env.VERCEL_TEAM_ID ||
    undefined
  )
}

export async function setGitHubToken(token: string) {
  const store = await cookies()
  store.set(GITHUB_TOKEN_COOKIE, token, COOKIE_OPTIONS)
}

export async function setVercelCredentials(token: string, teamId?: string) {
  const store = await cookies()
  store.set(VERCEL_TOKEN_COOKIE, token, COOKIE_OPTIONS)
  if (teamId) {
    store.set(VERCEL_TEAM_COOKIE, teamId, COOKIE_OPTIONS)
  } else {
    store.delete(VERCEL_TEAM_COOKIE)
  }
}

export async function clearGitHubToken() {
  const store = await cookies()
  store.delete(GITHUB_TOKEN_COOKIE)
}

export async function clearVercelCredentials() {
  const store = await cookies()
  store.delete(VERCEL_TOKEN_COOKIE)
  store.delete(VERCEL_TEAM_COOKIE)
}

export function maskToken(token: string | null): string | null {
  if (!token) return null
  if (token.length <= 8) return '••••'
  return `${token.slice(0, 4)}••••${token.slice(-4)}`
}
