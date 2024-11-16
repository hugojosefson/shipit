# @hugojosefson/shipit 🚀

Like [semantic-release](https://github.com/semantic-release/semantic-release),
but opinionated, fast, and built with Deno in mind.

[![release](https://github.com/hugojosefson/shipit/actions/workflows/release.yml/badge.svg)](https://github.com/hugojosefson/shipit/actions/workflows/release.yml)
<span style="float: right">_(forked from
[justinawrey/shipit](https://github.com/justinawrey/shipit))_</span>

## How is this different from semantic-release?

It's not, really. It's a different implementation of the same idea. However,
some tweaks have been made to optimize for Deno:

- Releases start at `0.1.0`. This is a common convention for Node projects, but
  seems to be even more common for Deno projects.

- No support for publishing to npm. Since [deno.land/x](https://deno.land/x)
  syncs your code when you publish a GitHub release, publishing is all you need.

- Documentation changes cause a minor version bump. Documentation is a feature,
  especially since [JSR](https://jsr.io/) and [deno doc](https://doc.deno.land/)
  will scrape your code. This decision is less of a Deno convention, and mostly
  the author's opinion.

- The release workflow is opinionated, and as such runs _fast_ and has _zero
  configuration_. `feat!:` will cause a major version bump, `feat:` or `docs:`
  will cause a minor version bump, and `fix:`, `chore:` and similar will cause a
  patch version bump. That's it!

### Differences from upstream

After forking from [justinawrey/shipit](https://github.com/justinawrey/shipit),
these are the most notable differences from upstream:

- [x] Require that there are no uncommitted changes before running
      `@hugojosefson/shipit`.
- [x] Include **more commit types** under an "Other" section in the release
      notes. They are considered to be at the patch level.
- [x] Any commit with `!` is considered a **breaking change**.
  - So `feat!:` will of course cause a major version bump, but if you must, you
    can also use `fix!:` to indicate that a fix was so invasive as to cause
    breaking changes.
- [x] Support **scopes** in commit messages.
  - Example: `refactor(github): use latest api`.
  - (This can be combined with the `!` to indicate a breaking change, as in
    `docs(license)!: close source`. **Hypothetical!** Please don't follow that
    example.)
- [x] Unit tests for the more complex commit messages.
- [x] Update dependencies.
- [x] Write version number to any `deno.json` and `deno.jsonc`.
- [x] Dry-run mode, doesn't make any changes, but prints new version and release
      notes.
  - Use `--dry-run` or `-n` to enable, or set `DRY_RUN=1` in your environment.

## Usage

```sh
GITHUB_TOKEN="$(gh auth token)" deno run --allow-env --allow-run --allow-net --allow-write https://raw.githubusercontent.com/hugojosefson/shipit/refs/heads/main/shipit.ts
```

If you'd prefer to run `@hugojosefson/shipit` on CI, you can:

```yaml
on:
  push:
    branches:
      - main

  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: denoland/setup-deno@v2

      # Use latest version of @hugojosefson/shipit. You may prefer to pin a specific version.
      - run: deno run --allow-env --allow-run --allow-net --allow-write https://raw.githubusercontent.com/hugojosefson/shipit/refs/heads/main/shipit.ts
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Be sure to provide `GITHUB_TOKEN` as an environment variable to the
`@hugojosefson/shipit` script, as well as set `fetch-depth: 0` in the checkout
step.

## Granting permissions

`@hugojosefson/shipit` requires environment, network, subprocess creation, and
write permissions:

- `--allow-env`: It reads `GITHUB_TOKEN` from your local environment in order to
  authenticate with GitHub. It can also read `DRY_RUN` and `VERBOSE`.
- `--allow-run`: It needs to spawn subprocesses (`git`, `bash`) in order to
  gather information about your commits.
- `--allow-net`: It needs to make outbound network requests to GitHub in order
  to create GitHub releases.
- `--allow-write`: It needs to write to any `deno.json` and `deno.jsonc` files.

## Examples

`@hugojosefson/shipit` uses itself for releases. You can see the shape of the
generated releases [here](https://github.com/hugojosefson/shipit/releases).
