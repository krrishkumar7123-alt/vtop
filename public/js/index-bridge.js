// ========== INDEX BRIDGE SCRIPT ==========
(function () {
    // Override submitForm so only Student proceeds to login, others show "Coming soon"
    window.submitForm = function (formName) {
        if (formName === 'stdForm') {
            window.location.href = '/login.html';
            return;
        }
        alert('Coming soon');
    };

    // Intercept direct button clicks inside non-student forms as well
    document.addEventListener('DOMContentLoaded', function () {
        ['empForm', 'parentForm', 'alumniForm'].forEach(function (id) {
            var form = document.getElementById(id);
            if (form) {
                form.addEventListener('submit', function (e) {
                    e.preventDefault();
                    alert('Coming soon');
                });
            }
        });

        var stdForm = document.getElementById('stdForm');
        if (stdForm) {
            stdForm.addEventListener('submit', function (e) {
                e.preventDefault();
                window.location.href = '/login.html';
            });
        }

        var params = new URLSearchParams(window.location.search);
        if (params.get('msg') === 'coming_soon') {
            alert('Coming soon');
        }
    });
})();
