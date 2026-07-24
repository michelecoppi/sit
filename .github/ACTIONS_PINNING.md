# GitHub Actions pinning policy

All third-party actions and reusable workflows must use a full 40-character commit SHA. Branches and tags are mutable and must not be used as executable references.

Keep the upstream release or branch in an inline comment so reviewers and dependency tooling can identify the intended update channel:

```yaml
- uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
```

## Updating a pinned action

1. Choose the upstream release tag to adopt and review its release notes.
2. Resolve the tag to its commit SHA with the GitHub API:

   ```bash
   gh api repos/actions/checkout/commits/v4 --jq .sha
   ```

3. Verify the returned commit in the upstream repository and confirm that it belongs to the intended release.
4. Replace the existing reference with the full 40-character SHA. Keep the release tag in the inline comment.
5. Search every workflow for unpinned references:

   ```bash
   grep -RInE 'uses:.*@(main|master|v[0-9]+([^0-9a-f]|$))' .github/workflows
   ```

   The command must return no matches.
6. Validate the workflow syntax with `actionlint` when available, then open a pull request and require the normal CI and CodeQL checks to pass.

The same policy applies to reusable workflows, including workflows maintained in repositories owned by this project.
