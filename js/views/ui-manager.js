import { db } from '../data/firebase-config.js';
import { DATA_EL_SALVADOR } from '../data/geo-data.js';
import { doc, getDoc, updateDoc, getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { CATEGORIAS_SYSTEM, obtenerProductosVendedor, eliminarProducto, actualizarProducto } from '../logic/products-logic.js';
import { obtenerVendedoresCercanos, obtenerProductosDeVendedores } from '../logic/geo-logic.js';
import { crearPedido, obtenerPedidosVendedor, obtenerPedidosCliente } from '../logic/orders-logic.js';// Asegúrate de importar obtenerPedidosCliente


let rolRealUsuario = '';

// --- VARIABLES GLOBALES ---
let todosLosProductos = [];
let productosMostrados = 0;
const PRODUCTOS_POR_PAGINA = 10;
window.variantesTemporales = []; 

// Variable para guardar la selección temporal del cliente en el modal
window.seleccionClienteTemp = {};

// Variables para el Cliente (Caché)
let carrito = JSON.parse(localStorage.getItem('guacha_carrito')) || [];
let cacheVendedoresOrdenados = [];
let cacheProductosGlobales = [];

// =========================================================
//  1. UTILIDADES Y NAVEGACIÓN
// =========================================================

function ocultarTodo() {
    const views = [
        'view-landing', 'view-login', 'view-register', 'view-welcome-options', 
        'view-client-dashboard', 'view-business-detail', 'view-client-orders', 'view-seller-dashboard', 
        'view-plans', 'view-checkout', 'view-seller-setup', 'view-location-setup', 'view-profile'
    ]; 
    views.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.classList.add('d-none');
            el.classList.remove('d-flex', 'd-block');
        }
    });
}

function mostrarBarraInferior() {
    const navs = document.querySelectorAll('.fixed-bottom');
    navs.forEach(n => n.classList.remove('d-none'));
}

function ocultarBarraInferior() {
    const navs = document.querySelectorAll('.fixed-bottom');
    navs.forEach(n => n.classList.add('d-none'));
}

function mostrarOpcionesBienvenida() {
    ocultarTodo();
    document.getElementById('view-welcome-options').classList.remove('d-none');
    document.getElementById('view-welcome-options').classList.add('d-flex');
}

function volverALanding() {
    ocultarTodo();
    document.getElementById('view-landing').classList.remove('d-none');
    document.getElementById('view-landing').classList.add('d-flex');
}

function mostrarLogin() {
    ocultarTodo();
    document.getElementById('view-login').classList.remove('d-none');
    document.getElementById('view-login').classList.add('d-flex');
}

function mostrarRegistro() {
    ocultarTodo();
    document.getElementById('view-register').classList.remove('d-none');
    document.getElementById('view-register').classList.add('d-block');
}

function volverAWelcome() {
    ocultarTodo();
    document.getElementById('view-welcome-options').classList.remove('d-none');
    document.getElementById('view-welcome-options').classList.add('d-flex');
}

function mostrarSelectorGoogle(n) {
    document.getElementById('google-user-name').innerText = n;
    const modal = new bootstrap.Modal(document.getElementById('modalGoogleType')); 
    modal.show();
}

// =========================================================
//  2. UBICACIÓN
// =========================================================

function mostrarConfiguracionUbicacion(modo = 'cliente') {
    ocultarTodo();
    ocultarBarraInferior();
    
    const title = document.getElementById('location-setup-title');
    const subtitle = document.getElementById('location-setup-subtitle');
    
    if (modo === 'vendedor') {
        title.innerText = 'Ubicación de tu Negocio';
        subtitle.innerText = 'Define dónde está tu local.';
    } else {
        title.innerText = 'Tu Ubicación';
        subtitle.innerText = '¿Dónde recibes pedidos?';
    }

    const tracker = document.getElementById('location-mode-tracker');
    if(tracker) tracker.value = modo;

    document.getElementById('view-location-setup').classList.remove('d-none');
    document.getElementById('view-location-setup').classList.add('d-block');

    inicializarListasGeograficas();

    if (window.iniciarMapa) {
        setTimeout(() => { window.iniciarMapa(); }, 300);
    }
}

function inicializarListasGeograficas() {
    const selDepto = document.getElementById('select-depto');
    const selMuni = document.getElementById('select-muni');
    const selDist = document.getElementById('select-dist');

    if (!selDepto) return;

    selDepto.innerHTML = '<option value="" selected disabled>Selecciona...</option>';
    selMuni.disabled = true;
    selDist.disabled = true;
    
    DATA_EL_SALVADOR.forEach((depto, index) => {
        const opt = document.createElement('option');
        opt.value = index; 
        opt.innerText = depto.nombre;
        selDepto.appendChild(opt);
    });

    selDepto.onchange = function() {
        const dData = DATA_EL_SALVADOR[this.value];
        selMuni.innerHTML = '<option value="" selected disabled>Selecciona...</option>';
        selMuni.disabled = false;
        if(dData) dData.municipios.forEach((m, i) => {
            const opt = document.createElement('option');
            opt.value = i; 
            opt.innerText = m.nombre;
            selMuni.appendChild(opt);
        });
    };

    selMuni.onchange = function() {
        const dData = DATA_EL_SALVADOR[selDepto.value].municipios[this.value];
        selDist.innerHTML = '<option value="" selected disabled>Selecciona...</option>';
        selDist.disabled = false;
        if(dData) dData.distritos.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.nombre; 
            opt.innerText = d.nombre;
            selDist.appendChild(opt);
        });
    }
}

// =========================================================
//  3. LÓGICA DE CLIENTE (NEGOCIOS -> PRODUCTOS)
// =========================================================

async function cargarDashboardCliente(uid) {
    const container = document.getElementById('contenedor-negocios-cliente'); 
    if(!container) return;
    
    container.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-guacha"></div><p class="mt-2 text-muted">Buscando tiendas...</p></div>';
    
    renderizarCategoriasCliente(); 

    try {
        const docSnap = await getDoc(doc(db, "usuarios", uid));
        const userData = docSnap.data();

        if (!userData.latitud || !userData.longitud) {
            container.innerHTML = '<div class="col-12 text-center py-5"><p>Configura tu ubicación para ver tiendas.</p><button class="btn btn-guacha text-white" onclick="mostrarConfiguracionUbicacion(\'cliente\')">Configurar</button></div>';
            return;
        }

        // 1. Obtener Vendedores (Ordenados por cercanía)
        // NOTA: Usamos 50km de radio para pruebas.
        cacheVendedoresOrdenados = await obtenerVendedoresCercanos(userData.latitud, userData.longitud, 50.0);

        if (cacheVendedoresOrdenados.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-5"><i class="bi bi-shop display-1 text-muted"></i><p class="mt-3">No hay tiendas registradas cerca.</p></div>';
            return;
        }

        // 2. Traer productos GLOBALES de esas tiendas (Para saber qué categorías tiene cada una)
        cacheProductosGlobales = await obtenerProductosDeVendedores(cacheVendedoresOrdenados);

        // 3. Asignar categorías a cada vendedor
        cacheVendedoresOrdenados.forEach(vendedor => {
            const susProductos = cacheProductosGlobales.filter(p => p.idVendedor === vendedor.id);
            const cats = [...new Set(susProductos.map(p => p.categoria))];
            vendedor.categorias = cats; 
        });

        // 4. Renderizar la lista de NEGOCIOS
        renderizarNegocios(cacheVendedoresOrdenados);

    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="text-danger text-center">Error al cargar tiendas.</div>';
    }
}

