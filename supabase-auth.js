/**
 * Code Tutorium - Supabase Authentication & Session Management
 * Handles user login, 2-step registration, logout, navbar state, and routing.
 */

// Supabase Configuration
// REPLACE THESE WITH YOUR OWN CREDENTIALS FROM THE SUPABASE DASHBOARD
const SUPABASE_URL = "https://chwxjjeqgubqavwxoyzl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NhS83dmkyY3WxVNQLiJD2w_CXtuhWwL";

// Initialize Supabase Client
let _supabase = null;
const isConfigured = SUPABASE_URL !== "YOUR_SUPABASE_URL" && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";

if (isConfigured) {
  try {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
} else {
  console.warn("Supabase credentials are not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in `supabase-auth.js`.");
}

// Global Registration Step State
let signupStep = 1;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // 1. Setup click outside to close navbar dropdown
  window.addEventListener('click', (e) => {
    const dropdownMenu = document.getElementById('dropdown-menu');
    const dropdownBtn = document.getElementById('nav-user-dropdown-btn');
    if (dropdownMenu && dropdownMenu.classList.contains('open')) {
      if (dropdownBtn && !dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('open');
      }
    }
  });

  // 2. Bind dedicated Log In page form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }

  // 3. Bind dedicated Register page form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
  }

  // 4. Check for auth redirect trigger warning on login.html
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('auth_trigger') === 'login' && window.location.pathname.includes('login.html')) {
    const errorBox = document.getElementById('auth-error-msg');
    if (errorBox) {
      errorBox.textContent = "Please log in or register to access the courses.";
      errorBox.classList.remove('hidden');
      errorBox.style.display = 'block';
    }
  }

  // 5. Check session and bind listeners
  if (_supabase) {
    // Listen for auth changes
    _supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user || null;
      updateNavbarState(user);
      
      const isAuthPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html');
      
      if (user && isAuthPage) {
        // Redirect to homepage if already logged in
        window.location.href = 'index.html';
      }

      if (!user && window.location.pathname.endsWith('profile.html')) {
        // Redirect back to homepage if they sign out on the profile page
        window.location.href = 'index.html';
      }
    });

    // Check initial session
    _supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user || null;
      updateNavbarState(user);
      
      const isAuthPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html');
      if (user && isAuthPage) {
        window.location.href = 'index.html';
      }
    }).catch(err => {
      console.error("Error getting session:", err);
    });
  } else {
    updateNavbarState(null);
  }
});

/**
 * Handle Log In Form Submission
 */
async function handleLoginSubmit(event) {
  event.preventDefault();
  clearAuthMessages();

  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;

  const errorBox = document.getElementById('auth-error-msg');
  const submitBtn = document.getElementById('login-submit-btn');
  const loader = submitBtn.querySelector('.btn-loader');
  const btnText = submitBtn.querySelector('.btn-text');

  if (!_supabase) {
    showAuthError("Supabase is not configured. Please add URL and Anon Key in supabase-auth.js");
    return;
  }

  // Set loading state
  submitBtn.disabled = true;
  if (loader) {
    loader.classList.remove('hidden');
    loader.style.display = 'inline-block';
  }
  if (btnText) btnText.style.opacity = '0.5';

  try {
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Redirect to home page
    window.location.href = 'index.html';
  } catch (err) {
    console.error("Login error:", err);
    showAuthError(err.message || "Invalid credentials.");
  } finally {
    submitBtn.disabled = false;
    if (loader) {
      loader.classList.add('hidden');
      loader.style.display = 'none';
    }
    if (btnText) btnText.style.opacity = '1';
  }
}

/**
 * Handle Register Form Submission (Multi-step wizard)
 */
