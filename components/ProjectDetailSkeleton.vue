<template>
  <div>
    <!-- Header skeleton -->
    <div class="bg-primary-dark py-16">
      <div class="container">
        <div class="h-8 w-40 bg-white/20 rounded animate-pulse mb-6"></div>
        <div class="h-12 w-64 bg-white/30 rounded animate-pulse mb-4"></div>
        <div class="h-6 w-full max-w-3xl bg-white/20 rounded animate-pulse"></div>
      </div>
    </div>

    <!-- Gallery skeleton -->
    <div class="bg-neutral-100 py-8">
      <div class="container">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div v-for="i in 6" :key="i" class="aspect-[4/3] bg-neutral-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>

    <!-- Content skeleton -->
    <div class="bg-white py-16">
      <div class="container">
        <div class="grid lg:grid-cols-3 gap-12">
          <div class="lg:col-span-2">
            <div class="h-10 w-48 bg-neutral-200 rounded animate-pulse mb-6"></div>
            <div class="space-y-3">
              <div class="h-4 bg-neutral-200 rounded animate-pulse"></div>
              <div class="h-4 bg-neutral-200 rounded animate-pulse"></div>
              <div class="h-4 bg-neutral-200 rounded animate-pulse w-5/6"></div>
              <div class="h-4 bg-neutral-200 rounded animate-pulse"></div>
              <div class="h-4 bg-neutral-200 rounded animate-pulse w-4/6"></div>
            </div>
          </div>
          <div>
            <div class="bg-neutral-50 rounded-xl p-6">
              <div class="h-6 w-32 bg-neutral-200 rounded animate-pulse mb-4"></div>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <div class="h-4 w-24 bg-neutral-200 rounded animate-pulse"></div>
                  <div class="h-4 w-20 bg-neutral-200 rounded animate-pulse"></div>
                </div>
                <div class="flex justify-between">
                  <div class="h-4 w-24 bg-neutral-200 rounded animate-pulse"></div>
                  <div class="h-4 w-20 bg-neutral-200 rounded animate-pulse"></div>
                </div>
                <div class="flex justify-between">
                  <div class="h-4 w-24 bg-neutral-200 rounded animate-pulse"></div>
                  <div class="h-4 w-20 bg-neutral-200 rounded animate-pulse"></div>
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
// Project detail page loading skeleton
</script>
