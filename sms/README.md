This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## TypeScript, ESLint, Prettier, and Pre-Commit Hooks

### Why strict TypeScript reduces runtime bugs

This project enables strict TypeScript checks in [tsconfig.json](tsconfig.json), including:

- `strict` + `noImplicitAny`: catches missing/unsafe types early, preventing `any` from silently spreading through the codebase.
- `noUnusedLocals` + `noUnusedParameters`: keeps dead code out of production and avoids misleading “unused” logic during refactors.
- `forceConsistentCasingInFileNames`: prevents Windows/macOS casing differences from breaking builds in CI/Linux.
- `skipLibCheck`: speeds up builds by skipping type-checking of external `.d.ts` files.

### What ESLint + Prettier enforce

Linting and formatting are enforced via [eslint.config.mjs](eslint.config.mjs) and [.prettierrc](.prettierrc):

- ESLint uses `next/core-web-vitals` + Next.js TypeScript rules.
- `no-console`: warns on stray debugging logs.
- `semi` and `quotes`: enforces semicolons and double quotes.
- Prettier is wired into ESLint (`prettier/prettier`) to keep formatting consistent.

Useful commands:

- `npm run lint`
- `npm run format`

> Note: This repo uses ESLint v9 (Next.js 16 default), which uses the newer **flat config** format (`eslint.config.mjs`).
> For assignment deliverables, an equivalent legacy config is also provided in [.eslintrc.json](.eslintrc.json).

### How pre-commit hooks improve team consistency

Husky + lint-staged run on every commit, so code is automatically fixed/blocked before it reaches the repo:

- Staged `*.{ts,tsx,js,jsx}` files run `eslint --fix` and `prettier --write`.
- This reduces code review noise and avoids “it works on my machine” style formatting differences.

Hook configuration:

- lint-staged is configured in [package.json](package.json)
- the pre-commit hook is in [.husky/pre-commit](.husky/pre-commit)

### Proof / logs

Paste a screenshot or logs here showing:

- `npm run lint` passing
- a commit attempt being blocked/fixed by the pre-commit hook

Example lint run output:

```bash
$ npm run lint

> sms@0.1.0 lint
> eslint .
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
