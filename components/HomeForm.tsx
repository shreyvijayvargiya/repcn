'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import JSZip from 'jszip'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  File,
  Folder,
  FolderOpen,
  Github,
  Loader2,
  Triangle,
} from 'lucide-react'
import {
  buildFileTree,
  generateRepoFiles,
  summarizeRepo,
  type TreeNode,
} from '@/lib/generate'
import {
  FRAMEWORKS,
  LANGUAGES,
  getFramework,
  packagesForLanguage,
  type FrameworkId,
  type LanguageId,
} from '@/lib/frameworks'
import { SHADCN_PACKAGES, mergeShadcnPackages } from '@/lib/shadcn'
import UseCaseCards from '@/components/UseCaseCards'

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

function TreeItem({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: TreeNode
  depth: number
  selectedPath: string | null
  onSelect: (path: string) => void
}) {
  const [open, setOpen] = useState(true)
  const isFolder = node.type === 'folder'
  const active = !isFolder && node.path === selectedPath

  return (
    <li>
      <button
        type="button"
        onClick={() => {
          if (isFolder) setOpen((v) => !v)
          else onSelect(node.path)
        }}
        className={`flex w-full items-center gap-1.5 py-1.5 pr-2 text-left font-mono text-xs transition ${
          active
            ? 'bg-surface text-ink'
            : 'text-muted hover:bg-surface/80 hover:text-ink'
        }`}
        style={{ paddingLeft: 8 + depth * 14 }}
      >
        {isFolder ? (
          open ? (
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-folder" />
          ) : (
            <Folder className="h-3.5 w-3.5 shrink-0 text-folder" />
          )
        ) : (
          <File className="h-3.5 w-3.5 shrink-0 text-muted" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {isFolder && open && node.children ? (
        <ul>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export default function HomeForm() {
  const [framework, setFramework] = useState<FrameworkId>('nextjs')
  const [language, setLanguage] = useState<LanguageId>('ts')
  const [shadcn, setShadcn] = useState(true)
  const [repoName, setRepoName] = useState('my-react-app')
  const [componentCode, setComponentCode] = useState(DEFAULT_COMPONENT)
  const [instructions, setInstructions] = useState('')
  const [files, setFiles] = useState<RepoFile[]>([])
  const [summary, setSummary] = useState<FileSummary[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [isPrivate, setIsPrivate] = useState(false)
  const [busy, setBusy] = useState<'preview' | 'push' | 'deploy' | 'download' | null>(
    null
  )
  const [previewName, setPreviewName] = useState('my-react-app')
  const [repoUrl, setRepoUrl] = useState<string | null>(null)
  const [repoFullName, setRepoFullName] = useState<string | null>(null)
  const [deployUrl, setDeployUrl] = useState<string | null>(null)
  const [connections, setConnections] = useState<ConnectionState | null>(null)
  const [showConnections, setShowConnections] = useState(false)
  const [githubToken, setGithubToken] = useState('')
  const [vercelToken, setVercelToken] = useState('')
  const [vercelTeamId, setVercelTeamId] = useState('')
  const [connecting, setConnecting] = useState<'github' | 'vercel' | null>(null)

  const selectedFramework = getFramework(framework)
  const languageMeta = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0]
  const tree = useMemo(() => buildFileTree(files), [files])
  const selectedFile = files.find((f) => f.path === selectedPath) ?? null
  const packages = mergeShadcnPackages(selectedFramework.packages, shadcn)
  const visiblePackages = packagesForLanguage(packages, language)
  const deps = visiblePackages.filter((p) => p.kind === 'dependency')
  const devDeps = visiblePackages.filter((p) => p.kind === 'devDependency')

  useEffect(() => {
    void refreshConnections()
  }, [])

  useEffect(() => {
    // Clear stale preview when switching framework, language, or shadcn
    setFiles([])
    setSummary([])
    setSelectedPath(null)
    setRepoUrl(null)
    setRepoFullName(null)
    setDeployUrl(null)
  }, [framework, language, shadcn])

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
      else setVercelToken('')
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

  function previewRepo() {
    if (!componentCode.trim()) {
      toast.error('Add your React component code')
      return
    }

    setBusy('preview')
    try {
      const generated = generateRepoFiles({
        componentCode,
        instructions,
        repoName,
        framework,
        language,
        shadcn,
      })
      const nextSummary = summarizeRepo(generated.files)
      const preferred =
        generated.files.find((f) =>
          /components\/ui\/button\.(tsx|jsx)$/.test(f.path)
        )?.path ||
        generated.files.find((f) =>
          /components\/[^/]+\.(tsx|jsx)$/.test(f.path)
        )?.path ||
        generated.files.find((f) =>
          /^(app\/page|src\/App|src\/routes\/index)\.(tsx|jsx)$/.test(f.path)
        )?.path ||
        generated.files[0]?.path ||
        null

      setFiles(generated.files)
      setSummary(nextSummary)
      setPreviewName(generated.repoName)
      setSelectedPath(preferred)
      setRepoUrl(null)
      setRepoFullName(null)
      setDeployUrl(null)
      toast.success(`Preview ready · ${nextSummary.length} files`)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Generate failed')
    } finally {
      setBusy(null)
    }
  }

  async function downloadRepo() {
    if (!files.length) {
      toast.error('Preview the repository first')
      return
    }
    setBusy('download')
    try {
      const zip = new JSZip()
      const root = zip.folder(previewName) || zip
      for (const file of files) {
        root.file(file.path, file.content)
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${previewName}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Download started')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setBusy(null)
    }
  }

  function downloadActiveFile() {
    if (!selectedFile) {
      toast.error('Select a file first')
      return
    }
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = selectedFile.path.split('/').pop() || 'file.txt'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
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
          framework,
          language,
          shadcn,
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
                framework,
                language,
                shadcn,
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

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10 md:py-14">
      <header className="mb-10">
        <p className="font-display text-4xl tracking-tight text-ink md:text-5xl">
          RepCN
        </p>
        <p className="mt-3 max-w-xl text-base text-muted">
          Paste a React component, pick Next.js, Vite, or TanStack, preview the
          repo, then download a ZIP or push to GitHub.
        </p>
      </header>

      <section className="space-y-8">
        <div>
          <label htmlFor="repoName" className="block text-sm font-medium text-ink">
            Repository name
          </label>
          <input
            id="repoName"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            className="mt-2 w-full border-0 border-b border-line bg-transparent px-0 py-2 text-lg text-ink outline-none transition focus:border-ink"
            placeholder="my-react-app"
          />
        </div>

        <div>
          <label
            htmlFor="componentCode"
            className="block text-sm font-medium text-ink"
          >
            React component
          </label>
          <textarea
            id="componentCode"
            value={componentCode}
            onChange={(e) => setComponentCode(e.target.value)}
            spellCheck={false}
            rows={14}
            className="mt-2 w-full resize-y border border-line bg-surface px-3 py-3 font-mono text-sm leading-relaxed text-ink outline-none transition focus:border-ink"
            placeholder="export default function MyComponent() { ... }"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-ink">
            Framework
          </legend>
          <p className="mt-1 text-sm text-muted">
            Choose which repository scaffold to generate, download, and push.
          </p>
          <div
            role="tablist"
            aria-label="Framework"
            className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3"
          >
            {FRAMEWORKS.map((item) => {
              const active = framework === item.id
              return (
                <label
                  key={item.id}
                  role="tab"
                  aria-selected={active}
                  className={`cursor-pointer border px-4 py-3 transition ${
                    active
                      ? 'border-ink bg-surface text-ink'
                      : 'border-line bg-transparent text-muted hover:border-ink hover:text-ink'
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="framework"
                      value={item.id}
                      checked={active}
                      onChange={() => setFramework(item.id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium text-ink">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted">
                        {item.description}
                      </span>
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-ink">Language</legend>
          <p className="mt-1 text-sm text-muted">
            Choose TypeScript or JavaScript — repo files and ZIP use matching
            extensions ({languageMeta.extensions}).
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {LANGUAGES.map((item) => {
              const active = language === item.id
              return (
                <label
                  key={item.id}
                  className={`cursor-pointer border px-4 py-3 transition ${
                    active
                      ? 'border-ink bg-surface text-ink'
                      : 'border-line bg-transparent text-muted hover:border-ink hover:text-ink'
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="language"
                      value={item.id}
                      checked={active}
                      onChange={() => setLanguage(item.id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium text-ink">
                        {item.label}
                      </span>
                      <span className="mt-1 block font-mono text-xs text-muted">
                        {item.extensions}
                      </span>
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-ink">shadcn/ui</legend>
          <p className="mt-1 text-sm text-muted">
            Include shadcn setup with default <code className="font-mono">Button</code> and{' '}
            <code className="font-mono">Input</code> for both JS and TS scaffolds.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              {
                id: true,
                label: 'Include shadcn/ui',
                detail: 'components.json · utils · Button · Input · CSS variables',
              },
              {
                id: false,
                label: 'No shadcn',
                detail: 'Plain Tailwind only',
              },
            ].map((item) => {
              const active = shadcn === item.id
              return (
                <label
                  key={String(item.id)}
                  className={`cursor-pointer border px-4 py-3 transition ${
                    active
                      ? 'border-ink bg-surface text-ink'
                      : 'border-line bg-transparent text-muted hover:border-ink hover:text-ink'
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="shadcn"
                      checked={active}
                      onChange={() => setShadcn(item.id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium text-ink">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {item.detail}
                      </span>
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
          {shadcn ? (
            <p className="mt-3 text-xs text-muted">
              Adds {SHADCN_PACKAGES.length} packages (cva, clsx, tailwind-merge, Radix Slot,
              animate) and a starter UI strip on the home page.
            </p>
          ) : null}
        </fieldset>

        <div className="border border-line bg-surface/60 px-4 py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-medium text-ink">
              Packages · {selectedFramework.label} · {languageMeta.label}
              {shadcn ? ' · shadcn' : ''}
            </h2>
            <p className="font-mono text-xs text-muted">
              {selectedFramework.runCommand}
            </p>
          </div>
          <p className="mt-2 text-sm text-muted">
            Static versions shipped in the generated <code className="font-mono">package.json</code>.
          </p>

          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
                dependencies
              </h3>
              <ul className="mt-2 space-y-1.5 font-mono text-xs text-ink">
                {deps.map((pkg) => (
                  <li key={pkg.name} className="flex justify-between gap-3 border-b border-line/70 py-1">
                    <span>{pkg.name}</span>
                    <span className="text-muted">{pkg.version}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
                devDependencies
              </h3>
              <ul className="mt-2 space-y-1.5 font-mono text-xs text-ink">
                {devDeps.map((pkg) => (
                  <li key={pkg.name} className="flex justify-between gap-3 border-b border-line/70 py-1">
                    <span>{pkg.name}</span>
                    <span className="text-muted">{pkg.version}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-ink">
            What this repository will create
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">
            {selectedFramework.creates.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {shadcn ? (
              <li>
                shadcn/ui with <code className="font-mono">Button</code> +{' '}
                <code className="font-mono">Input</code>, CSS variables, and{' '}
                <code className="font-mono">components.json</code>
              </li>
            ) : null}
          </ul>
          <ul className="mt-4 space-y-1.5 text-sm text-muted">
            {selectedFramework.guide.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-ink">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label
            htmlFor="instructions"
            className="block text-sm font-medium text-ink"
          >
            Instructions
          </label>
          <p className="mt-1 text-sm text-muted">
            Notes for the generated {selectedFramework.label} app (layout, copy, behavior).
            They are embedded in the repo README and entry file.
          </p>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={4}
            className="mt-2 w-full resize-y border border-line bg-surface px-3 py-3 text-sm leading-relaxed text-ink outline-none transition focus:border-ink"
            placeholder="Optional notes for the generated app…"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={previewRepo}
            disabled={busy !== null}
            className="inline-flex items-center gap-2 bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition hover:opacity-90 disabled:opacity-50"
          >
            {busy === 'preview' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Preview {selectedFramework.shortLabel} repository
          </button>
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="border-line"
            />
            Private GitHub repo
          </label>
        </div>
      </section>

      {files.length > 0 ? (
        <section className="mt-12 border-t border-line pt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium text-ink">Repository</h2>
              <p className="mt-1 text-sm text-muted">
                {summary.length} files · {previewName} · {selectedFramework.label} ·{' '}
                {languageMeta.label}
                {shadcn ? ' · shadcn' : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void downloadRepo()}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition hover:border-ink disabled:opacity-50"
              >
                {busy === 'download' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download ZIP
              </button>
              <button
                type="button"
                onClick={() => void pushToGitHub()}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition hover:border-ink disabled:opacity-50"
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
                className="inline-flex items-center gap-2 border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition hover:border-ink disabled:opacity-50"
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
                  className="inline-flex items-center gap-1.5 text-ink underline underline-offset-4"
                >
                  Open GitHub repo <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
              {deployUrl ? (
                <a
                  href={deployUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-ink underline underline-offset-4"
                >
                  Open Vercel deploy <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          )}

          <div className="grid min-h-[420px] border border-line md:grid-cols-[260px_1fr]">
            <div className="border-b border-line bg-surface-muted/80 md:border-b-0 md:border-r">
              <div className="border-b border-line px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted">
                Files
              </div>
              <ul className="max-h-[380px] overflow-auto py-1">
                {tree.map((node) => (
                  <TreeItem
                    key={node.path}
                    node={node}
                    depth={0}
                    selectedPath={selectedPath}
                    onSelect={setSelectedPath}
                  />
                ))}
              </ul>
            </div>

            <div className="flex min-h-0 flex-col bg-code-bg">
              <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
                <p className="truncate font-mono text-xs text-muted">
                  {selectedFile?.path || 'Select a file'}
                </p>
                <button
                  type="button"
                  onClick={downloadActiveFile}
                  disabled={!selectedFile}
                  className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-ink underline underline-offset-2 disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download file
                </button>
              </div>
              <pre className="max-h-[380px] flex-1 overflow-auto bg-code-bg p-4 font-mono text-xs leading-relaxed text-ink whitespace-pre-wrap">
                {selectedFile?.content || '// Select a file from the tree'}
              </pre>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-14 border-t border-line pt-8">
        <button
          type="button"
          onClick={() => setShowConnections((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <div>
            <h2 className="text-lg font-medium text-ink">
              Connect GitHub & Vercel
            </h2>
            <p className="mt-1 text-sm text-muted">
              Required to push and deploy. Tokens stay in httpOnly cookies.
            </p>
          </div>
          {showConnections ? (
            <ChevronDown className="h-5 w-5 text-muted" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted" />
          )}
        </button>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 text-ink">
            <Github className="h-4 w-4" />
            {connections?.github.connected ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" />@
                {connections.github.login}
              </>
            ) : (
              <span className="text-muted">Not connected</span>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5 text-ink">
            <Triangle className="h-4 w-4" />
            {connections?.vercel.connected ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" />
                {connections.vercel.username}
              </>
            ) : (
              <span className="text-muted">Not connected</span>
            )}
          </span>
        </div>

        {showConnections ? (
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-ink">GitHub token</h3>
              <p className="text-xs text-muted">
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
                  className="text-sm text-muted underline underline-offset-4"
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
                    className="w-full border-0 border-b border-line bg-transparent px-0 py-2 font-mono text-sm outline-none focus:border-ink"
                  />
                  <button
                    type="button"
                    onClick={() => void connectProvider('github')}
                    disabled={connecting !== null}
                    className="inline-flex items-center gap-2 bg-accent px-3 py-2 text-sm font-medium text-accent-fg disabled:opacity-50"
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
              <h3 className="text-sm font-medium text-ink">Vercel token</h3>
              <p className="text-xs text-muted">
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
                  className="text-sm text-muted underline underline-offset-4"
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
                    className="w-full border-0 border-b border-line bg-transparent px-0 py-2 font-mono text-sm outline-none focus:border-ink"
                  />
                  <input
                    type="text"
                    value={vercelTeamId}
                    onChange={(e) => setVercelTeamId(e.target.value)}
                    placeholder="Team ID (optional)"
                    className="w-full border-0 border-b border-line bg-transparent px-0 py-2 font-mono text-sm outline-none focus:border-ink"
                  />
                  <button
                    type="button"
                    onClick={() => void connectProvider('vercel')}
                    disabled={connecting !== null}
                    className="inline-flex items-center gap-2 bg-accent px-3 py-2 text-sm font-medium text-accent-fg disabled:opacity-50"
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

      <UseCaseCards
        onUseExample={(code) => {
          setComponentCode(code)
          setInstructions(
            'Build a polished pricing board from Claude’s React output. Keep the yearly toggle, featured Studio plan, and clean typography.'
          )
        }}
      />
    </div>
  )
}
