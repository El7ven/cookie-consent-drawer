import { defineConfig } from 'rollup'
import vue from '@rollup/plugin-vue'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import scss from 'rollup-plugin-scss'

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
      scss({
        output: 'dist/style.css',
        outputStyle: 'compressed'
      })
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
      terser(),
      scss({
        output: 'dist/style.css',
        outputStyle: 'compressed'
      })
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
      terser(),
      scss({
        output: 'dist/style.css',
        outputStyle: 'compressed'
      })
    ]
  }
])
