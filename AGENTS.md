# Agent contribution guide

Documentation is a required part of every change in this repository.

- Read `CLAUDE.md` and `CONTRIBUTING.md` before editing.
- When behavior, routes, APIs, configuration, architecture or workflow changes, update the relevant README, `/docs` page, specification or architecture note in the same pull request.
- Run `npm run build`, `npm test` and `npm run lint` for application changes.
- Include `Documentation: updated` (with paths) or `Documentation: not affected` (with a reason) in the pull request description.
- Work from a feature branch and target `master`; never push directly to `master`.

