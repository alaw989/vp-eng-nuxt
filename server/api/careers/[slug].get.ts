// Position data with detailed information
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

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug parameter is required',
    })
  }

  const position = positions[slug]

  if (!position) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Position not found',
    })
  }

  return position
})
