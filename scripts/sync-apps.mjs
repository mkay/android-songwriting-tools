// Pulls each app's store listing (title and short description), icon,
// screenshots and latest release from GitHub into src/content/apps/<slug>/,
// so the site reads the same words F-Droid shows and the build itself needs
// no network.
//
//   npm run sync                    # from GitHub (what is published)
//   npm run sync -- --local ../..   # from local checkouts at <dir>/<Repo>/repo

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const OWNER = 'mkay';
const REPOS = {
  titletrack: 'TitleTrack',
  crystalball: 'CrystalBall',
  rubberring: 'RubberRing',
  demoreel: 'DemoReel',
  pocketprose: 'PocketProse',
};
const LISTING = 'fastlane/metadata/android/en-US';
const OUT = path.resolve('src/content/apps');

const localIdx = process.argv.indexOf('--local');
const localRoot = localIdx > 0 ? path.resolve(process.argv[localIdx + 1]) : null;

function checkout(repo) {
  if (localRoot) return path.join(localRoot, repo, 'repo');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `sync-${repo}-`));
  const git = (...args) => execFileSync('git', args, { stdio: ['ignore', 'ignore', 'inherit'] });
  git('clone', '--quiet', '--depth', '1', '--filter=blob:none', '--sparse', `https://github.com/${OWNER}/${repo}.git`, dir);
  git('-C', dir, 'sparse-checkout', 'set', LISTING, 'docs');
  return dir;
}

async function latestRelease(repo) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${repo}/releases/latest`, {
    headers: process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {},
  });
  if (!res.ok) return null;
  const r = await res.json();
  return { tag: r.tag_name, date: r.published_at.slice(0, 10) };
}

const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim() : null);
const byNumber = (a, b) => parseInt(a, 10) - parseInt(b, 10);

for (const [slug, repo] of Object.entries(REPOS)) {
  const src = checkout(repo);
  const dst = path.join(OUT, slug);
  fs.rmSync(dst, { recursive: true, force: true });
  fs.mkdirSync(path.join(dst, 'screenshots'), { recursive: true });

  const listing = path.join(src, LISTING);
  const hasListing = fs.existsSync(listing);
  const meta = { repo, release: await latestRelease(repo), listing: hasListing };

  if (hasListing) {
    meta.title = read(path.join(listing, 'title.txt'));
    meta.short = read(path.join(listing, 'short_description.txt'));
    fs.copyFileSync(path.join(listing, 'images/icon.png'), path.join(dst, 'icon.png'));
    const shots = path.join(listing, 'images/phoneScreenshots');
    fs.readdirSync(shots).sort(byNumber).forEach((f, i) => {
      fs.copyFileSync(path.join(shots, f), path.join(dst, 'screenshots', `${String(i + 1).padStart(2, '0')}.png`));
    });
  } else {
    // No store listing (DemoReel): the README's icon and screenshot stand in.
    fs.copyFileSync(path.join(src, 'docs/icon.png'), path.join(dst, 'icon.png'));
    fs.copyFileSync(path.join(src, 'docs/screenshot.png'), path.join(dst, 'screenshots/01.png'));
  }

  fs.writeFileSync(path.join(dst, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
  if (!localRoot) fs.rmSync(src, { recursive: true, force: true });
  console.log(`${repo}: ${meta.release?.tag ?? 'no release'}, ${fs.readdirSync(path.join(dst, 'screenshots')).length} screenshots`);
}
