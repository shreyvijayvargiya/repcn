import { NextResponse } from 'next/server'
import { generateRepoFiles, summarizeRepo } from '@/lib/generate'

export async function POST(req: Request) {
  const body = await req.json()
  const componentCode =
    typeof body.componentCode === 'string' ? body.componentCode.trim() : ''
  const instructions =
    typeof body.instructions === 'string' ? body.instructions : ''
  const repoName = typeof body.repoName === 'string' ? body.repoName : undefined

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
  })

  return NextResponse.json({
    repoName: name,
    files,
    summary: summarizeRepo(files),
  })
}
