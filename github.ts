import { Octokit } from "https://esm.sh/@octokit/core@4.0.5";
import { restEndpointMethods } from "https://esm.sh/@octokit/plugin-rest-endpoint-methods@6.6.2";

export interface Commits {
  major: string[];
  minor: string[];
  patch: string[];
  docs: string[];
}

function generateNotes(
  version: string,
  { major, minor, patch, docs }: Commits,
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

  return notes;
}

export default {
  async release(nextVer: string, commits: Commits): Promise<string> {
    const owner = "justinawrey";
    const repo = "shipit";

    const restOctokit = Octokit.plugin(restEndpointMethods);
    const octokit = new restOctokit({
      auth: Deno.env.get("GITHUB_TOKEN"),
    });

    const res = await octokit.rest.repos.createRelease({
      owner,
      repo,
      name: nextVer,
      tag_name: nextVer,
      body: generateNotes(nextVer, commits),
    });

    if (res.status !== 201) {
      throw new Error(`Github release failed: ${res.status}`);
    }

    return res.data.html_url;
  },
};
