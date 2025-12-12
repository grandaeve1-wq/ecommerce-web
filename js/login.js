document.addEventListener('DOMContentLoaded', () => {
  const inputId = document.getElementById('login-identifier');
  const inputPass = document.getElementById('login-password');
  const btn = document.getElementById('btn-iniciar');
  const msg = document.getElementById('login-message');

  if (!inputId || !inputPass || !btn) return;

  const USERS_KEY = 'usuarios_v1';
  const SESSION_KEY = 'session_user_v1';

  function getUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function ensureDemoUser() {
    const users = getUsers();
    if (!users || users.length === 0) {
      const demo = {
        username: 'demo',
        email: 'demo@demo.com',
        phone: '3000000000',
        password: 'demo123'
      };
      users.push(demo);
      saveUsers(users);
      console.info('Usuario demo creado: demo / demo123');
    }
  }

  function findUser(identifier) {
    const users = getUsers();
    const id = (identifier || '').toLowerCase();
    return users.find(u => {
      return (u.username && u.username.toLowerCase() === id) ||
             (u.email && u.email.toLowerCase() === id) ||
             (u.phone && u.phone.toLowerCase() === id);
    });
  }

  function setSession(user) {
    const session = {
      username: user.username,
      email: user.email,
      phone: user.phone || null,
      loggedAt: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function showMessage(text, type = 'error') {
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = type === 'error' ? '#8b0000' : '#0b6623';
  }

  ensureDemoUser();

  btn.addEventListener('click', (e) => {
    const identifier = inputId.value.trim();
    const password = inputPass.value;

    if (!identifier || !password) {
      showMessage('Por favor completa ambos campos.', 'error');
      return;
    }

    const user = findUser(identifier);
    if (!user) {
      showMessage('Usuario no encontrado. Regístrate primero.', 'error');
      return;
    }

    if (user.password !== password) {
      showMessage('Contraseña incorrecta.', 'error');
      return;
    }

    setSession(user);
    showMessage('Inicio de sesión exitoso. Redirigiendo...', 'success');
    setTimeout(() => {
      window.location.href = 'Index.html';
    }, 700);
  });

});
