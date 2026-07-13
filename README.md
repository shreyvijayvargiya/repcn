# RepCN

**Open-source** repository builder: paste a React component, add instructions, preview the generated Next.js app, download a ZIP, push to GitHub, and deploy to Vercel.

Repository: [github.com/shreyvijayvargiya/repcn](https://github.com/shreyvijayvargiya/repcn)

Live: [repcn.vercel.app](https://repcn.vercel.app)

## Features

- Paste React component code + optional instructions
- Choose framework: **Next.js**, **Vite**, or **TanStack** (radios + package versions)
- Instant local preview of the generated file tree and source
- Download the repo as a ZIP
- Connect GitHub / Vercel tokens (stored in httpOnly cookies)
- Push a new GitHub repository and deploy to Vercel
- Light / dark theme

## Stack

- Next.js 15 + React 19
- Tailwind CSS
- Sonner (toasts)
- Lucide React (icons)
- JSZip (ZIP download)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Connect GitHub & Vercel

1. Create a [GitHub personal access token](https://github.com/settings/tokens) with `repo` scope.
2. Create a [Vercel token](https://vercel.com/account/tokens).
3. Paste them in the **Connect GitHub & Vercel** section on the home page.

Tokens are stored in httpOnly cookies for your browser session (30 days). You can also set `GITHUB_TOKEN`, `VERCEL_TOKEN`, and optional `VERCEL_TEAM_ID` as environment variables on the server.

## Contributing

Issues and pull requests are welcome. This project is open source under the repository at [github.com/shreyvijayvargiya/repcn](https://github.com/shreyvijayvargiya/repcn).

## License

See the repository for license details. Contributions are assumed to be under the same terms as the project.
