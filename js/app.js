import { loginConEmail, registroConEmail, authConGoogle, completarRegistroGoogle } from './logic/auth-logic.js';
import { crearProducto } from './logic/products-logic.js';
import { procesarPagoSimulado } from './logic/subscription-logic.js'; 
import { mostrarPantallaDashboard, mostrarSelectorGoogle, mostrarLogin, mostrarRegistro, mostrarOpcionesBienvenida, mostrarConfiguracionUbicacion } from './views/ui-manager.js';
import { auth, db } from './data/firebase-config.js';
import { cerrarSesionUsuario } from './logic/auth-logic.js'; // Asegúrate de agregar esto
import { DATA_EL_SALVADOR } from './data/geo-data.js';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("App iniciada...");

// =========================================================
// UTILIDADES GLOBALES
// =========================================================
function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function validarFechaExpiracion(input) {
    const [mmStr, yyStr] = input.split('/');
    if (!mmStr || !yyStr || mmStr.length !== 2 || yyStr.length !== 2) return { valido: false, mensaje: "Formato MM/YY incorrecto." };
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const expMonth = parseInt(mmStr, 10);
    const expYear = parseInt(yyStr, 10);
    if (expMonth < 1 || expMonth > 12) return { valido: false, mensaje: "Mes inválido." };
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) return { valido: false, mensaje: "Tarjeta vencida." };
    if (expYear > currentYear + 5) return { valido: false, mensaje: "Expiración máxima 5 años." };
    return { valido: true };
}

// --- LÓGICA MAPA (MODERNA - ADVANCED MARKERS) ---
const DEFAULT_LAT = 13.6929;
const DEFAULT_LNG = -89.2182;
let map, marker;

window.iniciarMapa = async function() {
    // Verificar si la API está disponible
    if (!window.google || !window.google.maps) {
        console.warn("API Maps no disponible (Revisa API Key).");
        const ph = document.getElementById('map-placeholder');
        if(ph) ph.classList.remove('d-none');
        return;
    }
    
    const mapDiv = document.getElementById('google-map');
    if(!mapDiv) return;

    // Si el mapa ya existe, solo ajustamos tamaño (fix para pestañas ocultas)
    if (map) {
        google.maps.event.trigger(map, 'resize');
        return;
    }

    try {
        // 1. Importar librerías modernas (Elimina warning 'deprecated')
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        // 2. Crear Mapa
        map = new Map(mapDiv, { 
            center: { lat: DEFAULT_LAT, lng: DEFAULT_LNG }, 
            zoom: 14, 
            mapId: "DEMO_MAP_ID", // Requerido para marcadores avanzados (puedes usar este string genérico o crear uno en Cloud Console)
            streetViewControl: false, 
            mapTypeControl: false 
        });

        // 3. Crear Marcador Avanzado
        marker = new AdvancedMarkerElement({ 
            map: map, 
            position: { lat: DEFAULT_LAT, lng: DEFAULT_LNG }, 
            gmpDraggable: true, // Nueva propiedad para arrastrar
            title: "Tu ubicación" 
        });

        // 4. Funciones de actualización
        const updateHiddenCoords = () => {
            // AdvancedMarker retorna 'position' como propiedad (puede ser LatLng object o literal)
            const pos = marker.position; 
            if (!pos) return;

            // Manejar si es función .lat() o propiedad .lat
            const lat = (typeof pos.lat === 'function') ? pos.lat() : pos.lat;
            const lng = (typeof pos.lng === 'function') ? pos.lng() : pos.lng;

            const latEl = document.getElementById('lat-map');
            const lngEl = document.getElementById('lng-map');
            if(latEl) latEl.value = lat;
            if(lngEl) lngEl.value = lng;
        };
        
        // Listeners
        marker.addListener('dragend', updateHiddenCoords);
        
        map.addListener('click', (e) => { 
            // Mover marcador al click
            marker.position = e.latLng; 
            updateHiddenCoords(); 
        });
        
        // Autocompletado (Places)
        const input = document.getElementById('location-input');
        if(input && google.maps.places) {
            const autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo('bounds', map);
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (!place.geometry || !place.geometry.location) return;

                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17);
                }
                marker.position = place.geometry.location;
                updateHiddenCoords();
            });
        }

        // Inicializar valores ocultos
        updateHiddenCoords();

    } catch (e) {
        console.error("Error iniciando mapa moderno:", e);
        // Fallback visual si falla la carga
        const ph = document.getElementById('map-placeholder');
        if(ph) {
            ph.innerHTML = '<i class="bi bi-exclamation-triangle text-warning"></i><br>Error de Mapa (Revisa API Key/Billing)';
            ph.classList.remove('d-none');
        }
    }
};

