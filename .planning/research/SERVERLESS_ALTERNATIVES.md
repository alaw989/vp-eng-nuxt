# Serverless Alternatives for Static Site Deployment

**Project:** VP Associates Nuxt 3 Website
**Research Type:** Feature Migration Research
**Researched:** 2026-02-23
**Confidence:** MEDIUM

## Executive Summary

When deploying a Nuxt 3 app as static files (SSG) without Node.js runtime, the current server-side API routes require replacement with third-party services or client-side implementations. This research identifies viable alternatives for:

1. **Contact form handling** (currently `/api/contact.post.ts`)
2. **Search functionality** (currently `/api/search.get.ts`)
3. **RSS feed generation** (currently `/api/rss.xml.get.ts`)
4. **Rate limiting & spam protection** (currently implemented in-memory)

**Key finding:** Most server-side features can be replaced with SaaS products offering generous free tiers sufficient for a typical business website. The main trade-offs are service dependency versus infrastructure complexity.

---

## Current Server-Side Features Analysis

### Feature Inventory

| Feature | Current Implementation | Complexity | Migration Difficulty |
|---------|------------------------|------------|---------------------|
| Contact Form with Resend email | Server API route, rate limiting, validation | Medium | Low - many drop-in replacements |
| Full-text search with fuzzy matching | Server API fetching from WordPress | Medium | Medium - requires client-side index or search service |
| Rate limiting (3/hour per IP) | In-memory Map storage | Low | High - requires service-level protection |
| Honeypot spam protection | Server-side field check | Low | Low - most form services include this |
| RSS feed generation | Server XML rendering | Low | Low - can use build-time generation or external service |
| Content API routes (projects, services, team) | Server proxy to WordPress | Low | Low - direct client-side fetch to WordPress |

### Critical Features to Replace

1. **Contact form submissions** - Core business functionality
2. **Search across projects/services** - User experience feature
3. **Rate limiting & spam protection** - Security requirement

---

## 1. Contact Form Alternatives

### Overview

Contact forms are the most critical server-side feature. The current implementation includes:
- Field validation (name, email, phone, message)
- Rate limiting (3 submissions/hour per IP)
- Honeypot spam protection
- HTML email delivery via Resend
- Graceful error handling

### Recommended Solutions

#### Option 1: Web3Forms (Recommended)

**What:** Form-as-a-service with email delivery, spam protection, and generous free tier.

**Pricing:**
- **Free:** 250 submissions/month, unlimited forms, unlimited domains
- **Premium:** ~$8/month for unlimited submissions

**Implementation:**
```html
<form action="https://api.web3forms.com/submit" method="POST">
  <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <input type="tel" name="phone">
  <textarea name="message" required></textarea>
  <!-- Honeypot field -->
  <input type="checkbox" name="botcheck" class="hidden" style="display:none;">
  <button type="submit">Submit</button>
</form>
```

