<template>
  <div class="space-y-6">
    <!-- Pages skeleton -->
    <div>
      <div class="h-6 w-32 bg-neutral-200 rounded animate-pulse mb-4"></div>
      <div class="space-y-3">
        <div v-for="i in 3" :key="i" class="p-4 rounded-lg border border-neutral-200">
          <div class="flex items-start gap-3">
            <div class="w-5 h-5 bg-neutral-200 rounded animate-pulse flex-shrink-0 mt-0.5"></div>
            <div class="flex-1">
              <div class="h-5 bg-neutral-200 rounded animate-pulse mb-2 w-3/4"></div>
              <div class="h-4 bg-neutral-200 rounded animate-pulse w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Services skeleton -->
    <div>
      <div class="h-6 w-32 bg-neutral-200 rounded animate-pulse mb-4"></div>
      <div class="grid md:grid-cols-2 gap-3">
        <div v-for="i in 4" :key="i" class="p-4 rounded-lg border border-neutral-200">
          <div class="flex items-start gap-3">
            <div class="w-5 h-5 bg-neutral-200 rounded animate-pulse flex-shrink-0 mt-0.5"></div>
            <div class="flex-1">
              <div class="h-5 bg-neutral-200 rounded animate-pulse mb-2 w-2/3"></div>
              <div class="h-4 bg-neutral-200 rounded animate-pulse w-full"></div>
              <div class="h-4 bg-neutral-200 rounded animate-pulse w-2/3 mt-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Search result loading skeleton component
</script>
