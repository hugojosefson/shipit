import { bash, parseRepo } from "./deps.ts";

export const ROOT = Symbol();

interface LogOptions {
  grep: string;
  since: string | typeof ROOT;
}

export default {
  latestRemoteTag(): Promise<string> {
    return bash(
      "git ls-remote --tags --sort=-v:refname origin | head -n 1 | cut -d/ -f3",
    );
  },

  log({ grep, since }: LogOptions): Promise<string[]> {
    return bash(
      `git log ${
        since === ROOT ? "" : `${since}..HEAD`
      } --pretty=format:'%s %h' --abbrev-commit --grep=${grep}`,
    ).then((commit) => {
      if (!commit) {
        return [];
      }

      const commits = commit.split("\n").map((commit) => {
        const trimmed = commit.replace(grep, "");
        if (trimmed.startsWith(" ")) {
          return trimmed.slice(1);
        }
        return trimmed;
      });
      return commits;
    });
  },

  tag(tag: string): Promise<string> {
    return bash(`git tag ${tag}`);
  },

  pushTag(tag: string): Promise<string> {
    return bash(`git push origin ${tag}`);
  },

  async repoInfo(): Promise<{ repo: string; owner: string }> {
    const { project: repo, owner } = parseRepo(
      await bash("git remote get-url origin"),
    );

    return {
      repo,
      owner: owner ?? "",
    };
  },
};
