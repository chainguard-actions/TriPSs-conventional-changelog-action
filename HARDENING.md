<!-- markdownlint-disable -->

# Hardening Report: TriPSs--conventional-changelog-action/v6.1.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **TriPSs--conventional-changelog-action/v6.1.0** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference GitHub Actions using mutable version tags instead of pinned full-length SHA commit hashes, making them vulnerable to supply-chain attacks if the tag is moved. Failing references: release.yml — `actions/checkout@v5` and `actions/create-release@v1`; versioning.yml — `actions/checkout@v5` and `Actions-R-Us/actions-tagger@latest`; test.yml — `actions/checkout@v5` (repeated across all jobs).

Locations:

- `.github/workflows/release.yml:12`
- `.github/workflows/release.yml:29`
- `.github/workflows/versioning.yml:10`
- `.github/workflows/versioning.yml:12`
- `.github/workflows/test.yml:13`

### permissions (severity: medium)

None of the workflow files define a top-level `permissions:` key, and no individual job defines its own `permissions:` block. Without explicit permissions, workflows run with the default (potentially broad) token permissions. All three files — release.yml, test.yml, and versioning.yml — are affected.

Locations:

- `.github/workflows/release.yml:1`
- `.github/workflows/test.yml:1`
- `.github/workflows/versioning.yml:1`

### script-injection (severity: high)

Sub-rule (a): A `run:` block in the `test-multiple-git-path` job directly interpolates a GitHub Actions expression into a shell command string. The offending line is: `echo "${{ steps.changelog.outputs.changelog }}" > change_log`. The `steps.*.outputs.*` context is workflow-controllable and is substituted into the shell command before the shell parses it, allowing an attacker to inject arbitrary shell commands via the changelog output value.

Locations:

- `.github/workflows/test.yml:571`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, permissions, script-injection

**Notes:**

Fixed all three findings across release.yml, versioning.yml, and test.yml:

1. unpinned-uses: Pinned all action references to full commit SHAs using lookup_action_sha — actions/checkout@v5 → SHA fbc6f39 (35 total occurrences), actions/create-release@v1 → SHA 0cb9c9b, Actions-R-Us/actions-tagger@latest → SHA 330ddfa. Original tags preserved as inline comments.

2. permissions: Added top-level permissions blocks to all three workflow files. release.yml and versioning.yml get 'contents: write' (needed for creating releases and tagging). test.yml gets 'contents: read' (tests only read the repo).

3. script-injection: In test.yml's test-multiple-git-path job, moved ${{ steps.changelog.outputs.changelog }} out of the run: shell string into an env: block as CHANGELOG, then used printf '%s' "$CHANGELOG" > change_log instead of echo with the inline expression, preventing shell injection.

