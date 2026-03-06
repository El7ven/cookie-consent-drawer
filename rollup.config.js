import { defineConfig } from 'rollup'
import vue from 'rollup-plugin-vue'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import css from 'rollup-plugin-css-only'

export default defineConfig([
  // ES Module build
  {
    input: 'index.js',
    output: {
      file: 'dist/index.esm.js',
      format: 'es'
    },
    external: ['vue', 'pinia'],
    plugins: [
      resolve(),
      vue(),
      css({ output: 'dist/style.css' }),
      terser()
    ]
  },
  // CommonJS build
  {
    input: 'index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs'
    },
    external: ['vue', 'pinia'],
    plugins: [
      resolve(),
      vue(),
      css({ output: 'dist/style.css' }),
      terser()
    ]
  },
  // UMD build for CDN
  {
    input: 'index.js',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'CookieConsentDrawer',
      globals: {
        vue: 'Vue',
        pinia: 'Pinia'
      }
    },
    external: ['vue', 'pinia'],
    plugins: [
      resolve(),
      vue(),
      css({ output: 'dist/style.css' }),
      terser()
    ]
  }
])