function obtenerUbicacionGPS() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    
                    // Actualizar mapa si existe
                    if(map && marker) { 
                        map.setCenter(coords); 
                        marker.position = coords; // Actualizar AdvancedMarker
                    }

                    // Actualizar inputs
                    const latEl = document.getElementById('lat-map');
                    const lngEl = document.getElementById('lng-map');
                    if(latEl) latEl.value = coords.lat;
                    if(lngEl) lngEl.value = coords.lng;
                    
                    resolve(coords);
                },
                (err) => reject(err), { enableHighAccuracy: true }
            );
        } else { reject(new Error("No GPS")); }
    });
}


// =========================================================
// DOM READY
// =========================================================
document.addEventListener('DOMContentLoaded', () => {

    // 1. LOGIN
    const formLogin = document.getElementById('form-login');
    if(formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await loginConEmail(getVal('login-email'), getVal('login-pass'));
                await mostrarPantallaDashboard(auth.currentUser.uid);
            } catch (error) { alert("Credenciales incorrectas."); }
        });
    }

    // 2. REGISTRO
    const formRegister = document.getElementById('form-registro-completo');
    if(formRegister) {
        const inputDUI = document.getElementById('reg-dui');
        if(inputDUI) inputDUI.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 8) v = v.substring(0, 8) + '-' + v.substring(8, 9);
            e.target.value = v;
        });

        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault();
            const dui = getVal('reg-dui');
            const fecha = getVal('reg-fecha');
            
            // Validaciones
            const edad = new Date().getFullYear() - new Date(fecha).getFullYear();
            if (edad < 18) { alert("Debes ser mayor de 18 años."); return; }
            if (dui.length < 10) { alert("DUI incompleto."); return; }

            const btn = formRegister.querySelector('button[type="submit"]');
            const txt = btn.innerText;
            btn.disabled = true; btn.innerText = "Registrando...";

            try {
                await registroConEmail({
                    nombre: getVal('reg-nombre'), apellido: getVal('reg-apellido'),
                    fechaNacimiento: fecha, dui: dui, rol: getVal('reg-tipo'),
                    email: getVal('reg-email'), password: getVal('reg-pass')
                });
                alert("¡Cuenta creada!");
                await mostrarPantallaDashboard(auth.currentUser.uid);
            } catch (error) {
                if(error.code === 'auth/email-already-in-use') alert("Correo ya registrado.");
                else alert("Error: " + error.message);
            } finally { btn.disabled = false; btn.innerText = txt; }
        });
    }

    // Google Auth Buttons
    const btnGLogin = document.getElementById('btn-google-login');
    if(btnGLogin) btnGLogin.addEventListener('click', async () => {
        try {
            const res = await authConGoogle('login');
            if (res.status === 'existente') await mostrarPantallaDashboard(res.uid);
        } catch (e) { 
            if(e.message === 'NO_REGISTRADO') { alert("No tienes cuenta. Regístrate."); mostrarRegistro(); }
            else alert(e.message);
        }
    });

    const btnGReg = document.getElementById('btn-google-register');
    if(btnGReg) btnGReg.addEventListener('click', async () => {
        try {
            const res = await authConGoogle('register');
            if (res.status === 'nuevo') mostrarSelectorGoogle(res.user.displayName);
        } catch (e) { 
            if(e.message === 'DUPLICADO_GOOGLE') { alert("Ya tienes cuenta. Inicia sesión."); mostrarLogin(); }
            else alert(e.message);
        }
    });

    window.finalizarGoogle = async (rol) => {
        try {
            await completarRegistroGoogle(auth.currentUser.uid, rol);
            await mostrarPantallaDashboard(auth.currentUser.uid);
        } catch (e) { alert(e.message); }
    };


    // =========================================================
    // 3. UBICACIÓN (SOLUCIONADO)
    // =========================================================
    
    // Botón "Mi Ubicación" (Mapa)
    const btnMyLoc = document.getElementById('btn-my-location');
    if(btnMyLoc) {
        btnMyLoc.addEventListener('click', async () => {
            try { await obtenerUbicacionGPS(); } catch(e) { alert("Error GPS: " + e.message); }
        });
    }

    // GUARDAR DESDE MAPA
    const btnSaveMap = document.getElementById('btn-save-map-location');
    if(btnSaveMap) {
        btnSaveMap.addEventListener('click', async () => {
            const lat = getVal('lat-map');
            const lng = getVal('lng-map');
            const ref = getVal('map-address-ref');
            // Check de seguridad
            const modoEl = document.getElementById('location-mode-tracker');
            if (!modoEl) { console.error("Falta tracker"); return; }
            const modo = modoEl.value;

            if (!lat || !lng) { alert("Por favor selecciona una ubicación en el mapa."); return; }

            const btn = btnSaveMap;
            btn.disabled = true; btn.innerText = "Guardando...";

            try {
                const user = auth.currentUser;
                const updateData = { tipoUbicacion: 'mapa' };
                
                if (modo === 'vendedor') {
                    updateData.latitudNegocio = parseFloat(lat);
                    updateData.longitudNegocio = parseFloat(lng);
                    updateData.direccionNegocio = ref;
                } else {
                    updateData.latitud = parseFloat(lat);
                    updateData.longitud = parseFloat(lng);
                    updateData.direccionRef = ref;
                }
                
                await updateDoc(doc(db, "usuarios", user.uid), updateData);
                alert("Ubicación guardada.");
                await mostrarPantallaDashboard(user.uid);
            } catch(e) { alert("Error: " + e.message); } 
            finally { btn.disabled = false; btn.innerText = "Confirmar Ubicación"; }
        });
    }

    // GUARDAR MANUAL (LISTAS)
    // GUARDAR MANUAL (LISTAS) - MEJORADO PUNTOS 1 Y 3
    const formManualLoc = document.getElementById('form-manual-location');
    if(formManualLoc) {
        formManualLoc.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const deptoEl = document.getElementById('select-depto');
            const muniEl = document.getElementById('select-muni');
            const distEl = document.getElementById('select-dist');
            const dir = getVal('manual-address');
            const modoEl = document.getElementById('location-mode-tracker');
            if(!modoEl) return;

            // Validar selección
            if (deptoEl.selectedIndex <= 0 || muniEl.selectedIndex <= 0 || distEl.selectedIndex <= 0) {
                alert("Por favor selecciona Departamento, Municipio y Distrito.");
                return;
            }

            const btn = formManualLoc.querySelector('button');
            btn.disabled = true; btn.innerText = "Guardando...";

            try {
                // LÓGICA PARA OBTENER LAT/LNG DE LA DATA (PUNTO 3)
                const deptoIndex = deptoEl.value;
                const muniIndex = muniEl.value;
                const distName = distEl.value; // En ui-manager guardaste el nombre, no el índice

                // Buscamos el objeto exacto en DATA_EL_SALVADOR
                const dataDepto = DATA_EL_SALVADOR[deptoIndex];
                const dataMuni = dataDepto.municipios[muniIndex];
                const dataDist = dataMuni.distritos.find(d => d.nombre === distName);

                // Coordenadas encontradas (o usamos las del municipio por defecto)
                const latFinal = dataDist ? dataDist.lat : dataMuni.lat;
                const lngFinal = dataDist ? dataDist.lng : dataMuni.lng;

                const user = auth.currentUser;
                
                // Objeto de dirección visual
                const direccionCompleta = {
                    departamento: deptoEl.options[deptoEl.selectedIndex].text,
                    municipio: muniEl.options[muniIndex].text, // Corregido para usar índice correcto
                    distrito: distName,
                    direccion: dir
                };

                const updateData = { tipoUbicacion: 'manual' };
                
                // PUNTO 1: ACTUALIZAR EN FIREBASE SEGÚN ROL
                if (modoEl.value === 'vendedor') {
                    updateData.direccionManualNegocio = direccionCompleta;
                    // Guardamos también coordenadas para que aparezca en el mapa
                    updateData.latitudNegocio = parseFloat(latFinal);
                    updateData.longitudNegocio = parseFloat(lngFinal);
                } else {
                    updateData.direccionManual = direccionCompleta;
                    // Guardamos coordenadas del cliente
                    updateData.latitud = parseFloat(latFinal);
                    updateData.longitud = parseFloat(lngFinal);
                }

                await updateDoc(doc(db, "usuarios", user.uid), updateData);
                alert("Dirección y coordenadas guardadas correctamente.");
                await mostrarPantallaDashboard(user.uid);

            } catch(e) { 
                console.error(e);
                alert("Error: " + e.message); 
            } finally { 
                btn.disabled = false; btn.innerText = "Guardar Dirección"; 
            }
        });
    }

