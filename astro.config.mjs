// @ts-check
import { defineConfig } from 'astro/config';

// A GitHub project page is served under the repo's name, so every link and
// asset needs that prefix. On a custom domain at the root, drop `base`.
export default defineConfig({
  site: 'https://mkay.github.io',
  base: '/android-songwriting-tools',
  trailingSlash: 'always',
});
