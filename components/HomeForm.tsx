'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Github,
  Loader2,
  Triangle,
} from 'lucide-react'

type RepoFile = { path: string; content: string }
type FileSummary = { path: string; bytes: number }

type ConnectionState = {
  github: { connected: boolean; login?: string; masked?: string | null }
  vercel: {
    connected: boolean
    username?: string
    masked?: string | null
    teamId?: string
  }
}

const DEFAULT_COMPONENT = `export default function Hello() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Hello</h1>
      <p className="mt-2 text-zinc-600">Edit this component to get started.</p>
    </div>
  )
}
`

export default function HomeForm() {
  const [repoName, setRepoName] = useState('my-react-app')
  const [componentCode, setComponentCode] = useState(DEFAULT_COMPONENT)
  const [instructions, setInstructions] = useState('')
  const [files, setFiles] = useState<RepoFile[]>([])
  const [summary, setSummary] = useState<FileSummary[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [isPrivate, setIsPrivate] = useState(false)
  const [busy, setBusy] = useState<'preview' | 'push' | 'deploy' | null>(null)
  const [repoUrl, setRepoUrl] = useState<string | null>(null)
  const [repoFullName, setRepoFullName] = useState<string | null>(null)
  const [deployUrl, setDeployUrl] = useState<string | null>(null)
  const [connections, setConnections] = useState<ConnectionState | null>(null)
  const [showConnections, setShowConnections] = useState(false)
  const [githubToken, setGithubToken] = useState('')
  const [vercelToken, setVercelToken] = useState('')
  const [vercelTeamId, setVercelTeamId] = useState('')
  const [connecting, setConnecting] = useState<'github' | 'vercel' | null>(null)

  useEffect(() => {
    void refreshConnections()
  }, [])

  async function refreshConnections() {
    try {
      const res = await fetch('/api/connections')
      if (!res.ok) return
      const data = (await res.json()) as ConnectionState
      setConnections(data)
      if (!data.github.connected || !data.vercel.connected) {
        setShowConnections(true)
      }
    } catch {
      // ignore
    }
  }

  async function connectProvider(provider: 'github' | 'vercel') {
    const token = provider === 'github' ? githubToken.trim() : vercelToken.trim()
    if (!token) {
      toast.error(`Paste your ${provider === 'github' ? 'GitHub' : 'Vercel'} token`)
      return
    }
    setConnecting(provider)
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          token,
          teamId: provider === 'vercel' ? vercelTeamId.trim() || undefined : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Connection failed')
      toast.success(
        provider === 'github'
          ? `GitHub connected as @${data.login}`
          : `Vercel connected as ${data.username}`
      )
      if (provider === 'github') setGithubToken('')
      else {
        setVercelToken('')
      }
      await refreshConnections()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setConnecting(null)
    }
  }

  async function disconnectProvider(provider: 'github' | 'vercel') {
    await fetch(`/api/connections?provider=${provider}`, { method: 'DELETE' })
    toast.success(`${provider === 'github' ? 'GitHub' : 'Vercel'} disconnected`)
    await refreshConnections()
  }

  async function previewRepo() {
    if (!componentCode.trim()) {
      toast.error('Add your React component code')
      return
    }
    setBusy('preview')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentCode, instructions, repoName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generate failed')
      setFiles(data.files)
      setSummary(data.summary)
      setSelectedPath(data.files[0]?.path ?? null)
      setRepoUrl(null)
      setRepoFullName(null)
      setDeployUrl(null)
      toast.success(`Preview ready · ${data.summary.length} files`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generate failed')
    } finally {
      setBusy(null)
    }
  }

  async function pushToGitHub() {
    if (!connections?.github.connected) {
      setShowConnections(true)
      toast.error('Connect GitHub first')
      return
    }
    if (!componentCode.trim()) {
      toast.error('Add your React component code')
      return
    }
    setBusy('push')
    try {
      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentCode,
          instructions,
          repoName,
          private: isPrivate,
          files: files.length ? files : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Push failed')
      setRepoUrl(data.repo.htmlUrl)
      setRepoFullName(data.repo.fullName)
      toast.success('Pushed to GitHub')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Push failed')
    } finally {
      setBusy(null)
    }
  }

  async function deployToVercel() {
    if (!connections?.vercel.connected) {
      setShowConnections(true)
      toast.error('Connect Vercel first')
      return
    }
    if (!componentCode.trim() && !repoFullName) {
      toast.error('Add React code or push a repo first')
      return
    }
    setBusy('deploy')
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          repoFullName
            ? { githubRepo: repoFullName, projectName: repoName }
            : {
                componentCode,
                instructions,
                repoName,
                files: files.length ? files : undefined,
              }
        ),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Deploy failed')
      setDeployUrl(data.deployment?.url || data.deployment?.inspectorUrl)
      toast.success('Deploy started on Vercel')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Deploy failed')
    } finally {
      setBusy(null)
    }
  }

  const selectedFile = files.find((f) => f.path === selectedPath)

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10 md:py-14">
      <header className="mb-10">
        <p className="font-display text-4xl tracking-tight text-zinc-900 md:text-5xl">
          RepCN
        </p>
        <p className="mt-3 max-w-xl text-base text-zinc-600">
          Paste a React component, add instructions, preview the generated
          repository, then push to GitHub and deploy on Vercel.
        </p>
      </header>

      <section className="space-y-8">
        <div>
          <label htmlFor="repoName" className="block text-sm font-medium text-zinc-800">
            Repository name
          </label>
          <input
            id="repoName"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            className="mt-2 w-full border-0 border-b border-zinc-300 bg-transparent px-0 py-2 text-lg text-zinc-900 outline-none transition focus:border-zinc-900"
            placeholder="my-react-app"
          />
        </div>

        <div>
          <label
            htmlFor="componentCode"
            className="block text-sm font-medium text-zinc-800"
          >
            React component
          </label>
          <textarea
            id="componentCode"
            value={componentCode}
            onChange={(e) => setComponentCode(e.target.value)}
            spellCheck={false}
            rows={14}
            className="mt-2 w-full resize-y rounded-none border border-zinc-300 bg-white px-3 py-3 font-mono text-sm leading-relaxed text-zinc-900 outline-none transition focus:border-zinc-900"
            placeholder="export default function MyComponent() { ... }"
          />
        </div>

        <div>
          <label
            htmlFor="instructions"
            className="block text-sm font-medium text-zinc-800"
          >
            Instructions
          </label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={4}
            className="mt-2 w-full resize-y rounded-none border border-zinc-300 bg-white px-3 py-3 text-sm leading-relaxed text-zinc-900 outline-none transition focus:border-zinc-900"
            placeholder="Optional notes for the generated app (layout, copy, behavior)…"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void previewRepo()}
            disabled={busy !== null}
            className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {busy === 'preview' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Preview repository
          </button>
          <label className="inline-flex items-center gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded-none border-zinc-400"
            />
            Private GitHub repo
          </label>
        </div>
      </section>

      {summary.length > 0 ? (
        <section className="mt-12 border-t border-zinc-200 pt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium text-zinc-900">Repository</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {summary.length} files · {repoName || 'repcn-app'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void pushToGitHub()}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-900 disabled:opacity-50"
              >
                {busy === 'push' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Github className="h-4 w-4" />
                )}
                Push to GitHub
              </button>
              <button
                type="button"
                onClick={() => void deployToVercel()}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-900 disabled:opacity-50"
              >
                {busy === 'deploy' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Triangle className="h-4 w-4" />
                )}
                Deploy to Vercel
              </button>
            </div>
          </div>

          {(repoUrl || deployUrl) && (
            <div className="mb-6 flex flex-wrap gap-4 text-sm">
              {repoUrl ? (
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-zinc-900 underline underline-offset-4"
                >
                  Open GitHub repo <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
              {deployUrl ? (
                <a
                  href={deployUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-zinc-900 underline underline-offset-4"
                >
                  Open Vercel deploy <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          )}

          <div className="grid gap-0 border border-zinc-300 md:grid-cols-[240px_1fr]">
            <ul className="max-h-[420px] overflow-auto border-b border-zinc-300 bg-zinc-100/70 md:border-b-0 md:border-r">
              {summary.map((file) => {
                const active = file.path === selectedPath
                return (
                  <li key={file.path}>
                    <button
                      type="button"
                      onClick={() => setSelectedPath(file.path)}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-mono text-xs transition ${
                        active
                          ? 'bg-white text-zinc-900'
                          : 'text-zinc-600 hover:bg-white/80 hover:text-zinc-900'
                      }`}
                    >
                      <span className="truncate">{file.path}</span>
                      <span className="shrink-0 text-[10px] text-zinc-400">
                        {file.bytes}b
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <pre className="max-h-[420px] overflow-auto bg-white p-4 font-mono text-xs leading-relaxed text-zinc-800">
              {selectedFile?.content || '// Select a file'}
            </pre>
          </div>
        </section>
      ) : null}

      <section className="mt-14 border-t border-zinc-200 pt-8">
        <button
          type="button"
          onClick={() => setShowConnections((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <div>
            <h2 className="text-lg font-medium text-zinc-900">
              Connect GitHub & Vercel
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Required to push and deploy. Tokens stay in httpOnly cookies.
            </p>
          </div>
          {showConnections ? (
            <ChevronDown className="h-5 w-5 text-zinc-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-zinc-500" />
          )}
        </button>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 text-zinc-700">
            <Github className="h-4 w-4" />
            {connections?.github.connected ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />@
                {connections.github.login}
              </>
            ) : (
              <span className="text-zinc-400">Not connected</span>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5 text-zinc-700">
            <Triangle className="h-4 w-4" />
            {connections?.vercel.connected ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                {connections.vercel.username}
              </>
            ) : (
              <span className="text-zinc-400">Not connected</span>
            )}
          </span>
        </div>

        {showConnections ? (
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-800">GitHub token</h3>
              <p className="text-xs text-zinc-500">
                Personal access token with <code className="font-mono">repo</code>{' '}
                scope.{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  Create token
                </a>
              </p>
              {connections?.github.connected ? (
                <button
                  type="button"
                  onClick={() => void disconnectProvider('github')}
                  className="text-sm text-zinc-600 underline underline-offset-4"
                >
                  Disconnect GitHub
                </button>
              ) : (
                <>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_…"
                    className="w-full border-0 border-b border-zinc-300 bg-transparent px-0 py-2 font-mono text-sm outline-none focus:border-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={() => void connectProvider('github')}
                    disabled={connecting !== null}
                    className="inline-flex items-center gap-2 bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {connecting === 'github' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Github className="h-4 w-4" />
                    )}
                    Connect GitHub
                  </button>
                </>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-800">Vercel token</h3>
              <p className="text-xs text-zinc-500">
                Create a token in Vercel account settings.{' '}
                <a
                  href="https://vercel.com/account/tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  Create token
                </a>
              </p>
              {connections?.vercel.connected ? (
                <button
                  type="button"
                  onClick={() => void disconnectProvider('vercel')}
                  className="text-sm text-zinc-600 underline underline-offset-4"
                >
                  Disconnect Vercel
                </button>
              ) : (
                <>
                  <input
                    type="password"
                    value={vercelToken}
                    onChange={(e) => setVercelToken(e.target.value)}
                    placeholder="vercel_…"
                    className="w-full border-0 border-b border-zinc-300 bg-transparent px-0 py-2 font-mono text-sm outline-none focus:border-zinc-900"
                  />
                  <input
                    type="text"
                    value={vercelTeamId}
                    onChange={(e) => setVercelTeamId(e.target.value)}
                    placeholder="Team ID (optional)"
                    className="w-full border-0 border-b border-zinc-300 bg-transparent px-0 py-2 font-mono text-sm outline-none focus:border-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={() => void connectProvider('vercel')}
                    disabled={connecting !== null}
                    className="inline-flex items-center gap-2 bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {connecting === 'vercel' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Triangle className="h-4 w-4" />
                    )}
                    Connect Vercel
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
