import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    build: {
      outDir: './dist/app/core',
      lib: {
        entry: './src/app/core/main.ts'
      }
    },
    plugins: [
      externalizeDepsPlugin(),
      viteStaticCopy({
        targets: [
          {
            src: './src/app/core/commander.db',
            dest: './'
          }
        ]
      })
    ]
  },
  preload: {
    build: {
      outDir: './dist/app/preload',
      lib: {
        entry: './src/app/preload/preload.ts'
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/app/renderer')
      }
    },
    plugins: [react()],
    root: './src/app/renderer',
    build: {
      rollupOptions: {
        input: {
          index: './src/app/renderer/pages/index.html',
          updater: './src/app/renderer/pages/update.html',
          dashboard: './src/app/renderer/pages/dashboard.html'
        }
      },
      outDir: './dist/app/renderer'
    }
  }
});

