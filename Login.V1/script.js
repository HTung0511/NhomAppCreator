/* ================================================
   script.js — RoomieMatch Login/Register
   ================================================ */

'use strict';

// ================================================
// TAB SWITCHING
// ================================================

/**
 * Switches between 'login' and 'register' tabs.
 * @param {'login'|'register'} tab
 */
function switchTab(tab) {
  const tabLogin    = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const indicator   = document.getElementById('tab-indicator');
  const formLogin   = document.getElementById('form-login');
  const formReg     = document.getElementById('form-register');

  if (tab === 'login') {
    // Activate login tab
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    indicator.classList.remove('right');

    formLogin.classList.remove('hidden');
    formReg.classList.add('hidden');
  } else {
    // Activate register tab
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    indicator.classList.add('right');

    formReg.classList.remove('hidden');
    formLogin.classList.add('hidden');
  }

  // Clear all validation states when switching tabs
  clearAllErrors();
}


// ================================================
// PASSWORD VISIBILITY TOGGLE
// ================================================

/**
 * Toggles password visibility for a given input field.
 * @param {string} inputId - The ID of the password input element
 * @param {HTMLButtonElement} btn  - The toggle button element
 */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === 'password';

  input.type = isHidden ? 'text' : 'password';

  // Swap icon: eye vs eye-slash
  btn.innerHTML = isHidden
    ? `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
         <path d="M2 2l12 12M6.5 6.6A2 2 0 0010 9.4M4.3 4.4C3 5.3 1.8 6.8 1.3 8c1 2.5 3.6 4.5 6.7 4.5 1.1 0 2.1-.3 3-.7M7.5 3.6C7.7 3.5 7.8 3.5 8 3.5c3.1 0 5.7 2 6.7 4.5-.4 1-1 1.9-1.7 2.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
       </svg>`
    : `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
         <path d="M8 3C4 3 1.333 8 1.333 8S4 13 8 13s6.667-5 6.667-5S12 3 8 3z" stroke="currentColor" stroke-width="1.5"/>
         <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
       </svg>`;

  btn.setAttribute('aria-label', isHidden ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
}


// ================================================
// PASSWORD STRENGTH CHECKER
// ================================================

/**
 * Evaluates password strength and updates the strength indicator UI.
 * @param {string} value - Current password input value
 */
function checkPasswordStrength(value) {
  const fill  = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');

  if (!fill || !label) return;

  let score = 0;
  if (value.length >= 8)               score++;
  if (/[A-Z]/.test(value))             score++;
  if (/[0-9]/.test(value))             score++;
  if (/[^A-Za-z0-9]/.test(value))      score++;

  const levels = [
    { pct: '0%',   color: '#E2E8F0', text: '' },
    { pct: '33%',  color: '#EF4444', text: 'Yếu' },
    { pct: '55%',  color: '#F59E0B', text: 'Trung bình' },
    { pct: '78%',  color: '#3B82F6', text: 'Khá' },
    { pct: '100%', color: '#10B981', text: 'Mạnh' },
  ];

  const level = value.length === 0 ? levels[0] : levels[Math.min(score, 4)];

  fill.style.width      = level.pct;
  fill.style.background = level.color;
  label.textContent     = level.text;
  label.style.color     = level.color;
}


// ================================================
// VALIDATION HELPERS
// ================================================

/**
 * Marks an input as invalid and shows an error message beneath it.
 * @param {HTMLInputElement} input
 * @param {string} message
 */
function showError(input, message) {
  input.classList.add('error');

  // Remove existing error message if any
  const existing = input.closest('.input-group')?.querySelector('.error-msg');
  if (existing) existing.remove();

  const msg = document.createElement('p');
  msg.className   = 'error-msg';
  msg.textContent = message;
  msg.style.cssText = 'font-size:.75rem;color:#EF4444;margin-top:4px;font-weight:500;';

  input.closest('.input-wrapper').insertAdjacentElement('afterend', msg);
}

/**
 * Clears the error state from an input.
 * @param {HTMLInputElement} input
 */
function clearError(input) {
  input.classList.remove('error');
  const msg = input.closest('.input-group')?.querySelector('.error-msg');
  if (msg) msg.remove();
}

/** Removes all validation error states on the page. */
function clearAllErrors() {
  document.querySelectorAll('.input-field.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.error-msg').forEach(el => el.remove());
}

/**
 * Validates an email string.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}


// ================================================
// TOAST NOTIFICATIONS
// ================================================

let toastTimer = null;

/**
 * Displays a toast notification message.
 * @param {string} message  - Text to display
 * @param {'success'|'error'|'default'} type
 * @param {number} [duration=3000] - Auto-hide after ms
 */
function showToast(message, type = 'default', duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  // Clear previous timer
  if (toastTimer) clearTimeout(toastTimer);

  toast.textContent = message;
  toast.className   = 'toast';

  if (type === 'success') toast.classList.add('success');
  if (type === 'error')   toast.classList.add('error');

  // Force reflow so transition fires
  void toast.offsetWidth;
  toast.classList.add('show');

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}


