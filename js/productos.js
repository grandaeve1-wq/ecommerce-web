productos.forEach(prod => {
      const etiquetasProducto = prod.dataset.etiquetas ? prod.dataset.etiquetas.toLowerCase().split(',').map(s => s.trim()) : [];
      const precioProd = parseFloat(prod.dataset.precio) || 0;

      const etiquetaMatch = etiquetasSeleccionadas.length === 0 || etiquetasSeleccionadas.some(et => etiquetasProducto.includes(et.toLowerCase()));

      const precioMatch = precioCoincide(precioProd);

      prod.style.display = (etiquetaMatch && precioMatch) ? 'block' : 'none';
    });