async function handleRegisterSubmit(event) {
  event.preventDefault();
  clearAuthMessages();

  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;

  const errorBox = document.getElementById('auth-error-msg');
  const successBox = document.getElementById('auth-success-msg');
  const submitBtn = document.getElementById('register-submit-btn');
  const loader = submitBtn.querySelector('.btn-loader');
  const btnText = submitBtn.querySelector('.btn-text');

  if (!_supabase) {
    showAuthError("Supabase is not configured. Please add URL and Anon Key in supabase-auth.js");
    return;
  }

  // Step 1 validation and transition
  if (signupStep === 1) {
    if (email.length < 3 || password.length < 6) {
      showAuthError("Please enter a valid email and password (minimum 6 characters).");
      return;
    }
    signupStep = 2;
    updateRegisterWizardDOM();
    return;
  }

  // Step 2 Submission
  const name = document.getElementById('auth-name').value.trim();
  const ageVal = document.getElementById('auth-age').value;
  const age = ageVal ? parseInt(ageVal, 10) : null;
  const profession = document.getElementById('auth-profession').value;
  const experience = document.getElementById('auth-experience').value;
  const github = document.getElementById('auth-github').value.trim();

  // Set loading state
  submitBtn.disabled = true;
  if (loader) {
    loader.classList.remove('hidden');
    loader.style.display = 'inline-block';
  }
  if (btnText) btnText.style.opacity = '0.5';

  try {
    const { data, error } = await _supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          age: age,
          profession: profession,
          programming_experience: experience,
          github_username: github
        }
      }
    });
    if (error) throw error;

    // Safe redundancy upsert
    if (data?.session && data?.user) {
      try {
        await _supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: name,
          age: age,
          profession: profession,
          programming_experience: experience,
          github_username: github,
          updated_at: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn("Redundant DB upsert failed:", dbErr);
      }
    }

    if (successBox) {
      const user = data?.user;
      if (user && user.identities && user.identities.length === 0) {
        successBox.textContent = "This email is already registered. Try logging in.";
      } else if (data?.session) {
        successBox.textContent = "Registration successful! Redirecting...";
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
      } else {
        successBox.textContent = "Registration successful! Please check your email for the verification link.";
      }
      successBox.classList.remove('hidden');
      successBox.style.display = 'block';
    }
  } catch (err) {
    console.error("Registration error:", err);
    showAuthError(err.message || "An error occurred during registration.");
  } finally {
    submitBtn.disabled = false;
    if (loader) {
      loader.classList.add('hidden');
      loader.style.display = 'none';
    }
    if (btnText) btnText.style.opacity = '1';
  }
}

/**
 * Update the Registration wizard DOM inputs & labels
 */
function updateRegisterWizardDOM() {
  const stepCredentials = document.getElementById('auth-step-credentials');
  const stepProfile = document.getElementById('auth-step-profile');
  const submitBtnText = document.querySelector('#register-submit-btn .btn-text');
  
  const title = document.getElementById('register-title');
  const subtitle = document.getElementById('register-subtitle');
  const emoji = document.getElementById('register-emoji');
  
  const switchText = document.getElementById('register-switch-text');
  const switchLink = document.getElementById('register-switch-link');

  if (signupStep === 1) {
    if (title) title.textContent = "Register";
    if (subtitle) subtitle.textContent = "Create a free account to access all courses";
    if (emoji) emoji.textContent = "🚀";
    if (submitBtnText) submitBtnText.textContent = "Next →";
    
    if (switchText) switchText.textContent = "Already have an account?";
    if (switchLink) {
      switchLink.textContent = "Log In";
      switchLink.href = "login.html";
      switchLink.onclick = null; // Revert custom back click
    }
    
    if (stepCredentials) stepCredentials.classList.remove('hidden');
    if (stepProfile) stepProfile.classList.add('hidden');
  } else {
    if (title) title.textContent = "Profile Details";
    if (subtitle) subtitle.textContent = "Tell us about yourself to customize your learning paths";
    if (emoji) emoji.textContent = "🧑‍💻";
    if (submitBtnText) submitBtnText.textContent = "Register";
    
    if (switchText) switchText.textContent = "Want to change credentials?";
    if (switchLink) {
      switchLink.textContent = "← Back";
      switchLink.href = "#";
      switchLink.onclick = (e) => {
        e.preventDefault();
        signupStep = 1;
        updateRegisterWizardDOM();
      };
    }
    
    if (stepCredentials) stepCredentials.classList.add('hidden');
    if (stepProfile) stepProfile.classList.remove('hidden');
  }
}

/**
 * Handle user Sign Out
 */
async function handleSignOut() {
  if (!_supabase) return;
  try {
    const { error } = await _supabase.auth.signOut();
    if (error) throw error;
    
    // Redirect to homepage
    window.location.href = 'index.html';
  } catch (err) {
    console.error("Error signing out:", err);
  }
}

/**
 * Toggle standard user dropdown menu visibility
 */
function toggleUserDropdown(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const dropdownMenu = document.getElementById('dropdown-menu');
  if (dropdownMenu) {
    dropdownMenu.classList.toggle('open');
  }
}

