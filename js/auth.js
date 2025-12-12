document.addEventListener('DOMContentLoaded', () => {
  const SESSION_KEY = 'session_user_v1';
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
    catch { return null; }
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  const session = getSession();
  const acciones = document.querySelector('.acciones');
  if (!acciones) return;

  if (session && session.username) {
    const wrapper = document.createElement('div');
    wrapper.className = 'header-session';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '8px';

    const span = document.createElement('span');
    span.textContent = `Hola, ${session.username}`;
    span.style.fontWeight = 'bold';
    span.style.color = '#000';

    const btn = document.createElement('button');
    btn.textContent = 'Cerrar sesión';
    btn.style.background = 'transparent';
    btn.style.border = '1px solid #000';
    btn.style.borderRadius = '16px';
    btn.style.padding = '6px 10px';
    btn.style.cursor = 'pointer';

    btn.addEventListener('click', () => {
      clearSession();
      try { window.location.href = 'login.html'; } catch(e) { location.reload(); }
    });

    wrapper.appendChild(span);
    wrapper.appendChild(btn);

    acciones.appendChild(wrapper);
  }

  window.logout = function() { clearSession(); window.location.href = 'login.html'; };
});
