<template>
  <div class="min-h-screen bg-neutral-50 py-16">
    <div class="container max-w-4xl mx-auto px-4">
      <!-- Breadcrumb -->
      <AppBreadcrumbs
        :breadcrumbs="[{ title: 'Accessibility Statement', to: '/accessibility' }]"
      />

      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
          Accessibility Statement
        </h1>
        <p class="text-lg text-neutral-600">
          Last Updated: {{ currentDate }}
        </p>
      </div>

      <!-- Content -->
      <AppSection bg-color="white">
        <template #default>
          <div class="prose prose-lg max-w-none">
            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Our Commitment</h2>
              <p class="text-neutral-700 mb-4">
                VP Associates is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply the relevant accessibility standards.
              </p>
              <p class="text-neutral-700">
                We believe that every person has the right to live with dignity, equality, comfort, and independence. We are actively working to ensure our website is accessible to the widest possible audience, regardless of ability or technology.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Conformance Status</h2>
              <p class="text-neutral-700 mb-4">
                The Web Content Accessibility Guidelines (WCAG) define requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.
              </p>
              <p class="text-neutral-700">
                <strong>VP Associates website</strong> is <strong>partially conformant</strong> with <strong>WCAG 2.1 Level AA</strong>. Partially conformant means that some parts of the content do not fully conform to the accessibility standard.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Accessibility Features</h2>
              <p class="text-neutral-700 mb-4">Our website includes the following accessibility features:</p>
              <ul class="list-disc pl-6 text-neutral-700 space-y-2">
                <li><strong>Semantic HTML:</strong> Proper heading structure and landmark regions for screen reader navigation</li>
                <li><strong>Keyboard Navigation:</strong> Full keyboard accessibility with visible focus indicators</li>
                <li><strong>Alt Text:</strong> Descriptive alternative text for images</li>
                <li><strong>Form Labels:</strong> Clear labels and error messages for form inputs</li>
                <li><strong>Skip Links:</strong> Skip-to-content link for keyboard users</li>
                <li><strong>ARIA Labels:</strong> Accessible Rich Internet Applications attributes where needed</li>
                <li><strong>Color Contrast:</strong> Text meets or exceeds WCAG AA contrast requirements</li>
                <li><strong>Responsive Design:</strong> Content works across devices and screen sizes</li>
                <li><strong>Text Sizing:</strong> Text can be resized up to 200% without loss of content</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Technical Specifications</h2>
              <p class="text-neutral-700 mb-4">Accessibility of our website relies on the following technologies:</p>
              <ul class="list-disc pl-6 text-neutral-700 space-y-2">
                <li>HTML5</li>
                <li>CSS3 (with responsive design)</li>
                <li>JavaScript (Vue.js / Nuxt 3)</li>
              </ul>
              <p class="text-neutral-700 mt-4">
                These technologies rely upon the following browser accessibility features:
              </p>
              <ul class="list-disc pl-6 text-neutral-700 space-y-2">
                <li>HTML semantic elements</li>
                <li>ARIA attributes and roles</li>
                <li>Keyboard navigation support</li>
                <li>Screen reader compatibility</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Known Limitations</h2>
              <p class="text-neutral-700 mb-4">
                Despite our best efforts to ensure accessibility, there may be some limitations. Below is a description of known limitations and potential solutions:
              </p>

              <div class="space-y-4">
                <div class="p-4 bg-neutral-50 rounded-lg">
                  <h3 class="font-semibold text-neutral-900 mb-2">Third-Party Content</h3>
                  <p class="text-neutral-700 text-sm">
                    Some third-party content (such as embedded maps or documents) may not be fully accessible. We are working with vendors to improve accessibility of these components.
                  </p>
                </div>

                <div class="p-4 bg-neutral-50 rounded-lg">
                  <h3 class="font-semibold text-neutral-900 mb-2">Historical Content</h3>
                  <p class="text-neutral-700 text-sm">
                    Some older content may not meet all current accessibility standards. We are reviewing and updating legacy content as part of our ongoing accessibility efforts.
                  </p>
                </div>

                <div class="p-4 bg-neutral-50 rounded-lg">
                  <h3 class="font-semibold text-neutral-900 mb-2">Project Images</h3>
                  <p class="text-neutral-700 text-sm">
                    Some project photos may have limited alternative text descriptions. We are working to enhance descriptions for all visual content.
                  </p>
                </div>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Accessibility Assistance</h2>
              <p class="text-neutral-700 mb-4">
                If you experience difficulty accessing any content on our website, or if you would like to request an accommodation, please contact us:
              </p>
              <div class="space-y-2 text-neutral-700">
                <p><strong>Email:</strong> <a href="mailto:accessibility@vp-associates.com" class="text-primary hover:underline">accessibility@vp-associates.com</a></p>
                <p><strong>Phone:</strong> (813) 251-4141</p>
                <p><strong>Mail:</strong> VP Associates, 6202 Courtney Drive, Tampa, FL 33615</p>
              </div>
              <p class="text-neutral-700 mt-4">
                We will try to respond to your request within 2-3 business days and provide you with the information you need through an alternative communication method or format.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Screen Reader Support</h2>
              <p class="text-neutral-700 mb-4">
                Our website is designed to work with popular screen readers, including:
              </p>
              <ul class="list-disc pl-6 text-neutral-700 space-y-2">
                <li>NVDA (Windows)</li>
                <li>JAWS (Windows)</li>
                <li>VoiceOver (macOS and iOS)</li>
                <li>TalkBack (Android)</li>
              </ul>
              <p class="text-neutral-700 mt-4">
                Screen reader users should navigate using standard screen reader commands rather than mouse-based interactions.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Browser Accessibility Tools</h2>
              <p class="text-neutral-700 mb-4">Most modern browsers include built-in accessibility features:</p>

              <h3 class="text-lg font-semibold text-neutral-900 mt-6 mb-3">Windows / macOS</h3>
              <ul class="list-disc pl-6 text-neutral-700 space-y-2">
                <li><strong>Zoom:</strong> Use Ctrl/+ (Windows) or Cmd/+ (Mac) to zoom in</li>
                <li><strong>High Contrast:</strong> Enable in system accessibility settings</li>
                <li><strong>Reduce Motion:</strong> Enable in system preferences for animations</li>
              </ul>

              <h3 class="text-lg font-semibold text-neutral-900 mt-6 mb-3">Mobile Devices</h3>
              <ul class="list-disc pl-6 text-neutral-700 space-y-2">
                <li><strong>iOS:</strong> Use VoiceOver from Settings > Accessibility</li>
                <li><strong>Android:</strong> Use TalkBack from Settings > Accessibility</li>
                <li><strong>Zoom:</strong> Use pinch-to-zoom gesture</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Ongoing Efforts</h2>
              <p class="text-neutral-700 mb-4">
                VP Associates is continuously working to improve the accessibility of our website. Our efforts include:
              </p>
              <ul class="list-disc pl-6 text-neutral-700 space-y-2">
                <li>Regular accessibility audits and testing</li>
                <li>Training for content creators and developers</li>
                <li>Incorporating accessibility into our design and development processes</li>
                <li>Testing with assistive technologies</li>
                <li>Addressing user feedback and accessibility issues promptly</li>
              </ul>
            </section>

            <section>
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Feedback</h2>
              <p class="text-neutral-700">
                We welcome your feedback on the accessibility of our website. Please let us know if you encounter accessibility barriers or have suggestions for improvement. Your input helps us create a better experience for all users.
              </p>
            </section>

            <!-- Accessibility Resources -->
            <div class="mt-12 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
              <h3 class="text-xl font-bold text-neutral-900 mb-4">Additional Accessibility Resources</h3>
              <ul class="space-y-2 text-neutral-700">
                <li><a href="https://www.w3.org/WAI/standards-guidelines/wcag/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">WCAG 2.1 Guidelines (W3C)</a></li>
                <li><a href="https://www.ada.gov/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">Americans with Disabilities Act (ADA)</a></li>
                <li><a href="https://www.section508.gov/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">Section 508 Requirements</a></li>
              </ul>
            </div>
          </div>
        </template>
      </AppSection>
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO Meta Tags
usePageMeta({
  title: 'Accessibility Statement',
  titleSuffix: false,
  description: 'VP Associates Accessibility Statement. Our commitment to digital accessibility and WCAG 2.1 AA compliance.',
  keywords: 'accessibility, WCAG, ADA, VP Associates, accessibility statement',
})

// Current date for last updated
const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>
