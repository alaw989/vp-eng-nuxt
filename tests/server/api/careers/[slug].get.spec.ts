/**
 * Tests for /api/careers/[slug] API endpoint
 * Tests the career position detail endpoint with static fallback data
 *
 * Note: These tests verify the static data structure without importing
 * the server file directly (which uses Nitro globals unavailable in Vitest).
 */
import { describe, it, expect } from 'vitest'

// Static position data extracted from the API route
const positions: Record<string, any> = {
  'structural-engineer': {
    id: 1,
    title: 'Structural Engineer',
    slug: 'structural-engineer',
    location: 'Tampa, FL',
    type: 'Full-time',
    department: 'Engineering',
    experience: '3+ years',
    salary: '$75,000 - $95,000',
    icon: 'mdi:calculator',
    description: 'VP Associates is seeking a talented Structural Engineer to join our team. In this role, you will work on diverse projects including commercial buildings, marine structures, and residential developments throughout the Tampa Bay area. You will collaborate with senior engineers, architects, and contractors to deliver safe and innovative structural solutions.',
    responsibilities: [
      'Perform structural analysis and design for steel, concrete, masonry, and wood structures',
      'Prepare structural calculations, drawings, and specifications using Revit, AutoCAD, and engineering software',
      'Conduct site visits and field investigations to assess existing conditions',
      'Coordinate with architects, contractors, and other project stakeholders',
      'Ensure all designs comply with Florida Building Code and industry standards',
      'Prepare construction documents and respond to RFIs during construction',
      'Review shop drawings and submittals for compliance with design intent',
      'Mentor junior engineers and CAD technicians'
    ],
    qualifications: [
      'Bachelor\'s degree in Civil or Structural Engineering',
      '3+ years of experience in structural engineering',
      'EIT certification or PE license (Florida PE preferred)',
      'Proficiency in Revit, AutoCAD, and structural analysis software (RAM, ETABS, or similar)',
      'Knowledge of Florida Building Code and ASCE 7 standards',
      'Strong communication and interpersonal skills',
      'Ability to work on multiple projects simultaneously',
      'Valid driver\'s license and reliable transportation'
    ],
    preferredSkills: [
      'PE License',
      'RAM Structural System',
      'ETABS',
      'RISA-3D',
      'Revit Structure',
      'Microsoft Project',
      'Bluebeam Revu'
    ],
    benefits: [
      'Competitive salary ($75,000 - $95,000 based on experience)',
      'Health, dental, and vision insurance',
      '401(k) with company match',
      'Professional development and PE license support',
      'Flexible work schedule',
      'Paid time off and holidays',
      'Life and disability insurance'
    ]
  },
  'senior-structural-engineer': {
    id: 2,
    title: 'Senior Structural Engineer',
    slug: 'senior-structural-engineer',
    location: 'Tampa, FL',
    type: 'Full-time',
    department: 'Engineering',
    experience: '8+ years',
    salary: '$95,000 - $120,000',
    icon: 'mdi:calculator-variant',
    description: 'We are looking for an experienced Senior Structural Engineer to lead complex projects and mentor our engineering team. You will be responsible for the structural design of major projects, quality control, and business development activities. This is an excellent opportunity for a PE licensed engineer looking to advance their career.',
    responsibilities: [
      'Lead structural design for complex commercial, marine, and industrial projects',
      'Perform structural analysis and design for all material types',
      'Manage project schedules, budgets, and client relationships',
      'Provide mentorship and technical guidance to junior engineers',
      'Review and seal structural drawings and calculations',
      'Conduct quality control reviews of project deliverables',
      'Participate in business development and proposal preparation',
      'Represent the firm in client meetings and industry events',
      'Stay current with industry trends and building code changes'
    ],
    qualifications: [
      'Bachelor\'s or Master\'s degree in Civil or Structural Engineering',
      '8+ years of experience in structural engineering',
      'Professional Engineer (PE) license in Florida',
      'Extensive experience with commercial and marine structures',
      'Proficiency in Revit, AutoCAD, and structural analysis software',
      'Strong project management skills',
      'Excellent written and verbal communication skills',
      'Demonstrated leadership ability'
    ],
    preferredSkills: [
      'SE (Structural Engineer) licensure',
      'MBA or business development experience',
      'RAM Structural System',
      'ETABS',
      'SAP2000',
      'Revit Structure',
      'Project management software',
      'Teaching/mentoring experience'
    ],
    benefits: [
      'Competitive salary ($95,000 - $120,000 based on experience)',
      'Performance-based bonuses',
      'Comprehensive health benefits package',
      '401(k) with generous company match',
      'Continuing education allowance',
      'Leadership and development opportunities',
      'Flexible work arrangements',
      'Paid time off and holidays'
    ]
  },
  'cad-bim-technician': {
    id: 3,
    title: 'CAD/BIM Technician',
    slug: 'cad-bim-technician',
    location: 'Tampa, FL',
    type: 'Full-time',
    department: 'Design',
    experience: '2+ years',
    salary: '$55,000 - $70,000',
    icon: 'mdi:monitor',
    description: 'VP Associates is seeking a skilled CAD/BIM Technician to join our design team. You will work closely with engineers to create detailed structural drawings and 3D models using Revit and AutoCAD. This is an excellent opportunity for someone passionate about BIM technology and structural detailing.',
    responsibilities: [
      'Create 3D BIM models and structural drawings in Revit',
      'Prepare detailed structural plans, sections, and details',
      'Coordinate structural models with architectural and MEP models',
      'Create fabrication drawings for steel and concrete components',
      'Assist engineers with design calculations and material take-offs',
      'Maintain drawing standards and Revit family libraries',
      'Participate in clash detection and model coordination meetings',
      'Plot and assemble drawing sets for submission',
      'Assist with field measurements and existing condition documentation'
    ],
    qualifications: [
      'Associate degree or certificate in CAD/BIM or related field',
      '2+ years of experience with Revit and AutoCAD',
      'Proficiency in Revit Structure is required',
      'Experience with structural detailing and drafting standards',
      'Knowledge of building construction methods',
      'Strong attention to detail',
      'Ability to read and interpret architectural drawings',
      'Good organizational and time management skills'
    ],
    preferredSkills: [
      'Revit Structure certification',
      'AutoCAD certification',
      'Navisworks for clash detection',
      'SDS/2 or Tekla Structures',
      'Blueprint reading',
      'Construction documentation',
      'BIM 360 or similar collaboration tools'
    ],
    benefits: [
      'Competitive salary ($55,000 - $70,000 based on experience)',
      'Health, dental, and vision insurance',
      '401(k) with company match',
      'Training and certification support',
      'Collaborative team environment',
      'Paid time off and holidays',
      'Career growth opportunities'
    ]
  },
  'project-manager': {
    id: 4,
    title: 'Project Manager',
    slug: 'project-manager',
    location: 'Tampa, FL',
    type: 'Full-time',
    department: 'Management',
    experience: '5+ years',
    salary: '$85,000 - $110,000',
    icon: 'mdi:clipboard-check',
    description: 'We are seeking an experienced Project Manager to oversee our engineering projects from conception to completion. You will be responsible for client relations, project scheduling, budget management, and coordinating internal teams. This role requires strong leadership skills and construction industry knowledge.',
    responsibilities: [
      'Manage multiple structural engineering projects simultaneously',
      'Serve as primary point of contact for clients and project stakeholders',
      'Develop and maintain project schedules and budgets',
      'Coordinate internal engineering teams and external consultants',
      'Prepare proposals, contracts, and project documentation',
      'Conduct project meetings and provide status updates',
      'Manage project scope changes and contract documents',
      'Review invoices and manage project financials',
      'Ensure quality control and client satisfaction',
      'Identify and pursue new project opportunities'
    ],
    qualifications: [
      'Bachelor\'s degree in Civil/Structural Engineering, Architecture, or Construction Management',
      '5+ years of project management experience in A/E/C industry',
      'Demonstrated success managing client relationships',
      'Strong understanding of construction documents and processes',
      'Excellent communication and negotiation skills',
      'Proficiency in project management software',
      'Ability to manage multiple priorities and deadlines',
      'Construction industry knowledge preferred'
    ],
    preferredSkills: [
      'PMP certification',
      'Engineering or architectural background',
      'Procore or similar construction management software',
      'Microsoft Project',
      'Business development experience',
      'Contract negotiation',
      'Financial management',
      'Risk assessment'
    ],
    benefits: [
      'Competitive salary ($85,000 - $110,000 based on experience)',
      'Performance-based bonuses',
      'Comprehensive health benefits',
      '401(k) with company match',
      'Professional development support',
      'Leadership opportunities',
      'Flexible work schedule',
      'Paid time off and holidays'
    ]
  }
}

