import { appendFile, readFile } from "node:fs/promises";
import process from "node:process";
import { evaluatePullRequest, markdownSummary } from "./guard.js";

function input(name, fallback) {
  const environmentName = `INPUT_${name.replaceAll("-", "_").toUpperCase()}`;
  return process.env[environmentName] || fallback;
}

async function appendCommandFile(path, content) {
  if (path) await appendFile(path, `${content}\n`, "utf8");
}

async function setOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) await appendCommandFile(outputPath, `${name}=${value}`);
  else console.log(`${name}=${value}`);
}

async function run() {
  if (!process.env.GITHUB_EVENT_PATH) {
    throw new Error("GITHUB_EVENT_PATH is unavailable; this action must run on pull_request events");
  }
  const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8"));
  if (!event.pull_request) {
    throw new Error("the event payload does not contain a pull_request");
  }

  const result = evaluatePullRequest(event.pull_request, {
    softLimit: input("soft-limit", "400"),
    hardLimit: input("hard-limit", "1000"),
  });

  await Promise.all([
    setOutput("changed-lines", result.changedLines),
    setOutput("size", result.size),
    setOutput("status", result.status),
    appendCommandFile(process.env.GITHUB_STEP_SUMMARY, markdownSummary(result)),
  ]);

  if (result.status === "warn") {
    console.log(`::warning title=Large pull request::${result.changedLines} changed lines exceed the soft limit of ${result.softLimit}.`);
  }
  if (result.status === "fail") {
    const message = `${result.changedLines} changed lines exceed the hard limit of ${result.hardLimit}.`;
    const shouldFail = input("fail-on-hard-limit", "true").toLowerCase() === "true";
    console.log(`::${shouldFail ? "error" : "warning"} title=Oversized pull request::${message}`);
    if (shouldFail) process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(`::error title=PR Size Guard failed::${error.message}`);
  process.exitCode = 1;
});
