import { colors, semver } from "./deps.ts";
import { logHeader } from "./log.ts";
import git, { ROOT } from "./git.ts";
import github from "./github.ts";

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
  if (!semver.valid(ver)) {
    throw new Error(`latest version is invalid: ${colors.bold(ver)}`);
  }
  console.log("Found latest version:", `${ver}\n`);
}

// Get commit history since latest version.
logHeader("Getting commit history since latest version...");
const [major, minor, patch, docs] = await Promise.all([
  git.log({ grep: "feat!:", since: ver }),
  git.log({ grep: "feat:", since: ver }),
  git.log({ grep: "fix:", since: ver }),
  git.log({ grep: "docs:", since: ver }),
]);

if (major.length) console.log('Found "major" commits');
if (minor.length) console.log('Found "minor" commits');
if (patch.length) console.log('Found "patch" commits');
if (docs.length) console.log('Found "docs" commits');
if (!major.length && !minor.length && !patch.length && !docs.length) {
  console.log("No changes since last release!");
  Deno.exit(0);
} else {
  // Log a newline.
  console.log();
}

// Bump version.
// Assert type to be string because we previously
// checked to make sure our starting semver was valid.
let nextVer = "0.1.0";
if (ver !== ROOT) {
  logHeader("Determining next version...");
  if (major.length) {
    nextVer = semver.inc(ver, "major") as string;
  } else if (minor.length || docs.length) {
    nextVer = semver.inc(ver, "minor") as string;
  } else if (patch.length) {
    nextVer = semver.inc(ver, "patch") as string;
  }

  // @ts-ignore - we know nextVer is a string.
  console.log("Next version:", `${nextVer}\n`);
}

// Tag the new version.
logHeader("Creating new remote tag...");
await git.tag(nextVer);
await git.pushTag(nextVer);
console.log("New remote tag created:", `${nextVer}\n`);

// Create Github release.
logHeader("Creating new Github release...");

let url: string;
try {
  url = await github.release(nextVer, { major, minor, patch, docs });
} catch (error) {
  // Something went wrong, so delete the local and remote tag and bail.
  console.error(error);
  await git.deleteLocalTag(nextVer);
  await git.deleteRemoteTag(nextVer);
  Deno.exit(0);
}

console.log("Successfully created new Github release! 🎉");
console.log("View it here:", url);
