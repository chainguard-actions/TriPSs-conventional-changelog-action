<!-- markdownlint-disable -->

# Hardening Report: TriPSs--conventional-changelog-action/v6.5.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **TriPSs--conventional-changelog-action/v6.5.0** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference actions using mutable tags or branch names instead of pinned 40-character SHA digests, making them vulnerable to supply-chain attacks if the referenced tag is moved or overwritten.

- release.yml: `actions/checkout@v7` (tag, not SHA) and `actions/create-release@v1` (tag, not SHA)
- versioning.yml: `actions/checkout@v7` (tag, not SHA) and `Actions-R-Us/actions-tagger@latest` (branch `latest`, not SHA — especially dangerous)
- test.yml: `actions/checkout@v7` (tag, not SHA) used in every job

Locations:

- `.github/workflows/release.yml:12`
- `.github/workflows/release.yml:29`
- `.github/workflows/versioning.yml:11`
- `.github/workflows/versioning.yml:13`
- `.github/workflows/test.yml:13`

### permissions (severity: medium)

None of the three workflow files define a top-level `permissions:` key, and no individual jobs define job-level `permissions:` keys either. Without explicit permissions, workflows inherit the default repository token permissions, which may be overly broad (e.g., write access to contents, packages, etc.). All three files fail the missing-permissions check: release.yml, test.yml, and versioning.yml.

Locations:

- `.github/workflows/release.yml:1`
- `.github/workflows/test.yml:1`
- `.github/workflows/versioning.yml:1`

### script-injection (severity: high)

Sub-rule (a) violation: A `${{ ... }}` expression is interpolated directly inside a `run:` shell command string. In the `test-multiple-git-path` job's 'Test output' step, the line `echo "${{ steps.changelog.outputs.changelog }}" > change_log` embeds a `steps.*.outputs.*` context value directly into the shell command. This value flows through YAML template substitution before the shell processes it, allowing any newlines, shell metacharacters, or command sequences in the changelog output to be interpreted by the shell. The value should instead be passed via an `env:` variable and referenced as `"$ENV_VAR"` in the script.

Locations:

- `.github/workflows/test.yml:706`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, permissions, script-injection

**Notes:**

Fixed all three findings across release.yml, versioning.yml, and test.yml:

1. unpinned-uses: Pinned all action references to full 40-char SHAs with tag comments:
   - actions/checkout@v7 → @3d3c42e5aac5ba805825da76410c181273ba90b1 # v7 (35 total occurrences across all 3 files)
   - actions/create-release@v1 → @0cb9c9b65d5d1901c1f53e5e66eaf4afd303e70e # v1 (release.yml)
   - Actions-R-Us/actions-tagger@latest → @330ddfac760021349fef7ff62b372f2f691c20fb # latest (versioning.yml)

2. permissions: Added top-level permissions blocks:
   - release.yml: contents: write (needed for creating releases and pushing dist)
   - versioning.yml: contents: write (needed for creating/updating tags)
   - test.yml: contents: read (read-only for testing)

3. script-injection: In test.yml's test-multiple-git-path job 'Test output' step, moved ${{ steps.changelog.outputs.changelog }} from the run: shell string into an env: block as CHANGELOG, then referenced it as $CHANGELOG in the shell script to prevent shell metacharacter injection.

