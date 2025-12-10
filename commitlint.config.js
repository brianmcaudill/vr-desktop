/**
 * Commitlint Configuration
 *
 * Enforces conventional commit messages:
 *   feat: add new feature     → bumps MINOR (1.0.0 → 1.1.0)
 *   fix: bug fix              → bumps PATCH (1.0.0 → 1.0.1)
 *   feat!: breaking change    → bumps MAJOR (1.0.0 → 2.0.0)
 *   chore: maintenance        → no version bump
 *   docs: documentation       → no version bump
 *   style: formatting         → no version bump
 *   refactor: code refactor   → no version bump
 *   test: add tests           → no version bump
 *   ci: CI/CD changes         → no version bump
 *
 * Examples:
 *   ✅ feat: add user authentication
 *   ✅ fix: resolve login redirect issue
 *   ✅ feat(api): add rate limiting
 *   ✅ fix(dashboard): correct chart rendering
 *   ❌ added new feature
 *   ❌ Fixed bug
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of these
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature (MINOR bump)
        'fix',      // Bug fix (PATCH bump)
        'docs',     // Documentation only
        'style',    // Formatting, no code change
        'refactor', // Code change, no new feature or fix
        'perf',     // Performance improvement
        'test',     // Adding tests
        'chore',    // Maintenance tasks
        'ci',       // CI/CD changes
        'build',    // Build system changes
        'revert',   // Revert previous commit
      ],
    ],
    // Type is required
    'type-empty': [2, 'never'],
    // Subject is required
    'subject-empty': [2, 'never'],
    // Subject should be lowercase
    'subject-case': [2, 'always', 'lower-case'],
    // No period at end of subject
    'subject-full-stop': [2, 'never', '.'],
    // Header max length
    'header-max-length': [2, 'always', 100],
  },
};
