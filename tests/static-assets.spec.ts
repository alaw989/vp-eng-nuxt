/**
 * Every /images/... path hardcoded in the source must exist in public/.
 * A missing file fails `nuxt generate` (IPX 404) or ships a broken image.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = join(__dirname, '..')
const SCAN_DIRS = ['pages', 'components', 'layouts', 'composables', 'utils', 'server']

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path)
    return /\.(vue|ts)$/.test(name) ? [path] : []
  })
}

const IMAGE_PATH = /(?<![\w$}])\/images\/[\w\-./]+\.(?:jpe?g|png|webp|avif|svg|gif)/g

const references = SCAN_DIRS.flatMap(d => sourceFiles(join(ROOT, d))).flatMap((file) => {
  const text = readFileSync(file, 'utf8')
  return [...new Set(text.match(IMAGE_PATH) || [])].map(path => ({ file: relative(ROOT, file), path }))
})

describe('static image references', () => {
  it('finds image references to check', () => {
    expect(references.length).toBeGreaterThan(10)
  })

  it('every referenced /images/ file exists in public/', () => {
    const missing = references
      .filter(({ path }) => !existsSync(join(ROOT, 'public', path)))
      .map(({ file, path }) => `${file}: ${path}`)
    expect(missing).toEqual([])
  })
})
