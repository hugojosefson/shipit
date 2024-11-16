import {
  DOCS_COMMIT_REGEX,
  MAJOR_COMMIT_REGEX,
  MINOR_COMMIT_REGEX,
  OTHER_COMMIT_REGEX,
  PATCH_COMMIT_REGEX,
} from "./commit-regex.ts";
import * as colors from "@std/fmt/colors";
import * as semver from "@std/semver";
import git, { ROOT } from "./git.ts";
import github from "./github.ts";
import { logHeader } from "./log.ts";

if (!import.meta.main) {
  Deno.exit(0);
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

// Tag the new version.
logHeader("Creating new remote tag...");
await git.tag(nextVer);
await git.pushTag(nextVer);
console.log("New remote tag created:", `${nextVer}\n`);

// Create GitHub release.
logHeader("Creating new GitHub release...");

let url: string;
try {
  url = await github.release(nextVer, { major, minor, patch, docs, other });
} catch (error) {
  // Something went wrong, so delete the local and remote tag and bail.
  console.error(error);
  await git.deleteLocalTag(nextVer);
  await git.deleteRemoteTag(nextVer);
  Deno.exit(1);
}

console.log("Successfully created new GitHub release! 🎉");
console.log("View it here:", url);
