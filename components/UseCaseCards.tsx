'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Check,
  ClipboardCopy,
  Github,
  Share2,
  Sparkles,
  Triangle,
} from 'lucide-react'

/** Polished Claude-style example users can copy into the form. */
export const CLAUDE_EXAMPLE_COMPONENT = `import { useState } from 'react'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 12,
    blurb: 'Ship one product idea with clean defaults.',
    perks: ['1 project', 'ZIP + GitHub push', 'Community support'],
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 29,
    blurb: 'For builders who paste Claude output and deploy same day.',
    perks: ['Unlimited projects', 'Vercel deploy', 'Priority templates'],
    featured: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: 79,
    blurb: 'Shared repos, faster handoff from chat to production.',
    perks: ['3 seats', 'Private repos', 'Shared deploys'],
  },
] as const

export default function PricingBoard() {
  const [yearly, setYearly] = useState(true)
  const [selected, setSelected] = useState<string>('studio')

  return (
    <section className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-emerald-700">
            From Claude → live app
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Pricing that feels finished
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600">
            Copy this board into RepCN, generate a repo, push to GitHub, and
            share a Vercel URL with your team.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={yearly}
            onChange={(e) => setYearly(e.target.checked)}
            className="rounded border-zinc-300"
          />
          Yearly · save 20%
        </label>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const price = yearly ? Math.round(plan.price * 0.8) : plan.price
          const active = selected === plan.id

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelected(plan.id)}
              className={\`rounded-2xl border p-5 text-left transition \${
                active
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg'
                  : 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400'
              }\`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                {plan.featured ? (
                  <span
                    className={\`text-[11px] font-medium uppercase tracking-wide \${
                      active ? 'text-emerald-300' : 'text-emerald-700'
                    }\`}
                  >
                    Popular
                  </span>
                ) : null}
              </div>
              <p className={\`mt-2 text-sm \${active ? 'text-zinc-300' : 'text-zinc-600'}\`}>
                {plan.blurb}
              </p>
              <p className="mt-5 text-3xl font-semibold tracking-tight">
                \${price}
                <span className={\`text-sm font-normal \${active ? 'text-zinc-400' : 'text-zinc-500'}\`}>
                  /mo
                </span>
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex gap-2">
                    <span className={active ? 'text-emerald-300' : 'text-emerald-600'}>✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>
    </section>
  )
}
`

type UseCaseCardsProps = {
  onUseExample: (code: string) => void
}

export default function UseCaseCards({ onUseExample }: UseCaseCardsProps) {
  const [copied, setCopied] = useState(false)

  async function copyExample() {
    try {
      await navigator.clipboard.writeText(CLAUDE_EXAMPLE_COMPONENT)
      setCopied(true)
      toast.success('Claude example copied')
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Could not copy — use “Paste into form” instead')
    }
  }

  function pasteIntoForm() {
    onUseExample(CLAUDE_EXAMPLE_COMPONENT)
    toast.success('Example pasted into React component')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="mt-14 border-t border-line pt-10 pb-6">
      <div className="mb-8 max-w-2xl">
        <h2 className="font-display text-2xl tracking-tight text-ink md:text-3xl">
          How people use RepCN
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          A short loop: get polished React from Claude, turn it into a real
          repository, then deploy a URL you can share.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Card 1 — Get code from Claude */}
        <article className="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-2 text-ink">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted">
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Step 1
            </p>
          </div>
          <h3 className="mt-4 text-lg font-medium text-ink">
            Get the React code
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Ask Claude for a finished UI component. Copy this exclusive pricing
            board example—or paste it straight into the form above.
          </p>

          <pre className="mt-4 max-h-40 overflow-hidden rounded-xl border border-line bg-code-bg p-3 font-mono text-[10px] leading-relaxed text-muted">
            {CLAUDE_EXAMPLE_COMPONENT.slice(0, 420)}…
          </pre>

          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            <button
              type="button"
              onClick={() => void copyExample()}
              className="inline-flex items-center gap-1.5 border border-line bg-surface px-3 py-2 text-xs font-medium text-ink transition hover:border-ink"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <ClipboardCopy className="h-3.5 w-3.5" />
              )}
              {copied ? 'Copied' : 'Copy code'}
            </button>
            <button
              type="button"
              onClick={pasteIntoForm}
              className="inline-flex items-center gap-1.5 bg-accent px-3 py-2 text-xs font-medium text-accent-fg transition hover:opacity-90"
            >
              Paste into form
            </button>
          </div>
        </article>

        {/* Card 2 — Repo + GitHub */}
        <article className="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-2 text-ink">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted">
              <Github className="h-4 w-4" />
            </span>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Step 2
            </p>
          </div>
          <h3 className="mt-4 text-lg font-medium text-ink">
            Put code · get a repository
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Drop the component into RepCN, pick Next.js / Vite / TanStack, preview
            the file tree, download a ZIP, then push a real GitHub repo.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li className="flex gap-2 border-b border-line/80 py-2">
              <span className="font-mono text-ink">01</span>
              Paste React + instructions
            </li>
            <li className="flex gap-2 border-b border-line/80 py-2">
              <span className="font-mono text-ink">02</span>
              Preview repository tree & source
            </li>
            <li className="flex gap-2 border-b border-line/80 py-2">
              <span className="font-mono text-ink">03</span>
              Push to GitHub with one click
            </li>
          </ul>

          <p className="mt-auto pt-4 text-xs text-muted">
            Connect your GitHub token above so “Push to GitHub” can create the repo.
          </p>
        </article>

        {/* Card 3 — Deploy & share */}
        <article className="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-2 text-ink">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted">
              <Share2 className="h-4 w-4" />
            </span>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Step 3
            </p>
          </div>
          <h3 className="mt-4 text-lg font-medium text-ink">
            Deploy to a URL & share
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Deploy the generated app to Vercel, grab the live URL, and share it
            with teammates, clients, or socials—no local setup required.
          </p>

          <div className="mt-4 rounded-xl border border-line bg-surface-muted/60 px-3 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Example share link
            </p>
            <p className="mt-1 flex items-center gap-2 font-mono text-xs text-ink">
              <Triangle className="h-3.5 w-3.5 shrink-0" />
              https://your-app.vercel.app
            </p>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>· One-click Deploy to Vercel</li>
            <li>· Open the live inspector URL</li>
            <li>· Send the link—code lives on GitHub</li>
          </ul>

          <p className="mt-auto pt-4 text-xs text-muted">
            Connect Vercel above, then use Deploy after you have a preview or repo.
          </p>
        </article>
      </div>
    </section>
  )
}
