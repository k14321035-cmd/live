const courses = {
  python: {
    emoji: '🐍',
    title: 'Python Programming',
    desc: 'Python is the world\'s most popular beginner language — and also one of the most powerful. This course takes you from writing your first line to building real applications using OOP, file handling, and popular libraries.',
    curriculum: [
      'Introduction to Python & installing tools',
      'Variables, data types, and operators',
      'Control flow: if, loops, and conditions',
      'Functions, scope, and recursion',
      'Lists, tuples, dictionaries, sets',
      'Object-Oriented Programming (OOP)',
      'File I/O and exception handling',
      'Working with libraries (os, math, datetime)',
      'Introduction to NumPy and Pandas',
      'Capstone: Build a CLI task manager',
    ],
    btn: 'linear-gradient(135deg, #ffd43b, #ffaa00)'
  },
  cpp: {
    emoji: '⚙️',
    title: 'C++ Programming',
    desc: 'C++ is where performance meets power. This course teaches you low-level programming concepts including memory management, pointers, and the Standard Template Library — essential for systems, game dev, and competitive programming.',
    curriculum: [
      'C++ syntax, variables, and I/O',
      'Control structures and functions',
      'Arrays, strings, and references',
      'Pointers and memory management',
      'Object-Oriented Programming in C++',
      'Inheritance, polymorphism, and abstraction',
      'Templates and generic programming',
      'STL: vectors, maps, sets, queues',
      'File handling and error management',
      'Capstone: Build a student record system',
    ],
    btn: 'linear-gradient(135deg, #6495ed, #4169e1)'
  },
  html: {
    emoji: '🌐',
    title: 'HTML Fundamentals',
    desc: 'HTML is the language every website is built on. This course covers everything from your first tags to semantic HTML5 elements, forms, accessibility, and how browsers interpret your markup.',
    curriculum: [
      'What is HTML and how browsers work',
      'Document structure and basic tags',
      'Headings, paragraphs, and text elements',
      'Links, images, and media',
      'Lists and tables',
      'Semantic HTML5 elements',
      'HTML Forms and input types',
      'Accessibility with ARIA and alt text',
      'SEO basics with meta tags',
      'Capstone: Build a personal portfolio page',
    ],
    btn: 'linear-gradient(135deg, #ff6b35, #e63900)'
  },
  css: {
    emoji: '🎨',
    title: 'CSS & Styling',
    desc: 'CSS transforms plain HTML into beautiful, responsive experiences. Learn everything from the box model to animations, Flexbox, CSS Grid, and modern techniques used by professional frontend developers.',
    curriculum: [
      'CSS syntax, selectors, and specificity',
      'Box model: margin, padding, border',
      'Colors, backgrounds, and typography',
      'Display, position, and float',
      'Flexbox layout in depth',
      'CSS Grid layout in depth',
      'Responsive design and media queries',
      'CSS variables and custom properties',
      'Transitions and keyframe animations',
      'Capstone: Build a responsive landing page',
    ],
    btn: 'linear-gradient(135deg, #29b6f6, #0288d1)'
  },
  java: {
    emoji: '☕',
    title: 'Java Programming',
    desc: 'Java is everywhere — from enterprise backends to Android apps. This comprehensive course covers Java\'s powerful OOP model, multithreading, collections framework, and best practices used in industry.',
    curriculum: [
      'Java syntax and the JVM',
      'Variables, types, and operators',
      'Control flow and methods',
      'Object-Oriented Programming in Java',
      'Inheritance, interfaces, and abstract classes',
      'Java Collections Framework',
      'Exception handling and custom exceptions',
      'File I/O with Java NIO',
      'Multithreading and concurrency',
      'Capstone: Build a banking console app',
    ],
    btn: 'linear-gradient(135deg, #ff5959, #cc2200)'
  },
  js: {
    emoji: '✨',
    title: 'JavaScript',
    desc: 'JavaScript is the only language that runs in every browser. From DOM manipulation to building REST APIs with Node.js, this is the most versatile language course we offer — and the most in-demand skill on the job market.',
    curriculum: [
      'JavaScript basics and variables (ES6+)',
      'Functions, scope, and closures',
      'Arrays, objects, and destructuring',
      'DOM manipulation and events',
      'Async JS: callbacks, promises, async/await',
      'Fetch API and working with REST APIs',
      'Error handling and debugging',
      'Modules (import/export)',
      'Intro to Node.js and npm',
      'Capstone: Build a weather dashboard app',
    ],
    btn: 'linear-gradient(135deg, #f7df1e, #d4a800)'
  },
  c: {
    emoji: '🧭',
    title: 'C Language',
    desc: 'C gives you direct control over memory, teaches you how computers really work, and underpins virtually every operating system, embedded device, and high-performance application in the world.',
    curriculum: [
      'Intro to C',
      'Variables & Data Types',
      'Operators & Expressions',
      'Control Flow & Functions',
      'Arrays & Strings',
      'Pointers',
      'Structures & Unions',
      'File I/O & Dynamic Memory',
      'Preprocessor & Macros',
      'Capstone Project'
    ],
    btn: 'linear-gradient(135deg, #a8b9cc, #657b98)'
  },
  cc: {
    emoji: '♯',
    title: 'C# Programming',
    desc: 'C# is Microsoft\'s flagship language for .NET development. Build Windows apps, web APIs, games with Unity, and enterprise software with this powerful, type-safe language.',
    curriculum: [
      'Introduction to C# and .NET',
      'Variables, types, and operators',
      'Control flow and methods',
      'Object-Oriented Programming in C#',
      'Inheritance and interfaces',
      'Delegates, events, and LINQ',
      'Asynchronous programming with async/await',
      'Working with collections',
      'File I/O and serialization',
      'Capstone: Build a task management app'
    ],
    btn: 'linear-gradient(135deg, #9b59b6, #6a0dad)'
  },
  typescript: {
    emoji: '🔷',
    title: 'TypeScript',
    desc: 'TypeScript adds static typing to JavaScript, making your code more reliable and maintainable. Essential for large-scale applications and modern frontend development.',
    curriculum: [
      'Introduction to TypeScript',
      'Basic types and type inference',
      'Interfaces and type aliases',
      'Classes and OOP in TypeScript',
      'Generics and advanced types',
      'Modules and namespaces',
      'Decorators and metadata',
      'Working with React and TypeScript',
      'Build tools and configuration',
      'Capstone: Build a typed REST API client'
    ],
    btn: 'linear-gradient(135deg, #3178c6, #235a97)'
  },
  go: {
    emoji: '🐹',
    title: 'Go Programming',
    desc: 'Go (Golang) is Google\'s language for building fast, reliable, and efficient software. Perfect for cloud services, microservices, and backend development with excellent concurrency support.',
    curriculum: [
      'Introduction to Go',
      'Variables, types, and constants',
      'Control structures and functions',
      'Arrays, slices, and maps',
      'Structs and methods',
      'Interfaces and composition',
      'Goroutines and channels',
      'Error handling and testing',
      'Building CLI tools',
      'Capstone: Build a concurrent web server'
    ],
    btn: 'linear-gradient(135deg, #00add8, #007d9c)'
  },
  rust: {
    emoji: '🦀',
    title: 'Rust Programming',
    desc: 'Rust provides memory safety without garbage collection, making it perfect for systems programming, web assembly, and high-performance applications. Loved by developers worldwide.',
    curriculum: [
      'Introduction to Rust and ownership',
      'Borrowing and references',
      'Structs and enums',
      'Pattern matching',
      'Traits and generics',
      'Error handling with Result and Option',
      'Collections and iterators',
      'Concurrency with threads',
      'Cargo and package management',
      'Capstone: Build a command-line tool'
    ],
    btn: 'linear-gradient(135deg, #dea584, #b84a28)'
  },
  kotlin: {
    emoji: '🟣',
    title: 'Kotlin',
    desc: 'Kotlin is the modern language for Android development and multiplatform apps. Concise, safe, and interoperable with Java — the preferred language for Android developers.',
    curriculum: [
      'Introduction to Kotlin',
      'Variables and basic types',
      'Control flow and functions',
      'Null safety in Kotlin',
      'Classes and inheritance',
      'Interfaces and data classes',
      'Collections and functional operations',
      'Coroutines for async programming',
      'Android basics with Kotlin',
      'Capstone: Build a simple Android app'
    ],
    btn: 'linear-gradient(135deg, #7f52ff, #5b3bb5)'
  },
  swift: {
    emoji: '🟠',
    title: 'Swift',
    desc: 'Swift is Apple\'s powerful and intuitive language for iOS, macOS, watchOS, and tvOS development. Modern syntax with performance that rivals C-based languages.',
    curriculum: [
      'Introduction to Swift',
      'Variables, constants, and types',
      'Operators and control flow',
      'Functions and closures',
      'Optionals and error handling',
      'Structs, classes, and enums',
      'Protocols and extensions',
      'Generics in Swift',
      'Memory management with ARC',
      'Capstone: Build an iOS calculator app'
    ],
    btn: 'linear-gradient(135deg, #f05138, #b53522)'
  },
  php: {
    emoji: '🐘',
    title: 'PHP',
    desc: 'PHP powers over 75% of the web including WordPress and Laravel. Learn server-side scripting, database integration, and modern PHP development practices.',
    curriculum: [
      'Introduction to PHP',
      'Variables, types, and operators',
      'Control structures and functions',
      'Arrays and strings',
      'Working with forms and GET/POST',
      'MySQL database integration',
      'Sessions and cookies',
      'Object-Oriented PHP',
      'Introduction to Laravel framework',
      'Capstone: Build a blog system'
    ],
    btn: 'linear-gradient(135deg, #777bb4, #4f5b93)'
  },
  sql: {
    emoji: '🗄️',
    title: 'SQL',
    desc: 'SQL is the standard language for managing relational databases. Essential for backend developers, data analysts, and anyone working with structured data.',
    curriculum: [
      'Introduction to databases and SQL',
      'SELECT queries and filtering',
      'Sorting and limiting results',
      'Aggregate functions and GROUP BY',
      'Joins: INNER, LEFT, RIGHT, FULL',
      'Subqueries and CTEs',
      'Inserting, updating, and deleting data',
      'Creating tables and constraints',
      'Indexes and query optimization',
      'Capstone: Design a complete database schema'
    ],
    btn: 'linear-gradient(135deg, #f29111, #c46708)'
  },
  r: {
    emoji: '📊',
    title: 'R Programming',
    desc: 'R is the leading language for statistical computing and data visualization. Essential for data scientists, statisticians, and researchers working with data analysis.',
    curriculum: [
      'Introduction to R and RStudio',
      'Vectors, matrices, and data frames',
      'Data manipulation with dplyr',
      'Data visualization with ggplot2',
      'Statistical analysis basics',
      'Hypothesis testing in R',
      'Working with real datasets',
      'Creating functions and packages',
      'R Markdown for reproducible research',
      'Capstone: Analyze and visualize a dataset'
    ],
    btn: 'linear-gradient(135deg, #276dc3, #1b4f8f)'
  },
  dart: {
    emoji: '🎯',
    title: 'Dart',
    desc: 'Dart is Google\'s language optimized for building fast apps on any platform. The language behind Flutter for beautiful cross-platform mobile, web, and desktop apps.',
    curriculum: [
      'Introduction to Dart',
      'Variables and built-in types',
      'Functions and operators',
      'Control flow statements',
      'Classes and objects',
      'Inheritance and mixins',
      'Asynchronous programming: Futures and Streams',
      'Collections and generics',
      'Error handling',
      'Capstone: Build a console calculator'
    ],
    btn: 'linear-gradient(135deg, #00b4ab, #007a73)'
  },
  ruby: {
    emoji: '💎',
    title: 'Ruby',
    desc: 'Ruby is a dynamic, elegant language focused on simplicity and productivity. Known for its beautiful syntax and the powerful Rails framework for web development.',
    curriculum: [
      'Introduction to Ruby',
      'Variables, types, and operators',
      'Control structures and methods',
      'Arrays, hashes, and symbols',
      'Object-Oriented Programming in Ruby',
      'Modules and mixins',
      'Blocks, procs, and lambdas',
      'File I/O and regular expressions',
      'Introduction to Ruby on Rails',
      'Capstone: Build a simple web app'
    ],
    btn: 'linear-gradient(135deg, #cc342d, #9a2822)'
  },
  matlab: {
    emoji: '📐',
    title: 'MATLAB',
    desc: 'MATLAB is the industry-standard platform for numerical computing, algorithm development, and data visualization. Essential for engineers, scientists, and researchers.',
    curriculum: [
      'Introduction to MATLAB environment',
      'Variables, arrays, and matrices',
      'Matrix operations and linear algebra',
      'Plotting and visualization',
      'Control flow and functions',
      'Data import and export',
      'Signal processing basics',
      'Image processing fundamentals',
      'Simulink introduction',
      'Capstone: Analyze and visualize scientific data'
    ],
    btn: 'linear-gradient(135deg, #0076a8, #004e6e)'
  },
  visualbasic: {
    emoji: '🔵',
    title: 'Visual Basic .NET',
    desc: 'VB.NET is Microsoft\'s approachable, object-oriented language. Perfect for Windows desktop applications, automation, and rapid application development with .NET.',
    curriculum: [
      'Introduction to VB.NET',
      'Variables, types, and operators',
      'Control structures and procedures',
      'Arrays and collections',
      'Object-Oriented Programming',
      'Windows Forms and UI design',
      'Event-driven programming',
      'File I/O and database access',
      'LINQ and data manipulation',
      'Capstone: Build a Windows desktop app'
    ],
    btn: 'linear-gradient(135deg, #00539c, #003d75)'
  },
  shell: {
    emoji: '🐚',
    title: 'Shell Scripting',
    desc: 'Shell scripting automates command-line tasks on Unix/Linux systems. Essential for system administrators, DevOps engineers, and developers working in Linux environments.',
    curriculum: [
      'Introduction to shell scripting',
      'Variables and environment',
      'Control structures: if, case, loops',
      'Functions and parameters',
      'Working with files and text',
      'Process management',
      'Regular expressions with sed and awk',
      'System administration tasks',
      'Creating robust scripts',
      'Capstone: Build a system monitoring script'
    ],
    btn: 'linear-gradient(135deg, #4e9a06, #2d5a04)'
  },
  ethicalhacking: {
    emoji: '🛡️',
    title: 'Ethical Hacking',
    desc: 'Learn the art of ethical hacking and penetration testing. Understand security vulnerabilities, network security, and how to protect systems from cyber threats.',
    curriculum: [
      'Introduction to ethical hacking',
      'Footprinting and reconnaissance',
      'Scanning networks and systems',
      'Enumeration techniques',
      'Vulnerability analysis',
      'System hacking methodology',
      'Malware threats and analysis',
      'Social engineering',
      'Web application security',
      'Capstone: Conduct a penetration test'
    ],
    btn: 'linear-gradient(135deg, #2ecc71, #27ae60)'
  },
  bash: {
    emoji: '🖥️',
    title: 'Bash Scripting',
    desc: 'Bash is the default shell on most Linux systems. Master Bash to automate workflows, manage systems, and write powerful command-line tools for daily tasks.',
    curriculum: [
      'Introduction to Bash and the shell',
      'Variables and environment setup',
      'Operators: arithmetic, comparison, file test',
      'Control flow: if, case, loops',
      'Functions and parameters',
      'Arrays and string manipulation',
      'File operations and redirection',
      'Process management and signals',
      'Regular expressions and text processing',
      'Capstone: Build a system administration toolkit'
    ],
    btn: 'linear-gradient(135deg, #293137, #1a1f23)'
  }
};

