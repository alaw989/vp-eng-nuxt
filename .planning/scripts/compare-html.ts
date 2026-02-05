import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { readFile, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

interface PageEntry {
  url: string;
  slug: string;
  title?: string;
  type: string;
  lastmod?: string;
  source: string;
}

interface ElementFinding {
  element: string;
  count: number;
  status: 'OK' | 'MISSING' | 'WARNING';
  details?: string;
}

interface ContentFinding {
  check: string;
  status: 'OK' | 'MISSING';
  details?: string;
}

interface PageFinding {
  slug: string;
  url: string;
  elements: ElementFinding[];
  content: ContentFinding[];
  issues: string[];
}

interface HtmlReport {
  timestamp: string;
  duration: string;
  summary: {
    pagesChecked: number;
    pagesPassed: number;
    pagesWithIssues: number;
    totalFindings: number;
    criticalIssues: number;
  };
  pages: PageFinding[];
}

const REPORTS_DIR = join(process.cwd(), '.planning', 'comparisons', 'html-reports');
const PAGES_JSON = join(process.cwd(), '.planning', 'audit', 'pages.json');
const BASE_URL = 'http://localhost:3000';

// Slug to local path mapping (based on Nuxt routing)
function getLocalPath(slug: string): string {
  const slugMap: Record<string, string> = {
    'home': '/',
    'services': '/services',
    'portfolio': '/projects',
    'careers': '/careers',
    'contact': '/contact',
    'about-3': '/about',
    'hello-world': '/',
    '132': '/projects/bridges', // Likely maps to a project
    'bridges': '/projects/bridges',
    'commercial': '/projects/commercial',
    'misc': '/projects/misc',
    'uncategorized': '/',
    'root': '/'
  };
  return slugMap[slug] || `/${slug}`;
}

async function ensureDir(path: string): Promise<void> {
  try {
    await mkdir(path, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

function checkSemantics($: cheerio.CheerioAPI): ElementFinding[] {
  const findings: ElementFinding[] = [];

  // Check h1 (should be exactly 1)
  const h1Count = $('h1').length;
  findings.push({
    element: 'h1',
    count: h1Count,
    status: h1Count === 1 ? 'OK' : h1Count === 0 ? 'MISSING' : 'WARNING',
    details: h1Count === 1 ? 'Exactly one h1 found' : `Expected 1 h1, found ${h1Count}`
  });

  // Check h2-h6
  for (let i = 2; i <= 6; i++) {
    const count = $(`h${i}`).length;
    findings.push({
      element: `h${i}`,
      count,
      status: count > 0 ? 'OK' : 'OK',
      details: `${count} h${i} elements found`
    });
  }

  // Check nav element
  const navCount = $('nav').length;
  findings.push({
    element: 'nav',
    count: navCount,
    status: navCount > 0 ? 'OK' : 'MISSING',
    details: navCount > 0 ? `${navCount} nav element(s) found` : 'No nav element found'
  });

  // Check main element
  const mainCount = $('main').length;
  findings.push({
    element: 'main',
    count: mainCount,
    status: mainCount > 0 ? 'OK' : 'MISSING',
    details: mainCount > 0 ? `${mainCount} main element(s) found` : 'No main element found'
  });

  // Check footer element
  const footerCount = $('footer').length;
  findings.push({
    element: 'footer',
    count: footerCount,
    status: footerCount > 0 ? 'OK' : 'MISSING',
    details: footerCount > 0 ? `${footerCount} footer element(s) found` : 'No footer element found'
  });

  // Check article element (optional)
  const articleCount = $('article').length;
  findings.push({
    element: 'article',
    count: articleCount,
    status: articleCount > 0 ? 'OK' : 'OK',
    details: articleCount > 0 ? `${articleCount} article element(s) found` : 'No article elements (optional)'
  });

  // Check header element
  const headerCount = $('header').length;
  findings.push({
    element: 'header',
    count: headerCount,
    status: headerCount > 0 ? 'OK' : 'MISSING',
    details: headerCount > 0 ? `${headerCount} header element(s) found` : 'No header element found'
  });

  return findings;
}

function checkContent($: cheerio.CheerioAPI, expectedTitle?: string): ContentFinding[] {
  const findings: ContentFinding[] = [];
  const bodyText = $('body').text().toLowerCase();

  // Check for company name variants
  const companyNameVariants = ['vp associates', 'vpassociates'];
  const hasCompanyName = companyNameVariants.some(name => bodyText.includes(name));
  findings.push({
    check: 'Company Name',
    status: hasCompanyName ? 'OK' : 'MISSING',
    details: hasCompanyName ? 'Company name found in body' : 'Company name not found'
  });

  // Check for expected title in h1 (fuzzy match)
  if (expectedTitle) {
    const h1Text = $('h1').first().text().toLowerCase();
    const normalizedExpected = expectedTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const normalizedH1 = h1Text.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    // Check if significant portion of title matches (at least 50% of words)
    const expectedWords = normalizedExpected.split(/\s+/).filter(w => w.length > 2);
    const matchingWords = expectedWords.filter(w => normalizedH1.includes(w));
    const matchRatio = expectedWords.length > 0 ? matchingWords.length / expectedWords.length : 0;

    findings.push({
      check: 'Title Match',
      status: matchRatio >= 0.5 ? 'OK' : 'MISSING',
      details: matchRatio >= 0.5
        ? `Title "${expectedTitle}" matches h1 content`
        : `Expected title "${expectedTitle}" but h1 is "${h1Text}"`
    });
  } else {
    findings.push({
      check: 'Title Match',
      status: 'OK',
      details: 'No expected title defined'
    });
  }

  // Check for contact information
  const hasPhone = /[\d\s\-\(\)]{10,}/.test(bodyText) ||
                   /phone|tel|mobile/i.test(bodyText);
  const hasEmail = /[\w\.\-]+@[\w\.\-]+\.\w+/.test(bodyText) ||
                   /email|mail/i.test(bodyText);
  const hasAddress = /address|location|street|road/i.test(bodyText);

  findings.push({
    check: 'Contact Info',
    status: (hasPhone || hasEmail || hasAddress) ? 'OK' : 'MISSING',
    details: `Phone: ${hasPhone ? 'Y' : 'N'}, Email: ${hasEmail ? 'Y' : 'N'}, Address: ${hasAddress ? 'Y' : 'N'}`
  });

  // Check for meta description
  const metaDesc = $('meta[name="description"]').attr('content');
  findings.push({
    check: 'Meta Description',
    status: metaDesc && metaDesc.length > 0 ? 'OK' : 'MISSING',
    details: metaDesc ? `Meta description present (${metaDesc.length} chars)` : 'No meta description found'
  });

  return findings;
}

async function analyzePage(pageEntry: PageEntry, browser: any): Promise<PageFinding | null> {
  const localPath = getLocalPath(pageEntry.slug);
  const url = `${BASE_URL}${localPath}`;

  const browserPage = await browser.newPage();

  try {
    await browserPage.goto(url, {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    // Get the HTML content
    const html = await browserPage.content();
    const $ = cheerio.load(html);

    const elements = checkSemantics($);
    const content = checkContent($, pageEntry.title);

    // Collect issues
    const issues: string[] = [];
    elements.forEach(e => {
      if (e.status === 'MISSING') {
        issues.push(`MISSING: ${e.element} - ${e.details}`);
      } else if (e.status === 'WARNING') {
        issues.push(`WARNING: ${e.element} - ${e.details}`);
      }
    });
    content.forEach(c => {
      if (c.status === 'MISSING') {
        issues.push(`MISSING: ${c.check} - ${c.details}`);
      }
    });

    return {
      slug: pageEntry.slug,
      url: localPath,
      elements,
      content,
      issues
    };

  } catch (error) {
    const errorMsg = (error as Error).message;
    return {
      slug: pageEntry.slug,
      url: localPath,
      elements: [],
      content: [],
      issues: [`ERROR: Failed to load page - ${errorMsg}`]
    };
  } finally {
    await browserPage.close();
  }
}

async function generateTextReport(report: HtmlReport): Promise<string> {
  const lines: string[] = [];

  lines.push('='.repeat(70));
  lines.push('HTML CONTENT VERIFICATION REPORT');
  lines.push('='.repeat(70));
  lines.push('');
  lines.push(`Generated: ${report.timestamp}`);
  lines.push(`Duration: ${report.duration}`);
  lines.push('');
  lines.push('-'.repeat(70));
  lines.push('SUMMARY');
  lines.push('-'.repeat(70));
  lines.push(`Pages Checked:     ${report.summary.pagesChecked}`);
  lines.push(`Pages Passed:      ${report.summary.pagesPassed}`);
  lines.push(`Pages with Issues: ${report.summary.pagesWithIssues}`);
  lines.push(`Total Findings:    ${report.summary.totalFindings}`);
  lines.push(`Critical Issues:   ${report.summary.criticalIssues}`);
  lines.push('');

  for (const page of report.pages) {
    lines.push('-'.repeat(70));
    lines.push(`PAGE: ${page.slug}`);
    lines.push(`URL:  ${page.url}`);
    lines.push('-'.repeat(70));

    if (page.issues.length > 0 && page.issues.some(i => i.startsWith('ERROR'))) {
      lines.push('STATUS: ERROR - Could not load page');
      page.issues.forEach(issue => lines.push(`  ${issue}`));
    } else {
      // Semantic Elements
      lines.push('');
      lines.push('Semantic Elements:');
      for (const elem of page.elements) {
        const status = elem.status === 'OK' ? '✓ OK' : `✗ ${elem.status}`;
        lines.push(`  [${status}] ${elem.padEnd ? elem.element.padEnd(10) : elem.element} - ${elem.details}`);
      }

      // Content Verification
      lines.push('');
      lines.push('Content Verification:');
      for (const cont of page.content) {
        const status = cont.status === 'OK' ? '✓ OK' : '✗ MISSING';
        lines.push(`  [${status}] ${cont.check.padEnd(20)} - ${cont.details}`);
      }

      // Issues summary
      const realIssues = page.issues.filter(i => !i.startsWith('ERROR'));
      if (realIssues.length > 0) {
        lines.push('');
        lines.push('Issues Found:');
        realIssues.forEach(issue => lines.push(`  ${issue}`));
      } else {
        lines.push('');
        lines.push('No issues found.');
      }
    }
    lines.push('');
  }

  lines.push('='.repeat(70));
  lines.push('END OF REPORT');
  lines.push('='.repeat(70));

  return lines.join('\n');
}

async function checkServerRunning(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000', {
      method: 'HEAD',
      signal: AbortSignal.timeout(2000)
    });
    return response.ok || response.status === 404; // 404 is fine, server is running
  } catch {
    return false;
  }
}

async function runHtmlComparison(): Promise<void> {
  const startTime = Date.now();

  console.log('Loading pages from:', PAGES_JSON);

  const pagesData = await readFile(PAGES_JSON, 'utf-8');
  const pages: PageEntry[] = JSON.parse(pagesData);

  console.log(`Found ${pages.length} pages to check\n`);

  // Check if server is running
  console.log('Checking if Nuxt dev server is running...');
  const serverRunning = await checkServerRunning();

  if (!serverRunning) {
    console.log('\nERROR: Nuxt dev server is not running on http://localhost:3000');
    console.log('Please start the server first:');
    console.log('  npm run dev');
    console.log('\nThen run this script again.');
    process.exit(1);
  }

  console.log('Server is running. Starting HTML content verification...\n');

  const browser = await chromium.launch({ headless: true });

  const findings: PageFinding[] = [];
  let totalFindings = 0;
  let criticalIssues = 0;
  let pagesWithIssues = 0;
  let pagesPassed = 0;

  for (const page of pages) {
    console.log(`Checking: ${page.slug}`);

    const finding = await analyzePage(page, browser);
    if (finding) {
      findings.push(finding);

      const realIssues = finding.issues.filter(i => !i.startsWith('ERROR'));
      if (realIssues.length > 0) {
        pagesWithIssues++;
        totalFindings += realIssues.length;
        // Count critical issues (missing h1, main, nav, footer, header)
        criticalIssues += realIssues.filter(i =>
          i.includes('h1') || i.includes('main') || i.includes('nav') ||
          i.includes('footer') || i.includes('header')
        ).length;
        console.log(`  Issues: ${realIssues.length}`);
      } else {
        pagesPassed++;
        console.log('  ✓ No issues');
      }
    }
  }

  await browser.close();

  const duration = Date.now() - startTime;
  const timestamp = new Date().toISOString();

  const report: HtmlReport = {
    timestamp,
    duration: `${duration}ms`,
    summary: {
      pagesChecked: pages.length,
      pagesPassed,
      pagesWithIssues,
      totalFindings,
      criticalIssues
    },
    pages: findings
  };

  // Generate timestamped report filename
  const date = new Date();
  const dateStr = date.toISOString().replace(/[:.]/g, '-').split('T')[0];
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
  const timestampStr = `${dateStr}_${timeStr}`;

  // Ensure reports directory exists
  await ensureDir(REPORTS_DIR);

  // Write JSON report
  const jsonPath = join(REPORTS_DIR, `${timestampStr}-report.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nJSON report saved: ${jsonPath}`);

  // Write text report
  const textPath = join(REPORTS_DIR, `${timestampStr}-report.txt`);
  const textContent = await generateTextReport(report);
  await writeFile(textPath, textContent, 'utf-8');
  console.log(`Text report saved: ${textPath}`);

  // Console summary
  console.log('\n' + '='.repeat(50));
  console.log('HTML CONTENT VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Pages Checked:     ${report.summary.pagesChecked}`);
  console.log(`Pages Passed:      ${report.summary.pagesPassed}`);
  console.log(`Pages with Issues: ${report.summary.pagesWithIssues}`);
  console.log(`Total Findings:    ${report.summary.totalFindings}`);
  console.log(`Critical Issues:   ${report.summary.criticalIssues}`);
  console.log('='.repeat(50));

  if (criticalIssues > 0) {
    console.log('\nCritical Issues (missing semantic elements):');
    findings.forEach(f => {
      const crit = f.issues.filter(i =>
        i.includes('MISSING') &&
        (i.includes('h1') || i.includes('main') || i.includes('nav') ||
         i.includes('footer') || i.includes('header'))
      );
      if (crit.length > 0) {
        console.log(`  ${f.slug}:`);
        crit.forEach(c => console.log(`    - ${c}`));
      }
    });
  }

  console.log('');
}

async function main(): Promise<void> {
  try {
    await runHtmlComparison();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
