const BANDS = [
  { maximum: 100, label: "small" },
  { maximum: 400, label: "medium" },
  { maximum: 1000, label: "large" },
  { maximum: Number.POSITIVE_INFINITY, label: "oversized" },
];

export function parsePositiveInteger(value, name) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

export function evaluatePullRequest(pullRequest, options) {
  const additions = Number(pullRequest?.additions ?? 0);
  const deletions = Number(pullRequest?.deletions ?? 0);
  const changedFiles = Number(pullRequest?.changed_files ?? 0);
  const changedLines = additions + deletions;
  const softLimit = parsePositiveInteger(options.softLimit, "soft-limit");
  const hardLimit = parsePositiveInteger(options.hardLimit, "hard-limit");

  if (hardLimit < softLimit) {
    throw new Error("hard-limit must be greater than or equal to soft-limit");
  }

  const status = changedLines > hardLimit ? "fail" : changedLines > softLimit ? "warn" : "pass";
  const size = BANDS.find((band) => changedLines <= band.maximum).label;
  return { additions, deletions, changedFiles, changedLines, size, status, softLimit, hardLimit };
}

export function markdownSummary(result) {
  const icon = result.status === "pass" ? "✅" : result.status === "warn" ? "⚠️" : "❌";
  return [
    `## ${icon} PR Size Guard`,
    "",
    "| Metric | Value |",
    "| --- | ---: |",
    `| Additions | ${result.additions} |`,
    `| Deletions | ${result.deletions} |`,
    `| Changed lines | **${result.changedLines}** |`,
    `| Changed files | ${result.changedFiles} |`,
    `| Size | ${result.size} |`,
    `| Result | ${result.status} |`,
    "",
    `Soft limit: ${result.softLimit} · Hard limit: ${result.hardLimit}`,
    "",
  ].join("\n");
}
