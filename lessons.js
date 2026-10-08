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
let lectureTitles = [];   // sparse array, indexed by lecture id (lec-N)
let lectureIds = [];      // sorted ids of lectures that actually exist in the DOM
let totalLectures = 0;    // number of lectures that actually exist

/**
 * Build the lecture registry from the real DOM so titles, progress and
 * navigation can never drift from the actual content.
 * The optional titles[] array passed by each page is only used as a fallback.
 * @param {string[]} titles - Legacy array of lecture titles (fallback only)
 */
function buildLectureRegistry(titles) {
    const found = {};
    document.querySelectorAll('.lecture[id^="lec-"]').forEach(el => {
        const id = parseInt(el.id.slice(4), 10);
        if (isNaN(id) || found[id] !== undefined) return; // first element wins on duplicate ids
        const h1 = el.querySelector('h1');
        const text = h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : '';
        found[id] = text || (titles && titles[id]) || ('Lecture ' + (id + 1));
    });

    lectureIds = Object.keys(found).map(Number).sort((a, b) => a - b);
    lectureTitles = [];
    lectureIds.forEach(id => { lectureTitles[id] = found[id]; });

    // Pages without .lecture elements: fall back to the legacy array
    if (lectureIds.length === 0 && titles) {
        lectureIds = titles.map((_, i) => i);
        lectureTitles = titles.slice();
    }
    totalLectures = lectureIds.length;
}

/** Extract the lecture id a sidebar item points to (falls back to its position). */
function navItemLectureId(item, fallbackIdx) {
    const m = (item.getAttribute('onclick') || '').match(/showLecture\((\d+)\)/);
    return m ? parseInt(m[1], 10) : fallbackIdx;
}

/** Neutralise sidebar entries whose lecture does not exist yet (no dead links). */
function markUnavailableNavItems() {
    document.querySelectorAll('.nav-item').forEach((item, idx) => {
        const id = navItemLectureId(item, idx);
        if (lectureIds.indexOf(id) !== -1 || item.classList.contains('nav-soon')) return;
        item.classList.add('nav-soon');
        item.removeAttribute('onclick');
        item.setAttribute('aria-disabled', 'true');
        item.title = 'Coming soon';
        const badge = document.createElement('span');
        badge.className = 'soon-badge';
        badge.textContent = 'Soon';
        item.appendChild(badge);
    });
}

/** Id of the lecture `step` positions away from `id` (or null at the ends). */
function adjacentLectureId(id, step) {
    const pos = lectureIds.indexOf(id);
    const target = lectureIds[pos + step];
    return (pos === -1 || target === undefined) ? null : target;
}

/**
 * Initialize the lesson page
 * @param {string[]} titles - Array of lecture titles (legacy, fallback only)
 */
function initLessons(titles) {
    buildLectureRegistry(titles);
    markUnavailableNavItems();
    currentLecture = lectureIds.length ? lectureIds[0] : 0;
    
    // Check for URL hash
    const hash = window.location.hash;
    if (hash) {
        const index = parseInt(hash.replace('#lec-', ''), 10);
        if (!isNaN(index) && lectureIds.indexOf(index) !== -1) {
            currentLecture = index;
        }
    }
    
    // Show initial lecture
    showLecture(currentLecture);
    
    // Setup keyboard navigation
    document.addEventListener('keydown', handleKeydown);

    // Buttons written as <button data-lecture="N"> (used by the HTML course) navigate too
    document.addEventListener('click', function (e) {
        const el = e.target.closest ? e.target.closest('[data-lecture]') : null;
        if (!el) return;
        const target = parseInt(el.getAttribute('data-lecture'), 10);
        if (!isNaN(target)) showLecture(target);
    });

    // Initialize blog button
    initBlogButton();

    // Initialize projects dropdown
    initProjectsDropdown();

    // Initialize search overlay
    initSearch();

    // Initialize theme toggle
    initThemeToggle();

    // Initialize horizontal courses scroll bar
    initCoursesScroll();

    // Initialize copy code buttons
    initCopyCodeButtons();

    // Restore completed lectures checkmarks
    restoreCompletedLectures();

    // Initialize exercise submission buttons
    initExerciseSubmissionUI();

    // Review credit badges and self-check quizzes
    initLessonReviewMeta();
    initQuizzes();
}

