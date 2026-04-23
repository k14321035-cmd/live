// ============================================================
// Code Tutorium — Client-Side Search Engine
// ============================================================

const searchIndex = [
  // ─── HOME PAGE ───────────────────────────────────────────
  { title: 'All Courses', desc: 'Browse all programming courses: Python, C++, HTML, CSS, Java, JavaScript, C.', url: 'index.html#courses', icon: '🎓', tag: 'Home' },
  { title: 'How It Works', desc: 'Learn how Code Tutorium works: choose course, follow curriculum, build project, earn certificate.', url: 'index.html#how', icon: '⚙️', tag: 'Home' },
  { title: 'Get Started', desc: 'Start your free coding journey at Code Tutorium today.', url: 'index.html#courses', icon: '🚀', tag: 'Home' },

  // ─── PYTHON ──────────────────────────────────────────────
  { title: 'Python — Introduction & Setup', desc: 'What is Python, installing Python, setting up VSCode, writing your first program, REPL.', url: 'lessons/python.html', icon: '🐍', tag: 'Python' },
  { title: 'Python — Variables & Data Types', desc: 'Variables, integers, floats, strings, booleans, None, type(), dynamic typing.', url: 'lessons/python.html', icon: '🐍', tag: 'Python' },
  { title: 'Python — Operators & Expressions', desc: 'Arithmetic operators, comparison operators, logical operators, assignment, floor division, modulo, f-strings.', url: 'lessons/python.html', icon: '🐍', tag: 'Python' },
  { title: 'Python — Control Flow', desc: 'if, elif, else, conditional statements, truthy values, ternary expression.', url: 'lessons/python.html', icon: '🐍', tag: 'Python' },
  { title: 'Python — Loops', desc: 'for loops, while loops, range(), break, continue, enumerate, zip, nested loops.', url: 'lessons/python.html', icon: '🐍', tag: 'Python' },
  { title: 'Python — Functions', desc: 'def, return, parameters, default arguments, *args, **kwargs, lambda, scope, recursion.', url: 'lessons/python.html', icon: '🐍', tag: 'Python' },
  { title: 'Python — Data Structures', desc: 'lists, tuples, sets, dictionaries, list comprehensions, dict comprehensions, mutability.', url: 'lessons/python.html', icon: '🐍', tag: 'Python' },
  { title: 'Python — Strings In Depth', desc: 'String methods, slicing, split, join, strip, replace, format, f-strings, multiline strings.', url: 'lessons/python.html', icon: '🐍', tag: 'Python' },
  { title: 'Python — Object-Oriented Programming', desc: 'Classes, objects, __init__, self, inheritance, super(), encapsulation, polymorphism, dunder methods.', url: 'lessons/python.html', icon: '🐍', tag: 'Python' },
  { title: 'Python — File I/O & Exceptions', desc: 'Reading files, writing files, open(), with statement, try/except/finally, raising exceptions, custom errors.', url: 'lessons/python.html', icon: '🐍', tag: 'Python' },
  { title: 'Python — Modules & Libraries', desc: 'import, from import, os, math, datetime, random, json, pip, virtual environments, NumPy, Pandas intro.', url: 'lessons/python.html', icon: '🐍', tag: 'Python' },
  { title: 'Python — Capstone Project', desc: 'Build a CLI task manager app using all Python concepts learned.', url: 'lessons/python.html', icon: '🐍', tag: 'Python' },

  // ─── C++ ─────────────────────────────────────────────────
  { title: 'C++ — Syntax & I/O', desc: 'C++ history, Hello World, cout, cin, #include, namespaces, header files, compilation.', url: 'lessons/c++.html', icon: '⚙️', tag: 'C++' },
  { title: 'C++ — Variables & Data Types', desc: 'int, float, double, char, bool, long, unsigned, const, auto, type casting.', url: 'lessons/c++.html', icon: '⚙️', tag: 'C++' },
  { title: 'C++ — Control Structures', desc: 'if-else, switch, for loop, while, do-while, break, continue, goto.', url: 'lessons/c++.html', icon: '⚙️', tag: 'C++' },
  { title: 'C++ — Functions', desc: 'Function declaration, overloading, default parameters, inline, pass by value, pass by reference.', url: 'lessons/c++.html', icon: '⚙️', tag: 'C++' },
  { title: 'C++ — Arrays, Strings & References', desc: 'Arrays, multi-dimensional arrays, C-strings, std::string, references, string methods.', url: 'lessons/c++.html', icon: '⚙️', tag: 'C++' },
  { title: 'C++ — Pointers & Memory', desc: 'Pointers, pointer arithmetic, new, delete, null pointer, references vs pointers, memory leaks.', url: 'lessons/c++.html', icon: '⚙️', tag: 'C++' },
  { title: 'C++ — Object-Oriented Programming', desc: 'Classes, objects, constructors, destructors, this pointer, access specifiers, encapsulation.', url: 'lessons/c++.html', icon: '⚙️', tag: 'C++' },
  { title: 'C++ — Inheritance & Polymorphism', desc: 'Inheritance, virtual functions, override, abstract classes, interfaces, multiple inheritance.', url: 'lessons/c++.html', icon: '⚙️', tag: 'C++' },
  { title: 'C++ — Templates & Generic Programming', desc: 'Function templates, class templates, template specialization, STL algorithms.', url: 'lessons/c++.html', icon: '⚙️', tag: 'C++' },
  { title: 'C++ — STL: Containers', desc: 'vector, list, deque, map, unordered_map, set, queue, stack, pair, iterators.', url: 'lessons/c++.html', icon: '⚙️', tag: 'C++' },
  { title: 'C++ — File Handling', desc: 'fstream, ifstream, ofstream, reading/writing files, binary files, error handling with exceptions.', url: 'lessons/c++.html', icon: '⚙️', tag: 'C++' },
  { title: 'C++ — Capstone Project', desc: 'Build a student record system using OOP, files, and STL.', url: 'lessons/c++.html', icon: '⚙️', tag: 'C++' },

  // ─── HTML ─────────────────────────────────────────────────
  { title: 'HTML — Introduction', desc: 'What is HTML, how browsers work, HTML5, document structure, DOCTYPE, html element.', url: 'lessons/html.html', icon: '🌐', tag: 'HTML' },
  { title: 'HTML — Basic Tags', desc: 'Headings h1-h6, paragraphs, line breaks, horizontal rule, bold, italic, comments.', url: 'lessons/html.html', icon: '🌐', tag: 'HTML' },
  { title: 'HTML — Links & Images', desc: 'Anchor tags, href, target blank, image tag, src, alt, relative vs absolute paths, image sizes.', url: 'lessons/html.html', icon: '🌐', tag: 'HTML' },
  { title: 'HTML — Lists & Tables', desc: 'Ordered lists, unordered lists, definition lists, table, tr, td, th, colspan, rowspan.', url: 'lessons/html.html', icon: '🌐', tag: 'HTML' },
  { title: 'HTML — Semantic Elements', desc: 'header, nav, main, section, article, aside, footer, figure, figcaption, time, mark.', url: 'lessons/html.html', icon: '🌐', tag: 'HTML' },
  { title: 'HTML — Forms & Input', desc: 'form, input types, textarea, select, checkbox, radio, button, label, placeholder, required, action, method.', url: 'lessons/html.html', icon: '🌐', tag: 'HTML' },
  { title: 'HTML — Accessibility & ARIA', desc: 'Alt text, ARIA roles, aria-label, tabindex, keyboard navigation, screen readers, WCAG.', url: 'lessons/html.html', icon: '🌐', tag: 'HTML' },
  { title: 'HTML — SEO & Meta Tags', desc: 'meta description, keywords, Open Graph, Twitter Card, canonical, robots, sitemap.', url: 'lessons/html.html', icon: '🌐', tag: 'HTML' },
  { title: 'HTML — Media & Embed', desc: 'video, audio, iframe, embed, source, controls, autoplay, responsive images, srcset.', url: 'lessons/html.html', icon: '🌐', tag: 'HTML' },
  { title: 'HTML — Capstone Project', desc: 'Build a personal portfolio page using semantic HTML5.', url: 'lessons/html.html', icon: '🌐', tag: 'HTML' },

  // ─── CSS ─────────────────────────────────────────────────
  { title: 'CSS — Selectors & Specificity', desc: 'CSS syntax, element selector, class, id, pseudo-class, pseudo-element, combinators, specificity, cascade.', url: 'lessons/css.html', icon: '🎨', tag: 'CSS' },
  { title: 'CSS — Box Model', desc: 'margin, padding, border, content, box-sizing, outline, width, height, overflow.', url: 'lessons/css.html', icon: '🎨', tag: 'CSS' },
  { title: 'CSS — Colors & Backgrounds', desc: 'color, background-color, rgba, hsl, gradients, background-image, background-size, opacity.', url: 'lessons/css.html', icon: '🎨', tag: 'CSS' },
  { title: 'CSS — Typography', desc: 'font-family, font-size, font-weight, line-height, letter-spacing, text-align, Google Fonts, web fonts.', url: 'lessons/css.html', icon: '🎨', tag: 'CSS' },
  { title: 'CSS — Display & Position', desc: 'display block, inline, inline-block, none, position static, relative, absolute, fixed, sticky, z-index.', url: 'lessons/css.html', icon: '🎨', tag: 'CSS' },
  { title: 'CSS — Flexbox', desc: 'flex container, flex items, justify-content, align-items, flex-direction, flex-wrap, gap, order.', url: 'lessons/css.html', icon: '🎨', tag: 'CSS' },
  { title: 'CSS — Grid', desc: 'grid-template-columns, grid-template-rows, grid-area, grid-gap, auto-fill, auto-fit, fr unit, named areas.', url: 'lessons/css.html', icon: '🎨', tag: 'CSS' },
  { title: 'CSS — Responsive Design', desc: 'media queries, breakpoints, mobile-first, viewport units, vw, vh, clamp(), min(), max().', url: 'lessons/css.html', icon: '🎨', tag: 'CSS' },
  { title: 'CSS — Variables & Custom Properties', desc: 'CSS variables, :root, var(), custom properties, theming, dark mode.', url: 'lessons/css.html', icon: '🎨', tag: 'CSS' },
  { title: 'CSS — Transitions & Animations', desc: 'transition, animation, @keyframes, transform, translate, rotate, scale, cubic-bezier, animation-delay.', url: 'lessons/css.html', icon: '🎨', tag: 'CSS' },
  { title: 'CSS — Capstone Project', desc: 'Build a fully responsive landing page with animations and modern CSS techniques.', url: 'lessons/css.html', icon: '🎨', tag: 'CSS' },

  // ─── JAVA ─────────────────────────────────────────────────
  { title: 'Java — Syntax & JVM', desc: 'Java history, JVM, JDK, JRE, Hello World, main method, compilation, bytecode.', url: 'lessons/java.html', icon: '☕', tag: 'Java' },
  { title: 'Java — Variables & Data Types', desc: 'Primitive types: int, double, char, boolean, byte, short, long, float. Wrapper classes. String.', url: 'lessons/java.html', icon: '☕', tag: 'Java' },
  { title: 'Java — Control Flow & Methods', desc: 'if-else, switch, for, while, do-while, break, continue. Methods, return types, parameters, overloading.', url: 'lessons/java.html', icon: '☕', tag: 'Java' },
  { title: 'Java — Object-Oriented Programming', desc: 'Classes, objects, constructors, this, access modifiers, encapsulation, getters, setters, static.', url: 'lessons/java.html', icon: '☕', tag: 'Java' },
  { title: 'Java — Inheritance & Interfaces', desc: 'extends, super, method overriding, abstract classes, interfaces, implements, polymorphism.', url: 'lessons/java.html', icon: '☕', tag: 'Java' },
  { title: 'Java — Collections Framework', desc: 'ArrayList, LinkedList, HashMap, HashSet, TreeMap, Iterator, generics, List, Map, Set interfaces.', url: 'lessons/java.html', icon: '☕', tag: 'Java' },
  { title: 'Java — Exception Handling', desc: 'try-catch-finally, throws, throw, checked vs unchecked exceptions, custom exception classes.', url: 'lessons/java.html', icon: '☕', tag: 'Java' },
  { title: 'Java — File I/O', desc: 'File class, FileReader, FileWriter, BufferedReader, BufferedWriter, Scanner, Java NIO, Paths.', url: 'lessons/java.html', icon: '☕', tag: 'Java' },
  { title: 'Java — Multithreading', desc: 'Thread class, Runnable, synchronized, wait, notify, ExecutorService, concurrency, deadlock.', url: 'lessons/java.html', icon: '☕', tag: 'Java' },
  { title: 'Java — Capstone Project', desc: 'Build a banking console app with OOP, collections, and file persistence.', url: 'lessons/java.html', icon: '☕', tag: 'Java' },

  // ─── JAVASCRIPT ───────────────────────────────────────────
  { title: 'JavaScript — Basics & Variables', desc: 'var, let, const, data types, typeof, undefined, null, template literals, ES6+.', url: 'lessons/javascript.html', icon: '✨', tag: 'JavaScript' },
  { title: 'JavaScript — Functions & Scope', desc: 'Function declaration, expression, arrow functions, hoisting, closures, IIFE, scope chain.', url: 'lessons/javascript.html', icon: '✨', tag: 'JavaScript' },
  { title: 'JavaScript — Arrays & Objects', desc: 'Array methods: map, filter, reduce, forEach, find, splice, spread, destructuring, objects, JSON.', url: 'lessons/javascript.html', icon: '✨', tag: 'JavaScript' },
  { title: 'JavaScript — DOM Manipulation', desc: 'getElementById, querySelector, innerHTML, textContent, classList, createElement, appendChild, events.', url: 'lessons/javascript.html', icon: '✨', tag: 'JavaScript' },
  { title: 'JavaScript — Events', desc: 'addEventListener, click, keydown, submit, event object, event delegation, preventDefault, stopPropagation.', url: 'lessons/javascript.html', icon: '✨', tag: 'JavaScript' },
  { title: 'JavaScript — Async JS', desc: 'callbacks, setTimeout, Promises, then/catch, async/await, event loop, microtasks, fetch API.', url: 'lessons/javascript.html', icon: '✨', tag: 'JavaScript' },
  { title: 'JavaScript — Fetch API & REST', desc: 'fetch(), HTTP methods, GET, POST, JSON, headers, async/await with fetch, error handling, CORS.', url: 'lessons/javascript.html', icon: '✨', tag: 'JavaScript' },
  { title: 'JavaScript — Error Handling', desc: 'try-catch, Error object, custom errors, console methods, debugging, browser DevTools.', url: 'lessons/javascript.html', icon: '✨', tag: 'JavaScript' },
  { title: 'JavaScript — Modules', desc: 'ES Modules, import, export, default export, named export, module bundlers, npm.', url: 'lessons/javascript.html', icon: '✨', tag: 'JavaScript' },
  { title: 'JavaScript — Node.js & npm', desc: 'Node.js intro, npm, package.json, require, CommonJS, creating a server, Express basics.', url: 'lessons/javascript.html', icon: '✨', tag: 'JavaScript' },
  { title: 'JavaScript — Capstone Project', desc: 'Build a weather dashboard app using fetch API and DOM manipulation.', url: 'lessons/javascript.html', icon: '✨', tag: 'JavaScript' },

  // ─── C LANGUAGE ───────────────────────────────────────────
  { title: 'C — Introduction', desc: 'C history, Dennis Ritchie, Bell Labs, GCC compiler, Hello World, #include, stdio.h, compilation steps.', url: 'lessons/c.html', icon: '🧭', tag: 'C' },
  { title: 'C — Variables & Data Types', desc: 'int, float, double, char, long, short, unsigned, signed, sizeof, constants, #define.', url: 'lessons/c.html', icon: '🧭', tag: 'C' },
  { title: 'C — Operators & Expressions', desc: 'Arithmetic, relational, logical, bitwise operators, increment, decrement, ternary, type casting.', url: 'lessons/c.html', icon: '🧭', tag: 'C' },
  { title: 'C — Control Flow', desc: 'if-else, switch-case, for loop, while, do-while, break, continue, goto.', url: 'lessons/c.html', icon: '🧭', tag: 'C' },
  { title: 'C — Functions', desc: 'Function definition, declaration, return, parameters, pass by value, recursion, scope, local vs global.', url: 'lessons/c.html', icon: '🧭', tag: 'C' },
  { title: 'C — Arrays & Strings', desc: 'Arrays, multi-dimensional arrays, strings, strlen, strcpy, strcat, strcmp, gets, puts.', url: 'lessons/c.html', icon: '🧭', tag: 'C' },
  { title: 'C — Pointers', desc: 'Pointer declaration, dereferencing, pointer arithmetic, pointers and arrays, NULL pointer, void pointer.', url: 'lessons/c.html', icon: '🧭', tag: 'C' },
  { title: 'C — Structures & Unions', desc: 'struct, typedef, accessing members, pointers to structs, union, nested structures, arrays of structs.', url: 'lessons/c.html', icon: '🧭', tag: 'C' },
  { title: 'C — File I/O', desc: 'fopen, fclose, fread, fwrite, fprintf, fscanf, fgets, fputs, fseek, ftell, binary files, file modes.', url: 'lessons/c.html', icon: '🧭', tag: 'C' },
  { title: 'C — Dynamic Memory', desc: 'malloc, calloc, realloc, free, heap vs stack, memory leaks, dangling pointers.', url: 'lessons/c.html', icon: '🧭', tag: 'C' },
  { title: 'C — Preprocessor & Macros', desc: '#define, #include, #ifdef, #ifndef, #endif, macro functions, conditional compilation, header guards.', url: 'lessons/c.html', icon: '🧭', tag: 'C' },
  { title: 'C — Capstone Project', desc: 'Build a complete C console application using all concepts: structs, files, dynamic memory.', url: 'lessons/c.html', icon: '🧭', tag: 'C' },
];

