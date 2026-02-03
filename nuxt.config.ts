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
    '@nuxt/icon',
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
        { rel: 'preconnect', href: 'https://api.iconify.design' },
        { rel: 'dns-prefetch', href: 'https://api.iconify.design' },
        { rel: 'alternate', type: 'application/rss+xml', title: 'VP Associates RSS Feed', href: 'https://vp-associates.com/api/rss.xml' },
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

  // Sitemap configuration - will use environment variable NUXT_PUBLIC_SITE_URL
  // Defaults to https://vp-associates.com
  sitemap: {
    // Exclude dynamic routes that need server-side data
    exclude: ['/api/**'],
    // Enable zero-runtime to reduce server bundle size
    zeroRuntime: true,
  },

  // Image optimization configuration
  image: {
    quality: 80,
    format: ['webp', 'avif'],
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
    routeRules: {
      '/': { prerender: true },
      '/about': { prerender: true },
      '/services': { prerender: true },
      '/projects': { prerender: true },
      '/careers': { prerender: true },
      '/contact': { prerender: true },
      '/search': { prerender: true },
      '/sitemap': { prerender: true },
    },
  },

  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys (server-side only)
    wpApiUrl: process.env.WP_API_URL || 'https://whataustinhasmade.com/vp-eng/wp-json/wp/v2',

    // Public keys (exposed to client)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://vp-associates.com',
      wpApiUrl: process.env.NUXT_PUBLIC_WP_API_URL || 'https://whataustinhasmade.com/vp-eng/wp-json/wp/v2',
    },
  },
})
