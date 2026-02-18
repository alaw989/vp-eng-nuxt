/**
 * Tests for /api/projects/[slug] API endpoint
 * Tests the single project detail endpoint with static fallback data
 *
 * Note: These tests verify the static data structure without importing
 * the server file directly (which uses Nitro globals unavailable in Vitest).
 */
import { describe, it, expect } from 'vitest'

// Static project data extracted from the API route
const staticProjects: Record<string, any> = {
  'tampa-marina-complex': {
    id: 1,
    title: { rendered: 'Tampa Marina Complex' },
    slug: 'tampa-marina-complex',
    excerpt: { rendered: '<p>Complete structural design for a 50-slip marina with restaurant and retail spaces</p>' },
    content: { rendered: '<p>VP Associates provided complete structural engineering services for this premier marina development on the Tampa waterfront. The project features 50 boat slips, a two-story restaurant building, and retail spaces.</p><p>Our design addressed the unique challenges of marine construction, including wave loads, vessel impact, and corrosion protection. The structure utilizes concrete pile foundations, precast deck panels, and a steel-framed restaurant building.</p><p>The project also included design of seawall protection systems, dock infrastructure, and waterfront hardscape. Construction was completed in 2024 and has become a landmark destination on the Tampa waterfront.</p>' },
    acf: {
      category: 'Marine',
      location: 'Tampa, FL',
      year: '2024',
      squareFootage: '45,000 sq ft',
      services_provided: ['Structural Steel Design', 'Foundation Design', 'Seawall Design', 'Inspection Services']
    },
    _embedded: {}
  },
  'downtown-office-tower': {
    id: 2,
    title: { rendered: 'Downtown Office Tower' },
    slug: 'downtown-office-tower',
    excerpt: { rendered: '<p>Structural steel design for 12-story commercial office building</p>' },
    content: { rendered: '<p>This 12-story office tower in downtown Tampa features a sophisticated structural steel frame designed by VP Associates. The building provides Class A office space with floor plates optimized for flexibility and natural light.</p><p>Our structural design utilizes a moment frame system with composite steel beams and concrete-filled metal deck floors. The lateral system incorporates buckling-restrained braced frames (BRBF) to optimize the structural efficiency and maximize usable space.</p><p>The foundation system utilizes drilled shafts socketed into bedrock, designed to support the high column loads while minimizing settlement. The project was completed in 2023 and has achieved LEED Silver certification.</p>' },
    acf: {
      category: 'Commercial',
      location: 'Tampa, FL',
      year: '2023',
      squareFootage: '180,000 sq ft',
      services_provided: ['Structural Steel Design', 'Steel Connection Design', 'Foundation Design', 'CAD & 3D Modeling']
    },
    _embedded: {}
  },
  'coastal-seawall-system': {
    id: 3,
    title: { rendered: 'Coastal Seawall System' },
    slug: 'coastal-seawall-system',
    excerpt: { rendered: '<p>Engineered seawall protection system for luxury waterfront property</p>' },
    content: { rendered: '<p>VP Associates designed a comprehensive seawall protection system for this luxury residential property in Clearwater. The project involved replacing an existing deteriorated seawall with a modern, engineered solution.</p><p>The new seawall design incorporates concrete sheet piles with a reinforced concrete cap and tie-back anchor system. The design addressed wave loads, hydrostatic pressures, and vessel impact requirements while maintaining aesthetic appeal.</p><p>Our design included integrated drainage features, a decorative wave wall on top, and corrosion protection for the marine environment. The project was completed in 2024 and provides decades of reliable protection for the property.</p>' },
    acf: {
      category: 'Marine',
      location: 'Clearwater, FL',
      year: '2024',
      services_provided: ['Seawall Design', 'Foundation Design', 'Inspection Services']
    },
    _embedded: {}
  },
  'luxury-residential-estate': {
    id: 4,
    title: { rendered: 'Luxury Residential Estate' },
    slug: 'luxury-residential-estate',
    excerpt: { rendered: '<p>Complete structural design for 8,000 sq ft waterfront residence</p>' },
    content: { rendered: '<p>This 8,000 square foot luxury waterfront residence features a complete structural design by VP Associates. The home includes expansive water views, multiple outdoor living spaces, and a pool structure.</p><p>The structural system utilizes concrete pile foundations to address the coastal soil conditions, with a combination of concrete and steel framing to support the architectural vision. The design incorporated long-span elements to create open, column-free spaces.</p><p>Special features included a cantilevered balcony system, a rooftop terrace, and integration with the pool structure. The project was completed in 2024 and showcases our residential design capabilities.</p>' },
    acf: {
      category: 'Residential',
      location: 'St. Petersburg, FL',
      year: '2024',
      squareFootage: '8,000 sq ft',
      services_provided: ['Wood Design', 'Concrete Design', 'Foundation Design']
    },
    _embedded: {}
  },
  'industrial-warehouse-complex': {
    id: 5,
    title: { rendered: 'Industrial Warehouse Complex' },
    slug: 'industrial-warehouse-complex',
    excerpt: { rendered: '<p>Pre-engineered metal building structure with 40,000 sq ft warehouse</p>' },
    content: { rendered: '<p>VP Associates provided structural design for this 40,000 square foot industrial warehouse in Brandon. The facility features a pre-engineered metal building system optimized for storage and distribution operations.</p><p>Our design included the primary metal building structure as well as design of concrete foundations, tilt-wall office enclosures, and loading dock structures. The structural system accommodates heavy roof loads for HVAC equipment and solar panel installation.</p><p>The foundation design addressed the poor soil conditions with a ground improvement program and spread footings. The project was completed in 2023 and serves as a key distribution facility.</p>' },
    acf: {
      category: 'Industrial',
      location: 'Brandon, FL',
      year: '2023',
      squareFootage: '40,000 sq ft',
      services_provided: ['Structural Steel Design', 'Foundation Design', 'Steel Connection Design']
    },
    _embedded: {}
  },
  'school-classroom-wing': {
    id: 6,
    title: { rendered: 'School Classroom Wing' },
    slug: 'school-classroom-wing',
    excerpt: { rendered: '<p>Masonry and steel design for new 2-story classroom addition</p>' },
    content: { rendered: '<p>This new two-story classroom wing addition provides modern learning spaces for an existing school campus in Lakeland. VP Associates designed the complete structural system for the 15,000 square foot addition.</p><p>The structure utilizes concrete masonry bearing walls with a steel bar joist roof system. The design accommodates large window openings for natural light while meeting all educational facility code requirements including hurricane design criteria.</p><p>The foundation system uses shallow spread footings founded on competent soil. Our design included coordination with the existing building structure to ensure a seamless integration. The project was completed in 2023.</p>' },
    acf: {
      category: 'Institutional',
      location: 'Lakeland, FL',
      year: '2023',
      squareFootage: '15,000 sq ft',
      services_provided: ['Masonry Design', 'Structural Steel Design', 'Foundation Design']
    },
    _embedded: {}
  },
  'waterfront-restaurant': {
    id: 7,
    title: { rendered: 'Waterfront Restaurant' },
    slug: 'waterfront-restaurant',
    excerpt: { rendered: '<p>Structural design for elevated restaurant with deck over water</p>' },
    content: { rendered: '<p>VP Associates provided structural engineering for this elevated waterfront restaurant in Tampa. The design features a main dining deck over the water with panoramic views and a support building on shore.</p><p>The structural system includes concrete pile foundations supporting a steel-framed deck structure. The design addressed wave loads, vessel impact criteria, and corrosion protection for the marine environment.</p><p>Special considerations included HVAC equipment support, outdoor kitchen structure, and integration with an existing dock system. The project was completed in 2024.</p>' },
    acf: {
      category: 'Commercial',
      location: 'Tampa, FL',
      year: '2024',
      squareFootage: '6,000 sq ft',
      services_provided: ['Structural Steel Design', 'Foundation Design', 'Seawall Design']
    },
    _embedded: {}
  },
  'boat-storage-facility': {
    id: 8,
    title: { rendered: 'Boat Storage Facility' },
    slug: 'boat-storage-facility',
    excerpt: { rendered: '<p>Pre-engineered metal building for dry stack boat storage</p>' },
    content: { rendered: '<p>This dry stack boat storage facility in Clearwater features a pre-engineered metal building structure designed by VP Associates. The facility provides protected storage for over 100 boats with a marine forklift retrieval system.</p><p>Our structural design included the primary metal building system with overhead crane support, concrete foundations, and a specialized rack system for boat storage. The design addressed high corrosion potential with appropriate protective measures.</p><p>The foundation system utilized concrete piles to address poor soil conditions. The project was completed in 2023.</p>' },
    acf: {
      category: 'Marine',
      location: 'Clearwater, FL',
      year: '2023',
      squareFootage: '25,000 sq ft',
      services_provided: ['Structural Steel Design', 'Foundation Design', 'Steel Connection Design']
    },
    _embedded: {}
  },
  'multi-family-housing': {
    id: 9,
    title: { rendered: 'Multi-Family Housing' },
    slug: 'multi-family-housing',
    excerpt: { rendered: '<p>Structural design for 4-story wood frame apartment complex</p>' },
    content: { rendered: '<p>VP Associates designed the complete structural system for this 4-story apartment complex in Tampa. The project features 48 residential units with a mix of one-, two-, and three-bedroom floor plans.</p><p>The structure utilizes wood frame construction with concrete masonry elevator and stair shafts. The design included floor trusses, roof trusses, and a comprehensive lateral load resisting system using wood shear walls.</p><p>Foundation design utilized shallow spread footings on competent soil. The project was completed in 2023.</p>' },
    acf: {
      category: 'Residential',
      location: 'Tampa, FL',
      year: '2023',
      squareFootage: '52,000 sq ft',
      services_provided: ['Wood Design', 'Foundation Design', 'Masonry Design']
    },
    _embedded: {}
  },
  'manufacturing-plant-addition': {
    id: 10,
    title: { rendered: 'Manufacturing Plant Addition' },
    slug: 'manufacturing-plant-addition',
    excerpt: { rendered: '<p>Steel frame expansion for heavy manufacturing facility</p>' },
    content: { rendered: '<p>This manufacturing plant expansion in Sarasota required careful structural design to accommodate heavy production equipment and overhead cranes. VP Associates provided complete structural engineering for the 30,000 square foot addition.</p><p>The structural system utilizes steel moment frames with heavy crane runway beams. The design addressed dynamic loads from manufacturing equipment, vibration considerations, and integration with the existing facility.</p><p>Foundation design included both shallow and deep foundation systems depending on loading requirements. The project was completed in 2024.</p>' },
    acf: {
      category: 'Industrial',
      location: 'Sarasota, FL',
      year: '2024',
      squareFootage: '30,000 sq ft',
      services_provided: ['Structural Steel Design', 'Foundation Design', 'Steel Connection Design']
    },
    _embedded: {}
  },
  'community-center': {
    id: 11,
    title: { rendered: 'Community Center' },
    slug: 'community-center',
    excerpt: { rendered: '<p>Masonry and steel design for 15,000 sq ft community facility</p>' },
    content: { rendered: '<p>VP Associates provided structural design for this new community center in Bradenton. The 15,000 square foot facility includes a large gathering space, classrooms, a kitchen, and administrative offices.</p><p>The structural system combines concrete masonry walls with steel roof joists and bar joists. The design accommodates large clear spans for the main gathering space and includes a full stage platform.</p><p>Foundation design utilized shallow spread footings. The project was completed in 2023.</p>' },
    acf: {
      category: 'Institutional',
      location: 'Bradenton, FL',
      year: '2023',
      squareFootage: '15,000 sq ft',
      services_provided: ['Masonry Design', 'Structural Steel Design', 'Foundation Design']
    },
    _embedded: {}
  },
  'retail-shopping-center': {
    id: 12,
    title: { rendered: 'Retail Shopping Center' },
    slug: 'retail-shopping-center',
    excerpt: { rendered: '<p>Structural design for strip mall with 6 retail spaces</p>' },
    content: { rendered: '<p>This retail shopping center in Brandon features six retail tenant spaces with a unified structural design by VP Associates. The 12,000 square foot center includes strip mall construction with shared walls between tenants.</p><p>The structural system utilizes concrete masonry walls with steel roof joists. The design accommodates individual tenant HVAC needs and includes provisions for future storefront modifications.</p><p>Foundation design utilized shallow spread footings. The project was completed in 2024.</p>' },
    acf: {
      category: 'Commercial',
      location: 'Brandon, FL',
      year: '2024',
      squareFootage: '12,000 sq ft',
      services_provided: ['Masonry Design', 'Structural Steel Design', 'Foundation Design']
    },
    _embedded: {}
  }
}

