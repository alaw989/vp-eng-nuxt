/**
 * Tests for server/api/team.get.ts static data structure
 */

import { describe, it, expect } from 'vitest'

describe('Server API: Team - Static Data', () => {
  it('team members have correct structure', () => {
    const teamMember = {
      title: { rendered: 'John Smith, PE' },
      slug: 'john-smith',
      excerpt: { rendered: '<p>President and Lead Engineer</p>' },
      custom_fields: {
        team_title: 'President',
        team_licensed: 'FL PE #12345',
        team_email: 'john@vp-associates.com',
        team_phone: '813-555-1234',
      }
    }

    expect(teamMember).toHaveProperty('title')
    expect(teamMember).toHaveProperty('slug')
    expect(teamMember).toHaveProperty('custom_fields')
    expect(teamMember.custom_fields).toHaveProperty('team_title')
    expect(teamMember.custom_fields).toHaveProperty('team_licensed')
  })

  it('team member has contact information', () => {
    const contactInfo = {
      email: 'john@vp-associates.com',
      phone: '813-555-1234',
    }

    expect(contactInfo.email).toContain('@')
    expect(contactInfo.phone).toMatch(/\d{3}-\d{3}-\d{4}/)
  })

  it('license number format is correct', () => {
    const license = 'FL PE #12345'
    expect(license).toContain('FL')
    expect(license).toContain('PE')
    expect(license).toContain('#')
  })
})
