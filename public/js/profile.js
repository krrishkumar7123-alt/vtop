/**
 * profile.js - Student Profile Script
 * University Student Portal
 */

// Global state for student data and editing mode
let currentStudent = null;
const sectionEditState = {
  header: false,
  personal: false,
  educational: false,
  family: false,
  proctor: false,
  hostel: false
};

// Section Definitions & Field Mappings
const SECTION_CONFIGS = {
  personal: {
    name: 'personal',
    title: 'Personal Information',
    fields: [
      { key: 'applicationNumber', label: 'Application Number', readOnly: true },
      { key: 'name', label: 'Name' },
      { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
      { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
      { key: 'nativeLanguage', label: 'Native Language' },
      { key: 'nativeState', label: 'Native State' },
      { key: 'bloodGroup', label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      { key: 'physicallyChallenged', label: 'Physically Challenged', type: 'select', options: ['No', 'Yes'] },
      { key: 'community', label: 'Community' },
      { key: 'religion', label: 'Religion' },
      { key: 'nationality', label: 'Nationality' },
      { key: 'hosteller', label: 'Hosteller', type: 'select', options: ['Yes', 'No', 'Day Scholar'] },
      { key: 'governmentIdNumber', label: 'Government ID Number' },
      { key: 'mobileNumber', label: 'Mobile Number', type: 'tel' },
      { subheader: 'Current Address' },
      { key: 'currentAddress.street', label: 'Street' },
      { key: 'currentAddress.area', label: 'Area' },
      { key: 'currentAddress.city', label: 'City' },
      { key: 'currentAddress.state', label: 'State' },
      { key: 'currentAddress.country', label: 'Country' },
      { key: 'currentAddress.pincode', label: 'Pincode' },
      { key: 'currentAddress.landline', label: 'Landline' },
      { key: 'currentAddress.email', label: 'Email', type: 'email' },
      { subheader: 'Permanent Address' },
      { key: 'permanentAddress.street', label: 'Street' },
      { key: 'permanentAddress.area', label: 'Area' },
      { key: 'permanentAddress.city', label: 'City' },
      { key: 'permanentAddress.state', label: 'State' },
      { key: 'permanentAddress.country', label: 'Country' },
      { key: 'permanentAddress.pincode', label: 'Pincode' },
      { key: 'permanentAddress.landline', label: 'Landline' },
      { key: 'permanentAddress.email', label: 'Email', type: 'email' },
      { key: 'permanentAddress.friendMobileNumber', label: 'Friend Mobile Number', type: 'tel' }
    ]
  },
  educational: {
    name: 'educational',
    title: 'Educational Details',
    fields: [
      { key: 'appliedDegree', label: 'Applied Degree' },
      { key: 'qualification', label: 'Qualification' },
      { key: 'branchGroupStudied', label: 'Branch/Group Studied' },
      { key: 'schoolName', label: 'School Name' },
      { key: 'mediumOfStudy', label: 'Medium of Study' },
      { key: 'board', label: 'Board' },
      { key: 'registerRollNo', label: 'Register/Roll No' },
      { key: 'classObtained', label: 'Class Obtained' },
      { key: 'yearOfPassing', label: 'Year of Passing' },
      { key: 'monthOfPassing', label: 'Month of Passing' },
      { subheader: 'School Address' },
      { key: 'schoolAddress.area', label: 'Area' },
      { key: 'schoolAddress.cityDistrict', label: 'City/District' },
      { key: 'schoolAddress.state', label: 'State' },
      { key: 'schoolAddress.pincode', label: 'Pincode' },
      { key: 'schoolAddress.landline', label: 'Landline' },
      { key: 'breakInStudy', label: 'Break in Study', type: 'select', options: ['No', 'Yes'] },
      { key: 'breakReason', label: 'Reason' }
    ]
  },
  family: {
    name: 'family',
    title: 'Family Details',
    fields: [
      { key: 'numberOfBrothers', label: 'No. of Brothers', type: 'number' },
      { key: 'numberOfSisters', label: 'No. of Sisters', type: 'number' },
      { key: 'siblingStudyingInUniversity', label: 'Sibling Studying in University', type: 'select', options: ['No', 'Yes'] },
      { key: 'siblingStudyingDetails', label: 'Details' },
      { key: 'siblingStudied', label: 'Sibling Studied', type: 'select', options: ['No', 'Yes'] },
      { key: 'siblingStudiedDetails', label: 'Details' },
      { subheader: 'Father Details' },
      ...buildParentFields('father'),
      { subheader: 'Mother Details' },
      ...buildParentFields('mother'),
      { subheader: 'Guardian Info' },
      ...buildParentFields('guardian')
    ]
  },
  proctor: {
    name: 'proctor',
    title: 'Proctor Details',
    fields: [
      { key: 'proctorName', label: 'Proctor Name' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'designation', label: 'Designation' },
      { key: 'school', label: 'School' },
      { key: 'cabinRoom', label: 'Cabin/Room' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'mobile', label: 'Mobile', type: 'tel' }
    ]
  },
  hostel: {
    name: 'hostel',
    title: 'Hostel Details',
    fields: [
      { key: 'applicationNumber', label: 'Application Number', readOnly: true },
      { key: 'registerNumber', label: 'Register Number', readOnly: true },
      { key: 'blockName', label: 'Block Name' },
      { key: 'roomNo', label: 'Room No' },
      { key: 'bedType', label: 'Bed Type' },
      { key: 'messInformation', label: 'Mess Information' }
    ]
  }
};

/**
 * Generates field definitions for parent/guardian sections
 * @param {string} prefix 
 * @returns {Array<Object>}
 */
function buildParentFields(prefix) {
  return [
    { key: `${prefix}.name`, label: 'Name' },
    { key: `${prefix}.qualification`, label: 'Qualification' },
    { key: `${prefix}.occupation`, label: 'Occupation' },
    { key: `${prefix}.organization`, label: 'Organization' },
    { key: `${prefix}.employeeId`, label: 'Employee ID' },
    { key: `${prefix}.mobile`, label: 'Mobile', type: 'tel' },
    { key: `${prefix}.email`, label: 'Email', type: 'email' },
    { key: `${prefix}.annualIncome`, label: 'Annual Income' },
    { key: `${prefix}.officialAddress`, label: 'Official Address' },
    { key: `${prefix}.state`, label: 'State' },
    { key: `${prefix}.city`, label: 'City' },
    { key: `${prefix}.pincode`, label: 'Pincode' },
    { key: `${prefix}.landline`, label: 'Landline' },
    { key: `${prefix}.designation`, label: 'Designation' }
  ];
}

// Initialization on DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Session Timer setup
  initSessionTimer();

  // 2. Navigation, Dropdowns, Sidebar, and Action buttons
  initDropdowns();
  initSidebarAndFlyouts();
  initActions();

  // 3. Authenticate and Load Student Data
  await checkAuthAndLoadProfile();
});

/**
 * Authenticates user, loads student profile and renders UI
 */
async function checkAuthAndLoadProfile() {
  try {
    const res = await fetch('/api/me', {
      method: 'GET',
      credentials: 'include'
    });

    if (res.status === 401 || !res.ok) {
      window.location.href = '/login';
      return;
    }

    const data = await res.json();
    currentStudent = data.student || data;

    if (!currentStudent || !currentStudent.registerNumber) {
      window.location.href = '/login';
      return;
    }

    // Populate top header bar & profile card
    populateHeaderInfo(currentStudent);
    renderProfileTopCard(currentStudent);
    initPhotoUpload();

    // Render 5 Accordion Sections
    initAccordionSections(currentStudent);

  } catch (err) {
    console.error('Error fetching student profile:', err);
    window.location.href = '/login';
  }
}

/**
 * Populates header bar data (names, avatars, badges)
 * @param {Object} student 
 */
function populateHeaderInfo(student) {
  // Header user reg number
  const userRegNumber = document.getElementById('userRegNumber');
  if (userRegNumber) userRegNumber.textContent = student.registerNumber;

  // Header user photo
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
}

/**
 * Updates avatar images or generates initial fallback
 * @param {Object} student 
 */
function updateAvatars(student) {
  const avatarImgs = document.querySelectorAll('#userAvatar, #userPhoto, #profilePhotoImg, .user-avatar, .profile-avatar-img, .header-avatar');
  avatarImgs.forEach(img => {
    if (student.photoUrl) {
      img.src = student.photoUrl;
      img.alt = student.name || 'Photo';
    } else {
      if (img.tagName.toLowerCase() === 'img') {
        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Student')}&background=0D47A1&color=fff&size=160&bold=true`;
      } else {
        const initials = (student.name || 'ST')
          .split(' ')
          .map(n => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();
        img.textContent = initials;
      }
    }
  });
}

/**
 * Renders the top profile summary card (view or edit mode)
 * @param {Object} student 
 */
function renderProfileTopCard(student) {
  const topCard = document.getElementById('profileTopCard') || document.querySelector('.profile-top-card, .profile-header-card');
  if (!topCard) return;

  const isEditing = sectionEditState.header;

  const program = student.program || student.appliedDegree || '';
  const email = student.email || '';
  const school = student.school || '';
  const regNo = student.registerNumber || '';

  if (!isEditing) {
    topCard.innerHTML = `
      <div class="profile-card-inner">
        <div class="profile-avatar-wrapper" title="Click to change profile photo" style="cursor: pointer;">
          <img id="profilePhotoImg" class="profile-avatar-img" src="${student.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Student')}&background=0D47A1&color=fff&size=160&bold=true`}" alt="${escapeHtml(student.name)}">
          <div class="photo-upload-overlay">
            <span class="camera-icon">📷</span>
            <small>Change Photo</small>
          </div>
        </div>
        <div class="profile-info-content">
          <div class="profile-header-top">
            <div>
              <h2 class="profile-name">${escapeHtml(student.name)}</h2>
              <span class="badge badge-reg">${escapeHtml(regNo)}</span>
            </div>
            <button id="editHeaderBtn" class="btn btn-outline-primary btn-sm">
              ✏️ Edit Profile Info
            </button>
          </div>
          <div class="profile-meta-grid">
            <div class="meta-item">
              <span class="meta-label">Register Number:</span>
              <span class="meta-value readonly-val">${escapeHtml(regNo)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Program &amp; Branch:</span>
              <span class="meta-value">${escapeHtml(program) || '—'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Email:</span>
              <span class="meta-value">${escapeHtml(email) || '—'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">School:</span>
              <span class="meta-value">${escapeHtml(school) || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach Edit button listener
    const editBtn = topCard.querySelector('#editHeaderBtn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        sectionEditState.header = true;
        renderProfileTopCard(currentStudent);
      });
    }

    // Attach Photo upload trigger
    const avatarWrapper = topCard.querySelector('.profile-avatar-wrapper');
    if (avatarWrapper) {
      avatarWrapper.addEventListener('click', triggerPhotoUpload);
    }

  } else {
    // Edit Mode
    topCard.innerHTML = `
      <div class="profile-card-inner">
        <div class="profile-avatar-wrapper" style="opacity: 0.8;">
          <img id="profilePhotoImg" class="profile-avatar-img" src="${student.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Student')}&background=0D47A1&color=fff&size=160&bold=true`}" alt="${escapeHtml(student.name)}">
        </div>
        <div class="profile-info-content">
          <div class="profile-header-top">
            <div>
              <h2 class="profile-name">${escapeHtml(student.name)}</h2>
              <span class="badge badge-reg">${escapeHtml(regNo)}</span>
            </div>
          </div>
          <form id="headerEditForm" class="profile-meta-grid edit-grid">
            <div class="meta-item">
              <label class="meta-label">Register Number (Read-only):</label>
              <input type="text" class="form-input" value="${escapeHtml(regNo)}" disabled readonly>
            </div>
            <div class="meta-item">
              <label class="meta-label">Program &amp; Branch:</label>
              <input type="text" id="editHeaderProgram" class="form-input" value="${escapeHtml(program)}" required>
            </div>
            <div class="meta-item">
              <label class="meta-label">Email:</label>
              <input type="email" id="editHeaderEmail" class="form-input" value="${escapeHtml(email)}" required>
            </div>
            <div class="meta-item">
              <label class="meta-label">School:</label>
              <input type="text" id="editHeaderSchool" class="form-input" value="${escapeHtml(school)}" required>
            </div>
            <div class="meta-actions" style="grid-column: 1 / -1; display: flex; gap: 10px; margin-top: 10px;">
              <button type="submit" id="saveHeaderBtn" class="btn btn-primary">💾 Save</button>
              <button type="button" id="cancelHeaderBtn" class="btn btn-secondary">✕ Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const cancelBtn = topCard.querySelector('#cancelHeaderBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        sectionEditState.header = false;
        renderProfileTopCard(currentStudent);
      });
    }

    const form = topCard.querySelector('#headerEditForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedProgram = document.getElementById('editHeaderProgram').value.trim();
        const updatedEmail = document.getElementById('editHeaderEmail').value.trim();
        const updatedSchool = document.getElementById('editHeaderSchool').value.trim();

        await saveHeaderInfo({
          program: updatedProgram,
          email: updatedEmail,
          school: updatedSchool
        });
      });
    }
  }
}

