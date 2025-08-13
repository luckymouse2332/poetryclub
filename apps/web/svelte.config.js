import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { preprocessMeltUI } from '@melt-ui/pp';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    alias: {
      $lib: './src/lib',
    },
  },
  preprocess: [vitePreprocess(), preprocessMeltUI()],
};

export default config;
