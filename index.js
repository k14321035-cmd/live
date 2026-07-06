
const languages = [
  {name:'Python', file:'hello_world.py', href:'lessons/python.html', accent:'--python-a', desc:'beginner-friendly · data science · AI', cmt:'#', lessons:22, emoji:'🐍', curriculum:['Syntax, variables & data types','Control flow & functions','Lists, dicts & comprehensions','OOP in Python','Capstone: build a CLI app']},
  {name:'C++', file:'hello_world.cpp', href:'lessons/c++.html', accent:'--cpp-a', desc:'performance · systems · games', cmt:'//', lessons:20, emoji:'⚙️', curriculum:['Syntax & memory model','Pointers & references','STL containers','Classes & templates','Capstone: build a small game engine']},
  {name:'HTML', file:'index.html', href:'lessons/html.html', accent:'--html-a', desc:'web structure · semantic · SEO', cmt:'<!--', lessons:16, emoji:'🌐', curriculum:['Tags & document structure','Semantic HTML','Forms & accessibility','Metadata & SEO basics','Capstone: build a portfolio page']},
  {name:'CSS', file:'style.css', href:'lessons/css.html', accent:'--css-a', desc:'styling · flexbox · animations', cmt:'/*', lessons:16, emoji:'🎨', curriculum:['Selectors & the box model','Flexbox & Grid','Responsive design','Transitions & animation','Capstone: style the portfolio page']},
  {name:'Java', file:'Hello.java', href:'lessons/java.html', accent:'--java-a', desc:'OOP · enterprise · Android', cmt:'//', lessons:22, emoji:'☕', curriculum:['Syntax & OOP basics','Interfaces & inheritance','Collections framework','Exception handling','Capstone: build an Android app']},
  {name:'JavaScript', file:'app.js', href:'lessons/javascript.html', accent:'--js-a', desc:'web dev · Node.js · full stack', cmt:'//', lessons:22, emoji:'✨', curriculum:['Syntax & the DOM','Async & fetch','ES6+ features','Node.js basics','Capstone: build a full-stack app']},
  {name:'C Language', file:'hello.c', href:'lessons/c.html', accent:'--c-a', desc:'systems · embedded · memory', cmt:'//', lessons:18, emoji:'🔧', curriculum:['Syntax & compilation','Pointers & memory','Structs & arrays','File I/O','Capstone: build a memory allocator']},
  {name:'C#', file:'Hello.cs', href:'lessons/cc.html', accent:'--csharp-a', desc:'.NET · Unity · enterprise apps', cmt:'//', lessons:18, emoji:'🎮', curriculum:['Syntax & OOP','.NET fundamentals','LINQ & collections','Async/await','Capstone: build a Unity mini-game']},
  {name:'TypeScript', file:'app.ts', href:'lessons/typescript.html', accent:'--ts-a', desc:'typed JS · scale · modern dev', cmt:'//', lessons:18, emoji:'🔷', curriculum:['Types & interfaces','Generics','Type narrowing','Working with JS libraries','Capstone: type a real app']},
  {name:'Go', file:'main.go', href:'lessons/go.html', accent:'--go-a', desc:'concurrency · cloud · CLI tools', cmt:'//', lessons:18, emoji:'🐹', curriculum:['Syntax & structs','Goroutines & channels','Error handling','Packages & modules','Capstone: build a CLI tool']},
  {name:'Rust', file:'main.rs', href:'lessons/rust.html', accent:'--rust-a', desc:'safety · speed · systems', cmt:'//', lessons:18, emoji:'🦀', curriculum:['Ownership & borrowing','Structs & enums','Error handling','Traits & generics','Capstone: build a systems tool']},
  {name:'Kotlin', file:'Hello.kt', href:'lessons/kotlin.html', accent:'--kotlin-a', desc:'Android · multiplatform · JVM', cmt:'//', lessons:16, emoji:'📱', curriculum:['Syntax & null safety','Classes & data classes','Coroutines','Android basics','Capstone: build an Android app']},
  {name:'Swift', file:'main.swift', href:'lessons/swift.html', accent:'--swift-a', desc:'iOS · macOS · Apple ecosystem', cmt:'//', lessons:16, emoji:'🍎', curriculum:['Syntax & optionals','Structs & classes','SwiftUI basics','Networking','Capstone: build an iOS app']},
  {name:'PHP', file:'index.php', href:'lessons/php.html', accent:'--php-a', desc:'server-side · WordPress · APIs', cmt:'//', lessons:18, emoji:'🐘', curriculum:['Syntax & forms','Sessions & cookies','MySQL integration','Building APIs','Capstone: build a CRUD app']},
  {name:'SQL', file:'query.sql', href:'lessons/sql.html', accent:'--sql-a', desc:'databases · queries · analytics', cmt:'--', lessons:16, emoji:'🗄️', curriculum:['SELECT & filtering','Joins','Aggregations & grouping','Subqueries & CTEs','Capstone: analyze a real dataset']},
  {name:'R', file:'script.R', href:'lessons/r.html', accent:'--r-a', desc:'statistics · data science · viz', cmt:'#', lessons:14, emoji:'📊', curriculum:['Vectors & data frames','Statistics basics','ggplot2 visualization','Data cleaning','Capstone: build a data report']},
  {name:'Bash', file:'script.sh', href:'lessons/bash.html', accent:'--bash-a', desc:'scripting · automation · linux', cmt:'#', lessons:14, emoji:'🐚', curriculum:['Shell basics','Variables & loops','Pipes & redirection','Writing scripts','Capstone: automate a workflow']},
  {name:'Dart', file:'main.dart', href:'lessons/dart.html', accent:'--dart-a', desc:'Flutter · mobile · cross-platform', cmt:'//', lessons:18, emoji:'🎯', curriculum:['Syntax & null safety','Widgets & layout','State management','Navigation','Capstone: build a Flutter app']},
  {name:'Ruby', file:'main.rb', href:'lessons/ruby.html', accent:'--ruby-a', desc:'Rails · scripting · web apps', cmt:'#', lessons:18, emoji:'💎', curriculum:['Syntax & blocks','OOP in Ruby','Rails basics','ActiveRecord','Capstone: build a Rails app']},
  {name:'MATLAB', file:'script.m', href:'lessons/matlab.html', accent:'--matlab-a', desc:'engineering · simulations · math', cmt:'%', lessons:14, emoji:'📐', curriculum:['Matrices & vectors','Plotting','Control flow','Functions & scripts','Capstone: simulate a system']},
  {name:'Visual Basic', file:'Module1.vb', href:'lessons/visualbasic.html', accent:'--vb-a', desc:'.NET · desktop · automation', cmt:"'", lessons:18, emoji:'🪟', curriculum:['Syntax basics','Forms & controls','.NET integration','Event handling','Capstone: build a desktop tool']},
  {name:'Shell', file:'script.sh', href:'lessons/shell.html', accent:'--shell-a', desc:'Unix · DevOps · scripting', cmt:'#', lessons:14, emoji:'🖥️', curriculum:['POSIX basics','Process management','Text processing','DevOps scripting','Capstone: build a deploy script']},
 {name:'Machine Learning', file:'script.py', href:'lessons/machinelearning.html', accent:'--shell-a', desc:'data science · algorithms · AI', cmt:'#', lessons:14, emoji:'🤖', curriculum:['Python basics','Data preprocessing','Model training','Evaluation & deployment','Capstone: build a ML model']},
 {name:'NumPy', file:'script.py', href:'lessons/numpy.html', accent:'--shell-a', desc:'Python · data science · arrays', cmt:'#', lessons:14, emoji:'📊', curriculum:['Arrays & matrices','Data manipulation','Linear algebra','Statistical functions','Capstone: analyze a dataset']},
{name:'Deep Learning', file:'script.py', href:'lessons/deeplearning.html', accent:'--shell-a', desc:'neural networks · TensorFlow · PyTorch', cmt:'#', lessons:14, emoji:'🧠', curriculum:['Neural network basics','TensorFlow fundamentals','PyTorch basics','Model deployment','Capstone: build a deep learning model']},

  {name:'Ethical Hacking', file:'recon.sh', href:'lessons/ethicalhacking.html', accent:'--eth-a', desc:'cybersecurity · pentesting · CTF', cmt:'#', lessons:16, emoji:'🛡️', curriculum:['Networking fundamentals','Reconnaissance','Common vulnerabilities','Web app pentesting','Capstone: solve a CTF challenge']},
];

