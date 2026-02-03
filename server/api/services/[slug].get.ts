/**
 * API Proxy for Single Service by Slug
 * GET /api/services/[slug]
 * Fetches a single service from WordPress REST API
 * Falls back to static data when WordPress API is unavailable
 */
const WP_API_URL = 'https://whataustinhasmade.com/vp-eng/wp-json/wp/v2'

// Static fallback data for services
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
      icon: 'mdi:home-foundation',
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

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    setResponseStatus(event, 400)
    return {
      success: false,
      error: 'Slug parameter is required',
    }
  }

  try {
    const response = await $fetch(`${WP_API_URL}/services?slug=${slug}&_embed=true`, {
      timeout: 10000,
    })

    // WordPress returns an array, extract first item
    const data = Array.isArray(response) ? response[0] : response

    if (!data) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: 'Service not found',
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error: any) {
    // WordPress API unavailable, fall back to static data
    console.warn(`WordPress API unavailable for service "${slug}", using static fallback:`, error.message)

    const staticService = staticServices[slug]

    if (!staticService) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: 'Service not found',
      }
    }

    return {
      success: true,
      data: staticService,
      _static: true, // Flag to indicate static data was used
    }
  }
})