function renderizarCategoriasCliente() {
    const bar = document.getElementById('client-categories-container');
    if(!bar) return;
    
    let html = `<button class="btn btn-guacha text-white rounded-pill px-3 shadow-sm" onclick="filtrarNegocios('todas')">Todas</button>`;
    
    CATEGORIAS_SYSTEM.forEach(cat => {
        html += `<button class="btn btn-light border rounded-pill px-3 text-nowrap" onclick="filtrarNegocios('${cat.nombre}')">${cat.nombre}</button>`;
    });
    
    bar.innerHTML = html;
}

// Filtro de Negocios
function filtrarNegocios(categoria) {
    if (categoria === 'todas') {
        renderizarNegocios(cacheVendedoresOrdenados);
    } else {
        const filtrados = cacheVendedoresOrdenados.filter(v => v.categorias && v.categorias.includes(categoria));
        renderizarNegocios(filtrados);
    }
}

function renderizarNegocios(listaNegocios) {
    const container = document.getElementById('contenedor-negocios-cliente');
    if(!container) return;
    container.innerHTML = '';

    if (listaNegocios.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5 text-muted">Ninguna tienda cercana ofrece esta categoría.</div>';
        return;
    }

    listaNegocios.forEach(negocio => {
        const catsTexto = negocio.categorias && negocio.categorias.length > 0 ? negocio.categorias.join(', ') : 'Varios';
        
        const html = `
            <div class="col-12 col-md-6" onclick="window.verNegocio('${negocio.id}')" style="cursor:pointer">
                <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden mb-2">
                    <div class="d-flex align-items-center p-3">
                        <img src="${negocio.foto || 'img/logg.png'}" class="rounded-circle border" style="width: 60px; height: 60px; object-fit: cover;">
                        <div class="ms-3 flex-grow-1">
                            <div class="d-flex justify-content-between">
                                <h6 class="fw-bold mb-0 text-dark">${negocio.nombre}</h6>
                                <span class="badge bg-light text-dark border ms-2">${negocio.distanciaTxt || ''}</span>
                            </div>
                            <small class="text-muted d-block text-truncate" style="max-width: 200px;">
                                <i class="bi bi-tag-fill me-1" style="font-size:10px"></i>${catsTexto}
                            </small>
                        </div>
                        <i class="bi bi-chevron-right text-muted ms-2"></i>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

// Entrar a una tienda específica
function verNegocio(idVendedor) {
    const vendedor = cacheVendedoresOrdenados.find(v => v.id === idVendedor);
    if (!vendedor) return;

    ocultarTodo();
    document.getElementById('view-business-detail').classList.remove('d-none');
    document.getElementById('view-business-detail').classList.add('d-block');

    document.getElementById('biz-detail-name').innerText = vendedor.nombre;
    document.getElementById('biz-detail-dist').innerText = vendedor.distanciaTxt || '';
    document.getElementById('biz-detail-photo').src = vendedor.foto || 'img/logg.png';

    const productosTienda = cacheProductosGlobales.filter(p => p.idVendedor === idVendedor);
    const container = document.getElementById('contenedor-productos-negocio');
    container.innerHTML = '';

    if (productosTienda.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted mt-5">Sin productos visibles.</div>';
    } else {
        productosTienda.forEach(prod => {
            // Calcular stock visual (Real - Total en Carrito de este ID)
            const itemsEnCarrito = carrito.filter(item => item.id === prod.id);
            const cantidadTotalEnCarrito = itemsEnCarrito.reduce((acc, i) => acc + i.cantidad, 0);
            const stockVisual = prod.stock - cantidadTotalEnCarrito;
            const sinStock = stockVisual <= 0;

            let botonHtml = '';
            let stockBadge = '';

            // ID común para el botón, así podemos reactivarlo sea cual sea su tipo
            const btnId = `btn-add-${prod.id}`;

            if (sinStock) {
                botonHtml = `<button id="${btnId}" class="btn btn-sm btn-secondary w-100 rounded-pill" disabled style="font-size: 10px;">AGOTADO</button>`;
                stockBadge = `<span id="stock-badge-${prod.id}" class="badge bg-danger text-white border border-danger" style="font-size: 9px;">Agotado</span>`;
            } else {
                const tieneVariantes = prod.variantes && prod.variantes.length > 0;
                
                if(tieneVariantes) {
                     // Agregamos ID al botón de opciones también
                     botonHtml = `<button id="${btnId}" class="btn btn-sm btn-outline-primary w-100 rounded-pill" onclick="window.abrirSelectorVariantes('${prod.id}')">Seleccionar</button>`;
                } else {
                     botonHtml = `<button id="${btnId}" class="btn btn-sm btn-guacha text-white rounded-circle shadow-sm p-0 px-2" onclick="window.agregarAlCarrito('${prod.id}')">+</button>`;
                }
                stockBadge = `<span id="stock-badge-${prod.id}" class="badge bg-light text-dark border" style="font-size: 9px;">Stock: ${stockVisual}</span>`;
            }

            const html = `
                <div class="col-6 col-sm-4 col-md-3">
                    <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                        <div style="aspect-ratio: 1/1; position: relative;">
                            <img src="${prod.imagen}" class="w-100 h-100" style="object-fit: cover; filter: ${sinStock ? 'grayscale(100%)' : 'none'};">
                            ${sinStock ? '<div class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-10"></div>' : ''}
                        </div>
                        <div class="card-body p-2">
                            <h6 class="text-truncate mb-1 small fw-bold text-dark">${prod.nombre}</h6>
                            <div class="d-flex justify-content-between align-items-center mt-2">
                                <div>
                                    <span class="d-block fw-bold text-guacha small">$${parseFloat(prod.precio).toFixed(2)}</span>
                                    ${stockBadge}
                                </div>
                                <div style="min-width: 30px; text-align: right;">${botonHtml}</div>
                            </div>
                        </div>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', html);
        });
    }
    actualizarBadgeCarrito();
}

// --- LÓGICA DE SELECCIÓN DE VARIANTES (TIPO ACUMULADOR) ---

window.abrirSelectorVariantes = function(prodId) {
    const prod = cacheProductosGlobales.find(p => p.id === prodId);
    if (!prod) return;

    document.getElementById('lbl-nombre-prod-var').innerText = prod.nombre;
    document.getElementById('id-prod-var-temp').value = prod.id;

    // Reiniciamos la selección temporal al abrir
    window.seleccionClienteTemp = {}; 

    // Renderizamos la lista inicial
    renderizarListaVariantes(prod);

    new bootstrap.Modal(document.getElementById('modalSeleccionVariante')).show();
};

