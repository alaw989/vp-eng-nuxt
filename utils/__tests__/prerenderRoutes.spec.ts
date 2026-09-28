import { describe, it, expect, vi } from 'vitest'
import { wordpressRoutes } from '../prerenderRoutes'

const WP = 'https://cms.example.com/wp-json/wp/v2'

function page(slugs: string[], totalPages = 1) {
  return new Response(JSON.stringify(slugs.map(slug => ({ slug }))), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'X-WP-TotalPages': String(totalPages) },
  })
}

function fetchFor(responses: Record<string, Response>) {
  return vi.fn(async (url: string) => {
    const key = Object.keys(responses).find(k => url.includes(k))
    if (!key) throw new Error(`unexpected fetch ${url}`)
    return responses[key]!
  })
}

describe('wordpressRoutes', () => {
  it('returns a route for every project and service', async () => {
    const fetchImpl = fetchFor({
      '/projects?': page(['parker-bridge-e1-309', 'i-95']),
      '/services?': page(['steel-detailing']),
    })

    const routes = await wordpressRoutes(WP, fetchImpl)

    expect(routes).toEqual([
      '/projects/parker-bridge-e1-309',
      '/projects/i-95',
      '/services/steel-detailing',
    ])
    expect(fetchImpl).toHaveBeenCalledWith(`${WP}/projects?per_page=100&page=1&_fields=slug`)
  })

  it('follows pagination past 100 items', async () => {
    const fetchImpl = fetchFor({
      '/projects?per_page=100&page=1': page(['a'], 2),
      '/projects?per_page=100&page=2': page(['b'], 2),
      '/services?': page([]),
    })

    expect(await wordpressRoutes(WP, fetchImpl)).toEqual(['/projects/a', '/projects/b'])
  })

  it('encodes slugs so unusual characters cannot break the route', async () => {
    const fetchImpl = fetchFor({ '/projects?': page(['café-deck']), '/services?': page([]) })

    expect(await wordpressRoutes(WP, fetchImpl)).toEqual(['/projects/caf%C3%A9-deck'])
  })

  it('throws when WordPress responds with an error status', async () => {
    const fetchImpl = fetchFor({
      '/projects?': new Response('Bad Gateway', { status: 502 }),
      '/services?': page([]),
    })

    await expect(wordpressRoutes(WP, fetchImpl)).rejects.toThrow(/projects.*502/)
  })

  it('throws when the response is not a JSON list (e.g. an HTML page)', async () => {
    const fetchImpl = fetchFor({
      '/projects?': new Response('<html>not the API</html>', { status: 200 }),
      '/services?': page([]),
    })

    await expect(wordpressRoutes(WP, fetchImpl)).rejects.toThrow(/projects/)
  })

  it('throws when the network request itself fails', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('fetch failed'))

    await expect(wordpressRoutes(WP, fetchImpl)).rejects.toThrow(/fetch failed/)
  })
})
