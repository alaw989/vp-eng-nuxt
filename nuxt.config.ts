import { wordpressRoutes } from './utils/prerenderRoutes'

// Self-hosted Google Fonts in /public/fonts: latin subset, one variable-weight file per family
const fontFace = (family: string, file: string) =>
  `@font-face{font-family:'${family}';font-style:normal;font-weight:400 700;font-display:swap;src:url(/fonts/${file}) format('woff2');unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD}`

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },

  vite: {
    // Dev only: let the tailnet (tailscale serve) reach the dev server
    server: {
      allowedHosts: ['.ts.net'],
    },
    build: {
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Split Leaflet into its own chunk (loaded lazily with ServiceAreaMap)
              if (id.includes('leaflet')) {
                return 'vendor-leaflet'
              }
            }
          }
        }
      }
    },
  },

  modules: [
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/sitemap',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    ['@nuxt/a11y', {
      // Only enable in development - this module is a dev-only
      // accessibility checker and should not run in production
      enabled: process.env.NODE_ENV === 'development',
      logIssues: true,
      axe: {
        runOptions: {
          runOnly: ['wcag21aa'],
        },
      },
    }],
    '@nuxt/icon',
    '@vite-pwa/nuxt',
    '@nuxtjs/critters',
  ],

  typescript: {
    strict: true,
    typeCheck: true,  // Enabled for production builds
  },

  // Critical CSS (beasties): leave inline <style> tags whole. Pruning them drops
  // the @font-face rules in app.head, since font faces never match a selector.
  critters: {
    config: { reduceInlineStyles: false },
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'VP Associates - Structural Engineering Services',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'VP Associates provides structural engineering services in Tampa Bay including steel, concrete, masonry, wood, foundations, seawalls, and steel detailing.' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'canonical', href: 'https://vp-associates.com' },
        { rel: 'alternate', type: 'application/rss+xml', title: 'VP Associates RSS Feed', href: 'https://vp-associates.com/rss.xml' },

        // Self-hosted fonts (@font-face below): fetch them alongside the CSS
        { rel: 'preload', href: '/fonts/inter-latin-v20.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
        { rel: 'preload', href: '/fonts/roboto-condensed-latin-v31.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
      ],
      // Declared in the head, not main.css: the critical-CSS step defers main.css,
      // so the first paint would otherwise use fallback fonts and then shift
      style: [
        { textContent: fontFace('Inter', 'inter-latin-v20.woff2') + fontFace('Roboto Condensed', 'roboto-condensed-latin-v31.woff2') },
      ],
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
    layoutTransition: {
      name: 'layout',
      mode: 'out-in',
    },
  },

  // Sitemap configuration
  // Dynamic sitemap generation is handled by server/routes/sitemap.xml.ts
  // which includes WordPress API fetching for projects and services
  // The @nuxtjs/sitemap module is configured but disabled to avoid conflicts
  sitemap: {
    // Disable module's automatic sitemap - using custom server route instead
    // which has access to WordPress API for dynamic content
    enabled: false,
  },

  // 301 redirects for URL changes from WordPress migration
  // Preserves SEO value by redirecting old URLs to new locations
  routeRules: {
    // Page name changes
    '/about-3': { redirect: { to: '/about', statusCode: 301 } },
    '/about-3/': { redirect: { to: '/about', statusCode: 301 } },

    // Section rename: portfolio -> projects
    '/portfolio': { redirect: { to: '/projects', statusCode: 301 } },
    '/portfolio/': { redirect: { to: '/projects', statusCode: 301 } },

    // Gallery structure changes: /gallery/{slug} -> /projects/{slug}
    '/gallery/132': { redirect: { to: '/projects/132', statusCode: 301 } },
    '/gallery/132/': { redirect: { to: '/projects/132', statusCode: 301 } },
    '/gallery/bridges': { redirect: { to: '/projects/bridges', statusCode: 301 } },
    '/gallery/bridges/': { redirect: { to: '/projects/bridges', statusCode: 301 } },
    '/gallery/commercial': { redirect: { to: '/projects/commercial', statusCode: 301 } },
    '/gallery/commercial/': { redirect: { to: '/projects/commercial', statusCode: 301 } },
    '/gallery/misc': { redirect: { to: '/projects/misc', statusCode: 301 } },
    '/gallery/misc/': { redirect: { to: '/projects/misc', statusCode: 301 } },

    // Trailing slash normalization (WordPress used trailing slashes, Nuxt does not)
    // Note: Removed /services/, /careers/, /contact/ redirects as they were causing infinite loops
    // The NuxtLink component handles navigation without trailing slashes naturally
    // '/contact/': { redirect: { to: '/contact', statusCode: 301 } }, // DISABLED - conflicts with page route
  },

  // Image optimization configuration
  image: {
    quality: 80,
    // Note: Removed 'avif' from format list as it can cause srcset parsing issues
    // in some browsers when IPX generates fallback URLs
    format: ['webp', 'jpg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    // Ensure proper provider and densities configuration
    provider: 'ipx',
    densities: [1, 2],
  },

  // Production is static, so there is no icon endpoint and missing icons are
  // fetched from api.iconify.design after hydration. Bundle every icon name
  // the source mentions instead.
  icon: {
    clientBundle: {
      scan: {
        globInclude: ['app.vue', '{components,layouts,pages}/**/*.vue', '{composables,utils,server}/**/*.ts'],
        globExclude: ['**/__tests__/**', '**/*.spec.ts'],
      },
    },
  },

  // Static site generation: prerender every WordPress detail page, plus pages
  // the crawler cannot reach from prerendered links. Production is static
  // nginx, so a route that is not prerendered does not exist there.
  hooks: {
    async 'nitro:config'(nitroConfig) {
      if (nitroConfig.dev) return
      const wpApiUrl = process.env.WP_API_URL || process.env.NUXT_PUBLIC_WP_API_URL || 'https://cms.vp-associates.com/wp-json/wp/v2'
      // Throws if WordPress is unreachable: failing the build keeps the live site intact
      const routes = ['/contact', ...await wordpressRoutes(wpApiUrl)]
      console.info(`[prerender] ${routes.length} routes from WordPress and static pages`)

      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = [...(nitroConfig.prerender.routes || []), ...routes]
    },
  },

  // Nitro server configuration for deployment
  nitro: {
    preset: 'node-server',
    // Enable compression for better performance (gzip + brotli)
    compressPublicAssets: true,
    routeRules: {
      '/': { prerender: true, headers: { 'Cache-Control': 'public, max-age=3600' } },
      '/about': { prerender: true, headers: { 'Cache-Control': 'public, max-age=3600' } },
      '/services': { prerender: true, headers: { 'Cache-Control': 'public, max-age=3600' } },
      '/projects': { prerender: true, headers: { 'Cache-Control': 'public, max-age=3600' } },
      '/careers': { prerender: true, headers: { 'Cache-Control': 'public, max-age=3600' } },
      '/search': { prerender: true, headers: { 'Cache-Control': 'public, max-age=1800' } },
      '/sitemap': { prerender: true, headers: { 'Cache-Control': 'public, max-age=86400' } },
      '/sitemap.xml': { prerender: true, headers: { 'Cache-Control': 'public, max-age=86400' } },
      '/rss.xml': { prerender: true, headers: { 'Cache-Control': 'public, max-age=3600' } },
      '/privacy': { prerender: true, headers: { 'Cache-Control': 'public, max-age=86400' } },
      '/terms': { prerender: true, headers: { 'Cache-Control': 'public, max-age=86400' } },
      '/accessibility': { prerender: true, headers: { 'Cache-Control': 'public, max-age=86400' } },
      '/images/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
      '/_nuxt/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    },
    // Enable experimental features for better performance
    experimental: {
      // Enable async context for better performance
      asyncContext: true,
    },
  },

  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys (server-side only)
    wpApiUrl: process.env.WP_API_URL || 'https://cms.vp-associates.com/wp-json/wp/v2',

    // Public keys (exposed to client)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://vp-associates.com',
      wpApiUrl: process.env.NUXT_PUBLIC_WP_API_URL || 'https://cms.vp-associates.com/wp-json/wp/v2',
      // Google Analytics 4 Measurement ID (optional)
      // Set NUXT_PUBLIC_GA_MEASUREMENT_ID in .env to enable
      // Example: NUXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || '',
      // Contact form submissions go to Formspree (the production site has no server runtime)
      formspreeEndpoint: process.env.NUXT_PUBLIC_FORMSPREE_ENDPOINT || 'https://formspree.io/f/xzezkwvd',
    },
  },

  // Experimental features for optimization
  experimental: {
    // Enable typed pages for better type safety
    typedPages: true,
    // Enable view transition API for smoother page transitions
    viewTransition: false, // Disabled - causing infinite redirect issues
    // Enable inline payload for faster initial page loads
    inlineRouteRules: false, // Keep separate for better caching
  },

  // PWA configuration for offline support and install prompts
  pwa: {
    // New deploys take over on the next visit instead of waiting for every tab to close
    registerType: 'autoUpdate',
    // Register web manifest in route rules
    registerWebManifestInRouteRules: true,
    // Enable install prompt interception
    client: {
      installPrompt: true,
      // Register the PWA plugin for update notifications
      registerPlugin: true,
      // Periodic sync for updates (check every 1 hour)
      periodicSyncForUpdates: 3600,
    },
    // PWA manifest configuration
    manifest: {
      name: 'VP Associates - Structural Engineering Services',
      short_name: 'VP Associates',
      description: 'VP Associates provides structural engineering services in Tampa Bay including steel, concrete, masonry, wood, foundations, seawalls, and steel detailing.',
      theme_color: '#1e40af',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait-primary',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/favicon.svg',
          sizes: '192x192 512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        },
        {
          src: '/images/og-default.jpg',
          sizes: '192x192',
          type: 'image/jpeg',
          purpose: 'any'
        },
        {
          src: '/images/og-default.jpg',
          sizes: '512x512',
          type: 'image/jpeg',
          purpose: 'any maskable'
        }
      ]
    },
    // Workbox configuration for service worker
    workbox: {
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
      // Navigate to fallback page for offline navigation
      navigateFallback: '/offline',
      // Glob patterns for precaching app shell resources
      globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,woff2}'],
      // Banner drawings (full ~105KB, lite ~20KB gzipped) are fetched by
      // BannerDrawing when a banner needs one; only that device's size is used
      globIgnores: ['images/drawings/**'],
      // Runtime caching strategies
      runtimeCaching: [
        // Cache WordPress API responses with network-first strategy
        {
          urlPattern: /^https:\/\/cms\.vp-associates\.com\/wp-json\/wp\/v2\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'wp-api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 // 24 hours
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // Cache images with cache-first strategy
        {
          urlPattern: /\.(?:png|jpg|jpeg|webp|avif|gif|svg)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            }
          }
        },
        // Cache static assets (JS, CSS) - app shell uses CacheFirst for instant loads
        {
          urlPattern: /^https:\/\/.*\.(?:js|css)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'app-shell-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
            }
          }
        }
      ]
    },
    // Enable dev options for testing
    devOptions: {
      enabled: false, // Disable in development
      type: 'module'
    }
  }
})