// Función auxiliar para dibujar la lista (se llama cada vez que tocas + o -)
function renderizarListaVariantes(prod) {
    const container = document.getElementById('contenedor-botones-variantes');
    container.innerHTML = '';

    prod.variantes.forEach(v => {
        // 1. Calcular Stock Real (Base de datos - Lo que ya tengo en carrito)
        const enCarrito = carrito.find(item => item.id === prod.id && item.variante === v.talla);
        const cantEnCarrito = enCarrito ? enCarrito.cantidad : 0;
        
        // 2. Calcular Stock Visual (Stock Real - Lo que estoy seleccionando ahora mismo en el modal)
        const cantSeleccionadaAhora = window.seleccionClienteTemp[v.talla] || 0;
        const stockDisponibleVisual = v.stock - cantEnCarrito - cantSeleccionadaAhora;
        
        const sinStock = stockDisponibleVisual <= 0;

        // 3. Crear HTML de la fila
        const row = document.createElement('div');
        row.className = "d-flex justify-content-between align-items-center mb-2 p-2 border rounded bg-white";
        
        row.innerHTML = `
            <div class="lh-1">
                <span class="fw-bold d-block text-dark">${v.talla}</span>
                <small class="${stockDisponibleVisual === 0 ? 'text-danger fw-bold' : 'text-muted'}">
                    Disp: ${stockDisponibleVisual}
                </small>
            </div>
            <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-secondary" 
                        onclick="window.cambiarCantidadTemp('${prod.id}', '${v.talla}', -1)" 
                        ${cantSeleccionadaAhora === 0 ? 'disabled' : ''}>
                    <i class="bi bi-dash"></i>
                </button>
                
                <span class="fw-bold text-center" style="width: 30px;">${cantSeleccionadaAhora}</span>
                
                <button class="btn btn-sm btn-guacha text-white" 
                        onclick="window.cambiarCantidadTemp('${prod.id}', '${v.talla}', 1)" 
                        ${sinStock ? 'disabled' : ''}>
                    <i class="bi bi-plus-lg"></i>
                </button>
            </div>
        `;
        container.appendChild(row);
    });

    // Botón de Confirmación "Listo"
    // Solo se habilita si has seleccionado al menos 1 item
    const totalSeleccionado = Object.values(window.seleccionClienteTemp).reduce((a, b) => a + b, 0);
    
    const divAccion = document.createElement('div');
    divAccion.className = "d-grid mt-3 pt-2 border-top";
    divAccion.innerHTML = `
        <button class="btn btn-success fw-bold" onclick="window.confirmarSeleccionVariantes('${prod.id}')" ${totalSeleccionado === 0 ? 'disabled' : ''}>
            Agregar al Carrito (${totalSeleccionado})
        </button>
    `;
    container.appendChild(divAccion);
}

// Función para sumar/restar en memoria temporal
window.cambiarCantidadTemp = function(prodId, talla, delta) {
    const prod = cacheProductosGlobales.find(p => p.id === prodId);
    if(!prod) return;

    // Inicializar si no existe
    if (!window.seleccionClienteTemp[talla]) window.seleccionClienteTemp[talla] = 0;

    // Aplicar cambio
    window.seleccionClienteTemp[talla] += delta;

    // Re-renderizar para actualizar "Disp" y habilitar/deshabilitar botones
    renderizarListaVariantes(prod);
};

// Función final "LISTO"
window.confirmarSeleccionVariantes = function(prodId) {
    const prod = cacheProductosGlobales.find(p => p.id === prodId);
    if(!prod) return;

    // Recorremos la selección temporal y agregamos al carrito real
    for (const [talla, cantidad] of Object.entries(window.seleccionClienteTemp)) {
        if (cantidad > 0) {
            // Buscamos el stock máximo de esa variante para validación
            const varianteData = prod.variantes.find(v => v.talla === talla);
            const stockMax = varianteData ? varianteData.stock : 0;
            
            // Llamamos a la función de agregar (que ya validaste antes)
            window.agregarAlCarrito(prodId, talla, stockMax, cantidad);
        }
    }

    // Cerrar modal y limpiar
    window.seleccionClienteTemp = {};
    bootstrap.Modal.getInstance(document.getElementById('modalSeleccionVariante')).hide();
    
    // Animación de éxito
    alert("Productos agregados al carrito");
};

window.agregarVarianteDesdeModal = function(prodId, talla, stockMax, inputId) {
    const input = document.getElementById(inputId);
    const cantidad = parseInt(input.value);

    if (isNaN(cantidad) || cantidad <= 0) {
        alert("Ingresa una cantidad válida.");
        return;
    }

    // Llamamos a agregarAlCarrito con la cantidad específica
    window.agregarAlCarrito(prodId, talla, stockMax, cantidad);
    
    // Refrescamos el modal para que se actualice el stock disponible visualmente
    // (Así si pediste 2 y quedaban 5, ahora verás que quedan 3)
    // Pequeño truco: cerramos y abrimos la lógica o actualizamos el DOM. 
    // Para simplicidad: Cerramos el modal automáticamente o mostramos una alerta "Agregado".
    // Vamos a optar por refrescar el modal para que puedan seguir eligiendo:
    
    // 1. Cerrar instancia actual (limpia backdrop)
    const el = document.getElementById('modalSeleccionVariante');
    const modal = bootstrap.Modal.getInstance(el);
    modal.hide();
    
    // 2. Reabrir inmediatamente para ver cambios actualizados
    setTimeout(() => {
        window.abrirSelectorVariantes(prodId);
    }, 300); // Pequeña pausa para que la animación no se vea rara
};

function regresarAlHomeCliente() {
    ocultarTodo();
    mostrarBarraInferior();
    document.getElementById('view-client-dashboard').classList.remove('d-none');
    document.getElementById('view-client-dashboard').classList.add('d-block');
}

// =========================================================
//  4. CARRITO
// =========================================================

// Acepta cantidadSolicitada (por defecto 1 si no se envía)
window.agregarAlCarrito = function(prodId, varianteNombre = null, stockMaximoVariante = null, cantidadSolicitada = 1) {
    const prod = cacheProductosGlobales.find(p => p.id === prodId);
    if (!prod) return;

    // Buscamos ítem específico
    const existente = carrito.find(item => item.id === prodId && item.variante === varianteNombre);
    
    // Límite de stock
    let stockLimite = (varianteNombre && stockMaximoVariante !== null) ? stockMaximoVariante : prod.stock;

    // Cuántos tendré después de agregar
    const cantidadActual = existente ? existente.cantidad : 0;
    const cantidadFutura = cantidadActual + cantidadSolicitada;

    if (cantidadFutura > stockLimite) {
        alert(`¡Stock insuficiente!\nSolo puedes agregar ${stockLimite - cantidadActual} más.`);
        return;
    }

    if (existente) {
        existente.cantidad += cantidadSolicitada; // Sumamos la cantidad elegida
    } else {
        carrito.push({ 
            id: prod.id, 
            nombre: prod.nombre, 
            precio: parseFloat(prod.precio), 
            imagen: prod.imagen, 
            cantidad: cantidadSolicitada, // Cantidad inicial elegida
            idVendedor: prod.idVendedor,
            variante: varianteNombre
        });
    }

    localStorage.setItem('guacha_carrito', JSON.stringify(carrito));
    actualizarBadgeCarrito();
    renderizarCarrito();
    
    // Animación visual en el carrito
    const badge = document.getElementById('cart-badge-detail');
    if(badge) { 
        badge.classList.add('bg-warning'); 
        setTimeout(() => badge.classList.remove('bg-warning'), 200); 
    }
    
    // Actualizar visualmente la tarjeta principal (Stock Global)
    const itemsEnCarrito = carrito.filter(item => item.id === prodId);
    const totalUsado = itemsEnCarrito.reduce((acc, i) => acc + i.cantidad, 0);
    const stockRestanteGlobal = prod.stock - totalUsado;
    
    const badgeEl = document.getElementById(`stock-badge-${prodId}`);
    if(badgeEl) {
        if(stockRestanteGlobal <= 0) {
            badgeEl.className = "badge bg-danger"; badgeEl.innerText = "Agotado";
        } else {
            badgeEl.innerText = `Disp: ${stockRestanteGlobal}`;
        }
    }
};

