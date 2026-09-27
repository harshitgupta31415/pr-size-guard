# PR Size Guard

A zero-dependency GitHub Action that keeps pull requests small enough to review
well.

It reads GitHub's pull-request event payload, reports additions, deletions, and
changed files in the job summary, and applies configurable soft and hard limits.
No API token or write permission is required.

## Use it

Create `.github/workflows/pr-size.yml`:

```yaml
name: PR size

on:
  pull_request:

permissions:
  contents: read

jobs:
  guard:
    runs-on: ubuntu-latest
    steps:
      - uses: harshitgupta31415/pr-size-guard@v1
        with:
          soft-limit: 400
          hard-limit: 1000
```

The action:

- passes at or below the soft limit;
- emits a warning above the soft limit;
- fails above the hard limit by default;
- writes a compact table to the GitHub Actions job summary;
- exposes `changed-lines`, `size`, and `status` outputs.

## Report without failing

```yaml
- uses: harshitgupta31415/pr-size-guard@v1
  with:
    hard-limit: 1500
    fail-on-hard-limit: false
```

This is useful when introducing the action to an existing repository before
making the check required.

## Design choices

- **No comments:** the action does not add noisy bot comments to a pull request.
- **No token:** it uses the event payload and needs only `contents: read`.
- **Lines, not files:** a one-file rewrite can still be difficult to review.
- **Config errors fail clearly:** invalid or inverted thresholds stop the job.

## Development

```bash
npm test
npm run check
```

## License

MIT
