// ========== PROFILE BRIDGE SCRIPT ==========
// Connects the VTOP profile HTML to our backend API with live data & editing
(function() {
    let currentStudent = null;

    // Toast notification helper
    function showToast(message, type = 'success') {
        let toast = document.getElementById('portalToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'portalToast';
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.right = '20px';
            toast.style.zIndex = '99999';
            toast.style.padding = '12px 24px';
            toast.style.borderRadius = '8px';
            toast.style.color = '#fff';
            toast.style.fontWeight = 'bold';
            toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            toast.style.transition = 'opacity 0.3s ease';
            document.body.appendChild(toast);
        }
        toast.style.backgroundColor = type === 'success' ? '#2e7d32' : '#c62828';
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => { toast.style.display = 'none'; }, 300);
        }, 3500);
    }

    // Auth check and data load
    fetch('/api/me', { credentials: 'include' })
        .then(function(res) {
            if (!res.ok) throw new Error('Not authenticated');
            return res.json();
        })
        .then(function(student) {
            currentStudent = student;
            populateProfile(student);
            setupPhotoUpload();
            setupHeaderEdit();
            setupAccordionEdits();
        })
        .catch(function() {
            window.location.href = '/login.html?error=Session+expired.+Please+login+again.';
        });

    function populateProfile(s) {
        // 1. Header user info
        var userImages = document.querySelectorAll('img.img-circle');
        userImages.forEach(function(img) {
            if (s.photoUrl) img.src = s.photoUrl;
        });
        var regSpans = document.querySelectorAll('.navbar-text.text-light.small.fw-bold');
        regSpans.forEach(function(span) {
            span.textContent = s.registerNumber + ' (STUDENT)';
        });
        var authIdx = document.getElementById('authorizedIDX');
        if (authIdx) authIdx.value = s.registerNumber;

        // 2. Profile Summary Card
        var noLabel = document.querySelector('label[for="no"]');
        if (noLabel) noLabel.textContent = s.registerNumber || '';

        var mailLabel = document.querySelector('label[for="vmail"]');
        if (mailLabel) mailLabel.textContent = s.email || '';

        var branchLabel = document.querySelector('label[for="branchno"]');
        if (branchLabel) branchLabel.textContent = s.program || '';

        var schoolLabel = document.querySelector('label[for="schoolno"]');
        if (schoolLabel) schoolLabel.textContent = s.school || '';

        // Main photo
        var mainImg = document.querySelector('.card .col-4 img');
        if (mainImg && s.photoUrl) {
            mainImg.src = s.photoUrl;
        }

        // ---- PERSONAL INFORMATION (collapseOne) ----
        var personalSection = document.getElementById('collapseOne');
        if (personalSection && s.personal) {
            var p = s.personal;
            fillSection(personalSection, {
                'APPLICATION NUMBER': p.applicationNumber,
                'STUDENT NAME': p.name || s.name,
                'DATE OF BIRTH': p.dateOfBirth,
                'GENDER': p.gender,
                'NATIVE LANGUAGE': p.nativeLanguage,
                'NATIVE STATE': p.nativeState,
                'BLOOD GROUP': p.bloodGroup,
                'PHYSICALLY CHALLENGED': p.physicallyChallenged,
                'COMMUNITY': p.community,
                'RELIGION': p.religion,
                'CASTE': p.caste || '',
                'NATIONALITY': p.nationality,
                'HOSTELLER': p.hosteller,
                'AADHAR NUMBER': p.governmentIdNumber || '',
                'MOBILE NUMBER': p.mobileNumber
            });
            if (p.currentAddress) {
                var ca = p.currentAddress;
                fillAfterHeader(personalSection, 'CURRENT ADDRESS', {
                    'STREET NAME': ca.street,
                    'AREA NAME': ca.area,
                    'CITY': ca.city,
                    'STATE': ca.state,
                    'COUNTRY': ca.country,
                    'PINCODE': ca.pincode,
                    'PHONE NUMBER[LAND LINE]': ca.landline,
                    'EMAIL': ca.email
                });
            }
            if (p.permanentAddress) {
                var pa = p.permanentAddress;
                fillAfterHeader(personalSection, 'PERMANENT ADDRESS', {
                    'STREET NAME': pa.street,
                    'AREA NAME': pa.area,
                    'CITY': pa.city,
                    'STATE': pa.state,
                    'COUNTRY': pa.country,
                    'PINCODE': pa.pincode,
                    'PHONE NUMBER[LAND LINE]': pa.landline,
                    'EMAIL': pa.email,
                    'FRIEND MOBILE NUMBER': pa.friendMobileNumber
                });
            }
        }

        // ---- EDUCATIONAL INFORMATION (collapseTwo) ----
        var eduSection = document.getElementById('collapseTwo');
        if (eduSection && s.educational) {
            var e = s.educational;
            fillSection(eduSection, {
                'APPLIED DEGREE': e.appliedDegree,
                'QUALIFICATION': e.qualification,
                'BRANCH / GROUP STUDIED': e.branchGroupStudied,
                'SCHOOL NAME': e.schoolName,
                'MEDIUM OF STUDY': e.mediumOfStudy,
                'BOARD': e.board,
                'REGISTER / ROLL NO': e.registerRollNo,
                'CLASS OBTAINED': e.classObtained,
                'YEAR OF PASSING': e.yearOfPassing,
                'MONTH OF PASSING': e.monthOfPassing,
                'BREAK IN STUDY': e.breakInStudy,
                'BREAK REASON': e.breakReason
            });
            if (e.schoolAddress) {
                var sa = e.schoolAddress;
                fillAfterHeader(eduSection, 'SCHOOL ADDRESS', {
                    'AREA': sa.area,
                    'CITY / DISTRICT': sa.cityDistrict,
                    'STATE': sa.state,
                    'PINCODE': sa.pincode,
                    'PHONE NUMBER[LAND LINE]': sa.landline
                });
            }
        }

        // ---- FAMILY DETAILS (collapseThree) ----
        var famSection = document.getElementById('collapseThree');
        if (famSection && s.family) {
            var f = s.family;
            fillSection(famSection, {
                'NO. OF BROTHERS': f.numberOfBrothers,
                'NO. OF SISTERS': f.numberOfSisters,
                'SIBLING STUDYING IN UNIVERSITY': f.siblingStudyingInUniversity,
                'SIBLING STUDYING DETAILS': f.siblingStudyingDetails,
                'SIBLING STUDIED': f.siblingStudied,
                'SIBLING STUDIED DETAILS': f.siblingStudiedDetails
            });
            if (f.father) {
                fillAfterHeader(famSection, 'FATHER', {
                    'NAME': f.father.name,
                    'QUALIFICATION': f.father.qualification,
                    'OCCUPATION': f.father.occupation,
                    'ORGANIZATION': f.father.organization,
                    'EMPLOYEE ID': f.father.employeeId,
                    'MOBILE': f.father.mobile,
                    'EMAIL': f.father.email,
                    'ANNUAL INCOME': f.father.annualIncome,
                    'OFFICIAL ADDRESS': f.father.officialAddress,
                    'STATE': f.father.state,
                    'CITY': f.father.city,
                    'PINCODE': f.father.pincode,
                    'LAND LINE': f.father.landline,
                    'DESIGNATION': f.father.designation
                });
            }
            if (f.mother) {
                fillAfterHeader(famSection, 'MOTHER', {
                    'NAME': f.mother.name,
                    'QUALIFICATION': f.mother.qualification,
                    'OCCUPATION': f.mother.occupation,
                    'ORGANIZATION': f.mother.organization,
                    'EMPLOYEE ID': f.mother.employeeId,
                    'MOBILE': f.mother.mobile,
                    'EMAIL': f.mother.email,
                    'ANNUAL INCOME': f.mother.annualIncome,
                    'OFFICIAL ADDRESS': f.mother.officialAddress,
                    'STATE': f.mother.state,
                    'CITY': f.mother.city,
                    'PINCODE': f.mother.pincode,
                    'LAND LINE': f.mother.landline,
                    'DESIGNATION': f.mother.designation
                });
            }
        }

        // ---- PROCTOR DETAILS (collapseFour) ----
        var procSection = document.getElementById('collapseFour');
        if (procSection && s.proctor) {
            var pr = s.proctor;
            fillSection(procSection, {
                'PROCTOR NAME': pr.proctorName,
                'EMPLOYEE ID': pr.employeeId,
                'DESIGNATION': pr.designation,
                'SCHOOL': pr.school,
                'CABIN / ROOM': pr.cabinRoom,
                'EMAIL': pr.email,
                'MOBILE': pr.mobile
            });
        }

        // ---- HOSTEL DETAILS (collapseFive) ----
        var hostelSection = document.getElementById('collapseFive');
        if (hostelSection && s.hostel) {
            var h = s.hostel;
            fillSection(hostelSection, {
                'APPLICATION NUMBER': h.applicationNumber,
                'REGISTER NUMBER': h.registerNumber,
                'BLOCK NAME': h.blockName,
                'ROOM NO': h.roomNo,
                'BED TYPE': h.bedType,
                'MESS INFORMATION': h.messInformation
            });
        }
    }

    function fillSection(sectionEl, dataMap) {
        var rows = sectionEl.querySelectorAll('tr');
        rows.forEach(function(row) {
            var cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
                var label = (cells[0].textContent || '').trim().toUpperCase();
                for (var key in dataMap) {
                    if (label === key.toUpperCase() || label.indexOf(key.toUpperCase()) !== -1 || key.toUpperCase().indexOf(label) !== -1) {
                        var val = dataMap[key];
                        if (val !== undefined && val !== null) {
                            for (var i = 1; i < cells.length; i++) {
                                var s = cells[i].getAttribute('style') || '';
                                if (s.indexOf('FAF0DD') !== -1 || cells[i].style.backgroundColor.indexOf('250') !== -1) {
                                    cells[i].textContent = String(val);
                                    cells[i].setAttribute('data-field-key', key);
                                    break;
                                }
                            }
                        }
                        delete dataMap[key];
                        break;
                    }
                }
            }
        });
    }

    function fillAfterHeader(sectionEl, headerText, dataMap) {
        var rows = sectionEl.querySelectorAll('tr');
        var found = false;
        var nextHeaderFound = false;
        rows.forEach(function(row) {
            if (nextHeaderFound) return;
            var cells = row.querySelectorAll('td');
            if (cells.length === 1 || (cells.length > 0 && cells[0].getAttribute('colspan') >= 2)) {
                var text = (cells[0].textContent || '').trim().toUpperCase();
                if (text === headerText.toUpperCase()) {
                    found = true;
                    return;
                }
                if (found && text !== headerText.toUpperCase()) {
                    nextHeaderFound = true;
                    return;
                }
            }
            if (found && cells.length >= 2) {
                var label = (cells[0].textContent || '').trim().toUpperCase();
                for (var key in dataMap) {
                    if (label === key.toUpperCase() || label.indexOf(key.toUpperCase()) !== -1) {
                        var val = dataMap[key];
                        if (val !== undefined && val !== null) {
                            for (var i = 1; i < cells.length; i++) {
                                var s = cells[i].getAttribute('style') || '';
                                if (s.indexOf('FAF0DD') !== -1 || cells[i].style.backgroundColor.indexOf('250') !== -1) {
                                    cells[i].textContent = String(val);
                                    cells[i].setAttribute('data-field-key', headerText + '.' + key);
                                    break;
                                }
                            }
                        }
                        delete dataMap[key];
                        break;
                    }
                }
            }
        });
    }

    // Photo Upload Setup (click photo to upload)
    function setupPhotoUpload() {
        var mainImg = document.querySelector('.card .col-4 img');
        if (!mainImg) return;

        mainImg.style.cursor = 'pointer';
        mainImg.title = 'Click to upload/change photo';

        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        mainImg.addEventListener('click', function() {
            fileInput.click();
        });

        fileInput.addEventListener('change', function() {
            if (!this.files || !this.files[0]) return;
            var file = this.files[0];
            if (file.size > 2 * 1024 * 1024) {
                alert('File size exceeds 2MB limit.');
                return;
            }

            var formData = new FormData();
            formData.append('photo', file);

            fetch('/api/me/photo', {
                method: 'POST',
                credentials: 'include',
                body: formData
            })
            .then(res => {
                if (!res.ok) throw new Error('Upload failed');
                return res.json();
            })
            .then(data => {
                if (data.photoUrl) {
                    mainImg.src = data.photoUrl;
                    document.querySelectorAll('img.img-circle').forEach(img => img.src = data.photoUrl);
                    showToast('Photo uploaded successfully!');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Failed to upload photo', 'error');
            });
        });
    }

    // Header Edit Setup (Register Number, Program, Email, School)
    function setupHeaderEdit() {
        var rightCol = document.querySelector('.card .col-8');
        if (!rightCol) return;

        var btnContainer = document.createElement('div');
        btnContainer.className = 'text-end mb-2 pe-3';
        btnContainer.innerHTML = `
            <button id="btnEditHeader" class="btn btn-sm btn-outline-primary fw-bold">
                <i class="fa fa-edit"></i> Edit Header
            </button>
            <button id="btnSaveHeader" class="btn btn-sm btn-success fw-bold d-none">
                <i class="fa fa-check"></i> Save
            </button>
            <button id="btnCancelHeader" class="btn btn-sm btn-secondary fw-bold ms-1 d-none">
                Cancel
            </button>
        `;
        rightCol.prepend(btnContainer);

        var btnEdit = document.getElementById('btnEditHeader');
        var btnSave = document.getElementById('btnSaveHeader');
        var btnCancel = document.getElementById('btnCancelHeader');

        var mailLabel = document.querySelector('label[for="vmail"]');
        var branchLabel = document.querySelector('label[for="branchno"]');
        var schoolLabel = document.querySelector('label[for="schoolno"]');

        let origMail = '', origBranch = '', origSchool = '';

        btnEdit.addEventListener('click', function() {
            origMail = mailLabel.textContent;
            origBranch = branchLabel.textContent;
            origSchool = schoolLabel.textContent;

            mailLabel.innerHTML = `<input type="email" id="editMail" class="form-control form-control-sm" value="${origMail}">`;
            branchLabel.innerHTML = `<input type="text" id="editBranch" class="form-control form-control-sm" value="${origBranch}">`;
            schoolLabel.innerHTML = `<input type="text" id="editSchool" class="form-control form-control-sm" value="${origSchool}">`;

            btnEdit.classList.add('d-none');
            btnSave.classList.remove('d-none');
            btnCancel.classList.remove('d-none');
        });

        btnCancel.addEventListener('click', function() {
            mailLabel.textContent = origMail;
            branchLabel.textContent = origBranch;
            schoolLabel.textContent = origSchool;

            btnEdit.classList.remove('d-none');
            btnSave.classList.add('d-none');
            btnCancel.classList.add('d-none');
        });

        btnSave.addEventListener('click', function() {
            var newMail = document.getElementById('editMail').value.trim();
            var newBranch = document.getElementById('editBranch').value.trim();
            var newSchool = document.getElementById('editSchool').value.trim();

            fetch('/api/me/header', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: newMail, program: newBranch, school: newSchool })
            })
            .then(res => {
                if (!res.ok) throw new Error('Save failed');
                return res.json();
            })
            .then(updated => {
                mailLabel.textContent = updated.email || newMail;
                branchLabel.textContent = updated.program || newBranch;
                schoolLabel.textContent = updated.school || newSchool;
                btnEdit.classList.remove('d-none');
                btnSave.classList.add('d-none');
                btnCancel.classList.add('d-none');
                showToast('Header details updated successfully!');
            })
            .catch(err => {
                alert('Failed to save header updates.');
                console.error(err);
            });
        });
    }

    // Accordion Sections Editing
    function setupAccordionEdits() {
        const sections = [
            { id: 'collapseOne', name: 'personal', title: 'Personal Information' },
            { id: 'collapseTwo', name: 'educational', title: 'Educational Details' },
            { id: 'collapseThree', name: 'family', title: 'Family Details' },
            { id: 'collapseFour', name: 'proctor', title: 'Proctor Details' },
            { id: 'collapseFive', name: 'hostel', title: 'Hostel Details' }
        ];

        sections.forEach(sec => {
            const container = document.getElementById(sec.id);
            if (!container) return;

            const body = container.querySelector('.accordion-body');
            if (!body) return;

            const toolbar = document.createElement('div');
            toolbar.className = 'd-flex justify-content-end mb-2 gap-2';
            toolbar.innerHTML = `
                <button class="btn btn-sm btn-outline-primary fw-bold btn-edit-sec">
                    <i class="fa fa-pencil"></i> Edit ${sec.title}
                </button>
                <button class="btn btn-sm btn-success fw-bold btn-save-sec d-none">
                    <i class="fa fa-check"></i> Save
                </button>
                <button class="btn btn-sm btn-secondary fw-bold btn-cancel-sec d-none">
                    Cancel
                </button>
            `;
            body.insertBefore(toolbar, body.firstChild);

            const btnEdit = toolbar.querySelector('.btn-edit-sec');
            const btnSave = toolbar.querySelector('.btn-save-sec');
            const btnCancel = toolbar.querySelector('.btn-cancel-sec');

            let originalValues = [];

            btnEdit.addEventListener('click', () => {
                originalValues = [];
                const valueCells = container.querySelectorAll('td');
                valueCells.forEach(cell => {
                    const style = cell.getAttribute('style') || '';
                    if (style.indexOf('FAF0DD') !== -1 || cell.style.backgroundColor.indexOf('250') !== -1) {
                        const orig = cell.textContent.trim();
                        originalValues.push({ cell: cell, val: orig });
                        cell.innerHTML = `<input type="text" class="form-control form-control-sm sec-input" value="${orig}">`;
                    }
                });

                btnEdit.classList.add('d-none');
                btnSave.classList.remove('d-none');
                btnCancel.classList.remove('d-none');
            });

            btnCancel.addEventListener('click', () => {
                originalValues.forEach(item => {
                    item.cell.textContent = item.val;
                });
                btnEdit.classList.remove('d-none');
                btnSave.classList.add('d-none');
                btnCancel.classList.add('d-none');
            });

            btnSave.addEventListener('click', () => {
                // Collect values from table
                const updatePayload = {};
                const rows = container.querySelectorAll('tr');
                
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 2) {
                        const label = (cells[0].textContent || '').trim().toUpperCase();
                        const input = row.querySelector('.sec-input');
                        if (input) {
                            const val = input.value.trim();
                            // Map common labels to camelCase
                            if (label.includes('APPLICATION NUMBER')) updatePayload.applicationNumber = val;
                            else if (label.includes('STUDENT NAME') || label.includes('PROCTOR NAME')) {
                                if (sec.name === 'proctor') updatePayload.proctorName = val;
                                else updatePayload.name = val;
                            }
                            else if (label.includes('DATE OF BIRTH')) updatePayload.dateOfBirth = val;
                            else if (label.includes('GENDER')) updatePayload.gender = val;
                            else if (label.includes('NATIVE LANGUAGE')) updatePayload.nativeLanguage = val;
                            else if (label.includes('NATIVE STATE')) updatePayload.nativeState = val;
                            else if (label.includes('BLOOD GROUP')) updatePayload.bloodGroup = val;
                            else if (label.includes('PHYSICALLY CHALLENGED')) updatePayload.physicallyChallenged = val;
                            else if (label.includes('COMMUNITY')) updatePayload.community = val;
                            else if (label.includes('RELIGION')) updatePayload.religion = val;
                            else if (label.includes('NATIONALITY')) updatePayload.nationality = val;
                            else if (label.includes('HOSTELLER')) updatePayload.hosteller = val;
                            else if (label.includes('MOBILE NUMBER') || label === 'MOBILE') {
                                if (sec.name === 'proctor') updatePayload.mobile = val;
                                else updatePayload.mobileNumber = val;
                            }
                            else if (label.includes('QUALIFICATION')) updatePayload.qualification = val;
                            else if (label.includes('APPLIED DEGREE')) updatePayload.appliedDegree = val;
                            else if (label.includes('SCHOOL NAME') || label === 'SCHOOL') {
                                if (sec.name === 'proctor') updatePayload.school = val;
                                else updatePayload.schoolName = val;
                            }
                            else if (label.includes('EMPLOYEE ID')) updatePayload.employeeId = val;
                            else if (label.includes('DESIGNATION')) updatePayload.designation = val;
                            else if (label.includes('CABIN / ROOM')) updatePayload.cabinRoom = val;
                            else if (label.includes('BLOCK NAME')) updatePayload.blockName = val;
                            else if (label.includes('ROOM NO')) updatePayload.roomNo = val;
                            else if (label.includes('BED TYPE')) updatePayload.bedType = val;
                            else if (label.includes('MESS INFORMATION')) updatePayload.messInformation = val;
                        }
                    }
                });

                fetch(`/api/me/${sec.name}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(updatePayload)
                })
                .then(res => {
                    if (!res.ok) throw new Error('Save failed');
                    return res.json();
                })
                .then(updatedStudent => {
                    // Turn inputs back into text
                    container.querySelectorAll('td').forEach(cell => {
                        const input = cell.querySelector('.sec-input');
                        if (input) {
                            cell.textContent = input.value;
                        }
                    });
                    btnEdit.classList.remove('d-none');
                    btnSave.classList.add('d-none');
                    btnCancel.classList.add('d-none');
                    showToast(`${sec.title} updated successfully!`);
                })
                .catch(err => {
                    alert('Error updating section. Check inputs and try again.');
                    console.error(err);
                });
            });
        });
    }

    // Fix logout forms
    var logoutForms = document.querySelectorAll('form[action="/vtop/logout"]');
    logoutForms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                .then(function() { window.location.href = '/index.html'; })
                .catch(function() { window.location.href = '/index.html'; });
        });
    });

    // Fix sidebar Profile link 
    var profileLinks = document.querySelectorAll('a[data-url="studentsRecord/StudentProfileAllView"]');
    profileLinks.forEach(function(link) {
        link.href = '/profile.html';
        link.removeAttribute('data-url');
        link.onclick = function(e) {
            e.preventDefault();
            window.location.href = '/profile.html';
        };
    });

    // Fix menu links
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a[data-url]');
        if (link) {
            e.preventDefault();
            var url = link.getAttribute('data-url');
            if (url === 'studentsRecord/StudentProfileAllView') {
                window.location.href = '/profile.html';
            } else {
                alert('Feature "' + (link.textContent || '').trim() + '" coming soon!');
            }
        }
    });

    // Override loadData and home
    window.loadData = function() {};
    window.home = function() { window.location.href = '/dashboard.html'; };
    window.showTimeoutAlert = function() {
        alert("Your session has expired due to inactivity. Please log in again.");
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
            .finally(function() { window.location.href = '/login.html?error=Session+expired.'; });
        return false;
    };
})();
