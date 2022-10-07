import { colors, parseRepo } from "./deps.ts";

export const ROOT = Symbol();

async function bash(cmd: string): Promise<string> {
  const process = Deno.run({
    cmd: ["bash", "-c", cmd],
    stdout: "piped",
    stderr: "piped",
  });

  const [status, stdout, stderr] = await Promise.all([
    process.status(),
    process.output(),
    process.stderrOutput(),
  ]);

  if (status.code === 0) {
    return new TextDecoder().decode(stdout);
  } else {
    throw new Error(
      `bash invocation "${colors.bold(cmd)}" failed with error:` +
        new TextDecoder().decode(stderr),
    );
  }
}

interface LogOptions {
  grep: string;
  since: string | typeof ROOT;
}

export default {
  latestRemoteTag(): Promise<string> {
    return bash(
      "git ls-remote --tags --sort=-v:refname origin | head -n 1 | cut -d/ -f3 | tr -d '\n'",
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
      await bash("git remote get-url origin | tr -d '\n'"),
    );

    return {
      repo,
      owner: owner ?? "",
    };
  },
};
