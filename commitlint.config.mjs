/**
 * Conventional Commits enforced via commitlint + Husky (commit-msg hook).
 * See CONTRIBUTING.md for the allowed types and examples.
 */
/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [0, 'always'],
  },
};

export default config;