/**
 * Show a specific lecture
 * @param {number} index - Lecture index to show
 */
function showLecture(index) {
    if (lectureIds.indexOf(index) === -1) return;
    
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
    
    // Mark lecture completed & show checkmark
    markLectureCompleted(index);
    
    // Update breadcrumb
    const breadcrumb = document.getElementById('breadcrumb-current');
    if (breadcrumb && lectureTitles[index]) {
        breadcrumb.textContent = lectureTitles[index];
    }
    
    // Update progress (position among lectures that actually exist)
    const progressLabel = document.getElementById('progress-label');
    const progressFill = document.getElementById('progress-fill');
    const position = lectureIds.indexOf(index) + 1;
    
    if (progressLabel) {
        progressLabel.textContent = `Lecture ${position} / ${totalLectures}`;
    }
    
    if (progressFill) {
        const percentage = (position / totalLectures) * 100;
        progressFill.style.width = percentage + '%';
    }
    
    // Update URL hash without triggering native browser jump/scroll
    history.replaceState(null, null, '#lec-' + index);
    
    // Update state
    currentLecture = index;
    
    // Close mobile sidebar if open — disabled per request to not hide navigation
    /*
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
        document.body.classList.remove('sidebar-open');
    }
    */
    
    // Scroll to top of the newly selected lecture
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (targetLecture) {
        // Scroll the top of the lecture into view smoothly
        const topbar = document.getElementById('topbar');
        if (topbar) {
            topbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            targetLecture.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
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
        document.body.classList.toggle('sidebar-open');
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
        const next = adjacentLectureId(currentLecture, 1);
        if (next !== null) showLecture(next);
    }
    
    // Arrow Left = previous
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = adjacentLectureId(currentLecture, -1);
        if (prev !== null) showLecture(prev);
    }
}

/**
 * Navigate to next lecture
 */
function nextLecture() {
    const next = adjacentLectureId(currentLecture, 1);
    if (next !== null) showLecture(next);
}

/**
 * Navigate to previous lecture
 */
function prevLecture() {
    const prev = adjacentLectureId(currentLecture, -1);
    if (prev !== null) showLecture(prev);
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
            document.body.classList.remove('sidebar-open');
        }
    }
});

// ═══════════════════════════════════════════════════════════════════════
// BACK TO TOP BUTTON
// ═══════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════
// COPY CODE — auto-inject buttons into every .code-block
// ═══════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.code-block').forEach(function (block) {
        const header = block.querySelector('.code-header');
        if (!header) return;
        if (header.querySelector('.copy-btn')) return; // already injected
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = '📋 Copy';
        btn.setAttribute('aria-label', 'Copy code');
        btn.onclick = function () { copyCode(btn); };
        header.appendChild(btn);
    });
});

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

/**
 * Add a "Blog" or "Lessons" button to the topbar.
 * Automatically displays "Lessons" on blog pages so users can return to lessons.
 */
function initBlogButton() {
    if (document.getElementById('blog-nav-btn')) return;

    const navSearch = document.querySelector('.lesson-nav-search');
    if (!navSearch) return;

    const isBlogPage = window.location.pathname.includes('/blog/') || window.location.pathname.endsWith('blog');

    const btn = document.createElement('a');
    btn.id        = 'blog-nav-btn';
    btn.className = 'blog-nav-btn';

    if (isBlogPage) {
        btn.title     = 'Explore lessons & courses';
        btn.href      = '../lessons/python.html';
        btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> Lessons';
    } else {
        btn.title     = 'Read our blog';
        btn.href      = '../blog/index.html';
        btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> Blog';
    }

    navSearch.appendChild(btn);
}