/**
 * Saves top profile header information via PUT /api/me/header
 * @param {Object} headerData 
 */
async function saveHeaderInfo(headerData) {
  const saveBtn = document.getElementById('saveHeaderBtn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
  }

  try {
    const res = await fetch('/api/me/header', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(headerData)
    });

    const data = await res.json();

    if (res.ok) {
      // Update local state
      currentStudent.program = headerData.program;
      currentStudent.email = headerData.email;
      currentStudent.school = headerData.school;
      if (data.registerNumber) {
        currentStudent = { ...currentStudent, ...data };
      }

      sectionEditState.header = false;
      renderProfileTopCard(currentStudent);
      populateHeaderInfo(currentStudent);
      showToast('Profile header updated successfully!', 'success');
    } else {
      showToast(data.error || 'Failed to update header info.', 'error');
    }
  } catch (err) {
    console.error('Error updating header info:', err);
    showToast('Network error while saving changes.', 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Save';
    }
  }
}

/**
 * Sets up photo upload input and event handlers
 */
function initPhotoUpload() {
  let fileInput = document.getElementById('photoFileInput');
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'photoFileInput';
    fileInput.accept = 'image/png, image/jpeg, image/jpg, image/webp';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
  }

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, or WEBP).', 'error');
      fileInput.value = '';
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5MB.', 'error');
      fileInput.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    showToast('Uploading profile photo...', 'info');

    try {
      const res = await fetch('/api/me/photo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await res.json();

      if (res.ok && (data.success || data.photoUrl || data.photo)) {
        const newPhotoUrl = data.photoUrl || data.photo || (data.student && data.student.photoUrl);
        if (newPhotoUrl) {
          currentStudent.photoUrl = newPhotoUrl;
        } else {
          // Fallback to FileReader preview if server didn't send back URL
          const reader = new FileReader();
          reader.onload = (re) => {
            currentStudent.photoUrl = re.target.result;
            updateAvatars(currentStudent);
          };
          reader.readAsDataURL(file);
        }

        updateAvatars(currentStudent);
        showToast('Photo uploaded successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to upload photo.', 'error');
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      showToast('Network error uploading photo.', 'error');
    } finally {
      fileInput.value = '';
    }
  });
}

