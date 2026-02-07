# Phase 22: Hero Modernization - Research

**Researched:** 2026-02-07
**Domain:** Competitive Analysis of Engineering Firm Hero Sections
**Confidence:** MEDIUM

## Summary

This competitive research phase analyzed modern hero section design patterns across top engineering and structural engineering firm websites to inform the modernization of VP Associates' hero section. The research examined global leaders (AECOM, WSP, Jacobs, Thornton Tomasetti, Arup) as well as regional firms similar to VP Associates (DCI Engineers, BBM Structural, Russ Row).

**Key finding:** The engineering industry has shifted decisively away from carousel/slider-based heroes toward **static, single-message heroes** with large typography and purpose-driven messaging. The research found strong evidence (from conversion rate studies and competitor analysis) that multi-slide carousels hurt conversions and user engagement.

**Primary recommendation:** Replace the current 9-slide carousel with a static hero featuring bold typography, a single value proposition headline, and high-quality project photography. Consider a subtle video background or scroll-triggered animations for visual interest, but prioritize clear messaging over motion.

## Competitive Landscape

### Global Engineering Firms Analyzed

| Firm | Hero Type | Layout | Headline Style | CTA |
|------|-----------|--------|----------------|-----|
| **Thornton Tomasetti** | Static image | Full-screen | Bold: "Here's How" | None in hero |
| **Arup** | Static image | Full-screen | Aspirational: "We shape a better world" | None |
| **Jacobs** | Minimal/text | Text-forward | Mission-driven: "Challenging today. Reinventing tomorrow" | Minimal |
| **DCI Engineers** | Static image | Full-screen | Core values: "Service. Innovation. Value." | None |
| **BBM Structural** | Image slider | Full-width carousel | Project-focused: "Let's turn great ideas into great projects" | "EXPLORE CAPABILITIES" |
| **Russ Row** | Static text | Structured blocks | Service-focused: "Structural Engineering Jacksonville & Tampa" | "GET IN TOUCH" |
| **Stiver Engineering** | Video background | Full-screen video | Descriptive: "Top Civil Engineering & Structural Design Consultants" | None visible |

**Notable observations:**
- **5 out of 7 firms use static heroes** (no rotation)
- Only BBM Structural uses a carousel/slider approach
- Video backgrounds exist but are rare (1 out of 7)
- Most leading firms omit CTAs in the hero section, relying on navigation instead
- Messaging is concise (3-6 words for primary headline)

### Current VP Associates Hero vs. Industry

| Aspect | VP Associates (Current) | Industry Standard (2026) |
|--------|------------------------|--------------------------|
| **Content type** | 9-slide carousel with auto-rotation | Static, single message |
| **Slide duration** | 9 seconds per slide | N/A (no rotation) |
| **Headlines** | 2-line titles with generic phrases | Bold, singular value proposition |
| **CTA** | One button per slide | Often none, or single clear CTA |
| **Motion** | Parallax + slide transitions | Subtle scroll or minimal motion |
| **Images** | Stock architecture photos | Project photography, people, or video |

## Design Patterns Observed

### 1. The "Big Type" Hero (Dominant 2026 Trend)

**What it is:** Full-screen hero with oversized typography as the primary visual element. Text dominates over imagery.

**Seen at:**
- Thornton Tomasetti: "Here's How" (minimal, confident)
- Jacobs: "Challenging today. Reinventing tomorrow" (mission statement)

**Why it works:**
- Instant communication of value proposition
- Loads faster than image-heavy heroes
- Mobile-responsive by nature
- Aligns with 2026 typography trend: "confidence in type"

**Implementation notes:**
- Headlines: 60-100px on desktop, scaling down to 32-48px on mobile
- Often uses gradient text effects for visual interest
- Backgrounds are subtle (dark overlays, abstract patterns) to let text stand out

### 2. The Purpose-Driven Hero

**What it is:** Hero focused on the company's mission and impact rather than services or features.

**Examples:**
- Arup: "We shape a better world" / "Creating thriving communities"
- Jacobs: "Challenging today. Reinventing tomorrow"

**Messaging patterns:**
- Aspirational language (shape, build, create, challenge)
- Focus on outcomes (better world, thriving communities)
- Implicit expertise rather than explicit claims

### 3. The Regional/Service-Focused Hero

**What it is:** For regional firms, heroes that clearly communicate service area and primary offering.

**Examples:**
- DCI Engineers: "Service. Innovation. Value." with "Since 1988..." context
- Russ Row: "Structural Engineering Jacksonville & Tampa"

