import { request } from "@octokit/request";
import git from "./git.ts";

export interface Commits {
  major: string[];
  minor: string[];
  patch: string[];
  docs: string[];
  other: string[];
}

/**
 * Generates the release notes for a given version and {@link Commits}.
 * @param version The version to generate notes for.
 * @param major The commits that are considered major.
 * @param minor The commits that are considered minor.
 * @param patch The commits that are considered patch.
 * @param docs The commits that are considered docs.
 * @param other The commits that are considered other.
 * @returns The release notes for the given version.
 */
export function generateReleaseNotes(
  version: string,
  { major, minor, patch, docs, other }: Commits,
): string {
  function listNotes(notes: string[]): string {
    return notes.map((note) => `- ${note}`).join("\n");
  }

  let notes = `# Version ${version}\n\n`;
  if (major.length) {
    notes += `## Breaking Changes\n\n`;
    notes += `${listNotes(major)}\n\n`;
  }

  if (minor.length) {
    notes += `## Features\n\n`;
    notes += `${listNotes(minor)}\n\n`;
  }

  if (patch.length) {
    notes += `## Bug Fixes\n\n`;
    notes += `${listNotes(patch)}\n\n`;
  }

  if (docs.length) {
    notes += `## Documentation\n\n`;
    notes += `${listNotes(docs)}\n\n`;
  }

  if (other.length) {
    notes += `## Other\n\n`;
    notes += `${listNotes(other)}\n\n`;
  }

  return notes;
}

export default {
  async release(nextVer: string, releaseNotes: string): Promise<string> {
    const { owner, repo } = await git.repoInfo();

    // Get the GitHub token from environment variables
    const token = Deno.env.get("GITHUB_TOKEN");
    if (!token) {
      throw new Error("GITHUB_TOKEN environment variable is not set.");
    }

    // Create a new release using the 'request' function
    const res = await request("POST /repos/{owner}/{repo}/releases", {
      headers: {
        authorization: `token ${token}`,
      },
      owner,
      repo,
      name: nextVer,
      tag_name: nextVer,
      body: releaseNotes,
    });

    return res.data.html_url;
  },
};
