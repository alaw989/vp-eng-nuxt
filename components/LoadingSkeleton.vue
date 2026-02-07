<template>
  <div class="animate-pulse" aria-hidden="true">
    <div class="bg-neutral-200 rounded-lg" :class="heightClass"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 'h-48'
})

const heightClass = computed(() => props.height)
</script>
