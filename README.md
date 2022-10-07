# shipit :canoe:

Like [semantic-release](https://github.com/semantic-release/semantic-release),
but opinionated, fast, and built with Deno in mind.

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

## Granting permissions

`shipit` requires environment, network, and subprocess creation permissions:

- `--allow-env`: `shipit` reads `GITHUB_TOKEN` from your local environment in
  order to authenticate with Github
- `--allow-run`: `shipit` needs to spawn subprocesses (`git`, `bash`) in order
  to gather information about your commits

- `--allow-net`: `shipit` needs to make outbound networks requests to Github in
  order to create Github releases
