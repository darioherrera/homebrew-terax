# homebrew-terax

Homebrew tap for [darioherrera/terax-ai](https://github.com/darioherrera/terax-ai),
a personal fork of [Terax](https://github.com/crynta/terax-ai).

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

## Notes

- macOS only. Linux users should take the `.AppImage`, `.deb`, or `.rpm` from
  the [releases page](https://github.com/darioherrera/terax-ai/releases).
- `conflicts_with cask: "terax"` — this cask installs the same `Terax.app`
  bundle as upstream, so only one of the two can be linked at a time.
- The cask is updated automatically by the `update-homebrew-cask` workflow in
  the terax-ai repo when a release is published.