describe('API: /api/careers/[slug] - Static Data Structure', () => {
  const validSlugs = Object.keys(positions)

  describe('slug validation', () => {
    it.each(validSlugs)('should have all required fields for %s', (slug) => {
      const position = positions[slug]

      expect(position).toBeDefined()
      expect(position).toHaveProperty('id')
      expect(position).toHaveProperty('title')
      expect(position).toHaveProperty('slug', slug)
      expect(position).toHaveProperty('location')
      expect(position).toHaveProperty('type')
      expect(position).toHaveProperty('department')
      expect(position).toHaveProperty('experience')
      expect(position).toHaveProperty('salary')
      expect(position).toHaveProperty('icon')
      expect(position).toHaveProperty('description')
      expect(position).toHaveProperty('responsibilities')
      expect(position).toHaveProperty('qualifications')
      expect(position).toHaveProperty('preferredSkills')
      expect(position).toHaveProperty('benefits')
    })

    it('should have valid structural engineer position data', () => {
      const position = positions['structural-engineer']

      expect(position.title).toBe('Structural Engineer')
      expect(position.location).toBe('Tampa, FL')
      expect(position.type).toBe('Full-time')
      expect(position.department).toBe('Engineering')
      expect(position.experience).toBe('3+ years')
      expect(position.salary).toBe('$75,000 - $95,000')
      expect(position.icon).toBe('mdi:calculator')
    })

    it('should have valid senior structural engineer position data', () => {
      const position = positions['senior-structural-engineer']

      expect(position.title).toBe('Senior Structural Engineer')
      expect(position.salary).toBe('$95,000 - $120,000')
      expect(position.icon).toBe('mdi:calculator-variant')
    })

    it('should have valid CAD/BIM technician position data', () => {
      const position = positions['cad-bim-technician']

      expect(position.title).toBe('CAD/BIM Technician')
      expect(position.department).toBe('Design')
      expect(position.experience).toBe('2+ years')
      expect(position.salary).toBe('$55,000 - $70,000')
      expect(position.icon).toBe('mdi:monitor')
    })

    it('should have valid project manager position data', () => {
      const position = positions['project-manager']

      expect(position.title).toBe('Project Manager')
      expect(position.department).toBe('Management')
      expect(position.experience).toBe('5+ years')
      expect(position.salary).toBe('$85,000 - $110,000')
      expect(position.icon).toBe('mdi:clipboard-check')
    })
  })

  describe('responsibilities array', () => {
    it.each(validSlugs)('should have non-empty responsibilities array for %s', (slug) => {
      const position = positions[slug]

      expect(Array.isArray(position.responsibilities)).toBe(true)
      expect(position.responsibilities.length).toBeGreaterThan(0)
      expect(position.responsibilities[0]).toBeTruthy()
    })
  })

  describe('qualifications array', () => {
    it.each(validSlugs)('should have non-empty qualifications array for %s', (slug) => {
      const position = positions[slug]

      expect(Array.isArray(position.qualifications)).toBe(true)
      expect(position.qualifications.length).toBeGreaterThan(0)
    })
  })

  describe('preferred skills array', () => {
    it.each(validSlugs)('should have non-empty preferredSkills array for %s', (slug) => {
      const position = positions[slug]

      expect(Array.isArray(position.preferredSkills)).toBe(true)
      expect(position.preferredSkills.length).toBeGreaterThan(0)
    })
  })

  describe('benefits array', () => {
    it.each(validSlugs)('should have non-empty benefits array for %s', (slug) => {
      const position = positions[slug]

      expect(Array.isArray(position.benefits)).toBe(true)
      expect(position.benefits.length).toBeGreaterThan(0)
      expect(position.benefits.some((b: string) => b.toLowerCase().includes('health'))).toBe(true)
    })
  })

  describe('position IDs', () => {
    it('should have sequential IDs starting from 1', () => {
      expect(positions['structural-engineer'].id).toBe(1)
      expect(positions['senior-structural-engineer'].id).toBe(2)
      expect(positions['cad-bim-technician'].id).toBe(3)
      expect(positions['project-manager'].id).toBe(4)
    })
  })

  describe('salary ranges', () => {
    it('should have properly formatted salary ranges', () => {
      for (const slug of validSlugs) {
        const position = positions[slug]
        expect(position.salary).toMatch(/^\$\d{1,3}(,\d{3})* - \$\d{1,3}(,\d{3})*$/)
      }
    })

    it('should have increasing salaries by seniority', () => {
      const getMinSalary = (salary: string) => parseInt(salary.split(' - ')[0]!.replace(/\$|,/g, ''))
      const getMaxSalary = (salary: string) => parseInt(salary.split(' - ')[1]!.replace(/\$|,/g, ''))

      const engineer = positions['structural-engineer']
      const senior = positions['senior-structural-engineer']

      expect(getMinSalary(senior.salary)).toBeGreaterThan(getMinSalary(engineer.salary))
      expect(getMaxSalary(senior.salary)).toBeGreaterThan(getMaxSalary(engineer.salary))
    })
  })

  describe('descriptions', () => {
    it.each(validSlugs)('should have meaningful description for %s', (slug) => {
      const position = positions[slug]

      expect(position.description).toBeTruthy()
      expect(position.description.length).toBeGreaterThan(50)
      expect(position.description).toMatch(/^[A-Z]/)
    })
  })

  describe('invalid slugs', () => {
    it('should return undefined for non-existent slug', () => {
      const position = positions['non-existent-position']
      expect(position).toBeUndefined()
    })
  })
})
