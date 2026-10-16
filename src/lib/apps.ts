// The hand-written half of each app: where it sits in the workflow, its
// colours, and where to get it. The rest (name, short description, icon,
// screenshots, release) is synced from the app's own repo by `npm run sync`.

import type { ImageMetadata } from 'astro';

interface Synced {
  repo: string;
  release: { tag: string; date: string } | null;
  listing: boolean;
  title?: string;
  short?: string;
}

/** A pair for the light and the dark page. */
type Themed = { light: string; dark: string };

interface Config {
  slug: string;
  /**
   * `workflow` apps are the numbered steps from idea to finished take;
   * `words` is the second row, for the lyrics that go with them.
   */
  row: 'workflow' | 'words';
  step: string;
  /**
   * From the app's own theme. `text` is the brand colour lifted or deepened
   * until it reads as text on the page; `fill` and `onFill` are the primary
   * button, as the app draws its own.
   */
  colors: { text: Themed; fill: Themed; onFill: Themed };
  packageId: string;
  fdroid: boolean;
  /** The app's page at singular.de, where it has one; otherwise its README. */
  homepage?: string;
  /** Three lines for the overview; the full listing is on the app's page. */
  highlights: string[];
  /** Only for apps without a fastlane listing. */
  fallback?: { title: string; short: string };
}

const configs: Config[] = [
  {
    slug: 'titletrack',
    row: 'workflow',
    step: 'Capture your ideas',
    colors: {
      text: { light: '#b45309', dark: '#f59e0b' },
      fill: { light: '#b45309', dark: '#f59e0b' },
      onFill: { light: '#ffffff', dark: '#451a03' },
    },
    packageId: 'de.singular.recorder',
    fdroid: true,
    homepage: 'https://singular.de/apps/titletrack/',
    highlights: [
      'Count yourself in at your tempo, and hit a full-width Restart when the third bar goes wrong.',
      'Takes land as plain WAV files in a folder you pick, with the bpm written into the file.',
      'A needle and strobe tuner, and a waveform player with trim, level and notes.',
    ],
  },
  {
    slug: 'crystalball',
    row: 'workflow',
    step: 'Find the chords',
    colors: {
      text: { light: '#4f5995', dark: '#a5aedb' },
      fill: { light: '#4f5995', dark: '#919ac5' },
      onFill: { light: '#ffffff', dark: '#1b1c22' },
    },
    packageId: 'de.singular.crystalball',
    fdroid: true,
    homepage: 'https://singular.de/apps/crystalball/',
    highlights: [
      'Strum, and it names the chord and draws how to fret it, with the runner-ups one tap away.',
      'Capo-aware shapes, and a dictionary of 240 chords to look up without playing a note.',
      'Capture a part chord by chord and keep it as a song sheet you can correct and share.',
    ],
  },
  {
    slug: 'rubberring',
    row: 'workflow',
    step: 'Play along and practice',
    colors: {
      text: { light: '#a62120', dark: '#e8615a' },
      fill: { light: '#a62120', dark: '#a62120' },
      onFill: { light: '#ffffff', dark: '#ffffff' },
    },
    packageId: 'de.singular.looper',
    fdroid: true,
    homepage: 'https://singular.de/apps/rubberring/',
    highlights: [
      'Mark a region on the waveform and loop it gaplessly, snapped to a detected beat grid.',
      'Slow a tricky passage down without changing its pitch, with a count-in to start.',
      'Save named loops and chain them into practice arrangements to drill the transitions.',
    ],
  },
  {
    slug: 'demoreel',
    row: 'workflow',
    step: 'Manage your takes',
    colors: {
      text: { light: '#475569', dark: '#94a3b8' },
      fill: { light: '#334155', dark: '#cbd5e1' },
      onFill: { light: '#ffffff', dark: '#020617' },
    },
    packageId: 'de.singular.player',
    fdroid: false,
    highlights: [
      'Browses one folder of demos, bounces and mixes, and nothing else on the phone.',
      'A tag editor for MP3 and FLAC that never re-encodes, with defaults for a whole folder at once.',
      'Level, convert and note a mix, and listen in the car through Android Auto.',
    ],
    fallback: {
      title: 'Demo Reel',
      short: 'An audio file manager for your demos, bounces and takes.',
    },
  },
  {
    slug: 'pocketprose',
    row: 'words',
    step: 'In your own words',
    colors: {
      text: { light: '#90563e', dark: '#c99681' },
      fill: { light: '#90563e', dark: '#c99681' },
      onFill: { light: '#ffffff', dark: '#2a2523' },
    },
    packageId: 'de.singular.writer',
    fdroid: true,
    homepage: 'https://singular.de/apps/pocketprose/',
    highlights: [
      'Points at a folder of Markdown notes and leaves the files as it found them: no database, no renaming, no network.',
      'Notes filed by the tags in their frontmatter, nested with /, with full-text search and pinning.',
      "Scratch lines while you write, and chord diagrams that render from the note's own folder.",
    ],
  },
];

const metas = import.meta.glob<Synced>('../content/apps/*/meta.json', { eager: true, import: 'default' });
const icons = import.meta.glob<ImageMetadata>('../content/apps/*/icon.png', { eager: true, import: 'default' });
const shots = import.meta.glob<ImageMetadata>('../content/apps/*/screenshots/*.png', { eager: true, import: 'default' });

const dir = (slug: string) => `../content/apps/${slug}`;

export const apps = configs.map((c) => {
  const meta = metas[`${dir(c.slug)}/meta.json`];
  if (!meta) throw new Error(`No synced data for ${c.slug} — run \`npm run sync\`.`);
  const text = meta.listing ? meta : c.fallback!;
  return {
    ...c,
    title: text.title!,
    short: text.short!,
    release: meta.release,
    icon: icons[`${dir(c.slug)}/icon.png`],
    screenshots: Object.entries(shots)
      .filter(([p]) => p.startsWith(`${dir(c.slug)}/`))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, img]) => img),
    links: {
      more: c.homepage ?? `https://github.com/mkay/${meta.repo}#readme`,
      source: `https://github.com/mkay/${meta.repo}`,
      release: meta.release ? `https://github.com/mkay/${meta.repo}/releases/tag/${meta.release.tag}` : null,
      fdroid: c.fdroid ? `https://f-droid.org/packages/${c.packageId}/` : null,
    },
  };
});

export type App = (typeof apps)[number];
