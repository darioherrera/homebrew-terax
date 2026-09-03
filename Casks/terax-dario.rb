cask "terax-dario" do
  arch arm: "aarch64", intel: "x64"

  version "0.8.6"
  sha256 arm:   "0000000000000000000000000000000000000000000000000000000000000000",
         intel: "0000000000000000000000000000000000000000000000000000000000000000"

  url "https://github.com/darioherrera/terax-ai/releases/download/v#{version}/Terax_#{version}_#{arch}.dmg"
  name "Terax (darioherrera fork)"
  desc "AI-native terminal emulator - personal fork with extra features"
  homepage "https://github.com/darioherrera/terax-ai"

  livecheck do
    url :url
    strategy :github_latest
  end

  # Terax ships a Tauri auto-updater that replaces the app bundle in place.
  # Left enabled, it would silently move the install off whatever version the
  # cask recorded, so `brew upgrade` and `brew uninstall` would act on stale
  # metadata. auto_updates tells Homebrew that is expected and to leave the
  # bundle alone rather than fight it.
  auto_updates true
  # The upstream cask installs the same Terax.app bundle, so both cannot be
  # linked into /Applications at once.
  conflicts_with cask: "terax"
  depends_on macos: :big_sur

  app "Terax.app"

  zap trash: [
    "~/Library/Application Support/app.crynta.terax",
    "~/Library/Caches/app.crynta.terax",
    "~/Library/HTTPStorages/app.crynta.terax",
    "~/Library/Preferences/app.crynta.terax.plist",
    "~/Library/Saved Application State/app.crynta.terax.savedState",
    "~/Library/WebKit/app.crynta.terax",
  ]
end
