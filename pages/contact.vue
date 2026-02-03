<template>
  <div>
    <!-- Breadcrumbs -->
    <div class="bg-white border-b border-neutral-200">
      <div class="container py-4">
        <AppBreadcrumbs :breadcrumbs="contactBreadcrumbs" />
      </div>
    </div>

    <!-- Page Header -->
    <AppSection bg-color="primary-dark" padding="lg">
      <div class="container text-center text-white">
        <h1 class="text-5xl md:text-6xl font-display font-bold mb-6">
          Contact Us
        </h1>
        <p class="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
          Get in touch with our team of experienced structural engineers
        </p>
      </div>
    </AppSection>

    <!-- Contact Form & Info -->
    <AppSection bg-color="white" animate-on-scroll>
      <div class="grid lg:grid-cols-5 gap-12">
        <!-- Contact Form -->
        <div class="lg:col-span-3">
          <h2 class="text-3xl font-display font-bold text-neutral-900 mb-6">
            Send Us a Message
          </h2>
          <p class="text-lg text-neutral-600 mb-8">
            Fill out the form below and we'll get back to you within 24 hours.
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
                  :aria-invalid="errors.firstName ? 'true' : 'false'"
                  :aria-describedby="errors.firstName ? 'firstName-error' : undefined"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
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
                  :aria-invalid="errors.lastName ? 'true' : 'false'"
                  :aria-describedby="errors.lastName ? 'lastName-error' : undefined"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
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
                :aria-invalid="errors.email ? 'true' : 'false'"
                :aria-describedby="errors.email ? 'email-error' : undefined"
                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
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
                class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                placeholder="(813) 555-1234"
              />
            </div>

            <div>
              <label for="service" class="block text-sm font-semibold text-neutral-700 mb-2">
                Service Needed
              </label>
              <select
                id="service"
                v-model="form.service"
                class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
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
                :aria-invalid="errors.message ? 'true' : 'false'"
                :aria-describedby="errors.message ? 'message-error' : undefined"
                rows="5"
                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors resize-none"
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
              class="w-full px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <Icon v-if="isSubmitting" name="mdi:loading" class="w-5 h-5 animate-spin" />
              <span>{{ isSubmitting ? 'Sending...' : 'Send Message' }}</span>
            </button>

            <div
              v-if="submitMessage"
              :class="[
                'p-4 rounded-lg',
                submitSuccess ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
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
                <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="mdi:map-marker" class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div class="font-semibold text-neutral-900 mb-1">Office Address</div>
                  <div class="text-neutral-600">
                    123 Main Street, Suite 100<br>
                    Tampa, FL 33602
                  </div>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="mdi:phone" class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div class="font-semibold text-neutral-900 mb-1">Phone</div>
                  <a href="tel:+18135551234" class="text-primary hover:text-primary-dark transition-colors">
                    (813) 555-1234
                  </a>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="mdi:email" class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div class="font-semibold text-neutral-900 mb-1">Email</div>
                  <a href="mailto:info@vp-associates.com" class="text-primary hover:text-primary-dark transition-colors">
                    info@vp-associates.com
                  </a>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="mdi:clock" class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div class="font-semibold text-neutral-900 mb-1">Business Hours</div>
                  <div class="text-neutral-600">
                    Monday - Friday: 8:00 AM - 5:00 PM<br>
                    Saturday - Sunday: Closed
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Map Placeholder -->
          <div class="rounded-xl overflow-hidden border border-neutral-200">
            <div class="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center">
              <div class="text-center">
                <Icon name="mdi:map-marker-radius" class="w-16 h-16 text-primary/40 mx-auto mb-2" />
                <p class="text-neutral-600 font-medium">Interactive Map</p>
                <p class="text-neutral-500 text-sm">Tampa, FL</p>
              </div>
            </div>
          </div>

          <!-- Emergency Contact -->
          <div class="bg-red-50 border border-red-200 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-3">
              <Icon name="mdi:alert-circle" class="w-6 h-6 text-red-600" />
              <div class="font-bold text-neutral-900">Emergency?</div>
            </div>
            <p class="text-neutral-600 text-sm mb-3">
              For urgent structural issues or inspection needs, call us directly.
            </p>
            <a href="tel:+18135551234" class="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors">
              <Icon name="mdi:phone" class="w-4 h-4" />
              (813) 555-1234
            </a>
          </div>
        </div>
      </div>
    </AppSection>

    <!-- Service Areas -->
    <AppSection bg-color="neutral-50" animate-on-scroll>
      <div class="text-center mb-12">
        <h2 class="text-3xl font-display font-bold text-neutral-900 mb-4">
          Service Areas
        </h2>
        <p class="text-xl text-neutral-600 max-w-3xl mx-auto">
          Proudly serving the entire Tampa Bay region
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="area in serviceAreas" :key="area" class="bg-white rounded-lg p-4 text-center shadow-sm">
          <Icon name="mdi:map-marker" class="w-6 h-6 text-primary mx-auto mb-2" />
          <div class="font-medium text-neutral-900">{{ area }}</div>
        </div>
      </div>
    </AppSection>
  </div>
