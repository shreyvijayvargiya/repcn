import { NextResponse } from 'next/server'
import {
  createGitHubRepo,
  GitHubApiError,
  pushFilesToRepo,
  type RepoFile,
} from '@/lib/github'
import { generateRepoFiles } from '@/lib/generate'
import { getGitHubToken } from '@/lib/tokens'

export async function POST(req: Request) {
  const token = await getGitHubToken()
  if (!token) {
    return NextResponse.json(
      { error: 'Connect GitHub first' },
      { status: 401 }
    )
  }

  const body = await req.json()
  const componentCode =
    typeof body.componentCode === 'string' ? body.componentCode.trim() : ''
  const instructions =
    typeof body.instructions === 'string' ? body.instructions : ''
  const repoName = typeof body.repoName === 'string' ? body.repoName : undefined
  const isPrivate = Boolean(body.private)
  const existingFiles = Array.isArray(body.files)
    ? (body.files as RepoFile[])
    : null

  if (!componentCode && !existingFiles) {
    return NextResponse.json(
      { error: 'componentCode or files required' },
      { status: 400 }
    )
  }

  try {
    const generated =
      existingFiles && existingFiles.length > 0
        ? {
            repoName:
              (typeof body.repoName === 'string' && body.repoName) ||
              'repcn-app',
            files: existingFiles,
          }
        : generateRepoFiles({ componentCode, instructions, repoName })

    const repo = await createGitHubRepo(token, {
      name: generated.repoName,
      description: 'Created with RepCN',
      private: isPrivate,
      autoInit: false,
    })

    const [owner, name] = repo.full_name.split('/')
    await pushFilesToRepo(token, owner, name, generated.files, {
      message: 'Initial commit from RepCN',
    })

    return NextResponse.json({
      repo: {
        name: repo.name,
        fullName: repo.full_name,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        defaultBranch: repo.default_branch || 'main',
      },
      files: generated.files.map((f) => f.path),
    })
  } catch (err) {
    if (err instanceof GitHubApiError) {
      return NextResponse.json(
        { error: err.message, details: err.details },
        { status: err.status }
      )
    }
    const message = err instanceof Error ? err.message : 'Push failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