// ─── Tag colour map ───────────────────────────────────────
const tagColors = {
  Python:     { bg: 'rgba(255,212,59,0.12)',  border: 'rgba(255,212,59,0.3)',  text: '#ffd43b' },
  'C++':      { bg: 'rgba(100,149,237,0.12)', border: 'rgba(100,149,237,0.3)', text: '#6495ed' },
  HTML:       { bg: 'rgba(255,107,53,0.12)',  border: 'rgba(255,107,53,0.3)',  text: '#ff6b35' },
  CSS:        { bg: 'rgba(41,182,246,0.12)',  border: 'rgba(41,182,246,0.3)',  text: '#29b6f6' },
  Java:       { bg: 'rgba(255,89,89,0.12)',   border: 'rgba(255,89,89,0.3)',   text: '#ff5959' },
  JavaScript: { bg: 'rgba(247,223,30,0.12)',  border: 'rgba(247,223,30,0.3)',  text: '#f7df1e' },
  C:          { bg: 'rgba(168,185,204,0.12)', border: 'rgba(168,185,204,0.3)', text: '#a8b9cc' },
  Home:       { bg: 'rgba(0,229,160,0.12)',   border: 'rgba(0,229,160,0.3)',   text: '#00e5a0' },
};

// ─── Root-relative path prefix ──────────────────────────
// When on lessons/* pages the URLs need ../ prefix
const isInLessonsFolder = window.location.pathname.includes('/lessons/');
function resolveUrl(url) {
  return isInLessonsFolder ? '../' + url : url;
}

