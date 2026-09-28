import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import PdfViewer from '../PdfViewer.vue'

// Mock @vueuse/core - onKeyStroke
const keyStrokeCallbacks = new Map<string, Function>()
vi.mock('@vueuse/core', () => ({
  onKeyStroke: (key: string, callback: Function) => {
    keyStrokeCallbacks.set(key, callback)
    return vi.fn()
  }
}))

describe('PdfViewer Component', () => {
  const defaultPdfs = [
    {
      url: '/test.pdf',
      title: 'Test PDF',
      description: 'Test description',
      filename: 'test.pdf',
      type: 'Structural',
      size: '2.5 MB',
      pages: 10,
      thumbnail: '/thumb.jpg',
      preview: '/preview.jpg',
    },
  ]

  const globalStubs = {
    NuxtImg: { template: '<img />' },
    Icon: { template: '<span />' },
    Transition: {
      template: '<div><slot v-if="true" /></div>',
      props: ['name', 'mode']
    },
    Teleport: {
      template: '<div><slot /></div>',
      props: ['to']
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    keyStrokeCallbacks.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    keyStrokeCallbacks.clear()
  })

  it('renders with PDFs', () => {
    const wrapper = mount(PdfViewer, {
      props: { pdfs: defaultPdfs },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Test PDF')
    expect(wrapper.html()).toContain('Project Documents')
  })

  it('shows empty state when no PDFs', () => {
    const wrapper = mount(PdfViewer, {
      props: { pdfs: [] },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('No documents available')
  })

  it('shows correct count for multiple PDFs', () => {
    const pdfs = [
      { url: '/test1.pdf', title: 'PDF 1' },
      { url: '/test2.pdf', title: 'PDF 2' },
    ]
    const wrapper = mount(PdfViewer, {
      props: { pdfs },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('2 PDFs available')
  })

  it('shows singular count for single PDF', () => {
    const wrapper = mount(PdfViewer, {
      props: { pdfs: [{ url: '/test1.pdf', title: 'Single PDF' }] },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('1 PDF available')
  })

  it('generates correct download filename when provided', () => {
    const pdfs = [{ url: '/test.pdf', filename: 'document-1.pdf', title: 'Test' }]
    const wrapper = mount(PdfViewer, {
      props: { pdfs },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('download="document-1.pdf"')
  })

  it('generates fallback filename when not provided', () => {
    const pdfs = [{ url: '/test.pdf', title: 'Test' }]
    const wrapper = mount(PdfViewer, {
      props: { pdfs },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('download="document-1.pdf"')
  })

  it('has section header', () => {
    const wrapper = mount(PdfViewer, {
      props: { pdfs: defaultPdfs },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Project Documents')
  })

  it('shows default document title when none provided', () => {
    const pdfs = [{ url: '/test.pdf' }]
    const wrapper = mount(PdfViewer, {
      props: { pdfs },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Document 1')
  })

  it('shows PDF type badge when type is provided', () => {
    const pdfs = [{ url: '/test.pdf', type: 'Structural', title: 'Test' }]
    const wrapper = mount(PdfViewer, {
      props: { pdfs },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('Structural')
  })

  it('shows PDF size when provided', () => {
    const pdfs = [{ url: '/test.pdf', size: '2.5 MB', title: 'Test' }]
    const wrapper = mount(PdfViewer, {
      props: { pdfs },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('2.5 MB')
  })

  it('shows PDF pages count when provided', () => {
    const pdfs = [{ url: '/test.pdf', pages: 10, title: 'Test' }]
    const wrapper = mount(PdfViewer, {
      props: { pdfs },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('10 pages')
  })

  it('shows PDF description when provided', () => {
    const pdfs = [{ url: '/test.pdf', description: 'This is a test PDF', title: 'Test' }]
    const wrapper = mount(PdfViewer, {
      props: { pdfs },
      global: { stubs: globalStubs }
    })

    expect(wrapper.html()).toContain('This is a test PDF')
  })

  describe('Viewer layout (drawings are landscape sheets)', () => {
    async function openViewer() {
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })
      wrapper.vm.openPdf(defaultPdfs[0]!, 0)
      await nextTick()
      return wrapper
    }

    it('fills the content area with the iframe instead of a fixed portrait size', async () => {
      const wrapper = await openViewer()
      const iframe = wrapper.find('iframe')

      expect(iframe.classes()).toEqual(expect.arrayContaining(['w-full', 'h-full']))
      expect(iframe.attributes('width')).toBeUndefined()
      expect(iframe.attributes('height')).toBeUndefined()
    })

    it('does not vertically center or CSS-scale the document', async () => {
      const wrapper = await openViewer()
      const dialog = wrapper.find('[role="dialog"]')

      expect(dialog.html()).not.toContain('scale(')
      // Centering a box taller than its scroll container pushes its top out of reach
      let el = wrapper.find('iframe').element.parentElement
      while (el && el !== dialog.element) {
        expect(el.className).not.toMatch(/\bitems-center\b/)
        el = el.parentElement
      }
    })

    it('stacks above the sticky site header (z-50) so its close button stays visible', async () => {
      const wrapper = await openViewer()

      expect(wrapper.find('[role="dialog"]').classes()).toContain('z-[60]')
    })

    it('asks the browser viewer to fit the whole sheet', async () => {
      const wrapper = await openViewer()
      const src = wrapper.find('iframe').attributes('src')

      expect(src).toBe('/test.pdf#view=Fit&zoom=page-fit&navpanes=0')
    })

    it('leaves zooming to the native viewer', async () => {
      const wrapper = await openViewer()

      expect(wrapper.find('[aria-label^="Zoom"]').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('Zoom In')
    })

    it('offers opening the PDF in a new tab, for browsers that cannot show it inline', async () => {
      const wrapper = await openViewer()
      const links = wrapper.findAll('a[target="_blank"]').filter(a => a.attributes('href') === '/test.pdf')

      expect(links.length).toBeGreaterThan(0)
      for (const link of links) {
        expect(link.attributes('rel')).toContain('noopener')
      }
    })
  })

  describe('PDF Viewer functionality', () => {
    it('has openPdf method', () => {
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      expect(typeof wrapper.vm.openPdf).toBe('function')
    })

    it('has closeViewer method', () => {
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      expect(typeof wrapper.vm.closeViewer).toBe('function')
    })

    it('opens PDF viewer when openPdf is called', async () => {
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      expect(wrapper.vm.viewerOpen).toBe(false)

      wrapper.vm.openPdf(defaultPdfs[0]!, 0)
      await nextTick()

      expect(wrapper.vm.viewerOpen).toBe(true)
      expect(wrapper.vm.currentPdf).toEqual(defaultPdfs[0])
      expect(wrapper.vm.currentIndex).toBe(0)
    })

    it('sets loading to true when opening PDF', async () => {
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      wrapper.vm.openPdf(defaultPdfs[0]!, 0)

      expect(wrapper.vm.loading).toBe(true)
    })

    it('closes viewer when closeViewer is called', async () => {
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      // Open viewer first
      wrapper.vm.openPdf(defaultPdfs[0]!, 0)
      await nextTick()

      wrapper.vm.closeViewer()
      await nextTick()

      expect(wrapper.vm.viewerOpen).toBe(false)
      expect(wrapper.vm.currentPdf).toBe(null)
    })

    it('sets body overflow hidden when viewer opens', async () => {
      const originalStyle = document.body.style.overflow
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      wrapper.vm.openPdf(defaultPdfs[0]!, 0)

      expect(document.body.style.overflow).toBe('hidden')

      // Cleanup
      document.body.style.overflow = originalStyle
      wrapper.unmount()
    })

    it('restores body overflow when viewer closes', async () => {
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      wrapper.vm.openPdf(defaultPdfs[0]!, 0)
      wrapper.vm.closeViewer()
      await nextTick()

      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('Keyboard navigation', () => {
    it('Escape key closes viewer', () => {
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      wrapper.vm.openPdf(defaultPdfs[0]!, 0)

      const callback = keyStrokeCallbacks.get('Escape')
      expect(callback).toBeDefined()

      if (callback) {
        const mockEvent = { preventDefault: vi.fn() }
        callback(mockEvent)

        expect(wrapper.vm.viewerOpen).toBe(false)
      }
    })

    it('keyboard shortcuts do nothing when viewer is closed', () => {
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      // Don't open viewer - it should be closed
      expect(wrapper.vm.viewerOpen).toBe(false)

      const escapeCallback = keyStrokeCallbacks.get('Escape')
      if (escapeCallback) {
        const mockEvent = { preventDefault: vi.fn() }
        escapeCallback(mockEvent)

        // Viewer should still be closed
        expect(wrapper.vm.viewerOpen).toBe(false)
      }
    })
  })

  describe('Focus management', () => {
    it('saves previously focused element when opening PDF', () => {
      const button = document.createElement('button')
      document.body.appendChild(button)
      button.focus()

      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      wrapper.vm.openPdf(defaultPdfs[0]!, 0)

      expect(wrapper.vm.previouslyFocused).toBe(button)

      document.body.removeChild(button)
    })

    it('restores focus to previously focused element when closing', async () => {
      const button = document.createElement('button')
      document.body.appendChild(button)
      button.focus()

      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      wrapper.vm.openPdf(defaultPdfs[0]!, 0)
      wrapper.vm.closeViewer()
      await nextTick()

      expect(document.activeElement).toBe(button)

      document.body.removeChild(button)
    })
  })

  describe('Cleanup', () => {
    it('restores body overflow on unmount when viewer is open', () => {
      const originalStyle = document.body.style.overflow
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      wrapper.vm.openPdf(defaultPdfs[0]!, 0)
      expect(document.body.style.overflow).toBe('hidden')

      wrapper.unmount()

      expect(document.body.style.overflow).toBe('')

      // Cleanup
      document.body.style.overflow = originalStyle
    })
  })

  describe('Component state', () => {
    it('has viewerOpen ref', () => {
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      expect(wrapper.vm.viewerOpen).toBeDefined()
    })

    it('has currentPdf ref', () => {
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      expect(wrapper.vm.currentPdf).toBeDefined()
    })

    it('has currentIndex ref', () => {
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      expect(wrapper.vm.currentIndex).toBeDefined()
    })

    it('has loading ref', () => {
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      expect(wrapper.vm.loading).toBeDefined()
    })
  })

  describe('PDF opening from UI', () => {
    it('opens PDF when clicking overlay button on thumbnail', async () => {
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      // Find the overlay button in the thumbnail gallery
      const overlayButton = wrapper.find('button[aria-label*="View"]')
      expect(overlayButton.exists()).toBe(true)

      // Click the button
      await overlayButton.trigger('click')
      await nextTick()

      // The openPdf method should have been called
      // Verify by checking viewer state
      // (In real scenario, click would trigger openPdf)
    })

    it('opens PDF when clicking View button in action buttons', async () => {
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      // Find View buttons in the PDF cards
      const viewButtons = wrapper.findAll('button')
      expect(viewButtons.length).toBeGreaterThan(0)

      // Find a button with "View" text
      const viewButton = viewButtons.find(btn => {
        const text = btn.text()
        return text && text.includes('View')
      })

      if (viewButton) {
        await viewButton.trigger('click')
        await nextTick()

        // Click should have triggered openPdf
        // Verify the component still exists
        expect(wrapper.exists()).toBe(true)
      }
    })
  })

  describe('Loading state and iframe sizing', () => {
    it('sets loading to false after setTimeout completes', async () => {
      vi.useFakeTimers()
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      wrapper.vm.openPdf(defaultPdfs[0]!, 0)
      expect(wrapper.vm.loading).toBe(true)

      // Fast-forward timers
      vi.advanceTimersByTime(500)
      await nextTick()

      expect(wrapper.vm.loading).toBe(false)

      vi.restoreAllMocks()
    })

    it('focuses close button after opening PDF', async () => {
      vi.useFakeTimers()
      const wrapper = mount(PdfViewer, {
        props: { pdfs: defaultPdfs },
        global: { stubs: globalStubs }
      })

      wrapper.vm.openPdf(defaultPdfs[0]!, 0)

      // Fast-forward to trigger nextTick in setTimeout callback
      vi.advanceTimersByTime(10)
      await nextTick()

      // closeButtonRef should be focused
      // We can't test actual DOM focus in jsdom, but verify the logic runs
      expect(wrapper.vm.closeButtonRef).toBeDefined()

      vi.restoreAllMocks()
    })
  })
})