/**
 * Add a "Completed Projects" dropdown to the topbar.
 * Called automatically by initLessons() — works on all lesson pages.
 */
function initProjectsDropdown() {
    if (document.getElementById('projects-dropdown')) return;

    const navSearch = document.querySelector('.lesson-nav-search');
    if (!navSearch) return;

    const container = document.createElement('div');
    container.id = 'projects-dropdown';
    container.className = 'projects-dropdown';
    container.innerHTML = `
        <button class="projects-dropdown-trigger" title="Completed Projects">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <span>Projects</span>
            <svg class="arrow-svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="projects-dropdown-menu">
            <div class="dropdown-section-label">Learning Apps</div>
            <a href="https://play.google.com/store/apps/details?id=com.pymaster.app" target="_blank" rel="noopener">
                <span class="proj-icon">🐍</span>
                <div class="proj-info">
                    <div class="proj-name">Python Master</div>
                    <div class="proj-desc">Python with interactive exercises</div>
                </div>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.webdev.academy" target="_blank" rel="noopener">
                <span class="proj-icon">🌐</span>
                <div class="proj-info">
                    <div class="proj-name">Web Dev Academy</div>
                    <div class="proj-desc">HTML, CSS & JS structured course</div>
                </div>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.ccmasterclass.app" target="_blank" rel="noopener">
                <span class="proj-icon">⚙️</span>
                <div class="proj-info">
                    <div class="proj-name">C/C++ Masterclass</div>
                    <div class="proj-desc">Master C & C++ coding challenges</div>
                </div>
            </a>
            
            <div class="dropdown-divider"></div>
            
            <div class="dropdown-section-label">Completed Projects</div>
            <a href="https://play.google.com/store/apps/details?id=com.lingolearn.app" target="_blank" rel="noopener">
                <span class="proj-icon">🗣️</span>
                <div class="proj-info">
                    <div class="proj-name">Learn Shona & Hindi</div>
                    <div class="proj-desc">Interactive language learning</div>
                </div>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.mathelate.app" target="_blank" rel="noopener">
                <span class="proj-icon">➕</span>
                <div class="proj-info">
                    <div class="proj-name">Mathlete</div>
                    <div class="proj-desc">Play mathematics games</div>
                </div>
            </a>
        </div>
    `;

    const blogBtn = document.getElementById('blog-nav-btn');
    if (blogBtn && blogBtn.nextSibling) {
        navSearch.insertBefore(container, blogBtn.nextSibling);
    } else {
        navSearch.appendChild(container);
    }
}

