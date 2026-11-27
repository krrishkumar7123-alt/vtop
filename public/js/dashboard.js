/**
 * dashboard.js - Student Portal Dashboard Script
 * University Student Portal
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Session Timer setup
  initSessionTimer();

  // 2. Navigation, Dropdowns, and Sidebar controls
  initDropdowns();
  initSidebarAndFlyouts();
  initActions();

  // 3. Auth Check and Load Student Profile Data
  const student = await checkAuthAndLoadProfile();
  if (!student) return;

  // 4. Load Course Registrations and Attendance
  await loadCourses(student);
});

/**
 * Checks authentication status and populates user info across dashboard
 */
async function checkAuthAndLoadProfile() {
  try {
    const res = await fetch('/api/me', {
      method: 'GET',
      credentials: 'include'
    });

    if (res.status === 401 || !res.ok) {
      window.location.href = '/login';
      return null;
    }

    const student = await res.json();

    if (!student || !student.registerNumber) {
      window.location.href = '/login';
      return null;
    }

    populateUserData(student);
    return student;
  } catch (err) {
    console.error('Error verifying authentication:', err);
    window.location.href = '/login';
    return null;
  }
}

/**
 * Populates student data into the dashboard elements
 */
function populateUserData(student) {
  // Welcome message
  const welcomeMsg = document.getElementById('welcomeMessage');
  if (welcomeMsg) {
    welcomeMsg.textContent = `Welcome, ${student.name}! 👋`;
  }

  // Header user info
  const userRegNumber = document.getElementById('userRegNumber');
  if (userRegNumber) userRegNumber.textContent = student.registerNumber;

  // User photo
  const userPhoto = document.getElementById('userPhoto');
  const userAvatarFallback = document.getElementById('userAvatarFallback');

  if (student.photoUrl) {
    if (userPhoto) {
      userPhoto.src = student.photoUrl;
      userPhoto.style.display = '';
    }
    if (userAvatarFallback) userAvatarFallback.style.display = 'none';
  } else {
    if (userPhoto) userPhoto.style.display = 'none';
    if (userAvatarFallback) {
      userAvatarFallback.style.display = 'flex';
      const initials = (student.name || 'ST')
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      userAvatarFallback.textContent = initials;
    }
  }

  // CGPA and Credits
  const creditsRequired = document.getElementById('creditsRequired');
  const creditsEarned = document.getElementById('creditsEarned');
  const currentCGPA = document.getElementById('currentCGPA');

  if (creditsRequired && student.credits) {
    creditsRequired.textContent = student.credits.required || 160;
  }
  if (creditsEarned && student.credits) {
    creditsEarned.textContent = student.credits.earned || 0;
  }
  if (currentCGPA) {
    currentCGPA.textContent = student.cgpa ? student.cgpa.toFixed(2) : '0.00';
  }

  // Proctor message
  const proctorNameEl = document.getElementById('proctorName');
  if (proctorNameEl && student.proctor && student.proctor.proctorName) {
    proctorNameEl.textContent = `- ${student.proctor.proctorName}`;
  }
}

/**
 * Fetches courses from API and renders the course registration table
 */