function triggerPhotoUpload() {
  const fileInput = document.getElementById('photoFileInput');
  if (fileInput) {
    fileInput.click();
  }
}

/**
 * Initializes and renders the 5 accordion sections
 * @param {Object} student 
 */
function initAccordionSections(student) {
  const accordionContainer = document.getElementById('profileAccordion') || 
                             document.querySelector('.profile-accordion, .accordion-container');

  const sectionKeys = ['personal', 'educational', 'family', 'proctor', 'hostel'];

  // If container exists, check if sections are already in the DOM or need rendering
  sectionKeys.forEach((secName, index) => {
    let sectionWrapper = document.getElementById(`section-${secName}`) || 
                         document.querySelector(`[data-section="${secName}"]`);

    if (!sectionWrapper && accordionContainer) {
      // Create accordion item element
      sectionWrapper = document.createElement('div');
      sectionWrapper.id = `section-${secName}`;
      sectionWrapper.className = 'accordion-item';
      sectionWrapper.setAttribute('data-section', secName);
      accordionContainer.appendChild(sectionWrapper);
    }

    if (sectionWrapper) {
      renderSection(secName, student, SECTION_CONFIGS[secName].fields, index === 0);
    }
  });
}

/**
 * Renders a single accordion section in either view or edit mode
 * @param {string} sectionName 
 * @param {Object} student 
 * @param {Array<Object>} fields 
 * @param {boolean} defaultOpen 
 */
