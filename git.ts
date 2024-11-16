import { parseRepo, run } from "./deps.ts";

export const ROOT = Symbol();

interface LogOptions {
  grep: string;
  since: string | typeof ROOT;
}

export default {
  latestRemoteTag(): Promise<string> {
    return run(
      "git ls-remote --tags --sort=-v:refname origin | head -n 1 | cut -d/ -f3",
    );
  },

  log({ grep, since }: LogOptions): Promise<string[]> {
    return run([
      "git",
      "log",
      ...(since === ROOT ? [] : [`${since}..HEAD`]),
      "--pretty=format:'%s %h'",
      "--abbrev-commit",
      "--perl-regexp",
      "--grep",
      grep,
    ]).then((commit) => {
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
    return run(`git tag ${tag}`);
  },

  pushTag(tag: string): Promise<string> {
    return run(`git push origin ${tag}`);
  },

  deleteLocalTag(tag: string): Promise<string> {
    return run(`git tag -d ${tag}`);
  },

  deleteRemoteTag(tag: string): Promise<string> {
    return run(`git push --delete origin ${tag}`);
  },

  async repoInfo(): Promise<{ repo: string; owner: string }> {
    const { project: repo, owner } = parseRepo(
      await run("git remote get-url origin"),
    );

    return {
      repo,
      owner: owner ?? "",
    };
  },
};