// subheader
const subheader = document.getElementById('course-subheader');
languages.forEach(l => {
  const a = document.createElement('a');
  a.href = l.href; a.textContent = l.name;
  subheader.appendChild(a);
});

// marquee
const marquee = document.getElementById('marquee');
const names = languages.map(l => l.name);
[...names, ...names].forEach(n => {
  const s = document.createElement('span'); s.textContent = n; marquee.appendChild(s);
});

// course grid
const grid = document.getElementById('course-grid');
languages.forEach((l, idx) => {
  const a = document.createElement('button');
  a.className = 'course-card';
  a.style.setProperty('--lang', `var(${l.accent})`);
  a.innerHTML = `
    <div class="course-tab">${l.file}</div>
    <div class="course-name">${l.name}</div>
    <div class="course-desc"><span class="cmt">${l.cmt}</span> ${l.desc}</div>
    <div class="course-meta"><span>${l.lessons} lessons · free</span><span class="arrow">→</span></div>
  `;
  a.onclick = () => openModal(idx);
  grid.appendChild(a);
});

// footer course lists (split in half)
const half = Math.ceil(languages.length / 2);
const fc1 = document.getElementById('footer-courses-1');
const fc2 = document.getElementById('footer-courses-2');
languages.slice(0, half).forEach(l => { const li = document.createElement('li'); li.innerHTML = `<a href="${l.href}">${l.name}</a>`; fc1.appendChild(li); });
languages.slice(half).forEach(l => { const li = document.createElement('li'); li.innerHTML = `<a href="${l.href}">${l.name}</a>`; fc2.appendChild(li); });

