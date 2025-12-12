
const CART_KEY = 'miCarrito_v1';
const ORDERS_KEY = 'misPedidos_v1';

function parsePriceFromText(text) {
  if (!text) return 0;
  const digits = ('' + text).replace(/[^0-9]/g, '');
  return parseInt(digits || '0', 10);
}

function formatCOP(n) {
  const num = Math.floor(n || 0);
  return 'COP ' + num.toLocaleString('es-CO');
}

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch(e){return []}
}
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function loadOrders() {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); } catch(e){return []}
}
function saveLocalOrder(order) {
  const orders = loadOrders();
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function generateId(title, img) {
  const base = (title || 'prod').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g,'');
  const file = (img || '').split('/').pop() || Date.now();
  return `${base}-${file}`;
}

function addToCart(item) {
  const cart = loadCart();
  const existing = cart.find(c => c.id === item.id);
  if (existing) existing.qty = (existing.qty || 1) + (item.qty || 1);
  else cart.push({...item, qty: item.qty || 1});
  saveCart(cart);
}

function setupProductPageButtons() {
  const anchors = Array.from(document.querySelectorAll('.btn-carrito a, .btn-carrito'));
  if (anchors.length === 0) return;

  anchors.forEach(a => {
    a.addEventListener('click', (e) => {
      if (a.tagName === 'A') e.preventDefault();

      const prod = a.closest('.producto') || document;
      const title = (prod.querySelector('.info-producto h2')?.innerText || prod.querySelector('h2')?.innerText || '').trim();
      const priceText = (prod.querySelector('.precio')?.innerText || prod.dataset.precio || '').trim();
      const price = parsePriceFromText(priceText);
      const img = prod.querySelector('img')?.getAttribute('src') || '';
      const id = generateId(title, img);

      addToCart({ id, title, price, img, qty: 1 });

      const href = (a.tagName === 'A') ? a.getAttribute('href') : 'carrito.html';
      if (href) window.location.href = href;
    });
  });
}

