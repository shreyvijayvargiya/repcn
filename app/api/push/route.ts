import { NextResponse } from 'next/server'
import {
  createGitHubRepo,
  GitHubApiError,
  pushFilesToRepo,
  type RepoFile,
} from '@/lib/github'
import { generateRepoFiles } from '@/lib/generate'
import { isFrameworkId, isLanguageId } from '@/lib/frameworks'
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
  const framework = isFrameworkId(body.framework) ? body.framework : 'nextjs'
  const language = isLanguageId(body.language) ? body.language : 'ts'
  const shadcn = Boolean(body.shadcn)
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
            framework,
            language,
            shadcn,
          }
        : generateRepoFiles({
            componentCode,
            instructions,
            repoName,
            framework,
            language,
            shadcn,
          })

    const frameworkLabel =
      framework === 'vite'
        ? 'Vite'
        : framework === 'tanstack'
          ? 'TanStack'
          : 'Next.js'
    const languageLabel = language === 'js' ? 'JavaScript' : 'TypeScript'
    const stackLabel = `${frameworkLabel} · ${languageLabel}${shadcn ? ' · shadcn' : ''}`

    const repo = await createGitHubRepo(token, {
      name: generated.repoName,
      description: `Created with RepCN (${stackLabel})`,
      private: isPrivate,
      autoInit: false,
    })

    const [owner, name] = repo.full_name.split('/')
    await pushFilesToRepo(token, owner, name, generated.files, {
      message: `Initial commit from RepCN (${stackLabel})`,
    })

    return NextResponse.json({
      framework,
      language,
      shadcn,
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
