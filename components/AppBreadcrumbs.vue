<template>
  <nav aria-label="Breadcrumb" class="app-breadcrumbs">
    <ol class="flex items-center gap-2 text-sm flex-wrap" itemscope itemtype="https://schema.org/BreadcrumbList">
      <li class="flex items-center gap-2" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <link itemprop="item" href="https://vp-associates.com/" />
        <meta itemprop="name" content="Home" />
        <meta itemprop="position" content="1" />
        <NuxtLink
          to="/"
          class="text-neutral-600 hover:text-primary transition-colors"
          aria-label="Home"
        >
          <Icon name="mdi:home" class="w-4 h-4" />
        </NuxtLink>
      </li>
      <li
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
        class="flex items-center gap-2"
        itemprop="itemListElement"
        itemscope
        itemtype="https://schema.org/ListItem"
      >
        <Icon name="mdi:chevron-right" class="w-4 h-4 text-neutral-400" aria-hidden="true" />
        <link
          v-if="crumb.to"
          itemprop="item"
          :href="`https://vp-associates.com${crumb.to}`"
        />
        <meta itemprop="name" :content="crumb.title" />
        <meta itemprop="position" :content="String(index + 2)" />
        <NuxtLink
          v-if="crumb.to && index < breadcrumbs.length - 1"
          :to="crumb.to"
          class="text-neutral-600 hover:text-primary transition-colors"
        >
          {{ crumb.title }}
        </NuxtLink>
        <span v-else class="text-neutral-900 font-medium" aria-current="page">
          {{ crumb.title }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface Breadcrumb {
  title: string
  to?: string
}

interface Props {
  breadcrumbs: Breadcrumb[]
}

defineProps<Props>()
</script>

<style scoped>
.app-breadcrumbs {
  @apply py-4;
}
</style>
