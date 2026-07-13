export type FrameworkId = 'nextjs' | 'vite' | 'tanstack'
export type LanguageId = 'ts' | 'js'

export type PackageEntry = {
  name: string
  version: string
  kind: 'dependency' | 'devDependency'
  /** When set, package is only included for that language. */
  languages?: LanguageId[]
}

export type FrameworkMeta = {
  id: FrameworkId
  label: string
  shortLabel: string
  description: string
  /** What repository scaffolding will be created */
  creates: string[]
  runCommand: string
  /** Static package versions shown in the UI */
  packages: PackageEntry[]
  /** Framework-specific notes shown above the instructions field */
  guide: string[]
}

export const FRAMEWORKS: FrameworkMeta[] = [
  {
    id: 'nextjs',
    label: 'Next.js',
    shortLabel: 'Next.js',
    description:
      'App Router Next.js app with React 19, TypeScript or JavaScript, and Tailwind CSS.',
    creates: [
      'Next.js App Router project (`app/`, `components/`)',
      'TypeScript or JavaScript + Tailwind + PostCSS config',
      'Your React component mounted on the home page',
      'Ready for `npm run dev`, Vercel deploy, and GitHub push',
    ],
    runCommand: 'npm install && npm run dev',
    packages: [
      { name: 'next', version: '^15.1.0', kind: 'dependency' },
      { name: 'react', version: '^19.0.0', kind: 'dependency' },
      { name: 'react-dom', version: '^19.0.0', kind: 'dependency' },
      { name: 'sonner', version: '^1.7.0', kind: 'dependency' },
      { name: 'lucide-react', version: '^0.468.0', kind: 'dependency' },
      { name: 'typescript', version: '^5.7.0', kind: 'devDependency', languages: ['ts'] },
      { name: '@types/react', version: '^19.0.0', kind: 'devDependency', languages: ['ts'] },
      { name: '@types/react-dom', version: '^19.0.0', kind: 'devDependency', languages: ['ts'] },
      { name: '@types/node', version: '^22.0.0', kind: 'devDependency', languages: ['ts'] },
      { name: 'eslint', version: '^9.17.0', kind: 'devDependency', languages: ['js'] },
      { name: 'tailwindcss', version: '^3.4.16', kind: 'devDependency' },
      { name: 'postcss', version: '^8.4.49', kind: 'devDependency' },
      { name: 'autoprefixer', version: '^10.4.20', kind: 'devDependency' },
    ],
    guide: [
      'Uses Next.js 15 App Router with React Server Components layout.',
      'Your component is placed in `components/` and imported from `app/page`.',
      'Pick TypeScript (`.tsx`) or JavaScript (`.jsx`) before generating.',
      'Deploy targets Vercel with framework preset `nextjs`.',
    ],
  },
  {
    id: 'vite',
    label: 'Vite',
    shortLabel: 'Vite',
    description:
      'Vite + React 19 SPA with TypeScript or JavaScript and Tailwind CSS.',
    creates: [
      'Vite React app (`src/`)',
      'Vite config + Tailwind + PostCSS',
      'Your React component rendered from `src/App`',
      'Scripts: `dev`, `build`, `preview`',
    ],
    runCommand: 'npm install && npm run dev',
    packages: [
      { name: 'react', version: '^19.0.0', kind: 'dependency' },
      { name: 'react-dom', version: '^19.0.0', kind: 'dependency' },
      { name: 'vite', version: '^6.0.0', kind: 'devDependency' },
      { name: '@vitejs/plugin-react', version: '^4.3.4', kind: 'devDependency' },
      { name: 'typescript', version: '^5.7.0', kind: 'devDependency', languages: ['ts'] },
      { name: '@types/react', version: '^19.0.0', kind: 'devDependency', languages: ['ts'] },
      { name: '@types/react-dom', version: '^19.0.0', kind: 'devDependency', languages: ['ts'] },
      { name: 'tailwindcss', version: '^3.4.16', kind: 'devDependency' },
      { name: 'postcss', version: '^8.4.49', kind: 'devDependency' },
      { name: 'autoprefixer', version: '^10.4.20', kind: 'devDependency' },
    ],
    guide: [
      'Client-side SPA powered by Vite 6 and React 19.',
      'Entry is `index.html` → `src/main` → your component.',
      'Choose `.tsx`/`.ts` or `.jsx`/`.js` for the whole scaffold.',
      'Best for dashboards and interactive UIs without server routes.',
    ],
  },
  {
    id: 'tanstack',
    label: 'TanStack',
    shortLabel: 'TanStack',
    description:
      'Vite + TanStack Router + React Query with TypeScript or JavaScript.',
    creates: [
      'Vite app with file-based TanStack Router (`src/routes/`)',
      'TanStack Query provider wired in the root route',
      'Your React component on the index route',
      'Tailwind scaffolding with JS or TS file extensions',
    ],
    runCommand: 'npm install && npm run dev',
    packages: [
      { name: 'react', version: '^19.0.0', kind: 'dependency' },
      { name: 'react-dom', version: '^19.0.0', kind: 'dependency' },
      { name: '@tanstack/react-router', version: '^1.95.0', kind: 'dependency' },
      { name: '@tanstack/react-query', version: '^5.62.0', kind: 'dependency' },
      { name: 'vite', version: '^6.0.0', kind: 'devDependency' },
      { name: '@vitejs/plugin-react', version: '^4.3.4', kind: 'devDependency' },
      { name: '@tanstack/router-plugin', version: '^1.95.0', kind: 'devDependency' },
      { name: 'typescript', version: '^5.7.0', kind: 'devDependency', languages: ['ts'] },
      { name: '@types/react', version: '^19.0.0', kind: 'devDependency', languages: ['ts'] },
      { name: '@types/react-dom', version: '^19.0.0', kind: 'devDependency', languages: ['ts'] },
      { name: 'tailwindcss', version: '^3.4.16', kind: 'devDependency' },
      { name: 'postcss', version: '^8.4.49', kind: 'devDependency' },
      { name: 'autoprefixer', version: '^10.4.20', kind: 'devDependency' },
    ],
    guide: [
      'Uses TanStack Router for client routing and React Query for data.',
      'Your component mounts on the `/` index route under `src/routes/`.',
      'File extensions follow your JS or TS choice across routes and components.',
      'Same Vite toolchain as the Vite option, with router + query baked in.',
    ],
  },
]

export const LANGUAGES: { id: LanguageId; label: string; extensions: string }[] = [
  { id: 'ts', label: 'TypeScript', extensions: '.ts / .tsx' },
  { id: 'js', label: 'JavaScript', extensions: '.js / .jsx' },
]

export function getFramework(id: FrameworkId): FrameworkMeta {
  return FRAMEWORKS.find((f) => f.id === id) || FRAMEWORKS[0]
}

export function isFrameworkId(value: unknown): value is FrameworkId {
  return value === 'nextjs' || value === 'vite' || value === 'tanstack'
}

export function isLanguageId(value: unknown): value is LanguageId {
  return value === 'ts' || value === 'js'
}

export function packagesForLanguage(
  packages: PackageEntry[],
  language: LanguageId
) {
  return packages.filter(
    (p) => !p.languages || p.languages.includes(language)
  )
}

export function packagesToRecord(
  packages: PackageEntry[],
  kind: PackageEntry['kind'],
  language: LanguageId = 'ts'
) {
  return Object.fromEntries(
    packagesForLanguage(packages, language)
      .filter((p) => p.kind === kind)
      .map((p) => [p.name, p.version])
  )
}
