<template>
  <div>
    <!-- Page Header -->
    <AppSection bg-color="primary-dark" padding="lg">
      <div class="container text-center text-white">
        <h1 class="text-5xl md:text-6xl font-display font-bold mb-6">
          Join Our Team
        </h1>
        <p class="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
          Build your career with a leading structural engineering firm in Tampa Bay
        </p>
      </div>
    </AppSection>

    <!-- Why Work With Us -->
    <AppSection bg-color="white" animate-on-scroll>
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
          Why VP Associates?
        </h2>
        <p class="text-xl text-neutral-600 max-w-2xl mx-auto">
          Join a team of talented engineers who are shaping the Tampa Bay skyline
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div v-for="reason in reasons" :key="reason.title" class="bg-neutral-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
          <div class="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
            <Icon :name="reason.icon" class="w-8 h-8 text-primary" />
          </div>
          <h3 class="text-xl font-bold text-neutral-900 mb-3">
            {{ reason.title }}
          </h3>
          <p class="text-neutral-600">
            {{ reason.description }}
          </p>
        </div>
      </div>
    </AppSection>

    <!-- Benefits Section -->
    <AppSection bg-color="neutral-50" animate-on-scroll>
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6">
            Competitive Benefits Package
          </h2>
          <p class="text-lg text-neutral-600 mb-8">
            We invest in our team members with comprehensive benefits and opportunities for professional growth.
          </p>

          <ul class="space-y-4">
            <li v-for="benefit in benefits" :key="benefit" class="flex items-start gap-3">
              <Icon name="mdi:check-circle" class="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
              <span class="text-neutral-700">{{ benefit }}</span>
            </li>
          </ul>
        </div>

        <div class="relative">
          <div class="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center">
            <Icon name="mdi:account-group" class="w-48 h-48 text-primary/30" />
          </div>
          <!-- Floating Badge -->
          <div class="absolute -bottom-4 -right-4 bg-secondary text-white rounded-xl shadow-xl p-6">
            <div class="text-3xl font-bold">30+</div>
            <div class="text-sm opacity-90">Years of Excellence</div>
          </div>
        </div>
      </div>
    </AppSection>

    <!-- Open Positions -->
    <AppSection bg-color="white" animate-on-scroll>
      <div class="text-center mb-12">
        <h2 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
          Open Positions
        </h2>
        <p class="text-xl text-neutral-600 max-w-2xl mx-auto">
          Explore opportunities to join our team
        </p>
      </div>

      <div v-if="positions.length > 0" class="space-y-4 mb-12">
        <div
          v-for="position in positions"
          :key="position.id"
          class="border border-neutral-200 rounded-xl p-6 hover:border-primary hover:shadow-md hover:-translate-y-1 transition-all duration-300"
        >
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon :name="position.icon" class="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-neutral-900 mb-1">
                    {{ position.title }}
                  </h3>
                  <div class="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
                    <span class="flex items-center gap-1">
                      <Icon name="mdi:map-marker" class="w-4 h-4" />
                      {{ position.location }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Icon name="mdi:briefcase" class="w-4 h-4" />
                      {{ position.type }}
                    </span>
                    <span v-if="position.experience" class="flex items-center gap-1">
                      <Icon name="mdi:school" class="w-4 h-4" />
                      {{ position.experience }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span v-if="position.department" class="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold hover:bg-primary/20 transition-colors duration-200">
                {{ position.department }}
              </span>
              <NuxtLink
                :to="`/careers/${position.slug}`"
                class="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors duration-200 inline-flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                View Details
                <Icon name="mdi:arrow-right" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16 bg-neutral-50 rounded-xl">
        <Icon name="mdi:inbox-outline" class="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <p class="text-xl text-neutral-500 mb-4">No open positions at this time</p>
        <p class="text-neutral-600 mb-6">We're always looking for talented engineers. Send us your resume!</p>
        <NuxtLink
          to="/contact"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          Submit Your Resume
          <Icon name="mdi:arrow-right" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </AppSection>

    <!-- Culture Section -->
    <AppSection bg-color="primary" padding="lg" animate-on-scroll>
      <div class="container text-white">
        <div class="text-center mb-12">
          <h2 class="text-4xl md:text-5xl font-display font-bold mb-4">
            Our Culture
          </h2>
          <p class="text-xl opacity-90 max-w-2xl mx-auto">
            We foster a collaborative environment where engineers thrive
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div v-for="value in values" :key="value.title" class="text-center">
            <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon :name="value.icon" class="w-8 h-8" />
            </div>
            <h3 class="text-xl font-bold mb-2">{{ value.title }}</h3>
            <p class="opacity-80 text-sm">{{ value.description }}</p>
          </div>
        </div>

        <div class="bg-white/10 rounded-2xl p-8 md:p-12">
          <div class="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 class="text-2xl md:text-3xl font-bold mb-4">
                Commitment to Excellence
              </h3>
              <p class="opacity-90 mb-6">
                At VP Associates, we're committed to delivering exceptional structural engineering solutions
                while maintaining a supportive work environment that encourages innovation and professional growth.
              </p>
              <p class="opacity-90">
                Our team members work on diverse projects across commercial, marine, residential, and industrial
                sectors, gaining valuable experience and expertise.
              </p>
            </div>
            <div class="grid grid-cols-2 gap-6 text-center">
              <div>
                <div class="text-4xl md:text-5xl font-bold mb-2">500+</div>
                <div class="text-sm opacity-80">Projects Completed</div>
              </div>
              <div>
                <div class="text-4xl md:text-5xl font-bold mb-2">30+</div>
                <div class="text-sm opacity-80">Years in Business</div>
              </div>
              <div>
                <div class="text-4xl md:text-5xl font-bold mb-2">10+</div>
                <div class="text-sm opacity-80">Team Members</div>
              </div>
              <div>
                <div class="text-4xl md:text-5xl font-bold mb-2">100%</div>
                <div class="text-sm opacity-80">Employee Owned</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppSection>

    <!-- Application Process -->
    <AppSection bg-color="white" animate-on-scroll>
      <div class="text-center mb-12">
        <h2 class="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
          Application Process
        </h2>
        <p class="text-xl text-neutral-600 max-w-2xl mx-auto">
          Our streamlined hiring process gets you onboarded quickly
        </p>
      </div>

      <div class="max-w-4xl mx-auto">
        <div class="relative">
          <!-- Timeline Line -->
          <div class="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-neutral-200 -translate-x-1/2"></div>

          <div class="space-y-12">
            <div
              v-for="(step, index) in applicationProcess"
              :key="step.title"
              class="relative md:grid md:grid-cols-2 md:gap-8"
              :class="index % 2 === 0 ? '' : 'md:flex'"
            >
              <div :class="index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:col-start-2 md:pl-12'">
                <div class="bg-neutral-50 rounded-xl p-6 inline-block">
                  <div class="flex items-center gap-3 mb-3" :class="index % 2 === 0 ? 'md:flex-row-reverse' : ''">
                    <div class="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {{ index + 1 }}
                    </div>
                    <h3 class="text-xl font-bold text-neutral-900">{{ step.title }}</h3>
                  </div>
                  <p class="text-neutral-600">{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppSection>

    <!-- CTA Section -->
    <AppSection bg-color="secondary" padding="xl">
      <div class="container text-center text-white">
        <h2 class="text-4xl md:text-5xl font-display font-bold mb-6">
          Ready to Take the Next Step?
        </h2>
        <p class="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Apply for an open position or send us your resume for future opportunities
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/contact"
            class="px-8 py-4 bg-white text-secondary rounded-lg font-semibold hover:bg-neutral-100 transition-colors inline-flex items-center justify-center gap-2"
          >
            <Icon name="mdi:email" class="w-5 h-5" />
            Submit Resume
          </NuxtLink>
          <a
            href="tel:+18135551234"
            class="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
          >
            <Icon name="mdi:phone" class="w-5 h-5" />
            (813) 555-1234
          </a>
        </div>
      </div>
    </AppSection>
  </div>
</template>

<script setup lang="ts">
// SEO Meta Tags
usePageMeta({
  title: 'Careers - Join Our Team',
  description: 'Explore career opportunities at VP Associates, a leading structural engineering firm in Tampa Bay. Competitive benefits, professional growth, and exciting projects.',
  keywords: 'structural engineering careers, engineering jobs Tampa Bay, structural engineer positions, Florida engineering jobs',
  ogImage: 'https://vp-associates.com/images/og-default.jpg',
})

// Organization Schema for careers
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VP Associates',
  url: 'https://vp-associates.com',
  logo: 'https://vp-associates.com/logo.png',
  sameAs: [
    'https://www.linkedin.com/company/vp-associates',
  ],
})

// Reasons to join
const reasons = [
  {
    title: 'Diverse Project Portfolio',
    description: 'Work on challenging projects across commercial, marine, residential, and industrial sectors throughout Florida.',
    icon: 'mdi:file-document-multiple'
  },
  {
    title: 'Professional Growth',
    description: 'Continuous learning opportunities, mentorship programs, and support for professional licensure and certifications.',
    icon: 'mdi:trending-up'
  },
  {
    title: 'Collaborative Environment',
    description: 'Join a supportive team of experienced engineers who share knowledge and work together to solve complex problems.',
    icon: 'mdi:account-group'
  },
  {
    title: 'Work-Life Balance',
    description: 'We value our team members\' time outside of work with flexible schedules and a supportive workplace culture.',
    icon: 'mdi:scale-balance'
  },
  {
    title: 'Competitive Compensation',
    description: 'Industry-leading salaries, performance bonuses, and comprehensive benefits package for you and your family.',
    icon: 'mdi:cash'
  },
  {
    title: 'Tampa Bay Location',
    description: 'Enjoy the beautiful Florida Gulf Coast with great weather, beaches, and outdoor activities year-round.',
    icon: 'mdi:beach'
  }
]

// Benefits list
const benefits = [
  'Competitive salary based on experience',
  'Health, dental, and vision insurance',
  '401(k) retirement plan with company match',
  'Professional development and continuing education',
  'Support for PE license acquisition',
  'Flexible work schedule',
  'Paid time off and holidays',
  'Life and disability insurance',
  'Employee referral program',
  'Regular team events and activities'
]

// Company values
const values = [
  {
    title: 'Excellence',
    description: 'Delivering quality engineering solutions',
    icon: 'mdi:star'
  },
  {
    title: 'Integrity',
    description: 'Honest and ethical business practices',
    icon: 'mdi:handshake'
  },
  {
    title: 'Collaboration',
    description: 'Working together to achieve success',
    icon: 'mdi:account-group'
  },
  {
    title: 'Innovation',
    description: 'Embracing new technologies and methods',
    icon: 'mdi:lightbulb'
  }
]

// Open positions
interface Position {
  id: number
  title: string
  slug: string
  location: string
  type: string
  department?: string
  experience?: string
  icon: string
}

const positions: Position[] = [
  {
    id: 1,
    title: 'Structural Engineer',
    slug: 'structural-engineer',
    location: 'Tampa, FL',
    type: 'Full-time',
    department: 'Engineering',
    experience: '3+ years',
    icon: 'mdi:calculator'
  },
  {
    id: 2,
    title: 'Senior Structural Engineer',
    slug: 'senior-structural-engineer',
    location: 'Tampa, FL',
    type: 'Full-time',
    department: 'Engineering',
    experience: '8+ years',
    icon: 'mdi:calculator-variant'
  },
  {
    id: 3,
    title: 'CAD/BIM Technician',
    slug: 'cad-bim-technician',
    location: 'Tampa, FL',
    type: 'Full-time',
    department: 'Design',
    experience: '2+ years',
    icon: 'mdi:monitor'
  },
  {
    id: 4,
    title: 'Project Manager',
    slug: 'project-manager',
    location: 'Tampa, FL',
    type: 'Full-time',
    department: 'Management',
    experience: '5+ years',
    icon: 'mdi:clipboard-check'
  }
]

// Application process steps
const applicationProcess = [
  {
    title: 'Submit Application',
    description: 'Apply online with your resume and cover letter highlighting your experience and qualifications.'
  },
  {
    title: 'Initial Review',
    description: 'Our team reviews your application and contacts qualified candidates within 1-2 weeks.'
  },
  {
    title: 'Interview Process',
    description: 'Meet with our team to discuss your background, experience, and career goals.'
  },
  {
    title: 'Technical Assessment',
    description: 'For engineering positions, complete a technical review to demonstrate your expertise.'
  },
  {
    title: 'Reference Check',
    description: 'We contact your professional references to verify your experience and work ethic.'
  },
  {
    title: 'Welcome to the Team!',
    description: 'Receive an offer and join our team of talented structural engineers.'
  }
]
</script>
