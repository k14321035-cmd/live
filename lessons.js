/**
 * Code Tutorium - Shared Lessons JavaScript
 * Handles lecture navigation, mobile menu, and playground functionality
 */

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
    if (navItems[index]) {
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
    // Only handle if not in an input/textarea
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

// Create and inject back-to-top button
document.addEventListener('DOMContentLoaded', function() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    backToTopBtn.setAttribute('title', 'Back to top');
    document.body.appendChild(backToTopBtn);
    
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

