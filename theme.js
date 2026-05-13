/**
 * Code Tutorium — Theme Toggle
 * Applies saved theme immediately (prevents flash) and injects toggle button.
 */

// ── Apply immediately before first paint ──────────────────────────────────
(function () {
  var t = localStorage.getItem('ct-theme');
  if (t) document.documentElement.setAttribute('data-theme', t);
})();

// ── Button injection & toggle logic ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('theme-toggle')) return;

  var btn = document.createElement('button');
  btn.id        = 'theme-toggle';
  btn.className = 'theme-toggle-btn';
  btn.setAttribute('aria-label', 'Toggle dark / light mode');
  btn.setAttribute('title', 'Toggle theme');
  _setThemeIcon(btn);
  btn.addEventListener('click', _toggleTheme);

  // Fixed floating button — bottom-right corner
  document.body.appendChild(btn);
});

function _toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme') || 'dark';
  var next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('ct-theme', next);
  var btn = document.getElementById('theme-toggle');
  if (btn) _setThemeIcon(btn);
}

function _setThemeIcon(btn) {
  var isDark = (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark';
  // Sun = currently dark, click for light
  // Moon = currently light, click for dark
  btn.innerHTML = isDark
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}
