import { request } from "./deps.ts";
import git from "./git.ts";

export interface Commits {
  major: string[];
  minor: string[];
  patch: string[];
  docs: string[];
  other: string[];
}

function generateNotes(
  version: string,
  { major, minor, patch, docs, other }: Commits,
): string {
  function listNotes(notes: string[]): string {
    return notes.map((note) => `- ${note}`).join("\n");
  }

  let notes = `# Version ${version}\n\n`;
  if (major.length) {
    notes += `## Breaking Changes\n\n`;
    notes += `${listNotes(major)}\n`;
  }

  if (minor.length) {
    notes += `## Features\n\n`;
    notes += `${listNotes(minor)}\n`;
  }

  if (patch.length) {
    notes += `## Bug Fixes\n\n`;
    notes += `${listNotes(patch)}\n`;
  }

  if (docs.length) {
    notes += `## Documentation\n\n`;
    notes += `${listNotes(docs)}\n`;
  }

  if (other.length) {
    notes += `## Other\n\n`;
    notes += `${listNotes(other)}\n`;
  }

  return notes;
}

export default {
  async release(nextVer: string, commits: Commits): Promise<string> {
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
      body: generateNotes(nextVer, commits),
    });

    return res.data.html_url;
  },
};
