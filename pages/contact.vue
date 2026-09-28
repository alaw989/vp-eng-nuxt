<template>
  <div>
    <!-- Page Banner -->
    <PageBanner
      eyebrow="Tampa, FL · (813) 486-2079"
      headline="Contact Us"
      subheadline="Get in touch with our team of experienced structural engineers"
      aria-label="Contact page banner"
    />

    <!-- Contact Form & Info -->
    <AppSection bg-color="white" animate-on-scroll>
      <div class="grid lg:grid-cols-5 gap-12">
        <!-- Contact Form -->
        <div class="lg:col-span-3">
          <h2 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
            Send Us a Message
          </h2>
          <p class="text-lg text-neutral-600 mb-8">
            Tell us about your project and we'll be in touch.
          </p>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label for="firstName" class="block text-sm font-semibold text-neutral-700 mb-2">
                  First Name <span class="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                  aria-required="true"
                  @blur="validateField('firstName', form.firstName)"
                  @input="touched.firstName && validateField('firstName', form.firstName)"
                  :aria-invalid="errors.firstName ? 'true' : 'false'"
                  :aria-describedby="errors.firstName ? 'firstName-error' : undefined"
                  class="field"
                  :class="errors.firstName ? 'border-red-500' : 'border-neutral-300'"
                  placeholder="John"
                />
                <p v-if="errors.firstName" id="firstName-error" class="mt-1 text-sm text-red-600" role="alert">
                  {{ errors.firstName }}
                </p>
              </div>
              <div>
                <label for="lastName" class="block text-sm font-semibold text-neutral-700 mb-2">
                  Last Name <span class="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                  aria-required="true"
                  @blur="validateField('lastName', form.lastName)"
                  @input="touched.lastName && validateField('lastName', form.lastName)"
                  :aria-invalid="errors.lastName ? 'true' : 'false'"
                  :aria-describedby="errors.lastName ? 'lastName-error' : undefined"
                  class="field"
                  :class="errors.lastName ? 'border-red-500' : 'border-neutral-300'"
                  placeholder="Smith"
                />
                <p v-if="errors.lastName" id="lastName-error" class="mt-1 text-sm text-red-600" role="alert">
                  {{ errors.lastName }}
                </p>
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-semibold text-neutral-700 mb-2">
                Email <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                aria-required="true"
                @blur="validateField('email', form.email)"
                @input="touched.email && validateField('email', form.email)"
                :aria-invalid="errors.email ? 'true' : 'false'"
                :aria-describedby="errors.email ? 'email-error' : undefined"
                class="field"
                :class="errors.email ? 'border-red-500' : 'border-neutral-300'"
                placeholder="john@example.com"
              />
              <p v-if="errors.email" id="email-error" class="mt-1 text-sm text-red-600" role="alert">
                {{ errors.email }}
              </p>
            </div>

            <div>
              <label for="phone" class="block text-sm font-semibold text-neutral-700 mb-2">
                Phone
              </label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                @blur="validateField('phone', form.phone)"
                @input="touched.phone && validateField('phone', form.phone)"
                :aria-invalid="errors.phone ? 'true' : 'false'"
                :aria-describedby="errors.phone ? 'phone-error' : undefined"
                class="field"
                :class="errors.phone ? 'border-red-500' : 'border-neutral-300'"
                placeholder="(813) 555-1234"
              />
              <p v-if="errors.phone" id="phone-error" class="mt-1 text-sm text-red-600" role="alert">
                {{ errors.phone }}
              </p>
            </div>

            <!-- Honeypot field for spam protection (hidden from users) -->
            <div class="hidden" aria-hidden="true">
              <label for="website" class="block text-sm font-semibold text-neutral-700 mb-2">
                Website (leave blank)
              </label>
              <input
                id="website"
                v-model="form.website"
                type="text"
                tabindex="-1"
                autocomplete="off"
                class="w-full px-4 py-3 border border-neutral-300 rounded-sm"
              />
            </div>

            <div>
              <label for="service" class="block text-sm font-semibold text-neutral-700 mb-2">
                Service Needed
              </label>
              <select
                id="service"
                v-model="form.service"
                class="field cursor-pointer"
              >
                <option value="">Select a service...</option>
                <option>Structural Steel Design</option>
                <option>Concrete Design</option>
                <option>Masonry Design</option>
                <option>Wood Design</option>
                <option>Foundation Design</option>
                <option>Seawall Design</option>
                <option>Steel Connection Design</option>
                <option>CAD & 3D Modeling</option>
                <option>Inspection Services</option>
                <option>Steel Detailing</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label for="message" class="block text-sm font-semibold text-neutral-700 mb-2">
                Message <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <textarea
                id="message"
                v-model="form.message"
                required
                aria-required="true"
                @blur="validateField('message', form.message)"
                @input="touched.message && validateField('message', form.message)"
                :aria-invalid="errors.message ? 'true' : 'false'"
                :aria-describedby="errors.message ? 'message-error' : undefined"
                rows="5"
                class="field h-auto py-3 resize-none"
                :class="errors.message ? 'border-red-500' : 'border-neutral-300'"
                placeholder="Tell us about your project..."
              ></textarea>
              <p v-if="errors.message" id="message-error" class="mt-1 text-sm text-red-600" role="alert">
                {{ errors.message }}
              </p>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="btn-primary w-full h-12"
            >
              <Icon v-if="isSubmitting" name="mdi:loading" class="w-5 h-5 animate-spin" />
              <span>{{ isSubmitting ? 'Sending...' : 'Send Message' }}</span>
            </button>

            <div
              v-if="submitMessage"
              :class="[
                'p-4 rounded-sm animate-fade-in',
                submitSuccess ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
              ]"
              role="alert"
              :aria-live="submitSuccess ? 'polite' : 'assertive'"
            >
              <div class="flex items-center gap-2">
                <Icon
                  :name="submitSuccess ? 'mdi:check-circle' : 'mdi:alert-circle'"
                  class="w-5 h-5 flex-shrink-0"
                />
                <span>{{ submitMessage }}</span>
              </div>
            </div>
          </form>
        </div>

        <!-- Contact Information -->
        <div class="lg:col-span-2 space-y-8">
          <div>
            <h2 class="text-2xl font-display font-bold text-neutral-900 mb-6">
              Contact Information
            </h2>

            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center flex-shrink-0">
                  <Icon name="mdi:map-marker" class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div class="font-semibold text-neutral-900 mb-1">Location</div>
                  <div class="text-neutral-600">
                    Based in Tampa, Florida
                  </div>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center flex-shrink-0">
                  <Icon name="mdi:phone" class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div class="font-semibold text-neutral-900 mb-1">Phone</div>
                  <a href="tel:+18134862079" class="text-primary hover:text-primary-dark hover:underline transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm px-1">
                    (813) 486-2079
                  </a>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center flex-shrink-0">
                  <Icon name="mdi:email" class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div class="font-semibold text-neutral-900 mb-1">Email</div>
                  <a href="mailto:info@vp-associates.com" class="text-primary hover:text-primary-dark hover:underline transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm px-1">
                    info@vp-associates.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppSection>

    <!-- Service Area: the list and the map are one control -->
    <AppSection bg-color="neutral-50" animate-on-scroll>
      <SectionHeading
        title="Serving Tampa Bay"
        lede="Based in Tampa, working on projects all around the bay. Pick a community to see it on the map."
      />

      <LazyServiceAreaMap />
    </AppSection>

    <!-- ARIA live region for screen reader announcements -->
    <div id="sr-announcements" aria-live="polite" aria-atomic="true" class="sr-only"></div>
  </div>