function renderSection(sectionName, student, fields, defaultOpen = false) {
  const sectionWrapper = document.getElementById(`section-${sectionName}`) || 
                         document.querySelector(`[data-section="${sectionName}"]`);
  if (!sectionWrapper) return;

  const config = SECTION_CONFIGS[sectionName];
  const isEditing = sectionEditState[sectionName];

  // Preserve existing open/closed state if present
  let isOpen = defaultOpen;
  const existingContent = sectionWrapper.querySelector('.accordion-content');
  if (existingContent) {
    isOpen = existingContent.classList.contains('show') || existingContent.classList.contains('open');
  }

  // Get data source for this section
  const sectionDataSource = (student[sectionName] && typeof student[sectionName] === 'object')
    ? student[sectionName]
    : student;

  let contentHtml = '';

  if (!isEditing) {
    // VIEW MODE: Two-column table
    let rowsHtml = '';

    fields.forEach(field => {
      if (field.subheader) {
        rowsHtml += `
          <tr class="subheader-row">
            <th colspan="2" class="section-subheader">
              <span class="subheader-title">${escapeHtml(field.subheader)}</span>
            </th>
          </tr>
        `;
        return;
      }

      const rawVal = getNestedValue(sectionDataSource, field.key) || getNestedValue(student, field.key);
      const displayVal = formatDisplayValue(rawVal, field);

      rowsHtml += `
        <tr class="data-row">
          <td class="field-label">${escapeHtml(field.label)}</td>
          <td class="field-value">${escapeHtml(displayVal) || '<span class="empty-val">—</span>'}</td>
        </tr>
      `;
    });

    contentHtml = `
      <div class="table-responsive">
        <table class="table profile-details-table">
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;

  } else {
    // EDIT MODE: Input fields inside form
    let rowsHtml = '';

    fields.forEach(field => {
      if (field.subheader) {
        rowsHtml += `
          <tr class="subheader-row">
            <th colspan="2" class="section-subheader">
              <span class="subheader-title">${escapeHtml(field.subheader)}</span>
            </th>
          </tr>
        `;
        return;
      }

      const rawVal = getNestedValue(sectionDataSource, field.key) || getNestedValue(student, field.key);
      let inputHtml = '';

      if (field.readOnly) {
        inputHtml = `
          <input type="text" class="form-input readonly-input" value="${escapeHtml(rawVal)}" disabled readonly>
          <small class="readonly-hint">Read-only</small>
        `;
      } else if (field.type === 'select' && field.options) {
        const optionsHtml = field.options.map(opt => {
          const isSelected = String(rawVal).toLowerCase() === String(opt).toLowerCase() ? 'selected' : '';
          return `<option value="${escapeHtml(opt)}" ${isSelected}>${escapeHtml(opt)}</option>`;
        }).join('');

        inputHtml = `
          <select class="form-select" data-field="${field.key}">
            <option value="">Select ${escapeHtml(field.label)}</option>
            ${optionsHtml}
          </select>
        `;
      } else {
        const inputType = field.type || 'text';
        inputHtml = `
          <input type="${inputType}" class="form-input" data-field="${field.key}" value="${escapeHtml(rawVal)}">
        `;
      }

      rowsHtml += `
        <tr class="data-row edit-row">
          <td class="field-label">${escapeHtml(field.label)}</td>
          <td class="field-value">${inputHtml}</td>
        </tr>
      `;
    });

    contentHtml = `
      <form class="section-edit-form" id="form-${sectionName}">
        <div class="table-responsive">
          <table class="table profile-details-table edit-table">
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
        <div class="section-form-actions">
          <button type="submit" class="btn btn-primary btn-save">💾 Save Changes</button>
          <button type="button" class="btn btn-secondary btn-cancel">✕ Cancel</button>
        </div>
      </form>
    `;
  }

  // Construct Full Accordion Item
  sectionWrapper.innerHTML = `
    <div class="accordion-header" role="button" aria-expanded="${isOpen}">
      <div class="accordion-title-wrap">
        <span class="accordion-icon-bullet"></span>
        <h3 class="accordion-title">${escapeHtml(config.title)}</h3>
      </div>
      <div class="accordion-actions-wrap">
        ${!isEditing ? `
          <button type="button" class="btn btn-sm btn-edit-section" data-section="${sectionName}" title="Edit this section">
            ✏️ Edit
          </button>
        ` : ''}
        <span class="accordion-chevron">${isOpen ? '▲' : '▼'}</span>
      </div>
    </div>
    <div class="accordion-content ${isOpen ? 'show open' : ''}" style="${isOpen ? 'display: block;' : 'display: none;'}">
      <div class="accordion-body">
        ${contentHtml}
      </div>
    </div>
  `;

  // Attach event listeners for this section
  const headerElem = sectionWrapper.querySelector('.accordion-header');
  const contentElem = sectionWrapper.querySelector('.accordion-content');
  const chevronElem = sectionWrapper.querySelector('.accordion-chevron');

  // Toggle open/close accordion
  headerElem.addEventListener('click', (e) => {
    // If edit button was clicked, don't toggle open/close
    if (e.target.closest('.btn-edit-section') || e.target.closest('.section-form-actions')) {
      return;
    }

    const currentlyOpen = contentElem.classList.contains('show') || contentElem.classList.contains('open');
    if (currentlyOpen) {
      contentElem.classList.remove('show', 'open');
      contentElem.style.display = 'none';
      if (chevronElem) chevronElem.textContent = '▼';
      headerElem.setAttribute('aria-expanded', 'false');
    } else {
      contentElem.classList.add('show', 'open');
      contentElem.style.display = 'block';
      if (chevronElem) chevronElem.textContent = '▲';
      headerElem.setAttribute('aria-expanded', 'true');
    }
  });

  // Edit Section button
  const editBtn = sectionWrapper.querySelector('.btn-edit-section');
  if (editBtn) {
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sectionEditState[sectionName] = true;
      // Ensure section is open when entering edit mode
      renderSection(sectionName, currentStudent, fields, true);
    });
  }

  // Cancel edit button
  const cancelBtn = sectionWrapper.querySelector('.btn-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      sectionEditState[sectionName] = false;
      renderSection(sectionName, currentStudent, fields, true);
    });
  }

  // Save edit form submit
  const form = sectionWrapper.querySelector(`#form-${sectionName}`);
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSectionSave(sectionName, form, fields);
    });
  }
}

