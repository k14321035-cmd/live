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
  document.getElementById('modal-btn').onclick = function() { window.location.href = `lessions/${fileName}`; };

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

// Animate cards on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.animationDelay = (i * 0.08) + 's';
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.course-card').forEach(card => observer.observe(card));
