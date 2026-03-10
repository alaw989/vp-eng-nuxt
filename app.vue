<script setup lang="ts">
/**
 * Crypto Polyfill for Browser
 *
 * This must run before any other code to ensure crypto.randomUUID is available.
 * Some dependencies use this Node.js API which doesn't exist in browsers.
 */
if (import.meta.client) {
  // Polyfill crypto.randomUUID for browsers that don't have it
  if (typeof crypto !== 'undefined' && !('randomUUID' in crypto)) {
    Object.defineProperty(crypto, 'randomUUID', {
      value: function randomUUID() {
        // Generate a v4 UUID
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
        // Fallback
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
}
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
