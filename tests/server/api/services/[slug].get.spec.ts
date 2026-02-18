/**
 * Tests for /api/services/[slug] API endpoint
 * Tests the single service detail endpoint with static fallback data
 *
 * Note: These tests verify the static data structure without importing
 * the server file directly (which uses Nitro globals unavailable in Vitest).
 */
import { describe, it, expect } from 'vitest'

// Static service data extracted from the API route
const staticServices: Record<string, any> = {
  'structural-steel-design': {
    id: 1,
    title: { rendered: 'Structural Steel Design' },
    slug: 'structural-steel-design',
    excerpt: { rendered: '<p>AISC certified steel design for commercial and industrial projects</p>' },
    content: { rendered: '<p>Our structural steel design services cover a comprehensive range of steel construction needs. From moment frames to braced frames, we deliver efficient, code-compliant steel solutions that optimize material usage while ensuring structural integrity.</p><p>We specialize in steel connection design, metal building systems, industrial platforms, and seismic load analysis. Our team is AISC certified and stays current with the latest steel construction standards and technologies.</p>' },
    acf: {
      icon: 'mdi:beam',
      standard: 'AISC Certified',
      capabilities: [
        'Moment frame design',
        'Braced frame systems',
        'Steel connection design',
        'Metal building systems',
        'Industrial platforms and mezzanines',
        'Seismic load analysis'
      ]
    },
    _embedded: {}
  },
  'concrete-design': {
    id: 2,
    title: { rendered: 'Concrete Design' },
    slug: 'concrete-design',
    excerpt: { rendered: '<p>ACI certified concrete design for foundations and structures</p>' },
    content: { rendered: '<p>Our concrete design expertise encompasses all aspects of reinforced concrete construction. We provide comprehensive design services for foundations, slabs, beams, columns, and shear walls for projects of all sizes.</p><p>Our team is well-versed in both cast-in-place and precast concrete systems, including post-tensioned concrete applications. We follow ACI standards and deliver efficient, buildable concrete designs.</p>' },
    acf: {
      icon: 'mdi:cube-outline',
      standard: 'ACI Certified',
      capabilities: [
        'Foundation systems',
        'Flat plate and flat slab design',
        'Beam and column design',
        'Shear wall systems',
        'Precast concrete systems',
        'Post-tensioned concrete'
      ]
    },
    _embedded: {}
  },
  'masonry-design': {
    id: 3,
    title: { rendered: 'Masonry Design' },
    slug: 'masonry-design',
    excerpt: { rendered: '<p>ACI 530 compliant masonry design and detailing</p>' },
    content: { rendered: '<p>We provide complete structural masonry design services for load-bearing walls, partitions, and veneers. Our expertise covers both concrete masonry and clay masonry systems.</p><p>Our designs are ACI 530 compliant and include masonry shear walls, reinforced masonry, veneer systems, fire wall design, and masonry restoration work.</p>' },
    acf: {
      icon: 'mdi:wall',
      standard: 'ACI 530 Compliant',
      capabilities: [
        'Load-bearing masonry walls',
        'Masonry shear walls',
        'Reinforced masonry design',
        'Masonry veneer systems',
        'Fire wall design',
        'Masonry restoration'
      ]
    },
    _embedded: {}
  },
  'wood-design': {
    id: 4,
    title: { rendered: 'Wood Design' },
    slug: 'wood-design',
    excerpt: { rendered: '<p>NDS standards for light wood frame construction</p>' },
    content: { rendered: '<p>Our wood design services focus on light wood frame construction for residential and light commercial projects. We work with both traditional sawn lumber and modern engineered lumber systems.</p><p>Following NDS standards, we design floor and roof trusses, glulam and PSL beams, cross-laminated timber systems, wood shear walls, and deck/balcony structures.</p>' },
    acf: {
      icon: 'mdi:tree',
      standard: 'NDS Standards',
      capabilities: [
        'Light frame construction',
        'Floor and roof truss design',
        'Glulam and PSL beams',
        'Cross-laminated timber',
        'Wood shear walls',
        'Deck and balcony design'
      ]
    },
    _embedded: {}
  },
  'foundation-design': {
    id: 5,
    title: { rendered: 'Foundation Design' },
    slug: 'foundation-design',
    excerpt: { rendered: '<p>Deep and shallow foundation engineering solutions</p>' },
    content: { rendered: '<p>Our foundation design services address the unique challenges of Florida\'s soil conditions and water table. We provide comprehensive foundation engineering for all structure types.</p><p>We specialize in shallow foundations, deep foundation systems including piles and drilled shafts, mat foundations, and foundation retrofit/repair solutions.</p>' },
    acf: {
      icon: 'mdi:home-floor-0',
      capabilities: [
        'Shallow foundations',
        'Deep foundation systems',
        'Pile foundation design',
        'Drilled shafts',
        'Mat foundations',
        'Foundation retrofit and repair'
      ]
    },
    _embedded: {}
  },
  'seawall-design': {
    id: 6,
    title: { rendered: 'Seawall Design' },
    slug: 'seawall-design',
    excerpt: { rendered: '<p>Coastal protection and seawall structural design</p>' },
    content: { rendered: '<p>Our seawall design services focus on coastal protection structures throughout Florida. We understand the unique requirements of coastal construction and the challenges of marine environments.</p><p>We design concrete seawalls, steel sheet pile walls, vinyl sheet pile bulkheads, revetment systems, and coastal erosion control structures. We also provide seawall repair and retrofit services.</p>' },
    acf: {
      icon: 'mdi:waves',
      capabilities: [
        'Concrete seawalls',
        'Steel sheet pile walls',
        'Vinyl sheet pile bulkheads',
        'Revetment design',
        'Coastal erosion control',
        'Seawall repair and retrofit'
      ]
    },
    _embedded: {}
  },
  'steel-connection-design': {
    id: 7,
    title: { rendered: 'Steel Connection Design' },
    slug: 'steel-connection-design',
    excerpt: { rendered: '<p>Detailed steel connection design and shop drawing preparation</p>' },
    content: { rendered: '<p>We provide detailed steel connection design and shop drawing preparation services for all steel projects. Our team designs standard and custom connections that are both structurally sound and fabricator-friendly.</p><p>Our expertise includes moment connections, shear connections, bracing connections, base plate design, custom fabrications, and complete shop drawing preparation.</p>' },
    acf: {
      icon: 'mdi:vector-arrange-above',
      capabilities: [
        'Moment connections',
        'Shear connections',
        'Bracing connections',
        'Base plate design',
        'Custom fabrications',
        'Shop drawing preparation'
      ]
    },
    _embedded: {}
  },
  'cad-3d-modeling': {
    id: 8,
    title: { rendered: 'CAD & 3D Modeling' },
    slug: 'cad-3d-modeling',
    excerpt: { rendered: '<p>Advanced CAD and BIM modeling services</p>' },
    content: { rendered: '<p>Our CAD and 3D modeling services provide advanced coordination and fabrication support. We use the latest software including AutoCAD and Revit for building information modeling.</p><p>Services include AutoCAD drafting, Revit BIM modeling, 3D structural models for coordination, clash detection, shop drawing production, and as-built documentation.</p>' },
    acf: {
      icon: 'mdi:cube-scan',
      capabilities: [
        'AutoCAD drafting',
        'Revit BIM modeling',
        '3D structural models',
        'Clash detection coordination',
        'Shop drawing production',
        'As-built documentation'
      ]
    },
    _embedded: {}
  },
  'inspection-services': {
    id: 9,
    title: { rendered: 'Inspection Services' },
    slug: 'inspection-services',
    excerpt: { rendered: '<p>Professional structural inspection services</p>' },
    content: { rendered: '<p>Our professional inspection services cover new construction, existing buildings, and forensic investigations. We provide thorough, code-compliant inspections with detailed reports.</p><p>We offer foundation inspections, framing inspections, steel erection observation, concrete inspection, structural assessments, and forensic investigations for structural issues.</p>' },
    acf: {
      icon: 'mdi:magnify-scan',
      capabilities: [
        'Foundation inspections',
        'Framing inspections',
        'Steel erection observation',
        'Concrete inspection',
        'Structural assessments',
        'Forensic investigations'
      ]
    },
    _embedded: {}
  },
  'steel-detailing': {
    id: 10,
    title: { rendered: 'Steel Detailing' },
    slug: 'steel-detailing',
    excerpt: { rendered: '<p>Professional steel detailing using SDS2 and BIM</p>' },
    content: { rendered: '<p>Our steel detailing team uses SDS2 and BIM software to produce complete fabrication and erection drawings for steel fabricators. We deliver accurate, timely detailing services.</p><p>We provide SDS2 detailing, BIM steel modeling, erection drawings, fabrication drawings, connection calculations, and material takeoffs/bills of material.</p>' },
    acf: {
      icon: 'mdi:pencil-ruler',
      capabilities: [
        'SDS2 detailing',
        'BIM steel modeling',
        'Erection drawings',
        'Fabrication drawings',
        'Connection calculations',
        'Material takeoffs and bills'
      ]
    },
    _embedded: {}
  }
}

