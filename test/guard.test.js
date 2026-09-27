import test from "node:test";
import assert from "node:assert/strict";
import { evaluatePullRequest, markdownSummary, parsePositiveInteger } from "../src/guard.js";

test("passes a focused pull request", () => {
  const result = evaluatePullRequest(
    { additions: 120, deletions: 30, changed_files: 4 },
    { softLimit: 400, hardLimit: 1000 },
  );
  assert.equal(result.changedLines, 150);
  assert.equal(result.status, "pass");
  assert.equal(result.size, "medium");
});

test("warns above the soft limit", () => {
  const result = evaluatePullRequest(
    { additions: 401, deletions: 0, changed_files: 10 },
    { softLimit: "400", hardLimit: "1000" },
  );
  assert.equal(result.status, "warn");
});

test("fails above the hard limit", () => {
  const result = evaluatePullRequest(
    { additions: 800, deletions: 250, changed_files: 20 },
    { softLimit: 400, hardLimit: 1000 },
  );
  assert.equal(result.status, "fail");
  assert.match(markdownSummary(result), /1,?050|1050/);
});

test("validates configuration", () => {
  assert.throws(() => parsePositiveInteger("zero", "soft-limit"), /positive integer/);
  assert.throws(
    () => evaluatePullRequest({}, { softLimit: 500, hardLimit: 100 }),
    /hard-limit/,
  );
});
