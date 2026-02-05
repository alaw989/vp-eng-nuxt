#!/usr/bin/env tsx
/**
 * Page Enumeration Script
 *
 * Discovers all pages from vp-associates.com WordPress installation
 * and saves them to pages.json for baseline capture.
 *
 * Sources:
 * - Sitemap XML: https://www.vp-associates.com/wp-sitemap.xml
 * - REST API: https://www.vp-associates.com/wp-json/wp/v2/
 */

import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import { URL } from 'url';

// ============================================================
// Type Definitions
// ============================================================

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

interface WpPage {
  id: number;
  link: string;
  slug: string;
  title: { rendered: string };
  date: string;
  modified: string;
  status: string;
}

interface PageEntry {
  url: string;
  slug: string;
  title?: string;
  type: 'page' | 'service' | 'project' | 'post' | 'taxonomy' | 'archive' | 'home';
  lastmod?: string;
  source: 'sitemap' | 'api';
}

interface NormalizedUrl {
  slug: string;
  type: PageEntry['type'];
}

// ============================================================
// Constants
// ============================================================

const BASE_URL = 'https://www.vp-associates.com';
const SITEMAP_URL = `${BASE_URL}/wp-sitemap.xml`;
const API_BASE = `${BASE_URL}/wp-json/wp/v2`;
const OUTPUT_FILE = '.planning/audit/pages.json';

// ============================================================
// URL Normalization
// ============================================================

/**
 * Normalizes a URL to extract slug and determine page type.
 */
function normalizeUrl(url: string): NormalizedUrl {
  const parsedUrl = new URL(url);
  const pathname = parsedUrl.pathname;

  // Root path
  if (pathname === '/' || pathname === '') {
    return { slug: 'home', type: 'home' };
  }

  const segments = pathname.split('/').filter(Boolean);

  // Single path segment (e.g., /about, /contact)
  if (segments.length === 1) {
    return { slug: segments[0], type: 'page' };
  }

  // Two path segments (e.g., /services/consulting, /projects/project-name)
  if (segments.length === 2) {
    const firstSegment = segments[0];
    // Singularize common plural segments
    const typeMap: Record<string, PageEntry['type']> = {
      services: 'service',
      projects: 'project',
      posts: 'post',
      categories: 'taxonomy',
      tags: 'taxonomy',
    };
    return {
      slug: segments[1],
      type: typeMap[firstSegment] || 'page',
    };
  }

  // Three or more segments - treat as archive or nested page
  if (segments.length >= 3) {
    const firstSegment = segments[0];
    const typeMap: Record<string, PageEntry['type']> = {
      category: 'taxonomy',
      tag: 'taxonomy',
      categories: 'taxonomy',
      tags: 'taxonomy',
      services: 'service',
      projects: 'project',
    };
    return {
      slug: segments[segments.length - 1], // Use last segment as slug
      type: typeMap[firstSegment] || 'archive',
    };
  }

  return { slug: segments.join('-'), type: 'page' };
}

// ============================================================
// Sitemap Fetching
// ============================================================

/**
 * Fetches and parses a sitemap URL.
 * Handles both sitemap indexes and regular sitemaps.
 */
async function fetchSitemapUrls(sitemapUrl: string): Promise<SitemapUrl[]> {
  console.log(`Fetching sitemap: ${sitemapUrl}`);

  const response = await fetch(sitemapUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const $ = cheerio.load(xml, { xmlMode: true });

  // Check if this is a sitemap index (contains <sitemap> elements)
  const sitemapElements = $('sitemap');
  if (sitemapElements.length > 0) {
    console.log(`Found sitemap index with ${sitemapElements.length} sub-sitemaps`);
    const subSitemaps: string[] = [];
    sitemapElements.each((_, el) => {
      const loc = $(el).find('loc').text();
      if (loc) subSitemaps.push(loc);
    });

    // Recursively fetch all sub-sitemaps
    const allUrls: SitemapUrl[] = [];
    for (const subSitemap of subSitemaps) {
      const urls = await fetchSitemapUrls(subSitemap);
      allUrls.push(...urls);
    }
    return allUrls;
  }

  // Regular sitemap - extract <url> elements
  const urls: SitemapUrl[] = [];
  $('url').each((_, el) => {
    const loc = $(el).find('loc').text().trim();
    const lastmod = $(el).find('lastmod').text().trim() || undefined;
    const changefreq = $(el).find('changefreq').text().trim() || undefined;
    const priorityStr = $(el).find('priority').text().trim();
    const priority = priorityStr ? parseFloat(priorityStr) : undefined;

    if (loc) {
      urls.push({ loc, lastmod, changefreq, priority });
    }
  });

  console.log(`Found ${urls.length} URLs in sitemap`);
  return urls;
}

// ============================================================
// WordPress API Fetching
// ============================================================

/**
 * Fetches pages from WordPress REST API for metadata enrichment.
 */
async function fetchWpPages(): Promise<WpPage[]> {
  const allPages: WpPage[] = [];

  // Define endpoints to fetch from
  const endpoints = [
    'pages',
    'services', // Custom post type
    'projects', // Custom post type
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Fetching API endpoint: ${endpoint}`);
      const url = `${API_BASE}/${endpoint}?per_page=100&_fields=link,slug,title,date,modified,status`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Failed to fetch ${endpoint}: ${response.status}`);
        continue;
      }

      const pages: WpPage[] = await response.json();
      console.log(`Found ${pages.length} items in ${endpoint}`);
      allPages.push(...pages);
    } catch (error) {
      console.warn(`Error fetching ${endpoint}:`, error);
    }
  }

  return allPages;
}

