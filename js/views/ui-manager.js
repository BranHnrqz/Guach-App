import { db } from '../data/firebase-config.js';
import { DATA_EL_SALVADOR } from '../data/geo-data.js';
import { doc, getDoc, updateDoc, getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { CATEGORIAS_SYSTEM, obtenerProductosVendedor, eliminarProducto, actualizarProducto } from '../logic/products-logic.js';

let rolRealUsuario = '';

// Variables para Paginación y Orden
let todosLosProductos = [];
let productosMostrados = 0;
const PRODUCTOS_POR_PAGINA = 6; // Ajustado para tarjetas pequeñas
window.variantesTemporales = []; 

// --- UTILIDADES ---
function ocultarTodo() {
    const views = ['view-landing', 'view-login', 'view-register', 'view-welcome-options', 'view-client-dashboard', 'view-seller-dashboard', 'view-plans', 'view-checkout', 'view-seller-setup', 'view-location-setup', 'view-profile']; 
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

// --- NAVEGACIÓN ---
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

function mostrarSelectorGoogle(nombreUsuario) {
    document.getElementById('google-user-name').innerText = nombreUsuario;
    const modal = new bootstrap.Modal(document.getElementById('modalGoogleType')); 
    modal.show();
}

// --- UBICACIÓN ---
function mostrarConfiguracionUbicacion(modo = 'cliente') {
    ocultarTodo();
    ocultarBarraInferior();
    
    const title = document.getElementById('location-setup-title');
    const subtitle = document.getElementById('location-setup-subtitle');
    
    if (modo === 'vendedor') {
        title.innerText = 'Ubicación de tu Negocio';
        subtitle.innerText = 'Define dónde está tu local para que los clientes te encuentren.';
    } else {
        title.innerText = 'Tu Ubicación';
        subtitle.innerText = 'Define dónde quieres recibir tus pedidos.';
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
    selMuni.innerHTML = '<option value="" selected disabled>Primero selecciona Departamento</option>';
    selDist.innerHTML = '<option value="" selected disabled>Primero selecciona Municipio</option>';
    selMuni.disabled = true;
    selDist.disabled = true;
    
    DATA_EL_SALVADOR.forEach((depto, index) => {
        const opt = document.createElement('option');
        opt.value = index; 
        opt.innerText = depto.nombre;
        selDepto.appendChild(opt);
    });

    selDepto.onchange = function() {
        const deptoIndex = this.value;
        const deptoData = DATA_EL_SALVADOR[deptoIndex];
        
        selMuni.innerHTML = '<option value="" selected disabled>Selecciona...</option>';
        selDist.innerHTML = '<option value="" selected disabled>Primero selecciona Municipio</option>';
        selDist.disabled = true;
        selMuni.disabled = false;
        
        if (deptoData && deptoData.municipios) {
            deptoData.municipios.forEach((muni, index) => {
                const opt = document.createElement('option');
                opt.value = index; 
                opt.innerText = muni.nombre;
                selMuni.appendChild(opt);
            });
        }
    };

    selMuni.onchange = function() {
        const deptoIndex = selDepto.value;
        const muniIndex = this.value;
        const muniData = DATA_EL_SALVADOR[deptoIndex].municipios[muniIndex];

        selDist.innerHTML = '<option value="" selected disabled>Selecciona...</option>';
        selDist.disabled = false;
        
        if (muniData && muniData.distritos) {
            muniData.distritos.forEach(dist => {
                const opt = document.createElement('option');
                opt.value = dist.nombre; 
                opt.innerText = dist.nombre;
                selDist.appendChild(opt);
            });
        }
    }
}

// --- GESTIÓN DE PRODUCTOS ---

function inicializarCategorias() {
    const select = document.getElementById('prod-categoria');
    if(!select) return;
    
    select.innerHTML = '<option value="" selected disabled>Selecciona categoría...</option>';
    CATEGORIAS_SYSTEM.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.nombre; opt.innerText = cat.nombre; opt.dataset.tipo = cat.tipo;
        select.appendChild(opt);
    });

    select.addEventListener('change', function() {
        const tipo = this.options[this.selectedIndex].dataset.tipo;
        configurarModalSegunCategoria(tipo);
    });
}

function configurarModalSegunCategoria(tipo) {
    const areaVar = document.getElementById('area-variantes');
    const areaDyn = document.getElementById('dynamic-fields-area');
    const divStock = document.getElementById('div-stock-simple');
    const selectTalla = document.getElementById('var-talla-select');
    
    // Reset visual
    if(areaVar) areaVar.classList.add('d-none');
    if(areaDyn) { areaDyn.classList.add('d-none'); areaDyn.innerHTML = ''; }
    if(divStock) divStock.classList.remove('d-none');

    // CASO ROPA/ZAPATOS (Tallas)
    if (tipo === 'talla_ropa' || tipo === 'talla_numero') {
        if(areaVar) areaVar.classList.remove('d-none');
        if(divStock) divStock.classList.add('d-none'); 
        
        if(selectTalla) {
            selectTalla.innerHTML = '';
            const opts = (tipo === 'talla_ropa') ? ['XS','S','M','L','XL','XXL'] : ['35','36','37','38','39','40','41','42','43','44'];
            opts.forEach(t => selectTalla.innerHTML += `<option value="${t}">${t}</option>`);
        }
    } 
    // CASO OTROS (Peso/Volumen)
    else if (tipo !== 'normal' && areaDyn) {
        areaDyn.classList.remove('d-none');
        let html = '';
        if (tipo === 'peso') html = `<div class="input-group"><input type="number" id="prod-detalle-val" class="form-control" placeholder="Peso"><span class="input-group-text">kg/lb</span></div>`;
        else if (tipo === 'volumen') html = `<div class="input-group"><input type="number" id="prod-detalle-val" class="form-control" placeholder="Volumen"><span class="input-group-text">ml/L</span></div>`;
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
        cont.innerHTML += `<span class="badge bg-primary me-1">${v.talla}: ${v.stock} <span style="cursor:pointer" onclick="window.eliminarVarianteUI(${idx})">&times;</span></span>`;
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

    } catch (e) {
        console.error(e);
        contenedor.innerHTML = '<div class="text-danger small">Error cargando inventario.</div>';
    }
}

function aplicarOrdenamiento() {
    const criterio = document.getElementById('filtro-orden') ? document.getElementById('filtro-orden').value : 'fecha_desc';
    
    if (criterio === 'precio_asc') todosLosProductos.sort((a,b) => a.precio - b.precio);
    if (criterio === 'precio_desc') todosLosProductos.sort((a,b) => b.precio - a.precio);
    if (criterio === 'stock_asc') todosLosProductos.sort((a,b) => a.stock - b.stock);
    if (criterio === 'stock_desc') todosLosProductos.sort((a,b) => b.stock - a.stock);
    if (criterio === 'fecha_desc') todosLosProductos.sort((a,b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    if (criterio === 'fecha_asc') todosLosProductos.sort((a,b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion));

    // Resetear al cambiar orden
    productosMostrados = 0; 
    const cont = document.getElementById('contenedor-productos-vendedor');
    if(cont) cont.innerHTML = ''; 
    
    // Resetear el botón a su estado inicial
    const btnContainer = document.getElementById('btn-ver-mas-container');
    if(btnContainer) {
        const btn = btnContainer.querySelector('button');
        if(btn) btn.innerHTML = 'Mostrar más <i class="bi bi-chevron-down"></i>';
    }

    cargarMasProductos();
}

// --- PAGINACIÓN (MOSTRAR MÁS / MENOS) ---
function cargarMasProductos() {
    const contenedor = document.getElementById('contenedor-productos-vendedor');
    const btnContainer = document.getElementById('btn-ver-mas-container');
    const btn = btnContainer.querySelector('button');
    if(!contenedor) return;

    // 1. CHEQUEO: ¿El usuario quiere colapsar?
    if (btn.innerText.includes('Menos')) {
        // RESETEAR VISTA
        productosMostrados = 0;
        contenedor.innerHTML = '';
        btn.innerHTML = 'Mostrar más <i class="bi bi-chevron-down"></i>';
        
        // Cargar solo el primer lote
        cargarMasProductos(); 
        
        // Scroll hacia arriba para que no se pierdan
        contenedor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return; 
    }
    
    // 2. LOGICA NORMAL: Cargar siguiente lote
    const lote = todosLosProductos.slice(productosMostrados, productosMostrados + PRODUCTOS_POR_PAGINA);
    
    lote.forEach(prod => {
        const stockDisplay = (prod.variantes && prod.variantes.length > 0) ? 'Variado' : prod.stock;
        
        // Grid pequeño
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

    // 3. CONTROL DEL BOTÓN (Cambio de Texto)
    if (btnContainer) {
        if (productosMostrados >= todosLosProductos.length) {
            // Se mostraron todos
            if (todosLosProductos.length > PRODUCTOS_POR_PAGINA) {
                // Si hay suficientes productos para justificar colapsar
                btn.innerHTML = 'Mostrar Menos <i class="bi bi-chevron-up"></i>';
                btnContainer.classList.remove('d-none');
            } else {
                // Si caben en una sola página, ocultar botón
                btnContainer.classList.add('d-none');
            }
        } else {
            // Aún faltan productos
            btn.innerHTML = 'Mostrar más <i class="bi bi-chevron-down"></i>';
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
            const cont = document.getElementById('contenedor-productos-vendedor');
            if(cont) cont.innerHTML = '';
            cargarMasProductos();
        } catch(e) { alert("Error: " + e.message); }
    }
}

// --- FUNCIÓN DE EDICIÓN MEJORADA (AQUÍ ESTÁ LA MAGIA) ---
function prepararEdicion(id) {
    const prod = todosLosProductos.find(p => p.id === id);
    if(!prod) return;

    // 1. Rellenar campos básicos
    document.getElementById('prod-id-edit').value = prod.id;
    document.getElementById('prod-nombre').value = prod.nombre;
    document.getElementById('prod-precio').value = prod.precio;
    document.getElementById('prod-desc').value = prod.descripcion || '';
    document.getElementById('preview-img-prod').src = prod.imagen || 'img/logo.png';

    // 2. Establecer Categoría y forzar actualización visual
    const catSelect = document.getElementById('prod-categoria');
    catSelect.value = prod.categoria;
    // Esto activa mostrarCamposDinamicos() o mostrar Tallas
    const evento = new Event('change');
    catSelect.dispatchEvent(evento);

    // 3. Rellenar campos dinámicos (Peso/Volumen) si existen
    if (prod.detalles) {
        const valInput = document.getElementById('prod-detalle-val');
        const uniInput = document.getElementById('prod-detalle-unidad');
        if (valInput) valInput.value = prod.detalles.valor || '';
        if (uniInput) uniInput.value = prod.detalles.unidad || '';
    }

    // 4. Rellenar Variantes/Tallas
    window.variantesTemporales = prod.variantes || [];
    
    if (window.variantesTemporales.length > 0) {
        // Si tiene tallas, las mostramos y ocultamos el stock simple
        document.getElementById('div-stock-simple').classList.add('d-none');
        document.getElementById('area-variantes').classList.remove('d-none');
        renderizarVariantes();
    } else {
        // Si no, mostramos el stock simple
        document.getElementById('div-stock-simple').classList.remove('d-none');
        document.getElementById('area-variantes').classList.add('d-none');
        document.getElementById('prod-stock').value = prod.stock;
    }

    // 5. Cambiar títulos y abrir modal
    document.getElementById('btn-save-prod').innerText = "Guardar Cambios";
    const modalTitle = document.getElementById('modalProductoLabel');
    if(modalTitle) modalTitle.innerText = "Editar Producto";
    
    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
}

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

function regresarAlDashboard() {
    const auth = getAuth();
    if(auth.currentUser) {
        mostrarPantallaDashboard(auth.currentUser.uid);
    }
}

// =========================================================
// ASIGNACIONES AL WINDOW
// =========================================================
window.mostrarOpcionesBienvenida = mostrarOpcionesBienvenida;
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
window.inicializarCategorias = inicializarCategorias;
window.cargarProductosEnDashboard = cargarProductosEnDashboard;
window.borrarProducto = borrarProducto;
window.prepararEdicion = prepararEdicion;
window.agregarVarianteUI = agregarVarianteUI;
window.eliminarVarianteUI = eliminarVarianteUI;
window.aplicarOrdenamiento = aplicarOrdenamiento;
window.cargarMasProductos = cargarMasProductos;

// Exportaciones
export { 
    mostrarPantallaDashboard, mostrarSelectorGoogle, mostrarConfiguracionUbicacion, 
    mostrarLogin, mostrarRegistro, mostrarOpcionesBienvenida, 
    inicializarCategorias, cargarProductosEnDashboard, borrarProducto 
};