<template>
  <section
    ref="sectionRef"
    :class="[
      'section relative overflow-hidden',
      bgColorClass,
      paddingClass,
      {
        'scroll-reveal': animateOnScroll,
        visible: isVisible,
        'stagger-children': staggerChildren
      }
    ]"
  >
    <!-- Top gradient fade (optional divider) -->
    <div v-if="topFade" class="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/80 to-transparent pointer-events-none"></div>

    <!-- Bottom gradient fade (optional divider) -->
    <div v-if="bottomFade" class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/80 to-transparent pointer-events-none"></div>

    <div :class="[containerClass, 'relative z-10']">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useScrollReveal } from '~/composables/useScrollReveal'

interface Props {
  bgColor?: 'white' | 'neutral' | 'primary' | 'primary-dark' | 'secondary' | 'neutral-50' | 'neutral-100' | 'neutral-50-pattern' | 'neutral-100-pattern' | 'secondary/5' | 'secondary/10'
  container?: boolean | 'narrow' | 'wide'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  animateOnScroll?: boolean
  staggerChildren?: boolean
  /** @deprecated Sections no longer draw borders; kept so existing callers compile */
  border?: boolean
  /** @deprecated Sections no longer cast shadows; kept so existing callers compile */
  elevation?: boolean
  topFade?: boolean
  bottomFade?: boolean
  /** @deprecated No longer renders anything; kept so existing callers compile */
  cornerAccent?: 'none' | 'primary' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  bgColor: 'white',
  container: true,
  padding: 'lg',
  animateOnScroll: false,
  staggerChildren: false,
  border: false,
  elevation: false,
  topFade: false,
  bottomFade: false,
  cornerAccent: 'none'
})

const sectionRef = ref<HTMLElement>()
const { target, isVisible, hasRevealed } = useScrollReveal({
  threshold: 0.15,
  once: true,
  rootMargin: '-50px',
  staggerChildren: props.staggerChildren
})

// Sync target with sectionRef for scroll animation
watchEffect(() => {
  if (props.animateOnScroll) {
    target.value = sectionRef.value
  }
})

// Four backgrounds only: white, one light tint, and the navy and dark bands.
// Legacy tints map onto the light tint so every page keeps the same rhythm.
const bgColorClass = computed(() => {
  const colors = {
    white: 'bg-white',
    neutral: 'bg-neutral-900 bg-blueprint bg-grid',
    primary: 'bg-primary bg-blueprint bg-grid text-white',
    'primary-dark': 'bg-primary-dark bg-blueprint bg-grid text-white',
    secondary: 'bg-primary bg-blueprint bg-grid text-white',
    'neutral-50': 'bg-neutral-50',
    'neutral-100': 'bg-neutral-50',
    'neutral-50-pattern': 'bg-neutral-50',
    'neutral-100-pattern': 'bg-neutral-50',
    'secondary/5': 'bg-neutral-50',
    'secondary/10': 'bg-neutral-50'
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

/* Reduced motion support for scroll animations */
@media (prefers-reduced-motion: reduce) {
  .section.scroll-reveal {
    transition: opacity 300ms linear;
    transform: none !important;
  }

  .section.scroll-reveal.visible {
    opacity: 1;
    transform: none;
  }
}
</style>