// Inject social links into the lesson footer and move share button
document.addEventListener('DOMContentLoaded', function() {
    // Move share button to top nav header search container
    const shareBtn = document.querySelector('#topbar .share-btn') || document.querySelector('.share-btn');
    const navSearch = document.querySelector('.lesson-nav-search');
    if (shareBtn && navSearch) {
        const searchToggle = document.getElementById('search-toggle');
        if (searchToggle) {
            navSearch.insertBefore(shareBtn, searchToggle);
        } else {
            navSearch.appendChild(shareBtn);
        }
    }

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

// ═══════════════════════════════════════════════════════════════════════
// HORIZONTAL COURSES SCROLL BAR
// ═══════════════════════════════════════════════════════════════════════

function initCoursesScroll() {
    const mainDiv = document.getElementById('main');
    if (!mainDiv) return;

    // Define all courses
    const courses = [
        { id: 'python', name: 'Python' },
        { id: 'c++', name: 'C++' },
        { id: 'html', name: 'HTML' },
        { id: 'css', name: 'CSS' },
        { id: 'java', name: 'Java' },
        { id: 'javascript', name: 'JavaScript' },
        { id: 'c', name: 'C Language' },
        { id: 'cc', name: 'C#' },
        { id: 'typescript', name: 'TypeScript' },
        { id: 'go', name: 'Go' },
        { id: 'rust', name: 'Rust' },
        { id: 'kotlin', name: 'Kotlin' },
        { id: 'swift', name: 'Swift' },
        { id: 'php', name: 'PHP' },
        { id: 'sql', name: 'SQL' },
        { id: 'r', name: 'R' },
        { id: 'bash', name: 'Bash' },
        { id: 'dart', name: 'Dart' },
        { id: 'ruby', name: 'Ruby' },
        { id: 'matlab', name: 'MATLAB' },
        { id: 'visualbasic', name: 'Visual Basic' },
        { id: 'shell', name: 'Shell' },
        { id: 'ethicalhacking', name: 'Ethical Hacking' },
        { id: 'numpy', name: 'NumPy' },
        { id: 'matplotlib', name: 'Matplotlib' },
        { id: 'machinelearning', name: 'Machine Learning' },
        { id: 'deeplearning', name: 'Deep Learning' }
    ];

    const path = window.location.pathname.toLowerCase();
    
    // Create DOM structure
    const bar = document.createElement('div');
    bar.className = 'courses-scroll-bar';
    
    const inner = document.createElement('div');
    inner.className = 'courses-scroll-inner';
    
    courses.forEach(function(course) {
        const item = document.createElement('a');
        item.className = 'courses-scroll-item';
        item.href = course.id + '.html';
        item.textContent = course.name;
        
        const isActive = path.endsWith('/' + course.id + '.html') || path.endsWith('/' + course.id);
        if (isActive) {
            item.classList.add('active');
        }
        
        inner.appendChild(item);
    });
    
    const leftBtn = document.createElement('button');
    leftBtn.className = 'courses-scroll-arrow left';
    leftBtn.setAttribute('aria-label', 'Scroll left');
    leftBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>';
    
    const rightBtn = document.createElement('button');
    rightBtn.className = 'courses-scroll-arrow right';
    rightBtn.setAttribute('aria-label', 'Scroll right');
    rightBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>';
    
    leftBtn.onclick = function() {
        inner.scrollBy({ left: -220, behavior: 'smooth' });
    };
    
    rightBtn.onclick = function() {
        inner.scrollBy({ left: 220, behavior: 'smooth' });
    };

    bar.appendChild(leftBtn);
    bar.appendChild(inner);
    bar.appendChild(rightBtn);
    
    mainDiv.insertBefore(bar, mainDiv.firstChild);

    function updateArrows() {
        const scrollLeft = inner.scrollLeft;
        const maxScroll = inner.scrollWidth - inner.clientWidth;
        leftBtn.classList.toggle('visible', scrollLeft > 5);
        rightBtn.classList.toggle('visible', scrollLeft < maxScroll - 5);
    }
    
    inner.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);

    setTimeout(function() {
        const activeItem = inner.querySelector('.courses-scroll-item.active');
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        updateArrows();
    }, 150);
}

// Auto-initialize header components on page load
document.addEventListener('DOMContentLoaded', function () {
    if (typeof initBlogButton === 'function') initBlogButton();
    if (typeof initProjectsDropdown === 'function') initProjectsDropdown();
    if (typeof initSearch === 'function') initSearch();
    if (typeof restoreCompletedLectures === 'function') restoreCompletedLectures();
    if (typeof wrapTables === 'function') wrapTables();
});

/**
 * Auto-wrap tables in responsive scroll wrappers
 */
function wrapTables() {
    document.querySelectorAll('table').forEach(tbl => {
        const parent = tbl.parentElement;
        if (!parent || parent.classList.contains('table-wrapper') || parent.classList.contains('tbl-wrap')) return;
        const wrap = document.createElement('div');
        wrap.className = 'table-wrapper';
        parent.insertBefore(wrap, tbl);
        wrap.appendChild(tbl);
    });
}

/**
 * Progress & Completion Checkmarks Tracking
 */
function markLectureCompleted(index) {
    const pageKey = window.location.pathname;
    try {
        let completed = JSON.parse(localStorage.getItem('completed_' + pageKey) || '[]');
        if (!completed.includes(index)) {
            completed.push(index);
            localStorage.setItem('completed_' + pageKey, JSON.stringify(completed));
        }
        updateCompletedNavItems(completed);
    } catch (e) {}
}

function restoreCompletedLectures() {
    const pageKey = window.location.pathname;
    try {
        let completed = JSON.parse(localStorage.getItem('completed_' + pageKey) || '[]');
        updateCompletedNavItems(completed);
    } catch (e) {}
}

function updateCompletedNavItems(completed) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, idx) => {
        if (item.classList.contains('nav-soon')) return;
        // Match by lecture id, not sidebar position (the sidebar can list items out of order)
        if (completed.includes(navItemLectureId(item, idx))) {
            item.classList.add('completed');
            if (!item.querySelector('.check-icon')) {
                const check = document.createElement('span');
                check.className = 'check-icon';
                check.innerHTML = '✓';
                check.title = 'Completed';
                item.appendChild(check);
            }
        }
    });
}

