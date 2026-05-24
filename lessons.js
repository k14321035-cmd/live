/**
 * Code Tutorium - Shared Lessons JavaScript
 * Handles lecture navigation, mobile menu, and playground functionality
 */

// Apply saved theme immediately to prevent flash of wrong theme
(function () {
  var t = localStorage.getItem('ct-theme');
  if (t) document.documentElement.setAttribute('data-theme', t);
})();

// Global state
let currentLecture = 0;
let lectureTitles = [];
let totalLectures = 0;

/**
 * Initialize the lesson page
 * @param {string[]} titles - Array of lecture titles
 */
function initLessons(titles) {
    lectureTitles = titles;
    totalLectures = titles.length;
    
    // Check for URL hash
    const hash = window.location.hash;
    if (hash) {
        const index = parseInt(hash.replace('#lec-', ''));
        if (!isNaN(index) && index >= 0 && index < totalLectures) {
            currentLecture = index;
        }
    }
    
    // Show initial lecture
    showLecture(currentLecture);
    
    // Setup keyboard navigation
    document.addEventListener('keydown', handleKeydown);

    // Initialize persistent compiler panel
    initPersistentCompiler();

    // Initialize search overlay
    initSearch();

    // Initialize theme toggle
    initThemeToggle();
}

/**
 * Show a specific lecture
 * @param {number} index - Lecture index to show
 */
function showLecture(index) {
    if (index < 0 || index >= totalLectures) return;
    
    // Hide all lectures
    document.querySelectorAll('.lecture').forEach(lecture => {
        lecture.classList.remove('active');
    });
    
    // Remove active from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show target lecture
    const targetLecture = document.getElementById('lec-' + index);
    if (targetLecture) {
        targetLecture.classList.add('active');
    }
    
    // Activate nav item
    const navItems = document.querySelectorAll('.nav-item');
    const targetNavItem = document.querySelector(`.nav-item[onclick="showLecture(${index})"]`);
    if (targetNavItem) {
        targetNavItem.classList.add('active');
    } else if (navItems[index]) {
        navItems[index].classList.add('active');
    }
    
    // Update breadcrumb
    const breadcrumb = document.getElementById('breadcrumb-current');
    if (breadcrumb && lectureTitles[index]) {
        breadcrumb.textContent = lectureTitles[index];
    }
    
    // Update progress
    const progressLabel = document.getElementById('progress-label');
    const progressFill = document.getElementById('progress-fill');
    
    if (progressLabel) {
        progressLabel.textContent = `Lecture ${index + 1} / ${totalLectures}`;
    }
    
    if (progressFill) {
        const percentage = ((index + 1) / totalLectures) * 100;
        progressFill.style.width = percentage + '%';
    }
    
    // Update URL hash
    window.location.hash = 'lec-' + index;
    
    // Update state
    currentLecture = index;
    
    // Close mobile sidebar if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Copy current lecture URL to clipboard
 */
function copyLectureLink() {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link copied to clipboard!');
        }).catch(() => {
            fallbackCopy(url);
        });
    } else {
        fallbackCopy(url);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('Link copied to clipboard!');
    } catch (err) {
        showToast('Failed to copy link');
    }
    document.body.removeChild(textarea);
}

function showToast(message) {
    let toast = document.getElementById('lecture-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'lecture-toast';
        toast.className = 'lecture-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

/**
 * Toggle mobile sidebar
 */
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

/**
 * Handle keyboard navigation
 */
function handleKeydown(e) {
    // Ctrl+K = open search (works even when focused inside an input)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
        return;
    }

    // Only handle remaining shortcuts if not in an input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }

    // Arrow Right or Space = next
    if ((e.key === 'ArrowRight' || e.key === ' ') && !e.shiftKey) {
        e.preventDefault();
        if (currentLecture < totalLectures - 1) {
            showLecture(currentLecture + 1);
        }
    }
    
    // Arrow Left = previous
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentLecture > 0) {
            showLecture(currentLecture - 1);
        }
    }
}

/**
 * Navigate to next lecture
 */
function nextLecture() {
    if (currentLecture < totalLectures - 1) {
        showLecture(currentLecture + 1);
    }
}

/**
 * Navigate to previous lecture
 */
