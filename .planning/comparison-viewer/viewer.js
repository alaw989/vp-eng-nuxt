/**
 * Visual Comparison Viewer
 *
 * Client-side logic for viewing baseline/current/diff comparisons.
 * Loads comparison metadata and updates images based on user selection.
 */

// Application state
const state = {
    currentPage: null,
    currentViewport: 'mobile',
    currentComparison: null,
    comparisons: [],
    pages: [],
    comparisonData: null
};

// DOM element references
const elements = {
    pageSelect: null,
    comparisonSelect: null,
    viewportTabs: null,
    baselineImage: null,
    currentImage: null,
    diffImage: null,
    baselineLabel: null,
    currentLabel: null,
    diffLabel: null,
    diffPercentage: null,
    diffPixels: null,
    totalPixels: null,
    timestamp: null
};

/**
 * Initialize the viewer on DOMContentLoaded
 */
async function init() {
    // Cache DOM elements
    cacheElements();

    // Set up event listeners
    setupEventListeners();

    // Load available comparison runs
    await loadComparisonList();

    // Load the latest comparison
    if (state.comparisons.length > 0) {
        state.currentComparison = state.comparisons[0].timestamp;
        await loadComparison(state.currentComparison);
    }

    // Update page dropdown with available pages
    updatePageDropdown();
}

/**
 * Cache DOM element references
 */
function cacheElements() {
    elements.pageSelect = document.getElementById('page-select');
    elements.comparisonSelect = document.getElementById('comparison-select');
    elements.viewportTabs = document.querySelectorAll('.viewport-tab');
    elements.baselineImage = document.getElementById('baseline-image');
    elements.currentImage = document.getElementById('current-image');
    elements.diffImage = document.getElementById('diff-image');
    elements.baselineLabel = document.getElementById('baseline-label');
    elements.currentLabel = document.getElementById('current-label');
    elements.diffLabel = document.getElementById('diff-label');
    elements.diffPercentage = document.getElementById('diff-percentage');
    elements.diffPixels = document.getElementById('diff-pixels');
    elements.totalPixels = document.getElementById('total-pixels');
    elements.timestamp = document.getElementById('comparison-timestamp');
}

/**
 * Set up event listeners for controls
 */
function setupEventListeners() {
    // Page dropdown change
    elements.pageSelect.addEventListener('change', (e) => {
        state.currentPage = e.target.value;
        updateImages();
        updateStats();
    });

    // Viewport tab clicks
    elements.viewportTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const viewport = e.target.dataset.viewport;
            setViewport(viewport);
        });
    });

    // Comparison selector change
    elements.comparisonSelect.addEventListener('change', async (e) => {
        const timestamp = e.target.value;
        state.currentComparison = timestamp;
        await loadComparison(timestamp);
        updatePageDropdown();
        updateImages();
        updateStats();
    });

    // Keyboard navigation for viewports
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'SELECT') return;

        const viewports = ['mobile', 'tablet', 'desktop'];
        const currentIndex = viewports.indexOf(state.currentViewport);

        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            setViewport(viewports[currentIndex - 1]);
        } else if (e.key === 'ArrowRight' && currentIndex < viewports.length - 1) {
            setViewport(viewports[currentIndex + 1]);
        }
    });
}

/**
 * Set the current viewport
 */
function setViewport(viewport) {
    state.currentViewport = viewport;

    // Update tab active states
    elements.viewportTabs.forEach(tab => {
        const isActive = tab.dataset.viewport === viewport;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive);
    });

    updateImages();
    updateStats();
}

/**
 * Load available comparison runs from API
 */
async function loadComparisonList() {
    try {
        const response = await fetch('/api/comparisons');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        state.comparisons = data.comparisons || [];

        // Populate comparison dropdown
        updateComparisonDropdown();
    } catch (error) {
        console.error('Failed to load comparison list:', error);
        showError('Unable to load comparison list. Refresh to try again.');
    }
}

/**
 * Update the comparison dropdown with available runs
 */
function updateComparisonDropdown() {
    elements.comparisonSelect.innerHTML = '';

    if (state.comparisons.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'No comparisons available';
        option.disabled = true;
        elements.comparisonSelect.appendChild(option);
        return;
    }

    state.comparisons.forEach(comp => {
        const option = document.createElement('option');
        option.value = comp.timestamp;
        const formattedDate = formatTimestamp(comp.timestamp);
        option.textContent = `${formattedDate} (${comp.pageCount || '?'} pages)`;
        elements.comparisonSelect.appendChild(option);
    });
}

/**
 * Load comparison metadata for a specific timestamp
 */
