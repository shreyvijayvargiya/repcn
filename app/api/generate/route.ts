import { NextResponse } from 'next/server'
import { generateRepoFiles, summarizeRepo } from '@/lib/generate'
import { isFrameworkId, isLanguageId } from '@/lib/frameworks'

export async function POST(req: Request) {
  const body = await req.json()
  const componentCode =
    typeof body.componentCode === 'string' ? body.componentCode.trim() : ''
  const instructions =
    typeof body.instructions === 'string' ? body.instructions : ''
  const repoName = typeof body.repoName === 'string' ? body.repoName : undefined
  const framework = isFrameworkId(body.framework) ? body.framework : 'nextjs'
  const language = isLanguageId(body.language) ? body.language : 'ts'
  const shadcn = Boolean(body.shadcn)

  if (!componentCode) {
    return NextResponse.json(
      { error: 'componentCode is required' },
      { status: 400 }
    )
  }

  const { repoName: name, files } = generateRepoFiles({
    componentCode,
    instructions,
    repoName,
    framework,
    language,
    shadcn,
  })

  return NextResponse.json({
    repoName: name,
    framework,
    language,
    shadcn,
    files,
    summary: summarizeRepo(files),
  })
}
