# Releasing

This file is for maintainers.

## Before You Release

1. Make sure the working tree is clean.
2. Update `package.json` with the new version.
3. Update [`CHANGELOG.md`](./CHANGELOG.md).
4. Run:

```bash
npm install
npm --prefix demo install
npm run verify
```

## Publish Flow

This repository uses:

- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) for verification
- [`.github/workflows/publish.yml`](./.github/workflows/publish.yml) for npm publishing

The publish workflow is set up for npm trusted publishing and runs after a successful release-triggered CI run.

## Release Steps

1. Merge release-ready changes to `main`.
2. Create and publish a GitHub release.
3. Let GitHub Actions publish the package to npm.
4. Confirm the new version is live on npm.

## Eleventy Plugin Directory

After the npm release is live, open a pull request against `11ty/11ty-website` and add:

- [`contrib/11ty-website/eleventy-plugin-mastodon-share.json`](./contrib/11ty-website/eleventy-plugin-mastodon-share.json)

You can use:

- [`contrib/11ty-website/pull-request.md`](./contrib/11ty-website/pull-request.md)

as the starting point for the PR description.

## Current Release Draft

The current GitHub release notes draft lives at:

- [`releases/v0.2.0.md`](./releases/v0.2.0.md)
