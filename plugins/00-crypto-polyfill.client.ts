/**
 * Crypto Polyfill Plugin
 *
 * MUST RUN FIRST - Polyfills Node.js crypto APIs for browser compatibility.
 * Some dependencies use crypto.randomUUID which is not available in browsers.
 *
 * This plugin has highest priority (enforce: 'pre') to ensure it runs before
 * any other code that might need crypto.randomUUID.
 */

export default defineNuxtPlugin({
  name: 'crypto-polyfill',
  enforce: 'pre', // Run this before all other plugins
  setup() {
    // Only run on client side
    if (import.meta.client) {
      // Polyfill crypto.randomUUID if it doesn't exist
      if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID !== 'function') {
        Object.defineProperty(crypto, 'randomUUID', {
          value: function randomUUID() {
            // Generate a v4 UUID using the browser's crypto API
            if ('getRandomValues' in crypto) {
              const bytes = new Uint8Array(16)
              crypto.getRandomValues(bytes)
              bytes[6] = (bytes[6]! & 0x0f) | 0x40 // Version 4
              bytes[8] = (bytes[8]! & 0x3f) | 0x80 // Variant 10
              const hex = Array.from(bytes)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
              return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
            }
            // Fallback to Math.random if crypto.getRandomValues is not available
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
              const r = Math.random() * 16 | 0
              const v = c === 'x' ? r : (r & 0x3 | 0x8)
              return v.toString(16)
            })
          },
          writable: false,
          configurable: false,
          enumerable: true
        })
      }

      // Also ensure globalThis.crypto exists
      if (typeof globalThis !== 'undefined' && !globalThis.crypto) {
        globalThis.crypto = crypto as any
      }
    }
  }
})
