#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));

const DECIMAL = "(?:0|[1-9]\\d*)";
const WORK_BRANCH_PATTERN = new RegExp(
  `^(feat|fix|docs|refactor|test|perf|build|ci|chore)\\/(m${DECIMAL}-${DECIMAL}|bug-${DECIMAL}|ops-${DECIMAL}|chore-${DECIMAL}|spike-${DECIMAL})-[a-z0-9]+(?:-[a-z0-9]+)*$`,
);
const RELEASE_BRANCH_PATTERN = new RegExp(
  `^release\\/v${DECIMAL}\\.${DECIMAL}\\.${DECIMAL}$`,
);
const HOTFIX_BRANCH_PATTERN = new RegExp(
  `^hotfix\\/v${DECIMAL}\\.${DECIMAL}\\.${DECIMAL}-[a-z0-9]+(?:-[a-z0-9]+)*$`,
);
const RELEASE_TAG_PATTERN = new RegExp(
  `^v(?<version>${DECIMAL}\\.${DECIMAL}\\.${DECIMAL}(?:-rc\\.(?<rc>${DECIMAL}))?)$`,
);
const COMMIT_HEADER_PATTERN =
  /^(?<type>feat|fix|docs|refactor|perf|test|build|ci|chore|revert)(?:\((?<scope>[a-z0-9][a-z0-9-]*)\))?(?<breaking>!)?: (?<subject>.+)$/;
const HOST_MERGE_PATTERNS = [
  /^Merge pull request #\d+ from \S+$/,
  /^Merge branch '[^']+'(?: into \S+)?$/,
];
const AUTOMATIC_REVERT_PATTERN = /^Revert ".+"$/;

class ConventionError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConventionError";
  }
}

function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function validateBranchName(branchName) {
  if (branchName === "master") return;
  if (WORK_BRANCH_PATTERN.test(branchName)) {
    const taskToken = branchName.split("/", 2)[1].split("-", 2).join("-");
    if (taskToken.startsWith("m")) {
      const [stage] = taskToken.slice(1).split("-");
      const taskReadme = readFileSync(
        new URL("../docs/tasks/README.md", import.meta.url),
        "utf8",
      );
      const stageSection =
        taskReadme
          .split(/^## /m)
          .find((section) => section.startsWith("阶段定义")) ?? "";
      if (!new RegExp(`^- M${stage}[：:]`, "m").test(stageSection)) {
        throw new ConventionError(
          `分支对应的 M${stage} 阶段尚未在 docs/tasks/README.md 声明整体目标。`,
        );
      }
    }
    return;
  }
  if (RELEASE_BRANCH_PATTERN.test(branchName)) return;
  if (HOTFIX_BRANCH_PATTERN.test(branchName)) return;

  throw new ConventionError(
    `分支名不符合规范：${branchName}\n` +
      "使用 <type>/<task-id>-<slug>、release/vX.Y.Z 或 hotfix/vX.Y.Z-<slug>。",
  );
}

export function validateCommitHeader(header) {
  if (HOST_MERGE_PATTERNS.some((pattern) => pattern.test(header))) return;
  if (AUTOMATIC_REVERT_PATTERN.test(header)) return;
  if (header.length > 100) {
    throw new ConventionError("提交标题不能超过 100 个字符。");
  }

  const match = COMMIT_HEADER_PATTERN.exec(header);
  if (!match?.groups) {
    throw new ConventionError(
      `提交标题不符合 Conventional Commits：${header}`,
    );
  }

  const subject = match.groups.subject.trim();
  if (subject.length === 0 || subject.length > 72) {
    throw new ConventionError("提交 subject 必须为 1 至 72 个字符。");
  }
  if (!/^[a-z0-9]/.test(subject)) {
    throw new ConventionError("提交 subject 必须以小写英文字母或数字开头。");
  }
  if (/[.!?。！？]$/.test(subject)) {
    throw new ConventionError("提交 subject 末尾不能使用句号、问号或感叹号。");
  }
  if (!/^[\x20-\x7e]+$/.test(subject)) {
    throw new ConventionError("提交 subject 只能使用可打印 ASCII 字符。");
  }
}

export function validateCommitMessage(message) {
  const normalized = message.replace(/\r\n/g, "\n").trim();
  const [header] = normalized.split("\n", 1);
  validateCommitHeader(header);

  const match = COMMIT_HEADER_PATTERN.exec(header);
  if (match?.groups?.breaking && !/^BREAKING CHANGE: .+/m.test(normalized)) {
    throw new ConventionError(
      "使用 ! 标记破坏性变化时，提交正文必须包含 BREAKING CHANGE: footer。",
    );
  }
}

export function parseReleaseTag(tag) {
  const match = RELEASE_TAG_PATTERN.exec(tag);
  if (!match?.groups) {
    throw new ConventionError(
      `发布标签不符合规范：${tag}。使用 vX.Y.Z 或 vX.Y.Z-rc.N。`,
    );
  }
  if (match.groups.rc !== undefined && Number(match.groups.rc) < 1) {
    throw new ConventionError("RC 序号必须从 1 开始。");
  }
  return {
    version: match.groups.version,
    prerelease: match.groups.rc !== undefined,
  };
}

function currentBranch() {
  const branchName = git(["branch", "--show-current"]);
  if (!branchName) {
    throw new ConventionError("当前处于 detached HEAD，无法检查普通分支名。");
  }
  return branchName;
}

function commitsInRange(range) {
  const output = git(["log", "--format=%H%n%B%x00", range]);
  if (!output) return [];

  return output
    .split("\0")
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash, ...messageLines] = record.split(/\r?\n/);
      return { hash, message: messageLines.join("\n").trim() };
    });
}

