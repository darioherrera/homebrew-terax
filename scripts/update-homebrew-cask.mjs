#!/usr/bin/env node
// Rewrites the Homebrew cask's version and per-arch sha256 from a published
// GitHub release. Used both locally and by the update-homebrew-cask CI job.
//
//   node scripts/update-homebrew-cask.mjs --tag v0.8.6 [--cask path/to/terax-dario.rb]
//
// Downloading each .dmg just to hash it would pull ~200MB per run, so the
// digests come from the GitHub API, which reports them for every asset.

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) fail(`--${name} needs a value`);
  return value;
}

const tag = arg("tag") ?? process.env.GITHUB_REF_NAME;
if (!tag) fail("Pass --tag vX.Y.Z (or set GITHUB_REF_NAME)");
if (!/^v\d+\.\d+\.\d+/.test(tag)) fail(`Tag must look like vX.Y.Z, got: ${tag}`);

const version = tag.replace(/^v/, "");
const repo = process.env.TERAX_REPO ?? "darioherrera/terax-ai";
const caskPath = resolve(root, arg("cask") ?? "homebrew-tap/Casks/terax-dario.rb");

const headers = {
  accept: "application/vnd.github+json",
  "user-agent": "terax-cask-updater",
};
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
if (token) headers.authorization = `Bearer ${token}`;

const response = await fetch(
  `https://api.github.com/repos/${repo}/releases/tags/${tag}`,
  { headers },
);
if (!response.ok) {
  fail(`GitHub API returned ${response.status} for ${repo}@${tag}`);
}
const release = await response.json();

if (release.draft) {
  fail(
    `Release ${tag} is still a draft. Publish it first — a draft's assets are ` +
      `not reachable at the download URL the cask points to.`,
  );
}

// The API exposes asset digests as "sha256:<hex>", but only for assets uploaded
// after that field shipped. Anything older falls back to a real download.
async function digestFor(filename) {
  const asset = release.assets?.find((candidate) => candidate.name === filename);
  if (!asset) {
    fail(
      `Release ${tag} has no asset named ${filename}. ` +
        `Did the macOS build legs finish?`,
    );
  }

  const reported = asset.digest;
  if (typeof reported === "string" && reported.startsWith("sha256:")) {
    return reported.slice("sha256:".length);
  }

  process.stderr.write(`No digest reported for ${filename}; downloading it.\n`);
  const download = await fetch(asset.browser_download_url, {
    headers: { "user-agent": headers["user-agent"] },
    redirect: "follow",
  });
  if (!download.ok) {
    fail(`Could not download ${filename}: HTTP ${download.status}`);
  }
  const hash = createHash("sha256");
  hash.update(new Uint8Array(await download.arrayBuffer()));
  return hash.digest("hex");
}

const arm = await digestFor(`Terax_${version}_aarch64.dmg`);
const intel = await digestFor(`Terax_${version}_x64.dmg`);

const original = readFileSync(caskPath, "utf8");

// Anchored to the exact cask layout. If a future edit reflows these lines the
// replace count check below fails loudly rather than writing a stale cask.
let updated = original.replace(
  /^(\s*)version "[^"]*"$/m,
  `$1version "${version}"`,
);
updated = updated.replace(
  /^(\s*)sha256 arm:(\s*)"[0-9a-f]{64}",\n(\s*)intel:(\s*)"[0-9a-f]{64}"$/m,
  `$1sha256 arm:$2"${arm}",\n$3intel:$4"${intel}"`,
);

if (updated === original) {
  process.stdout.write(`Cask already at ${version} with matching hashes.\n`);
  process.exit(0);
}
if (!updated.includes(`version "${version}"`)) {
  fail("Could not rewrite the version line — cask layout changed?");
}
if (!updated.includes(arm) || !updated.includes(intel)) {
  fail("Could not rewrite the sha256 block — cask layout changed?");
}

writeFileSync(caskPath, updated);
// The cask often lives outside this repo (the tap is a separate checkout in
// CI), so only shorten the path when it is actually below root.
const shown = caskPath.startsWith(`${root}/`)
  ? caskPath.slice(root.length + 1)
  : caskPath;
process.stdout.write(
  `Updated ${shown} to ${version}\n  arm:   ${arm}\n  intel: ${intel}\n`,
);
