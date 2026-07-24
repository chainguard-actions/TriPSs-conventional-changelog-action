<!-- markdownlint-disable -->

# Hardening Report: TriPSs--conventional-changelog-action/v5.4.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **TriPSs--conventional-changelog-action/v5.4.0** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All three workflow files reference actions using mutable tags instead of full 40-character SHA commit pins, making them vulnerable to supply-chain attacks if the referenced tag is moved.

- release.yml: `actions/checkout@v4` (line 12), `actions/create-release@v1` (line 30)
- versioning.yml: `actions/checkout@v4` (line 11), `Actions-R-Us/actions-tagger@latest` (line 13)
- test.yml: `actions/checkout@v4` used in every job (32 occurrences, starting at line 13)

Locations:

- `.github/workflows/release.yml:12`
- `.github/workflows/release.yml:30`
- `.github/workflows/versioning.yml:11`
- `.github/workflows/versioning.yml:13`
- `.github/workflows/test.yml:13`

### missing-permissions (severity: medium)

None of the three workflow files define a top-level `permissions:` block, and no individual job within any of these files defines job-level permissions. Without explicit permissions, workflows run with the default (potentially write-all) token permissions, violating the principle of least privilege.

Locations:

- `.github/workflows/release.yml:1`
- `.github/workflows/test.yml:1`
- `.github/workflows/versioning.yml:1`

### script-injection (severity: high)

Sub-rule (a): A `run:` block in test.yml directly interpolates a GitHub Actions expression inside a shell command string. The offending line is:

  `echo "${{ steps.changelog.outputs.changelog }}" > change_log`

The `steps.changelog.outputs.changelog` value is workflow-controlled output that flows through YAML template substitution before the shell processes it. If the changelog content contains shell metacharacters or newlines, this can lead to command injection. The expression must be passed via an `env:` variable and that variable must be double-quoted in the shell script.

Locations:

- `.github/workflows/test.yml:762`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection

**Notes:**

Fixed all three findings across the three workflow files:

1. **unpinned-uses**: Pinned all action references to full SHA commits:
   - `actions/checkout@v4` → `actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4` (30 occurrences in test.yml, 1 in release.yml, 1 in versioning.yml)
   - `actions/create-release@v1` → `actions/create-release@0cb9c9b65d5d1901c1f53e5e66eaf4afd303e70e # v1` (release.yml)
   - `Actions-R-Us/actions-tagger@latest` → `Actions-R-Us/actions-tagger@330ddfac760021349fef7ff62b372f2f691c20fb # latest` (versioning.yml)

2. **missing-permissions**: Added top-level `permissions:` blocks to all three files:
   - `release.yml`: `contents: write` (needed to create releases and push dist)
   - `versioning.yml`: `contents: write` (needed to create/update tags)
   - `test.yml`: `contents: read` (read-only for test workflows)

3. **script-injection**: Fixed the script injection in test.yml by moving `${{ steps.changelog.outputs.changelog }}` into an `env:` block as `CHANGELOG`, then referencing `$CHANGELOG` in the shell script instead of the raw expression.