</template>

<script setup lang="ts">
import { submitContactForm } from '~/utils/contactForm'
// Route meta for screen reader announcements
definePageMeta({
  title: 'Contact'
})

// Breadcrumbs for SEO and navigation
const contactBreadcrumbs = [
  { title: 'Contact' }
]

// SEO Meta Tags
usePageMeta({
  title: 'Contact Us',
  description: 'Contact VP Associates for structural engineering services in Tampa Bay. Call (813) 486-2079 or send us a message.',
  keywords: 'contact structural engineer, Tampa Bay engineering, VP Associates contact, engineering consultation',
})

// Contact Schema
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  mainEntity: {
    '@type': 'LocalBusiness',
    name: 'VP Associates',
    telephone: '+1-813-486-2079',
    email: 'info@vp-associates.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tampa',
      addressRegion: 'FL',
      addressCountry: 'US',
    },
  },
})

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  service: string
  message: string
  // Honeypot field for spam protection (hidden from users)
  website: string
}

const form = reactive<FormData>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  service: '',
  message: '',
  website: '' // Honeypot field
})

const isSubmitting = ref(false)
const submitMessage = ref('')
const submitSuccess = ref(false)

// Import useFormValidation composable
const { errors, touched, validateField, validateForm, clearErrors } = useFormValidation<FormData>({
  firstName: (value: string) => {
    if (!value.trim()) return 'First name is required'
    if (value.trim().length < 2) return 'First name must be at least 2 characters'
    return null
  },
  lastName: (value: string) => {
    if (!value.trim()) return 'Last name is required'
    if (value.trim().length < 2) return 'Last name must be at least 2 characters'
    return null
  },
  email: (value: string) => {
    if (!value.trim()) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'Please enter a valid email address'
    return null
  },
  phone: (value: string) => {
    if (value && !/^\d{10,}$/.test(value.replace(/\D/g, ''))) {
      return 'Please enter a valid phone number'
    }
    return null
  },
  message: (value: string) => {
    if (!value.trim()) return 'Message is required'
    if (value.trim().length < 10) return 'Message must be at least 10 characters'
    return null
  }
})

const { formspreeEndpoint } = useRuntimeConfig().public

const handleSubmit = async () => {
  submitMessage.value = ''

  if (!validateForm(form)) {
    submitMessage.value = 'Please fix the errors above and try again.'
    submitSuccess.value = false
    return
  }

  isSubmitting.value = true

  const result = await submitContactForm(formspreeEndpoint, form)
  isSubmitting.value = false
  submitSuccess.value = result.ok
  submitMessage.value = result.message

  if (result.ok) {
    // Reset form on success
    form.firstName = ''
    form.lastName = ''
    form.email = ''
    form.phone = ''
    form.service = ''
    form.message = ''
    form.website = ''

    // Clear errors on success
    clearErrors()
  }
}

</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-in;
}
</style>