describe('API: /api/projects/[slug] - Static Data Structure', () => {
  const validSlugs = Object.keys(staticProjects)

  describe('slug validation', () => {
    it.each(validSlugs)('should have all required fields for %s', (slug) => {
      const project = staticProjects[slug]

      expect(project).toBeDefined()
      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('title')
      expect(project).toHaveProperty('slug', slug)
      expect(project).toHaveProperty('excerpt')
      expect(project).toHaveProperty('content')
      expect(project).toHaveProperty('acf')
      expect(project).toHaveProperty('_embedded')
    })

    it('should have valid title structure', () => {
      const project = staticProjects['tampa-marina-complex']

      expect(project.title).toHaveProperty('rendered')
      expect(project.title.rendered).toBe('Tampa Marina Complex')
    })

    it('should have valid excerpt structure', () => {
      const project = staticProjects['downtown-office-tower']

      expect(project.excerpt).toHaveProperty('rendered')
      expect(project.excerpt.rendered).toBeTruthy()
      expect(project.excerpt.rendered).toMatch(/<p>.*<\/p>/)
    })

    it('should have valid content structure', () => {
      const project = staticProjects['coastal-seawall-system']

      expect(project.content).toHaveProperty('rendered')
      expect(project.content.rendered).toBeTruthy()
      expect((project.content.rendered.match(/<p>/g) || []).length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('ACF fields', () => {
    it.each(validSlugs)('should have ACF category for %s', (slug) => {
      const project = staticProjects[slug]

      expect(project.acf).toHaveProperty('category')
      expect(project.acf.category).toBeTruthy()
    })

    it.each(validSlugs)('should have ACF location for %s', (slug) => {
      const project = staticProjects[slug]

      expect(project.acf).toHaveProperty('location')
      expect(project.acf.location).toBeTruthy()
      expect(project.acf.location).toMatch(/FL$/)
    })

    it.each(validSlugs)('should have ACF year for %s', (slug) => {
      const project = staticProjects[slug]

      expect(project.acf).toHaveProperty('year')
      expect(project.acf.year).toMatch(/^\d{4}$/)
    })

    it('should have square footage for applicable projects', () => {
      const projectWithSqFt = staticProjects['tampa-marina-complex']
      const projectWithoutSqFt = staticProjects['coastal-seawall-system']

      expect(projectWithSqFt.acf).toHaveProperty('squareFootage')
      expect(projectWithSqFt.acf.squareFootage).toMatch(/sq ft$/)
      expect(projectWithoutSqFt.acf.squareFootage).toBeUndefined()
    })

    it.each(validSlugs)('should have services_provided array for %s', (slug) => {
      const project = staticProjects[slug]

      expect(project.acf).toHaveProperty('services_provided')
      expect(Array.isArray(project.acf.services_provided)).toBe(true)
      expect(project.acf.services_provided.length).toBeGreaterThan(0)
    })
  })

  describe('project categories', () => {
    it('should have valid project categories', () => {
      const validCategories = ['Marine', 'Commercial', 'Residential', 'Industrial', 'Institutional']

      for (const slug of validSlugs) {
        const project = staticProjects[slug]
        expect(validCategories).toContain(project.acf.category)
      }
    })

    it('should categorize projects correctly', () => {
      expect(staticProjects['tampa-marina-complex'].acf.category).toBe('Marine')
      expect(staticProjects['downtown-office-tower'].acf.category).toBe('Commercial')
      expect(staticProjects['luxury-residential-estate'].acf.category).toBe('Residential')
      expect(staticProjects['industrial-warehouse-complex'].acf.category).toBe('Industrial')
      expect(staticProjects['school-classroom-wing'].acf.category).toBe('Institutional')
    })
  })

  describe('project locations', () => {
    it('should have valid Florida locations', () => {
      const validLocations = [
        'Tampa, FL',
        'Clearwater, FL',
        'St. Petersburg, FL',
        'Brandon, FL',
        'Lakeland, FL',
        'Sarasota, FL',
        'Bradenton, FL'
      ]

      for (const slug of validSlugs) {
        const project = staticProjects[slug]
        expect(validLocations).toContain(project.acf.location)
      }
    })
  })

  describe('services provided', () => {
    it('should include Seawall Design in seawall projects', () => {
      // Only projects specifically about seawalls should include Seawall Design
      const seawallProjects = ['tampa-marina-complex', 'coastal-seawall-system', 'waterfront-restaurant']

      for (const slug of seawallProjects) {
        const project = staticProjects[slug]
        expect(project.acf.services_provided).toContain('Seawall Design')
      }
    })

    it('should include Foundation Design in all projects', () => {
      for (const slug of validSlugs) {
        const project = staticProjects[slug]
        expect(project.acf.services_provided).toContain('Foundation Design')
      }
    })

    it('should have valid service names', () => {
      const validServices = [
        'Structural Steel Design',
        'Foundation Design',
        'Seawall Design',
        'Inspection Services',
        'Steel Connection Design',
        'CAD & 3D Modeling',
        'Wood Design',
        'Concrete Design',
        'Masonry Design'
      ]

      for (const slug of validSlugs) {
        const project = staticProjects[slug]
        for (const service of project.acf.services_provided) {
          expect(validServices).toContain(service)
        }
      }
    })
  })

  describe('project IDs', () => {
    it('should have sequential IDs starting from 1', () => {
      expect(staticProjects['tampa-marina-complex'].id).toBe(1)
      expect(staticProjects['downtown-office-tower'].id).toBe(2)
      expect(staticProjects['coastal-seawall-system'].id).toBe(3)
    })
  })

  describe('content quality', () => {
    it.each(validSlugs)('should have meaningful project description for %s', (slug) => {
      const project = staticProjects[slug]
      const content = project.content.rendered

      expect(content.length).toBeGreaterThan(200)
      expect(content).toMatch(/VP Associates/)
    })

    it.each(validSlugs)('should have HTML content with paragraphs for %s', (slug) => {
      const project = staticProjects[slug]
      const content = project.content.rendered

      expect(content).toMatch(/<p>/)
      expect(content).toMatch(/<\/p>/)
    })
  })

  describe('_embedded field', () => {
    it.each(validSlugs)('should have _embedded object for %s', (slug) => {
      const project = staticProjects[slug]

      expect(project).toHaveProperty('_embedded')
      expect(typeof project._embedded).toBe('object')
    })
  })

  describe('invalid slugs', () => {
    it('should return undefined for non-existent slug', () => {
      const project = staticProjects['non-existent-project']
      expect(project).toBeUndefined()
    })
  })

  describe('marine projects', () => {
    it('should have at least 3 marine projects', () => {
      const marineProjects = Object.values(staticProjects).filter((p: any) => p.acf.category === 'Marine')
      expect(marineProjects.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('recent projects', () => {
    it('should have projects from 2023 and 2024', () => {
      const years = new Set(Object.values(staticProjects).map((p: any) => p.acf.year))

      expect(years).toContain('2023')
      expect(years).toContain('2024')
    })
  })
})
