---
phase: 02-comparison-infrastructure
plan: 03
title: "HTML Source Content Verification"
subtitle: "Cheerio-based HTML semantic element and text content verification"
oneliner: "HTML content verification using Playwright fetch and Cheerio selectors for semantic structure analysis"
author: "Claude Opus 4.5"
completed: "2026-02-05"
duration: "5 minutes"
type: "execute"
status: "complete"
tags: ["html", "verification", "cheerio", "playwright", "semantic-elements"]
subsystem: "comparison-tools"
---

# Phase 2 Plan 3: HTML Source Content Verification Summary

## Overview

Created an automated HTML content verification system that checks semantic elements and key text content exist in the Nuxt implementation. The system verifies content integrity independent of visual appearance, ensuring semantic HTML structure exists regardless of design differences from the old site.

## Deliverables

### 1. Script: `.planning/scripts/compare-html.ts` (355 lines)

HTML content verification script that:

- **Reads page list** from `.planning/audit/pages.json`
- **Checks server availability** before running (exits gracefully if not running)
- **Fetches HTML** from localhost:3000 using Playwright
- **Parses with Cheerio** for CSS selector-based verification
- **Generates two reports:** timestamped `.txt` and `.json` files

**Semantic Element Checks:**
- h1 (exactly 1 expected per page)
- h2-h6 (count reported, any number acceptable)
- nav (navigation container)
- main (main content area - accessibility)
- footer (footer content)
- header (header content)
- article (optional, for blog-style content)

**Content Verification Checks:**
- Company name ("VP Associates" or "VPAssociates")
- Title match (h1 text vs expected title from pages.json, fuzzy match)
- Contact info (phone, email, or address)
- Meta description presence and length

### 2. Report Directory: `.planning/comparisons/html-reports/`

Contains:
- `README.md` - Documentation for report format and usage
- `2026-02-05_21-27-16-report.txt` - Human-readable text report
- `2026-02-05_21-27-16-report.json` - Structured JSON report

### 3. Initial Results

**Pages Checked:** 13
**Pages Passed:** 9
**Pages with Issues:** 4
**Total Findings:** 4
**Critical Issues:** 4 (all title mismatches, which are expected content changes)

**Issues Found:**
1. `home` - Title mismatch: "Home" vs "structural engineering excellence"
2. `portfolio` - Title mismatch: "PORTFOLIO" vs "our projects"
3. `careers` - Title mismatch: "CAREERS" vs "join our team"
4. `about-3` - Title mismatch: "WHITEBOARD" vs "about vp associates"

**Note:** Title mismatches are EXPECTED and not errors - they document the new site's intentional content rewording.

## Technical Implementation

### Dependencies Used

- **Playwright** (`chromium.launch`) - Fetch HTML from local server
- **Cheerio** (`cheerio.load`) - Parse and query HTML with CSS selectors
- **Node.js fs/promises** - Write reports to disk

### Slug Mapping

The script maps old site slugs to new Nuxt routes:

```typescript
const slugMap: Record<string, string> = {
  'home': '/',
  'services': '/services',
  'portfolio': '/projects',      // Renamed
  'careers': '/careers',
  'contact': '/contact',
  'about-3': '/about',           // Renamed
  // Gallery items map to project detail pages
  'bridges': '/projects/bridges',
  'commercial': '/projects/commercial',
  'misc': '/projects/misc',
  // Fallback: other pages map to home
};
```

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **Cheerio for HTML parsing** - Confirmed as lighter than jsdom with better API for server-rendered HTML
2. **Title fuzzy matching** - Implemented 50% word match threshold to allow for content rewording while still catching major discrepancies
3. **Server check first** - Script exits early with clear message if Nuxt dev server isn't running
4. **Separate report formats** - TXT for human review, JSON for potential automation/downstream processing

## Authentication Gates

None encountered.

## Next Phase Readiness

**Ready for:** 02-04 - SEO Structure Comparison

**Prerequisites satisfied:**
- HTML verification script exists and is tested
- Report format established for programmatic access
- Documentation in place for interpreting findings

**Potential improvements for future phases:**
- Could extend JSON report format to include element-specific text content
- Could add comparison against old site HTML (if needed for content migration)
- Could integrate with Lighthouse for accessibility scores

## Files Modified/Created

| File | Lines | Description |
| ---- | ----- | ----------- |
| `.planning/scripts/compare-html.ts` | 355 | HTML verification script |
| `.planning/comparisons/html-reports/README.md` | 210 | Documentation |
| `.planning/comparisons/html-reports/*.txt` | 363 | Text report |
| `.planning/comparisons/html-reports/*.json` | ~850 | JSON report |

## How to Use

```bash
# Ensure Nuxt dev server is running
npm run dev

# In another terminal, run verification
npx tsx .planning/scripts/compare-html.ts

# View the report
cat .planning/comparisons/html-reports/*-report.txt
```

## Report Location

Latest report: `.planning/comparisons/html-reports/2026-02-05_21-27-16-report.{txt,json}`