// ============================================================
// Data Merging
// ============================================================

/**
 * Merges sitemap data with WordPress API metadata.
 */
function mergeWithApiData(
  sitemapPages: PageEntry[],
  apiPages: WpPage[]
): PageEntry[] {
  // Create a Map for O(1) lookup by URL
  const apiMap = new Map<string, WpPage>();

  for (const page of apiPages) {
    // Normalize the API link (remove trailing slash for consistency)
    const normalizedLink = page.link.replace(/\/$/, '');
    apiMap.set(normalizedLink, page);
  }

  // Enrich sitemap pages with API data
  return sitemapPages.map((page) => {
    const normalizedUrl = page.url.replace(/\/$/, '');
    const apiPage = apiMap.get(normalizedUrl);

    if (apiPage) {
      return {
        ...page,
        title: apiPage.title.rendered,
        source: 'api' as const,
      };
    }

    return page;
  });
}

// ============================================================
// Main Execution
// ============================================================

async function main(): Promise<void> {
  try {
    console.log('='.repeat(60));
    console.log('Page Enumeration Script');
    console.log('='.repeat(60));
    console.log(`Source: ${BASE_URL}`);
    console.log('');

    // Step 1: Fetch sitemap URLs
    console.log('Step 1: Enumerating pages from sitemap...');
    const sitemapUrls = await fetchSitemapUrls(SITEMAP_URL);
    console.log(`Total URLs found in sitemap: ${sitemapUrls.length}`);
    console.log('');

    // Step 2: Normalize URLs to extract slugs and types
    console.log('Step 2: Normalizing URLs...');
    const normalizedPages: PageEntry[] = sitemapUrls.map((sitemapUrl) => {
      const { slug, type } = normalizeUrl(sitemapUrl.loc);
      return {
        url: sitemapUrl.loc,
        slug,
        type,
        lastmod: sitemapUrl.lastmod,
        source: 'sitemap',
      };
    });

    // Count by type
    const typeCounts: Record<string, number> = {};
    for (const page of normalizedPages) {
      typeCounts[page.type] = (typeCounts[page.type] || 0) + 1;
    }
    console.log('Pages by type (from sitemap):');
    for (const [type, count] of Object.entries(typeCounts).sort(
      ([, a], [, b]) => b - a
    )) {
      console.log(`  ${type}: ${count}`);
    }
    console.log('');

    // Step 3: Fetch API pages for metadata enrichment
    console.log('Step 3: Fetching metadata from WordPress API...');
    const apiPages = await fetchWpPages();
    console.log(`Total API pages fetched: ${apiPages.length}`);
    console.log('');

    // Step 4: Merge sitemap data with API metadata
    console.log('Step 4: Merging sitemap data with API metadata...');
    const mergedPages = mergeWithApiData(normalizedPages, apiPages);

    // Count how many got titles from API
    const withTitles = mergedPages.filter((p) => p.title).length;
    console.log(`Pages enriched with titles: ${withTitles}`);
    console.log('');

    // Step 5: Write output file
    console.log('Step 5: Writing output file...');
    await fs.mkdir('.planning/audit', { recursive: true });
    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(mergedPages, null, 2),
      'utf-8'
    );

    console.log('');
    console.log('='.repeat(60));
    console.log(`SUCCESS: ${mergedPages.length} pages enumerated`);
    console.log(`Output: ${OUTPUT_FILE}`);
    console.log('='.repeat(60));

    // Final breakdown
    const finalTypeCounts: Record<string, number> = {};
    for (const page of mergedPages) {
      finalTypeCounts[page.type] = (finalTypeCounts[page.type] || 0) + 1;
    }
    console.log('');
    console.log('Final breakdown by type:');
    for (const [type, count] of Object.entries(finalTypeCounts).sort(
      ([, a], [, b]) => b - a
    )) {
      console.log(`  ${type}: ${count}`);
    }
  } catch (error) {
    console.error('Error during page enumeration:', error);
    process.exit(1);
  }
}

// Execute main function
main().catch(console.error);
