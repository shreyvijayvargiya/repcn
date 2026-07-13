import { NextResponse } from 'next/server'
import { generateRepoFiles } from '@/lib/generate'
import type { RepoFile } from '@/lib/github'
import {
  deployFilesToVercel,
  deployGitHubRepoToVercel,
  VercelApiError,
} from '@/lib/vercel'
import { getVercelTeamId, getVercelToken } from '@/lib/tokens'

export async function POST(req: Request) {
  const token = await getVercelToken()
  if (!token) {
    return NextResponse.json(
      { error: 'Connect Vercel first' },
      { status: 401 }
    )
  }

  const teamId = await getVercelTeamId()
  const body = await req.json()
  const githubRepo =
    typeof body.githubRepo === 'string' ? body.githubRepo.trim() : ''
  const projectName =
    typeof body.projectName === 'string' ? body.projectName.trim() : ''
  const componentCode =
    typeof body.componentCode === 'string' ? body.componentCode.trim() : ''
  const instructions =
    typeof body.instructions === 'string' ? body.instructions : ''
  const repoName = typeof body.repoName === 'string' ? body.repoName : undefined
  const existingFiles = Array.isArray(body.files)
    ? (body.files as RepoFile[])
    : null

  try {
    if (githubRepo) {
      const name =
        projectName || githubRepo.split('/')[1] || 'repcn-app'
      const result = await deployGitHubRepoToVercel(token, {
        name,
        repo: githubRepo,
        teamId,
      })
      return NextResponse.json({
        mode: 'github',
        project: result.project,
        deployment: {
          id: result.deployment.id,
          url: result.deployment.url
            ? `https://${result.deployment.url}`
            : null,
          inspectorUrl: result.deployment.inspectorUrl || null,
          readyState: result.deployment.readyState,
        },
      })
    }

    if (!componentCode && !(existingFiles && existingFiles.length)) {
      return NextResponse.json(
        { error: 'Provide githubRepo or componentCode/files' },
        { status: 400 }
      )
    }

    const generated =
      existingFiles && existingFiles.length > 0
        ? {
            repoName: projectName || repoName || 'repcn-app',
            files: existingFiles,
          }
        : generateRepoFiles({
            componentCode,
            instructions,
            repoName: projectName || repoName,
          })

    const deployment = await deployFilesToVercel(token, {
      name: generated.repoName,
      teamId,
      files: generated.files.map((f) => ({
        file: f.path,
        data: Buffer.from(f.content, 'utf8').toString('base64'),
      })),
    })

    return NextResponse.json({
      mode: 'files',
      deployment: {
        id: deployment.id,
        url: deployment.url ? `https://${deployment.url}` : null,
        inspectorUrl: deployment.inspectorUrl || null,
        readyState: deployment.readyState,
      },
    })
  } catch (err) {
    if (err instanceof VercelApiError) {
      return NextResponse.json(
        { error: err.message, details: err.details },
        { status: err.status }
      )
    }
    const message = err instanceof Error ? err.message : 'Deploy failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