/* ==========================================================
   EXERCISE ASSIGNMENT SUBMISSION BUTTON & INLINE DRAWER
   ========================================================== */

/**
 * Automatically injects "Submit Solution" buttons into all .exercise elements
 */
function initExerciseSubmissionUI() {
    const exercises = document.querySelectorAll('.exercise');
    if (!exercises || exercises.length === 0) return;

    // Determine current course slug
    const pathParts = window.location.pathname.split('/');
    let courseSlug = (pathParts.pop() || '').replace(/\.html$/i, '').toLowerCase();
    if (courseSlug === 'c++') courseSlug = 'cpp';

    exercises.forEach((ex, idx) => {
        // Prevent duplicate injection
        if (ex.querySelector('.exercise-submit-bar')) return;

        // Find parent lecture and title
        const lectureEl = ex.closest('.lecture');
        let lectureNum = idx;
        if (lectureEl && lectureEl.id) {
            const match = lectureEl.id.match(/\d+/);
            if (match) lectureNum = parseInt(match[0], 10);
        }

        const titleEl = ex.querySelector('.exercise-title');
        const exerciseTitle = titleEl ? titleEl.textContent.trim() : `Exercise (Lecture ${lectureNum + 1})`;

        // Build profile link URL with pre-filled query params
        const profileUrl = `../profile.html?course=${encodeURIComponent(courseSlug)}&lecture=${lectureNum + 1}&title=${encodeURIComponent(exerciseTitle)}#assignments`;

        const submitBar = document.createElement('div');
        submitBar.className = 'exercise-submit-bar';
        submitBar.innerHTML = `
            <button type="button" class="exercise-submit-btn" onclick="toggleExerciseDrawer(this)">
                <span>📤</span> Submit Solution
            </button>
            <a href="${profileUrl}" class="exercise-profile-link" target="_blank" rel="noopener noreferrer">
                Full Portal →
            </a>
        `;

        const drawer = document.createElement('div');
        drawer.className = 'exercise-submission-drawer';
        drawer.style.display = 'none';
        drawer.dataset.course = courseSlug;
        drawer.dataset.lecture = lectureNum;
        drawer.dataset.title = exerciseTitle;

        drawer.innerHTML = `
            <div class="exercise-drawer-header">
                <span>// Submit Solution: ${escapeLessonHtml(exerciseTitle)}</span>
                <button type="button" style="background:none; border:none; color:var(--muted); cursor:pointer;" onclick="toggleExerciseDrawer(this)">✕</button>
            </div>
            <textarea class="exercise-code-textarea" placeholder="Paste your code implementation or solution here..."></textarea>
            <div class="exercise-drawer-actions">
                <button type="button" class="exercise-submit-btn" onclick="submitInlineExerciseSolution(this)">
                    submit_solution()
                </button>
                <span class="exercise-drawer-msg"></span>
            </div>
        `;

        ex.appendChild(submitBar);
        ex.appendChild(drawer);
    });
}