async function loadComparison(timestamp) {
    try {
        const response = await fetch(`/api/comparisons/${timestamp}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        state.comparisonData = data;

        // Transform results array to pages format for easier lookup
        // results is a flat array of {page, slug, viewport, diffPercentage, ...}
        // We need to group by slug and nest viewports
        if (data.results && Array.isArray(data.results)) {
            const pageMap = new Map();

            for (const result of data.results) {
                if (!pageMap.has(result.slug)) {
                    pageMap.set(result.slug, {
                        slug: result.slug,
                        title: result.page,
                        viewports: {}
                    });
                }
                const page = pageMap.get(result.slug);
                page.viewports[result.viewport] = {
                    diffPercent: result.diffPercentage,
                    diffPixels: result.diffCount,
                    match: result.match,
                    error: result.error
                };
            }

            state.pages = Array.from(pageMap.values());
        } else {
            state.pages = data.pages || [];
        }

        // Update timestamp display
        elements.timestamp.textContent = `Comparison: ${formatTimestamp(timestamp)}`;

        // Set current page to first available if not set
        if (!state.currentPage && state.pages.length > 0) {
            state.currentPage = state.pages[0].slug;
        }
    } catch (error) {
        console.error('Failed to load comparison:', error);
        showError(`Unable to load comparison data for ${timestamp}`);
    }
}

/**
 * Update the page dropdown with available pages
 */
function updatePageDropdown() {
    const currentValue = elements.pageSelect.value;
    elements.pageSelect.innerHTML = '';

    if (state.pages.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'No pages available';
        option.disabled = true;
        elements.pageSelect.appendChild(option);
        return;
    }

    state.pages.forEach(page => {
        const option = document.createElement('option');
        option.value = page.slug;
        option.textContent = page.title || page.slug;
        elements.pageSelect.appendChild(option);
    });

    // Restore selection if possible
    if (currentValue && state.pages.find(p => p.slug === currentValue)) {
        elements.pageSelect.value = currentValue;
    } else if (state.pages.length > 0) {
        state.currentPage = state.pages[0].slug;
    }
}

/**
 * Update images based on current selections
 */
function updateImages() {
    if (!state.currentPage || !state.currentComparison) return;

    const basePath = `/comparisons/${state.currentComparison}/${state.currentPage}`;

    // Set image sources
    elements.baselineImage.src = `${basePath}/baseline-${state.currentViewport}.png`;
    elements.currentImage.src = `${basePath}/current-${state.currentViewport}.png`;
    elements.diffImage.src = `${basePath}/diff-${state.currentViewport}.png`;

    // Update labels
    elements.baselineLabel.textContent = `${state.currentPage} - ${state.currentViewport} (baseline)`;
    elements.currentLabel.textContent = `${state.currentPage} - ${state.currentViewport} (current)`;
    elements.diffLabel.textContent = `${state.currentPage} - ${state.currentViewport} (diff)`;
}

/**
 * Update statistics display
 */
function updateStats() {
    if (!state.comparisonData || !state.currentPage) return;

    const pageData = state.pages.find(p => p.slug === state.currentPage);
    if (!pageData || !pageData.viewports) return;

    const viewportData = pageData.viewports[state.currentViewport];
    if (!viewportData) {
        elements.diffPercentage.textContent = '--';
        elements.diffPixels.textContent = '--';
        elements.totalPixels.textContent = '--';
        return;
    }

    elements.diffPercentage.textContent = formatPercentage(viewportData.diffPercent || 0);
    elements.diffPixels.textContent = formatNumber(viewportData.diffPixels || 0);
    // Total pixels not available in current format, calculate from diff if available
    if (viewportData.diffPercent && viewportData.diffPixels) {
        const total = Math.round(viewportData.diffPixels / (viewportData.diffPercent / 100));
        elements.totalPixels.textContent = formatNumber(total);
    } else {
        elements.totalPixels.textContent = '--';
    }
}

/**
 * Format a timestamp for display
 */
function formatTimestamp(timestamp) {
    // Parse YYYY-MM-DD_HH-mm-ss format
    const match = timestamp.match(/(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/);
    if (!match) return timestamp;

    const [, year, month, day, hour, minute, second] = match;
    const date = new Date(year, month - 1, day, hour, minute, second);

    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format a percentage for display
 */
function formatPercentage(value) {
    return `${value.toFixed(2)}%`;
}

/**
 * Format a number with thousand separators
 */
function formatNumber(num) {
    return num.toLocaleString('en-US');
}

/**
 * Show an error message to the user
 */
function showError(message) {
    elements.timestamp.textContent = message;
    elements.timestamp.style.color = '#dc2626';
}

/**
 * Handle image loading errors
 */
function handleImageError(img, type) {
    img.onerror = null; // Prevent infinite loop
    // SVG placeholder is already set in HTML onerror attribute
    console.warn(`Failed to load ${type} image for ${state.currentPage}/${state.currentViewport}`);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