function renderCartPage() {
  const cont = document.querySelector('.carrito-principal');
  const resumen = document.getElementById('resumen-contenido');
  if (!cont || !resumen) return;

  function calculateTotals(cart) {
    const itemsTotal = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);
    const extraChecks = Array.from(document.querySelectorAll('.adicionales input[type="checkbox"]'));
    const extras = extraChecks.filter(chk => chk.checked).map(chk => ({
      name: chk.parentElement?.innerText?.trim() || 'extra',
      price: parseInt(chk.dataset.price || '0', 10)
    }));
    const extrasTotal = extras.reduce((s,e)=>s+e.price,0);
    const envio = 14000; 
    const total = itemsTotal + extrasTotal + envio;
    return { itemsTotal, extras, extrasTotal, envio, total };
  }

  function refresh() {
    const cart = loadCart();
    const existingItems = Array.from(cont.querySelectorAll('.producto-item'));
    existingItems.forEach(n => n.remove());

    if (cart.length === 0) {
      const empty = document.createElement('div');
      empty.innerText = 'Tu carrito está vacío.';
      empty.style.padding = '12px';
      cont.insertBefore(empty, cont.querySelector('.extras'));
    }

    cart.forEach(item => {
      const node = document.createElement('div');
      node.className = 'producto-item';
      node.innerHTML = `
        <input type="checkbox">
        <img src="${item.img}" alt="${item.title}">
        <div class="producto-detalle">
          <p>${item.title}</p>
          <p class="precio">${formatCOP(item.price)}</p>
          <p>Subtotal: <span class="sub-item">${formatCOP((item.price||0)*(item.qty||1))}</span></p>
          <label>Cantidad: <input type="number" min="1" value="${item.qty||1}" class="qty-input" style="width:60px"></label>
          <a href="#" class="eliminar">Eliminar</a>
        </div>
      `;

      // listeners
      const qtyInput = node.querySelector('.qty-input');
      qtyInput.addEventListener('change', (e) => {
        const q = Math.max(1, parseInt(e.target.value || '1', 10));
        const cart = loadCart();
        const found = cart.find(c => c.id === item.id);
        if (found) found.qty = q;
        saveCart(cart);
        refresh();
      });
      node.querySelector('.eliminar').addEventListener('click', (e) => {
        e.preventDefault();
        let cart = loadCart();
        cart = cart.filter(c => c.id !== item.id);
        saveCart(cart);
        refresh();
      });

      const extrasNode = cont.querySelector('.extras');
      if (extrasNode) cont.insertBefore(node, extrasNode);
      else cont.appendChild(node);
    });

    const totals = calculateTotals(cart);
    resumen.innerHTML = `
      <p>Productos: <span>${cart.length}</span></p>
      <p>Subtotal productos: <span>${formatCOP(totals.itemsTotal)}</span></p>
      <p>Extras: <span>${formatCOP(totals.extrasTotal)}</span></p>
      <p>Envío: <span>${formatCOP(totals.envio)}</span></p>
      <hr>
      <p class="total">Total: <span>${formatCOP(totals.total)}</span></p>
    `;
  }

  const extraChecks = Array.from(document.querySelectorAll('.adicionales input[type="checkbox"]'));
  const impresionesCheckbox = Array.from(extraChecks).find(chk => chk.parentElement?.innerText?.includes('Impresiones'));
  
  if (impresionesCheckbox) {
    let fileInputContainer = document.getElementById('file-input-container');
    if (!fileInputContainer) {
      const container = document.createElement('div');
      container.id = 'file-input-container';
      container.style.cssText = 'margin-top: 15px; padding: 15px; background-color: rgba(255,255,255,0.6); border-radius: 8px; display: none;';
      container.innerHTML = `
        <label style="font-weight: 600; color: #e06287; display: block; margin-bottom: 10px;">📸 Subir foto para impresión:</label>
        <input type="file" id="fotoImpresion" accept="image/*" style="width: 100%; padding: 8px; border-radius: 8px; border: 2px solid #e691b1;">
        <small style="display: block; margin-top: 8px; color: #666;">Formatos: JPG, PNG. Máx. 5MB</small>
      `;
      const adicionales = document.querySelector('.adicionales');
      if (adicionales) adicionales.parentElement.insertBefore(container, adicionales.nextSibling);
      fileInputContainer = container;
    }
  }
  
  extraChecks.forEach(chk => {
    chk.addEventListener('change', () => {
      if (impresionesCheckbox) {
        const fileInputContainer = document.getElementById('file-input-container');
        if (fileInputContainer) fileInputContainer.style.display = impresionesCheckbox.checked ? 'block' : 'none';
      }
      refresh();
    });
  });
  refresh();

  const btnGuardar = document.getElementById('guardarPedido');
  if (btnGuardar) btnGuardar.addEventListener('click', async () => {
    const cart = loadCart();
    if (cart.length === 0) { alert('El carrito está vacío.'); return; }

    const note = document.querySelector('.nota textarea')?.value || '';
    const fotoFile = document.getElementById('fotoImpresion')?.files?.[0] || null;
    const extraChecks = Array.from(document.querySelectorAll('.adicionales input[type="checkbox"]'));
    const extras = extraChecks.filter(chk => chk.checked).map(chk => ({
      name: chk.parentElement?.innerText?.trim(),
      price: parseInt(chk.dataset.price||'0',10),
      foto: chk.parentElement?.innerText?.includes('Impresiones') && fotoFile ? { name: fotoFile.name, size: fotoFile.size, type: fotoFile.type } : null
    }));

    const { itemsTotal, extrasTotal, envio, total } = (function(){
      const itemsTotal = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);
      const extrasTotal = extras.reduce((s,e)=>s+(e.price||0),0);
      const envio = 14000;
      return { itemsTotal, extrasTotal, envio, total: itemsTotal+extrasTotal+envio };
    })();

    const order = {
      items: cart,
      itemsTotal,
      extras,
      extrasTotal,
      envio,
      total,
      note,
      fecha: new Date().toISOString(),
      timestamp: Date.now()
    };

    try {
      const saved = await saveOrder(order, fotoFile);
      alert('Pedido guardado correctamente.');
      saveCart([]);
      refresh();
    } catch (err) {
      console.error('Error guardando pedido:', err);
      alert('Ocurrió un error al guardar el pedido. Se ha guardado localmente.');
      saveLocalOrder(order);
    }
  });
}


async function saveOrder(order, fotoFile = null) {
  const cfg = window.firebaseConfig || window.FIREBASE_CONFIG || null;
  if (!cfg) {
    saveLocalOrder(order);
    return { local: true };
  }

  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
  const firestoreMod = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
  const storageMod = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js');
  const { getFirestore, collection, addDoc } = firestoreMod;
  const { getStorage, ref, uploadBytes, getDownloadURL } = storageMod;

  if (!window._firebaseAppInstance) {
    window._firebaseAppInstance = initializeApp(cfg);
  }
  const app = window._firebaseAppInstance;
  const db = getFirestore(app);
  const storage = getStorage(app);

  if (fotoFile) {
    try {
      const safeName = (fotoFile.name || 'foto').replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const path = `orders/${Date.now()}_${safeName}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, fotoFile);
      const url = await getDownloadURL(storageRef);
      order.imageUrl = url;
    } catch (err) {
      console.warn('No se pudo subir la imagen a Firebase Storage:', err);
    }
  }

  const docRef = await addDoc(collection(db, 'orders'), order);
  return { id: docRef.id };
}

document.addEventListener('DOMContentLoaded', () => {
  try { setupProductPageButtons(); } catch(e){/* no-op */}
  try { renderCartPage(); } catch(e){/* no-op */}
});
