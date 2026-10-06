/**
 * Code Tutorium — blog-enhancements.js
 * Loaded on every blog POST page (not the index).
 * Provides:
 *  1. Reading progress bar
 *  2. Auto-wire sidebar ToC links to h2 anchors
 *  3. Active ToC link on scroll
 *  4. Social share buttons
 *  5. Newsletter sign-up bar
 *  6. Emoji reaction bar (localStorage-backed)
 */

(function () {
  'use strict';

  /* ── 1. READING PROGRESS BAR ─────────────────────────────────── */
  function initProgressBar() {
    const bar = document.createElement('div');
    bar.id = 'read-progress';
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop;
      const total = doc.scrollHeight - doc.clientHeight;
      bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
    }, { passive: true });
  }

  /* ── 2. AUTO-ANCHOR h2s & WIRE TOC ──────────────────────────── */
  function initToc() {
    const postBody = document.querySelector('.post-body');
    const tocLinks = document.querySelectorAll('.toc-link');
    if (!postBody || !tocLinks.length) return;

    // Assign id to every h2 inside .post-body
    const headings = postBody.querySelectorAll('h2');
    headings.forEach((h, i) => {
      if (!h.id) {
        h.id = 'section-' + i;
      }
    });

    // Wire each toc-link href to matching heading by index
    tocLinks.forEach((link, i) => {
      const target = headings[i];
      if (target) {
        link.setAttribute('href', '#' + target.id);
        link.addEventListener('click', (e) => {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    });

    // Active ToC highlight on scroll (IntersectionObserver)
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const id = entry.target.id;
              tocLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + id) {
                  link.classList.add('active');
                }
              });
            }
          });
        },
        { rootMargin: '-10% 0px -70% 0px' }
      );
      headings.forEach(h => observer.observe(h));
    }
  }

  /* ── 3. SOCIAL SHARE BUTTONS ─────────────────────────────────── */
  function initShare() {
    const article = document.querySelector('article');
    if (!article) return;

    const url   = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);

    const shareBlock = document.createElement('div');
    shareBlock.className = 'share-bar';
    shareBlock.innerHTML = `
      <span class="share-label">Share this article</span>
      <div class="share-btns">
        <a class="share-btn share-twitter"
           href="https://twitter.com/intent/tweet?text=${title}&url=${url}"
           target="_blank" rel="noopener" aria-label="Share on Twitter">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          Twitter
        </a>
        <a class="share-btn share-linkedin"
           href="https://www.linkedin.com/sharing/share-offsite/?url=${url}"
           target="_blank" rel="noopener" aria-label="Share on LinkedIn">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          LinkedIn
        </a>
        <button class="share-btn share-copy" id="copy-link-btn" aria-label="Copy link">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span id="copy-label">Copy Link</span>
        </button>
      </div>
    `;

    // Insert before related articles or at end of article
    const related = article.querySelector('.related');
    if (related) {
      article.insertBefore(shareBlock, related);
    } else {
      article.appendChild(shareBlock);
    }

    // Copy link handler
    document.getElementById('copy-link-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const label = document.getElementById('copy-label');
        label.textContent = 'Copied!';
        setTimeout(() => { label.textContent = 'Copy Link'; }, 2500);
      });
    });
  }

  /* ── 4. EMOJI REACTION BAR ───────────────────────────────────── */
  function initReactions() {
    const article = document.querySelector('article');
    if (!article) return;

    const key = 'ct-reactions-' + window.location.pathname;
    const stored = JSON.parse(localStorage.getItem(key) || '{}');
    const reactions = [
      { emoji: '🔥', label: 'Fire', id: 'fire' },
      { emoji: '👍', label: 'Helpful', id: 'helpful' },
      { emoji: '🤯', label: 'Mind-blown', id: 'mind' },
      { emoji: '🙏', label: 'Thanks', id: 'thanks' },
    ];

    const reactionBar = document.createElement('div');
    reactionBar.className = 'reaction-bar';
    reactionBar.innerHTML = `
      <span class="reaction-label">Was this helpful?</span>
      <div class="reaction-btns">
        ${reactions.map(r => `
          <button class="reaction-btn ${stored.picked === r.id ? 'picked' : ''}"
                  data-id="${r.id}"
                  aria-label="${r.label}">
            <span class="reaction-emoji">${r.emoji}</span>
            <span class="reaction-count">${stored[r.id] || 0}</span>
          </button>
        `).join('')}
      </div>
    `;

    // Insert after share bar or before related
    const sharebar = article.querySelector('.share-bar');
    const related  = article.querySelector('.related');
    if (sharebar) {
      sharebar.after(reactionBar);
    } else if (related) {
      article.insertBefore(reactionBar, related);
    } else {
      article.appendChild(reactionBar);
    }

    reactionBar.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const prev = stored.picked;

        // Undo previous pick
        if (prev && prev !== id) {
          stored[prev] = Math.max(0, (stored[prev] || 1) - 1);
          reactionBar.querySelector(`[data-id="${prev}"] .reaction-count`).textContent = stored[prev];
          reactionBar.querySelector(`[data-id="${prev}"]`).classList.remove('picked');
        }

        if (stored.picked === id) {
          // Toggle off
          stored[id] = Math.max(0, (stored[id] || 1) - 1);
          delete stored.picked;
          btn.classList.remove('picked');
        } else {
          // Pick
          stored[id] = (stored[id] || 0) + 1;
          stored.picked = id;
          btn.classList.add('picked');
        }

        btn.querySelector('.reaction-count').textContent = stored[id] || 0;
        localStorage.setItem(key, JSON.stringify(stored));
      });
    });
  }

  /* ── 5. NEWSLETTER BAR ───────────────────────────────────────── */
  function initNewsletter() {
    const footer = document.querySelector('#footer-grid');
    if (!footer) return;
    // Don't add if already exists
    if (document.querySelector('.newsletter-bar')) return;

    const bar = document.createElement('div');
    bar.className = 'newsletter-bar';
    bar.innerHTML = `
      <div class="newsletter-inner">
        <div class="newsletter-text">
          <div class="newsletter-heading">📬 Get new articles by email</div>
          <p>One email per week. No spam. Unsubscribe any time.</p>
        </div>
        <form class="newsletter-form" id="newsletter-form" action="https://formspree.io/f/xovqwgkd" method="POST">
          <input type="email" name="email" class="newsletter-input" placeholder="your@email.com" required aria-label="Email address">
          <button type="submit" class="newsletter-btn">Subscribe →</button>
        </form>
      </div>
    `;

    footer.before(bar);

    document.getElementById('newsletter-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = this.querySelector('.newsletter-btn');
      btn.textContent = '✓ Subscribed!';
      btn.style.background = '#22c55e';
      btn.disabled = true;
    });
  }

    /* ── 6. NEXT / PREVIOUS POST NAVIGATION ─────────────────────── */
  const BLOG_POSTS = [{"href":"C%20vs%20C%2B%2B.html","title":"Difference between C and C++"},{"href":"diff.html","title":"Difference Between const, let and var in JavaScript"},{"href":"Java%20vs%20C%2B%2B.html","title":"Difference Between Java and C++"},{"href":"List%20vs%20Tuple%20in%20python.html","title":"Difference Between List and Tuple"},{"href":"paired%20vs%20unpaired%20tags%20in%20HTML.html","title":"Difference Between Paired and Unpaired Tags"},{"href":"Structure%20VS%20Union%20in%20C.html","title":"Difference between Structure and Union in C"},{"href":"Features%20of%20C%2B%2B.html","title":"Features of C++ Language"},{"href":"Features%20of%20Java.html","title":"Features of Java"},{"href":"Flexbox%20vs%20Grid%20in%20CSS.html","title":"Flexbox vs CSS Grid — When Should You Use Each?"},{"href":"How%20do%20you%20handle%20Exceptions%20in%20Visual%20Basic.html","title":"How do you handle Exceptions in Visual Basic?"},{"href":"how%20do%20you%20plot%20a%20graphs%20in%20MATLAB.html","title":"How do you plot graphs in MATLAB?"},{"href":"Local%20Storage%20vs%20Session%20Storage%20in%20JS.html","title":"Local Storage vs Session Storage"},{"href":"Primary%20Vs%20Foreign%20Key%20in%20SQL.html","title":"Primary Key vs Foreign Key in SQL"},{"href":"Stack%20vs%20Heap%20Memory%20in%20C.html","title":"Stack vs Heap Memory in C"},{"href":"Structure%20of%20C%2B%2B.html","title":"Structure of a C++ Program"},{"href":"structure%20of%20Java%20program.html","title":"Structure of a Java Program"},{"href":"best.html","title":"Top 20 Most Popular Websites in the World"},{"href":"prb.html","title":"Top 20 Programming Languages With \"Hello, Code Tutorium\" Syntax"},{"href":"Arrays%20in%20C.html","title":"What are Arrays in C?"},{"href":"Classes%20and%20Objects%20in%20C%2B%2B.html","title":"What are Classes and Objects in C++?"},{"href":"Events%20in%20JS.html","title":"What are Events in JavaScript?"},{"href":"what%20are%20functions%20in%20JS.html","title":"What are Functions in JavaScript?"},{"href":"forms%20in%20html.html","title":"What are HTML Forms?"},{"href":"what%20is%20list%20in%20HTML.html","title":"What are Lists in HTML?"},{"href":"what%20are%20meta%20tags%20in%20HTML.html","title":"What are Meta Tags in HTML?"},{"href":"Pointers%20in%20C.html","title":"What are Pointers in C?"},{"href":"pseudo%20classes%20and%20pseudo%20elements%20in%20HTML.html","title":"What are Pseudo-classes and Pseudo-elements?"},{"href":"semantic%20tag%20in%20HTML.html","title":"What are Semantic Tags in HTML?"},{"href":"Symbols%20in%20Ruby.html","title":"What are Symbols in Ruby?"},{"href":"Traits%20in%20PHP.html","title":"What are Traits in PHP?"},{"href":"Vectors%20in%20R.html","title":"What are Vectors in R?"},{"href":"what%20are%20tables%20in%20HTML.html","title":"What is a Table?"},{"href":"what%20is%20Bash.html","title":"What is Bash?"},{"href":"what-is-css.html","title":"What is CSS?"},{"href":"what%20is%20Dart%20and%20where%20it%20is%20used.html","title":"What is Dart and where is it used?"},{"href":"Dynamic%20Memory%20Allocation%20in%20C.html","title":"What is Dynamic Memory Allocation in C?"},{"href":"why-hacking.html","title":"What is Ethical Hacking?"},{"href":"Event%20Bubbling%20in%20JS.html","title":"What is Event Bubbling in JavaScript?"},{"href":"what%20is%20Go%20language.html","title":"What is Go (Golang)?"},{"href":"what-is-html.html","title":"What is HTML?"},{"href":"what%20is%20Java.html","title":"What is Java?"},{"href":"what%20is%20JavaScript.html","title":"What is JavaScript?"},{"href":"Null%20safety%20features%20in%20Kotlin.html","title":"What is Null Safety in Kotlin?"},{"href":"Optional%20in%20Swift.html","title":"What is Optional in Swift?"},{"href":"Ownership%20in%20Rust.html","title":"What is Ownership in Rust?"},{"href":"what%20is%20penetration%20testing%20in%20Ethical%20Hacking.html","title":"What is Penetration Testing in Ethical Hacking?"},{"href":"position%20in%20CSS.html","title":"What is Position in CSS?"},{"href":"Responsive%20Web%20Design%20in%20CSS.html","title":"What is Responsive Web Design?"},{"href":"what%20is%20Shell%20Script.html","title":"What is Shell Script?"},{"href":"CSS%20Box%20Model.html","title":"What is the CSS Box Model?"},{"href":"div-vs-section%20tag%20in%20CSS.html","title":"What is the difference between \u0026lt;div\u0026gt; and \u0026lt;section\u0026gt;?"},{"href":"sec.html","title":"What is the difference between \u0026lt;div\u0026gt; and \u0026lt;section\u0026gt;?"},{"href":"id-vs-classes%20in%20CSS.html","title":"What is the difference between ID and Class in HTML?"},{"href":"inline%20vs%20block%20elements%20in%20HTML.html","title":"What is the Difference Between Inline and Block Elements?"},{"href":"DOM%20in%20HTML.html","title":"What is the DOM (Document Object Model)?"},{"href":"why-we-need-c.html","title":"Why Do We Study C Language?"},{"href":"why%20do%20we%20study%20c%2B%2B.html","title":"Why do we study C++?"},{"href":"why-use-python.html","title":"Why Do We Use Python?"},{"href":"why%20is%20java%20so%20popular.html","title":"Why is Java So Popular?"},{"href":"why%20use%20TypeScript%20instead%20of%20JS.html","title":"Why Use TypeScript Instead of JavaScript?"},{"href":"why-use-python.html","title":"What is Python and why do we use it?"},{"href":"why-hacking.html","title":"What is Ethical Hacking?"},{"href":"diff.html","title":"What is the difference between let, const and var in JavaScript?"},{"href":"sec.html","title":"What is the difference between \u0026lt;div\u0026gt; and \u0026lt;section\u0026gt; in HTML?"},{"href":"best.html","title":"Best top 20 websites in 2026"},{"href":"C vs C++.html","title":"C vs C++"},{"href":"Classes and Objects in C++.html","title":"Classes and Objects in C++"}];

  function initPostNav() {
    const article = document.querySelector('article');
    if (!article || document.querySelector('.post-nav-bar')) return;

    const rawPath = window.location.pathname.split('/').pop() || '';
    const currentFile = decodeURIComponent(rawPath).toLowerCase();
    if (!currentFile) return;

    let currentIndex = BLOG_POSTS.findIndex(p => {
      const hrefDecoded = decodeURIComponent(p.href).toLowerCase();
      return currentFile === hrefDecoded || currentFile === hrefDecoded.replace('.html', '');
    });

    if (currentIndex === -1) currentIndex = 0;

    const prevIndex = (currentIndex - 1 + BLOG_POSTS.length) % BLOG_POSTS.length;
    const nextIndex = (currentIndex + 1) % BLOG_POSTS.length;
    const prevPost = BLOG_POSTS[prevIndex];
    const nextPost = BLOG_POSTS[nextIndex];

    const nav = document.createElement('nav');
    nav.className = 'post-nav-bar';
    nav.setAttribute('aria-label', 'Previous and Next Articles');
    nav.innerHTML = 
      <a href="" class="post-nav-card post-nav-prev">
        <span class="post-nav-label">← Previous Article</span>
        <span class="post-nav-title"></span>
      </a>
      <a href="" class="post-nav-card post-nav-next">
        <span class="post-nav-label">Next Article →</span>
        <span class="post-nav-title"></span>
      </a>
    ;

    const shareBar = article.querySelector('.share-bar');
    if (shareBar) {
      article.insertBefore(nav, shareBar);
    } else {
      const related = article.querySelector('.related');
      if (related) {
        article.insertBefore(nav, related);
      } else {
        article.appendChild(nav);
      }
    }
  }

  /* ── INIT ALL ────────────────────────────────────────────────── */
  function init() {
    // Only run on post pages (not the blog index)
    const isPost = document.querySelector('.post-body') !== null;
    if (!isPost) return;

    initProgressBar();
    initToc();
    initShare();
    initReactions();
    initNewsletter();
    initPostNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