function toggleExerciseDrawer(btn) {
    const parentExercise = btn.closest('.exercise');
    if (!parentExercise) return;
    const drawer = parentExercise.querySelector('.exercise-submission-drawer');
    if (!drawer) return;

    if (drawer.style.display === 'none' || drawer.style.display === '') {
        drawer.style.display = 'flex';
        const textarea = drawer.querySelector('.exercise-code-textarea');
        if (textarea) textarea.focus();
    } else {
        drawer.style.display = 'none';
    }
}

async function submitInlineExerciseSolution(btn) {
    const drawer = btn.closest('.exercise-submission-drawer');
    if (!drawer) return;

    const textarea = drawer.querySelector('.exercise-code-textarea');
    const msgEl = drawer.querySelector('.exercise-drawer-msg');
    const code = textarea ? textarea.value.trim() : '';

    if (!code) {
        if (msgEl) {
            msgEl.textContent = "Please paste your code before submitting.";
            msgEl.className = "exercise-drawer-msg error";
        }
        return;
    }

    const client = window._lessonSupabase;
    if (!client) {
        if (msgEl) {
            msgEl.textContent = "Please sign in to submit your solution.";
            msgEl.className = "exercise-drawer-msg error";
        }
        return;
    }

    btn.disabled = true;
    btn.textContent = "Submitting...";

    try {
        const { data: { user }, error: userError } = await client.auth.getUser();
        if (userError || !user) {
            window.location.href = '../login.html?auth_trigger=login';
            return;
        }

        const courseSlug = drawer.dataset.course || 'general';
        const lectureNum = parseInt(drawer.dataset.lecture, 10) || 0;
        const exerciseTitle = drawer.dataset.title || 'Exercise Submission';

        const { error: insertError } = await client
            .from('assignment_submissions')
            .insert({
                user_id: user.id,
                course_id: courseSlug,
                lecture_number: lectureNum,
                exercise_title: exerciseTitle,
                submission_type: 'code',
                content: code,
                status: 'submitted',
                updated_at: new Date().toISOString()
            });

        if (insertError) {
            if (insertError.code === '42P01') {
                throw new Error("Table assignment_submissions not found. Run scripts/setup_assignments.sql in Supabase.");
            }
            throw insertError;
        }

        if (msgEl) {
            msgEl.innerHTML = `✅ Submitted! Status: <strong>Under Review</strong>. <a href="../profile.html#assignments" style="color:var(--primary-light); text-decoration:underline;">View in Profile</a>`;
            msgEl.className = "exercise-drawer-msg success";
        }
    } catch (err) {
        console.error("Submission error:", err);
        if (msgEl) {
            msgEl.textContent = err.message || "Submission failed. Please try again.";
            msgEl.className = "exercise-drawer-msg error";
        }
    } finally {
        btn.disabled = false;
        btn.textContent = "submit_solution()";
    }
}

function escapeLessonHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* ==========================================================
   LESSON QUALITY COMPONENTS: REVIEW CREDIT + SELF-CHECK QUIZZES
   ========================================================== */

// Default reviewer credit. A lecture can override it with data-reviewer="Name".
const CT_DEFAULT_REVIEWER = 'Code Tutorium Editorial';

/**
 * Shows "Last reviewed <date>" and "Reviewed by <name>" under the lecture title.
 * Only lectures that carry data-reviewed="YYYY-MM-DD" get a badge, so the site
 * never claims a review that did not happen.
 */
function initLessonReviewMeta() {
    document.querySelectorAll('.lecture[data-reviewed]').forEach(lecture => {
        if (lecture.querySelector('.lecture-review')) return;
        const raw = lecture.getAttribute('data-reviewed');
        const date = new Date(raw + 'T00:00:00');
        if (isNaN(date.getTime())) return;

        const reviewer = lecture.getAttribute('data-reviewer') || CT_DEFAULT_REVIEWER;
        const pretty = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        const wrap = document.createElement('div');
        wrap.className = 'lecture-review';
        wrap.innerHTML =
            '<span class="meta-badge review-badge" title="This lecture was checked for accuracy on this date">' +
                '✔ Last reviewed ' + escapeLessonHtml(pretty) + '</span>' +
            '<span class="meta-badge">Reviewed by ' + escapeLessonHtml(reviewer) + '</span>';

        const h1 = lecture.querySelector('h1');
        if (h1) h1.insertAdjacentElement('afterend', wrap);
        else lecture.insertBefore(wrap, lecture.firstChild);
    });
}

