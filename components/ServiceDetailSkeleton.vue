<template>
  <div>
    <!-- Header skeleton -->
    <div class="bg-primary-dark py-16">
      <div class="container">
        <div class="h-8 w-40 bg-white/20 rounded animate-pulse mb-6"></div>
        <div class="flex items-center gap-4 mb-4">
          <div class="h-16 w-16 bg-white/10 rounded-xl animate-pulse"></div>
          <div class="h-10 w-64 bg-white/30 rounded animate-pulse"></div>
        </div>
        <div class="h-6 w-full max-w-3xl bg-white/20 rounded animate-pulse"></div>
      </div>
    </div>

    <!-- Content skeleton -->
    <div class="bg-white py-16">
      <div class="container">
        <div class="grid md:grid-cols-2 gap-12">
          <div>
            <div class="h-10 w-48 bg-neutral-200 rounded animate-pulse mb-6"></div>
            <div class="space-y-3">
              <div class="h-4 bg-neutral-200 rounded animate-pulse"></div>
              <div class="h-4 bg-neutral-200 rounded animate-pulse"></div>
              <div class="h-4 bg-neutral-200 rounded animate-pulse w-5/6"></div>
              <div class="h-4 bg-neutral-200 rounded animate-pulse"></div>
              <div class="h-4 bg-neutral-200 rounded animate-pulse w-4/6"></div>
              <div class="h-4 bg-neutral-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div>
            <div class="h-8 w-40 bg-neutral-200 rounded animate-pulse mb-6"></div>
            <div class="space-y-4">
              <div v-for="i in 5" :key="i" class="flex items-start gap-3">
                <div class="w-6 h-6 bg-neutral-200 rounded-full animate-pulse flex-shrink-0 mt-0.5"></div>
                <div class="flex-1">
                  <div class="h-4 bg-neutral-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Service detail page loading skeleton
</script>