**When this pattern works:**
- Regional firms with clear service area
- When brand recognition is lower than national firms
- When SEO for location-based searches is important

### 4. Video Background Hero (Niche Use)

**What it is:** Full-screen muted video loop as background with text overlay.

**Seen at:** Stiver Engineering

**Pros:**
- High visual impact
- Can show projects/process in motion
- Demonstrates technical capability

**Cons:**
- Performance impact (LCP scores)
- Mobile compatibility issues
- Requires high-quality video assets
- Can distract from messaging

**Best practices for video:**
- 720p maximum resolution (1280x720)
- WebM format preferred
- Fallback to static image on mobile
- Poster image for instant load
- File size under 3MB

## Messaging Strategies

### Headline Patterns That Work

| Pattern | Example | Why It Works |
|---------|---------|--------------|
| **Confident minimal** | "Here's How" | Bold, intriguing, conversation-starter |
| **Mission-driven** | "We shape a better world" | Aspirational, purpose-focused |
| **Outcome-focused** | "Creating thriving communities" | Benefits over features |
| **Value statement** | "Service. Innovation. Value." | Clear positioning |
| **Action-oriented** | "Challenging today. Reinventing tomorrow" | Forward momentum |

### Headline Formulas for VP Associates

Based on competitive research and positioning:

1. **The "Since 1990" Authority Play**
   - "Trusted by Tampa Bay Since 1990"
   - "30+ Years of Structural Excellence"

2. **The Outcome Focus**
   - "Building Tampa Bay's Future"
   - "Structures That Stand the Test of Time"

3. **The Capability Statement**
   - "Precision Structural Engineering"
   - "Comprehensive Structural Solutions"

4. **The Local Expert**
   - "Tampa Bay's Structural Engineers"
   - "Your Partner in Structural Excellence"

### CTA Best Practices

**What works:**
- Single, clear CTA (not multiple competing options)
- Action-oriented language: "Get Started", "Talk to an Expert", "Start Your Project"
- Professional tone matching engineering industry

**What to avoid:**
- Generic "Learn More" (lacks character)
- Multiple CTAs competing for attention
- CTAs that don't clearly indicate what happens next

**Effective CTAs observed:**
- "Let's Talk" (personal, professional)
- "Explore Capabilities" (curiosity-driven)
- "Tell Us About Your Project" (action-oriented)

## Technical Approaches

### Carousel vs Static: The Data

**Research findings on carousels:**

1. **Click-through data (Notre Dame study):**
   - 1% of visitors click on carousel slides
   - 84% of clicks are on the first slide
   - Slides 2+ combined receive only 16% of clicks

2. **Conversion impact:**
   - A/B test: Removing carousel increased sales by 23% (financial services)
   - Static content consistently outperforms carousels for conversion-focused pages
   - Carousels scatter attention and reduce action likelihood

3. **User experience:**
   - Auto-forwarding carousels annoy users (Nielsen Norman study)
   - Users often miss content as it rotates away
   - Reduces visibility of secondary content

**Conclusion:** The industry has moved away from carousels for good reason. VP Associates' 9-slide hero is likely hurting conversion and user experience.

### Performance Best Practices (2026)