function openModal(id) {
  const c = courses[id];
  document.getElementById('modal-emoji').textContent = c.emoji;
  document.getElementById('modal-title').textContent = c.title;
  document.getElementById('modal-desc').textContent = c.desc;
  const ul = document.getElementById('modal-curriculum');
  ul.innerHTML = c.curriculum.map(item => `<li>${item}</li>`).join('');
  document.getElementById('modal-btn').style.background = c.btn;
  document.getElementById('modal-btn').style.color = (id === 'python' || id === 'js') ? '#1a1000' : '#fff';
  
  const linkMap = {
    'cpp': 'c++.html',
    'js': 'javascript.html'
  };
  const fileName = linkMap[id] || `${id}.html`;
  document.getElementById('modal-btn').onclick = function() { window.location.href = `lessons/${fileName}`; };

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModalDirect();
}
function closeModalDirect() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModalDirect(); });

// ── Sign In Toast ──────────────────────────────────────────────────────────
function showSignInToast() {
  let toast = document.getElementById('signin-toast');
  if (toast) { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3200); return; }
  toast = document.createElement('div');
  toast.id = 'signin-toast';
  toast.innerHTML = `<span style="font-size:1.1rem">🚧</span> Sign in is coming soon — stay tuned!`;
  toast.style.cssText = [
    'position:fixed','bottom:2rem','left:50%','transform:translateX(-50%) translateY(120%)',
    'background:#1e293b','color:#f1f5f9','font-family:Outfit,sans-serif',
    'font-size:0.92rem','padding:0.85rem 1.6rem','border-radius:12px',
    'border:1px solid rgba(59,130,246,0.35)','box-shadow:0 8px 32px rgba(0,0,0,0.25)',
    'z-index:9999','display:flex','align-items:center','gap:0.6rem',
    'transition:transform 0.35s cubic-bezier(.4,0,.2,1), opacity 0.35s','opacity:0'
  ].join(';');
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
    toast.classList.add('show');
  });
  setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(120%)'; toast.style.opacity = '0'; }, 3200);
}

