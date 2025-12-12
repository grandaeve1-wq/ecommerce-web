// Simple client-side registration handler saving users to localStorage under `usuarios_v1`
// Not secure for production — passwords are stored in plain text for demo purposes.

document.addEventListener('DOMContentLoaded', () => {
  const inputUser = document.getElementById('reg-username');
  const inputId = document.getElementById('reg-identifier');
  const inputPass = document.getElementById('reg-password');
  const btn = document.getElementById('btn-crear');
  const msg = document.getElementById('reg-message');

  if (!inputUser || !inputId || !inputPass || !btn) return;

  const USERS_KEY = 'usuarios_v1';

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
    catch { return []; }
  }
  function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

  function showMessage(text, type = 'error') {
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = type === 'error' ? '#8b0000' : '#0b6623';
  }

    // Field-level error helpers
    const errUser = document.getElementById('error-username');
    const errId = document.getElementById('error-identifier');
    const errPass = document.getElementById('error-password');

    function clearFieldErrors() {
      if (errUser) errUser.textContent = '';
      if (errId) errId.textContent = '';
      if (errPass) errPass.textContent = '';
      inputUser.classList.remove('input-error');
      inputId.classList.remove('input-error');
      inputPass.classList.remove('input-error');
    }

  function normalize(str){ return (str||'').toString().trim().toLowerCase(); }

  btn.addEventListener('click', () => {
    const username = inputUser.value.trim();
    const identifier = inputId.value.trim();
    const password = inputPass.value;

    if (!username || !identifier || !password) {
        if (!username) { if (errUser) errUser.textContent = 'Ingresa un nombre de usuario.'; inputUser.classList.add('input-error'); }
        if (!identifier) { if (errId) errId.textContent = 'Ingresa correo o teléfono.'; inputId.classList.add('input-error'); }
        if (!password) { if (errPass) errPass.textContent = 'Ingresa una contraseña.'; inputPass.classList.add('input-error'); }
        showMessage('Corrige los campos en rojo.', 'error');
      return;
    }
    if (password.length < 4) {
        if (errPass) errPass.textContent = 'La contraseña debe tener al menos 4 caracteres.';
        inputPass.classList.add('input-error');
        showMessage('Corrige los campos en rojo.', 'error');
      return;
    }

    const users = getUsers();

    if (users.some(u => normalize(u.username) === normalize(username))) {
      if (errUser) errUser.textContent = 'El nombre de usuario ya existe.';
      inputUser.classList.add('input-error');
      showMessage('Elige otro nombre de usuario.', 'error');
      return;
    }

    const isEmail = identifier.includes('@');
    const isPhone = /^\+?[0-9\s-]{7,}$/.test(identifier);
    const email = isEmail ? identifier : '';
    const phone = !isEmail ? identifier : '';

    if (email && users.some(u => u.email && normalize(u.email) === normalize(email))) {
      if (errId) errId.textContent = 'Ya existe una cuenta con ese correo.';
      inputId.classList.add('input-error');
      showMessage('Usa otro correo o inicia sesión.', 'error');
      return;
    }
    if (phone && users.some(u => u.phone && normalize(u.phone) === normalize(phone))) {
      if (errId) errId.textContent = 'Ya existe una cuenta con ese teléfono.';
      inputId.classList.add('input-error');
      showMessage('Usa otro teléfono o inicia sesión.', 'error');
      return;
    }

    const newUser = { username, email, phone, password };
    users.push(newUser);
    saveUsers(users);
    clearFieldErrors();
    showMessage('Cuenta creada correctamente. Redirigiendo a iniciar sesión...', 'success');
    setTimeout(() => { window.location.href = 'login.html'; }, 900);
  });

  inputUser.addEventListener('input', () => { if (errUser) errUser.textContent = ''; inputUser.classList.remove('input-error'); });
  inputId.addEventListener('input', () => { if (errId) errId.textContent = ''; inputId.classList.remove('input-error'); });
  inputPass.addEventListener('input', () => { if (errPass) errPass.textContent = ''; inputPass.classList.remove('input-error'); });
});
