# Codebase Concerns

**Analysis Date:** 2026-02-04

## Tech Debt

**In-Memory Rate Limiting:**
- Issue: Contact form uses in-memory Map for rate limiting, which resets on server restart
- Files: `/server/api/contact.post.ts`
- Impact: Submissions can exceed 3 per hour after server restart
- Fix approach: Implement persistent rate limiting using Redis or database storage

**Static Fallback Duplication:**
- Issue: Static data duplicated across multiple composables for fallback scenarios
- Files: `/composables/useInternalApi.ts` (303-507 lines)
- Impact: Maintenance burden when content changes
- Fix approach: Centralize static fallback data in a single module and import as needed

**Hardcoded API URLs:**
- Issue: WordPress API URLs hardcoded in multiple files with no centralized configuration
- Files: `/server/api/search.get.ts`, `/server/api/services/[slug].get.ts`, `/server/api/projects/[slug].get.ts`
- Impact: Difficult to change API endpoint and potential for inconsistencies
- Fix approach: Create centralized API configuration module

## Known Bugs

**Search API Error Handling:**
- Issue: Search API returns error object in response body when failing
- Files: `/server/api/search.get.ts` (172-177)
- Symptoms: Client components may not handle error object in results properly
- Trigger: WordPress API unavailability
- Workaround: Client components should check for error property in response

**Cache Invalidation:**
- Issue: No cache invalidation mechanism for WordPress API responses
- Files: `/nuxt.config.ts` (220-270 PWA caching rules)
- Symptoms: Users may see stale content after updates
- Trigger: Content updates via WordPress CMS

## Security Considerations

**Contact Form XSS Vulnerability:**
- Risk: Limited XSS protection in sanitizeInput function
- Files: `/server/api/contact.post.ts` (50-58)
- Current mitigation: Basic HTML entity encoding
- Recommendations: Implement comprehensive sanitization using DOMPurify or similar

**Rate Limiting Persistence:**
- Risk: In-memory rate limiting can be bypassed with server restart
- Files: `/server/api/contact.post.ts` (22-24)
- Current mitigation: Basic Map-based storage
- Recommendations: Implement persistent rate limiting

**Email Header Injection:**
- Risk: Potential email header injection via user input
- Files: `/server/api/contact.post.ts` (272-279)
- Current mitigation: Minimal input validation
- Recommendations: Sanitize all email headers and use email escaping

## Performance Bottlenecks

**Sequential API Calls:**
- Problem: Search API makes multiple sequential calls to WordPress
- Files: `/server/api/search.get.ts` (94-158)
- Cause: No parallel request optimization
- Improvement path: Implement Promise.all for concurrent API calls

**Static Data Duplication:**
- Problem: Large static arrays duplicated in memory
- Files: `/composables/useInternalApi.ts` (303-507)
- Cause: Fallback data embedded in each composable
- Improvement path: Lazy load fallback data or use shared module

**Nuxt Route Rules:**
- Problem: Extensive individual route rules configuration
- Files: `/nuxt.config.ts` (112-128)
- Cause: Manual configuration for each route
- Improvement path: Use wildcard patterns for similar routes

## Fragile Areas

**WordPress API Dependency:**
- Files: Multiple API routes (`/server/api/`)
- Why fragile: Single point of failure for content
- Safe modification: Always test with WordPress API unavailable
- Test coverage: Basic error handling present but no mock testing

**Environment Configuration:**
- Files: `/nuxt.config.ts`, `.env.example`
- Why fragile: Multiple environment variables required
- Safe modification: Use runtime config defaults
- Test coverage: No environment validation tests

**PWA Service Worker:**
- Files: `/nuxt.config.ts` (PWA section)
- Why fragile: Complex caching rules, potential for storage quota issues
- Safe modification: Test service worker behavior with different network conditions
- Test coverage: Limited testing of service worker scenarios

## Scaling Limits

**Memory Usage:**
- Current capacity: Limited by in-memory rate limiting
- Limit: Number of concurrent users
- Scaling path: Move to Redis for shared state

**API Rate Limiting:**
- Current capacity: 3 submissions per hour per IP
- Limit: Shared across all users
- Scaling path: Implement distributed rate limiting

## Dependencies at Risk

**WordPress CMS Integration:**
- Risk: External dependency that can fail
- Impact: Site loses dynamic content capabilities
- Migration plan: Implement headless CMS with multiple fallback options

**Resend Email Service:**
- Risk: Third-party email service dependency
- Impact: Form submissions cannot be emailed if service fails
- Migration plan: Implement email queue with multiple provider support

## Missing Critical Features

**Content Validation:**
- Problem: No validation for WordPress API responses
- Blocks: Preventing malformed content from breaking layout
- Recommended: Add schema validation for API responses

**Backup Contact Storage:**
- Problem: Contact form submissions only stored in console/email
- Blocks: No persistence of contact data
- Recommended: Implement database storage for form submissions

## Test Coverage Gaps

**API Error Scenarios:**
- What's not tested: API failure modes, timeout handling
- Files: All API routes
- Risk: Production failures not properly handled
- Priority: High

**Component Error Boundaries:**
- What's not tested: Component error recovery
- Files: All Vue components
- Risk: Individual component failures may crash entire page
- Priority: Medium

**Service Worker Edge Cases:**
- What's not tested: Network variations, storage quota exceeded
- Files: PWA configuration
- Risk: Service worker errors may disable offline functionality
- Priority: Medium

**Performance Monitoring:**
- What's not tested: Load times, memory usage
- Files: Build configuration
- Risk: Performance degradation not detected
- Priority: Low

---

*Concerns audit: 2026-02-04*