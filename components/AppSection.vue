<template>
  <section
    ref="sectionRef"
    :class="[
      'section',
      bgColorClass,
      paddingClass,
      { 'scroll-reveal': animateOnScroll, visible: isVisible }
    ]"
  >
    <div :class="containerClass">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'

interface Props {
  bgColor?: 'white' | 'neutral' | 'primary' | 'primary-dark' | 'secondary' | 'neutral-50' | 'neutral-100'
  container?: boolean | 'narrow' | 'wide'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  animateOnScroll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  bgColor: 'white',
  container: true,
  padding: 'lg',
  animateOnScroll: false
})

const sectionRef = ref<HTMLElement>()
const { target, isVisible } = useScrollReveal({ threshold: 0.15 })

// Sync target with sectionRef for scroll animation
watchEffect(() => {
  if (props.animateOnScroll) {
    target.value = sectionRef.value
  }
})

const bgColorClass = computed(() => {
  const colors = {
    white: 'bg-white',
    neutral: 'bg-neutral-900',
    primary: 'bg-primary text-white',
    'primary-dark': 'bg-primary-dark text-white',
    secondary: 'bg-secondary text-white',
    'neutral-50': 'bg-neutral-50',
    'neutral-100': 'bg-neutral-100'
  }
  return colors[props.bgColor]
})

const containerClass = computed(() => {
  if (!props.container) return ''
  if (props.container === 'narrow') return 'container max-w-5xl'
  if (props.container === 'wide') return 'container max-w-full'
  return 'container'
})

const paddingClass = computed(() => {
  const paddings = {
    none: '',
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16',
    lg: 'py-16 md:py-24 lg:py-32',
    xl: 'py-24 md:py-32 lg:py-40'
  }
  return paddings[props.padding]
})
</script>

<style scoped>
.section.scroll-reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.section.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