function actualizarBadgeCarrito() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    // Actualizar badge en la vista de detalle
    const badgeDetail = document.getElementById('cart-badge-detail');
    if (badgeDetail) {
        badgeDetail.innerText = totalItems;
        if(totalItems > 0) badgeDetail.classList.remove('d-none');
        else badgeDetail.classList.add('d-none');
    }
}

function renderizarCarrito() {
    const container = document.getElementById('lista-items-carrito');
    const totalEl = document.getElementById('cart-total');
    if (!container) return;
    if (carrito.length === 0) { container.innerHTML = '<div class="text-center mt-5 text-muted"><i class="bi bi-cart-x display-1"></i><p class="mt-3">Tu carrito está vacío.</p></div>'; totalEl.innerText = "$0.00"; return; }
    
    let html = ''; let total = 0;
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad; 
        total += subtotal;
        
        // Mostramos nombre + variante
        const nombreDisplay = item.variante ? `${item.nombre} <span class="badge bg-secondary ms-1" style="font-size:9px">${item.variante}</span>` : item.nombre;

        html += `
            <div class="d-flex align-items-center mb-2 bg-white p-2 rounded border">
                <img src="${item.imagen}" class="rounded me-2" style="width: 50px; height: 50px; object-fit: cover;">
                <div class="flex-grow-1 lh-1">
                    <div class="mb-1 small fw-bold">${nombreDisplay}</div>
                    <small class="text-muted">$${item.precio.toFixed(2)} x ${item.cantidad}</small>
                </div>
                <div class="fw-bold me-2">$${subtotal.toFixed(2)}</div>
                <button class="btn btn-sm text-danger" onclick="window.eliminarItemCarrito(${index})"><i class="bi bi-trash"></i></button>
            </div>
        `;
    });
    container.innerHTML = html; totalEl.innerText = "$" + total.toFixed(2);
}

window.eliminarItemCarrito = function(index) {
    // 1. Identificar qué vamos a borrar
    const itemToRemove = carrito[index];
    if (!itemToRemove) return;
    
    const prodId = itemToRemove.id;

    // 2. Borrar del carrito
    carrito.splice(index, 1);
    localStorage.setItem('guacha_carrito', JSON.stringify(carrito));
    
    // 3. Actualizar Carrito UI
    actualizarBadgeCarrito();
    renderizarCarrito();

    // 4. --- RESTAURAR STOCK VISUAL (CORREGIDO) ---
    const prodReal = cacheProductosGlobales.find(p => p.id === prodId);
    
    if (prodReal) {
        // CORRECCIÓN: Sumamos TODAS las variantes que queden en el carrito de este producto
        const itemsEnCarrito = carrito.filter(i => i.id === prodId);
        const cantidadTotalEnCarrito = itemsEnCarrito.reduce((acc, i) => acc + i.cantidad, 0);
        
        const stockVisualRecuperado = prodReal.stock - cantidadTotalEnCarrito;

        // Elementos del DOM
        const badgeEl = document.getElementById(`stock-badge-${prodId}`);
        const btnEl = document.getElementById(`btn-add-${prodId}`);

        if (badgeEl) {
            // Restaurar Badge
            badgeEl.className = "badge bg-light text-dark border";
            badgeEl.innerText = `Stock: ${stockVisualRecuperado}`;
            
            // Restaurar Botón (Si estaba agotado, reactivarlo)
            if (btnEl && btnEl.disabled) {
                const tieneVariantes = prodReal.variantes && prodReal.variantes.length > 0;
                
                btnEl.disabled = false;
                
                if(tieneVariantes) {
                    // Volver a convertirlo en botón de "Seleccionar"
                    btnEl.className = "btn btn-sm btn-outline-primary w-100 rounded-pill";
                    btnEl.innerText = "Seleccionar";
                    btnEl.onclick = function() { window.abrirSelectorVariantes(prodId); };
                } else {
                    // Volver a convertirlo en botón "+"
                    btnEl.className = "btn btn-sm btn-guacha text-white rounded-circle shadow-sm p-0 px-2";
                    btnEl.innerHTML = '+';
                    btnEl.onclick = function() { window.agregarAlCarrito(prodId); };
                }
            }
        }
    }
};

// 1. El botón "Realizar Pedido" del carrito llama a esto:
window.procederPedido = function() {
    if (carrito.length === 0) return;
    
    // Validar login
    const auth = getAuth();
    if(!auth.currentUser) { alert("Debes iniciar sesión para comprar."); return; }

    // Abrir modal de selección de método
    const modalPago = new bootstrap.Modal(document.getElementById('modalMetodoPago'));
    modalPago.show();
    
    // Ocultar carrito
    bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasCarrito')).hide();
};

// 2. Opción "Pagar Online"
window.iniciarPagoOnline = function() {
    // Cerrar modal selección
    bootstrap.Modal.getInstance(document.getElementById('modalMetodoPago')).hide();
    
    // Calcular total para mostrar en botón
    const total = carrito.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
    document.getElementById('monto-pagar-btn').innerText = `$${total.toFixed(2)}`;
    
    // Abrir pasarela
    new bootstrap.Modal(document.getElementById('modalPasarelaPago')).show();
};

