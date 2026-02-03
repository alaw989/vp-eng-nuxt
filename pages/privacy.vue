<template>
  <div class="min-h-screen bg-neutral-50 py-16">
    <div class="container max-w-4xl mx-auto px-4">
      <!-- Breadcrumb -->
      <AppBreadcrumbs
        :breadcrumbs="[{ title: 'Privacy Policy', to: '/privacy' }]"
      />

      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
          Privacy Policy
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
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Introduction</h2>
              <p class="text-neutral-700 mb-4">
                VP Associates ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website vp-associates.com.
              </p>
              <p class="text-neutral-700">
                Please read this Privacy Policy carefully. If you do not agree with the terms of this policy, please do not access the site.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Information We Collect</h2>

              <h3 class="text-xl font-semibold text-neutral-900 mb-3">Information You Provide to Us</h3>
              <p class="text-neutral-700 mb-4">We collect information you provide directly to us, including:</p>
              <ul class="list-disc pl-6 mb-6 text-neutral-700 space-y-2">
                <li><strong>Contact Form Information:</strong> When you fill out our contact form, we collect your name, email address, phone number, and message.</li>
                <li><strong>Career Application Information:</strong> When you apply for a position, we collect your name, email, phone number, resume, and cover letter.</li>
              </ul>

              <h3 class="text-xl font-semibold text-neutral-900 mb-3">Information Automatically Collected</h3>
              <p class="text-neutral-700 mb-4">We automatically collect certain information when you visit our website:</p>
              <ul class="list-disc pl-6 mb-6 text-neutral-700 space-y-2">
                <li><strong>Log Information:</strong> IP address, browser type, operating system, referring pages, and timestamps.</li>
                <li><strong>Device Information:</strong> Device type, screen resolution, and browser settings.</li>
                <li><strong>Usage Information:</strong> Pages visited, time spent on pages, and click patterns.</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">How We Use Your Information</h2>
              <p class="text-neutral-700 mb-4">We use the information we collect for the following purposes:</p>
              <ul class="list-disc pl-6 text-neutral-700 space-y-2">
                <li>To respond to your inquiries and requests</li>
                <li>To provide the services you request</li>
                <li>To send you technical notices and support messages</li>
                <li>To communicate with you about products, services, and events</li>
                <li>To monitor and analyze trends, usage, and activities</li>
                <li>To detect, prevent, and address technical issues and security threats</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Sharing of Information</h2>
              <p class="text-neutral-700 mb-4">We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
              <ul class="list-disc pl-6 text-neutral-700 space-y-2">
                <li><strong>Service Providers:</strong> With trusted third parties who assist us in operating our website and conducting our business.</li>
                <li><strong>Legal Requirements:</strong> When we believe disclosure is required by law or to protect our rights, property, or safety.</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition of all or a portion of our business.</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Cookies and Tracking Technologies</h2>
              <p class="text-neutral-700 mb-4">
                We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
              </p>
              <p class="text-neutral-700">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our site.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Data Security</h2>
              <p class="text-neutral-700">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Your Privacy Rights</h2>
              <p class="text-neutral-700 mb-4">Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul class="list-disc pl-6 text-neutral-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
              </ul>
              <p class="text-neutral-700 mt-4">
                To exercise these rights, please contact us at privacy@vp-associates.com or call us at (813) 251-4141.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Third-Party Links</h2>
              <p class="text-neutral-700">
                Our website may contain links to third-party websites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Children's Privacy</h2>
              <p class="text-neutral-700">
                Our website is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Changes to This Privacy Policy</h2>
              <p class="text-neutral-700">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <!-- Contact Section -->
            <div class="mt-12 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
              <h3 class="text-xl font-bold text-neutral-900 mb-4">Contact Us</h3>
              <p class="text-neutral-700 mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div class="space-y-2 text-neutral-700">
                <p><strong>Email:</strong> privacy@vp-associates.com</p>
                <p><strong>Phone:</strong> (813) 251-4141</p>
                <p><strong>Address:</strong> 6202 Courtney Drive, Tampa, FL 33615</p>
              </div>
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
  title: 'Privacy Policy',
  titleSuffix: false,
  description: 'VP Associates Privacy Policy. Learn how we collect, use, and protect your personal information.',
  keywords: 'privacy policy, data protection, personal information, VP Associates',
  robots: 'noindex', // Legal pages typically don't need to be indexed
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
