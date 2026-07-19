/**
 * Code Tutorium - User Profile Management
 * Fetches, populates, and updates user profile data in Supabase.
 */

document.addEventListener('DOMContentLoaded', () => {
  checkAndFetchProfile();
});

/**
 * Validates authentication session and routes UI display
 */
async function checkAndFetchProfile() {
  const loadingOverlay = document.getElementById('profile-loading-overlay');
  const profileForm = document.getElementById('profile-form');
  const unauthBox = document.getElementById('profile-unauth-box');
  const errorBox = document.getElementById('profile-error-msg');

  // Verify Supabase integration
  if (!_supabase) {
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
    if (profileForm) profileForm.classList.add('hidden');
    if (unauthBox) unauthBox.classList.add('hidden');
    if (errorBox) {
      errorBox.innerHTML = `Supabase is not configured.<br>Please set <strong>SUPABASE_URL</strong> and <strong>SUPABASE_ANON_KEY</strong> in <code>supabase-auth.js</code>.`;
      errorBox.classList.remove('hidden');
    }
    return;
  }

  try {
    const { data: { session }, error: sessionError } = await _supabase.auth.getSession();
    if (sessionError) throw sessionError;

    if (!session || !session.user) {
      // User is not authenticated, show sign-in prompt
      if (loadingOverlay) loadingOverlay.classList.add('hidden');
      if (profileForm) profileForm.classList.add('hidden');
      if (unauthBox) unauthBox.classList.remove('hidden');
      return;
    }

    // Load database values
    const user = session.user;
    await fetchUserProfile(user);
  } catch (err) {
    console.error("Session loading error:", err);
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
    if (errorBox) {
      errorBox.textContent = err.message || "Failed to load session details.";
      errorBox.classList.remove('hidden');
    }
  }
}

/**
 * Query database profile row
 * @param {object} user - Authenticated user object
 */
async function fetchUserProfile(user) {
  const loadingOverlay = document.getElementById('profile-loading-overlay');
  const profileForm = document.getElementById('profile-form');
  const errorBox = document.getElementById('profile-error-msg');

  try {
    const { data, error } = await _supabase
      .from('profiles')
      .select('full_name, age, profession, programming_experience, github_username, bio')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      // 42P01 indicates the table does not exist
      if (error.code === '42P01') {
        throw new Error("The 'profiles' table does not exist in your database. Please run the SQL setup script in your Supabase SQL Editor.");
      }
      throw error;
    }

    // Populate inputs
    if (data) {
      document.getElementById('profile-name').value = data.full_name || '';
      document.getElementById('profile-age').value = data.age || '';
      document.getElementById('profile-profession').value = data.profession || '';
      document.getElementById('profile-experience').value = data.programming_experience || '';
      document.getElementById('profile-github').value = data.github_username || '';
      document.getElementById('profile-bio').value = data.bio || '';
    } else {
      // Pre-fill full name from email metadata if it's a new profile row
      const metaName = user.user_metadata?.full_name || '';
      document.getElementById('profile-name').value = metaName;
    }

    // Hide loader and display form
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
    if (profileForm) profileForm.classList.remove('hidden');
  } catch (err) {
    console.error("Error reading profile:", err);
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
    if (errorBox) {
      errorBox.textContent = "Failed to load profile details: " + err.message;
      errorBox.classList.remove('hidden');
      errorBox.style.display = 'block';
    }
  }
}

/**
 * Handle profile update form submission
 */
async function handleProfileSubmit(event) {
  event.preventDefault();
  clearProfileMessages();

  const name = document.getElementById('profile-name').value.trim();
  const ageVal = document.getElementById('profile-age').value;
  const age = ageVal ? parseInt(ageVal, 10) : null;
  const profession = document.getElementById('profile-profession').value;
  const experience = document.getElementById('profile-experience').value;
  const github = document.getElementById('profile-github').value.trim();
  const bio = document.getElementById('profile-bio').value.trim();

  const submitBtn = document.getElementById('profile-submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const loader = submitBtn.querySelector('.btn-loader');
  const successBox = document.getElementById('profile-success-msg');
  const errorBox = document.getElementById('profile-error-msg');

  if (!_supabase) return;

  // Set submitting status
  submitBtn.disabled = true;
  if (loader) loader.style.display = 'inline-block';
  if (btnText) btnText.style.opacity = '0.5';

  try {
    const { data: { user }, error: userError } = await _supabase.auth.getUser();
    if (userError) throw userError;

    if (!user) throw new Error("No user session found. Please sign in again.");

    // Upsert to profiles table
    const { error: upsertError } = await _supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: name,
        age: age,
        profession: profession,
        programming_experience: experience,
        github_username: github,
        bio: bio,
        updated_at: new Date().toISOString()
      });

    if (upsertError) throw upsertError;

    if (successBox) {
      successBox.textContent = "Profile updated successfully!";
      successBox.style.display = 'block';
      setTimeout(() => {
        successBox.style.display = 'none';
      }, 4000);
    }
  } catch (err) {
    console.error("Profile save error:", err);
    if (errorBox) {
      errorBox.textContent = "Failed to save profile: " + (err.message || "Unknown error");
      errorBox.style.display = 'block';
    }
  } finally {
    submitBtn.disabled = false;
    if (loader) loader.style.display = 'none';
    if (btnText) btnText.style.opacity = '1';
  }
}

/**
 * Clear status banner divs
 */
function clearProfileMessages() {
  const errorBox = document.getElementById('profile-error-msg');
  const successBox = document.getElementById('profile-success-msg');
  if (errorBox) errorBox.style.display = 'none';
  if (successBox) successBox.style.display = 'none';
}