**Pros:**
- Generous free tier (250 vs Netlify's 100)
- Unlimited forms and domains
- Built-in spam protection
- AJAX support for seamless UX
- No registration required for basic use
- Email notifications included

**Cons:**
- Third-party dependency
- Custom rate limiting not available (relies on service limits)
- Less control over email formatting

**Confidence:** MEDIUM - Based on web search, should verify current pricing

---

#### Option 2: Formspree

**What:** Established form service with extensive integrations.

**Pricing:**
- **Free:** 50 submissions/month per form
- **Gold:** ~$20/month for higher limits

**Implementation:**
```html
<form action="https://formspree.io/f/your-form-id" method="POST">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <textarea name="message" required></textarea>
  <button type="submit">Submit</button>
</form>
```

**Pros:**
- Well-established, battle-tested
- Google Sheets integration
- Webhook support for custom workflows
- AJAX support

**Cons:**
- Lower free tier (50 submissions/month)
- More expensive paid plans
- Form ID registration required

**Confidence:** MEDIUM - Pricing verified via web search

---

#### Option 3: FormSubmit.co

**What:** Simple form-to-email service with AJAX support.

**Pricing:**
- **Free:** 1,000 submissions/hour rate limit
- **Premium:** Available for higher limits

**Implementation:**
```html
<form action="https://formsubmit.co/your@email.com" method="POST">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <!-- AJAX mode -->
  <input type="hidden" name="_subject" value="New Contact Form Submission">
  <input type="hidden" name="_captcha" value="false">
  <button type="submit">Submit</button>
</form>
```

**AJAX Implementation:**
```javascript
async function submitForm(data) {
  const response = await fetch('https://formsubmit.co/ajax/your@email.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return await response.json()
}
```

**Pros:**
- Highest rate limit (1,000/hour)
- AJAX support for smooth UX
- Built-in anti-spam protection
- Custom success/error messages
- No registration required

**Cons:**
- Email verification required in dashboard
- Fewer integration options
- Less polished documentation

**Confidence:** LOW - Based on web search, AJAX endpoint needs verification

---

#### Option 4: Netlify Forms (If Using Netlify)

**What:** Native form handling for Netlify deployments.

**Pricing:**
- **Free:** 100 submissions/site/month
- **Pro:** $19/month for higher limits

**Implementation:**
```html
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <button type="submit">Submit</button>
</form>
```

**For AJAX/Nuxt:**
```vue
<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="contact" />
  <input type="hidden" name="bot-field" />
  <!-- Form fields -->
</form>
```

**Pros:**
- Native to Netlify (no external service)
- Integrated dashboard
- Email notifications
- File upload support

**Cons:**
- Only works with Netlify hosting
- Lower free tier (100 submissions)
- Requires form pre-rendering for detection

**Confidence:** HIGH - Well-documented feature

---

### Contact Form Migration Comparison

| Service | Free Tier | Paid Tier | Best For | Complexity |
|---------|-----------|-----------|----------|------------|
| Web3Forms | 250/mo | ~$8/mo unlimited | Generous free tier, multi-form | Low |
| Formspree | 50/mo | ~$20/mo | Integrations, established | Low |
| FormSubmit | 1,000/hour | Unknown | High burst volume | Low |
| Netlify Forms | 100/mo | $19/mo | Netlify hosting | Low (on Netlify) |

**Recommendation:** Web3Forms for best balance of free tier, features, and simplicity.

---

## 2. Search Functionality Alternatives

### Current Implementation Analysis

The current `/api/search.get.ts`:
- Fetches projects and services from WordPress API
- Performs fuzzy matching on titles, descriptions, categories, locations
- Returns ranked results
- Has graceful fallback on API errors

**Key insight:** The search relies on dynamic WordPress API fetches, which can be moved client-side.

### Option 1: Client-Side Search with Fuse.js (Recommended)

**What:** Fuzzy search library running entirely in the browser.

**Pricing:** Free (open-source)

**Implementation Approach:**

```vue
<script setup lang="ts">
import Fuse from 'fuse.js'

// Fetch data at build time or client-side
const { data: services } = await useFetch('https://www.vp-associates.com/wp-json/wp/v2/services?per_page=100')
const { data: projects } = await useFetch('https://www.vp-associates.com/wp-json/wp/v2/projects?per_page=100')

// Combine all searchable content
const searchIndex = computed(() => {
  return [
    ...services.value.map(s => ({
      type: 'service',
      title: s.title.rendered,
      description: s.excerpt.rendered.replace(/<[^>]*>/g, ''),
      url: `/services/${s.slug}`
    })),
    ...projects.value.map(p => ({
      type: 'project',
      title: p.title.rendered,
      description: p.excerpt.rendered.replace(/<[^>]*>/g, ''),
      url: `/projects/${p.slug}`,
      category: p.project_meta?.category,
      location: p.project_meta?.location
    }))
  ]
})

// Initialize Fuse
const fuse = computed(() => new Fuse(searchIndex.value, {
  keys: ['title', 'description', 'category', 'location'],
  threshold: 0.3, // Lower = stricter matching
  includeScore: true
}))

// Search function
const searchQuery = ref('')
const results = computed(() => {
  if (!searchQuery.value.trim()) return []
  return fuse.value.search(searchQuery.value).map(r => r.item)
})
</script>
```

**Bundle Size:** ~24KB minified

**Pros:**
- Zero server dependency
- Fuzzy matching handles typos well
- Instant results (no network latency)
- Works offline
- Full control over search logic

**Cons:**
- Must load all data client-side
- Initial page load includes search data
- Search quality depends on indexed fields

**Confidence:** HIGH - Well-established library

---

### Option 2: Client-Side Search with Pagefind (For Large Sites)

**What:** Rust-based static search engine designed for large documentation sites.

**Pricing:** Free (open-source)

**Implementation Approach:**

```bash
# Install
npm install -D pagefind

# Add to build script
npx pagefind build --site dist
```

```vue
<script setup lang="ts">
import { Pagefind } from 'pagefind/ui/dist/wrapper.js'

const search = async (query: string) => {
  const results = await Pagefind.query(query)
  return results.results
}
</script>

<template>
  <Pagefind />
</template>
```

**Bundle Size:** Search UI ~50KB + compressed index (~100-300KB for large sites)

**Pros:**
- Optimized for very large sites (5k+ pages)
- Extremely bandwidth-efficient indexes
- Built-in search UI components
- Excellent multi-language support
- Smart text segmentation

**Cons:**
- Overkill for small/medium sites
- Requires CLI build step
- More complex setup than Fuse.js

**Confidence:** MEDIUM - Newer tool, but well-regarded

---

### Option 3: Build-Time Search Index with Lunr.js

**What:** Lightweight full-text search library with build-time index generation.

**Pricing:** Free (open-source)

**Implementation Approach:**

```typescript
// server/plugins/searchIndex.ts - Build-time index generation
import lunr from 'lunr'

export default defineNitroPlugin(() => {
  const documents = []

  // Fetch all content during build
  const services = await $fetch('https://www.vp-associates.com/wp-json/wp/v2/services')
  const projects = await $fetch('https://www.vp-associates.com/wp-json/wp/v2/projects')

  // Build index
  const idx = lunr(function () {
    this.ref('id')
    this.field('title')
    this.field('description')

    services.forEach((doc, i) => {
      this.add({
        id: i,
        title: doc.title.rendered,
        description: doc.excerpt.rendered
      })
    })
  })

  // Write index to public directory
  writeFileSync('./public/search-index.json', JSON.stringify(idx))
})
```

```vue
<script setup lang="ts">
import lunr from 'lunr'

// Load pre-built index
const { data: index } = await useFetch('/search-index.json')

// Client-side search
const search = (query: string) => {
  return idx.search(query)
}
</script>
```

**Bundle Size:** ~8KB minified

**Pros:**
- Smallest bundle size
- Pre-built index = instant load
- Battle-tested, stable API
- Good for medium-sized sites

**Cons:**
- Requires build-time index generation
- Less sophisticated fuzzy matching than Fuse.js
- Index rebuild on content changes

**Confidence:** HIGH - Long-established library

---

### Search Migration Comparison

| Solution | Best For | Bundle Size | Setup Complexity | Search Quality |
|----------|----------|-------------|------------------|----------------|
| Fuse.js | Most sites, fuzzy matching needed | ~24KB | Low | High (fuzzy) |
| Pagefind | Large docs sites (5k+ pages) | ~50KB + index | Medium | High |
| Lunr.js | Bandwidth-constrained, small index | ~8KB | Medium | Medium |

**Recommendation:** Fuse.js for this project - the site has moderate content volume (~50-100 total searchable items), fuzzy matching is valuable for user experience, and setup is straightforward.

---

## 3. Rate Limiting & Spam Protection

### Current Implementation

- In-memory rate limiting (3 submissions/hour per IP)
- Honeypot field for bot detection
- Server-side field validation and sanitization

### Static Site Challenges

Rate limiting without a server requires:
1. Service-level protection (form service handles it)
2. Client-side deterrents (CAPTCHA, honeypot)
3. CDN-level rules

### Recommended Solutions

#### Option 1: Cloudflare Turnstile (Recommended)

**What:** Free, invisible CAPTCHA alternative to reCAPTCHA.

**Pricing:** Completely free (no paid tier)

**Implementation:**

```vue
<script setup lang="ts">
const turnstileLoaded = ref(false)
const turnstileSiteKey = useRuntimeConfig().public.turnstileSiteKey

onMounted(() => {
  // Load Turnstile script
  const script = document.createElement('script')
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
  script.async = true
  script.defer = true
  document.head.appendChild(script)
  script.onload = () => { turnstileLoaded.value = true }
})

const turnstileToken = ref('')

const onTurnstileVerify = (token: string) => {
  turnstileToken.value = token
}
</script>

<template>
  <form @submit.prevent="submitForm">
    <!-- Form fields -->
    <div
      v-if="turnstileLoaded"
      class="cf-turnstile"
      :data-sitekey="turnstileSiteKey"
      data-callback="onTurnstileVerify"
    ></div>
    <button type="submit">Submit</button>
  </form>
</template>
```

**Pros:**
- Completely free
- Invisible to users (no puzzles)
- Privacy-focused
- Easy integration
- Works with any form service

**Cons:**
- Requires Cloudflare account
- One more external dependency

**Confidence:** HIGH - Official Cloudflare product

---

#### Option 2: Honeypot Fields (Supplemental)

**What:** Hidden fields that humans don't see but bots fill out.

**Implementation:**

```vue
<template>
  <form @submit.prevent="submitForm">
    <!-- Visible fields -->
    <input v-model="formData.name" type="text" name="name" />

    <!-- Honeypot - hidden from users but visible to bots -->
    <input
      v-model="formData.website"
      type="text"
      name="website"
      tabindex="-1"
      autocomplete="off"
      :style="{ position: 'absolute', left: '-5000px' }"
      aria-hidden="true"
    />

    <button type="submit">Submit</button>
  </form>
</template>

<script setup lang="ts">
const submitForm = async () => {
  // If honeypot is filled, it's a bot - reject silently
  if (formData.value.website) {
    // Return success to not tip off bots
    return { success: true }
  }

  // Proceed with submission
  return await submitToService(formData.value)
}
</script>
```

**Pros:**
- Zero cost
- No external dependencies
- Catches basic bots
- User experience unaffected

**Cons:**
- Won't stop sophisticated bots
- Should be combined with other methods

---

#### Option 3: Form Service Built-in Protection

Most form services include their own spam protection:

| Service | Spam Protection | Rate Limiting |
|---------|-----------------|---------------|
| Web3Forms | Yes | 250/month on free tier |
| Formspree | Yes | 50/month on free tier |
| FormSubmit | Yes | 1,000/hour |
| Netlify Forms | Yes | 100/month |

**Recommendation:** Combine form service limits + Cloudflare Turnstile for comprehensive protection without server-side code.

---

## 4. RSS Feed Generation

### Current Implementation

Server-side `/api/rss.xml.get.ts` generates dynamic RSS feeds from content.

### Static Site Options

#### Option 1: Build-Time Generation (Recommended)

Generate RSS during Nuxt build process using Nitro plugins or build hooks.

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    hooks: {
      'build:done': async () => {
        const rss = await generateRSS()
        await fs.writeFile('./public/rss.xml', rss)
      }
    }
  }
})
```

```typescript
// server/utils/generateRSS.ts
export async function generateRSS() {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl

  // Fetch content
  const [projects, services] = await Promise.all([
    $fetch('https://www.vp-associates.com/wp-json/wp/v2/projects?per_page=100'),
    $fetch('https://www.vp-associates.com/wp-json/wp/v2/services?per_page=100')
  ])

  // Build RSS XML
  const items = [...projects, ...services].map(item => `
    <item>
      <title><![CDATA[${item.title.rendered}]]></title>
      <link>${siteUrl}/${item.slug}</link>
      <description><![CDATA[${item.excerpt.rendered}]]></description>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <guid>${item.slug}</guid>
    </item>
  `).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>VP Associates</title>
    <link>${siteUrl}</link>
    <description>Structural Engineering Services</description>
    ${items}
  </channel>
</rss>`
}
```

**Pros:**
- Static file, no server needed
- Fast, no dynamic processing
- CDN cacheable

**Cons:**
- Requires rebuild for new content
- Stale between deployments

---

#### Option 2: Third-Party RSS Service

Services like RSS.app or FetchRSS can generate feeds from WordPress URLs.

**Pros:**
- No build process needed
- Always up-to-date

**Cons:**
- External dependency
- May have free tier limits
- Less customization

---

## 5. Email Sending (Resend Alternative)

### Current Implementation

Uses Resend API via server-side route to send HTML emails on form submission.

### Static Site Options

When using form services, email sending is handled by the service itself. However, if you need custom email sending:

#### Option 1: Form Service Email (Recommended)

All recommended form services include email notifications:
- **Web3Forms:** Direct to your inbox
- **Formspree:** Email + dashboard
- **FormSubmit:** Email delivery

No additional service needed.

#### Option 2: Resend with Form Service Webhooks

If you want to keep using Resend for advanced features (templates, analytics):

1. Configure form service to send webhooks
2. Use a serverless function (Netlify Functions, Cloudflare Workers) to handle webhook
3. Trigger Resend API from the function

**Cost:** Adds serverless function hosting cost.

---

## Migration Implementation Guide

### Phase 1: Contact Form (Priority: High)

1. **Choose form service:** Web3Forms recommended for free tier
2. **Update form component:**
   - Change action to service endpoint
   - Add access key (hidden input or env variable)
   - Add Cloudflare Turnstile
   - Keep honeypot field
3. **Remove server route:** Delete `server/api/contact.post.ts`
4. **Test submission flow**

### Phase 2: Search Functionality (Priority: Medium)

1. **Install Fuse.js:** `npm install fuse.js`
2. **Create search composable:**
   ```typescript
   // composables/useSearch.ts
   import Fuse from 'fuse.js'

   export const useSearch = () => {
     const searchIndex = ref<any[]>([])

     // Load data
     const loadData = async () => {
       const [services, projects] = await Promise.all([
         $fetch('/api/services'), // Direct to WordPress or build-time JSON
         $fetch('/api/projects')
       ])
       searchIndex.value = [...services, ...projects]
     }

     // Initialize Fuse
     const fuse = computed(() => new Fuse(searchIndex.value, {
       keys: ['title', 'description', 'category', 'location'],
       threshold: 0.3
     }))

     const search = (query: string) => {
       return query ? fuse.value.search(query) : []
     }

     return { loadData, search }
   }
   ```
3. **Update search page:** Use client-side composable
4. **Remove server route:** Delete `server/api/search.get.ts`

### Phase 3: RSS Feed (Priority: Low)

1. **Create build script** for RSS generation
2. **Add to build process** in nuxt.config.ts
3. **Remove server route:** Delete `server/api/rss.xml.get.ts`

---

## Cost Comparison

### Current (Server-Side)

| Item | Monthly Cost |
|------|--------------|
| Resend (3000 emails free tier) | $0 |
| Node.js hosting (VPS/SSR) | $5-20+ |
| **Total** | **$5-20+** |

### Static + Services

| Item | Monthly Cost | Notes |
|------|--------------|-------|
| Static hosting (Netlify/Vercel free) | $0 | Generous free tiers |
| Web3Forms | $0 | 250 submissions/month free |
| Cloudflare Turnstile | $0 | Completely free |
| **Total** | **$0** | For typical usage |

### Overages

| Scenario | Web3Forms | Netlify Forms |
|----------|-----------|---------------|
| 500 submissions/month | ~$8 | ~$19 |
| 1000 submissions/month | ~$8 | ~$19+ |

---

## Trade-offs Summary

| Aspect | Server-Side (Current) | Static + Services |
|--------|----------------------|-------------------|
| **Infrastructure** | Requires Node.js hosting | Any static host |
| **Email Control** | Full control with Resend templates | Limited to service templates |
| **Rate Limiting** | Custom logic (3/hour) | Service limits (250/month) |
| **Spam Protection** | Custom honeypot | Built-in + Turnstile |
| **Search** | Server-side, WordPress fetch | Client-side, requires data load |
| **RSS** | Dynamic, always fresh | Build-time, requires rebuild |
| **Cost** | $5-20+ | $0 (free tiers) |
| **Maintenance** | Server updates, security | Service dependency management |

---

## Recommended Migration Path

### For VP Associates Site

Given the site's characteristics:
- Moderate traffic (business website, not high-volume)
- Content managed via WordPress (external CMS)
- Current features: contact form, search, RSS

### Recommendation: Hybrid Static Approach

1. **Hosting:** Deploy as static site (Nuxt SSG)
   - Use Netlify, Vercel, or Cloudflare Pages
   - Free tier sufficient for traffic

2. **Contact Form:** Web3Forms + Turnstile
   - 250 free submissions/month (plenty for business site)
   - Cloudflare Turnstile for bot protection
   - Keep honeypot as backup

3. **Search:** Fuse.js client-side
   - Fetch services/projects from WordPress API at build or client runtime
   - ~100 items total, perfect for Fuse.js
   - Instant search experience

4. **RSS:** Build-time generation
   - Generate during Nuxt build
   - Update when deploying new content

5. **WordPress API Routes:** Keep as-is or make build-time JSON
   - Direct client-side fetch works fine
   - For better performance, generate JSON at build time

### Implementation Complexity: Low

Most replacements are drop-in with minor code changes. No architectural rewrite required.

---

## Decision Matrix

| Feature | Keep Server | Static Migration | Recommendation |
|---------|-------------|------------------|----------------|
| Contact Form | Full control, custom templates | Web3Forms saves hosting cost | **Migrate** - Simple, cost savings |
| Search | Server-side, dynamic | Fuse.js client-side, instant | **Migrate** - Better UX, no server |
| Rate Limiting | Custom logic per IP | Service-level limits | **Migrate** - Sufficient for business site |
| RSS | Dynamic, always fresh | Build-time, requires rebuild | **Keep hybrid** - Build-time is fine |

---

## Gaps & Areas for Further Research

1. **Web3Forms Current Pricing:** Verify pricing hasn't changed for 2026 (LOW confidence from web search)
2. **FormSubmit AJAX Endpoint:** Needs verification of current API (LOW confidence)
3. **Pagefind for Nuxt:** Integration may need research if search requirements grow
4. **WordPress CORS:** Verify CORS configuration for client-side API calls
5. **Build Performance:** Test Fuse.js data loading at build vs runtime

---

## Sources

### Form Services
- [Netlify Forms Documentation](https://docs.netlify.com/forms/) - HIGH confidence (official docs)
- [Formspree Website](https://formspree.io/) - MEDIUM confidence (pricing from web search)
- [Web3Forms](https://web3forms.com/) - MEDIUM confidence (pricing from web search)
- [FormSubmit.co](https://formsubmit.co/) - LOW confidence (AJAX endpoint needs verification)

### Search Libraries
- [Fuse.js GitHub Repository](https://github.com/krisk/Fuse) - HIGH confidence (official repo)
- [Lunr.js Documentation](https://lunrjs.com/) - HIGH confidence (official docs)
- [Pagefind Documentation](https://pagefind.app/) - MEDIUM confidence (from web search)

### Security
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) - HIGH confidence (official docs)

### Pricing & Comparisons
- Static site form pricing comparisons - MEDIUM confidence (web search from 2025-2026)
- Email service alternatives - LOW confidence (web search, may be outdated)

---
*Research completed: 2026-02-23*
*Next review: Before implementing contact form migration*
