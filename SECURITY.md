# Security policy

Security fixes target the current `v1` contract and the default branch.

Use GitHub's private vulnerability reporting for event-payload injection, unexpected file or network access, permission escalation, or unsafe workflow-summary output. Include a redacted event payload and the workflow inputs needed to reproduce the issue.

The action is designed to operate without a GitHub token and with `contents: read`. A change that requires broader permissions must receive explicit security review.