/**
 * Display auth validation messages
 */
function showAuthError(message) {
  const errorBox = document.getElementById('auth-error-msg');
  if (errorBox) {
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
    errorBox.style.display = 'block';
  }
}

/**
 * Clear alert message boxes
 */
function clearAuthMessages() {
  const errorBox = document.getElementById('auth-error-msg');
  const successBox = document.getElementById('auth-success-msg');
  if (errorBox) {
    errorBox.textContent = '';
    errorBox.style.display = 'none';
    errorBox.classList.add('hidden');
  }
  if (successBox) {
    successBox.textContent = '';
    successBox.style.display = 'none';
    successBox.classList.add('hidden');
  }
}

/**
 * Update the navbar and mobile navbar layout based on user session state
 * @param {object | null} user - Supabase user object or null
 */
function updateNavbarState(user) {
  const desktopAuthArea = document.querySelector('.nav-right');
  const mobileAuthArea = document.getElementById('mobile-nav-auth');

  if (!desktopAuthArea) return;

  // 1. Update Desktop Navbar
  let userDropdown = document.getElementById('nav-user-dropdown');
  let signInBtn = document.getElementById('nav-auth-btn');

  if (user) {
    if (signInBtn) signInBtn.style.display = 'none';

    const cleanEmail = user.email;
    const truncatedEmail = cleanEmail.length > 20 ? cleanEmail.slice(0, 18) + '...' : cleanEmail;

    if (!userDropdown) {
      userDropdown = document.createElement('div');
      userDropdown.className = 'nav-user-dropdown';
      userDropdown.id = 'nav-user-dropdown';
      
      userDropdown.innerHTML = `
        <button class="nav-cta" id="nav-user-dropdown-btn" onclick="toggleUserDropdown(event)">user_session()</button>
        <div class="dropdown-menu" id="dropdown-menu">
          <div class="dropdown-email" id="dropdown-email" title="${cleanEmail}"></div>
          <div class="dropdown-divider"></div>
          <a href="profile.html" class="dropdown-item" style="text-decoration: none; display: block;">view_profile()</a>
          <button class="dropdown-item" onclick="handleSignOut()">log_out()</button>
        </div>
      `;
      const blogBtn = desktopAuthArea.querySelector('a[href="blog/index.html"]');
      if (blogBtn) {
        desktopAuthArea.insertBefore(userDropdown, blogBtn);
      } else {
        desktopAuthArea.appendChild(userDropdown);
      }
    } else {
      userDropdown.style.display = 'block';
    }

    const emailDiv = document.getElementById('dropdown-email');
    if (emailDiv) emailDiv.textContent = `email: "${truncatedEmail}"`;

  } else {
    if (userDropdown) {
      userDropdown.style.display = 'none';
    }

    if (!signInBtn) {
      signInBtn = document.createElement('a');
      signInBtn.href = 'login.html';
      signInBtn.className = 'nav-cta';
      signInBtn.id = 'nav-auth-btn';
      signInBtn.textContent = 'log_in()';
      const blogBtn = desktopAuthArea.querySelector('a[href="blog/index.html"]');
      if (blogBtn) {
        desktopAuthArea.insertBefore(signInBtn, blogBtn);
      } else {
        desktopAuthArea.appendChild(signInBtn);
      }
    } else {
      signInBtn.href = 'login.html';
      signInBtn.onclick = null; // Remove standard modal popup click handler
      signInBtn.style.display = 'inline-block';
    }
  }

  // 2. Update Mobile Navbar Account Section
  if (mobileAuthArea) {
    if (user) {
      mobileAuthArea.innerHTML = `
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--muted); margin-bottom: 0.8rem; word-break: break-all; background: var(--bg-raised-2); padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid var(--border);">
          email: "${user.email}"
        </div>
        <a href="profile.html" class="nav-cta" style="width: 100%; text-align: center; display: block; margin-bottom: 0.6rem;" onclick="toggleMenu();">view_profile()</a>
        <button class="nav-cta" style="width: 100%; text-align: center;" onclick="handleSignOut(); toggleMenu();">log_out()</button>
      `;
    } else {
      mobileAuthArea.innerHTML = `
        <a href="login.html" class="nav-cta" style="width: 100%; text-align: center; display: block;" onclick="toggleMenu();">log_in()</a>
      `;
    }
  }
}