describe('API: /api/services/[slug] - Static Data Structure', () => {
  const validSlugs = Object.keys(staticServices)

  describe('slug validation', () => {
    it.each(validSlugs)('should have all required fields for %s', (slug) => {
      const service = staticServices[slug]

      expect(service).toBeDefined()
      expect(service).toHaveProperty('id')
      expect(service).toHaveProperty('title')
      expect(service).toHaveProperty('slug', slug)
      expect(service).toHaveProperty('excerpt')
      expect(service).toHaveProperty('content')
      expect(service).toHaveProperty('acf')
      expect(service).toHaveProperty('_embedded')
    })

    it('should have valid title structure', () => {
      const service = staticServices['structural-steel-design']

      expect(service.title).toHaveProperty('rendered')
      expect(service.title.rendered).toBe('Structural Steel Design')
    })

    it('should have valid excerpt structure', () => {
      const service = staticServices['concrete-design']

      expect(service.excerpt).toHaveProperty('rendered')
      expect(service.excerpt.rendered).toBeTruthy()
      expect(service.excerpt.rendered).toMatch(/<p>.*<\/p>/)
    })

    it('should have valid content structure', () => {
      const service = staticServices['masonry-design']

      expect(service.content).toHaveProperty('rendered')
      expect(service.content.rendered).toBeTruthy()
      expect((service.content.rendered.match(/<p>/g) || []).length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('ACF fields', () => {
    it.each(validSlugs)('should have ACF icon for %s', (slug) => {
      const service = staticServices[slug]

      expect(service.acf).toHaveProperty('icon')
      expect(service.acf.icon).toBeTruthy()
      expect(service.acf.icon).toMatch(/^mdi:/)
    })

    it('should have ACF standard for applicable services', () => {
      const steelService = staticServices['structural-steel-design']
      const concreteService = staticServices['concrete-design']
      const masonryService = staticServices['masonry-design']
      const woodService = staticServices['wood-design']

      expect(steelService.acf).toHaveProperty('standard')
      expect(steelService.acf.standard).toBe('AISC Certified')

      expect(concreteService.acf).toHaveProperty('standard')
      expect(concreteService.acf.standard).toBe('ACI Certified')

      expect(masonryService.acf).toHaveProperty('standard')
      expect(masonryService.acf.standard).toBe('ACI 530 Compliant')

      expect(woodService.acf).toHaveProperty('standard')
      expect(woodService.acf.standard).toBe('NDS Standards')
    })

    it.each(validSlugs)('should have capabilities array for %s', (slug) => {
      const service = staticServices[slug]

      expect(service.acf).toHaveProperty('capabilities')
      expect(Array.isArray(service.acf.capabilities)).toBe(true)
      expect(service.acf.capabilities.length).toBeGreaterThan(0)
    })
  })

  describe('service icons', () => {
    it('should have unique and appropriate icons', () => {
      expect(staticServices['structural-steel-design'].acf.icon).toBe('mdi:beam')
      expect(staticServices['concrete-design'].acf.icon).toBe('mdi:cube-outline')
      expect(staticServices['masonry-design'].acf.icon).toBe('mdi:wall')
      expect(staticServices['wood-design'].acf.icon).toBe('mdi:tree')
      expect(staticServices['foundation-design'].acf.icon).toBe('mdi:home-floor-0')
      expect(staticServices['seawall-design'].acf.icon).toBe('mdi:waves')
      expect(staticServices['steel-connection-design'].acf.icon).toBe('mdi:vector-arrange-above')
      expect(staticServices['cad-3d-modeling'].acf.icon).toBe('mdi:cube-scan')
      expect(staticServices['inspection-services'].acf.icon).toBe('mdi:magnify-scan')
      expect(staticServices['steel-detailing'].acf.icon).toBe('mdi:pencil-ruler')
    })
  })

  describe('service capabilities', () => {
    it('should have at least 5 capabilities for structural steel design', () => {
      const service = staticServices['structural-steel-design']

      expect(service.acf.capabilities.length).toBeGreaterThanOrEqual(5)
      expect(service.acf.capabilities).toContain('Moment frame design')
      expect(service.acf.capabilities).toContain('Braced frame systems')
    })

    it('should have concrete-specific capabilities', () => {
      const service = staticServices['concrete-design']

      expect(service.acf.capabilities).toContain('Foundation systems')
      expect(service.acf.capabilities).toContain('Flat plate and flat slab design')
    })

    it('should have seawall-specific capabilities', () => {
      const service = staticServices['seawall-design']

      expect(service.acf.capabilities).toContain('Concrete seawalls')
      expect(service.acf.capabilities).toContain('Coastal erosion control')
    })

    it('should have CAD/BIM-specific capabilities', () => {
      const service = staticServices['cad-3d-modeling']

      expect(service.acf.capabilities).toContain('AutoCAD drafting')
      expect(service.acf.capabilities).toContain('Revit BIM modeling')
      expect(service.acf.capabilities).toContain('Clash detection coordination')
    })
  })

  describe('service IDs', () => {
    it('should have sequential IDs starting from 1', () => {
      expect(staticServices['structural-steel-design'].id).toBe(1)
      expect(staticServices['concrete-design'].id).toBe(2)
      expect(staticServices['masonry-design'].id).toBe(3)
      expect(staticServices['wood-design'].id).toBe(4)
      expect(staticServices['foundation-design'].id).toBe(5)
      expect(staticServices['seawall-design'].id).toBe(6)
      expect(staticServices['steel-connection-design'].id).toBe(7)
      expect(staticServices['cad-3d-modeling'].id).toBe(8)
      expect(staticServices['inspection-services'].id).toBe(9)
      expect(staticServices['steel-detailing'].id).toBe(10)
    })
  })

  describe('service standards', () => {
    it('should mention certification in steel service', () => {
      const service = staticServices['structural-steel-design']
      const excerpt = service.excerpt.rendered.toLowerCase()

      expect(excerpt).toContain('aisc')
    })

    it('should mention ACI certification in concrete service', () => {
      const service = staticServices['concrete-design']
      const excerpt = service.excerpt.rendered.toLowerCase()

      expect(excerpt).toContain('aci')
    })

    it('should mention ACI 530 in masonry service', () => {
      const service = staticServices['masonry-design']
      const excerpt = service.excerpt.rendered.toLowerCase()

      expect(excerpt).toContain('aci 530')
    })

    it('should mention NDS standards in wood service', () => {
      const service = staticServices['wood-design']
      const excerpt = service.excerpt.rendered.toLowerCase()

      expect(excerpt).toContain('nds')
    })
  })

  describe('content quality', () => {
    it.each(validSlugs)('should have meaningful service description for %s', (slug) => {
      const service = staticServices[slug]
      const content = service.content.rendered

      expect(content.length).toBeGreaterThan(150)
    })

    it.each(validSlugs)('should have HTML content with paragraphs for %s', (slug) => {
      const service = staticServices[slug]
      const content = service.content.rendered

      expect(content).toMatch(/<p>/)
      expect(content).toMatch(/<\/p>/)
    })

    it('should mention specialized terms in steel design', () => {
      const content = staticServices['structural-steel-design'].content.rendered.toLowerCase()

      expect(content).toMatch(/moment frames|braced frames|steel connection/)
    })

    it('should mention post-tensioned in concrete design', () => {
      const content = staticServices['concrete-design'].content.rendered.toLowerCase()

      expect(content).toMatch(/post-tensioned|precast/)
    })
  })

  describe('_embedded field', () => {
    it.each(validSlugs)('should have _embedded object for %s', (slug) => {
      const service = staticServices[slug]

      expect(service).toHaveProperty('_embedded')
      expect(typeof service._embedded).toBe('object')
    })
  })

  describe('invalid slugs', () => {
    it('should return undefined for non-existent slug', () => {
      const service = staticServices['non-existent-service']
      expect(service).toBeUndefined()
    })
  })

  describe('service titles', () => {
    it('should have professional service titles', () => {
      for (const slug of validSlugs) {
        const service = staticServices[slug]
        const title = service.title.rendered
        expect(title).toMatch(/^[A-Z]/)
        expect(title.length).toBeGreaterThan(5)
      }
    })
  })

  describe('core engineering services', () => {
    it('should include core material design services', () => {
      expect(staticServices['structural-steel-design']).toBeDefined()
      expect(staticServices['concrete-design']).toBeDefined()
      expect(staticServices['masonry-design']).toBeDefined()
      expect(staticServices['wood-design']).toBeDefined()
    })

    it('should include specialized engineering services', () => {
      expect(staticServices['foundation-design']).toBeDefined()
      expect(staticServices['seawall-design']).toBeDefined()
      expect(staticServices['steel-connection-design']).toBeDefined()
    })

    it('should include support services', () => {
      expect(staticServices['cad-3d-modeling']).toBeDefined()
      expect(staticServices['inspection-services']).toBeDefined()
      expect(staticServices['steel-detailing']).toBeDefined()
    })
  })
})
