/* eslint-disable import/no-extraneous-dependencies */
// vite.config.js

import StylelintPlugin from 'vite-plugin-stylelint';
import { createVuePlugin } from 'vite-plugin-vue2';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: '@acv/infinite-scroller-vue2',
      fileName: (format) => `infinite-scroller-vue2.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  plugins: [
    createVuePlugin(/* options */),
    StylelintPlugin(),
  ],
});
