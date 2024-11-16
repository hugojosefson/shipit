export const MAJOR_COMMIT_REGEX =
  /(^| )_*[a-z0-9][a-z0-9_.-]*((\([^)]+\))?!|!(\([^)]+\))?):/;
export const MINOR_COMMIT_REGEX = /(^| )feat(\([^)]+\))?:/;
export const PATCH_COMMIT_REGEX = /(^| )fix(\([^)]+\))?:/;
export const DOCS_COMMIT_REGEX = /(^| )docs(\([^)]+\))?:/;
export const OTHER_COMMIT_REGEX =
  /(^| )(?!feat|fix|docs)[a-z0-9][a-z0-9_.-]*(\([^)]+\))?:/;
