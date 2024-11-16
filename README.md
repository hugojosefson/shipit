# shipit :canoe:

_(forked from [justinawrey/shipit](https://github.com/justinawrey/shipit))_

[![release](https://github.com/hugojosefson/shipit/actions/workflows/release.yml/badge.svg)](https://github.com/hugojosefson/shipit/actions/workflows/release.yml)

Like [semantic-release](https://github.com/semantic-release/semantic-release),
but opinionated, fast, and built with Deno in mind.

## How is this different?

It's not, really. It's a different implementation of the same idea. However,
some tweaks have been made to optimize for Deno:

- Releases start at `0.1.0`. This is a common convention for Node projects, but
  seems to be even more common for Deno projects.

- No support for publishing to npm. Since [deno.land/x](https://deno.land/x)
  syncs your code when you publish a GitHub release, publishing is all you need.

- Documentation changes cause a minor version bump. Documentation is a feature,
  especially since [deno doc](https://doc.deno.land) will scrape your code. This
  decision is less of a Deno convention, and mostly the author's opinion.

- The release workflow is opinionated, and as such runs _fast_ and has _zero
  configuration_. `feat!:` will cause a major version bump, `feat:` or `docs:`
  will cause a minor version bump, and `fix:`, `chore:` and similar will cause a
  patch version bump. That's it!

## Usage

```sh
GITHUB_TOKEN="$(gh auth token)" deno run --allow-env --allow-run --allow-net https://raw.githubusercontent.com/hugojosefson/shipit/refs/heads/main/shipit.ts
```

If you'd prefer to run `shipit` on CI, you can:

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

      # Use latest version of shipit.  You may prefer to pin a specific version.
      - run: deno run --allow-net --allow-env --allow-run https://raw.githubusercontent.com/hugojosefson/shipit/refs/heads/main/shipit.ts
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Be sure to provide `GITHUB_TOKEN` as an environment variable to the `shipit`
script, as well as set `fetch-depth: 0` in the checkout step.

## Granting permissions

`shipit` requires environment, network, and subprocess creation permissions:

- `--allow-env`: `shipit` reads `GITHUB_TOKEN` from your local environment in
  order to authenticate with GitHub
- `--allow-run`: `shipit` needs to spawn subprocesses (`git`, `bash`) in order
  to gather information about your commits

- `--allow-net`: `shipit` needs to make outbound networks requests to GitHub in
  order to create GitHub releases

## Examples

`shipit` uses itself for releases. You can see the shape of the generated
releases [here](https://github.com/hugojosefson/shipit/releases).