// 3. Lógica Central de Finalización
window.finalizarPedido = async function(metodo) {
    const user = getAuth().currentUser;
    if(!user) return;

    let btnLoading = null;
    if(metodo === 'online') {
        btnLoading = document.querySelector('#form-pago-pedido button');
    } else {
        const m = bootstrap.Modal.getInstance(document.getElementById('modalMetodoPago'));
        if(m) m.hide();
    }

    if(btnLoading) { btnLoading.disabled = true; btnLoading.innerText = "Procesando..."; }

    try {
        // 1. Agrupar productos por tienda
        const pedidosPorVendedor = {};
        carrito.forEach(item => {
            if (!pedidosPorVendedor[item.idVendedor]) {
                pedidosPorVendedor[item.idVendedor] = {
                    items: [],
                    total: 0,
                    vendedorData: cacheVendedoresOrdenados.find(v => v.id === item.idVendedor)
                };
            }
            pedidosPorVendedor[item.idVendedor].items.push(item);
            pedidosPorVendedor[item.idVendedor].total += (item.precio * item.cantidad);
        });

        const estadoPago = (metodo === 'online') ? 'PAGADO' : 'PENDIENTE DE PAGO';
        const colorEstado = (metodo === 'online') ? 'text-success' : 'text-warning';
        
        let ticketHTML = "";
        let mapsLink = "#";

        // 2. Procesar cada pedido (Bucle de Tiendas)
        for (const idVendedor in pedidosPorVendedor) {
            const data = pedidosPorVendedor[idVendedor];
            const vendedorInfo = data.vendedorData; 
            
            let ubicacionGuardada = null;
            if (vendedorInfo && vendedorInfo.lat) { 
                ubicacionGuardada = { lat: vendedorInfo.lat, lng: vendedorInfo.lng }; 
            }

            // Guardar en Firebase
            const idPedido = await crearPedido({
                idVendedor: idVendedor, 
                idCliente: user.uid,
                nombreCliente: document.getElementById('client-name').innerText || "Cliente",
                nombreNegocio: vendedorInfo ? vendedorInfo.nombre : "Tienda Local",
                ubicacionNegocio: ubicacionGuardada,
                items: data.items, 
                total: data.total,
                metodoPago: metodo === 'online' ? 'Tarjeta Crédito/Débito' : 'Efectivo en Tienda',
                estadoPago: estadoPago, 
                estado: 'pendiente'
            });

            // Configurar Link Mapa
            const nombreNegocio = vendedorInfo ? vendedorInfo.nombre : "Negocio Local";
            const fecha = new Date().toLocaleString();
            
            if (vendedorInfo && vendedorInfo.lat) { 
                mapsLink = `https://www.google.com/maps/search/?api=1&query=${vendedorInfo.lat},${vendedorInfo.lng}`; 
            } else {
                mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nombreNegocio)}`;
            }
            
            // 3. Generar HTML del Ticket (UNA SOLA VEZ por tienda)
            ticketHTML += `
                <div class="ticket-section mb-4">
                    <h4 class="fw-bold text-center mb-1 text-dark">${nombreNegocio}</h4>
                    <p class="text-center text-muted small mb-2">Orden #${idPedido.slice(-6).toUpperCase()}</p>
                    
                    <div class="border-top border-bottom py-2 my-2 small">
                        <div class="d-flex justify-content-between"><span>Fecha:</span><span>${fecha}</span></div>
                        <div class="d-flex justify-content-between"><span>Estado:</span><span class="fw-bold ${colorEstado}">${estadoPago}</span></div>
                    </div>
                    
                    <ul class="list-unstyled small mb-0">
            `;
            
            // Bucle de Productos (SOLO AQUÍ)
            data.items.forEach(item => { 
                // Detectar si tiene talla/variante para mostrarla
                let detalle = item.variante ? ` <span class="badge bg-secondary ms-1" style="font-size:9px">${item.variante}</span>` : '';
                
                ticketHTML += `
                    <li class="d-flex justify-content-between py-1 border-bottom border-light">
                        <div><span class="fw-bold">${item.cantidad}</span> x ${item.nombre}${detalle}</div>
                        <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
                    </li>`; 
            });
            
            ticketHTML += `
                    </ul>
                    <div class="border-top mt-2 pt-2 d-flex justify-content-between fw-bold fs-5 text-dark">
                        <span>TOTAL</span>
                        <span>$${data.total.toFixed(2)}</span>
                    </div>
                    
                    <div class="mt-3 text-center border-top pt-2">
                        <p class="small mb-1 fw-bold text-muted">Ubicación del Negocio:</p>
                        <a href="${mapsLink}" target="_blank" style="text-decoration:none; color:#0d6efd; font-size:12px; font-weight:bold;">
                            [ Ver en Google Maps ]
                        </a>
                    </div>
                </div>`;
        }

        // Mostrar Ticket
        document.getElementById('ticket-content').innerHTML = ticketHTML;
        document.getElementById('btn-ticket-maps').href = mapsLink;
        
        const modalPasarela = bootstrap.Modal.getInstance(document.getElementById('modalPasarelaPago'));
        if(modalPasarela) modalPasarela.hide();
        
        new bootstrap.Modal(document.getElementById('modalTicket')).show();

        // Limpiar
        carrito = []; 
        localStorage.setItem('guacha_carrito', JSON.stringify(carrito)); 
        actualizarBadgeCarrito(); 
        renderizarCarrito();
        
        if(window.cargarDashboardCliente) cargarDashboardCliente(user.uid);

    } catch (e) { 
        console.error(e); 
        alert("Error: " + e.message); 
    } finally { 
        if(btnLoading) { 
            btnLoading.disabled = false; 
            btnLoading.innerText = "Pagar"; 
        } 
    }
};

window.descargarTicket = function() {
    const contenido = document.getElementById('ticket-content').innerHTML;
    // Abrir ventana nueva para imprimir limpio
    const ventana = window.open('', '', 'height=600,width=400');
    ventana.document.write('<html><head><title>Ticket Guachá</title>');
    ventana.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">');
    ventana.document.write('</head><body class="p-4">');
    ventana.document.write(contenido);
    ventana.document.write('<script>window.onload = function() { window.print(); window.close(); }</script>');
    ventana.document.write('</body></html>');
    ventana.document.close();
};

// =========================================================
//  5. VENDEDOR (LÓGICA EXISTENTE)
// =========================================================

function inicializarCategorias() {
    const select = document.getElementById('prod-categoria');
    if(select) {
        select.innerHTML = '<option value="" selected disabled>Selecciona categoría...</option>';
        CATEGORIAS_SYSTEM.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.nombre; opt.innerText = cat.nombre; opt.dataset.tipo = cat.tipo;
            select.appendChild(opt);
        });
        select.addEventListener('change', function() { configurarModalSegunCategoria(this.options[this.selectedIndex].dataset.tipo); });
    }
}

function configurarModalSegunCategoria(tipo) {
    const areaVar = document.getElementById('area-variantes');
    const areaDyn = document.getElementById('dynamic-fields-area');
    const divStock = document.getElementById('div-stock-simple');
    const selectTalla = document.getElementById('var-talla-select');
    
    if(areaVar) areaVar.classList.add('d-none');
    if(areaDyn) { areaDyn.classList.add('d-none'); areaDyn.innerHTML = ''; }
    if(divStock) divStock.classList.remove('d-none');

    if (tipo === 'talla_ropa' || tipo === 'talla_numero') {
        if(areaVar) areaVar.classList.remove('d-none');
        if(divStock) divStock.classList.add('d-none'); 
        if(selectTalla) {
            selectTalla.innerHTML = '';
            const opts = (tipo === 'talla_ropa') ? ['XS','S','M','L','XL','XXL'] : ['35','36','37','38','39','40','41','42','43','44'];
            opts.forEach(t => selectTalla.innerHTML += `<option value="${t}">${t}</option>`);
        }
    } else if (tipo !== 'normal' && areaDyn) {
        areaDyn.classList.remove('d-none');
        let html = '';
        if (tipo === 'peso') html = `<div class="input-group"><input type="number" id="prod-detalle-val" class="form-control" placeholder="Peso"><select id="prod-detalle-unidad" class="form-select" style="max-width: 80px;"><option value="lb">lb</option><option value="kg">kg</option><option value="oz">oz</option></select></div>`;
        else if (tipo === 'volumen') html = `<div class="input-group"><input type="number" id="prod-detalle-val" class="form-control" placeholder="Volumen"><select id="prod-detalle-unidad" class="form-select" style="max-width: 80px;"><option value="ml">ml</option><option value="L">L</option><option value="oz">oz</option></select></div>`;
        areaDyn.innerHTML = html;
    }
}

function agregarVarianteUI() {
    const talla = document.getElementById('var-talla-select').value;
    const stock = parseInt(document.getElementById('var-stock-input').value);
    if (!talla || isNaN(stock) || stock < 1) { alert("Datos inválidos"); return; }
    window.variantesTemporales.push({ talla, stock });
    renderizarVariantes();
    document.getElementById('var-stock-input').value = '';
}

function renderizarVariantes() {
    const cont = document.getElementById('lista-variantes-agregadas');
    if(!cont) return;
    cont.innerHTML = '';
    window.variantesTemporales.forEach((v, idx) => {
        cont.innerHTML += `<span class="badge bg-primary me-1 py-2 px-3">${v.talla}: ${v.stock} <span style="cursor:pointer; margin-left:8px;" onclick="window.eliminarVarianteUI(${idx})">&times;</span></span>`;
    });
}

function eliminarVarianteUI(idx) {
    window.variantesTemporales.splice(idx, 1);
    renderizarVariantes();
}

async function cargarProductosEnDashboard(uid) {
    const contenedor = document.getElementById('contenedor-productos-vendedor');
    if(!contenedor) return;
    contenedor.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>';
    try {
        todosLosProductos = await obtenerProductosVendedor(uid);
        if (todosLosProductos.length === 0) {
            contenedor.innerHTML = '<div class="col-12 text-center py-4 text-muted">No tienes productos activos.</div>';
            return;
        }
        productosMostrados = 0;
        aplicarOrdenamiento(); 
    } catch (e) { console.error(e); }
}

function aplicarOrdenamiento() {
    const criterio = document.getElementById('filtro-orden') ? document.getElementById('filtro-orden').value : 'fecha_desc';
    if (criterio === 'precio_asc') todosLosProductos.sort((a,b) => a.precio - b.precio);
    if (criterio === 'precio_desc') todosLosProductos.sort((a,b) => b.precio - a.precio);
    if (criterio === 'stock_asc') todosLosProductos.sort((a,b) => a.stock - b.stock);
    if (criterio === 'stock_desc') todosLosProductos.sort((a,b) => b.stock - a.stock);
    if (criterio === 'fecha_desc') todosLosProductos.sort((a,b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    if (criterio === 'fecha_asc') todosLosProductos.sort((a,b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion));

    productosMostrados = 0; 
    const cont = document.getElementById('contenedor-productos-vendedor');
    if(cont) cont.innerHTML = ''; 
    
    const btnContainer = document.getElementById('btn-ver-mas-container');
    if(btnContainer) {
        const btn = btnContainer.querySelector('button');
        if(btn) btn.innerHTML = 'Mostrar más';
    }
    cargarMasProductos();
}

function cargarMasProductos() {
    const contenedor = document.getElementById('contenedor-productos-vendedor');
    const btnContainer = document.getElementById('btn-ver-mas-container');
    const btn = btnContainer ? btnContainer.querySelector('button') : null;
    if(!contenedor) return;

    if (btn && btn.innerText.includes('Menos')) {
        productosMostrados = 0;
        contenedor.innerHTML = '';
        btn.innerHTML = 'Mostrar más';
        cargarMasProductos(); 
        contenedor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return; 
    }
    
    const lote = todosLosProductos.slice(productosMostrados, productosMostrados + PRODUCTOS_POR_PAGINA);
    
    lote.forEach(prod => {
        const stockDisplay = (prod.variantes && prod.variantes.length > 0) ? 'Variado' : prod.stock;
        const cardHtml = `
            <div class="col-6 col-sm-4 col-md-3 col-lg-2">
                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                    <div style="aspect-ratio: 1/1; overflow: hidden;">
                        <img src="${prod.imagen || 'img/logo.png'}" class="w-100 h-100" style="object-fit: cover;">
                    </div>
                    <span class="position-absolute top-0 end-0 badge bg-guacha m-1 rounded-pill shadow-sm" style="font-size:0.7rem">$${parseFloat(prod.precio).toFixed(2)}</span>
                    <div class="card-body p-2 d-flex flex-column">
                        <h6 class="fw-bold text-truncate mb-1" style="font-size: 0.8rem;">${prod.nombre}</h6>
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            <span class="badge bg-light text-dark border" style="font-size: 9px;">Stock: ${stockDisplay}</span>
                            <div>
                                <button class="btn btn-light btn-sm text-primary rounded-circle shadow-sm me-1 p-0 px-1" onclick="window.prepararEdicion('${prod.id}')">
                                    <i class="bi bi-pencil-fill" style="font-size: 9px;"></i>
                                </button>
                                <button class="btn btn-light btn-sm text-danger rounded-circle shadow-sm p-0 px-1" onclick="window.borrarProducto('${prod.id}')">
                                    <i class="bi bi-trash-fill" style="font-size: 9px;"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenedor.insertAdjacentHTML('beforeend', cardHtml);
    });

    productosMostrados += lote.length;

    if (btnContainer) {
        if (productosMostrados >= todosLosProductos.length) {
            if (todosLosProductos.length > PRODUCTOS_POR_PAGINA) {
                btn.innerHTML = 'Mostrar Menos';
                btnContainer.classList.remove('d-none');
            } else {
                btnContainer.classList.add('d-none');
            }
        } else {
            btn.innerHTML = 'Mostrar más';
            btnContainer.classList.remove('d-none');
        }
    }
}

