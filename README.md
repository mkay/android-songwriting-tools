# Android Songwriting Tools

**https://mkay.github.io/android-songwriting-tools/**

The overview site for five Android apps: the workflow of [Title Track](https://github.com/mkay/TitleTrack), [Crystal Ball](https://github.com/mkay/CrystalBall), [Rubber Ring](https://github.com/mkay/RubberRing) and [Demo Reel](https://github.com/mkay/DemoReel), and alongside them [Pocket Prose](https://github.com/mkay/PocketProse) for the words. Built with [Astro](https://astro.build) as a static site.

## Where the content comes from

- `src/lib/apps.ts` — hand-written: each app's row (`workflow` or `words`) and step, colours, highlights and links.
- `src/content/apps/<slug>/` — synced, committed: title and short description from the app's fastlane listing, icon, phone screenshots and the latest release. Demo Reel has no listing, so its README icon and screenshot stand in and its text lives in `apps.ts`.

Refresh the synced half after an app's listing or release changes:

```
npm run sync                    # from GitHub
npm run sync -- --local ../..   # from local checkouts at ../../<Repo>/repo
```

## Develop

```
npm install
npm run dev       # http://localhost:4321/android-songwriting-tools/
npm run build     # static site in dist/
```

`astro.config.mjs` sets `base` for a GitHub project page; drop it if the site moves to a custom domain at the root.

## Deploy

`.github/workflows/deploy.yml` runs daily, on every push to `main`, and by hand from the Actions tab. It runs `npm run sync`, commits anything that changed in `src/content/apps/`, builds, and publishes to GitHub Pages (Settings → Pages → Source: GitHub Actions).
