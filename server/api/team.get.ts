/**
 * API Proxy for WordPress Team Members
 * GET /api/team
 * Fetches team members from WordPress REST API with persistent disk cache fallback
 * Includes server-side memory caching for performance
 */
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

const WP_API_URL = 'https://www.vp-associates.com/wp-json/wp/v2'

// Memory cache for team members (1 hour - team changes infrequently)
const teamStorage = useStorage('team')
const MEMORY_CACHE_TTL = 60 * 60 * 1000 // 1 hour

// Persistent disk cache location
const CACHE_DIR = join(process.cwd(), '.cache')
const DISK_CACHE_FILE = join(CACHE_DIR, 'team.json')
const DISK_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days - stale after a week

interface TeamData {
  data: any[]
  timestamp: number
}

// Ensure cache directory exists
async function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    await mkdir(CACHE_DIR, { recursive: true })
  }
}

// Read from disk cache
async function readDiskCache(): Promise<TeamData | null> {
  try {
    if (!existsSync(DISK_CACHE_FILE)) {
      return null
    }
    const content = await readFile(DISK_CACHE_FILE, 'utf-8')
    const cached = JSON.parse(content) as TeamData

    // Check if cache is too old
    const age = Date.now() - cached.timestamp
    if (age > DISK_CACHE_MAX_AGE) {
      return null
    }

    return cached
  } catch {
    return null
  }
}

// Write to disk cache
async function writeDiskCache(data: any[]): Promise<void> {
  try {
    await ensureCacheDir()
    const cacheData: TeamData = {
      data,
      timestamp: Date.now(),
    }
    await writeFile(DISK_CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf-8')
  } catch {
    // Fail silently - disk cache is optional
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { per_page = 100, _embed = true, _nocache } = query

  // Check memory cache first (unless bypass requested)
  if (!_nocache) {
    const memCached = await teamStorage.getItem<TeamData>('team_data')
    if (memCached && Date.now() - memCached.timestamp < MEMORY_CACHE_TTL) {
      return {
        success: true,
        data: memCached.data,
        _cached: true,
        _source: 'memory',
      }
    }
  }

  try {
    const response = await $fetch(`${WP_API_URL}/team?per_page=${per_page}&_embed=${_embed}`, {
      timeout: 10000,
    })

    // If API returns empty array, return empty data
    if (!response || (Array.isArray(response) && response.length === 0)) {
      return {
        success: true,
        data: [],
        _empty: true,
      }
    }

    // Update both caches
    await teamStorage.setItem('team_data', {
      data: response,
      timestamp: Date.now(),
    })
    await writeDiskCache(response as any[])

    return {
      success: true,
      data: response,
    }
  } catch (error: any) {
    // On error, try disk cache as fallback
    const diskCache = await readDiskCache()

    if (diskCache) {
      // Update memory cache from disk
      await teamStorage.setItem('team_data', diskCache)

      const age = Date.now() - diskCache.timestamp
      const ageHours = Math.floor(age / (60 * 60 * 1000))

      return {
        success: true,
        data: diskCache.data,
        _cached: true,
        _source: 'disk',
        _stale: true,
        _age_hours: ageHours,
        _warning: 'Using cached data - WordPress API unavailable',
      }
    }

    // No cache available, return error
    throw createError({
      statusCode: 503,
      statusMessage: 'Unable to fetch team data. Please try again later.',
      data: {
        error: 'WordPress API unavailable and no cached data exists',
      },
    })
  }
})
