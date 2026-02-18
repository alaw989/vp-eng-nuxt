// Test setup file for Vitest
import { vi } from 'vitest'
import { ref, computed, reactive, watch, onMounted, onUnmounted, nextTick, watchEffect, h, Teleport } from 'vue'
import { config } from '@vue/test-utils'

// Stub Teleport component for tests
config.global.stubs = {
  Teleport: {
    render() {
      // Just render children without teleporting
      return h('div', this.$slots.default ? this.$slots.default() : [])
    },
  },
}

// Auto-import components
config.global.components = {
  Icon: { template: '<span :class="name" />', props: ['name'] },
  NuxtLink: {
    template: '<a :href="to" :aria-label="ariaLabel"><slot /></a>',
    props: ['to', 'aria-label', 'ariaLabel'],
  },
  NuxtImg: {
    template: '<img :src="src" :alt="alt" :width="width" :height="height" />',
    props: ['src', 'alt', 'width', 'height', 'format', 'loading', 'fetchpriority', 'placeholder'],
  },
}

// Auto-import mocks
config.global.mocks = {
  $pwa: {
    showInstallPrompt: false,
    isPWAInstalled: false,
    needRefresh: false,
    offlineReady: false,
    install: vi.fn(),
    updateServiceWorker: vi.fn(),
    cancelPrompt: vi.fn(),
  },
}

// Add onKeyStroke mock that was missing
const onKeyStroke = vi.fn()

// Mock Nuxt composables that are not available in test environment
vi.mock('#app', () => ({
  useRoute: () => reactive({
    path: '/',
    fullPath: '/',
    params: {},
    query: {},
    meta: {},
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useRuntimeConfig: () => reactive({
    public: {
      siteUrl: 'https://vp-associates.com',
      wpApiUrl: 'https://www.vp-associates.com/wp-json/wp/v2',
      gaMeasurementId: 'G-TEST123456',
    },
  }),
  navigateTo: vi.fn(),
  useState: vi.fn((key, init) => {
    if (init) return ref(init())
    return ref(null)
  }),
  useFetch: vi.fn(() => ({
    data: ref(null),
    pending: ref(false),
    refresh: vi.fn(),
    error: ref(null),
  })),
  useAsyncFetch: vi.fn(() => ({
    data: ref(null),
    pending: ref(false),
    refresh: vi.fn(),
    error: ref(null),
  })),
  useAsyncData: vi.fn(() => ({
    data: ref(null),
    pending: ref(false),
    refresh: vi.fn(),
    error: ref(null),
  })),
  useLazyAsyncData: vi.fn(() => ({
    data: ref(null),
    pending: ref(false),
    refresh: vi.fn(),
    error: ref(null),
  })),
  useHead: vi.fn(),
  useSeoMeta: vi.fn(),
  definePageMeta: vi.fn(),
  onMounted: onMounted,
  onUnmounted: onUnmounted,
  onBeforeUnmount: vi.fn(),
  nextTick: nextTick,
  ref: ref,
  computed: computed,
  watch: watch,
  watchEffect: watchEffect,
  onKeyStroke: () => onKeyStroke,
  useCookie: vi.fn(() => ref(null)),
  useNuxtApp: vi.fn(() => ({
    $pwa: {
      showInstallPrompt: false,
      isPWAInstalled: false,
      needRefresh: false,
      offlineReady: false,
      install: vi.fn(),
      updateServiceWorker: vi.fn(),
      cancelPrompt: vi.fn(),
    },
  })),
  toValue: (val: any) => (typeof val === 'function' ? val() : val),
}))

// Mock @vueuse/core
vi.mock('@vueuse/core', () => ({
  useElementBounding: () => ({
    x: ref(0),
    y: ref(0),
    width: ref(0),
    height: ref(0),
    top: ref(0),
    right: ref(0),
    bottom: ref(0),
    left: ref(0),
    update: vi.fn(),
  }),
  useWindowSize: () => ({
    width: ref(1024),
    height: ref(768),
  }),
  useScroll: () => ({
    x: ref(0),
    y: ref(0),
    isScrolling: ref(false),
    arrivedState: reactive({ top: true, bottom: false }),
    directions: reactive({ top: false, bottom: false }),
  }),
  onClickOutside: vi.fn(),
  useFocus: () => ({ focused: ref(false) }),
  useActiveElement: () => ref(null),
  useMediaQuery: () => ref(false),
  useIntersectionObserver: vi.fn((target, callback, options) => {
    // Create stop function first so it's available when callback is called
    const stop = vi.fn()

    // Use queueMicrotask to trigger callback after stop is returned
    // This mimics the async nature of the real IntersectionObserver
    queueMicrotask(() => {
      callback([{ isIntersecting: true, target: target?.value }])
    })

    return { stop }
  }),
  usePreferredReducedMotion: () => ref('no-preference'),
  onKeyStroke: vi.fn((key: string, handler: Function) => {
    // Simple mock for onKeyStroke
    return { stop: vi.fn() }
  }),
  useMagicKeys: () => ({
    escape: ref(false),
    arrowLeft: ref(false),
    arrowRight: ref(false),
    arrowUp: ref(false),
    arrowDown: ref(false),
    home: ref(false),
    end: ref(false),
  }),
}))

// Mock @vueuse/integrations/useFocusTrap
vi.mock('@vueuse/integrations/useFocusTrap', () => ({
  useFocusTrap: () => ({
    hasFocus: ref(false),
    activate: vi.fn(),
    deactivate: vi.fn(),
  }),
}))

// Mock clipboard API
Object.assign(global, {
  navigator: {
    ...global.navigator,
    clipboard: {
      writeText: vi.fn(() => Promise.resolve()),
    },
  },
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock process.env
global.process.env = {
  ...process.env,
  NODE_ENV: 'test',
}

// Mock useNuxtApp for components
;(globalThis as typeof globalThis & { useNuxtApp: typeof vi.fn }).useNuxtApp = vi.fn(() => ({
  $pwa: {
    showInstallPrompt: false,
    isPWAInstalled: false,
    needRefresh: false,
    offlineReady: false,
    install: vi.fn(),
    updateServiceWorker: vi.fn(),
    cancelPrompt: vi.fn(),
  },
})) as never
