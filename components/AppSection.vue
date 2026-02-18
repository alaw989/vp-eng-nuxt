<template>
  <section
    ref="sectionRef"
    :class="[
      'section relative',
      bgColorClass,
      paddingClass,
      {
        'scroll-reveal': animateOnScroll,
        visible: isVisible,
        'stagger-children': staggerChildren,
        'border-b border-neutral-200': border,
        'shadow-[0_8px_30px_rgb(0,0,0,0.03)]': elevation
      }
    ]"
    :style="patternStyle"
  >
    <!-- Top gradient fade (optional divider) -->
    <div v-if="topFade" class="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/80 to-transparent pointer-events-none"></div>

    <!-- Bottom gradient fade (optional divider) -->
    <div v-if="bottomFade" class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/80 to-transparent pointer-events-none"></div>

    <!-- Decorative corner accent (for brand recognition) -->
    <div v-if="cornerAccent === 'primary'" class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none"></div>
    <div v-if="cornerAccent === 'secondary'" class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary/10 to-transparent pointer-events-none"></div>

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
  border?: boolean
  elevation?: boolean
  topFade?: boolean
  bottomFade?: boolean
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

const bgColorClass = computed(() => {
  const colors = {
    white: 'bg-white',
    neutral: 'bg-neutral-900',
    primary: 'bg-primary text-white',
    'primary-dark': 'bg-primary-dark text-white',
    secondary: 'bg-secondary text-white',
    'neutral-50': 'bg-neutral-50',
    'neutral-100': 'bg-neutral-100',
    'neutral-50-pattern': 'bg-neutral-50',
    'neutral-100-pattern': 'bg-neutral-100',
    'secondary/5': 'bg-secondary/5', // Light green tint
    'secondary/10': 'bg-secondary/10' // Medium green tint
  }
  return colors[props.bgColor]
})

const patternStyle = computed(() => {
  if (props.bgColor === 'neutral-50-pattern') {
    return { backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239CA3AF' fill-opacity='0.06'%3E%3Ccircle cx='2' cy='2' r='1'/%3E%3Ccircle cx='12' cy='12' r='1'/%3E%3C/g%3E%3C/svg%3E\")" }
  }
  if (props.bgColor === 'neutral-100-pattern') {
    return { backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239CA3AF' fill-opacity='0.08'%3E%3Cpath d='M0 0h40v1H0z'/%3E%3Cpath d='M0 0h1v40H0z'/%3E%3C/g%3E%3C/svg%3E\")" }
  }
  return {}
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