/**
 * Handles section data collection and submission to PUT /api/me/:section
 * @param {string} sectionName 
 * @param {HTMLFormElement} form 
 * @param {Array<Object>} fields 
 */
async function handleSectionSave(sectionName, form, fields) {
  const saveBtn = form.querySelector('.btn-save');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
  }

  // Collect input values and construct nested object
  const payload = {};
  const inputs = form.querySelectorAll('[data-field]');

  inputs.forEach(input => {
    const path = input.getAttribute('data-field');
    const val = input.value.trim();
    setNestedValue(payload, path, val);
  });

  try {
    const res = await fetch(`/api/me/${sectionName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      // The API returns the full student object via toSafeObject()
      if (data.registerNumber) {
        currentStudent = data;
      } else if (data[sectionName]) {
        currentStudent[sectionName] = data[sectionName];
      } else {
        if (!currentStudent[sectionName] || typeof currentStudent[sectionName] !== 'object') {
          currentStudent[sectionName] = {};
        }
        // Deep merge payload
        mergeDeep(currentStudent[sectionName], payload);
      }

      showToast(`${SECTION_CONFIGS[sectionName].title} updated successfully!`, 'success');

      // Exit edit mode and re-render in view mode
      sectionEditState[sectionName] = false;
      renderSection(sectionName, currentStudent, fields, true);

      // Re-populate header and top card in case shared fields (like name) changed
      populateHeaderInfo(currentStudent);
      renderProfileTopCard(currentStudent);

    } else {
      showToast(data.error || `Failed to update ${SECTION_CONFIGS[sectionName].title}.`, 'error');
    }
  } catch (err) {
    console.error(`Error saving ${sectionName} section:`, err);
    showToast(`Network error saving ${SECTION_CONFIGS[sectionName].title}.`, 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Save Changes';
    }
  }
}

/**
 * Helper: gets value from dot-notation path like 'currentAddress.street'
 * @param {Object} obj 
 * @param {string} path 
 * @returns {any}
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return '';
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr === null || curr === undefined) return '';
    curr = curr[part];
  }
  return curr !== undefined && curr !== null ? curr : '';
}

/**
 * Helper: sets value at dot-notation path like 'father.mobile'
 * @param {Object} obj 
 * @param {string} path 
 * @param {any} value 
 */
function setNestedValue(obj, path, value) {
  if (!obj || !path) return;
  const parts = path.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!curr[part] || typeof curr[part] !== 'object') {
      curr[part] = {};
    }
    curr = curr[part];
  }
  curr[parts[parts.length - 1]] = value;
}

/**
 * Deep merge utility for objects
 * @param {Object} target 
 * @param {Object} source 
 */
function mergeDeep(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      mergeDeep(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
  return target;
}

/**
 * Formats a value for display in the view table
 * @param {any} val 
 * @param {Object} field 
 * @returns {string}
 */
function formatDisplayValue(val, field) {
  if (val === undefined || val === null || val === '') return '';
  if (field.type === 'date' && typeof val === 'string' && val.includes('-')) {
    // If YYYY-MM-DD, format cleanly
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      }
    } catch (e) {}
  }
  return String(val);
}

/**
 * Displays a toast notification on the screen
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 */
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 100000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `portal-toast toast-${type}`;
  toast.style.cssText = `
    min-width: 280px;
    max-width: 420px;
    padding: 12px 18px;
    border-radius: 8px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.18);
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
    pointer-events: auto;
    color: #fff;
    opacity: 0;
    transform: translateY(-12px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  `;

  // Color theme according to toast type
  let icon = 'ℹ️';
  let bgColor = '#1E293B';

  if (type === 'success') {
    icon = '✓';
    bgColor = '#10B981';
  } else if (type === 'error') {
    icon = '✕';
    bgColor = '#EF4444';
  } else if (type === 'info') {
    icon = 'ℹ️';
    bgColor = '#2563EB';
  }

  toast.style.backgroundColor = bgColor;
  toast.innerHTML = `
    <span style="font-size: 16px; font-weight: bold;">${icon}</span>
    <span style="flex: 1;">${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Remove toast after 3.5s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-12px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3500);
}

/**
 * Initializes session timer counting up from 00:00 every second.
 * Automatically logs out after 30 minutes (1800s).
 */
function initSessionTimer() {
  const timerElem = document.getElementById('sessionTimer') || 
                    document.getElementById('timer') || 
                    document.querySelector('.session-timer, .timer-text');

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
      clearInterval(timerInterval);
      sessionStorage.removeItem('portal_login_time');
      fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).finally(() => {
        window.location.href = '/login?timeout=1';
      });
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
}