function prevLecture() {
    if (currentLecture > 0) {
        showLecture(currentLecture - 1);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// PLAYGROUND FUNCTIONS (for HTML/CSS/JS interactive editors)
// ═══════════════════════════════════════════════════════════════════════

// Store default code for each playground
const playgroundDefaults = {};

/**
 * Run a playground (update preview iframe)
 * @param {string} id - Playground ID
 */
function runPlayground(id) {
    const editor = document.getElementById('editor-' + id);
    const preview = document.getElementById('preview-' + id);
    const status = document.getElementById('status-' + id);
    
    if (!editor || !preview) return;
    
    const code = editor.value;
    
    // Update iframe
    const doc = preview.contentDocument || preview.contentWindow.document;
    doc.open();
    doc.write(code);
    doc.close();
    
    // Update status
    if (status) {
        status.innerHTML = '<span class="run-status-dot"></span>Updated';
        status.style.color = 'var(--gfg-green)';
        
        setTimeout(() => {
            status.innerHTML = '<span class="run-status-dot" style="background: var(--text-muted)"></span>Ready';
            status.style.color = 'var(--text-muted)';
        }, 1000);
    }
}

/**
 * Reset a playground to default code
 * @param {string} id - Playground ID
 */
function resetPlayground(id) {
    const editor = document.getElementById('editor-' + id);
    if (!editor) return;
    
    if (playgroundDefaults[id]) {
        editor.value = playgroundDefaults[id];
    }
    
    runPlayground(id);
}

/**
 * Store default code for a playground
 * @param {string} id - Playground ID
 * @param {string} code - Default code
 */
function setPlaygroundDefault(id, code) {
    playgroundDefaults[id] = code;
}

// Auto-run all playgrounds on page load
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.playground').forEach(pg => {
        const id = pg.getAttribute('data-id');
        if (id) {
            const editor = document.getElementById('editor-' + id);
            if (editor) {
                setPlaygroundDefault(id, editor.value);
                runPlayground(id);
                
                // Add Ctrl+Enter shortcut
                editor.addEventListener('keydown', function(e) {
                    if (e.ctrlKey && e.key === 'Enter') {
                        e.preventDefault();
                        runPlayground(id);
                    }
                });
            }
        }
    });
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    
    if (sidebar && menuToggle) {
        const isClickInsideSidebar = sidebar.contains(e.target);
        const isClickOnToggle = menuToggle.contains(e.target);
        
        if (sidebar.classList.contains('open') && !isClickInsideSidebar && !isClickOnToggle) {
            sidebar.classList.remove('open');
        }
    }
});

// ═══════════════════════════════════════════════════════════════════════
// BACK TO TOP BUTTON
// ═══════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════
// COPY CODE
// ═══════════════════════════════════════════════════════════════════════

/**
 * Copy code block content to clipboard
 * @param {HTMLElement} btn - The copy button clicked
 */
function copyCode(btn) {
    const block = btn.closest('.code-block');
    if (!block) return;
    const pre = block.querySelector('pre');
    if (!pre) return;
    const text = pre.innerText || pre.textContent || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            btn.textContent = '✓ Copied';
            btn.classList.add('copied');
            setTimeout(() => { btn.textContent = '📋 Copy'; btn.classList.remove('copied'); }, 2000);
        }).catch(() => _fallbackCopyCode(btn, text));
    } else {
        _fallbackCopyCode(btn, text);
    }
}

function _fallbackCopyCode(btn, text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        btn.textContent = '✓ Copied';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = '📋 Copy'; btn.classList.remove('copied'); }, 2000);
    } catch (e) {
        btn.textContent = '✗ Failed';
    }
    document.body.removeChild(ta);
}

// ═══════════════════════════════════════════════════════════════════════
// PERSISTENT COMPILER PANEL
// ═══════════════════════════════════════════════════════════════════════

/**
 * Detect which compiler to open based on the current lesson URL
 */
function _detectCompilerType() {
    const path = window.location.pathname.toLowerCase();
    return (path.includes('/html') || path.includes('/css')) ? 'web' : 'multi';
}

/**
 * Add a "Compiler" button to the topbar that opens the compiler in a new tab.
 * Called automatically by initLessons() — works on all lesson pages.
 */
