/**
 * login.js - Student Portal Authentication Script
 * University Student Portal
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const registerNumberInput = document.getElementById('registerNumber');
  const passwordInput = document.getElementById('password');
  const passwordToggle = document.getElementById('passwordToggle');
  const captchaImage = document.getElementById('captchaImage');
  const captchaRefresh = document.getElementById('captchaRefresh');
  const captchaAnswer = document.getElementById('captchaAnswer');
  const captchaIdInput = document.getElementById('captchaId');
  const errorMessage = document.getElementById('errorMessage');
  const submitBtn = document.getElementById('submitBtn');

  // Check URL parameters for timeout or error messages
  checkUrlParams();

  // Load captcha on page load
  loadCaptcha();

  /**
   * Fetches a new captcha challenge from the backend API
   */
  async function loadCaptcha() {
    if (!captchaImage || !captchaIdInput) return;
    
    try {
      if (captchaRefresh) {
        captchaRefresh.classList.add('rotating');
      }

      const res = await fetch('/api/auth/captcha', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();

      if (res.ok && data.captchaImage) {
        captchaImage.src = data.captchaImage;
        captchaIdInput.value = data.captchaId || '';
        if (captchaAnswer) {
          captchaAnswer.value = '';
        }
      } else {
        console.error('Failed to load captcha:', data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Failed to load captcha:', err);
    } finally {
      if (captchaRefresh) {
        captchaRefresh.classList.remove('rotating');
      }
    }
  }

  // Refresh captcha button listener
  if (captchaRefresh) {
    captchaRefresh.addEventListener('click', (e) => {
      e.preventDefault();
      loadCaptcha();
    });
  }

  // Also reload if clicking on the captcha image directly
  if (captchaImage) {
    captchaImage.addEventListener('click', () => {
      loadCaptcha();
    });
  }

  // Password visibility toggle
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      passwordToggle.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
      passwordToggle.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
    });
  }

  // Form submit handling
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');
      }

      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Sign In →';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
      }

      const registerNumber = registerNumberInput ? registerNumberInput.value.trim().toUpperCase() : '';
      const password = passwordInput ? passwordInput.value : '';
      const captchaId = captchaIdInput ? captchaIdInput.value : '';
      const captchaAns = captchaAnswer ? captchaAnswer.value.trim() : '';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            registerNumber,
            password,
            captchaId,
            captchaAnswer: captchaAns
          })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // Initialize portal login session timer
          sessionStorage.setItem('portal_login_time', Date.now().toString());
          // Redirect to dashboard
          window.location.href = '/dashboard';
        } else {
          showError(data.error || 'Login failed. Please check your credentials and try again.');
          loadCaptcha(); // Reload captcha on failure
        }
      } catch (err) {
        console.error('Login error:', err);
        showError('Network error. Please check your connection and try again.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  /**
   * Helper to display error message
   * @param {string} msg 
   */
  function showError(msg) {
    if (!errorMessage) {
      alert(msg);
      return;
    }
    errorMessage.textContent = msg;
    errorMessage.classList.add('show');
  }

  /**
   * Checks query parameters for session timeout or redirected error messages
   */
  function checkUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('timeout') === '1' || params.get('reason') === 'timeout') {
        showError('Your session has expired due to 30 minutes of inactivity. Please log in again.');
      } else if (params.get('message')) {
        showError(decodeURIComponent(params.get('message')));
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }
});