/**
 * Initializes dropdown menus (Quick Links and User Menu)
 */
function initDropdowns() {
  const quickLinksBtn = document.getElementById('quickLinksBtn') || document.querySelector('.quick-links-toggle');
  const quickLinksDropdown = document.getElementById('quickLinksDropdown') || 
                             document.querySelector('.quick-links-menu, #quickLinksMenu');

  if (quickLinksBtn && quickLinksDropdown) {
    quickLinksBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns(quickLinksDropdown);
      quickLinksDropdown.classList.toggle('show');
    });
  }

  const userBtn = document.getElementById('userMenuBtn') || 
                  document.getElementById('userDropdownToggle') || 
                  document.querySelector('.user-menu-btn, .user-profile-toggle, .user-avatar-btn');
  const userDropdown = document.getElementById('userDropdown') || 
                       document.getElementById('userMenu') || 
                       document.querySelector('.user-dropdown-menu');

  if (userBtn && userDropdown) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns(userDropdown);
      userDropdown.classList.toggle('show');
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-menu, .user-dropdown-menu, .quick-links-menu, #quickLinksBtn, #userMenuBtn')) {
      closeAllDropdowns();
    }
  });

  function closeAllDropdowns(except = null) {
    document.querySelectorAll('.dropdown-menu.show, .user-dropdown-menu.show, .quick-links-menu.show, #quickLinksDropdown.show, #userDropdown.show').forEach(el => {
      if (el !== except) el.classList.remove('show');
    });
  }
}