async function loadCourses(student) {
  const tableBody = document.getElementById('courseTableBody');
  if (!tableBody) return;

  try {
    const res = await fetch('/api/courses', {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:#c62828;">Unable to load courses.</td></tr>';
      return;
    }

    const data = await res.json();
    const courses = data.courses || [];

    if (courses.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:#666;">No courses registered for the current semester.</td></tr>';
      return;
    }

    tableBody.innerHTML = '';

    courses.forEach((course, index) => {
      const tr = document.createElement('tr');
      const attendance = Number(course.attendance) || 0;

      // Determine badge
      let badgeClass, badgeText;
      if (attendance >= 90) {
        badgeClass = 'badge-excellent';
        badgeText = 'Excellent ✓';
      } else if (attendance >= 75) {
        badgeClass = 'badge-good';
        badgeText = 'Good';
      } else {
        badgeClass = 'badge-critical';
        badgeText = 'Critical - Must Improve ⚠️';
      }

      tr.innerHTML = `
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(course.code)}</strong> - ${escapeHtml(course.title)}</td>
        <td>${escapeHtml(course.type)}</td>
        <td style="text-align:center;font-weight:600;">${attendance}%</td>
        <td><span class="attendance-badge ${badgeClass}">${badgeText}</span></td>
      `;

      tableBody.appendChild(tr);
    });

  } catch (err) {
    console.error('Error fetching courses:', err);
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:#c62828;">Error loading courses.</td></tr>';
  }
}

/**
 * Initializes session timer counting up from 00:00 every second.
 * Auto-logout after 30 minutes.
 */
function initSessionTimer() {
  const timerElem = document.getElementById('sessionTimer');

  let loginTime = sessionStorage.getItem('portal_login_time');
  if (!loginTime) {
    loginTime = Date.now().toString();
    sessionStorage.setItem('portal_login_time', loginTime);
  }

  const startTime = parseInt(loginTime, 10);
  const MAX_SECONDS = 1800; // 30 minutes

  function updateTimer() {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

    if (elapsedSeconds >= MAX_SECONDS) {
      handleAutoLogout();
      return;
    }

    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (timerElem) {
      timerElem.textContent = formatted;
    }
  }

  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);

  async function handleAutoLogout() {
    clearInterval(timerInterval);
    sessionStorage.removeItem('portal_login_time');

    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) { /* continue */ }

    window.location.href = '/login?timeout=1';
  }
}

/**
 * Initializes dropdown menus
 */
function initDropdowns() {
  // Quick Links dropdown
  const quickLinksBtn = document.getElementById('quickLinksBtn');
  const quickLinksDropdown = document.getElementById('quickLinksDropdown');

  if (quickLinksBtn && quickLinksDropdown) {
    quickLinksBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      quickLinksDropdown.classList.toggle('show');
      // Close user dropdown
      const ud = document.getElementById('userDropdown');
      if (ud) ud.classList.remove('show');
    });
  }

  // User Profile Dropdown - click on the user-info container
  const userInfoContainer = document.getElementById('userInfoContainer');
  const userDropdown = document.getElementById('userDropdown');

  if (userInfoContainer && userDropdown) {
    userInfoContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
      // Close quick links
      if (quickLinksDropdown) quickLinksDropdown.classList.remove('show');
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    if (quickLinksDropdown) quickLinksDropdown.classList.remove('show');
    if (userDropdown) userDropdown.classList.remove('show');
  });
}

/**
 * Initializes sidebar flyouts and hamburger menu
 */
function initSidebarAndFlyouts() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('sidebar');

  if (hamburgerBtn && sidebar) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });
  }

  // Sidebar flyout buttons
  const sidebarIcons = document.querySelectorAll('[data-flyout]');

  sidebarIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      const flyoutId = icon.getAttribute('data-flyout');
      const targetFlyout = document.getElementById(flyoutId);
      if (!targetFlyout) return;

      const isOpen = targetFlyout.classList.contains('show');
      closeAllFlyouts();
      if (!isOpen) {
        targetFlyout.classList.add('show');
      }
    });
  });

  // Icons without flyout - show tooltip only
  const plainIcons = document.querySelectorAll('.sidebar-icon:not([data-flyout])');
  plainIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllFlyouts();
      const tooltip = icon.getAttribute('data-tooltip') || 'Module';
      alert(`${tooltip} - Coming soon!`);
    });
  });

  // Close flyouts when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.flyout') && !e.target.closest('[data-flyout]')) {
      closeAllFlyouts();
    }
    // Close mobile sidebar on outside click
    if (sidebar && !e.target.closest('.sidebar') && !e.target.closest('#hamburgerBtn')) {
      sidebar.classList.remove('open');
    }
  });

  function closeAllFlyouts() {
    document.querySelectorAll('.flyout').forEach(f => f.classList.remove('show'));
  }
}

/**
 * Initializes global user actions
 */
function initActions() {
  // Change Password
  const changePasswordBtn = document.getElementById('changePasswordBtn');
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Password change feature coming soon.');
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      sessionStorage.removeItem('portal_login_time');
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      } catch (err) { /* continue */ }
      window.location.href = '/login';
    });
  }
}

/**
 * Escape HTML characters
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