function validateCommitRange(range) {
  const commits = commitsInRange(range);
  for (const commit of commits) {
    try {
      validateCommitMessage(commit.message);
    } catch (error) {
      if (error instanceof ConventionError) {
        throw new ConventionError(`${commit.hash.slice(0, 12)}：${error.message}`);
      }
      throw error;
    }
  }
  process.stdout.write(`已检查 ${commits.length} 个提交。\n`);
}

function refExists(ref) {
  try {
    git(["show-ref", "--verify", "--quiet", ref]);
    return true;
  } catch {
    return false;
  }
}

function isAncestor(commit, ref) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", commit, ref], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function validateRelease(tag) {
  const release = parseReleaseTag(tag);
  const packageJson = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  if (packageJson.version !== release.version) {
    throw new ConventionError(
      `package.json 版本 ${packageJson.version} 与标签 ${tag} 不一致。`,
    );
  }

  const tagRef = `refs/tags/${tag}`;
  if (!refExists(tagRef)) {
    throw new ConventionError(`本地不存在标签 ${tag}。`);
  }
  if (git(["cat-file", "-t", tagRef]) !== "tag") {
    throw new ConventionError(`${tag} 必须是 annotated tag。`);
  }

  if (!release.prerelease) {
    const changelog = readFileSync(
      new URL("../CHANGELOG.md", import.meta.url),
      "utf8",
    );
    const heading = new RegExp(
      `^## \\[${escapeRegExp(release.version)}\\] - \\d{4}-\\d{2}-\\d{2}$`,
      "m",
    );
    if (!heading.test(changelog)) {
      throw new ConventionError(
        `CHANGELOG.md 缺少 ${release.version} 的带日期版本标题。`,
      );
    }

    const masterRef = refExists("refs/heads/master")
      ? "refs/heads/master"
      : "refs/remotes/origin/master";
    if (!isAncestor(`${tag}^{commit}`, masterRef)) {
      throw new ConventionError(`稳定标签 ${tag} 必须指向 master 中的提交。`);
    }
  } else if (Number(tag.match(/-rc\.(\d+)$/)?.[1] ?? 0) > 1) {
    const baseVersion = release.version.replace(/-rc\.\d+$/, "");
    const existingRcTags = git(["tag", "--list", `v${baseVersion}-rc.*`])
      .split(/\r?\n/)
      .filter(Boolean)
      .map((value) => Number(value.match(/-rc\.(\d+)$/)?.[1] ?? 0));
    const previousRc = Number(tag.match(/-rc\.(\d+)$/)?.[1] ?? 0) - 1;
    if (!existingRcTags.includes(previousRc)) {
      throw new ConventionError(
        `${tag} 缺少连续的上一个 RC 标签 v${baseVersion}-rc.${previousRc}。`,
      );
    }
  }
}

