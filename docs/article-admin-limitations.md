# Article administration limitations

## Current publishing model

NounCompass articles are MDX files stored in `content/articles` and compiled
from the Git repository during the Next.js build. The admin article inventory
reads those source files and validates their frontmatter, images, publication
state, and related-article references.

## Why the admin does not edit MDX in production

Vercel and similar serverless hosts do not provide a durable writable project
filesystem. A browser editor that writes an MDX file at runtime could appear to
save successfully inside one function instance, then lose that change when the
instance is replaced. It would also bypass normal source review and deployment
history.

For that reason, `/admin/articles` deliberately provides inspection, preview,
validation, and local file-path tools instead of a misleading database editor.

## Recommended editorial workflow

The durable next step is a GitHub-backed workflow:

1. An authorised editor submits a change from the admin interface.
2. A server-only GitHub integration creates a branch and commits the MDX file.
3. The integration opens a pull request with the validation results.
4. A reviewer approves and merges the pull request.
5. The normal production deployment publishes the article.

The integration should use a narrowly scoped GitHub App, enforce repository
path allowlists, validate frontmatter and MDX before creating a pull request,
and never expose repository credentials to the browser.

Until that workflow is added, article changes must be made in the repository,
reviewed, committed, and deployed through the normal release process.
