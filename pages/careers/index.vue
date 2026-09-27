<template>
  <div>
    <!-- Page Banner -->
    <PageBanner
      headline="Careers"
      subheadline="Structural engineering and steel detailing in Tampa"
      background-image="/images/hero/construction-site-1920w.jpg"
      background-alt="Active construction site"
      aria-label="Careers page banner"
    />

    <!-- The Work -->
    <AppSection bg-color="white" animate-on-scroll>
      <div class="max-w-3xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6">
          The work
        </h2>
        <p class="text-lg text-neutral-600 mb-4">
          VP &amp; Associates is a small structural engineering and steel detailing firm based in Tampa. We design
          structural steel, concrete, masonry and wood, produce connection designs and lifting plans, and detail
          steel in SDS2 for industrial contractors, commercial architects and steel fabricators.
        </p>
        <p class="text-lg text-neutral-600">
          Engineers and detailers here work on the same projects, from 3-D analysis and ACAD drawings through to
          fabrication-ready detail sheets.
        </p>
      </div>
    </AppSection>

    <!-- Open Positions -->
    <AppSection bg-color="neutral-50" animate-on-scroll>
      <div class="text-center py-16 bg-white rounded-xl max-w-3xl mx-auto">
        <Icon name="mdi:inbox-outline" class="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-neutral-900 mb-4">No open positions at this time</h2>
        <p class="text-neutral-600 mb-6 px-6">
          If you're a structural engineer or steel detailer interested in future openings, send us your resume.
        </p>
        <NuxtLink
          to="/contact"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Submit Your Resume
          <Icon name="mdi:arrow-right" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </AppSection>

    <!-- CTA Section -->
    <AppSection bg-color="secondary" padding="xl">
      <div class="container text-center text-white">
        <h2 class="text-4xl md:text-5xl font-display font-bold mb-6">
          Questions about working with us?
        </h2>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/contact"
            class="px-8 py-4 bg-white text-secondary rounded-lg font-semibold hover:bg-neutral-100 hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Icon name="mdi:email" class="w-5 h-5" />
            Contact Us
          </NuxtLink>
          <a
            href="tel:+18134862079"
            class="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          >
            <Icon name="mdi:phone" class="w-5 h-5" />
            (813) 486-2079
          </a>
        </div>
      </div>
    </AppSection>
  </div>
</template>

<script setup lang="ts">
// SEO Meta Tags
usePageMeta({
  title: 'Careers',
  description: 'Careers at VP & Associates, a structural engineering and steel detailing firm in Tampa, FL. No open positions at this time; resumes welcome.',
  keywords: 'structural engineering careers, steel detailing jobs Tampa, structural engineer Tampa',
  ogImage: 'https://vp-associates.com/images/og-default.jpg',
})

// Organization Schema for careers
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VP Associates',
  url: 'https://vp-associates.com',
  logo: 'https://vp-associates.com/wp-content/uploads/2018/06/vplogowhite.png',
  sameAs: [
    'https://www.linkedin.com/company/vp-&-associates-inc',
  ],
})
</script>
