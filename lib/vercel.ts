const VERCEL_API = 'https://api.vercel.com'

export class VercelApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'VercelApiError'
    this.status = status
    this.details = details
  }
}

async function vercelFetch<T>(
  token: string,
  path: string,
  init?: RequestInit,
  teamId?: string
): Promise<T> {
  const url = new URL(`${VERCEL_API}${path}`)
  if (teamId) url.searchParams.set('teamId', teamId)

  const res = await fetch(url.toString(), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const message =
      (data && (data.error?.message as string)) ||
      (data && (data.message as string)) ||
      `Vercel API error (${res.status})`
    throw new VercelApiError(message, res.status, data)
  }

  return data as T
}

export type VercelUser = {
  id: string
  username: string
  name?: string
  email?: string
}

export async function getVercelUser(token: string) {
  const data = await vercelFetch<{ user: VercelUser }>(token, '/v2/user')
  return data.user
}

export type VercelDeployment = {
  id: string
  url: string
  readyState?: string
  inspectorUrl?: string
}

/** Deploy files directly via Vercel Deployments API. */
export async function deployFilesToVercel(
  token: string,
  input: {
    name: string
    files: { file: string; data: string }[]
    teamId?: string
  }
) {
  return vercelFetch<VercelDeployment>(
    token,
    '/v13/deployments',
    {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        files: input.files,
        projectSettings: {
          framework: 'nextjs',
        },
      }),
    },
    input.teamId
  )
}

/** Create a project linked to a GitHub repo, then trigger a deploy. */
export async function deployGitHubRepoToVercel(
  token: string,
  input: {
    name: string
    repo: string // owner/name
    teamId?: string
  }
) {
  const project = await vercelFetch<{ id: string; name: string }>(
    token,
    '/v11/projects',
    {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        framework: 'nextjs',
        gitRepository: {
          type: 'github',
          repo: input.repo,
        },
      }),
    },
    input.teamId
  )

  const deployment = await vercelFetch<VercelDeployment>(
    token,
    '/v13/deployments',
    {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        project: project.id,
        gitSource: {
          type: 'github',
          repo: input.repo,
          ref: 'main',
        },
      }),
    },
    input.teamId
  )

  return { project, deployment }
}