**Image optimization:**
- Keep hero images under 200KB
- Use WebP or AVIF format
- Responsive images with srcset (don't serve desktop images to mobile)
- Lazy load for below-fold content, but eager load hero

**Video optimization:**
- 720p max resolution
- WebM format with MP4 fallback
- File size under 3MB
- Muted, autoplay, no controls
- Static poster image for instant load

**Animation best practices:**
- CSS-first approach (scroll-timeline, view-timeline)
- Use 3D transforms for GPU acceleration
- Respect `prefers-reduced-motion`
- Minimal JavaScript for animations
- Test mobile performance (animation can hurt mid-range devices)

### Mobile Considerations (Critical)

**Key differences for mobile:**
- Vertical stacking of elements
- Compressed white space
- Touch targets minimum 44x44 pixels
- Font sizes: 32px+ headlines on mobile
- Simplified imagery (crop for portrait orientation)
- Consider static image for mobile even if desktop has video

**Mobile-first approach:**
- Design mobile layout separately, not as scaled-down desktop
- Thumb-accessible CTAs (bottom of screen on mobile)
- Test on actual devices, not just browser emulation

## Imagery Strategies

### What Works for Engineering/Construction Firms (2026)

**1. Completed Project Photography**
   - Highest impact visual
   - Demonstrates capability
   - Builds trust through proof

**2. People/Collaboration Imagery**
   - Engineers working together
   - Client interactions
   - Humanizes the firm

**3. Technology/Process Visualization**
   - BIM renders
   - AR visualizations (emerging trend)
   - Technical drawings as design elements

**4. On-Site Construction Photos**
   - Shows active projects
   - Demonstrates scale and complexity
   - Process transparency

### What to Avoid

- Generic stock architecture photos (trust killer)
- Abstract concepts without clear connection to services
- Over-edited or unrealistic renders
- Imagery that doesn't match regional context

### VP Associates-Specific Recommendations

**Ideal imagery mix:**
1. Local Tampa Bay projects (recognizable landmarks)
2. Team photos (licensed professionals)
3. Before/after construction photos
4. Technical details (drawings, schematics as overlays)

## Anti-Patterns to Avoid

### Carousel Fatigue (Current VP Associates Issue)

**Problem:** 9 slides with 9-second rotation means users rarely see past the first 2-3 slides.

**Evidence:** 84% of carousel clicks happen on slide 1; only 1% of users interact with carousels at all.

**Solution:** Single static hero with rotating content below the fold or in a "Featured Projects" section.

### Over-Animation

**Problem:** Too much motion (parallax + transitions + zoom) can feel dated and hurt performance.

**Evidence:** 2026 trend is toward "confident minimal" - let content shine through typography and imagery.

**Solution:** One animation technique maximum (e.g., subtle parallax OR scroll reveal, not both).

### Generic Messaging

**Problem:** "Structural Engineering Excellence" could apply to any firm.

**Evidence:** Competitive analysis shows firms that differentiate with specific positioning (Thornton Tomasetti's "Here's How", Arup's "We shape a better world").

**Solution:** Develop a unique value proposition that reflects VP Associates' Tampa Bay expertise and 30+ year history.

### Weak CTAs

**Problem:** "Learn More" gives users no clear sense of what they'll get.

**Evidence:** Best practices recommend specific, action-oriented CTAs like "Let's Talk" or "Tell Us About Your Project."

**Solution:** Use conversational, specific CTAs that clearly indicate the next step.

## Recommendations for VP Associates

### Priority 1: Replace Carousel with Static Hero

**Current state:** 9-slide carousel with 9-second auto-rotation
**Recommended:** Static hero with single value proposition

**Rationale:**
- Industry leaders use static heroes (5/7 firms analyzed)
- Conversion data shows carousels hurt performance
- Simplifies maintenance
- Improves mobile experience
- Better accessibility (no motion issues)

**Implementation approach:**
1. Select strongest single image from current slides
2. Develop concise headline (5-7 words max)
3. Single clear CTA or no CTA (let navigation guide)
4. Consider subtle scroll-triggered animation for interest

### Priority 2: Develop Bold Headline

**Current:** "Structural Engineering Excellence" and other generic 2-line phrases

**Recommended options:**
1. **Authority focus:** "Trusted by Tampa Bay Since 1990"
2. **Outcome focus:** "Structures That Stand the Test of Time"
3. **Local focus:** "Tampa Bay's Structural Engineers"
4. **Capability focus:** "Precision Structural Engineering"

**Typography approach:**
- Large, confident sizing (64-80px desktop, 40-48px mobile)
- Bold weight (700+)
- Consider gradient text effect for visual interest
- Clean, modern sans-serif (Inter, Poppins, or similar)

### Priority 3: Modernize Imagery Strategy

**Current:** Stock architecture photos from international locations

**Recommended:**
1. **Lead with local projects:** Tampa Bay recognizable buildings
2. **Show the work:** Construction photos, not just finished buildings
3. **Include people:** Team photos, client collaboration
4. **Technical elements:** Subtle overlays of drawings/schematics

**Performance:**
- WebP format
- Under 200KB file size
- Responsive srcset for mobile optimization

### Priority 4: Consider Video (Optional Enhancement)

**If pursued:**
- Subtle background video of construction process or local project
- 720p max, WebM format, under 3MB
- Fallback to static image on mobile
- Muted autoplay with poster image

**If skipped (simpler approach):**
- High-quality static project photo
- Subtle parallax or scroll-triggered reveal
- Better performance and accessibility

### Priority 5: Simplify CTAs

**Current:** "Our Services", "View Projects", "Learn More"

**Recommended options:**
1. "Let's Talk" (conversational)
2. "Start Your Project" (action-oriented)
3. "Tell Us About Your Project" (specific)

**Or consider no hero CTA:**
- Follow Thornton Tomasetti, Arup pattern
- Let navigation and section CTAs guide users
- Cleaner, more confident presentation

## Implementation Technical Notes

### Recommended Stack for Modern Hero

**For static hero with animations:**
- Vue 3 Composition API (already in use)
- VueUse for scroll detection (already in use)
- CSS-based animations (scroll-timeline, view-timeline)
- Nuxt Image for optimization (already in use)

**If adding video:**
- Native HTML5 video element
- No heavy video libraries needed
- Fallback strategy for mobile

**Animation libraries:**
- GSAP (if needed for complex sequences)
- Or CSS-only for simpler implementations

### Performance Targets

| Metric | Target | Why |
|--------|--------|-----|
| LCP (Largest Contentful Paint) | < 2.5s | Core Web Vitals threshold |
| Hero image size | < 200KB | Fast initial load |
| First Contentful Paint | < 1.8s | Perceived performance |
| Cumulative Layout Shift | < 0.1 | Stable layout |

## Open Questions

1. **Brand positioning:** What is VP Associates' unique value proposition? This should inform the headline choice. Research suggests Tampa Bay expertise and 30+ year history are key differentiators.

2. **Image assets:** Does VP Associates have access to high-quality photography of local projects? If not, budget may be needed for professional photography.

3. **Video capability:** Is there existing video content of projects/process? If not, video background may not be practical.

4. **Team preference:** Does the team prefer bold/minimal design or more traditional approach? This affects how aggressively to modernize.

## Sources

### Primary (HIGH confidence)
- Thornton Tomasetti website - Direct analysis of hero section
- Arup website - Direct analysis of hero section
- DCI Engineers website - Direct analysis of hero section
- BBM Structural website - Direct analysis of hero section
- Russ Row website - Direct analysis of hero section
- Stiver Engineering website - Direct analysis of hero section

### Secondary (MEDIUM confidence)
- [Why Image Carousels Are Almost Always A Bad Idea - The Good](https://thegood.com/insights/ecommerce-image-carousels/)
- [How to Use Image Carousels the Right Way [2026] - VWO](https://vwo.com/blog/image-slider-alternatives/)
- [Do Rotating Sliders Help or Hurt Your Website? - Orbit Media](https://www.orbitmedia.com/blog/rotating-sliders-hurt-website/)
- [17+ Engineering Website Design Examples in 2026 - Weblium](https://weblium.com/blog/best-engineering-firm-website-examples/)
- [Engineering Websites: 10 Web Design Tips + 30 Examples - OpenAsset](https://openasset.com/resources/engineering-website-examples/)
- [Breaking it Down: Great Web Design for Engineering Companies - Sagefrog](https://www.sagefrog.com/blog/breaking-it-down-great-web-design-for-engineering-companies/)

### Tertiary (LOW confidence - marked for validation)
- [Top 10 Hero Sections of 2026 - Paperstreet](https://www.paperstreet.com/blog/top-10-hero-sections/)
- [Hero Section Design: Best Practices & Examples for 2026 - Perfect Afternoon](https://www.perfectafternoon.com/2025/hero-section-design/)
- [3 examples and 3 tips for engaging hero section videos - TwicPics](https://www.twicpics.com/blog/3-examples-and-3-tips-for-engaging-hero-section-videos)
- [Parallax Scrolling: Still Cool in 2026? - Webbb.ai](https://www.webbb.ai/blog/parallax-scrolling-still-cool-in-2026)
- [10 Best Construction Website Designs of 2026 - Azuro Digital](https://azurodigital.com/construction-website-examples/)
- [Top 10 Design & Typography Trends for 2026 - Fontfabric](https://www.fontfabric.com/blog/10-design-trends-shaping-the-visual-typographic-landscape-in-2026/)

## Metadata

**Confidence breakdown:**
- Carousel vs static findings: HIGH - Supported by multiple A/B test sources
- Engineering firm hero patterns: MEDIUM - Direct analysis of 7 firm websites
- Typography trends: LOW - Based on 2026 trend articles (validate with design team)
- Video performance: MEDIUM - Multiple technical sources agree
- Messaging strategies: MEDIUM - Value proposition research + competitor analysis

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days - web design trends evolve quarterly)

**Key assumptions:**
- VP Associates targets regional (Tampa Bay) clients
- Conversion improvement is a goal of the modernization
- Budget exists for at least some new imagery
- Technical team can implement CSS/JS animations

**Next steps for planning:**
1. Confirm brand positioning and key differentiators
2. Audit available image assets
3. Decide on static vs video approach
4. Select headline variant based on brand strategy
5. Design hero component mockups
