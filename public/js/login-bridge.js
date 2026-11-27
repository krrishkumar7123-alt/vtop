// ========== LOGIN BRIDGE SCRIPT ==========
(function () {
    function showLoginError(msg) {
        var bodyContent = document.getElementById('bodyContent');
        if (!bodyContent) return;
        var alertEl = document.getElementById('loginErrorAlert');
        if (!alertEl) {
            alertEl = document.createElement('div');
            alertEl.id = 'loginErrorAlert';
            alertEl.className = 'alert alert-danger py-2 px-3 small mb-3';
            alertEl.setAttribute('role', 'alert');
            bodyContent.insertBefore(alertEl, bodyContent.firstChild);
        }
        alertEl.textContent = msg;
    }

    document.addEventListener('DOMContentLoaded', function () {
        // Show error message from redirect if present
        var params = new URLSearchParams(window.location.search);
        var err = params.get('error');
        if (err) {
            showLoginError(err);
        }

        // Load a fresh server-generated captcha immediately
        if (typeof window.loadCaptcha === 'function') {
            window.loadCaptcha();
        }
    });

    // Override callBuiltValidation to validate fields inline before submitting
    window.callBuiltValidation = function () {
        var username = document.getElementById('username');
        var password = document.getElementById('password');
        var captchaStr = document.getElementById('captchaStr');

        if (!username || !username.value.trim()) {
            showLoginError('Please enter Username.');
            if (username) username.focus();
            return;
        }
        if (!password || !password.value) {
            showLoginError('Please enter Password.');
            if (password) password.focus();
            return;
        }
        if (!captchaStr || !captchaStr.value.trim()) {
            showLoginError('Please enter the CAPTCHA shown above.');
            if (captchaStr) captchaStr.focus();
            return;
        }

        var form = document.getElementById('vtopLoginForm');
        if (form) {
            form.submit();
        }
    };
})();