/**
 * Initializes sidebar flyouts and hamburger menu
 */
function initSidebarAndFlyouts() {
  const hamburgerBtn = document.getElementById('hamburgerBtn') || 
                       document.getElementById('sidebarToggle') || 
                       document.querySelector('.hamburger-btn, .menu-toggle');
  const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');

  if (hamburgerBtn && sidebar) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
      sidebar.classList.toggle('active');
    });
  }

  const flyoutToggles = document.querySelectorAll('[data-flyout], .has-flyout');
  const flyoutPanels = document.querySelectorAll('.flyout-panel, .sidebar-flyout');

  flyoutToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const flyoutName = toggle.getAttribute('data-flyout');
      const targetFlyout = document.getElementById(`flyout-${flyoutName}`) || 
                           document.querySelector(`.flyout-${flyoutName}`) ||
                           toggle.querySelector('.flyout-panel') ||
                           toggle.nextElementSibling;

      if (!targetFlyout) return;

      const isOpen = targetFlyout.classList.contains('show') || targetFlyout.classList.contains('open');
      closeAllFlyouts();

      if (!isOpen) {
        targetFlyout.classList.add('show', 'open');
      }
    });
  });

  const flyoutLinks = document.querySelectorAll('.flyout-panel a, .sidebar-flyout a, [data-flyout-item]');
  flyoutLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const text = link.textContent.trim().toLowerCase();

      if (href === '/profile' || text.includes('profile')) {
        return;
      }

      e.preventDefault();
      const itemName = link.textContent.trim() || 'This module';
      alert(`Coming soon! ${itemName} is under development.`);
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.flyout-panel, .sidebar-flyout, [data-flyout], .has-flyout')) {
      closeAllFlyouts();
    }
    if (sidebar && !e.target.closest('.sidebar') && !e.target.closest('#hamburgerBtn, #sidebarToggle, .hamburger-btn')) {
      sidebar.classList.remove('open', 'active');
    }
  });

  function closeAllFlyouts() {
    flyoutPanels.forEach(p => p.classList.remove('show', 'open'));
  }
}

/**
 * Initializes global actions: Password change, Logout
 */
function initActions() {
  const changePasswordLinks = document.querySelectorAll('[data-action="change-password"], #changePasswordBtn, a[href="#change-password"]');
  changePasswordLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Password change feature coming soon.');
    });
  });

  const logoutLinks = document.querySelectorAll('#logoutBtn, .logout-btn, a[href="/logout"], [data-action="logout"]');
  logoutLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      sessionStorage.removeItem('portal_login_time');
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        window.location.href = '/login';
      }
    });
  });
}

/**
 * Helper to escape HTML characters
 * @param {string} str 
 * @returns {string}
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