function initPersistentCompiler() {
    if (document.getElementById('compiler-toggle-btn')) return;

    const type = _detectCompilerType();
    const src  = type === 'web' ? '../web-compiler.html' : '../multi-language-compiler.html';

    const topbar = document.getElementById('topbar');
    if (!topbar) return;

    const btn = document.createElement('button');
    btn.id        = 'compiler-toggle-btn';
    btn.className = 'compiler-toggle-btn';
    btn.title     = 'Open compiler in a new tab';
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> Compiler';
    btn.onclick   = function() { window.open(src, '_blank'); };

    const shareBtn = topbar.querySelector('.share-btn');
    shareBtn ? topbar.insertBefore(btn, shareBtn) : topbar.appendChild(btn);
}

// Inject social links into the lesson footer
document.addEventListener('DOMContentLoaded', function() {
    const copyright = document.querySelector('#footer-grid .copyright');
    if (copyright && !document.getElementById('footer-social')) {
        const social = document.createElement('div');
        social.id        = 'footer-social';
        social.className = 'footer-social';
        social.innerHTML =
            '<a href="#" class="social-link" aria-label="Instagram" target="_blank" rel="noopener">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>' +
            '</a>' +
            '<a href="#" class="social-link" aria-label="Facebook" target="_blank" rel="noopener">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>' +
            '</a>' +
            '<a href="#" class="social-link" aria-label="WhatsApp" target="_blank" rel="noopener">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
            '</a>' +
            '<a href="#" class="social-link" aria-label="X (Twitter)" target="_blank" rel="noopener">' +
                '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' +
            '</a>' +
            '<a href="https://github.com/learncording-dotcom/Codetutorium" class="social-link" aria-label="GitHub" target="_blank" rel="noopener">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>' +
            '</a>' +
            '<a href="https://www.youtube.com/@Learn-coding-for-free" class="social-link" aria-label="YouTube" target="_blank" rel="noopener">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg>' +
            '</a>';
        copyright.appendChild(social);
    }
});

// Create and inject back-to-top button
document.addEventListener('DOMContentLoaded', function() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    backToTopBtn.setAttribute('title', 'Back to top');
    document.body.appendChild(backToTopBtn);
    
    // Inject toast element
    const toast = document.createElement('div');
    toast.id = 'lecture-toast';
    toast.className = 'lecture-toast';
    document.body.appendChild(toast);
    
    // Show/hide button based on scroll position
    function toggleBackToTop() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
    
    // Scroll to top when clicked
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Listen for scroll events (throttled)
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                toggleBackToTop();
                ticking = false;
            });
            ticking = true;
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════
// SEARCH OVERLAY
// ═══════════════════════════════════════════════════════════════════════

let _searchOverlay = null;
let _searchInput   = null;
let _searchResults = null;
let _searchActive  = -1;

/**
 * Build and inject the search overlay, bind the toggle button.
 */