// ── Coming-Soon handler for placeholder links ──────────────────────────────
function showComingSoon(label) {
  let toast = document.getElementById('cs-toast');
  if (toast) { toast.querySelector('span.cs-label').textContent = label + ' is coming soon!'; toast.classList.add('show'); clearTimeout(toast._timer); toast._timer = setTimeout(() => toast.classList.remove('show'), 2800); return; }
  toast = document.createElement('div');
  toast.id = 'cs-toast';
  toast.innerHTML = `<span style="font-size:1.1rem">⏳</span><span class="cs-label">${label} is coming soon!</span>`;
  toast.style.cssText = [
    'position:fixed','bottom:5rem','left:50%','transform:translateX(-50%) translateY(120%)',
    'background:#1e293b','color:#f1f5f9','font-family:Outfit,sans-serif',
    'font-size:0.92rem','padding:0.85rem 1.6rem','border-radius:12px',
    'border:1px solid rgba(96,165,250,0.3)','box-shadow:0 8px 32px rgba(0,0,0,0.25)',
    'z-index:9999','display:flex','align-items:center','gap:0.6rem',
    'transition:transform 0.35s cubic-bezier(.4,0,.2,1), opacity 0.35s','opacity:0'
  ].join(';');
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.transform = 'translateX(-50%) translateY(0)'; toast.style.opacity = '1'; });
  toast._timer = setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(120%)'; toast.style.opacity = '0'; }, 2800);
}

