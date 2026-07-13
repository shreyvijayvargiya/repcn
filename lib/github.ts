const GITHUB_API = 'https://api.github.com'

export class GitHubApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'GitHubApiError'
    this.status = status
    this.details = details
  }
}

async function githubFetch<T>(
  token: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const message =
      (data && (data.message as string)) ||
      `GitHub API error (${res.status})`
    throw new GitHubApiError(message, res.status, data)
  }

  return data as T
}

export type GitHubUser = {
  login: string
  id: number
  avatar_url: string
  name: string | null
  html_url: string
}

export type GitHubRepo = {
  id: number
  name: string
  full_name: string
  html_url: string
  clone_url: string
  default_branch: string
  private: boolean
}

export async function getGitHubUser(token: string) {
  return githubFetch<GitHubUser>(token, '/user')
}

export async function createGitHubRepo(
  token: string,
  input: {
    name: string
    description?: string
    private?: boolean
    autoInit?: boolean
  }
) {
  return githubFetch<GitHubRepo>(token, '/user/repos', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      description: input.description || 'Created with RepCN',
      private: input.private ?? false,
      auto_init: input.autoInit ?? false,
    }),
  })
}

export type RepoFile = {
  path: string
  content: string
}

/** Push files to a repo using the Git Data API (single commit). */
export async function pushFilesToRepo(
  token: string,
  owner: string,
  repo: string,
  files: RepoFile[],
  options?: {
    branch?: string
    message?: string
  }
) {
  const branch = options?.branch || 'main'
  const message = options?.message || 'Initial commit from RepCN'

  const blobs = await Promise.all(
    files.map(async (file) => {
      const blob = await githubFetch<{ sha: string }>(
        token,
        `/repos/${owner}/${repo}/git/blobs`,
        {
          method: 'POST',
          body: JSON.stringify({
            content: Buffer.from(file.content, 'utf8').toString('base64'),
            encoding: 'base64',
          }),
        }
      )
      return {
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.sha,
      }
    })
  )

  const tree = await githubFetch<{ sha: string }>(
    token,
    `/repos/${owner}/${repo}/git/trees`,
    {
      method: 'POST',
      body: JSON.stringify({ tree: blobs }),
    }
  )

  const commit = await githubFetch<{ sha: string }>(
    token,
    `/repos/${owner}/${repo}/git/commits`,
    {
      method: 'POST',
      body: JSON.stringify({
        message,
        tree: tree.sha,
        parents: [],
      }),
    }
  )

  await githubFetch(token, `/repos/${owner}/${repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: commit.sha,
    }),
  })

  return { commitSha: commit.sha, branch }
}
