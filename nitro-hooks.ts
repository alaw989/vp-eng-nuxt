/*
 * Nitro hooks for HTML optimization
 * This runs during SSR to clean up the HTML
 *
 * NOTE: Full optimization (JS deferring, modulepreload handling, critical CSS) is done by
 * scripts/optimize-html.cjs after the build completes, when the actual JS file
 * hashes are known. This hook only handles basic cleanup.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, context) => {
    if (!html) return

    // Combine all parts
    const head = html.head || []
    const bodyPrepend = html.bodyPrepend || []
    const body = html.body || []
    const bodyAppend = html.bodyAppend || []

    let fullHtml = head.join('') + bodyPrepend.join('') + body.join('') + bodyAppend.join('')

    // Remove inline icon styles (reduces HTML size)
    fullHtml = fullHtml.replace(
      /<style>:where\(.i-mdi[^<]*<\/style>/g,
      ''
    )

    // Remove payload.json preload - it's tiny (69 bytes) and doesn't need preload
    fullHtml = fullHtml.replace(
      /<link rel="preload" as="fetch" crossorigin="anonymous" href="\/_payload\.json[^>]*>/gi,
      ''
    )

    // Add decoding="async" to all images for non-blocking decode
    fullHtml = fullHtml.replace(
      /<img([^>]*?)>/g,
      (match: string, attrs: string) => {
        if (!attrs.includes('decoding')) {
          return `<img${attrs} decoding="async">`
        }
        return match
      }
    )

    // Minify HTML by removing whitespace between tags (reduces transfer size)
    fullHtml = fullHtml.replace(/>\s+</g, '><')

    // Remove inline style="font-size:24px;" from iconify spans (handled by CSS)
    fullHtml = fullHtml.replace(
      /<span class="iconify[^>]*" style="font-size:24px;"([^>]*)>/g,
      (match: string, rest: string) => {
        return match.replace(' style="font-size:24px;"', '')
      }
    )

    // Defer all CSS files using media="print" hack for non-blocking render
    fullHtml = fullHtml.replace(
      /<link rel="stylesheet" href="\/_nuxt\/([^"]+)"([^>]*)>/g,
      (match: string, href: string, rest: string) => {
        // Remove crossorigin and add media="print" defer if not already present
        let cleanRest = rest.replace(/\s*crossorigin\s*=?\s*'(anonymous|use-credentials)'?\s*/gi, '')
                             .replace(/\s*crossorigin\s*=?\s*(anonymous|use-credentials)\s*/gi, '')
                             .replace(/\s*crossorigin\s*>/g, '>')
        if (!cleanRest.includes('media="print"')) {
          cleanRest = ` media="print" onload="this.media='all'"${cleanRest}`
        }
        cleanRest = cleanRest.trimLeft()
        return `<link rel="stylesheet" href="/_nuxt/${href}"${cleanRest}>`
      }
    )

    // Add minimal critical CSS - only essential to prevent FOUC for above-fold content
    // Optimized to <1KB to reduce HTML size - CSS loads fast anyway due to preload
    const criticalCSS = `<style>*{box-sizing:border-box;margin:0;padding:0}html{line-height:1.5;font-family:system-ui,-apple-system,sans-serif}body{min-height:100vh;display:flex;flex-direction:column}#main-content{flex:1 1 0%}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.container{width:100%;max-width:1280px;margin:0 auto;padding:0 1rem}.flex{display:flex}.items-center{align-items:center}.justify-center{justify-content:center}.text-center{text-align:center}.h-20{height:5rem}.sticky{position:sticky}.top-0{top:0}.z-50{z-index:50}.hidden{display:none}.bg-white{background-color:#fff}.text-white{color:#fff}.font-bold{font-weight:700}.font-semibold{font-weight:600}.rounded-lg{border-radius:.5rem}.transition-colors{transition:color .3s,background-color .3s}.relative{position:relative}.absolute{position:absolute}.inset-0{inset:0}.w-full{width:100%}.h-full{height:100%}.flex-col{flex-direction:column}.overflow-hidden{overflow:hidden}</style>`

    // Also add social domain DNS prefetch
    const socialPreconnects = '<link rel="dns-prefetch" href="https://linkedin.com"><link rel="dns-prefetch" href="https://facebook.com">'

    fullHtml = fullHtml.replace('<head>', `<head>${criticalCSS}${socialPreconnects}`)

    // Split back into components
    const headEnd = fullHtml.indexOf('</head>')
    const bodyStart = fullHtml.indexOf('<body>')
    const bodyEnd = fullHtml.lastIndexOf('</body>')

    if (headEnd > 0 && bodyStart > 0 && bodyEnd > 0) {
      html.head = [fullHtml.substring(0, headEnd)]
      html.bodyPrepend = []
      html.body = [fullHtml.substring(bodyStart + 6, bodyEnd)]
      html.bodyAppend = [fullHtml.substring(bodyEnd)]
    }
  })
})