// ================================================
// BUTTON LOADING STATE
// ================================================

/**
 * Sets or clears the loading state on the submit button.
 * @param {HTMLButtonElement} btn
 * @param {boolean} loading
 * @param {string} originalText
 */
function setButtonLoading(btn, loading, originalText = '') {
  if (loading) {
    btn.classList.add('loading');
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="animation:spin .8s linear infinite">
        <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <path d="M8 2a6 6 0 016 6" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>Đang xử lý...</span>`;
  } else {
    btn.classList.remove('loading');
    btn.innerHTML = originalText;
  }
}


// ================================================
// LOGIN HANDLER
// ================================================

/**
 * Validates and submits the login form.
 * In production, replace the simulated async call with a real API request.
 */
async function handleLogin() {
  const emailInput = document.getElementById('login-email');
  const passInput  = document.getElementById('login-password');
  const btn        = document.querySelector('#form-login .submit-btn');

  clearAllErrors();

  let valid = true;

  if (!emailInput.value.trim()) {
    showError(emailInput, 'Vui lòng nhập email.');
    valid = false;
  } else if (!isValidEmail(emailInput.value)) {
    showError(emailInput, 'Email không hợp lệ.');
    valid = false;
  }

  if (!passInput.value) {
    showError(passInput, 'Vui lòng nhập mật khẩu.');
    valid = false;
  } else if (passInput.value.length < 6) {
    showError(passInput, 'Mật khẩu phải có ít nhất 6 ký tự.');
    valid = false;
  }

  if (!valid) return;

  // --- Simulated async login (replace with real fetch/axios call) ---
  const originalHTML = btn.innerHTML;
  setButtonLoading(btn, true);

  await simulateApiCall(1200);

  setButtonLoading(btn, false, originalHTML);

  // Demo: treat any input as success
  showToast('🎉 Đăng nhập thành công! Đang chuyển hướng...', 'success');
}


// ================================================
// REGISTER HANDLER
// ================================================

/**
 * Validates and submits the registration form.
 * In production, replace the simulated async call with a real API request.
 */
async function handleRegister() {
  const firstInput  = document.getElementById('reg-firstname');
  const lastInput   = document.getElementById('reg-lastname');
  const emailInput  = document.getElementById('reg-email');
  const phoneInput  = document.getElementById('reg-phone');
  const passInput   = document.getElementById('reg-password');
  const confirmInput= document.getElementById('reg-confirm');
  const termsBox    = document.getElementById('agree-terms');
  const btn         = document.querySelector('#form-register .submit-btn');

  clearAllErrors();

  let valid = true;

  if (!firstInput.value.trim()) {
    showError(firstInput, 'Vui lòng nhập họ của bạn.');
    valid = false;
  }

  if (!lastInput.value.trim()) {
    showError(lastInput, 'Vui lòng nhập tên của bạn.');
    valid = false;
  }

  if (!emailInput.value.trim()) {
    showError(emailInput, 'Vui lòng nhập email.');
    valid = false;
  } else if (!isValidEmail(emailInput.value)) {
    showError(emailInput, 'Email không hợp lệ.');
    valid = false;
  }

  if (!phoneInput.value.trim()) {
    showError(phoneInput, 'Vui lòng nhập số điện thoại.');
    valid = false;
  } else if (!/^(0|\+84)[3-9]\d{8}$/.test(phoneInput.value.replace(/\s/g, ''))) {
    showError(phoneInput, 'Số điện thoại Việt Nam không hợp lệ.');
    valid = false;
  }

  if (!passInput.value) {
    showError(passInput, 'Vui lòng nhập mật khẩu.');
    valid = false;
  } else if (passInput.value.length < 8) {
    showError(passInput, 'Mật khẩu phải có ít nhất 8 ký tự.');
    valid = false;
  }

  if (!confirmInput.value) {
    showError(confirmInput, 'Vui lòng xác nhận mật khẩu.');
    valid = false;
  } else if (passInput.value !== confirmInput.value) {
    showError(confirmInput, 'Mật khẩu xác nhận không khớp.');
    valid = false;
  }

  if (!termsBox.checked) {
    showToast('⚠️ Bạn cần đồng ý với điều khoản sử dụng.', 'error');
    valid = false;
  }

  if (!valid) return;

  // --- Simulated async register (replace with real fetch/axios call) ---
  const originalHTML = btn.innerHTML;
  setButtonLoading(btn, true);

  await simulateApiCall(1500);

  setButtonLoading(btn, false, originalHTML);

  showToast('✅ Tạo tài khoản thành công! Chào mừng bạn.', 'success');
}


// ================================================
// UTILITIES
// ================================================

/**
 * Simulates a network delay.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function simulateApiCall(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Add CSS keyframe for spinner via JS (avoids needing a separate rule in CSS)
const style = document.createElement('style');
style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(style);


// ================================================
// INLINE VALIDATION — clear error on input
// ================================================

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.input-field').forEach(input => {
    input.addEventListener('input', () => clearError(input));
  });
});
