import {
  DOCS_COMMIT_REGEX,
  MAJOR_COMMIT_REGEX,
  MINOR_COMMIT_REGEX,
  OTHER_COMMIT_REGEX,
  PATCH_COMMIT_REGEX,
} from "./commit-regex.ts";
import * as colors from "@std/fmt/colors";
import * as semver from "@std/semver";
import { swallow } from "@hugojosefson/fns/fn/swallow";
import git, { ROOT } from "./git.ts";
import github, { type Commits, generateReleaseNotes } from "./github.ts";
import { setVersionInDenoJsonFile } from "./json.ts";
import { logHeader } from "./log.ts";
import { run } from "@hugojosefson/run-simple";

if (!import.meta.main) {
  Deno.exit(0);
}

// Check if there are any uncommitted changes.
if (!(await git.isClean())) {
  console.error(
    "ERROR: There are uncommitted changes. Please commit or stash them before running @hugojosefson/shipit.",
  );
  Deno.exit(2);
}

// Get latest version.
logHeader("Getting latest version...");
let ver: string | typeof ROOT = await git.latestRemoteTag();

// If there is no latest version, start at 0.1.0.
if (!ver) {
  console.log("No previous version found: defaulting to 0.1.0\n");
  ver = ROOT;
} else {
  if (!semver.tryParse(ver)) {
    throw new Error(`latest version is invalid: ${colors.bold(ver)}`);
  }
  console.log("Found latest version:", `${ver}\n`);
}

// Get commit history since latest version.
logHeader("Getting commit history since latest version...");
const [major, minor, patch, docs, other] = await Promise.all([
  git.log({ grep: MAJOR_COMMIT_REGEX.source, since: ver }),
  git.log({ grep: MINOR_COMMIT_REGEX.source, since: ver }),
  git.log({ grep: PATCH_COMMIT_REGEX.source, since: ver }),
  git.log({ grep: DOCS_COMMIT_REGEX.source, since: ver }),
  git.log({ grep: OTHER_COMMIT_REGEX.source, since: ver }),
]);

if (major.length) console.log('Found "major" commits');
if (minor.length) console.log('Found "minor" commits');
if (patch.length) console.log('Found "patch" commits');
if (docs.length) console.log('Found "docs" commits');
if (other.length) console.log('Found "other" commits');
if (
  !major.length && !minor.length && !patch.length && !docs.length &&
  !other.length
) {
  console.log("No identified changes since last release!");
  Deno.exit(0);
} else {
  // Log a newline.
  console.log();
}

// Bump version.
let nextVer = "0.1.0";
if (ver !== ROOT) {
  logHeader("Determining next version...");
  if (major.length) {
    nextVer = semver.format(semver.increment(semver.parse(ver), "major"));
  } else if (minor.length || docs.length) {
    nextVer = semver.format(semver.increment(semver.parse(ver), "minor"));
  } else if (patch.length || other.length) {
    nextVer = semver.format(semver.increment(semver.parse(ver), "patch"));
  }

  console.log("Next version:", `${nextVer}\n`);
}

// Generate release notes.
const commits: Commits = { major, minor, patch, docs, other };
const releaseNotes = generateReleaseNotes(nextVer, commits);

// If we're in dry run mode, just print the release notes and exit.
if (
  Deno.env.get("DRY_RUN") || Deno.args.includes("--dry-run") ||
  Deno.args.includes("-n")
) {
  logHeader(
    "DRY_RUN or --dry-run is set, so not pushing any tags, nor creating a release.",
  );
  console.log(`Release notes for ${nextVer} would be:`);
  console.log(releaseNotes);
  Deno.exit(0);
}

logHeader("Updating version in any deno.json and deno.jsonc...");

// Sanity check: make sure there are still no uncommitted changes (there shouldn't be).
if (!(await git.isClean())) {
  console.error(
    `There are unexpectedly uncommitted changes in the middle of the release. Aborting.
    
This is likely a bug in @hugojosefson/shipit — My bad.
    
If you are able, please file a bug report at https://github.com/hugojosefson/shipit/issues
Include what you feel comfortable with, from the following:

- The exact shipit command you ran, that failed.
- The output from the shipit command you ran.
- The output from the following commands, after the error:
    git status
    git diff
    git diff --cached
    git log
    git fetch    # only relevant with the first "git fetch" after the error

Thank you!
`,
  );
  Deno.exit(1);
}

// Write the new version to any `deno.json` and `deno.jsonc`, if needed, and commit.
await setVersionInDenoJsonFile("deno.json", nextVer).catch(
  swallow(Deno.errors.NotFound),
);
await setVersionInDenoJsonFile("deno.jsonc", nextVer).catch(
  swallow(Deno.errors.NotFound),
);
if (!(await git.isClean())) {
  console.log("Committing version change to deno.json*...");
  await run(["git", "add", "."]);
  await run(["git", "commit", "-m", `chore: release ${nextVer}`]);
  console.log("Version change committed.");
}

// Tag the new version.
logHeader("Creating new remote tag...");
await git.tag(nextVer);
await git.pushTag(nextVer);
console.log("New remote tag created:", `${nextVer}\n`);

// Create GitHub release.
logHeader("Creating new GitHub release...");

let url: string;
try {
  url = await github.release(nextVer, releaseNotes);
} catch (error) {
  // Something went wrong, so delete the local and remote tag and bail.
  console.error(error);
  await git.deleteLocalTag(nextVer);
  await git.deleteRemoteTag(nextVer);
  Deno.exit(1);
}

console.log("Successfully created new GitHub release! 🎉");
console.log("View it here:", url);