// ─── Search logic ────────────────────────────────────────
function searchContent(query) {
  if (!query || query.trim().length < 2) return [];
  const terms = query.toLowerCase().trim().split(/\s+/);
  return searchIndex
    .map(item => {
      const hay = (item.title + ' ' + item.desc + ' ' + item.tag).toLowerCase();
      const score = terms.reduce((s, t) => s + (hay.includes(t) ? (item.title.toLowerCase().includes(t) ? 3 : 1) : 0), 0);
      return { ...item, score };
    })
    .filter(i => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

// ─── Render results ──────────────────────────────────────
function renderResults(results, container) {
  if (results.length === 0) {
    container.innerHTML = `
      <div class="search-empty">
        <div class="search-empty-icon">🔍</div>
        <div>No results found</div>
        <div class="search-empty-sub">Try keywords like "pointers", "flexbox", "loops", "OOP"</div>
      </div>`;
    return;
  }
  container.innerHTML = results.map(r => {
    const c = tagColors[r.tag] || tagColors.Home;
    return `
      <a class="search-result-item" href="${resolveUrl(r.url)}">
        <div class="sr-icon">${r.icon}</div>
        <div class="sr-body">
          <div class="sr-title">${highlight(r.title, document.getElementById('search-input').value)}</div>
          <div class="sr-desc">${highlight(r.desc.slice(0, 80) + '…', document.getElementById('search-input').value)}</div>
        </div>
        <span class="sr-tag" style="background:${c.bg};border:1px solid ${c.border};color:${c.text}">${r.tag}</span>
      </a>`;
  }).join('');
}

function highlight(text, query) {
  if (!query) return text;
  const terms = query.trim().split(/\s+/).filter(t => t.length > 1);
  let result = text;
  terms.forEach(t => {
    const re = new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    result = result.replace(re, '<mark>$1</mark>');
  });
  return result;
}

// ─── Init search UI ──────────────────────────────────────
function initSearch() {
  const input  = document.getElementById('search-input');
  const box    = document.getElementById('search-box');
  const list   = document.getElementById('search-results');
  const toggle = document.getElementById('search-toggle');
  const overlay = document.getElementById('search-overlay');
  if (!input) return;

  function openSearch() {
    box.classList.add('open');
    overlay.classList.add('visible');
    setTimeout(() => input.focus(), 100);
  }
  function closeSearch() {
    box.classList.remove('open');
    overlay.classList.remove('visible');
    input.value = '';
    list.innerHTML = '';
    list.classList.remove('has-results');
  }

  toggle && toggle.addEventListener('click', openSearch);
  overlay && overlay.addEventListener('click', closeSearch);

  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (q.length < 2) {
      list.innerHTML = '';
      list.classList.remove('has-results');
      return;
    }
    const results = searchContent(q);
    renderResults(results, list);
    list.classList.add('has-results');
  });

  document.addEventListener('keydown', e => {
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      box.classList.contains('open') ? closeSearch() : openSearch();
    }
    if (e.key === 'Escape') closeSearch();
  });
}

document.addEventListener('DOMContentLoaded', initSearch);
