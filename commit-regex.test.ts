import { assert } from "./deps.ts";
import {
  DOCS_COMMIT_REGEX,
  MAJOR_COMMIT_REGEX,
  MINOR_COMMIT_REGEX,
  OTHER_COMMIT_REGEX,
  PATCH_COMMIT_REGEX,
} from "./commit-regex.ts";

const MAJORS_TRUE = [
  "feat!: add add something",
  "feat(scope)!: add add something",
  "fix(something-else)!: fix really large bug",
  "chore!: fix bug",
  "build!: fix bug",
  "ci!: fix bug",
  "tests!: fix bug",
  "perf!: fix bug",
  "refactor!: fix bug",
];

const MAJORS_FALSE = [
  "feat: add new feature",
  "feat(scope): add new feature",
  "fix(something-else): fix really large bug",
  "chore: fix bug",
  "build: fix bug",
  "ci: fix bug",
  "tests: fix bug",
  "perf: fix bug",
  "refactor: fix bug",
];

const MINORS_TRUE = [
  "feat(scope): add something",
  "feat: add add something",
];

const MINORS_FALSE = [
  "fix(something-else): fix really large bug",
  "chore(scope): fix bug",
  "build(scope): fix bug",
  "ci(scope): fix bug",
  "tests(scope): fix bug",
  "perf(scope): fix bug",
  "refactor(scope): fix bug",
];

const PATCHES_TRUE = [
  "fix(something-else): fix really large bug",
  "fix: fix really large bug",
];

const PATCHES_FALSE = [
  "feat(scope): add something",
  "feat: add add something",
  "docs(scope): add add something",
  "docs: add add something",
];

const DOCS_TRUE = [
  "docs(scope): add something",
  "docs: add add something",
];

const DOCS_FALSE = [
  "docs!: add something",
  "docs(scope)!: add something",
  "feat(scope): add something",
  "feat: add add something",
  "fix(something-else): fix really large bug",
  "chore(scope): fix bug",
  "build(scope): fix bug",
  "ci(scope): fix bug",
  "tests(scope): fix bug",
  "perf(scope): fix bug",
  "refactor(scope): fix bug",
];

const OTHER_TRUE = [
  "build(scope): fix bug",
  "chore(scope): fix bug",
  "ci(scope): fix bug",
  "perf(scope): fix bug",
  "refactor(scope): fix bug",
  "tests(scope): fix bug",
];

const OTHER_FALSE = [
  "docs(scope): add something",
  "docs: add add something",
  "feat(scope): add something",
  "feat: add add something",
  "fix(something-else): fix really large bug",
];

Deno.test("MAJOR_COMMIT_REGEX", async (t) => {
  for (const commit of MAJORS_TRUE) {
    await t.step(
      `is a major commit: ${commit}`,
      () => assert(MAJOR_COMMIT_REGEX.test(commit)),
    );
  }
  for (const commit of MAJORS_FALSE) {
    await t.step(
      `is not a major commit: ${commit}`,
      () => assert(!MAJOR_COMMIT_REGEX.test(commit)),
    );
  }
});

Deno.test("MINOR_COMMIT_REGEX", async (t) => {
  for (const commit of MINORS_TRUE) {
    await t.step(
      `is a minor commit: ${commit}`,
      () => assert(MINOR_COMMIT_REGEX.test(commit)),
    );
  }
  for (const commit of MINORS_FALSE) {
    await t.step(
      `is not a minor commit: ${commit}`,
      () => assert(!MINOR_COMMIT_REGEX.test(commit)),
    );
  }
});

Deno.test("PATCH_COMMIT_REGEX", async (t) => {
  for (const commit of PATCHES_TRUE) {
    await t.step(
      `is a patch commit: ${commit}`,
      () => assert(PATCH_COMMIT_REGEX.test(commit)),
    );
  }
  for (const commit of PATCHES_FALSE) {
    await t.step(
      `is not a patch commit: ${commit}`,
      () => assert(!PATCH_COMMIT_REGEX.test(commit)),
    );
  }
});

Deno.test("DOCS_COMMIT_REGEX", async (t) => {
  for (const commit of DOCS_TRUE) {
    await t.step(
      `is a docs commit: ${commit}`,
      () => assert(DOCS_COMMIT_REGEX.test(commit)),
    );
  }
  for (const commit of DOCS_FALSE) {
    await t.step(
      `is not a docs commit: ${commit}`,
      () => assert(!DOCS_COMMIT_REGEX.test(commit)),
    );
  }
});

Deno.test("OTHER_COMMIT_REGEX", async (t) => {
  for (const commit of OTHER_TRUE) {
    await t.step(
      `is an other commit: ${commit}`,
      () => assert(OTHER_COMMIT_REGEX.test(commit)),
    );
  }
  for (const commit of OTHER_FALSE) {
    await t.step(
      `is not an other commit: ${commit}`,
      () => assert(!OTHER_COMMIT_REGEX.test(commit)),
    );
  }
});