// mobile nav courses
const mnc = document.getElementById('mobile-nav-courses');
languages.forEach(l => { const a = document.createElement('a'); a.href = l.href; a.textContent = l.name; a.onclick = toggleMenu; mnc.appendChild(a); });

// modal
function openModal(idx){
  const l = languages[idx];
  document.getElementById('modal-emoji').textContent = l.emoji;
  document.getElementById('modal-title').textContent = l.name;
  document.getElementById('modal-desc').textContent = l.desc + ' — ' + l.lessons + ' lessons, completely free.';
  const ul = document.getElementById('modal-curriculum');
  ul.innerHTML = '';
  l.curriculum.forEach(c => { const li = document.createElement('li'); li.textContent = c; ul.appendChild(li); });
  document.getElementById('modal-btn').href = l.href;
  document.getElementById('modal-overlay').classList.add('open');
}
function closeModal(e){ if(e.target.id === 'modal-overlay') closeModalDirect(); }
function closeModalDirect(){ document.getElementById('modal-overlay').classList.remove('open'); }

// search
const searchToggle = document.getElementById('search-toggle');
const searchOverlay = document.getElementById('search-overlay');
const searchBox = document.getElementById('search-box');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
function openSearch(){ searchOverlay.classList.add('open'); searchBox.classList.add('open'); searchInput.focus(); }
function closeSearch(){ searchOverlay.classList.remove('open'); searchBox.classList.remove('open'); searchInput.value=''; renderSearchHint(); }
function renderSearchHint(){ searchResults.innerHTML = '<div class="search-hint-row"><span class="sh-icon">🐍</span> Try "python", "rust", "sql"…</div>'; }
searchToggle.addEventListener('click', openSearch);
document.addEventListener('keydown', (e) => {
  if((e.ctrlKey || e.metaKey) && e.key === 'k'){ e.preventDefault(); openSearch(); }
  if(e.key === 'Escape'){ closeSearch(); }
});
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if(!q){ renderSearchHint(); return; }
  const matches = languages.filter(l => l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q));
  if(matches.length === 0){ searchResults.innerHTML = '<div class="search-hint-row">No courses found.</div>'; return; }
  searchResults.innerHTML = matches.map(l => `<a class="search-result-item" href="${l.href}">${l.emoji} ${l.name} — ${l.desc}</a>`).join('');
});

// mobile menu
function toggleMenu(){ document.getElementById('mobile-nav-overlay').classList.toggle('open'); }

// terminal typing effect
const snippets = [
  {lang:'hello_world.py', code:'print("hello, world")'},
  {lang:'app.js', code:'console.log("hello, world")'},
  {lang:'main.rs', code:'println!("hello, world");'},
  {lang:'main.go', code:'fmt.Println("hello, world")'},
  {lang:'Hello.java', code:'System.out.println("hello, world");'},
];
const termLang = document.getElementById('term-lang');
const termOutput = document.getElementById('term-output');
let i = 0, j = 0, deleting = false;
function typeLoop(){
  const current = snippets[i];
  termLang.textContent = current.lang;
  if(!deleting){
    termOutput.innerHTML = current.code.slice(0, j) + '<span class="term-cursor"></span>';
    j++;
    if(j > current.code.length + 14){ deleting = true; j = current.code.length; }
  } else {
    termOutput.innerHTML = current.code.slice(0, j) + '<span class="term-cursor"></span>';
    j--;
    if(j < 0){ deleting = false; j = 0; i = (i + 1) % snippets.length; }
  }
  setTimeout(typeLoop, deleting ? 25 : 55);
}
typeLoop();