</template>

<script setup lang="ts">
// Breadcrumbs for SEO and navigation
const contactBreadcrumbs = [
  { title: 'Contact' }
]

useHead({
  title: 'Contact Us | VP Associates Structural Engineering',
  meta: [
    { name: 'description', content: 'Contact VP Associates for structural engineering services in Tampa Bay. Call (813) 555-1234 or visit our office at 123 Main Street, Suite 100, Tampa, FL.' },
    { name: 'keywords', content: 'contact structural engineer, Tampa Bay engineering, VP Associates contact, engineering consultation' },
    { property: 'og:title', content: 'Contact Us | VP Associates Structural Engineering' },
    { property: 'og:description', content: 'Get in touch with our team of experienced structural engineers. Call us or visit our Tampa office.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://vp-associates.com/contact' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})

// Contact Schema
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  mainEntity: {
    '@type': 'LocalBusiness',
    name: 'VP Associates',
    telephone: '+1-813-555-1234',
    email: 'info@vp-associates.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Main Street, Suite 100',
      addressLocality: 'Tampa',
      addressRegion: 'FL',
      postalCode: '33602',
      addressCountry: 'US',
    },
    openingHours: 'Mo-Fr 08:00-17:00',
  },
})

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  service: string
  message: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  message?: string
}

const form = reactive<FormData>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  service: '',
  message: ''
})

const errors = reactive<FormErrors>({})
const isSubmitting = ref(false)
const submitMessage = ref('')
const submitSuccess = ref(false)

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateForm = (): boolean => {
  // Clear previous errors
  (Object.keys(errors) as Array<keyof FormErrors>).forEach(key => delete errors[key])

  let isValid = true

  // Validate first name
  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required'
    isValid = false
  } else if (form.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters'
    isValid = false
  }

  // Validate last name
  if (!form.lastName.trim()) {
    errors.lastName = 'Last name is required'
    isValid = false
  } else if (form.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters'
    isValid = false
  }

  // Validate email
  if (!form.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!validateEmail(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  // Validate message
  if (!form.message.trim()) {
    errors.message = 'Message is required'
    isValid = false
  } else if (form.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  submitMessage.value = ''

  if (!validateForm()) {
    submitMessage.value = 'Please fix the errors above and try again.'
    submitSuccess.value = false
    return
  }

  isSubmitting.value = true

  // Simulate form submission
  setTimeout(() => {
    isSubmitting.value = false
    submitSuccess.value = true
    submitMessage.value = 'Thank you for your message! We\'ll get back to you within 24 hours.'

    // Reset form
    form.firstName = ''
    form.lastName = ''
    form.email = ''
    form.phone = ''
    form.service = ''
    form.message = ''

    // Clear success message after 5 seconds
    setTimeout(() => {
      submitMessage.value = ''
    }, 5000)
  }, 1500)
}

const serviceAreas = [
  'Tampa',
  'St. Petersburg',
  'Clearwater',
  'Brandon',
  'Lakeland',
  'Sarasota',
  'Bradenton',
  'Pasco County'
]
</script>
