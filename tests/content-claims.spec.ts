/**
 * Guards against unsupported public claims in site source.
 *
 * Every factual claim the site makes about VP & Associates must be traceable
 * in EVIDENCE.md. These patterns were found shipped without a source (or
 * contradicted by public records) and removed. To restore one, add its source
 * to EVIDENCE.md first, then narrow the pattern here.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = join(__dirname, '..')
const SCAN_DIRS = ['pages', 'components', 'layouts', 'server', 'composables', 'utils']
const SCAN_FILES = ['app.vue']

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      return name === '__tests__' ? [] : sourceFiles(path)
    }
    return /\.(vue|ts)$/.test(name) ? [path] : []
  })
}

const files = [
  ...SCAN_DIRS.flatMap(d => sourceFiles(join(ROOT, d))),
  ...SCAN_FILES.map(f => join(ROOT, f)),
]

const unsupported: Array<[string, RegExp]> = [
  // Incorporated 2007 (Sunbiz P07000056163); "30 years" is collective staff experience
  ['founding year', /since 1990/i],
  ['years in business', /years in business|years of excellence/i],
  // No source; LinkedIn lists 2-10 employees and public reviews average 3.9
  ['project count', /500\+/],
  ['headcount', /10\+\s*<\/div>|label="Team Members"|>\s*Team Members\s*</],
  ['satisfaction rate', /client satisfaction/i],
  ['code compliance rate', /100%[^<]*<\/div>\s*<div[^>]*>\s*Code Compliant/],
  ['employee ownership', /employee owned/i],
  ['insurance', /insured/i],
  // No record of these credentials; AISC/ACI certify fabricators and technicians, not design firms
  ['certifications', /ISO 9001|OSHA Certified|NCSEA|FES Member|AISC Certification|\b(AISC|ACI|Coastal) certified/i],
  // No evidence these organisations are clients
  ['client names', /Tampa General|Raymond James|Port Tampa Bay|Moffitt|TECO\b/],
  // Invented reviewers and job postings
  ['invented testimonials', /Michael Chen|Sarah Rodriguez|James Morrison|Jennifer Walsh|Robert Kim|Amanda Foster/],
  ['salaries', /\$\d{2},\d{3}/],
  ['benefits', /401\(k\)/],
  // Placeholder license number and social links presented as real
  ['license number', /PEC-\d+/],
  ['placeholder social links', /href="https:\/\/(www\.)?(linkedin|facebook)\.com\/?"/],
]

describe('content claims', () => {
  it.each(unsupported)('source makes no unsupported claim: %s', (_label, pattern) => {
    const hits = files
      .filter(file => pattern.test(readFileSync(file, 'utf8')))
      .map(file => relative(ROOT, file))
    expect(hits).toEqual([])
  })
})