function expectValid(label, callback) {
  try {
    callback();
  } catch (error) {
    throw new ConventionError(`自检失败，合法示例 ${label} 被拒绝：${error}`);
  }
}

function expectInvalid(label, callback) {
  try {
    callback();
  } catch (error) {
    if (error instanceof ConventionError) return;
    throw error;
  }
  throw new ConventionError(`自检失败，非法示例 ${label} 未被拒绝。`);
}

function selfTest() {
  for (const branch of [
    "master",
    "feat/m4-0-password-management-recovery",
    "chore/chore-1-repository-conventions",
    "release/v1.2.0",
    "hotfix/v1.1.1-password-reset-regression",
  ]) {
    expectValid(branch, () => validateBranchName(branch));
  }
  for (const branch of [
    "main",
    "feature/m4-1-content-access-control",
    "feat/content-access-control",
    "feat/M4.1-content-access-control",
    "feat/m05-01-leading-zero",
    "feat/m7-0-new-stage",
    "release/v01.2.0",
  ]) {
    expectInvalid(branch, () => validateBranchName(branch));
  }

  for (const header of [
    "feat(posts): add member-only poem visibility",
    "fix(auth): keep reset responses uniform",
    "chore(release): prepare v1.2.0",
    "Merge pull request #12 from luckymouse2332/feat/m4-1-content-access-control",
    'Revert "feat(posts): add member-only poem visibility"',
  ]) {
    expectValid(header, () => validateCommitHeader(header));
  }
  for (const header of [
    "feature(posts): add visibility",
    "feat(Posts): add visibility",
    "feat(posts): Add visibility",
    "feat/posts: add visibility",
    "feat(posts): add visibility.",
    "feat(posts): add 中文标题",
  ]) {
    expectInvalid(header, () => validateCommitHeader(header));
  }

  for (const tag of ["v1.2.0", "v1.2.0-rc.1"]) {
    expectValid(tag, () => parseReleaseTag(tag));
  }
  for (const tag of [
    "1.2.0",
    "v1.2",
    "v1.2.0-rc.0",
    "v1.2.0-beta.1",
    "v01.02.003",
  ]) {
    expectInvalid(tag, () => parseReleaseTag(tag));
  }

  process.stdout.write("规范检查器自检通过。\n");
}

function usage() {
  process.stdout.write(`用法：
  node scripts/check-repository-conventions.mjs current
  node scripts/check-repository-conventions.mjs self-test
  node scripts/check-repository-conventions.mjs branch [branch-name]
  node scripts/check-repository-conventions.mjs header <commit-or-pr-title>
  node scripts/check-repository-conventions.mjs message-file <path>
  node scripts/check-repository-conventions.mjs commits <base..head>
  node scripts/check-repository-conventions.mjs release <vX.Y.Z[-rc.N]>
`);
}

function main() {
  const [command = "current", ...args] = process.argv.slice(2);

  switch (command) {
    case "current":
      selfTest();
      validateBranchName(currentBranch());
      validateCommitRange("HEAD^!");
      break;
    case "self-test":
      selfTest();
      break;
    case "branch":
      validateBranchName(args[0] ?? currentBranch());
      break;
    case "header":
      if (!args[0]) throw new ConventionError("缺少提交或 PR 标题。");
      validateCommitHeader(args[0]);
      break;
    case "message-file":
      if (!args[0]) throw new ConventionError("缺少提交信息文件路径。");
      validateCommitMessage(readFileSync(args[0], "utf8"));
      break;
    case "commits":
      if (!args[0]) throw new ConventionError("缺少 Git 提交范围。");
      validateCommitRange(args[0]);
      break;
    case "release":
      if (!args[0]) throw new ConventionError("缺少发布标签。");
      validateRelease(args[0]);
      break;
    case "help":
    case "--help":
    case "-h":
      usage();
      break;
    default:
      throw new ConventionError(`未知命令：${command}`);
  }
}

const entryPoint = process.argv[1]
  ? pathToFileURL(process.argv[1]).href
  : undefined;

if (entryPoint === import.meta.url) {
  try {
    main();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
}
