import { NextResponse } from 'next/server'
import { getGitHubUser } from '@/lib/github'
import { getVercelUser } from '@/lib/vercel'
import {
  clearGitHubToken,
  clearVercelCredentials,
  getGitHubToken,
  getVercelTeamId,
  getVercelToken,
  maskToken,
  setGitHubToken,
  setVercelCredentials,
} from '@/lib/tokens'

export async function GET() {
  const [githubToken, vercelToken, vercelTeamId] = await Promise.all([
    getGitHubToken(),
    getVercelToken(),
    getVercelTeamId(),
  ])

  let github: { connected: boolean; login?: string; masked?: string | null } = {
    connected: false,
  }
  let vercel: {
    connected: boolean
    username?: string
    masked?: string | null
    teamId?: string
  } = { connected: false }

  if (githubToken) {
    try {
      const user = await getGitHubUser(githubToken)
      github = {
        connected: true,
        login: user.login,
        masked: maskToken(githubToken),
      }
    } catch {
      github = { connected: false, masked: maskToken(githubToken) }
    }
  }

  if (vercelToken) {
    try {
      const user = await getVercelUser(vercelToken)
      vercel = {
        connected: true,
        username: user.username,
        masked: maskToken(vercelToken),
        teamId: vercelTeamId,
      }
    } catch {
      vercel = {
        connected: false,
        masked: maskToken(vercelToken),
        teamId: vercelTeamId,
      }
    }
  }

  return NextResponse.json({ github, vercel })
}

export async function POST(req: Request) {
  const body = await req.json()
  const provider = body.provider as 'github' | 'vercel'
  const token = typeof body.token === 'string' ? body.token.trim() : ''
  const teamId =
    typeof body.teamId === 'string' ? body.teamId.trim() || undefined : undefined

  if (!provider || !token) {
    return NextResponse.json(
      { error: 'provider and token are required' },
      { status: 400 }
    )
  }

  if (provider === 'github') {
    try {
      const user = await getGitHubUser(token)
      await setGitHubToken(token)
      return NextResponse.json({
        connected: true,
        login: user.login,
        masked: maskToken(token),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid GitHub token'
      return NextResponse.json({ error: message }, { status: 400 })
    }
  }

  if (provider === 'vercel') {
    try {
      const user = await getVercelUser(token)
      await setVercelCredentials(token, teamId)
      return NextResponse.json({
        connected: true,
        username: user.username,
        masked: maskToken(token),
        teamId,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid Vercel token'
      return NextResponse.json({ error: message }, { status: 400 })
    }
  }

  return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const provider = searchParams.get('provider')

  if (provider === 'github') {
    await clearGitHubToken()
    return NextResponse.json({ ok: true })
  }
  if (provider === 'vercel') {
    await clearVercelCredentials()
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'provider required' }, { status: 400 })
}