async function borrarProducto(id) {
    if(confirm("¿Eliminar producto?")) {
        try {
            await eliminarProducto(id);
            todosLosProductos = todosLosProductos.filter(p => p.id !== id);
            productosMostrados = 0;
            document.getElementById('contenedor-productos-vendedor').innerHTML = '';
            cargarMasProductos();
        } catch(e) { alert("Error: " + e.message); }
    }
}

function prepararEdicion(id) {
    const prod = todosLosProductos.find(p => p.id === id);
    if(!prod) return;

    document.getElementById('prod-id-edit').value = prod.id;
    document.getElementById('prod-nombre').value = prod.nombre;
    document.getElementById('prod-precio').value = prod.precio;
    document.getElementById('prod-desc').value = prod.descripcion || '';
    document.getElementById('preview-img-prod').src = prod.imagen || 'img/logo.png';

    const catSelect = document.getElementById('prod-categoria');
    catSelect.value = prod.categoria;
    const evento = new Event('change');
    catSelect.dispatchEvent(evento);

    if (prod.detalles) {
        const valInput = document.getElementById('prod-detalle-val');
        const uniInput = document.getElementById('prod-detalle-unidad');
        if (valInput) valInput.value = prod.detalles.valor || '';
        if (uniInput) uniInput.value = prod.detalles.unidad || '';
    }

    window.variantesTemporales = prod.variantes || [];
    if (window.variantesTemporales.length > 0) {
        document.getElementById('div-stock-simple').classList.add('d-none');
        document.getElementById('area-variantes').classList.remove('d-none');
        renderizarVariantes();
    } else {
        document.getElementById('div-stock-simple').classList.remove('d-none');
        document.getElementById('area-variantes').classList.add('d-none');
        document.getElementById('prod-stock').value = prod.stock;
    }

    document.getElementById('btn-save-prod').innerText = "Guardar Cambios";
    const modalLabel = document.getElementById('modalProductoLabel');
    if(modalLabel) modalLabel.innerText = "Editar Producto";
    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
}

