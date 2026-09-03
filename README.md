# homebrew-terax

Homebrew tap for [darioherrera/terax-ai](https://github.com/darioherrera/terax-ai),
a personal fork of [Terax](https://github.com/crynta/terax-ai).

## Requires a GitHub token

`darioherrera/terax-ai` is a **private** repository, so its release assets are
not downloadable anonymously. Homebrew needs a token with read access to it:

```sh
export HOMEBREW_GITHUB_API_TOKEN=ghp_your_token_here
```

Put that line in your shell profile to make it stick. Without it,
`brew install` fails with a 404 while fetching the `.dmg`.

This tap is therefore only usable on machines authenticated as someone with
access to the fork.

## Install

```sh
brew tap darioherrera/terax
brew trust darioherrera/terax
brew install --cask terax-dario
```

Homebrew 6 refuses to load casks from third-party taps until you trust them, so
the `brew trust` step is required — without it the install fails with
"Refusing to load cask ... from untrusted tap".

## Update

```sh
brew update && brew upgrade --cask terax-dario
```

Terax also has a built-in Tauri auto-updater, which will usually have already
pulled the latest version in the background. The cask is marked `auto_updates`,
so Homebrew tracks the install without fighting it. To force the Homebrew copy
to match the cask exactly:

```sh
brew reinstall --cask terax-dario
```

## Uninstall

```sh
brew uninstall --cask terax-dario
brew uninstall --zap --cask terax-dario   # also removes settings and caches
```

## How the cask stays current

`.github/workflows/update-cask.yml` runs daily (and on demand) to pin the cask
to the newest **published** release of the fork. Drafts are skipped on purpose:
`release.yml` in terax-ai creates releases as drafts, and a draft's assets 404
at the download URL the cask points at.

The workflow needs a `TERAX_READ_TOKEN` secret — a token with read access to
the private terax-ai repo. Pushing the updated cask uses the automatic
`GITHUB_TOKEN`, so no personal access token is needed for that half.

## Notes

- macOS only. For Linux, take the `.AppImage`, `.deb`, or `.rpm` from the
  releases page.
- `conflicts_with cask: "terax"` — this installs the same `Terax.app` bundle as
  upstream, so only one of the two can be linked at a time.
- The cask ships with placeholder `0000…` hashes until the fork's first release
  is published; the workflow fills them in.
