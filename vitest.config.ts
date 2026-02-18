import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
        {
          '@vueuse/core': [
            'onKeyStroke',
            'useElementBounding',
            'useWindowSize',
            'useIntersectionObserver',
            'usePreferredReducedMotion',
            'useMagicKeys',
          ],
          '#app': [
            'useRoute',
            'useRouter',
            'useRuntimeConfig',
            'useHead',
            'useState',
            'useFetch',
            'useAsyncData',
            'useLazyAsyncData',
          ],
        },
      ],
      dts: false,
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.spec.{ts,tsx}', '**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.nuxt', '.output', 'tests-e2e', '**/tests-e2e/**'],
    server: {
      deps: {
        inline: ['nuxt', '@nuxt/*', '#app'],
      },
    },
    coverage: {
      provider: 'v8',
      include: ['components', 'composables', 'utils', 'server/api'],
      exclude: [
        'node_modules',
        'dist',
        '.nuxt',
        '.output',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/__tests__/**',
      ],
      reporter: ['text', 'html', 'lcov'],
    },
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.'),
      '~~': resolve(__dirname, '.'),
      '@@': resolve(__dirname, '.'),
      'assets': resolve(__dirname, './assets'),
      'public': resolve(__dirname, './public'),
      '#app': resolve(__dirname, './node_modules/nuxt/dist/app'),
      '#app/composables': resolve(__dirname, './node_modules/nuxt/dist/app/composables'),
    },
  },
})
