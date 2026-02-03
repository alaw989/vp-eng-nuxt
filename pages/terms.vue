<template>
  <div class="min-h-screen bg-neutral-50 py-16">
    <div class="container max-w-4xl mx-auto px-4">
      <!-- Breadcrumb -->
      <AppBreadcrumbs
        :breadcrumbs="[{ title: 'Terms of Service', to: '/terms' }]"
      />

      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
          Terms of Service
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
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Agreement to Terms</h2>
              <p class="text-neutral-700 mb-4">
                By accessing or using the VP Associates website (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p class="text-neutral-700">
                These Terms constitute a legally binding agreement between you and VP Associates, P.A., a Florida professional association ("VP Associates", "we", "us", or "our").
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Changes to Terms</h2>
              <p class="text-neutral-700">
                We reserve the right to modify these Terms at any time. All changes are effective immediately when we post them. Your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Description of Service</h2>
              <p class="text-neutral-700 mb-4">
                VP Associates provides structural engineering services and information through our website. Our Service includes:
              </p>
              <ul class="list-disc pl-6 text-neutral-700 space-y-2">
                <li>Company information and history</li>
                <li>Descriptions of our engineering services</li>
                <li>Project portfolio showcase</li>
                <li>Career opportunities and application</li>
                <li>Contact forms and communication channels</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Professional Services Disclaimer</h2>
              <p class="text-neutral-700 mb-4">
                <strong>IMPORTANT:</strong> The information provided on this website is for general informational purposes only and does not constitute professional engineering advice.
              </p>
              <p class="text-neutral-700 mb-4">
                All engineering services require a formal engagement agreement signed by both parties. No professional relationship is created by using this website or submitting information through our contact forms.
              </p>
              <p class="text-neutral-700">
                Structural engineering services are regulated by the Florida Board of Professional Engineers. Our Florida license number is available upon request and displayed in our office.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Intellectual Property Rights</h2>
              <p class="text-neutral-700 mb-4">The content and materials on this website are owned by VP Associates and are protected by copyright, trademark, and other intellectual property laws. This includes:</p>
              <ul class="list-disc pl-6 text-neutral-700 space-y-2">
                <li>Text, graphics, logos, and images</li>
                <li>Project photos and descriptions</li>
                <li>Software and code</li>
                <li>Design and layout</li>
              </ul>
              <p class="text-neutral-700 mt-4">
                You may not reproduce, modify, display, sell, or distribute any content from this website without our prior written consent.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">User-Submitted Content</h2>
              <p class="text-neutral-700 mb-4">When you submit information through our website (such as contact forms or job applications):</p>
              <ul class="list-disc pl-6 text-neutral-700 space-y-2">
                <li>You represent that you have the right to submit the content</li>
                <li>You grant us a non-exclusive, royalty-free license to use the content for the purposes stated at the time of submission</li>
                <li>You are responsible for the accuracy of the information you provide</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Privacy Policy</h2>
              <p class="text-neutral-700">
                Your use of our Service is also governed by our Privacy Policy, which can be found at <NuxtLink to="/privacy" class="text-primary hover:underline">vp-associates.com/privacy</NuxtLink>. Please review our Privacy Policy, which also governs the Service and informs users of our data collection practices.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Limitation of Liability</h2>
              <p class="text-neutral-700 mb-4">
                To the fullest extent permitted by law, VP Associates shall not be liable for:
              </p>
              <ul class="list-disc pl-6 text-neutral-700 space-y-2">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                <li>Errors or inaccuracies in content</li>
                <li>Personal injury or property damage resulting from your use of the Service</li>
                <li>Any unauthorized access to or use of our secure servers</li>
              </ul>
              <p class="text-neutral-700 mt-4">
                In no event shall VP Associates' total liability exceed the amount you paid, if any, for accessing the Service.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Indemnification</h2>
              <p class="text-neutral-700">
                You agree to defend, indemnify, and hold harmless VP Associates and our affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns, and employees from any claim or demand, including reasonable attorneys' fees, made by any third party due to or arising out of your breach of these Terms or your violation of any law or the rights of a third party.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Governing Law</h2>
              <p class="text-neutral-700">
                These Terms shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in Hillsborough County, Florida.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Termination</h2>
              <p class="text-neutral-700">
                We may terminate or suspend your access to our Service immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Links to Other Websites</h2>
              <p class="text-neutral-700">
                Our Service may contain links to third-party websites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. We strongly advise you to read the terms and conditions and privacy policies of any third-party websites you visit.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Warranty Disclaimer</h2>
              <p class="text-neutral-700">
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. VP ASSOCIATES MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, REGARDING THE OPERATION OF THE SERVICE OR THE INFORMATION, CONTENT, MATERIALS, OR PRODUCTS INCLUDED ON THIS SITE.
              </p>
            </section>

            <section>
              <h2 class="text-2xl font-bold text-neutral-900 mb-4">Contact Information</h2>
              <p class="text-neutral-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div class="space-y-2 text-neutral-700">
                <p><strong>Email:</strong> info@vp-associates.com</p>
                <p><strong>Phone:</strong> (813) 251-4141</p>
                <p><strong>Address:</strong> 6202 Courtney Drive, Tampa, FL 33615</p>
              </div>
            </section>

            <!-- Professional Notice -->
            <div class="mt-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
              <h3 class="text-xl font-bold text-primary mb-3">Florida Professional Engineering Notice</h3>
              <p class="text-neutral-700">
                VP Associates, P.A. is a Florida Professional Engineering firm. Engineering services are provided in compliance with Florida Statutes Chapter 471. Professional services are only rendered through formal written agreements signed by both parties.
              </p>
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
  title: 'Terms of Service',
  titleSuffix: false,
  description: 'VP Associates Terms of Service. Legal terms and conditions for using our website and services.',
  keywords: 'terms of service, terms and conditions, legal, VP Associates',
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