// =========================================================
//  6. DASHBOARD PRINCIPAL Y ASIGNACIONES
// =========================================================

async function mostrarPantallaDashboard(userUid) {
    ocultarTodo();
    const modalEl = document.getElementById('modalGoogleType');
    if(modalEl) {
        const modalInst = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInst.hide();
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(b => b.remove());
        document.body.classList.remove('modal-open');
        document.body.style = '';
    }

    const docSnap = await getDoc(doc(db, "usuarios", userUid));
    if (docSnap.exists()) {
        const data = docSnap.data();
        rolRealUsuario = data.rol;

        const tieneLocV = (data.rol === 'vendedor') && (data.latitudNegocio || data.direccionManualNegocio);
        const tieneLocC = (data.rol === 'cliente') && (data.latitud || data.direccionManual);
        
        if(!tieneLocV && !tieneLocC) { mostrarConfiguracionUbicacion(data.rol); return; }

        if (data.rol === 'vendedor') {
            if (data.estadoCuenta !== 'activo') { irAlPago(data.plan||'basico',5); return; }
            if (!data.nombreNegocio) { document.getElementById('view-seller-setup').classList.remove('d-none'); document.getElementById('view-seller-setup').classList.add('d-block'); return; }
            
            mostrarBarraInferior();
            document.getElementById('view-seller-dashboard').classList.remove('d-none');
            document.getElementById('view-seller-dashboard').classList.add('d-block');
            document.getElementById('seller-name').innerText = data.nombreNegocio;
            if(data.fotoNegocio) document.getElementById('seller-photo').src = data.fotoNegocio;
            
            const planTexto = document.getElementById('vendedor-plan-actual');
            if(planTexto) planTexto.innerText = (data.plan || 'Emprendedor').toUpperCase();

            cargarProductosEnDashboard(userUid);

        } else {
            mostrarBarraInferior();
            document.getElementById('view-client-dashboard').classList.remove('d-none');
            document.getElementById('view-client-dashboard').classList.add('d-block');
            
            document.getElementById('client-name').innerText = data.nombre;
            
            // 👇 AGREGA ESTA LÍNEA AQUÍ:
            if(data.foto) document.getElementById('client-photo').src = data.foto;

            cargarDashboardCliente(userUid);
        }
    }
}

function cambiarModo(modoDestino) {
    if (rolRealUsuario !== 'vendedor') return;
    document.getElementById('view-seller-dashboard').classList.add('d-none');
    document.getElementById('view-client-dashboard').classList.add('d-none');
    document.getElementById('view-seller-dashboard').classList.remove('d-block');
    document.getElementById('view-client-dashboard').classList.remove('d-block');

    if (modoDestino === 'comprador') {
        document.getElementById('view-client-dashboard').classList.remove('d-none');
        document.getElementById('view-client-dashboard').classList.add('d-block');
        document.getElementById('btn-back-to-admin').classList.remove('d-none');
        cargarDashboardCliente(getAuth().currentUser.uid);
    } else {
        document.getElementById('view-seller-dashboard').classList.remove('d-none');
        document.getElementById('view-seller-dashboard').classList.add('d-block');
    }
}

function irAlPago(plan, precio) {
    ocultarTodo();
    document.getElementById('checkout-plan-name').innerText = 'Plan ' + plan.toUpperCase();
    document.getElementById('checkout-amount').innerText = '$' + precio.toFixed(2);
    document.getElementById('selected-plan-id').value = plan;
    document.getElementById('view-checkout').classList.remove('d-none');
    document.getElementById('view-checkout').classList.add('d-block');
    ocultarBarraInferior();
}

function volverAPlanes() {
    ocultarTodo();
    document.getElementById('view-plans').classList.remove('d-none');
    document.getElementById('view-plans').classList.add('d-block');
    ocultarBarraInferior();
}

async function mostrarVistaPerfil() {
    const auth = getAuth();
    const user = auth.currentUser;
    if(!user) return;

    ocultarTodo();
    mostrarBarraInferior();
    document.getElementById('view-profile').classList.remove('d-none');
    document.getElementById('view-profile').classList.add('d-block');

    const docSnap = await getDoc(doc(db, "usuarios", user.uid));
    if(docSnap.exists()) {
        const data = docSnap.data();
        const imgEl = document.getElementById('profile-view-img');
        const nameEl = document.getElementById('profile-name-input');
        const descEl = document.getElementById('profile-desc-input');
        const vendorFields = document.getElementById('profile-vendor-fields');
        const lblName = document.getElementById('lbl-profile-name');

        if(data.rol === 'vendedor') {
            lblName.innerText = "Nombre del Negocio";
            vendorFields.classList.remove('d-none');
            imgEl.src = data.fotoNegocio || 'img/logg.png';
            nameEl.value = data.nombreNegocio || '';
            descEl.value = data.descripcionNegocio || '';
        } else {
            lblName.innerText = "Tu Nombre";
            vendorFields.classList.add('d-none');
            imgEl.src = data.foto || 'img/logo.png';
            nameEl.value = data.nombre || '';
        }
    }
}

// Función "Boton de Pánico" para volver al inicio limpio
function regresarAlDashboard() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
        // 1. Cerrar cualquier Modal abierto (Ticket, Producto, etc.)
        document.querySelectorAll('.modal.show').forEach(el => {
            const modal = bootstrap.Modal.getInstance(el);
            if (modal) modal.hide();
        });

        // 2. Cerrar el Carrito (Offcanvas) si está abierto
        const carritoEl = document.getElementById('offcanvasCarrito');
        const carritoInst = bootstrap.Offcanvas.getInstance(carritoEl);
        if (carritoInst) carritoInst.hide();

        // 3. Limpiar fondos oscuros (Backdrops) que a veces se quedan pegados
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style = '';

        // 4. Recargar el Dashboard correspondiente
        mostrarPantallaDashboard(user.uid);
    } else {
        // Si no hay usuario, mandar al Login
        ocultarTodo();
        mostrarOpcionesBienvenida();
    }
}

