import type { RepoFile } from '@/lib/github'
import type { FrameworkId, LanguageId, PackageEntry } from '@/lib/frameworks'

export const SHADCN_PACKAGES: PackageEntry[] = [
  { name: 'class-variance-authority', version: '^0.7.1', kind: 'dependency' },
  { name: 'clsx', version: '^2.1.1', kind: 'dependency' },
  { name: 'tailwind-merge', version: '^2.6.0', kind: 'dependency' },
  { name: 'lucide-react', version: '^0.468.0', kind: 'dependency' },
  { name: '@radix-ui/react-slot', version: '^1.1.1', kind: 'dependency' },
  { name: 'tailwindcss-animate', version: '^1.0.7', kind: 'devDependency' },
]

export function mergeShadcnPackages(
  base: PackageEntry[],
  enabled: boolean
): PackageEntry[] {
  if (!enabled) return base
  const names = new Set(base.map((p) => p.name))
  const extra = SHADCN_PACKAGES.filter((p) => !names.has(p.name))
  return [...base, ...extra]
}

function componentExt(language: LanguageId) {
  return language === 'js' ? 'jsx' : 'tsx'
}

function scriptExt(language: LanguageId) {
  return language === 'js' ? 'js' : 'ts'
}

/** Project-relative paths depending on framework layout. */
export function shadcnPaths(framework: FrameworkId) {
  const nested = framework !== 'nextjs'
  return {
    utilsDir: nested ? 'src/lib' : 'lib',
    uiDir: nested ? 'src/components/ui' : 'components/ui',
    cssPath: nested ? 'src/index.css' : 'app/globals.css',
    utilsImport: '@/lib/utils',
    componentsAlias: nested ? '@/components' : '@/components',
    rsc: framework === 'nextjs',
    tailwindConfigBase: 'tailwind.config',
  }
}

export function shadcnCss(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply min-h-screen bg-background text-foreground antialiased;
  }
}
`
}

export function shadcnTailwindConfig(
  language: LanguageId,
  contentGlobs: string[]
): RepoFile {
  const path =
    language === 'js' ? 'tailwind.config.js' : 'tailwind.config.ts'

  if (language === 'js') {
    return {
      path,
      content: `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ${JSON.stringify(contentGlobs, null, 2)},
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
`,
    }
  }

  return {
    path,
    content: `import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: ${JSON.stringify(contentGlobs, null, 2)},
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
    },
  },
  plugins: [animate],
}

export default config
`,
  }
}

function utilsFile(language: LanguageId, utilsDir: string): RepoFile {
  const ext = scriptExt(language)
  if (language === 'ts') {
    return {
      path: `${utilsDir}/utils.${ext}`,
      content: `import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`,
    }
  }
  return {
    path: `${utilsDir}/utils.${ext}`,
    content: `import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
`,
  }
}

function buttonFile(language: LanguageId, uiDir: string): RepoFile {
  const ext = componentExt(language)
  if (language === 'ts') {
    return {
      path: `${uiDir}/button.${ext}`,
      content: `import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
`,
    }
  }

  return {
    path: `${uiDir}/button.${ext}`,
    content: `import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
`,
  }
}

function inputFile(language: LanguageId, uiDir: string): RepoFile {
  const ext = componentExt(language)
  if (language === 'ts') {
    return {
      path: `${uiDir}/input.${ext}`,
      content: `import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
`,
    }
  }

  return {
    path: `${uiDir}/input.${ext}`,
    content: `import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
`,
  }
}

/** Demo strip using Button + Input so the scaffold feels usable immediately. */
export function shadcnDemoImports(): string {
  return `import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'`
}

export function shadcnDemoComponent(): string {
  return `function ShadcnStarter() {
  return (
    <div className="mb-8 space-y-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <p className="text-sm font-medium">shadcn/ui starter</p>
      <p className="text-sm text-muted-foreground">
        Button and Input are included by default. Add more with the shadcn CLI.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input placeholder="Type something…" className="sm:max-w-xs" />
        <Button type="button">Continue</Button>
        <Button type="button" variant="outline">
          Secondary
        </Button>
      </div>
    </div>
  )
}
`
}

/** @deprecated use shadcnDemoImports + shadcnDemoComponent */
export function shadcnDemoBlock(_language: LanguageId): string {
  return `${shadcnDemoImports()}

${shadcnDemoComponent()}`
}

export function generateShadcnFiles(input: {
  framework: FrameworkId
  language: LanguageId
  contentGlobs: string[]
}): RepoFile[] {
  const paths = shadcnPaths(input.framework)
  const twConfig =
    input.language === 'js' ? 'tailwind.config.js' : 'tailwind.config.ts'

  const componentsJson: RepoFile = {
    path: 'components.json',
    content:
      JSON.stringify(
        {
          $schema: 'https://ui.shadcn.com/schema.json',
          style: 'new-york',
          rsc: paths.rsc,
          tsx: input.language === 'ts',
          tailwind: {
            config: twConfig,
            css: paths.cssPath,
            baseColor: 'zinc',
            cssVariables: true,
          },
          aliases: {
            components: '@/components',
            utils: '@/lib/utils',
            ui: '@/components/ui',
            lib: '@/lib',
            hooks: '@/hooks',
          },
          iconLibrary: 'lucide',
        },
        null,
        2
      ) + '\n',
  }

  return [
    componentsJson,
    shadcnTailwindConfig(input.language, input.contentGlobs),
    {
      path: paths.cssPath,
      content: shadcnCss(),
    },
    utilsFile(input.language, paths.utilsDir),
    buttonFile(input.language, paths.uiDir),
    inputFile(input.language, paths.uiDir),
  ]
}
