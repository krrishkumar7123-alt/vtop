// ========== DASHBOARD BRIDGE SCRIPT ==========
// Connects the VTOP HTML to our backend API
(function() {
    // Auth check
    fetch('/api/me', { credentials: 'include' })
        .then(function(res) {
            if (!res.ok) throw new Error('Not authenticated');
            return res.json();
        })
        .then(function(student) {
            // Update user image in header
            var userImages = document.querySelectorAll('img.img-circle');
            userImages.forEach(function(img) {
                if (student.photoUrl) {
                    img.src = student.photoUrl;
                }
            });
            // Update register number text in header
            var regSpans = document.querySelectorAll('.navbar-text.text-light.small.fw-bold');
            regSpans.forEach(function(span) {
                span.textContent = student.registerNumber + ' (STUDENT)';
            });
            // Update hidden input
            var authIdx = document.getElementById('authorizedIDX');
            if (authIdx) authIdx.value = student.registerNumber;
            var authIds = document.querySelectorAll('#authorizedID');
            authIds.forEach(function(el) { el.value = student.registerNumber; });

            // Update proctor message
            var proctorDiv = document.getElementById('proctor-message');
            if (proctorDiv) {
                proctorDiv.innerHTML = student.proctorMessage 
                    ? '<p class="fontcolor1 fs-6 fw-bold p-3">' + student.proctorMessage + '</p>'
                    : '<p class="fontcolor1 fs-6 fw-bold p-3">No messages from proctor.</p>';
            }
        })
        .catch(function() {
            window.location.href = '/login.html?error=Session+expired.+Please+login+again.';
        });

    // Load courses
    fetch('/api/courses', { credentials: 'include' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            // Update course table while preserving VTOP card header + semester banner
            var courseDiv = document.getElementById('course-data');
            if (courseDiv && data.courses && data.courses.length > 0) {
                var cardHTML = '<div class="card-header d-flex flex-column flex-md-row primaryBorderTop">';
                cardHTML += '<span class="fs-6 fontcolor3 flex-fill text-nowrap fw-bold">CURRENT SEMESTER COURSE REGISTRATION DETAILS</span>';
                cardHTML += '<span class="flex-fill text-center text-danger fw-bold px-2 rounded" style="background-color: #fff3cd;">WINSEM2026-27</span>';
                cardHTML += '</div>';
                cardHTML += '<div class="card-body small courseData overflow-scroll">';

                var tableHTML = '<table class="table table-hover text-center">';
                tableHTML += '<thead><tr class="text-center">';
                tableHTML += '<th>#</th><th class="text-start">Code - Course Name</th>';
                tableHTML += '<th>Type</th><th>Attendance</th><th class="text-start">Remarks</th>';
                tableHTML += '</tr></thead><tbody>';
                data.courses.forEach(function(course, i) {
                    var att = course.attendance;
                    var colorClass = att >= 90 ? 'text-success' : (att >= 75 ? 'text-primary' : 'text-danger');
                    var remark = att >= 90 ? 'Excellent - Keep going' : (att >= 75 ? 'Good' : 'Critical - must improve');
                    tableHTML += '<tr class="text-center">';
                    tableHTML += '<th scope="row">' + (i + 1) + '</th>';
                    tableHTML += '<td class="mx-1 text-start text-nowrap"><span class="mx-2 text-dark fw-bold">' + course.code + '</span>-';
                    tableHTML += ' <span class="mx-2 text-dark">' + course.title + '</span></td>';
                    var typeCode = course.type === 'Theory' ? 'TH' : course.type === 'Lab' ? 'LO' : course.type === 'Embedded Theory' ? 'ETH' : course.type === 'Embedded Lab' ? 'ELA' : course.type;
                    tableHTML += '<td class="fst-italic text-primary fw-bold mx-1">' + typeCode + '</td>';
                    tableHTML += '<td><span class="' + colorClass + ' fw-bold">' + att.toFixed(1) + '</span></td>';
                    tableHTML += '<td class="text-nowrap text-start"><span class="' + colorClass + ' fw-bold">' + remark + '</span></td>';
                    tableHTML += '</tr>';
                });
                tableHTML += '</tbody></table></div>';
                courseDiv.innerHTML = cardHTML + tableHTML;
            }

            // Update CGPA / Credits
            var eduDiv = document.getElementById('edu-status');
            if (eduDiv && data.credits) {
                var cr = data.credits;
                var html = '<ul class="list-group list-group-flush fs-6 fw-bold">';
                html += '<li class="list-group-item d-flex justify-content-between align-items-start p-0 m-0">';
                html += '<span class="card-title fontcolor1 p-0 m-0">Total Credits Required :</span>';
                html += '<span class="fontcolor3 bg-primary bg-opacity-10 w-25 py-1 m-0 text-center"><span>' + cr.required + '</span></span></li>';
                html += '<li class="list-group-item d-flex justify-content-between align-items-start p-0 m-0">';
                html += '<span class="card-title fontcolor1 p-0 m-0">Earned Credits :</span>';
                html += '<span class="fontcolor3 bg-primary bg-opacity-25 w-25 py-1 m-0 text-center"><span>' + cr.earned + '</span></span></li>';
                html += '<li class="list-group-item d-flex justify-content-between align-items-start p-0 m-0">';
                html += '<span class="card-title fontcolor1">Current CGPA :</span>';
                html += '<span class="fontcolor3 bg-primary bg-opacity-75 w-25 py-1 m-0 text-center"><span>' + (data.cgpa || 0).toFixed(1) + '</span></span></li>';
                html += '</ul>';
                eduDiv.innerHTML = html;
            }
        })
        .catch(function(err) { console.error('Error loading courses:', err); });

    // Fix logout forms to POST to our endpoint
    var logoutForms = document.querySelectorAll('form[action="/vtop/logout"]');
    logoutForms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                .then(function() { window.location.href = '/index.html'; })
                .catch(function() { window.location.href = '/index.html'; });
        });
    });

    // Fix sidebar Profile link to go to our profile page
    var profileLinks = document.querySelectorAll('a[data-url="studentsRecord/StudentProfileAllView"]');
    profileLinks.forEach(function(link) {
        link.href = '/profile.html';
        link.removeAttribute('data-url');
        link.onclick = function(e) {
            e.preventDefault();
            window.location.href = '/profile.html';
        };
    });

    // Fix menu links: intercept all data-url links and show "Coming soon" for non-profile
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

    // Override the VTOP loadData function to prevent external calls
    window.loadData = function() {};

    // Fix home() function
    window.home = function() {
        window.location.href = '/dashboard.html';
    };

    // Override session timeout to redirect to our login
    window.showTimeoutAlert = function() {
        alert("Your session has expired due to inactivity. Please log in again.");
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
            .finally(function() { window.location.href = '/login.html?error=Session+expired.'; });
        return false;
    };

    // Ensure 30-minute session countdown is active in #countdownDisplay
    (function startSessionCountdown() {
        var display = document.getElementById('countdownDisplay');
        if (!display) return;
        var remainingSec = 30 * 60;
        function render() {
            var m = Math.floor(remainingSec / 60);
            var s = remainingSec % 60;
            display.innerHTML = "<span style='font-weight: bold; color: white; font-size: 13px;'>Session Time :  </span><span style='font-weight: bold; color: white; font-size: 13px;'>" + m + "m " + (s < 10 ? "0" : "") + s + "s</span>";
        }
        render();
        setInterval(function() {
            remainingSec--;
            if (remainingSec <= 0) {
                window.showTimeoutAlert();
            } else {
                render();
            }
        }, 1000);
    })();
})();