// ── Mobile menu toggle (new lesson nav) ────────────────────────────────────
function toggleMenu() {
  const menu = document.getElementById('mobile-nav-overlay');
  const btn  = document.getElementById('menu-toggle');
  if (!menu) return;
  const open = menu.classList.toggle('open');
  if (btn) btn.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

// ── Mobile menu toggle (old - keep for compatibility) ────────────────────────
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-nav-overlay');
  const btn  = document.getElementById('hamburger-btn');
  if (!menu) return;
  const open = menu.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
function closeMobileMenu() {
  const menu = document.getElementById('mobile-nav-overlay');
  const btn  = document.getElementById('hamburger-btn');
  if (menu) { menu.classList.remove('open'); btn && btn.setAttribute('aria-expanded', 'false'); }
  document.body.style.overflow = '';
}

// ── Animate cards on scroll ────────────────────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.animationDelay = (i * 0.08) + 's';
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.course-card').forEach(card => observer.observe(card));

// ── Course nav active state handling ────────────────────────────────────────
document.querySelectorAll('.course-link').forEach(link => {
  link.addEventListener('click', function(e) {
    document.querySelectorAll('.course-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

// ── Sign In button handler ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  const signInBtn = document.querySelector('.btn-signin');
  if (signInBtn) {
    signInBtn.addEventListener('click', showSignInToast);
  }
});

