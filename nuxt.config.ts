// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/sitemap',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    ['@nuxt/a11y', {
      // Enable the module (default: true in dev mode)
      enabled: true,
      // Log violations to browser console
      logIssues: true,
      // Configure axe-core
      axe: {
        runOptions: {
          // WCAG 2.1 Level AA compliance
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
        { rel: 'canonical', href: 'https://vp-associates.com' },
        { rel: 'alternate', type: 'application/rss+xml', title: 'VP Associates RSS Feed', href: 'https://vp-associates.com/rss.xml' },

        // Font optimization: Preconnect to Google Fonts domains
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },

        // Preload critical fonts with font-display: swap
        {
          rel: 'preload',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Condensed:wght@400;500;700&display=swap',
          as: 'style'
        },

        // Load Google Fonts
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Condensed:wght@400;500;700&display=swap'
        },

        // Iconify preconnect
        { rel: 'preconnect', href: 'https://api.iconify.design' },
        { rel: 'dns-prefetch', href: 'https://api.iconify.design' },

        // Leaflet CSS for map component
        { rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', integrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=', crossorigin: '' },
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
    '/contact/': { redirect: { to: '/contact', statusCode: 301 } },
  },

  // Image optimization configuration
  image: {
    quality: 80,
    format: ['webp', 'avif', 'jpg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
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
      '/contact': { prerender: true, headers: { 'Cache-Control': 'public, max-age=3600' } },
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

  // Build configuration for bundle optimization
  vite: {
    // Optimize chunk size warning limit
    build: {
      chunkSizeWarningLimit: 500,
    },
  },

  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys (server-side only)
    wpApiUrl: process.env.WP_API_URL || 'https://www.vp-associates.com/wp-json/wp/v2',

    // Public keys (exposed to client)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://vp-associates.com',
      wpApiUrl: process.env.NUXT_PUBLIC_WP_API_URL || 'https://www.vp-associates.com/wp-json/wp/v2',
      // Google Analytics 4 Measurement ID (optional)
      // Set NUXT_PUBLIC_GA_MEASUREMENT_ID in .env to enable
      // Example: NUXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || '',
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
          src: '/images/icon.svg',
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
      // Navigate to fallback page for offline navigation
      navigateFallback: '/offline',
      // Glob patterns for precaching app shell resources
      globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,woff2}'],
      // Runtime caching strategies
      runtimeCaching: [
        // Cache WordPress API responses with network-first strategy
        {
          urlPattern: /^https:\/\/www\.vp-associates\.com\/wp-json\/wp\/v2\/.*/i,
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
        // Cache Google Fonts
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
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