/**
 * Turns authored quiz markup into an interactive quiz.
 *
 * <div class="quiz-block" data-quiz="unique-id">
 *   <div class="quiz-q" data-answer="1">          <!-- zero-based index of the correct option -->
 *     <p class="quiz-prompt">Question text</p>
 *     <ol class="quiz-options"><li>A</li><li>B</li><li>C</li></ol>
 *     <p class="quiz-explain">Why B is right.</p>
 *   </div>
 * </div>
 */
function initQuizzes() {
    document.querySelectorAll('.quiz-block').forEach(block => {
        if (block.classList.contains('quiz-ready')) return;
        block.classList.add('quiz-ready');

        const questions = Array.from(block.querySelectorAll('.quiz-q'));
        if (!questions.length) return;

        const storeKey = 'quiz_' + window.location.pathname + '_' + (block.getAttribute('data-quiz') || 'q');
        let answered = 0;
        let correct = 0;

        const heading = block.querySelector('.quiz-heading');
        if (!heading) {
            const h = document.createElement('div');
            h.className = 'quiz-heading';
            h.textContent = '🧠 Quick Check';
            block.insertBefore(h, block.firstChild);
        }

        const scoreEl = document.createElement('div');
        scoreEl.className = 'quiz-score';
        block.appendChild(scoreEl);

        let best = null;
        try { best = JSON.parse(localStorage.getItem(storeKey) || 'null'); } catch (e) {}
        const renderScore = (finalScore) => {
            if (finalScore) {
                scoreEl.innerHTML = '<strong>Score: ' + correct + ' / ' + questions.length + '</strong>' +
                    (correct === questions.length ? ' &mdash; perfect! 🎉' : ' &mdash; review the explanations above and try again.');
                scoreEl.classList.add('done');
            } else if (best && typeof best.score === 'number') {
                scoreEl.textContent = 'Your best: ' + best.score + ' / ' + best.total;
            }
        };
        renderScore(false);

        questions.forEach((q, qi) => {
            const list = q.querySelector('.quiz-options');
            if (!list) return;
            const answer = parseInt(q.getAttribute('data-answer'), 10);
            const options = Array.from(list.children);
            const group = document.createElement('div');
            group.className = 'quiz-choices';
            group.setAttribute('role', 'group');

            const numbering = document.createElement('span');
            numbering.className = 'quiz-num';
            numbering.textContent = 'Q' + (qi + 1);
            const prompt = q.querySelector('.quiz-prompt');
            if (prompt) prompt.insertBefore(numbering, prompt.firstChild);

            options.forEach((opt, oi) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'quiz-choice';
                btn.innerHTML = opt.innerHTML;
                btn.addEventListener('click', () => {
                    if (q.classList.contains('answered')) return;
                    q.classList.add('answered');
                    answered++;
                    const isRight = oi === answer;
                    if (isRight) correct++;
                    btn.classList.add(isRight ? 'right' : 'wrong');
                    const rightBtn = group.children[answer];
                    if (rightBtn) rightBtn.classList.add('right', 'reveal');
                    group.querySelectorAll('.quiz-choice').forEach(b => { b.disabled = true; });
                    q.classList.add(isRight ? 'is-correct' : 'is-wrong');

                    if (answered === questions.length) {
                        renderScore(true);
                        try {
                            if (!best || correct >= best.score) {
                                best = { score: correct, total: questions.length };
                                localStorage.setItem(storeKey, JSON.stringify(best));
                            }
                        } catch (e) {}
                    }
                });
                group.appendChild(btn);
            });

            list.replaceWith(group);
        });
    });
}



