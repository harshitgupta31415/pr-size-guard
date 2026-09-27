# Contributing to PR Size Guard

Contributions that make pull-request sizing clearer, quieter, or easier to adopt are welcome.

## Local checks

```bash
npm test
npm run check
```

Keep the action zero-dependency and compatible with the Node runtime declared in `action.yml`. Behaviour changes need tests for boundary values and invalid input. Do not introduce pull-request comments or write permissions without discussing the security and notification impact first.

When an input or output changes, update `action.yml`, the README example, and tests in the same pull request. Major behavioural changes require a new release tag rather than moving an incompatible `v1` contract.
