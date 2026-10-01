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

    // Also fetch user assignments
    await fetchUserAssignments(user);

    // Initialize tabs based on URL hash (e.g. #assignments)
    initProfileTabs();
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

/* ==========================================================
   ASSIGNMENTS & SUBMISSIONS MANAGEMENT
   ========================================================== */

let _userSubmissions = [];
let _activeSubmissionType = 'code';

/**
 * Initialize tab selection based on URL hash and pre-fill params from lessons
 */
function initProfileTabs() {
  const hash = window.location.hash.toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);
  const courseParam = urlParams.get('course');
  const lectureParam = urlParams.get('lecture');
  const titleParam = urlParams.get('title');

  if (hash === '#assignments' || courseParam || lectureParam || titleParam) {
    switchProfileTab('assignments');

    // Pre-fill submission form if coming from a lesson
    if (courseParam || lectureParam || titleParam) {
      if (courseParam) {
        const courseSelect = document.getElementById('assignment-course');
        if (courseSelect) {
          const normCourse = courseParam.toLowerCase() === 'c++' ? 'cpp' : courseParam.toLowerCase();
          courseSelect.value = normCourse;
        }
      }
      if (lectureParam) {
        const lectureInput = document.getElementById('assignment-lecture');
        if (lectureInput) {
          lectureInput.value = 'Lecture ' + lectureParam;
        }
      }
      if (titleParam) {
        const titleInput = document.getElementById('assignment-title');
        if (titleInput) {
          titleInput.value = decodeURIComponent(titleParam);
        }
      }

      // Automatically expand the submission form and focus code textarea
      const form = document.getElementById('assignment-submit-form');
      if (form && form.classList.contains('hidden')) {
        toggleNewSubmissionForm();
      }
      setTimeout(() => {
        const codeArea = document.getElementById('assignment-code');
        if (codeArea) codeArea.focus();
      }, 300);
    }
  } else {
    switchProfileTab('profile');
  }
}

/**
 * Switch between user_profile() and assignments() tabs
 * @param {'profile' | 'assignments'} tabName
 */
function switchProfileTab(tabName) {
  const profileTabBtn = document.getElementById('tab-btn-profile');
  const assignmentsTabBtn = document.getElementById('tab-btn-assignments');
  const profilePane = document.getElementById('tab-profile-pane');
  const assignmentsPane = document.getElementById('tab-assignments-pane');

  if (tabName === 'assignments') {
    if (profileTabBtn) profileTabBtn.classList.remove('active');
    if (assignmentsTabBtn) assignmentsTabBtn.classList.add('active');
    if (profilePane) profilePane.classList.add('hidden');
    if (assignmentsPane) assignmentsPane.classList.remove('hidden');
    history.replaceState(null, null, '#assignments');
  } else {
    if (profileTabBtn) profileTabBtn.classList.add('active');
    if (assignmentsTabBtn) assignmentsTabBtn.classList.remove('active');
    if (profilePane) profilePane.classList.remove('hidden');
    if (assignmentsPane) assignmentsPane.classList.add('hidden');
    history.replaceState(null, null, '#profile');
  }
}

/**
 * Toggle the visibility of the "Submit New Assignment" form
 */
function toggleNewSubmissionForm() {
  const form = document.getElementById('assignment-submit-form');
  const icon = document.getElementById('toggle-btn-icon');
  const text = document.getElementById('toggle-btn-text');

  if (!form) return;

  const isHidden = form.classList.contains('hidden');
  if (isHidden) {
    form.classList.remove('hidden');
    if (icon) icon.textContent = '✕';
    if (text) text.textContent = 'Close Form';
  } else {
    form.classList.add('hidden');
    if (icon) icon.textContent = '+';
    if (text) text.textContent = 'New Submission';
  }
}

/**
 * Change the active submission type (code, link, or file)
 * @param {'code' | 'link' | 'file'} type
 */
function setSubmissionType(type) {
  _activeSubmissionType = type;

  // Update button classes
  document.querySelectorAll('.sub-type-toggle .type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-type') === type);
  });

  // Toggle input groups
  const groupCode = document.getElementById('input-group-code');
  const groupLink = document.getElementById('input-group-link');
  const groupFile = document.getElementById('input-group-file');

  if (groupCode) groupCode.classList.toggle('hidden', type !== 'code');
  if (groupLink) groupLink.classList.toggle('hidden', type !== 'link');
  if (groupFile) groupFile.classList.toggle('hidden', type !== 'file');
}

/**
 * Fetch all assignment submissions for the current user
 * @param {object} user - Authenticated user object
 */
async function fetchUserAssignments(user) {
  const loader = document.getElementById('submissions-loading');
  const warningBox = document.getElementById('assignments-table-warning');
  if (loader) loader.classList.remove('hidden');

  try {
    const { data, error } = await _supabase
      .from('assignment_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        if (warningBox) warningBox.classList.remove('hidden');
        renderSubmissionsList([]);
        return;
      }
      throw error;
    }

    if (warningBox) warningBox.classList.add('hidden');
    _userSubmissions = data || [];

    // Update stats and counter badges
    updateAssignmentStats(_userSubmissions);
    renderSubmissionsList(_userSubmissions);
  } catch (err) {
    console.error("Error fetching assignments:", err);
  } finally {
    if (loader) loader.classList.add('hidden');
  }
}