function initSearch() {
    // Auto-inject search button if not present in this lesson's nav
    let toggleBtn = document.getElementById('search-toggle');
    if (!toggleBtn) {
        let searchWrap = document.querySelector('.lesson-nav-search');
        if (!searchWrap) {
            searchWrap = document.createElement('div');
            searchWrap.className = 'lesson-nav-search';
            const navContainer = document.querySelector('.lesson-nav-container');
            if (navContainer) navContainer.appendChild(searchWrap);
        }
        toggleBtn = document.createElement('button');
        toggleBtn.id        = 'search-toggle';
        toggleBtn.className = 'search-btn';
        toggleBtn.title     = 'Search (Ctrl+K)';
        toggleBtn.setAttribute('aria-label', 'Search lectures');
        toggleBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
        searchWrap.appendChild(toggleBtn);
    }

    if (document.getElementById('search-overlay')) return;

    // Inject overlay markup
    const overlay = document.createElement('div');
    overlay.id        = 'search-overlay';
    overlay.className = 'search-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Search lectures');
    overlay.innerHTML = `
        <div class="search-modal" id="search-modal">
            <div class="search-input-wrap">
                <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input class="search-input" id="search-input" type="text"
                    placeholder="Search lectures…" autocomplete="off" spellcheck="false">
                <span class="search-kbd">ESC</span>
            </div>
            <div class="search-results" id="search-results" role="listbox"></div>
            <div class="search-footer">
                <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
                <span><kbd>↵</kbd> open</span>
                <span><kbd>ESC</kbd> close</span>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    _searchOverlay = overlay;
    _searchInput   = document.getElementById('search-input');
    _searchResults = document.getElementById('search-results');

    // Open on button click
    toggleBtn.addEventListener('click', openSearch);

    // Close on backdrop click
    overlay.addEventListener('click', function(e) {
        if (!document.getElementById('search-modal').contains(e.target)) {
            closeSearch();
        }
    });

    _searchInput.addEventListener('input',   _performSearch);
    _searchInput.addEventListener('keydown', _searchKeydown);
}

function openSearch() {
    if (!_searchOverlay) return;
    _searchOverlay.classList.add('open');
    _searchInput.value = '';
    _searchInput.focus();
    _performSearch();
}

function closeSearch() {
    if (!_searchOverlay) return;
    _searchOverlay.classList.remove('open');
    _searchActive = -1;
}

function _performSearch() {
    const query = _searchInput.value.trim().toLowerCase();
    const navItems = document.querySelectorAll('.nav-item');
    _searchResults.innerHTML = '';
    _searchActive = -1;

    if (!navItems.length) {
        _searchResults.innerHTML = '<div class="search-empty">No lectures found.</div>';
        return;
    }

    // Build match list from sidebar nav items
    const matches = [];
    navItems.forEach(function(item, idx) {
        const text = item.textContent.replace(/^\s*\d+\s*/,'').trim();
        if (!query || text.toLowerCase().includes(query)) {
            const onclick = item.getAttribute('onclick') || '';
            const lectureMatch = onclick.match(/showLecture\((\d+)\)/);
            const lectureIndex = lectureMatch ? parseInt(lectureMatch[1], 10) : idx;
            matches.push({ idx: lectureIndex, text });
        }
    });

    if (!matches.length) {
        _searchResults.innerHTML = '<div class="search-empty">No results for <strong>"' + query + '"</strong></div>';
        return;
    }

    const re = query ? new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')', 'gi') : null;

    matches.forEach(function(m) {
        const el = document.createElement('div');
        el.className = 'search-result-item';
        el.setAttribute('role', 'option');
        el.dataset.lectureIndex = m.idx;

        const titleHtml = re ? m.text.replace(re, '<mark>$1</mark>') : m.text;
        el.innerHTML =
            '<span class="search-result-num">' + String(m.idx + 1).padStart(2,'0') + '</span>' +
            '<span class="search-result-title">' + titleHtml + '</span>' +
            '<span class="search-result-tag">Lecture</span>';

        el.addEventListener('click', function() {
            showLecture(m.idx);
            closeSearch();
        });
        _searchResults.appendChild(el);
    });
}

function _searchKeydown(e) {
    const items = _searchResults.querySelectorAll('.search-result-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        _searchActive = Math.min(_searchActive + 1, items.length - 1);
        _updateSearchActive(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        _searchActive = Math.max(_searchActive - 1, 0);
        _updateSearchActive(items);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const target = _searchActive >= 0 ? items[_searchActive] : items[0];
        if (target) target.click();
    } else if (e.key === 'Escape') {
        closeSearch();
    }
}

function _updateSearchActive(items) {
    items.forEach(function(item, i) {
        item.classList.toggle('active', i === _searchActive);
        if (i === _searchActive) item.scrollIntoView({ block: 'nearest' });
    });
}

// ═══════════════════════════════════════════════════════════════════════
// THEME TOGGLE (lesson pages — theme.js is not linked here)
// ═══════════════════════════════════════════════════════════════════════

function initThemeToggle() {
    if (document.getElementById('theme-toggle')) return;

    var btn = document.createElement('button');
    btn.id        = 'theme-toggle';
    btn.className = 'theme-toggle-btn';
    btn.setAttribute('aria-label', 'Toggle dark / light mode');
    btn.setAttribute('title', 'Toggle theme');
    _setLessonThemeIcon(btn);
    btn.addEventListener('click', _toggleLessonTheme);

    // Fixed floating button — bottom-right corner
    document.body.appendChild(btn);
}

function _toggleLessonTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    var next    = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ct-theme', next);
    var btn = document.getElementById('theme-toggle');
    if (btn) _setLessonThemeIcon(btn);
}

function _setLessonThemeIcon(btn) {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.innerHTML = isDark
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}