// --- HISTORIAL DE PEDIDOS ---
async function mostrarHistorialPedidos() {
    const auth = getAuth();
    if(!auth.currentUser) return;

    ocultarTodo();
    mostrarBarraInferior();
    document.getElementById('view-client-orders').classList.remove('d-none');
    document.getElementById('view-client-orders').classList.add('d-block');

    const container = document.getElementById('contenedor-historial-pedidos');
    container.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-guacha"></div></div>';

    const pedidos = await obtenerPedidosCliente(auth.currentUser.uid);

    if(pedidos.length === 0) {
        container.innerHTML = `
            <div class="text-center mt-5 text-muted">
                <i class="bi bi-bag-x display-1"></i>
                <p class="mt-3">Aún no has realizado pedidos.</p>
                <button class="btn btn-outline-primary rounded-pill" onclick="regresarAlDashboard()">Ir a Comprar</button>
            </div>`;
        return;
    }

    container.innerHTML = '';
    
    pedidos.forEach(p => {
        let badgeClass = 'bg-secondary';
        if(p.estado === 'pendiente') badgeClass = 'bg-warning text-dark';
        if(p.estado === 'entregado') badgeClass = 'bg-success';

        const fecha = new Date(p.fecha).toLocaleDateString();
        const total = parseFloat(p.total).toFixed(2);
        
        // AQUÍ EL CAMBIO VISUAL: Usamos el nombre del negocio
        const tituloPrincipal = p.nombreNegocio || "Tienda Desconocida";
        const idPedido = p.id.slice(-5).toUpperCase();

        // Como pasamos el objeto 'p' en el onclick, nos aseguramos que las comillas no rompan el HTML
        const pString = JSON.stringify(p).replace(/"/g, '&quot;');

        const html = `
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-3" onclick="window.verDetalleHistorial(${pString})">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between mb-1">
                        <span class="fw-bold text-dark text-truncate" style="max-width: 70%;">${tituloPrincipal}</span>
                        <span class="badge ${badgeClass} align-self-start" style="font-size: 10px;">${p.estado.toUpperCase()}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted small" style="line-height:1.2;">
                            <span class="d-block">Orden #${idPedido}</span>
                            <span class="d-block" style="font-size: 10px;">${fecha}</span>
                        </div>
                        <span class="fw-bold text-guacha">$${total}</span>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function verDetalleHistorial(pedido) {
    // Recuperamos el nombre. Si es un pedido viejo sin nombre guardado, mostramos "Tienda"
    const nombreNegocio = pedido.nombreNegocio || "Tienda Local";
    const fecha = new Date(pedido.fecha).toLocaleString();
    const estadoPago = pedido.estadoPago || 'PENDIENTE';
    
    let mapsLink = '#';
    if (pedido.ubicacionNegocio && pedido.ubicacionNegocio.lat) {
        mapsLink = `https://www.google.com/maps/search/?api=1&query=${pedido.ubicacionNegocio.lat},${pedido.ubicacionNegocio.lng}`;
    } else {
        mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nombreNegocio)}`;
    }

    const colorEstado = (pedido.estadoPago === 'PAGADO') ? 'text-success' : 'text-warning';

    // ... dentro de window.verDetalleHistorial ...

    let itemsHtml = '';
    if(pedido.items) {
        pedido.items.forEach(item => {
            // Recuperar variante guardada en el pedido
            let detalleTxt = "";
            if (item.variante) {
                detalleTxt = ` <span class="badge bg-secondary text-white ms-1" style="font-size: 9px;">${item.variante}</span>`;
            }

            itemsHtml += `
                <li class="d-flex justify-content-between py-1 border-bottom border-light small">
                    <div>
                        <span class="fw-bold">${item.cantidad}</span> x ${item.nombre} ${detalleTxt}
                    </div>
                    <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
                </li>`;
        });
    }

    // ... continúa el código ...

    const html = `
        <div class="ticket-section">
            <h4 class="fw-bold text-center mb-1">${nombreNegocio}</h4>
            <p class="text-center text-muted small mb-2">Orden #${pedido.id.slice(-6).toUpperCase()}</p>
            
            <div class="border-top border-bottom py-2 my-2 small">
                <div class="d-flex justify-content-between"><span>Fecha:</span><span>${fecha}</span></div>
                <div class="d-flex justify-content-between">
                    <span>Estado Pago:</span>
                    <span class="fw-bold ${colorEstado}">${estadoPago}</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span>Estado Pedido:</span>
                    <span class="fw-bold text-dark bg-warning badge text-dark">${pedido.estado.toUpperCase()}</span>
                </div>
            </div>

            <ul class="list-unstyled small mb-0">
                ${itemsHtml}
            </ul>

            <div class="border-top mt-2 pt-2 d-flex justify-content-between fw-bold fs-5">
                <span>TOTAL</span>
                <span>$${parseFloat(pedido.total).toFixed(2)}</span>
            </div>
            
            <div class="mt-3 text-center border-top pt-2">
                <p class="small mb-1 fw-bold text-muted">Ubicación del Negocio:</p>
                <a href="${mapsLink}" target="_blank" style="text-decoration:none; color:#0d6efd; font-size:12px; font-weight:bold;">
                    [ Ver en Google Maps ]
                </a>
            </div>
        </div>
    `;

    document.getElementById('ticket-content').innerHTML = html;
    
    const btnMaps = document.getElementById('btn-ticket-maps');
    if(btnMaps) btnMaps.href = mapsLink;

    new bootstrap.Modal(document.getElementById('modalTicket')).show();
}



// --- ASIGNACIONES AL WINDOW ---
// Esto es vital para que los 'onclick' del HTML funcionen
window.mostrarOpcionesBienvenida = mostrarOpcionesBienvenida;
window.iniciarPagoOnline = iniciarPagoOnline; 
window.finalizarPedido = finalizarPedido; 
window.descargarTicket = descargarTicket;
window.volverAWelcome = volverAWelcome;
window.mostrarLogin = mostrarLogin;
window.mostrarRegistro = mostrarRegistro;
window.volverALanding = volverALanding;
window.mostrarSelectorGoogle = mostrarSelectorGoogle;
window.cambiarModo = cambiarModo;
window.irAlPago = irAlPago;
window.volverAPlanes = volverAPlanes;
window.mostrarConfiguracionUbicacion = mostrarConfiguracionUbicacion;
window.mostrarVistaPerfil = mostrarVistaPerfil;
window.regresarAlDashboard = regresarAlDashboard;
window.abrirSelectorVariantes = abrirSelectorVariantes;
window.agregarVarianteDesdeModal = agregarVarianteDesdeModal;
window.cambiarCantidadTemp = cambiarCantidadTemp; 
window.confirmarSeleccionVariantes = confirmarSeleccionVariantes;
window.inicializarCategorias = inicializarCategorias;
window.cargarProductosEnDashboard = cargarProductosEnDashboard;
window.verDetalleHistorial = verDetalleHistorial;
window.mostrarHistorialPedidos = mostrarHistorialPedidos;
window.borrarProducto = borrarProducto;
window.prepararEdicion = prepararEdicion;
window.agregarVarianteUI = agregarVarianteUI;
window.eliminarVarianteUI = eliminarVarianteUI;
window.aplicarOrdenamiento = aplicarOrdenamiento;
window.cargarMasProductos = cargarMasProductos;
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarItemCarrito = eliminarItemCarrito;
window.procederPedido = procederPedido;
window.filtrarNegocios = filtrarNegocios;
window.verNegocio = verNegocio;
window.regresarAlHomeCliente = regresarAlHomeCliente;

// --- EXPORTACIONES ---
export { 
    mostrarPantallaDashboard, mostrarSelectorGoogle, mostrarLogin, mostrarRegistro, 
    mostrarOpcionesBienvenida, inicializarCategorias, cargarProductosEnDashboard, 
    borrarProducto, mostrarConfiguracionUbicacion, mostrarHistorialPedidos, verDetalleHistorial
};