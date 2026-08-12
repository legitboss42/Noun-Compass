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
Supabase roles. It covers users, roles, memberships, payments, AI-practice
operations, filesystem article validation, support, analytics, settings,
schedules, and audit history. `/admin/question-coverage` shows sanitised
private-engine course readiness without exposing crawler payloads or
third-party content. Privileged operations remain server-only and
permission-checked.

See [docs/admin-dashboard.md](docs/admin-dashboard.md) for the route map,
permission matrix, environment variables, migrations, bootstrap process,
operational procedures, deployment checklist, and rollback guidance.

## Content

The repository currently contains exactly 59 article URLs under
`content/articles`. Their search intent, cluster, editorial decision, source
evidence, indexability, and readiness state are tracked in
`lib/editorial-dispositions.ts`. Article routes and sitemap entries follow that
manifest.

Do not treat a frontmatter `updatedAt` value as proof of a current source
review. Public last-checked and structured-data dates are emitted only after a
verified review date is recorded in the manifest. See `docs/README.md` before
using an older audit or completion report as evidence of current production
state.

## Important

NOUN Compass is independent and is not affiliated with, endorsed by, or officially connected to the National Open University of Nigeria. Critical academic, payment, admission, and deadline information must be confirmed through official NOUN channels.