// =========================================================
    // 4. CONFIGURACIÓN VENDEDOR (CON REDIMENSIÓN DE IMAGEN)
    // =========================================================
    const formSetup = document.getElementById('form-seller-setup');
    
    if(formSetup) {
        const prev = document.getElementById('preview-logo-business');
        const fileIn = document.getElementById('business-file');
        
        // Variable para guardar la imagen redimensionada en memoria
        let imagenOptimizadaBase64 = null;

        if(fileIn) fileIn.addEventListener('change', () => {
            if(fileIn.files[0]) {
                const file = fileIn.files[0];
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    // 1. Creamos una imagen en memoria
                    const img = new Image();
                    img.src = e.target.result;
                    
                    img.onload = () => {
                        // 2. Usamos Canvas para redimensionar a 300x300
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Configurar tamaño fijo pequeño (ideal para logos)
                        const MAX_WIDTH = 300;
                        const MAX_HEIGHT = 300;
                        
                        canvas.width = MAX_WIDTH;
                        canvas.height = MAX_HEIGHT;

                        // Dibujar imagen redimensionada (estirada o recortada simple)
                        // Para un logo circular, object-fit: cover visualmente es mejor,
                        // aquí haremos un "cover" matemático simple:
                        const ratio = Math.max(MAX_WIDTH / img.width, MAX_HEIGHT / img.height);
                        const centerShift_x = (MAX_WIDTH - img.width * ratio) / 2;
                        const centerShift_y = (MAX_HEIGHT - img.height * ratio) / 2;
                        
                        ctx.drawImage(
                            img, 0, 0, img.width, img.height,
                            centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
                        );

                        // 3. Convertir a Base64 comprimido (JPEG 0.7)
                        imagenOptimizadaBase64 = canvas.toDataURL('image/jpeg', 0.7);
                        
                        // 4. Mostrar en pantalla
                        prev.src = imagenOptimizadaBase64;
                    };
                };
                reader.readAsDataURL(file);
            }
        });

        formSetup.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formSetup.querySelector('button');
            btn.disabled = true; btn.innerText = "Guardando...";
            
            try {
                // Usamos la imagen optimizada si existe, sino la que ya tenía (src)
                const fotoFinal = imagenOptimizadaBase64 || prev.src;
                
                // Validación extra de tamaño
                if (fotoFinal.length > 900000) {
                    throw new Error("La imagen sigue siendo muy pesada. Intenta con otra.");
                }

                await updateDoc(doc(db, "usuarios", auth.currentUser.uid), {
                    nombreNegocio: getVal('business-name'),
                    descripcionNegocio: getVal('business-desc'),
                    fotoNegocio: fotoFinal,
                    perfilCompleto: true
                });
                
                await mostrarPantallaDashboard(auth.currentUser.uid);
            } catch(e) { 
                console.error(e);
                alert(e.message); 
                btn.disabled = false; btn.innerText = "Guardar"; 
            }
        });
    }
    
    // Pagos y Productos se mantienen igual...
    const formPago = document.getElementById('form-pago');
    if(formPago) {
        formPago.addEventListener('submit', async (e) => {
            e.preventDefault();
            const plan = getVal('selected-plan-id');
            const dui = getVal('pago-dui');
            // Validaciones simples
            if(getVal('card-number').length < 16) { alert("Tarjeta mal"); return; }
            if(!validarFechaExpiracion(getVal('card-expiry')).valido) { alert("Fecha mal"); return; }
            
            const btn = formPago.querySelector('button');
            btn.disabled = true; 
            try {
                await procesarPagoSimulado(plan, dui);
                alert("Pago OK");
                document.getElementById('view-checkout').classList.add('d-none');
                await mostrarPantallaDashboard(auth.currentUser.uid);
            } catch(e) { alert(e.message); btn.disabled = false; }
        });
    }

    // Formatos extra
    const cardInput = document.getElementById('card-number');
    if(cardInput) cardInput.addEventListener('input', (e) => e.target.value = e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim());
    const expInput = document.getElementById('card-expiry');
    if(expInput) expInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if(v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
        e.target.value = v;
    });
    
    // =========================================================
    // GESTIÓN DE PRODUCTOS (Lógica Nueva)
    // =========================================================
    
    // 1. Inicializar Categorías al cargar
    if(window.inicializarCategorias) window.inicializarCategorias();

    // 2. Variables para Cropper
    let cropperInstance = null;
    const prodFileInput = document.getElementById('prod-file-input');
    const imageToCrop = document.getElementById('image-to-crop');
    const cropContainer = document.getElementById('crop-container');
    const previewContainer = document.getElementById('preview-container');
    const finalPreview = document.getElementById('preview-img-prod');
    const btnCropConfirm = document.getElementById('btn-crop-confirm');
    
    // 3. Al seleccionar archivo -> Iniciar Cropper
    if(prodFileInput) {
        prodFileInput.addEventListener('change', function(e) {
            const files = e.target.files;
            if (files && files.length > 0) {
                const file = files[0];
                const reader = new FileReader();
                
                reader.onload = function(evt) {
                    imageToCrop.src = evt.target.result;
                    
                    // Mostrar área de recorte, ocultar preview anterior
                    cropContainer.classList.remove('d-none');
                    previewContainer.classList.add('d-none');
                    btnCropConfirm.classList.remove('d-none');

                    // Destruir instancia previa si existe
                    if(cropperInstance) cropperInstance.destroy();

                    // Iniciar Cropper (formato cuadrado o libre, usaré 1:1 para uniformidad, o libre si prefieres)
                    cropperInstance = new Cropper(imageToCrop, {
                        aspectRatio: 1, // Cuadrado perfecto para catálogo ordenado
                        viewMode: 1,
                        autoCropArea: 1,
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 4. Confirmar Recorte
    if(btnCropConfirm) {
        btnCropConfirm.addEventListener('click', () => {
            if(!cropperInstance) return;
            
            // Obtener canvas recortado (Max 500x500 para no saturar base de datos)
            const canvas = cropperInstance.getCroppedCanvas({ width: 500, height: 500 });
            
            // Convertir a Base64 (JPEG calidad 0.8)
            const base64Image = canvas.toDataURL('image/jpeg', 0.8);
            
            // Mostrar en el preview final
            finalPreview.src = base64Image;
            
            // Limpiar área de trabajo
            cropContainer.classList.add('d-none');
            previewContainer.classList.remove('d-none');
            btnCropConfirm.classList.add('d-none');
            
            // Destruir cropper para liberar memoria
            cropperInstance.destroy();
            cropperInstance = null;
        });
    }

    // PAGO PEDIDO ONLINE (CLIENTE)
    const formPagoPedido = document.getElementById('form-pago-pedido');
    if(formPagoPedido) {
        // Formato tarjeta visual
        const cardIn = document.getElementById('card-num-pedido');
        const expIn = document.getElementById('card-exp-pedido');
        
        if(cardIn) cardIn.addEventListener('input', (e) => e.target.value = e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim());
        if(expIn) expIn.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if(v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
            e.target.value = v;
        });

        formPagoPedido.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Simulación de validación
            if(getVal('card-num-pedido').length < 16) { alert("Tarjeta inválida"); return; }
            
            // Llamamos a la lógica de finalización
            await window.finalizarPedido('online');
        });
    }

   // GESTIÓN DE PRODUCTOS (CREAR Y EDITAR)
    // GESTIÓN DE PRODUCTOS (CREAR Y EDITAR)
    // GESTIÓN DE PRODUCTOS (CREAR Y EDITAR) - AQUÍ ESTABA EL ERROR DE BORRADO
    const formProducto = document.getElementById('form-producto');
    if(formProducto) {
        const modalEl = document.getElementById('modalProducto');
        modalEl.addEventListener('show.bs.modal', event => {
            // CORRECCIÓN IMPORTANTE:
            // Si ya hay un ID en el campo oculto, significa que 'prepararEdicion' ya llenó los datos.
            // EN ESE CASO, NO BORRAMOS NADA.
            const idExistente = document.getElementById('prod-id-edit').value;
            if (idExistente) return; 

            // Si no hay ID, es un producto nuevo -> Limpiamos todo
            formProducto.reset();
            document.getElementById('prod-id-edit').value = '';
            document.getElementById('preview-img-prod').src = 'img/logo.png';
            document.getElementById('btn-save-prod').innerText = "Publicar Producto";
            document.getElementById('modalProductoLabel').innerText = "Nuevo Producto";
            window.variantesTemporales = [];
            document.getElementById('lista-variantes-agregadas').innerHTML = '';
            document.getElementById('area-variantes').classList.add('d-none');
            document.getElementById('dynamic-fields-area').classList.add('d-none');
            document.getElementById('div-stock-simple').classList.remove('d-none');
        });

        formProducto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            if(!user) return;

            const btn = document.getElementById('btn-save-prod');
            const txtOriginal = btn.innerText;
            btn.disabled = true; btn.innerText = "Procesando...";

            try {
                const idEdicion = document.getElementById('prod-id-edit').value;
                const datos = {
                    idVendedor: user.uid,
                    nombre: getVal('prod-nombre'),
                    categoria: getVal('prod-categoria'),
                    precio: parseFloat(getVal('prod-precio')),
                    descripcion: getVal('prod-desc'),
                    imagen: document.getElementById('preview-img-prod').src
                };

                // Detalles dinámicos (Peso/Volumen)
                const detalleVal = document.getElementById('prod-detalle-val');
                const detalleUni = document.getElementById('prod-detalle-unidad');
                if(detalleVal && !detalleVal.closest('.d-none')) {
                    datos.detalles = { 
                        valor: detalleVal.value, 
                        unidad: (detalleUni ? detalleUni.value : '') 
                    };
                }

                // Lógica Variantes
                if (window.variantesTemporales.length > 0) {
                    datos.variantes = window.variantesTemporales;
                    datos.stock = window.variantesTemporales.reduce((sum, v) => sum + v.stock, 0);
                } else {
                    datos.stock = parseInt(getVal('prod-stock')) || 0;
                    datos.variantes = [];
                }

                const { crearProducto, actualizarProducto } = await import('./logic/products-logic.js');

                if (idEdicion) {
                    await actualizarProducto(idEdicion, datos);
                    alert("¡Producto actualizado!");
                } else {
                    await crearProducto(datos);
                    alert("¡Producto publicado!");
                }

                bootstrap.Modal.getInstance(modalEl).hide();
                if(window.cargarProductosEnDashboard) window.cargarProductosEnDashboard(user.uid);

            } catch (error) { console.error(error); alert("Error: " + error.message); } 
            finally { btn.disabled = false; btn.innerText = txtOriginal; }
        });
    }

    // 6. Hook para cargar productos al entrar al Dashboard
    // Buscar en tu función `mostrarPantallaDashboard` en ui-manager.js y 
    // asegurarte de que llame a `cargarProductosEnDashboard(user.uid)` si es vendedor.
    window.verificarTalla = function() {
        const cat = document.getElementById('prod-cat').value;
        const divTalla = document.getElementById('div-talla');
        if(cat === 'ropa' || cat === 'zapatos') divTalla.classList.remove('d-none');
        else divTalla.classList.add('d-none');
    };

    // BOTÓN CANCELAR UBICACIÓN (PUNTO 2)
    const btnCancelLoc = document.getElementById('btn-cancel-location');
    if(btnCancelLoc) {
        btnCancelLoc.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (user) {
                // Si está logueado, intentamos volver al dashboard
                await mostrarPantallaDashboard(user.uid);
            } else {
                // Si no hay sesión (caso raro en esta pantalla), al inicio
                ocultarTodo(); // Función global de ui-manager
                mostrarOpcionesBienvenida(); // Función global
            }
        });
    }

    // --- LÓGICA VISTA PERFIL (NUEVO) ---
    const formPerfilView = document.getElementById('form-perfil-view');
    if(formPerfilView) {
        // Previsualizar foto
        const fileIn = document.getElementById('profile-file-input');
        const imgPrev = document.getElementById('profile-view-img');
        
        if(fileIn) {
            fileIn.addEventListener('change', () => {
                if(fileIn.files[0]) {
                    const r = new FileReader();
                    r.onload = (e) => imgPrev.src = e.target.result;
                    r.readAsDataURL(fileIn.files[0]);
                }
            });
        }

        // Guardar
        formPerfilView.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formPerfilView.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.disabled = true; btn.innerText = "Guardando...";

            try {
                const user = auth.currentUser;
                const docRef = doc(db, "usuarios", user.uid);
                
                // Detectar rol visualmente (si el campo descripción está visible, es vendedor)
                const esVendedor = !document.getElementById('profile-vendor-fields').classList.contains('d-none');
                
                const nuevaFoto = imgPrev.src;
                const nuevoNombre = document.getElementById('profile-name-input').value;
                const updateData = {};

                if(esVendedor) {
                    updateData.nombreNegocio = nuevoNombre;
                    updateData.descripcionNegocio = document.getElementById('profile-desc-input').value;
                    // Solo actualizamos foto si cambió (opcional, aquí guardamos lo que haya en src)
                    updateData.fotoNegocio = nuevaFoto;
                } else {
                    updateData.nombre = nuevoNombre;
                    updateData.foto = nuevaFoto;
                }

                await updateDoc(docRef, updateData);
                alert("Perfil actualizado correctamente.");
                
                // Regresar al dashboard
                await mostrarPantallaDashboard(user.uid);

            } catch(error) {
                console.error(error);
                alert("Error: " + error.message);
            } finally {
                btn.disabled = false; btn.innerText = originalText;
            }
        });
    }
});

// PUNTO 4: FUNCIÓN GLOBAL DE CERRAR SESIÓN
window.cerrarSesionApp = async function() {
    if(confirm("¿Estás seguro de cerrar sesión?")) {
        try {
            await cerrarSesionUsuario(); // Llama a Firebase signOut
            window.location.reload();    // Recarga la página para limpiar memoria y estados
        } catch (e) {
            console.error("Error al salir", e);
            alert("No se pudo cerrar sesión.");
        }
    }
};