/**
 * Recalculate summary stats and badge counts
 * @param {Array} submissions
 */
function updateAssignmentStats(submissions) {
  const badge = document.getElementById('assignments-badge');
  const statTotal = document.getElementById('stat-total-submissions');
  const statPending = document.getElementById('stat-pending-submissions');
  const statApproved = document.getElementById('stat-approved-submissions');

  const total = submissions.length;
  const pending = submissions.filter(s => s.status === 'submitted').length;
  const approved = submissions.filter(s => s.status === 'approved').length;

  if (badge) badge.textContent = total;
  if (statTotal) statTotal.textContent = total;
  if (statPending) statPending.textContent = pending;
  if (statApproved) statApproved.textContent = approved;
}

/**
 * Render list of submissions to the DOM
 * @param {Array} submissions
 */
function renderSubmissionsList(submissions) {
  const container = document.getElementById('submissions-list');
  if (!container) return;

  if (!submissions || submissions.length === 0) {
    container.innerHTML = `
      <div class="empty-submissions-state">
        <div class="empty-icon">📂</div>
        <h3 class="empty-title">no_submissions_found()</h3>
        <p class="empty-text">You haven't submitted any assignment solutions yet. Click <strong>+ New Submission</strong> above or complete an exercise in your course lessons.</p>
        <button type="button" class="enroll-btn" onclick="toggleNewSubmissionForm()">+ Submit Assignment</button>
      </div>
    `;
    return;
  }

  container.innerHTML = submissions.map((sub, idx) => {
    const formattedDate = new Date(sub.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const statusClass = sub.status || 'submitted';
    const statusLabels = {
      submitted: 'Under Review',
      reviewed: 'Reviewed',
      approved: 'Approved',
      needs_revision: 'Needs Work'
    };
    const statusText = statusLabels[sub.status] || sub.status.toUpperCase();

    // Render content based on type
    let contentHtml = '';
    if (sub.submission_type === 'code' && sub.content) {
      contentHtml = `
        <div class="submission-content-preview">
          <button type="button" class="toggle-details-btn" onclick="toggleSubmissionDetails(${idx})">
            <span id="sub-toggle-icon-${idx}">▶</span> View Source Code
          </button>
          <div id="sub-details-${idx}" class="hidden">
            <pre class="submission-code-box"><code>${escapeHtml(sub.content)}</code></pre>
          </div>
        </div>
      `;
    } else if (sub.submission_type === 'link' && sub.content) {
      contentHtml = `
        <div class="submission-content-preview">
          <a href="${escapeHtml(sub.content)}" target="_blank" rel="noopener noreferrer" class="submission-link-view">
            🔗 ${escapeHtml(sub.content)}
          </a>
        </div>
      `;
    } else if (sub.file_name) {
      contentHtml = `
        <div class="submission-content-preview">
          <span class="lecture-tag-badge">📁 File: ${escapeHtml(sub.file_name)}</span>
        </div>
      `;
    }

    // Optional student notes
    let notesHtml = '';
    if (sub.notes) {
      notesHtml = `
        <div class="submission-notes-box">
          <strong>Notes:</strong> ${escapeHtml(sub.notes)}
        </div>
      `;
    }

    // Optional reviewer feedback
    let feedbackHtml = '';
    if (sub.feedback) {
      feedbackHtml = `
        <div class="submission-feedback-box">
          <div class="feedback-title">Feedback & Remarks:</div>
          <p>${escapeHtml(sub.feedback)}</p>
        </div>
      `;
    }

    return `
      <div class="submission-item" id="submission-item-${idx}">
        <div class="submission-item-top">
          <div class="submission-info-group">
            <div class="submission-tags-row">
              <span class="course-tag">${escapeHtml(sub.course_id || 'course')}</span>
              <span class="lecture-tag-badge">Lecture ${sub.lecture_number !== null ? sub.lecture_number : '0'}</span>
            </div>
            <h3 class="submission-exercise-title">${escapeHtml(sub.exercise_title || 'Exercise Submission')}</h3>
          </div>
          <div class="status-badge ${statusClass}">
            <span>●</span> ${statusText}
          </div>
        </div>

        <div class="submission-meta-row">
          <span>Submitted: ${formattedDate}</span>
          <span>Format: ${escapeHtml(sub.submission_type)}</span>
          ${sub.grade ? `<span>Grade: <strong>${escapeHtml(sub.grade)}</strong></span>` : ''}
        </div>

        ${notesHtml}
        ${feedbackHtml}
        ${contentHtml}
      </div>
    `;
  }).join('');
}

/**
 * Filter submissions list by selected course
 */
function filterSubmissions() {
  const select = document.getElementById('submissions-filter-course');
  const selectedCourse = select ? select.value : 'all';

  if (selectedCourse === 'all') {
    renderSubmissionsList(_userSubmissions);
  } else {
    const filtered = _userSubmissions.filter(s => (s.course_id || '').toLowerCase() === selectedCourse.toLowerCase());
    renderSubmissionsList(filtered);
  }
}

/**
 * Toggle code preview box inside submission item
 * @param {number} idx
 */
function toggleSubmissionDetails(idx) {
  const box = document.getElementById(`sub-details-${idx}`);
  const icon = document.getElementById(`sub-toggle-icon-${idx}`);
  if (!box) return;

  const isHidden = box.classList.contains('hidden');
  if (isHidden) {
    box.classList.remove('hidden');
    if (icon) icon.textContent = '▼';
  } else {
    box.classList.add('hidden');
    if (icon) icon.textContent = '▶';
  }
}

/**
 * Handle new assignment form submission
 */
async function handleAssignmentSubmit(event) {
  event.preventDefault();
  clearAssignmentMessages();

  const course = document.getElementById('assignment-course').value;
  const lectureVal = document.getElementById('assignment-lecture').value.trim();
  const title = document.getElementById('assignment-title').value.trim();
  const notes = document.getElementById('assignment-notes').value.trim();

  let content = '';
  let fileName = '';

  if (_activeSubmissionType === 'code') {
    content = document.getElementById('assignment-code').value.trim();
    if (!content) {
      showAssignmentError("Please provide your code snippet before submitting.");
      return;
    }
  } else if (_activeSubmissionType === 'link') {
    content = document.getElementById('assignment-link').value.trim();
    if (!content || !content.startsWith('http')) {
      showAssignmentError("Please enter a valid GitHub or Colab URL starting with http:// or https://.");
      return;
    }
  } else if (_activeSubmissionType === 'file') {
    const fileInput = document.getElementById('assignment-file');
    if (!fileInput.files || fileInput.files.length === 0) {
      showAssignmentError("Please select a file to upload.");
      return;
    }
    const file = fileInput.files[0];
    fileName = file.name;
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAssignmentError("The selected file exceeds the 5MB size limit.");
      return;
    }
    content = `Uploaded file: ${file.name} (${Math.round(file.size / 1024)} KB)`;
  }

  const submitBtn = document.getElementById('assignment-submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const loader = submitBtn.querySelector('.btn-loader');
  const successBox = document.getElementById('assignment-success-msg');

  if (!_supabase) {
    showAssignmentError("Database connection is not configured.");
    return;
  }

  submitBtn.disabled = true;
  if (loader) loader.style.display = 'inline-block';
  if (btnText) btnText.style.opacity = '0.5';

  try {
    const { data: { user }, error: userError } = await _supabase.auth.getUser();
    if (userError || !user) throw new Error("Authentication error. Please log in again.");

    // Extract lecture number
    const lectureNumMatch = lectureVal.match(/\d+/);
    const lectureNumber = lectureNumMatch ? parseInt(lectureNumMatch[0], 10) : 0;

    const payload = {
      user_id: user.id,
      course_id: course,
      lecture_number: lectureNumber,
      exercise_title: title,
      submission_type: _activeSubmissionType,
      content: content,
      file_name: fileName || null,
      notes: notes || null,
      status: 'submitted',
      updated_at: new Date().toISOString()
    };

    const { error: insertError } = await _supabase
      .from('assignment_submissions')
      .insert(payload);

    if (insertError) {
      if (insertError.code === '42P01') {
        throw new Error("The 'assignment_submissions' table does not exist in Supabase yet. Please execute scripts/setup_assignments.sql in your Supabase SQL Editor.");
      }
      throw insertError;
    }

    // Success feedback
    if (successBox) {
      successBox.textContent = "Assignment submitted successfully! Our reviewers will inspect your solution.";
      successBox.style.display = 'block';
      setTimeout(() => {
        successBox.style.display = 'none';
      }, 5000);
    }

    // Reset form and refresh list
    document.getElementById('assignment-submit-form').reset();
    setSubmissionType('code');
    toggleNewSubmissionForm();
    await fetchUserAssignments(user);
  } catch (err) {
    console.error("Assignment submission error:", err);
    showAssignmentError(err.message || "Failed to submit assignment. Please try again.");
  } finally {
    submitBtn.disabled = false;
    if (loader) loader.style.display = 'none';
    if (btnText) btnText.style.opacity = '1';
  }
}

function showAssignmentError(msg) {
  const box = document.getElementById('assignment-error-msg');
  if (box) {
    box.textContent = msg;
    box.style.display = 'block';
  }
}

function clearAssignmentMessages() {
  const errorBox = document.getElementById('assignment-error-msg');
  const successBox = document.getElementById('assignment-success-msg');
  if (errorBox) errorBox.style.display = 'none';
  if (successBox) successBox.style.display = 'none';
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
