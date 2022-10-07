# shipit :canoe:

Like [semantic-release](https://github.com/semantic-release/semantic-release),
but opinionated, fast, and built with Deno in mind.

## How is this different?

Its not, really. It's a different implementation of the same idea. However, some
tweaks have been made to optimize for Deno:

- Releases start at `0.1.0`. This is a common convention for Node projects, but
  seems to be even more common for Deno projects.

- No support for publishing to npm. Since [deno.land/x](https://deno.land/x)
  syncs your code when you publish a Github release, publishing is all you need.

- Documentation changes cause a minor version bump. Documentation is a feature,
  especially since [deno doc](https://deno.land/manual/tools/documentation) will
  scrape your code. This decision is less of a Deno convention, and mostly my
  opinion.

- The release workflow is opinionated, and as such runs _fast_ and has _zero
  configuration_. `feat!:` will cause a major version bump, `feat:` or `docs:`
  will cause a minor version bump, and `fix:` will cause a patch version bump.
  Thats it!

## Usage

Install `shipit` locally:

```sh
deno install --allow-env --allow-run --allow-net https://deno.land/x/shipit/shipit.ts
```

And ship it!

```sh
shipit
```

In order to be able to authenticate with Github, you must set an environment
variable called `GITHUB_TOKEN` to a
[personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
with `repo` permissions.

If you'd prefer to run `shipit` on CI, you can:

```yaml
on:
  push:
    branches:
      - main

  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - uses: denoland/setup-deno@v1
        with:
          deno-version: vx.x.x

      - run: deno run --allow-net --allow-env --allow-run https://deno.land/x/shipit/shipit.ts
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Be sure to provide `GITHUB_TOKEN` as an environment variable to the `shipit`
script, as well as set `fetch-depth: 0` in the checkout step.

## Granting permissions

`shipit` requires environment, network, and subprocess creation permissions:

- `--allow-env`: `shipit` reads `GITHUB_TOKEN` from your local environment in
  order to authenticate with Github
- `--allow-run`: `shipit` needs to spawn subprocesses (`git`, `bash`) in order
  to gather information about your commits

- `--allow-net`: `shipit` needs to make outbound networks requests to Github in
  order to create Github releases

## Examples

`shipit` uses itself for releases. You can see the shape of the generated
releases [here](https://github.com/justinawrey/shipit/releases).
