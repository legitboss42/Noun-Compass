# NOUN Compass

NOUN Compass is an independent, utility-first educational resource for National Open University of Nigeria students.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Filesystem MDX with `gray-matter` and `next-mdx-remote`
- Static generation for pages and articles

## Local development

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run lint
npx tsc --noEmit
npm run test:platform
npm run build
```

## Administration dashboard

The production operations dashboard is available under `/admin` for authorised
Supabase roles. It covers users, roles, memberships, payments, question banks,
filesystem article validation, support, analytics, settings, schedules, and
audit history. Privileged operations remain server-only and permission-checked.

See [docs/admin-dashboard.md](docs/admin-dashboard.md) for the route map,
permission matrix, environment variables, migrations, bootstrap process,
operational procedures, deployment checklist, and rollback guidance.

## Content

Add launch guides to `content/articles` using the existing frontmatter format. Article routes, category archives, related reads, metadata, and sitemap entries are generated from those files.

## Important

NOUN Compass is independent and is not affiliated with, endorsed by, or officially connected to the National Open University of Nigeria. Critical academic, payment, admission, and deadline information must be confirmed through official NOUN channels.
