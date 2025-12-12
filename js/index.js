document.addEventListener("DOMContentLoaded", () => {


  const botonesCategorias = document.querySelectorAll(".categorias button");
  const productos = Array.from(document.querySelectorAll(".producto-catalogo"));
  const contenedor = document.querySelector(".productos-catalogo");

  const searchInput = document.querySelector('.search-bar input');
  const searchItemsContainer = document.querySelector('.search-items');

 
  let remoteProducts = null; 

  async function fetchIndexProducts() {
    if (remoteProducts) return remoteProducts;
    try {
      const resp = await fetch('Index.html');
      const text = await resp.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const nodes = Array.from(doc.querySelectorAll('.producto-catalogo'));
      remoteProducts = nodes.map(n => {
        const a = n.querySelector('a');
        const img = n.querySelector('img');
        const name = n.querySelector('p')?.innerText || '';
        return {
          name: name.trim(),
          imgSrc: img ? img.getAttribute('src') : '',
          href: a ? a.getAttribute('href') : '#',
          tags: (n.dataset.etiquetas || '').toLowerCase()
        };
      });
    } catch (err) {
      console.error('Error cargando Index.html para búsqueda:', err);
      remoteProducts = [];
    }
    return remoteProducts;
  }

  async function performSearch(query) {
    const q = (query || '').trim().toLowerCase();
    if (!searchItemsContainer) return;
    searchItemsContainer.innerHTML = '';

    
    let useNodes = productos && productos.length > 0;
    let candidates = [];

    if (useNodes) {
      candidates = q === '' ? productos.slice(0, 4) : productos.filter(prod => {
        const name = (prod.querySelector('p')?.innerText || '').toLowerCase();
        const alt = (prod.querySelector('img')?.alt || '').toLowerCase();
        const tags = (prod.dataset.etiquetas || '').toLowerCase();
        const href = (prod.querySelector('a')?.getAttribute('href') || '').toLowerCase();
        return name.includes(q) || alt.includes(q) || tags.includes(q) || href.includes(q);
      });
    } else {
      const remote = await fetchIndexProducts();
      if (!remote || remote.length === 0) {
        const no = document.createElement('div');
        no.innerText = 'No se encontraron productos.';
        no.style.padding = '10px';
        searchItemsContainer.appendChild(no);
        return;
      }
      candidates = q === '' ? remote.slice(0, 4) : remote.filter(p => {
        const name = (p.name || '').toLowerCase();
        const tags = (p.tags || '').toLowerCase();
        const href = (p.href || '').toLowerCase();
        return name.includes(q) || tags.includes(q) || href.includes(q);
      });
    }

    if (candidates.length === 0) {
      const no = document.createElement('div');
      no.innerText = 'No se encontraron productos.';
      no.style.padding = '10px';
      searchItemsContainer.appendChild(no);
      return;
    }

    candidates.slice(0, 12).forEach(prod => {
      let link = '#', imgSrc = '', name = '';
      if (useNodes) {
        const a = prod.querySelector('a');
        const img = prod.querySelector('img');
        name = prod.querySelector('p')?.innerText || '';
        link = a ? a.getAttribute('href') : '#';
        imgSrc = img ? img.getAttribute('src') : '';
      } else {
        name = prod.name || '';
        link = prod.href || '#';
        imgSrc = prod.imgSrc || '';
      }

      const item = document.createElement('div');
      item.className = 'search-item';
      item.style.display = 'inline-block';
      item.style.margin = '6px';
      item.innerHTML = `<a href="${link}"><img src="${imgSrc}" alt="${name}" style="width:100px;height:100px;object-fit:cover;border-radius:8px;display:block"></a>`;
      searchItemsContainer.appendChild(item);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      performSearch(e.target.value);
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch(e.target.value);
      }
    });
   
    performSearch('');
  }



  let estadoFiltros = {
    etiquetas: [],
    precios: [],
    orden: 'todos'
  };


  botonesCategorias.forEach(boton => {
    boton.addEventListener("click", () => {
      botonesCategorias.forEach(btn => btn.classList.remove("activo"));
      boton.classList.add("activo");
      estadoFiltros.orden = boton.dataset.filtro;
      aplicarFiltros();
    });
  });


  const todosCheckboxes = Array.from(document.querySelectorAll(".filtros input[type='checkbox']"));
  const pricePattern = /^\d/;
  const checkboxesPrecio = todosCheckboxes.filter(cb => cb.hasAttribute('value') && pricePattern.test(cb.value));
  const checkboxesEtiquetas = todosCheckboxes.filter(cb => !cb.hasAttribute('value') || (cb.hasAttribute('value') && !pricePattern.test(cb.value)));

  console.log('Filtros: total checkboxes=', todosCheckboxes.length, 'etiquetas=', checkboxesEtiquetas.length, 'precios=', checkboxesPrecio.length, 'productos=', productos.length);

 
  checkboxesEtiquetas.forEach(checkbox => {
    const label = checkbox.parentElement;
    const etiquetaFromValue = checkbox.hasAttribute('value') ? (checkbox.value || '') : '';
    const texto = (etiquetaFromValue || (label ? label.innerText : ''))
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    checkbox.setAttribute('data-etiqueta', texto);
    checkbox.addEventListener('change', aplicarFiltros);
  });

 
  checkboxesPrecio.forEach(checkbox => {
    checkbox.addEventListener('change', aplicarFiltros);
  });

  
  function aplicarFiltros() {
    const etiquetasActuales = Array.from(checkboxesEtiquetas)
      .filter(cb => cb.checked)
      .map(cb => (cb.getAttribute('data-etiqueta') || '').toLowerCase());

    const preciosActuales = Array.from(checkboxesPrecio)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    let productosMostrar = [...productos];

    if (etiquetasActuales.length > 0) {
      productosMostrar = productosMostrar.filter(prod => {
        const etiquetasProducto = (prod.dataset.etiquetas || '')
          .toLowerCase()
          .split(',')
          .map(e => e.trim());
        
        return etiquetasActuales.some(et => etiquetasProducto.includes(et));
      });
    }

    if (preciosActuales.length > 0) {
      productosMostrar = productosMostrar.filter(prod => {
        const precio = parseFloat(prod.dataset.precio) || 0;
        
        return preciosActuales.some(rango => {
          if (rango.endsWith('+')) {
            const minimo = parseFloat(rango.replace('+', '')) * 1000;
            return precio >= minimo;
          } else if (rango.includes('-')) {
            const [min, max] = rango.split('-').map(x => parseFloat(x) * 1000);
            return precio >= min && precio <= max;
          }
          return false;
        });
      });
    }

    const orden = document.querySelector('.categorias button.activo')?.dataset.filtro || 'todos';
    if (orden === 'menor-a-mayor') {
      productosMostrar.sort((a, b) => parseFloat(a.dataset.precio) - parseFloat(b.dataset.precio));
    } else if (orden === 'mayor-a-menor') {
      productosMostrar.sort((a, b) => parseFloat(b.dataset.precio) - parseFloat(a.dataset.precio));
    }

    productos.forEach(prod => prod.style.display = 'none');
    productosMostrar.forEach(prod => {
      prod.style.display = 'block';
      if (contenedor && contenedor.contains(prod)) {
        contenedor.appendChild(prod);
      }
    });
    console.log('Productos visibles:', productosMostrar.length);
  }

  aplicarFiltros();

});



